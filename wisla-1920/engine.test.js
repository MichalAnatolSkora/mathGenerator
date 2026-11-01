// Run with: node engine.test.js
const W20 = require('./engine.js');
const KIT = require('../sheet-kit/kit.js');
let fails = 0;
const ok = (name, cond) => { if (!cond) { fails++; console.log('FAIL', name); } };

ok('32 letters', W20.ALPHABET.length === 32);
ok('every telegram letter is in the alphabet', W20.VOCAB.every(w => [...w].every(ch => W20.ALPHABET.includes(ch))));
for (let s = 0; s < 300; s++) {
  const d = W20.day(KIT.rng('t' + s));
  const nums = Object.values(d.key);
  ok(`${s}: key numbers differ and have two digits`, new Set(nums).size === 32 && nums.every(n => n >= 11 && n <= 99));
  ok(`${s}: words follow the key`, d.telegrams.every(t => t.words.every((w, i) => w.every((n, j) => d.key[t.plain[i][j]] === n))));
  // the pattern word: exactly one in telegram 1, and it is ДИВИЗИЯ
  const p = W20.findPattern(d);
  ok(`${s}: ДИВИЗИЯ found by its pattern`, p >= 0 && d.telegrams[0].plain[p] === W20.PATTERN_WORD);
  const start = {};
  d.telegrams[0].words[p].forEach((n, i) => { start[n] = W20.PATTERN_WORD[i]; });
  // easy: the key table has everything else, so ДИВИЗИЯ completes it
  const used = W20.lettersUsed(d);
  const easy = { ...start };
  for (const ch of used) if (!W20.PATTERN_WORD.includes(ch)) easy[d.key[ch]] = ch;
  ok(`${s}: easy key is complete after ДИВИЗИЯ`, used.every(ch => easy[d.key[ch]] === ch));
  // half the key: about half given, none of ДИВИЗИЯ's, and with ДИВИЗИЯ it reads to the end
  const half = W20.halfKey(d, KIT.rng('h' + s)), rest = used.filter(ch => !W20.PATTERN_WORD.includes(ch));
  ok(`${s}: half key is half`, half.size === Math.floor(rest.length / 2) && [...half].every(ch => rest.includes(ch)));
  const mh = W20.solve(d, { ...start, ...Object.fromEntries([...half].map(ch => [d.key[ch], ch])) });
  ok(`${s}: half key solvable`, d.telegrams.every(t => t.words.every((w, i) => w.map(n => mh[n]).join('') === t.plain[i])));
  // like Kowalewski: from ДИВИЗИЯ alone, guessing glossary words, every telegram can be read
  const m = W20.solve(d, start);
  const all = d.telegrams.every(t => t.words.every((w, i) => w.map(n => m[n]).join('') === t.plain[i]));
  if (!all) console.log(d.telegrams.map(t => t.id).join(','), d.telegrams.map(t => t.words.map(w => w.map(n => m[n] || '·').join('')).join(' ')).join(' | '));
  ok(`${s}: hard level solvable from ДИВИЗИЯ`, all);
  // ★★★, no gaps: the pattern may show up twice, but only the real ДИВИЗИЯ leads to an answer, and to one only
  const st = d.telegrams[0].words.flat(), hits = W20.patternHits(d);
  const from = i => Object.fromEntries([...W20.PATTERN_WORD].map((ch, k) => [st[i + k], ch]));
  const real = hits.filter(i => d.telegrams[0].plain.join('').slice(i, i + 7) === W20.PATTERN_WORD);
  ok(`${s}: expert: the real ДИВИЗИЯ is among the hits`, real.length === 1 && hits.length <= 2);
  // ★★★★ rows: every number once, in order; the comb (7 numbers) never has to cross a row to find ДИВИЗИЯ
  const rows = W20.stream(d.telegrams[0]);
  ok(`${s}: expert rows keep the numbers`, d.telegrams.every(t => W20.stream(t).flat(2).join() === t.words.flat().join()));
  ok(`${s}: expert rows of ${W20.ROW} in groups of five`, rows.every((r, i) => r.flat().length === (i < rows.length - 1 ? W20.ROW : r.flat().length) && r.every(g => g.length <= 5)));
  ok(`${s}: expert: ДИВИЗИЯ inside one row`, real.every(i => i % W20.ROW <= W20.ROW - 7));
  if (s < 40) ok(`${s}: expert: one answer from ДИВИЗИЯ, none from the false hit`,
    hits.every(i => W20.countStreamSolutions(d, from(i)) === (real.includes(i) ? 1 : 0)));
}
// the comb is 1:1 with the telegram cells: tooth pitch = cell width + gap between cells, in words and in ★★★★ rows
const css = require('fs').readFileSync(__dirname + '/worksheet.html', 'utf8');
const cellW = +css.match(/\.c\{width:([\d.]+)mm/)[1], wordGap = +css.match(/\.wd\{display:flex;gap:([\d.]+)mm/)[1];
const rowGap = +css.match(/\.trow\{[^}]*gap:[\d.]+mm ([\d.]+)mm/)[1];
ok('comb pitch = cell + gap in a word', Math.abs(cellW + wordGap - W20.PITCH) < 1e-9);
ok('comb pitch = cell + gap in a ★★★★ row', Math.abs(cellW + rowGap - W20.PITCH) < 1e-9);
const comb = W20.combSvg('x');
ok('comb width 1:1 in mm', comb.includes(`width="${(6 * W20.PITCH + cellW + 0.8).toFixed(1)}mm"`));
ok('comb: three grey teeth to cut off (2, 4, 6)', (comb.match(/fill="#b9b9b9"/g) || []).length === 3
  && [1, 3, 5].every(k => comb.includes(`x="${(k * W20.PITCH).toFixed(2)}" y="4" width="${cellW}"`)));
ok('map draws', /<svg/.test(W20.mapSvg({ mode: 'story', L: require('./strings.js').pl.map })));
console.log(fails ? `${fails} failures` : 'all ok');
process.exit(fails ? 1 : 0);
