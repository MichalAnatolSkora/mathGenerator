// Run with: node engine.test.js
const L = require('./engine.js');
const T = require('./strings.js');
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

// writing a latitude
eq('fmt 0', L.fmt(0), '0°');
eq('fmt 40N', L.fmt(40), '40°N');
eq('fmt 40S', L.fmt(-40), '40°S');
eq('fmt vi B', L.fmt(21, T.vi.common), '21°B');
eq('fmt vi N = south', L.fmt(-34, T.vi.common), '34°N');
eq('diff across the equator', L.diff(30, -20), 50);
eq('diff one side', L.diff(-60, -20), 40);

// longitude
eq('fmtLon 50W', L.fmtLon(-50), '50°W');
eq('fmtLon 0', L.fmtLon(0), '0°');
eq('fmtLon 180 has no letter', L.fmtLon(-180), '180°');
eq('fmtLon fr O', L.fmtLon(-50, T.fr.common), '50°O');
eq('fmtLon vi Đ', L.fmtLon(106, T.vi.common), '106°Đ');
eq('normLon 190 → −170', L.normLon(190), -170);
eq('normLon −180 → 180', L.normLon(-180), 180);
eq('noon at 30°W is 14:00 in Greenwich', L.hhmm(L.noonAt(-30)), '14:00');
eq('noon at 21°E is 10:36 in Greenwich', L.hhmm(L.noonAt(21)), '10:36');
eq('noon at 110°E is 04:40 in Greenwich (two digits, not an afternoon)', L.hhmm(L.noonAt(110)), '04:40');
eq('Titanic telegram longitude', L.fmtLon(-50), '50°W');

// real places: rounded latitudes, the answer the game expects
eq('Warsaw 52°N', L.fmt(L.city('warsaw').lat), '52°N');
eq('Cape Town 34°S', L.fmt(L.city('capeTown').lat), '34°S');
eq('Quito on the equator', L.city('quito').lat, 0);
eq('Hanoi 21°N', L.city('hanoi').lat, 21);
ok('every place has a name in every language', Object.keys(T).every(l => L.CITIES.every(c => T[l].common.cities[c.id])));

// wrong answers: three, different, on the map, never the right one; the N ↔ S swap always among them
let bad = 0;
for (const lvl of L.LEVEL_IDS) {
  const step = L.LEVELS[lvl].step;
  for (let v = -90; v <= 90; v += step) {
    const rnd = L.rng(`${lvl}${v}`);
    const d = L.readDistractors(v, lvl, rnd);
    if (d.length !== 3 || new Set(d).size !== 3 || d.includes(v) || d.some(x => x < -90 || x > 90) || (v !== 0 && !d.includes(-v))) { bad++; console.log('  read', lvl, v, d); }
  }
}
eq('read distractors, every level and latitude', bad, 0);
bad = 0;
for (const lvl of L.LEVEL_IDS) {
  for (let i = 0; i < 400; i++) {
    const rnd = L.rng(`d${lvl}${i}`);
    const a = L.randomLat(rnd, lvl), b = L.randomLat(rnd, lvl);
    if (a === b) continue;
    const dd = L.diffDistractors(a, b, lvl, rnd), d = L.diff(a, b);
    const other = Math.sign(a) * Math.sign(b) < 0 ? Math.abs(Math.abs(a) - Math.abs(b)) : Math.abs(a) + Math.abs(b);
    if (dd.length !== 3 || new Set(dd).size !== 3 || dd.includes(d) || dd.some(x => x <= 0 || x > 180) || (other !== d && other > 0 && !dd.includes(other))) { bad++; console.log('  diff', lvl, a, b, dd); }
  }
}
eq('how-many-degrees distractors', bad, 0);

bad = 0;
for (const lvl of L.LEVEL_IDS) {
  const step = L.LEVELS[lvl].step;
  for (let v = -180 + step; v <= 180; v += step) {
    const d = L.lonDistractors(v, lvl, L.rng(`lon${lvl}${v}`));
    const h = L.hemiLon(v);
    if (d.length !== 3 || new Set(d).size !== 3 || d.includes(v) || d.some(x => x <= -180 || x > 180) || ((h === 'E' || h === 'W') && !d.includes(-v))) { bad++; console.log('  lon', lvl, v, d); }
  }
}
eq('longitude distractors, every level and longitude', bad, 0);
bad = 0;
for (let i = 0; i < 500; i++) {
  const rnd = L.rng('p' + i), lvl = L.LEVEL_IDS[i % 4];
  const p = { lat: L.randomLat(rnd, lvl), lon: L.randomLon(rnd, lvl) };
  if (Math.abs(p.lat) === 90) continue;
  const d = L.pointDistractors(p, lvl, rnd), key = q => `${q.lat}|${L.normLon(q.lon)}`;
  if (d.length !== 3 || new Set(d.map(key)).size !== 3 || d.some(q => key(q) === key(p) || Math.abs(q.lat) > 90)) { bad++; console.log('  point', p, d); }
}
eq('both-coordinates distractors', bad, 0);
bad = 0;
for (let i = 0; i < 300; i++) {
  const v = L.randomLons(L.rng('w' + i), L.LEVEL_IDS[i % 4], 6);
  if (v.length !== 6 || v.filter(x => L.hemiLon(x) === 'E').length < 2 || v.filter(x => L.hemiLon(x) === 'W').length < 2) { bad++; console.log('  lons', v); }
}
eq('six longitudes: at least two east and two west', bad, 0);

