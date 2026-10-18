/**
 * The cipher series "Akademia Młodych Szyfrantów": one strip under the app bar of every game in it.
 * Classic script, loaded after ../i18n.js:  <script src="../series.js" data-part="3"></script>
 *
 * The strip names the series, shows the six parts as numbered chips (the current one with its name),
 * links to the next part and to the Morse code game (Latarnik), which stays outside the series.
 * Screen only: it is never printed. Part links go to each part's worksheet page and keep ?lang=.
 */
(() => {
  const me = document.currentScript;
  const part = Number(me && me.dataset.part);
  const root = new URL('.', me ? me.src : location.href);

  /** The parts in order: two for training (how ciphers work), four real operations (1920, 1938). */
  const PARTS = [
    { href: 'cipher-detective/worksheet.html', key: 'p1' },
    { href: 'enigma/index.html', key: 'p2' },
    { href: 'wisla-1920/worksheet.html', key: 'p3' },
    { href: 'rewolucja-1920/worksheet.html', key: 'p4' },
    { href: 'zygalski-sheets/worksheet.html', key: 'p5' },
    { href: 'zygalski-full/worksheet.html', key: 'p6' },
  ];
  const MORSE = 'morse/worksheet.html';

  const T = {
    pl: {
      series: 'Akademia Młodych Szyfrantów', label: 'Seria gier o szyfrach',
      of: (n, all) => `część ${n} z ${all}`, next: name => `Dalej: ${name} →`, last: 'To ostatnia część serii',
      morse: '📡 Alfabet Morse’a: Latarnik', morseTitle: 'Depesze szły przez radio alfabetem Morse’a. Naucz się go w osobnej grze.',
      p1: 'Detektyw szyfrów', p2: 'Papierowa Enigma', p3: 'Tajne depesze 1920', p4: 'Szyfr „Rewolucja” 1920',
      p5: 'Płachty Zygalskiego', p6: 'Płachty Zygalskiego: pełna wersja',
    },
    en: {
      series: 'Young Codebreakers Academy', label: 'A series of cipher games',
      of: (n, all) => `part ${n} of ${all}`, next: name => `Next: ${name} →`, last: 'This is the last part of the series',
      morse: '📡 Morse code: Lighthouse Keeper', morseTitle: 'Telegrams went by radio in Morse code. Learn it in a separate game.',
      p1: 'Cipher Detective', p2: 'The Paper Enigma', p3: 'Secret telegrams 1920', p4: 'The “Revolution” cipher 1920',
      p5: 'Zygalski Sheets', p6: 'Zygalski Sheets: full version',
    },
    uk: {
      series: 'Академія юних шифрувальників', label: 'Серія ігор про шифри',
      of: (n, all) => `частина ${n} з ${all}`, next: name => `Далі: ${name} →`, last: 'Це остання частина серії',
      morse: '📡 Азбука Морзе: Доглядач маяка', morseTitle: 'Телеграми йшли радіо азбукою Морзе. Вивчи її в окремій грі.',
      p1: 'Детектив шифрів', p2: 'Паперова Енігма', p3: 'Таємні телеграми 1920', p4: 'Шифр «Революція» 1920',
      p5: 'Листи Зигальського', p6: 'Листи Зигальського: повна версія',
    },
    vi: {
      series: 'Học viện Mật mã nhí', label: 'Loạt trò chơi về mật mã',
      of: (n, all) => `phần ${n}/${all}`, next: name => `Tiếp theo: ${name} →`, last: 'Đây là phần cuối của loạt trò chơi',
      morse: '📡 Mã Morse: Người gác hải đăng', morseTitle: 'Các bức điện được gửi qua radio bằng mã Morse. Hãy học nó trong một trò chơi riêng.',
      p1: 'Thám tử mật mã', p2: 'Enigma bằng giấy', p3: 'Điện mật 1920', p4: 'Mật mã “Cách mạng” 1920',
      p5: 'Tấm Zygalski', p6: 'Tấm Zygalski: bản đầy đủ',
    },
    fr: {
      series: 'L’Académie des jeunes décodeurs', label: 'Une série de jeux sur les codes secrets',
      of: (n, all) => `partie ${n} sur ${all}`, next: name => `Suite : ${name} →`, last: 'C’est la dernière partie de la série',
      morse: '📡 Code Morse : le gardien du phare', morseTitle: 'Les télégrammes passaient par radio en code Morse. Apprends-le dans un jeu à part.',
      p1: 'Détective des codes secrets', p2: 'L’Enigma en papier', p3: 'Télégrammes secrets 1920', p4: 'Le chiffre « Révolution » 1920',
      p5: 'Feuilles de Zygalski', p6: 'Feuilles de Zygalski : version complète',
    },
    it: {
      series: 'Accademia dei giovani crittografi', label: 'Una serie di giochi sui cifrari',
      of: (n, all) => `parte ${n} di ${all}`, next: name => `Avanti: ${name} →`, last: 'È l’ultima parte della serie',
      morse: '📡 Codice Morse: il guardiano del faro', morseTitle: 'I telegrammi viaggiavano via radio in codice Morse. Imparalo in un gioco a parte.',
      p1: 'Detective dei cifrari', p2: 'L’Enigma di carta', p3: 'Telegrammi segreti 1920', p4: 'Il cifrario «Rivoluzione» 1920',
      p5: 'Fogli di Zygalski', p6: 'Fogli di Zygalski: versione completa',
    },
    es: {
      series: 'Academia de jóvenes criptógrafos', label: 'Una serie de juegos sobre cifrados',
      of: (n, all) => `parte ${n} de ${all}`, next: name => `Siguiente: ${name} →`, last: 'Es la última parte de la serie',
      morse: '📡 Código Morse: el farero', morseTitle: 'Los telegramas iban por radio en código Morse. Apréndelo en un juego aparte.',
      p1: 'Detective de cifrados', p2: 'La Enigma de papel', p3: 'Telegramas secretos 1920', p4: 'La cifra «Revolución» 1920',
      p5: 'Hojas de Zygalski', p6: 'Hojas de Zygalski: versión completa',
    },
  };

  const CSS = `
.series-bar{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding:8px 18px;background:#fbf3f3;border-bottom:1px solid #f0caca;font:14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1e2436;}
.series-bar .sb-name{font-weight:800;}
.series-bar .sb-of{color:#5b6275;font-weight:600;}
.series-bar .sb-phone{display:none;}
.series-bar ol{display:flex;flex-wrap:wrap;gap:6px;list-style:none;margin:0;padding:0;}
.series-bar ol a{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:34px;min-height:34px;padding:4px 10px;border-radius:999px;border:1px solid #e3b9b9;background:#fff;color:#7a2430;font-weight:700;text-decoration:none;}
.series-bar ol a:hover{border-color:#b8434f;}
.series-bar ol a[aria-current]{background:#b8434f;border-color:#b8434f;color:#fff;}
.series-bar .sb-next{display:inline-flex;align-items:center;min-height:34px;padding:4px 12px;border-radius:999px;background:#b8434f;color:#fff;font-weight:700;text-decoration:none;}
.series-bar .sb-next:hover{background:#963440;}
.series-bar .sb-end{color:#5b6275;font-style:italic;}
.series-bar .sb-morse{margin-left:auto;color:#3d48b8;font-weight:600;text-decoration:none;}
.series-bar .sb-morse:hover{text-decoration:underline;}
@media (max-width:640px){
  .series-bar{padding:8px 12px;}
  .series-bar ol{gap:5px;}
  .series-bar ol a{min-width:32px;padding:4px 8px;}
  .series-bar ol a .sb-cur{display:none;}   /* on a phone the current part's name goes to the line above */
  .series-bar .sb-phone{display:inline;}
  .series-bar .sb-morse{margin-left:0;}
}
@media print{ .series-bar{display:none !important;} }`;

  function link(href) {
    const u = new URL(href, root);
    const lang = I18N.get();
    if (lang !== 'pl') u.searchParams.set('lang', lang);
    return u.href;
  }
  function el(tag, attrs, text) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  let bar;
  function render() {
    const t = k => I18N.t(T, k);
    const name = n => t(PARTS[n - 1].key);
    bar.textContent = '';
    bar.setAttribute('aria-label', t('label'));
    const head = el('span');
    head.append(el('span', { class: 'sb-name' }, '🔐 ' + t('series')), ' ', el('span', { class: 'sb-of' }, '· ' + I18N.t(T, 'of', part, PARTS.length)),
      el('span', { class: 'sb-of sb-phone' }, ': ' + name(part)));
    bar.append(head);
    const ol = el('ol');
    PARTS.forEach((p, i) => {
      const n = i + 1, a = el('a', { href: link(p.href), title: `${n}. ${name(n)}`, 'aria-label': `${n}. ${name(n)}` });
      a.textContent = String(n);
      if (n === part) { a.setAttribute('aria-current', 'page'); a.append(el('span', { class: 'sb-cur' }, `. ${name(n)}`)); }
      const li = el('li'); li.append(a); ol.append(li);
    });
    bar.append(ol);
    if (part < PARTS.length) bar.append(el('a', { class: 'sb-next', href: link(PARTS[part].href) }, I18N.t(T, 'next', name(part + 1))));
    else bar.append(el('span', { class: 'sb-end' }, t('last')));
    bar.append(el('a', { class: 'sb-morse', href: link(MORSE), title: t('morseTitle') }, t('morse')));
  }

  function init() {
    if (!(part >= 1 && part <= PARTS.length)) return;
    const top = document.querySelector('.appbar, header.top');
    if (!top) return;
    document.head.append(el('style', null, CSS));
    bar = el('nav', { class: 'series-bar no-print' });
    top.after(bar);
    render();
    I18N.onChange(render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
