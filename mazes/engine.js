/**
 * Mazes — engine of the printable worksheet. Classic script; defines the global `MAZE`
 * (also exported for Node: `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) for the random helpers.
 *
 * A maze is a graph of cells. The open ways between cells form a spanning tree carved by a random
 * depth-first walk (the "recursive backtracker": long winding corridors, few short dead ends), so it is a
 * perfect maze: every cell can be reached and there is exactly one way between any two cells.
 *   MAZE.rect(rnd, w, h)      → a w×h maze; the entrance is in the top wall, the exit in the bottom one
 *   MAZE.round(rnd, rings)    → a round maze: rings around a middle disc; the entrance is in the outer
 *                               wall near the top, the goal sits in the middle
 *   Both give { kind, n, adj, links, start, end, path, … }: adj = the neighbours of each cell, links = the
 *   open ways of each cell, path = the cells of the solution from start to end. The entrance and the exit
 *   are picked among the pairs that are far apart along the corridors, so the way is long.
 *   MAZE.svg(m, boxW, boxH, opts) → the maze as an SVG string, as big as fits in boxW × boxH mm
 *   MAZE.THEMES / THEME_IDS   → who walks where: { id: [character, goal] }
 */
const MAZE = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');
  const THEMES = {
    mouse: ['🐭', '🧀'], bee: ['🐝', '🌻'], dog: ['🐶', '🦴'], bunny: ['🐰', '🥕'], rocket: ['🚀', '🪐'],
    squirrel: ['🐿️', '🌰'], bear: ['🐻', '🍯'], monkey: ['🐵', '🍌'], cat: ['🐱', '🐟'], car: ['🚗', '🏠'],
  };
  const THEME_IDS = Object.keys(THEMES);
  // sizes on paper, in mm: wall thickness, emoji size, the band above/below the maze for the emoji, margin
  const WALL = 0.85, EMOJI = 9, BAND = 10, PAD = 0.6;

  /* ---------- carving ---------- */
  /** Random depth-first walk over the graph from a random cell; returns the open ways of each cell. */
  function carve(rnd, adj) {
    const links = adj.map(() => []), seen = new Uint8Array(adj.length);
    const first = Math.floor(rnd() * adj.length), stack = [first];
    seen[first] = 1;
    while (stack.length) {
      const a = stack[stack.length - 1], free = adj[a].filter(b => !seen[b]);
      if (!free.length) { stack.pop(); continue; }
      const b = K.pick(rnd, free);
      links[a].push(b); links[b].push(a); seen[b] = 1; stack.push(b);
    }
    return links;
  }
  /** Steps along the open ways from cell `from` to every cell (-1 = cannot get there) and the cell before. */
  function bfs(links, from) {
    const dist = new Array(links.length).fill(-1), prev = new Array(links.length).fill(-1), q = [from];
    dist[from] = 0;
    for (let i = 0; i < q.length; i++) for (const b of links[q[i]]) if (dist[b] < 0) { dist[b] = dist[q[i]] + 1; prev[b] = q[i]; q.push(b); }
    return { dist, prev };
  }
  /** The cells on the way from a to b. */
  function route(links, a, b) {
    const { prev } = bfs(links, b), p = [a];
    while (p[p.length - 1] !== b) p.push(prev[p[p.length - 1]]);
    return p;
  }
  /** One of the candidates whose way is at least 80 % of the longest one. */
  const far = (rnd, cands) => {
    const max = Math.max(...cands.map(c => c.d));
    return K.pick(rnd, cands.filter(c => c.d >= 0.8 * max));
  };

  /* ---------- the two shapes ---------- */
  /** A w×h maze; cell id = y·w + x. */
  function rect(rnd, w, h) {
    const id = (x, y) => y * w + x, adj = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = [];
      if (x > 0) a.push(id(x - 1, y)); if (x < w - 1) a.push(id(x + 1, y));
      if (y > 0) a.push(id(x, y - 1)); if (y < h - 1) a.push(id(x, y + 1));
      adj.push(a);
    }
    const links = carve(rnd, adj), pairs = [];
    for (let a = 0; a < w; a++) {
      const { dist } = bfs(links, id(a, 0));
      for (let b = 0; b < w; b++) pairs.push({ a, b, d: dist[id(b, h - 1)] });
    }
    const { a, b } = far(rnd, pairs), start = id(a, 0), end = id(b, h - 1);
    return { kind: 'rect', w, h, n: w * h, adj, links, start, end, path: route(links, start, end) };
  }

  /** Cells in each ring: the middle is one cell, ring 1 has 6, and a ring doubles its cells when they
   *  would be more than 2 corridor widths long. Ring k lies between radius k and k+1. */
  function ringCounts(rings) {
    const c = [1, 6];
    for (let k = 2; k < rings; k++) c.push(2 * Math.PI * (k + 0.5) / c[k - 1] > 2 ? c[k - 1] * 2 : c[k - 1]);
    return c.slice(0, rings);
  }
  /** A round maze of `rings` rings (the middle counts as one); cell 0 is the middle. */
  function round(rnd, rings) {
    const count = ringCounts(rings), first = [0];
    for (let k = 1; k < rings; k++) first.push(first[k - 1] + count[k - 1]);
    const n = first[rings - 1] + count[rings - 1];
    const id = (k, j) => k ? first[k] + (j % count[k] + count[k]) % count[k] : 0;
    const ring = [0], pos = [0];
    for (let k = 1; k < rings; k++) for (let j = 0; j < count[k]; j++) { ring.push(k); pos.push(j); }
    const adj = Array.from({ length: n }, () => []);
    const join = (a, b) => { adj[a].push(b); adj[b].push(a); };
    for (let k = 1; k < rings; k++) for (let j = 0; j < count[k]; j++) {
      join(id(k, j), id(k, j + 1));
      join(id(k, j), inward(count, k, j, id));
    }
    const links = carve(rnd, adj);
    const { dist } = bfs(links, 0), k = rings - 1, cands = [];
    for (let j = 0; j < count[k]; j++) {
      const a = (j + 0.5) / count[k] * 360;   // degrees clockwise from the top
      if (a <= 45 || a >= 315) cands.push({ cell: id(k, j), d: dist[id(k, j)] });
    }
    const start = far(rnd, cands).cell;
    return { kind: 'round', rings, count, first, n, ring, pos, adj, links, start, end: 0, path: route(links, start, 0) };
  }
  /** The cell inside cell j of ring k (ring 1 → the middle). */
  const inward = (count, k, j, id) => k === 1 ? 0 : id(k - 1, count[k] > count[k - 1] ? j >> 1 : j);

  /* ---------- drawing ---------- */
  const f = v => Math.round(v * 1000) / 1000;
  const emoji = (ch, x, y, size) => `<text x="${f(x)}" y="${f(y)}" font-size="${f(size)}" text-anchor="middle" dominant-baseline="central">${ch}</text>`;
  const wallStyle = u => `fill="none" stroke="#1b1b1f" stroke-width="${f(WALL / u)}" stroke-linecap="round" stroke-linejoin="round"`;
  const pathStyle = u => `fill="none" stroke="#e5484d" stroke-opacity="0.85" stroke-width="${f(Math.min(0.38, 2.8 / u))}" stroke-linecap="round" stroke-linejoin="round"`;

  /**
   * The maze as an SVG string, as big as fits in boxW × boxH mm (with the emoji outside the walls).
   * opts: { from, to: the character and the goal emoji; solved: true → draw the way (answer key) }
   */
  function svg(m, boxW, boxH, opts = {}) {
    return m.kind === 'round' ? svgRound(m, boxW, boxH, opts) : svgRect(m, boxW, boxH, opts);
  }

  function svgRect(m, boxW, boxH, opts) {
    const { w, h } = m, id = (x, y) => y * w + x, open = (a, b) => m.links[a].includes(b);
    const u = Math.min((boxW - 2 * PAD) / w, (boxH - 2 * BAND) / h);   // mm per cell
    const pad = PAD / u, band = BAND / u, sx = m.start % w, ex = m.end % w;
    let d = '';
    // horizontal walls (line y lies between rows y-1 and y), long runs joined into one stroke
    for (let y = 0; y <= h; y++) {
      let run = -1;
      for (let x = 0; x <= w; x++) {
        const wall = x < w && (y === 0 ? x !== sx : y === h ? x !== ex : !open(id(x, y - 1), id(x, y)));
        if (wall && run < 0) run = x;
        if (!wall && run >= 0) { d += `M${run} ${y}H${x}`; run = -1; }
      }
    }
    for (let x = 0; x <= w; x++) {
      let run = -1;
      for (let y = 0; y <= h; y++) {
        const wall = y < h && (x === 0 || x === w || !open(id(x - 1, y), id(x, y)));
        if (wall && run < 0) run = y;
        if (!wall && run >= 0) { d += `M${x} ${run}V${y}`; run = -1; }
      }
    }
    let s = `<svg viewBox="${f(-pad)} ${f(-band)} ${f(w + 2 * pad)} ${f(h + 2 * band)}" style="width:${f((w + 2 * pad) * u)}mm" xmlns="http://www.w3.org/2000/svg">`;
    if (opts.solved) {
      const tail = 1.5 / u;
      s += `<path d="M${sx + 0.5} ${f(-tail)}${m.path.map(c => `L${c % w + 0.5} ${Math.floor(c / w) + 0.5}`).join('')}L${ex + 0.5} ${f(h + tail)}" ${pathStyle(u)}/>`;
    }
    s += `<path d="${d}" ${wallStyle(u)}/>`;
    // the emoji over the entrance and under the exit, kept inside the picture
    const e = EMOJI / u, clamp = x => Math.max(0.55 * e - pad, Math.min(w + pad - 0.55 * e, x));
    if (opts.from) s += emoji(opts.from, clamp(sx + 0.5), -band / 2, e);
    if (opts.to) s += emoji(opts.to, clamp(ex + 0.5), h + band / 2, e);
    return s + '</svg>';
  }

  function svgRound(m, boxW, boxH, opts) {
    const R = m.rings, { count } = m, open = (a, b) => m.links[a].includes(b);
    const id = (k, j) => k ? m.first[k] + (j % count[k] + count[k]) % count[k] : 0;
    const u = Math.min((boxW - 2 * PAD) / (2 * R), (boxH - BAND - PAD) / (2 * R));
    const pad = PAD / u, band = BAND / u, TAU = 2 * Math.PI;
    const pt = (r, a) => `${f(r * Math.sin(a))} ${f(-r * Math.cos(a))}`;   // angle clockwise from the top
    const arc = (r, a1, a2) => Math.abs(a2 - a1) < 1e-9 ? '' : `A${f(r)} ${f(r)} 0 0 ${a2 > a1 ? 1 : 0} ${pt(r, a2)}`;
    let d = '';
    for (let k = 1; k < R; k++) for (let j = 0; j < count[k]; j++) {
      const a1 = j * TAU / count[k], a2 = (j + 1) * TAU / count[k], c = id(k, j);
      if (!open(c, inward(count, k, j, id))) d += `M${pt(k, a1)}${arc(k, a1, a2)}`;
      if (!open(c, id(k, j + 1))) d += `M${pt(k, a2)}L${pt(k + 1, a2)}`;
      if (k === R - 1 && c !== m.start) d += `M${pt(R, a1)}${arc(R, a1, a2)}`;
    }
    const angle = c => c ? (m.pos[c] + 0.5) * TAU / count[m.ring[c]] : 0;
    const radius = c => c ? m.ring[c] + 0.5 : 0;
    const sa = angle(m.start);
    let s = `<svg viewBox="${f(-R - pad)} ${f(-R - band)} ${f(2 * R + 2 * pad)} ${f(2 * R + band + pad)}" style="width:${f((2 * R + 2 * pad) * u)}mm" xmlns="http://www.w3.org/2000/svg">`;
    if (opts.solved) {
      // Points in the middle of each corridor: a step to another ring goes along the radius through the
      // middle of the outer cell, so the line never runs to a cell's middle and back. Points on the same
      // ring are joined by an arc, the others by a straight line.
      const P = m.path, pts = [[R + 1.5 / u, sa]];
      const via = i => angle(m.ring[P[i]] > m.ring[P[i + 1]] ? P[i] : P[i + 1]);   // radius of step i → i+1
      for (let i = 0; i < P.length; i++) {
        const r = radius(P[i]);
        const inA = i === 0 ? sa : m.ring[P[i - 1]] !== m.ring[P[i]] ? via(i - 1) : null;
        const outA = i < P.length - 1 && m.ring[P[i + 1]] !== m.ring[P[i]] ? via(i) : null;
        if (inA !== null) pts.push([r, inA]);
        if (outA !== null) pts.push([r, outA]);
        if (inA === null && outA === null) pts.push([r, angle(P[i])]);
      }
      let p = `M${pt(...pts[0])}`, cur = pts[0][1];
      for (let i = 1; i < pts.length; i++) {
        const [r, a] = pts[i], to = cur + ((a - cur + 3 * Math.PI) % TAU - Math.PI);   // the short way round
        p += r === pts[i - 1][0] ? arc(r, cur, to) : `L${pt(r, a)}`;
        cur = to;
      }
      s += `<path d="${p}" ${pathStyle(u)}/>`;
    }
    s += `<path d="${d}" ${wallStyle(u)}/>`;
    if (opts.from) s += emoji(opts.from, (R + band / 2) * Math.sin(sa), -(R + band / 2) * Math.cos(sa), EMOJI / u);
    if (opts.to) s += emoji(opts.to, 0, 0, Math.min(EMOJI / u, 1.35));
    return s + '</svg>';
  }

  return { THEMES, THEME_IDS, ringCounts, carve, bfs, rect, round, svg };
})();
if (typeof module !== 'undefined') module.exports = MAZE;
