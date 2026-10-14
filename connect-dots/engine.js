/**
 * Connect the dots — engine of the printable worksheet. Classic script; defines the global `DOTS`
 * (also exported for Node: `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) and the pictures of the
 * graphic dictation (../graphic-dictation/engine.js: DICT.PICS, DICT.variant).
 *
 * A picture is one closed outline (corner points in squares, x right, y down). Its dots are the corners plus
 * extra dots on long sides, so no side spans more than MAX_SIDE squares. The child joins them in order and
 * goes back from the last dot to the first. Everything below works in millimetres once a scale is chosen.
 *   DOTS.dotsOf(pts)                → the dots of an outline, in squares: [[x, y, corner?]…]
 *   DOTS.PICS                       → the dictation's pictures that work here (all but the church and the shrine)
 *   DOTS.levelOf(pic) / pool(…)     → level by the number of dots; the pictures of a level and theme
 *   DOTS.numbers(mode, n, rnd)      → the numbers by the dots: 1, 2, 3… / 2, 4, 6… / 21, 22, 23… / 10, 20, 30…
 *   DOTS.place(dots, nums, scale)   → dots and number labels in mm; every label outside the outline where
 *                                      possible, nearest to its own dot, touching no other dot, label or line
 *   DOTS.fit(dots, nums, w, h)      → place(…) at the largest scale that fits a w × h mm box
 *   DOTS.pictures(rnd, level, …)    → the two pictures of a sheet (variant, dots, numbers)
 *   DOTS.arrange(items)             → two pictures stacked (rows) or side by side (cols), the room maybe shared
 *                                      unevenly, whichever makes them biggest
 *   DOTS.problems(layout)           → what is wrong with a layout (the test's check; [] when all is well)
 *   DOTS.svg(layout, opts)          → a layout as an SVG string (opts.solved: the answer key's drawn outline)
 */
