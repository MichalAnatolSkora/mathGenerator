// Run with: node strings.test.js
const { REW_TEXT: T } = require('./strings.js');
const REW = require('./engine.js');
const W20_TEXT = require('../wisla-1920/strings.js');
let fails = 0;
const ok = (name, cond) => { if (!cond) { fails++; console.log('FAIL', name); } };
// every language has the same keys as Polish (deep) and lists as long
const shape = v => typeof v === 'function' ? 'fn' : Array.isArray(v) ? v.map(shape) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
ok('seven languages', Object.keys(T).join() === 'pl,en,uk,vi,fr,it,es');
for (const [l, C] of Object.entries(T)) {
  if (l !== 'pl') ok(`${l}: same keys and list lengths as pl`, JSON.stringify(shape(C)) === JSON.stringify(shape(T.pl)));
  ok(`${l}: every glossary word explained`, REW.VOCAB.every(w => C.gloss[w]) && Object.keys(C.gloss).length === REW.VOCAB.length);
  ok(`${l}: every telegram translated`, REW.STARTS.every(w => C.answers.tr1[w]) && REW.T2.every(t => C.answers.tr2[t.id]));
  ok(`${l}: four questions, four answers`, C.report.q.length === 4 && C.answers.report(1).length === 4);
  ok(`${l}: the map and the alphabet of the other sheet`, W20_TEXT[l] && W20_TEXT[l].map && W20_TEXT[l].abc && W20_TEXT[l].story.mapTitle);
  ok(`${l}: functions give text`, typeof C.mission.intro(2) === 'string' && C.mission.intro(2).includes('РЕВОЛЮЦИЯ 2')
    && C.mission.easy(2, '123456').includes('123456') && C.mission.mid('ПРИКАЗ').includes('ПРИКАЗ') && C.how.trick('1', '2', '3').includes('3'));
}
console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
