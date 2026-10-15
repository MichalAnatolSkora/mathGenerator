/**
 * Shared worksheet kit of the little ones' paper puzzles. Classic script; defines the global `KIT`
 * (also exported for Node, so the puzzle engines can be tested with `node engine.test.js`).
 *
 *   KIT.rng(seed)            → seeded random numbers 0..1 (same seed ⇒ same worksheet)
 *   KIT.pick / int / shuffle → helpers on such a generator
 *   KIT.esc(s)               → text escaped for HTML
 *   KIT.plPl / ukPl          → plural forms for the strings files
 *   KIT.TEXT                 → the kit's own texts (seed, options, print…) in seven languages
 *   KIT.app(cfg)             → runs a worksheet page (see below)
 *
 * A worksheet page has `<form class="controls" id="controls">`, `<div id="out">`, loads ../i18n.js, this file,
 * its engine and strings, and calls
 *   KIT.app({
 *     store: 'mazes.sheet',                  // localStorage key of the settings
 *     text: { pl: {…}, en: {…}, … },          // the puzzle's texts (title, appTitle, appSub, its own keys)
 *     groups: [{ id, values, def, label: (v, C) => text, title?: textKey, show?: state => bool }],
 *     checks: [{ id, def, label: textKey }],  // extra checkboxes; "answer key page" (`key`) is always there
 *     render: (s, api) => ({ html, tasks, pages }),
 *   })
 * `s` holds the seed, every group's value and every checkbox (s.key: add the answer key pages). `api` has
 * t(key, …args), C (the texts of the current language), esc, rnd(salt) (a generator for this seed + salt)
 * and head(title, subtitle, withNameBox). Settings come from the URL (?seed=&<group>=&<check>=1|0), else
 * from localStorage, else the defaults.
 */
