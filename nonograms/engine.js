/**
 * Mini nonograms (picture logic) — engine of the printable worksheet. Classic script; defines the global
 * `NONO` (also exported for Node: `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) for the random helpers.
 *
 * The numbers left of a row and above a column say how many squares in a row to colour; several numbers =
 * several groups with at least one empty square between them. The coloured squares make a picture.
 *   NONO.PICS[n]               → the hand-drawn n×n pictures ({ id, rows: ['.##.', …] }, '#' = coloured)
 *   NONO.clues(line)           → the groups of a line of 0/1, e.g. [1,1,0,1] → [2, 1] (empty line → [])
 *   NONO.solveLine(clue, line) → what the clue alone tells about a line of -1 (unknown) / 0 / 1, null = impossible
 *   NONO.logic(rows, cols)     → the grid after line solving only (no guessing; -1 where still unknown)
 *   NONO.count(rows, cols, max)→ how many solutions the clues have (line solving + backtracking, stops at max)
 *   NONO.puzzle(pic, mirror, rnd) → { n, id, sol, rows, cols, start, given }: clues, the "start here" lines
 *                                  (filled by the clue alone) and a few squares pre-coloured for the little ones
 *   NONO.pick(rnd, n, k, avoid)→ k different puzzles of size n (maybe mirrored), none of the ids in `avoid`
 *   NONO.svg(p, cellMM, opts)  → a puzzle as an SVG string
 */
