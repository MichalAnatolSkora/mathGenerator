// Run with: node engine.test.js
const N = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

// the clues and the line solver on small known cases
ok('clues', JSON.stringify(N.clues([1, 1, 0, 1, 0, 0, 1, 1, 1])) === '[2,1,3]' && N.clues('.....').length === 0);
ok('solveLine: 3 in 5 → middle square', N.solveLine([3], Array(5).fill(-1)).join() === '-1,-1,1,-1,-1');
ok('solveLine: 2 2 in 5 → all known', N.solveLine([2, 2], Array(5).fill(-1)).join() === '1,1,0,1,1');
ok('solveLine: impossible', N.solveLine([3], [1, 0, 1, 0, 1]) === null);
ok('count: ambiguous 2×2 has 2 solutions', N.count([[1], [1]], [[1], [1]]) === 2);

// every picture: square, the right size, '#'/'.' only, one solution reached by line solving alone (no guessing),
// at least one "start here" line, its mirror too
const ids = new Set();
for (const n of N.SIZES) {
  ok(`${n}×${n}: enough pictures`, N.PICS[n].length >= (n === 5 ? 20 : 10), N.PICS[n].length);
  const seen = new Set();
  for (const pic of N.PICS[n]) {
    const name = `${n}×${n} ${pic.id}`;
    ids.add(pic.id);
    ok(`${name}: id once per size`, !seen.has(pic.id)); seen.add(pic.id);
    ok(`${name}: ${n} rows of ${n}`, pic.rows.length === n && pic.rows.every(r => r.length === n && /^[#.]+$/.test(r)));
    for (const mirror of [false, true]) {
      const p = N.puzzle(pic, mirror, K.rng('t'));
      ok(`${name}: clues match the picture`, p.sol.every((r, y) => N.clues(r).join() === p.rows[y].join())
        && p.sol[0].every((_, x) => N.clues(p.sol.map(r => r[x])).join() === p.cols[x].join()));
      ok(`${name}${mirror ? ' mirrored' : ''}: exactly one solution`, N.count(p.rows, p.cols, 2) === 1);
      const g = N.logic(p.rows, p.cols);
      ok(`${name}: solved by line solving alone`, g && g.every((r, y) => r.every((v, x) => v === p.sol[y][x])));
      ok(`${name}: has a "start here" line`, p.start.rows.some(Boolean) || p.start.cols.some(Boolean));
      ok(`${name}: pre-coloured squares are coloured in the picture`, p.given.every(([r, c]) => p.sol[r][c] === 1));
    }
  }
  console.log(`ok   ${n}×${n}: ${N.PICS[n].length} pictures`);
}

// sheets: same seed ⇒ same puzzles; different pictures on one page
const sheet = seed => [5, 8, 10].map(n => N.pick(K.rng(`${seed}|${n}`), n, n === 5 ? 6 : 4));
ok('same seed ⇒ same sheet', JSON.stringify(sheet('x')) === JSON.stringify(sheet('x')));
ok('another seed ⇒ another sheet', JSON.stringify(sheet('x')) !== JSON.stringify(sheet('y')));
for (let i = 0; i < 50; i++) {
  const used = new Set(N.pick(K.rng(`m${i}`), 5, 3).map(p => p.id));
  const big = N.pick(K.rng(`b${i}`), 8, 1, used);
  ok(`seed ${i}: no picture twice`, !used.has(big[0].id));
}
ok('svg renders', N.svg(sheet('s')[2][0], 6, { help: true }).startsWith('<svg') && N.svg(sheet('s')[0][0], 5, { solved: true }).endsWith('</svg>'));

// every language has every key the English texts have, and a name for every picture
for (const l of ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es']) {
  for (const k of Object.keys(T.en)) ok(`${l}: has ${k}`, T[l][k] !== undefined);
  for (const id of Object.keys(T.en.levels)) ok(`${l}: levels.${id}`, !!T[l].levels[id]);
  for (const id of ids) ok(`${l}: name of ${id}`, !!T[l].pics[id]);
  ok(`${l}: no extra picture names`, Object.keys(T[l].pics).every(id => ids.has(id)));
}
console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
