// Run with: node enigma-1932/engine.test.js
const Z = require('../zygalski-sheets/engine.js');
const E = require('./engine.js');
require('./strings.js');   // registers the texts in E.TEXT (pl, en, uk, vi, fr, it, es)
const LANGS = ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es'];
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };

// The kid's way on the paper wheels is the real Enigma I: random rotor orders, windows (double steps included),
// plugboards and texts.
let seed = 1932;
const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ORDERS = [['I', 'II', 'III'], ['I', 'III', 'II'], ['II', 'I', 'III'], ['II', 'III', 'I'], ['III', 'I', 'II'], ['III', 'II', 'I']];
let bad = 0;
for (let i = 0; i < 2000; i++) {
  const order = ORDERS[rnd(6)], start = [0, 0, 0].map(() => A[rnd(26)]).join('');
  const pool = [...A]; for (let j = 25; j > 0; j--) { const k = rnd(j + 1); [pool[j], pool[k]] = [pool[k], pool[j]]; }
  const plug = Array.from({ length: rnd(11) }, (_, j) => pool[2 * j] + pool[2 * j + 1]).join(' ');
  const text = Array.from({ length: 60 }, () => A[rnd(26)]).join('');
  if (E.paper(order, start, plug, text) !== Z.machine(order, 'AAA', plug).encrypt(start, text)) bad++;
}
eq('paper wheels = Enigma I (2000 random days, 60 letters each)', bad, 0);

// The day of the worksheet
const { KEY, CODE, WINS, TRACES } = E;
eq('the code deciphers to the message on paper', E.paper(KEY.order, KEY.start, KEY.plug, CODE), KEY.plain);
eq('the code', CODE, 'FGHUCWAN');
eq('no letter becomes itself', [...CODE].some((c, i) => c === KEY.plain[i]), false);
eq('windows', WINS.join(' '), 'SSR SSS SST SSU SSV STW STX STY');
eq('the lamps of the traces spell the message', TRACES.map(t => A[t[9]]).join(''), KEY.plain);
eq('the first letter: no cable in, cable J–R out', TRACES[0].map(x => A[x]).join(''), 'FFDGKNLKJR');
// What the child reads, found again by walking the printed wheels: the coloured letter read on the way in, the black
// letter read on the way out (each is the letter then looked for on the same wheel).
const mod = x => ((x % 26) + 26) % 26;
function kidWay(win, ch) {
  const sw = {}; for (const [a, b] of KEY.plug.split(' ')) { sw[a] = b; sw[b] = a; }
  const k = [...win].map(c => A.indexOf(c)), W = KEY.order.map(n => Z.ROTORS[n][0]);   // left, middle, right
  const out = [ch]; let spot = A.indexOf(sw[ch] || ch); out.push(A[spot]);
  for (const i of [2, 1, 0]) { const c = W[i][mod(spot + k[i])]; out.push(c); spot = mod(A.indexOf(c) - k[i]); }
  const m = Z.REFLECTOR_B[spot]; out.push(m); spot = A.indexOf(m);
  for (const i of [0, 1, 2]) { const c = A[mod(spot + k[i])]; out.push(c); spot = mod(W[i].indexOf(c) - k[i]); }
  out.push(A[spot]); out.push(sw[A[spot]] || A[spot]);
  return out.join('');
}
eq('the example shows what the child reads', E.STEPS[0].join(''), 'FFUYCNFDBJR');
// The drawn way of the first letter stays readable: short steps on every wheel, and on no wheel do the way to the mirror
// and the way back pass the same place.
{
  const t = TRACES[0], sd = (a, b) => { const d = mod(b - a); return d > 13 ? d - 26 : d; };
  const arcs = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]].map(([a, b]) => sd(t[a], t[b]));
  const span = (a, d) => Array.from({ length: Math.abs(d) + 1 }, (_, i) => mod(a + Math.sign(d) * i));
  const shared = [[0, 6], [1, 5], [2, 4]].reduce((n, [i, o]) => n + span(t[i + 1], arcs[i]).filter(x => span(t[o + 1], arcs[o]).includes(x)).length, 0);
  eq('first letter: every step at most 4 places', Math.max(...arcs.map(Math.abs)) <= 4, true);
  eq('first letter: no step of 0 (the letter is never right there)', arcs.includes(0), false);
  eq('first letter: way in and way back never share a place', shared, 0);
}
eq('the key table shows what the child reads', E.STEPS.map(s => s.join('')).join(' '), [...CODE].map((c, i) => kidWay(WINS[i], c)).join(' '));
const v = E.values();
eq('middle rotor turns at letter 6', `${v.midTurn} ${v.midFrom} ${v.midTo}`, '6 SSV STW');
eq('notches left → right', v.notches.join(''), 'QEV');
eq('ways with 6 cables', String(E.ways(6)), '100391791500');
eq('ways with 10 cables', String(E.ways(10)), '150738274937250');
eq('settings', v.total, '10 586 916 764 424 000');
eq('pages', E.formatPages(E.parsePages('7,1-3, x, 5')), '1-3,5,7');

// Texts: the same keys and list lengths in every language, every template fills in
const keys = o => Object.keys(o).sort().join(',');
const pl = E.TEXT.pl;
for (const lang of LANGS) {
  const T = E.TEXT[lang];
  eq(`${lang}: same keys`, keys(T), keys(pl));
  eq(`${lang}: same ui keys`, keys(T.ui), keys(pl.ui));
  let badLen = 0, badFill = 0;
  for (const k of Object.keys(pl)) {
    const val = typeof T[k] === 'function' ? T[k](v, 'Q', 7) : T[k], ref = typeof pl[k] === 'function' ? pl[k](v, 'Q', 7) : pl[k];
    if (Array.isArray(ref) && (!Array.isArray(val) || val.length !== ref.length)) { badLen++; console.log('  length', lang, k); }
    const flat = JSON.stringify(val);
    if (/undefined|NaN|\[object/.test(flat)) { badFill++; console.log('  template', lang, k, flat); }
  }
  eq(`${lang}: list lengths`, badLen, 0);
  eq(`${lang}: templates fill in`, badFill, 0);
  eq(`${lang}: 7 page titles`, T.ui.pageTitles.length, E.TOTAL);
  eq(`${lang}: example names the key and the lamp`, T.exTitle(v).includes(`{{${v.exKey}}}`) && T.exTitle(v).includes(`{{${v.exLamp}}}`), true);
  eq(`${lang}: example names the cable at the end`, T.exText(v).includes(`${v.exBack}–${v.exLamp}`), true);
  eq(`${lang}: turning example`, T.pathNote(v).includes(`{{${v.midFrom}}} → {{${v.midTo}}}`), true);
  eq(`${lang}: settings answer`, T.ansC(v).includes(v.total), true);
  eq(`${lang}: plugboard`, T.plugIntro(v).includes(`{{${v.plug}}}`), true);
}

console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
