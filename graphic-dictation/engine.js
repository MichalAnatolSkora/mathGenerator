/**
 * Graphic dictation — shared engine for the online game (index.html) and the printable worksheet (worksheet.html).
 * Classic script; defines the global `DICT` (also exported for Node: `node engine.test.js`).
 *
 * A picture is one closed outline on squared paper: a list of corner points [x, y] (x to the right,
 * y down, in squares). Every side goes along the grid lines (→ ← ↑ ↓) or, on the hard level, also
 * across the squares (↗ ↘ ↙ ↖).
 *   DICT.PICS                       → the pictures { id, level, emoji, themes, pts }
 *   DICT.pool(level, theme)         → the pictures of a level: everyday ('basic'), Catholic motifs ('faith') or 'all'
 *   DICT.rng(seed)                  → seeded random numbers 0..1 (same seed ⇒ same worksheet)
 *   DICT.variant(pic, rnd)          → the same picture, maybe mirrored, walked the other way, from another corner
 *   DICT.steps(pts)                 → the dictation: [{ dir: 'R'|'L'|'U'|'D'|'UR'|'DR'|'DL'|'UL', n }]
 *   DICT.expr(n, kind, rnd)         → n as a sum/difference ('add') or a product/quotient ('mul'): { a, op, b }
 *   DICT.arrow(dir)                 → an arrow as an SVG string
 *   DICT.grid(opts)                 → squared paper with the start dot and (part of) the outline, as an SVG string
 */
