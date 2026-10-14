// Run with: node enigma/engine.test.js
const E = require('./engine.js');
require('./strings.js');   // registers the texts in E.TEXT (pl, en, uk, vi, fr, it, es)
const LANGS = ['pl', 'en', 'fr', 'it', 'es', 'uk', 'vi'];
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };
const P = E.pack;

// Reference vectors
const V = [
  ['pl', 'caesar', 'SZYFR TO SUPER ZABAWA', 3, 'VCBIU WR VXSHU CDEDZD'],
  ['pl', 'caesar', 'RAPORT SKARB JEST W KUCHNI', 7, 'YHWVYA ZRHYI QLZA D RBJOUP'],
  ['pl', 'sub', 'TO JEST TAJNA WIADOMOSC', null, 'GB IMFG GNIHN XANKBEBFL'],
  ['pl', 'diskEnc', 'AAA', null, 'MLE'],
  ['pl', 'diskEnc', 'KOTEK', null, 'OIIEL'],
  ['pl', 'diskEnc', 'LATO', null, 'KLIO'],
  ['pl', 'diskDec', 'KLIO', null, 'LATO'],
  ['pl', 'mirror', 'MAMA', null, 'LOLO'],
  ['pl', 'mirror', 'KOTEK', null, 'IAETI'],
  ['pl', 'enigma', 'TATA', null, 'AEOT'],
  ['pl', 'enigma', 'MAMA MA KAKAO', null, 'LELT IT IMIET'],
  ['pl', 'enigma', 'LELT IT IMIET', null, 'MAMA MA KAKAO'],
  ['en', 'caesar', 'CODES ARE FUN', 3, 'FRGHV DUH IXQ'],
  ['en', 'caesar', 'REPORT TREASURE IN THE KITCHEN', 7, 'YLWVYA AYLHZBYL PU AOL RPAJOLU'],
  ['en', 'sub', 'THIS IS A SECRET MESSAGE', null, 'GTAF AF N FMLVMG EMFFNDM'],
  ['en', 'diskEnc', 'MOTEL', null, 'IIIEM'],
  ['en', 'diskEnc', 'MILK', null, 'ITAM'],
  ['en', 'mirror', 'MOM', null, 'LAL'],
  ['en', 'mirror', 'KITE', null, 'IKET'],
  ['en', 'enigma', 'TOTAL', null, 'AMOTK'],
  ['en', 'enigma', 'I LIKE MILK', null, 'K KEIA LKKI'],
  ['fr', 'caesar', 'LES CODES SONT AMUSANTS', 3, 'OHV FRGHV VRQW DPXVDQWV'],
  ['fr', 'caesar', 'RAPPORT TRESOR DANS LA CUISINE', 7, 'YHWWVYA AYLZVY KHUZ SH JBPZPUL'],
  ['fr', 'sub', 'CECI EST UN MESSAGE SECRET', null, 'LMLA MFG SH EMFFNDM FMLVMG'],
  ['fr', 'diskEnc', 'TOMATE', null, 'LIOIOK'],
  ['fr', 'diskEnc', 'LAIT', null, 'KLMK'],
  ['fr', 'mirror', 'MAMIE', null, 'LOLKT'],
  ['fr', 'mirror', 'TOMATE', null, 'EALOET'],
  ['fr', 'enigma', 'MOTO', null, 'LMOM'],
  ['fr', 'enigma', 'ELLE AIME LE LAIT', null, 'OKML EEOI MA MTMA'],
  ['it', 'caesar', 'I CODICI SONO DIVERTENTI', 3, 'L FRGLFL VRQR GLYHUWHQWL'],
  ['it', 'caesar', 'RAPPORTO TESORO IN CUCINA', 7, 'YHWWVYAV ALZVYV PU JBJPUH'],
  ['it', 'sub', 'ECCO UN MESSAGGIO SEGRETO', null, 'MLLB SH EMFFNDDAB FMDVMGB'],
  ['it', 'diskEnc', 'TOTEM', null, 'LIIET'],
  ['it', 'diskEnc', 'LATTE', null, 'KLIKI'],
  ['it', 'diskDec', 'KLIKI', null, 'LATTE'],
  ['it', 'mirror', 'MAMMA', null, 'LOLLO'],
  ['it', 'mirror', 'MELA', null, 'LTMO'],
  ['it', 'enigma', 'MOTO', null, 'LMOM'],
  ['it', 'enigma', 'IO AMO IL LATTE', null, 'KM KOT ET KTIOL'],
  ['it', 'enigma', 'KM KOT ET KTIOL', null, 'IO AMO IL LATTE'],
  ['es', 'caesar', 'CIFRAR ES MUY DIVERTIDO', 3, 'FLIUDU HV PXB GLYHUWLGR'],
  ['es', 'caesar', 'INFORME TESORO EN LA COCINA', 7, 'PUMVYTL ALZVYV LU SH JVJPUH'],
  ['es', 'sub', 'ESTE ES UN MENSAJE SECRETO', null, 'MFGM MF SH EMHFNIM FMLVMGB'],
  ['es', 'diskEnc', 'TOMATE', null, 'LIOIOK'],
  ['es', 'diskEnc', 'KOALA', null, 'OIETK'],
  ['es', 'diskDec', 'OIETK', null, 'KOALA'],
  ['es', 'mirror', 'MAMA', null, 'LOLO'],
  ['es', 'mirror', 'MALETA', null, 'LOMTEO'],
  ['es', 'enigma', 'MOTO', null, 'LMOM'],
  ['es', 'enigma', 'MI MAMA ME AMA', null, 'LT LTIT OI TOK'],
  ['es', 'enigma', 'LT LTIT OI TOK', null, 'MI MAMA ME AMA'],
  ['uk', 'diskEnc', 'МОЛОКО', null, 'ІІАОЛТ'],
  ['uk', 'diskEnc', 'ЛІТО', null, 'КТІО'],
  ['uk', 'mirror', 'МАМА', null, 'ЛОЛО'],
  ['uk', 'enigma', 'ТАТО', null, 'АЕОМ'],
  ['uk', 'enigma', 'МАМА І ТАТО', null, 'ЛЕЛТ М АЕОЕ'],
];
for (const [lang, fn, s, k, want] of V) eq(`${lang} ${fn}(${s}${k == null ? '' : ', ' + k})`, k == null ? E[fn](P(lang), s) : E[fn](P(lang), s, k), want);

