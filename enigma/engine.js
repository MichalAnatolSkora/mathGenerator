/**
 * Young Codebreakers Academy (Akademia Młodych Szyfrantów): engine for the printable Enigma
 * worksheets. Classic script: defines the global `ENIGMA` (and module.exports for node tests).
 *
 * The engine holds the data, the ciphers and the page builders. All user-facing text lives in
 * strings.js, which registers one dictionary per language in ENIGMA.TEXT.
 *
 * Every language has its own pack (PACKS): the alphabet for Missions 1–2, a mixed alphabet
 * (subKey, a derangement of the alphabet), the 8 letters of the paper mini-Enigma (`out`, in
 * alphabet order) and the messages. The mini-Enigma is built from the same indices in every
 * language (INN_IDX, MIR_IDX), so it works the same way everywhere:
 *   big wheel (black)  out = A E I K L M O T
 *   cipher wheel (red) inn = out[INN_IDX[i]] = M T A O K I E L, the star sits under inn[0]
 *   mirror             out[MIR_IDX[k][0]] ↔ out[MIR_IDX[k][1]]  (A↔O, E↔T, I↔K, L↔M)
 * k = how many notches the red wheel was turned clockwise (the star then points at out[k]).
 * Characters outside the alphabet (spaces) pass through unchanged and do not turn the wheel.
 */
