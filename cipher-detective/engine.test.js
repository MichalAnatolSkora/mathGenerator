// Run with: node engine.test.js
const E = require('./engine.js');
require('./strings.js');   // registers the texts in E.TEXT (en, pl, uk, vi)
const LANGS = Object.keys(E.TEXT).sort();
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };

// English reference vectors
eq('spec caesar 3', E.encrypt('caesar', 'MEET AT THE TREEHOUSE', { shift: 3 }, 'en'), 'PHHW DW WKH WUHHKRXVH');
eq('caesar dec', E.decrypt('caesar', 'PHHW DW WKH WUHHKRXVH', { shift: 3 }, 'en'), 'MEET AT THE TREEHOUSE');
eq('rot13', E.encrypt('rot13', 'HELLO', {}, 'en'), 'URYYB');
eq('rot13 twice', E.encrypt('rot13', E.encrypt('rot13', 'HELLO WORLD', {}, 'en'), {}, 'en'), 'HELLO WORLD');
eq('atbash', E.encrypt('atbash', 'HELLO', {}, 'en'), 'SVOOL');
eq('vigenere LEMON', E.encrypt('vigenere', 'ATTACKATDAWN', { key: 'LEMON' }, 'en'), 'LXFOPVEFRNHR');
eq('vigenere: spaces do not advance the key', E.encrypt('vigenere', 'ATTACK AT DAWN', { key: 'LEMON' }, 'en'), 'LXFOPV EF RNHR');
eq('affine 5,8', E.encrypt('affine', 'AFFINE CIPHER', { a: 5, b: 8 }, 'en'), 'IHHWVC SWFRCP');
eq('affine dec', E.decrypt('affine', 'IHHWVC SWFRCP', { a: 5, b: 8 }, 'en'), 'AFFINE CIPHER');
eq('beaufort', E.encrypt('beaufort', 'DEFENDTHEEASTWALLOFTHECASTLE', { key: 'FORTIFICATION' }, 'en'), 'CKMPVCPVWPIWUJOGIUAPVWRIWUUK');
eq('beaufort reciprocal', E.decrypt('beaufort', 'CKMPVCPVWPIWUJOGIUAPVWRIWUUK', { key: 'FORTIFICATION' }, 'en'), 'DEFENDTHEEASTWALLOFTHECASTLE');
eq('default language is English', E.encrypt('caesar', 'ABC', { shift: 1 }), 'BCD');

// Other alphabets: shape and simple vectors
eq('alphabet sizes', LANGS.map(l => l + '=' + E.alphabet(l).n).join(' '), 'en=26 pl=32 uk=33 vi=29');
eq('half turns', LANGS.map(l => E.alphabet(l).half).join(','), '13,16,16,14');
eq('polish caesar 1', E.encrypt('caesar', 'ŻABA', { shift: 1 }, 'pl'), 'AĄCĄ');
eq('polish atbash', E.encrypt('atbash', 'AĄB', {}, 'pl'), 'ŻŹZ');
eq('ukrainian atbash', E.encrypt('atbash', 'АБВ', {}, 'uk'), 'ЯЮЬ');
eq('vietnamese rot14', E.encrypt('rot14' in E.CIPHERS ? 'rot14' : 'rot13', 'AĂ', {}, 'vi'), 'MN');
eq('non-letters pass through', E.encrypt('caesar', 'A-B C!', { shift: 1 }, 'pl'), 'Ą-C Ć!');
for (const l of LANGS) for (const a of E.alphabet(l).affineA) eq(`${l}: affine a=${a} invertible`, (a * E.modInverse(a, E.alphabet(l).n)) % E.alphabet(l).n, 1);

