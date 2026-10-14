/**
 * Picture sudoku — engine of the printable worksheet. Classic script; defines the global `SUDOKU`
 * (also exported for Node: `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) for the random helpers.
 *
 * A 4×4 board has 2×2 boxes, a 6×6 board 2-row × 3-column boxes. Every row, column and box holds every
 * symbol once. Symbols are numbers 0..n-1 here; the page draws them as shapes, fruit, animals, colours or digits.
 *   SUDOKU.LEVELS[id]           → { n, blanks }: board size and how many empty squares to aim for
 *   SUDOKU.solution(rnd, n)     → a random full board (rows of symbol numbers)
 *   SUDOKU.count(grid, n, max)  → how many solutions a board with nulls has (stops at max)
 *   SUDOKU.puzzle(rnd, level)   → { n, sol, grid, blanks }: empty squares removed one by one while the
 *                                  solution stays unique
 *   SUDOKU.SETS / svg(…)        → the symbol sets and a board as an SVG string
 */
const SUDOKU = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');
  const BOX = { 4: [2, 2], 6: [2, 3] };   // box height × width
  const LEVELS = {
    easy: { n: 4, blanks: 5 },
    medium: { n: 4, blanks: 8 },
    hard: { n: 4, blanks: 12 },   // as many as uniqueness allows (a unique 4×4 needs at least 4 symbols)
    big: { n: 6, blanks: 16 },
  };
  const range = n => Array.from({ length: n }, (_, i) => i);

  function solution(rnd, n) {
    const [bh, bw] = BOX[n];
    const base = (r, c) => (bw * (r % bh) + Math.floor(r / bh) + c) % n;
    const rows = [].concat(...K.shuffle(rnd, range(n / bh)).map(b => K.shuffle(rnd, range(bh)).map(i => b * bh + i)));
    const cols = [].concat(...K.shuffle(rnd, range(n / bw)).map(s => K.shuffle(rnd, range(bw)).map(i => s * bw + i)));
    const sym = K.shuffle(rnd, range(n));
    return rows.map(r => cols.map(c => sym[base(r, c)]));
  }

  const fits = (g, n, r, c, v) => {
    const [bh, bw] = BOX[n];
    for (let i = 0; i < n; i++) if (g[r][i] === v || g[i][c] === v) return false;
    const r0 = r - r % bh, c0 = c - c % bw;
    for (let i = 0; i < bh; i++) for (let j = 0; j < bw; j++) if (g[r0 + i][c0 + j] === v) return false;
    return true;
  };
  /** Number of solutions of `grid` (null = empty), counting stops at `max`. */
  function count(grid, n, max = 2) {
    const g = grid.map(r => r.slice());
    let found = 0;
    (function go(k) {
      if (found >= max) return;
      while (k < n * n && g[Math.floor(k / n)][k % n] !== null) k++;
      if (k === n * n) { found++; return; }
      const r = Math.floor(k / n), c = k % n;
      for (let v = 0; v < n && found < max; v++) if (fits(g, n, r, c, v)) { g[r][c] = v; go(k + 1); g[r][c] = null; }
    })(0);
    return found;
  }

  function puzzle(rnd, level) {
    const { n, blanks } = LEVELS[level];
    const sol = solution(rnd, n), grid = sol.map(r => r.slice());
    let removed = 0;
    for (const k of K.shuffle(rnd, range(n * n))) {
      if (removed >= blanks) break;
      const r = Math.floor(k / n), c = k % n, v = grid[r][c];
      grid[r][c] = null;
      if (count(grid, n) === 1) removed++; else grid[r][c] = v;
    }
    return { n, level, sol, grid, blanks: removed };
  }

  /* ---------- drawing ---------- */
  // what the child does with an empty square: draw the shape, colour it, or write the number
  const SETS = {
    shapes: { act: 'draw' },
    fruits: { act: 'draw', emoji: ['🍎', '🍌', '🍇', '🍓', '🍐', '🍒'] },
    animals: { act: 'draw', emoji: ['🐶', '🐱', '🐭', '🐰', '🐸', '🐻'] },
    colors: { act: 'color', fill: ['#e5484d', '#3e7bfa', '#f5c518', '#30a46c', '#f76b15', '#8e4ec6'] },
    numbers: { act: 'write' },
  };
  const SET_IDS = Object.keys(SETS);
  const SHAPE_FILL = ['#ffd2d2', '#cfe0ff', '#fff0a8', '#c9f0d6', '#ffe0c2', '#e6d5fa'];
  /** Symbol v drawn in a 1×1 square at (x, y); `pale` = the answer key's filled-in squares. */
  function symbol(set, v, x, y, ink) {
    const cx = x + 0.5, cy = y + 0.5, f = n => Math.round(n * 1000) / 1000;
    if (set === 'shapes') {
      const st = `fill="${SHAPE_FILL[v]}" stroke="${ink}" stroke-width="0.055" stroke-linejoin="round"`;
      const r = 0.3;
      switch (v) {
        case 0: return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" ${st}/>`;
        case 1: return `<rect x="${f(cx - 0.27)}" y="${f(cy - 0.27)}" width="0.54" height="0.54" ${st}/>`;
        case 2: return `<path d="M${f(cx)} ${f(cy - 0.3)}L${f(cx + 0.32)} ${f(cy + 0.26)}H${f(cx - 0.32)}Z" ${st}/>`;
        case 3: {
          let d = '';
          for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.14 : 0.34; d += (i ? 'L' : 'M') + f(cx + rr * Math.cos(a)) + ' ' + f(cy + 0.03 + rr * Math.sin(a)); }
          return `<path d="${d}Z" ${st}/>`;
        }
        case 4: return `<path d="M${f(cx)} ${f(cy + 0.29)}C${f(cx - 0.42)} ${f(cy)} ${f(cx - 0.3)} ${f(cy - 0.36)} ${f(cx)} ${f(cy - 0.14)}C${f(cx + 0.3)} ${f(cy - 0.36)} ${f(cx + 0.42)} ${f(cy)} ${f(cx)} ${f(cy + 0.29)}Z" ${st}/>`;
        default: return `<path d="M${f(cx)} ${f(cy - 0.32)}L${f(cx + 0.27)} ${f(cy)}L${f(cx)} ${f(cy + 0.32)}L${f(cx - 0.27)} ${f(cy)}Z" ${st}/>`;
      }
    }
    if (set === 'colors') return `<rect x="${f(x + 0.08)}" y="${f(y + 0.08)}" width="0.84" height="0.84" rx="0.12" fill="${SETS.colors.fill[v]}"/>`;
    const txt = set === 'numbers' ? String(v + 1) : SETS[set].emoji[v];
    const size = set === 'numbers' ? 0.62 : 0.6;
    return `<text x="${f(cx)}" y="${f(cy)}" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="${ink}"`
      + `${set === 'numbers' ? ' font-weight="700" font-family="system-ui,sans-serif"' : ''}>${txt}</text>`;
  }
  /**
   * A board as an SVG string, one square = 1 unit; width in mm.
   * opts: { solved: true → fill in the empty squares (answer key, on a pale yellow background) }
   */
  function svg(p, set, widthMM, opts = {}) {
    const n = p.n, [bh, bw] = BOX[n];
    let s = `<svg viewBox="-0.05 -0.05 ${n + 0.1} ${n + 0.1}" style="width:${widthMM}mm" xmlns="http://www.w3.org/2000/svg">`;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const given = p.grid[r][c] !== null;
      if (!given && opts.solved) s += `<rect x="${c}" y="${r}" width="1" height="1" fill="#fff6c9"/>`;
      if (given) s += symbol(set, p.grid[r][c], c, r, '#1b1b1f');
      else if (opts.solved) s += symbol(set, p.sol[r][c], c, r, '#3d48b8');
    }
    let thin = '', thick = '';
    for (let i = 1; i < n; i++) {
      if (i % bw) thin += `M${i} 0V${n}`; else thick += `M${i} 0V${n}`;   // box edges are thick
      if (i % bh) thin += `M0 ${i}H${n}`; else thick += `M0 ${i}H${n}`;
    }
    s += `<path d="${thin}" stroke="#8a93a6" stroke-width="0.025" fill="none"/>`;
    s += `<path d="${thick}" stroke="#1b1b1f" stroke-width="0.07" fill="none"/>`;
    s += `<rect x="0" y="0" width="${n}" height="${n}" fill="none" stroke="#1b1b1f" stroke-width="0.09" rx="0.04"/>`;
    return s + '</svg>';
  }
  /** The symbols of a set, in a row (the legend above the boards). */
  function legend(set, n, heightMM) {
    let s = `<svg viewBox="0 0 ${n * 1.15} 1" style="height:${heightMM}mm;width:auto;display:inline-block;vertical-align:middle" xmlns="http://www.w3.org/2000/svg">`;
    for (let v = 0; v < n; v++) s += `<g transform="translate(${v * 1.15} 0)">${symbol(set, v, 0, 0, '#1b1b1f')}</g>`;
    return s + '</svg>';
  }

  return { BOX, LEVELS, SETS, SET_IDS, solution, count, puzzle, svg, legend };
})();
if (typeof module !== 'undefined') module.exports = SUDOKU;
