// Run with: node engine.test.js
const C = require('./engine.js');
const T = require('./strings.js');
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

// time in words — hand-checked vectors
eq('pl 3:00', C.words({ h: 3, m: 0 }, 'pl'), 'trzecia');
eq('pl 3:30', C.words({ h: 3, m: 30 }, 'pl'), 'wpół do czwartej');
eq('pl 3:15', C.words({ h: 3, m: 15 }, 'pl'), 'kwadrans po trzeciej');
eq('pl 3:45', C.words({ h: 3, m: 45 }, 'pl'), 'za kwadrans czwarta');
eq('pl 11:55', C.words({ h: 11, m: 55 }, 'pl'), 'za pięć dwunasta');
eq('pl 12:30', C.words({ h: 12, m: 30 }, 'pl'), 'wpół do pierwszej');
eq('pl 15:30 = 3:30', C.words({ h: 15, m: 30 }, 'pl'), 'wpół do czwartej');
eq('pl 0:10', C.words({ h: 0, m: 10 }, 'pl'), 'dziesięć po dwunastej');
eq('en 3:30', C.words({ h: 3, m: 30 }, 'en'), 'half past three');
eq('en 3:40', C.words({ h: 3, m: 40 }, 'en'), 'twenty to four');
eq('en 12:00', C.words({ h: 12, m: 0 }, 'en'), 'twelve o’clock');
eq('uk 3:30', C.words({ h: 3, m: 30 }, 'uk'), 'пів на четверту');
eq('uk 3:15', C.words({ h: 3, m: 15 }, 'uk'), 'чверть по третій');
eq('uk 3:45', C.words({ h: 3, m: 45 }, 'uk'), 'за чверть четверта');
eq('vi 3:30', C.words({ h: 3, m: 30 }, 'vi'), '3 giờ rưỡi');
eq('vi 3:45', C.words({ h: 3, m: 45 }, 'vi'), '4 giờ kém 15 phút');
eq('fr 3:45', C.words({ h: 3, m: 45 }, 'fr'), 'quatre heures moins le quart');
eq('fr 12:35', C.words({ h: 12, m: 35 }, 'fr'), 'une heure moins vingt-cinq');
eq('fr 1:30', C.words({ h: 1, m: 30 }, 'fr'), 'une heure et demie');
eq('it 3:45', C.words({ h: 3, m: 45 }, 'it'), 'le quattro meno un quarto');
eq('it 12:35', C.words({ h: 12, m: 35 }, 'it'), 'l’una meno venticinque');
eq('it 1:30', C.words({ h: 1, m: 30 }, 'it'), 'l’una e mezza');
eq('it 1:00', C.words({ h: 1, m: 0 }, 'it'), 'l’una');
eq('it 3:15', C.words({ h: 3, m: 15 }, 'it'), 'le tre e un quarto');
eq('it 7:05', C.words({ h: 7, m: 5 }, 'it'), 'le sette e cinque');
eq('it 8:20', C.words({ h: 8, m: 20 }, 'it'), 'le otto e venti');
eq('it 3:40', C.words({ h: 3, m: 40 }, 'it'), 'le quattro meno venti');
eq('it 0:00', C.words({ h: 0, m: 0 }, 'it'), 'le dodici');
eq('es 3:45', C.words({ h: 3, m: 45 }, 'es'), 'las cuatro menos cuarto');
eq('es 12:35', C.words({ h: 12, m: 35 }, 'es'), 'la una menos veinticinco');
eq('es 1:30', C.words({ h: 1, m: 30 }, 'es'), 'la una y media');
eq('es 1:00', C.words({ h: 1, m: 0 }, 'es'), 'la una');
eq('es 3:15', C.words({ h: 3, m: 15 }, 'es'), 'las tres y cuarto');
eq('es 7:05', C.words({ h: 7, m: 5 }, 'es'), 'las siete y cinco');
eq('es 8:20', C.words({ h: 8, m: 20 }, 'es'), 'las ocho y veinte');
eq('es 3:40', C.words({ h: 3, m: 40 }, 'es'), 'las cuatro menos veinte');
eq('es 0:00', C.words({ h: 0, m: 0 }, 'es'), 'las doce');
eq('not a multiple of 5', C.words({ h: 3, m: 17 }, 'pl'), null);
for (const l of Object.keys(T)) for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 5) {
  const w = C.words({ h, m }, l);
  ok(`${l} ${h}:${m} has words`, w && !/undefined|NaN/.test(w), w);
}

