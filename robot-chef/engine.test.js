// Run with: node engine.test.js
const C = require('./engine.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra) : ''); } };
const eq = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want), { got, want });
const N = 300;

// the neuron
eq('score', C.score([3, -4, 2], [2, 1, 0]), 2);
eq('formula with amounts', C.formula([3, -4, 2], [2, 1, 0]), '2·3 + (−4)');
eq('formula 0/1', C.formula([3, -4, 2], [1, 1, 0]), '3 + (−4)');
eq('parseNum', [C.parseNum('−4'), C.parseNum(' 12 '), C.parseNum('-0'), C.parseNum('x')].map(String), ['-4', '12', '0', 'NaN']);
eq('signed', [C.signed(3), C.signed(-2), C.signed(0)], ['+3', '−2', '0']);

// the perceptron: textbook example
{
  const tr = C.train([[1, 0], [0, 1]], [true, false], 2);
  ok('train converges', tr.ok);
  eq('train weights', tr.w, [1, 0]);
  eq('first fix', C.fix(tr.steps[0]), [1, 0]);
}

for (let s = 0; s < N; s++) {
  const r = C.rng('t' + s);
  const ingOk = g => g.ing.every(id => C.ING[id]) && new Set(g.ing).size === g.ing.length && C.GUEST[g.id];

  const c1 = C.count1(r, 6);
  ok('c1 guest', ingOk(c1.g)); ok('c1 weights 1..5', c1.g.w.every(v => v >= 1 && v <= 5), c1.g.w);
  ok('c1 6 dishes, distinct', c1.dishes.length === 6 && new Set(c1.dishes.map(C.key)).size === 6);
  const y1 = c1.dishes.filter(x => C.likes(c1.g, x)).length;
  ok('c1 both faces', y1 >= 2 && 6 - y1 >= 2);

  const b1 = C.best1(r);
  const sc = b1.plates.map(x => C.score(b1.g.w, x));
  ok('b1 unique best', sc.filter(v => v === sc[b1.best]).length === 1 && sc[b1.best] === Math.max(...sc), sc);

  const c2 = C.count2(r, 6);
  ok('c2 a negative weight', c2.g.w.some(v => v < 0) && c2.g.w.some(v => v > 0), c2.g.w);
  ok('c2 small dishes', c2.dishes.every(x => C.sum(x) <= 5 && C.kinds(x) >= 2));
  const y2 = c2.dishes.filter(x => C.likes(c2.g, x)).length;
  ok('c2 both faces', y2 >= 2 && 6 - y2 >= 2);

  const ck = C.cook2(r);
  ok('cook must is negative', ck.g.w[ck.must] < 0);
  const base = Array(4).fill(0); base[ck.must] = ck.mustN;
  ok('cook not liked with nothing added', !C.likes(ck.g, base));
  ok('cook solvable', C.dishes(4, 3).some(x => x[ck.must] === ck.mustN && C.sum(x) <= ck.cap && C.likes(ck.g, x)));

  const d3 = C.detect3(r);
  // solvable: the three dishes are independent (non-zero determinant)
  const [a, b, c] = d3.dishes;
  const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
  ok('detect3 solvable', det !== 0, d3.dishes);
  ok('detect3 no zero weight', d3.g.w.every(v => v !== 0));
  ok('detect3 at most one negative', d3.g.w.filter(v => v < 0).length <= 1);

  const sp = C.spoil3(r);
  ok('spoil3 labels', sp.dishes.every((x, i) => (x[sp.spoiler] > 0) === !sp.likes[i]));

  for (const k of [3, 4]) {
    const t4 = C.train4(r, k);
    ok(`train4(${k}) converges`, t4.ok && t4.rounds <= 3);
    ok(`train4(${k}) starts wrong`, t4.steps[0].robot !== t4.steps[0].guest);
    ok(`train4(${k}) learned all`, t4.dishes.every((x, i) => (C.score(t4.w, x) >= 1) === t4.labels[i]));
    ok(`train4(${k}) steps fit a sheet`, t4.steps.length <= 15, t4.steps.length);
    ok(`train4(${k}) robot's weights differ from the guest's`, t4.w.some((v, j) => v !== t4.g.w[j]));
  }

  const t5 = C.test5(r, 6);
  ok('test5 robot learned its dishes', t5.train.every((x, i) => (C.score(t5.w, x) >= 1) === t5.trainLabels[i]));
  ok('test5 a surprise', t5.right < 6 && t5.right >= 3);
  ok('test5 new dishes', t5.dishes.every(x => !t5.train.some(y => C.key(y) === C.key(x))));

  for (const mode of ['theta', 'full']) {
    const m = C.map6(r, mode, 7);
    ok(`map6 ${mode} rule sorts`, C.sorts(m.rule, m.pts));
    ok(`map6 ${mode} start does not`, !C.sorts(m.start, m.pts));
    ok(`map6 ${mode} rule in range`, ['a', 'b', 't'].every(q => m.rule[q] >= C.RANGE[q][0] && m.rule[q] <= C.RANGE[q][1]), m.rule);
    ok(`map6 ${mode} distinct points`, new Set(m.pts.map(p => p.x + ',' + p.y)).size === 7);
  }

  const x7 = C.xor7(r, 2);
  ok('xor7 8 dishes', x7.pts.length === 8);
  ok('xor7 helper network works', C.bossOk({ a: 2, b: -3, t: 1 }, x7.pts));
}

// chapter 7: no single line sorts the princess's dishes
{
  const x7 = C.xor7(C.rng('x'), 1);
  let any = false;
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let t = -20; t <= 20; t++) if (C.sorts({ a, b, t }, x7.pts)) any = true;
  ok('xor7 cannot be sorted by one line', !any);
}

// the drawings are SVG strings
ok('mapSVG', /^<svg[\s\S]*<\/svg>$/.test(C.mapSVG({ pts: [{ x: 1, y: 2, yes: true }], rule: { a: 1, b: 1, t: 4 } })));
ok('netSVG', /^<svg[\s\S]*<\/svg>$/.test(C.netSVG({})));

// strings: every language has every key of Polish
try {
  const T = require('./strings.js');
  const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => v && typeof v === 'object' && !Array.isArray(v) ? keys(v, p + k + '.') : [p + k]);
  const pl = keys(T.pl);
  for (const l of Object.keys(T)) {
    const have = new Set(keys(T[l]));
    const miss = pl.filter(k => !have.has(k));
    ok(`strings ${l}: all keys`, !miss.length, miss);
  }
  ok('strings: five languages', ['pl', 'en', 'uk', 'vi', 'fr'].every(l => T[l]), Object.keys(T));
} catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; console.log('(no strings.js yet)'); }

console.log(fails ? `${fails} FAILED` : 'all ok');
process.exit(fails ? 1 : 0);