// Per language: banks, keys, round trips, generator, texts, whyNot
for (const lang of LANGS) {
  const A = E.alphabet(lang), B = E.bank(lang);
  for (const m of B.messages) { const errs = E.checkMessage(m, lang); if (errs.length) { fails++; console.log('FAIL message', lang, m, errs); } }
  eq(`${lang}: messages unique`, new Set(B.messages).size, B.messages.length);
  for (const k of B.keys) { const kk = [...k]; if (kk.length < 3 || kk.length > 4 || !kk.every(ch => A.has(ch)) || new Set(kk).size < 2) { fails++; console.log('FAIL key', lang, k); } }
  let rt = 0;
  for (const m of B.messages) {
    for (let s = 1; s < A.n; s++) { if (E.decrypt('caesar', E.encrypt('caesar', m, { shift: s }, lang), { shift: s }, lang) !== m) { fails++; console.log('FAIL caesar rt', lang, m, s); } rt++; }
    if (E.decrypt('rot13', E.encrypt('rot13', m, {}, lang), {}, lang) !== m) { fails++; console.log('FAIL rot rt', lang, m); } rt++;
    if (E.decrypt('atbash', E.encrypt('atbash', m, {}, lang), {}, lang) !== m) { fails++; console.log('FAIL atbash rt', lang, m); } rt++;
    for (const a of A.affineA) for (let b = 0; b < A.n; b++) { if (E.decrypt('affine', E.encrypt('affine', m, { a, b }, lang), { a, b }, lang) !== m) { fails++; console.log('FAIL affine rt', lang, m, a, b); } rt++; }
    for (const key of B.keys) {
      if (E.decrypt('vigenere', E.encrypt('vigenere', m, { key }, lang), { key }, lang) !== m) { fails++; console.log('FAIL vigenere rt', lang, m, key); } rt++;
      if (E.decrypt('beaufort', E.encrypt('beaufort', m, { key }, lang), { key }, lang) !== m) { fails++; console.log('FAIL beaufort rt', lang, m, key); } rt++;
    }
  }
  console.log(`${lang}: round trips ${rt}`);

  const seen = {};
  let bad = 0, empty = 0;
  for (let i = 0; i < 1500; i++) {
    const p = E.generatePuzzle('hard', { lang });
    const v = E.validatePuzzle(p, 'hard');
    if (!v.ok) { fails++; console.log('FAIL gen', lang, v.errors, p); }
    if (p.lang !== lang) { fails++; console.log('FAIL lang tag', p); }
    if (!B.messages.includes(p.plaintext)) { fails++; console.log('FAIL message not from bank', lang, p.plaintext); }
    if (p.hints.length !== 2 || !p.hints[0] || !p.hints[1] || !p.explanation) bad++;
    for (const g of E.LEVELS.hard) if (g !== p.cipher_id && !E.whyNot(g, p, lang)) empty++;
    seen[p.cipher_id] = (seen[p.cipher_id] || 0) + 1;
  }
  eq(`${lang}: hard covers all ciphers`, Object.keys(seen).sort().join(','), 'affine,atbash,beaufort,caesar,rot13,vigenere');
  eq(`${lang}: hints and explanation present`, bad, 0);
  eq(`${lang}: whyNot always has a note`, empty, 0);
  eq(`${lang}: easy excludes hard ciphers`, [...new Set(Array.from({ length: 300 }, () => E.generatePuzzle('easy', { lang }).cipher_id))].every(id => E.LEVELS.easy.includes(id)), true);

  for (const group of ['levels', 'whyNot', 'params', 'game', 'sheet', 'guide']) {
    const missing = Object.keys(E.TEXT.en[group]).filter(k => E.TEXT[lang][group][k] === undefined);
    eq(`${lang}.${group} has all keys`, missing.join(','), '');
  }
  for (const id of E.LEVELS.hard) {
    const missing = ['name', 'blurb', 'how', 'spot', 'hints', 'explain'].filter(k => !E.TEXT[lang].ciphers[id][k]);
    eq(`${lang}.ciphers.${id} complete`, missing.join(','), '');
  }
  // texts in another language for a puzzle of this language (used when the child switches flags)
  const other = LANGS.find(l => l !== lang);
  const p = E.generatePuzzle('hard', { lang, cipher: 'beaufort' });
  eq(`${lang}: text in ${other} works`, typeof E.puzzleText(p, other).explanation, 'string');
  eq(`${lang}: guide sample encrypts`, E.encrypt('vigenere', E.TEXT[lang].guide.sample, { key: E.TEXT[lang].guide.key }, lang) !== E.TEXT[lang].guide.sample, true);
  eq(`${lang}: guide sample uses its alphabet`, [...E.TEXT[lang].guide.sample.replace(/ /g, '')].every(ch => E.alphabet(lang).has(ch)), true);

  // "What shift?" mode: Caesar puzzles, texts, worksheets
  for (let i = 0; i < 300; i++) {
    const p = E.generateShiftPuzzle({ lang });
    const v = E.validatePuzzle(p, 'easy');
    if (!v.ok || p.cipher_id !== 'caesar' || p.mode !== 'shift' || !p.hints[0] || !p.hints[1] || !p.explanation) { fails++; console.log('FAIL shift puzzle', lang, v.errors, p); }
  }
  const sp = E.generateShiftPuzzle({ lang });
  eq(`${lang}: shift puzzle texts differ from which-cipher texts`, E.shiftText(sp, lang).hints[0] !== E.puzzleText(sp, lang).hints[0], true);
  eq(`${lang}.crack complete`, ['hints', 'explain'].filter(k => typeof E.TEXT[lang].crack[k] !== 'function').join(','), '');
  for (let i = 0; i < 40; i++) {
    const level = i % 2 ? 'hard' : 'easy', n = 1 + (i % 10);
    const W = E.generateWorksheet('S' + i, level, n, lang, 'shift');
    if (W.mode !== 'shift' || W.cases.length !== n || new Set(W.cases.map(c => c.plaintext)).size !== n) { fails++; console.log('FAIL shift worksheet', lang, W); }
    for (let j = 1; j < n; j++) if (W.cases[j].params.shift === W.cases[j - 1].params.shift) { fails++; console.log('FAIL same shift twice in a row', lang, W); }
    for (const c of W.cases) if (c.cipher_id !== 'caesar' || !E.validatePuzzle(c, 'easy').ok) { fails++; console.log('FAIL shift worksheet case', lang, c); }
  }
  eq(`${lang}: shift worksheet deterministic`, JSON.stringify(E.generateWorksheet('SPY-4821', 'easy', 6, lang, 'shift')), JSON.stringify(E.generateWorksheet('SPY-4821', 'easy', 6, lang, 'shift')));
  eq(`${lang}: shift worksheet differs from which-cipher worksheet`, JSON.stringify(E.generateWorksheet('SPY-4821', 'easy', 6, lang, 'shift').cases) !== JSON.stringify(E.generateWorksheet('SPY-4821', 'easy', 6, lang).cases), true);

  // Worksheets
  const w1 = E.generateWorksheet('SPY-4821', 'hard', 6, lang), w2 = E.generateWorksheet('SPY-4821', 'hard', 6, lang), w3 = E.generateWorksheet('SPY-4821', 'hard', 3, lang);
  eq(`${lang}: worksheet deterministic`, JSON.stringify(w1), JSON.stringify(w2));
  eq(`${lang}: worksheet prefix-stable`, JSON.stringify(w3.cases), JSON.stringify(w1.cases.slice(0, 3)));
  for (let i = 0; i < 60; i++) {
    const level = i % 2 ? 'hard' : 'easy', n = 1 + (i % 10);
    const W = E.generateWorksheet('S' + i, level, n, lang);
    if (W.cases.length !== n) { fails++; console.log('FAIL worksheet count', lang, n); }
    if (new Set(W.cases.map(c => c.plaintext)).size !== n) { fails++; console.log('FAIL worksheet repeated message', lang, W); }
    for (let j = 1; j < n; j++) if (W.cases[j].cipher_id === W.cases[j - 1].cipher_id) { fails++; console.log('FAIL same cipher twice in a row', lang, W); }
    for (const c of W.cases) { const v = E.validatePuzzle(c, level); if (!v.ok) { fails++; console.log('FAIL worksheet case', lang, v.errors); } }
    const allowed = E.LEVELS[level];
    if (n >= allowed.length && new Set(W.cases.map(c => c.cipher_id)).size !== allowed.length) { fails++; console.log('FAIL worksheet does not cover all ciphers', lang, W); }
  }
}

