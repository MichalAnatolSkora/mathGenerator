// Run with: node engine.test.js
const W = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };
const LANGS = ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es'];

// numbers: right answers, inside the range, never 0 or 1 in a story, never 21, 31… (Ukrainian singular)
for (const range of W.RANGES) {
  for (const type of W.TYPES) {
    for (let v = 0; v < W.VARIANTS[type]; v++) {
      for (let i = 0; i < 300; i++) {
        const p = W.problem(K.rng(`${range}|${type}|${v}|${i}`), type, range, v);
        const nums = [p.a, p.b, p.c, p.d].filter(n => n !== undefined);
        const tag = `${range} ${type}.${v} #${i}`;
        ok(`${tag}: numbers ≥ 2`, nums.every(n => Number.isInteger(n) && n >= 2), nums);
        ok(`${tag}: numbers ≤ range`, nums.every(n => n <= range), nums);
        ok(`${tag}: no 21, 31…`, nums.every(n => !(n > 20 && n % 10 === 1)), nums);
        ok(`${tag}: two different names`, p.A !== p.B && p.A >= 0 && p.A < 8 && p.B >= 0 && p.B < 8);
        if (p.answer !== null) {
          ok(`${tag}: answer ≥ 1 and ≤ range`, p.answer >= 1 && p.answer <= range, p.answer);
          ok(`${tag}: calc ends with the answer`, p.calc.endsWith(`= ${p.answer}`), p.calc);
          // the calc is true arithmetic
          const lhs = p.calc.split('=')[0].replace('−', '-').replace('×', '*');
          ok(`${tag}: calc is right`, eval(lhs) === p.answer, p.calc);
        } else {
          ok(`${tag}: open has pairs that add up`, p.pairs.length >= 2 && p.pairs.every(s => eval(s) === p.c), p.pairs);
        }
        for (const l of LANGS) {
          const s = T.say(l, p);
          ok(`${tag} ${l}: text`, typeof s === 'string' && s.length > 30 && !/undefined|NaN|\[object/.test(s), s);
          for (const n of nums) ok(`${tag} ${l}: mentions ${n}`, new RegExp(`(^|\\D)${n}(\\D|$)`).test(s), s);
        }
      }
    }
  }
  console.log(`ok   range ${range}`);
}

// sheets: eight cards, the mix has every kind, same seed ⇒ same sheet
for (const range of W.RANGES) {
  const mix = W.sheet(K.rng('m' + range), 'mix', range, 8);
  ok(`mix ${range}: 8 cards`, mix.length === 8);
  const kinds = new Set(mix.map(p => p.type));
  for (const t of ['join', 'separate', 'missing', 'compare', 'open']) ok(`mix ${range}: has ${t}`, kinds.has(t));
  ok(`mix ${range}: groups only with 100`, kinds.has('groups') === (range === 100));
  for (const t of W.TYPES) {
    const one = W.sheet(K.rng('o' + t), t, range, 8);
    ok(`${t} ${range}: all variants used`, new Set(one.map(p => p.v)).size === W.VARIANTS[t]);
  }
}
ok('same seed ⇒ same sheet', JSON.stringify(W.sheet(K.rng('x'), 'mix', 20)) === JSON.stringify(W.sheet(K.rng('x'), 'mix', 20)));

// every language has every key the English texts have, and every noun/container/template
for (const l of LANGS) {
  for (const k of Object.keys(T.en)) ok(`${l}: has ${k}`, T[l][k] !== undefined);
  for (const k of ['ranges', 'types', 'nouns', 'cats', 'cont']) for (const id of Object.keys(T.en[k])) ok(`${l}: ${k}.${id}`, !!T[l][k][id]);
  for (const t of W.TYPES) ok(`${l}: ${W.VARIANTS[t]} templates for ${t}`, T[l].tpl[t].length === W.VARIANTS[t]);
  ok(`${l}: 8 names`, T[l].names.length === 8 && T[l].names.every(x => x.n && /^[mf]$/.test(x.g)));
}
ok('kit sees only languages', Object.keys(T).join() === LANGS.join());

// a few stories read exactly right
const p = { type: 'join', v: 0, A: 2, B: 0, a: 8, b: 7, X: 'chestnut', Y: 'acorn', cat: 'autumn' };
ok('pl join', T.say('pl', p) === 'Natalka zebrała 8 kasztanów i 7 żołędzi. Ile darów jesieni zebrała razem?', T.say('pl', p));
const q = { type: 'missing', v: 0, A: 0, B: 1, a: 7, c: 16 };
ok('pl tickets', T.say('pl', q) === 'W kasie teatru lalek sprzedano 7 biletów normalnych i kilka ulgowych. Razem sprzedano 16 biletów. Ile sprzedano biletów ulgowych?', T.say('pl', q));
const o = { type: 'open', v: 0, A: 0, B: 1, c: 16, K: 'basket', X: 'apple' };
ok('pl open', T.say('pl', o) === 'W 2 koszykach są jabłka. Ile jabłek może być w każdym koszyku, jeśli razem jest ich 16? Podaj kilka propozycji.', T.say('pl', o));
ok('pl 3 forms', T.say('pl', { type: 'join', v: 2, A: 0, B: 1, a: 3, b: 22 }) === 'W autobusie jechały 3 osoby. Na przystanku wsiadły jeszcze 22 osoby. Ile osób jedzie teraz autobusem?');
ok('pl 12 many', T.say('pl', { type: 'join', v: 2, A: 0, B: 1, a: 12, b: 5 }).startsWith('W autobusie jechało 12 osób. Na przystanku wsiadło jeszcze 5 osób.'));
ok('fr elision', T.say('fr', { type: 'compare', v: 0, A: 0, B: 1, a: 3, b: 9, X: 'sticker' }).includes('Combien d’autocollants Hugo a-t-il de plus que Léa ?'));
ok('it gender', T.say('it', { type: 'separate', v: 0, A: 0, B: 1, a: 9, b: 4, X: 'candy' }).includes('Quante caramelle'));

console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
