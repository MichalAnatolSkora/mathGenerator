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
eq('the code', CODE, 'UCVNTGNF');
eq('no letter becomes itself', [...CODE].some((c, i) => c === KEY.plain[i]), false);
eq('windows', WINS.join(' '), 'KOU KOV KPW KPX KPY KPZ KPA KPB');
eq('the lamps of the traces spell the message', TRACES.map(t => A[t[9]]).join(''), KEY.plain);
eq('the first letter: no cable in, cable M–R out', TRACES[0].map(x => A[x]).join(''), 'UUELYARIMR');
const v = E.values();
eq('middle rotor turns at letter 3', `${v.midTurn} ${v.midFrom} ${v.midTo}`, '3 KOV KPW');
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
