/**
 * Morse code — shared engine for the online game (index.html) and the printable worksheets (worksheet.html).
 * Classic script; defines the global `MORSE` (also exported for Node: `node engine.test.js`).
 * Needs `MORSE_BANK` (bank.js); the colouring task also needs `DICT` (../graphic-dictation/engine.js) for its pictures.
 *
 *   MORSE.alphabet(lang)              → the letters that can be sent, in alphabet order
 *   MORSE.code(letter, lang)          → '.-' (dot = '.', dash = '-'), or undefined
 *   MORSE.groupOf(letter, lang)       → 1–4 (the order of learning), 5 for the language's own extra letters (Ą…, É, Ñ, Є Ї)
 *   MORSE.letters(lang, upto, extra)  → the letters of groups 1…upto (+ the extra letters)
 *   MORSE.norm(text, lang)            → the text as letters that can be sent (upper case, accents handled per language)
 *
 * Alphabets: international Morse A–Z for every Latin language. Polish adds Ą Ć Ę Ł Ń Ó Ś Ź Ż, French adds É (..-..),
 * Spanish adds Ñ (--.--); all three are real letters of their alphabets with codes of their own. Italian is sent with
 * A–Z only: its accents (À È É Ì Ò Ù) have no codes in common use, so they are dropped, as in English and Vietnamese.
 * Spanish drops its accents too (Á → A, Ü → U) but keeps Ñ, the way French keeps É. Ukrainian has its own table.
 *   MORSE.sheet(opts)                 → the model of a mixed worksheet: { blocks: [{ type, … }], letters, newest }
 *   MORSE.dictationWords(seed, lang, upto, extra) → the words of a dictation (the game plays the same ones)
 *   MORSE.svg(code, { u, unit })      → dots and dashes as an SVG string (u = the dot's size)
 *   MORSE.treeSVG(lang, opts)         → the Morse tree (left = dot, right = dash) as an SVG string
 *   MORSE.storySVG(opts)              → the picture of the Titanic story (the night of 14/15 April 1912)
 *   MORSE.raster(pts)                 → a picture outline filled into squares: { cols, rows, inside[r][c] }
 */
