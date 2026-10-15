// Run with: node print-qr.test.js
const Q = require('./print-qr.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } };

// bytes that fit at level M in versions 1–10 (ISO/IEC 18004, table 7)
const CAP = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213];
const version = m => (m.length - 17) / 4;
for (let v = 1; v <= 10; v++) {
  ok(`${CAP[v]} bytes → version ${v}`, version(Q.matrix('a'.repeat(CAP[v]))) === v);
  if (v < 10) ok(`${CAP[v] + 1} bytes → version ${v + 1}`, version(Q.matrix('a'.repeat(CAP[v] + 1))) === v + 1);
}
let threw = false;
try { Q.matrix('a'.repeat(214)); } catch (_) { threw = true; }
ok('too long text throws', threw);
ok('UTF-8: one Polish letter is two bytes', version(Q.matrix('ż'.repeat(7))) === 1 && version(Q.matrix('ż'.repeat(8))) === 2);

/** BCH remainder of the format (generator 0x537) or version (0x1F25) information. */
const bch = (v, bits, poly, deg) => { let r = v << deg; for (let i = bits + deg - 1; i >= deg; i--) if ((r >>> i) & 1) r ^= poly << (i - deg); return r; };
const URL = 'https://michalanatolskora.github.io/mathGenerator/clock/worksheet.html?seed=ABCDE-123&task=read&level=hours&n=8&key=1';
for (const text of ['A', 'https://michalanatolskora.github.io/mathGenerator/', URL, URL + '&lang=uk&more=' + 'x'.repeat(60)]) {
  const m = Q.matrix(text), n = m.length, v = version(m), name = `${text.length} chars (v${v})`;
  // the three finder patterns: dark ring, light ring, dark 3×3 centre
  for (const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]]) {
    let good = true;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) good = good && m[cy + dy][cx + dx] === (Math.max(Math.abs(dx), Math.abs(dy)) !== 2);
    ok(`${name}: finder at ${cx},${cy}`, good);
  }
  let timing = true;
  for (let i = 8; i < n - 8; i++) timing = timing && m[6][i] === (i % 2 === 0) && m[i][6] === (i % 2 === 0);
  ok(`${name}: timing patterns`, timing);
  ok(`${name}: dark module`, m[n - 8][8]);
  // format information: both copies equal, level M, valid BCH code
  const b = (x, y) => m[y][x] ? 1 : 0;
  let f1 = 0, f2 = 0;
  const pos1 = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
  pos1.forEach(([x, y], i) => { f1 |= b(x, y) << i; });
  for (let i = 0; i < 8; i++) f2 |= b(n - 1 - i, 8) << i;
  for (let i = 8; i < 15; i++) f2 |= b(8, n - 15 + i) << i;
  ok(`${name}: two equal copies of the format`, f1 === f2, `${f1} ${f2}`);
  const fmt = f1 ^ 0x5412;
  ok(`${name}: level M`, (fmt >>> 13) === 0);
  ok(`${name}: format BCH`, bch(fmt >>> 10, 5, 0x537, 10) === (fmt & 0x3FF));
  if (v >= 7) {
    let vi = 0;
    for (let i = 0; i < 18; i++) vi |= b(n - 11 + i % 3, Math.floor(i / 3)) << i;
    ok(`${name}: version information`, (vi >>> 12) === v && bch(v, 6, 0x1F25, 12) === (vi & 0xFFF));
  }
  ok(`${name}: same text ⇒ same code`, JSON.stringify(Q.matrix(text)) === JSON.stringify(m));
}
const svg = Q.svg('A');
ok('svg: 21 modules + 2×2 quiet zone', svg.includes('viewBox="0 0 25 25"'));

console.log(fails ? `${fails} failing` : 'all passed');
process.exitCode = fails ? 1 : 0;
