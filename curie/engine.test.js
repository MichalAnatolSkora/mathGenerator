// Run with: node engine.test.js
const C = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };
const LEVELS = ['easy', 'mid', 'hard'];

for (const lv of LEVELS) for (let i = 0; i < 150; i++) {
  const rnd = K.rng(`t${i}|${lv}`);
  // mission 1: readings are mass × per gram; the made chalcolite and uranium have no extra; the two ores do
  const S = C.samples(rnd, lv), by = id => S.list.find(x => x.id === id);
  ok(`samples ${lv} #${i}: uranium first, all six`, S.list[0].id === 'uran' && S.list.length === 6 && new Set(S.list.map(x => x.id)).size === 6);
  ok(`samples ${lv} #${i}: uranium 2 per gram`, by('uran').read === by('uran').m * C.U);
  ok(`samples ${lv} #${i}: ores stronger than uranium`, by('ore').read / by('ore').m > C.U && by('chalNat').read / by('chalNat').m > C.U);
  ok(`samples ${lv} #${i}: made chalcolite weaker`, by('chalArt').read / by('chalArt').m < C.U);
  ok(`samples ${lv} #${i}: whole ratios`, S.times.ore === by('ore').a / 2 && Number.isInteger(S.times.ore) && Number.isInteger(S.times.chalNat));
  ok(`samples ${lv} #${i}: thorite as strong as uranium per gram`, lv === 'hard' || by('thor').a === C.U);
  if (lv === 'mid') {
    const big = S.list.reduce((b, x) => (x.read > b.read ? x : b));
    ok(`samples mid #${i}: most units is not the strongest per gram`, S.list.filter(x => x.read === big.read).length === 1 && S.list.some(x => x.a > big.a));
  }
  if (lv === 'easy') ok(`samples easy #${i}: 1 g each, fits the bar chart`, S.list.every(x => x.m === 1 && x.read <= 14));
  if (lv !== 'hard') ok(`samples ${lv} #${i}: per gram is whole`, S.list.every(x => x.read % x.m === 0 && x.read / x.m === x.a));
  if (lv === 'hard') {
    ok(`samples hard #${i}: extra = read − 2u`, S.list.every(x => x.extra === x.read - 2 * x.u && x.extra >= 0 && x.u <= x.m));
    ok(`samples hard #${i}: no extra in uranium and made chalcolite`, by('uran').extra === 0 && by('chalArt').extra === 0 && by('quartz').extra === 0);
    ok(`samples hard #${i}: extra per gram is whole and differs`, ['ore', 'chalNat'].every(id => by(id).extra % by(id).m === 0 && by(id).extra > 0) && by('ore').extra / by('ore').m !== by('chalNat').extra / by('chalNat').m);
    ok(`samples hard #${i}: thorite extra without uranium`, by('thor').u === 0 && by('thor').extra > 0);
  }
  // mission 2: masses and units add up at every step; the path is stronger per gram, the rest weaker
  const Tr = C.tree(rnd, lv), N = Tr.N;
  for (const id of Object.keys(C.NODES)) {
    const [parent, path] = C.NODES[id], n = N[id];
    ok(`tree ${lv} #${i}: ${id} whole`, Number.isInteger(n.m) && Number.isInteger(n.a) && n.r === n.m * n.a && n.a >= 1);
    if (!parent) continue;
    ok(`tree ${lv} #${i}: ${id} ${path ? 'stronger' : 'weaker'} than ${parent}`, path ? n.a > N[parent].a : n.a < N[parent].a, [n.a, N[parent].a]);
  }
  for (const id of Object.keys(C.NODES)) {
    const kids = Object.keys(C.NODES).filter(k => C.NODES[k][0] === id);
    if (!kids.length) continue;
    ok(`tree ${lv} #${i}: ${id} mass adds up`, kids.reduce((t, k) => t + N[k].m, 0) === N[id].m);
    ok(`tree ${lv} #${i}: ${id} units add up`, kids.reduce((t, k) => t + N[k].r, 0) === N[id].r);
    ok(`tree ${lv} #${i}: ${id} order has every child`, Tr.order[id].slice().sort().join() === kids.sort().join());
  }
  ok(`tree ${lv} #${i}: 400× and 900× uranium`, N.po.a / C.U === 400 && N.ra.a / C.U === 900);
  ok(`tree ${lv} #${i}: whole × the ore`, Number.isInteger(N.po.a / N.ore.a) && Number.isInteger(N.ra.a / N.ore.a));
  ok(`tree ${lv} #${i}: sulphides strongest of step 1`, N.sulf.a > N.sol.a && N.sulf.a > N.sand.a);
  if (lv === 'hard') ok(`tree hard #${i}: a trap`, Tr.trap.length > 0);
  ok(`tree ${lv} #${i}: radium hidden on ★ only`, Tr.show('ra') === (lv !== 'easy') && Tr.show('sol'));
  // mission 3: halves every 140 days; "below" falls between two rows
  const D = C.decay(rnd, lv);
  ok(`decay ${lv} #${i}: halves`, D.values.every((v, j) => Number.isInteger(v) && (j === 0 || v * 2 === D.values[j - 1])) && D.days.every((d, j) => d === j * C.HALF));
  ok(`decay ${lv} #${i}: below`, D.values.some(v => v === D.below) === false && D.belowDay === D.days[D.values.findIndex(v => v < D.below)]);
  ok(`decay ${lv} #${i}: back`, D.back.then === D.back.today * 2 ** D.back.k && D.back.days === D.back.k * C.HALF);
}
// the drawings: every label of every language goes in
for (const l of Object.keys(T)) for (const lv of LEVELS) {
  const Tr = C.tree(K.rng('svg' + lv), lv), L = { ...T[l].m2, gram: T[l].gram, unitShort: T[l].unitShort, perG: T[l].perG };
  for (const solved of [false, true]) {
    const svg = C.treeSvg(Tr, { L, solved });
    ok(`treeSvg ${l} ${lv}: names`, Object.keys(C.NODES).filter(Tr.show).every(id => svg.includes(K.esc(T[l].m2.nodes[id][0]))));
    ok(`treeSvg ${l} ${lv}: no undefined/NaN`, !/undefined|NaN/.test(svg));
  }
  const D = C.decay(K.rng('g' + lv), lv);
  ok(`decaySvg ${l} ${lv}`, !/undefined|NaN/.test(C.decaySvg(D, { L: T[l].m3, solved: true })));
}
ok('blanks', C.blanks('POLON') === 'P _ L _ N' && C.blanks('RAD') === 'R _ D');
// strings: every language has the same keys, arrays of the same length, working functions
const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => v && typeof v === 'object' && !Array.isArray(v) ? keys(v, p + k + '.') : [p + k + (Array.isArray(v) ? `[${v.length}]` : '')]);
const back = { k: 2, today: 50, days: 280, then: 200 };
for (const l of Object.keys(T)) {
  const X = T[l];
  ok(`strings ${l}: same keys as pl`, keys(X).join() === keys(T.pl).join(), keys(X).filter(k => !keys(T.pl).includes(k)).join());
  ok(`strings ${l}: every node label`, Object.keys(C.NODES).every(id => Array.isArray(X.m2.nodes[id]) && X.m2.nodes[id].length >= 1));
  ok(`strings ${l}: every sample name`, C.SAMPLE_IDS.every(id => X.m1.names[id]));
  ok(`strings ${l}: mission 3 questions`, X.m3.q.easy(150).join().includes('150') && X.m3.q.mid(150).join().includes('150') && X.m3.q.hard(back, 2026).join().includes('280') && X.m3.q.hard(back, 2026).join().includes('2026'));
  ok(`strings ${l}: answers`, X.answers.m3.back(back).includes('200') && X.answers.m3.halvings(323, 2026).includes('323') && X.answers.m2.fin('X', 800, 400, 100).includes('400'));
  ok(`strings ${l}: the real table`, X.real.rows.length === 8 && X.real.rows.every((r, j) => r[0] === T.pl.real.rows[j][0] && r[2] === T.pl.real.rows[j][2]) && X.real.quoteFr === T.pl.real.quoteFr);
  ok(`strings ${l}: photo captions`, ['lab', 'room', 'notebook'].every(k => X.real.photos[k]) && X.real.photosSrc.includes('Wellcome Collection, CC BY 4.0'));
  ok(`strings ${l}: real answers`, X.real.q.length === 3 && X.answers.real.length === 3);
}

console.log(fails ? `${fails} failure(s)` : 'all ok');
process.exit(fails ? 1 : 0);