// worksheets mix both hemispheres
bad = 0;
for (let i = 0; i < 300; i++) {
  const v = L.randomLats(L.rng('s' + i), L.LEVEL_IDS[i % 4], 6);
  if (v.length !== 6 || v.filter(x => x > 0).length < 2 || v.filter(x => x < 0).length < 2) { bad++; console.log('  lats', v); }
}
eq('six latitudes: at least two north and two south', bad, 0);
eq('same seed ⇒ same latitudes', JSON.stringify(L.randomLats(L.rng('KOT'), 'l5', 6)), JSON.stringify(L.randomLats(L.rng('KOT'), 'l5', 6)));

// drawings: no NaN, every kind
const svgs = [
  L.mapSvg({ lonC: 170, span: 140, k: 4, grid: 10, minor: 5, lines: true, hemi: true, pins: [{ lat: -41, lon: 175, text: 'W' }], cursor: 20, cursorText: '20°N', target: 20 }),
  L.mapSvg({ lonC: -35, span: 90, top: 70, bottom: -10, print: true }),
  L.ladderSvg({ grid: 10, minor: 5, dot: -35 }),
  ...[-90, -34, 0, 42, 90].map(lat => L.skySvg({ lat, answer: true, names: { star: 'P', dipper: 'D', cross: 'C', pole: 'p', look: 'N' } })),
  L.skySvg({ lat: 42, blank: true, print: true }),
  L.mapSvg({ lonC: 150, span: 140, meridians: 10, lonLabels: 20, cursorLon: -170, cursorLonText: '170°W', targetLon: 175 }),
  L.lonScaleSvg({ grid: 10, minor: 5, dot: -35 }),
  ...[-165, -30, 0, 21, 120].map(lon => L.noonSvg({ lon, answer: 'x', names: { sun: 's', chrono: 'c', look: 'l' } })),
  ...[-90, -34, 0, 50, 90].map(lat => L.whySvg({ lat, names: T.pl.common.whyNames })),
  ...[-120, -30, 0, 21, 150].map(lon => L.whyLonSvg({ lon, names: T.pl.common.whyNames })),
];
ok('drawings have no NaN', svgs.every(s => s.startsWith('<svg') && !s.includes('NaN')));

// texts: every language has the same keys as Polish, and the functions run
const keys = o => Object.keys(o).sort().join(',');
for (const l of Object.keys(T)) {
  for (const part of ['common', 'game', 'sheet']) eq(`${l} ${part} keys`, keys(T[l][part]), keys(T.pl[part]));
  const g = T[l].game, c = T[l].common;
  const texts = [
    g.explainRead({ f: '40°S', abs: 40, h: 'S', city: c.cities.capeTown, km: '3 770' }), g.explainRead({ f: '0°', abs: 0, h: '0', city: null, km: null }),
    g.explainRead({ f: '90°N', abs: 90, h: 'N', city: null, km: null }),
    g.explainDiff({ a: 30, b: 20, ha: 'N', hb: 'S', d: 50, nA: 'A', nB: 'B', city: false, km: null }),
    g.explainDiff({ a: 60, b: 20, ha: 'S', hb: 'S', d: 40, nA: c.cities.ushuaia, nB: c.cities.rio, city: true, km: '4 440' }),
    g.explainDiff({ a: 0, b: 34, ha: '0', hb: 'S', d: 34, nA: c.cities.quito, nB: c.cities.santiago, city: true, km: '3 770' }),
    g.explainStar({ h: 50, f: '50°N', south: false, city: null }), g.explainStar({ h: 34, f: '34°S', south: true, city: c.cities.sydney }),
    g.explainStar({ h: 0, f: '0°', south: false, city: null }),
    g.readQCity(c.cities.northPole), g.setQCity(c.cities.northPole), g.diffQCity(c.cities.cairo, c.cities.lima),
    c.latWords(40, 'S'), c.latWords(0, '0'), T[l].sheet.summary(3), T[l].sheet.sheetSub('x'),
    g.explainLon({ f: '30°W', abs: 30, h: 'W', city: null }), g.explainLon({ f: '0°', abs: 0, h: '0', city: c.cities.london }),
    g.explainLon({ f: '180°', abs: 180, h: '180', city: null }),
    g.explainBoth({ f: '40°N 30°W', hLat: 'N', hLon: 'W', city: null }), g.explainBoth({ f: '1°N 104°E', hLat: 'N', hLon: 'E', city: c.cities.singapore }),
    g.explainDiffLon({ a: 30, b: 20, ha: 'W', hb: 'E', d: 50, nA: 'A', nB: 'B', city: false }),
    g.explainDiffLon({ a: 74, b: 58, ha: 'W', hb: 'W', d: 16, nA: c.cities.newYork, nB: c.cities.buenosAires, city: true }),
    g.explainClock({ abs: 30, f: '30°W', time: '14:00', dur: c.dur(2, 0), later: true }), g.explainClock({ abs: 0, f: '0°', time: '12:00', dur: '', later: false }),
    g.readQLonCity(c.cities.cairo), g.setQBothCity(c.cities.cairo), g.diffQLonCity(c.cities.cairo, c.cities.lima), c.lonWords(30, 'W'), c.dur(1, 24),
    c.noonLook, c.morseGame, c.factMorse(c.morseGame),
  ];
  ok(`${l} story names the Morse game`, c.factMorse(c.morseGame).includes(c.morseGame));
  ok(`${l} texts`, texts.every(s => typeof s === 'string' && s.length > 2 && !/undefined|NaN/.test(s)), texts.find(s => /undefined|NaN/.test(s)));
  eq(`${l} story has seven paragraphs (with the chronometer)`, g.fact.length, 7);
}

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
