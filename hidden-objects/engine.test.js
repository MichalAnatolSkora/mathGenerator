// Run with: node engine.test.js
const H = require('./engine.js');
require('./objects.js');
require('./scenes.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra === undefined ? '' : extra); } };

const SCENES = Object.keys(H.SCENES), LEVELS = Object.keys(H.LEVELS), LANGS = ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es'];
ok('four scenes', SCENES.join() === 'forest,farm,sea,space');

/* ---------- the things to find ---------- */
const ids = H.OBJECTS.map(o => o.id);
ok('object ids are unique', new Set(ids).size === ids.length);
for (const o of H.OBJECTS) {
  const D = H.measure(o);
  ok(`${o.id}: about 20 units long`, D.long > 11.5 && D.long < 25 && D.short > 2.5, `${D.w.toFixed(1)} × ${D.h.toFixed(1)}`);
  ok(`${o.id}: stays out of known scenes only`, o.not.every(s => SCENES.includes(s)));
  ok(`${o.id}: icon is an SVG`, /^<svg[^>]*>.*<path .*<\/svg>$/.test(H.icon(o.id)));
  ok(`${o.id}: the icon is the same every time`, H.icon(o.id) === H.icon(o.id));
}
for (const tag of ['round', 'dome', 'cone']) ok(`at least 4 objects are "${tag}"`, H.OBJECTS.filter(o => o.tags.includes(tag)).length >= 4);
for (const s of SCENES) ok(`${s}: enough objects may hide there`, H.OBJECTS.filter(o => !o.not.includes(s)).length >= 55);

/* ---------- the pictures ---------- */
const N = 40;
for (const scene of SCENES) for (const level of LEVELS) {
  const { n, len, gap } = H.LEVELS[level];
  let full = 0, parts = 0, total = 0;
  for (let i = 0; i < N; i++) {
    const name = `${scene} ${level} #${i}`, pic = H.make(`T${i}`, scene, level), f = pic.found;
    total += f.length; parts += f.filter(p => p.part).length; if (f.length === n) full++;
    ok(`${name}: all ${n} objects hidden`, f.length === n, f.length);
    ok(`${name}: all different`, new Set(f.map(p => p.id)).size === f.length);
    ok(`${name}: none that is at home in this scene`, f.every(p => !H.OBJECTS.find(o => o.id === p.id).not.includes(scene)));
    ok(`${name}: inside the frame`, f.every(p => p.x - p.r >= 2 && p.y - p.r >= 2 && p.x + p.r <= H.W - 2 && p.y + p.r <= H.H - 2));
    ok(`${name}: apart from one another`, f.every((p, a) => f.every((q, b) => a === b || Math.hypot(p.x - q.x, p.y - q.y) >= gap * 0.45 - 0.001)));
    ok(`${name}: of the size of the level`, f.every(p => { const D = H.measure(H.OBJECTS.find(o => o.id === p.id)); const long = 2 * p.r * D.long / Math.hypot(D.w, D.h); return long >= len[0] - 0.01 && long <= len[1] + 0.01; }));
    ok(`${name}: an object that stands in for a part fills at least 30 % of its place`, f.every(p => !p.part || p.fill >= 0.3));
    // the object is really drawn (second pass), and the two passes saw the same places
    ok(`${name}: every object is drawn`, f.every((p, k) => pic.items.some(it => it.tag === k)));
    ok(`${name}: both passes offer the same places`, pic.slots.length === pic.firstSlots.length && pic.slots.every((s, k) => Math.abs(s.x - pic.firstSlots[k].x) < 0.01 && Math.abs(s.y - pic.firstSlots[k].y) < 0.01 && s.host === pic.firstSlots[k].host));
    if (i < 3) {
      const svg = pic.svg(), again = H.make(`T${i}`, scene, level);
      ok(`${name}: same code ⇒ same picture`, again.svg() === svg.replace(/hid1/g, 'hid1') && again.found.map(p => p.id).join() === f.map(p => p.id).join());
      ok(`${name}: another code ⇒ another picture`, H.make(`U${i}`, scene, level).items.map(it => it.d).join('') !== pic.items.map(it => it.d).join(''));
      ok(`${name}: no NaN in the drawing`, !/NaN|undefined/.test(svg) && !/NaN|undefined/.test(pic.svg(H.W, true)));
      ok(`${name}: the answer colours the objects`, (pic.svg(H.W, true).match(/#ffd23f/g) || []).length >= f.length);
      // the scene does not depend on the level: the same places are offered
      const other = H.make(`T${i}`, scene, level === 'easy' ? 'hard' : 'easy');
      ok(`${name}: the scene is the same on every level`, other.firstSlots.length === pic.firstSlots.length && other.firstSlots.every((s, k) => s.x === pic.firstSlots[k].x && s.y === pic.firstSlots[k].y));
    }
  }
  ok(`${scene} ${level}: at least 40 % of the objects are built into the scene`, parts >= 0.4 * total, (parts / total).toFixed(2));
  console.log(`ok   ${scene} ${level}: ${N} pictures, ${full} with all ${n} objects, ${(100 * parts / total).toFixed(0)} % built in`);
}

/* ---------- texts ---------- */
for (const l of LANGS) {
  for (const k of Object.keys(T.en)) ok(`${l}: has ${k}`, T[l][k] !== undefined);
  for (const id of ['mix', ...SCENES]) ok(`${l}: scenes.${id}`, !!T[l].scenes[id]);
  for (const id of LEVELS) ok(`${l}: levels.${id} names the number of objects`, T[l].levels[id].includes(String(H.LEVELS[id].n)));
  for (const id of ids) ok(`${l}: objects.${id}`, typeof T[l].objects[id] === 'string' && T[l].objects[id].length > 1);
  ok(`${l}: no names without an object`, Object.keys(T[l].objects).every(id => ids.includes(id)));
  ok(`${l}: names are different`, new Set(Object.values(T[l].objects)).size === ids.length);
  for (const n of [1, 2, 5, 8, 12, 16]) ok(`${l}: instr(${n})`, T[l].instr(n).includes(String(n)) && !/undefined/.test(T[l].instr(n)));
}
console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
