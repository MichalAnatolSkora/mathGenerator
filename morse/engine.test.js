// Run with: node engine.test.js
const M = require('./engine.js');
const T = require('./strings.js');
const B = require('./bank.js');
const D = require('../graphic-dictation/engine.js');
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra === undefined ? '' : extra); } };

// the international table, checked against a hand-written copy
const ITU = 'A.- B-... C-.-. D-.. E. F..-. G--. H.... I.. J.--- K-.- L.-.. M-- N-. O--- P.--. Q--.- R.-. S... T- U..- V...- W.-- X-..- Y-.-- Z--..';
for (const pair of ITU.split(' ')) for (const l of ['en', 'fr', 'vi', 'it', 'es']) eq(`${l} ${pair[0]}`, M.code(pair[0], l), pair.slice(1));
const PL = 'Ą.-.- Ć-.-.. Ę..-.. Ł.-..- Ń--.-- Ó---. Ś...-... Ź--..-. Ż--..-';
for (const pair of PL.split(' ')) eq(`pl ${pair[0]}`, M.code(pair[0], 'pl'), pair.slice(1));
eq('fr É', M.code('É', 'fr'), '..-..');
eq('es Ñ', M.code('Ñ', 'es'), '--.--');
eq('es extra letters', M.extras('es').join(), 'Ñ');
eq('es alphabet', M.alphabet('es').join(''), 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ');
eq('it is A–Z only', M.alphabet('it').join('') + M.extras('it').length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0');
const UKT = 'А.- Б-... В.-- Г--. Д-.. Е. Є..-.. Ж...- З--.. И-.-- І.. Ї.---. Й.--- К-.- Л.-.. М-- Н-. О--- П.--. Р.-. С... Т- У..- Ф..-. Х.... Ц-.-. Ч---. Ш---- Щ--.- Ь-..- Ю..-- Я.-.-';
for (const pair of UKT.split(' ')) eq(`uk ${pair[0]}`, M.code(pair[0], 'uk'), pair.slice(1));
eq('sos', M.encode('sos', 'en').flat().map(x => x.code).join(' '), '... --- ...');

for (const l of M.LANGS) {
  const a = M.alphabet(l);
  ok(`${l}: every letter has a code`, a.every(x => M.code(x, l)));
  ok(`${l}: codes are unique`, new Set(a.map(x => M.code(x, l))).size === a.length);
  ok(`${l}: codes are dots and dashes`, a.every(x => /^[.-]{1,7}$/.test(M.code(x, l))));
  ok(`${l}: decode is the inverse`, a.every(x => M.decodeLetter(M.code(x, l), l) === x));
  // groups: 1–3 are learned first, all letters reachable, extras only in group 5
  const g = n => a.filter(x => M.groupOf(x, l) === n);
  eq(`${l}: group 1`, g(1).length, 6);
  ok(`${l}: groups cover the alphabet`, M.letters(l, 4, true).length === a.length);
  ok(`${l}: letters grow with the groups`, [1, 2, 3, 4].every(n => n === 1 || M.letters(l, n).length > M.letters(l, n - 1).length));
  ok(`${l}: extras are group 5`, M.extras(l).every(x => M.groupOf(x, l) === 5) && g(5).length === M.extras(l).length);
  ok(`${l}: group letters in learning order`, [1, 2, 3].every(n => M.groupLetters(l, n).every(x => M.groupOf(x, l) === n)));
  // the word bank: everything can be sent, nothing repeated, enough for the first group
  const b = M.bank(l);
  ok(`${l}: words can be sent`, b.words.every(x => x.w && M.sendable(x.w, l)), b.words.filter(x => !M.sendable(x.w, l)).map(x => x.w));
  ok(`${l}: riddle answers can be sent`, b.riddles.every(x => M.sendable(x.w, l)), b.riddles.filter(x => !M.sendable(x.w, l)).map(x => x.w));
  ok(`${l}: messages can be sent`, b.phrases.every(x => M.sendable(x.w, l)), b.phrases.filter(x => !M.sendable(x.w, l)).map(x => x.w));
  ok(`${l}: words not repeated in the list`, new Set(B[l].words).size === B[l].words.length);
  const g1 = new Set(M.letters(l, 1));
  ok(`${l}: at least 8 words for group 1`, b.words.filter(x => [...x.w].every(c => g1.has(c))).length >= 8);
  ok(`${l}: at least 2 riddles for group 1`, b.riddles.filter(x => [...x.w].every(c => c === ' ' || g1.has(c))).length >= 2);
  ok(`${l}: ships`, b.ships.length >= 4);
}
eq('vi drops the marks', M.norm('Thuyền đỏ', 'vi'), 'THUYEN DO');
eq('fr keeps É only', M.norm('été à la forêt', 'fr'), 'ÉTÉ A LA FORET');
eq('pl keeps its letters', M.norm('żółw', 'pl'), 'ŻÓŁW');
eq('es keeps Ñ only', M.norm('mañana está aquí', 'es'), 'MAÑANA ESTA AQUI');
eq('es drops the diaeresis', M.norm('pingüino', 'es'), 'PINGUINO');
eq('it drops the accents', M.norm('perché è così', 'it'), 'PERCHE E COSI');
eq('it apostrophe', M.norm('l’isola', 'it'), 'LISOLA');
ok('es Ñ only with the extra letters', !M.letters('es', 4).includes('Ñ') && M.letters('es', 4, true).includes('Ñ') && M.groupOf('Ñ', 'es') === 5);
ok('es Ñ is off the tree (5 signs)', !M.treeNodes('es').some(n => n.letter === 'Ñ'));
ok('pl mnemonics fit the codes', Object.entries(B.pl.mnemonics).every(([l, w]) =>
  w.split('-').map(s => (/[oó]/.test(s) ? '-' : '.')).join('') === M.code(l, 'pl')), 'a syllable with o/ó is a dash');

// the tree: every node's parent is on the tree
for (const l of M.LANGS) {
  const nodes = M.treeNodes(l), codes = new Set(nodes.map(n => n.code));
  ok(`${l}: tree has a parent for every node`, nodes.every(n => n.code.length === 1 || codes.has(n.code.slice(0, -1))));
  const blank = nodes.find(n => n.depth === 2).letter;
  ok(`${l}: tree svg`, M.treeSVG(l).includes('<svg') && M.treeSVG(l, { blanks: [blank] }).split('<text').length === nodes.length + 1);
}

// one step apart
ok('oneOff', M.oneOff('.-', '..') && M.oneOff('.-', '.') && M.oneOff('.-', '.--') && !M.oneOff('.-', '-.') && !M.oneOff('.-', '.-'));

// colouring: the outlines fill in and fit
const pics = M.colorPictures();
ok('at least 6 colouring pictures', pics.length >= 6, pics.map(p => p.id));
for (const p of pics) {
  const R = M.raster(p.pts);
  const filled = R.inside.flat().filter(Boolean).length;
  ok(`${p.id}: fits`, R.cols <= M.COLOR_MAX.cols && R.rows <= M.COLOR_MAX.rows);
  ok(`${p.id}: border row is empty`, R.inside[0].every(x => !x) && R.inside[R.rows - 1].every(x => !x) && R.inside.every(r => !r[0] && !r[R.cols - 1]));
  // the filled squares have exactly the area of the outline (shoelace formula), as every side is on the grid
  const area = Math.abs(p.pts.reduce((s, [x, y], i) => { const [x2, y2] = p.pts[(i + 1) % p.pts.length]; return s + x * y2 - x2 * y; }, 0)) / 2;
  eq(`${p.id}: filled area`, filled, area);
}

// whole sheets
for (const l of M.LANGS) for (const level of M.LEVELS) for (const upto of M.UPTO) for (const extra of [false, true]) {
  for (let i = 0; i < 6; i++) {
    const seed = `T${i}`;
    const s = M.sheet({ seed, lang: l, level, upto, extra, tasks: M.TASKS });
    const tag = `${l} ${level} ${upto}${extra ? '+' : ''} ${seed}`;
    const set = new Set(s.letters);
    const known = w => [...w].every(c => c === ' ' || set.has(c));
    ok(`${tag}: deterministic`, JSON.stringify(s) === JSON.stringify(M.sheet({ seed, lang: l, level, upto, extra, tasks: M.TASKS })));
    for (const b of s.blocks) {
      if (b.items) ok(`${tag} ${b.type}: only learned letters`, b.items.every(x => known(x.text)), b.items.map(x => x.text));
      if (b.type === 'telegram' && level === 'young') ok(`${tag}: telegram words fit a row`, b.items.every(x => M.tilesWidth(x.text, l) <= 80));
      if (b.type === 'error') ok(`${tag}: one wrong code`, b.items.every(x => x.wrong !== x.right && M.code([...x.text][x.index], l) === x.right));
      if (b.type === 'password') {
        ok(`${tag}: password letters`, b.clues.length === b.word.length && b.clues.every((c, k) => c.text[c.pos] === b.word[k]), JSON.stringify(b));
        ok(`${tag}: password words known`, known(b.word) && b.clues.every(c => known(c.text)));
        ok(`${tag}: clues differ`, new Set(b.clues.map(c => c.text)).size === b.clues.length);
      }
      if (b.type === 'pairs') ok(`${tag}: pairs`, b.left.length === 5 && [...b.left].sort().join() === [...b.right].sort().join() && b.left.every(x => set.has(x)));
      if (b.type === 'coloring') {
        ok(`${tag}: colouring letters known and apart`, b.inLetters.every(x => set.has(x)) && b.outLetters.every(x => set.has(x)) && !b.inLetters.some(x => b.outLetters.includes(x)));
        ok(`${tag}: colouring cells`, b.cells.every((r, y) => r.every((c, x) => (b.inside[y][x] ? b.inLetters : b.outLetters).includes(c))));
        ok(`${tag}: colouring codes fit`, [...b.inLetters, ...b.outLetters].every(x => M.codeWidth(M.code(x, l)) <= M.COLOR_MAX.codeWidth));
      }
      if (b.type === 'tree') ok(`${tag}: tree blanks`, b.blanks.length > 0 && b.blanks.every(x => set.has(x) && M.code(x, l).length > 1 && M.code(x, l).length <= 4));
      if (b.type === 'dictation') ok(`${tag}: dictation code`, JSON.stringify(M.parseDictationCode(b.code)) === JSON.stringify({ seed, upto, extra: extra && M.extras(l).length > 0 }));
    }
    const words = s.blocks.filter(b => ['telegram', 'riddle', 'encode', 'error'].includes(b.type)).flatMap(b => b.items.map(x => x.text));
    if (upto >= 3) ok(`${tag}: no word twice on the sheet`, new Set(words).size === words.length, words);
    if (upto >= 2) ok(`${tag}: all tasks made`, s.blocks.length === M.TASKS.length, s.blocks.map(b => b.type));
  }
}
ok('default tasks', M.sheet({ seed: 'A', lang: 'pl', level: 'older' }).blocks.map(b => b.type).join() === M.DEFAULT_TASKS.older.join());
eq('dictation code', M.dictationCode('AB12-345', 2, true), 'AB12-345/2+');
eq('dictation code read back', JSON.stringify(M.parseDictationCode(' ab12-345 / 3 ')), JSON.stringify({ seed: 'AB12-345', upto: 3, extra: false }));
eq('bad dictation code', M.parseDictationCode('AB12'), null);
ok('dictation matches the sheet', JSON.stringify(M.dictationWords('X', 'pl', 2, false)) === JSON.stringify(M.sheet({ seed: 'X', lang: 'pl', level: 'young', upto: 2, tasks: ['dictation'] }).blocks[0].items));
ok('svg', M.svg('.-', { u: 2 }).includes('width="8.7mm"'));
ok('lighthouse', M.lighthouseSVG().includes('lh-beam'));
// the Titanic story: the calls are real Morse, SOS on the air is one signal with no gaps
eq('story CQD', M.STORY.cqd.join(' '), ['C', 'Q', 'D'].map(l => M.code(l, 'en')).join(' '));
eq('story SOS', M.STORY.sos.join(''), M.SOS_SIGNAL);
ok('story picture', M.storySVG({ labels: { near: 'n', off: 'a', far: 'b' } }).includes('sos-arcs'));

// texts: every language has the same keys as Polish, and the functions give text
const keys = o => Object.keys(o).sort().join(',');
for (const l of Object.keys(T)) {
  for (const part of ['common', 'game', 'sheet']) eq(`${l}.${part} keys`, keys(T[l][part]), keys(T.pl[part]));
  ok(`${l}: task names`, M.TASKS.every(x => T[l].sheet.tasks[x]));
  ok(`${l}: levels`, M.LEVELS.every(x => T[l].sheet.levels[x]));
  ok(`${l}: picture names (from the graphic dictation)`, pics.every(p => require('../graphic-dictation/strings.js')[l].common.pics[p.id]));
  for (const n of [1, 2, 5, 12, 22]) ok(`${l} plurals ${n}`, !/undefined/.test(T[l].sheet.summary(n) + T[l].game.dictResult(n, n) + T[l].game.stats(n, n)));
  eq(`${l}.story keys`, keys(T[l].common.story), keys(T.pl.common.story));
  eq(`${l}: story paragraphs`, T[l].common.story.text.length, T.pl.common.story.text.length);
  ok(`${l}: extra letters label`, !M.extras(l).length || T[l].common.extraLabel(M.extras(l).join(' ')).length > 0);
}

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
