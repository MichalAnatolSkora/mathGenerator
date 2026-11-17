/**
 * Hidden objects — the pictures. Classic script; fills HID.SCENES (engine.js): id → function(g) that draws
 * the scene with the engine's pen `g` on a HID.W × HID.H mm sheet and offers places for the hidden objects.
 *
 * A scene is built like a stage set, from the back to the front: sky, far hills, the ground, then the
 * things standing on the ground sorted by how near they are (near = lower on the page = bigger = drawn
 * later, so it covers what stands behind). Every thing is a small function that draws in millimetres at
 * "size 1" with its foot at (0, 0) and y going up as negative numbers; the scene moves, scales and
 * mirrors the pen for it. All sizes and counts come from the seeded pen (g.r, g.ri, g.pick, g.chance).
 *
 * Hidden objects are built into the things (see `slot` and `stand` in engine.js). The pattern is
 *     if (!g.stand(…)) drawTheUsualPart();
 * — a fence board, a window bar, a wheel hub, a reed is drawn only when no object stands in for it.
 * A thing must take the same random numbers whether an object is there or not (work them out first).
 */
(() => {
  const H = typeof HID !== 'undefined' ? HID : require('./engine.js');
  const W = H.W, HH = H.H, PI = Math.PI, TAU = 2 * PI, UP = -PI / 2;
  const T = { t: 1 }, N = { t: 1, f: 'none' };
  const box = (g, x0, y0, x1, y1, o) => g.b([[x0, y0, 1], [x1, y0, 1], [x1, y1, 1], [x0, y1, 1]], o);
  function shuffle(g, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = g.ri(0, i); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ================= small marks ================= */
  const tuft = (g, x, y, s = 1) => g.l([[x - 2.2 * s, y, 1], [x - 2.7 * s, y - 3.4 * s, 1], [x - 1 * s, y - 0.6 * s, 1], [x - 0.2 * s, y - 4.6 * s, 1], [x + 0.9 * s, y - 0.6 * s, 1], [x + 2.5 * s, y - 3.2 * s, 1], [x + 2.2 * s, y, 1]], T);
  /** A little arc that stands for a bunch of leaves (or a curl of wool). */
  const leafMark = (g, x, y, s = 1, rot = 0) => g.at(x, y, s, rot).l([[-2.6, 0.7], [-1.1, -1.1], [1.2, -1], [2.7, 0.9]], T);
  const eye = (g, x, y, r = 0.55) => g.d(x, y, r);
  /** A small leaf growing from (x, y) towards angle a. */
  const leaf = (g, x, y, a, s = 1) => { const q = g.at(x, y, s, a); q.b([[0, 0, 1], [2.6, -1.6], [5.4, 0, 1], [2.6, 1.6]], T); q.l([[0.6, 0], [4.4, 0]], T); };
  /** Grass that covers the foot of what stands behind it. */
  function sod(g, x, y, s = 1) {
    const z = [[-4.2, 1.2], [-4.6, -2.8], [-2.8, -0.4], [-1.7, -4.2], [-0.5, -0.6], [0.6, -4.6], [1.6, -0.4], [3.2, -3.2], [4.2, 1.2]].map(p => [x + p[0] * s, y + p[1] * s, 1]);
    g.b(z, { s: 'none', own: false }); g.l(z, T);
  }
  /** A little heap of sand or dust that covers the foot of what stands behind it. */
  function mound(g, x, y, s = 1) {
    const z = [[-5, 1.2], [-2.6, -1.2], [1.6, -1.5], [5, 1.2]].map(p => [x + p[0] * s, y + p[1] * s]);
    g.b([[...z[0], 1], z[1], z[2], [...z[3], 1]], { s: 'none', own: false }); g.l(z, T);
  }
  /** A twig lying about (it looks a little like a pencil or a ruler…). */
  const twig = (g, x, y, s) => { const q = g.at(x, y, s, g.r(-0.5, 0.5)); q.b([[-3.6, -0.5, 1], [3.4, -0.4, 1], [3.7, 0.3, 1], [-3.5, 0.5, 1]], { t: 1, own: false }); q.l([[0.6, -0.4], [2, -1.8]], T); };
  /** What lies on a meadow: mostly grass, some pebbles, twigs and tiny flowers. */
  const meadow = (g, x, y, s) => {
    const k = g.r(0, 1);
    if (k < 0.66) tuft(g, x, y, s); else if (k < 0.8) pebble(g, x, y, s * 1.2); else if (k < 0.91) twig(g, x, y, s);
    else { g.l([[x, y], [x + 0.4 * s, y - 3 * s]], T); g.e(x + 0.4 * s, y - 3.8 * s, 1.1 * s, 1.1 * s, { n: 6, t: 1, own: false }); }
  };
  /** Lines of grain drawn over a long object that stands in for a board, a rail, a pole. */
  const grain = (q, f, sl) => {
    const ux = Math.cos(sl.ang), uy = Math.sin(sl.ang), L = f.r * 0.5;
    for (const d of [-0.5, 0.45]) { const x = f.x - uy * d * sl.sc + ux * q.r(-0.3, 0.3) * L, y = f.y + ux * d * sl.sc + uy * q.r(-0.3, 0.3) * L; q.l([[x - ux * L * 0.5, y - uy * L * 0.5], [x + ux * L * 0.5, y + uy * L * 0.5]], T); }
  };
  const pebble = (g, x, y, s) => g.e(x, y, g.r(0.8, 1.7) * s, g.r(0.5, 0.9) * s, { n: 6, t: 1, own: false });
  const ripple = (g, x, y, s) => g.l([[x - 4 * s, y], [x - 2 * s, y - 0.9 * s], [x, y], [x + 2 * s, y + 0.9 * s], [x + 4 * s, y]], T);
  const sandMark = (g, x, y, s) => (g.chance(0.5) ? g.l([[x - 2.6 * s, y], [x - 0.8 * s, y - 0.8 * s], [x + 1 * s, y], [x + 2.6 * s, y - 0.5 * s]], T) : g.d(x, y, 0.22));
  const craterMark = (g, x, y, s) => { const w = g.r(2, 4.5) * s; g.e(x, y, w, w * 0.34, { n: 8, t: 1, own: false }); g.l([[x - w * 0.7, y - w * 0.05], [x, y + w * 0.16], [x + w * 0.7, y - w * 0.05]], T); };

  /* What is drawn right after a hidden object that stands in for a part of a thing (q = the object's pen,
     f = where the object is, sl = the place: sl.sc = the size of the thing there). */
  const footOf = sl => [sl.x - Math.cos(sl.ang) * sl.hw, sl.y - Math.sin(sl.ang) * sl.hw];
  const inGrass = (q, f, sl) => { const [x, y] = footOf(sl); sod(q, x + q.r(-1, 1) * sl.sc, y + 0.6 * sl.sc, sl.sc * q.r(0.9, 1.15)); };
  const inSand = (q, f, sl) => { const [x, y] = footOf(sl); mound(q, x, y + 0.4 * sl.sc, sl.sc); };
  const asPlant = (q, f, sl) => { const [x, y] = footOf(sl); leaf(q, x, y - 0.5 * sl.sc, UP - 0.9, sl.sc * 1.5); leaf(q, x, y - 0.5 * sl.sc, UP + 0.9, sl.sc * 1.4); inGrass(q, f, sl); };
  const asBranch = (q, f, sl) => { for (const [k, da] of [[0.25, -1], [0.6, 1], [0.85, -0.8]]) leaf(q, f.x + Math.cos(sl.ang) * (k - 0.5) * 1.2 * f.r, f.y + Math.sin(sl.ang) * (k - 0.5) * 1.2 * f.r, sl.ang + da, sl.sc * 1.2); };
  const asFruit = (q, f, sl) => { const [x, y] = footOf(sl); q.l([[x + 0.6 * sl.sc, y - 4 * sl.sc], [x + 0.3 * sl.sc, y - 1.5 * sl.sc], [x, y + 0.8 * sl.sc]]); leaf(q, x + 0.5 * sl.sc, y - 2.4 * sl.sc, -0.4, sl.sc * 1.2); };
  const onPeg = (q, f, sl) => { const [x, y] = footOf(sl), s = sl.sc; box(q, x - 0.7 * s, y - 1.8 * s, x + 0.7 * s, y + 1.6 * s, { t: 1 }); };
  /** Short bars from a window frame to the object in it. */
  const inWindow = (q, f, sl) => {
    q.l([[sl.x - sl.hh, f.y], [f.x - f.w2 * 0.9, f.y]], T); q.l([[sl.x + sl.hh, f.y], [f.x + f.w2 * 0.9, f.y]], T);
    q.l([[f.x, sl.y - sl.hw], [f.x, f.y - f.h2 * 0.9]], T); q.l([[f.x, sl.y + sl.hw], [f.x, f.y + f.h2 * 0.9]], T);
  };
  /** Sand over the lower part of an object lying on the sea bed (or dust on the Moon). */
  const buried = (q, f) => {
    const y = f.y + f.r * 0.45, a = f.x - f.r * 0.95, b = f.x + f.r * 0.95, z = [[a, y], [f.x - f.r * 0.4, y - 1], [f.x + f.r * 0.3, y + 0.6], [b, y - 0.4]];
    q.b([[a, y, 1], z[1], z[2], [b, y - 0.4, 1], [b, f.y + f.r, 1], [a, f.y + f.r, 1]], { s: 'none', own: false }); q.l(z, T);
    q.d(f.x - f.r * 0.3, y + 1.6, 0.22); q.d(f.x + f.r * 0.4, y + 2.4, 0.22);
  };
  /** A window w × h around (x, y): its cross bars, or a hidden object held by four short bars. */
  function windowAt(g, x, y, w, h) {
    box(g, x - w / 2, y - h / 2, x + w / 2, y + h / 2);
    if (g.slot(x, y, h / 2 - 0.7, w / 2 - 0.7, UP, { up: true, p: 1.7, fill: 0.3, after: inWindow })) return;
    g.l([[x, y - h / 2], [x, y + h / 2]], T); g.l([[x - w / 2, y], [x + w / 2, y]], T);
  }

  /* ================= sky, hills, ground ================= */
  function cloud(g) {
    const w = g.r(15, 22), h = g.r(6, 8), n = g.ri(4, 5), list = [[0, 0.5, w * 0.78, h * 0.6]];
    for (let i = 0; i < n; i++) { const x = -w * 0.68 + i * 1.36 * w / (n - 1), q = 1 - Math.abs(x / w) * 0.55; list.push([x + g.r(-1, 1), -h * 0.3 * q + g.r(-0.8, 0.8), w * 0.36 * q * g.r(0.9, 1.15), h * 0.78 * q * g.r(0.9, 1.1)]); }
    g.clump(list);
    g.slot(0, -0.5, w * 0.6, h * 0.62, 0, { p: 0.3 });
    g.l([[-w * 0.4, h * 0.2], [-w * 0.12, h * 0.42], [w * 0.15, h * 0.25]], T);
  }
  function sun(g) {
    const r = 9.5, n = 12, a0 = g.r(0, TAU), face = g.chance(0.6);
    for (let i = 0; i < n; i++) {
      const a = a0 + i / n * TAU, q = i % 2 ? 4.5 : 7.5;
      if (i % 3 === 0 && g.stand(Math.cos(a) * (r + 2.2), Math.sin(a) * (r + 2.2), 18, 5, a, { p: 1.2, cap: 1 })) continue;      // a ray
      g.l([[Math.cos(a) * (r + 2.4), Math.sin(a) * (r + 2.4)], [Math.cos(a) * (r + q), Math.sin(a) * (r + q)]]);
    }
    g.e(0, 0, r, r, { n: 12 });
    if (face) { eye(g, -3, -1.6, 0.7); eye(g, 3, -1.6, 0.7); g.l([[-3.6, 2.4], [0, 4.6], [3.6, 2.4]], T); }
  }
  const farBird = (g, x, y, s) => g.l([[x - 3.2 * s, y - 0.6 * s], [x - 1.5 * s, y - 2.2 * s], [x, y], [x + 1.5 * s, y - 2.2 * s], [x + 3.2 * s, y - 0.6 * s]], T);
  function sky(g, hz) {
    sun(g.thing().at(g.chance(0.5) ? g.r(16, 52) : g.r(W - 52, W - 16), g.r(14, 24), g.r(0.9, 1.15)));
    for (let x = g.r(-12, 20); x < W + 6; x += g.r(36, 56)) { const s = g.r(0.75, 1.15); cloud(g.thing().at(x + 18 * s, g.r(11, hz * 0.52), s)); }
    for (let i = g.ri(4, 7); i > 0; i--) farBird(g, g.r(12, W - 12), g.r(8, hz * 0.7), g.r(0.6, 1));
  }
  /** Two far ridges behind the horizon; deco = 'trees' (a row of tiny trees), 'fields' (furrows), 'rocks'. */
  function hills(g, hz, deco) {
    for (let k = 0; k < 2; k++) {
      g.thing();
      const amp = k ? g.r(5, 9) : g.r(12, 19), ph = g.r(0, TAU), wl = g.r(80, 130), lump = deco === 'rocks' ? g.r(2, 4) : 0, lp = g.r(0, TAU);
      const ridge = x => hz + 2 - amp * (0.55 + 0.45 * Math.sin(x / wl * TAU + ph)) - lump * Math.abs(Math.sin(x / 9 + lp));
      if (!k && deco === 'trees') for (let x = g.r(0, 6); x < W; x += g.r(5, 9)) {
        const y = ridge(x) + 1, s = g.r(0.8, 1.3);
        if (g.chance(0.6)) g.b([[x - 2.2 * s, y, 1], [x, y - 7 * s, 1], [x + 2.2 * s, y, 1]], { j: 0.12 }); else g.e(x, y - 3 * s, 2.6 * s, 3.2 * s, { n: 7 });
      }
      const pts = [[-6, hz + 8, 1]];
      for (let x = -6; x <= W + 6; x += deco === 'rocks' ? 5 : 12) pts.push([x, ridge(x)]);
      pts.push([W + 6, hz + 8, 1]);
      g.b(pts);
      if (deco === 'fields') for (let d = 3.5; d < amp; d += 3.2) { const p = []; for (let x = -6; x <= W + 6; x += 12) p.push([x + d * (k ? 1.5 : -1.5), ridge(x) + d]); g.l(p, T); }
      else if (deco === 'rocks') for (let i = 0; i < 6; i++) { const x = g.r(8, W - 8), y = ridge(x); g.l([[x, y + 1], [x + g.r(-2, 2), y + 4], [x + g.r(-3, 3), y + 7]], T); }
      else if (k) for (let i = 0; i < 5; i++) { const x = g.r(8, W - 8); tuft(g, x, ridge(x) + g.r(3, 6), 0.45); }
    }
  }

  /** The ground from the horizon `hz` down and the things standing on it; far = their size at the horizon. */
  function land(g, hz, far = 0.3) {
    const depth = y => (y - hz) / (HH - hz), size = y => far + (1 - far) * depth(y), items = [];
    const cut = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
    const area = a => (a[2] - a[0]) * (a[3] - a[1]);
    function ok(p, c) {
      if (cut(p.box, c.box) / Math.min(area(p.box), area(c.box)) > 0.3) return false;
      const [near, back] = c.y > p.y ? [c, p] : [p, c];
      return !(back.keep && cut(back.box, near.cover || near.box) > 0.04 * area(back.box));
    }
    const L = {
      hz, depth, size, items,
      blocked: () => false,      // (x, y, half width) → the spot lies on the path or in the water
      /** The ground itself (its own thing) with n marks (grass tufts) and places for objects lying on it;
       *  `after` is drawn over such an object (grass in front of it, sand over its lower part). */
      ground(marks = meadow, n = 230, after = (q, f) => { for (const dx of [-0.55, 0.1, 0.7]) tuft(q, f.x + dx * f.r + q.r(-1, 1), f.y + f.r * q.r(0.35, 0.6), q.r(0.9, 1.2)); }) {
        g.thing();
        const pts = [[-6, HH + 6, 1], [-6, hz + 2, 1]], ph = g.r(0, TAU);
        for (let x = 6; x < W; x += 14) pts.push([x, hz + 1.5 * Math.sin(x / 40 + ph)]);
        pts.push([W + 6, hz + 2, 1], [W + 6, HH + 6, 1]);
        g.b(pts);
        for (let i = 0; i < 26; i++) { const y = hz + 10 + g.r(0, 1) * (HH - hz - 14), r = 3 + 9 * size(y); g.slot(g.r(8, W - 8), y, r, r, null, { after, p: 0.55, cap: 99 }); }
        for (let i = 0; i < n; i++) { const y = hz + 4 + g.r(0, 1) ** 0.8 * (HH - hz - 5); marks(g, g.r(2, W - 2), y, size(y) * g.r(0.7, 1.1)); }
      },
      /** n things on the ground. o.t = [from, to]: how near (0 = horizon, 1 = bottom edge); o.w, o.h = half
       *  width and height at size 1; o.x = [from, to] part of the picture width; o.k = extra size;
       *  o.keep = nothing may stand in front of it; o.cw, o.ch = half width and lower edge of a tree crown. */
      put(fn, n, o) {
        const [t0, t1] = o.t, [x0, x1] = o.x || [0.02, 0.98];
        for (let i = 0; i < n; i++) for (let tr = 0; tr < 40; tr++) {
          const y = hz + g.r(t0, t1) * (HH - hz), s = size(y) * (o.k || 1), x = g.r(x0, x1) * W;
          const c = { x, y, s, fn, flip: o.flip === false ? false : g.chance(0.5), keep: o.keep, box: [x - o.w * s, y - o.h * s, x + o.w * s, y] };
          if (o.cw) c.cover = [x - o.cw * s, y - o.h * s, x + o.cw * s, y - o.ch * s];
          if (L.blocked(x, y, o.w * s) || !items.every(p => ok(p, c))) continue;
          items.push(c); break;
        }
      },
      draw() { items.sort((a, b) => a.y - b.y); for (const it of items) it.fn(g.thing(it.keep).at(it.x, it.y, it.s, 0, it.flip)); },
    };
    return L;
  }
  /** A path or a stream from the bottom edge to the horizon, getting narrower; `inside(g, x, y, s)` draws
   *  one of the n marks on it. */
  function way(g, L, wide, inside, n) {
    g.thing();
    const x1 = g.r(0.25, 0.75) * W, x0 = g.r(0.2, 0.8) * W, A = g.r(8, 20), ph = g.r(0, TAU), hz = L.hz;
    const mid = t => x1 + (x0 - x1) * t + A * Math.sin(t * 4.2 + ph) * Math.sqrt(t), half = t => (0.22 + 0.78 * t) * wide;
    const left = [], right = [];
    for (let t = 0; t <= 1.12; t += 0.1) { const y = hz + 1.5 + t * (HH - hz); left.push([mid(t) - half(t), y]); right.push([mid(t) + half(t), y]); }
    left[0].push(1); right[0].push(1); left[left.length - 1].push(1); right[right.length - 1].push(1);
    g.b([...left, ...right.reverse()]);
    for (let i = 0; i < n; i++) { const t = g.r(0.04, 1) ** 0.8, y = hz + 1.5 + t * (HH - hz); inside(g, mid(t) + g.r(-0.75, 0.75) * half(t), y, L.size(y)); }
    L.blocked = (x, y, hw) => { const t = L.depth(y); return Math.abs(x - mid(t)) < half(t) + hw * 0.85 + 1; };
  }
  /** A pond in the middle distance with reeds; `swimmer` draws who swims on it. */
  function pond(g, L, swimmer) {
    g.thing();
    const t = g.r(0.3, 0.55), y = L.hz + t * (HH - L.hz), s = L.size(y), x = g.r(0.25, 0.75) * W, rx = g.r(30, 42) * s, ry = g.r(8, 11) * s;
    g.e(x, y, rx, ry, { n: 12 });
    for (const p of g.spots(x, y, rx * 0.8, ry * 0.7, 9, 7 * s)) ripple(g, p[0], p[1], s * 0.8);
    for (let i = 0; i < 3; i++) { const a = g.r(0, TAU), px = x + Math.cos(a) * rx * 0.55, py = y + Math.sin(a) * ry * 0.5; g.e(px, py, 3.4 * s, 1.5 * s, { n: 8, t: 1, own: false }); g.l([[px, py], [px + 2.6 * s, py - 1 * s]], T); }
    if (swimmer) swimmer(g.at(x + g.r(-0.3, 0.3) * rx, y + ry * 0.1, s * 1.5, 0, g.chance(0.5)));
    blades(g.at(x - rx * g.r(0.5, 0.8), y - ry * 0.55, s * 0.8)); blades(g.at(x + rx * g.r(0.6, 0.9), y + ry * 0.3, s * 0.9));
    L.blocked = (px, py, hw) => ((px - x) / (rx + hw + 2)) ** 2 + ((py - y) / (ry + 4)) ** 2 < 1;
  }
  /** Things floating in the water or in space: they keep apart from one another. */
  function afloat(g) {
    const items = [];
    return {
      block: [],     // boxes [x0, y0, x1, y1] nothing may float into
      /** o.x, o.y, o.s = ranges of the middle and the size; o.w, o.h = half sizes at size 1; o.rot = most it may be turned. */
      put(fn, n, o) {
        for (let i = 0; i < n; i++) for (let tr = 0; tr < 40; tr++) {
          const s = g.r(o.s[0], o.s[1]), x = g.r(o.x[0], o.x[1]), y = g.r(o.y[0], o.y[1]), b = [x - o.w * s - 2, y - o.h * s - 2, x + o.w * s + 2, y + o.h * s + 2];
          const it = { fn, x, y, s, b, flip: g.chance(0.5), keep: o.keep, rot: o.rot ? g.r(-o.rot, o.rot) : 0 };
          if ([...items.map(p => p.b), ...this.block].some(p => p[0] < b[2] && b[0] < p[2] && p[1] < b[3] && b[1] < p[3])) continue;
          items.push(it); break;
        }
      },
      draw() { for (const it of items) it.fn(g.thing(it.keep).at(it.x, it.y, it.s, it.rot, it.flip)); },
    };
  }

  /* ================= plants ================= */
  function oak(g, apples) {
    const tw = g.r(4.5, 6.5), th = g.r(34, 46), lean = g.r(-4, 4), cr = g.r(22, 27), side = g.chance(0.5) ? 1 : -1;
    const by = -th * g.r(0.42, 0.6), ba = UP + side * g.r(0.75, 1.1), hy = -th * g.r(0.3, 0.42), hx = g.r(-1, 1);
    const cx = lean * 1.5, cy = -th - cr * 0.62, rx = cr * g.r(1.05, 1.22), ry = cr * g.r(0.86, 1);
    const blobs = [[cx, cy, rx * 0.82, ry * 0.82]], n = g.ri(7, 9), a0 = g.r(0, TAU);
    for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU + g.r(-0.15, 0.15), q = cr * g.r(0.34, 0.46); blobs.push([cx + Math.cos(a) * rx * 0.72, cy + Math.sin(a) * ry * 0.7, q, q * g.r(0.85, 1)]); }
    const marks = g.spots(cx, cy, rx * 0.98, ry * 0.95, 75, 4.2).map(p => [p[0], p[1], g.r(0.85, 1.25), g.r(-0.8, 0.8)]);
    const places = g.spots(cx, cy, rx * 0.6, ry * 0.58, 5, 15), fruit = [-1, 1].map(k => [cx + k * rx * g.r(0.5, 0.85), cy + ry * g.r(0.72, 0.85)]);
    const bark = []; for (let i = g.ri(10, 13); i > 0; i--) bark.push([g.r(-0.55, 0.55) * tw, g.r(-th + 5, -8), g.r(4, 9), g.r(-0.8, 0.8), g.r(-0.5, 0.5)]);
    const small = apples ? g.spots(cx, cy, rx * 0.85, ry * 0.8, 7, 9) : [];
    g.b([[-tw - 4, 1, 1], [-tw - 0.6, -6], [lean - tw * 0.8, -th, 1], [lean + tw * 0.8, -th, 1], [tw + 0.6, -6], [tw + 4, 1, 1]]);
    g.slot(lean * 0.45, -th * 0.62, th * 0.26, tw * 0.6, UP);                               // lying along the trunk, under the bark lines
    if (!g.slot(hx, hy, 4.5, 4.5, null, { want: 'round', p: 1.7 })) { g.e(hx, hy, 1.9, 2.7, { n: 7, t: 1 }); g.l([[hx - 0.4, hy - 0.8], [hx + 0.3, hy + 0.9]], T); }   // the hollow
    for (const [x, y, len, d1, d2] of bark) g.l([[x, y], [x + d1, y - len / 2], [x + d2, y - len]], T);
    tuft(g, -tw - 2, 1.4); tuft(g, tw + 2.4, 1.6, 0.9);
    g.clump(blobs);
    for (const p of places) g.slot(p[0], p[1], 11, 11);                                     // among the leaves
    for (const m of marks) leafMark(g, ...m);
    for (const p of small) g.e(p[0], p[1], 1.7, 1.7, { n: 7, t: 1 });
    g.stand(side * tw * 0.6, by, 22, 5.6, ba, { after: asBranch });                          // a branch
    for (const p of fruit) g.stand(p[0], p[1], 15, 12, PI / 2, { up: true, after: asFruit });  // a fruit
  }
  /** Two rails and rungs from the ground at x0 up to (x1, -ht); a rail may be a long object. */
  function ladder(g, x0, x1, ht) {
    const a = Math.atan2(-ht - 0.6, x1 - x0), len = Math.hypot(ht + 0.6, x1 - x0), ux = Math.cos(a), uy = Math.sin(a);
    for (let d = 4; d < len - 2; d += 4.4) g.l([[x0 + ux * d, 0.6 + uy * d], [x0 + 5.4 + ux * d, 0.6 + uy * d]]);
    for (const dx of [0, 5.4]) if (!g.stand(x0 + dx, 0.6, len, 3.2, a, { p: 1.7, after: (q, f, sl) => { grain(q, f, sl); inGrass(q, f, sl); } })) g.b([[x0 + dx - 0.8, 0.6, 1], [x1 + dx - 0.8, -ht, 1], [x1 + dx + 0.8, -ht, 1], [x0 + dx + 0.8, 0.6, 1]]);
  }
  const appleTree = g => { oak(g, true); ladder(g, 15, 5, 19); };
  function spruce(g) {
    const n = g.ri(4, 5), h = g.r(72, 90), w = g.r(19, 24), dy = (h - 8) / n;
    g.b([[-3, 1, 1], [-2.3, -10, 1], [2.3, -10, 1], [3, 1, 1]]);
    g.l([[-0.6, -1.5], [-0.3, -6]], T); g.l([[1, -3], [0.9, -7.5]], T);
    tuft(g, -4, 1.5, 0.8); tuft(g, 4, 1.4, 0.8);
    for (let i = 0; i < n; i++) {
      const y0 = -8 - i * dy * 0.86, hw = w * (1 - i / n * 0.7), top = Math.max(-h, y0 - dy * 1.55), m = 2 * Math.round(hw / 4.5) + 1;
      const pts = [[0, top, 1], [hw * 0.5, (top + y0) / 2 + 2.5], [hw, y0, 1]];
      for (let j = 1; j < m; j++) pts.push([hw - j * 2 * hw / m, y0 + (j % 2 ? -2.8 : 1.3) + g.r(-0.5, 0.5), 1]);
      pts.push([-hw, y0, 1], [-hw * 0.5, (top + y0) / 2 + 2.5]);
      g.b(pts);
      if (!i) g.slot(0, y0 - dy * 0.4, hw * 0.62, dy * 0.3, 0);
      for (const p of g.spots(0, y0 - dy * 0.42, hw * 0.6, dy * 0.3, 7, 3.6)) g.l([[p[0] - 1.6, p[1] - 1.5], [p[0], p[1] + 0.6], [p[0] + 1.6, p[1] - 1.5]], T);
    }
  }
  function bush(g) {
    const w = g.r(13, 19), h = g.r(11, 15), berries = g.chance(0.4);
    g.clump([[-w * 0.52, -h * 0.4, w * 0.5, h * 0.44], [w * 0.52, -h * 0.38, w * 0.5, h * 0.42], [-w * 0.2, -h * 0.66, w * 0.42, h * 0.4], [w * 0.24, -h * 0.62, w * 0.4, h * 0.42], [0, -h * 0.4, w * 0.6, h * 0.42]]);
    g.slot(0, -h * 0.55, w * 0.56, h * 0.42, 0);
    for (const p of g.spots(0, -h * 0.5, w * 0.9, h * 0.44, 22, 3.4)) leafMark(g, p[0], p[1], 0.8, g.r(-0.8, 0.8));
    if (berries) for (const p of g.spots(0, -h * 0.5, w * 0.8, h * 0.4, 6, 5)) g.e(p[0], p[1], 0.9, 0.9, { n: 5, t: 1 });
    for (let x = -w; x <= w; x += 5.5) tuft(g, x + g.r(-1, 1), 1.2, g.r(0.8, 1.1));
  }
  /** A rock; `deco` draws what grows at its foot, `after` what covers the foot of an object standing beside it. */
  function rock(g, deco = tuft, after = inGrass) {
    const w = g.r(7, 12), h = g.r(5, 8.5);
    g.b([[-w, 0.8, 1], [-w * 0.9, -h * 0.6], [-w * 0.35, -h], [w * 0.4, -h * 0.9], [w * 0.95, -h * 0.45], [w, 0.8, 1]]);
    g.slot(w * 0.28, -h * 0.34, w * 0.5, h * 0.3, 0);
    g.l([[-w * 0.35, -h], [-w * 0.2, -h * 0.5], [-w * 0.42, -h * 0.15]], T); g.l([[w * 0.4, -h * 0.9], [w * 0.3, -h * 0.5]], T);
    if (deco) { deco(g, -w, 1.2, 0.8); deco(g, w * 0.9, 1.3, 0.9); }
    g.stand(-w - 8, 1.4, 14, 16, UP, { up: true, after });       // one more "stone" beside it
  }
  const moonRock = g => rock(g, null, inSand), seaRock = g => rock(g, (q, x, y, s) => sandMark(q, x, y + 1, s), inSand);
  function stump(g) {
    const w = g.r(6, 8.5), h = g.r(7, 10);
    g.b([[-w - 3.4, 1, 1], [-w - 0.6, -2.6], [-w, -h, 1], [w, -h, 1], [w + 0.6, -2.6], [w + 3.4, 1, 1]]);
    for (const x of [-w * 0.5, w * 0.1, w * 0.6]) g.l([[x, -h * 0.25], [x + g.r(-0.5, 0.5), -h * 0.7]], T);
    g.e(0, -h, w, w * 0.36, { n: 10 }); g.e(0, -h, w * 0.6, w * 0.2, N); g.e(0, -h, w * 0.24, w * 0.08, { n: 6, t: 1, f: 'none' });
    tuft(g, -w - 2, 1.4, 0.9); tuft(g, w + 2, 1.4, 0.9);
  }
  function log(g) {
    const L = g.r(22, 30), R = g.r(4, 5.5);
    g.b([[L / 2, -2 * R, 1], [-L / 2, -2 * R], [-L / 2 - R * 0.55, -R], [-L / 2, 0], [L / 2, 0, 1]]);
    g.slot(L * 0.05, -R, L * 0.3, R * 0.64, 0);
    g.e(L / 2, -R, R * 0.5, R, { n: 9 }); g.e(L / 2, -R, R * 0.26, R * 0.55, N);
    for (let i = 0; i < 4; i++) { const x = g.r(-L * 0.42, L * 0.3), y = -R * g.r(0.4, 1.6); g.l([[x, y], [x + g.r(3, 6), y + g.r(-0.4, 0.4)]], T); }
    g.b([[-L * 0.2, -2 * R + 0.3, 1], [-L * 0.24, -2 * R - 3.4, 1], [-L * 0.13, -2 * R - 3.8, 1], [-L * 0.08, -2 * R + 0.3, 1]]);
    tuft(g, -L / 2 - 1, 1, 0.9); tuft(g, L * 0.2, 1.2, 0.9);
  }
  function toadstools(g) {
    for (let i = g.ri(1, 3), x = 0; i > 0; i--, x += g.r(5, 7)) {
      const s = g.r(0.7, 1.2), q = g.at(x, 0, s);
      q.b([[-1.4, -4, 1], [-1.9, 0], [0, 0.8], [1.9, 0], [1.4, -4, 1]]);
      q.b([[-5, -3.7, 1], [-4.2, -7], [0, -9], [4.2, -7], [5, -3.7, 1], [0, -3]]);
      q.e(-1.8, -6, 0.8, 0.7, { n: 5, t: 1 }); q.e(1.6, -6.9, 0.7, 0.6, { n: 5, t: 1 }); q.e(2.4, -5, 0.6, 0.5, { n: 5, t: 1 });
    }
    tuft(g, -3, 1, 0.8);
    g.stand(-9, 1, 16, 15, UP, { up: true, after: inGrass });       // one more "mushroom"
  }
  function flower(g) {
    const h = g.r(8, 13), kind = g.ri(0, 2), bend = g.r(-2, 2), sx = g.pick([-7, 7]), sa = UP + g.r(-0.12, 0.12);
    g.l([[0, 0.6], [bend * 0.5, -h * 0.5], [bend, -h]]);
    g.b([[bend * 0.2, -h * 0.25, 1], [-3, -h * 0.45], [-4.6, -h * 0.75, 1], [-1.6, -h * 0.5]], T);
    g.b([[bend * 0.3, -h * 0.35, 1], [3, -h * 0.5], [4.4, -h * 0.85, 1], [1.5, -h * 0.6]], T);
    if (kind === 0) { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.e(bend + Math.cos(a) * 2.7, -h - 2 + Math.sin(a) * 2.7, 1.6, 1.6, { n: 6 }); } g.e(bend, -h - 2, 1.5, 1.5, { n: 6 }); }
    else if (kind === 1) g.b([[bend - 2.6, -h - 4.6, 1], [bend - 2.8, -h - 1], [bend, -h + 0.6], [bend + 2.8, -h - 1], [bend + 2.6, -h - 4.6, 1], [bend + 1.3, -h - 2.8, 1], [bend, -h - 5, 1], [bend - 1.3, -h - 2.8, 1]]);
    else { const p = []; for (let i = 0; i < 10; i++) { const a = i * PI / 5; p.push([bend + Math.cos(a) * (i % 2 ? 2 : 4.2), -h - 2 + Math.sin(a) * (i % 2 ? 2 : 4.2), 1]); } g.b(p, { j: 0.1 }); g.e(bend, -h - 2, 1.2, 1.2, { n: 6, t: 1 }); }
    g.stand(sx, 0.6, 21, 6, sa, { after: asPlant });               // one more "flower" beside it
  }
  /** Long leaves or reeds growing from one spot; one of them may be a long object. */
  function blades(g, after = inGrass) {
    const n = g.ri(4, 6), free = g.ri(0, n - 1);
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * 0.36 + g.r(-0.12, 0.12), len = g.r(13, 22), tx = Math.sin(a) * len, ty = -Math.cos(a) * len, bx = g.r(-2, 2);
      if (i === free && g.stand(bx, 0.4, 22, 5.2, UP + a, { after })) continue;
      g.b([[bx - 1.3, 0.6, 1], [bx + tx * 0.45 - 1.6, ty * 0.55], [bx + tx, ty, 1], [bx + tx * 0.5 + 1.6, ty * 0.45], [bx + 1.3, 0.6, 1]]);
      g.l([[bx, 0], [bx + tx * 0.5, ty * 0.5], [bx + tx * 0.92, ty * 0.92]], T);
    }
  }
  function sunflower(g) {
    const bend = g.r(-3, 3), h = g.r(30, 38), cx = bend, cy = -h - 5;
    g.tube([{ p: [[0, 0.6], [bend * 0.4, -h * 0.5], [bend, -h]], w: 1.5 }]);
    leaf(g, bend * 0.2, -h * 0.35, UP - 1.1, 1.9); leaf(g, bend * 0.3, -h * 0.55, UP + 1, 1.8);
    for (let i = 0; i < 13; i++) g.at(cx, cy, 1, i / 13 * TAU).b([[4.6, 0, 1], [7.4, -1.6], [10.6, 0, 1], [7.4, 1.6]]);
    if (!g.slot(cx, cy, 5.6, 5.6, null, { free: true, want: 'round', p: 1.7 })) {      // the middle of the flower
      g.e(cx, cy, 5.6, 5.6, { n: 12 });
      for (const d of [-2.4, 0, 2.4]) { g.l([[cx - 3.8, cy + d - 2.4], [cx + 3.8, cy + d + 2.4]], T); g.l([[cx - 3.8, cy + d + 2.4], [cx + 3.8, cy + d - 2.4]], T); }
    }
    tuft(g, -3, 1.4, 0.9);
  }
  function cabbages(g) {
    const n = g.ri(3, 4), free = g.ri(0, n - 1);
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 13;
      if (i === free && g.stand(x, 0.8, 12, 13, UP, { up: true, after: inGrass })) continue;
      g.e(x - 3.2, -3.2, 3.8, 3.5, { n: 8 }); g.e(x + 3.2, -3.2, 3.8, 3.5, { n: 8 }); g.e(x, -4.2, 3.7, 3.9, { n: 9 });
      g.l([[x, -1], [x, -7]], T); g.l([[x - 5.4, -1.6], [x - 3, -4.6]], T); g.l([[x + 5.4, -1.6], [x + 3, -4.6]], T);
    }
  }

  /** A huge tree in the foreground: only its trunk fits in the picture. Objects hide in the bark as clean
   *  shapes (the bark lines stop at them), a round one may be a knot. */
  function bigTrunk(g) {
    const w = g.r(15, 19), lean = g.r(-9, 9), bark = [], knots = [];
    for (let i = 0; i < 95; i++) bark.push([g.r(-0.86, 0.86), g.r(-176, -5), g.r(4, 10), g.r(-1, 1), g.r(-0.7, 0.7)]);
    for (let i = 0; i < 2; i++) knots.push([g.r(-0.4, 0.4) * w, -g.r(28, 60) - i * 62, g.r(3.6, 4.6)]);
    const mid = y => lean * (-y / 190);
    g.b([[-w - 13, 2, 1], [-w - 3, -9], [-w + mid(-45), -45], [-w + lean, -192, 1], [w + lean, -192, 1], [w + mid(-45), -45], [w + 3, -9], [w + 13, 2, 1]]);
    for (const [x, y, len, d1, d2] of bark) { const px = x * w + mid(y); g.l([[px, y], [px + d1, y - len / 2], [px + d2, y - len]], T); }
    for (const [x, y, r] of knots) if (!g.slot(x + mid(y), y, r + 2.2, r + 2.2, null, { want: 'round', p: 1.8, cap: 3 })) { g.e(x + mid(y), y, r, r * 1.3, { n: 9 }); g.e(x + mid(y), y, r * 0.5, r * 0.7, N); }
    for (let i = 0; i < 6; i++) { const y = -18 - i * 27 + g.r(-5, 5); g.slot(g.r(-0.3, 0.3) * w + mid(y), y, w * 0.56, w * 0.56, null, { p: 1.3, cap: 3 }); }
    g.l([[-w - 8, 1], [-w - 1, -5], [-w + 3, -16]], T); g.l([[w + 8, 1], [w + 1, -5], [w - 3, -16]], T);
    for (const x of [-w - 9, -w * 0.3, w * 0.5, w + 9]) tuft(g, x, 2.2, 1.2);
  }
  /** A spray of big leaves with veins; one of the leaves may be a hidden object. */
  function leafy(g, after = inGrass) {
    const h = g.r(30, 46), bend = g.r(-12, 12), n = Math.floor(h / 9), free = g.ri(1, n - 1), stem = t => [bend * t * t, -h * t];
    g.l([stem(0), stem(0.5), stem(1)]);
    for (let i = 1; i <= n; i++) {
      const [x, y] = stem(i / (n + 0.4)), side = i % 2 ? 1 : -1, L = g.r(12, 16) * (1 - i / n * 0.3), wd = L * 0.24, a = UP + side * g.r(0.8, 1.15) + bend / h * (i / n);
      const q = g.at(x, y, 1, a);
      if (i === free && q.stand(0, 0, 16, 7.5, 0, { p: 1.7 })) continue;
      q.b([[0, 0, 1], [L * 0.3, -wd], [L * 0.7, -wd * 0.8], [L, 0, 1], [L * 0.7, wd * 0.8], [L * 0.3, wd]]);
      q.l([[0.6, 0], [L * 0.92, 0]], T);
      for (const k of [0.3, 0.5, 0.7]) { q.l([[L * k, 0], [L * (k + 0.12), -wd * 0.62]], T); q.l([[L * k, 0], [L * (k + 0.12), wd * 0.62]], T); }
    }
    if (after === inGrass) tuft(g, 0, 1.4, 1.1); else mound(g, 0, 1, 1);
  }

  /* ================= animals (they look to the right; the scene mirrors some) ================= */
  function rabbit(g) {
    g.e(-7.6, -3.6, 2.3, 2.3, { n: 7 });
    g.b([[-7, -1], [-7.6, -7], [-3, -12.6], [2.6, -11.2], [5, -5], [4.4, -0.4], [-2, 0.7]]);
    g.l([[-5.8, -5.6], [-2.6, -7.2], [0.2, -4.2], [-0.8, -0.6]], T);
    g.e(0.8, 0, 3.6, 1.5, { n: 8 });
    g.b([[3.3, -6, 1], [3.1, -1.4], [4.2, 0.5], [5.9, 0], [5.5, -6, 1]]);
    g.e(1.4, -22.4, 1.8, 5.6, { rot: -0.2 }); g.l([[1.5, -25.6], [1.9, -19.8]], T);
    g.e(5.2, -21.8, 1.8, 5.4, { rot: 0.24 }); g.l([[5.7, -24.8], [4.9, -19.4]], T);
    g.e(3.6, -14.4, 4.8, 4.3, { n: 10 });
    eye(g, 5.3, -15.4); g.d(8.2, -13.8, 0.45);
    g.l([[7.3, -12.8], [10.4, -12.2]], T); g.l([[7.4, -13.4], [10.5, -14.2]], T); g.l([[6.4, -12], [7.6, -11.6]], T);
  }
  function fox(g) {
    g.b([[-4.6, -0.6, 1], [-12, -1.4], [-16.4, -8], [-13.4, -15.4], [-10.4, -17.6, 1], [-9.8, -11], [-6.8, -6], [-4, -4.4, 1]]);
    g.l([[-14.4, -13.2], [-12.6, -14], [-11.6, -12.6], [-10, -13.6]], T);
    g.b([[-6, 0.4, 1], [-6.4, -6], [-3, -13], [1.6, -14], [4.4, -9], [4.7, 0.4, 1]]);
    g.l([[-5.4, -4], [-2.6, -5.4], [-0.6, -3], [-1.2, 0]], T);
    g.e(-0.6, 0.2, 3, 1.2, { n: 8 });
    g.b([[1.5, -8, 1], [1.4, -1], [2, 0.6], [4.7, 0.6], [4.5, -8, 1]]); g.l([[3.1, -6], [3.1, 0.3]], T);
    g.b([[-2.8, -17.6, 1], [-2.5, -24.6, 1], [1.4, -20.4, 1]]); g.l([[-1.9, -19.6], [-1.6, -22.6]], T);
    g.b([[2, -20.4, 1], [5.4, -24.8, 1], [6.2, -18.4, 1]]); g.l([[4.9, -22.6], [5.1, -19.8]], T);
    g.b([[-4.6, -15.4, 1], [-2.6, -19.4], [1.8, -20.9], [5.6, -19.3], [7.2, -16.8], [11, -14.4, 1], [7.2, -12.4], [2, -11.4], [-1.8, -12.4]]);
    eye(g, 3.6, -16.8); g.d(10.6, -14.5, 0.65);
    g.l([[-4.4, -15.2], [-1.6, -14.6], [0.6, -12.4]], T); g.l([[7.2, -12.9], [8.8, -13.3]], T);
    g.l([[0.8, -11.2], [0.2, -8.4], [1.4, -6.4]], T);
  }
  function hedgehog(g) {
    const pts = [[-9.4, 0.4, 1]], n = 13;
    for (let i = 0; i <= n; i++) { const a = PI - i / n * PI * 0.84, q = i % 2 ? 1.12 : 0.9; pts.push([Math.cos(a) * 9.4 * q - 0.6, -Math.sin(a) * 8.6 * q, 1]); }
    pts.push([4, 0.6, 1]);
    g.b(pts, { j: 0.15 });
    for (const p of g.spots(-1.4, -4.2, 5.6, 2.8, 6, 3)) g.l([[p[0] - 1, p[1] + 1], [p[0], p[1] - 1.2], [p[0] + 1.1, p[1] + 0.9]], T);
    g.b([[3.6, -6.4, 1], [7.6, -4.9], [11.8, -1.9, 1], [9, 0.2], [3.4, 0.7, 1]]);
    g.e(4.8, -5.4, 1.3, 1.5, { n: 6, t: 1 });
    eye(g, 7.4, -3.4, 0.5); g.d(11.7, -2, 0.7); g.l([[8.6, -0.9], [9.8, -0.7]], T);
    g.e(-4.4, 0.6, 1.9, 0.9, { n: 6 }); g.e(4.6, 0.8, 1.9, 0.9, { n: 6 });
  }
  function squirrel(g) {
    g.b([[-3.6, -0.6, 1], [-9, -3], [-11.4, -10], [-8.4, -17.4], [-3.4, -18], [-2.4, -14.2], [-5.6, -12.6], [-6, -8], [-3, -4.6, 1]]);
    g.l([[-8.6, -6], [-9, -11], [-6.6, -15.2]], T);
    g.b([[-4, 0.4, 1], [-4.4, -5], [-1.6, -10], [2, -10.4], [3.6, -6], [3.4, 0.4, 1]]);
    g.b([[0.4, -14.4, 1], [0.9, -17.8, 1], [3, -15.4, 1]]);
    g.e(2.8, -12.6, 3.5, 3.1, { n: 9 });
    eye(g, 4, -13.2, 0.5); g.d(6.2, -12.2, 0.42);
    g.l([[1.4, -8.6], [3.8, -7.4], [5.2, -8.4]]);
    g.e(6, -8.9, 1.5, 1.8, { n: 7 }); g.l([[4.8, -9.6], [7.2, -9.6]], T);
    g.e(1.4, 0.2, 3.1, 1.2, { n: 8 });
    g.l([[-3, -3.6], [-0.8, -4.6], [0.8, -2.6]], T);
  }
  function snail(g) {
    g.b([[-7.5, 0.4, 1], [-6, -2], [2, -2.4], [5.6, -3.4], [6.6, -6.6], [9.2, -6.4], [9.6, -2.4], [7.4, 0.5, 1]]);
    g.l([[7, -6.6], [6.4, -9.6]]); g.l([[8.6, -6.4], [9.6, -9.2]]); g.d(6.4, -9.9, 0.5); g.d(9.7, -9.5, 0.5);
    eye(g, 8.4, -4.6, 0.35); g.l([[8, -3], [9, -2.8]], T);
    if (g.slot(-0.8, -6, 5.8, 5.8, null, { free: true, want: 'round', p: 1.7 })) return;      // its shell
    g.e(-0.8, -5.6, 5.6, 5.2, { n: 10 });
    const p = [];
    for (let a = 0.4; a < 3.2 * PI; a += 0.55) { const r = 4.3 * (1 - a / (3.6 * PI)); p.push([-0.8 + Math.cos(a) * r, -5.6 + Math.sin(a) * r]); }
    g.l(p, T);
  }
  function owl(g) {
    g.b([[-6, -1], [-7, -9], [-5.8, -15.4, 1], [-3, -13.5], [0, -13.9], [3, -13.5], [5.8, -15.4, 1], [7, -9], [6, -1], [0, 0.8]]);
    g.l([[-6.6, -8], [-4.2, -3.6], [-5.6, -0.8]], T); g.l([[6.6, -8], [4.2, -3.6], [5.6, -0.8]], T);
    g.e(-2.7, -9.6, 2.7, 2.7, { n: 9 }); g.e(2.7, -9.6, 2.7, 2.7, { n: 9 });
    g.d(-2.4, -9.6, 0.95); g.d(2.4, -9.6, 0.95);
    g.b([[-1, -7.4, 1], [1, -7.4, 1], [0, -5.4, 1]], T);
    for (const [x, y] of [[-1.6, -4], [1.6, -4], [0, -2.4]]) g.l([[x - 1, y - 0.6], [x, y + 0.5], [x + 1, y - 0.6]], T);
  }
  const owlOnStump = g => { stump(g); owl(g.at(0, -9.6, 1)); };
  function butterfly(g) {
    const q = g.at(0, 0, 1, g.r(-0.5, 0.5));
    q.e(-3.4, -2, 3.2, 2.6, { n: 8, rot: 0.5 }); q.e(3.4, -2, 3.2, 2.6, { n: 8, rot: -0.5 });
    q.e(-2.6, 2, 2.2, 1.9, { n: 7 }); q.e(2.6, 2, 2.2, 1.9, { n: 7 });
    q.e(-3.6, -2, 1, 0.9, { n: 5, t: 1 }); q.e(3.6, -2, 1, 0.9, { n: 5, t: 1 });
    q.e(0, 0, 0.8, 3.4, { n: 7 });
    q.l([[-0.3, -3.2], [-1.6, -5.6]], T); q.l([[0.3, -3.2], [1.6, -5.6]], T);
  }
  function cow(g) {
    for (const x of [-8.4, 6]) box(g, x, -9, x + 2.5, 0.4);
    g.l([[-13.4, -18.4], [-16, -14], [-15.4, -9]]); g.e(-15.3, -7.6, 1, 1.7, { n: 6 });
    g.e(-4.4, -7.4, 3, 2.3, { n: 8 });
    g.b([[-13.6, -14], [-12.6, -20], [-6, -22], [3, -21.6], [9.6, -20], [11, -14], [9.4, -8.6], [0, -7.4], [-10, -8.4]]);
    g.l([[-9.6, -21], [-7.2, -16.6], [-3, -16.4], [-1.4, -21.6]], T); g.e(2.6, -12.6, 3, 2.3, N); g.l([[-13.2, -13], [-10.4, -11.6], [-9.8, -8.6]], T);
    for (const x of [-11, 7.4]) { box(g, x, -10, x + 2.7, 0.6); g.l([[x, -1.3], [x + 2.7, -1.3]], T); }
    g.e(8, -26.4, 2.5, 1.2, { n: 7, rot: -0.5 }); g.e(18, -26.6, 2.5, 1.2, { n: 7, rot: 0.5 });
    g.b([[10.6, -29, 1], [9.7, -31.8, 1], [11.9, -30, 1]], T); g.b([[15.4, -29.4, 1], [16.5, -32, 1], [14.3, -30.4, 1]], T);
    g.b([[9.4, -22], [9.6, -27.4], [13, -29.6], [16.4, -27.6], [17, -22], [16, -18.4], [13.2, -17.4], [10.4, -18.4]]);
    g.e(13.2, -19.8, 3.7, 2.7, { n: 9 }); g.d(12, -20, 0.4); g.d(14.5, -20, 0.4);
    eye(g, 11.3, -24.6); eye(g, 15.2, -24.6);
  }
  function pig(g) {
    for (const x of [-6.4, 3.4]) box(g, x, -4, x + 2.4, 0.4);
    g.l([[-10.6, -10], [-12.6, -11.4], [-13.2, -9.6], [-11.9, -8.8], [-11.6, -10.6], [-13.6, -12]], T);
    g.e(0, -8.6, 11, 7, { n: 12 });
    for (const x of [-8.6, 5.4]) box(g, x, -4.4, x + 2.6, 0.6);
    g.b([[6.2, -13.4, 1], [5.8, -17.6, 1], [9.4, -15, 1]]); g.b([[11, -15, 1], [13.8, -17.4, 1], [13.6, -13.2, 1]]);
    g.e(10.2, -10.4, 5.2, 5, { n: 10 });
    g.e(13.6, -9.4, 2.6, 2, { n: 8 }); g.d(12.8, -9.4, 0.4); g.d(14.4, -9.4, 0.4);
    eye(g, 8.8, -12.2, 0.5); eye(g, 12, -12.4, 0.5); g.l([[10, -7], [11.6, -6.4], [13.2, -6.9]], T);
  }
  function sheep(g) {
    for (const x of [-6, -2.6, 2.6, 6]) box(g, x - 0.9, -5, x + 0.9, 0.5);
    g.e(-9.8, -10, 1.7, 1.7, { n: 6 });
    g.clump([[0, -10, 9, 6], [-7, -11, 4, 4], [-5, -14.4, 4, 3.6], [0, -15.6, 4.4, 3.6], [5, -14.4, 4, 3.6], [7.4, -10.4, 4, 4.2], [4.4, -6.4, 4, 3.4], [-1, -5.6, 4.4, 3.4], [-6, -7, 4, 3.6]]);
    for (const p of g.spots(-0.5, -10.4, 8, 5, 8, 3.6)) leafMark(g, p[0], p[1], 0.6, g.r(-1.5, 1.5));
    g.e(7.8, -15.2, 2.1, 0.9, { n: 6, rot: -0.5 });
    g.e(10.6, -13, 3.4, 4, { n: 9, rot: 0.3 });
    g.clump([[9.4, -16.4, 2.2, 1.5]]);
    eye(g, 11.4, -13.6, 0.45); g.l([[11.6, -10.8], [12.4, -10.2]], T);
  }
  function hen(g) {
    g.l([[-1.4, -2], [-1.6, 0.6]]); g.l([[1.6, -2], [1.6, 0.6]]); g.l([[-3.2, 0.9], [-1.6, 0.6], [-0.2, 1]], T); g.l([[0, 0.9], [1.6, 0.6], [3, 1]], T);
    for (const a of [-2.5, -2.1, -1.75]) g.at(-5.4, -7.2, 1, a).b([[0, 0, 1], [2.4, -1.5], [6.8, 0, 1], [2.4, 1.5]]);
    g.clump([[2.2, -15, 1, 1.3], [3.6, -15.5, 1, 1.4], [4.9, -14.7, 0.9, 1.2]]);
    g.b([[-6.6, -7], [-5, -3], [0, -1.4], [4.6, -3], [6, -8], [5.4, -12.6], [3, -14.4], [1, -12.4], [-1, -9.4], [-4, -9.2]]);
    g.l([[-3.4, -6.6], [-1, -4], [2.4, -5.4], [1.6, -8]], T);
    g.b([[5.8, -12.4, 1], [8.4, -11.4, 1], [5.8, -10.4, 1]], T); g.e(5.6, -9.1, 0.8, 1.2, { n: 5, t: 1 });
    eye(g, 4.2, -12.2, 0.45);
    for (const x of [10, 15]) { g.e(x, -2.4, 2.4, 2.2, { n: 7 }); g.e(x + 1.8, -4.8, 1.6, 1.5, { n: 6 }); g.b([[x + 3.2, -5.2, 1], [x + 4.6, -4.7, 1], [x + 3.2, -4.2, 1]], T); eye(g, x + 2.2, -5.1, 0.3); g.l([[x, -0.3], [x, 0.8]], T); }
  }
  function duck(g) {
    g.b([[-8, -2], [-7, -6.4], [-2, -5], [3, -5.4], [5, -2.6], [2, 0], [-5, 0.4]]);
    g.b([[2, -5], [2.6, -9.6], [5, -11.6], [7.4, -10], [7, -7], [5, -4.4]]);
    g.b([[7.2, -9.8, 1], [10.4, -8.8, 1], [7.2, -7.6, 1]], T);
    eye(g, 5.6, -9.6, 0.4); g.l([[-5, -4], [-2, -2], [1.6, -3.6]], T);
    g.l([[-10, 1], [-6, 1.6], [0, 1], [6, 1.6], [9, 1]], T);
  }

  /* ================= things people made ================= */
  function barn(g) {
    const w = 22, h = 22, side = g.pick([-1, 1]), A = Math.atan2(-14.2, 6.8);
    box(g, -w, -h, w, 0.6);
    g.slot(side * 15, -h * 0.5, 9, 4.6, UP);                              // lying among the planks
    for (let x = -w + 4; x < w; x += 4) if (Math.abs(x) > 8.5) g.l([[x, -h + 1], [x, -0.5]], T);
    box(g, -7.5, -15, 7.5, 0.6); g.l([[0, -15], [0, 0.4]], T);
    // the braces of the door: two of the four may be long objects
    if (!g.stand(-7.2, -0.4, 15.7, 3.6, A, { p: 1.7, after: grain })) g.l([[-7.2, -0.4], [-0.4, -14.6]], T);
    if (!g.stand(7.2, -0.4, 15.7, 3.6, PI - A, { p: 1.7, after: grain })) g.l([[7.2, -0.4], [0.4, -14.6]], T);
    g.l([[-7.2, -14.6], [-0.4, -0.4]], T); g.l([[7.2, -14.6], [0.4, -0.4]], T);
    g.b([[-w - 3, -h + 1, 1], [-w * 0.72, -h - 13, 1], [0, -h - 21, 1], [w * 0.72, -h - 13, 1], [w + 3, -h + 1, 1]]);
    g.l([[-w - 0.4, -h - 0.8, 1], [-w * 0.65, -h - 11.2, 1], [0, -h - 18.4, 1], [w * 0.65, -h - 11.2, 1], [w + 0.4, -h - 0.8, 1]], T);
    for (let r = 0; r < 4; r++) for (let x = -w * 0.6 + (r % 2) * 2.4; x < w * 0.62; x += 4.8) if (Math.abs(x) > 8.4 || r > 2) g.l([[x - 2, -h - 3.4 - r * 3.6 + 9], [x, -h - 2.4 - r * 3.6 + 9], [x + 2, -h - 3.4 - r * 3.6 + 9]], T);
    windowAt(g, 0, -h - 8, 13, 11.5);                                     // the hayloft window
    g.l([[0, -h - 21], [0, -h - 26.4]]);
    if (!g.stand(-8.5, -h - 26.6, 17, 4.4, 0, { p: 1.7 })) {              // the weather vane
      g.l([[-6.5, -h - 26.6], [6.5, -h - 26.6]]); g.b([[6, -h - 28.4, 1], [9.4, -h - 26.6, 1], [6, -h - 24.8, 1]], T); g.b([[-9, -h - 28.6, 1], [-6, -h - 26.6, 1], [-9, -h - 24.6, 1]], T);
    }
    for (const x of [-w - 1, -11, 12, w + 1]) tuft(g, x, 1.4, 0.9);
  }
  function house(g) {
    const w = 21, h = 19;
    box(g, 8, -h - 17, 12.4, -h - 5); box(g, 7.2, -h - 18.8, 13.2, -h - 17);
    g.l([[10.2, -h - 20], [8.6, -h - 23], [11, -h - 25.4], [9.6, -h - 28.4]], T); g.l([[12, -h - 21], [13.4, -h - 24], [11.8, -h - 27]], T);
    box(g, -w, -h, w, 0.6);
    for (const [x, y] of [[-17, -3], [-13, -16], [16, -4], [5, -16.6], [17, -15], [-4, -16.4]]) { g.l([[x, y], [x + 4, y]], T); g.l([[x + 2, y], [x + 2, y + 2]], T); }
    g.b([[-w - 3.4, -h + 0.6, 1], [0, -h - 15, 1], [w + 3.4, -h + 0.6, 1]]);
    for (let r = 1; r <= 3; r++) for (let x = -r * 5.2 + 2.6; x < r * 5.2; x += 5.2) g.l([[x - 2.2, -h - 15 + r * 4], [x, -h - 13.6 + r * 4], [x + 2.2, -h - 15 + r * 4]], T);
    box(g, 5.6, -14, 14, 0.6); g.e(12.2, -6.4, 0.6, 0.6, { n: 5, t: 1 }); box(g, 7, -12.6, 12.6, -8, N);
    box(g, 4, 0.6, 15.6, 2.4);
    windowAt(g, -8.6, -9, 15, 13);                                        // the big window
    box(g, -17, -1.6, -0.2, -0.2, T);
    for (const x of [-w - 1, -6, w + 1]) tuft(g, x, 1.6, 0.9);
  }
  function windmill(g) {
    const a0 = g.r(0, PI / 2);
    g.b([[-7, 0.6, 1], [-4.5, -30, 1], [4.5, -30, 1], [7, 0.6, 1]]);
    g.b([[-5.6, -30, 1], [0, -36.6], [5.6, -30, 1]]);
    g.b([[-2.2, 0.6, 1], [-2.2, -5], [0, -7], [2.2, -5], [2.2, 0.6, 1]]); box(g, -1.6, -19, 1.6, -15);
    for (let i = 0; i < 4; i++) {
      const q = g.at(0, -31, 1, a0 + i * PI / 2);
      q.l([[0, 0], [19, 0]]);
      if (i < 2 && q.stand(2.4, 1.6, 17, 5.4, 0, { p: 1.6, after: grain })) continue;   // a sail
      q.b([[2.6, 0, 1], [19, 0, 1], [19, 4.2, 1], [2.6, 3, 1]]); q.l([[7, 0.2], [7, 3.4]], T); q.l([[11, 0.2], [11, 3.7]], T); q.l([[15, 0.2], [15, 4]], T);
    }
    g.e(0, -31, 1.4, 1.4, { n: 6 });
    tuft(g, -7.5, 1.4, 0.8); tuft(g, 7.5, 1.4, 0.8);
  }
  /** A fence of posts and boards; any board may be a long object. */
  function fence(g) {
    const n = g.ri(3, 4), bay = 18, x0 = -n * bay / 2;
    for (let i = 0; i < n; i++) for (const y of [-10.4, -5]) {
      const xa = x0 + i * bay + 1.3;
      if (!g.stand(xa, y, bay - 2.6, 3.4, 0, { p: 1.6, after: grain })) box(g, xa - 1, y - 1.2, xa + bay - 1.6, y + 1.2);
    }
    for (let i = 0; i <= n; i++) { const x = x0 + i * bay; g.b([[x - 1.5, 0.6, 1], [x - 1.5, -13, 1], [x, -14.6, 1], [x + 1.5, -13, 1], [x + 1.5, 0.6, 1]]); tuft(g, x + 2.4, 1.4, 0.8); }
  }
  /** A picket fence; one picket may be a long object standing on end. */
  function pickets(g) {
    const n = g.ri(7, 10), gap = 6.2, x0 = -(n - 1) * gap / 2, free = g.ri(1, n - 2);
    box(g, x0 - 3, -10.6, -x0 + 3, -9); box(g, x0 - 3, -4.6, -x0 + 3, -3);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * gap;
      if (i === free && g.stand(x, 0.6, 17, 4.8, UP, { p: 1.7, after: (q, f, sl) => { grain(q, f, sl); inGrass(q, f, sl); } })) continue;
      g.b([[x - 1.9, 0.6, 1], [x - 1.9, -13, 1], [x, -15.8, 1], [x + 1.9, -13, 1], [x + 1.9, 0.6, 1]]);
    }
    for (let x = x0; x < -x0; x += 9) tuft(g, x + 3, 1.4, 0.8);
  }
  function clothesline(g) {
    const sag = x => -27 + 3 * (1 - (x / 30) ** 2), kinds = shuffle(g, ['shirt', 'towel', 'pants', 'slot', 'slot']);
    box(g, -30.8, -29, -29.4, 0.6); box(g, 29.4, -29, 30.8, 0.6);
    g.l([[-30, -27], [-15, -24.6], [0, -24], [15, -24.6], [30, -27]], T);
    kinds.forEach((kind, i) => {
      const x = -22 + i * 11, y = sag(x) + 0.6;
      if (kind === 'slot' && g.stand(x, y, 15, 10, PI / 2, { up: true, p: 1.7, after: onPeg })) return;
      if (kind === 'shirt') { g.b([[x - 2.6, y, 1], [x + 2.6, y, 1], [x + 6.6, y + 2.6, 1], [x + 5.4, y + 5.4, 1], [x + 3.6, y + 4.4, 1], [x + 3.6, y + 12, 1], [x - 3.6, y + 12, 1], [x - 3.6, y + 4.4, 1], [x - 5.4, y + 5.4, 1], [x - 6.6, y + 2.6, 1]]); g.l([[x - 2.6, y], [x, y + 2], [x + 2.6, y]], T); }
      else if (kind === 'pants') { g.b([[x - 3.6, y, 1], [x + 3.6, y, 1], [x + 4.6, y + 13, 1], [x + 1, y + 13, 1], [x, y + 4.6, 1], [x - 1, y + 13, 1], [x - 4.6, y + 13, 1]]); g.l([[x - 3.7, y + 1.8], [x + 3.7, y + 1.8]], T); }
      else { box(g, x - 3.8, y, x + 3.8, y + 12); g.l([[x - 3.8, y + 2.6], [x + 3.8, y + 2.6]], T); g.l([[x - 3.8, y + 9.4], [x + 3.8, y + 9.4]], T); }
      for (const dx of [-2.6, 2.6]) box(g, x + dx - 0.6, y - 1.6, x + dx + 0.6, y + 1.4, T);
    });
    tuft(g, -31, 1.4, 0.8); tuft(g, 31, 1.4, 0.8);
  }
  function tractor(g) {
    box(g, -17, -31, -2, -17); box(g, -18.8, -33, -0.6, -31); box(g, -14.6, -29, -4.6, -19.6, T);
    g.b([[-4, -8, 1], [-4, -18, 1], [15, -18, 1], [17.8, -15], [17.8, -8, 1]]);
    for (const x of [11, 13, 15]) g.l([[x, -16.6], [x, -9.4]], T);
    g.e(17.6, -13, 1.2, 1.5, { n: 6 });
    for (const [x, y, r] of [[11.4, -29.6, 1.5], [13.4, -33, 2], [11.6, -37, 2.5]]) g.e(x, y, r, r * 0.9, { n: 7, t: 1 });
    if (!g.stand(10, -18, 14, 4.2, UP, { p: 1.6, after: grain })) box(g, 9, -26, 11, -18);                  // the exhaust pipe
    g.e(-10, -9, 9.8, 9.8, { n: 14 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.l([[-10 + Math.cos(a) * 8, -9 + Math.sin(a) * 8], [-10 + Math.cos(a) * 9.6, -9 + Math.sin(a) * 9.6]], T); }
    if (!g.slot(-10, -9, 5.6, 5.6, null, { free: true, want: 'round', p: 1.8 })) { g.e(-10, -9, 5.6, 5.6, { n: 11 }); g.e(-10, -9, 1.7, 1.7, { n: 6, t: 1 }); }   // the hub
    g.e(12.6, -5.2, 5.8, 5.8, { n: 10 }); g.e(12.6, -5.2, 2.6, 2.6, { n: 7, t: 1 });
  }
  function scarecrow(g) {
    box(g, -0.9, -30, 0.9, 0.6); box(g, -13, -25.2, 13, -23.6);
    g.b([[-6, -27, 1], [6, -27, 1], [13, -25.8, 1], [13, -21.6, 1], [6.6, -22, 1], [7, -11, 1], [4, -9, 1], [1.4, -11.4, 1], [-1.6, -9, 1], [-4.6, -11.4, 1], [-7, -11, 1], [-6.6, -22, 1], [-13, -21.6, 1], [-13, -25.8, 1]]);
    box(g, 1.6, -18, 4.6, -15, T); g.d(-2, -22, 0.4); g.d(-2, -18, 0.4);
    for (const k of [-1, 1]) for (const dy of [-1.4, 0, 1.4]) g.l([[k * 13, -23.7], [k * 16, -23.7 + dy]], T);
    g.e(0, -31.6, 4.6, 4.8, { n: 10 }); eye(g, -1.7, -32.4, 0.45); eye(g, 1.7, -32.4, 0.45);
    g.l([[-2.2, -29.6], [-1, -29], [0.2, -29.6], [1.4, -29], [2.4, -29.6]], T);
    g.e(0, -35.6, 7.2, 1.7, { n: 10 }); g.b([[-4, -35.8, 1], [-3.4, -41.4, 1], [3.4, -41.4, 1], [4, -35.8, 1]]);
    tuft(g, -2, 1.4, 0.9);
  }
  function haybale(g) {
    g.b([[0, -14.6, 1], [9, -15.4], [15.6, -12], [16.4, -5], [13, 0.4], [5, 0.9, 1]]);
    g.e(0, -7.2, 7.4, 7.6, { n: 12 });
    if (!g.slot(0, -7.2, 6.6, 6.6, null, { free: true, want: 'round', p: 1.7 })) { const p = []; for (let a = 0; a < 4.4 * PI; a += 0.55) { const r = 6.4 * (1 - a / (4.9 * PI)); p.push([Math.cos(a) * r, -7.2 + Math.sin(a) * r]); } g.l(p, T); }
    for (const [x, y] of [[9, -12], [12, -8], [10.6, -3.6], [13.6, -3]]) g.l([[x, y], [x + 2.6, y + 0.4]], T);
    tuft(g, -7, 1.4, 0.9); tuft(g, 12, 1.4, 0.9);
  }

  /* ================= sea ================= */
  function fish(g) {
    const L = g.r(8, 11), h = g.r(4, 6.4), kind = g.ri(0, 2);
    g.b([[-L + 1.6, 0, 1], [-L - 4.6, -h * 0.9, 1], [-L - 3, 0], [-L - 4.6, h * 0.9, 1]]);
    g.b([[-L * 0.3, -h * 0.8, 1], [0, -h - 3.4], [L * 0.45, -h * 0.7, 1]]);
    g.b([[-1, h * 0.8, 1], [-2.6, h + 2.6, 1], [2.4, h * 0.78, 1]]);
    g.b([[L, 0.4], [L * 0.6, -h * 0.8], [0, -h], [-L * 0.6, -h * 0.62], [-L + 1, 0], [-L * 0.6, h * 0.62], [0, h], [L * 0.6, h * 0.8]]);
    g.e(L * 0.6, -h * 0.25, 1.3, 1.3, { n: 7, t: 1 }); g.d(L * 0.64, -h * 0.25, 0.55);
    g.l([[L - 0.5, 1.2], [L * 0.8, 1.7]], T); g.l([[L * 0.32, -h * 0.6], [L * 0.2, 0], [L * 0.32, h * 0.6]], T);
    if (kind === 0) for (const x of [-0.5, -0.15]) g.l([[x * L, -h * 0.72], [x * L - 0.8, 0], [x * L, h * 0.72]], T);
    else if (kind === 1) for (const p of g.spots(-L * 0.25, 0, L * 0.4, h * 0.55, 6, 2.6)) g.l([[p[0] + 0.9, p[1] - 1], [p[0] - 0.4, p[1]], [p[0] + 0.9, p[1] + 1]], T);
    else for (const p of g.spots(-L * 0.25, 0, L * 0.4, h * 0.5, 5, 2.6)) g.e(p[0], p[1], 0.6, 0.6, { n: 5, t: 1 });
    g.b([[L * 0.05, 1, 1], [-3, 3.4], [-1.4, 0.4, 1]], T);
  }
  /** A shoal of little fish; one of them may be a long object. */
  function shoal(g) {
    const spots = [[0, 0], [-13, -6], [-14, 6], [-27, -1], [12, 7], [10, -8]], free = g.ri(0, 3);
    spots.forEach(([x, y], i) => {
      const q = g.at(x + g.r(-1.5, 1.5), y + g.r(-1.5, 1.5), g.r(0.85, 1.1));
      if (i === free && q.stand(-9, 0, 17, 5.6, 0, { p: 1.7 })) return;
      q.b([[-4.4, 0, 1], [-7.6, -2.4, 1], [-6.6, 0], [-7.6, 2.4, 1]]);
      q.b([[4.6, 0.2], [1.6, -2.2], [-2.6, -1.5], [-4.6, 0], [-2.6, 1.5], [1.6, 2.2]]);
      q.d(2.6, -0.5, 0.4); q.l([[0.6, -1.4], [0.2, 0], [0.6, 1.4]], T);
    });
  }
  function turtle(g) {
    g.b([[-6, 3, 1], [-11, 7], [-9.6, 9.6], [-3, 5, 1]]); g.b([[5, -1, 1], [10, -8.4], [13.4, -7], [9.6, 0, 1]]);
    g.b([[-10, 0, 1], [-13.8, 1.4, 1], [-10, 2.6, 1]]);
    g.e(12.6, 0, 3.6, 2.8, { n: 9 }); eye(g, 14, -0.8, 0.5); g.l([[14.4, 1], [15.6, 0.7]], T);
    g.b([[-10.4, 2, 1], [10.4, 2, 1], [8, 3.8], [-8, 3.8]]);
    g.b([[-10.4, 2, 1], [-9, -4], [-3, -7.6], [4, -7], [9.6, -3], [10.4, 2, 1]]);
    g.slot(0, -2.6, 6.4, 3.6, 0);
    g.l([[-6.4, -5.6], [-4.6, -1], [-7.6, 1.8]], T); g.l([[-4.6, -1], [0, -1.6], [1.6, -7.2]], T); g.l([[0, -1.6], [1.4, 1.9]], T); g.l([[0, -1.6], [5, -1], [7, -5]], T); g.l([[5, -1], [6.4, 1.9]], T);
  }
  function octopus(g) {
    const arms = [];
    for (let i = 0; i < 6; i++) { const x = -6 + i * 2.4, sp = (i - 2.5) * 3.4, ph = g.r(0, TAU); arms.push({ p: [[x, -2], [x + sp * 0.5 + 1.4 * Math.sin(ph), 4], [sp * 1.6 + x * 0.3 + 1.6 * Math.sin(ph + 2), 9], [sp * 2.2 + 1.5 * Math.sin(ph + 4), 13.6]], w: 2.2 }); }
    g.tube(arms);
    g.b([[-7.4, 0, 1], [-8.6, -6], [-6, -12.6], [0, -14.6], [6, -12.6], [8.6, -6], [7.4, 0, 1], [0, 1.2]]);
    g.e(-3, -6, 1.9, 2.3, { n: 8 }); g.e(3, -6, 1.9, 2.3, { n: 8 }); g.d(-2.6, -5.6, 0.8); g.d(3.4, -5.6, 0.8);
    g.l([[-2, -2.2], [0, -1.2], [2, -2.2]], T); g.e(-4, -11, 0.8, 0.6, { n: 5, t: 1 }); g.e(3.6, -11.6, 0.9, 0.7, { n: 5, t: 1 });
  }
  /** A jellyfish; its bell may be an object with a round top (an umbrella, a bell, a mushroom…). */
  function jelly(g) {
    for (let i = 0; i < 5; i++) { const x = -5 + i * 2.5, d = g.r(-1, 1); g.l([[x, -0.4], [x + 1, 4], [x - 1, 8], [x + 0.8 + d, 12], [x - 0.4 + d, 15.6]], T); }
    if (g.stand(0, 0.6, 13, 16, UP, { up: true, want: 'dome', p: 1.8 })) return;
    g.b([[-7.6, 0.4, 1], [-7.4, -5], [-4, -9.4], [0, -10.6], [4, -9.4], [7.4, -5], [7.6, 0.4, 1], [5.6, -1], [3.8, 0.4, 1], [1.9, -1], [0, 0.4, 1], [-1.9, -1], [-3.8, 0.4, 1], [-5.6, -1]]);
    eye(g, -2.2, -4.4, 0.5); eye(g, 2.2, -4.4, 0.5); g.l([[-1.4, -2.6], [0, -1.9], [1.4, -2.6]], T);
    g.l([[-4.6, -7], [-2, -8.6]], T);
  }
  function crab(g) {
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) g.l([[k * 5, -3 + i * 0.6], [k * (8.6 + i), -5 + i * 2.4], [k * (10.6 + i * 0.6), -1 + i * 1.6]]);
    g.tube([{ p: [[-5, -5], [-8.6, -8.6], [-8, -11.6]], w: 1.6 }, { p: [[5, -5], [8.6, -8.6], [8, -11.6]], w: 1.6 }]);
    for (const k of [-1, 1]) g.b([[k * 9.6, -11.4, 1], [k * 10.6, -15.6], [k * 7.6, -16.6, 1], [k * 8.4, -14, 1], [k * 6.4, -14.6, 1], [k * 6.4, -11.6]]);
    g.l([[-2, -8], [-2.4, -10.6]]); g.l([[2, -8], [2.4, -10.6]]);
    g.e(0, -4.4, 7, 4.4, { n: 10 });
    g.e(-2.4, -11.4, 1.1, 1.1, { n: 6 }); g.e(2.4, -11.4, 1.1, 1.1, { n: 6 }); g.d(-2.3, -11.4, 0.45); g.d(2.5, -11.4, 0.45);
    g.l([[-2, -3], [0, -2], [2, -3]], T);
  }
  function starfish(g) {
    const p = [], a0 = g.r(0, TAU);
    for (let i = 0; i < 10; i++) { const a = a0 + i * PI / 5, r = i % 2 ? 2.9 : 7.6; p.push([Math.cos(a) * r, -3 + Math.sin(a) * r * 0.62]); }
    g.b(p);
    for (let i = 0; i < 5; i++) { const a = a0 + i * TAU / 5; g.d(Math.cos(a) * 3.4, -3 + Math.sin(a) * 2.1, 0.3); }
    g.d(0, -3, 0.3);
  }
  function shell(g) {
    const pts = [[0, 1, 1]], rim = [];
    for (let i = 0; i <= 5; i++) { const a = PI + 0.4 + i * (PI - 0.8) / 5; rim.push(a); pts.push([8 * Math.cos(a), 8.6 * Math.sin(a), 1]); if (i < 5) { const b = a + (PI - 0.8) / 10; pts.push([9 * Math.cos(b), 9.7 * Math.sin(b)]); } }
    g.b(pts);
    for (const a of rim.slice(1, 5)) g.l([[0, 0.4], [7.4 * Math.cos(a), 8 * Math.sin(a)]], T);
  }
  /** A coral; one of its branches may be a long object. */
  function coral(g) {
    const list = [], side = g.pick([-1, 1]), a = UP + side * g.r(0.45, 0.7);
    const grow = (x, y, ang, len, w, d) => {
      const x2 = x + Math.sin(ang) * len, y2 = y - Math.cos(ang) * len;
      list.push({ p: [[x, y], [(x + x2) / 2 + g.r(-1, 1), (y + y2) / 2], [x2, y2]], w });
      if (d > 0) for (const da of [-0.55, 0.5]) grow(x2, y2, ang + da + g.r(-0.2, 0.2), len * 0.72, w * 0.82, d - 1);
    };
    grow(0, 0.6, g.r(-0.15, 0.15), g.r(8, 11), 3, 2);
    g.tube(list);
    g.stand(side * 1.5, -1, 19, 5, a, { after: inSand });
    g.l([[-5, 1], [-2, 0.2], [2, 0.6], [5, 0.2]], T);
  }
  /** Seaweed; one of its fronds may be a long object. */
  function seaweed(g) {
    const n = g.ri(2, 4), list = [], free = g.ri(0, n - 1);
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 4 + g.r(-1, 1), len = g.r(20, 36), ph = g.r(0, TAU), A = g.r(1.6, 2.6), lean = g.r(-0.15, 0.15), p = [];
      if (i === free && g.stand(x, 0.6, 22, 5.4, UP + lean, { after: inSand })) continue;
      for (let t = 0; t <= 1.001; t += 0.125) p.push([x + A * Math.sin(t * 7 + ph) * (0.3 + t), 0.6 - t * len]);
      list.push({ p, w: 2 });
    }
    g.tube(list);
  }
  function chest(g) {
    box(g, -11, -8, 11, 0.6);
    g.b([[-11.6, -8, 1], [-11, -12.6], [-6, -15], [6, -15], [11, -12.6], [11.6, -8, 1]]);
    g.l([[-6.4, -14.8], [-6.4, 0.4]], T); g.l([[6.4, -14.8], [6.4, 0.4]], T);
    box(g, -1.8, -9.6, 1.8, -5.4); g.d(0, -7.6, 0.5);
    g.e(14.6, -0.4, 1.9, 1, { n: 6 }); g.e(16.8, 0.6, 1.9, 1, { n: 6 });
    g.stand(-18, 0.8, 13, 14, UP, { up: true, after: inSand });
  }
  function amphora(g) {
    const q = g.at(0, -2.6, 1, g.r(0.7, 1.2));
    q.b([[-2, 0, 1], [-5, -5], [-5.6, -10], [-2.4, -13.4], [-1.8, -16, 1], [-3, -17.6, 1], [3, -17.6, 1], [1.8, -16, 1], [2.4, -13.4], [5.6, -10], [5, -5], [2, 0, 1]]);
    q.l([[-2.2, -15.6], [-5.6, -14.6], [-5, -11]]); q.l([[2.2, -15.6], [5.6, -14.6], [5, -11]]);
    q.l([[-5.4, -8.4], [0, -7.6], [5.4, -8.4]], T); q.l([[-4.6, -4.6], [0, -3.8], [4.6, -4.6]], T);
    mound(g, -1, 0.6, 1.4);
  }
  /** A submarine; its periscope may be a long object, one of its windows a round one. */
  function submarine(g) {
    const pick = g.ri(0, 2);
    g.e(-21.4, -3.6, 1.3, 3.6, { n: 7 }); g.e(-21.4, 3.6, 1.3, 3.6, { n: 7 }); box(g, -20.6, -1.2, -17.6, 1.2);
    g.b([[-15, -6, 1], [-19, -10.4, 1], [-12.6, -7.4, 1]]);
    g.b([[-4, -7, 1], [-3, -13.4, 1], [4.6, -13.4, 1], [5.6, -7, 1]]);
    if (!g.stand(1, -13.2, 14, 4.4, UP, { p: 1.7, after: grain })) g.l([[1, -13.4], [1, -18.6], [4.4, -18.6]]);     // the periscope
    g.b([[-19, 0], [-16, -6.4], [-7, -8.6], [7, -8.6], [16, -7], [20, -1.8], [19.4, 3], [13.6, 7.4], [0, 8.8], [-11, 7.6], [-17.4, 4.6]]);
    g.l([[-14.6, 5.2], [0, 6.6], [13.6, 5]], T);
    [-9, 1, 11].forEach((x, i) => {
      if (i === pick && g.slot(x, -0.8, 4.2, 4.2, null, { free: true, want: 'round', p: 1.8 })) return;    // a window
      g.e(x, -0.8, 3.4, 3.4, { n: 9 }); g.e(x, -0.8, 2.1, 2.1, { n: 7, t: 1 });
    });
  }
  /** A fish whose body may be a hidden object (then only its tail and fins are a fish's). */
  function oddFish(g) {
    const L = 9.5, h = 5;
    g.b([[-L + 1.6, 0, 1], [-L - 5, -h * 0.9, 1], [-L - 3.2, 0], [-L - 5, h * 0.9, 1]]);
    g.b([[-L * 0.3, -h * 0.7, 1], [0, -h - 3.2], [L * 0.45, -h * 0.6, 1]]);
    g.b([[-1, h * 0.7, 1], [-2.6, h + 2.6, 1], [2.4, h * 0.7, 1]]);
    if (g.slot(0, 0, L, h * 0.92, 0, { free: true, p: 1.5 })) return;
    g.b([[L, 0.4], [L * 0.6, -h * 0.8], [0, -h], [-L * 0.6, -h * 0.62], [-L + 1, 0], [-L * 0.6, h * 0.62], [0, h], [L * 0.6, h * 0.8]]);
    g.e(L * 0.6, -h * 0.25, 1.3, 1.3, { n: 7, t: 1 }); g.d(L * 0.64, -h * 0.25, 0.55);
    g.l([[L * 0.32, -h * 0.6], [L * 0.2, 0], [L * 0.32, h * 0.6]], T); g.l([[-L * 0.4, -h * 0.5], [-L * 0.5, 0], [-L * 0.4, h * 0.5]], T);
  }
  /** A fishing line from above; what hangs on its hook may be a hidden object. */
  function fishingLine(g, x, len) {
    g.l([[x, -2], [x + 1, len * 0.5], [x, len]], T);
    if (g.stand(x, len, 15, 13, PI / 2, { up: true, p: 1.7 })) return;
    g.l([[x, len], [x, len + 4], [x - 1.4, len + 5.6], [x - 3, len + 4.4], [x - 2.8, len + 2.6]]);
    g.b([[x - 3, len + 2.4], [x - 4.4, len + 1], [x - 4, len - 1], [x - 2.6, len - 0.4], [x - 2.2, len + 1.4]], T);
  }
  /** Bubbles going up; a big one may be a round object. */
  function bubbles(g) {
    const big = g.ri(2, 3);
    for (let i = 0; i < 5; i++) {
      const x = Math.sin(i * 1.3) * 3, y = 14 - i * 7.4, r = 1.2 + i * 0.8;
      if (i === big && g.slot(x, y, 5, 5, null, { free: true, want: 'round', p: 1.6 })) continue;
      g.e(x, y, r, r, { n: 8 }); g.l([[x - r * 0.5, y - r * 0.1], [x - r * 0.2, y - r * 0.5]], T);
    }
  }

  /* ================= space ================= */
  /** A rocket standing on its fins; its window may be a round object, its tip one with a pointed top. */
  function rocket(g) {
    g.b([[-5, -12, 1], [-11, -2], [-10.6, 1, 1], [-4.6, -3, 1]]); g.b([[5, -12, 1], [11, -2], [10.6, 1, 1], [4.6, -3, 1]]);
    g.b([[-3.4, -4, 1], [-4.6, 0.6, 1], [4.6, 0.6, 1], [3.4, -4, 1]]);
    g.b([[-5.4, -4, 1], [-6.6, -20], [-5.2, -36, 1], [5.2, -36, 1], [6.6, -20], [5.4, -4, 1]]);
    if (!g.stand(0, -35.4, 12, 11, UP, { up: true, want: 'cone', p: 1.8 })) g.b([[-5.2, -36, 1], [-3.2, -42], [0, -46.4, 1], [3.2, -42], [5.2, -36, 1]]);
    g.l([[-6, -10], [0, -9], [6, -10]], T); box(g, -0.8, -11, 0.8, -1);
    if (!g.slot(0, -26, 4.7, 4.7, null, { free: true, want: 'round', p: 1.8 })) { g.e(0, -26, 3.4, 3.4, { n: 10 }); g.e(0, -26, 2, 2, { n: 7, t: 1 }); }
    g.e(0, -16.4, 2.2, 2.2, { n: 8 });
  }
  const flyingRocket = g => { g.b([[-3, 0.6, 1], [-4.4, 7], [0, 14, 1], [4.4, 7], [3, 0.6, 1]]); g.l([[-1.2, 2], [0, 8.6], [1.2, 2]], T); rocket(g); };
  function astronaut(g) {
    box(g, -6.6, -19, 6.6, -8);
    g.tube([{ p: [[-2.6, -8], [-3, -0.6]], w: 3.6 }, { p: [[2.6, -8], [3, -0.6]], w: 3.6 }]);
    g.e(-3.4, -0.2, 2.9, 1.5, { n: 7 }); g.e(3.4, -0.2, 2.9, 1.5, { n: 7 });
    g.tube([{ p: [[-4.6, -16], [-8.4, -12], [-9, -7.6]], w: 3 }, { p: [[4.6, -16], [8.6, -17.6], [11, -20.4]], w: 3 }]);
    g.e(-9, -6.6, 1.7, 1.7, { n: 6 });
    g.b([[-4.6, -18, 1], [-5, -7, 1], [5, -7, 1], [4.6, -18, 1]]);
    box(g, -2.4, -14.6, 2.4, -11, T); g.d(-1, -12.8, 0.3); g.d(1, -12.8, 0.3);
    g.e(0, -22.6, 5.6, 5.4, { n: 12 });
    g.b([[-3.6, -24.6], [0, -25.6], [3.6, -24.6], [4, -21.6], [0, -20], [-4, -21.6]], T); g.l([[-2.4, -23.6], [-1, -24.4]], T);
    if (!g.stand(11.4, -19.6, 19, 5, UP + 0.12, { p: 1.7 })) { g.l([[11.4, -19], [13, -37]]); g.b([[13, -37, 1], [20, -35.4], [19.4, -30.6], [12.6, -31.6, 1]]); }   // what it holds up
    g.e(11.4, -21.4, 1.8, 1.8, { n: 6 });
  }
  function alien(g) {
    g.l([[-2, -15], [-3.6, -19]]); g.e(-3.8, -19.8, 1, 1, { n: 5 }); g.l([[2, -15], [3.6, -19]]); g.e(3.8, -19.8, 1, 1, { n: 5 });
    g.tube([{ p: [[-2.4, -4], [-3, -0.4]], w: 2 }, { p: [[2.4, -4], [3, -0.4]], w: 2 }, { p: [[-4.4, -7], [-8, -9.6]], w: 1.6 }, { p: [[4.4, -7], [8, -5]], w: 1.6 }]);
    g.e(-3.6, 0, 2.2, 1.1, { n: 6 }); g.e(3.6, 0, 2.2, 1.1, { n: 6 });
    g.b([[-4.6, -3], [-5, -8], [0, -9.6], [5, -8], [4.6, -3], [0, -2]]);
    g.e(0, -12.6, 6.4, 4.6, { n: 12 });
    g.e(-2.6, -13, 1.9, 2.3, { n: 8 }); g.e(2.6, -13, 1.9, 2.3, { n: 8 }); g.d(-2.3, -12.7, 0.8); g.d(2.9, -12.7, 0.8);
    g.l([[-1.6, -9.8], [0, -9.2], [1.6, -9.8]], T);
    if (g.stand(8, -5, 16, 4.6, UP + 0.5, { p: 1.6 })) g.e(8, -5, 1.2, 1.2, { n: 5 });      // what it holds
  }
  /** A flying saucer; its glass dome may be an object with a round top. */
  function ufo(g) {
    g.b([[-5, 3, 1], [5, 3, 1], [3, 5.8, 1], [-3, 5.8, 1]]);
    if (!g.stand(0, -1.6, 10, 13, UP, { up: true, want: 'dome', p: 1.8 })) { g.b([[-5.6, -2.4, 1], [-5, -6.6], [0, -9], [5, -6.6], [5.6, -2.4, 1]]); g.e(0, -4.8, 1.9, 1.7, { n: 7, t: 1 }); g.d(-0.7, -5, 0.3); g.d(0.7, -5, 0.3); }
    g.e(0, 0, 13, 3.8, { n: 12 });
    for (const x of [-8, -4, 0, 4, 8]) g.e(x, 0.6, 1, 0.8, { n: 5, t: 1 });
    g.l([[-3, 6.4], [-8, 24]], T); g.l([[3, 6.4], [8, 24]], T);                       // its beam, and what it is lifting
    if (!g.stand(0, 9, 14, 12, PI / 2, { up: true, p: 1.7 })) for (const y of [11, 16, 21]) g.l([[-2 - y * 0.12, y], [2 + y * 0.12, y]], T);
  }
  /** A planet with a ring; the planet itself may be a round object. */
  function saturn(g) {
    const q = g.at(0, 0, 1, g.r(-0.5, -0.15));
    q.e(0, 0, 15, 4.4, { n: 14, f: 'none' });
    if (!g.slot(0, 0, 8, 8, null, { free: true, want: 'round', p: 1.8 })) { g.e(0, 0, 8, 8, { n: 12 }); g.l([[-7.4, -2.6], [0, -1.4], [7.6, -3]], T); g.l([[-7.6, 2], [0, 3.4], [7.4, 1.6]], T); }
    q.arc(0, 0, 15, 4.4, 0.1, PI - 0.1); q.arc(0, 0, 12.4, 3.1, 0.25, PI - 0.25, T);
  }
  function stripedPlanet(g) {
    g.e(0, 0, 13, 13, { n: 14 });
    g.slot(0, 0, 8, 8);
    for (const y of [-8, -3.6, 1.6, 7]) { const w = Math.sqrt(169 - y * y) - 0.4; g.l([[-w, y], [-w * 0.4, y + 1.4], [w * 0.4, y - 0.6], [w, y + 0.8]], T); }
    g.e(4.6, 4, 2.4, 1.5, N);
  }
  function moonlet(g) {
    g.e(0, 0, 7, 7, { n: 12 });
    for (const p of g.spots(0, 0, 4.6, 4.6, 5, 3)) g.e(p[0], p[1], g.r(0.7, 1.5), g.r(0.6, 1.2), { n: 6, t: 1 });
  }
  /** A satellite; one of its two panels may be a flat long object. */
  function satellite(g) {
    for (const k of [-1, 1]) {
      const q = g.at(0, 0, 1, k < 0 ? PI : 0);
      q.l([[4, 0], [5.4, 0]]);
      if (k > 0 && q.stand(5.2, 0, 12, 6.6, 0, { p: 1.6 })) continue;
      box(q, 5.2, -3.2, 16.4, 3.2); q.l([[9, -3.2], [9, 3.2]], T); q.l([[12.8, -3.2], [12.8, 3.2]], T); q.l([[5.2, 0], [16.4, 0]], T);
    }
    box(g, -4, -4.6, 4, 4.6); g.l([[0, -4.6], [0, -6.6]]); g.arc(0, -8.6, 3, 2, 0.1, PI - 0.1); g.l([[2, 4.6], [3.4, 8]]); g.d(3.5, 8.3, 0.5);
    g.e(0, 0, 1.8, 1.8, { n: 7, t: 1 });
  }
  /** A comet; its head may be any object. */
  function comet(g) {
    for (const [dy, len] of [[-3, 17], [0, 22], [3, 16]]) g.l([[-4, dy], [-len * 0.5, dy * 1.5 - 1], [-len, dy * 2 + 1]], T);
    if (!g.slot(0, 0, 7.4, 7.4, null, { free: true, p: 1.3 })) g.e(0, 0, 4, 4, { n: 9 });
  }
  function moonBase(g) {
    g.b([[-14, 0.6, 1], [-13, -8], [-7, -13.4], [0, -15], [7, -13.4], [13, -8], [14, 0.6, 1]]);
    g.l([[-7, 0.4], [-6, -8], [0, -15]], T); g.l([[7, 0.4], [6, -8], [0, -15]], T); g.l([[-13, -7.6], [0, -9], [13, -7.6]], T);
    g.b([[-2.6, 0.6, 1], [-2.6, -4.6], [0, -6.4], [2.6, -4.6], [2.6, 0.6, 1]]);
    if (!g.stand(9, -11.4, 15, 4.4, UP + 0.26, { p: 1.6 })) { g.l([[9, -11.6], [11, -19]]); g.e(11.2, -19.8, 1, 1, { n: 5 }); }   // the aerial
  }
  /** A Moon rover; its mast may be a long object, a wheel a round one. */
  function rover(g) {
    const pick = g.ri(0, 2);
    box(g, -12, -11.6, 12, -6); g.b([[-10, -11.6, 1], [-12, -14.6, 1], [7, -14.6, 1], [9, -11.6, 1]]);
    for (const x of [-7, -2, 3]) g.l([[x, -14.4], [x + 1, -11.8]], T);
    if (!g.stand(9.6, -11.6, 14, 4.4, UP, { p: 1.6, after: grain })) { g.l([[9.6, -11.6], [9.6, -20]]); box(g, 7.6, -22.4, 12, -20); g.d(11, -21.2, 0.5); }
    [-9, 0, 9].forEach((x, i) => {
      if (i === pick && g.slot(x, -3.6, 4.6, 4.6, null, { free: true, want: 'round', p: 1.8 })) return;
      g.e(x, -3.6, 4, 4, { n: 9 }); g.e(x, -3.6, 1.4, 1.4, { n: 6, t: 1 });
    });
  }
  /** A flag on the Moon; its pole may be a long object. */
  function moonFlag(g) {
    if (!g.stand(0, 0.8, 21, 5, UP, { p: 1.5, after: inSand })) { g.l([[0, 0.6], [0, -22]]); g.b([[0, -22, 1], [5, -21], [10, -22.4, 1], [10, -15.4, 1], [5, -14], [0, -15, 1]]); g.l([[2, -19.6], [8, -19.8]], T); g.l([[2, -17.4], [8, -17.6]], T); }
    mound(g, 0, 1, 0.9);
  }
  function crater(g) {
    const w = g.r(9, 14);
    g.e(0, -2, w, w * 0.3, { n: 12 });
    g.l([[-w * 0.82, -2.4], [-w * 0.3, -2 + w * 0.14], [w * 0.3, -2 + w * 0.15], [w * 0.82, -2.2]], T);
  }
  const star4 = (g, x, y, s) => { const p = []; for (let i = 0; i < 8; i++) { const a = i * PI / 4, r = (i % 2 ? 0.7 : 2.4) * s; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r, 1]); } g.b(p, { t: 1, j: 0.05, own: false }); };

  /* ================= the scenes ================= */
  H.SCENES.forest = g => {
    const hz = g.r(56, 68);
    sky(g, hz);
    hills(g, hz, 'trees');
    const L = land(g, hz);
    L.ground();
    const kind = g.pick(['path', 'path', 'stream', 'pond']);
    if (kind === 'path') way(g, L, 15, pebble, 46);
    else if (kind === 'stream') way(g, L, 11, (q, x, y, s) => ripple(q, x, y, s * 0.7), 30);
    else pond(g, L);
    const animals = shuffle(g, [rabbit, fox, hedgehog, squirrel, owlOnStump, snail]), side = g.chance(0.5);
    L.put(animals[0], 1, { t: [0.45, 0.8], w: 12, h: 26, k: 1.25, keep: true, x: [0.15, 0.85] });
    L.put(animals[1], 1, { t: [0.3, 0.7], w: 12, h: 26, k: 1.25, keep: true, x: [0.1, 0.9] });
    L.put(animals[2], 1, { t: [0.6, 0.92], w: 12, h: 26, k: 1.25, keep: true, x: [0.1, 0.9] });
    L.put(oak, 1, { t: [0.82, 0.98], w: 9, h: 100, cw: 38, ch: 38, k: 1.35, x: side ? [0.02, 0.14] : [0.86, 0.98] });
    L.put(g.chance(0.5) ? oak : spruce, 1, { t: [0.5, 0.75], w: 9, h: 100, cw: 38, ch: 36, k: 1.35, x: side ? [0.72, 0.95] : [0.05, 0.28] });
    L.put(animals[3], 1, { t: [0.25, 0.9], w: 12, h: 26, k: 1.2, keep: true });
    L.put(oak, g.ri(2, 3), { t: [0.08, 0.5], w: 9, h: 100, cw: 38, ch: 38, k: 1.35 });
    L.put(spruce, g.ri(4, 6), { t: [0.02, 0.45], w: 12, h: 88, cw: 22, ch: 12, k: 1.3 });
    L.put(bush, g.ri(4, 6), { t: [0.15, 0.95], w: 20, h: 18 });
    L.put(log, 1, { t: [0.4, 0.9], w: 16, h: 12 });
    L.put(stump, 1, { t: [0.3, 0.9], w: 12, h: 12 });
    L.put(rock, g.ri(3, 4), { t: [0.2, 0.95], w: 12, h: 9 });
    L.put(g2 => blades(g2), g.ri(3, 4), { t: [0.2, 0.9], w: 9, h: 22 });
    L.put(g2 => leafy(g2), g.ri(4, 6), { t: [0.3, 0.95], w: 12, h: 50, k: 0.9 });
    L.put(toadstools, g.ri(5, 7), { t: [0.2, 0.97], w: 9, h: 10, k: 1.2 });
    L.put(flower, g.ri(10, 14), { t: [0.15, 0.98], w: 5, h: 16, k: 1.2 });
    L.draw();
    for (let i = g.ri(2, 4); i > 0; i--) butterfly(g.thing().at(g.r(20, W - 20), g.r(hz + 8, HH - 40), g.r(0.9, 1.3)));
    bigTrunk(g.thing().at(side ? W - g.r(14, 22) : g.r(14, 22), HH + 6, 1));
    for (let x = g.r(30, 50); x < W - 30; x += g.r(38, 60)) (g.chance(0.6) ? leafy : blades)(g.thing().at(x + (side ? -22 : 22), HH + 3, g.r(0.95, 1.25), 0, g.chance(0.5)));
  };

  H.SCENES.farm = g => {
    const hz = g.r(52, 62);
    sky(g, hz);
    hills(g, hz, 'fields');
    const L = land(g, hz);
    L.ground();
    if (g.chance(0.6)) way(g, L, 13, pebble, 40); else pond(g, L, duck);
    const side = g.chance(0.5), animals = shuffle(g, [cow, pig, sheep, hen]);
    L.put(barn, 1, { t: [0.1, 0.2], w: 26, h: 48, k: 2.3, x: side ? [0.16, 0.34] : [0.66, 0.84], flip: false });
    L.put(g.chance(0.5) ? house : windmill, 1, { t: [0.06, 0.16], w: 24, h: 44, k: 2.3, x: side ? [0.62, 0.88] : [0.12, 0.38], flip: false });
    // fences first, and nothing may stand in front of them: their boards stay in sight
    L.put(fence, 1, { t: [0.7, 0.93], w: 38, h: 15, k: 1.15, keep: true });
    L.put(pickets, 1, { t: [0.3, 0.6], w: 34, h: 16, k: 1.2, keep: true });
    L.put(fence, 1, { t: [0.25, 0.5], w: 38, h: 15, k: 1.15, keep: true });
    L.put(animals[0], 1, { t: [0.5, 0.85], w: 16, h: 30, k: 1.3, keep: true, x: [0.12, 0.88] });
    L.put(animals[1], 1, { t: [0.35, 0.7], w: 14, h: 20, k: 1.3, keep: true, x: [0.1, 0.9] });
    L.put(animals[2], 1, { t: [0.6, 0.92], w: 14, h: 20, k: 1.3, keep: true, x: [0.1, 0.9] });
    L.put(tractor, 1, { t: [0.35, 0.62], w: 22, h: 36, k: 1.25 });
    L.put(appleTree, 1, { t: [0.55, 0.9], w: 16, h: 100, cw: 38, ch: 38, k: 1.25, x: side ? [0.84, 0.97] : [0.03, 0.16] });
    L.put(clothesline, 1, { t: [0.4, 0.7], w: 33, h: 30, k: 1.15, flip: false, x: [0.24, 0.76] });
    L.put(animals[3], 1, { t: [0.3, 0.9], w: 14, h: 20, k: 1.2, keep: true });
    L.put(scarecrow, 1, { t: [0.2, 0.45], w: 16, h: 42, k: 1.2 });
    L.put(haybale, g.ri(2, 3), { t: [0.25, 0.9], w: 16, h: 16, k: 1.2 });
    L.put(g2 => blades(g2), g.ri(2, 3), { t: [0.25, 0.9], w: 9, h: 22 });
    L.put(g2 => leafy(g2), g.ri(3, 4), { t: [0.3, 0.95], w: 12, h: 50, k: 0.9 });
    L.put(rock, g.ri(1, 2), { t: [0.2, 0.95], w: 12, h: 9 });
    L.put(toadstools, g.ri(1, 2), { t: [0.3, 0.97], w: 9, h: 10, k: 1.2 });
    L.put(sunflower, 2, { t: [0.72, 0.98], w: 9, h: 48, k: 1.1, x: side ? [0.02, 0.3] : [0.7, 0.98] });
    L.put(cabbages, 2, { t: [0.5, 0.95], w: 26, h: 9, k: 1.2 });
    L.put(bush, g.ri(2, 4), { t: [0.2, 0.9], w: 20, h: 18 });
    L.put(flower, g.ri(8, 12), { t: [0.25, 0.98], w: 5, h: 16, k: 1.2 });
    L.draw();
    for (let x = g.r(4, 30); x < W; x += g.r(40, 64)) (g.chance(0.6) ? leafy : blades)(g.thing().at(x, HH + 3, g.r(0.95, 1.25), 0, g.chance(0.5)));
  };

  H.SCENES.sea = g => {
    g.thing(); box(g, -6, -6, W + 6, HH + 6, { j: 0 });
    const drift = (q, f) => { for (const [dx, dy, r] of [[0.9, -0.9, 1.4], [1.2, -1.5, 0.9], [-1, -1.1, 1.1]]) q.e(f.x + dx * f.r, f.y + dy * f.r, r, r, { n: 6, t: 1, own: false }); };
    for (let i = 0; i < 16; i++) g.slot(g.r(14, W - 14), g.r(14, HH * 0.6), 7, 7, null, { p: 0.1, cap: 99, after: drift });
    for (let x = g.r(10, 40); x < W; x += g.r(26, 44)) { const dx = g.r(-14, -6), len = g.r(22, 48); g.l([[x, -2], [x + dx, len]], T); }
    const lines = [g.r(0.1, 0.45) * W, g.r(0.55, 0.9) * W].map(x => [x, g.r(22, 50)]);
    for (const p of g.spots(W / 2, HH * 0.4, W / 2, HH * 0.4, 110, 7)) { const r = g.r(0.5, 1.3); if (g.chance(0.55)) g.e(p[0], p[1], r, r, { n: 6, t: 1, own: false }); else ripple(g, p[0], p[1], g.r(0.5, 0.9)); }
    const bed = HH * g.r(0.7, 0.76);
    hills(g, bed, 'rocks');
    const L = land(g, bed, 0.62);
    L.ground(sandMark, 200, buried);
    L.put(g.pick([chest, amphora]), 1, { t: [0.3, 0.8], w: 18, h: 18, k: 1.2 });
    L.put(crab, 1, { t: [0.4, 0.9], w: 12, h: 18, k: 1.2, keep: true });
    L.put(coral, g.ri(3, 5), { t: [0.05, 0.8], w: 12, h: 26, k: 1.3 });
    L.put(seaweed, g.ri(3, 4), { t: [0.02, 0.9], w: 9, h: 40, k: 1.2 });
    L.put(g2 => leafy(g2, inSand), g.ri(3, 5), { t: [0.05, 0.9], w: 12, h: 50, k: 0.85 });
    L.put(seaRock, g.ri(3, 5), { t: [0.1, 0.9], w: 14, h: 9, k: 1.3 });
    L.put(shell, g.ri(3, 4), { t: [0.3, 0.95], w: 9, h: 10 });
    L.put(starfish, g.ri(2, 4), { t: [0.3, 0.95], w: 8, h: 8 });
    L.draw();
    g.thing();
    for (const [x, len] of lines) fishingLine(g, x, len);
    const F = afloat(g), top = [10, bed - 26];
    F.block = lines.map(([x, len]) => [x - 9, 0, x + 9, len + 20]);
    F.put(submarine, 1, { x: [34, W - 34], y: [16, 50], s: [1.25, 1.5], w: 23, h: 20 });
    F.put(g.pick([turtle, octopus]), 1, { x: [24, W - 24], y: top, s: [1.3, 1.7], w: 16, h: 14, keep: true });
    F.put(oddFish, 3, { x: [18, W - 18], y: top, s: [1.2, 1.6], w: 15, h: 9, rot: 0.2 });
    F.put(jelly, 3, { x: [14, W - 14], y: top, s: [1.1, 1.4], w: 8, h: 16 });
    F.put(shoal, 2, { x: [36, W - 22], y: top, s: [0.95, 1.2], w: 24, h: 10 });
    F.put(bubbles, g.ri(4, 6), { x: [10, W - 10], y: [24, bed - 30], s: [1, 1.4], w: 6, h: 18 });
    F.put(fish, g.ri(10, 14), { x: [10, W - 10], y: [8, bed - 6], s: [0.55, 1.3], w: 15, h: 9, keep: true, rot: 0.2 });
    F.draw();
    for (let x = g.r(10, 60); x < W; x += g.r(70, 110)) seaweed(g.thing().at(x, HH + 2, 1.3));
  };

  H.SCENES.space = g => {
    g.thing(); box(g, -6, -6, W + 6, HH + 6, { j: 0 });
    const sparkle = (q, f) => { for (const [dx, dy] of [[1.1, -0.8], [-1.2, 0.5]]) star4(q, f.x + dx * f.r, f.y + dy * f.r, 0.7); };
    const hz = HH * g.r(0.66, 0.72);
    for (let i = 0; i < 16; i++) g.slot(g.r(14, W - 14), g.r(14, hz - 14), 7, 7, null, { p: 0.1, cap: 99, after: sparkle });
    for (const p of g.spots(W / 2, hz / 2, W / 2, hz / 2, 130, 5.5)) { const k = g.r(0, 1); if (k < 0.35) star4(g, p[0], p[1], g.r(0.6, 1.1)); else g.d(p[0], p[1], k < 0.7 ? 0.25 : 0.4); }
    const F = afloat(g), up = [12, hz - 22];
    F.put(stripedPlanet, 1, { x: [20, W - 20], y: [18, hz - 34], s: [1.1, 1.5], w: 13, h: 13 });
    F.put(saturn, g.ri(1, 2), { x: [22, W - 22], y: up, s: [1, 1.4], w: 16, h: 9 });
    F.put(ufo, 1, { x: [20, W - 20], y: [14, hz - 44], s: [1.2, 1.5], w: 13, h: 26 });
    F.put(satellite, 1, { x: [24, W - 24], y: up, s: [1.1, 1.4], w: 17, h: 9, rot: 0.5 });
    F.put(comet, g.ri(2, 3), { x: [30, W - 14], y: up, s: [1, 1.3], w: 14, h: 8, rot: 0.6 });
    F.put(flyingRocket, 1, { x: [20, W - 20], y: [30, hz - 34], s: [0.7, 0.9], w: 16, h: 30, rot: 0.9 });
    F.put(moonlet, g.ri(4, 6), { x: [10, W - 10], y: [8, hz - 12], s: [0.4, 1.1], w: 7, h: 7 });
    F.draw();
    hills(g, hz, 'rocks');
    const L = land(g, hz, 0.55);
    L.ground((q, x, y, s) => (q.chance(0.6) ? craterMark(q, x, y, s) : pebble(q, x, y, s * 1.3)), 150, buried);
    L.put(rocket, 1, { t: [0.2, 0.5], w: 12, h: 48, k: 1.6, x: [0.1, 0.9] });
    L.put(astronaut, g.ri(1, 2), { t: [0.4, 0.9], w: 14, h: 40, k: 1.35, keep: true });
    L.put(alien, g.ri(1, 2), { t: [0.4, 0.95], w: 9, h: 21, k: 1.3, keep: true });
    L.put(rover, 1, { t: [0.45, 0.9], w: 14, h: 24, k: 1.4 });
    L.put(moonBase, 1, { t: [0.05, 0.3], w: 15, h: 20, k: 1.3 });
    L.put(moonFlag, 1, { t: [0.3, 0.9], w: 8, h: 23, k: 1.1 });
    L.put(crater, g.ri(4, 5), { t: [0.15, 0.95], w: 14, h: 6 });
    L.put(moonRock, g.ri(5, 7), { t: [0.15, 0.97], w: 14, h: 9, k: 1.2 });
    L.draw();
  };
})();