eq('pl wheel: inn', P('pl').inn.join(''), 'MTAOKIEL');
eq('uk wheel: inn', P('uk').inn.join(''), 'МТАОКІЕЛ');
eq('pl mirror pairs', P('pl').pairs.map(x => x.join('')).join(' '), 'AO ET IK LM');
eq('uk mirror pairs', P('uk').pairs.map(x => x.join('')).join(' '), 'АО ЕТ ІК ЛМ');
// The physical wheel: star on A → red M under black A; one notch on → star on E, red L under black A.
eq('pl: under A, star on A', E.under(P('pl'), 'A', 0), 'M');
eq('pl: star after one notch', P('pl').out[1], 'E');
eq('pl: under A, one notch on', E.under(P('pl'), 'A', 1), 'L');
eq('26!', E.factorial(26), '403 291 461 126 605 635 584 000 000');
eq('3!', E.factorial(3), '6');
eq('8!', E.factorial(8), '40 320');

// ?pages= parser
eq('pages 1-3,6', E.parsePages('1-3,6').join(), '1,2,3,6');
eq('pages x,99,0 → default', E.parsePages('x,99,0').join(), '1,2,3,4,5,6,7,8,9,10');
eq('pages: duplicates, order', E.parsePages('6,2,6,1-2').join(), '1,2,6');
eq('pages: empty → default', E.parsePages('').join(), '1,2,3,4,5,6,7,8,9,10');
eq('pages: reversed range', E.parsePages('10-9').join(), '9,10');
eq('pages: format', E.formatPages([1, 2, 3, 6, 9, 10]), '1-3,6,9-10');

