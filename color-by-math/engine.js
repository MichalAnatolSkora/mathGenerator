/**
 * Colour by maths ("Kolorowanka z działaniami") — engine of the printable worksheet. Classic script; defines the
 * global `CBM` (also exported for Node: `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) for the random helpers.
 *
 * A pixel picture is cut into fields of a few squares of one colour; each field gets a sum (or a difference) and
 * the legend says which result means which colour. Background squares are fields too ("leave white"), so the
 * shape only shows once the child has worked everything out.
 *   CBM.PALETTE              → letter → colour ('.' = white, leave it)
 *   CBM.PICTURES             → hand-drawn pictures { id, rows }
 *   CBM.MATH[kind]           → the kinds of sums: results allowed, which operations, the largest number
 *   CBM.FIELDS[size]         → how many squares a field has
 *   CBM.regions(rnd, rows, size) → fields: { color, cells: [[r, c]…], at: [r, c] (where the sum is written) }
 *   CBM.sums(rnd, kind, v)   → every sum / difference with result v, shuffled
 *   CBM.puzzle(rnd, pic, kind, size) → { id, rows, regions (each with .text and .value), legend: [{ color, value }] }
 *   CBM.svg(p, sq, opts)     → the picture as an SVG string (opts.solved: coloured in, for the answer key)
 */
