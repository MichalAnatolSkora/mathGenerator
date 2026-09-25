// Caesar shift ("What shift?") tests. Run with: node shift.test.js
const E = require('./engine.js');
require('./strings.js');
const LANGS = Object.keys(E.TEXT).sort();
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };
const enc = (text, shift, lang) => E.encrypt('caesar', text, { shift }, lang);
const dec = (text, shift, lang) => E.decrypt('caesar', text, { shift }, lang);

// Hand-counted vectors on each alphabet
eq('en: XYZ +3 wraps', enc('XYZ', 3, 'en'), 'ABC');
eq('en: ABC +25', enc('ABC', 25, 'en'), 'ZAB');
eq('fr: same A–Z as en', enc('CHAT', 3, 'fr'), 'FKDW');
eq('pl: A B C +3 counts Ą and Ć', enc('ABC', 3, 'pl'), 'CDE');            // A Ą B C | Ą B C Ć D | B C Ć D E ... A→C, B→D, C→E
eq('pl: Ł +1 = M', enc('Ł', 1, 'pl'), 'M');
eq('pl: Ż +1 wraps to A', enc('Ż', 1, 'pl'), 'A');
eq('pl: no Q/V/X — U +1 = W', enc('U', 1, 'pl'), 'W');
eq('uk: Г +1 = Ґ', enc('Г', 1, 'uk'), 'Ґ');
eq('uk: Я +1 wraps to А', enc('Я', 1, 'uk'), 'А');
eq('uk: Е +1 = Є, І +1 = Ї', enc('ЕІ', 1, 'uk'), 'ЄЇ');
eq('vi: A +1 = Ă, Ă +1 = Â', enc('AĂ', 1, 'vi'), 'ĂÂ');
eq('vi: U +1 = Ư, Y +1 wraps to A', enc('UY', 1, 'vi'), 'ƯA');
eq('spaces stay, only letters move', enc('A B', 1, 'en'), 'B C');

// Shift arithmetic on every alphabet, against an independent implementation
for (const lang of LANGS) {
  const A = E.alphabet(lang), letters = [...E.ALPHABETS[lang]], n = letters.length;
  const ref = (text, s) => [...text].map(ch => letters.includes(ch) ? letters[(((letters.indexOf(ch) + s) % n) + n) % n] : ch).join('');
  let bad = 0;
  for (const m of E.bank(lang).messages) for (let s = 1; s < n; s++) {
    const c = enc(m, s, lang);
    if (c !== ref(m, s)) bad++;                                   // forward by s
    if (dec(c, s, lang) !== m) bad++;                             // back by s
    if (enc(c, n - s, lang) !== m) bad++;                         // forward by n − s = back by s
    if (enc(m, s + n, lang) !== c || enc(m, s - n, lang) !== c) bad++;   // shifts are mod n
    if (!E.letterPairs(m, c, lang).every(x => x.s === s)) bad++;  // magnifier shows s on every letter
  }
  eq(`${lang}: every message × every shift`, bad, 0);
  eq(`${lang}: shift n is the identity`, enc(E.bank(lang).messages[0], n, lang), E.bank(lang).messages[0]);
}

// Generated shift puzzles
for (const lang of LANGS) {
  const A = E.alphabet(lang), B = E.bank(lang), seen = new Set();
  let bad = 0, ambiguous = 0, text = 0;
  const prng = E.makePRNG('shift-' + lang);
  for (let i = 0; i < 2000; i++) {
    const p = E.generateShiftPuzzle({ rng: prng.rnd, lang });
    const s = p.params.shift;
    seen.add(s);
    if (!Number.isInteger(s) || s < 1 || s > A.n - 1) bad++;
    if (enc(p.plaintext, s, lang) !== p.ciphertext || dec(p.ciphertext, s, lang) !== p.plaintext) bad++;
    // exactly one shift turns the code into real words
    const good = [];
    for (let t = 1; t < A.n; t++) if (dec(p.ciphertext, t, lang).split(' ').every(w => B.words.has(w))) good.push(t);
    if (good.length !== 1 || good[0] !== s) ambiguous++;
    // texts: hint 2 and the explanation count the right steps
    const ex = E.example(p);
    if (E.mod(ex.cn - ex.pn, A.n) !== s || ex.p !== [...p.plaintext][0] || ex.c !== [...p.ciphertext][0]) text++;
    for (const ui of LANGS) {
      const tx = E.shiftText(p, ui), words = p.ciphertext.split(' ');
      const shortest = Math.min(...words.map(w => [...w].length));
      const w = words.find(x => tx.hints[0].includes(x) && [...x].length === shortest);
      if (!w) text++;
      if (!tx.hints[1].includes(ex.p) || !tx.hints[1].includes(ex.c)) text++;
      if (!tx.explanation.includes(String(s)) || !tx.explanation.includes(ex.p) || !tx.explanation.includes(ex.c)) text++;
    }
  }
  eq(`${lang}: shifts are whole numbers 1…n−1`, bad, 0);
  eq(`${lang}: every shift 1…n−1 appears, the half too`, seen.size, A.n - 1);
  eq(`${lang}: only one shift gives real words`, ambiguous, 0);
  eq(`${lang}: hints and explanation match the shift`, text, 0);
}

