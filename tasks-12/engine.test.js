// Run with: node engine.test.js
const T = require('./engine.js');
const K = require('../sheet-kit/kit.js');
const MATH = require('./math.js');
const TEXT = require('./strings.js');
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; if (fails < 40) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra)); } };
const LANGS = ['pl', 'en', 'uk', 'vi', 'fr', 'it', 'es'];
const { Q, add, sub, mul, div, cmp } = T;

/* ---- a tiny exact evaluator of the math text, to check every answer-key line ---- */
function value(tok) {
  let m;
  if ((m = /^\{(?:(\d+)\|)?(\d+)\/(\d+)\}$/.exec(tok))) return add(Q(Number(m[1] || 0)), Q(Number(m[2]), Number(m[3])));
  if ((m = /^\$?(\d+)\.(\d*)\((\d+)\)$/.exec(tok))) {          // repeating decimal
    const [, w, pre, rep] = m;
    const a = Number(w + pre + rep) - Number(w + pre);
    return Q(a, Number('9'.repeat(rep.length) + '0'.repeat(pre.length)));
  }
  if (/^\$*\d+(\.\d+)?$/.test(tok)) return T.D(tok.replace(/\$/g, ''));
  return null;
}
/** Evaluate "a + b * (c - d) : e" with the usual order of operations. */
function evaluate(expr) {
  const toks = expr.match(/\{[^}]*\}|\$*\d+(?:\.\d*(?:\(\d+\))?)?|[()+\-*:]|\S+/g) || [];
  let i = 0;
  const atom = () => { const t = toks[i++]; if (t === '(') { const v = sum(); i++; return v; } const v = value(t); if (!v) throw new Error('bad token ' + t + ' in ' + expr); return v; };
  const prod = () => { let v = atom(); while (toks[i] === '*' || toks[i] === ':') { const op = toks[i++]; const w = atom(); v = op === '*' ? mul(v, w) : div(v, w); } return v; };
  const sum = () => { let v = prod(); while (toks[i] === '+' || toks[i] === '-') { const op = toks[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  if (i !== toks.length) throw new Error('left over in ' + expr);
  return v;
}
/** Every "x = y = z" chain (also "x > y", "x < y") in an answer line is true. */
function checkLine(tag, line) {
  for (const part of line.replace(/^[A-F]\. |^[a-d]\) |^\d+\. /, '').split(' ; ')) {
    const clean = part.replace(/ (cm|m)$/, '').replace(/^\d+ g = /, '');
    if (/[<>]/.test(clean)) {
      const sides = clean.split(/ ([<>]) /);
      for (let k = 0; k + 2 < sides.length; k += 2) {
        const c = cmp(evaluate(sides[k]), evaluate(sides[k + 2]));
        ok(`${tag}: ${part}`, sides[k + 1] === '<' ? c < 0 : c > 0, part);
      }
      continue;
    }
    if (!clean.includes(' = ')) continue;
    const sides = clean.split(' = ').filter(x => !x.endsWith('...'));
    if (sides.some(s => /[a-zA-Z]/.test(s.replace(/\$/g, '')))) continue;
    let vals;
    try { vals = sides.map(evaluate); } catch (e) { ok(`${tag}: parse`, false, e.message); continue; }
    ok(`${tag}: ${part}`, vals.every(v => cmp(v, vals[0]) === 0), part);
  }
}

const LET = 'ABCDEF';
for (const { id } of T.TYPES) {
  for (let i = 0; i < 400; i++) {
    const tag = `${id} #${i}`;
    const t = T.task(K.rng(`${id}|${i}`), id);
    ok(`${tag}: has answers`, Array.isArray(t.ans) && t.ans.length > 0);
    for (const a of t.ans) checkLine(tag, a);
    if (t.choices) {
      ok(`${tag}: 4 different choices`, t.choices.length === 4 && new Set(t.choices).size === 4, t.choices);
      ok(`${tag}: key letter`, t.ans[0].startsWith(LET[t.correct] + '. '), [t.ans[0], t.correct]);
      if (!/Expr$/.test(id)) {
        // the right choice is the value in the key; the others are different values
        const vals = t.choices.map(c => evaluate(c));
        ok(`${tag}: one right value`, vals.filter(v => cmp(v, vals[t.correct]) === 0).length === 1, t.choices);
        const keyVal = evaluate(t.ans[0].split(' = ').pop().replace(/ m$/, ''));
        ok(`${tag}: right choice = key`, cmp(vals[t.correct], keyVal) === 0, [t.choices, t.ans[0]]);
      } else {
        // only the right expression gives the value in the key
        const keyVal = evaluate(t.ans[0].split(' = ').pop());
        const vals = t.choices.map(c => evaluate(c));
        ok(`${tag}: right expression`, cmp(vals[t.correct], keyVal) === 0, t.ans[0]);
      }
    }
    if (t.pairs) for (const [j, p] of t.pairs.entries()) {
      const right = evaluate(p.expr.replace(' = ___', ''));
      const hits = p.opts.filter(o => cmp(evaluate(o), right) === 0).length;
      ok(`${tag}: one right option`, hits === 1, p);
      ok(`${tag}: key letter`, t.ans[j][0] === LET[2 * j + p.opts.findIndex(o => cmp(evaluate(o), right) === 0)], t.ans[j]);
    }
    if (t.tf) {
      ok(`${tag}: one true, one false`, t.tf.filter(x => x.truth).length === 1);
      for (const x of t.tf) {
        const [f, shown] = x.dsl.replace('...', '').split(' = ');
        const real = T.expand(...f.slice(1, -1).split('/').map(Number));
        const digits = shown.split('.')[1];
        const really = digits.split('').every((d, k) => Number(d) === T.digitAt(real, k + 1)) && Number(shown.split('.')[0]) === real.int;
        ok(`${tag}: truth`, really === x.truth, x);
      }
    }
    if (t.table) {
      ok(`${tag}: parts add up to 1`, cmp(t.table.map(x => value(x.fr)).reduce(add), Q(1)) === 0, t.table);
      for (const x of t.table) ok(`${tag}: fraction = decimal`, cmp(value(x.fr), value(x.de)) === 0, x);
    }
    if (t.match) {
      const R = ['I', 'II', 'III', 'IV'];
      ok(`${tag}: 6 different options`, new Set(t.match.opts).size === 6);
      t.ans.forEach((a, k) => {
        const L = a.split(' – ')[1];
        ok(`${tag}: match ${a}`, cmp(value(t.match.fracs[k]), value(t.match.opts[LET.indexOf(L)])) === 0, [t.match, a]);
        ok(`${tag}: roman`, a.startsWith(R[k] + ' '));
      });
      // every fraction matches exactly one option
      for (const f of t.match.fracs) ok(`${tag}: unique match`, t.match.opts.filter(o => cmp(value(o), value(f)) === 0).length === 1, f);
    }
    if (id === 'decToFrac') for (const [k, line] of t.lines.entries()) ok(`${tag}: blank is filled`, line.split('?').length === 2 && t.ans[k].indexOf('?') < 0);
    if (id === 'nthDigit') {
      const [n, d] = t.v.f.slice(1, -1).split('/').map(Number);
      let r = n % d, dig;
      for (let k = 0; k < t.v.k; k++) { r *= 10; dig = Math.floor(r / d); r %= d; }
      ok(`${tag}: digit by long division`, dig === t.v.digit, [t.v, dig]);
    }
    if (id === 'compareMixedDec') ok(`${tag}: lighter`, (cmp(value(t.v.f), value(t.v.u)) < 0) === (t.v.lighter === 'A'), t.v);
    if (id === 'orderNumbers') ok(`${tag}: 4 numbers`, t.lines[0].split(' ; ').length === 4);

    /* every language: text without holes, math renders */
    for (const l of LANGS) {
      const C = TEXT[l];
      const M = x => MATH.html(x, l), $ = x => MATH.money(x, l);
      const ctx = { v: t.v, M, $, name: w => C.names[w] };
      const s = C.tasks[id].q(ctx) + (C.tasks[id].a ? C.tasks[id].a(ctx) : '') + (t.lines || []).map(M).join('')
        + (t.choices || []).map(c => (t.chMoney ? $(c) : M(c))).join('') + t.ans.map(M).join('');
      ok(`${tag} ${l}: text`, !/undefined|NaN|\[object|\{|\}|\$|\*/.test(s), s.slice(0, 300));
      if (l === 'vi') ok(`${tag} vi: money is whole đồng`, !/\d,\d+ đồng/.test(s), s);
    }
  }
  console.log(`ok   ${id}`);
}

/* the renderer */
ok('pl decimal', MATH.html('4.26 * 0.5', 'pl') === '4,26 · 0,5', MATH.html('4.26 * 0.5', 'pl'));
ok('en decimal', MATH.html('4.26 : 0.5', 'en') === '4.26 ÷ 0.5');
ok('money pl', MATH.money('$3.6', 'pl').includes('3,60 zł'), MATH.money('$3.6', 'pl'));
ok('money en', MATH.money('$3.6', 'en').includes('£3.60'));
ok('money vi', MATH.money('$3.6', 'vi').includes('36.000 đồng'), MATH.money('$3.6', 'vi'));
ok('money vi small', MATH.money('$0.12', 'vi').includes('1.200 đồng'), MATH.money('$0.12', 'vi'));
ok('periodic', MATH.html('0.1(5)', 'pl') === '0,1(5)', MATH.html('0.1(5)', 'pl'));
ok('fraction', /class="fr"/.test(MATH.html('{2|3/5}', 'pl')));
ok('box', /class="bx"/.test(MATH.html('{7|?/1000}', 'pl')));
ok('minus', MATH.html('5 - 3', 'pl') === '5 − 3');
ok('thousands', MATH.html('12345', 'pl') === '12 345', MATH.html('12345', 'pl'));
ok('money with currency', MATH.html('= $$7.2', 'pl').includes('7,20 zł'), MATH.html('= $$7.2', 'pl'));
ok('ellipsis', MATH.html('0.29...', 'fr') === '0,29…');

/* sheets */
for (const topic of ['mix', 'nat', 'frac', 'ops', 'dec', 'all']) {
  for (let i = 0; i < 200; i++) {
    const ids = T.sheet(`S${i}`, topic);
    ok(`${topic}: known ids`, ids.every(id => T.TYPES.some(x => x.id === id)));
    if (topic === 'mix') {
      ok('mix: 8 tasks', ids.length === 8, ids);
      ok('mix: at most one big task', ids.filter(id => T.BIG.includes(id)).length <= 1, ids);
      ok('mix: in test order', ids.every((id, k) => !k || T.TYPES.findIndex(x => x.id === id) > T.TYPES.findIndex(x => x.id === ids[k - 1])), ids);
    }
  }
}
// the mixed page uses every kind of task now and then
const seen = new Set();
for (let i = 0; i < 400; i++) for (const id of T.sheet(`S${i}`, 'mix')) seen.add(id);
ok('mix: every kind appears', seen.size === T.TYPES.length, T.TYPES.filter(x => !seen.has(x.id)).map(x => x.id));
ok('all: 30 tasks', T.sheet('X', 'all').length === 30);
// same seed ⇒ same task
ok('deterministic', JSON.stringify(T.task(K.rng('a'), 'priceCompare')) === JSON.stringify(T.task(K.rng('a'), 'priceCompare')));

console.log(fails ? `${fails} FAILED` : 'all ok');
process.exit(fails ? 1 : 0);
