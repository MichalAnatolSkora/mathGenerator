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

// the Enigma simulation: the well-known test vector, decoding = encoding, a double step of the middle rotor
ok('enigma: AAA, AAAAA → BDZGO', Z.encrypt(['I', 'II', 'III'], 'AAA', 'AAAAA') === 'BDZGO');
const msg = 'ZYGALSKIWASHERE';
ok('enigma: encrypting twice gives the text back', Z.encrypt(['II', 'III', 'I'], 'QEV', Z.encrypt(['II', 'III', 'I'], 'QEV', msg)) === msg);
// from ADU the windows go ADV, AEW, BFX, BFY: the 3rd and 4th presses match a start at BFW
ok('enigma: double step', Z.encrypt(['I', 'II', 'III'], 'ADU', 'AAAA').slice(2) === Z.encrypt(['I', 'II', 'III'], 'BFW', 'AA'));
// a real sheet: about 4 squares in 10 are holes, and a hole means a doubled key can show a female there
for (const order of [['I', 'II', 'III'], ['III', 'II', 'I'], ['II', 'I', 'III']]) for (const left of 'AMZ') {
  const sh = Z.realSheet(order, left), share = sh.flat().filter(Boolean).length / 676;
  ok(`real sheet ${order.join('-')} ${left}: 25–55 % holes`, share > 0.25 && share < 0.55, share);
  const nm = Z.ROTORS[order[1]][1].charCodeAt(0) - 65, nr = Z.ROTORS[order[2]][1].charCodeAt(0) - 65;
  for (let t = 0; t < 40; t++) {
    const m = (t * 7) % 26, r = (t * 11 + 3) % 26, start = left + String.fromCharCode(65 + m, 65 + r);
    if (m === nm || [0, 1, 2, 3].some(k => (r + k) % 26 === nr)) continue;   // the sheets assume no turn of the middle rotor
    const female = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].some(k => { const c = Z.encrypt(order, start, k + 'XX' + k); return c[0] === c[3]; });
    ok(`real sheet ${order.join('-')} ${start}: hole ⇔ female`, sh[m][r] === female);
  }
}

// a day of traffic: the plugboard and rings do not hide the answer, and it is the only one
for (const seed of ['d1', 'd2', 'd3', 'd4']) {
  const d = Z.day(K.rng(seed)), m = Z.machine(d.order, d.rings, d.plug);
  ok(`day ${seed}: every message deciphers to its doubled key`, d.messages.every(x => m.encrypt(x.ground, x.ind) === x.key + x.key));
  ok(`day ${seed}: at least 10 females`, d.females.length >= 10);
  ok(`day ${seed}: the one answer is the daily key`, d.answer.order === d.order && d.answer.s === d.truth.s && d.answer.y === d.truth.y && d.answer.x === d.truth.x);
  const f0 = d.females[0], g = [...d.messages[f0.msg].ground].map(c => c.charCodeAt(0) - 65), L = i => String.fromCharCode(65 + ((i % 26) + 26) % 26);
  ok(`day ${seed}: the light gives the rings (L₁ − s, M₁ − y, R′₁ − x)`, L(g[0] - d.answer.s) + L(g[1] - d.answer.y) + L(g[2] + f0.type - d.answer.x) === d.rings);
  ok(`day ${seed}: six plugboard pairs`, d.plug.split(' ').length === 6 && new Set(d.plug.replace(/ /g, '')).size === 12);
}

// every language has the same keys as Polish (deep)
const shape = v => typeof v === 'function' ? 'fn' : Array.isArray(v) ? 'array' : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
for (const l of ['en', 'uk', 'vi', 'fr', 'it', 'es']) {
  ok(`${l}: same keys as pl`, JSON.stringify(shape(T[l])) === JSON.stringify(shape(T.pl)));
  ok(`${l}: learn lists as long as pl`, ['steps', 'rotors', 'exSteps', 'timeline'].every(k => T[l].learn[k].length === T.pl.learn[k].length));
}
console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
