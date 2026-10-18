// Run with: node engine.test.js
const REW = require('./engine.js');
const KIT = require('../sheet-kit/kit.js');
let fails = 0;
const ok = (name, cond) => { if (!cond) { fails++; console.log('FAIL', name); } };

ok('32 letters in the table, each once', REW.GRID.flat().length === 32 && new Set(REW.GRID.flat()).size === 32
  && REW.ALPHABET.every(ch => REW.GRID.flat().includes(ch)));
ok('every word is in the alphabet', REW.VOCAB.every(w => [...w].every(ch => REW.ALPHABET.includes(ch))));
ok('add/sub leave out the tens', REW.add(8, 7) === 5 && REW.sub(3, 8) === 5 && REW.sub(0, 9) === 1);
ok('unfold: 6 digits and backwards', REW.unfold([2, 7, 1, 9, 3, 8]).join('') === '271938839172');
ok('Kowalewski\'s Delegat I: 51702 (20715)', [5, 1, 7, 0, 2].concat([5, 1, 7, 0, 2].reverse()).join('') === '5170220715');

// the worked example: in plain table digits ДИВИЗИЯ shows И three times the same; with the key it does not
const ex = REW.EXAMPLE, p = REW.digitsOf(ex.word), c = REW.encrypt(ex.word, ex.key6);
const pair = (d, i) => '' + d[2 * i] + d[2 * i + 1];
ok('example: И the same without the key', pair(p, 1) === pair(p, 3) && pair(p, 3) === pair(p, 5));
ok('example: И different with the key', new Set([pair(c, 1), pair(c, 3), pair(c, 5)]).size === 3);
ok('example: cipher − word = key', REW.keyFrom(c, 'ДИВ').join('') === ex.key6.join(''));

const seen = new Set();
for (let s = 0; s < 2000; s++) {
  const d = REW.day(KIT.rng('t' + s));
  seen.add(d.start + d.telegrams[1].id + d.num);
  ok(`${s}: key has 6 digits`, d.key6.length === 6 && d.key6.every(x => x >= 0 && x <= 9) && d.key12.length === 12);
  for (const t of d.telegrams) {
    ok(`${s}: ${t.id} reads back`, REW.decrypt(t.cipher, d.key6) === t.text);
    ok(`${s}: ${t.id} key row restarts and repeats`, t.keyRow.every((x, i) => x === d.key12[i % 12]));
    ok(`${s}: ${t.id} fits one line (≤ 30 digits)`, t.cipher.length <= 30);
    ok(`${s}: ${t.id} plain digits are table cells`, t.plain.every((x, i) => i % 2 ? x <= 7 : x <= 3));
    ok(`${s}: ${t.id} groups of five`, t.groups.join('') === t.cipher.join('') && t.groups.slice(0, -1).every(g => g.length === 5));
  }
  const t1 = d.telegrams[0];
  ok(`${s}: telegram 1 starts with the opening word`, t1.text.startsWith(d.start) && REW.STARTS.includes(d.start));
  // ★★: the opening word gives the whole key, and it mirrors
  const k = REW.keyFrom(t1.cipher, d.start);
  ok(`${s}: opening word gives the key`, k.join('') === d.key12.join('') && REW.isMirror(k));
  // ★★★: of the candidates only the true one mirrors
  const hits = REW.CANDIDATES.filter(w => REW.isMirror(REW.keyFrom(t1.cipher, w.slice(0, 6))));
  ok(`${s}: one candidate mirrors, the true one`, hits.length === 1 && hits[0] === d.start);
}
ok('all variants appear', seen.size === REW.STARTS.length * REW.T2.length * 4);
console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
