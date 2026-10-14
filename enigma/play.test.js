// Run with: node enigma/play.test.js
// Checks the texts of the online game (play-strings.js) and that every mission of play.html can be solved.
const E = require('./engine.js');
require('./strings.js');
require('./play-strings.js');
const LANGS = ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es'];
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };

// ---- texts: every Polish key exists in every language, with the same kind of value
const PL = E.TEXT.pl.play;
const sample = { cellLabel: [2, 5, 'A'], statsLine: [3, 2, 7], caesarState: [3, 'A', 'D'], starState: ['E', 1], m1aText: ['A', 'D'],
  keyWarn: [5, 3], setKey: [3], m1cKeyOk: [7], m1cKeyNo: ['R', 'Y', 'U'], m3Found: [4], m3SlotLabel: [1], m3CardLabel: ['A'],
  m4Repeat: ['K', 'O', 'L'], m4Same: [['O', 'T', 'M'], 'I'], m4Self: [['E']], m5bDone: ['MAMA'], m6cText: ['AEIKLMOT'],
  m7Note: [26, 13], m7Drop: ['Q'], quiz: ['A', 'RAPORT'], quizLeft: [3], starsSum: [19], missing: ['2, 5'] };
for (const l of LANGS) {
  const D = E.TEXT[l].play;
  eq(`${l}: has play texts`, !!D, true);
  if (!D) continue;
  const missing = Object.keys(PL).filter(k => D[k] === undefined);
  eq(`${l}: no missing keys`, missing.join(','), '');
  const extra = Object.keys(D).filter(k => PL[k] === undefined);
  eq(`${l}: no extra keys`, extra.join(','), '');
  const kinds = Object.keys(PL).filter(k => D[k] !== undefined && (typeof D[k] !== typeof PL[k] || Array.isArray(D[k]) !== Array.isArray(PL[k])));
  eq(`${l}: same kinds of values`, kinds.join(','), '');
  eq(`${l}: 8 tab names`, D.tabs.length, 8);
  const badFns = Object.keys(D).filter(k => typeof D[k] === 'function').filter(k => {
    if (!sample[k]) return true;
    const x = D[k](...sample[k]);
    return k === 'quiz' ? !Array.isArray(x) : typeof x !== 'string' || !x || /undefined|NaN|\[object/.test(x);
  });
  eq(`${l}: functions give text`, badFns.join(','), '');
  const quiz = D.quiz('A', 'RAPORT');
  eq(`${l}: 5 quiz questions`, quiz.length, 5);
  eq(`${l}: quiz answers point at options`, quiz.every(q => q.q && q.why && q.ok.length && q.ok.every(i => i >= 0 && i < q.opts.length) && (q.multi || q.ok.length === 1)), true);
  // worksheet texts that play.html reuses
  const T = E.textFor(l), v = E.values(E.pack(l));
  const reused = ['m1Title', 'm1Sub', 'm1bTitle', 'm1bText', 'm1cTitle', 'm1cText', 'm1Disc', 'm1DiscSmall', 'm2Title', 'm2Sub', 'tableTitle', 'tableCaption',
    'm2aTitle', 'm2aText', 'm2cTitle', 'm2cText', 'm2Disc', 'm3Title', 'm3bTitle', 'm3cTitle', 'm3cText', 'm3dTitle', 'm3dCards', 'm3dWays', 'm3dCaption', 'm3Disc',
    'm4Title', 'rulesTitle', 'm4Rules', 'm4aTitle', 'm4aQ', 'm4bTitle', 'm4cTitle', 'm4cText', 'm4Disc', 'm5Title', 'm5Sub', 'mirrorCard', 'mirrorCaption',
    'm5aTitle', 'm5bTitle', 'm5cTitle', 'm5Disc', 'm5DiscSmall', 'm6Title', 'm6Sub', 'mirrorShort', 'pathTitle', 'pathSteps', 'exLabels', 'm6aTitle', 'm6bTitle',
    'm6bText', 'm6Disc', 'reportTitle', 'reportSub', 'machineTitle', 'machineText', 'machineSmall', 'quizTitle', 'certTitle', 'historyTitle', 'history1', 'history2',
    'mission', 'discovery', 'yes', 'no', 'taskLetters', 'msgLabel', 'codeLabel', 'puzzle'];
  eq(`${l}: worksheet texts used by the game exist`, reused.filter(k => T[k] === undefined || (typeof T[k] === 'function' && T[k](v) == null)).join(','), '');
}

// ---- every answer the game asks for can be typed with the letters it offers
for (const l of LANGS) {
  const p = E.pack(l), B = E.bigPack(l);
  const only = (s, letters) => [...s].every(c => c === ' ' || letters.includes(c));
  eq(`${l}: M1/M2 messages use the alphabet`, only(p.m1b + p.m1c + p.m2a, p.alpha), true);
  eq(`${l}: M4–M6 words use the wheel letters`, only(p.m4b + p.m4c + p.m5a + p.m5c + p.m6a + p.m6b + p.out[0].repeat(3), p.out), true);
  eq(`${l}: M7 message uses the big wheel letters`, only(B.msg, B.out), true);
  eq(`${l}: key 3 puts red D under black A`, E.caesar(p, p.alpha[0], 3), p.alpha[3]);
  eq(`${l}: Caesar key 7 decodes the crib`, E.caesar(p, E.caesar(p, p.m1c, 7), -7), p.m1c);
  eq(`${l}: the same steps decode (M6)`, E.enigma(p, E.enigma(p, p.m6b)), p.m6b);
  eq(`${l}: the same steps decode (M7)`, E.enigma(B, E.enigma(B, B.msg)), B.msg);
  eq(`${l}: the mirror twice gives the word back`, E.mirror(p, E.mirror(p, p.m5a)), p.m5a);
  eq(`${l}: AAA gives different letters (M4 question: NO)`, new Set(E.diskEnc(p, p.out[0].repeat(3))).size > 1, true);
  eq(`${l}: no letter becomes itself in the Enigma`, [...p.m6b].every((c, i) => c === ' ' || E.enigma(p, p.m6b)[i] !== c), true);
  eq(`${l}: big mirror pairs cover the wheel`, B.pairs.length * 2, B.n);
}

console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