const NONO = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');

  /* ---------- the pictures ---------- */
  // Drawn by hand, '#' = coloured. Every one has exactly one solution and comes out by line solving alone
  // (no guessing) — engine.test.js checks it. Names are in strings.js (`pics`).
  const P = (id, ...rows) => ({ id, rows });
  const PICS = {
    5: [
      P('heart', '.#.#.', '#####', '#####', '.###.', '..#..'),
      P('house', '..#..', '.###.', '#####', '##.##', '##.##'),
      P('arrow', '..#..', '.###.', '#####', '..#..', '..#..'),
      P('face', '.###.', '#.#.#', '#####', '#...#', '.###.'),
      P('cross', '..#..', '#####', '..#..', '..#..', '..#..'),
      P('boat', '...#.', '..##.', '.###.', '#####', '.###.'),
      P('cat', '#...#', '#####', '#.#.#', '#####', '.###.'),
      P('star', '..#..', '#####', '.###.', '.#.#.', '#...#'),
      P('tulip', '#.#.#', '#####', '.###.', '..#..', '.###.'),
      P('cup', '#..#.', '#..##', '#..##', '####.', '#####'),
      P('umbrella', '.###.', '#####', '..#..', '..#..', '.##..'),
      P('bell', '..#..', '.###.', '.###.', '#####', '..#..'),
      P('rocket', '..#..', '.###.', '.###.', '.###.', '#.#.#'),
      P('ladder', '#...#', '#####', '#...#', '#####', '#...#'),
      P('chair', '#....', '#....', '#####', '#...#', '#...#'),
      P('table', '#####', '#...#', '#...#', '#...#', '#...#'),
      P('tshirt', '##.##', '#####', '.###.', '.###.', '.###.'),
      P('crown', '..#..', '#.#.#', '#.#.#', '#####', '#####'),
      P('ghost', '.###.', '#.#.#', '#####', '#####', '#.#.#'),
      P('sun', '#.#.#', '.###.', '#####', '.###.', '#.#.#'),
      P('moon', '..###', '.##..', '##...', '.##..', '..###'),
      P('apple', '...#.', '.###.', '#####', '#####', '.###.'),
      P('bowtie', '#...#', '##.##', '#####', '##.##', '#...#'),
      P('hourglass', '#####', '.###.', '..#..', '.###.', '#####'),
      P('window', '#####', '#.#.#', '#####', '#.#.#', '#####'),
      P('mushroom', '.###.', '#####', '#####', '..#..', '.###.'),
      P('duck', '.##..', '###..', '.#..#', '.####', '.###.'),
    ],
    8: [
      P('mug', '.#..#...', '..#..#..', '######..', '########', '######.#', '########', '######..', '.####...'),
      P('fir', '...##...', '..####..', '.######.', '..####..', '.######.', '########', '...##...', '...##...'),
      P('house', '...#..#.', '..###.#.', '.######.', '########', '.#.##.#.', '.######.', '.###..#.', '.###..#.'),
      P('rocket', '...##...', '..####..', '..#..#..', '..#..#..', '..####..', '..####..', '.######.', '##.##.##'),
      P('cat', '#......#', '##....##', '########', '#.####.#', '########', '###..###', '.######.', '..####..'),
      P('sailboat', '...#....', '...##...', '...###..', '...####.', '...#####', '...#....', '########', '.######.'),
      P('castle', '##.##.##', '########', '########', '##.##.##', '########', '###..###', '###..###', '###..###'),
      P('robot', '...##...', '.######.', '.#.##.#.', '.######.', '########', '#.####.#', '..####..', '..#..#..'),
      P('rabbit', '.#....#.', '.##..##.', '.##..##.', '########', '##.##.##', '########', '.##..##.', '..####..'),
      P('mushroom', '..####..', '.##..##.', '########', '#.####.#', '########', '...##...', '...##...', '..####..'),
      P('icecream', '..####..', '.######.', '.######.', '########', '.######.', '..####..', '...##...', '...##...'),
      P('star', '...##...', '...##...', '########', '.######.', '..####..', '.######.', '.##..##.', '##....##'),
    ],
    10: [
      P('butterfly', '...#..#...', '....##....', '###.##.###', '##########', '##########', '.########.', '..######..', '.########.', '##########', '.###..###.'),
      P('elephant', '....#####.', '..########', '.##.######', '##########', '#.########', '#..#######', '#..##..##.', '##.##..##.', '...##..##.', '...##..##.'),
      P('owl', '##......##', '###....###', '##########', '#..####..#', '#..####..#', '####..####', '##########', '.########.', '.##.##.##.', '..#....#..'),
      P('frog', '.###..###.', '##.####.##', '##########', '##########', '#........#', '##......##', '.########.', '..######..', '.##....##.', '###....###'),
      P('strawberry', '..#.##.#..', '...####...', '.########.', '##.####.##', '####.#####', '##.####.##', '.###.####.', '.########.', '..######..', '...####...'),
      P('snowman', '...####...', '...####...', '##########', '..#.##.#..', '..######..', '...####...', '..######..', '.###.####.', '.########.', '..######..'),
      P('penguin', '...####...', '..######..', '..#.##.#..', '..######..', '.##....##.', '##......##', '##......##', '.##....##.', '..##..##..', '##########'),
      P('tree', '..######..', '.########.', '##########', '##.#######', '######.###', '.########.', '..######..', '....##....', '....##....', '..######..'),
      P('anchor', '...####...', '...#..#...', '...####...', '....##....', '.########.', '....##....', '#...##...#', '##..##..##', '..######..', '...####...'),
      P('plane', '....##....', '....##....', '...####...', '##########', '##########', '....##....', '....##....', '...####...', '..######..', '....##....'),
      P('bear', '.##....##.', '####..####', '##########', '.########.', '.#.####.#.', '.########.', '.###..###.', '.###..###.', '..######..', '...####...'),
      P('fish', '........##', '........##', '....####..', '#..######.', '##.####.##', '##########', '##.#######', '#..######.', '....####..', '.....##...'),
      P('sunflower', '...####...', '..##..##..', '..#....#..', '..##..##..', '...####...', '....##....', '###.##.###', '.##.##.##.', '..######..', '..######..'),
      P('cupcake', '....##....', '...####...', '.########.', '##########', '##########', '.########.', '.#.#..#.#.', '.########.', '..######..', '..######..'),
    ],
  };
  const SIZES = Object.keys(PICS).map(Number);

  /* ---------- clues and solving ---------- */
  /** Group lengths of a line of 0/1 (or '#'/'.' string). */
  function clues(line) {
    const out = []; let run = 0;
    for (const v of line) { if (v === 1 || v === '#') run++; else if (run) { out.push(run); run = 0; } }
    if (run) out.push(run);
    return out;
  }
  const toGrid = rows => rows.map(r => [...r].map(ch => ch === '#' ? 1 : 0));

  /**
   * Everything the clue says about a line (cells -1 unknown, 0 empty, 1 coloured): every placement of the
   * groups that fits the known cells, then the cells that are the same in all of them. null = no placement fits.
   */
  function solveLine(clue, line) {
    const n = line.length;
    let canEmpty = Array(n).fill(false), canFill = Array(n).fill(false), any = false;
    const cur = Array(n).fill(0);
    // place group g at or after position `from`; cells before `from` are already written in `cur`
    (function place(g, from) {
      if (g === clue.length) {
        for (let i = from; i < n; i++) if (line[i] === 1) return;
        any = true;
        for (let i = 0; i < n; i++) { const v = i < from ? cur[i] : 0; if (v) canFill[i] = true; else canEmpty[i] = true; }
        return;
      }
      let rest = 0; for (let k = g + 1; k < clue.length; k++) rest += clue[k] + 1;
      for (let s = from; s + clue[g] + rest <= n; s++) {
        if (s > from && line[s - 1] === 1) break;                       // a coloured cell left uncovered
        let fits = true;
        for (let i = s; i < s + clue[g]; i++) if (line[i] === 0) { fits = false; break; }
        const end = s + clue[g];
        if (fits && end < n && line[end] === 1) fits = false;             // the group would be longer
        if (!fits) continue;
        for (let i = from; i < s; i++) cur[i] = 0;
        for (let i = s; i < end; i++) cur[i] = 1;
        if (end < n) cur[end] = 0;
        place(g + 1, Math.min(n, end + 1));
      }
    })(0, 0);
    if (!any) return null;
    return line.map((v, i) => canFill[i] && canEmpty[i] ? -1 : canFill[i] ? 1 : 0);
  }

  /** Line solving until nothing changes. Returns the grid (-1 = unknown) or null on a contradiction. */
  function propagate(rows, cols, grid) {
    const h = rows.length, w = cols.length;
    const g = grid.map(r => r.slice());
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 0; r < h; r++) {
        const res = solveLine(rows[r], g[r]);
        if (!res) return null;
        for (let c = 0; c < w; c++) if (res[c] !== g[r][c]) { g[r][c] = res[c]; changed = true; }
      }
      for (let c = 0; c < w; c++) {
        const res = solveLine(cols[c], g.map(r => r[c]));
        if (!res) return null;
        for (let r = 0; r < h; r++) if (res[r] !== g[r][c]) { g[r][c] = res[r]; changed = true; }
      }
    }
    return g;
  }
  const blank = (h, w) => Array.from({ length: h }, () => Array(w).fill(-1));
  /** The grid line solving alone reaches from an empty grid. */
  const logic = (rows, cols) => propagate(rows, cols, blank(rows.length, cols.length));

  /** Number of solutions (stops at max): line solving, then guessing on the first unknown cell. */
  function count(rows, cols, max = 2) {
    let found = 0;
    (function go(grid) {
      if (found >= max) return;
      const g = propagate(rows, cols, grid);
      if (!g) return;
      for (let r = 0; r < g.length; r++) for (let c = 0; c < g[r].length; c++) if (g[r][c] === -1) {
        for (const v of [1, 0]) { const t = g.map(x => x.slice()); t[r][c] = v; go(t); if (found >= max) return; }
        return;
      }
      found++;
    })(blank(rows.length, cols.length));
    return found;
  }

  /* ---------- the puzzles of a sheet ---------- */
  /** Lines the clue fills alone (groups + gaps = the whole line): where the little ones can start. */
  const isFull = (clue, n) => clue.length > 0 && clue.reduce((a, b) => a + b, 0) + clue.length - 1 === n;

  /**
   * A puzzle from a picture; mirror = flipped left↔right. The few pre-coloured squares (help for the little
   * ones) come from `rnd`, never on a "start here" line, at most one per row.
   */
  function puzzle(pic, mirror, rnd) {
    const sol = toGrid(mirror ? pic.rows.map(r => [...r].reverse().join('')) : pic.rows);
    const n = sol.length;
    const rows = sol.map(clues), cols = sol[0].map((_, c) => clues(sol.map(r => r[c])));
    const start = { rows: rows.map(c => isFull(c, n)), cols: cols.map(c => isFull(c, n)) };
    const free = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (sol[r][c] && !start.rows[r] && !start.cols[c]) free.push([r, c]);
    const given = [], usedRows = new Set();
    for (const [r, c] of K.shuffle(rnd, free)) {
      if (given.length >= Math.round(n / 2) - 1) break;   // 5×5: 2, 8×8: 3, 10×10: 4
      if (usedRows.has(r)) continue;
      usedRows.add(r); given.push([r, c]);
    }
    return { n, id: pic.id, mirror, sol, rows, cols, start, given };
  }
  const symmetric = pic => pic.rows.every(r => r === [...r].reverse().join(''));
  /** k different pictures of size n, each maybe mirrored (when that changes it); `avoid` = ids already on the page. */
  function pick(rnd, n, k, avoid = new Set()) {
    const pics = K.shuffle(rnd, PICS[n].filter(p => !avoid.has(p.id))).slice(0, k);
    if (pics.length < k) throw new Error(`only ${PICS[n].length} pictures of ${n}×${n}`);
    return pics.map(pic => puzzle(pic, !symmetric(pic) && rnd() < 0.5, rnd));
  }

  /* ---------- drawing ---------- */
  const f = v => Math.round(v * 1000) / 1000;
  /** Size of the clue areas (in squares): left = widest row clue, top = tallest column clue. */
  function margins(p) {
    const slot = p.n >= 10 ? 0.74 : 0.62;
    const rc = Math.max(1, ...p.rows.map(c => c.length)), cc = Math.max(1, ...p.cols.map(c => c.length));
    return { slot, left: 0.3 + rc * slot, top: 0.22 + cc * slot };
  }
  /** Width of the drawn puzzle in mm for a square size (so the page can be planned). */
  const widthMM = (p, cellMM) => (margins(p).left + p.n + 0.12) * cellMM;

  /**
   * A puzzle as an SVG string, one square = 1 unit, `cellMM` mm per square.
   * opts: { solved: draw the picture (answer key); help: "start here" lines in yellow with a ★ and the
   * pre-coloured squares }
   */
  function svg(p, cellMM, opts = {}) {
    const { n } = p, { slot, left: L, top: T } = margins(p);
    const help = opts.help && !opts.solved;
    const W = L + n + 0.12, H = T + n + 0.12;
    let s = `<svg viewBox="${f(-L)} ${f(-T)} ${f(W)} ${f(H)}" style="width:${f(W * cellMM)}mm" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif">`;
    // clue areas: pale bands, every other one a little darker so a row's numbers are easy to follow
    for (let i = 0; i < n; i++) {
      const rowBg = help && p.start.rows[i] ? '#ffe680' : i % 2 ? '#e9edf4' : '#f4f6fa';
      const colBg = help && p.start.cols[i] ? '#ffe680' : i % 2 ? '#e9edf4' : '#f4f6fa';
      s += `<rect x="${f(-L)}" y="${i}" width="${f(L)}" height="1" fill="${rowBg}"/>`;
      s += `<rect x="${i}" y="${f(-T)}" width="1" height="${f(T)}" fill="${colBg}"/>`;
      if (help && p.start.rows[i]) s += `<rect x="0" y="${i}" width="${n}" height="1" fill="#fff9d6"/>`;
      if (help && p.start.cols[i]) s += `<rect x="${i}" y="0" width="1" height="${n}" fill="#fff9d6"/>`;
    }
    const fs = n >= 10 ? 0.6 : 0.56;
    const num = (x, y, v) => `<text x="${f(x)}" y="${f(y)}" font-size="${fs}" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#111">${v}</text>`;
    const star = (x, y) => `<text x="${f(x)}" y="${f(y)}" font-size="0.5" text-anchor="middle" dominant-baseline="central" fill="#c27c00">★</text>`;
    for (let r = 0; r < n; r++) {
      const c = p.rows[r].length ? p.rows[r] : [0];
      c.forEach((v, k) => { s += num(-0.15 - (c.length - k - 0.5) * slot, r + 0.53, v); });
      if (help && p.start.rows[r] && (L - 0.3) / slot - c.length >= 1) s += star(-L + 0.35, r + 0.53);
    }
    for (let col = 0; col < n; col++) {
      const c = p.cols[col].length ? p.cols[col] : [0];
      c.forEach((v, k) => { s += num(col + 0.5, -0.1 - (c.length - k - 0.5) * slot, v); });
      if (help && p.start.cols[col] && (T - 0.22) / slot - c.length >= 1) s += star(col + 0.5, -T + 0.32);
    }
    // the squares
    const fill = [];
    if (opts.solved) for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (p.sol[r][c]) fill.push(`M${c} ${r}h1v1h-1z`);
    if (fill.length) s += `<path d="${fill.join('')}" fill="#2b2d33"/>`;
    if (help) s += p.given.map(([r, c]) => `<rect x="${c}" y="${r}" width="1" height="1" fill="#9aa1ae"/>`).join('');
    let thin = '', thick = '';
    for (let i = 1; i < n; i++) {
      if (i % 5) thin += `M${i} 0V${n}M0 ${i}H${n}`; else thick += `M${i} 0V${n}M0 ${i}H${n}`;
      thin += `M${f(-L)} ${i}H0M${i} ${f(-T)}V0`;                         // the clue bands go on outside
    }
    s += `<path d="${thin}" stroke="#8a93a6" stroke-width="0.03" fill="none"/>`;
    if (thick) s += `<path d="${thick}" stroke="#1b1b1f" stroke-width="0.075" fill="none"/>`;
    s += `<rect x="0" y="0" width="${n}" height="${n}" fill="none" stroke="#1b1b1f" stroke-width="0.09"/>`;
    return s + '</svg>';
  }

  /** A short line of squares with its clue in front (the worked example on the sheet): cells '#'/'.'. */
  function example(clue, cells, cellMM) {
    const w = cells.length, L = 0.3 + clue.length * 0.62;
    let s = `<svg viewBox="${f(-L)} -0.06 ${f(L + w + 0.12)} 1.12" style="width:${f((L + w + 0.12) * cellMM)}mm;display:inline-block;vertical-align:middle" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif">`;
    s += `<rect x="${f(-L)}" y="0" width="${f(L)}" height="1" fill="#f4f6fa"/>`;
    clue.forEach((v, k) => { s += `<text x="${f(-0.15 - (clue.length - k - 0.5) * 0.62)}" y="0.53" font-size="0.56" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#111">${v}</text>`; });
    [...cells].forEach((ch, i) => {
      if (ch === '#') s += `<rect x="${i}" y="0" width="1" height="1" fill="#2b2d33"/>`;
      else s += `<circle cx="${i + 0.5}" cy="0.5" r="0.08" fill="#8a93a6"/>`;
    });
    let d = ''; for (let i = 1; i < w; i++) d += `M${i} 0V1`;
    s += `<path d="${d}" stroke="#8a93a6" stroke-width="0.03"/><rect x="0" y="0" width="${w}" height="1" fill="none" stroke="#1b1b1f" stroke-width="0.07"/>`;
    return s + '</svg>';
  }

  return { PICS, SIZES, clues, toGrid, solveLine, propagate, logic, count, isFull, puzzle, pick, symmetric, margins, widthMM, svg, example };
})();
if (typeof module !== 'undefined') module.exports = NONO;
