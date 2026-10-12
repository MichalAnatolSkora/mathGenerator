// Run with: node engine.test.js
const D = require('./engine.js');
const T = require('./strings.js');
let fails = 0;
const eq = (name, got, want) => { if (got !== want) { fails++; console.log('FAIL', name, '\n  got :', got, '\n  want:', want); } else console.log('ok  ', name); };
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

// pictures: closed outlines that never touch themselves, sides along the grid or across the squares
const ids = new Set();
for (const p of D.PICS) {
  ok(`${p.id}: unique id`, !ids.has(p.id)); ids.add(p.id);
  ok(`${p.id}: level`, D.LEVEL_IDS.includes(p.level));
  const st = D.steps(p.pts);
  ok(`${p.id}: every side has a direction`, st.every(s => s.dir && s.n > 0), JSON.stringify(st));
  ok(`${p.id}: sides are straight or 45°`, p.pts.every((a, i) => { const b = p.pts[(i + 1) % p.pts.length], dx = Math.abs(b[0] - a[0]), dy = Math.abs(b[1] - a[1]); return dx === 0 || dy === 0 || dx === dy; }));
  ok(`${p.id}: no two sides in a row go the same way`, st.every((s, i) => s.dir !== st[(i + 1) % st.length].dir));
  ok(`${p.id}: easy and medium stay on the lines`, p.level === 'hard' || st.every(s => !D.diagonal(s.dir)));
  ok(`${p.id}: hard uses diagonals`, p.level !== 'hard' || st.some(s => D.diagonal(s.dir)));
  ok(`${p.id}: lines up to 10 squares`, st.every(s => s.n <= 10));
  if (p.level === 'easy') ok(`${p.id}: easy has at most 16 lines`, st.length <= 16, st.length);
  // walk square by square: every grid point once, no square crossed by both diagonals
  const seen = new Set(), diag = new Set();
  let [x, y] = p.pts[0], simple = true;
  for (const s of st) for (let k = 0; k < s.n; k++) {
    const [dx, dy] = D.DIRS[s.dir];
    if (dx && dy) { const sq = `${Math.min(x, x + dx)},${Math.min(y, y + dy)}`; if (diag.has(sq)) simple = false; diag.add(sq); }
    if (seen.has(`${x},${y}`)) simple = false;
    seen.add(`${x},${y}`); x += dx; y += dy;
  }
  ok(`${p.id}: closed`, x === p.pts[0][0] && y === p.pts[0][1]);
  ok(`${p.id}: does not touch itself`, simple);
  const n = D.normalize(p.pts);
  ok(`${p.id}: starts at 0,0`, Math.min(...n.map(q => q[0])) === 0 && Math.min(...n.map(q => q[1])) === 0);
  ok(`${p.id}: drawn from 0,0`, JSON.stringify(n) === JSON.stringify(p.pts));
  // variants: same lines, same size
  for (let i = 0; i < 20; i++) {
    const v = D.variant(p, D.rng(p.id + i));
    const a = D.steps(v.pts).map(s => s.n).sort().join(), b = st.map(s => s.n).sort().join();
    ok(`${p.id} variant ${i}: same lengths`, a === b);
    const s1 = D.size(p.pts), s2 = D.size(v.pts);
    ok(`${p.id} variant ${i}: same size`, s1.w === s2.w && s1.h === s2.h);
  }
}
for (const l of D.LEVEL_IDS) {
  ok(`level ${l} has at least 6 everyday pictures`, D.pool(l, 'basic').length >= 6);
  ok(`level ${l} has at least 3 religious pictures`, D.pool(l, 'faith').length >= 3);
  ok(`level ${l}: all = basic + faith`, D.pool(l, 'all').length === new Set([...D.pool(l, 'basic'), ...D.pool(l, 'faith')]).size);
}
ok('themes are known', D.PICS.every(p => p.themes.length && p.themes.every(x => D.THEME_IDS.includes(x))));
eq('steps of a square', JSON.stringify(D.steps([[0, 0], [2, 0], [2, 2], [0, 2]])), JSON.stringify([{ dir: 'R', n: 2 }, { dir: 'D', n: 2 }, { dir: 'L', n: 2 }, { dir: 'U', n: 2 }]));
eq('mirror + reverse + start', JSON.stringify(D.variant({ pts: [[0, 0], [2, 0], [2, 1]] }, null, { mirror: true, reverse: true, start: 1 }).pts), JSON.stringify([[0, 0], [2, 0], [0, 1]]));

// numbers as sums and products
const rnd = D.rng('expr');
for (const kind of ['add', 'mul']) for (let n = 1; n <= 10; n++) for (let i = 0; i < 40; i++) {
  const e = D.expr(n, kind, rnd);
  ok(`${kind} ${n}: ${JSON.stringify(e)}`, e && D.value(e) === n && Number.isInteger(e.a) && Number.isInteger(e.b) && e.a > 0 && e.b > 0
    && (kind === 'add' ? e.a <= 13 && e.b <= 13 && '+-'.includes(e.op) : e.a <= 50 && e.b >= 2 && e.b <= 10 && '×÷'.includes(e.op)));
}
eq('plain number', D.expr(4, 'plain', rnd), null);

// texts: every language has the same keys as English, a name for every picture, a word for every direction
const keys = o => Object.keys(o).sort().join(',');
for (const l of Object.keys(T)) {
  for (const part of ['common', 'game', 'sheet']) eq(`${l}.${part} keys`, keys(T[l][part]), keys(T.en[part]));
  ok(`${l}: picture names`, D.PICS.every(p => T[l].common.pics[p.id]));
  ok(`${l}: direction words`, D.DIR_IDS.every(d => T[l].common.dirs[d]));
  ok(`${l}: levels`, D.LEVEL_IDS.every(v => T[l].common.levels[v]));
  ok(`${l}: themes`, D.THEME_IDS.every(v => T[l].common.themes[v]));
  ok(`${l}: operators`, ['+', '-', '×', '÷'].every(v => T[l].common.ops[v]));
  for (const n of [1, 2, 5, 12, 22]) ok(`${l} plurals ${n}`, !/undefined/.test(T[l].game.result(n, n) + T[l].sheet.summary(n, n) + T[l].common.squares(n) + T[l].game.tooLong(T[l].common.squares(n), 'x')));
}

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
