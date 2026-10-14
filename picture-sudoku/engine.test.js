// Run with: node engine.test.js
const S = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

const valid = (g, n) => {
  const [bh, bw] = S.BOX[n], full = Array.from({ length: n }, (_, i) => i).join();
  const sorted = a => a.slice().sort((x, y) => x - y).join();
  for (let i = 0; i < n; i++) {
    if (sorted(g[i]) !== full || sorted(g.map(r => r[i])) !== full) return false;
  }
  for (let r0 = 0; r0 < n; r0 += bh) for (let c0 = 0; c0 < n; c0 += bw) {
    const box = [];
    for (let i = 0; i < bh; i++) for (let j = 0; j < bw; j++) box.push(g[r0 + i][c0 + j]);
    if (sorted(box) !== full) return false;
  }
  return true;
};

for (const level of Object.keys(S.LEVELS)) {
  let minBlanks = Infinity;
  for (let i = 0; i < 60; i++) {
    const p = S.puzzle(K.rng(`t${i}|${level}`), level);
    ok(`${level} #${i}: the solution is a valid board`, valid(p.sol, p.n));
    ok(`${level} #${i}: givens agree with the solution`, p.grid.every((r, y) => r.every((v, x) => v === null || v === p.sol[y][x])));
    ok(`${level} #${i}: exactly one solution`, S.count(p.grid, p.n) === 1);
    ok(`${level} #${i}: blank count`, p.blanks === p.grid.flat().filter(v => v === null).length);
    minBlanks = Math.min(minBlanks, p.blanks);
  }
  // easy/medium/big always reach their target; hard goes as far as uniqueness allows
  if (level !== 'hard') ok(`${level}: reaches ${S.LEVELS[level].blanks} blanks`, minBlanks === S.LEVELS[level].blanks, minBlanks);
  else ok(`hard: at least 9 blanks`, minBlanks >= 9, minBlanks);
  console.log(`ok   ${level}: 60 boards, min blanks ${minBlanks}`);
}
ok('same seed ⇒ same board', JSON.stringify(S.puzzle(K.rng('x'), 'big')) === JSON.stringify(S.puzzle(K.rng('x'), 'big')));
ok('svg renders every set', S.SET_IDS.every(set => S.svg(S.puzzle(K.rng('s'), 'big'), set, 80, { solved: true }).startsWith('<svg')));

// every language has every key the English texts have
for (const l of ['pl', 'uk', 'vi', 'fr', 'it', 'es']) {
  for (const k of Object.keys(T.en)) ok(`${l}: has ${k}`, T[l][k] !== undefined);
  for (const k of ['levels', 'sets']) for (const id of Object.keys(T.en[k])) ok(`${l}: ${k}.${id}`, !!T[l][k][id]);
}
console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