const DOTS = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');
  const D = typeof DICT !== 'undefined' ? DICT : require('../graphic-dictation/engine.js');

  const MAX_SIDE = 3;                      // squares between two dots at most
  const R_DOT = 1.0, R_START = 1.9;        // dot radius in mm; dot 1 is bigger (and green)
  const FONTS = [4.6, 4.2, 3.8, 3.4, 3.0]; // label font size in mm, the largest that fits wins
  const GAP = { dot: 0.9, label: 0.7, line: 0.8, own: 0.8 };   // clearances in mm (see place)
  const MAX_SCALE = 15;                    // mm per square: small pictures do not grow huge

  /* ---------- dots and levels ---------- */
  /** The corners of a closed outline plus evenly spread dots on its long sides; [x, y, true] = a corner. */
  function dotsOf(pts) {
    const out = [];
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const parts = Math.ceil(len / MAX_SIDE - 1e-9);
      out.push([a[0], a[1], true]);
      for (let k = 1; k < parts; k++) out.push([a[0] + (b[0] - a[0]) * k / parts, a[1] + (b[1] - a[1]) * k / parts, false]);
    });
    return out;
  }
  /** Levels by the number of dots (not the dictation's levels: there the diagonals make a picture hard, here
   *  they make it short): easy up to 16 dots, medium up to 21, hard more. */
  const LEVELS = { easy: [1, 16], medium: [17, 21], hard: [22, 99] };
  const LEVEL_IDS = Object.keys(LEVELS);
  // the church and the wayside shrine have a cross with arms one square wide: on half a page there is no room
  // for a number next to each of its 12 corners
  const SKIP = ['church', 'shrine'];
  const PICS = D.PICS.filter(p => !SKIP.includes(p.id));
  const count = pic => dotsOf(pic.pts).length;
  const levelOf = pic => LEVEL_IDS.find(l => count(pic) >= LEVELS[l][0] && count(pic) <= LEVELS[l][1]);
  /** The pictures of a level and theme ('basic' everyday things, 'faith' Catholic motifs, 'all'). */
  const pool = (level, theme = 'basic') => PICS.filter(p => levelOf(p) === level && (theme === 'all' || p.themes.includes(theme)));

  /* ---------- the numbers ---------- */
  const MODE_IDS = ['ones', 'twos', 'from', 'tens'];
  /** The numbers of n dots: 'ones' 1, 2, 3…, 'twos' 2, 4, 6…, 'tens' 10, 20, 30…, 'from' n0, n0+1… with n0 one of
   *  11, 21… 71, so the last number stays below 100. */
  function numbers(mode, n, rnd) {
    let a = 1, step = 1;
    if (mode === 'twos') { a = 2; step = 2; }
    if (mode === 'tens') { a = 10; step = 10; }
    if (mode === 'from') {
      const starts = [11, 21, 31, 41, 51, 61, 71].filter(s => s + n - 1 <= 99);
      a = starts.length ? K.pick(rnd, starts) : 11;
    }
    return Array.from({ length: n }, (_, i) => a + i * step);
  }

  /* ---------- geometry (mm) ---------- */
  const rectPt = (r, x, y) => Math.hypot(Math.max(r.x0 - x, 0, x - r.x1), Math.max(r.y0 - y, 0, y - r.y1));
  const rectRect = (a, b) => Math.hypot(Math.max(a.x0 - b.x1, 0, b.x0 - a.x1), Math.max(a.y0 - b.y1, 0, b.y0 - a.y1));
  function segPt(ax, ay, bx, by, x, y) {
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)) : 0;
    return Math.hypot(ax + t * dx - x, ay + t * dy - y);
  }
  const cross = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  function segsCross(a, b, c, d) {
    const d1 = cross(c[0], c[1], d[0], d[1], a[0], a[1]), d2 = cross(c[0], c[1], d[0], d[1], b[0], b[1]);
    const d3 = cross(a[0], a[1], b[0], b[1], c[0], c[1]), d4 = cross(a[0], a[1], b[0], b[1], d[0], d[1]);
    return d1 * d2 < 0 && d3 * d4 < 0;
  }
  /** Distance between the segment a–b and a rectangle (0 when they touch). */
  function segRect(a, b, r) {
    const inside = p => p[0] >= r.x0 && p[0] <= r.x1 && p[1] >= r.y0 && p[1] <= r.y1;
    if (inside(a) || inside(b)) return 0;
    const cs = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]];
    for (let i = 0; i < 4; i++) if (segsCross(a, b, cs[i], cs[(i + 1) % 4])) return 0;
    return Math.min(rectPt(r, a[0], a[1]), rectPt(r, b[0], b[1]), ...cs.map(c => segPt(a[0], a[1], b[0], b[1], c[0], c[1])));
  }
  /** Is (x, y) inside the polygon? (even–odd rule) */
  function inside(P, x, y) {
    let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      if ((P[i][1] > y) !== (P[j][1] > y) && x < P[j][0] + (P[i][0] - P[j][0]) * (y - P[j][1]) / (P[i][1] - P[j][1])) c = !c;
    }
    return c;
  }
  /** Label box of a number: digits ≈ 0.6 em wide, ≈ 0.72 em high. */
  const labelSize = (text, font) => ({ w: 0.6 * font * String(text).length + 0.3, h: 0.74 * font });

  /* ---------- placing the numbers ---------- */
  // tried in this order: straight out along the corner's bisector first, then turning further and further
  const TURNS = [0]; for (let t = 20; t < 180; t += 20) TURNS.push(t, -t); TURNS.push(180);
  const PUSH = [0.5, 1.5, 2.8];   // extra distance from the dot, mm
  /**
   * Dots (in squares) and their numbers placed at `scale` mm per square with labels of `font` mm.
   * A label must keep GAP.dot from every other dot, GAP.label from every other label, GAP.line from every side
   * of the outline, and be nearer (by GAP.own) to its own dot than to any other. Returns { dots, labels, font,
   * scale, box, bad } in mm; bad = labels that broke a rule (none, normally).
   */
  function place(dots, nums, scale, font, rounds = 4) {
    const P = dots.map(([x, y]) => [x * scale, y * scale]), n = P.length;
    let area = 0;
    for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    const sgn = area > 0 ? 1 : -1;
    // outward normal of the side i → i+1 (y down: for a positive signed area it is (dy, −dx))
    const normal = i => {
      const a = P[i], b = P[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      return [sgn * dy / L, -sgn * dx / L];
    };
    const out = P.map((_, i) => {
      const m1 = normal((i - 1 + n) % n), m2 = normal(i);
      let ux = m1[0] + m2[0], uy = m1[1] + m2[1];
      const L = Math.hypot(ux, uy);
      return L < 1e-9 ? m2 : [ux / L, uy / L];
    });
    const rad = i => i === 0 ? R_START : R_DOT;
    const sides = P.map((a, i) => [a, P[(i + 1) % n]]);
    const labels = new Array(n).fill(null);

    function candidates(i) {
      const { w, h } = labelSize(nums[i], font), list = [];
      for (const turn of TURNS) for (const push of PUSH) {
        const t = turn * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
        const dx = out[i][0] * c - out[i][1] * s, dy = out[i][0] * s + out[i][1] * c;
        const d = rad(i) + push + Math.abs(dx) * w / 2 + Math.abs(dy) * h / 2;
        const x = P[i][0] + d * dx, y = P[i][1] + d * dy;
        list.push({ x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2, x, y, text: String(nums[i]) });
      }
      return list;
    }
    /** How badly a label at r for dot i breaks the rules (0 = fine); counting stops at `limit`. */
    function penalty(i, r, limit) {
      let p = 0;
      const own = rectPt(r, P[i][0], P[i][1]);
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        if (p >= limit) return p;
        const d = rectPt(r, P[j][0], P[j][1]);
        if (d < rad(j) + GAP.dot) p += 10 + rad(j) + GAP.dot - d;
        if (d < own + GAP.own) p += 5 + own + GAP.own - d;
        if (labels[j] && rectRect(r, labels[j]) < GAP.label) p += 10 + GAP.label - rectRect(r, labels[j]);
      }
      for (const [a, b] of sides) { const d = segRect(a, b, r); if (d < GAP.line) p += 3 + GAP.line - d; }
      return p;
    }
    // first the dots in order; dots that found no good place go first in a second round
    let order = P.map((_, i) => i), bad = [];
    for (let round = 0; round < rounds; round++) {
      labels.fill(null); bad = [];
      for (const i of order) {
        let best = null, bestP = Infinity;
        for (const r of candidates(i)) {
          const p = penalty(i, r, bestP);
          if (p < bestP) { best = r; bestP = p; }
          if (p === 0) break;
        }
        labels[i] = best;
        if (bestP > 0) bad.push(i);
      }
      if (!bad.length) break;
      order = [...bad, ...order.filter(i => !bad.includes(i))];
    }
    // the box around everything, 1 mm to spare
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    P.forEach(([x, y], i) => { x0 = Math.min(x0, x - rad(i)); x1 = Math.max(x1, x + rad(i)); y0 = Math.min(y0, y - rad(i)); y1 = Math.max(y1, y + rad(i)); });
    for (const r of labels) { x0 = Math.min(x0, r.x0); x1 = Math.max(x1, r.x1); y0 = Math.min(y0, r.y0); y1 = Math.max(y1, r.y1); }
    const box = { x0: x0 - 1, y0: y0 - 1, x1: x1 + 1, y1: y1 + 1 };
    return { dots: P, corners: dots.map(d => d[2]), labels, font, scale, box, w: box.x1 - box.x0, h: box.y1 - box.y0, bad };
  }
  /** place(…) with the largest font that puts every label well (or the smallest font when none does). */
  function placeBest(dots, nums, scale) {
    let L = null;
    for (const f of FONTS) { L = place(dots, nums, scale, f); if (!L.bad.length) return L; }
    return L;
  }
  const extent = dots => {
    const xs = dots.map(d => d[0]), ys = dots.map(d => d[1]);
    return { W: Math.max(...xs) - Math.min(...xs), H: Math.max(...ys) - Math.min(...ys) };
  };
  /** A first guess of the scale for a w × h mm box (8 mm all round for the numbers). */
  const guess = (dots, w, h) => { const { W, H } = extent(dots); return Math.min(MAX_SCALE, (w - 16) / W, (h - 16) / H); };
  /** The largest scale (up to MAX_SCALE mm a square) whose layout, labels included, fits w × h mm. The scale is
   *  found with quick layouts (the largest font, one round); the last one tries every font. */
  function fit(dots, nums, w, h) {
    const { W, H } = extent(dots), fits = L => L.w <= w + 1e-6 && L.h <= h + 1e-6;
    // the room the outline alone may take: the box minus the labels' margin
    const room = (L, s) => Math.min(MAX_SCALE / s, (w - (L.w - W * s)) / (W * s), (h - (L.h - H * s)) / (H * s));
    let s = guess(dots, w, h);
    for (let k = 0; k < 6; k++) {
      const L = place(dots, nums, s, FONTS[0], 1), r = room(L, s);
      if (fits(L) && r < 1.02) break;
      s *= Math.min(r, MAX_SCALE / s) * 0.995;
    }
    for (let k = 0; k < 6; k++, s *= 0.97) { const L = placeBest(dots, nums, s); if (fits(L)) return L; }
    return placeBest(dots, nums, s);
  }
  /** The page's room for two pictures, in mm: w × h, `cap` for the lines above and below each picture, `gap` between. */
  const AREA = { w: 186, h: 228, cap: 15, gap: 6 };
  const SPLITS = [0.5, 0.42, 0.58, 0.34, 0.66];   // the first picture's share of the room
  /** The shortest distance between two dots, in squares. */
  function spacing(dots) {
    let m = Infinity;
    for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) m = Math.min(m, Math.hypot(dots[i][0] - dots[j][0], dots[i][1] - dots[j][1]));
    return m;
  }
  const ROOMY = 14;   // mm between the two closest dots: more than this does not make a picture easier
  /**
   * Two pictures on one page: stacked (rows) or side by side (cols), the room shared 50:50 or unevenly. The
   * winner gives the most crowded picture the most room: the two closest dots as far apart as possible (up to
   * ROOMY mm), big numbers, no misplaced label. items: [{ dots, nums }]. Returns { mode, split, sizes: [{ w, h }], layouts }.
   */
  function arrange(items, area = AREA) {
    const sp = items.map(it => spacing(it.dots)), all = [];
    for (const mode of ['rows', 'cols']) for (const split of SPLITS) {
      const sizes = mode === 'rows'
        ? [split, 1 - split].map(a => ({ w: area.w, h: (area.h - 2 * area.cap - area.gap) * a }))
        : [split, 1 - split].map(a => ({ w: (area.w - area.gap) * a, h: area.h - area.cap }));
      all.push({ mode, split, sizes, est: Math.min(...items.map((it, i) => Math.min(ROOMY, sp[i] * guess(it.dots, sizes[i].w, sizes[i].h)))) });
    }
    // only the four most promising ones are laid out for real (more while all of them misplace a label)
    let best = null;
    for (const [k, { mode, split, sizes }] of all.sort((a, b) => b.est - a.est).entries()) {
      if (k >= 4 && best.score > -50) break;
      const layouts = items.map((it, i) => fit(it.dots, it.nums, sizes[i].w, sizes[i].h));
      const score = Math.min(...layouts.map((L, i) => Math.min(ROOMY, sp[i] * L.scale) + 2 * (L.font - FONTS[0]) - (L.bad.length ? 100 : 0)))
        + (split === 0.5 ? 0.4 : 0) + (mode === 'rows' ? 0.05 : 0);   // a near tie → even, stacked
      if (!best || score > best.score) best = { mode, split, sizes, layouts, score };
    }
    return best;
  }
  /**
   * The pictures of one sheet: mix = an easy one and a medium or hard one, otherwise two of the level; each one
   * turned some way (DICT.variant), with its dots and numbers. Returns [{ id, emoji, level, pts, dots, nums }].
   */
  function pictures(rnd, level, theme, mode) {
    const levels = level === 'mix' ? ['easy', K.pick(rnd, ['medium', 'hard'])] : [level, level];
    const used = new Set();
    return levels.map(lv => {
      const pic = K.pick(rnd, pool(lv, theme).filter(p => !used.has(p.id)));
      used.add(pic.id);
      const v = D.variant(pic, rnd), dots = dotsOf(v.pts);
      return { ...v, level: lv, dots, nums: numbers(mode, dots.length, rnd) };
    });
  }

  /** Everything wrong with a layout: overlapping labels and dots, a label nearer to another dot, a label on a line. */
  function problems(L) {
    const out = [], P = L.dots, n = P.length, rad = i => i === 0 ? R_START : R_DOT;
    for (let i = 0; i < n; i++) {
      const r = L.labels[i], own = rectPt(r, P[i][0], P[i][1]);
      if (own < rad(i) - 1e-6) out.push(`label ${r.text} covers its dot`);
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const d = rectPt(r, P[j][0], P[j][1]);
        if (d < rad(j) + 0.3) out.push(`label ${r.text} touches dot ${L.labels[j].text}`);
        if (d <= own) out.push(`label ${r.text} is nearer to dot ${L.labels[j].text}`);
        if (j > i && rectRect(r, L.labels[j]) < 0.3) out.push(`labels ${r.text} and ${L.labels[j].text} touch`);
      }
      P.forEach((a, k) => { if (segRect(a, P[(k + 1) % n], r) < 0.2) out.push(`label ${r.text} is on a line`); });
    }
    return out;
  }
  /** How many labels sit inside the outline (they are allowed, but outside is nicer). */
  const labelsInside = L => L.labels.filter(r => inside(L.dots, r.x, r.y)).length;

  /* ---------- drawing ---------- */
  const f = v => Math.round(v * 100) / 100;
  /**
   * A layout as an SVG string, in mm (1 user unit = 1 mm).
   * opts: { solved: true → the outline drawn and filled in (answer key), fill, maxWidth (CSS) }
   */
  function svg(L, opts = {}) {
    const b = L.box;
    let s = `<svg class="dots" viewBox="${f(b.x0)} ${f(b.y0)} ${f(L.w)} ${f(L.h)}" style="width:${f(L.w)}mm" xmlns="http://www.w3.org/2000/svg">`;
    if (opts.solved) {
      s += `<path d="M${L.dots.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z" fill="${opts.fill || '#ffe08a'}" stroke="#1e2436" stroke-width="0.7" stroke-linejoin="round"/>`;
    }
    const ink = opts.solved ? '#555b6e' : '#1b1b1f';
    L.dots.forEach(([x, y], i) => {
      if (i === 0) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${R_START}" fill="#1f9d55" stroke="#fff" stroke-width="0.35"/>`;
      else s += `<circle cx="${f(x)}" cy="${f(y)}" r="${R_DOT}" fill="${ink}"/>`;
    });
    L.labels.forEach((r, i) => {
      // alphabetic baseline: digits stand ≈ 0.36 em above it, so the text is centred on the label box
      s += `<text x="${f(r.x)}" y="${f(r.y + 0.36 * L.font)}" font-size="${L.font}" text-anchor="middle"`
        + ` font-family="system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif" font-weight="${i === 0 ? 800 : 600}"`
        + ` fill="${i === 0 ? '#14783f' : ink}">${r.text}</text>`;
    });
    return s + '</svg>';
  }

  return { MAX_SIDE, LEVELS, LEVEL_IDS, PICS, MODE_IDS, THEME_IDS: D.THEME_IDS, AREA, dotsOf, spacing, count, levelOf, pool, numbers, place, fit, arrange, pictures, problems, labelsInside, svg };
})();
if (typeof module !== 'undefined') module.exports = DOTS;