// digital + period
eq('digital 12h', C.digital({ h: 15, m: 5 }, false), '3:05');
eq('digital 24h', C.digital({ h: 15, m: 5 }, true), '15:05');
eq('digital midnight 12h', C.digital({ h: 0, m: 30 }, false), '12:30');
ok('hour level: only :00', C.randomTimes(C.rng('H'), 'hour', false, 12).every(x => x.m === 0));
eq('periods', [0, 6, 12, 18, 22].map(h => C.period({ h, m: 0 })).join(','), 'night,morning,afternoon,evening,night');

// generator: levels, uniqueness, determinism
const r1 = C.rng('ABC'), r2 = C.rng('ABC');
eq('seeded', JSON.stringify(C.randomTimes(r1, 'five', true, 20)), JSON.stringify(C.randomTimes(r2, 'five', true, 20)));
for (const lvl of C.LEVEL_IDS) for (const h24 of [false, true]) {
  const rnd = C.rng(lvl + h24);
  const ts = C.randomTimes(rnd, lvl, h24, 20);
  ok(`${lvl} ${h24}: 20 times`, ts.length === 20);
  ok(`${lvl} ${h24}: unique`, new Set(ts.map(x => x.h + ':' + x.m)).size === Math.min(20, (60 / C.LEVELS[lvl]) * (h24 ? 24 : 12)));
  ok(`${lvl} ${h24}: fit level`, ts.every(x => x.m % C.LEVELS[lvl] === 0 && x.m < 60 && (h24 ? x.h >= 0 && x.h < 24 : x.h >= 1 && x.h <= 12)), JSON.stringify(ts));
  // distractors: 3, distinct, different from the answer and valid
  for (let i = 0; i < 300; i++) {
    const t = C.randomTime(rnd, lvl, h24), d = C.distractors(t, lvl, h24, rnd);
    const all = [t, ...d].map(x => C.digital(x, h24));
    ok(`${lvl} ${h24} distractors ${all}`, d.length === 3 && new Set(all).size === 4 && d.every(x => x.m >= 0 && x.m < 60 && (h24 ? x.h >= 0 && x.h < 24 : x.h >= 1 && x.h <= 12)), JSON.stringify(d));
  }
}

// minutes ⇄ time
eq('minutesOf 3:30', C.minutesOf({ h: 15, m: 30 }), 210);
eq('fromMinutes 0', C.digital(C.fromMinutes(0, false), false), '12:00');
eq('fromMinutes -5', C.digital(C.fromMinutes(-5, false), false), '11:55');

// texts: every language has the same keys as English
const keys = o => Object.keys(o).sort().join(',');
for (const l of Object.keys(T)) for (const part of ['common', 'game', 'sheet']) eq(`${l}.${part} keys`, keys(T[l][part]), keys(T.en[part]));
const o = { h: 3, nx: 4, m: 30, dig: '3:30', dig24: '15:30', words: 'x', per: 'y', h24: true, num: 6 };
for (const l of Object.keys(T)) for (const k of ['explain', 'fixMinute', 'fixHour']) ok(`${l} ${k}`, !/undefined/.test(T[l].game[k](o)));
// it/es articles before numbers and times
eq('it explain 1:30', T.it.game.explain({ h: 1, nx: 2, m: 30, dig: '1:30', words: 'l’una e mezza' }), 'La lancetta corta è tra l’1 e il 2: contiamo l’1, perché l’ha già superato. La lancetta lunga indica 30 minuti. L’orologio segna l’1:30 — l’una e mezza.');
eq('it fixMinute 8', T.it.game.fixMinute({ m: 40, num: 8 }), 'La lancetta lunga deve indicare 40 minuti: deve essere sull’8.');
eq('es yourClock 1:05', T.es.game.yourClock('1:05'), 'Tu reloj marca la 1:05.');
eq('es explain 24h', T.es.game.explain({ h: 3, nx: 4, m: 0, dig: '3:00', dig24: '15:00', words: 'las tres', per: 'por la tarde', h24: true }), 'La aguja corta señala el 3 y la larga está en el 12: es la hora en punto. El reloj marca las 3:00 — las tres. Las 3:00 por la tarde son las 15:00 en el reloj de 24 horas.');

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
