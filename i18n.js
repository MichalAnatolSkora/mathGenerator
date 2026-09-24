/**
 * Shared language helper for every page of the site. Classic script; defines the global `I18N`.
 *
 * Language choice: `?lang=xx` in the URL > saved choice (localStorage "lang") > Polish.
 * Each page keeps its own dictionary: { pl:{key: string|fn}, en:{…}, uk:{…}, vi:{…}, fr:{…} }.
 *   I18N.t(dict, key, ...args)   → string for the current language (falls back to en, then key)
 *   I18N.apply(dict[, root])     → fills [data-i18n="key"] text and [data-i18n-attr="attr:key,…"] attributes
 *   I18N.onChange(fn)            → called with the new code after another language is picked
 *   I18N.get() / I18N.set(code)
 * A language dropdown renders into every element with class "langs"; links with data-keep-lang carry ?lang= along.
 */
const I18N = (() => {
  const LANGS = [
    { code: 'pl', flag: '🇵🇱', name: 'Polski' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'uk', flag: '🇺🇦', name: 'Українська' },
    { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
  ];
  /** Accessible name of the page-language dropdown, in each language. */
  const LABEL = { pl: 'Język', en: 'Language', uk: 'Мова', vi: 'Ngôn ngữ', fr: 'Langue' };
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

  /** Same link with the current language in ?lang= (other query parameters are kept). */
  const withLang = href => {
    const [base, q = ''] = href.split('#')[0].split('?');
    const p = new URLSearchParams(q);
    if (lang === DEFAULT) p.delete('lang'); else p.set('lang', lang);
    const qs = p.toString();
    return base + (qs ? '?' + qs : '');
  };
  function decorateLinks() {
    document.querySelectorAll('a[data-keep-lang]').forEach(a => a.setAttribute('href', withLang(a.getAttribute('href'))));
  }
  /** Render a language dropdown (flag + name) into `nav` for any language value (used for the page
   *  language and, in Cipher Detective, for the separate message language). Called again, it only
   *  updates the existing dropdown, so keyboard focus stays put. The accessible name is `label`,
   *  or else the nav's aria-label. */
  function renderPicker(nav, current, onSelect, label) {
    let sel = nav.querySelector('select');
    if (!sel) {
      nav.innerHTML = '';
      sel = document.createElement('select');
      LANGS.forEach(l => {
        const o = document.createElement('option');
        o.value = l.code; o.textContent = `${l.flag} ${l.name}`; o.setAttribute('lang', l.code);
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => sel._onSelect(sel.value));
      nav.appendChild(sel);
    }
    sel._onSelect = onSelect;
    sel.value = current;
    const name = label || nav.getAttribute('aria-label');
    if (name) sel.setAttribute('aria-label', name);
  }
  function renderSwitchers() {
    document.querySelectorAll('.langs').forEach(nav => { nav.setAttribute('aria-label', LABEL[lang]); renderPicker(nav, lang, set, LABEL[lang]); });
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
  /** Plural forms. pl/uk: (n, one, few, many). en: (n, one, other). fr: (n, one, other), 0 and 1 are singular. vi: one form. */
  function plural(n, one, few, many) {
    if (lang === 'pl' || lang === 'uk') {
      const m10 = n % 10, m100 = n % 100;
      if (n === 1) return one;
      if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return few;
      return many;
    }
    if (lang === 'en') return n === 1 ? one : (many !== undefined ? many : few);
    if (lang === 'fr') return n <= 1 ? one : (many !== undefined ? many : few);
    return few !== undefined ? few : one;   // vi: no plural forms; callers pass the plain form as `few`
  }

  const style = document.createElement('style');
  style.textContent = '.langs,.flags{display:inline-flex;align-items:center}.langs select,.flags select{font:inherit;font-size:15px;color:#1e2436;background:#fff;border:2px solid #c5cbe0;border-radius:10px;padding:6px 10px;min-height:40px;max-width:100%;cursor:pointer}.langs select:hover,.flags select:hover{border-color:#4f5bd5}.langs select:focus-visible,.flags select:focus-visible{outline:3px solid #4f5bd5;outline-offset:1px}';
  document.head.appendChild(style);
  document.documentElement.lang = lang;
  document.addEventListener('DOMContentLoaded', () => { renderSwitchers(); decorateLinks(); });

  const valid_ = valid;
  return { LANGS, DEFAULT, get, set, onChange, t, apply, plural, withLang, renderPicker, isValid: valid_ };
})();
