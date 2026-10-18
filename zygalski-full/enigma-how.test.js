// Run with: node enigma-how.test.js
const H = require('./enigma-how.js');
const T = require('./enigma-strings.js');
const KIT = require('../sheet-kit/kit.js');
let fails = 0;
const ok = (name, cond) => { if (!cond) { fails++; console.log('FAIL', name); } };

// every language has the same keys as Polish (deep), lists as long, and every text renders
const shape = v => typeof v === 'function' ? `fn${v.length}` : Array.isArray(v) ? v.map(shape) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
for (const l of Object.keys(T)) {
  ok(`${l}: same keys and kinds as pl`, JSON.stringify(shape(T[l])) === JSON.stringify(shape(T.pl)));
  const html = H.partsHtml(T[l], KIT.esc) + H.procHtml(T[l], KIT.esc) + H.diagram([0, 3, 20], 0, T[l].diagram) + H.diagram([0, 3, 19], null, T[l].diagram);
  ok(`${l}: renders without undefined/NaN`, !/undefined|NaN|\[object/.test(html));
  const P = T[l].play, s = [P.lead('II I III', 'KUM', 'AQ'), P.up('x'), P.down('x'), P.last('ADU', 'A', 'W', 'A → W'), P.idea('PKE', 'LKW', 'KIJKYL'), P.winHint('ADT', 'ADU')];
  ok(`${l}: play texts render`, s.every(x => typeof x === 'string' && x.trim() && !/undefined/.test(x)));
}

// the example says what the machine does
const { EX } = H;
ok('the doubled key comes back from the six letters', H.machine.encrypt(EX.ground, H.ind) === EX.key + EX.key);
ok('the message comes back', H.machine.encrypt(EX.key, H.cipher) === EX.plain);
ok('the example has a female in places 1 and 4', H.ind[0] === H.ind[3]);
const pr = H.presses();
ok('six presses of A give six lamps, none of them A', pr.length === 6 && pr.every(p => p.lamp !== 'A'));
const moved = pr.findIndex((p, i) => i && p.win[1] !== pr[i - 1].win[1]);
ok('the middle rotor turns once in the six presses', moved > 0 && pr.filter((p, i) => i && p.win[1] !== pr[i - 1].win[1]).length === 1);
ok('the drawn press is the first of the six', H.path([...pr[0].win].map(c => c.charCodeAt(0) - 65), 0).endsWith(pr[0].lamp));
ok('the keyboard has every letter once', [...H.KEYBOARD.join('')].sort().join('') === 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

// the 1932 day: every letter appears in place 1, places 1 → 4 are a permutation, its chains come in pairs of equal length
{
  const d = H.DAY32, lens = d.chains.map(c => c.length).sort((a, b) => a - b);
  ok('1932: place 1 covers A–Z', d.ad.every(x => x >= 0) && new Set(d.ad).size === 26);
  ok('1932: chains in pairs of equal length', lens.length % 2 === 0 && lens.every((l, i) => i % 2 || l === lens[i + 1]));
  ok('1932: one ground setting, keys typed twice', d.inds.every((s, i) => H.machine.encrypt(d.ground, s) === d.keys[i] + d.keys[i]));
}

// part 4, the plugboard: the task's lamps are the machine's, the pairs come back, the twin cable fits this press only
{
  const Z = require('../zygalski-sheets/engine.js'), X = H.PLUG, c = ch => ch.charCodeAt(0) - 65;
  const lamps = (plug, win) => Z.machine(EX.order, EX.rings, plug).perm(win);
  ok('plug: the task is at the drawn press', X.win === pr[0].win);
  ok('plug: every row ends in the machine’s lamp', X.rows.every(r => String.fromCharCode(65 + lamps(EX.plug, X.winN)[c(r[0])]) === r[3]));
  ok('plug: the first row is the drawing’s key A', X.rows[0][0] === 'A' && H.path(X.winN, 0).endsWith(X.rows[0][3]));
  ok('plug: 13 rotor pairs', X.pairs.length === 13 && new Set(X.pairs.join('')).size === 26);
  ok('plug: two rows pair up', X.recip.length === 2);
  const twin = EX.plug.replace(X.old, X.twin), next = Z.machine(EX.order, EX.rings, '').step(X.winN);
  ok('plug: the twin cable gives the same lamps at this press', lamps(twin, X.winN).join() === lamps(EX.plug, X.winN).join());
  ok('plug: …but not at the next press', lamps(twin, next).join() !== lamps(EX.plug, next).join());
  ok('plug: twin rows end in the machine’s lamps', X.twinRows.every(r => String.fromCharCode(65 + lamps(twin, X.winN)[c(r[0])]) === r[3]));
  ok('plug: 6 cables, 100 391 791 500 ways; 11 is the most', H.ways(6) === 100391791500n && H.ways(11) > H.ways(10) && H.ways(11) > H.ways(12));
  for (const l of Object.keys(T)) {
    const html = H.plugHtml(T[l], KIT.esc) + H.plugHtml(T[l], KIT.esc, { inputs: true }) + H.plugAnswer(T[l]);
    ok(`${l}: plug renders without undefined/NaN`, !/undefined|NaN|\[object/.test(html));
  }
}

console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
