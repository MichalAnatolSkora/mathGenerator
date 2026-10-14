// Run with: node engine.test.js
const M = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const T = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

/** A perfect maze: the open ways are between neighbours only, both ways, n-1 of them and every cell is reached. */
function check(name, m) {
  ok(`${name}: open ways join neighbours`, m.links.every((l, a) => l.every(b => m.adj[a].includes(b) && m.links[b].includes(a))));
  const ways = m.links.reduce((s, l) => s + l.length, 0) / 2;
  ok(`${name}: n-1 open ways (no loops)`, ways === m.n - 1, `${ways} vs ${m.n - 1}`);
  ok(`${name}: every cell reachable`, M.bfs(m.links, 0).dist.every(d => d >= 0));
  const p = m.path;
  ok(`${name}: the way goes from start to end`, p[0] === m.start && p[p.length - 1] === m.end);
  ok(`${name}: the way goes through open ways`, p.every((c, i) => !i || m.links[p[i - 1]].includes(c)));
  ok(`${name}: the way is the shortest one`, p.length - 1 === M.bfs(m.links, m.start).dist[m.end]);
  return p.length;
}

const RECTS = [[5, 5], [7, 7], [8, 8], [9, 9], [12, 12], [20, 24], [3, 6]];
for (const [w, h] of RECTS) {
  let min = Infinity;
  for (let i = 0; i < 80; i++) {
    const m = M.rect(K.rng(`t${i}|${w}x${h}`), w, h);
    ok(`${w}×${h} #${i}: entrance in the top row, exit in the bottom row`, m.start < w && m.end >= w * (h - 1));
    min = Math.min(min, check(`${w}×${h} #${i}`, m));
  }
  // a long way: at least as many cells as a straight line down and 1.5× that on the larger sizes
  ok(`${w}×${h}: long ways`, min >= h && (w * h < 50 || min >= 1.5 * h), min);
  console.log(`ok   ${w}×${h}: 80 mazes, shortest way ${min} cells`);
}
for (const rings of [3, 4, 5, 6, 7, 9]) {
  const count = M.ringCounts(rings);
  ok(`round ${rings}: ring counts`, count.length === rings && count[0] === 1 && count.every((c, k) => k < 2 || c === count[k - 1] || c === 2 * count[k - 1]));
  for (let i = 0; i < 80; i++) {
    const m = M.round(K.rng(`r${i}|${rings}`), rings);
    ok(`round ${rings} #${i}: entrance in the outer ring, goal in the middle`, m.ring[m.start] === rings - 1 && m.end === 0);
    check(`round ${rings} #${i}`, m);
  }
  console.log(`ok   round ${rings} rings (${count.join('+')} cells): 80 mazes`);
}

// same seed ⇒ same maze and the same picture
const same = (f) => JSON.stringify(f(K.rng('x'))) === JSON.stringify(f(K.rng('x')));
ok('same seed ⇒ same rect maze', same(r => M.rect(r, 12, 12)));
ok('same seed ⇒ same round maze', same(r => M.round(r, 6)));
ok('same seed ⇒ same svg', same(r => M.svg(M.rect(r, 9, 9), 90, 104, { from: '🐭', to: '🧀', solved: true })));
ok('another seed ⇒ another maze', JSON.stringify(M.rect(K.rng('x'), 9, 9).links) !== JSON.stringify(M.rect(K.rng('y'), 9, 9).links));
for (const m of [M.rect(K.rng('s'), 12, 12), M.round(K.rng('s'), 7)]) {
  const s = M.svg(m, 90, 104, { from: '🐝', to: '🌻', solved: true });
  ok(`${m.kind}: svg renders`, s.startsWith('<svg') && s.endsWith('</svg>') && !/NaN|undefined/.test(s));
  const mm = +s.match(/width:([\d.]+)mm/)[1], vb = s.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  ok(`${m.kind}: svg fits its box`, mm <= 90.01 && mm * vb[3] / vb[2] <= 104.01, `${mm} × ${mm * vb[3] / vb[2]}`);
}
// corridors wide enough for little hands: ≥ 8 mm on 5×5, ≥ 5 mm on 12×12 and the round ones
const cell = (m, w, h) => +M.svg(m, w, h).match(/width:([\d.]+)mm/)[1] / +M.svg(m, w, h).match(/viewBox="[^ ]+ [^ ]+ ([^ ]+)/)[1];
ok('5×5 corridors ≥ 8 mm', cell(M.rect(K.rng('c'), 5, 5), 90, 104) >= 8);
ok('12×12 corridors ≥ 5 mm', cell(M.rect(K.rng('c'), 12, 12), 90, 104) >= 5);
ok('20×24 corridors ≥ 5 mm', cell(M.rect(K.rng('c'), 20, 24), 186, 226) >= 5);
ok('round 7 corridors ≥ 5 mm', cell(M.round(K.rng('c'), 7), 90, 104) >= 5);

// every language has every key the English texts have
for (const l of ['pl', 'uk', 'vi', 'fr', 'it', 'es']) {
  for (const k of Object.keys(T.en)) ok(`${l}: has ${k}`, T[l][k] !== undefined);
  for (const k of ['levels', 'themes', 'goals']) for (const id of Object.keys(T.en[k])) ok(`${l}: ${k}.${id}`, !!T[l][k][id]);
}
for (const id of M.THEME_IDS) ok(`theme ${id} has texts`, !!T.en.themes[id] && !!T.en.goals[id]);
console.log(fails ? `\n${fails} FAILED` : '\nall ok');
process.exit(fails ? 1 : 0);
