/**
 * Tasks for 12-year-olds — engine. Classic script; defines the global `T12` (also exported for Node:
 * `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) for the random helpers.
 *
 * Thirty kinds of tasks in four sections, after a typical Polish grade 5–6 test "Numbers and operations":
 *   nat  — natural numbers: mental + and −, written × and :, product and quotient, which expression fits a story
 *   frac — fractions and decimals: fraction as division, decimal ↔ fraction, comparing, a table, matching,
 *          repeating decimals, the n-th digit, ordering
 *   ops  — operations on fractions and mixed numbers, order of operations, the mean
 *   dec  — decimals and everyday problems: inches, curtains, a part of a book, a sale, price per gram
 *
 * The engine draws the numbers and works out the answers with exact fractions; the words come from strings.js.
 * Math is passed as a tiny text format (rendered by math.js for every language):
 *   numbers 12, 4.26, 0.1(5) (repeating part in brackets), $3.60 (money: Vietnamese multiplies it by 10 000),
 *   $$3.60 money with its currency (3,60 zł, £3.60)
 *   {3/5} a fraction, {2|3/5} a mixed number, ? inside a fraction = an empty box, ___ = a line to write on,
 *   + - * : = < > as whole words (* and : become the language's × or ·, : or ÷), & = the word "and".
 *
 *   T12.TYPES                  → [{ id, sec }] in the order of the test (1–30)
 *   T12.SECTIONS               → ['nat', 'frac', 'ops', 'dec']
 *   T12.task(rnd, id)          → { id, sec, v, lines?, pairs?, choices?, correct?, row?, chMoney?, table?, match?,
 *                                  tf?, ans, work }   (work: weight of the squared paper for the working, 0 = none;
 *                                  the page shares its free space among the tasks by this weight)
 *   T12.sheet(seed, topic)     → the list of task ids of a sheet: topic mix | nat | frac | ops | dec | all
 */
