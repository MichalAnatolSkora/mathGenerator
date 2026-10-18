/**
 * The "Revolution" cipher (Szyfr „Rewolucja”): read two Red Army telegrams of 12 August 1920 written in a
 * double-transformation cipher, the way Polish radio intelligence broke such ciphers. Classic script; defines the
 * global `REW` (also exported for Node).
 *
 *   REW.ALPHABET           → the Russian alphabet of the telegrams (32 letters, Ё written as Е)
 *   REW.GRID               → the base table ("krata"): 4 rows × 8 columns, a letter = row digit + column digit
 *   REW.code(ch)           → the two digits of a letter, e.g. 'И' → [1, 0]
 *   REW.letter(r, c)       → the letter in row r, column c (or '' outside the table)
 *   REW.add(a, b) / sub(a, b) → one digit plus / minus another "leaving out the tens" (no carry, no borrow)
 *   REW.unfold(key6)       → the 12 digits written under a telegram: the 6 digits, then the same backwards
 *   REW.isMirror(d)        → do 12 digits read the same backwards? (the check of a found key)
 *   REW.encrypt(text, key6) / decrypt(digits, key6) → text (letters, no gaps) ↔ cipher digits
 *   REW.keyFrom(digits, word) → the key digits under a known word: cipher − word, digit by digit
 *   REW.STARTS, REW.CANDIDATES, REW.BODY1, REW.T2 → the telegrams' parts (see below)
 *   REW.VOCAB              → every word of the telegrams and of the candidates (the glossary)
 *   REW.day(rnd)           → { num, key6, key12, telegrams: [{ id, words, text, plain, keyRow, cipher, groups }] }
 *
 * How the Soviet ciphers of 1920 worked (M. Grajek, "Documents of Polish-Soviet War of 1919-1920 Codebreaking",
 * HistoCrypt 2021; G. Nowik, "Zanim złamano Enigmę… Rozszyfrowano Rewolucję"): a letter became two digits from a
 * table (row, column), then a short key of digits was written under the digits — first in its normal order, then
 * backwards, and so on to the end — and added "leaving out the tens" (Kowalewski's note on the "Delegat" key).
 * The cipher clerks restarted the key at every message and used the same few opening words, so a guessed word
 * gives the key: cipher − word = key, and a key that reads the same backwards is the right one.
 * The exact table of "Revolution" is not published; ours is built the same way. Our telegrams are short and our
 * own wording of what the order of 12 August revealed: the 16th Army was to attack Warsaw from the east.
 * Every telegram has at most 15 letters (30 digits), so it fits one line of 5 mm boxes on the sheet.
 */
const REW = (() => {
  const ALPHABET = [...'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'];
  // The base table stays the same; only the key ("zmiennik") changes, as with "Delegat" in 1919.
  const GRID = ['МШЗЮОТЫГ', 'ИНВПЛЕХЪ', 'ЖБРКЦЬЭЙ', 'ФДЧЩЯАСУ'].map(r => [...r]);
  const POS = {};
  GRID.forEach((row, r) => row.forEach((ch, c) => { POS[ch] = [r, c]; }));

  const code = ch => POS[ch].slice();
  const letter = (r, c) => (GRID[r] && GRID[r][c]) || '';
  const add = (a, b) => (a + b) % 10;
  const sub = (a, b) => (a - b + 10) % 10;
  const unfold = key6 => [...key6, ...key6.slice().reverse()];
  const isMirror = d => d.length === 12 && d.every((x, i) => x === d[11 - i]);
  const digitsOf = text => [...text].flatMap(code);
  const keyRowFor = (n, key6) => { const k = unfold(key6); return Array.from({ length: n }, (_, i) => k[i % 12]); };

  function encrypt(text, key6) {
    const p = digitsOf(text), k = keyRowFor(p.length, key6);
    return p.map((x, i) => add(x, k[i]));
  }
  function decrypt(digits, key6) {
    const k = keyRowFor(digits.length, key6), p = digits.map((x, i) => sub(x, k[i]));
    let s = '';
    for (let i = 0; i + 1 < p.length; i += 2) s += letter(p[i], p[i + 1]) || '?';
    return s;
  }
  const keyFrom = (digits, word) => digitsOf(word).map((x, i) => sub(digits[i], x));

  // Telegram 1 begins with a usual opening word (6 letters: its 12 digits give the whole key and its check).
  const STARTS = ['ПРИКАЗ', 'СРОЧНО'];
  const CANDIDATES = ['ПРИКАЗ', 'СРОЧНО', 'ДИВИЗИЯМ'];   // ★★★: the words to try; only the first 6 letters count
  const BODY1 = ['НА', 'ВАРШАВУ'];
  const T2 = [
    { id: 'east', words: ['УДАР', 'С', 'ВОСТОКА'] },
    { id: 'praga', words: ['ИДЕМ', 'НА', 'ПРАГУ'] },
    { id: 'attack', words: ['АТАКА', 'С', 'ВОСТОКА'] },
  ];
  const VOCAB = [...new Set([...CANDIDATES, ...BODY1, ...T2.flatMap(t => t.words), 'РЕВОЛЮЦИЯ'])]
    .sort((a, b) => a.localeCompare(b, 'ru'));

  /** A worked example for the "How does it work?" page: always the same. */
  const EXAMPLE = { word: 'ДИВИЗИЯ', key6: [2, 7, 1, 9, 3, 8] };

  function day(rnd) {
    const num = 1 + Math.floor(rnd() * 4);
    const start = STARTS[Math.floor(rnd() * STARTS.length)];
    const t2 = T2[Math.floor(rnd() * T2.length)];
    let key6;
    for (;;) {
      key6 = Array.from({ length: 6 }, () => Math.floor(rnd() * 10));
      if (new Set(key6).size < 4) continue;   // dull keys (like 112211) are not used
      const c = encrypt(start, key6);
      // only the true opening word may give a mirrored key
      if (CANDIDATES.every(w => (w.slice(0, 6) === start) === isMirror(keyFrom(c, w.slice(0, 6))))) break;
    }
    const telegrams = [{ id: 'order', words: [start, ...BODY1] }, { id: t2.id, words: t2.words }].map(t => {
      const text = t.words.join(''), plain = digitsOf(text), keyRow = keyRowFor(plain.length, key6);
      const cipher = plain.map((x, i) => add(x, keyRow[i])), groups = [];
      for (let i = 0; i < cipher.length; i += 5) groups.push(cipher.slice(i, i + 5).join(''));
      return { ...t, text, plain, keyRow, cipher, groups };
    });
    return { num, start, key6, key12: unfold(key6), telegrams };
  }

  return { ALPHABET, GRID, code, letter, add, sub, unfold, isMirror, digitsOf, encrypt, decrypt, keyFrom,
    STARTS, CANDIDATES, BODY1, T2, VOCAB, EXAMPLE, day, MAP_ANSWER: 'A' };
})();
if (typeof module !== 'undefined') module.exports = REW;