const KIT = (() => {
  /* ---------- seeded random ---------- */
  /** mulberry32 on a string hash: a small seeded generator. */
  function rng(seed) {
    let h = 1779033703 ^ String(seed).length;
    for (const ch of String(seed)) { h = Math.imul(h ^ ch.codePointAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let x = a;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
  const int = (rnd, lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  function shuffle(rnd, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function randomSeed() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = ''; for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)];
    return s + '-' + (100 + Math.floor(Math.random() * 900));
  }

  // Plural forms. pl: 1 / 2–4 (not 12–14) / rest.  uk: like pl, but 21, 31… take the singular form.
  const plPl = (n, one, few, many) => n === 1 ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  const ukPl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11) ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;

  /* ---------- the kit's texts ---------- */
  const TEXT = {
    pl: {
      allPuzzles: '🧩 Wszystkie zagadki',
      seed: 'Kod karty', seedHint: 'Ten sam kod i te same ustawienia ⇒ ta sama karta.', randomSeed: 'Losowy kod',
      options: 'Opcje', optKey: 'Strona z rozwiązaniami',
      newWorksheet: 'Nowa karta', print: 'Drukuj / zapisz PDF',
      name: 'Imię: ____________________', date: 'Data: ____________________', seedLabel: 'Kod:',
      keyTitle: 'Rozwiązania',
      summary: (n, p) => `${n} ${plPl(n, 'zadanie', 'zadania', 'zadań')} · ${p} ${plPl(p, 'strona', 'strony', 'stron')}`,
      genError: 'Błąd: ',
    },
    en: {
      allPuzzles: '🧩 All puzzles',
      seed: 'Sheet code', seedHint: 'Same code + same settings ⇒ the same sheet.', randomSeed: 'Random code',
      options: 'Options', optKey: 'Answer key page',
      newWorksheet: 'New sheet', print: 'Print / Save PDF',
      name: 'Name: ____________________', date: 'Date: ____________________', seedLabel: 'Code:',
      keyTitle: 'Answer key',
      summary: (n, p) => `${n} ${n === 1 ? 'puzzle' : 'puzzles'} · ${p} ${p === 1 ? 'page' : 'pages'}`,
      genError: 'Error: ',
    },
    uk: {
      allPuzzles: '🧩 Усі головоломки',
      seed: 'Код аркуша', seedHint: 'Той самий код і ті самі налаштування ⇒ той самий аркуш.', randomSeed: 'Випадковий код',
      options: 'Параметри', optKey: 'Сторінка з відповідями',
      newWorksheet: 'Новий аркуш', print: 'Друкувати / зберегти PDF',
      name: 'Ім’я: ____________________', date: 'Дата: ____________________', seedLabel: 'Код:',
      keyTitle: 'Відповіді',
      summary: (n, p) => `${n} ${ukPl(n, 'завдання', 'завдання', 'завдань')} · ${p} ${ukPl(p, 'сторінка', 'сторінки', 'сторінок')}`,
      genError: 'Помилка: ',
    },
    vi: {
      allPuzzles: '🧩 Tất cả câu đố',
      seed: 'Mã phiếu', seedHint: 'Cùng mã + cùng cài đặt ⇒ cùng một phiếu.', randomSeed: 'Mã ngẫu nhiên',
      options: 'Tùy chọn', optKey: 'Trang đáp án',
      newWorksheet: 'Phiếu mới', print: 'In / Lưu PDF',
      name: 'Họ tên: ____________________', date: 'Ngày: ____________________', seedLabel: 'Mã:',
      keyTitle: 'Đáp án',
      summary: (n, p) => `${n} bài · ${p} trang`,
      genError: 'Lỗi: ',
    },
    fr: {
      allPuzzles: '🧩 Toutes les énigmes',
      seed: 'Code de la fiche', seedHint: 'Même code + mêmes réglages ⇒ la même fiche.', randomSeed: 'Code au hasard',
      options: 'Options', optKey: 'Page du corrigé',
      newWorksheet: 'Nouvelle fiche', print: 'Imprimer / PDF',
      name: 'Prénom : ____________________', date: 'Date : ____________________', seedLabel: 'Code :',
      keyTitle: 'Corrigé',
      summary: (n, p) => `${n} ${n <= 1 ? 'exercice' : 'exercices'} · ${p} ${p <= 1 ? 'page' : 'pages'}`,
      genError: 'Erreur : ',
    },
    it: {
      allPuzzles: '🧩 Tutti i giochi',
      seed: 'Codice della scheda', seedHint: 'Stesso codice + stesse impostazioni ⇒ la stessa scheda.', randomSeed: 'Codice a caso',
      options: 'Opzioni', optKey: 'Pagina con le soluzioni',
      newWorksheet: 'Nuova scheda', print: 'Stampa / Salva PDF',
      name: 'Nome: ____________________', date: 'Data: ____________________', seedLabel: 'Codice:',
      keyTitle: 'Soluzioni',
      summary: (n, p) => `${n} ${n === 1 ? 'esercizio' : 'esercizi'} · ${p} ${p === 1 ? 'pagina' : 'pagine'}`,
      genError: 'Errore: ',
    },
    es: {
      allPuzzles: '🧩 Todos los juegos',
      seed: 'Código de la ficha', seedHint: 'Mismo código + mismos ajustes ⇒ la misma ficha.', randomSeed: 'Código al azar',
      options: 'Opciones', optKey: 'Página con las soluciones',
      newWorksheet: 'Nueva ficha', print: 'Imprimir / Guardar PDF',
      name: 'Nombre: ____________________', date: 'Fecha: ____________________', seedLabel: 'Código:',
      keyTitle: 'Soluciones',
      summary: (n, p) => `${n} ${n === 1 ? 'ejercicio' : 'ejercicios'} · ${p} ${p === 1 ? 'página' : 'páginas'}`,
      genError: 'Error: ',
    },
  };

  /* ---------- the worksheet page ---------- */
  function app(cfg) {
    const $ = id => document.getElementById(id);
    const UI = {};
    for (const l of new Set([...Object.keys(TEXT), ...Object.keys(cfg.text)])) UI[l] = { ...TEXT[l], ...cfg.text[l] };
    const t = (k, ...a) => I18N.t(UI, k, ...a);
    const C = () => UI[I18N.get()] || UI.en;
    const groups = cfg.groups || [];
    const checks = [...(cfg.checks || []), { id: 'key', def: true, label: 'optKey' }];
    const state = {};
    for (const g of groups) state[g.id] = g.def !== undefined ? g.def : g.values[0];

    $('controls').innerHTML = `
      <div class="grp">
        <h2 data-i18n="seed"></h2>
        <div class="row">
          <input type="text" id="seed" autocomplete="off" spellcheck="false" data-i18n-attr="aria-label:seed">
          <button type="button" class="randseed" id="randSeed" data-i18n-attr="title:randomSeed,aria-label:randomSeed">🎲</button>
        </div>
        <div class="hint" data-i18n="seedHint"></div>
      </div>
      ${groups.map(g => `<div class="grp" id="grp-${g.id}"><h2 data-i18n="${g.title || g.id}"></h2><div class="presets" id="g-${g.id}"></div></div>`).join('')}
      <div class="grp">
        <h2 data-i18n="options"></h2>
        ${checks.map(c => `<label class="check"><input type="checkbox" id="c-${c.id}"> <span data-i18n="${c.label}"></span></label>`).join('')}
      </div>
      <div class="actions">
        <button type="button" class="primary" id="newBtn" data-i18n="newWorksheet"></button>
        <button type="button" class="ghost" id="printBtn" data-i18n="print"></button>
      </div>
      <div class="msg" id="msg" aria-live="polite"></div>`;

    function readSettings() {
      const s = { seed: $('seed').value.trim() || 'SEED', ...state };
      for (const c of checks) s[c.id] = $('c-' + c.id).checked;
      return s;
    }
    function persist(s) { try { localStorage.setItem(cfg.store, JSON.stringify(s)); } catch (_) { /* no storage */ } }
    function load(get) {   // get(name) → string|undefined|null; returns true when a seed was found
      let seen = false;
      const seed = get('seed'); if (seed) { $('seed').value = seed; seen = true; }
      for (const g of groups) { const v = get(g.id); if (v != null && g.values.map(String).includes(String(v))) state[g.id] = g.values.find(x => String(x) === String(v)); }
      for (const c of checks) { const v = get(c.id); if (v != null) $('c-' + c.id).checked = v === true || v === '1' || v === 'true'; }
      return seen;
    }
    function head(title, subtitle, seed, withName) {
      return `<div class="sheet-head"><div><div class="title">${esc(title)}</div><div class="subtitle">${esc(subtitle)}</div>`
        + `<div class="seedlabel">${esc(t('seedLabel'))} ${esc(seed)}</div></div>`
        + (withName ? `<div class="namebox">${esc(t('name'))}<br>${esc(t('date'))}</div>` : '') + '</div>';
    }

    function regenerate() {
      const s = readSettings();
      persist(s);
      if (typeof PRINTQR !== 'undefined') PRINTQR.set(s);   // the settings go into the QR code's link as ?seed=&<group>=&<check>=
      const msg = $('msg'); msg.className = 'msg';
      try {
        const api = { t, C: C(), esc, rnd: salt => rng(`${s.seed}|${salt}`), head: (title, sub, withName) => head(title, sub, s.seed, withName) };
        const r = cfg.render(s, api);
        $('out').innerHTML = r.html;
        document.title = `${t('title')} · ${s.seed}`;
        msg.textContent = t('summary', r.tasks, r.pages);
      } catch (e) {
        msg.className = 'msg error'; msg.textContent = t('genError') + e.message;
        console.error(e);
      }
    }
    function newWorksheet() { $('seed').value = randomSeed(); regenerate(); }

    function renderControls() {
      for (const g of groups) {
        const box = $('g-' + g.id); box.innerHTML = '';
        $('grp-' + g.id).hidden = g.show ? !g.show(state) : false;
        for (const v of g.values) {
          const b = document.createElement('button');
          b.type = 'button'; b.textContent = g.label(v, C()); b.className = v === state[g.id] ? 'active' : '';
          b.setAttribute('aria-pressed', String(v === state[g.id]));
          b.addEventListener('click', () => { state[g.id] = v; renderControls(); regenerate(); });
          box.appendChild(b);
        }
      }
    }

    $('seed').addEventListener('change', regenerate);
    $('seed').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); regenerate(); } });
    for (const c of checks) $('c-' + c.id).addEventListener('change', regenerate);
    $('randSeed').addEventListener('click', newWorksheet);
    $('newBtn').addEventListener('click', newWorksheet);
    $('printBtn').addEventListener('click', () => window.print());
    I18N.onChange(() => { I18N.apply(UI); renderControls(); regenerate(); });

    for (const c of checks) $('c-' + c.id).checked = c.def !== false;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(cfg.store) || 'null'); } catch (_) { /* ignore */ }
    const fromStore = saved ? load(k => saved[k]) : false;
    const q = new URLSearchParams(location.search);
    const fromUrl = load(k => q.get(k));
    if (!fromStore && !fromUrl) $('seed').value = randomSeed();
    I18N.apply(UI);
    renderControls();
    regenerate();
  }

  return { rng, pick, int, shuffle, esc, randomSeed, plPl, ukPl, TEXT, app };
})();
if (typeof module !== 'undefined') module.exports = KIT;
