// Run with: node engine.test.js
const D = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };
const LEVELS = ['easy', 'mid', 'hard'];
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

for (const lv of LEVELS) for (let i = 0; i < 150; i++) {
  const rnd = K.rng(`t${i}|${lv}`);
  // mission 1: the big transport is the biggest train of the week
  const r = D.rail(rnd, lv);
  const all = r.stations.flatMap(st => st.wagons);
  ok(`rail ${lv} #${i}: the spike is the biggest train`, r.stations[r.spike.st].wagons[r.spike.day] === Math.max(...all));
  ok(`rail ${lv} #${i}: only one biggest train`, all.filter(w => w === Math.max(...all)).length === 1);
  ok(`rail ${lv} #${i}: totals`, r.stations.every(st => st.soldiers === st.tot.p * 40 && st.horses === st.tot.h * 8));
  // mission 2: every suspect has a different version, the mole's code is his index in binary
  const m = D.mole(rnd, lv);
  ok(`mole ${lv} #${i}: codes differ`, new Set(Array.from({ length: m.n }, (_, j) => m.code(j))).size === m.n);
  ok(`mole ${lv} #${i}: mole code`, parseInt(m.code(m.moleAt), 2) === m.moleAt);
  // mission 3: the stations' bearings or compass steps really lead to the cell
  const d = D.df(rnd, lv);
  for (const st of d.stations) {
    if (lv === 'easy') {
      const dirs = { N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1], S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1] }[st.compass];
      ok(`df easy #${i}: ${st.id} ${st.compass} ${st.cells}`, D.cellName({ c: st.cell.c + dirs[0] * st.cells, r: st.cell.r + dirs[1] * st.cells }) === d.name);
    } else {
      const b = D.bearing(...st.at, ...d.target), diff = Math.abs(((st.deg - b) % 360 + 540) % 360 - 180);
      ok(`df ${lv} #${i}: ${st.id} bearing within ${lv === 'hard' ? 2.5 : 0.5}°`, diff <= (lv === 'hard' ? 2.5 : 0.5), [st.deg, b.toFixed(1)]);
    }
  }
  ok(`df ${lv} #${i}: transmitter inside Poland`, D.inside(...d.target));
  if (lv === 'hard') ok(`df hard #${i}: triangle in the cell`, d.triangle.every(p => D.cellName({ c: Math.floor(p[0] / 12.5), r: Math.floor(p[1] / 12.5) }) === d.name));
  // mission 4: the mistakes are real mistakes and the rest agrees
  const l = D.legend(rnd, lv), tr = l.trains[l.ticket];
  ok(`legend ${lv} #${i}: mistake count`, l.errs.length === (lv === 'hard' ? 2 : 1) && new Set(l.errs).size === l.errs.length);
  ok(`legend ${lv} #${i}: age`, (l.docs.hotelAge === l.truth.age) === !l.errs.includes('age'));
  const cmp = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);
  ok(`legend ${lv} #${i}: passport`, (cmp(l.issued, l.trip) < 0) === !l.errs.includes('passport'));
  ok(`legend ${lv} #${i}: letter`, (cmp(l.docs.letterDate, D.addDays(l.arriveDay, 1)) === 0) === !l.errs.includes('letter'));
  const arrMin = toMin(tr.arr);
  ok(`legend ${lv} #${i}: hotel hour`, (toMin(l.docs.hotelArr) > arrMin) === !l.errs.includes('hour'), [l.docs.hotelArr, tr.arr, l.errs]);
  ok(`legend ${lv} #${i}: hotel date`, cmp(l.docs.hotelDate, l.arriveDay) === 0 && (tr.next === (cmp(l.arriveDay, l.trip) > 0)));
  if (l.herring === 'birthday') ok(`legend hard #${i}: birthday after the trip`, l.birth.m === l.trip.m && l.birth.d > l.trip.d && l.truth.age === l.trip.y - l.birth.y - 1);
  if (l.herring === 'night') ok(`legend hard #${i}: night train`, tr.next);
}
// strings: both languages have the same keys
const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => v && typeof v === 'object' && !Array.isArray(v) ? keys(v, p + k + '.') : [p + k]);
for (const l of Object.keys(T)) ok(`strings ${l}: same keys as pl`, keys(T[l]).join() === keys(T.pl).join());
for (const l of Object.keys(T)) {
  ok(`strings ${l}: suspect names`, T[l].m2.names.length === D.NAMES && T[l].m4.names.length === 8);
  ok(`strings ${l}: version pairs`, D.DETAILS.every(id => T[l].m2.details[id].pairs.length === D.PAIRS));
}

console.log(fails ? `${fails} failure(s)` : 'all ok');
process.exit(fails ? 1 : 0);
