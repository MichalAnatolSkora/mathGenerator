// Run with: node strings.test.js
const T = require('./strings.js');
const W20 = require('./engine.js');
let fails = 0;
const ok = (name, cond) => { if (!cond) { fails++; console.log('FAIL', name); } };
// every language has the same keys as Polish (deep) and lists as long
const shape = v => typeof v === 'function' ? 'fn' : Array.isArray(v) ? v.map(shape) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
const ids = W20.SLOTS.flat().map(v => v.id);
for (const [l, C] of Object.entries(T)) {
  if (l !== 'pl') ok(`${l}: same keys and list lengths as pl`, JSON.stringify(shape(C)) === JSON.stringify(shape(T.pl)));
  ok(`${l}: every glossary word explained`, W20.VOCAB.every(w => C.gloss[w]) && Object.keys(C.gloss).length === W20.VOCAB.length);
  ok(`${l}: every telegram translated`, ids.every(id => C.answers.tr[id]));
  ok(`${l}: telegram headers`, W20.SLOTS.every((vars, i) => typeof C.heads[i] === 'string' || vars.every(v => C.heads[i][v.id])));
  ok(`${l}: answers 1 and 2`, W20.SLOTS[0].every(v => C.answers.a1[v.id]) && W20.SLOTS[1].every(v => C.answers.a2[v.id]));
  ok(`${l}: four questions`, C.report.q.length === 4);
}
console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
