/**
 * Tasks for 12-year-olds — draws the engine's math text as HTML in a language. Classic script; defines the global
 * `T12M` (also exported for Node).
 *
 *   T12M.html(text, lang)   → HTML: {3/5} and {2|3/5} as stacked fractions, ? in a fraction = an empty box,
 *                             ___ = a line to write on, numbers with the language's decimal mark and thousands
 *                             separator, $ numbers as money (two decimals; Vietnamese × 10 000), * and : as the
 *                             language's signs, - as a real minus, & as the word "and", ... as an ellipsis,
 *                             $$ numbers as money with the currency
 *   T12M.money(text, lang)  → the amount with its currency: "3,60 zł", "£3.60", "36.000 đồng"
 *   T12M.FMT[lang]          → the signs of each language
 */
const T12M = (() => {
  const FMT = {
    pl: { dot: ',', th: ' ', thFrom: 10000, mul: '·', div: ':', and: 'i', cur: ['', ' zł'], scale: 1 },
    en: { dot: '.', th: ',', thFrom: 10000, mul: '×', div: '÷', and: 'and', cur: ['£', ''], scale: 1 },
    uk: { dot: ',', th: ' ', thFrom: 10000, mul: '·', div: ':', and: 'і', cur: ['', ' грн'], scale: 1, units: { cm: 'см', m: 'м', g: 'г', kg: 'кг' } },
    vi: { dot: ',', th: '.', thFrom: 10000, mul: '×', div: ':', and: 'và', cur: ['', ' đồng'], scale: 10000 },
    fr: { dot: ',', th: ' ', thFrom: 10000, mul: '×', div: ':', and: 'et', cur: ['', ' €'], scale: 1 },
    it: { dot: ',', th: '.', thFrom: 10000, mul: '×', div: ':', and: 'e', cur: ['', ' €'], scale: 1 },
    es: { dot: ',', th: '.', thFrom: 10000, mul: '×', div: ':', and: 'y', cur: ['', ' €'], scale: 1 },
  };
  const OPS = { '+': '+', '-': '−', '=': '=', '<': '&lt;', '>': '&gt;', ';': ';' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Group the thousands of a whole number. */
  function group(s, f) {
    if (s.length < String(f.thFrom).length) return s;
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, f.th);
  }
  /** One number of the math text: '4.26', '0.1(5)', '$3.6' → the language's form (without currency). */
  function num(tok, f) {
    let money = false;
    if (tok[0] === '$') { money = true; tok = tok.slice(1); }
    let [w, frac = ''] = tok.split('.');
    if (money) {
      if (f.scale !== 1) {                  // whole number of the smaller unit: 3.6 × 10 000 = 36 000
        const digits = Math.log10(f.scale);
        const all = (w + frac.padEnd(digits, '0')).replace(/^0+(?=\d)/, '');
        if (frac.length > digits) throw new Error('money ' + tok);
        return group(all, { ...f, thFrom: 1000 });
      }
      if (frac) frac = frac.padEnd(2, '0');
    }
    return group(w, f) + (frac ? f.dot + frac : '');
  }
  const NUM = /\$?\d+(?:\.\d+)?(?:\(\d+\))?|\$?\d+\.\(\d+\)/g;
  function fracHtml(body, f) {
    const [w, nd] = body.includes('|') ? body.split('|') : ['', body];
    const [n, d] = nd.split('/');
    const part = x => (x === '?' ? '<span class="bx"></span>' : esc(num(x, f)));
    return `<span class="fr">${w ? `<span class="fw">${esc(num(w, f))}</span>` : ''}<span class="fd"><span>${part(n)}</span><span>${part(d)}</span></span></span>`;
  }
  /** Numbers and fractions inside one word of the text; everything else escaped. */
  function word(tok, f) {
    let out = '', at = 0;
    const re = /\{([^}]*)\}|\$?\d+(?:\.\d*)?(?:\(\d+\))?/g;
    let m;
    while ((m = re.exec(tok))) {
      out += esc(tok.slice(at, m.index));
      out += m[1] !== undefined ? fracHtml(m[1], f) : esc(num(m[0], f));
      at = m.index + m[0].length;
    }
    out += esc(tok.slice(at));
    return out.replace(/\.\.\./g, '…');
  }
  function html(text, lang) {
    const f = FMT[lang] || FMT.en;
    return String(text).split(' ').map(tok => {
      if (tok === '___') return '<span class="bl"></span>';
      if (tok.startsWith('$$')) return money(tok.slice(1), lang);
      if (tok === '*') return f.mul;
      if (tok === ':') return f.div;
      if (tok === '&') return esc(f.and);
      if (OPS[tok]) return OPS[tok];
      if (f.units && f.units[tok]) return f.units[tok];
      return word(tok, f);
    }).join(' ').replace(/ ([;]) /g, '; ');
  }
  /** An amount of money with its currency ('$3.6' → '3,60 zł'). */
  function money(text, lang) {
    const f = FMT[lang] || FMT.en;
    const t = String(text).startsWith('$') ? String(text) : '$' + text;
    return `<span class="nw">${esc(f.cur[0])}${esc(num(t, f))}${esc(f.cur[1])}</span>`;
  }
  return { FMT, html, money, num, NUM };
})();
if (typeof module !== 'undefined') module.exports = T12M;
