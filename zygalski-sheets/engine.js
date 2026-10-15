/**
 * Zygalski sheets (Płachty Zygalskiego): a paper version of the perforated sheets Henryk Zygalski used in
 * 1938 to find the Enigma settings. Classic script; defines the global `ZYG` (also exported for Node).
 *
 *   ZYG.LEVELS                       → easy (4×4, 3 sheets), medium (6×6, 4 sheets), hard (6×6, 4 sheets, shifted)
 *   ZYG.round(rnd, level)            → { n, k, shift, answer, table: [Set], sheets: [{ dx, dy, holes: Set }] }
 *   ZYG.cutRound(rnd)                → a round for cutting out: 5×5, 3 sheets, no shift
 *   ZYG.board(rnd, n, answer, word, pool) → n·n labels, `word` at the answer, other labels from `pool`
 *   ZYG.svg(n, cells, opts)          → a grid as an SVG string
 *
 * Cells are numbers y·n + x. `table[s]` holds the holes of sheet s where they land on the light table (after
 * the shift); `sheets[s].holes` holds them where they are printed on the sheet. A sheet printed with a hole at
 * (x, y) and shift (dx, dy) lights the table at ((x + dx) mod n, (y + dy) mod n), like Zygalski's sheets, which
 * were drawn twice over (51×51) so they could slide against each other.
 * Every round: exactly one cell is a hole in every sheet, and every sheet is needed to find it.
 */
const ZYG = (() => {
  const LEVELS = {
    easy: { n: 4, k: 3, shift: false, p: 0.45 },
    medium: { n: 6, k: 4, shift: false, p: 0.42 },
    hard: { n: 6, k: 4, shift: true, p: 0.42 },
    cut: { n: 5, k: 3, shift: false, p: 0.36 },
  };

  const inAll = (sets, c) => sets.every(s => s.has(c));

  /** Holes on the light table: the answer in every sheet, no other cell in all of them, no sheet unneeded. */
  function tableHoles(rnd, n, k, p) {
    const N = n * n;
    for (let tries = 0; tries < 500; tries++) {
      const answer = Math.floor(rnd() * N);
      const sets = Array.from({ length: k }, () => {
        const s = new Set([answer]);
        for (let c = 0; c < N; c++) if (rnd() < p) s.add(c);
        return s;
      });
      for (let c = 0; c < N; c++) if (c !== answer && inAll(sets, c)) sets[Math.floor(rnd() * k)].delete(c);
      // every sheet must cross out something the others leave: drop any one sheet ⇒ more than one cell is left
      const needed = sets.every((_, i) => {
        const rest = sets.filter((__, j) => j !== i);
        let left = 0;
        for (let c = 0; c < N; c++) if (inAll(rest, c)) left++;
        return left > 1;
      });
      const sizes = sets.every(s => s.size >= Math.round(N * 0.25) && s.size <= Math.round(N * 0.6));
      if (needed && sizes) return { answer, sets };
    }
    throw new Error('no round found');
  }

  function round(rnd, level) {
    const L = LEVELS[level];
    const { n, k } = L;
    const { answer, sets } = tableHoles(rnd, n, k, L.p);
    const sheets = sets.map((set, i) => {
      let dx = 0, dy = 0;
      if (L.shift && i > 0) do { dx = Math.floor(rnd() * 3); dy = Math.floor(rnd() * 3); } while (!dx && !dy);
      const holes = new Set();
      for (const c of set) {
        const x = c % n, y = Math.floor(c / n);
        holes.add(((y - dy + n) % n) * n + (x - dx + n) % n);
      }
      return { dx, dy, holes };
    });
    return { level, n, k, shift: L.shift, answer, table: sets, sheets };
  }

  const cutRound = rnd => round(rnd, 'cut');

  /** Labels of the light table: the word at the answer, the rest drawn from the pool (never the word itself). */
  function board(rnd, n, answer, word, pool) {
    const others = pool.filter(w => w !== word);
    const out = [];
    for (let c = 0; c < n * n; c++) out.push(c === answer ? word : others[Math.floor(rnd() * others.length)]);
    return out;
  }

  /**
   * A grid as an SVG string, one cell = 10 units, width in mm.
   * cells[i] = { hole, text, hi, mark }; opts: { w, coords (A…, 1… around the grid), cut (grey squares to cut out
   * instead of round holes, dashed outline), top (a caption strip above the grid that stays on the cut-out piece) }.
   */
  function svg(n, cells, o = {}) {
    const C = 10, m = o.coords ? 6 : 0.6, top = o.top ? 8 : 0;
    const W = n * C + m + 0.6, H = n * C + m + top + 0.6, x0 = m, y0 = m + top;
    const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:${o.w}mm;max-width:100%" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">`;
    if (o.top) {
      s += `<rect x="${x0}" y="${m}" width="${n * C}" height="${top}" fill="#f1f1f1" stroke="#333" stroke-width="0.4"/>`;
      s += `<text x="${x0 + n * C / 2}" y="${m + top / 2}" font-size="4.2" font-weight="700" text-anchor="middle" dominant-baseline="central">${esc(o.top)}</text>`;
    }
    if (o.coords) for (let i = 0; i < n; i++) {
      s += `<text x="${x0 + i * C + C / 2}" y="${m / 2 + 0.3}" font-size="3.6" fill="#777" text-anchor="middle" dominant-baseline="central">${'ABCDEFGHIJ'[i]}</text>`;
      s += `<text x="${m / 2}" y="${y0 + i * C + C / 2}" font-size="3.6" fill="#777" text-anchor="middle" dominant-baseline="central">${i + 1}</text>`;
    }
    cells.forEach((cell, i) => {
      const x = x0 + (i % n) * C, y = y0 + Math.floor(i / n) * C;
      const fill = cell.hi ? '#ffe36b' : (cell.hole && o.cut) ? '#b9b9b9' : '#fff';
      s += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${fill}" stroke="#999" stroke-width="0.25"/>`;
      if (cell.hole && !o.cut) s += `<circle cx="${x + C / 2}" cy="${y + C / 2}" r="3.1" fill="#222"/>`;
      if (cell.text) {
        const fs = cell.text.length <= 2 ? 4.2 : cell.text.length <= 3 ? 3.5 : cell.text.length <= 4 ? 2.8 : 2.3;
        s += `<text x="${x + C / 2}" y="${y + C / 2 + 0.2}" font-size="${fs}" font-weight="600" text-anchor="middle" dominant-baseline="central">${esc(cell.text)}</text>`;
      }
    });
    const dash = o.cut ? ' stroke-dasharray="2 1.2"' : '';
    s += `<rect x="${x0}" y="${m}" width="${n * C}" height="${n * C + top}" fill="none" stroke="#222" stroke-width="0.7"${dash}/>`;
    return s + '</svg>';
  }

  return { LEVELS, round, cutRound, board, svg };
})();
if (typeof module !== 'undefined') module.exports = ZYG;
