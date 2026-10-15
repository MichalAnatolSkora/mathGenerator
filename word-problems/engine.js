/**
 * Word problems — engine of the printable challenge cards. Classic script; defines the global `WORDS`
 * (also exported for Node: `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) for the random helpers.
 *
 * The engine only draws the numbers and picks the story; the words come from strings.js (WORDS_TEXT.say).
 *   WORDS.TYPES                     → kinds of problems:
 *       join     a + b = ?          (8 chestnuts and 7 acorns, how many altogether?)
 *       separate a − b = ?          (had 12 sweets, gave away 5, how many now?)
 *       missing  a + ? = c          (7 full-price tickets and some child tickets, 16 in all)
 *       compare  b − a, a + d, a − d (how many more? / d more / d fewer)
 *       open     ? + ? = c          (16 apples in 2 baskets, give a few ideas — many right answers)
 *       groups   a × b              (4 plates with 3 cookies on each)
 *   WORDS.problem(rnd, type, range, v) → { type, v, a, b, c, d, A, B, X, Y, cat, K, answer, calc, pairs? }
 *       v: the story variant (0…VARIANTS[type]-1); A, B: name numbers (0–7); X, Y: thing ids; cat: the
 *       word for X and Y together; K: container id (open, groups); calc: the calculation of the answer key.
 *   WORDS.sheet(rnd, type, range, n) → n problems: the mix, or n of one type with the variants taking turns.
 */
const WORDS = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');
  const TYPES = ['join', 'separate', 'missing', 'compare', 'open', 'groups'];
  const VARIANTS = { join: 3, separate: 3, missing: 3, compare: 3, open: 1, groups: 1 };
  const RANGES = [10, 20, 100];
  /** Things each story can be about (ids of the strings files). */
  const PAIRS = [['chestnut', 'acorn', 'autumn'], ['apple', 'pear', 'fruit'], ['shell', 'pebble', 'beach']];
  const THINGS = {
    give: ['candy', 'sticker', 'balloon'],
    bake: ['muffin', 'cookie'],
    got: ['marble', 'sticker', 'book'],
    have: ['sticker', 'marble', 'book', 'crayon', 'car'],
  };
  /** Containers and what is in them. */
  const CONTAINERS = { basket: 'apple', plate: 'cookie', aquarium: 'fish', shelf: 'book', vase: 'flower', box: 'crayon' };
  /** The mixed sheet: eight cards, every kind of problem. With numbers to 100 one join gives way to groups. */
  const MIX = ['join', 'open', 'missing', 'separate', 'compare', 'join', 'separate', 'missing'];

  const MINUS = '−';
  /** Smallest number in a story, smallest total, biggest group size. */
  const lim = range => ({ min: range >= 100 ? 5 : 2, lo: { 10: 5, 20: 11, 100: 30 }[range], R: range });

  /** 21, 31…, 91 need a singular noun in Ukrainian ("21 яблуко"): such numbers never go into a story. */
  const badNumber = n => n > 20 && n % 10 === 1;
  function problem(rnd, type, range, v = 0) {
    for (;;) {
      const p = draw(rnd, type, range, v);
      if (![p.a, p.b, p.c, p.d].some(n => n !== undefined && badNumber(n))) return p;
    }
  }
  function draw(rnd, type, range, v) {
    const { min, lo, R } = lim(range);
    const i = (a, b) => K.int(rnd, a, b);
    const A = i(0, 7), B = (A + i(1, 7)) % 8;
    const p = { type, v, A, B };
    if (type === 'join') {
      const c = i(lo, R), a = i(min, c - min);
      Object.assign(p, { a, b: c - a, answer: c, calc: `${a} + ${c - a} = ${c}` });
      if (v === 0) { const [X, Y, cat] = K.pick(rnd, PAIRS); Object.assign(p, { X, Y, cat }); }
    } else if (type === 'separate') {
      const a = i(Math.max(lo, 2 * min), R), b = i(min, a - min);
      Object.assign(p, { a, b, answer: a - b, calc: `${a} ${MINUS} ${b} = ${a - b}` });
      if (v === 0) p.X = K.pick(rnd, THINGS.give);
      if (v === 2) p.X = K.pick(rnd, THINGS.bake);
    } else if (type === 'missing') {
      const c = i(lo, R), a = i(min, c - min);
      Object.assign(p, { a, c, answer: c - a, calc: `${c} ${MINUS} ${a} = ${c - a}` });
      if (v === 1) p.X = K.pick(rnd, THINGS.got);
    } else if (type === 'compare') {
      p.X = K.pick(rnd, THINGS.have);
      const dMax = range >= 100 ? 30 : range >= 20 ? 9 : 5;
      if (v === 0) {        // how many more?
        const b = i(lo, R), a = i(Math.max(min, b - dMax), b - 2);
        Object.assign(p, { a, b, answer: b - a, calc: `${b} ${MINUS} ${a} = ${b - a}` });
      } else if (v === 1) { // d more
        const r = i(lo, R), d = i(2, Math.min(dMax, r - min));
        Object.assign(p, { a: r - d, d, answer: r, calc: `${r - d} + ${d} = ${r}` });
      } else {              // d fewer
        const a = i(lo, R), d = i(2, Math.min(dMax, a - min));
        Object.assign(p, { a, d, answer: a - d, calc: `${a} ${MINUS} ${d} = ${a - d}` });
      }
    } else if (type === 'open') {
      const c = range >= 100 ? i(12, 24) : range >= 20 ? i(8, 20) : i(5, 10);
      p.K = K.pick(rnd, Object.keys(CONTAINERS)); p.X = CONTAINERS[p.K];
      const pairs = [];
      for (let k = 1; k <= c / 2; k++) pairs.push(`${k} + ${c - k}`);
      Object.assign(p, { c, answer: null, pairs, calc: pairs.join(', ') });
    } else if (type === 'groups') {
      const a = i(2, 5), b = i(2, Math.min(10, Math.floor(R / a)));
      p.K = K.pick(rnd, Object.keys(CONTAINERS)); p.X = CONTAINERS[p.K];
      const sum = a <= 5 ? ` = ${Array(a).fill(b).join(' + ')}` : '';
      Object.assign(p, { a, b, answer: a * b, calc: `${a} × ${b}${sum} = ${a * b}` });
    } else throw new Error('unknown type ' + type);
    return p;
  }

  function sheet(rnd, type, range, n = 8) {
    const types = type === 'mix'
      ? MIX.map((t, k) => (range >= 100 && k === 5 ? 'groups' : t))
      : Array(n).fill(type);
    const offset = {}, seen = {};
    for (const t of TYPES) { offset[t] = K.int(rnd, 0, VARIANTS[t] - 1); seen[t] = 0; }
    const out = types.slice(0, n).map(t => problem(rnd, t, range, (offset[t] + seen[t]++) % VARIANTS[t]));
    // two cards in a row with the same names read like one story: move B on
    for (let k = 1; k < out.length; k++) if (out[k].A === out[k - 1].A) { out[k].A = (out[k].A + 3) % 8; if (out[k].B === out[k].A) out[k].B = (out[k].B + 1) % 8; }
    return out;
  }

  return { TYPES, VARIANTS, RANGES, PAIRS, THINGS, CONTAINERS, MIX, problem, sheet };
})();
if (typeof module !== 'undefined') module.exports = WORDS;
