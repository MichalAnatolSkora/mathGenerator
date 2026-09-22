/**
 * Shared language helper for every page of the site. Classic script; defines the global `I18N`.
 *
 * Language choice: `?lang=xx` in the URL > saved choice (localStorage "lang") > Polish.
 * Each page keeps its own dictionary: { pl:{key: string|fn}, en:{…}, uk:{…}, vi:{…} }.
 *   I18N.t(dict, key, ...args)   → string for the current language (falls back to en, then key)
 *   I18N.apply(dict[, root])     → fills [data-i18n="key"] text and [data-i18n-attr="attr:key,…"] attributes
 *   I18N.onChange(fn)            → called with the new code after a flag is clicked
 *   I18N.get() / I18N.set(code)
 * Flags render into every element with class "langs"; links with data-keep-lang carry ?lang= along.
 */
const I18N = (() => {
  const LANGS = [
    { code: 'pl', flag: '🇵🇱', name: 'Polski' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'uk', flag: '🇺🇦', name: 'Українська' },
    { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
  ];
  const DEFAULT = 'pl', KEY = 'lang';
  const valid = c => LANGS.some(l => l.code === c);
  const save = c => { try { localStorage.setItem(KEY, c); } catch (_) { /* no storage: the URL still works */ } };
  function detect() {
    const q = new URLSearchParams(location.search).get('lang');
    if (valid(q)) { save(q); return q; }
    try { const s = localStorage.getItem(KEY); if (valid(s)) return s; } catch (_) { /* ignore */ }
    return DEFAULT;
  }
  let lang = detect();
  const listeners = [];

  const withLang = href => href.split('?')[0].split('#')[0] + (lang === DEFAULT ? '' : '?lang=' + lang);
  function decorateLinks() {
    document.querySelectorAll('a[data-keep-lang]').forEach(a => a.setAttribute('href', withLang(a.getAttribute('href'))));
  }
  function renderSwitchers() {
    document.querySelectorAll('.langs').forEach(nav => {
      nav.innerHTML = '';
      LANGS.forEach(l => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = l.flag; b.title = l.name;
        b.setAttribute('aria-label', l.name); b.setAttribute('lang', l.code);
        b.setAttribute('aria-pressed', String(l.code === lang));
        b.addEventListener('click', () => set(l.code));
        nav.appendChild(b);
      });
    });
  }
  function set(code) {
    if (!valid(code) || code === lang) return;
    lang = code; save(code);
    document.documentElement.lang = code;
    const u = new URL(location.href);
    if (code === DEFAULT) u.searchParams.delete('lang'); else u.searchParams.set('lang', code);
    history.replaceState(null, '', u);
    renderSwitchers(); decorateLinks();
    listeners.forEach(f => f(code));
  }
  const get = () => lang;
  const onChange = f => listeners.push(f);

  function t(dict, key, ...args) {
    const d = dict[lang] || {};
    const v = d[key] !== undefined ? d[key] : (dict.en || {})[key];
    if (v === undefined) return key;
    return typeof v === 'function' ? v(...args) : v;
  }
  function apply(dict, root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(dict, el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(dict, el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => { const [attr, key] = pair.split(':'); el.setAttribute(attr.trim(), t(dict, key.trim())); });
    });
  }
  /** Plural forms. pl/uk: (n, one, few, many). en: (n, one, other). vi: one form. */
  function plural(n, one, few, many) {
    if (lang === 'pl' || lang === 'uk') {
      const m10 = n % 10, m100 = n % 100;
      if (n === 1) return one;
      if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return few;
      return many;
    }
    if (lang === 'en') return n === 1 ? one : (many !== undefined ? many : few);
    return few !== undefined ? few : one;   // vi: no plural forms; callers pass the plain form as `few`
  }

  const style = document.createElement('style');
  style.textContent = '.langs{display:inline-flex;gap:2px;align-items:center}.langs button{font:inherit;font-size:20px;line-height:1;background:transparent;border:2px solid transparent;border-radius:8px;padding:3px 5px;cursor:pointer;min-width:40px;min-height:40px}.langs button:hover{border-color:#c5cbe0}.langs button[aria-pressed=true]{border-color:#4f5bd5;background:#e9ebff}';
  document.head.appendChild(style);
  document.documentElement.lang = lang;
  document.addEventListener('DOMContentLoaded', () => { renderSwitchers(); decorateLinks(); });

  return { LANGS, DEFAULT, get, set, onChange, t, apply, plural, withLang };
})();
