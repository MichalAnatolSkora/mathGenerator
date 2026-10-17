// Run with: node play-strings.test.js
const T = require('./play-strings.js');
const ZYG = require('../zygalski-sheets/engine.js');
const KIT = require('../sheet-kit/kit.js');
let fails = 0;
const ok = (name, cond) => { if (!cond) { fails++; console.log('FAIL', name); } };
// every language has the same keys as Polish (deep) and the same kind of value
const shape = v => typeof v === 'function' ? 'fn' : Array.isArray(v) ? v.map(shape) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
const sample = { found: [3, 14], mistakes: [2], notFemale: ['007'], sheetsOn: [5, 14], lit: [1], hintOrder: ['I-II-III'],
  hintTrial: ['I-II-III', 'C'], gridLabel: ['I-II-III', 'C'], ringLeft: ['G', 'C'], ringMid: ['K'], ringRight: ['P'], ringsOk: ['QPA'],
  msgLine: ['007', 'ABC', 'DEFDXY'] };
for (const l of ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es']) {
  ok(`${l}: same keys and kinds as pl`, JSON.stringify(shape(T[l])) === JSON.stringify(shape(T.pl)));
  for (const [k, v] of Object.entries(T[l])) {
    const x = typeof v === 'function' ? v(...(sample[k] || [])) : v;
    ok(`${l}.${k}: a non-empty text`, typeof x === 'string' && x.trim() && !/undefined|NaN/.test(x));
    if (typeof v === 'function') ok(`${l}.${k}: has a sample`, !!sample[k]);
  }
  for (const n of [0, 1, 2, 5, 21]) ok(`${l}.lit(${n})`, T[l].lit(n).includes(String(n)));
}
// the page's arithmetic: light at the one hit of a day gives the day's rings (left L₁ − s, middle M₁ − y, right R′₁ − x)
const L = i => String.fromCharCode(65 + (((i % 26) + 26) % 26)), code = ch => ch.charCodeAt(0) - 65;
for (const seed of ['ABCDE-123', 'X', 'HELLO-555']) {
  const d = ZYG.day(KIT.rng(`${seed}|day`)), f0 = d.females[0], g = [...d.messages[f0.msg].ground].map(code), a = d.answer;
  ok(`${seed}: rings from the light`, [g[0] - a.s, g[1] - a.y, g[2] + f0.type - a.x].map(L).join('') === d.rings);
}
console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