// Easy level: small shifts only (3–9), never the same one twice in a row in the game
eq('easy shifts are 3–9', E.EASY_SHIFTS.join(','), '3,4,5,6,7,8,9');
eq('easy has more shifts than the 3 tries', E.EASY_SHIFTS.length > 3, true);
for (const lang of LANGS) {
  const prng = E.makePRNG('easy-' + lang), seen = new Set();
  let bad = 0, repeats = 0, last = null, big = 0;
  for (let i = 0; i < 1000; i++) {
    const p = E.generateShiftPuzzle({ rng: prng.rnd, lang, level: 'easy', avoidShift: last });
    const s = p.params.shift;
    seen.add(s);
    if (!E.EASY_SHIFTS.includes(s) || !E.validatePuzzle(p, 'easy').ok || dec(p.ciphertext, s, lang) !== p.plaintext) bad++;
    if (s === last) repeats++;
    last = s;
    if (E.generateShiftPuzzle({ rng: prng.rnd, lang, level: 'hard' }).params.shift > 9) big++;
  }
  eq(`${lang}: easy shifts only from 3–9`, bad, 0);
  eq(`${lang}: easy uses all of 3–9`, [...seen].sort((a, b) => a - b).join(','), '3,4,5,6,7,8,9');
  eq(`${lang}: avoidShift — no shift twice in a row`, repeats, 0);
  eq(`${lang}: hard still uses big shifts`, big > 500, true);
  let sheet = 0;
  for (let i = 0; i < 50; i++) for (const c of E.generateWorksheet('E' + i, 'easy', 10, lang, 'shift').cases) if (!E.EASY_SHIFTS.includes(c.params.shift)) sheet++;
  eq(`${lang}: easy shift worksheets use 3–9`, sheet, 0);
}
// Easy texts tell the child the range; hard texts do not
for (const ui of LANGS) {
  const G = E.TEXT[ui].game, S = E.TEXT[ui].sheet, has = x => x.includes('3') && x.includes('9');
  eq(`${ui}: easy game and worksheet say 3–9, hard do not`, [has(G.leadShift('easy')), has(S.instrShift('easy')), has(G.leadShift('hard')), has(S.instrShift('hard'))].join(','), 'true,true,false,false');
}

// Worksheets in "What shift?" mode
for (const lang of LANGS) {
  let bad = 0;
  for (let i = 0; i < 100; i++) {
    const W = E.generateWorksheet('W' + i, i % 2 ? 'hard' : 'easy', 12, lang, 'shift');
    W.cases.forEach((c, j) => {
      if (j && c.params.shift === W.cases[j - 1].params.shift) bad++;
      if (dec(c.ciphertext, c.params.shift, lang) !== c.plaintext) bad++;
    });
  }
  eq(`${lang}: shift worksheets decode, no shift twice in a row`, bad, 0);
  const long = E.generateWorksheet('SPY-1', 'easy', 8, lang, 'shift'), short = E.generateWorksheet('SPY-1', 'easy', 4, lang, 'shift');
  eq(`${lang}: shift worksheet prefix-stable`, JSON.stringify(short.cases), JSON.stringify(long.cases.slice(0, 4)));
}

// Validation of the shift parameter
const P = (shift, lang = 'en') => {
  const plaintext = E.bank(lang).messages[0];
  return { cipher_id: 'caesar', params: { shift }, plaintext, ciphertext: enc(plaintext, 3, lang), lang };
};
for (const lang of LANGS) {
  const A = E.alphabet(lang);
  eq(`${lang}: validate accepts shift 3`, E.validatePuzzle(P(3, lang), 'easy').ok, true);
  for (const s of [0, A.n, -3, A.half, 2.5]) eq(`${lang}: validate rejects shift ${s}`, E.validatePuzzle({ ...P(s, lang), ciphertext: P(3, lang).ciphertext }, 'easy').ok, false);
  const half = { ...P(A.half, lang), ciphertext: enc(P(3, lang).plaintext, A.half, lang) };
  eq(`${lang}: "Which cipher?" rejects the half shift (that is ROT)`, E.validatePuzzle(half, 'easy').ok, false);
  eq(`${lang}: "What shift?" accepts the half shift`, E.validatePuzzle({ ...half, mode: 'shift' }, 'easy').ok, true);
  let halves = 0; for (let i = 0; i < 1000; i++) if (E.generatePuzzle('hard', { lang, cipher: 'caesar' }).params.shift === A.half) halves++;
  eq(`${lang}: "Which cipher?" Caesar never uses the half`, halves, 0);
}

// Robustness: inputs the engine may get from outside (URL, JSON, typed text)
eq('shift given as a string "3" works like 3', enc('ABC', '3', 'en'), 'DEF');
eq('shift given as a string decodes', dec('DEF', '3', 'en'), 'ABC');
eq('affine b given as a string', E.encrypt('affine', 'AB', { a: 5, b: '8' }, 'en'), E.encrypt('affine', 'AB', { a: 5, b: 8 }, 'en'));
eq('lower-case message is encrypted', enc('abc', 1, 'pl'), 'ĄCĆ');
eq('decomposed Ą (A + ogonek) counts as Ą', enc('Ą', 1, 'pl'), 'B');
eq('letterPairs with lower-case message', E.letterPairs('abc', 'BCD', 'en').map(x => x.s).join(','), '1,1,1');

// Texts: the number of possible shifts told to the child
for (const ui of LANGS) for (const ml of LANGS) {
  const A = E.alphabet(ml), possible = A.n - 1;   // 1 … n−1
  const said = [E.TEXT[ui].game.crackSteps(A)[0], E.TEXT[ui].sheet.checklistShift(A)[0]].map(x => +x.match(/\d+/)[0]).join(',');
  eq(`${ui} text / ${ml} alphabet: "possible shifts" = ${possible}`, said, possible + ',' + possible);
}

console.log('\n' + (fails ? `FAILURES: ${fails}` : 'ALL PASSED'));
process.exit(fails ? 1 : 0);
