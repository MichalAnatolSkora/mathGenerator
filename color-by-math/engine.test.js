// Run with: node engine.test.js
const C = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// the sums: right result, no 0, nothing above the range, + and − only where asked
for (const [kind, M] of Object.entries(C.MATH)) for (const v of M.results) {
  const list = C.sums(K.rng(`${kind}${v}`), kind, v);
  ok(`${kind} ${v}: has sums`, list.length > 0);
  ok(`${kind} ${v}: all different`, new Set(list).size === list.length);
  for (const s of list) {
    const [a, b] = s.split(/[+−]/).map(Number);
    ok(`${kind} ${s} = ${v}`, C.evaluate(s) === v);
    ok(`${kind} ${s}: numbers 1..${M.max}`, a >= 1 && b >= 1 && a <= M.max && b <= M.max);
    ok(`${kind} ${s}: operation allowed`, M.ops.includes(s.includes('+') ? '+' : C.MINUS));
  }
}

// the pictures: same width in every row, known colours only, at most 7 colours (one result each)
const ids = new Set();
for (const p of C.PICTURES) {
  ids.add(p.id);
  ok(`${p.id}: rectangle`, p.rows.every(r => r.length === p.rows[0].length), p.rows.map(r => r.length).join());
  ok(`${p.id}: 10–12 wide, at most 14 tall`, p.rows[0].length >= 10 && p.rows[0].length <= 12 && p.rows.length <= 14);
  const cols = new Set(p.rows.join(''));
  ok(`${p.id}: known colours`, [...cols].every(ch => ch in C.PALETTE));
  ok(`${p.id}: at most 7 colours`, cols.size <= Math.min(...Object.values(C.MATH).map(M => M.results.length)), cols.size);
}
ok('enough pictures', C.PICTURES.length >= 12);

// the puzzles, for many seeds: the fields cover the picture once, are one colour, joined, the right size;
// every colour one result (all different), every sum gives its colour's result, neighbours never the same sum
for (const p of C.PICTURES) for (const kind of Object.keys(C.MATH)) for (const size of Object.keys(C.FIELDS)) for (let i = 0; i < 4; i++) {
  const name = `${p.id} ${kind} ${size} #${i}`;
  const z = C.puzzle(K.rng(name), p, kind, size), H = z.rows.length, W = z.rows[0].length, F = C.FIELDS[size];
  const owner = z.rows.map(r => [...r].map(() => -1));
  let bad = '';
  z.regions.forEach((reg, n) => {
    for (const [r, c] of reg.cells) { if (owner[r][c] >= 0) bad = 'twice'; owner[r][c] = n; if (z.rows[r][c] !== reg.color) bad = 'colour'; }
    const seen = new Set([reg.cells[0].join()]), stack = [reg.cells[0]], mine = new Set(reg.cells.map(x => x.join()));
    while (stack.length) { const [r, c] = stack.pop(); for (const [a, b] of NB) { const k = [r + a, c + b].join(); if (mine.has(k) && !seen.has(k)) { seen.add(k); stack.push([r + a, c + b]); } } }
    if (seen.size !== reg.cells.length) bad = 'not joined';
    const most = reg.color === '.' ? F.bgMax : F.max;
    if (reg.cells.length > most + 2) bad = `too big ${reg.cells.length}`;
    if (!mine.has(reg.at.join())) bad = 'sum outside';
    const legend = z.legend.find(l => l.color === reg.color);
    if (!legend || C.evaluate(reg.text) !== legend.value || reg.value !== legend.value) bad = `wrong sum ${reg.text}`;
  });
  ok(`${name}: fields`, !bad, bad);
  ok(`${name}: every square in a field`, owner.every(r => r.every(x => x >= 0)));
  ok(`${name}: one result per colour`, new Set(z.legend.map(l => l.value)).size === z.legend.length && z.legend.length === new Set(z.rows.join('')).size);
  ok(`${name}: results in range`, z.legend.every(l => C.MATH[kind].results.includes(l.value)));
  let same = 0;
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) for (const [a, b] of [[0, 1], [1, 0]]) {
    const o = owner[r + a]?.[c + b];
    const reg = z.regions[owner[r][c]];
    // allowed only when the result has too few sums for all its neighbours (e.g. 4 = 1+3, 2+2, 3+1)
    if (o !== undefined && o !== owner[r][c] && z.regions[o].text === reg.text && C.sums(K.rng(''), kind, reg.value).length > 0) same++;
  }
  ok(`${name}: neighbours differ`, same === 0, same);
}

// the same seed gives the same puzzle
const a = C.puzzle(K.rng('x'), C.PICTURES[0], 'mix10', 'big'), b = C.puzzle(K.rng('x'), C.PICTURES[0], 'mix10', 'big');
ok('same seed, same puzzle', JSON.stringify(a) === JSON.stringify(b));
ok('svg', C.svg(a, 10).startsWith('<svg') && C.svg(a, 10, { solved: true }).includes(C.PALETTE[a.rows.join('').replace(/\./g, '')[0]]));

// the texts: every language names every picture, colour and setting
for (const [lang, L] of Object.entries(T)) {
  for (const id of ids) ok(`${lang}: picture ${id}`, !!L.pics[id]);
  for (const ch of [...Object.keys(C.PALETTE), 'white']) ok(`${lang}: colour ${ch}`, !!L.colors[ch]);
  for (const k of Object.keys(C.MATH)) ok(`${lang}: math ${k}`, !!L.maths[k]);
  for (const k of Object.keys(C.FIELDS)) ok(`${lang}: fields ${k}`, !!L.fieldSizes[k]);
  for (const k of ['title', 'appTitle', 'appSub', 'math', 'fields', 'count', 'sheetTitle', 'instr', 'answer']) ok(`${lang}: ${k}`, !!L[k]);
  ok(`${lang}: counts`, typeof L.counts === 'function' && L.counts(2).includes('2'));
}

console.log(fails ? `${fails} failed` : 'all ok');
process.exit(fails ? 1 : 0);
