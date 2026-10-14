// Run with: node engine.test.js
const S = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const D = require('../graphic-dictation/engine.js');
const T = require('./strings.js');
const DT = require('../graphic-dictation/strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

// dots: the corners in order, extra ones evenly on long sides, no gap longer than MAX_SIDE
for (const p of S.PICS) {
  const dots = S.dotsOf(p.pts), corners = dots.filter(d => d[2]);
  ok(`${p.id}: corners kept in order`, JSON.stringify(corners.map(d => [d[0], d[1]])) === JSON.stringify(p.pts));
  ok(`${p.id}: sides up to ${S.MAX_SIDE} squares`, dots.every((a, i) => { const b = dots[(i + 1) % dots.length]; return Math.hypot(b[0] - a[0], b[1] - a[1]) <= S.MAX_SIDE + 1e-9; }));
  ok(`${p.id}: has a level`, S.LEVEL_IDS.includes(S.levelOf(p)), S.count(p));
}
// every level of every theme has two different pictures for a sheet; the level names say how many dots
for (const lv of S.LEVEL_IDS) {
  for (const th of S.THEME_IDS) ok(`${lv}/${th}: at least 2 pictures`, S.pool(lv, th).length >= 2, S.pool(lv, th).map(p => p.id));
  const counts = S.pool(lv, 'all').map(S.count), lo = Math.min(...counts), hi = Math.max(...counts);
  ok(`${lv}: ${lo}–${hi} dots as the level names say`, T.en.levels[lv].includes(String(hi)) && (lv === 'easy' || T.en.levels[lv].includes(String(lo))), T.en.levels[lv]);
  console.log(`ok   ${lv}: ${S.pool(lv, 'all').length} pictures, ${lo}–${hi} dots`);
}
// numbers
const rnd = K.rng('n');
ok('ones', S.numbers('ones', 5, rnd).join() === '1,2,3,4,5');
ok('twos', S.numbers('twos', 4, rnd).join() === '2,4,6,8');
ok('tens', S.numbers('tens', 3, rnd).join() === '10,20,30');
for (let i = 0; i < 50; i++) {
  const n = 10 + (i % 27), a = S.numbers('from', n, K.rng('f' + i));
  ok(`from #${i}: starts at 11, 21… and ends below 100`, a[0] % 10 === 1 && a[0] > 1 && a[n - 1] <= 99 && a.every((v, k) => v === a[0] + k), a.join());
}

// sheets: same seed ⇒ same sheet, two different pictures, every label well placed, everything fits the page
let sheets = 0, minFont = 9, minGap = 99;
const fitsBox = (L, z) => L.w <= z.w + 1e-6 && L.h <= z.h + 1e-6;
for (const level of ['mix', ...S.LEVEL_IDS]) for (const theme of S.THEME_IDS) for (const mode of S.MODE_IDS) for (let i = 0; i < 8; i++) {
  const seed = `t${i}|${level}|${theme}|${mode}`, tag = `${level}/${theme}/${mode} #${i}`;
  const pics = S.pictures(K.rng(seed), level, theme, mode), A = S.arrange(pics);
  sheets++;
  ok(`${tag}: same seed ⇒ same sheet`, JSON.stringify(S.arrange(S.pictures(K.rng(seed), level, theme, mode))) === JSON.stringify(A));
  ok(`${tag}: two different pictures`, pics.length === 2 && pics[0].id !== pics[1].id);
  ok(`${tag}: levels`, level === 'mix' ? pics[0].level === 'easy' && pics[1].level !== 'easy' : pics.every(p => p.level === level));
  ok(`${tag}: theme`, pics.every(p => theme === 'all' || D.PICS.find(q => q.id === p.id).themes.includes(theme)));
  const room = A.mode === 'rows' ? A.sizes[0].h + A.sizes[1].h + 2 * S.AREA.cap + S.AREA.gap : A.sizes[0].w + A.sizes[1].w + S.AREA.gap;
  ok(`${tag}: the boxes share the room`, room <= (A.mode === 'rows' ? S.AREA.h : S.AREA.w) + 1e-6);
  A.layouts.forEach((L, k) => {
    const pr = S.problems(L);
    ok(`${tag} ${pics[k].id}: labels well placed`, !pr.length, pr.slice(0, 3).join('; '));
    ok(`${tag} ${pics[k].id}: fits its box`, fitsBox(L, A.sizes[k]), `${L.w.toFixed(1)}×${L.h.toFixed(1)} in ${A.sizes[k].w.toFixed(1)}×${A.sizes[k].h.toFixed(1)}`);
    ok(`${tag} ${pics[k].id}: one label a dot`, L.labels.length === pics[k].dots.length && L.labels.every((r, j) => r.text === String(pics[k].nums[j])));
    minFont = Math.min(minFont, L.font); minGap = Math.min(minGap, S.spacing(pics[k].dots) * L.scale);
  });
}
console.log(`ok   ${sheets} sheets; smallest numbers ${minFont} mm, closest dots ${minGap.toFixed(1)} mm apart`);
// every picture in every counting mode, next to the biggest one (the castle), in a few variants
const castle = S.PICS.find(p => p.id === 'castle');
for (const p of S.PICS) for (const mode of S.MODE_IDS) for (let v = 0; v < 3; v++) {
  const r = K.rng(`${p.id}|${mode}|${v}`), items = [p, castle].map(q => { const w = D.variant(q, r), dots = S.dotsOf(w.pts); return { dots, nums: S.numbers(mode, dots.length, r) }; });
  const A = S.arrange(items);
  ok(`${p.id}/${mode}/${v}: labels well placed`, A.layouts.every(L => !S.problems(L).length));
}
ok('svg renders', S.svg(S.arrange(S.pictures(K.rng('s'), 'mix', 'all', 'tens')).layouts[0], { solved: true }).startsWith('<svg'));

// every language has every key the English texts have, and every picture a name
for (const l of ['pl', 'uk', 'vi', 'fr', 'it', 'es']) {
  for (const k of Object.keys(T.en)) ok(`${l}: has ${k}`, T[l][k] !== undefined);
  for (const k of ['levels', 'counts', 'themes', 'hint']) for (const id of Object.keys(T.en[k])) ok(`${l}: ${k}.${id}`, !!T[l][k][id]);
}
for (const l of Object.keys(T)) {
  ok(`${l}: every level, mode and theme has a label`, ['mix', ...S.LEVEL_IDS].every(v => T[l].levels[v]) && S.MODE_IDS.every(v => T[l].counts[v] && T[l].hint[v]) && S.THEME_IDS.every(v => T[l].themes[v]));
  ok(`${l}: every picture has a name`, S.PICS.every(p => DT[l].common.pics[p.id]));
}
console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
