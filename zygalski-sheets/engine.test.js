// Run with: node engine.test.js
const Z = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

for (const level of Object.keys(Z.LEVELS)) {
  for (let i = 0; i < 200; i++) {
    const r = Z.round(K.rng(`t${i}|${level}`), level), { n, k } = r, N = n * n;
    // where each sheet lights the table, read back from the printed holes and the shift
    const lit = r.sheets.map(sh => new Set([...sh.holes].map(c => ((Math.floor(c / n) + sh.dy) % n) * n + (c % n + sh.dx) % n)));
    ok(`${level} #${i}: printed holes + shift give the table holes`, lit.every((s, j) => s.size === r.table[j].size && [...s].every(c => r.table[j].has(c))));
    const common = []; for (let c = 0; c < N; c++) if (lit.every(s => s.has(c))) common.push(c);
    ok(`${level} #${i}: exactly one common cell, the answer`, common.length === 1 && common[0] === r.answer, common);
    ok(`${level} #${i}: every sheet is needed`, lit.every((_, j) => {
      let left = 0; for (let c = 0; c < N; c++) if (lit.every((s, m) => m === j || s.has(c))) left++;
      return left > 1;
    }));
    ok(`${level} #${i}: k sheets`, r.sheets.length === k);
    ok(`${level} #${i}: shifts only when shifting`, r.sheets.every((sh, j) => r.shift ? (j === 0 ? !sh.dx && !sh.dy : sh.dx || sh.dy) : !sh.dx && !sh.dy));
  }
}

// every language has the same keys as Polish (deep), and every label fits its square
const shape = v => typeof v === 'function' ? 'fn' : Array.isArray(v) ? 'array' : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
const noSep = ({ wordSep, ...rest }) => rest;
for (const l of ['en', 'uk', 'vi', 'fr', 'it', 'es']) {
  ok(`${l}: same keys as pl`, JSON.stringify(shape(noSep(T[l]))) === JSON.stringify(shape(noSep(T.pl))));
  ok(`${l}: learn lists as long as pl`, ['parts', 'timeline', 'map'].every(k => T[l].learn[k].length === T.pl.learn[k].length));
}
for (const l of ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es']) {
  const L = T[l];
  const labels = [...L.words.flat(), ...L.syllables, ...L.cutWords, ...L.cutPool];
  ok(`${l}: labels have at most 6 letters`, labels.every(w => [...w].length <= 6), labels.filter(w => [...w].length > 6));
  ok(`${l}: a pool keeps enough decoys`, L.syllables.length >= 20 && L.cutPool.length >= 20);
  ok(`${l}: three syllables per word`, L.words.every(w => w.length === 3));
  // the answer must not stand out: no password syllable longer than the longest decoy
  const len = w => [...w].length, maxDecoy = Math.max(...L.syllables.map(len));
  ok(`${l}: password syllables no longer than decoys`, L.words.flat().every(w => len(w) <= maxDecoy), L.words.flat().filter(w => len(w) > maxDecoy));
  const b = Z.board(K.rng('b'), 6, 7, 'NIG', L.syllables);
  ok(`${l}: the answer label appears once`, b.filter(x => x === 'NIG').length === 1 && b[7] === 'NIG');
}

console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