// Every pack
const rnd = (() => { let a = 1932; return () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; }; })();
for (const lang of LANGS) {
  const p = P(lang);
  const isPerm = (xs, of) => xs.length === of.length && new Set(xs).size === xs.length && xs.every(c => of.includes(c));
  eq(`${lang}: subKey is a permutation of the alphabet`, isPerm(p.subKey, p.alpha), true);
  eq(`${lang}: subKey has no fixed points`, p.subKey.every((c, i) => c !== p.alpha[i]), true);
  eq(`${lang}: out has 8 letters in alphabet order`, p.out.length === 8 && p.out.every((c, i) => !i || p.alpha.indexOf(c) > p.alpha.indexOf(p.out[i - 1])), true);
  eq(`${lang}: inn is a permutation of out`, isPerm(p.inn, p.out), true);
  eq(`${lang}: mirror is an involution without fixed points`, p.out.every(c => p.mir.get(c) !== c && p.mir.get(p.mir.get(c)) === c), true);
  eq(`${lang}: cards come from the alphabet`, [...p.cards].every(c => p.alpha.includes(c)) && new Set(p.cards).size === 4, true);
  let bad = 0, self = 0;
  for (let i = 0; i < 1000; i++) {
    const len = 1 + Math.floor(rnd() * 12);
    let s = '';
    for (let j = 0; j < len; j++) s += rnd() < 0.15 && j && s[s.length - 1] !== ' ' && j < len - 1 ? ' ' : p.out[Math.floor(rnd() * 8)];
    const c = E.enigma(p, s);
    if (E.enigma(p, c) !== s || E.diskDec(p, E.diskEnc(p, s)) !== s) bad++;
    if ([...s].some((ch, k) => ch !== ' ' && [...c][k] === ch)) self++;
  }
  eq(`${lang}: 1000 random words: enigma twice and diskDec(diskEnc) give the word back`, bad, 0);
  eq(`${lang}: no letter turns into itself in the mini-Enigma`, self, 0);
  for (const f of E.MESSAGES) {
    const ok = [...p[f]].every(c => c === ' ' || p.alpha.includes(c)) && !/^ | $|  /.test(p[f]);
    if (!ok) { fails++; console.log('FAIL', lang, f, 'has letters outside the alphabet:', p[f]); }
    if ([...p[f]].length > 30 || p[f].split(' ').length > 5) { fails++; console.log('FAIL', lang, f, 'too long:', p[f]); }
  }
  for (const f of E.DISK_WORDS) if (![...p[f]].every(c => c === ' ' || p.out.includes(c))) { fails++; console.log('FAIL', lang, f, 'not only out letters:', p[f]); }
  for (const w of [...p.examples, ...p.parentWords]) if (![...w].every(c => c === ' ' || p.out.includes(c))) { fails++; console.log('FAIL', lang, 'word not only out letters:', w); }
  eq(`${lang}: M4 B has a collision`, E.collisions(p, p.m4b).same.length > 0, true);
  eq(`${lang}: M1 C starts with the crib`, p.m1c.startsWith(p.crib + ' '), true);
  const B = E.bigPack(lang);
  eq(`${lang} big wheel: even, alphabet minus at most one letter`, B.n % 2 === 0 && B.n >= p.n - 1 && B.out.every(c => p.alpha.includes(c)), true);
  eq(`${lang} big wheel: red wheel is the Mission 2 alphabet`, B.inn.join(''), p.subKey.filter(c => c !== B.drop).join(''));
  eq(`${lang} big wheel: mirror is an involution without fixed points`, B.out.every(c => B.mir.get(c) !== c && B.mir.get(B.mir.get(c)) === c), true);
  eq(`${lang} big wheel: message only uses wheel letters`, [...B.msg].every(c => c === ' ' || B.out.includes(c)), true);
  eq(`${lang} big wheel: same steps decode`, E.enigma(B, E.enigma(B, B.msg)), B.msg);
  eq(`${lang} big wheel: no letter becomes itself`, [...E.enigma(B, B.msg)].every((c, i) => c === ' ' || c !== [...B.msg][i]), true);
  eq(`${lang} big wheel: star returns after n notches`, E.under(B, B.out[0], B.n), E.under(B, B.out[0], 0));
}

