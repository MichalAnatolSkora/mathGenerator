/**
 * Mirror drawing ("Dokończ w lustrze") — engine of the printable worksheet. Classic script; defines the global
 * `MIRROR` (also exported for Node: `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) for the random helpers.
 *
 * Pixel pictures on squared paper, mirror-symmetric. The sheet shows one half (or one quarter) coloured in, a red
 * dashed mirror line, and the child colours the matching squares on the other side.
 *   MIRROR.PALETTE           → letter → colour of a square ('.' = empty)
 *   MIRROR.PICTURES[id]      → { use, turn?, rows }: hand-drawn pictures, `use` = the task type they belong to
 *   MIRROR.TYPES[type]       → S small, M medium, L large (vertical mirror), H horizontal mirror, Q two mirrors
 *   MIRROR.PLAN[level]       → the page: rows of task types and the box (mm) each one gets on A4
 *   MIRROR.isSymmetric(rows, axis) / rotate(rows) / monster(rnd, w, h, axes)
 *   MIRROR.task(rnd, type, kind, used) → { type, id, rows, axis, given }
 *   MIRROR.sheet(rnd, level, kind)     → rows of tasks, each with its box and square size (mm)
 *   MIRROR.svg(task, sq, opts)         → a task as an SVG string
 */
const MIRROR = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');

  /* ---------- colours ---------- */
  const PALETTE = {
    k: '#2b2b33',   // black
    w: '#e2e7ee',   // white (a pale grey, so it shows on paper)
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
  const MONO = '#3d3d46';   // "one dark colour" option

  /* ---------- the pictures ---------- */
  // Drawn by hand, one text line per row of squares. use: S small (8 wide), M medium (8–12), L large (14),
  // Q symmetric both ways (two mirrors), H symmetric top–bottom (horizontal mirror). turn: also good turned
  // 90° to the right, so it can be a horizontal-mirror task.
  const ART = {
    // S
    heart: { use: 'S', art: `
      .rr..rr.
      rrrrrrrr
      rprrrrpr
      rrrrrrrr
      .rrrrrr.
      ..rrrr..
      ...rr...` },
    mushroom: { use: 'S', art: `
      ..rrrr..
      .rrrrrr.
      rwrrrrwr
      rrrwwrrr
      rrrrrrrr
      ..wwww..
      ..wwww..
      .wwwwww.` },
    ladybird: { use: 'S', turn: true, art: `
      ..kkkk..
      .rrkkrr.
      rkrkkrkr
      rrrkkrrr
      rrrkkrrr
      rkrkkrkr
      .rrkkrr.
      ..rkkr..` },
    strawberry: { use: 'S', art: `
      ...gg...
      .gggggg.
      rrrggrrr
      ryrrrryr
      rrryyrrr
      .ryrryr.
      .rrrrrr.
      ..ryyr..
      ...rr...` },
    icecream: { use: 'S', art: `
      ...rr...
      ..pppp..
      .pppppp.
      pppppppp
      oooooooo
      .onoono.
      .oooooo.
      ..onno..
      ...oo...` },
    crown: { use: 'S', art: `
      y..yy..y
      yy.yy.yy
      yyyyyyyy
      yrybbyry
      yyyyyyyy
      yyyyyyyy` },
    cat: { use: 'S', art: `
      o......o
      oo....oo
      oooooooo
      okooooko
      oooooooo
      oooppooo
      .oooooo.
      ..oooo..` },
    house: { use: 'S', art: `
      ...rr...
      ..rrrr..
      .rrrrrr.
      rrrrrrrr
      .yyyyyy.
      .ycyycy.
      .yyyyyy.
      .yynnyy.
      .yynnyy.` },
    cross: { use: 'S', art: `
      ...nn...
      ...nn...
      nnnnnnnn
      nnnnnnnn
      ...nn...
      ...nn...
      ...nn...
      ...nn...
      ...nn...` },
    tulip: { use: 'S', art: `
      .r.rr.r.
      .rrrrrr.
      .rrrrrr.
      ..rrrr..
      ...gg...
      g..gg..g
      gg.gg.gg
      .gggggg.
      ...gg...` },
    car: { use: 'S', art: `
      ..rrrr..
      .rccccr.
      rrrrrrrr
      ryrrrryr
      rrrrrrrr
      kk....kk` },
    frog: { use: 'S', art: `
      .gg..gg.
      gkggggkg
      gggggggg
      gggggggg
      grrrrrrg
      .gggggg.` },
    // M
    butterfly: { use: 'M', turn: true, art: `
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
      ..pp....pp..` },
    owl: { use: 'M', art: `
      n........n
      nnnnnnnnnn
      nwwwnnwwwn
      nwkwnnwkwn
      nwwwoowwwn
      nnnnoonnnn
      nnyyyyyynn
      nnyyyyyynn
      nnyyyyyynn
      .nnyyyynn.
      ..nnnnnn..
      ..o.oo.o..` },
    rocket: { use: 'M', turn: true, art: `
      ....rr....
      ...rrrr...
      ...ssss...
      ..ssssss..
      ..sccccs..
      ..sccccs..
      ..ssssss..
      .rssssssr.
      rrssssssrr
      r..oooo..r
      ...yooy...
      ....yy....` },
    castle: { use: 'M', art: `
      .....rr.....
      ....rrrr....
      s.srrrrrrs.s
      sss.ssss.sss
      sks.skks.sks
      ssssssssssss
      ssssssssssss
      ssssnnnnssss
      ssssnnnnssss` },
    bee: { use: 'M', turn: true, art: `
      ..k....k..
      ...k..k...
      ...kkkk...
      ccyyyyyycc
      cckkkkkkcc
      ccyyyyyycc
      .ckkkkkkc.
      ..yyyyyy..
      ...kkkk...
      ....kk....` },
    snowman: { use: 'M', art: `
      ..kkkk..
      ..kkkk..
      .kkkkkk.
      ..wwww..
      ..kwwk..
      ..woow..
      .rrrrrr.
      .wwwwww.
      wwwkkwww
      wwwwwwww
      wwwkkwww
      .wwwwww.` },
    penguin: { use: 'M', art: `
      ...kkkk...
      ..kkkkkk..
      ..kwkkwk..
      ..kkookk..
      .kkwwwwkk.
      kkwwwwwwkk
      kkwwwwwwkk
      .kwwwwwwk.
      .kwwwwwwk.
      ..kwwwwk..
      ..oo..oo..` },
    // L
    robot: { use: 'L', art: `
      ......rr......
      ......ss......
      ..ssssssssss..
      ..ssssssssss..
      ..sbbssssbbs..
      ..ssssssssss..
      ..sskkkkkkss..
      ..ssssssssss..
      .....ssss.....
      ssssssssssssss
      s.ssyyyyyyss.s
      s.ssyryyryss.s
      s.ssyyyyyyss.s
      r.ssssssssss.r
      ...ss....ss...
      ..kkk....kkk..` },
    xmastree: { use: 'L', art: `
      ......yy......
      .....yyyy.....
      ......gg......
      .....gggg.....
      ....gggggg....
      ...gbggggbg...
      ....gggggg....
      ...ggyggygg...
      ..gggggggggg..
      .rggggggggggr.
      ...gggggggg...
      ..gbggggggbg..
      .ggggrggrgggg.
      gggggggggggggg
      .....nnnn.....
      .....nnnn.....` },
    bear: { use: 'L', art: `
      .nnn......nnn.
      nnpnnnnnnnnpnn
      nnnnnnnnnnnnnn
      .nnnnnnnnnnnn.
      .nnknnnnnnknn.
      .nnnnnnnnnnnn.
      .nnnnyyyynnnn.
      .nnnyykkyynnn.
      ..nnyyyyyynn..
      ..nnnyyyynnn..
      ...nnnnnnnn...` },
    church: { use: 'L', art: `
      ......yy......
      .....yyyy.....
      ......yy......
      ......rr......
      .....rrrr.....
      ....rrrrrr....
      ....ssssss....
      ....sskkss....
      ....sskkss....
      ...rssssssr...
      ..rrssssssrr..
      .rrrssssssrrr.
      rrrrrrrrrrrrrr
      .ssssssssssss.
      .skssnnnnssks.
      .ssssnnnnssss.` },
    // Q
    snowflake: { use: 'Q', art: `
      b...bb...b
      .b.bbbb.b.
      ..b.bb.b..
      .b.bbbb.b.
      bbbbbbbbbb
      bbbbbbbbbb
      .b.bbbb.b.
      ..b.bb.b..
      .b.bbbb.b.
      b...bb...b` },
    sun: { use: 'Q', art: `
      o...oo...o
      .o..oo..o.
      ...yyyy...
      ..yyyyyy..
      ooyyyyyyoo
      ooyyyyyyoo
      ..yyyyyy..
      ...yyyy...
      .o..oo..o.
      o...oo...o` },
    clover: { use: 'Q', art: `
      .gg....gg.
      gggg..gggg
      gggggggggg
      .gggggggg.
      ..ggyygg..
      ..ggyygg..
      .gggggggg.
      gggggggggg
      gggg..gggg
      .gg....gg.` },
    star: { use: 'Q', art: `
      ....yy....
      ....yy....
      ...yyyy...
      ..yyyyyy..
      yyyyyyyyyy
      yyyyyyyyyy
      ..yyyyyy..
      ...yyyy...
      ....yy....
      ....yy....` },
    gem: { use: 'Q', art: `
      ....cc....
      ...cccc...
      ..ccbbcc..
      .ccbbbbcc.
      ccbbbbbbcc
      ccbbbbbbcc
      .ccbbbbcc.
      ..ccbbcc..
      ...cccc...
      ....cc....` },
    candy: { use: 'Q', art: `
      p...rrrr...p
      pp.rrrrrr.pp
      ppprryyrrppp
      ppprryyrrppp
      pp.rrrrrr.pp
      p...rrrr...p` },
    // H
    fish: { use: 'H', art: `
      ......oo....
      r...ooooo...
      rr.oooooooo.
      rrrooooookoo
      rrrooooookoo
      rr.oooooooo.
      r...ooooo...
      ......oo....` },
    airplane: { use: 'H', art: `
      ......b.....
      ......bb....
      .b....bbb...
      .bb...bbbb..
      sssssssssscc
      sssssssssscc
      .bb...bbbb..
      .b....bbb...
      ......bb....
      ......b.....` },
  };
  const PICTURES = {};
  for (const [id, p] of Object.entries(ART)) PICTURES[id] = { id, use: p.use, turn: !!p.turn, rows: p.art.trim().split('\n').map(l => l.trim()) };

  /* ---------- symmetry ---------- */
  const flipX = rows => rows.map(r => [...r].reverse().join(''));
  const flipY = rows => rows.slice().reverse();
  /** axis 'v' = left–right mirror (vertical line), 'h' = top–bottom mirror, 'vh' = both. */
  function isSymmetric(rows, axis) {
    const same = (a, b) => a.join('\n') === b.join('\n');
    return (!axis.includes('v') || same(rows, flipX(rows))) && (!axis.includes('h') || same(rows, flipY(rows)));
  }
  /** Turned 90° clockwise: the top goes to the right (a rocket flies to the right). */
  const rotate = rows => [...rows[0]].map((_, c) => rows.map(r => r[c]).reverse().join(''));

  /* ---------- random monsters ---------- */
  const BODY = ['g', 'v', 'b', 'r', 'o', 'p', 'c', 'y'];
  /** The biggest 4-connected group of filled squares; the rest is dropped. */
  function biggestBlob(m) {
    const h = m.length, w = m[0].length, seen = m.map(r => r.map(() => false));
    let best = [];
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
      if (!m[r][c] || seen[r][c]) continue;
      const blob = [], stack = [[r, c]]; seen[r][c] = true;
      while (stack.length) {
        const [y, x] = stack.pop(); blob.push([y, x]);
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w && m[ny][nx] && !seen[ny][nx]) { seen[ny][nx] = true; stack.push([ny, nx]); }
        }
      }
      if (blob.length > best.length) best = blob;
    }
    const out = m.map(r => r.map(() => false));
    for (const [y, x] of best) out[y][x] = true;
    return out;
  }
  /**
   * A random creature, w × h squares (w even), symmetric left–right: a solid body of random width row by row,
   * maybe antennae and arms, legs with coloured feet, eyes and a mouth. Drawn as its left half, then mirrored.
   */
  function creature(rnd, w, h) {
    let g;
    for (let tries = 0; tries < 50; tries++) {   // not too blocky: at most 80% of the squares filled
      g = creatureOnce(rnd, w, h);
      if (g.join('').replace(/\./g, '').length <= 0.8 * w * h) break;
    }
    return g;
  }
  function creatureOnce(rnd, w, h) {
    const hw = w / 2, half = Array.from({ length: h }, () => Array(hw).fill('.'));   // column hw-1 touches the mirror
    const [body, acc] = K.shuffle(rnd, BODY);
    const top = h >= 9 && rnd() < 0.7 ? 2 : 0, legs = h >= 9 && rnd() < 0.5 ? 2 : 1, bottom = h - legs;   // body rows [top, bottom)
    const arms = rnd() < 0.5;
    // half-widths of the body, row by row: a random walk, then shifted so the widest row touches the edge
    const widths = [];
    for (let r = top, a = K.int(rnd, 2, hw - 1); r < bottom; r++) { widths.push(a); a = Math.max(2, Math.min(hw, a + K.pick(rnd, [-1, 0, 0, 1]))); }
    const reach = arms ? hw - 1 : hw, shift = reach - Math.max(...widths);
    for (let i = 0; i < widths.length; i++) widths[i] = Math.max(2, Math.min(hw, widths[i] + shift));
    const edge = r => hw - widths[r - top];   // first body column in row r
    for (let r = top; r < bottom; r++) for (let c = edge(r); c < hw; c++) half[r][c] = body;
    if (arms) {   // an arm out to the edge, the hand raised in the second colour
      const ar = K.int(rnd, top + 1, Math.max(top + 1, bottom - 2));
      for (let c = 0; c < edge(ar); c++) half[ar][c] = body;
      half[ar - 1][0] = acc;
    }
    // legs: one per side, the last row is the feet
    const lc = K.int(rnd, Math.min(edge(bottom - 1), hw - 2), hw - 2);
    for (let r = bottom; r < h; r++) half[r][lc] = r === h - 1 ? acc : body;
    if (top) {   // antennae with a knob
      const ac = K.int(rnd, Math.min(edge(top), hw - 2), hw - 2);
      half[1][ac] = body; half[0][ac] = acc;
    }
    // eyes: inside the body, in its upper part; now and then one big eye on the mirror (a cyclops)
    const er = top + Math.min(widths.length - 1, K.int(rnd, 1, Math.max(1, Math.floor(widths.length / 3))));
    const inside = [];
    for (let c = edge(er) + 1; c < hw - 1; c++) inside.push(c);
    const ec = inside.length && rnd() < 0.85 ? K.pick(rnd, inside) : hw - 1;
    half[er][ec] = 'k';
    // a mouth two rows lower, next to the mirror
    const mr = er + 2;
    if (mr < bottom) {
      const mouth = body === 'r' ? 'k' : K.pick(rnd, ['k', 'r']);
      for (let c = hw - K.int(rnd, 1, Math.min(2, widths[mr - top] - 1)); c < hw; c++) half[mr][c] = mouth;
    }
    return half.map(row => row.join('') + row.slice().reverse().join(''));
  }
  /** A random kaleidoscope pattern, w × h squares (both even), symmetric both ways, in rings of three colours. */
  function pattern(rnd, w, h) {
    const hw = w / 2, hh = h / 2;
    let m = null;
    for (let tries = 0; tries < 2000 && !m; tries++) {
      // a random quarter: squares near the mirrors are more likely filled, so the quarters join up
      const part = Array.from({ length: hh }, (_, r) => Array.from({ length: hw }, (_, c) => rnd() < 0.2 + 0.3 * c / (hw - 1) + 0.3 * r / (hh - 1)));
      let full = part.map(row => [...row, ...row.slice().reverse()]);
      full = biggestBlob([...full, ...full.slice().reverse()]);
      const n = full.flat().filter(Boolean).length;
      const fullRows = full.every(row => row.some(Boolean)), fullCols = full[0].every((_, c) => full.some(row => row[c]));
      if (fullRows && fullCols && n >= 0.45 * w * h && n <= 0.75 * w * h) m = full;
    }
    if (!m) m = Array.from({ length: h }, () => Array(w).fill(true));   // never seen; still symmetric
    const cols = K.shuffle(rnd, BODY).slice(0, 3);
    // rings around the middle: 0, 1, 2… squares out
    return m.map((row, r) => row.map((f, c) => f ? cols[Math.floor(Math.max(Math.abs(r - (h - 1) / 2), Math.abs(c - (w - 1) / 2))) % 3] : '.').join(''));
  }
  /** axes 'v': a creature; 'vh': a pattern. */
  const monster = (rnd, w, h, axes = 'v') => axes === 'vh' ? pattern(rnd, w, h) : creature(rnd, w, h);

  /* ---------- tasks and pages ---------- */
  // axis, margin of empty squares around the picture, square size bounds (mm), monster sizes [w, h]…, stars
  const TYPES = {
    S: { axis: 'v', margin: 0, min: 9, max: 10, monsters: [[8, 8], [8, 9]], stars: '★' },
    M: { axis: 'v', margin: 0, min: 7, max: 9, monsters: [[10, 10], [12, 10], [12, 12]], stars: '★★' },
    L: { axis: 'v', margin: 1, min: 9, max: 10, monsters: [[14, 14], [16, 14], [14, 16]], stars: '★★' },
    H: { axis: 'h', margin: 0, min: 7, max: 9, monsters: [[8, 10], [8, 12], [10, 12]], stars: '★★★' },   // drawn as v, turned
    Q: { axis: 'vh', margin: 0, min: 7, max: 9, monsters: [[8, 8], [10, 10]], stars: '★★★' },
  };
  // A4 has 186 × 273 mm inside the margins; the head, the instruction and the task labels take ~75 mm of it.
  // Each task gets a box [width, height] in mm for its squared paper.
  const PLAN = {
    mix: [[['S', 90, 98], ['Q', 90, 98]], [['M', 186, 100]]],
    easy: [[['S', 90, 98], ['S', 90, 98]], [['S', 90, 98], ['S', 90, 98]]],
    medium: [[['M', 186, 100]], [['M', 186, 100]]],
    big: [[['L', 186, 190]]],
    hard: [[['H', 186, 100]], [['Q', 186, 100]]],
  };
  const KINDS = ['pics', 'monsters', 'both'];
  const GIVEN = { v: ['left', 'right'], h: ['top', 'bottom'], vh: ['tl', 'tr', 'bl', 'br'] };

  /** The pictures a task type can use: H also takes the "turn" pictures, turned. */
  function candidates(type) {
    const list = Object.values(PICTURES).filter(p => p.use === type).map(p => ({ id: p.id, rows: p.rows }));
    if (type === 'H') for (const p of Object.values(PICTURES)) if (p.turn) list.push({ id: p.id, rows: rotate(p.rows) });
    return list;
  }
  /**
   * One task: a picture (not one of `used`, ids already on the page) or a random monster, and which part is given.
   * kind: 'pics' | 'monsters' | 'both'. The easy type always gives the left half (the child colours to the right).
   */
  function task(rnd, type, kind, used = []) {
    const T = TYPES[type];
    let pic = null;
    if (kind === 'pics' || (kind === 'both' && rnd() < 0.5)) {
      const all = candidates(type), fresh = all.filter(p => !used.includes(p.id));
      pic = K.pick(rnd, fresh.length ? fresh : all);
    } else {
      const [w, h] = K.pick(rnd, T.monsters);
      if (type === 'Q') pic = { id: 'pattern', rows: monster(rnd, w, h, 'vh') };
      else if (type === 'H') pic = { id: 'monster', rows: rotate(monster(rnd, w, h, 'v')) };
      else pic = { id: 'monster', rows: monster(rnd, w, h, 'v') };
    }
    const given = type === 'S' ? 'left' : K.pick(rnd, GIVEN[T.axis]);
    return { type, id: pic.id, rows: pic.rows, axis: T.axis, given, margin: T.margin };
  }

  /** Size of the drawing in squares: the paper plus room for the mirror line sticking out at its ends. */
  const OUT = 0.35;
  function extent(t) {
    const w = t.rows[0].length + 2 * t.margin, h = t.rows.length + 2 * t.margin;
    return { w, h, vw: w + (t.axis.includes('h') ? 2 * OUT : 0.1), vh: h + (t.axis.includes('v') ? 2 * OUT : 0.1) };
  }
  /** The biggest square (mm, in steps of 0.5) that fits the box, at most the type's maximum. */
  function squareFor(t, boxW, boxH) {
    const e = extent(t);
    return Math.min(TYPES[t.type].max, Math.floor(2 * Math.min(boxW / e.vw, boxH / e.vh)) / 2);
  }
  /** A page: PLAN[level] filled with tasks; each task gets box: [w, h] and sq (mm). */
  function sheet(rnd, level, kind) {
    const used = [];
    return PLAN[level].map(row => row.map(([type, w, h]) => {
      const t = task(rnd, type, kind, used);
      used.push(t.id);
      return { ...t, box: [w, h], sq: squareFor(t, w, h) };
    }));
  }

  /* ---------- drawing ---------- */
  /** Is square (r, c) of the picture in the given part? */
  function isGiven(t, r, c) {
    const H = t.rows.length, W = t.rows[0].length, left = c < W / 2, top = r < H / 2;
    switch (t.given) {
      case 'left': return left; case 'right': return !left;
      case 'top': return top; case 'bottom': return !top;
      case 'tl': return top && left; case 'tr': return top && !left;
      case 'bl': return !top && left; default: return !top && !left;
    }
  }
  /**
   * A task as an SVG string, one square = 1 unit, `sq` mm per square.
   * opts: { solved: true → the whole picture (answer key), mono: true → every colour one dark grey }
   */
  function svg(t, sq, opts = {}) {
    const e = extent(t), m = t.margin, W = t.rows[0].length, H = t.rows.length;
    const x0 = -(e.vw - e.w) / 2, y0 = -(e.vh - e.h) / 2, f = n => Math.round(n * 1000) / 1000;
    let s = `<svg viewBox="${f(x0)} ${f(y0)} ${f(e.vw)} ${f(e.vh)}" style="width:${f(e.vw * sq)}mm" xmlns="http://www.w3.org/2000/svg">`;
    s += `<rect x="0" y="0" width="${e.w}" height="${e.h}" fill="#fff"/>`;
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const ch = t.rows[r][c];
      if (ch === '.' || !(opts.solved || isGiven(t, r, c))) continue;
      s += `<rect x="${c + m}" y="${r + m}" width="1" height="1" fill="${opts.mono ? MONO : PALETTE[ch]}"/>`;
    }
    let d = '';
    for (let i = 1; i < e.w; i++) d += `M${i} 0V${e.h}`;
    for (let i = 1; i < e.h; i++) d += `M0 ${i}H${e.w}`;
    s += `<path d="${d}" stroke="#93a3ba" stroke-width="0.035" fill="none"/>`;
    s += `<rect x="0" y="0" width="${e.w}" height="${e.h}" fill="none" stroke="#4a5262" stroke-width="0.07"/>`;
    // the mirror: red, dashed, a bit longer than the paper
    const mirror = 'stroke="#e0262d" stroke-width="0.12" stroke-dasharray="0.4 0.22" stroke-linecap="round"';
    if (t.axis.includes('v')) s += `<path d="M${f(e.w / 2)} ${-OUT}V${f(e.h + OUT)}" ${mirror}/>`;
    if (t.axis.includes('h')) s += `<path d="M${-OUT} ${f(e.h / 2)}H${f(e.w + OUT)}" ${mirror}/>`;
    return s + '</svg>';
  }
  /** A short piece of the mirror line, for the instruction. */
  const mirrorIcon = heightMM => `<svg viewBox="0 0 0.6 3" style="height:${heightMM}mm;width:auto;display:inline-block;vertical-align:middle" xmlns="http://www.w3.org/2000/svg">`
    + '<path d="M0.3 0.15V2.85" stroke="#e0262d" stroke-width="0.24" stroke-dasharray="0.5 0.3" stroke-linecap="round"/></svg>';

  return { PALETTE, MONO, PICTURES, TYPES, PLAN, KINDS, GIVEN, isSymmetric, rotate, monster, candidates, task, extent, squareFor, sheet, isGiven, svg, mirrorIcon };
})();
if (typeof module !== 'undefined') module.exports = MIRROR;
