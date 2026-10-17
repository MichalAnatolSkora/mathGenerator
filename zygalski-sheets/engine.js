/**
 * Zygalski sheets (Płachty Zygalskiego): a paper version of the perforated sheets Henryk Zygalski used in
 * 1938 to find the Enigma settings. Classic script; defines the global `ZYG` (also exported for Node).
 *
 *   ZYG.LEVELS                       → easy (4×4, 3 sheets), medium (6×6, 4 sheets), hard (6×6, 4 sheets, shifted)
 *   ZYG.round(rnd, level)            → { n, k, shift, answer, table: [Set], sheets: [{ dx, dy, holes: Set }] }
 *   ZYG.cutRound(rnd)                → a round for cutting out: 5×5, 3 sheets, no shift
 *   ZYG.svg(n, cells, opts)          → a grid as an SVG string
 *   ZYG.machine(order, rings, plug)  → Enigma I (rotors I–III, reflector B) with rings and plugboard: .encrypt(start, text),
 *                                      .step(window), .trace(window, key) (the current's way through the parts)
 *   ZYG.encrypt(order, start, text)  → the same with rings at A and no plugboard
 *   ZYG.realSheet(order, left)       → a real sheet: 26 rows (middle rotor) × 26 (right rotor), true = hole
 *   ZYG.day(rnd)                     → one day of traffic with a daily key, solvable with the sheets in one way
 *   ZYG.females / layout / solve     → the females of a day, how to lay their sheets, every place light comes through
 *   ZYG.realSvg(sheet, opts)         → that sheet drawn 51 × 51, as Zygalski drew it
 *   ZYG.message(rnd, n, answer)      → a German message enciphered from a round's answer and the paper Enigma table to read it
 *   ZYG.paper(plain, middle, right)  → the same for any text, with only the rows it needs (the worked example)
 *
 * Cells are numbers y·n + x. `table[s]` holds the holes of sheet s where they land on the light table (after
 * the shift); `sheets[s].holes` holds them where they are printed on the sheet. A sheet printed with a hole at
 * (x, y) and shift (dx, dy) lights the table at ((x + dx) mod n, (y + dy) mod n), like Zygalski's sheets, which
 * were drawn twice over (51×51) so they could slide against each other.
 * Every round: exactly one cell is a hole in every sheet, and every sheet is needed to find it.
 *
 * A real sheet: rotor order and left rotor position fixed, a square for every middle × right rotor position.
 * The square is a hole when the 1st and 4th key presses from that position can turn one letter into the same
 * letter (some x with E1(x) = E4(x)), i.e. when a doubled key could show a "female" there. The plugboard does
 * not change that, which is why the method worked without knowing it.
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

  /**
   * A grid as an SVG string, one cell = 10 units, width in mm.
   * cells[i] = { hole, text, hi }; opts: { w, coords (letters A… along both sides, as on Zygalski's sheets), cut (grey squares to cut out
   * instead of round holes, dashed outline), top (a caption strip above the grid that stays on the cut-out piece) }.
   */
  function svg(n, cells, o = {}) {
    const C = 10, m = o.coords ? 6 : 0.6, top = o.top ? 8 : 0;
    const W = n * C + m + 0.6, H = n * C + m + top + 0.6, x0 = m, y0 = m + top;
    const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:${o.w}mm;max-width:100%" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">`;
    if (o.top) {
      s += `<rect x="${x0}" y="${m}" width="${n * C}" height="${top}" fill="#f1f1f1" stroke="#333" stroke-width="0.4"/>`;
      const fs = Math.min(4.2, (n * C - 4) / ([...o.top].length * 0.62));   // long captions shrink to fit
      s += `<text x="${x0 + n * C / 2}" y="${m + top / 2}" font-size="${fs.toFixed(2)}" font-weight="700" text-anchor="middle" dominant-baseline="central">${esc(o.top)}</text>`;
    }
    if (o.coords) for (let i = 0; i < n; i++) {
      s += `<text x="${x0 + i * C + C / 2}" y="${m / 2 + 0.3}" font-size="3.6" fill="#777" text-anchor="middle" dominant-baseline="central">${'ABCDEFGHIJ'[i]}</text>`;
      s += `<text x="${m / 2}" y="${y0 + i * C + C / 2}" font-size="3.6" fill="#777" text-anchor="middle" dominant-baseline="central">${'ABCDEFGHIJ'[i]}</text>`;
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

  /* ---------- a real sheet: Enigma I as in 1938 ---------- */
  const ROTORS = {
    I: ['EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q'],
    II: ['AJDKSIRUXBLHWTMCQGZNPYFVOE', 'E'],
    III: ['BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V'],
  };
  const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';
  const code = ch => ch.charCodeAt(0) - 65;
  const mod = x => ((x % 26) + 26) % 26;

  /** order = rotor names left → right, e.g. ['I', 'II', 'III']. */
  function rotors(order) {
    return order.map(name => {
      const [w, notch] = ROTORS[name], fwd = [...w].map(code), inv = Array(26);
      fwd.forEach((o, i) => { inv[o] = i; });
      return { fwd, inv, notch: code(notch) };
    });
  }
  /** The window letters [left, middle, right] after one key press (with the middle rotor's double step). */
  function step(rs, [l, m, r]) {
    if (m === rs[1].notch) { l = mod(l + 1); m = mod(m + 1); } else if (r === rs[2].notch) m = mod(m + 1);
    return [l, m, mod(r + 1)];
  }
  /** The machine's letter swap at window letters `pos`, as an array (rings at A). */
  function perm(rs, pos) {
    const out = [];
    for (let x = 0; x < 26; x++) {
      let c = x;
      for (let i = 2; i >= 0; i--) c = mod(rs[i].fwd[mod(c + pos[i])] - pos[i]);
      c = code(REFLECTOR_B[c]);
      for (let i = 0; i < 3; i++) c = mod(rs[i].inv[mod(c + pos[i])] - pos[i]);
      out.push(c);
    }
    return out;
  }
  /** The swaps of the next `n` key presses from window letters `start`. */
  function perms(rs, start, n) {
    const out = [];
    let pos = start;
    for (let i = 0; i < n; i++) { pos = step(rs, pos); out.push(perm(rs, pos)); }
    return out;
  }
  const letter = i => String.fromCharCode(65 + mod(i));

  /**
   * An Enigma I: order = rotor names left → right, rings = the ring letters (Ringstellung, default AAA),
   * plug = the plugboard pairs, e.g. 'AQ BT …'. machine.perm(window) is the letter swap with the rotors showing
   * `window` (numbers), machine.encrypt(start, text) types `text` from the window letters `start`.
   */
  function machine(order, rings = 'AAA', plug = '') {
    const rs = rotors(order), rg = [...rings].map(code), sw = Array.from({ length: 26 }, (_, i) => i);
    for (const pr of plug.split(/\s+/).filter(Boolean)) { sw[code(pr[0])] = code(pr[1]); sw[code(pr[1])] = code(pr[0]); }
    const swap = win => { const p = perm(rs, win.map((w, i) => mod(w - rg[i]))); return sw.map(x => sw[p[x]]); };
    return {
      perm: swap,
      step: win => step(rs, win),
      /**
       * Where the current goes when key x is pressed with the rotors showing `win` (numbers, after the step): the
       * machine's fixed contacts 0–25 (A–Z) as [key, plugboard, right, middle, left, reflector, left, middle, right,
       * lamp] — the contact after each part. The last one is swap(win)[x].
       */
      trace(win, x) {
        const p = win.map((w, i) => mod(w - rg[i])), out = [x, sw[x]];
        let c = sw[x];
        for (let i = 2; i >= 0; i--) out.push(c = mod(rs[i].fwd[mod(c + p[i])] - p[i]));
        out.push(c = code(REFLECTOR_B[c]));
        for (let i = 0; i < 3; i++) out.push(c = mod(rs[i].inv[mod(c + p[i])] - p[i]));
        out.push(sw[c]);
        return out;
      },
      encrypt(start, text) {
        let win = [...start].map(code);
        return [...text].map(ch => { win = step(rs, win); return letter(swap(win)[code(ch)]); }).join('');
      },
    };
  }
  const encrypt = (order, start, text) => machine(order).encrypt(start, text);

  /**
   * A real sheet, as Zygalski computed it: the middle rotor is taken not to turn during the six letters of the
   * key, so a square (middle m, right r) is a hole when the swaps at (left, m, r + 1) and (left, m, r + 4) send
   * some letter to the same letter. Cached; 26 rows (middle) × 26 (right), true = hole.
   */
  const SHEETS = {};
  function realSheet(order, left) {
    const k = order.join('-') + left;
    if (SHEETS[k]) return SHEETS[k];
    const rs = rotors(order), l = code(left);
    return (SHEETS[k] = Array.from({ length: 26 }, (_, m) => Array.from({ length: 26 }, (__, r) => {
      const e1 = perm(rs, [l, m, mod(r + 1)]), e4 = perm(rs, [l, m, mod(r + 4)]);
      return e1.some((y, x) => y === e4[x]);
    })));
  }

  /* ---------- one day of traffic, for the full version ---------- */
  const ORDERS = [['I', 'II', 'III'], ['I', 'III', 'II'], ['II', 'I', 'III'], ['II', 'III', 'I'], ['III', 'I', 'II'], ['III', 'II', 'I']];

  /** The females of a list of messages: { msg (index), type (0: letters 1/4, 1: 2/5, 2: 3/6) }. */
  function females(messages) {
    const out = [];
    messages.forEach((m, i) => { for (let t = 0; t < 3; t++) if (m.ind[t] === m.ind[t + 3]) out.push({ msg: i, type: t }); });
    return out;
  }
  /**
   * How to lay the sheet of each female against the first one. Window letters G = (L, M, R) of the female's
   * message, R' = R + type. Sheet = s + (L − L₁) for the trial s; the square (row M − M₁, column R' − R'₁) of
   * that sheet goes on the corner square (a, a) of the first sheet.
   */
  function layout(messages, fems) {
    const g = f => [...messages[f.msg].ground].map(code), f0 = g(fems[0]), r0 = f0[2] + fems[0].type;
    return fems.map(f => { const [l, m, r] = g(f); return { ...f, dl: mod(l - f0[0]), row: mod(m - f0[1]), col: mod(r + f.type - r0) }; });
  }
  /** Every (rotor order, trial s, row y, column x) where light comes through all the sheets. */
  function solve(messages, fems, orders = ORDERS) {
    const lay = layout(messages, fems), hits = [];
    for (const order of orders) for (let s0 = 0; s0 < 26; s0++) {
      const sheets = lay.map(f => realSheet(order, letter(s0 + f.dl)));
      for (let y = 0; y < 26; y++) for (let x = 0; x < 26; x++) {
        if (lay.every((f, j) => sheets[j][(y + f.row) % 26][(x + f.col) % 26])) hits.push({ order, s: s0, y, x });
      }
    }
    return hits;
  }
  /**
   * One day of 1938 traffic: a daily key (rotor order, rings, plugboard) and messages, each with its ground
   * setting (sent in the clear) and the doubled message key enciphered from there (6 letters). Ground settings
   * where the middle rotor would turn during the key are left out. Messages are added until the females single
   * out one answer over all six rotor orders and all 26 trials.
   */
  function day(rnd, { minFemales = 10, maxMessages = 132 } = {}) {
    const pick = () => letter(Math.floor(rnd() * 26));
    for (let tries = 0; tries < 40; tries++) {
      const order = ORDERS[Math.floor(rnd() * 6)], rings = pick() + pick() + pick();
      const pool = [...Array(26).keys()];
      for (let i = 25; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const plug = Array.from({ length: 6 }, (_, i) => letter(pool[2 * i]) + letter(pool[2 * i + 1])).join(' ');
      const m = machine(order, rings, plug), nr = code(ROTORS[order[2]][1]), nm = code(ROTORS[order[1]][1]);
      const messages = [];
      let found = 0;
      while (messages.length < maxMessages) {
        const ground = pick() + pick() + pick(), [, gm, gr] = [...ground].map(code);
        if (gm === nm || [0, 1, 2, 3, 4, 5].some(k => mod(gr + k) === nr)) continue;
        const key = pick() + pick() + pick();
        messages.push({ ground, key, ind: m.encrypt(ground, key + key) });
        const fems = females(messages);
        if (fems.length === found || fems.length < minFemales) { found = fems.length; continue; }
        found = fems.length;
        const hits = solve(messages, fems);
        if (hits.length === 1) {
          const f0 = fems[0], [l, mm, r] = [...messages[f0.msg].ground].map(code), rg = [...rings].map(code);
          return { order, rings, plug, messages, females: layout(messages, fems), answer: hits[0],
            truth: { s: mod(l - rg[0]), y: mod(mm - rg[1]), x: mod(r + f0.type - rg[2]) } };
        }
      }
    }
    throw new Error('no day found');
  }

  /** A real sheet as an SVG string, 51 × 51 squares with the letters around, the first 26 × 26 framed (o.w mm wide). */
  function realSvg(sheet, o = {}) {
    const N = 51, C = 10, M = 18, W = M + N * C + 1;
    const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    const letter = i => String.fromCharCode(97 + i % 26);
    let s = `<svg viewBox="0 0 ${W} ${W}" style="width:${o.w}mm;max-width:100%" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">`;
    s += `<text x="${M}" y="5" font-size="6.5" font-weight="700" fill="#444" dominant-baseline="central">${esc(o.right || '')}</text>`;
    s += `<text transform="translate(5 ${M}) rotate(90)" font-size="6.5" font-weight="700" fill="#444" dominant-baseline="central">${esc(o.middle || '')}</text>`;
    for (let i = 0; i < N; i++) {
      s += `<text x="${M + i * C + C / 2}" y="${M - 4}" font-size="5.6" fill="#555" text-anchor="middle" dominant-baseline="central">${letter(i)}</text>`;
      s += `<text x="${M - 4}" y="${M + i * C + C / 2}" font-size="5.6" fill="#555" text-anchor="middle" dominant-baseline="central">${letter(i)}</text>`;
    }
    // on paper the holes are black; for film (o.film) everything but the holes is black, so light passes the holes
    let ink = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (sheet[y % 26][x % 26] !== !!o.film) ink += o.film ? `M${M + x * C} ${M + y * C}h10v10h-10z` : `M${M + x * C + 1.2} ${M + y * C + 1.2}h7.6v7.6h-7.6z`;
    }
    s += `<path d="${ink}" fill="${o.film ? '#000' : '#222'}"/>`;
    let grid = '';
    for (let i = 0; i <= N; i++) grid += `M${M + i * C} ${M}V${M + N * C}M${M} ${M + i * C}H${M + N * C}`;
    s += `<path d="${grid}" stroke="#bbb" stroke-width="0.4" fill="none"/>`;
    s += `<rect x="${M}" y="${M}" width="${26 * C}" height="${26 * C}" fill="none" stroke="#c0252b" stroke-width="1.6"/>`;
    s += `<rect x="${M}" y="${M}" width="${N * C}" height="${N * C}" fill="none" stroke="#222" stroke-width="1"/>`;
    return s + '</svg>';
  }

  /* ---------- the message to decipher on paper: Enigma I, rotors II I III, rings at A, no plugboard ---------- */
  // German, as in 1938, with X between words (Enigma had no space); Ü written UE
  const MESSAGES = ['TREFFENXAMXFLUSS', 'ZUGXUMXNEUN', 'WETTERXGUT', 'BRUECKEXFREI', 'FLUGZEUGXLANDET', 'SCHIFFXIMXHAFEN', 'POSTXUMXACHT', 'NEBELXIMXTAL'];
  const MSG_ORDER = ['II', 'I', 'III'];   // middle rotor I turns the left one only at Q, right rotor III the middle one at V: never in the table
  /**
   * A message enciphered from the window letters A, middle, right of a round's answer (row = middle, column = right),
   * and the paper Enigma that reads it: one row per right rotor letter B … (n − 1 + length), each the machine's letter
   * swap with the windows A, middle, that letter. Letter i (from 0) of the message is read in row right + i + 1.
   */
  function message(rnd, n, answer) {
    const plain = MESSAGES[Math.floor(rnd() * MESSAGES.length)], m = machine(MSG_ORDER);
    const middle = Math.floor(answer / n), right = answer % n;
    const rows = Array.from({ length: n - 1 + plain.length }, (_, i) => ({ right: i + 1, swap: m.perm([0, middle, i + 1]) }));
    return { plain, left: 0, middle, right, cipher: m.encrypt(letter(0) + letter(middle) + letter(right), plain), rows };
  }

  /** Any text enciphered the same way from A, middle, right, with just the rows that read it (right + 1 …). */
  function paper(plain, middle, right) {
    const m = machine(MSG_ORDER);
    return { plain, left: 0, middle, right, cipher: m.encrypt(letter(0) + letter(middle) + letter(right), plain),
      rows: [...plain].map((_, i) => ({ right: right + i + 1, swap: m.perm([0, middle, right + i + 1]) })) };
  }

  return { LEVELS, round, cutRound, svg, ROTORS, REFLECTOR_B, ORDERS, MESSAGES, message, paper, machine, encrypt, realSheet, realSvg, females, layout, solve, day };
})();
if (typeof module !== 'undefined') module.exports = ZYG;