const ENIGMA = (() => {
  const INN_IDX = [5, 7, 0, 6, 3, 2, 1, 4];          // for AEIKLMOT gives MTAOKIEL
  const MIR_IDX = [[0, 6], [1, 7], [2, 3], [4, 5]];  // A↔O, E↔T, I↔K, L↔M
  const TOTAL = 13;                                   // pages: 10 = final report, 11 = answer key, 12–13 = big Enigma (for the keen)
  const DEFAULT_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  // ---------- language packs ----------
  const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LATIN_SUB = 'NJLKMYDTAIWCEHBUPVFGSQXZRO';
  const PACKS = {
    pl: {
      alpha: LATIN, subKey: LATIN_SUB, out: 'AEIKLMOT', cards: 'ABCD',
      m1b: 'SZYFR TO SUPER ZABAWA', m1c: 'RAPORT SKARB JEST W KUCHNI', crib: 'RAPORT',
      m2a: 'TO JEST TAJNA WIADOMOSC',
      m4b: 'KOTEK', m4c: 'LATO', m5a: 'MAMA', m5c: 'KOTEK', m6a: 'TATA', m6b: 'MAMA MA KAKAO',
      examples: ['KOT', 'LATO', 'MLEKO'],
      parentWords: ['KOT', 'KOTEK', 'LATO', 'MLEKO', 'MAMA', 'TATA', 'KAKAO', 'TOTEM', 'LIMETKA', 'MAM KOTA'],
      reward: 'kakao', big: 'GRATULACJE MISTRZU SZYFROW',
    },
    en: {
      alpha: LATIN, subKey: LATIN_SUB, out: 'AEIKLMOT', cards: 'ABCD',
      m1b: 'CODES ARE FUN', m1c: 'REPORT TREASURE IN THE KITCHEN', crib: 'REPORT',
      m2a: 'THIS IS A SECRET MESSAGE',
      m4b: 'MOTEL', m4c: 'MILK', m5a: 'MOM', m5c: 'KITE', m6a: 'TOTAL', m6b: 'I LIKE MILK',
      examples: ['KITE', 'MILK', 'TOMATO'],
      parentWords: ['MILK', 'KITE', 'LIME', 'MOTEL', 'TOMATO', 'TOTAL', 'METAL', 'MAIL', 'TALK', 'I LIKE MILK'],
      reward: 'a glass of milk', big: 'WELL DONE MASTER CODEBREAKER',
    },
    fr: {
      alpha: LATIN, subKey: LATIN_SUB, out: 'AEIKLMOT', cards: 'ABCD',
      m1b: 'LES CODES SONT AMUSANTS', m1c: 'RAPPORT TRESOR DANS LA CUISINE', crib: 'RAPPORT',
      m2a: 'CECI EST UN MESSAGE SECRET',
      m4b: 'TOMATE', m4c: 'LAIT', m5a: 'MAMIE', m5c: 'TOMATE', m6a: 'MOTO', m6b: 'ELLE AIME LE LAIT',
      examples: ['MOTO', 'LAIT', 'TOMATE'],
      parentWords: ['MOTO', 'LAIT', 'TOMATE', 'MIEL', 'AMI', 'ETOILE', 'TOILE', 'ELLE AIME LE LAIT'],
      reward: 'un verre de lait', big: 'BRAVO MAITRE DES CODES',
    },
    it: {
      alpha: LATIN, subKey: LATIN_SUB, out: 'AEIKLMOT', cards: 'ABCD',
      m1b: 'I CODICI SONO DIVERTENTI', m1c: 'RAPPORTO TESORO IN CUCINA', crib: 'RAPPORTO',
      m2a: 'ECCO UN MESSAGGIO SEGRETO',
      m4b: 'TOTEM', m4c: 'LATTE', m5a: 'MAMMA', m5c: 'MELA', m6a: 'MOTO', m6b: 'IO AMO IL LATTE',
      examples: ['MOTO', 'MELA', 'LATTE'],
      parentWords: ['MOTO', 'MELA', 'LATTE', 'MIELE', 'MATITA', 'KOALA', 'TOTEM', 'MAIALE', 'TETTO', 'IO AMO IL LATTE'],
      reward: 'un bicchiere di latte', big: 'BRAVO MAESTRO DEI CODICI',
    },
    es: {   // no Ñ in the messages: it is not on the 26-letter wheels
      alpha: LATIN, subKey: LATIN_SUB, out: 'AEIKLMOT', cards: 'ABCD',
      m1b: 'CIFRAR ES MUY DIVERTIDO', m1c: 'INFORME TESORO EN LA COCINA', crib: 'INFORME',
      m2a: 'ESTE ES UN MENSAJE SECRETO',
      m4b: 'TOMATE', m4c: 'KOALA', m5a: 'MAMA', m5c: 'MALETA', m6a: 'MOTO', m6b: 'MI MAMA ME AMA',
      examples: ['MOTO', 'KOALA', 'TOMATE'],
      parentWords: ['MOTO', 'TOMATE', 'MALETA', 'KOALA', 'LATA', 'KILO', 'METAL', 'TELA', 'MAMA', 'MI MAMA ME AMA'],
      reward: 'un abrazo muy fuerte', big: 'ENHORABUENA GRAN DESCIFRADOR',
    },
    // uk and vi: messages, subKey and reward chosen for this set; to be checked by a native speaker.
    uk: {
      alpha: 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ',
      subKey: 'ЯВЛКГИЩҐМЮОФРХЄІАЬТЇНЦПЖДЗЙУЕЧШБС',   // derangement, mulberry32 seed 1932
      out: 'АЕІКЛМОТ', cards: 'АБВГ',
      m1b: 'ШИФРИ ЦЕ ВЕСЕЛО', m1c: 'ЗВІТ СКАРБ НА КУХНІ', crib: 'ЗВІТ',
      m2a: 'ЦЕ ТАЄМНЕ ПОВІДОМЛЕННЯ',
      m4b: 'МОЛОКО', m4c: 'ЛІТО', m5a: 'МАМА', m5c: 'МОЛОКО', m6a: 'ТАТО', m6b: 'МАМА І ТАТО',
      examples: ['КІТ', 'ЛІТО', 'МОЛОКО'],
      parentWords: ['КІТ', 'МАМА', 'ТАТО', 'ЛІТО', 'МОЛОКО', 'КАКАО', 'МАМА І ТАТО'],
      reward: 'обійми від мами й тата', big: 'ВІТАЮ МАЙСТРЕ ШИФРІВ', bigDrop: 'Ґ',
    },
    vi: {   // base letters without tone marks, like Cipher Detective
      alpha: 'AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY',
      subKey: 'SLMTÂPƠVAYIEXÊKDBĐGÔCQRƯOĂNHU',   // derangement, mulberry32 seed 1932
      out: 'ABCEMNOT', cards: 'ABCD',
      m1b: 'MÂT MA RÂT VUI', m1c: 'BAO CAO QUA Ơ BÊP', crib: 'BAO CAO',
      m2a: 'ĐÂY LA TIN BI MÂT',
      m4b: 'CON MEO', m4c: 'CAM', m5a: 'ME', m5c: 'CON MEO', m6a: 'BA', m6b: 'ME CO CAM',
      examples: ['MEO', 'CAM', 'CON BO'],
      parentWords: ['MEO', 'CAM', 'BA', 'ME', 'BO', 'CA', 'CON', 'BAN', 'NON', 'CON MEO', 'CON BO', 'ME CO CAM'],
      reward: 'một quả cam', big: 'CHUC MƯNG ĐIÊP VIÊN GIOI', bigDrop: 'Q',
    },
  };
  /** Field names of the messages in a pack (checked by the tests). */
  const MESSAGES = ['m1b', 'm1c', 'm2a', 'm4b', 'm4c', 'm5a', 'm5c', 'm6a', 'm6b', 'big'];
  const DISK_WORDS = ['m4b', 'm4c', 'm5a', 'm5c', 'm6a', 'm6b'];

  const packCache = {};
  /** The pack for a language, with letters split into arrays and the wheels and mirror built. */
  function pack(lang) {
    if (!PACKS[lang]) lang = 'pl';
    if (packCache[lang]) return packCache[lang];
    const raw = PACKS[lang];
    const alpha = [...raw.alpha.normalize('NFC')], out = [...raw.out.normalize('NFC')];
    const inn = INN_IDX.map(i => out[i]);
    const mir = new Map();
    for (const [a, b] of MIR_IDX) { mir.set(out[a], out[b]); mir.set(out[b], out[a]); }
    const p = Object.assign({}, raw, {
      lang, alpha, n: alpha.length, subKey: [...raw.subKey.normalize('NFC')], out, inn, mir,
      pairs: MIR_IDX.map(([a, b]) => [out[a], out[b]]),
    });
    return (packCache[lang] = p);
  }

  /** The full-alphabet Enigma for the keen (pages 12–13). The mirror needs pairs, so an odd
   *  alphabet leaves out one rare letter (bigDrop: uk Ґ, vi Q). The red wheel is the mixed alphabet
   *  of Mission 2 (subKey without that letter): at the start it is exactly the Mission 2 table.
   *  The mirror pairs come from a fixed shuffle (mulberry32, seed 1932). */
  const bigCache = {};
  function bigPack(lang) {
    const p = pack(lang);
    if (bigCache[p.lang]) return bigCache[p.lang];
    const drop = p.bigDrop || '';
    const out = p.alpha.filter(c => c !== drop), inn = p.subKey.filter(c => c !== drop);
    let a = 1932;
    const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const sh = out.slice();
    for (let i = sh.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [sh[i], sh[j]] = [sh[j], sh[i]]; }
    const pairs = [];
    for (let i = 0; i + 1 < sh.length; i += 2) pairs.push([sh[i], sh[i + 1]].sort((x, y) => out.indexOf(x) - out.indexOf(y)));
    pairs.sort((x, y) => out.indexOf(x[0]) - out.indexOf(y[0]));
    const mir = new Map();
    for (const [x, y] of pairs) { mir.set(x, y); mir.set(y, x); }
    return (bigCache[p.lang] = { lang: p.lang, out, inn, mir, pairs, n: out.length, drop, msg: p.big });
  }

  // ---------- ciphers ----------
  const map = (s, f) => [...s].map(f).join('');
  const mod = (a, m) => ((a % m) + m) % m;
  function caesar(p, s, k) {
    return map(s, c => { const i = p.alpha.indexOf(c); return i < 0 ? c : p.alpha[mod(i + k, p.n)]; });
  }
  function sub(p, s) {
    return map(s, c => { const i = p.alpha.indexOf(c); return i < 0 ? c : p.subKey[i]; });
  }
  /** Big wheel → red wheel: the red letter under black `c` when the wheel is turned k notches.
   *  Works for the 8-letter wheel (a pack) and for the full-alphabet wheel (bigPack). */
  const under = (p, c, k) => p.inn[mod(p.out.indexOf(c) - k, p.out.length)];
  /** Red wheel → big wheel: the black letter over red `c`. */
  const over = (p, c, k) => p.out[mod(p.inn.indexOf(c) + k, p.out.length)];
  /** Run f(letter, k) over s; k grows on letters only (a space does not turn the wheel). */
  function step(p, s, f) {
    let k = 0;
    return map(s, c => (p.out.includes(c) ? f(c, k++) : c));
  }
  const diskEnc = (p, s) => step(p, s, (c, k) => under(p, c, k));
  const diskDec = (p, s) => step(p, s, (c, k) => over(p, c, k));
  const mirror = (p, s) => map(s, c => p.mir.get(c) || c);
  const enigma = (p, s) => step(p, s, (c, k) => over(p, p.mir.get(under(p, c, k)), k));

  /** What a disk-encrypted word shows: different letters that became the same code letter
   *  (`same`: [[plain letters], code letter]) and letters that stayed themselves (`self`). */
  function collisions(p, s) {
    const plain = [...s], code = [...diskEnc(p, s)], by = new Map(), self = [];
    plain.forEach((c, i) => {
      if (!p.out.includes(c)) return;
      if (!by.has(code[i])) by.set(code[i], []);
      if (!by.get(code[i]).includes(c)) by.get(code[i]).push(c);
      if (code[i] === c && !self.includes(c)) self.push(c);
    });
    const same = [...by].filter(([, ls]) => ls.length > 1).map(([c, ls]) => [ls, c]);
    return { same, self };
  }

  /** n! with a space every three digits (26 → "403 291 461 126 605 635 584 000 000"). */
  function factorial(n) {
    let f = 1n;
    for (let i = 2n; i <= BigInt(n); i++) f *= i;
    return groupDigits(f);
  }
  const groupDigits = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /** "?pages=1-3,6" → [1, 2, 3, 6]. Unknown parts are ignored; nothing valid → pages 1–10 (for the child). */
  function parsePages(str) {
    const set = new Set();
    for (const part of String(str || '').split(',')) {
      const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) continue;
      const a = +m[1], b = m[2] === undefined ? a : +m[2];
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) if (i >= 1 && i <= TOTAL) set.add(i);
    }
    return set.size ? [...set].sort((x, y) => x - y) : DEFAULT_PAGES.slice();
  }
  /** [1,2,3,6] → "1-3,6" */
  function formatPages(list) {
    const out = [];
    for (let i = 0; i < list.length; i++) {
      let j = i;
      while (j + 1 < list.length && list[j + 1] === list[j] + 1) j++;
      out.push(j > i ? `${list[i]}-${list[j]}` : `${list[i]}`);
      i = j;
    }
    return out.join(',');
  }

  /** Every letter, word and number the texts of one language need, computed from its pack. */
  function values(p) {
    const A = p.alpha[0], c0 = [...p.crib][0];
    return {
      p, A, B: p.alpha[1], D: caesar(p, A, 3), n: p.n, nFact: factorial(p.n),
      crib: p.crib, cribFirst: c0, cribFirstCode: caesar(p, c0, 7), subA: sub(p, A),
      outList: p.out.join(' '), out0: p.out[0], out1: p.out[1], aaa: p.out[0].repeat(3),
      pair0: p.pairs[0], cards: [...p.cards],
      m1b: p.m1b, m1c: p.m1c, m2a: p.m2a, m4b: p.m4b, m4c: p.m4c, m5a: p.m5a, m5c: p.m5c, m6a: p.m6a, m6b: p.m6b,
      examples: p.examples, parentWords: p.parentWords, reward: p.reward,
      bigN: bigPack(p.lang).n, bigN3: groupDigits(bigPack(p.lang).n ** 3), bigDrop: bigPack(p.lang).drop, big: p.big,
    };
  }

  const TEXT = {};
  /** The text dictionary for a language (falls back to Polish, the source language). */
  const textFor = lang => TEXT[lang] || TEXT.pl;

  // ================= DOM builders (browser only) =================
  const SVGNS = 'http://www.w3.org/2000/svg';
  /** h('div', {class:'x'}, 'text', child, [more]) — attributes are set with setAttribute,
   *  strings become text nodes (never HTML). */
  function el(ns, tag, attrs, kids) {
    const e = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null && v !== false) e.setAttribute(k, v);
    const add = k => {
      if (k == null || k === false) return;
      if (Array.isArray(k)) k.forEach(add);
      else e.appendChild(typeof k === 'object' ? k : document.createTextNode(String(k)));
    };
    add(kids);
    return e;
  }
  const h = (tag, attrs, ...kids) => el(null, tag, attrs, kids);
  const s = (tag, attrs, ...kids) => el(SVGNS, tag, attrs, kids);

  /** Light markup used by strings.js: **bold** and {{code letters}} (shown in the cipher font). */
  function rich(str) {
    const parts = String(str).split(/(\*\*[^*]+\*\*|\{\{[^}]+\}\})/);
    return parts.filter(Boolean).map(x => {
      if (x.startsWith('**')) return h('b', null, rich(x.slice(2, -2)));
      if (x.startsWith('{{')) return h('span', { class: 'ams-l' }, x.slice(2, -2));
      return document.createTextNode(x);
    });
  }

  // ---------- small inline SVG pictures (no emoji on the cards) ----------
  const INK = '#1B1B1F', RED = '#B3261E', NAVY = '#1E3A5F', LINE = '#C9C4B8';
  function starPath(cx, cy, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ' ' + (cy + rr * Math.sin(a)).toFixed(2);
    }
    return d + 'Z';
  }
  const starIcon = (size, color) => s('svg', { class: 'ams-ico', viewBox: '-5 -5 10 10', width: size, height: size, 'aria-hidden': 'true' },
    s('path', { d: starPath(0, 0, 4.8, 1.9), fill: color || RED }));
  const arrowIcon = (w, color) => s('svg', { class: 'ams-ico', viewBox: '0 0 20 10', width: w, height: `calc(${w} / 2)`, 'aria-hidden': 'true' },
    s('path', { d: 'M1 5H16M12 1.5L17.5 5L12 8.5', fill: 'none', stroke: color || NAVY, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  const bothArrow = (w, color) => s('svg', { class: 'ams-ico', viewBox: '0 0 20 10', width: w, height: `calc(${w} / 2)`, 'aria-hidden': 'true' },
    s('path', { d: 'M3 5H17M7 1.5L2 5L7 8.5M13 1.5L18 5L13 8.5', fill: 'none', stroke: color || NAVY, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  const scissors = () => s('svg', { class: 'ams-ico', viewBox: '0 0 24 24', width: '6mm', height: '6mm', 'aria-hidden': 'true' },
    s('g', { fill: 'none', stroke: INK, 'stroke-width': 1.6 },
      s('circle', { cx: 6, cy: 6, r: 3 }), s('circle', { cx: 6, cy: 18, r: 3 }),
      s('path', { d: 'M8.5 7.5L21 18M8.5 16.5L21 6' })));

  /** The real Enigma as a picture: key → plugboard → 3 rotors → mirror, and back to a lamp.
   *  `parts` are the five captions; the key shows `a`, the lamp lights up `b`. Units are mm. */
  function machine(parts, a, b) {
    const W = 168, H = 58, cur = { fill: 'none', stroke: RED, 'stroke-width': 0.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    const cap = (x, y, txt) => s('text', { x, y, 'text-anchor': 'middle', 'font-size': 3.6, class: 'ams-wt', fill: INK }, txt);
    const head = (x, y, dir) => s('path', { d: `M${x} ${y}l${-2.4 * dir} -1.6v3.2z`, fill: RED });
    const g = [];
    // current: forward along the top, back along the bottom
    g.push(s('path', Object.assign({ d: 'M26 12H131Q139 12 139 26Q139 40 131 40H27' }, cur)));
    [[64, 12, 1], [128, 12, 1], [70, 40, -1], [27.5, 40, -1]].forEach(([x, y, d]) => g.push(head(x, y, d)));
    // key
    g.push(s('rect', { x: 6, y: 4, width: 20, height: 16, rx: 3, fill: '#fff', stroke: INK, 'stroke-width': 0.6 }));
    g.push(s('text', { x: 16, y: 12, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 8, class: 'ams-wl', fill: INK }, a));
    g.push(cap(16, 25, parts[0]));
    // lamp
    g.push(s('circle', { cx: 18, cy: 40, r: 8, fill: '#fff', stroke: RED, 'stroke-width': 0.8 }));
    g.push(s('text', { x: 18, y: 40, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 8, class: 'ams-wl', fill: RED }, b));
    [0, 45, 90, 135, 180, 225, 270, 315].filter(d => d !== 90 && d !== 180).forEach(d => g.push(s('path', { d: 'M0 -10V-12.5', stroke: RED, 'stroke-width': 0.6, transform: `translate(18 40) rotate(${d})` })));
    g.push(cap(18, 55, parts[4]));
    // plugboard: sockets and one cable
    g.push(s('rect', { x: 38, y: 3, width: 22, height: 46, rx: 2, fill: '#fff', stroke: INK, 'stroke-width': 0.6 }));
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.push(s('circle', { cx: 44 + j * 10, cy: 8 + i * 6 + (i > 1 ? 18 : 0), r: 1.4, fill: 'none', stroke: INK, 'stroke-width': 0.4 }));
    g.push(s('path', { d: 'M44 8C36 18 62 24 54 34', fill: 'none', stroke: NAVY, 'stroke-width': 0.9 }));
    g.push(cap(49, 55, parts[1]));
    // three rotors, seen from the side
    [78, 94, 110].forEach(x => {
      g.push(s('rect', { x, y: 3, width: 12, height: 46, rx: 5, fill: '#fff', stroke: INK, 'stroke-width': 0.6 }));
      for (let y = 7; y < 47; y += 4) g.push(s('path', { d: `M${x + 1.5} ${y}H${x + 10.5}`, stroke: LINE, 'stroke-width': 0.4 }));
    });
    g.push(cap(100, 55, parts[2]));
    // mirror (reflector)
    g.push(s('rect', { x: 141, y: 3, width: 9, height: 46, rx: 1.5, fill: '#fff', stroke: NAVY, 'stroke-width': 1 }));
    for (let y = 6; y < 48; y += 5) g.push(s('path', { d: `M143 ${y + 3}L148 ${y}`, stroke: NAVY, 'stroke-width': 0.4 }));
    g.push(cap(145.5, 55, parts[3]));
    return s('svg', { class: 'ams-machine', width: `${W * 0.8}mm`, height: `${H * 0.8}mm`, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': parts.join(', ') }, g);
  }

  /** A drawing of an Enigma machine (front view): three rotors with letter windows, the lampboard
   *  with one letter lit, the keyboard (German QWERTZ layout) and the plugboard with two cables.
   *  `width` is any CSS length; the picture keeps its 6:5 shape. */
  function picture(width, label) {
    const g = [], rows = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];
    const txt = (x, y, ch, size, fill) => s('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size, fill, 'font-family': '"Courier New", Courier, monospace', 'font-weight': 700 }, ch);
    g.push(s('rect', { x: 4, y: 4, width: 232, height: 192, rx: 12, fill: '#8A5A35', stroke: '#5A3A20', 'stroke-width': 2 }));
    g.push(s('rect', { x: 14, y: 14, width: 212, height: 172, rx: 7, fill: '#232326' }));
    // rotors: a metal plate, three letter windows and their thumb wheels
    g.push(s('rect', { x: 70, y: 22, width: 100, height: 32, rx: 4, fill: '#3C3C42', stroke: '#55555C' }));
    ['A', 'D', 'U'].forEach((ch, i) => {
      const x = 84 + i * 28;
      g.push(s('rect', { x, y: 30, width: 13, height: 16, rx: 1.5, fill: '#F4F1E8' }));
      g.push(txt(x + 6.5, 38.5, ch, 10, '#1B1B1F'));
      g.push(s('rect', { x: x + 15, y: 25, width: 6, height: 26, rx: 2, fill: '#9A9AA2' }));
      for (let y = 28; y < 50; y += 3) g.push(s('path', { d: `M${x + 15.5} ${y}H${x + 20.5}`, stroke: '#5A5A62', 'stroke-width': 0.8 }));
    });
    // lampboard (one lamp lit) and keyboard
    rows.forEach((row, r) => [...row].forEach((ch, i) => {
      const x = 120 + (i - (row.length - 1) / 2) * 20;
      const lit = ch === 'L';
      g.push(s('circle', { cx: x, cy: 67 + r * 13, r: 5.6, fill: lit ? '#FFD34D' : '#46464C', stroke: lit ? '#FFB300' : '#5C5C64' }));
      g.push(txt(x, 67.3 + r * 13, ch, 6, lit ? '#1B1B1F' : '#B9B9C0'));
      g.push(s('circle', { cx: x, cy: 111 + r * 15, r: 6.6, fill: '#F4F1E8', stroke: '#111', 'stroke-width': 1.2 }));
      g.push(txt(x, 111.3 + r * 15, ch, 6.5, '#1B1B1F'));
    }));
    // plugboard with two cables
    g.push(s('rect', { x: 26, y: 156, width: 188, height: 24, rx: 3, fill: '#2E2E33', stroke: '#4A4A50' }));
    for (let i = 0; i < 13; i++) for (let j = 0; j < 2; j++) g.push(s('circle', { cx: 36 + i * 14, cy: 163 + j * 10, r: 1.8, fill: '#111', stroke: '#77777F', 'stroke-width': 0.6 }));
    g.push(s('path', { d: 'M64 163C70 190 102 190 106 173', fill: 'none', stroke: '#B3261E', 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    g.push(s('path', { d: 'M148 163C152 192 186 190 190 173', fill: 'none', stroke: '#C9C4B8', 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    const [, num, unit] = String(width).match(/^([\d.]+)(\D*)$/) || [, 150, 'px'];
    return s('svg', { class: 'ams-picture', viewBox: '0 0 240 200', width, height: `${(num * 5 / 6).toFixed(2)}${unit}`, role: 'img', 'aria-label': label || 'Enigma' }, g);
  }

  // ---------- card components ----------
  function makeKit(lang) {
    const T = textFor(lang), p = pack(lang), v = values(p);
    /** Text for key k: strings as they are, functions are called with the values (and args). */
    /** French: no line break before : ; ? ! (strings, also inside lists). Other languages have no space there. */
    const fix = x => (typeof x === 'string' ? (lang === 'fr' ? x.replace(/ ([:;?!»])/g, '\u00a0$1') : x) : Array.isArray(x) ? x.map(fix) : x);
    const t = (k, ...a) => {
      const x = T[k] !== undefined ? T[k] : TEXT.pl[k];
      return fix(typeof x === 'function' ? x(v, ...a) : x);
    };
    const r = (k, ...a) => rich(t(k, ...a));
    const task = i => (T.taskLetters || 'ABCD')[i];

    function missionHeader(n, title, subtitle) {
      return h('div', { class: 'ams-mhead' },
        h('div', { class: 'ams-stamp' }, h('span', null, t('mission')), h('b', null, String(n))),
        h('div', { class: 'ams-mtitle' }, h('h1', { class: 'ams-h1' }, title), h('p', { class: 'ams-sub' }, rich(subtitle))));
    }
    function pageHead(over, title) {
      return h('div', { class: 'ams-phead' }, h('div', { class: 'ams-over' }, over), h('h1', { class: 'ams-h1' }, title));
    }
    function taskTitle(letter, text, note) {
      return h('div', { class: 'ams-task' }, h('span', { class: 'ams-dot' }, letter), h('h2', null, rich(text)),
        note ? h('span', { class: 'ams-note' }, note) : null);
    }
    /** Each letter over an empty box (8.5 × 10 mm); words wrap as a whole.
     *  opts: color (letter: 'ink'|'red'), box ('ink'|'red'|'navy'), prefill (string, one char per letter). */
    function cipherRow(text, opts = {}) {
      const pre = opts.prefill ? [...opts.prefill] : [];
      let i = 0;
      return h('div', { class: 'ams-crow' }, text.split(' ').map(w => h('div', { class: 'ams-word' }, [...w].map(ch => {
        const fill = pre[i++] || '';
        return h('div', { class: 'ams-cell' }, h('span', { class: `ams-cl ams-${opts.color || 'ink'}` }, ch),
          h('span', { class: `ams-box ams-b-${opts.box || 'ink'}${fill && fill !== ' ' ? ' ams-filled' : ''}` }, fill.trim()));
      }))));
    }
    const boxes = (n, color, fill) => Array.from({ length: n }, (_, i) =>
      h('span', { class: `ams-box ams-b-${color}${fill && fill[i] ? ' ams-filled' : ''}` }, fill ? fill[i] || '' : ''));
    function emptyBoxes(n, color, label) {
      return h('div', { class: 'ams-erow' }, label ? h('span', { class: `ams-elabel ams-${color === 'red' ? 'red' : 'ink'}` }, label) : null, boxes(n, color));
    }
    function checkboxes(labels) {
      return h('div', { class: 'ams-checks' }, labels.map(l => h('span', { class: 'ams-check' }, h('span', { class: 'ams-sq' }), l)));
    }
    function discovery(...kids) {
      return h('section', { class: 'ams-disc' }, h('div', { class: 'ams-disc-t' }, starIcon('5mm', NAVY), t('discovery')), kids);
    }
    function footer(n) {
      return h('div', { class: 'ams-foot' }, h('span', null, t('puzzle')), h('span', null, t('pageOf', n, TOTAL)));
    }
    const writeLine = () => h('div', { class: 'ams-wline' });
    const small = (...k) => h('p', { class: 'ams-small' }, k);

    /** A wheel to cut out, drawn in mm. Letter i stands at i·360/n degrees clockwise from the top. */
    function wheel(cfg) {
      const { d, r0, rl, fs, color, letters, label1, label2, star, starR = 24 } = cfg;
      const n = letters.length, R = d / 2, M = R + 0.6;
      const size = Math.min(fs, 0.75 * 2 * Math.PI * rl / n);
      const g = [];
      g.push(s('circle', { r: R, fill: '#fff', stroke: INK, 'stroke-width': 0.7 }));
      g.push(s('circle', { r: r0, fill: 'none', stroke: INK, 'stroke-width': 0.3 }));
      for (let i = 0; i < n; i++) {
        const a = (i + 0.5) * 360 / n;
        g.push(s('line', { x1: 0, y1: -r0, x2: 0, y2: -R + 0.35, stroke: INK, 'stroke-width': 0.3, transform: `rotate(${a.toFixed(3)})` }));
      }
      letters.forEach((ch, i) => g.push(s('text', {
        transform: `rotate(${(i * 360 / n).toFixed(3)})`, y: -rl, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': size.toFixed(2), fill: color, class: 'ams-wl',
      }, ch)));
      g.push(s('path', { d: 'M-3 0H3M0 -3V3', stroke: INK, 'stroke-width': 0.35 }));
      if (star) g.push(s('path', { d: starPath(0, -starR, 3.5, 1.4), fill: RED }));
      const ly = r0 * 0.38;
      if (label1) g.push(s('text', { x: 0, y: ly, 'text-anchor': 'middle', 'font-size': 3.6, class: 'ams-wt', fill: INK }, label1));
      if (label2) g.push(s('text', { x: 0, y: ly + 4.6, 'text-anchor': 'middle', 'font-size': 3.3, class: 'ams-wt2', fill: '#4A4A55' }, label2));
      return s('svg', { class: 'ams-wheel', width: `${2 * M}mm`, height: `${2 * M}mm`, viewBox: `${-M} ${-M} ${2 * M} ${2 * M}` }, g);
    }

    /** One square letter for the mirror cards and the example chain. */
    const sq = (ch, cls) => h('span', { class: `ams-sqr ${cls || ''}` }, ch);
    function mirrorPairs(vertical) {
      return h('div', { class: `ams-pairs${vertical ? ' ams-vert' : ''}` },
        p.pairs.map(([a, b]) => h('div', { class: 'ams-pair' }, sq(a), bothArrow(vertical ? '7mm' : '9mm'), sq(b))));
    }

    return { T, p, v, t, r, task, missionHeader, pageHead, taskTitle, cipherRow, emptyBoxes, boxes, checkboxes, discovery,
      footer, writeLine, small, wheel, sq, mirrorPairs };
  }

  // ---------- the ten pages ----------
  const PAGES = {
    1(K) {   // cover
      const { t, r } = K;
      const fields = t('idFields').map(f => h('div', { class: 'ams-field' }, h('span', null, f), h('i')));
      return [
        h('div', { class: 'ams-cover-top' }, h('span', { class: 'ams-file' }, t('fileNo')), h('span', { class: 'ams-secret' }, t('topSecret'))),
        h('div', { class: 'ams-cover-title' }, h('h1', { class: 'ams-h1 ams-big' }, t('puzzle')), h('p', { class: 'ams-sub' }, r('coverSub'))),
        h('section', { class: 'ams-frame-box ams-history' }, h('div', null, h('h3', null, t('historyTitle')), h('p', null, r('history1')), h('p', null, r('history2'))),
          picture('46mm', 'Enigma')),
        h('section', { class: 'ams-idcard' },
          h('div', { class: 'ams-id-head' }, h('h3', null, t('idTitle')), h('span', null, t('idBureau'))),
          h('div', { class: 'ams-id-grid' }, fields),
          h('div', { class: 'ams-id-stamps' }, t('stampsLabel')),
          h('div', { class: 'ams-stamps' }, [1, 2, 3, 4, 5, 6].map(i => h('span', null, `M${i}`)), h('span', { class: 'ams-stamp-final' }, starIcon('7mm', RED)))),
        h('div', { class: 'ams-cols' },
          h('section', null, h('h3', null, t('needTitle')), h('ul', null, t('needItems').map(x => h('li', null, rich(x))))),
          h('section', null, h('h3', null, t('ruleTitle')), h('p', null, r('rule')))),
      ];
    },
    2(K) {   // cut-out: Caesar wheel
      const { t, p } = K;
      return [
        K.pageHead(t('cutCaesarOver'), t('cutCaesarTitle')),
        h('div', { class: 'ams-wheels' },
          h('div', { class: 'ams-w-big', style: 'left:0;top:0' }, K.wheel({ d: 130, r0: 52, rl: 58, fs: 7, color: INK, letters: p.alpha, label1: t('bigWheel'), label2: t('bigWheelSub') })),
          h('div', { class: 'ams-w-small', style: 'right:0;bottom:0' }, K.wheel({ d: 100, r0: 37, rl: 43, fs: 6.5, color: RED, letters: p.alpha, label1: t('smallWheel'), label2: t('smallWheelSub') })),
          h('section', { class: 'ams-howto', style: 'left:0;bottom:0;width:74mm' }, h('h3', null, t('assembleTitle')),
            h('ol', null, t('caesarSteps').map(x => h('li', null, rich(x)))))),
      ];
    },
    3(K) {   // Mission 1: Caesar
      const { t, r, v, p } = K;
      return [
        K.missionHeader(1, t('m1Title'), t('m1Sub')),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(0), t('m1aTitle')), h('p', null, r('m1aText')),
          K.emptyBoxes(10, 'ink', t('nameLabel')), K.emptyBoxes(10, 'red', t('codeLabel'))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(1), t('m1bTitle')), h('p', null, r('m1bText')),
          K.cipherRow(caesar(p, v.m1b, 3), { color: 'red', box: 'ink' })),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(2), t('m1cTitle')), h('p', null, r('m1cText')),
          h('div', { class: 'ams-keyline' }, h('b', null, t('keyIs')), K.boxes(1, 'navy'), h('span', { class: 'ams-hint' }, t('keyHint'))),
          K.cipherRow(caesar(p, v.m1c, 7), { color: 'red', box: 'ink' })),
        K.discovery(h('p', null, r('m1Disc')), K.writeLine(), K.small(r('m1DiscSmall'))),
      ];
    },
    4(K) {   // Mission 2: mixed alphabet
      const { t, r, v, p } = K;
      const table = h('div', { class: 'ams-subtable', style: `grid-template-columns:repeat(${p.n},1fr);--fs:${Math.min(4.6, 0.62 * 180 / p.n).toFixed(2)}mm` },
        p.alpha.map(c => h('span', { class: 'ams-ink ams-top' }, c)), p.subKey.map(c => h('span', { class: 'ams-red' }, c)));
      return [
        K.missionHeader(2, t('m2Title'), t('m2Sub')),
        h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, t('tableTitle')), table, K.small(r('tableCaption'))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(0), t('m2aTitle')), h('p', null, r('m2aText')),
          K.cipherRow(sub(p, v.m2a), { color: 'red', box: 'ink' })),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(1), t('m2bTitle')), h('p', null, r('m2bText')),
          K.emptyBoxes(10, 'ink', t('nameLabel')), K.emptyBoxes(10, 'red', t('codeLabel'))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(2), t('m2cTitle')), h('p', null, r('m2cText')), K.checkboxes([t('yes'), t('no')])),
        K.discovery(h('p', null, r('m2Disc'))),
      ];
    },
    5(K) {   // Mission 3: counting arrangements
      const { t, r, v } = K;
      const [a, b] = v.cards;
      const triple = () => h('div', { class: 'ams-triple' }, K.boxes(3, 'ink'));
      const counts = [1, 2, 3, 4, 5, 6, 8], ways = ['1', '2', '6', '', '', '', ''];
      const table = h('table', { class: 'ams-ftable' },
        h('tr', null, h('th', null, t('m3dCards')), counts.map(c => h('td', { class: c === 8 ? 'ams-red' : null }, String(c)))),
        h('tr', null, h('th', null, t('m3dWays')), ways.map(w => h('td', { class: w ? 'ams-given' : 'ams-blank' }, w))));
      return [
        K.missionHeader(3, t('m3Title'), t('m3Sub')),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(0), t('m3aTitle')),
          h('div', { class: 'ams-inline' }, h('div', { class: 'ams-triple' }, K.boxes(2, 'ink', [a, b])), h('div', { class: 'ams-triple' }, K.boxes(2, 'ink', [b, a])),
            h('p', null, r('m3aText')))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(1), t('m3bTitle')), h('p', null, r('m3bText')),
          h('div', { class: 'ams-triples' }, Array.from({ length: 8 }, triple)),
          h('div', { class: 'ams-keyline' }, h('b', null, t('m3bCount')), K.boxes(1, 'navy'))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(2), t('m3cTitle')), h('p', null, r('m3cText')),
          h('div', { class: 'ams-eq' }, '4 × 3 × 2 × 1 =', K.boxes(1, 'navy'))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(3), t('m3dTitle')), table, K.small(r('m3dCaption'))),
        K.discovery(h('p', null, r('m3Disc'))),
        h('div', { class: 'ams-cutstrip' }, h('div', { class: 'ams-cut-label' }, scissors(), t('cutCards')),
          h('div', { class: 'ams-cards' }, v.cards.map(c => h('span', null, c)))),
      ];
    },
    6(K) {   // cut-out: Enigma wheel
      const { t, r, p } = K;
      return [
        K.pageHead(t('cutEnigmaOver'), t('cutEnigmaTitle')),
        h('div', { class: 'ams-wheels' },
          h('div', { class: 'ams-w-big', style: 'left:0;top:0' }, K.wheel({ d: 140, r0: 49, rl: 60, fs: 12, color: INK, letters: p.out, label1: t('bigWheel'), label2: t('bigWheelSub') })),
          h('div', { class: 'ams-w-small', style: 'right:0;bottom:0' }, K.wheel({ d: 96, r0: 30, rl: 39, fs: 11, color: RED, letters: p.inn, label1: t('cipherWheel'), star: true })),
          h('section', { class: 'ams-howto', style: 'left:0;bottom:0;width:78mm' }, h('h3', null, t('assembleTitle')),
            h('ol', null, t('enigmaSteps').map(x => h('li', null, rich(x))))),
          h('p', { class: 'ams-side ams-small', style: 'right:0;top:0;width:36mm' }, r('enigmaNote'))),
      ];
    },
    7(K) {   // Mission 4: the turning wheel
      const { t, r, v, p } = K;
      return [
        K.missionHeader(4, t('m4Title'), t('m4Sub')),
        h('section', { class: 'ams-frame-box' }, h('h3', null, t('rulesTitle')), h('ol', null, t('m4Rules').map(x => h('li', null, rich(x))))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(0), t('m4aTitle')),
          h('div', { class: 'ams-inline' }, K.cipherRow(v.aaa, { color: 'ink', box: 'red' }),
            h('div', null, h('p', null, r('m4aQ')), K.checkboxes([t('yes'), t('no')])))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(1), t('m4bTitle')),
          K.cipherRow(v.m4b, { color: 'ink', box: 'red' }), h('p', null, r('m4bText')), K.writeLine()),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(2), t('m4cTitle')), h('p', null, r('m4cText')),
          K.cipherRow(diskEnc(p, v.m4c), { color: 'red', box: 'ink' })),
        K.discovery(h('p', null, r('m4Disc'))),
      ];
    },
    8(K) {   // Mission 5: the mirror
      const { t, r, v, p } = K;
      const len = [...v.m5a].length;
      return [
        K.missionHeader(5, t('m5Title'), t('m5Sub')),
        h('section', { class: 'ams-frame-box ams-mirror' }, h('h3', null, t('mirrorCard')), K.mirrorPairs(false), K.small(r('mirrorCaption'))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(0), t('m5aTitle')), K.cipherRow(v.m5a, { color: 'ink', box: 'red' })),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(1), t('m5bTitle')), h('p', null, r('m5bText')),
          K.emptyBoxes(len, 'red', t('resultA')), K.emptyBoxes(len, 'ink', t('secondTime'))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(2), t('m5cTitle')), K.cipherRow(mirror(p, v.m5c), { color: 'red', box: 'ink' })),
        K.discovery(h('div', { class: 'ams-inline' }, h('p', null, r('m5Disc')), K.checkboxes([t('yes'), t('no')])), K.small(r('m5DiscSmall'))),
      ];
    },
    9(K) {   // Mission 6: your Enigma
      const { t, r, v, p } = K;
      const c0 = [...v.m6a][0], u = under(p, c0, 0), m = p.mir.get(u), o = over(p, m, 0);
      const labels = t('exLabels');
      const node = (ch, cls, i) => h('div', { class: 'ams-chain-n' }, K.sq(ch, cls), h('span', null, labels[i]));
      const arrow = () => h('div', { class: 'ams-chain-a' }, arrowIcon('9mm'));
      return [
        K.missionHeader(6, t('m6Title'), t('m6Sub')),
        h('div', { class: 'ams-two' },
          h('section', { class: 'ams-frame-box' }, h('h3', null, t('pathTitle')), h('ol', null, t('pathSteps').map(x => h('li', null, rich(x))))),
          h('section', { class: 'ams-frame-box ams-mirror ams-narrow' }, h('h3', null, t('mirrorShort')), K.mirrorPairs(true))),
        h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, r('exTitle')),
          h('div', { class: 'ams-chain' }, node(c0, '', 0), arrow(), node(u, 'ams-red', 1), arrow(), node(m, 'ams-red', 2), arrow(), node(o, 'ams-res', 3),
            h('p', { class: 'ams-chain-turn' }, r('exTurn')))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(0), t('m6aTitle')),
          K.cipherRow(v.m6a, { color: 'ink', box: 'red', prefill: enigma(p, v.m6a).slice(0, 1) })),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(1), t('m6bTitle')), h('p', null, r('m6bText')),
          K.cipherRow(enigma(p, v.m6b), { color: 'red', box: 'ink' })),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(2), t('m6cTitle'), t('m6cNote')),
          K.emptyBoxes(14, 'red', t('codeLabel')), K.emptyBoxes(14, 'ink', t('msgLabel'))),
        K.discovery(h('p', null, r('m6Disc'))),
      ];
    },
    10(K) {  // final report: the real machine, a quiz, the certificate
      const { t, r, v, p } = K;
      const parts = t('machineParts');   // key, plugboard, 3 rotors, mirror, lamp
      const quiz = t('quiz').map((x, i) => h('li', null, h('p', null, rich(x.q)),
        x.yn ? K.checkboxes([t('yes'), t('no')])
          : x.opts ? h('div', { class: 'ams-opts' }, x.opts.map(o => h('span', { class: 'ams-check' }, h('span', { class: 'ams-sq' }), h('span', null, rich(o)))))
            : K.writeLine()));
      return [
        K.pageHead(t('reportOver'), t('reportTitle')),
        h('p', { class: 'ams-sub' }, r('reportSub')),
        h('section', { class: 'ams-frame-box' }, h('h3', null, t('machineTitle')),
          machine(parts, v.out0, enigma(p, v.out0)),
          h('div', { class: 'ams-keyline' }, h('b', null, t('fromRotor')), K.boxes(1, 'navy'), h('b', null, t('fromMirror')), K.boxes(1, 'navy')),
          h('p', null, r('machineText')), K.small(r('machineSmall'))),
        h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, t('quizTitle')), h('ol', { class: 'ams-quiz' }, quiz)),
        h('section', { class: 'ams-cert' },
          h('div', null, h('h3', null, t('certTitle')), h('p', null, r('certText')),
            h('div', { class: 'ams-id-grid' }, t('certFields').map(f => h('div', { class: 'ams-field' }, h('span', null, f), h('i'))))),
          h('span', { class: 'ams-cert-stamp' }, t('certStamp'))),
      ];
    },
    11(K) {  // answer key for the parent
      const { t, r, v, p } = K;
      const code = x => h('span', { class: 'ams-l' }, x);
      const row = (n, ...items) => h('tr', null, h('th', null, t('missionN', n)), h('td', null, items.map(x => h('div', null, x))));
      const L = i => h('b', null, K.task(i) + ': ');
      const aaa = diskEnc(p, v.aaa), col = collisions(p, v.m4b);
      const real = t('realRows');
      return [
        h('div', { class: 'ams-keyhead' }, h('h1', { class: 'ams-h1' }, t('keyTitle')), h('span', { class: 'ams-secret' }, t('parentOnly'))),
        h('table', { class: 'ams-answers' },
          row(1, [L(1), code(v.m1b)], [L(2), rich(t('k1c')), ' ', code(v.m1c), '. ', rich(t('k1cNote'))]),
          row(2, [L(0), code(v.m2a)], [L(2), rich(t('k2c'))]),
          row(3, [L(1), rich(t('k3b', v.cards))], [L(2), '24'], [L(3), rich(t('k3d'))]),
          row(4, [L(0), code(aaa), ' ', rich(t(new Set(aaa).size === 1 ? 'k4aYes' : 'k4aNo'))],
            [L(1), code(diskEnc(p, v.m4b)), ' (', rich(t('k4b', col)), ')'], [L(2), code(v.m4c)]),
          row(5, [L(0), code(mirror(p, v.m5a))], [L(1), rich(t('k5b'))], [L(2), code(v.m5c)], [h('b', null, t('discovery') + ': '), t('no')]),
          row(6, [L(0), code(enigma(p, v.m6a))], [L(1), code(v.m6b), ' ', rich(t('k6bReward'))], [h('b', null, t('discovery') + ': '), rich(t('k6disc'))]),
          h('tr', null, h('th', null, t('reportShort')), h('td', null, t('kReport').map(x => h('div', null, rich(x)))))),
        h('section', { class: 'ams-frame-box' }, h('h3', null, t('ownTitle')), h('p', null, r('ownText'))),
        h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, t('realTitle')),
          h('table', { class: 'ams-real' }, h('tr', null, t('realHead').map(x => h('th', null, x))),
            real.map(([a, b]) => h('tr', null, h('td', null, rich(a)), h('td', null, rich(b)))))),
        K.small(r('footnote')),
      ];
    },
    12(K) {  // cut-out: the big Enigma wheel with the whole alphabet
      const { t, r, v } = K, B = bigPack(K.p.lang);
      return [
        K.pageHead(t('cutBigOver'), t('cutBigTitle')),
        h('div', { class: 'ams-wheels' },
          h('div', { class: 'ams-w-big', style: 'left:0;top:0' }, K.wheel({ d: 136, r0: 54, rl: 61, fs: 8, color: INK, letters: B.out, label1: t('bigWheel'), label2: t('bigWheelSub') })),
          h('div', { class: 'ams-w-small', style: 'right:0;bottom:0' }, K.wheel({ d: 104, r0: 40, rl: 46, fs: 7, color: RED, letters: B.inn, label1: t('cipherWheel'), star: true, starR: 33 })),
          h('section', { class: 'ams-howto', style: 'left:0;bottom:0;width:70mm' }, h('h3', null, t('assembleTitle')),
            h('ol', null, t('bigSteps').map(x => h('li', null, rich(x))))),
          h('p', { class: 'ams-side ams-small', style: 'right:0;top:0;width:38mm' }, r('bigNote'))),
      ];
    },
    13(K) {  // Mission 7: the big Enigma
      const { t, r, v } = K, B = bigPack(K.p.lang);
      const code = enigma(B, B.msg);
      return [
        K.missionHeader(7, t('m7Title'), t('m7Sub')),
        h('section', { class: 'ams-frame-box' }, h('h3', null, t('m7RulesTitle')), h('p', null, r('m7Rules')), K.small(r('m7Note'))),
        h('section', { class: 'ams-frame-box ams-mirror' }, h('h3', null, t('mirrorCard')),
          h('div', { class: 'ams-bigpairs', style: `grid-template-columns:repeat(${Math.ceil(B.pairs.length / 2)},max-content)` },
            B.pairs.map(([a, b]) => h('div', { class: 'ams-pair' }, K.sq(a), bothArrow('5mm'), K.sq(b))))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(0), t('m7aTitle')), h('p', null, r('m7aText')),
          K.cipherRow(code, { color: 'red', box: 'ink' })),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(1), t('m7bTitle')),
          K.emptyBoxes(10, 'ink', t('nameLabel')), K.emptyBoxes(10, 'red', t('codeLabel'))),
        h('section', { class: 'ams-sec' }, K.taskTitle(K.task(2), t('m7cTitle')),
          h('div', { class: 'ams-keyline' }, h('span', null, r('m7cQ1')), K.boxes(1, 'navy')),
          h('p', null, r('m7cQ2')),
          h('div', { class: 'ams-keyline' }, h('span', { class: 'ams-l' }, `${v.bigN} × ${v.bigN} × ${v.bigN} =`), h('span', { class: 'ams-box ams-b-navy ams-wide' }))),
        K.discovery(h('p', null, r('m7Disc'))),
        h('div', { class: 'ams-flip' }, rich(t('m7Answers', code))),
      ];
    },
  };

  /** One A4 page (an .ams-page element) in the given language. */
  function renderPage(n, lang) {
    const K = makeKit(lang);
    const body = h('div', { class: `ams-body ams-p${n}` }, PAGES[n](K));
    return h('div', { class: 'ams-page', 'data-page': n, lang }, body, K.footer(n));
  }
  /** Shrink the text of a page (from its CSS size, 12pt, down to 9pt at most) until it fits its A4 box. */
  function fitPage(page) {
    const body = page.querySelector('.ams-body');
    if (!page.dataset.fs0) page.dataset.fs0 = parseFloat(getComputedStyle(body).fontSize) * 0.75;   // px → pt
    let fs = parseFloat(page.dataset.fs0);
    body.style.fontSize = fs + 'pt';
    while (body.scrollHeight > body.clientHeight + 1 && fs > 9) {
      fs -= 0.25;
      body.style.fontSize = fs + 'pt';
    }
    page.dataset.fit = fs;
    return fs;
  }

  return {
    INN_IDX, MIR_IDX, TOTAL, DEFAULT_PAGES, PACKS, MESSAGES, DISK_WORDS, TEXT, textFor, pack, bigPack, values,
    caesar, sub, under, over, diskEnc, diskDec, mirror, enigma, collisions, factorial, parsePages, formatPages,
    renderPage, fitPage, picture,
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ENIGMA;
