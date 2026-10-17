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
  const P = T[l].play, s = [P.lead('II I III', 'KUM', 'AQ'), P.up('x'), P.down('x'), P.last('ADU', 'A', 'W', 'A → W'), P.idea('PKE', 'LKW', 'KIJKYL')];
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

console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
