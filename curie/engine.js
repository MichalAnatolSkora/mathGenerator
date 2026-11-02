/**
 * Marie's laboratory (Laboratorium Marii Skłodowskiej-Curie): three paper missions about how Maria
 * Skłodowska-Curie found polonium and radium in 1898. Classic script; defines the global `CU` (also exported for
 * Node, so `node engine.test.js` can check it).
 *
 *   CU.U                          → what 1 g of pure uranium shows on the electrometer, in units (działki)
 *   CU.HALF                       → polonium loses half of its activity every 140 days (Maria's own figure, 1906)
 *   CU.samples(rnd, level)        → mission 1: stones measured with the electrometer (mass, uranium in it, reading)
 *   CU.tree(rnd, level)           → mission 2: the separation of 1 kg of ore, step by step, down to polonium and radium
 *   CU.treeSvg(T, opts)           → that tree drawn as test tubes joined by lines (labels and numbers from strings.js)
 *   CU.barsSvg(list, max, solved) → mission 1 ★: the bar chart to colour, one column per stone
 *   CU.decay(rnd, level)          → mission 3: a polonium sample measured every 140 days
 *   CU.decaySvg(D, opts)          → the empty (or, for the answers, filled) graph of mission 3
 *   CU.blanks(word)               → "P _ L _ N": a name to fill in, every other letter given
 *
 * Levels: 'easy' ★, 'mid' ★★, 'hard' ★★★. The same rnd ⇒ the same mission.
 */