const MORSE = (() => {
  const BANK = typeof MORSE_BANK !== 'undefined' ? MORSE_BANK : require('./bank.js');
  const dict = () => (typeof DICT !== 'undefined' ? DICT : require('../graphic-dictation/engine.js'));
  const LANGS = ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es'];

  /* ---------- alphabets ---------- */
  const LATIN = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
    M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..',
  };
  const PL_EXTRA = { 'Ą': '.-.-', 'Ć': '-.-..', 'Ę': '..-..', 'Ł': '.-..-', 'Ń': '--.--', 'Ó': '---.', 'Ś': '...-...', 'Ź': '--..-.', 'Ż': '--..-' };
  const UK = {
    'А': '.-', 'Б': '-...', 'В': '.--', 'Г': '--.', 'Д': '-..', 'Е': '.', 'Є': '..-..', 'Ж': '...-', 'З': '--..', 'И': '-.--',
    'І': '..', 'Ї': '.---.', 'Й': '.---', 'К': '-.-', 'Л': '.-..', 'М': '--', 'Н': '-.', 'О': '---', 'П': '.--.', 'Р': '.-.',
    'С': '...', 'Т': '-', 'У': '..-', 'Ф': '..-.', 'Х': '....', 'Ц': '-.-.', 'Ч': '---.', 'Ш': '----', 'Щ': '--.-', 'Ь': '-..-',
    'Ю': '..--', 'Я': '.-.-',
  };
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const ALPHA = {
    en: ABC, vi: ABC, it: ABC,
    pl: 'A Ą B C Ć D E Ę F G H I J K L Ł M N Ń O Ó P R S Ś T U W Y Z Ź Ż'.split(' '),
    fr: 'A B C D E É F G H I J K L M N O P Q R S T U V W X Y Z'.split(' '),
    es: 'A B C D E F G H I J K L M N Ñ O P Q R S T U V W X Y Z'.split(' '),
    // Ґ is left out: Ukrainian tables give it no code of its own
    uk: 'А Б В Г Д Е Є Ж З И І Ї Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ь Ю Я'.split(' '),
  };
  const CODES = { en: LATIN, vi: LATIN, it: LATIN, pl: { ...LATIN, ...PL_EXTRA }, fr: { ...LATIN, 'É': '..-..' }, es: { ...LATIN, 'Ñ': '--.--' }, uk: UK };
  const EXTRA = { en: [], vi: [], it: [], pl: Object.keys(PL_EXTRA), fr: ['É'], es: ['Ñ'], uk: ['Є', 'Ї'] };
  /** Groups 1–3 in the order they are learned (short, common codes first); every other letter is group 4. */
  const GROUPS = {
    latin: [['E', 'T', 'A', 'N', 'I', 'M'], ['S', 'O', 'K', 'R'], ['U', 'D', 'W', 'G', 'L']],
    uk: [['Е', 'Т', 'А', 'Н', 'І', 'М'], ['С', 'О', 'К', 'Р'], ['У', 'Д', 'В', 'Г', 'Л']],
  };
  const UPTO = [1, 2, 3, 4];
  const lang_ = l => (CODES[l] ? l : 'en');
  const alphabet = lang => ALPHA[lang_(lang)];
  const code = (letter, lang) => CODES[lang_(lang)][letter];
  const extras = lang => EXTRA[lang_(lang)];
  function groupOf(letter, lang) {
    lang = lang_(lang);
    if (EXTRA[lang].includes(letter)) return 5;
    const g = (lang === 'uk' ? GROUPS.uk : GROUPS.latin).findIndex(gr => gr.includes(letter));
    return g >= 0 ? g + 1 : 4;
  }
  const letters = (lang, upto = 4, extra = false) => alphabet(lang).filter(l => { const g = groupOf(l, lang); return g <= upto || (extra && g === 5); });
  /** The letters of one group in the order they are learned (group 4 and 5 in alphabet order). */
  function groupLetters(lang, n) {
    if (n <= 3) return (lang_(lang) === 'uk' ? GROUPS.uk : GROUPS.latin)[n - 1].slice();
    return alphabet(lang).filter(l => groupOf(l, lang) === n);
  }
  /** The letters learned last: the extra letters when they are on, otherwise group `upto` (everything on group 1). */
  function newest(lang, upto = 4, extra = false) {
    if (extra && extras(lang).length) return extras(lang).slice();
    return alphabet(lang).filter(l => groupOf(l, lang) === upto);
  }

  /** Upper case, accents handled per language: pl/uk keep every letter; the others drop all marks
   *  but keep their own extra letters (fr É, es Ñ); vi đ → D. */
  function norm(text, lang) {
    lang = lang_(lang);
    let u = String(text).normalize('NFC').toUpperCase();
    const strip = c => c.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
    if (lang === 'vi') u = u.replace(/Đ/g, 'D');
    if (lang === 'fr') u = u.replace(/Œ/g, 'OE').replace(/Æ/g, 'AE');
    if (lang !== 'pl' && lang !== 'uk') u = [...u].map(c => (EXTRA[lang].includes(c) ? c : strip(c))).join('');
    return u.replace(/[’'-]/g, '').replace(/\s+/g, ' ').trim();
  }
  const sendable = (text, lang) => [...text].every(c => c === ' ' || code(c, lang) !== undefined);
  /** Text → words → [{ ch, code }]. */
  const encode = (text, lang) => norm(text, lang).split(' ').filter(Boolean).map(w => [...w].map(ch => ({ ch, code: code(ch, lang) })));
  const decodeLetter = (c, lang) => alphabet(lang).find(l => code(l, lang) === c);
  const len = s => s.replace(/ /g, '').length;

  /* ---------- the word bank, normalised once ---------- */
  const NB = {};
  function bank(lang) {
    lang = lang_(lang);
    if (NB[lang]) return NB[lang];
    const b = BANK[lang], seen = new Set();
    const words = [];
    for (const orig of b.words) { const w = norm(orig, lang); if (!seen.has(w)) { seen.add(w); words.push({ w, orig }); } }
    const riddles = b.riddles.map(([q, a]) => ({ q, w: norm(a, lang), orig: a }));
    const phrases = b.phrases.map(orig => ({ w: norm(orig, lang), orig }));
    return (NB[lang] = { words, riddles, phrases, ships: b.ships, mnemonics: b.mnemonics || {} });
  }
  const mnemonic = (letter, lang) => bank(lang).mnemonics[letter] || null;

  /* ---------- seeded random (mulberry32 on a string hash, as in the other puzzles) ---------- */
  function rng(seed) {
    let h = 1779033703 ^ String(seed).length;
    for (const ch of String(seed)) { h = Math.imul(h ^ ch.codePointAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let x = a;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
  function shuffle(rnd, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ---------- choosing words ---------- */
  function context(lang, upto, extra) {
    const ls = letters(lang, upto, extra), nw = newest(lang, upto, extra);
    const set = new Set(ls);
    const fits = w => [...w].every(c => c === ' ' || set.has(c));
    const b = bank(lang);
    return {
      lang, letters: ls, set, newest: nw, newSet: new Set(nw), used: new Set(),
      words: b.words.filter(x => fits(x.w)), riddles: b.riddles.filter(x => fits(x.w)), phrases: b.phrases.filter(x => fits(x.w)),
    };
  }
  /** One item from `list` that passes `test`: not used yet on this sheet if possible, and (2 times out of 3)
   *  with one of the newest letters in it, so the letters learned last get practised most. */
  function choose(ctx, rnd, list, test = () => true) {
    let c = list.filter(test);
    if (!c.length) return null;
    const fresh = c.filter(x => !ctx.used.has(x.w));
    if (fresh.length) c = fresh;
    if (ctx.newest.length < ctx.letters.length && rnd() < 0.67) {
      const nw = c.filter(x => [...x.w].some(ch => ctx.newSet.has(ch)));
      if (nw.length) c = nw;
    }
    const x = pick(rnd, c);
    ctx.used.add(x.w);
    return x;
  }
  const between = (a, b) => x => len(x.w) >= a && len(x.w) <= b;
  /** About how wide (mm) a word is as a row of code tiles on the worksheet (dots of 2 mm), and as letters
   *  over circles to fill in. Younger children's words must fit one row of a half-page column. */
  const tilesWidth = (w, lang, u = 2, min = 11) => w.split(' ').reduce((sum, part, i) => sum + (i ? 6 : 0)
    + [...part].reduce((t, ch, j) => t + (j ? 1.6 : 0) + Math.max(min, codeWidth(code(ch, lang)) * u + 2.9), 0), 0);
  const slotsWidth = (w, lang) => [...w].reduce((t, ch, j) => t + (j ? 4 : 0) + Math.max(6, code(ch, lang).length * 6 - 1), 0);
  const ROW_MM = 80;
  const fitsRow = ctx => x => !young(ctx) || tilesWidth(x.w, ctx.lang) <= ROW_MM;
  /** A word of a…b letters (that also passes `test`), or else the closest length there is. */
  function chooseWord(ctx, rnd, a, b, test = () => true) {
    const both = f => x => f(x) && test(x);
    return choose(ctx, rnd, ctx.words, both(between(a, b))) || choose(ctx, rnd, ctx.words, both(between(1, b + 2)))
      || choose(ctx, rnd, ctx.words, test) || choose(ctx, rnd, ctx.words);
  }

  /* ---------- the tasks ---------- */
  const TASKS = ['telegram', 'riddle', 'encode', 'error', 'password', 'coloring', 'pairs', 'tree', 'dictation'];
  const LEVELS = ['young', 'older'];
  const DEFAULT_TASKS = {
    young: ['telegram', 'riddle', 'encode', 'coloring'],
    older: ['telegram', 'riddle', 'encode', 'password'],
  };
  const young = ctx => ctx.level === 'young';

  function telegram(ctx, rnd) {
    const b = bank(ctx.lang), items = [];
    const ships = shuffle(rnd, b.ships);
    if (young(ctx)) {
      for (let i = 0; i < 2; i++) { const x = chooseWord(ctx, rnd, 2, 5, fitsRow(ctx)); if (x) items.push(x); }
    } else {   // one longer message from the sea
      const p = choose(ctx, rnd, ctx.phrases, x2 => len(x2.w) >= 6 && len(x2.w) <= 20 && x2.w.includes(' '));
      if (p) items.push(p);
      else {   // no message fits the letters yet: two words make one
        const a = chooseWord(ctx, rnd, 2, 5), c = chooseWord(ctx, rnd, 2, 5);
        if (a && c) items.push({ w: `${a.w} ${c.w}`, orig: `${a.orig} ${c.orig}` });
      }
    }
    return items.length ? { type: 'telegram', items: items.map((x, i) => ({ text: x.w, orig: x.orig, ship: ships[i % ships.length], given: young(ctx) })) } : null;
  }
  function riddle(ctx, rnd) {
    const items = [];
    for (let i = 0; i < 2; i++) {
      const x = choose(ctx, rnd, ctx.riddles, r => !items.includes(r) && fitsRow(ctx)(r));
      if (x) items.push(x);
    }
    return items.length ? { type: 'riddle', items: items.map(x => ({ q: x.q, text: x.w, orig: x.orig })) } : null;
  }
  function encodeTask(ctx, rnd) {
    const items = [];
    const sizes = young(ctx) ? [[2, 4], [2, 4]] : [[3, 6], [4, 7]];
    // younger: circles in half a page; older: a 21 mm box per letter across the page
    const fits = x => (young(ctx) ? slotsWidth(x.w, ctx.lang) <= ROW_MM : len(x.w) * 25 <= 180);
    for (const [a, b] of sizes) { const x = chooseWord(ctx, rnd, a, b, fits); if (x) items.push({ text: x.w, orig: x.orig }); }
    return items.length ? { type: 'encode', items } : null;
  }
  /** Codes one step apart: one symbol changed, added or taken away. */
  function oneOff(a, b) {
    if (a === b) return false;
    if (a.length === b.length) return [...a].filter((c, i) => c !== b[i]).length === 1;
    const [s, l] = a.length < b.length ? [a, b] : [b, a];
    if (l.length - s.length !== 1) return false;
    for (let i = 0; i < l.length; i++) if (l.slice(0, i) + l.slice(i + 1) === s) return true;
    return false;
  }
  function errorTask(ctx, rnd) {
    const items = [];
    for (let k = 0; k < 2; k++) {
      const x = chooseWord(ctx, rnd, 4, 7);
      if (!x) continue;
      const chars = [...x.w], spots = chars.map((c, i) => i).filter(i => chars[i] !== ' ');
      const i = pick(rnd, spots), right = code(chars[i], ctx.lang);
      // the telegraphist sent another letter by mistake: a code one dot or dash away (a letter the child knows, if any)
      const near = alphabet(ctx.lang).filter(l => oneOff(code(l, ctx.lang), right));
      const known = near.filter(l => ctx.set.has(l));
      const wrongLetter = pick(rnd, known.length ? known : near);
      const wrong = wrongLetter ? code(wrongLetter, ctx.lang) : right.slice(0, -1) + (right.endsWith('.') ? '-' : '.');
      items.push({ text: x.w, orig: x.orig, index: i, right, wrong });
    }
    return items.length ? { type: 'error', items } : null;
  }
  function pairs(ctx, rnd) {
    const n = Math.min(5, ctx.letters.length);
    const nw = shuffle(rnd, ctx.newest.filter(l => ctx.set.has(l))).slice(0, 3);
    const rest = shuffle(rnd, ctx.letters.filter(l => !nw.includes(l)));
    const left = shuffle(rnd, nw.concat(rest).slice(0, n));
    let right = shuffle(rnd, left);
    if (right.every((l, i) => l === left[i])) right = right.slice(1).concat(right[0]);
    return { type: 'pairs', left, right };
  }
  function password(ctx, rnd) {
    const [pa, pb, ca, cb] = young(ctx) ? [4, 5, 2, 5] : [5, 6, 3, 7];
    // the wanted length first; with few letters learned a shorter password will do
    const tries = [pa, pa - 1, pa - 2].flatMap(a => shuffle(rnd, ctx.words.filter(x => !x.w.includes(' ') && between(Math.max(3, a), a === pa ? pb : a)(x))));
    for (const pw of tries.slice(0, 80)) {
      const clues = [], taken = new Set([pw.w]);
      for (const ch of pw.w) {
        // clue words fit one row of small tiles in half a page
        const c = shuffle(rnd, ctx.words.filter(x => !taken.has(x.w) && x.w.includes(ch) && between(ca, cb)(x) && tilesWidth(x.w, ctx.lang, 1.7, 9.5) <= 78));
        if (!c.length) break;
        const fresh = c.find(x => !ctx.used.has(x.w)) || c[0];
        taken.add(fresh.w);
        const spots = [...fresh.w].map((x, i) => (x === ch ? i : -1)).filter(i => i >= 0);
        clues.push({ text: fresh.w, orig: fresh.orig, pos: pick(rnd, spots) });
      }
      if (clues.length === len(pw.w)) {
        ctx.used.add(pw.w); clues.forEach(c => ctx.used.add(c.text));
        return { type: 'password', word: pw.w, orig: pw.orig, clues };
      }
    }
    return null;
  }

  /* ---------- the colouring picture ---------- */
  const COLOR_MAX = { cols: 12, rows: 10, codeWidth: 6.1 };
  function pointIn(x, y, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  /** The outline filled into squares (a square is in when its middle is), with a free row/column all round. */
  function raster(pts, margin = 1) {
    const w = Math.max(...pts.map(p => p[0])), h = Math.max(...pts.map(p => p[1]));
    const cols = w + 2 * margin, rows = h + 2 * margin, inside = [];
    for (let r = 0; r < rows; r++) {
      inside.push([]);
      for (let c = 0; c < cols; c++) inside[r].push(pointIn(c - margin + 0.5, r - margin + 0.5, pts));
    }
    return { cols, rows, inside };
  }
  /** The everyday pictures of the graphic dictation that are drawn along the lines and fit the page. */
  function colorPictures() {
    const D = dict();
    return D.PICS.filter(p => p.themes.includes('basic') && D.steps(p.pts).every(s => !D.diagonal(s.dir))
      && D.size(p.pts).w + 2 <= COLOR_MAX.cols && D.size(p.pts).h + 2 <= COLOR_MAX.rows);
  }
  function coloring(ctx, rnd) {
    const D = dict();
    const pic = pick(rnd, colorPictures());
    const v = D.variant(pic, rnd);
    const R = raster(v.pts);
    // short codes fit a square with big enough dots (up to ·–· or ––, not –·– or longer); colour 2–3 letters, leave 2–3 others white
    const short = shuffle(rnd, ctx.letters.filter(l => codeWidth(code(l, ctx.lang)) <= COLOR_MAX.codeWidth));
    const nw = short.filter(l => ctx.newSet.has(l));
    const pool = nw.slice(0, 2).concat(short.filter(l => !nw.slice(0, 2).includes(l)));
    const nIn = Math.min(3, Math.floor(pool.length / 2)), nOut = Math.min(3, pool.length - nIn);
    const inL = pool.slice(0, nIn), outL = pool.slice(nIn, nIn + nOut);
    const cells = R.inside.map(row => row.map(isIn => pick(rnd, isIn ? inL : outL)));
    return { type: 'coloring', pic: pic.id, emoji: pic.emoji, cols: R.cols, rows: R.rows, inside: R.inside, cells, inLetters: inL.slice().sort((a, b) => alphabet(ctx.lang).indexOf(a) - alphabet(ctx.lang).indexOf(b)), outLetters: outL };
  }

  /* ---------- the Morse tree ---------- */
  /** Every letter with a code of 1–4 signs, placed on the tree: depth = code length, x in 0…1 (dot left, dash right). */
  function treeNodes(lang) {
    return alphabet(lang).map(l => ({ letter: l, code: code(l, lang) })).filter(n => n.code.length <= 4).map(n => {
      const d = n.code.length, i = parseInt(n.code.replace(/\./g, '0').replace(/-/g, '1'), 2);
      return { ...n, depth: d, x: (i + 0.5) / 2 ** d };
    });
  }
  function tree(ctx, rnd) {
    const nodes = treeNodes(ctx.lang).map(n => n.letter);
    const cand = ctx.letters.filter(l => nodes.includes(l) && code(l, ctx.lang).length > 1);   // E and T stay as the start
    const nw = shuffle(rnd, cand.filter(l => ctx.newSet.has(l)));
    const n = young(ctx) ? 6 : 10;
    const blanks = nw.concat(shuffle(rnd, cand.filter(l => !nw.includes(l)))).slice(0, n);
    return { type: 'tree', blanks };
  }
  /**
   * The tree as an SVG string, 186 mm wide by default. opts: { blanks: [letters left empty], active: [letters learned;
   * the others are grey], compact (less tall), poster (a full page with every code), width (mm), startLabel, cls }.
   * Letters that are not in the language (e.g. ··-- in English) are left out with their branch.
   */
  function treeSVG(lang, o = {}) {
    // `poster`: a full A4 page — taller levels, bigger circles and each letter's code under its circle
    const P = !!o.poster;
    const W = 1860, top = P ? 90 : 70, dy = P ? 495 : o.compact ? 108 : 135, r = P ? 54 : 42, f = n => Math.round(n * 10) / 10;
    const H = top + 4 * dy + (P ? 120 : 55);
    const nodes = treeNodes(lang), blanks = new Set(o.blanks || []);
    const active = o.active ? new Set(o.active) : null;   // letters not learned yet are drawn grey
    const pos = n => [f(30 + n.x * (W - 60)), top + n.depth * dy];
    const font = 'font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif"';
    let lines = '', marks = '', circles = '';
    for (const n of nodes) {
      const parentCode = n.code.slice(0, -1);
      const p = parentCode ? nodes.find(m => m.code === parentCode) : { x: 0.5, depth: 0 };
      if (!p) continue;
      const [x1, y1] = pos(p), [x2, y2] = pos(n);
      lines += `<path class="te" data-code="${n.code}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
      // the sign on the branch: a dot or a dash halfway down, just above the line
      const dx = x2 - x1, dy2 = y2 - y1, L = Math.hypot(dx, dy2) || 1;
      let nx = -dy2 / L, ny = dx / L;
      if (ny > 0) { nx = -nx; ny = -ny; }
      const k = P ? 1.6 : 1, off = 24 * k;
      const mx = f((x1 + x2) / 2 + nx * off), my = f((y1 + y2) / 2 + ny * off);
      marks += n.code.endsWith('-')
        ? `<rect x="${f(mx - 18 * k)}" y="${f(my - 6 * k)}" width="${f(36 * k)}" height="${f(12 * k)}" rx="${f(6 * k)}"/>`
        : `<circle cx="${mx}" cy="${my}" r="${f(8 * k)}"/>`;
    }
    for (const n of nodes) {
      const [x, y] = pos(n), empty = blanks.has(n.letter), dim = active && !active.has(n.letter);
      circles += `<g class="tn" data-code="${n.code}"><circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${dim ? '#bbb' : '#222'}" stroke-width="${empty ? 7 : P ? 5 : 4}"/>`;
      if (!empty) circles += `<text x="${x}" y="${f(y + (P ? 21 : 16))}" text-anchor="middle" font-size="${P ? 60 : 46}" font-weight="800" fill="${dim ? '#aaa' : '#111'}" ${font}>${n.letter}</text>`;
      if (P) {   // the whole code, small, under the circle
        const d = 11, dash = 23, gap = 6, w = [...n.code].reduce((a, c) => a + (c === '.' ? d : dash) + gap, -gap);
        let cx = x - w / 2;
        // a white band behind the code hides the branches running under it
        circles += `<rect x="${f(cx - 6)}" y="${y + r + 3}" width="${f(w + 12)}" height="38" rx="8" fill="#fff"/>`;
        for (const c of n.code) {
          circles += c === '.' ? `<circle cx="${f(cx + d / 2)}" cy="${y + r + 27}" r="${d / 2}" fill="#333"/>`
            : `<rect x="${f(cx)}" y="${y + r + 22.5}" width="${dash}" height="9" rx="4.5" fill="#333"/>`;
          cx += (c === '.' ? d : dash) + gap;
        }
      }
      circles += '</g>';
    }
    const sw = P ? 220 : 160, sh = P ? 84 : 68;
    const start = `<rect x="${W / 2 - sw / 2}" y="${top - sh / 2}" width="${sw}" height="${sh}" rx="${sh / 2}" fill="#222"/><text x="${W / 2}" y="${top + (P ? 15 : 12)}" text-anchor="middle" font-size="${P ? 42 : 34}" font-weight="800" fill="#fff" ${font}>${o.startLabel || 'START'}</text>`;
    const wmm = o.width || 186;
    return `<svg class="${o.cls || 'tree'}" viewBox="0 0 ${W} ${H}" width="${wmm}mm" height="${f(wmm * H / W)}mm" xmlns="http://www.w3.org/2000/svg" role="img">`
      + `<g stroke="#777" stroke-width="${P ? 6 : 5}" fill="none">${lines}</g><g fill="#222">${marks}</g>${start}${circles}</svg>`;
  }

  /* ---------- the dictation ---------- */
  /** Five short words for a dictation; the same seed and letters always give the same words (the game reads them too). */
  function dictationWords(seed, lang, upto, extra) {
    const ctx = context(lang, upto, extra), rnd = rng(`${seed}|dict|${lang_(lang)}|${upto}|${extra ? 1 : 0}`);
    const out = [];
    for (let i = 0; i < 5; i++) { const x = chooseWord(ctx, rnd, 2, 5); if (x) out.push({ text: x.w, orig: x.orig }); }
    return out;
  }
  /** The code printed on the sheet for the game: SEED/2 (letters up to group 2) or SEED/4+ (with the extra letters). */
  const dictationCode = (seed, upto, extra) => `${seed}/${upto}${extra ? '+' : ''}`;
  function parseDictationCode(s) {
    const m = String(s).trim().toUpperCase().replace(/\s+/g, '').match(/^(.+)\/([1-4])(\+?)$/);
    return m ? { seed: m[1], upto: +m[2], extra: m[3] === '+' } : null;
  }
  function dictation(ctx) {
    return { type: 'dictation', items: dictationWords(ctx.seed, ctx.lang, ctx.upto, ctx.extra), code: dictationCode(ctx.seed, ctx.upto, ctx.extra) };
  }

  /* ---------- a whole worksheet ---------- */
  const MAKERS = { telegram, riddle, encode: encodeTask, error: errorTask, password, coloring, pairs, tree, dictation };
  /**
   * opts: { seed, lang, level: 'young'|'older', upto: 1–4, extra: bool, tasks: [task ids] }.
   * The tasks come in a fixed order; each has its own random numbers, and words are not repeated across the sheet.
   */
  function sheet(o) {
    const lang = lang_(o.lang), level = LEVELS.includes(o.level) ? o.level : 'young';
    const upto = UPTO.includes(+o.upto) ? +o.upto : 2, extra = !!o.extra && extras(lang).length > 0;
    const seed = String(o.seed || 'SEED').toUpperCase();
    const ctx = Object.assign(context(lang, upto, extra), { level, seed, upto, extra });
    const want = new Set(o.tasks || DEFAULT_TASKS[level]);
    const blocks = [];
    for (const t of TASKS) {
      if (!want.has(t)) continue;
      const b = MAKERS[t](ctx, rng(`${seed}|${lang}|${level}|${upto}|${extra ? 1 : 0}|${t}`));
      if (b) blocks.push(b);
    }
    return { seed, lang, level, upto, extra, letters: ctx.letters, newest: ctx.newest, blocks };
  }

  /* ---------- the lighthouse ---------- */
  /** A lighthouse on a rock, 200 × 300 units. opts: { lit: beams and a yellow lamp, cls }. The game switches
   *  `.lh-beam` and `.lh-lamp` on and off with CSS while a signal plays. */
  function lighthouseSVG(o = {}) {
    const xl = y => 58 + (270 - y) * 14 / 148, xr = y => 142 - (270 - y) * 14 / 148, f = n => Math.round(n * 10) / 10;
    const band = (y1, y2) => `M${f(xl(y1))} ${y1}L${f(xr(y1))} ${y1}L${f(xr(y2))} ${y2}L${f(xl(y2))} ${y2}Z`;
    const lit = o.lit !== false;
    return `<svg class="${o.cls || 'lh'}" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" role="img">`
      + `<g class="lh-beam" fill="#ffd84d" opacity="${lit ? 0.5 : 0}"><path d="M100 93L0 52V134Z"/><path d="M100 93L200 52V134Z"/></g>`
      + `<path d="M4 300C20 272 44 262 64 268H136C160 260 182 272 196 300Z" fill="#7b8494"/>`
      + `<path d="M${f(xl(270))} 270L${f(xl(122))} 122H${f(xr(122))}L${f(xr(270))} 270Z" fill="#fff"/>`
      + `<path d="${band(142, 167)}${band(192, 217)}${band(242, 270)}" fill="#d6455a"/>`
      + `<path d="M${f(xl(270))} 270L${f(xl(122))} 122H${f(xr(122))}L${f(xr(270))} 270Z" fill="none" stroke="#1e2436" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M92 270V256A8 8 0 0 1 108 256V270Z" fill="#1e2436"/>`
      + `<rect x="62" y="112" width="76" height="10" rx="2" fill="#1e2436"/>`
      + `<rect x="76" y="74" width="48" height="38" fill="${lit ? '#fff3b0' : '#d5dce6'}" class="lh-glass" stroke="#1e2436" stroke-width="3"/>`
      + `<circle class="lh-lamp" cx="100" cy="93" r="10" fill="${lit ? '#ffc61a' : '#9aa5b1'}"/>`
      + `<path d="M92 74V112M108 74V112" stroke="#1e2436" stroke-width="2"/>`
      + `<path d="M70 74L100 48L130 74Z" fill="#d6455a" stroke="#1e2436" stroke-width="3" stroke-linejoin="round"/>`
      + `<circle cx="100" cy="43" r="5" fill="#1e2436"/></svg>`;
  }

  /* ---------- the Titanic story ---------- */
  /** The codes of the story: the old call CQD, then SOS. On the air SOS was one signal with no gaps (`SOS_SIGNAL`). */
  const STORY = {
    cqd: ['-.-.', '--.-', '-..'], sos: ['...', '---', '...'], letters: ['C', 'D', 'O', 'Q', 'S'],
    // the real message the Carpathia (call sign MPA) took down from the Titanic (MGY), about 0:25 on 15 April 1912
    telegram: 'COME AT ONCE. WE HAVE STRUCK A BERG. IT’S A CQD OM. POSITION 41.46 N 50.14 W.',
    words: ['MGY', 'CQD', 'OM', 'BERG', 'POSITION'],   // explained in the texts (`tgWords`, same order)
    names: ['MGY', 'MPA'], nameLetters: ['A', 'G', 'M', 'P', 'Y'],
  };
  const SOS_SIGNAL = '...---...';
  /** The night of 14/15 April 1912 as a light line drawing (cheap to print), 900 × 300 units:
   *  the Titanic calling SOS, the Californian close by with its radio off (Zzz), the Carpathia far away coming to help.
   *  Distances are not to scale. o: { labels: { near, off, far } } (the Titanic–Californian distance, short texts under the ships), cls. */
  function storySVG(o = {}) {
    const L = o.labels || {}, ink = '#1e2436';
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    // a liner seen from the side, bow to the right: x = stern, y = waterline, len, funnels = [x offsets], colour of the funnels
    function ship(x, y, len, funnels, fc, windows) {
      const h = len * 0.13, deck = y - h, top = deck - len * 0.05;
      let s = `<path d="M${x} ${deck}H${x + len}L${x + len - len * 0.05} ${y}H${x + len * 0.04}Z" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M${x + len * 0.02} ${deck + h * 0.55}H${x + len - len * 0.025}L${x + len - len * 0.05} ${y}H${x + len * 0.04}Z" fill="${ink}"/>`
        + `<rect x="${x + len * 0.12}" y="${top}" width="${len * 0.7}" height="${deck - top}" fill="#fff" stroke="${ink}" stroke-width="2.5"/>`;
      const fh = Math.max(len * 0.14, 24), fw = Math.max(len * 0.055, 11), lean = fh * 0.09;   // small ships keep big funnels
      for (const fx of funnels) s += `<path d="M${x + fx * len} ${top}l${lean} ${-fh}h${fw}l${-lean} ${fh}Z" fill="${fc}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`
        + `<path d="M${x + fx * len + lean} ${-fh + top}h${fw}l${-lean * 0.3} ${fh * 0.27}h${-fw}Z" fill="${ink}"/>`;
      for (let i = 0; i < windows; i++) s += `<circle cx="${x + len * (0.08 + i * 0.84 / (windows - 1))}" cy="${deck + h * 0.27}" r="${len * 0.008}" fill="${o.dark && fc !== '#e8a33d' ? ink : '#ffc61a'}"/>`;
      return s;
    }
    const waves = (y, from, to, step) => { let d = ''; for (let x = from; x < to; x += step) d += `M${x} ${y}q${step / 4} -6 ${step / 2} 0t${step / 2} 0`; return `<path d="${d}" fill="none" stroke="#9db6dc" stroke-width="2.5" stroke-linecap="round"/>`; };
    const arcs = (cx, cy, dir, col, n = 3) => { let d = ''; for (let i = 1; i <= n; i++) { const r = 12 + i * 13; d += `M${cx + dir * r * 0.5} ${cy - r * 0.87}A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${cx + dir * r * 0.5} ${cy + r * 0.87}`; } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round"/>`; };
    const star = (x, y, r) => `<path d="M${x} ${y - r}L${x + r * 0.3} ${y - r * 0.3}L${x + r} ${y}L${x + r * 0.3} ${y + r * 0.3}L${x} ${y + r}L${x - r * 0.3} ${y + r * 0.3}L${x - r} ${y}L${x - r * 0.3} ${y - r * 0.3}Z" fill="#ffd84d" stroke="#b08a00" stroke-width="1.2"/>`;
    const text = (x, y, s, anchor = 'middle', size = 22, w = 700) => s ? `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="${size}" font-weight="${w}" fill="${ink}">${esc(s)}</text>` : '';
    return `<svg class="${o.cls || 'story-scene'}" viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" role="img">`
      + `<rect x="1.5" y="1.5" width="897" height="297" rx="16" fill="#fff" stroke="${ink}" stroke-width="3"/>`
      + `<rect x="3" y="196" width="894" height="101" rx="0" fill="#e4eefb"/><path d="M3 196H897" stroke="#9db6dc" stroke-width="2.5"/>`
      + `<path d="M3 280V284Q3 297 16 297H884Q897 297 897 284V280Z" fill="#e4eefb"/>`
      + `<path d="M830 30a26 26 0 1 0 26 34a20 20 0 1 1 -26 -34Z" fill="#ffe9a8" stroke="#b08a00" stroke-width="2"/>`
      + star(120, 40, 7) + star(260, 26, 5) + star(430, 48, 6) + star(560, 24, 5) + star(700, 52, 7) + star(360, 92, 4) + star(620, 96, 4)
      // the iceberg, ahead of the Titanic
      + `<path d="M232 196L250 160L266 168L282 136L304 172L318 196Z" fill="#f4f9ff" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`
      + `<path d="M226 196L322 196L306 214L240 212Z" fill="#cfe0f5" stroke="${ink}" stroke-width="2" stroke-linejoin="round" opacity=".9"/>`
      // the Titanic: four buff funnels with black tops, the SOS going out from the mast
      + ship(18, 210, 210, [0.2, 0.36, 0.52, 0.68], '#e8a33d', 9)
      + `<path d="M208 158V96M38 166V110" stroke="${ink}" stroke-width="3"/><path d="M38 110L208 96" stroke="${ink}" stroke-width="1.5"/>`
      + arcs(208, 96, 1, '#d6455a').replace('<path ', '<path class="sos-arcs" ')
      + text(123, 250, 'TITANIC', 'middle', 26, 800)
      // how close the Californian was: a measuring line from the Titanic
      + (L.near ? `<path d="M240 232H382M248 224L240 232L248 240M374 224L382 232L374 240M240 222V242M382 222V242" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
        + text(311, 262, L.near, 'middle', 18, 700) : '')
      // the Californian, close by: small, lights out, the radio off and its operator asleep
      + ship(400, 206, 150, [0.45], '#e8e8e8', 7).replace(/#ffc61a/g, '#c9ced8')
      + `<path d="M532 172V112M420 172V122" stroke="${ink}" stroke-width="3"/><path d="M420 122L532 112" stroke="${ink}" stroke-width="1.5"/>`
      + text(552, 104, 'Z', 'start', 22, 800) + text(574, 86, 'z', 'start', 19, 800) + text(592, 70, 'z', 'start', 16, 800)
      + text(482, 240, 'CALIFORNIAN', 'middle', 22, 800) + text(482, 268, L.off, 'middle', 21, 600)
      // the Carpathia, far away: one red funnel, it hears the call and turns towards the Titanic
      + ship(720, 200, 120, [0.42], '#d6455a', 5)
      + `<path d="M732 168V124M826 170V130" stroke="${ink}" stroke-width="3"/><path d="M732 124L826 130" stroke="${ink}" stroke-width="1.5"/>` + arcs(732, 124, -1, '#1f9d55', 2)
      + `<path d="M712 186H662" stroke="#1f9d55" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 9"/><path d="M670 176L656 186L670 196" fill="none" stroke="#1f9d55" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
      + text(780, 236, 'CARPATHIA', 'middle', 22, 800) + text(780, 264, L.far, 'middle', 21, 600)
      + waves(282, 30, 880, 40)
      + '</svg>';
  }
  /** Morse today, 900 × 240 units: two radio amateurs far apart, crackling noise between them; the voice gets lost
   *  in the noise (?), the dots and dashes get through (✓). Not to scale. o: { labels: { voice, morse } }, cls. */
  function todaySVG(o = {}) {
    const L = o.labels || {}, ink = '#1e2436';
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const text = (x, y, s, anchor = 'start', size = 26, w = 800, fill = ink) => s ? `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="${size}" font-weight="${w}" fill="${fill}">${esc(s)}</text>` : '';
    // a little house with a wire antenna on a mast, the radio waves going out towards the other side (dir = ±1)
    function station(x, dir) {
      const mx = x + dir * 16;
      let d = '';
      for (let i = 1; i <= 3; i++) { const r = 10 + i * 12; d += `M${mx + dir * r * 0.5} ${52 - r * 0.87}A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${mx + dir * r * 0.5} ${52 + r * 0.87}`; }
      return `<path d="M${x - 30} 214V172L${x} 146L${x + 30} 172V214Z" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`
        + `<rect x="${x - 8}" y="190" width="16" height="24" fill="${ink}"/>`
        + `<path d="M${mx} 158V52M${mx - 24} 52H${mx + 24}" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`
        + `<path d="${d}" fill="none" stroke="#1f9d55" stroke-width="3.5" stroke-linecap="round"/>`;
    }
    // the crackling: grey zigzags over both lanes
    let noise = '';
    for (const y of [104, 170]) {
      noise += `M170 ${y}`;
      for (let i = 1, x = 170; x < 720; i++) { x += 11; noise += `L${x} ${Math.round(y + (i % 2 ? -1 : 1) * (5 + 9 * Math.abs(Math.sin(i * 1.7 + y))))}`; }
    }
    // the voice: a wave that gets weaker and weaker, then nothing can be understood
    let voice = '';
    for (let i = 0, x = 180; x < 430; i++, x += 22) { const a = 16 * (1 - i / 12); voice += `<path d="M${x} 104q5.5 ${-a} 11 0t11 0" fill="none" stroke="#7b5bc9" stroke-width="4" stroke-linecap="round" opacity="${Math.max(0.15, 1 - i / 11).toFixed(2)}"/>`; }
    // the Morse: SOS again and again, all the way across
    let morse = '';
    for (let x = 180, k = 0; x < 690; k++) {
      const s = SOS_SIGNAL[k % SOS_SIGNAL.length];
      morse += s === '.' ? `<circle cx="${x + 5}" cy="170" r="5.5"/>` : `<rect x="${x}" y="166" width="24" height="8.5" rx="4.2"/>`;
      x += (s === '.' ? 11 : 24) + (k % SOS_SIGNAL.length === SOS_SIGNAL.length - 1 ? 20 : 8);
    }
    return `<svg class="${o.cls || 'today-scene'}" viewBox="0 0 900 240" xmlns="http://www.w3.org/2000/svg" role="img">`
      + `<rect x="1.5" y="1.5" width="897" height="237" rx="16" fill="#fff" stroke="${ink}" stroke-width="3"/>`
      + `<path d="M3 214H897V226Q897 237 884 237H16Q3 237 3 226Z" fill="#e7f2df"/><path d="M3 214H897" stroke="#9cc58a" stroke-width="2.5"/>`
      + `<path d="${noise}" fill="none" stroke="#c9ced8" stroke-width="2" stroke-linejoin="round"/>`
      + station(90, 1) + station(810, -1)
      + text(180, 74, L.voice) + voice + text(470, 120, '?', 'middle', 48, 800, '#d6455a')
      + text(180, 142, L.morse) + `<g fill="${ink}">${morse}</g>`
      + `<path d="M716 168l10 11l20 -24" fill="none" stroke="#1f9d55" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
      + '</svg>';
  }

  /* ---------- drawing dots and dashes ---------- */
  const DOT = 10, GAP = 7.5, DASH = 26, BAR = 7.4;
  /** Width of a code in dot sizes. */
  const codeWidth = c => ([...c].reduce((w, s) => w + (s === '.' ? DOT : DASH) + GAP, 0) - GAP) / DOT;
  /** Dots and dashes as an SVG string; u = the dot's size in `unit` (default 2 mm). */
  function svg(c, o = {}) {
    const f = n => Math.round(n * 100) / 100;
    let x = 0, parts = '';
    for (const s of c) {
      if (s === '.') { parts += `<circle cx="${x + DOT / 2}" cy="${DOT / 2}" r="${DOT / 2}"/>`; x += DOT; }
      else { parts += `<rect x="${x}" y="${f((DOT - BAR) / 2)}" width="${DASH}" height="${BAR}" rx="${BAR / 2}"/>`; x += DASH; }
      x += GAP;
    }
    const W = Math.max(x - GAP, 1), k = (o.u || 2) / DOT, unit = o.unit || 'mm';
    return `<svg class="${o.cls || 'mc'}" viewBox="0 0 ${f(W)} ${DOT}" width="${f(W * k)}${unit}" height="${f(DOT * k)}${unit}" fill="currentColor" aria-hidden="true">${parts}</svg>`;
  }

  return {
    LANGS, TASKS, LEVELS, UPTO, DEFAULT_TASKS, COLOR_MAX,
    alphabet, code, extras, groupOf, groupLetters, letters, newest, norm, sendable, encode, decodeLetter, len, bank, mnemonic,
    rng, pick, shuffle, oneOff, tilesWidth, slotsWidth, raster, pointIn, colorPictures, treeNodes, treeSVG, lighthouseSVG, STORY, SOS_SIGNAL, storySVG, todaySVG,
    dictationWords, dictationCode, parseDictationCode, sheet, svg, codeWidth,
  };
})();
if (typeof module !== 'undefined') module.exports = MORSE;
