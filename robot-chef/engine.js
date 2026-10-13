/**
 * Robot Chef (Robot-kucharz) — a first look at artificial intelligence. Shared engine for the online game
 * (index.html) and the printable worksheets (worksheet.html).
 * Classic script; defines the global `CHEF` (also exported for Node: `node engine.test.js`).
 *
 * The model: a dish is a list of amounts (how many of each ingredient), a guest is a list of weights (how many
 * taste points one portion of each ingredient gives) and a threshold. Points = Σ amount × weight; the guest likes
 * the dish (😋) when points ≥ threshold, else 🤢. That is one artificial neuron (a dot product and a threshold).
 *
 * Chapters (each generator takes a seeded `rnd` and returns plain data):
 *   1 count1(rnd, n), best1(rnd)       add the points of the ingredients on the plate; which plate wins
 *   2 count2(rnd, n), cook2(rnd)       amounts × weights, negative weights; cook a dish the guest will like
 *   3 detect3(rnd), spoil3(rnd)        find the weights from scored dishes; which ingredient spoils the dish
 *   4 train4(rnd, k)                   train the robot with the perceptron rule (+1 / −1 for what is on the plate)
 *   5 test5(rnd, n)                    the trained robot meets new dishes: right or wrong?
 *   6 map6(rnd, mode, n)               dishes as points on a sweet × spicy map; the neuron is a straight line
 *   7 xor7(rnd, per)                   the fussy princess: one line is not enough, two helpers and a boss are
 *   train(dishes, labels, k)           the perceptron: every step of the training, start from all weights 0
 *   mapSVG(o), netSVG(o)               the taste map and the little network as SVG strings
 */