// Texts: every key from pl exists in the other languages (also inside ui), with the same type and list length
const keys = d => Object.keys(d).sort();
for (const lang of LANGS.filter(l => l !== 'pl')) {
  for (const [scope, a, b] of [['', E.TEXT.pl, E.TEXT[lang]], ['ui.', E.TEXT.pl.ui, E.TEXT[lang].ui]]) {
    const missing = keys(a).filter(k => b[k] === undefined), extra = keys(b).filter(k => a[k] === undefined);
    eq(`${lang}: no missing ${scope || 'text '}keys`, missing.join(','), '');
    eq(`${lang}: no extra ${scope || 'text '}keys`, extra.join(','), '');
    for (const k of keys(a)) {
      if (b[k] === undefined) continue;
      if (typeof a[k] !== typeof b[k] || Array.isArray(a[k]) !== Array.isArray(b[k])) { fails++; console.log('FAIL type', lang, scope + k); }
      if (Array.isArray(a[k]) && a[k].length !== b[k].length) { fails++; console.log('FAIL list length', lang, scope + k); }
    }
  }
  eq(`${lang}: one title per page`, E.TEXT[lang].ui.pageTitles.length, E.TOTAL);
}
// Every text template runs for its own pack and leaves no undefined behind
for (const lang of LANGS) {
  const v = E.values(P(lang)), T = E.TEXT[lang];
  let bad = 0;
  for (const [k, x] of Object.entries(T)) {
    if (k === 'ui') continue;
    const out = k === 'k4b' ? x(v, E.collisions(v.p, v.m4b)) : typeof x === 'function' ? x(v, 3, 10) : x;
    const flat = JSON.stringify(out);
    if (/undefined|NaN|\[object/.test(flat)) { bad++; console.log('FAIL template', lang, k, flat); }
  }
  eq(`${lang}: templates fill in`, bad, 0);
}
eq('pl: M1 A names the right letters', E.TEXT.pl.m1aText(E.values(P('pl'))).includes('czarnym {{A}} stało czerwone {{D}}'), true);
eq('pl: M1 C crib letters', E.TEXT.pl.m1cText(E.values(P('pl'))).includes('czarnym {{R}} stało czerwone {{Y}}'), true);
eq('pl: M4 B answer sentence', E.TEXT.pl.k4b(null, E.collisions(P('pl'), 'KOTEK')), '{{O}} i {{T}} dały to samo {{I}}. {{E}} została sobą.');
eq('it: M4 B answer sentence', E.TEXT.it.k4b(null, E.collisions(P('it'), 'TOTEM')), '{{O}} e {{T}} sono diventate {{I}}. {{E}} è rimasta se stessa.');
eq('es: M4 B answer sentence', E.TEXT.es.k4b(null, E.collisions(P('es'), 'TOMATE')), '{{O}} y {{A}} se convirtieron en {{I}}. {{M}} y {{T}} se convirtieron en {{O}}. Ninguna letra se quedó igual.');
eq('es: "e" before I', E.TEXT.es.k4b(null, { same: [[['O', 'I'], 'A']], self: [] }), '{{O}} e {{I}} se convirtieron en {{A}}. Ninguna letra se quedó igual.');
eq('it big message', E.enigma(E.bigPack('it'), 'BRAVO MAESTRO DEI CODICI'), 'UTHTQ BHGUVGT OPP TVBKOF');
eq('es big message', E.enigma(E.bigPack('es'), 'ENHORABUENA GRAN DESCIFRADOR'), 'NLARIOPLPWC UKRL ABLETICJQQP');

console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
