/**
 * Cipher Detective — shared puzzle engine (used by index.html, the game, and worksheet.html,
 * the printable worksheet generator). Classic script: defines the global `ENGINE`.
 *
 * The engine holds the logic only. All user-facing text lives in strings.js, which registers
 * one dictionary per language in ENGINE.TEXT (see textFor()).
 */
// Alphabet A–Z indexed A=0 … Z=25. Non-letters pass through unchanged. Output is uppercase.
// `i` (the key index for Vigenère/Beaufort) counts letters only.
const ENGINE = (() => {
  const mod = (n, m) => ((n % m) + m) % m;
  const L = ch => ch.charCodeAt(0) - 65;            // letter -> 0..25
  const C = n => String.fromCharCode(65 + n);       // 0..25 -> letter
  const isLetter = ch => ch >= 'A' && ch <= 'Z';
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  /** Apply fn(letterIndex, letterCounter) to every letter of text; everything else unchanged. */
  function mapLetters(text, fn) {
    let i = 0, out = '';
    for (const ch of String(text).toUpperCase()) {
      if (isLetter(ch)) { out += C(mod(fn(L(ch), i), 26)); i++; }
      else out += ch;
    }
    return out;
  }

  const AFFINE_A = [3, 5, 7, 11];
  const AFFINE_INV = { 3: 9, 5: 21, 7: 15, 11: 19 };   // a * inv ≡ 1 (mod 26)

  // Key words for Vigenère / Beaufort: 3–4 letters, at least two different letters.
  const KEYS = ['KEY','CAT','DOG','SUN','FUN','SPY','HAT','MAP','BOX','RED','SKY','OWL','BEE','FOX',
                'BLUE','STAR','MOON','LION','FROG','TREE','FISH','BEAR','CODE','BIRD','SHIP','GOLD','KITE','DUCK'];

  // Short, positive, kid-safe messages: 3–6 words, max 30 characters, common words only.
  // Messages are English on purpose: the ciphers work on the letters A–Z.
  const MESSAGES = [
    'MEET AT THE TREEHOUSE', 'THE CAKE IS READY', 'LOOK UNDER THE BED', 'YOU ARE A SUPER SPY',
    'PIZZA FOR DINNER TONIGHT', 'THE DOG LIKES TO DANCE', 'FIND THE HIDDEN KEY', 'GOOD JOB DETECTIVE',
    'MY CAT CAN JUMP HIGH', 'RACE YOU TO THE PARK', 'THE MAP IS IN THE BOX', 'BRING YOUR BLUE HAT',
    'HAPPY BIRTHDAY TO YOU', 'THE SUN IS SHINING', 'I LOVE ICE CREAM', 'LET US BUILD A FORT',
    'THE ROBOT SAYS HELLO', 'SECRET CLUB MEETS AT NOON', 'WATCH OUT FOR THE PUDDLE', 'THE PIRATE LOST HIS HAT',
    'COOKIES ARE IN THE JAR', 'MEET ME BY THE SWINGS', 'THE TREASURE IS NEAR', 'PACK YOUR SWIM SUIT',
    'THE OWL HOOTS AT NIGHT', 'WE WON THE BIG GAME', 'THE FROG CAN SING', 'YOUR CLUE IS THE RED DOOR',
    'CHECK THE MAIL BOX', 'THE PARTY STARTS AT FOUR', 'GRANDMA BAKED A PIE', 'THE MOON IS FULL TONIGHT',
    'LETS GO FLY A KITE', 'THE BUS COMES AT EIGHT', 'HIGH FIVE FOR YOU', 'THE PUPPY FOUND A SOCK',
    'TURN LEFT AT THE OAK TREE', 'DRAW A DRAGON WITH WINGS', 'THE SNOW IS PERFECT TODAY', 'YOU CRACKED THE CODE',
    'BEST FRIENDS FOREVER', 'THE GARDEN HAS A GNOME', 'HOT COCOA WITH MARSHMALLOWS', 'THE ZOO OPENS AT TEN',
    'THE PRIZE IS IN THE SHED', 'LOOK BEHIND THE BIG ROCK', 'THE CLASS TRIP IS FRIDAY', 'WEAR YOUR RAIN BOOTS',
    'THE FOX JUMPED THE FENCE', 'TEA PARTY IN THE GARDEN', 'YOU ARE A CODE MASTER', 'FEED THE FISH AT NOON',
    'THE TRAIN LEAVES AT NINE', 'MY BIKE IS BRIGHT GREEN', 'THE KITTEN LIKES BOXES', 'JUMP IN THE LEAF PILE',
    'THE RIVER IS COLD', 'WELL DONE YOUNG SPY', 'THE LIBRARY HAS NEW BOOKS', 'STARS SHINE AT NIGHT',
  ];

  // Every word a message may use. A message that uses any other word fails validation.
  const KID_SAFE_WORDS = new Set(('A AT ARE BAKED BED BEHIND BEST BIG BIKE BIRTHDAY BOOKS BOOTS BOX BOXES BRIGHT BRING ' +
    'BLUE BUILD BUS BY CAKE CAN CAT CHECK CLASS CLUB CLUE COCOA CODE COLD COMES COOKIES CRACKED CREAM DANCE DETECTIVE ' +
    'DINNER DOG DONE DOOR DRAGON DRAW EIGHT FEED FENCE FIND FISH FIVE FLY FOR FOREVER FORT FOUND FOUR FOX FRIDAY ' +
    'FRIENDS FROG FULL GAME GARDEN GNOME GO GOOD GRANDMA GREEN HAPPY HAS HAT HELLO HIDDEN HIGH HIS HOOTS HOT I ICE IN IS ' +
    'JAR JOB JUMP JUMPED KEY KITE KITTEN LEAF LEAVES LEFT LET LETS LIBRARY LIKES LOOK LOST LOVE MAIL MAP MARSHMALLOWS ' +
    'MASTER ME MEET MEETS MOON MY NEAR NEW NIGHT NINE NOON OAK OPENS OUT OWL PACK PARK PARTY PERFECT PIE PILE PIRATE ' +
    'PIZZA PRIZE PUDDLE PUPPY RACE RAIN READY RED RIVER ROBOT ROCK SAYS SECRET SHED SHINE SHINING SING SNOW SOCK SPY ' +
    'STARS STARTS SUIT SUN SUPER SWIM SWINGS TEA TEN THE TO TODAY TONIGHT TRAIN TREASURE TREE TREEHOUSE TRIP TURN ' +
    'UNDER US WATCH WE WEAR WELL WINGS WITH WON YOU YOUNG YOUR ZOO').split(/\s+/));

  const CIPHERS = {
    caesar: {
      level: 'easy', icon: '🏛️',
      params(rng) { let s; do { s = 1 + Math.floor(rng() * 25); } while (s === 13); return { shift: s }; },
      enc: (p, { shift }) => mapLetters(p, x => x + shift),
      dec: (c, { shift }) => mapLetters(c, x => x - shift),
    },
    rot13: {
      level: 'easy', icon: '🔄',
      params: () => ({}),
      enc: p => mapLetters(p, x => x + 13),
      dec: c => mapLetters(c, x => x - 13),
    },
    atbash: {
      level: 'easy', icon: '🪞',
      params: () => ({}),
      enc: p => mapLetters(p, x => 25 - x),
      dec: c => mapLetters(c, x => 25 - x),
    },
    vigenere: {
      level: 'hard', icon: '🔑',
      params(rng) { return { key: pick(KEYS, rng) }; },
      enc: (p, { key }) => mapLetters(p, (x, i) => x + L(key[i % key.length])),
      dec: (c, { key }) => mapLetters(c, (x, i) => x - L(key[i % key.length])),
    },
    affine: {
      level: 'hard', icon: '✖️',
      params(rng) { return { a: pick(AFFINE_A, rng), b: Math.floor(rng() * 26) }; },
      enc: (p, { a, b }) => mapLetters(p, x => a * x + b),
      dec: (c, { a, b }) => mapLetters(c, x => AFFINE_INV[a] * (x - b)),
    },
    beaufort: {
      level: 'hard', icon: '🧭',
      params(rng) { return { key: pick(KEYS, rng) }; },
      enc: (p, { key }) => mapLetters(p, (x, i) => L(key[i % key.length]) - x),
      dec: (c, { key }) => mapLetters(c, (x, i) => L(key[i % key.length]) - x),
    },
  };

  const LEVELS = {
    easy: ['caesar', 'rot13', 'atbash'],
    hard: ['caesar', 'rot13', 'atbash', 'vigenere', 'affine', 'beaufort'],
  };

  const encrypt = (id, text, params) => CIPHERS[id].enc(text, params || {});
  const decrypt = (id, text, params) => CIPHERS[id].dec(text, params || {});

  /** Letter-by-letter pairs: {p, c, pn, cn, s} where s = (c − p) mod 26. */
  function letterPairs(plain, cipher) {
    const out = [];
    for (let i = 0; i < plain.length; i++) {
      const p = plain[i], c = cipher[i];
      if (isLetter(p)) out.push({ p, c, pn: L(p), cn: L(c), s: mod(L(c) - L(p), 26) });
    }
    return out;
  }

  // ---------- texts (registered by strings.js) ----------
  const TEXT = {};
  function textFor(lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!t) throw new Error('Cipher texts not loaded: include strings.js after engine.js');
    return t;
  }
  /** First letter pair of a puzzle, used as the worked example in hints and explanations. */
  const example = puzzle => letterPairs(puzzle.plaintext, puzzle.ciphertext)[0];
  /** Hints [gentle, specific] and the explanation for a puzzle, in a language. */
  function puzzleText(puzzle, lang) {
    const t = textFor(lang).ciphers[puzzle.cipher_id], ex = example(puzzle);
    return { hints: t.hints(puzzle.params, ex), explanation: t.explain(puzzle.params, ex) };
  }
  /** Cipher name (short) and full name for sentences, in a language. */
  const cipherName = (id, lang) => textFor(lang).ciphers[id].name;
  const cipherFull = (id, lang) => textFor(lang).ciphers[id].full || textFor(lang).ciphers[id].name;

  function checkMessage(text) {
    const errors = [];
    if (!/^[A-Z ]+$/.test(text)) errors.push('message must contain only A–Z and spaces');
    if (text.length > 30) errors.push(`message is ${text.length} characters (max 30)`);
    const words = text.split(' ').filter(Boolean);
    if (words.length < 3 || words.length > 6) errors.push(`message has ${words.length} words (need 3–6)`);
    for (const w of words) if (!KID_SAFE_WORDS.has(w)) errors.push(`word not on the kid-safe list: ${w}`);
    return errors;
  }

  /** Validation that must pass before a puzzle is returned. */
  function validatePuzzle(puzzle, level) {
    const errors = [];
    const c = CIPHERS[puzzle.cipher_id];
    if (!c) errors.push(`unknown cipher: ${puzzle.cipher_id}`);
    if (!LEVELS[level]) errors.push(`unknown level: ${level}`);
    if (c && LEVELS[level] && !LEVELS[level].includes(puzzle.cipher_id)) errors.push(`${puzzle.cipher_id} is not allowed at level ${level}`);
    if (c) {
      const back = c.dec(puzzle.ciphertext, puzzle.params);
      if (back !== puzzle.plaintext) errors.push(`decrypting the ciphertext gives "${back}", not the plaintext`);
      if (puzzle.ciphertext === puzzle.plaintext) errors.push('ciphertext equals plaintext');
      if (puzzle.cipher_id === 'caesar' && (puzzle.params.shift < 1 || puzzle.params.shift > 25 || puzzle.params.shift === 13)) errors.push('bad Caesar shift');
      if (puzzle.cipher_id === 'affine' && !AFFINE_INV[puzzle.params.a]) errors.push('bad Affine a');
      if (puzzle.params && puzzle.params.key !== undefined) {
        const k = puzzle.params.key;
        if (!/^[A-Z]{3,4}$/.test(k)) errors.push('key must be 3–4 letters A–Z');
        if (new Set(k).size < 2) errors.push('key must have at least two different letters');
      }
    }
    errors.push(...checkMessage(puzzle.plaintext));
    return { ok: errors.length === 0, errors };
  }

  /**
   * Generate one puzzle for a level. Returns the JSON shape from the spec
   * (plus `hints` = [gentle, specific]; `hint` is the gentle one).
   * opts: { rng, lang, cipher, avoidCipher, avoidMessage, excludeMessages }
   *   lang            — language of hint/explanation texts (default 'en')
   *   cipher          — force this cipher id (must be allowed for the level)
   *   excludeMessages — Set/array of plaintexts not to use (e.g. already on the worksheet)
   */
  function generatePuzzle(level, opts = {}) {
    const rng = opts.rng || Math.random, lang = opts.lang || 'en';
    const allowed = LEVELS[level];
    if (!allowed) throw new Error('Unknown level: ' + level);
    if (opts.cipher && !allowed.includes(opts.cipher)) throw new Error(`${opts.cipher} is not allowed at level ${level}`);
    const excluded = new Set(opts.excludeMessages || []);
    if (opts.avoidMessage) excluded.add(opts.avoidMessage);
    let lastErr = null;
    for (let attempt = 0; attempt < 20; attempt++) {
      let ids = opts.cipher ? [opts.cipher] : allowed.filter(id => id !== opts.avoidCipher);
      if (!ids.length) ids = allowed;
      const cipher_id = pick(ids, rng);
      const cipher = CIPHERS[cipher_id];
      const params = cipher.params(rng);
      let msgs = MESSAGES.filter(m => !excluded.has(m));
      if (!msgs.length) msgs = MESSAGES;
      const plaintext = pick(msgs, rng);
      const ciphertext = cipher.enc(plaintext, params);
      const puzzle = { cipher_id, params, plaintext, ciphertext };
      const v = validatePuzzle(puzzle, level);
      if (v.ok) {
        const text = puzzleText(puzzle, lang);
        return { ...puzzle, hint: text.hints[0], hints: text.hints, explanation: text.explanation };
      }
      lastErr = v.errors.join('; ');
    }
    throw new Error('Could not generate a valid puzzle: ' + lastErr);
  }

  /** Friendly reason why the child's guess does not fit this puzzle ('' if nothing simple to say). */
  function whyNot(guess, puzzle, lang) {
    const actual = puzzle.cipher_id;
    if (guess === actual) return '';
    const W = textFor(lang).whyNot;
    const gname = cipherFull(guess, lang);
    const pairs = letterPairs(puzzle.plaintext, puzzle.ciphertext);
    const sameShift = pairs.every(x => x.s === pairs[0].s);
    const mirrored = pairs.every(x => x.pn + x.cn === 25);
    const key = puzzle.params && puzzle.params.key;

    // Special Caesar / ROT13 mix-ups
    if (guess === 'caesar' && actual === 'rot13') return W.closeRot13;
    if (guess === 'rot13' && actual === 'caesar') return W.closeCaesar(puzzle.params.shift);

    // Guessed a same-shift cipher, but the steps differ
    if (guess === 'caesar' || guess === 'rot13') {
      const d = pairs.find(x => x.s !== pairs[0].s);
      if (d) return W.stepsDiffer(gname, pairs[0], d);
    }
    // Guessed Atbash, but some letter does not mirror
    if (guess === 'atbash') {
      const d = pairs.find(x => x.pn + x.cn !== 25);
      if (d) return W.notMirror(d.p, C(25 - d.pn), d.c);
    }
    // Guessed a "same letter → same code letter" cipher, but a letter changed its code
    if (guess === 'affine' || guess === 'atbash' || guess === 'caesar' || guess === 'rot13') {
      const seen = new Map();
      for (const x of pairs) {
        if (seen.has(x.p) && seen.get(x.p) !== x.c) return W.sameLetterDiff(gname, x.p, seen.get(x.p), x.c);
        seen.set(x.p, x.c);
      }
    }
    // Guessed Affine / a key-word cipher, but the answer was a simpler pattern
    if (sameShift && (actual === 'caesar' || actual === 'rot13')) return W.sameShift(gname, pairs[0].s, guess === 'affine');
    if (mirrored && actual === 'atbash') return W.mirrored(gname);
    if ((guess === 'vigenere' || guess === 'beaufort') && actual === 'affine') return W.monoClue;
    if (guess === 'beaufort' && actual === 'vigenere' && key) return W.cycle(key.length, [...key].map(L).join(', '));
    if (guess === 'vigenere' && actual === 'beaufort' && key) {
      const n = key.length;
      const d = pairs.find((x, i) => i >= n && x.s !== pairs[i - n].s);
      if (d) return W.noCycle;
    }
    if (key) return W.keyFallback(gname, key);
    return '';
  }

  /** Seedable PRNG (cyrb-style string hash -> mulberry32), same construction as the math worksheet app. */
  function makePRNG(seed) {
    const str = String(seed);
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    const rnd = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; };
    return { rnd, shuffle };
  }

  /**
   * A printable worksheet: `count` distinct cases for `level`, reproducible from `seed`.
   * The same seed + level gives the same sequence of cases (in any language), so a longer
   * worksheet starts with the same cases as a shorter one. Ciphers are dealt evenly
   * (shuffled rounds), and no message repeats.
   */
  function generateWorksheet(seed, level, count, lang) {
    const allowed = LEVELS[level];
    if (!allowed) throw new Error('Unknown level: ' + level);
    count = Math.max(1, Math.min(MESSAGES.length, Math.floor(count) || 1));
    const prng = makePRNG(String(seed) + '|' + level);
    const used = new Set(), cases = [];
    let bag = [], last = null;
    for (let i = 0; i < count; i++) {
      if (!bag.length) {
        bag = prng.shuffle(allowed.slice());
        if (bag.length > 1 && bag[0] === last) bag.push(bag.shift());   // no cipher twice in a row
      }
      const cipher = bag.shift();
      const p = generatePuzzle(level, { rng: prng.rnd, cipher, excludeMessages: used, lang });
      used.add(p.plaintext); last = cipher;
      cases.push(p);
    }
    return { seed: String(seed), level, count, cases };
  }

  return { CIPHERS, LEVELS, KEYS, MESSAGES, KID_SAFE_WORDS, TEXT, textFor, encrypt, decrypt, letterPairs, example,
           puzzleText, cipherName, cipherFull, generatePuzzle, validatePuzzle, checkMessage, whyNot, makePRNG, generateWorksheet, L, C, mod };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ENGINE;