const CHEF = (() => {
  const INGR = [
    { id: 'choc', e: '🍫' }, { id: 'straw', e: '🍓' }, { id: 'honey', e: '🍯' }, { id: 'banana', e: '🍌' },
    { id: 'chili', e: '🌶️' }, { id: 'onion', e: '🧅' }, { id: 'carrot', e: '🥕' }, { id: 'broccoli', e: '🥦' },
    { id: 'cheese', e: '🧀' }, { id: 'lemon', e: '🍋' }, { id: 'mushroom', e: '🍄' }, { id: 'garlic', e: '🧄' },
  ];
  const ING = Object.fromEntries(INGR.map(i => [i.id, i]));
  /** The guests; some have a favourite ingredient, which always gets the top weight. The princess is chapter 7's. */
  const GUESTS = [
    { id: 'bear', e: '🐻', loves: 'honey' }, { id: 'dragon', e: '🐉', loves: 'chili' }, { id: 'rabbit', e: '🐰', loves: 'carrot' },
    { id: 'mouse', e: '🐭', loves: 'cheese' }, { id: 'monkey', e: '🐵', loves: 'banana' }, { id: 'alien', e: '👽' },
    { id: 'grandma', e: '👵' }, { id: 'wizard', e: '🧙' }, { id: 'pirate', e: '🦜' }, { id: 'princess', e: '👸' },
  ];
  const GUEST = Object.fromEntries(GUESTS.map(g => [g.id, g]));
  const CHAPTERS = [1, 2, 3, 4, 5, 6, 7];

  /* ---------- seeded random ---------- */
  /** mulberry32 on a string hash: a small seeded generator (same seed ⇒ same worksheet). */
  function rng(seed) {
    let h = 1779033703 ^ String(seed).length;
    for (const ch of String(seed)) { h = Math.imul(h ^ ch.codePointAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let x = a;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
  const int = (rnd, lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  function shuffle(rnd, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const sum = a => a.reduce((s, v) => s + v, 0);

  /* ---------- the neuron ---------- */
  /** Σ amount × weight. */
  const score = (w, x) => w.reduce((s, wi, i) => s + wi * (x[i] || 0), 0);
  const likes = (g, x) => score(g.w, x) >= g.t;
  const key = x => x.join(',');
  /** Every dish with amounts 0..max of k ingredients (all-zero included). */
  function dishes(k, max) {
    const out = [];
    const rec = (pre) => {
      if (pre.length === k) { out.push(pre); return; }
      for (let v = 0; v <= max; v++) rec([...pre, v]);
    };
    rec([]);
    return out;
  }
  const kinds = x => x.filter(v => v > 0).length;

  /**
   * A guest with k ingredients and integer weights lo..hi (no zero unless o.zero).
   * o.neg / o.maxNeg: at least / at most that many negative weights. A guest's favourite, if on the menu, weighs hi.
   */
  function newGuest(rnd, k, o) {
    for (;;) {
      const ch = pick(rnd, GUESTS.filter(g => g.id !== 'princess'));
      let ids = shuffle(rnd, INGR.map(i => i.id)).slice(0, k);
      if (ch.loves && !ids.includes(ch.loves) && rnd() < 0.7) ids[0] = ch.loves;
      ids = shuffle(rnd, ids);
      const w = ids.map(() => { let v; do v = int(rnd, o.lo, o.hi); while (!o.zero && v === 0); return v; });
      const fav = ids.indexOf(ch.loves);
      if (fav >= 0) w[fav] = o.hi;
      const neg = w.filter(v => v < 0).length;
      if (o.neg !== undefined && neg < o.neg) continue;
      if (o.maxNeg !== undefined && neg > o.maxNeg) continue;
      return { id: ch.id, e: ch.e, ing: ids, w, t: 0 };
    }
  }

  /* ---------- chapter 1: add up the points ---------- */
  /** n dishes (each ingredient there or not) for one guest with weights 1..5; both 😋 and 🤢 at least twice. */
  function count1(rnd, n = 5) {
    for (;;) {
      const g = newGuest(rnd, 3, { lo: 1, hi: 5 });
      g.t = int(rnd, Math.max(3, Math.min(...g.w) + 1), sum(g.w) - 1);
      const ds = shuffle(rnd, dishes(3, 1).filter(x => kinds(x) > 0)).slice(0, n);
      const yes = ds.filter(x => likes(g, x)).length;
      if (yes < 2 || ds.length - yes < 2) continue;
      return { g, dishes: ds };
    }
  }
  /** Three plates with two of four ingredients each; exactly one gets the most points. */
  function best1(rnd) {
    for (;;) {
      const g = newGuest(rnd, 4, { lo: 1, hi: 6 });
      const plates = shuffle(rnd, dishes(4, 1).filter(x => kinds(x) === 2)).slice(0, 3);
      const sc = plates.map(x => score(g.w, x)), top = Math.max(...sc);
      if (sc.filter(v => v === top).length !== 1 || new Set(sc).size < 3) continue;
      return { g, plates, best: sc.indexOf(top) };
    }
  }

  /* ---------- chapter 2: amounts and negative weights ---------- */
  /** n dishes with amounts 0..3 (at least two kinds, at most 5 portions); weights −5..+5 with one or two negative. */
  function count2(rnd, n = 5) {
    for (;;) {
      const g = newGuest(rnd, 3, { lo: -5, hi: 5, neg: 1, maxNeg: 2 });
      g.t = int(rnd, 0, 6);
      const ds = shuffle(rnd, dishes(3, 3).filter(x => kinds(x) >= 2 && sum(x) <= 5)).slice(0, n);
      const yes = ds.filter(x => likes(g, x)).length;
      if (yes < 2 || ds.length - yes < 2) continue;
      return { g, dishes: ds };
    }
  }
  /**
   * Cook for the guest: one ingredient (with a negative weight) must go in, `mustN` portions of it; add others
   * (0..3 portions each, at most `cap` portions on the plate) until the dish has at least g.t points.
   */
  function cook2(rnd) {
    for (;;) {
      const g = newGuest(rnd, 4, { lo: -3, hi: 4, neg: 2, maxNeg: 2 });
      const negs = g.w.map((v, i) => v < 0 ? i : -1).filter(i => i >= 0);
      const must = pick(rnd, negs), mustN = int(rnd, 1, 2), cap = 6;
      const base = g.w[must] * mustN;
      const all = dishes(4, 3).filter(x => x[must] === 0 && sum(x) + mustN <= cap).map(x => { const y = x.slice(); y[must] = mustN; return y; });
      const best = Math.max(...all.map(x => score(g.w, x)));
      if (best < base + 4 || best < 3) continue;
      g.t = int(rnd, Math.max(1, Math.ceil((base + best) / 2)), best - 1);
      const sols = all.filter(x => likes(g, x)).length;
      if (sols < 2) continue;
      return { g, must, mustN, cap, max: 3 };
    }
  }

  /* ---------- chapter 3: the taste detective ---------- */
  /** Patterns of three dishes that can be solved one ingredient at a time (columns are ingredients a, b, c). */
  const CHAINS = [
    [[1, 0, 0], [1, 1, 0], [0, 1, 1]],
    [[1, 1, 0], [0, 1, 0], [1, 1, 1]],
    [[2, 0, 0], [1, 1, 0], [0, 1, 1]],
    [[1, 0, 0], [1, 0, 1], [0, 1, 1]],
    [[0, 0, 1], [1, 1, 1], [0, 1, 1]],
    [[1, 1, 0], [1, 0, 0], [1, 0, 2]],
  ];
  /** The guest says how many points each of three dishes got; find the weight of every ingredient. */
  function detect3(rnd) {
    const g = newGuest(rnd, 3, { lo: -3, hi: 6, maxNeg: 1 });
    const perm = shuffle(rnd, [0, 1, 2]);
    const ds = shuffle(rnd, pick(rnd, CHAINS)).map(row => { const x = [0, 0, 0]; row.forEach((v, j) => { x[perm[j]] = v; }); return x; });
    return { g, dishes: ds, points: ds.map(x => score(g.w, x)) };
  }
  /** Which ingredient spoils the dish? Five dishes of four ingredients: 🤢 exactly when the spoiler is there. */
  function spoil3(rnd) {
    for (;;) {
      const g = newGuest(rnd, 4, { lo: 1, hi: 4 });
      const sp = int(rnd, 0, 3);
      if (g.ing[sp] === (GUEST[g.id].loves)) continue;
      g.w[sp] = -9; g.t = 1;
      const ds = shuffle(rnd, dishes(4, 1).filter(x => kinds(x) >= 1 && kinds(x) <= 3)).slice(0, 5);
      const bad = ds.map(x => x[sp] > 0);
      if (bad.filter(Boolean).length < 2 || bad.filter(b => !b).length < 2) continue;
      // no other single ingredient explains the 🤢 ones, and every ingredient shows up
      const alone = j => ds.every((x, i) => (x[j] > 0) === bad[i]);
      if ([0, 1, 2, 3].some(j => j !== sp && alone(j))) continue;
      if ([0, 1, 2, 3].some(j => ds.every(x => !x[j]))) continue;
      return { g, dishes: ds, likes: bad.map(b => !b), spoiler: sp };
    }
  }

  /* ---------- chapter 4: training (the perceptron) ---------- */
  /**
   * The perceptron, step by step. The robot starts with every weight 0 and says 😋 when its points are at least 1.
   * When it is wrong it adds the plate to its weights (guest 😋) or takes it away (guest 🤢): +amount / −amount.
   * Rounds go through the dishes in order until one whole round has no mistake.
   * → { ok, w, steps: [{ round, i, before, sum, robot, guest, after }] }
   */
  function train(ds, labels, k, maxRounds = 8) {
    const w = Array(k).fill(0), steps = [];
    for (let round = 0; round < maxRounds; round++) {
      let errs = 0;
      ds.forEach((x, i) => {
        const before = w.slice(), s = score(w, x), robot = s >= ROBOT_T, guest = labels[i];
        if (robot !== guest) { errs++; x.forEach((v, j) => { w[j] += guest ? v : -v; }); }
        steps.push({ round, i, before, sum: s, robot, guest, after: w.slice() });
      });
      if (!errs) return { ok: true, w: w.slice(), steps, rounds: round + 1 };
    }
    return { ok: false, w: w.slice(), steps, rounds: maxRounds };
  }
  const ROBOT_T = 1;
  /** The robot's correction after a step: +1 / −1 / 0 for every ingredient. */
  const fix = st => st.after.map((v, j) => v - st.before[j]);

  /** A guest (secret weights −3..+3, threshold 1) and k+1 dishes; training takes 2 or 3 rounds and a few fixes. */
  function train4(rnd, k = 3) {
    const m = k + 1;
    for (;;) {
      const g = newGuest(rnd, k, { lo: -3, hi: 3, neg: 1 });
      g.t = ROBOT_T;
      let ds = shuffle(rnd, dishes(k, 1).filter(x => kinds(x) >= 1 && kinds(x) <= 3)).slice(0, m);
      const lab = ds.map(x => likes(g, x));
      const yes = lab.filter(Boolean).length;
      if (yes < 2 || m - yes < 2) continue;
      // start with a dish the guest likes: the brand-new robot (all 0) is wrong right away
      const first = ds.findIndex((x, i) => lab[i]);
      ds = [ds[first], ...ds.filter((_, i) => i !== first)];
      const labels = ds.map(x => likes(g, x));
      const tr = train(ds, labels, k);
      const fixes = tr.steps.filter(st => st.robot !== st.guest).length;
      if (!tr.ok || tr.rounds > 3 || fixes < 3 || fixes > k + 3) continue;
      if (tr.w.every((v, j) => v === g.w[j])) continue;   // the lesson: other numbers, same decisions
      return { g, dishes: ds, labels, ...tr, fixes };
    }
  }

  /* ---------- chapter 5: new guests at the table ---------- */
  /** A robot trained on 3 dishes meets n new ones: at least one surprise, but right on at least half. */
  function test5(rnd, n = 4) {
    for (;;) {
      const g = newGuest(rnd, 4, { lo: -3, hi: 3, neg: 1 });
      g.t = ROBOT_T;
      const pool = shuffle(rnd, dishes(4, 1).filter(x => kinds(x) >= 1 && kinds(x) <= 3));
      const tr = pool.slice(0, 3), trL = tr.map(x => likes(g, x));
      if (!trL.some(Boolean) || trL.every(Boolean)) continue;
      const res = train(tr, trL, 4);
      if (!res.ok) continue;
      const test = pool.slice(3, 3 + n), truth = test.map(x => likes(g, x));
      const robot = test.map(x => score(res.w, x) >= ROBOT_T);
      const right = robot.filter((r, i) => r === truth[i]).length;
      if (right === n || right < Math.ceil(n / 2) || res.w.every(v => v === 0)) continue;
      if (!truth.some(Boolean) || truth.every(Boolean)) continue;
      return { g, train: tr, trainLabels: trL, w: res.w, dishes: test, truth, robot, right };
    }
  }

  /* ---------- chapter 6: the taste map ---------- */
  const SIDE = 6;   // the map goes 0..6 on both axes
  /** Nice directions for the line: sweet, spicy, both, one but not the other, mild. */
  const DIRS6 = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, -1], [-1, 1], [-1, -1], [2, -1], [-1, 2]];
  /**
   * n dishes on the map (x = sweet, y = spicy, 0..6) and a secret rule a·x + b·y ≥ t that sorts them with a gap:
   * 😋 points have at least t, 🤢 points at most t − 2. mode 'theta': a = b = 1, only t to find.
   */
  function map6(rnd, mode = 'full', n = 7) {
    for (;;) {
      const [a, b] = mode === 'theta' ? [1, 1] : pick(rnd, DIRS6);
      const all = []; for (let x = 0; x <= SIDE; x++) for (let y = 0; y <= SIDE; y++) all.push([x, y]);
      const sc = all.map(([x, y]) => a * x + b * y);
      const lo = Math.min(...sc), hi = Math.max(...sc);
      const t = int(rnd, lo + 3, hi - 2);
      const ok = all.filter(([x, y]) => { const s = a * x + b * y; return s >= t || s <= t - 2; });
      const pts = shuffle(rnd, ok).slice(0, n).map(([x, y]) => ({ x, y, yes: a * x + b * y >= t }));
      const yes = pts.filter(p => p.yes).length;
      if (yes < 2 || n - yes < 2) continue;
      const start = mode === 'theta' ? { a: 1, b: 1, t: 0 } : { a: 1, b: 0, t: 0 };
      if (sorts(start, pts)) continue;
      return { mode, rule: { a, b, t }, pts, start };
    }
  }
  /** How many points the rule puts on the right side. */
  const sorted = (r, pts) => pts.filter(p => (r.a * p.x + r.b * p.y >= r.t) === p.yes).length;
  const sorts = (r, pts) => sorted(r, pts) === pts.length;
  const RANGE = { a: [-3, 3], b: [-3, 3], t: [-20, 20] };

  /* ---------- chapter 7: the fussy princess (XOR) ---------- */
  /** The princess likes sweet OR spicy, but not both: a cluster in each corner, `per` dishes each. */
  function xor7(rnd, per = 1) {
    const corners = [{ x: [0, 1], y: [0, 1], yes: false, c: 'none' }, { x: [4, 5], y: [0, 1], yes: true, c: 'sweet' },
      { x: [0, 1], y: [4, 5], yes: true, c: 'spicy' }, { x: [4, 6], y: [4, 6], yes: false, c: 'both' }];
    for (;;) {
      const pts = [];
      for (const k of corners) for (let i = 0; i < per; i++) pts.push({ x: int(rnd, k.x[0], k.x[1]), y: int(rnd, k.y[0], k.y[1]), yes: k.yes, c: k.c });
      if (new Set(pts.map(p => `${p.x},${p.y}`)).size < pts.length) continue;
      return { pts: per === 1 ? pts : shuffle(rnd, pts) };
    }
  }
  /** The two helpers: "any taste at all?" (sweet + spicy ≥ 3) and "too much at once?" (sweet + spicy ≥ 7). */
  const HELPERS = [{ a: 1, b: 1, t: 3 }, { a: 1, b: 1, t: 7 }];
  const helpers = p => HELPERS.map(r => r.a * p.x + r.b * p.y >= r.t ? 1 : 0);
  /** Does the boss (w1·helper1 + w2·helper2 ≥ t) get every dish right? */
  const bossOk = (boss, pts) => pts.every(p => { const [h1, h2] = helpers(p); return (boss.a * h1 + boss.b * h2 >= boss.t) === p.yes; });
  const BOSS_RANGE = { a: [-3, 3], b: [-3, 3], t: [-3, 3] };

  /* ---------- numbers ---------- */
  const MINUS = '−';
  /** −4, 0, 3 (with a real minus sign). */
  const num = v => v < 0 ? MINUS + (-v) : String(v);
  /** +3 / −4 / 0 for weights. */
  const signed = v => v > 0 ? '+' + v : num(v);
  /** A number inside a sum: negative ones in brackets. */
  const term = v => v < 0 ? `(${num(v)})` : String(v);
  /** "2·3 + (−4)" — only the ingredients on the plate, one portion without "1·" (`plain`: never the amounts). */
  function formula(w, x, mul = '·', plain = false) {
    const parts = [];
    x.forEach((v, i) => {
      if (!v) return;
      parts.push(plain || v === 1 ? term(w[i]) : `${v}${mul}${term(w[i])}`);
    });
    return parts.join(' + ');
  }
  /** "3", "-4", "−4", " 12 " → number, or NaN. */
  function parseNum(s) {
    const t = String(s).trim().replace(/[−–—]/g, '-');
    return /^-?\d+$/.test(t) ? parseInt(t, 10) : NaN;
  }

  /* ---------- drawing ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** Clip a polygon to the half-plane a·x + b·y ≥ c (Sutherland–Hodgman). */
  function clip(poly, a, b, c) {
    const out = [], f = p => a * p[0] + b * p[1] - c;
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length], fp = f(p), fq = f(q);
      if (fp >= 0) out.push(p);
      if ((fp >= 0) !== (fq >= 0)) { const k = fp / (fp - fq); out.push([p[0] + k * (q[0] - p[0]), p[1] + k * (q[1] - p[1])]); }
    });
    return out;
  }
  /**
   * The taste map as an SVG string: x = sweet (→), y = spicy (↑), 0..6.
   * o: { pts: [{x, y, yes, tag}], rule: {a, b, t} | null (shade the 😋 side and draw the line), mark: 'wrong' | 'all' |
   *      'none' (red rings on wrongly sorted dishes), faces: true (😋/🤢 in the dots) or false (plain dots with tags),
   *      xLabel, yLabel, ink, cls, extraLines: [{a, b, t, color}] }
   */
  function mapSVG(o) {
    const C = 40, M = { l: 46, b: 46, t: 14, r: 14 }, W = M.l + SIDE * C + M.r + C, H = M.t + SIDE * C + M.b + C;
    const X = x => M.l + C / 2 + x * C, Y = y => M.t + C / 2 + (SIDE - y) * C;
    const f = n => Math.round(n * 10) / 10;
    let s = `<svg class="map ${o.cls || ''}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">`;
    const box = [[-0.5, -0.5], [SIDE + 0.5, -0.5], [SIDE + 0.5, SIDE + 0.5], [-0.5, SIDE + 0.5]];
    s += `<rect x="${X(-0.5)}" y="${Y(SIDE + 0.5)}" width="${(SIDE + 1) * C}" height="${(SIDE + 1) * C}" fill="#fff" stroke="#c5cbe0"/>`;
    const lines = [];
    const half = r => {
      // the 😋 side: a·x + b·y ≥ t − ½ (all points are whole numbers, so the line runs between them)
      if (!r.a && !r.b) return r.t <= 0 ? box : [];
      return clip(box, r.a, r.b, r.t - 0.5);
    };
    if (o.rule) {
      const poly = half(o.rule);
      if (poly.length > 2) s += `<path d="M${poly.map(p => `${f(X(p[0]))} ${f(Y(p[1]))}`).join('L')}Z" fill="${o.shade || '#dff3e6'}"/>`;
      lines.push({ ...o.rule, color: o.ink || '#3d48b8' });
    }
    // grid
    let g = '';
    for (let i = 0; i <= SIDE; i++) g += `M${X(i)} ${Y(-0.5)}V${Y(SIDE + 0.5)}M${X(-0.5)} ${Y(i)}H${X(SIDE + 0.5)}`;
    s += `<path d="${g}" stroke="#dfe5f1" stroke-width="1" fill="none"/>`;
    for (let i = 0; i <= SIDE; i++) {
      s += `<text x="${X(i)}" y="${Y(-0.5) + 16}" font-size="13" text-anchor="middle" fill="#667085">${i}</text>`;
      s += `<text x="${X(-0.5) - 7}" y="${Y(i) + 4.5}" font-size="13" text-anchor="end" fill="#667085">${i}</text>`;
    }
    s += `<text x="${X(SIDE / 2)}" y="${H - 8}" font-size="15" font-weight="700" text-anchor="middle" fill="#1e2436">${esc(o.xLabel || '🍬 →')}</text>`;
    s += `<text transform="translate(15 ${Y(SIDE / 2)}) rotate(-90)" font-size="15" font-weight="700" text-anchor="middle" fill="#1e2436">${esc(o.yLabel || '🌶️ →')}</text>`;
    for (const r of [...lines, ...(o.extraLines || [])]) {
      if (!r.a && !r.b) continue;
      // the segment of a·x + b·y = t − ½ inside the box: clip the box, keep the points on the line
      const poly = clip(box, r.a, r.b, r.t - 0.5).filter(p => Math.abs(r.a * p[0] + r.b * p[1] - (r.t - 0.5)) < 1e-6);
      if (poly.length >= 2) s += `<line x1="${f(X(poly[0][0]))}" y1="${f(Y(poly[0][1]))}" x2="${f(X(poly[1][0]))}" y2="${f(Y(poly[1][1]))}" stroke="${r.color}" stroke-width="${r.width || 4}" stroke-linecap="round" ${r.dash ? 'stroke-dasharray="8 6"' : ''}/>`;
    }
    for (const p of o.pts) {
      const wrong = o.rule && o.mark !== 'none' && (o.rule.a * p.x + o.rule.b * p.y >= o.rule.t) !== p.yes;
      const cx = X(p.x), cy = Y(p.y);
      if (o.faces !== false) {
        s += `<circle cx="${cx}" cy="${cy}" r="15" fill="${p.yes ? '#c9f0d6' : '#fde0e5'}" stroke="${p.yes ? '#1f9d55' : '#d6455a'}" stroke-width="2"/>`;
        s += `<text x="${cx}" y="${cy + 6.5}" font-size="18" text-anchor="middle">${p.yes ? '😋' : '🤢'}</text>`;
      } else {
        s += `<circle cx="${cx}" cy="${cy}" r="6" fill="#1e2436"/>`;
      }
      if (p.tag) s += `<text x="${cx + 13}" y="${cy - 11}" font-size="14" font-weight="800" fill="#1e2436" stroke="#fff" stroke-width="3" paint-order="stroke">${esc(p.tag)}</text>`;
      if (wrong) s += `<circle class="wrongring" cx="${cx}" cy="${cy}" r="19" fill="none" stroke="#d6455a" stroke-width="3" stroke-dasharray="5 3"/>`;
    }
    return s + '</svg>';
  }

  /**
   * The little network of chapter 7: sweet and spicy go into two helper robots, their TAK/NIE (1/0) go to the boss.
   * o: { h1, h2, boss: label strings, in1, in2, out } → SVG string.
   */
  function netSVG(o) {
    const W = 520, H = 236;
    const node = (x, y, w, h, fill, stroke, lines, sizes) => {
      let s = `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
      const n = lines.length, lh = 24;
      lines.forEach((t, i) => { s += `<text x="${x}" y="${y + (i - (n - 1) / 2) * lh + 7}" font-size="${sizes[i] || 18}" font-weight="${i ? 600 : 800}" text-anchor="middle" fill="#1e2436">${esc(t)}</text>`; });
      return s;
    };
    const arrowTo = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8a93ad" stroke-width="3" marker-end="url(#ah)"/>`;
    let s = `<svg class="net" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">`;
    s += '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8a93ad"/></marker></defs>';
    s += arrowTo(68, 62, 122, 56) + arrowTo(68, 62, 122, 162) + arrowTo(68, 174, 122, 68) + arrowTo(68, 174, 122, 176);
    s += arrowTo(306, 62, 350, 106) + arrowTo(306, 174, 350, 130);
    s += node(36, 62, 60, 54, '#fff', '#c5cbe0', [o.in1 || '🍬'], [28]);
    s += node(36, 174, 60, 54, '#fff', '#c5cbe0', [o.in2 || '🌶️'], [28]);
    s += node(214, 62, 180, 74, '#e9ebff', '#4f5bd5', ['🤖 ' + (o.h1n || '1'), o.h1 || ''], [19, 18]);
    s += node(214, 174, 180, 74, '#e9ebff', '#4f5bd5', ['🤖 ' + (o.h2n || '2'), o.h2 || ''], [19, 18]);
    s += node(436, 118, 164, 104, '#fff6d6', '#e0b84a', ['👨‍🍳 ' + (o.bossn || ''), o.boss || '', o.out || '😋 / 🤢'], [19, 17, 20]);
    return s + '</svg>';
  }

  return {
    INGR, ING, GUESTS, GUEST, CHAPTERS, SIDE, RANGE, BOSS_RANGE, HELPERS, ROBOT_T, MINUS,
    rng, pick, int, shuffle, sum, score, likes, key, dishes, kinds, newGuest,
    count1, best1, count2, cook2, detect3, spoil3, train, fix, train4, test5, map6, sorted, sorts, xor7, helpers, bossOk,
    num, signed, term, formula, parseNum, esc, clip, mapSVG, netSVG,
  };
})();
if (typeof module !== 'undefined') module.exports = CHEF;