const CU = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');
  const { pick, int, shuffle } = K;

  const U = 2;          // 1 g of pure uranium gives 2 units: every ratio "times stronger than uranium" is a ÷ 2
  const HALF = 140;     // days; Maria measured about 140 in 1906 (today: 138.4)
  const PO = 800, RA = 1800;   // units per gram at the end: 400× and 900× uranium, as the Curies reported in 1898

  /* ============ mission 1: what the electrometer shows ============ */
  // ore = pitchblende (blenda), chalNat = natural chalcolite, chalArt = chalcolite Maria made from pure salts,
  // thor = thorite (thorium, active too, but not a new element), quartz = an ordinary stone
  const SAMPLE_IDS = ['uran', 'ore', 'chalNat', 'chalArt', 'thor', 'quartz'];

  function samples(rnd, level) {
    for (;;) {
      const ore = 2 * int(rnd, 3, 7), chal = 2 * int(rnd, 2, 4);
      if (ore === chal) continue;
      // per gram: a = what the stone shows; u = grams of uranium in 1 g … but on ★★★ we work with whole samples
      const list = [
        { id: 'uran', a: U },
        { id: 'ore', a: ore },
        { id: 'chalNat', a: chal },
        { id: 'chalArt', a: 1 },
        { id: 'thor', a: U },   // thorium is about as active as uranium: never "stronger than uranium" on ★/★★
        { id: 'quartz', a: 0 },
      ];
      for (const s of list) {
        s.m = level === 'easy' ? 1 : int(rnd, 2, 5);
        s.read = s.m * s.a;
      }
      if (level === 'hard') {
        // uranium inside each sample (whole grams): what uranium alone would show is 2 × that; the rest is "extra"
        for (const s of list) {
          if (s.id === 'uran') s.u = s.m;
          else if (s.id === 'ore' || s.id === 'chalNat') s.u = int(rnd, Math.ceil(s.m / 2), s.m - 1 || 1);
          else if (s.id === 'chalArt') { s.m = 2 * int(rnd, 1, 2); s.u = s.m / 2; s.read = 2 * s.u; s.a = 1; }
          else s.u = 0;
          if (s.id === 'ore' || s.id === 'chalNat') s.read = 2 * s.u + s.m * (s.a - 2);  // extra per gram = a − 2
          s.expected = 2 * s.u;
          s.extra = s.read - s.expected;
        }
        if (list.some(s => s.id !== 'thor' && s.extra < 0)) continue;
        const ex = list.filter(s => s.extra > 0 && s.id !== 'thor');
        if (ex.length !== 2 || ex[0].extra / ex[0].m === ex[1].extra / ex[1].m) continue;
      }
      if (level === 'mid') {
        // the sample with the most units must not be the strongest per gram: "most units ≠ strongest" is the point
        const big = list.reduce((b, x) => (x.read > b.read ? x : b)), best = list.reduce((b, x) => (x.a > b.a ? x : b));
        if (list.filter(x => x.read === big.read).length > 1 || big.id === best.id) continue;
      }
      const shown = [list[0], ...shuffle(rnd, list.slice(1))];
      return { level, list: shown, ore, chal, times: { ore: ore / U, chalNat: chal / U } };
    }
  }

  /* ============ mission 2: the separation of the ore ============ */
  // The chemistry is the Curies' (simplified): the ore is dissolved in acid; hydrogen sulphide brings down the
  // sulphides (lead, bismuth, copper), the rest stays dissolved (barium, calcium…), what does not dissolve is sand.
  // Polonium follows bismuth, and its sulphide flies off when heated (they used that, July 1898). Radium follows
  // barium, and its chloride goes into the crystals first (December 1898).
  //   id: [parent, path?]
  const NODES = {
    ore: [null, true],
    sulf: ['ore', true], sol: ['ore', true], sand: ['ore', false],
    bi: ['sulf', true], pbcu: ['sulf', false],
    po: ['bi', true], bires: ['bi', false],
    ba: ['sol', true], salts: ['sol', false],
    ra: ['ba', true], liq: ['ba', false],
  };
  const kids = id => Object.keys(NODES).filter(k => NODES[k][0] === id);

  /**
   * Every node has mass m (g), activity a (units per gram) and reading r = m × a. Masses and readings add up:
   * what goes into a step comes out of it, nothing is lost. A path node is stronger per gram than its parent,
   * the others weaker. On ★ only the polonium branch is followed (the solution waits "for later", as in 1898);
   * on ★★★ at least one weaker tube shows more units in total than the stronger one next to it (it is just bigger).
   */
  function tree(rnd, level) {
    const evens = (lo, hi) => { const r = []; for (let v = Math.ceil(lo / 2) * 2; v <= hi; v += 2) r.push(v); return r; };
    const tens = (lo, hi) => { const r = []; for (let v = Math.ceil(lo / 10) * 10; v <= hi; v += 10) r.push(v); return r; };
    const weaker = (P, m, r) => m > 0 && r >= m && r % m === 0 && r / m < P.a;   // the rest of a step: ≥ 1 unit/g, weaker
    // a step with one stronger tube (masses ms, per gram as) and the rest: all valid choices, then one at random
    function split(P, ms, as, final) {
      const ok = [];
      for (const m of ms) for (const a of as) {
        const rm = P.m - m, rr = P.m * P.a - m * a;
        if (a > P.a && m * a <= P.m * P.a && weaker(P, rm, rr) && (!final || final(m, a))) ok.push([{ m, a }, { m: rm, a: rr / rm }]);
      }
      return ok.length ? pick(rnd, ok) : null;
    }
    for (let tries = 0; ; tries++) {
      if (tries > 5000) throw new Error('tree: no luck');
      const N = {};
      const a0 = pick(rnd, [8, 10]);   // 800 and 1800 divide by both: whole "times stronger than the ore"
      N.ore = { m: 1000, a: a0 };
      // first step: sulphides and solution are both stronger than the ore, the sand takes the rest
      const sm = pick(rnd, [20, 25, 40, 50]), lm = pick(rnd, [100, 125, 200, 250]), dm = 1000 - sm - lm;
      const first = [];
      for (const sa of evens(3 * a0, 8 * a0)) for (const la of evens(a0 + 2, 3 * a0)) {
        const dr = 1000 * a0 - sm * sa - lm * la;
        if (sa > la && weaker(N.ore, dm, dr)) first.push([sa, la, dr / dm]);
      }
      if (!first.length) continue;
      const [sa, la, da] = pick(rnd, first);
      N.sulf = { m: sm, a: sa }; N.sol = { m: lm, a: la }; N.sand = { m: dm, a: da };
      // polonium: bismuth from the sulphides, then the sulphide that flies off when heated
      const bi = split(N.sulf, [4, 5, 8, 10].filter(m => 2 * m < sm), tens(2 * sa, 600),
        (m, a) => [1, 2].some(pm => weaker({ m, a }, m - pm, m * a - pm * PO)));
      if (!bi) continue;
      [N.bi, N.pbcu] = bi;
      const po = split(N.bi, [1, 2], [PO]);
      if (!po) continue;
      [N.po, N.bires] = po;
      // radium: barium chloride from the solution, then the crystals
      const ba = split(N.sol, [5, 10, 20], tens(3 * la, 1200), (m, a) => weaker({ m, a }, m - 1, m * a - RA));
      if (!ba) continue;
      [N.ba, N.salts] = ba;
      [N.ra, N.liq] = split(N.ba, [1], [RA]);
      for (const id in N) N[id].r = N[id].m * N[id].a;
      const trap = [['sulf', 'sand'], ['sol', 'sand'], ['bi', 'pbcu'], ['po', 'bires'], ['ba', 'salts'], ['ra', 'liq']]
        .filter(([p, w]) => N[w].r > N[p].r).map(([p]) => p);
      if (level === 'hard' && !trap.length) continue;
      const order = {};
      for (const id of Object.keys(NODES)) { const k = kids(id); if (k.length) order[id] = shuffle(rnd, k); }
      const show = id => level !== 'easy' || !['ba', 'salts', 'ra', 'liq'].includes(id);
      return { level, N, order, trap, show, a0, times: { po: PO / U, ra: RA / U, poOre: PO / a0, raOre: RA / a0 } };
    }
  }

  /** Text that never runs out of its box: squeezed with textLength when it is (roughly) wider than w mm. */
  function fit(x, y, size, w, str, extra = '') {
    const est = [...str].length * size * 0.56;
    return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle"${est > w ? ` textLength="${w}" lengthAdjust="spacingAndGlyphs"` : ''}${extra}>${K.esc(str)}</text>`;
  }

  /** The tree drawn top-down: one row per step, a tube per node, its leaves spread evenly (leaf order = order). */
  function treeSvg(T, opts) {
    const { L, solved } = opts, W = 186, rowH = 31, top = 1;
    const kidsOf = id => (T.order[id] || []).filter(T.show);
    const leaves = [];
    (function walk(id) { const k = kidsOf(id); if (!k.length) leaves.push(id); else k.forEach(walk); })('ore');
    const dx = W / leaves.length, X = {}, D = {}, NL = {};
    (function place(id, d) {
      D[id] = d; const k = kidsOf(id);
      if (!k.length) { X[id] = (leaves.indexOf(id) + 0.5) * dx; NL[id] = 1; }
      else { k.forEach(c => place(c, d + 1)); X[id] = (X[k[0]] + X[k[k.length - 1]]) / 2; NL[id] = k.reduce((t, c) => t + NL[c], 0); }
    })('ore', 0);
    const H = top + 4 * rowH - 11, y = id => top + D[id] * rowH, bh = 20;
    const hard = T.level === 'hard', path = id => NODES[id][1];
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}mm" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">`;
    for (const id of Object.keys(X)) for (const c of kidsOf(id)) {
      const on = solved && path(c);
      s += `<path d="M${X[id]} ${y(id) + bh}V${y(id) + bh + 5}H${X[c]}V${y(c)}" fill="none" stroke="${on ? '#b4321f' : '#777'}" stroke-width="${on ? 0.8 : 0.35}"/>`;
    }
    for (const id of Object.keys(X)) {
      const bw = Math.min(NL[id] * dx - 1.6, 44), x = X[id] - bw / 2, n = T.N[id], on = solved && path(id) && id !== 'ore';
      const fin = solved && (id === 'po' || id === 'ra'), later = T.level === 'easy' && id === 'sol';
      const lines = L.nodes[id], Y = y(id);
      s += `<rect x="${x}" y="${Y}" width="${bw}" height="${bh}" rx="2" fill="${fin ? '#fff4e0' : '#fff'}" stroke="${on ? '#b4321f' : '#555'}" stroke-width="${on ? 0.8 : 0.35}"/>`;
      // a small test tube at the left edge
      s += `<path d="M${x + 1.3} ${Y + 4}v10a1.2 1.2 0 0 0 2.4 0V${Y + 4}" fill="none" stroke="#555" stroke-width=".3"/>`
        + `<path d="M${x + 1.3} ${Y + 9}v5a1.2 1.2 0 0 0 2.4 0V${Y + 9}z" fill="${fin ? '#f0a020' : '#9ec3e6'}"/>`;
      const tx = x + 4.6 + (bw - 5.4) / 2, tw = bw - 6;
      s += fit(tx, Y + 3.9, 2.6, tw, lines[0], ' font-weight="700"');
      lines.slice(1).forEach((l, i) => { s += fit(tx, Y + 6.7 + i * 2.5, 2.2, tw, l, ' fill="#444"'); });
      if (later) s += fit(tx, Y + 16.8, 2.2, tw, L.later, ' fill="#8a5a00" font-style="italic"');
      else if (hard) {
        s += fit(tx, Y + 13.6, 2.5, tw, `${n.m} ${L.gram} · ${n.r} ${L.unitShort}`);
        if (id === 'ore' || solved) s += fit(tx, Y + 17.9, 2.7, tw, `${n.a} ${L.perG}`, ` font-weight="700" fill="${id === 'ore' ? '#111' : '#b4321f'}"`);
        else s += fit(tx, Y + 17.9, 2.5, tw, `____ ${L.perG}`, ' fill="#777"');
      } else {
        s += fit(tx, Y + 14.4, 3.6, tw, String(n.a), ` font-weight="700"${on ? ' fill="#b4321f"' : ''}`);
        s += fit(tx, Y + 18, 2.2, tw, L.perG, ' fill="#555"');
      }
    }
    return s + '</svg>';
  }

  /** Mission 1 ★: an empty bar chart, one column per sample (numbered like the table), 0 … max units. */
  function barsSvg(list, max, solved) {
    const n = list.length, cw = 10, ch = 3.2, ox = 7, W = ox + n * cw + 2, H = max * ch + 9;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}mm" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">`;
    for (let c = 0; c < n; c++) {
      const v = list[c].read;
      for (let r = 0; r < max; r++) {
        const fill = solved && r < v ? (list[c].id === 'uran' ? '#9ec3e6' : '#f0a020') : '#fff';
        s += `<rect x="${ox + c * cw + 1.5}" y="${1 + (max - 1 - r) * ch}" width="${cw - 3}" height="${ch}" fill="${fill}" stroke="#999" stroke-width=".2"/>`;
      }
      s += `<text x="${ox + c * cw + cw / 2}" y="${max * ch + 5}" font-size="3" font-weight="700" text-anchor="middle">${c + 1}</text>`;
    }
    for (let r = 0; r <= max; r += 2) s += `<text x="${ox - 1}" y="${1 + (max - r) * ch + 1}" font-size="2.4" text-anchor="end">${r}</text>`;
    // the uranium line: everything above it is stronger than pure uranium
    s += `<path d="M${ox} ${1 + (max - U) * ch}h${n * cw}" stroke="#1f4fbf" stroke-width=".5" stroke-dasharray="1.2 .8"/>`;
    return s + '</svg>';
  }

  /* ============ mission 3: polonium gets weaker ============ */
  function decay(rnd, level) {
    const start = pick(rnd, level === 'easy' ? [640, 800, 960, 1120] : [960, 1120, 1280, 1600]);
    const steps = level === 'easy' ? 4 : 5;
    const values = Array.from({ length: steps + 1 }, (_, i) => start / 2 ** i);
    const days = values.map((_, i) => i * HALF);
    const below = pick(rnd, values.slice(2, steps).map(v => v + v / 2));   // "when is it below …?" — between two rows
    const belowDay = days[values.findIndex(v => v < below)];
    // ★★★: measured today, how strong was it k half-lives ago
    const back = { k: int(rnd, 2, 3), today: pick(rnd, [25, 30, 40, 50, 60]) };
    back.days = back.k * HALF; back.then = back.today * 2 ** back.k;
    return { level, start, steps, values, days, below, belowDay, back };
  }

  /** The graph of mission 3: days across (0 … steps × 140), units up; solved draws the points and the curve. */
  function decaySvg(D, opts) {
    const { L, solved } = opts, W = 120, H = 66, ox = 12, oy = 58, w = 104, h = 52;
    const maxD = D.steps * HALF, maxV = D.start;
    const X = d => ox + d / maxD * w, Y = v => oy - v / maxV * h;
    const yTick = maxV / 8;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}mm" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">`;
    for (let i = 0; i <= 8; i++) s += `<path d="M${ox} ${Y(i * yTick)}h${w}" stroke="#ccc" stroke-width=".2"/><text x="${ox - 1}" y="${Y(i * yTick) + 0.9}" font-size="2.4" text-anchor="end">${i * yTick}</text>`;
    for (let i = 0; i <= D.steps * 2; i++) {
      const d = i * HALF / 2;
      s += `<path d="M${X(d)} ${oy}V${oy - h}" stroke="${i % 2 ? '#e3e3e3' : '#ccc'}" stroke-width=".2"/>`;
      if (i % 2 === 0) s += `<text x="${X(d)}" y="${oy + 3.4}" font-size="2.4" text-anchor="middle">${d}</text>`;
    }
    s += `<path d="M${ox} ${oy - h}V${oy}H${ox + w}" fill="none" stroke="#333" stroke-width=".4"/>`;
    s += `<text x="${ox + w}" y="${oy + 6.8}" font-size="2.5" text-anchor="end">${K.esc(L.days)}</text>`;
    s += `<text x="1" y="${oy - h - 2.4}" font-size="2.5">${K.esc(L.units)}</text>`;
    if (solved) {
      let d = '';
      for (let t = 0; t <= maxD; t += 5) d += `${t ? 'L' : 'M'}${X(t).toFixed(2)} ${Y(D.start / 2 ** (t / HALF)).toFixed(2)}`;
      s += `<path d="${d}" fill="none" stroke="#b4321f" stroke-width=".6"/>`;
      s += D.values.map((v, i) => `<circle cx="${X(D.days[i])}" cy="${Y(v)}" r="1" fill="#b4321f"/>`).join('');
    } else s += `<circle cx="${X(0)}" cy="${Y(D.start)}" r="1" fill="#111"/>`;
    return s + '</svg>';
  }

  /** "POLON" → "P _ L _ N" (first letter and every other letter shown). */
  const blanks = word => [...word].map((c, i) => (i % 2 === 0 ? c : '_')).join(' ');

  return { U, HALF, PO, RA, SAMPLE_IDS, samples, NODES, tree, treeSvg, barsSvg, decay, decaySvg, blanks };
})();
if (typeof module !== 'undefined') module.exports = CU;
