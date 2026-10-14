// Run with: node engine.test.js
const M = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

/* ---------- the hand-drawn pictures ---------- */
const ids = Object.keys(M.PICTURES);
for (const id of ids) {
  const p = M.PICTURES[id], rows = p.rows, w = rows[0].length, axis = M.TYPES[p.use].axis;
  ok(`${id}: rectangular`, rows.every(r => r.length === w), rows.map(r => r.length).join());
  ok(`${id}: palette letters only`, rows.every(r => [...r].every(ch => ch === '.' || M.PALETTE[ch])), rows.join('|'));
  ok(`${id}: symmetric (${axis})`, M.isSymmetric(rows, axis), '\n' + rows.join('\n'));
  if (axis.includes('v')) ok(`${id}: even width`, w % 2 === 0, w);
  if (axis.includes('h')) ok(`${id}: even height`, rows.length % 2 === 0, rows.length);
  ok(`${id}: no empty edge row/column`, [rows[0], rows[rows.length - 1]].every(r => /[^.]/.test(r)) && [0, w - 1].every(c => rows.some(r => r[c] !== '.')));
  ok(`${id}: a few colours`, new Set(rows.join('').replace(/\./g, '')).size <= 5);
  if (p.turn) ok(`${id}: turned is top–bottom symmetric`, M.isSymmetric(M.rotate(rows), 'h'));
}
const count = t => ids.filter(id => M.PICTURES[id].use === t).length;
ok('at least 20 pictures', ids.length >= 20, ids.length);
for (const t of Object.keys(M.TYPES)) ok(`type ${t}: at least 2 pictures to choose from`, M.candidates(t).length >= 2, M.candidates(t).length);
console.log(`ok   ${ids.length} pictures: ${Object.keys(M.TYPES).map(t => `${t} ${count(t)}`).join(', ')}`);

/* ---------- random monsters ---------- */
for (const [axes, sizes] of [['v', [[8, 8], [8, 9], [10, 10], [12, 12], [16, 14]]], ['vh', [[8, 8], [10, 10]]]]) {
  for (const [w, h] of sizes) for (let i = 0; i < 60; i++) {
    const rows = M.monster(K.rng(`m${i}|${w}x${h}|${axes}`), w, h, axes), name = `monster ${axes} ${w}×${h} #${i}`;
    ok(`${name}: size`, rows.length === h && rows.every(r => r.length === w));
    ok(`${name}: symmetric`, M.isSymmetric(rows, axes), '\n' + rows.join('\n'));
    const filled = rows.join('').replace(/\./g, '').length;
    ok(`${name}: not empty, not a block`, filled >= 0.3 * w * h && filled <= 0.9 * w * h, filled);
    ok(`${name}: fills its box`, [rows[0], rows[h - 1]].every(r => /[^.]/.test(r)) && [0, w - 1].every(c => rows.some(r => r[c] !== '.')));
    if (axes === 'v') ok(`${name}: has eyes`, rows.join('').includes('k'));
  }
}
console.log('ok   random monsters and patterns');

/* ---------- tasks, pages, A4 ---------- */
// every picture (and every monster size) fits every box its type gets, at the type's minimum square or more
for (const [level, plan] of Object.entries(M.PLAN)) {
  const width = plan.map(row => row.reduce((a, [, w]) => a + w, 0) + 6 * (row.length - 1));
  ok(`${level}: rows fit 186 mm`, width.every(w => w <= 186), width.join());
  for (const row of plan) for (const [type, w, h] of row) {
    const T0 = M.TYPES[type], shapes = M.candidates(type).map(p => p.rows);
    for (const [mw, mh] of T0.monsters) shapes.push(type === 'H' ? M.rotate(M.monster(K.rng('x'), mw, mh, 'v')) : M.monster(K.rng('x'), mw, mh, type === 'Q' ? 'vh' : 'v'));
    for (const rows of shapes) {
      const t = { type, rows, axis: T0.axis, margin: T0.margin }, sq = M.squareFor(t, w, h), e = M.extent(t);
      ok(`${level}/${type} ${rows[0].length}×${rows.length}: squares ≥ ${T0.min} mm`, sq >= T0.min, sq);
      ok(`${level}/${type}: fits the box`, e.vw * sq <= w + 1e-9 && e.vh * sq <= h + 1e-9);
    }
  }
}
for (const level of Object.keys(M.PLAN)) for (const kind of M.KINDS) for (let i = 0; i < 40; i++) {
  const a = M.sheet(K.rng(`s${i}`), level, kind), b = M.sheet(K.rng(`s${i}`), level, kind);
  ok(`${level}/${kind} #${i}: same seed ⇒ same sheet`, JSON.stringify(a) === JSON.stringify(b));
  const tasks = a.flat(), picIds = tasks.map(t => t.id).filter(id => M.PICTURES[id]);
  ok(`${level}/${kind} #${i}: no picture twice on a page`, new Set(picIds).size === picIds.length, picIds.join());
  if (kind === 'pics') ok(`${level}/${kind} #${i}: pictures only`, tasks.every(t => M.PICTURES[t.id]));
  if (kind === 'monsters') ok(`${level}/${kind} #${i}: monsters only`, tasks.every(t => !M.PICTURES[t.id]));
  for (const t of tasks) {
    ok(`${level}/${kind} #${i}: task symmetric`, M.isSymmetric(t.rows, t.axis));
    ok(`${level}/${kind} #${i}: given part is the task's axis`, M.GIVEN[t.axis].includes(t.given), t.given);
    ok(`${level}/${kind} #${i}: given part is not empty`, t.rows.some((r, y) => [...r].some((ch, x) => ch !== '.' && M.isGiven(t, y, x))));
    ok(`${level}/${kind} #${i}: squares big enough`, t.sq >= M.TYPES[t.type].min, t.sq);
    ok(`${level}/${kind} #${i}: svg`, M.svg(t, t.sq).startsWith('<svg') && M.svg(t, 5, { solved: true, mono: true }).endsWith('</svg>'));
  }
  if (level === 'easy') ok(`easy #${i}: always the left half given`, tasks.every(t => t.given === 'left'));
}
console.log('ok   sheets: same seed ⇒ same sheet, all levels and kinds');

/* ---------- texts ---------- */
const nameIds = [...ids, 'monster', 'pattern'];
for (const l of ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es']) {
  for (const k of Object.keys(T.en)) ok(`${l}: has ${k}`, T[l][k] !== undefined);
  for (const k of ['levels', 'kinds', 'todo']) for (const id of Object.keys(T.en[k])) ok(`${l}: ${k}.${id}`, !!T[l][k][id]);
  for (const id of nameIds) ok(`${l}: names.${id}`, !!T[l].names[id]);
  for (const id of Object.keys(M.PLAN)) ok(`${l}: levels.${id}`, !!T[l].levels[id]);
  for (const id of M.KINDS) ok(`${l}: kinds.${id}`, !!T[l].kinds[id]);
}
console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