const DICT = (() => {
  const LEVEL_IDS = ['easy', 'medium', 'hard'];
  const DIRS = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1], UR: [1, -1], DR: [1, 1], DL: [-1, 1], UL: [-1, -1] };
  const DIR_IDS = Object.keys(DIRS);
  const dirOf = (dx, dy) => DIR_IDS.find(k => DIRS[k][0] === Math.sign(dx) && DIRS[k][1] === Math.sign(dy));

  /* ---------- pictures ---------- */
  const PICS = [
    // easy: along the lines, few steps
    { id: 'cactus', level: 'easy', emoji: '🌵', pts: [[3, 0], [5, 0], [5, 5], [6, 5], [6, 2], [8, 2], [8, 7], [5, 7], [5, 10], [3, 10], [3, 6], [0, 6], [0, 1], [2, 1], [2, 4], [3, 4]] },
    { id: 'chair', level: 'easy', emoji: '🪑', pts: [[0, 0], [1, 0], [1, 4], [5, 4], [5, 8], [4, 8], [4, 5], [1, 5], [1, 8], [0, 8]] },
    { id: 'table', level: 'easy', emoji: '', pts: [[0, 0], [9, 0], [9, 1], [8, 1], [8, 5], [7, 5], [7, 1], [2, 1], [2, 5], [1, 5], [1, 1], [0, 1]] },
    { id: 'key', level: 'easy', emoji: '🔑', pts: [[0, 0], [3, 0], [3, 1], [9, 1], [9, 3], [8, 3], [8, 2], [7, 2], [7, 3], [6, 3], [6, 2], [3, 2], [3, 3], [0, 3]] },
    { id: 'mushroom', level: 'easy', emoji: '🍄', pts: [[2, 0], [6, 0], [6, 1], [7, 1], [7, 2], [8, 2], [8, 4], [5, 4], [5, 8], [3, 8], [3, 4], [0, 4], [0, 2], [1, 2], [1, 1], [2, 1]] },
    { id: 'shirt', level: 'easy', emoji: '👕', pts: [[0, 0], [3, 0], [3, 1], [5, 1], [5, 0], [8, 0], [8, 3], [6, 3], [6, 8], [2, 8], [2, 3], [0, 3]] },
    { id: 'car', level: 'easy', emoji: '🚗', pts: [[2, 0], [7, 0], [7, 2], [10, 2], [10, 5], [9, 5], [9, 6], [7, 6], [7, 5], [3, 5], [3, 6], [1, 6], [1, 5], [0, 5], [0, 2], [2, 2]] },
    // medium: along the lines, longer
    { id: 'elephant', level: 'medium', emoji: '🐘', pts: [[0, 0], [4, 0], [4, 2], [11, 2], [11, 3], [12, 3], [12, 5], [11, 5], [11, 8], [9, 8], [9, 6], [6, 6], [6, 8], [4, 8], [4, 5], [2, 5], [2, 8], [1, 8], [1, 5], [0, 5]] },
    { id: 'giraffe', level: 'medium', emoji: '🦒', pts: [[6, 1], [7, 1], [7, 0], [8, 0], [8, 1], [10, 1], [10, 3], [8, 3], [8, 10], [7, 10], [7, 13], [6, 13], [6, 10], [3, 10], [3, 13], [2, 13], [2, 10], [1, 10], [1, 8], [0, 8], [0, 7], [6, 7]] },
    { id: 'dog', level: 'medium', emoji: '🐕', pts: [[1, 1], [2, 1], [2, 0], [3, 0], [3, 1], [4, 1], [4, 4], [10, 4], [10, 2], [11, 2], [11, 9], [10, 9], [10, 7], [5, 7], [5, 9], [4, 9], [4, 6], [3, 6], [3, 4], [0, 4], [0, 2], [1, 2]] },
    { id: 'duck', level: 'medium', emoji: '🦆', pts: [[5, 0], [8, 0], [8, 1], [10, 1], [10, 2], [8, 2], [8, 4], [9, 4], [9, 6], [8, 6], [8, 7], [1, 7], [1, 6], [0, 6], [0, 3], [1, 3], [1, 4], [5, 4]] },
    { id: 'robot', level: 'medium', emoji: '🤖', pts: [[3, 0], [4, 0], [4, 1], [6, 1], [6, 4], [5, 4], [5, 5], [8, 5], [8, 8], [7, 8], [7, 10], [6, 10], [6, 13], [5, 13], [5, 10], [3, 10], [3, 13], [2, 13], [2, 10], [1, 10], [1, 8], [0, 8], [0, 5], [3, 5], [3, 4], [2, 4], [2, 1], [3, 1]] },
    { id: 'train', level: 'medium', emoji: '🚂', pts: [[1, 1], [3, 1], [3, 3], [6, 3], [6, 1], [5, 1], [5, 0], [11, 0], [11, 1], [10, 1], [10, 7], [9, 7], [9, 8], [7, 8], [7, 7], [6, 7], [6, 8], [4, 8], [4, 7], [3, 7], [3, 8], [1, 8], [1, 7], [0, 7], [0, 3], [1, 3]] },
    { id: 'castle', level: 'medium', emoji: '🏰', pts: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 0], [3, 0], [3, 3], [4, 3], [4, 2], [5, 2], [5, 3], [6, 3], [6, 2], [7, 2], [7, 3], [8, 3], [8, 0], [9, 0], [9, 1], [10, 1], [10, 0], [11, 0], [11, 10], [7, 10], [7, 7], [4, 7], [4, 10], [0, 10]] },
    // hard: also across the squares
    { id: 'crown', level: 'hard', emoji: '👑', pts: [[0, 0], [2, 2], [4, 0], [6, 2], [8, 0], [8, 6], [0, 6]] },
    { id: 'heart', level: 'hard', emoji: '❤️', pts: [[4, 2], [6, 0], [7, 0], [8, 1], [8, 3], [4, 7], [0, 3], [0, 1], [1, 0], [2, 0]] },
    { id: 'fish', level: 'hard', emoji: '🐟', themes: ['basic', 'faith'], pts: [[0, 3], [3, 0], [5, 0], [7, 2], [9, 0], [9, 6], [7, 4], [5, 6], [3, 6]] },
    { id: 'house', level: 'hard', emoji: '🏠', pts: [[0, 4], [4, 0], [6, 2], [6, 0], [7, 0], [7, 3], [8, 4], [8, 10], [5, 10], [5, 7], [3, 7], [3, 10], [0, 10]] },
    { id: 'boat', level: 'hard', emoji: '⛵', pts: [[0, 7], [5, 7], [5, 0], [10, 5], [6, 5], [6, 7], [11, 7], [9, 9], [2, 9]] },
    { id: 'rocket', level: 'hard', emoji: '🚀', pts: [[4, 0], [6, 2], [6, 8], [8, 10], [8, 12], [6, 10], [2, 10], [0, 12], [0, 10], [2, 8], [2, 2]] },
    { id: 'tree', level: 'hard', emoji: '🌲', pts: [[5, 0], [8, 3], [6, 3], [9, 6], [7, 6], [10, 9], [6, 9], [6, 11], [4, 11], [4, 9], [0, 9], [3, 6], [1, 6], [4, 3], [2, 3]] },
    { id: 'umbrella', level: 'hard', emoji: '☂️', pts: [[0, 4], [4, 0], [6, 0], [10, 4], [6, 4], [6, 9], [3, 9], [3, 7], [4, 7], [4, 8], [5, 8], [5, 4]] },
    { id: 'cat', level: 'hard', emoji: '🐈', pts: [[1, 0], [3, 2], [5, 2], [7, 0], [7, 5], [6, 6], [8, 8], [8, 11], [9, 11], [9, 7], [10, 7], [10, 12], [0, 12], [0, 8], [2, 6], [1, 5]] },
    { id: 'fox', level: 'hard', emoji: '🦊', pts: [[2, 0], [4, 2], [8, 2], [10, 0], [10, 4], [12, 6], [6, 12], [0, 6], [2, 4]] },
    { id: 'gem', level: 'hard', emoji: '💎', pts: [[2, 0], [8, 0], [10, 2], [5, 7], [0, 2]] },
    // Catholic motifs (theme 'faith'); the fish above (ichthys) belongs to both themes
    { id: 'cross', level: 'easy', emoji: '✝️', themes: ['faith'], pts: [[2, 0], [4, 0], [4, 3], [6, 3], [6, 5], [4, 5], [4, 11], [2, 11], [2, 5], [0, 5], [0, 3], [2, 3]] },
    { id: 'chapel', level: 'easy', emoji: '', themes: ['faith'], pts: [[3, 0], [4, 0], [4, 1], [5, 1], [5, 2], [4, 2], [4, 3], [7, 3], [7, 10], [0, 10], [0, 3], [3, 3], [3, 2], [2, 2], [2, 1], [3, 1]] },
    { id: 'bell', level: 'easy', emoji: '🔔', themes: ['faith'], pts: [[3, 0], [5, 0], [5, 1], [6, 1], [6, 5], [7, 5], [7, 6], [8, 6], [8, 7], [0, 7], [0, 6], [1, 6], [1, 5], [2, 5], [2, 1], [3, 1]] },
    { id: 'chalice', level: 'medium', emoji: '', themes: ['faith'], pts: [[0, 0], [8, 0], [8, 2], [7, 2], [7, 4], [5, 4], [5, 8], [7, 8], [7, 9], [1, 9], [1, 8], [3, 8], [3, 4], [1, 4], [1, 2], [0, 2]] },
    { id: 'church', level: 'medium', emoji: '⛪', themes: ['faith'], pts: [[2, 0], [3, 0], [3, 1], [4, 1], [4, 2], [3, 2], [3, 4], [5, 4], [5, 7], [12, 7], [12, 14], [8, 14], [8, 11], [6, 11], [6, 14], [0, 14], [0, 4], [2, 4], [2, 2], [1, 2], [1, 1], [2, 1]] },
    { id: 'shrine', level: 'medium', emoji: '', themes: ['faith'], pts: [[3, 0], [4, 0], [4, 1], [5, 1], [5, 2], [4, 2], [4, 3], [7, 3], [7, 4], [6, 4], [6, 8], [5, 8], [5, 14], [6, 14], [6, 15], [1, 15], [1, 14], [2, 14], [2, 8], [1, 8], [1, 4], [0, 4], [0, 3], [3, 3], [3, 2], [2, 2], [2, 1], [3, 1]] },
    { id: 'candle', level: 'hard', emoji: '🕯️', themes: ['faith'], pts: [[3, 0], [5, 2], [5, 3], [4, 4], [4, 5], [6, 5], [6, 13], [0, 13], [0, 5], [2, 5], [2, 4], [1, 3], [1, 2]] },
    { id: 'tablets', level: 'hard', emoji: '', themes: ['faith'], pts: [[0, 10], [0, 2], [2, 0], [3, 0], [5, 2], [7, 0], [8, 0], [10, 2], [10, 10], [6, 10], [5, 9], [4, 10]] },
    { id: 'angel', level: 'hard', emoji: '👼', themes: ['faith'], pts: [[5, 0], [7, 0], [7, 2], [8, 3], [11, 0], [12, 0], [12, 4], [9, 7], [9, 8], [11, 10], [11, 12], [1, 12], [1, 10], [3, 8], [3, 7], [0, 4], [0, 0], [1, 0], [4, 3], [5, 2]] },
    { id: 'dove', level: 'hard', emoji: '🕊️', themes: ['faith'], pts: [[0, 5], [2, 7], [9, 7], [11, 5], [12, 5], [11, 4], [10, 4], [9, 5], [8, 5], [8, 0], [3, 5]] },
    { id: 'star', level: 'hard', emoji: '⭐', themes: ['faith'], pts: [[2, 2], [4, 2], [6, 0], [8, 2], [10, 2], [10, 4], [12, 6], [10, 8], [10, 10], [8, 10], [6, 12], [4, 10], [2, 10], [2, 8], [0, 6], [2, 4]] },
  ];

  const THEME_IDS = ['basic', 'faith', 'all'];
  for (const p of PICS) if (!p.themes) p.themes = ['basic'];
  /** The pictures of a level and theme ('basic' everyday things, 'faith' Catholic motifs, 'all'). */
  const pool = (level, theme = 'basic') => PICS.filter(p => p.level === level && (theme === 'all' || p.themes.includes(theme)));

  /* ---------- seeded random ---------- */
  /** mulberry32 on a string hash: a small seeded generator. */
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

  /* ---------- outlines ---------- */
  const size = pts => ({ w: Math.max(...pts.map(p => p[0])) - Math.min(...pts.map(p => p[0])), h: Math.max(...pts.map(p => p[1])) - Math.min(...pts.map(p => p[1])) });
  /** Moved so the smallest x and y are 0. */
  function normalize(pts) {
    const mx = Math.min(...pts.map(p => p[0])), my = Math.min(...pts.map(p => p[1]));
    return pts.map(([x, y]) => [x - mx, y - my]);
  }
  /** The same picture, maybe mirrored (left ↔ right), walked the other way round, starting from another corner. */
  function variant(pic, rnd, opts = {}) {
    let pts = pic.pts.map(p => p.slice());
    const mirror = opts.mirror !== undefined ? opts.mirror : rnd() < 0.5;
    if (mirror) { const w = size(pts).w; pts = pts.map(([x, y]) => [w - x, y]); }
    if (opts.reverse !== undefined ? opts.reverse : rnd() < 0.5) pts.reverse();
    const start = opts.start !== undefined ? opts.start : Math.floor(rnd() * pts.length);
    pts = pts.slice(start).concat(pts.slice(0, start));
    return { id: pic.id, emoji: pic.emoji, level: pic.level, pts: normalize(pts), mirror };
  }
  /** The dictation of a closed outline that starts at pts[0]: one step per side. */
  function steps(pts) {
    return pts.map((p, i) => {
      const q = pts[(i + 1) % pts.length], dx = q[0] - p[0], dy = q[1] - p[1];
      return { dir: dirOf(dx, dy), n: Math.max(Math.abs(dx), Math.abs(dy)) };
    });
  }
  const diagonal = dir => dir.length === 2;

  /* ---------- the numbers as sums or products ---------- */
  /** n written as a + b, a − b ('add') or a × b, a ÷ b ('mul'); null for the plain number. Results stay small:
   *  sums and differences use numbers up to 10 (12 for n above 8), products come from the times table up to 5 × 10. */
  function expr(n, kind, rnd) {
    if (kind === 'add') {
      const opts = [];
      for (let a = 1; a < n; a++) opts.push({ a, op: '+', b: n - a });
      for (let b = 1; n + b <= Math.max(10, n + 3); b++) opts.push({ a: n + b, op: '-', b });
      // about half sums, half differences
      const sums = opts.filter(o => o.op === '+'), diffs = opts.filter(o => o.op === '-');
      return pick(rnd, sums.length && rnd() < 0.5 ? sums : diffs);
    }
    if (kind === 'mul') {
      const prods = [];
      for (let a = 2; a <= 5; a++) if (n % a === 0 && n / a >= 2) prods.push({ a, op: '×', b: n / a }, { a: n / a, op: '×', b: a });
      const quots = [];
      for (let b = 2; b <= 5; b++) if (n * b <= 50) quots.push({ a: n * b, op: '÷', b });
      return pick(rnd, prods.length && rnd() < 0.5 ? prods : quots);
    }
    return null;
  }
  const value = e => e.op === '+' ? e.a + e.b : e.op === '-' ? e.a - e.b : e.op === '×' ? e.a * e.b : e.a / e.b;

  /* ---------- drawing ---------- */
  const ANGLE = { R: 0, DR: 45, D: 90, DL: 135, L: 180, UL: 225, U: 270, UR: 315 };
  /** A bold arrow pointing in `dir`, 1em high. */
  function arrow(dir, cls = '') {
    return `<svg class="arrow ${cls}" viewBox="-12 -12 24 24" aria-hidden="true"><g transform="rotate(${ANGLE[dir]})">`
      + `<path d="M-9 0H6M1-6 7 0 1 6" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
  }
  /**
   * Squared paper as an SVG string.
   * opts: { cols, rows, ox, oy (where the outline's 0,0 sits, in squares), cell (one square in user units, default 10),
   *         start: [x, y] (the red dot), path: [[x, y]…] (the line drawn so far), shape: [[x, y]…] (a closed outline to
   *         colour in with `fill`), pen: [x, y] (the pencil), target: [x, y] (a hint circle), ink, lineColor, cls }
   * Points are outline coordinates (squares from the outline's 0,0).
   */
  function grid(o) {
    const c = o.cell || 10, W = o.cols * c, H = o.rows * c, f = n => Math.round(n * 100) / 100;
    const P = ([x, y]) => `${f((o.ox + x) * c)} ${f((o.oy + y) * c)}`;
    let s = `<svg class="grid ${o.cls || ''}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    let lines = '';
    for (let i = 0; i <= o.cols; i++) lines += `M${i * c} 0V${H}`;
    for (let j = 0; j <= o.rows; j++) lines += `M0 ${j * c}H${W}`;
    s += `<path d="${lines}" stroke="${o.lineColor || '#a9c3e8'}" stroke-width="${f(c * 0.05)}" fill="none"/>`;
    if (o.shape && o.fill) s += `<path class="fillshape" d="M${o.shape.map(P).join('L')}Z" fill="${o.fill}"/>`;
    if (o.path && o.path.length > 1) {
      s += `<path class="drawn" d="M${o.path.map(P).join('L')}" fill="none" stroke="${o.ink || '#1e2436'}" stroke-width="${f(c * (o.inkWidth || 0.2))}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    const dot = (p, r, attrs) => { const [x, y] = P(p).split(' '); return `<circle cx="${x}" cy="${y}" r="${f(c * r)}" ${attrs}/>`; };
    if (o.target) s += dot(o.target, 0.45, `class="target" fill="none" stroke="#f08c00" stroke-width="${f(c * 0.12)}"`);
    if (o.start) s += dot(o.start, 0.26, 'fill="#d6455a"');
    if (o.pen) s += dot(o.pen, 0.3, `class="pen" fill="#4f5bd5" stroke="#fff" stroke-width="${f(c * 0.08)}"`);
    return s + '</svg>';
  }

  return { LEVEL_IDS, THEME_IDS, pool, DIRS, DIR_IDS, PICS, rng, pick, int, size, normalize, variant, steps, diagonal, expr, value, arrow, grid, dirOf };
})();
if (typeof module !== 'undefined') module.exports = DICT;
