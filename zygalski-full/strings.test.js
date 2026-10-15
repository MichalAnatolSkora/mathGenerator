// Run with: node strings.test.js
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond) => { if (!cond) { fails++; console.log('FAIL', name); } };
// every language has the same keys as Polish (deep) and lists as long
const shape = v => typeof v === 'function' ? 'fn' : Array.isArray(v) ? v.map(shape) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
for (const l of ['en', 'uk', 'vi', 'fr', 'it', 'es']) {
  ok(`${l}: same keys and list lengths as pl`, JSON.stringify(shape(T[l])) === JSON.stringify(shape(T.pl)));
  ok(`${l}: result lines have the same blanks as pl`, T[l].work.result.every((r, i) => r.split('_').length === T.pl.work.result[i].split('_').length));
}
console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
