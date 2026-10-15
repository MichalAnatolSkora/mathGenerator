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

for (const l of ['pl', 'en']) {
  const L = T[l];
  ok(`${l}: three syllables per word`, L.words.every(w => w.length === 3));
  const b = Z.board(K.rng('b'), 6, 7, 'NIG', L.syllables);
  ok(`${l}: the answer label appears once`, b.filter(x => x === 'NIG').length === 1 && b[7] === 'NIG');
}

console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