const T12 = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');

  /* ---------- exact fractions ---------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const k = gcd(n, d) || 1; return { n: n / k, d: d / k }; };
  const add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
  const sub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (a, b) => Q(a.n * b.n, a.d * b.d);
  const div = (a, b) => Q(a.n * b.d, a.d * b.n);
  const cmp = (a, b) => a.n * b.d - b.n * a.d;
  /** '4.26' → 426/100 */
  const D = s => { const [w, f = ''] = String(s).split('.'); return Q(Number(w + f), 10 ** f.length); };
  const terminates = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  /** A terminating fraction as a decimal: 21/4 → '5.25'. */
  function dec(q) {
    if (!terminates(q.d)) throw new Error(`${q.n}/${q.d} is not a terminating decimal`);
    let k = 0, p = 1;
    while (p % q.d) { p *= 10; k++; }
    let s = String(Math.abs(q.n * (p / q.d)));
    if (k) { s = s.padStart(k + 1, '0'); s = s.slice(0, -k) + '.' + s.slice(-k); }
    return (q.n < 0 ? '-' : '') + s;
  }
  /** As a fraction (or a whole number): '{7/4}' */
  const fr = q => (q.d === 1 ? String(q.n) : `{${q.n}/${q.d}}`);
  /** As a mixed number: '{1|3/4}' */
  function mx(q) {
    if (q.d === 1) return String(q.n);
    const w = Math.floor(q.n / q.d);
    return w ? `{${w}|${q.n - w * q.d}/${q.d}}` : `{${q.n}/${q.d}}`;
  }
  const M = (w, n, d) => Q(w * d + n, d);   // mixed number w n/d
  /** Long division: n/d = int . pre (rep) */
  function expand(n, d) {
    const int = Math.floor(n / d);
    let r = n % d;
    const digits = [], seen = new Map();
    while (r && !seen.has(r)) { seen.set(r, digits.length); r *= 10; digits.push(Math.floor(r / d)); r %= d; }
    if (!r) return { int, pre: digits, rep: [] };
    const at = seen.get(r);
    return { int, pre: digits.slice(0, at), rep: digits.slice(at) };
  }
  const periodic = e => `${e.int}.${e.pre.join('')}(${e.rep.join('')})`;
  /** The k-th digit after the point (k from 1). */
  const digitAt = (e, k) => (k <= e.pre.length ? e.pre[k - 1] : e.rep[(k - 1 - e.pre.length) % e.rep.length]);
  /** The first k digits after the point, as a decimal string without rounding. */
  const firstDigits = (e, k) => `${e.int}.${Array.from({ length: k }, (_, j) => digitAt(e, j + 1)).join('')}`;

  /* ---------- helpers ---------- */
  const LET = 'ABCDEF';
  const int = (r, a, b) => K.int(r, a, b);
  const pick = (r, a) => K.pick(r, a);
  /** Shuffle the right answer among the wrong ones: { choices, correct } */
  function choose(r, right, wrong) {
    const all = K.shuffle(r, [right, ...wrong]);
    return { choices: all, correct: all.indexOf(right) };
  }
  /** Distinct values only (the right one first), filled up to n with right ± step. */
  function distinct(right, cands, n, step, ok = x => x.n > 0) {
    const out = [right];
    for (const c of cands) if (ok(c) && !out.some(x => cmp(x, c) === 0)) out.push(c);
    for (let k = 1; out.length < n; k++) for (const c of [add(right, mul(step, Q(k))), sub(right, mul(step, Q(k)))]) if (out.length < n && ok(c) && !out.some(x => cmp(x, c) === 0)) out.push(c);
    return out.slice(0, n);
  }

  /* ---------- the thirty kinds ---------- */
  const GEN = {
    /* 1. mental + and −, two answers each */
    mentalAS(r) {
      let a, b;
      do { a = int(r, 100, 699) * 10; b = int(r, 31, 98) * 10; } while ((a / 10) % 100 + (b / 10) % 100 < 100 || b % 100 === 0);
      let c, e;
      do { c = int(r, 200, 950) * 10; e = int(r, 101, c / 10 - 60) * 10; } while ((c / 10) % 10 >= (e / 10) % 10);
      const s = a + b, d = c - e;
      const p1 = K.shuffle(r, [s, s + pick(r, [100, -100])]), p2 = K.shuffle(r, [d, d + pick(r, [20, -20, 100])]);
      return {
        pairs: [{ expr: `${a} + ${b} = ___`, opts: p1.map(String) }, { expr: `${c} - ${e} = ___`, opts: p2.map(String) }],
        ans: [`${LET[p1.indexOf(s)]}. ${a} + ${b} = ${s}`, `${LET[2 + p2.indexOf(d)]}. ${c} - ${e} = ${d}`], work: 0,
      };
    },
    /* 2. two prices, the sum and the difference */
    sumDiff(r) {
      const x = int(r, 6, 40), d = int(r, 2, 9), S = 2 * x + d;
      return { v: { S: `$${S}`, d: `$${d}`, x: `$${x}`, y: `$${x + d}` }, ans: [`($${S} - $${d}) : 2 = $$${x}`, `$${x} + $${d} = $$${x + d}`], work: 25 };
    },
    /* 3. written × and :, two answers each */
    mulDiv(r) {
      const a = int(r, 13, 49), b = int(r, 12, 29), p = a * b;
      const q = int(r, 12, 39), e = int(r, 11, 19), c = q * e;
      const p1 = K.shuffle(r, [p, p + pick(r, [40, -40, 100, -10])]), p2 = K.shuffle(r, [q, q + pick(r, [1, -1])]);
      return {
        pairs: [{ expr: `${a} * ${b} = ___`, opts: p1.map(String) }, { expr: `${c} : ${e} = ___`, opts: p2.map(String) }],
        ans: [`${LET[p1.indexOf(p)]}. ${a} * ${b} = ${p}`, `${LET[2 + p2.indexOf(q)]}. ${c} : ${e} = ${q}`], work: 25,
      };
    },
    /* 4. product and quotient of two pairs */
    prodQuot(r) {
      const pairs = [];
      while (pairs.length < 2) {
        const b = int(r, 2, 9), k = int(r, 5, 33), a = b * k;
        if (a >= 20 && a <= 99 && !pairs.some(p => p[1] === b)) pairs.push([a, b]);
      }
      return {
        lines: pairs.map(([a, b], j) => `${'ab'[j]}) ${a} & ${b}`),
        ans: pairs.map(([a, b], j) => `${'ab'[j]}) ${a} * ${b} = ${a * b} ; ${a} : ${b} = ${a / b}`), work: 15,
      };
    },
    /* 5. which expression gives the cost of the shopping */
    shopExpr(r) {
      const k = pick(r, [2, 2, 3, 4]), p = k * int(r, 2, 5), n = int(r, 5, 19), m = int(r, 5, 12);
      const right = `${n} * $${p} + ${m} * $${p} : ${k}`;
      const c = choose(r, right, [`$${p} * $${p} : ${k} + ${n} * ${m}`, `$${p} * ${k} + ${n} * ${m}`, `${n} * $${p} + ${m} * ${k}`]);
      return { v: { n, m, p: `$${p}`, k }, ...c, ans: [`${LET[c.correct]}. ${right} = $$${n * p + m * p / k}`], work: 0 };
    },
    /* 6. which expression gives the pages left */
    pagesExpr(r) {
      const k = pick(r, [2, 3, 4]), a = k * int(r, 8, 24), d = int(r, 2, 6);
      const read = a + 2 * (a / k) - d, N = read + int(r, 60, 240);
      const t = `${a} + ${a} : ${k}`;
      const right = `${N} - (${t} + ${a} : ${k} - ${d})`;
      const c = choose(r, right, [`${t} + ${a} - ${d}`, `${t} + ${a} : ${k} - ${d}`, `${N} - (${t} + ${a} - ${d})`]);
      return { v: { N, a, k, d }, ...c, ans: [`${LET[c.correct]}. ${right} = ${N - read}`], work: 0 };
    },
    /* 7. a fraction as a division */
    fracAsDiv(r) {
      const fs = [];
      while (fs.length < 2) { const d = int(r, 4, 20), n = int(r, 1, 30); if (n !== d && !fs.some(f => f[1] === d)) fs.push([n, d]); }
      return { lines: fs.map(([n, d]) => `{${n}/${d}} = ___`), ans: fs.map(([n, d]) => `{${n}/${d}} = ${n} : ${d}`), work: 0 };
    },
    /* 8. a decimal as a fraction, one number missing */
    decToFrac(r) {
      const a = int(r, 1, 9);
      const w2 = int(r, 2, 9); let b; do b = int(r, 11, 99); while (b % 10 === 0);
      const w3 = int(r, 1, 9); let c; do c = int(r, 11, 99); while (c % 10 === 0);
      const w4 = int(r, 2, 99), q = pick(r, [2, 4, 5, 20, 25]);
      let n4; do n4 = int(r, 1, q - 1); while (gcd(n4, q) !== 1);
      const d4 = dec(Q(n4, q)).slice(2);
      return {
        lines: [`0.0${a} = {?/100}`, `${w2}.${b} = {${w2}|?/1000}`, `${w3}.0${c} = {${w3}|${c}/?}`, `${w4}.${d4} = {${w4}|?/${q}}`],
        ans: [`0.0${a} = {${a}/100}`, `${w2}.${b} = {${w2}|${b * 10}/1000}`, `${w3}.0${c} = {${w3}|${c}/1000}`, `${w4}.${d4} = {${w4}|${n4}/${q}}`], work: 0,
      };
    },
    /* 9. compare a mixed number and a decimal */
    compareMixedDec(r) {
      const w = int(r, 1, 5), c = pick(r, [4, 5, 8, 20, 25]);
      let b; do b = int(r, 1, c - 1); while (gcd(b, c) !== 1);
      const k = c <= 5 ? pick(r, [1, 2]) : 1;               // 2 1/4 may be shown as 2 2/8
      const v = M(w, b, c);
      const step = pick(r, [Q(1, 100), Q(2, 100), Q(5, 100), Q(1, 1000)]);
      const u = pick(r, [add(v, step), sub(v, step)]);
      const lighter = cmp(v, u) < 0 ? 'A' : 'B';
      return {
        v: { f: `{${w}|${b * k}/${c * k}}`, u: dec(u), lighter },
        ans: [`{${w}|${b * k}/${c * k}} = ${dec(v)}`, `${dec(v)} ${lighter === 'A' ? '<' : '>'} ${dec(u)}`], work: 20,
      };
    },
    /* 10. a table of parts: fraction ↔ decimal */
    fracTable(r) {
      const D0 = pick(r, [16, 20, 25, 32, 40, 50, 64]);
      let cuts;
      do cuts = [...new Set(Array.from({ length: 5 }, () => int(r, 1, D0 - 1)))].sort((a, b) => a - b); while (cuts.length < 5);
      const counts = [cuts[0], ...cuts.slice(1).map((x, j) => x - cuts[j]), D0 - cuts[4]];
      const giveFrac = K.shuffle(r, [true, true, true, false, false, false]);
      const rows = counts.map((n, j) => ({ fr: fr(Q(n, D0)), de: dec(Q(n, D0)), given: giveFrac[j] ? 'fr' : 'de' }));
      return { table: rows, ans: rows.map((x, j) => `${j + 1}. ${x.fr} = ${x.de}`), work: 0 };
    },
    /* 11. who paid more and by how much */
    priceCompare(r) {
      for (;;) {
        const c = pick(r, [2, 3, 4, 5]), p = 10 * c * int(r, 5, 25);    // price per kg in grosze, divisible by c
        const w = int(r, 1, 3);
        let b; do b = int(r, 1, c - 1); while (gcd(b, c) !== 1);
        const mA = M(w, b, c), g = int(r, 1, 9) * 100, mB = Q(w * 1000 + g, 1000);
        if (cmp(mA, mB) === 0) continue;
        const P = Q(p, 100), costA = mul(P, mA), costB = mul(P, mB);
        const more = cmp(costA, costB) > 0 ? 'A' : 'B';
        const diff = more === 'A' ? sub(costA, costB) : sub(costB, costA);
        if (!terminates(costA.d) || !terminates(costB.d) || costB.d > 100) continue;
        return {
          v: { p: `$${dec(P)}`, m: mx(mA), kg: w, g, more, diff: `$${dec(diff)}` },
          ans: [`$${dec(P)} * ${mx(mA)} = $$${dec(costA)}`, `$${dec(P)} * ${dec(mB)} = $$${dec(costB)}`, more === 'A' ? `$${dec(costA)} - $${dec(costB)} = $$${dec(diff)}` : `$${dec(costB)} - $${dec(costA)} = $$${dec(diff)}`],
          work: 25,
        };
      }
    },
    /* 12. match fractions with equal decimals */
    matchFracDec(r) {
      const [s1, s2] = pick(r, [[15, 5], [15, 3], [25, 5], [35, 7], [45, 9], [12, 4], [24, 8], [75, 5]]);
      const vals = [2, 3, 4].map(e => Q(s1, 10 ** e)).concat([1, 2, 3].map(e => Q(s2, 10 ** e))).sort(cmp);
      const opts = vals.map(dec);
      const which = K.shuffle(r, [0, 1, 2, 3, 4, 5]).slice(0, 4);
      const fracs = [];
      for (const j of which) {
        const q = vals[j];
        let f;
        for (let t = 0; t < 30; t++) {
          const k = pick(r, [1, 3, 5, 9, 15, 30, 45]), n = q.n * k, d = q.d * k;
          const pow10 = /^10*$/.test(String(d));
          if (!pow10 && d <= 20000 && !fracs.some(x => x === `{${n}/${d}}`)) { f = `{${n}/${d}}`; break; }
        }
        if (!f) f = `{${q.n * 3}/${q.d * 3}}`;
        fracs.push(f);
      }
      const R = ['I', 'II', 'III', 'IV'];
      return { match: { fracs, opts }, ans: which.map((j, k) => `${R[k]} – ${LET[j]}`), work: 0 };
    },
    /* 13. true or false: repeating decimals */
    trueFalse(r) {
      const pool = [[2, 9], [7, 12], [5, 6], [1, 3], [4, 11], [5, 12], [7, 15], [1, 6], [2, 3], [7, 9], [3, 11], [11, 12], [8, 15], [1, 7], [5, 18], [13, 30]];
      const two = K.shuffle(r, pool).slice(0, 2);
      const truth = K.shuffle(r, [true, false]);
      const rows = two.map(([n, d], j) => {
        const e = expand(n, d);
        const real = firstDigits(e, 5);
        let shown = real;
        if (!truth[j]) {
          const bad = pick(r, [`0.${n}${d}`, `0.${d}${n}`]);   // the classic slip: write the digits of the fraction
          shown = bad !== real.slice(0, bad.length) && bad.length <= 7 ? bad : `${e.int}.${[digitAt(e, 1), (digitAt(e, 2) + 1) % 10, digitAt(e, 3)].join('')}`;
        }
        return { dsl: `{${n}/${d}} = ${shown}...`, truth: truth[j], real: periodic(e) };
      });
      return { tf: rows, ans: rows.map((x, j) => `${LET[j]}. ${x.dsl.split(' = ')[0]} = ${x.real}`), work: 0 };
    },
    /* 14. repeating decimals in bracket notation */
    decExpansion(r) {
      const mixedDen = pick(r, [6, 12, 15, 18, 22, 30, 36, 45, 55, 60]), pureDen = pick(r, [3, 9, 11, 27, 33, 63, 99]);
      const fs = [mixedDen, pureDen].map(d => {
        let n; do n = int(r, 1, d - 1); while (terminates(Q(n, d).d) || expand(n, d).rep.length > 6);
        return [n, d];
      });
      return { lines: fs.map(([n, d]) => `{${n}/${d}} = ___`), ans: fs.map(([n, d]) => `{${n}/${d}} = ${periodic(expand(n, d))}`), work: 15 };
    },
    /* 15. the n-th digit after the point */
    nthDigit(r) {
      const d = pick(r, [7, 11, 13, 27, 37, 33]);
      let n; do n = int(r, 1, d - 1); while (gcd(n, d) !== 1);
      const k = int(r, 6, 40), e = expand(n, d);
      return { v: { f: `{${n}/${d}}`, k, digit: digitAt(e, k) }, ans: [`{${n}/${d}} = ${periodic(e)} = ${firstDigits(e, Math.min(k + 2, 14))}...`], work: 15 };
    },
    /* 16. order decimals and mixed numbers */
    orderNumbers(r) {
      const w = int(r, 1, 9);
      for (;;) {
        const nums = [];
        nums.push({ q: Q(w * 10 + int(r, 1, 9), 10), s: null });
        nums.push({ q: Q(w * 100 + int(r, 11, 99), 100), s: null });
        for (let j = 0; j < 2; j++) { const c = pick(r, [3, 4, 5, 6, 8]); let b; do b = int(r, 1, c - 1); while (gcd(b, c) !== 1); nums.push({ q: M(w, b, c), s: `{${w}|${b}/${c}}` }); }
        for (const x of nums) if (!x.s) x.s = dec(x.q);
        if (new Set(nums.map(x => x.q.n / x.q.d)).size < 4) continue;
        const desc = r() < 0.6;
        const shown = K.shuffle(r, nums);
        const sorted = nums.slice().sort((a, b) => (desc ? -cmp(a.q, b.q) : cmp(a.q, b.q)));
        return { v: { desc }, lines: [shown.map(x => x.s).join(' ; ')], ans: [sorted.map(x => x.s).join(desc ? ' > ' : ' < ')], work: 15 };
      }
    },
    /* 17. add and subtract fractions with the same denominator */
    fracAddSame(r) {
      const d1 = int(r, 3, 12), a = int(r, 1, d1 - 1), b = int(r, 1, d1 - 1);
      const d2 = int(r, 4, 12); let c, e; do { c = int(r, 2, d2 * 2); e = int(r, 1, c - 1); } while (c % d2 === 0);
      return {
        lines: [`{${a}/${d1}} + {${b}/${d1}} = ___`, `{${c}/${d2}} - {${e}/${d2}} = ___`],
        ans: [`{${a}/${d1}} + {${b}/${d1}} = ${mx(Q(a + b, d1))}`, `{${c}/${d2}} - {${e}/${d2}} = ${mx(Q(c - e, d2))}`], work: 0,
      };
    },
    /* 18. multiply fractions */
    fracMul(r) {
      const L = [];
      for (let j = 0; j < 2; j++) {
        const b = int(r, 2, 9), a = int(r, 1, b - 1), d = int(r, 2, 9), c = int(r, 1, 9);
        const x = j ? `${int(r, 2, 6)}` : `{${a}/${b}}`;
        L.push([x, `{${c}/${d}}`, mul(j ? Q(Number(x)) : Q(a, b), Q(c, d))]);
      }
      return { lines: L.map(([x, y]) => `${x} * ${y} = ___`), ans: L.map(([x, y, z]) => `${x} * ${y} = ${mx(z)}`), work: 15 };
    },
    /* 19. divide by a fraction */
    fracDivide(r) {
      const w = int(r, 1, 5), b = int(r, 3, 9); let a; do a = int(r, 1, b - 1); while (gcd(a, b) !== 1);
      const d = int(r, 2, 9), c = int(r, 1, d - 1), f = int(r, 2, 9), e = int(r, 1, f - 1);
      return {
        lines: [`${w} : {${a}/${b}} = ___`, `{${c}/${d}} : {${e}/${f}} = ___`],
        ans: [`${w} : {${a}/${b}} = ${w} * {${b}/${a}} = ${mx(div(Q(w), Q(a, b)))}`, `{${c}/${d}} : {${e}/${f}} = {${c}/${d}} * {${f}/${e}} = ${mx(div(Q(c, d), Q(e, f)))}`], work: 15,
      };
    },
    /* 20. the whole from a part */
    wholeFromPart(r) {
      const [k, n] = pick(r, [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [2, 5], [3, 5]]);
      let m; do m = k * int(r, 2, 20); while (m * n / k > 36 || m * n / k < 12 || m < 5);
      const T = m * n / k;
      const opts = distinct(Q(T), [Q(m + n), Q(m * k), Q(T + n), add(Q(m), Q(T, n))], 4, Q(1), x => x.d === 1 && x.n > m);
      const c = choose(r, String(T), opts.slice(1).map(x => String(x.n)));
      return { v: { m, f: `{${k}/${n}}` }, ...c, row: true, ans: [`${LET[c.correct]}. ${m} : {${k}/${n}} = ${T}`], work: 0 };
    },
    /* 21. order of operations with mixed numbers */
    mixedOpsOrder(r) {
      for (;;) {
        const b = pick(r, [2, 3, 4, 5, 6]), d = pick(r, [2, 3, 4, 5]);
        const y = M(int(r, 1, 2), int(r, 1, b - 1), b), z = M(1, int(r, 1, d - 1), d), p = mul(y, z);
        if (p.d > 20 || p.d === 1) continue;
        const bx = pick(r, [b, p.d]);
        const x = M(Math.floor(p.n / p.d) + int(r, 1, 3), int(r, 1, bx - 1), bx);
        const res = sub(x, p);
        if (cmp(res, Q(0)) <= 0 || res.d > 40) continue;
        const e = `${mx(x)} - ${mx(y)} * ${mx(z)}`;
        return { lines: [`${e} = ___`], ans: [`${mx(x)} - ${mx(p)} = ${mx(res)}`], work: 25 };
      }
    },
    /* 22. add and subtract mixed numbers, different denominators */
    mixedAddSub(r) {
      for (;;) {
        const ds = K.shuffle(r, [2, 3, 4, 5, 6, 8, 9, 10]).slice(0, 3);
        if (ds.reduce(lcm) > 72) continue;
        const ms = ds.map(d => { let n; do n = int(r, 1, d - 1); while (gcd(n, d) !== 1); return M(int(r, 1, 5), n, d); });
        const res = sub(add(ms[0], ms[1]), ms[2]);
        if (cmp(res, Q(1)) < 0) continue;
        return { lines: [`${mx(ms[0])} + ${mx(ms[1])} - ${mx(ms[2])} = ___`], ans: [`${mx(add(ms[0], ms[1]))} - ${mx(ms[2])} = ${mx(res)}`], work: 25 };
      }
    },
    /* 23. the mean of three distances */
    averageExpr(r) {
      const ds = K.shuffle(r, [2, 3, 4, 5]).slice(0, 3);
      const ms = ds.map(d => { let n; do n = int(r, 1, d - 1); while (gcd(n, d) !== 1); return M(int(r, 25, 70), n, d); });
      const avg = div(ms.reduce(add), Q(3));
      return { v: { a: mx(ms[0]), b: mx(ms[1]), c: mx(ms[2]) }, ans: [`(${ms.map(mx).join(' + ')}) : 3 = ${mx(avg)}`], work: 15 };
    },
    /* 24. decimals with brackets */
    decParen(r) {
      const a = Q(int(r, 101, 999), 100), b = Q(int(r, 11, 199), 10), c = pick(r, [Q(1, 2), Q(1, 5), Q(2, 5), Q(3, 2), Q(5, 2), Q(1, 4)]);
      const s = add(a, b);
      return { lines: [`(${dec(a)} + ${dec(b)}) * ${dec(c)} = ___`], ans: [`${dec(s)} * ${dec(c)} = ${dec(mul(s, c))}`], work: 20 };
    },
    /* 25. inches to centimetres */
    inches(r) {
      const n = pick(r, [14, 19, 24, 27, 32, 40, 43, 50, 55, 65]);
      return { v: { n }, ans: [`${n} * 2.54 = ${dec(mul(Q(n), D('2.54')))} cm`], work: 20 };
    },
    /* 26. order of operations with decimals */
    decOrderOps(r) {
      const b = int(r, 2, 9), q = Q(int(r, 1, 19), 10), a = mul(q, Q(b));
      const c = Q(int(r, 11, 49), 10), d = Q(int(r, 1, 19), 10);
      return { lines: [`${dec(a)} : ${b} + ${dec(c)} + ${dec(d)} = ___`], ans: [`${dec(q)} + ${dec(c)} + ${dec(d)} = ${dec(add(add(q, c), d))}`], work: 20 };
    },
    /* 27. curtain: half a door, so many times the whole door */
    curtain(r) {
      const h = pick(r, [Q(3, 4), Q(1), Q(5, 4), Q(3, 2)]), rr = M(int(r, 2, 3), 1, 2), whole = mul(h, Q(2));
      const right = mul(whole, rr);
      const opts = distinct(right, [mul(h, rr), mul(whole, Q(Math.floor(rr.n / rr.d))), add(whole, rr)], 4, Q(1, 2));
      const c = choose(r, mx(right), opts.slice(1).map(mx));
      return { v: { h: dec(h), r: mx(rr) }, ...c, row: true, ans: [`${LET[c.correct]}. 2 * ${dec(h)} = ${dec(whole)} ; ${dec(whole)} * ${mx(rr)} = ${mx(right)} m`], work: 0 };
    },
    /* 28. a fraction of a book */
    fracOfQty(r) {
      const [k, n] = pick(r, [[1, 4], [3, 4], [1, 3], [2, 3], [2, 5], [3, 5], [5, 6], [3, 8]]);
      const N = n * int(r, 20, 60), part = N / n * k;
      const opts = distinct(Q(part), [Q(N - part), Q(N / n), Q(N, 2), Q(N, k)], 4, Q(n), x => x.d === 1 && x.n > 0 && x.n < N);
      const c = choose(r, String(part), opts.slice(1).map(x => String(x.n)));
      return { v: { N, f: `{${k}/${n}}` }, ...c, row: true, ans: [`${LET[c.correct]}. ${N} : ${n} * ${k} = ${part}`], work: 0 };
    },
    /* 29. a sale: the price lowered by 0.3 of it */
    discount(r) {
      const P = int(r, 3, 19) * 100, rr = Q(int(r, 1, 4), 10), cut = mul(Q(P), rr), right = sub(Q(P), cut);
      const opts = distinct(right, [cut, sub(Q(P), mul(cut, Q(2))), sub(Q(P), Q(rr.n * 10))], 4, Q(50));
      const c = choose(r, `$${dec(right)}`, opts.slice(1).map(x => `$${dec(x)}`));
      return { v: { P: `$${P}`, r: dec(rr) }, ...c, row: true, chMoney: true, ans: [`${LET[c.correct]}. $${P} - ${dec(rr)} * $${P} = $${P} - $${dec(cut)} = $$${dec(right)}`], work: 0 };
    },
    /* 30. price per kg → price of some grams */
    unitPrice(r) {
      const g = pick(r, [100, 200, 250, 500, 750]), p = pick(r, [8, 12, 16, 20, 24, 28, 32, 36, 40]);
      const right = mul(Q(p), Q(g, 1000));
      const opts = distinct(right, [sub(Q(p), right), mul(right, Q(2)), Q(p, 2), add(right, Q(p, 10))], 4, Q(1), x => x.n > 0 && cmp(x, Q(p)) < 0 && terminates(x.d));
      const c = choose(r, `$${dec(right)}`, opts.slice(1).map(x => `$${dec(x)}`));
      return { v: { p: `$${p}`, g }, ...c, row: true, chMoney: true, ans: [`${LET[c.correct]}. ${g} g = ${dec(Q(g, 1000))} kg ; ${dec(Q(g, 1000))} * $${p} = $$${dec(right)}`], work: 0 };
    },
  };

  const SECTIONS = ['nat', 'frac', 'ops', 'dec'];
  const BY_SEC = {
    nat: ['mentalAS', 'sumDiff', 'mulDiv', 'prodQuot', 'shopExpr', 'pagesExpr'],
    frac: ['fracAsDiv', 'decToFrac', 'compareMixedDec', 'fracTable', 'priceCompare', 'matchFracDec', 'trueFalse', 'decExpansion', 'nthDigit', 'orderNumbers'],
    ops: ['fracAddSame', 'fracMul', 'fracDivide', 'wholeFromPart', 'mixedOpsOrder', 'mixedAddSub', 'averageExpr'],
    dec: ['decParen', 'inches', 'decOrderOps', 'curtain', 'fracOfQty', 'discount', 'unitPrice'],
  };
  const TYPES = SECTIONS.flatMap(sec => BY_SEC[sec].map(id => ({ id, sec })));
  const SEC_OF = Object.fromEntries(TYPES.map(t => [t.id, t.sec]));
  /** Big tasks: at most one of them on the mixed page. */
  const BIG = ['fracTable', 'matchFracDec', 'shopExpr', 'pagesExpr'];
  /** How many tasks of each section the mixed page takes. */
  const MIX = { nat: 2, frac: 2, ops: 2, dec: 2 };

  function task(rnd, id) {
    if (!GEN[id]) throw new Error('unknown task ' + id);
    const t = GEN[id](rnd);
    return { id, sec: SEC_OF[id], v: {}, ...t };
  }
  /** The ids of a sheet, in the order of the test. */
  function sheet(seed, topic) {
    if (topic === 'all') return TYPES.map(t => t.id);
    if (BY_SEC[topic]) return BY_SEC[topic].slice();
    if (topic !== 'mix') throw new Error('unknown topic ' + topic);
    const r = K.rng(`${seed}|mix`);
    const out = [];
    let big = 0;
    for (const sec of SECTIONS) {
      const chosen = [];
      for (const id of K.shuffle(r, BY_SEC[sec])) {
        if (chosen.length === MIX[sec]) break;
        if (BIG.includes(id)) { if (big) continue; big++; }
        chosen.push(id);
      }
      out.push(...chosen.sort((a, b) => BY_SEC[sec].indexOf(a) - BY_SEC[sec].indexOf(b)));
    }
    return out;
  }

  return { TYPES, SECTIONS, BY_SEC, BIG, MIX, task, sheet, Q, add, sub, mul, div, cmp, dec, mx, expand, periodic, digitAt, D };
})();
if (typeof module !== 'undefined') module.exports = T12;