// Mixed languages: texts in one language for a message (alphabet) in another
for (const ui of LANGS) for (const ml of LANGS) {
  const A = E.alphabet(ml);
  let bad = 0, empty = 0;
  for (const id of E.LEVELS.hard) {
    const info = E.cipherInfo(id, ui, A);
    for (const k of ['name', 'full', 'blurb', 'how', 'spot']) if (typeof info[k] !== 'string' || !info[k]) bad++;
  }
  eq(`${ui} texts / ${ml} alphabet: ROT name`, E.cipherInfo('rot13', ui, A).name, 'ROT' + A.half);
  eq(`${ui} texts / ${ml} alphabet: Atbash how mentions first↔last`, E.cipherInfo('atbash', ui, A).how.includes(`${A.letters[0]} ↔ ${A.letters[A.n - 1]}`), true);
  for (let i = 0; i < 200; i++) {
    const p = E.generatePuzzle('hard', { lang: ml });
    const tx = E.puzzleText(p, ui);
    if (!tx.hints[0] || !tx.hints[1] || !tx.explanation) bad++;
    for (const g of E.LEVELS.hard) if (g !== p.cipher_id && !E.whyNot(g, p, ui)) empty++;
  }
  for (let i = 0; i < 50; i++) {
    const tx = E.shiftText(E.generateShiftPuzzle({ lang: ml }), ui);
    if (!tx.hints[0] || !tx.hints[1] || !tx.explanation) bad++;
  }
  if (E.TEXT[ui].game.crackSteps(A).length !== 5 || E.TEXT[ui].sheet.checklistShift(A).length !== 5) bad++;
  if (typeof E.TEXT[ui].game.magnote(A) !== 'string' || E.TEXT[ui].game.guideSteps(A).length !== 6 || E.TEXT[ui].sheet.checklist(A).length !== 6 || typeof E.TEXT[ui].sheet.instrSteps(A) !== 'string') bad++;
  eq(`${ui} texts / ${ml} alphabet: all texts present`, bad, 0);
  eq(`${ui} texts / ${ml} alphabet: whyNot never empty`, empty, 0);
}

// Validation catches bad puzzles
const bad = { cipher_id: 'caesar', params: { shift: 3 }, plaintext: 'MEET AT THE TREEHOUSE', ciphertext: 'PHHW DW WKH WUHHKRXVX', lang: 'en' };
eq('validate catches wrong ciphertext', E.validatePuzzle(bad, 'easy').ok, false);
eq('validate catches level', E.validatePuzzle({ ...bad, ciphertext: 'PHHW DW WKH WUHHKRXVH', cipher_id: 'vigenere', params: { key: 'KEY' } }, 'easy').ok, false);
eq('validate catches unsafe word', E.checkMessage('MEET AT THE ZEBRA', 'en').length > 0, true);
eq('validate catches foreign letters', E.checkMessage('SPOTKAJMY SIĘ W PARKU', 'en').length > 0, true);
eq('validate catches too many words', E.checkMessage('THE THE THE THE THE THE THE', 'en').length > 0, true);
let threw = false; try { E.generatePuzzle('easy', { cipher: 'affine' }); } catch (e) { threw = true; } eq('forced cipher must be allowed', threw, true);

console.log('\n' + (fails ? `FAILURES: ${fails}` : 'ALL PASSED'));
process.exit(fails ? 1 : 0);
