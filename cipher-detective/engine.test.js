// Run with: node engine.test.js
const E = require('./engine.js');
require('./strings.js');   // registers the texts in E.TEXT (en, pl, uk, vi)
const LANGS = Object.keys(E.TEXT);
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };

// Reference vectors
eq('spec caesar 3', E.encrypt('caesar', 'MEET AT THE TREEHOUSE', { shift: 3 }), 'PHHW DW WKH WUHHKRXVH');
eq('caesar dec', E.decrypt('caesar', 'PHHW DW WKH WUHHKRXVH', { shift: 3 }), 'MEET AT THE TREEHOUSE');
eq('rot13', E.encrypt('rot13', 'HELLO', {}), 'URYYB');
eq('rot13 twice', E.encrypt('rot13', E.encrypt('rot13', 'HELLO WORLD', {}), {}), 'HELLO WORLD');
eq('atbash', E.encrypt('atbash', 'HELLO', {}), 'SVOOL');
eq('vigenere LEMON', E.encrypt('vigenere', 'ATTACKATDAWN', { key: 'LEMON' }), 'LXFOPVEFRNHR');
eq('vigenere: spaces do not advance the key', E.encrypt('vigenere', 'ATTACK AT DAWN', { key: 'LEMON' }), 'LXFOPV EF RNHR');
eq('affine 5,8', E.encrypt('affine', 'AFFINE CIPHER', { a: 5, b: 8 }), 'IHHWVC SWFRCP');
eq('affine dec', E.decrypt('affine', 'IHHWVC SWFRCP', { a: 5, b: 8 }), 'AFFINE CIPHER');
eq('beaufort', E.encrypt('beaufort', 'DEFENDTHEEASTWALLOFTHECASTLE', { key: 'FORTIFICATION' }), 'CKMPVCPVWPIWUJOGIUAPVWRIWUUK');
eq('beaufort reciprocal', E.decrypt('beaufort', 'CKMPVCPVWPIWUJOGIUAPVWRIWUUK', { key: 'FORTIFICATION' }), 'DEFENDTHEEASTWALLOFTHECASTLE');

// Round trips: every cipher × parameter × message
let rt = 0;
for (const m of E.MESSAGES) {
  for (let s = 1; s <= 25; s++) { if (E.decrypt('caesar', E.encrypt('caesar', m, { shift: s }), { shift: s }) !== m) { fails++; console.log('FAIL caesar rt', m, s); } rt++; }
  if (E.decrypt('rot13', E.encrypt('rot13', m, {}), {}) !== m) { fails++; console.log('FAIL rot13 rt', m); } rt++;
  if (E.decrypt('atbash', E.encrypt('atbash', m, {}), {}) !== m) { fails++; console.log('FAIL atbash rt', m); } rt++;
  for (const a of [3, 5, 7, 11]) for (let b = 0; b < 26; b++) { if (E.decrypt('affine', E.encrypt('affine', m, { a, b }), { a, b }) !== m) { fails++; console.log('FAIL affine rt', m, a, b); } rt++; }
  for (const key of E.KEYS) {
    if (E.decrypt('vigenere', E.encrypt('vigenere', m, { key }), { key }) !== m) { fails++; console.log('FAIL vigenere rt', m, key); } rt++;
    if (E.decrypt('beaufort', E.encrypt('beaufort', m, { key }), { key }) !== m) { fails++; console.log('FAIL beaufort rt', m, key); } rt++;
  }
}
console.log('round trips:', rt);

// Message bank and keys follow the spec
for (const m of E.MESSAGES) { const errs = E.checkMessage(m); if (errs.length) { fails++; console.log('FAIL message', m, errs); } }
eq('messages unique', new Set(E.MESSAGES).size, E.MESSAGES.length);
for (const k of E.KEYS) if (!/^[A-Z]{3,4}$/.test(k) || new Set(k).size < 2) { fails++; console.log('FAIL key', k); }

// Generator: valid, level-restricted, honours options
const seen = { easy: {}, hard: {} };
for (const level of ['easy', 'hard']) {
  for (let i = 0; i < 3000; i++) {
    const p = E.generatePuzzle(level, { avoidCipher: 'caesar', avoidMessage: E.MESSAGES[0] });
    const v = E.validatePuzzle(p, level);
    if (!v.ok) { fails++; console.log('FAIL gen', level, v.errors, p); }
    if (p.cipher_id === 'caesar' || p.plaintext === E.MESSAGES[0]) { fails++; console.log('FAIL avoid options', p); }
    if (typeof p.hint !== 'string' || p.hints.length !== 2 || typeof p.explanation !== 'string') { fails++; console.log('FAIL hint shape', p); }
    seen[level][p.cipher_id] = (seen[level][p.cipher_id] || 0) + 1;
  }
}
eq('easy excludes hard ciphers', Object.keys(seen.easy).sort().join(','), 'atbash,rot13');
eq('hard covers all', Object.keys(seen.hard).sort().join(','), 'affine,atbash,beaufort,rot13,vigenere');
eq('forced cipher', E.generatePuzzle('hard', { cipher: 'affine' }).cipher_id, 'affine');
let threw = false; try { E.generatePuzzle('easy', { cipher: 'affine' }); } catch (e) { threw = true; } eq('forced cipher must be allowed', threw, true);
eq('excludeMessages', E.generatePuzzle('easy', { excludeMessages: E.MESSAGES.slice(1) }).plaintext, E.MESSAGES[0]);