const CBM = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');

  /* ---------- colours ---------- */
  const PALETTE = {
    '.': '#ffffff', // white: leave it
    k: '#2b2b33',   // black
    s: '#a3abb6',   // grey
    r: '#e5484d',   // red
    p: '#f58fb5',   // pink
    o: '#f7891f',   // orange
    y: '#f5c518',   // yellow
    g: '#3fae5a',   // green
    b: '#3e7bfa',   // blue
    c: '#8fd0f5',   // light blue
    v: '#9254d0',   // violet
    n: '#9a6232',   // brown
  };

  /* ---------- the pictures ---------- */
  // Drawn by hand, one text line per row of squares, 10–12 squares wide. At most seven colours (white counted),
  // since every colour needs its own result.
  const ART = {
    house: `
      .....rr.....
      ....rrrr....
      ...rrrrrr...
      ..rrrrrrrr..
      .rrrrrrrrrr.
      rrrrrrrrrrrr
      .yyyyyyyyyy.
      .yccyyyyccy.
      .yccyyyyccy.
      .yyyynnyyyy.
      .yyyynnyyyy.
      .yyyynnyyyy.
      gggggggggggg
      gggggggggggg`,
    rocket: `
      ....rr....
      ...rrrr...
      ..rrrrrr..
      ..ssssss..
      ..sbbbbs..
      ..sbccbs..
      ..sbbbbs..
      ..ssssss..
      ..ssssss..
      .rssssssr.
      rrssssssrr
      rr.oooo.rr
      ...oyyo...
      ....yy....`,
    fish: `
      cccccccc.ccc
      cccccooooccc
      cccooyoooocc
      ycoooyoookoc
      yyoooyoooooo
      yyyooyoooorr
      yyoooyoooooo
      ycoooyoooooc
      cccooyoooocc
      cccccooooccc
      cc.ccccccccc
      gcccgccccgcc
      gggggggggggg`,
    mushroom: `
      ....rrrr....
      ..rrrrrrrr..
      .rr.rrrr.rr.
      rrrrrr.rrrrr
      rr.rrrrrr.rr
      rrrrrrrrrrrr
      ....nnnn....
      ....nnnn....
      ....nnnn....
      ..g.nnnn.g..
      gggggggggggg
      gggggggggggg`,
    flower: `
      ....pp....
      ..pppppp..
      .pppyyppp.
      .ppyyyypp.
      .pppyyppp.
      ..pppppp..
      ....gg....
      .gg.gg.gg.
      ..gggggg..
      ....gg....
      ....gg....
      .nnnnnnnn.
      ..nnnnnn..
      ..nnnnnn..`,
    ladybird: `
      gggg....gggg
      ggg......ggg
      gg.kk..kk.gg
      ggrrrkkrrrgg
      grrkrkkrkrrg
      rrrrrkkrrrrr
      rkkrrkkrrkkr
      rkkrrkkrrkkr
      rrrrrkkrrrrr
      rrrkrkkrkrrr
      grrrrkkrrrrg
      ggrrrkkrrrgg
      gggrrkkrrggg
      gggggggggggg`,
    car: `
      ............
      ...bbbbbb...
      ..bccbbccb..
      .bbccbbccbb.
      bbbbbbbbbbbb
      ybbbbbbbbbbr
      bbbbbbbbbbbb
      .bkkbbbbkkb.
      ..kk....kk..
      ssssssssssss
      ssyysssyysss
      ssssssssssss`,
    apple: `
      .....n.gg...
      .....ngggg..
      ..rrrnrrrr..
      .rrrrrrrrrr.
      rrprrrrrrrrr
      rpprrrrrrrrr
      rprrrrrrrrrr
      rrrrrrrrrrrr
      rrrrrrrrrrrr
      .rrrrrrrrrr.
      ..rrrrrrrr..
      ...rr..rr...`,
    owl: `
      n..........n
      nn........nn
      nnnnnnnnnnnn
      n...nnnn...n
      n.k.nnnn.k.n
      n...nyyn...n
      nnnnnyynnnnn
      nnoooooooonn
      nnoonoonoonn
      nnoooooooonn
      .nnoonoonnn.
      ..nnnnnnnn..
      ..y.y..y.y..
      kkkkkkkkkkkk`,
    sailboat: `
      .....k......
      .....kr.....
      ....ykrr....
      ...yykrrr...
      ..yyykrrrr..
      .yyyykrrrrr.
      yyyyykrrrrrr
      .....k......
      nnnnnnnnnnnn
      .nnnnnnnnnn.
      ..nnnnnnnn..
      bbbbbbbbbbbb
      bbbbbbbbbbbb`,
    tree: `
      ....gggg....
      ..gggggggg..
      .gggrggggrg.
      gggggggggggg
      ggrggggggggg
      gggggggrgggg
      .gggggggggg.
      ..gggggggg..
      .....nn.....
      .....nn.....
      .....nn.....
      ....nnnn....
      gggggggggggg`,
    icecream: `
      ....rr....
      ...pppp...
      ..pppppp..
      .pppppppp.
      pppppppppp
      yyyyyyyyyy
      .yyyyyyyy.
      oooooooooo
      .onoonoon.
      .oooooooo.
      ..onoono..
      ..oooooo..
      ...onno...
      ....oo....`,
    frog: `
      .ggg....ggg.
      gg.kg..gk.gg
      gggggggggggg
      gggggggggggg
      ggrggggggrgg
      gggrrrrrrggg
      .gggggggggg.
      gg.gggggg.gg
      ggg......ggg
      cccccccccccc
      cccccccccccc`,
    cat: `
      .o........o.
      .oo......oo.
      .ooo....ooo.
      .oooooooooo.
      oookooookooo
      oooooooooooo
      oooooppooooo
      oooookkooooo
      .oooooooooo.
      ..oooooooo..
      ...oooooo...
      ..oooooooo..
      .oooooooooo.
      .oooooooooo.`,
    butterfly: `
      ...k....k...
      vv..k..k..vv
      vvvv.kk.vvvv
      vyyvvkkvvyyv
      vyyvvkkvvyyv
      vvvvvkkvvvvv
      .vvvvkkvvvv.
      ..pppkkppp..
      .ppypkkpypp.
      .pppp..pppp.
      ..pp....pp..`,
  };
  const PICTURES = Object.entries(ART).map(([id, art]) => ({ id, rows: art.trim().split('\n').map(l => l.trim()) }));

  /* ---------- the sums ---------- */
  // results: the results a colour can get (the larger ones have more sums, so they are tried first for the
  // colours with many fields); ops: '+' and/or '−'; max: no number in a sum is larger.
  const MATH = {
    add10: { results: [10, 9, 8, 7, 6, 5, 4], ops: ['+'], max: 10 },
    mix10: { results: [10, 9, 8, 7, 6, 5, 4, 3, 2], ops: ['+', '−'], max: 10 },
    add20: { results: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8], ops: ['+'], max: 20 },
    mix20: { results: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5], ops: ['+', '−'], max: 20 },
  };
  const MINUS = '−';
  /** Every sum with result v (no 0s: a + b with a, b ≥ 1, a − b with b ≥ 1, a ≤ max), shuffled, + and − mixed. */
  function sums(rnd, kind, v) {
    const M = MATH[kind], plus = [], minus = [];
    if (M.ops.includes('+')) for (let a = 1; a < v; a++) plus.push(`${a}+${v - a}`);
    if (M.ops.includes(MINUS)) for (let a = v + 1; a <= M.max; a++) minus.push(`${a}${MINUS}${a - v}`);
    // up to 20, sums like 1+19 and 20−1 are too easy for the point of the sheet: drop them when there are others
    const fair = list => M.max > 10 ? (list.filter(s => !/(^|[+−])1$|^1\+/.test(s)).length ? list.filter(s => !/(^|[+−])1$|^1\+/.test(s)) : list) : list;
    const P = K.shuffle(rnd, fair(plus)), N = K.shuffle(rnd, fair(minus)), out = [];
    // alternate + and −, so a colour does not get only additions
    while (P.length || N.length) {
      if (P.length && (!N.length || rnd() < 0.5)) out.push(P.pop()); else if (N.length) out.push(N.pop());
    }
    return out;
  }
  /** The result of a sum written as text ('3+4', '9−2'). */
  function evaluate(text) {
    const m = /^(\d+)([+−])(\d+)$/.exec(text);
    return m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3];
  }

  /* ---------- fields ---------- */
  // squares per field: the picture's own fields and the background's (bigger, there is more of it)
  const FIELDS = {
    big: { min: 3, max: 5, bgMin: 5, bgMax: 8 },
    small: { min: 2, max: 3, bgMin: 3, bgMax: 5 },
  };
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  /**
   * The picture cut into fields: every field is one colour, joined side by side, of about FIELDS[size] squares.
   * Fields grow from the square with the fewest free neighbours (so no lonely squares are left behind) and take
   * the square that touches the field most (so they stay round). A lonely square left anyway joins a neighbour.
   */
  function regions(rnd, rows, size) {
    const F = FIELDS[size], H = rows.length, W = rows[0].length;
    const id = rows.map(r => [...r].map(() => -1));
    const inside = (r, c) => r >= 0 && r < H && c >= 0 && c < W;
    const color = (r, c) => rows[r][c];
    const free = (r, c, ch) => inside(r, c) && id[r][c] < 0 && color(r, c) === ch;
    const freeNb = (r, c) => NB.filter(([dr, dc]) => free(r + dr, c + dc, color(r, c))).length;
    const list = [];
    // squares in a random order, so ties are broken differently on every sheet
    const order = K.shuffle(rnd, rows.flatMap((row, r) => [...row].map((_, c) => [r, c])));
    for (;;) {
      let start = null, best = 9;
      for (const [r, c] of order) if (id[r][c] < 0) { const n = freeNb(r, c); if (n < best) { best = n; start = [r, c]; } }
      if (!start) break;
      const ch = color(...start), bg = ch === '.';
      const target = K.int(rnd, bg ? F.bgMin : F.min, bg ? F.bgMax : F.max);
      const cells = [start], n = list.length;
      id[start[0]][start[1]] = n;
      while (cells.length < target) {
        let pick = null, score = -1;
        for (const [r, c] of cells) for (const [dr, dc] of NB) {
          const y = r + dr, x = c + dc;
          if (!free(y, x, ch)) continue;
          // touching the field more is better, leaving fewer free neighbours behind is better; a bit of chance
          const touch = NB.filter(([a, b]) => inside(y + a, x + b) && id[y + a][x + b] === n).length;
          const sc = touch * 10 - freeNb(y, x) + rnd();
          if (sc > score) { score = sc; pick = [y, x]; }
        }
        if (!pick) break;
        id[pick[0]][pick[1]] = n; cells.push(pick);
      }
      list.push({ color: ch, cells });
    }
    // lonely squares join the smallest neighbouring field of the same colour
    for (const reg of list) {
      if (reg.cells.length !== 1) continue;
      const [r, c] = reg.cells[0];
      const near = NB.map(([dr, dc]) => [r + dr, c + dc]).filter(([y, x]) => inside(y, x) && color(y, x) === reg.color && id[y][x] !== id[r][c])
        .map(([y, x]) => list[id[y][x]]).sort((a, b) => a.cells.length - b.cells.length);
      if (!near.length) continue;   // a square alone in its colour (an eye): it stays a field of its own
      near[0].cells.push([r, c]); id[r][c] = list.indexOf(near[0]); reg.cells = [];
    }
    const out = list.filter(reg => reg.cells.length);
    // where to write the sum: the square with the most squares of the field around it, nearest the middle
    for (const reg of out) {
      const my = reg.cells.reduce((s, [r]) => s + r, 0) / reg.cells.length, mx = reg.cells.reduce((s, [, c]) => s + c, 0) / reg.cells.length;
      const mine = new Set(reg.cells.map(([r, c]) => r * W + c));
      let best = -1e9;
      for (const [r, c] of reg.cells) {
        const around = NB.filter(([dr, dc]) => mine.has((r + dr) * W + c + dc)).length;
        const sc = around - Math.hypot(r - my, c - mx) * 0.6;
        if (sc > best) { best = sc; reg.at = [r, c]; }
      }
    }
    return out;
  }

  /**
   * A puzzle: the picture (maybe mirrored left↔right), its fields, a result for every colour (random, all
   * different, with enough sums for its fields' neighbours) and a sum for every field.
   * Neighbouring fields never show the same sum.
   */
  function puzzle(rnd, pic, kind, size) {
    const rows = rnd() < 0.5 ? pic.rows : pic.rows.map(r => [...r].reverse().join(''));
    const regs = regions(rnd, rows, size), W = rows[0].length;
    const count = {};
    for (const reg of regs) count[reg.color] = (count[reg.color] || 0) + 1;
    const colors = Object.keys(count).sort((a, b) => count[b] - count[a]);
    const M = MATH[kind];
    // neighbours of every field
    const owner = new Map();
    regs.forEach((reg, i) => reg.cells.forEach(([r, c]) => owner.set(r * W + c, i)));
    const nbs = regs.map((reg, i) => {
      const s = new Set();
      for (const [r, c] of reg.cells) for (const [dr, dc] of NB) {
        if (c + dc < 0 || c + dc >= W) continue;
        const o = owner.get((r + dr) * W + c + dc);
        if (o !== undefined && o !== i) s.add(o);
      }
      return s;
    });
    // a result for every colour, random, all different; a colour whose field touches k fields of its own colour
    // needs a result with more than k sums, so neighbours never have to share a sum
    const n = v => sums(K.rng(''), kind, v).length;
    const need = {};
    regs.forEach((reg, i) => { need[reg.color] = Math.max(need[reg.color] || 1, 1 + [...nbs[i]].filter(j => regs[j].color === reg.color).length); });
    const value = {}, free = K.shuffle(rnd, M.results);
    for (const ch of colors.slice().sort((a, b) => need[b] - need[a])) {
      const fit = free.filter(v => n(v) >= need[ch]);
      const v = fit.length ? fit[0] : free.slice().sort((a, b) => n(b) - n(a))[0];
      value[ch] = v; free.splice(free.indexOf(v), 1);
    }
    // the sums: greedily, each field avoiding its neighbours' sums; a few tries until no neighbours match
    for (let attempt = 0; attempt < 30; attempt++) {
      const deck = {};
      regs.forEach(reg => { reg.text = null; });
      regs.forEach((reg, i) => {
        const v = value[reg.color];
        if (!deck[v] || !deck[v].length) deck[v] = sums(rnd, kind, v);
        const taken = new Set([...nbs[i]].map(j => regs[j].text).filter(Boolean));
        const k = deck[v].findIndex(s => !taken.has(s));
        if (k >= 0) reg.text = deck[v].splice(k, 1)[0];
        else {   // the rest of the deck is all next door: any sum not next door, else (few sums, many neighbours) any
          const all = sums(rnd, kind, v);
          reg.text = all.find(s => !taken.has(s)) || all[0];
        }
        reg.value = v;
      });
      if (regs.every((reg, i) => [...nbs[i]].every(j => regs[j].text !== reg.text))) break;
    }
    const legend = colors.map(ch => ({ color: ch, value: value[ch] })).sort((a, b) => a.value - b.value);
    return { id: pic.id, rows, regions: regs, legend };
  }

  /* ---------- drawing ---------- */
  /**
   * The picture as an SVG string, one square = 1 unit, `sq` mm per square. The fields have thick borders, the
   * squares inside a field faint dotted ones (to colour neatly), each field its sum.
   * opts: { solved: true → coloured in, no sums (answer key) }
   */
  function svg(p, sq, opts = {}) {
    const H = p.rows.length, W = p.rows[0].length, f = n => Math.round(n * 1000) / 1000;
    const owner = p.rows.map(r => [...r].map(() => -1));
    p.regions.forEach((reg, i) => reg.cells.forEach(([r, c]) => { owner[r][c] = i; }));
    let s = `<svg viewBox="-0.05 -0.05 ${W + 0.1} ${H + 0.1}" style="width:${f((W + 0.1) * sq)}mm" xmlns="http://www.w3.org/2000/svg">`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>`;
    if (opts.solved) {
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        const ch = p.rows[r][c];
        if (ch !== '.') s += `<rect x="${c}" y="${r}" width="1.01" height="1.01" fill="${PALETTE[ch]}"/>`;
      }
    }
    let thin = '', thick = '';
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      if (c + 1 < W) { const seg = `M${c + 1} ${r}V${r + 1}`; if (owner[r][c] === owner[r][c + 1]) thin += seg; else thick += seg; }
      if (r + 1 < H) { const seg = `M${c} ${r + 1}H${c + 1}`; if (owner[r][c] === owner[r + 1][c]) thin += seg; else thick += seg; }
    }
    if (!opts.solved) s += `<path d="${thin}" stroke="#c4ccd8" stroke-width="0.025" stroke-dasharray="0.06 0.08" fill="none"/>`;
    s += `<path d="${thick}" stroke="#3a4150" stroke-width="${opts.solved ? 0.04 : 0.06}" stroke-linecap="round" fill="none"/>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#2a2f3a" stroke-width="0.09"/>`;
    if (!opts.solved) {
      const fs = Math.min(0.34, 4.6 / sq);   // ~4.6 mm letters, smaller only on small squares
      for (const reg of p.regions) {
        const [r, c] = reg.at, txt = reg.text.length > 4 ? 0.88 : 1;
        s += `<text x="${c + 0.5}" y="${r + 0.5}" font-size="${f(fs * txt)}" text-anchor="middle" dominant-baseline="central" `
          + `font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" font-weight="600" fill="#1d2230">${reg.text}</text>`;
      }
    }
    return s + '</svg>';
  }

  return { PALETTE, PICTURES, MATH, FIELDS, MINUS, sums, evaluate, regions, puzzle, svg };
})();
if (typeof module !== 'undefined') module.exports = CBM;