// Validation catches bad puzzles
const bad = { cipher_id: 'caesar', params: { shift: 3 }, plaintext: 'MEET AT THE TREEHOUSE', ciphertext: 'PHHW DW WKH WUHHKRXVX' };
eq('validate catches wrong ciphertext', E.validatePuzzle(bad, 'easy').ok, false);
eq('validate catches level', E.validatePuzzle({ ...bad, ciphertext: 'PHHW DW WKH WUHHKRXVH', cipher_id: 'vigenere', params: { key: 'KEY' } }, 'easy').ok, false);
eq('validate catches unsafe word', E.checkMessage('MEET AT THE ZEBRA').length > 0, true);
eq('validate catches too many words', E.checkMessage('THE THE THE THE THE THE THE').length > 0, true);

// Texts: every language has every key, and hints/explanations/whyNot are never empty
eq('languages', LANGS.sort().join(','), 'en,pl,uk,vi');
for (const lang of LANGS) {
  for (const group of ['levels', 'whyNot', 'params', 'game', 'sheet']) {
    const missing = Object.keys(E.TEXT.en[group]).filter(k => E.TEXT[lang][group][k] === undefined);
    eq(`${lang}.${group} has all keys`, missing.join(','), '');
  }
  for (const id of E.LEVELS.hard) {
    const missing = ['name', 'blurb', 'how', 'spot', 'hints', 'explain'].filter(k => !E.TEXT[lang].ciphers[id][k]);
    eq(`${lang}.ciphers.${id} complete`, missing.join(','), '');
  }
  let empty = 0, bad = 0;
  for (let i = 0; i < 1500; i++) {
    const p = E.generatePuzzle('hard', { lang });
    if (p.hints.length !== 2 || !p.hints[0] || !p.hints[1] || !p.explanation) bad++;
    for (const g of E.LEVELS.hard) if (g !== p.cipher_id && !E.whyNot(g, p, lang)) empty++;
  }
  eq(`${lang}: hints and explanation present`, bad, 0);
  eq(`${lang}: whyNot always has a note`, empty, 0);
}
eq('worksheet cases identical across languages', JSON.stringify(E.generateWorksheet('SPY-1', 'hard', 6, 'pl').cases.map(c => c.ciphertext)), JSON.stringify(E.generateWorksheet('SPY-1', 'hard', 6, 'vi').cases.map(c => c.ciphertext)));

// Worksheets: deterministic, prefix-stable, distinct messages, ciphers dealt evenly, valid
const w1 = E.generateWorksheet('SPY-4821', 'hard', 6), w2 = E.generateWorksheet('SPY-4821', 'hard', 6), w3 = E.generateWorksheet('SPY-4821', 'hard', 3);
eq('worksheet deterministic', JSON.stringify(w1), JSON.stringify(w2));
eq('worksheet prefix-stable', JSON.stringify(w3.cases), JSON.stringify(w1.cases.slice(0, 3)));
eq('worksheet differs by seed', JSON.stringify(E.generateWorksheet('OTHER-1', 'hard', 6)) === JSON.stringify(w1), false);
eq('worksheet differs by level', JSON.stringify(E.generateWorksheet('SPY-4821', 'easy', 3).cases) === JSON.stringify(w3.cases), false);
for (let i = 0; i < 300; i++) {
  const level = i % 2 ? 'hard' : 'easy', n = 1 + (i % 10);
  const W = E.generateWorksheet('S' + i, level, n);
  eq(`worksheet ${i} count`, W.cases.length, n);
  const msgs = new Set(W.cases.map(c => c.plaintext));
  if (msgs.size !== n) { fails++; console.log('FAIL worksheet repeated message', W); }
  for (let j = 1; j < n; j++) if (W.cases[j].cipher_id === W.cases[j - 1].cipher_id) { fails++; console.log('FAIL worksheet same cipher twice in a row', W); }
  for (const c of W.cases) { const v = E.validatePuzzle(c, level); if (!v.ok) { fails++; console.log('FAIL worksheet case', v.errors); } }
  const allowed = E.LEVELS[level];
  if (n >= allowed.length) { const ids = new Set(W.cases.map(c => c.cipher_id)); if (ids.size !== allowed.length) { fails++; console.log('FAIL worksheet does not cover all ciphers', W); } }
}
console.log('\n' + (fails ? `FAILURES: ${fails}` : 'ALL PASSED'));
process.exit(fails ? 1 : 0);
