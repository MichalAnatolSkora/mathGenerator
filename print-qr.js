/**
 * A small QR code on the printed worksheets that leads back to the same sheet on the site. Classic script;
 * defines the global `PRINTQR` (also exported for Node, so the encoder can be tested with `node print-qr.test.js`).
 *
 * The code goes into every `.sheet-head` of the page (except `.slim` continuation heads) and every element with
 * `data-qr`, with "More games on the website – scan me" beside it. It links to the page on the site (SITE below,
 * also when the page is opened from file:// or localhost) with the sheet's settings and the language, so scanning it
 * opens the same sheet with the same code.
 * A checkbox "QR code on the printout" appears right before the #printBtn button; the choice is remembered
 * (localStorage "printQr") and shared by all pages.
 *
 *   PRINTQR.set(params)   → the page's current settings ({seed, level, key: true, …}); without it the address's query is used
 *   PRINTQR.stamp(root)   → put the codes in now (pages that measure their layout right after rendering)
 *   PRINTQR.onChange(fn)  → called after the checkbox was switched
 *   PRINTQR.matrix(text)  → QR modules, rows of booleans (byte mode, error correction level M, versions 1–10)
 */
const PRINTQR = (() => {
  const SITE = 'https://michalanatolskora.github.io/mathGenerator/';

  /* ---------- encoder (ISO/IEC 18004, byte mode, level M) ---------- */
  // per version 1–10: error correction codewords per block and number of blocks at level M
  const ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  const BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
  const MAX_VERSION = 10;
  const FORMAT_M = 0;   // the two bits of level M in the format information

  /** Modules left for data and error correction once the fixed patterns are drawn. */
  function rawModules(ver) {
    let n = (16 * ver + 128) * ver + 64;
    if (ver >= 2) { const a = Math.floor(ver / 7) + 2; n -= (25 * a - 10) * a - 55; if (ver >= 7) n -= 36; }
    return n;
  }
  const dataCodewords = ver => Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * BLOCKS[ver];

  /* GF(256) with the polynomial x⁸ + x⁴ + x³ + x² + 1 */
  function gfMul(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z;
  }
  function rsDivisor(degree) {
    const r = new Array(degree).fill(0); r[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < degree; j++) { r[j] = gfMul(r[j], root); if (j + 1 < degree) r[j] ^= r[j + 1]; }
      root = gfMul(root, 0x02);
    }
    return r;
  }
  function rsRemainder(data, divisor) {
    const r = divisor.map(() => 0);
    for (const b of data) {
      const f = b ^ r.shift(); r.push(0);
      divisor.forEach((d, i) => { r[i] ^= gfMul(d, f); });
    }
    return r;
  }

  /** The data codewords of `bytes` in the smallest version that holds them, with their error correction, interleaved. */
  function codewords(bytes) {
    let ver = 1;
    const bitsNeeded = v => 4 + (v < 10 ? 8 : 16) + bytes.length * 8;
    while (ver <= MAX_VERSION && bitsNeeded(ver) > dataCodewords(ver) * 8) ver++;
    if (ver > MAX_VERSION) throw new Error('QR: text too long');
    const cap = dataCodewords(ver) * 8, bits = [];
    const put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
    put(0b0100, 4); put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(b => put(b, 8));
    put(0, Math.min(4, cap - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (let pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => a * 2 + b, 0));

    const nBlocks = BLOCKS[ver], eccLen = ECC_PER_BLOCK[ver], raw = Math.floor(rawModules(ver) / 8);
    const nShort = nBlocks - raw % nBlocks, shortLen = Math.floor(raw / nBlocks), div = rsDivisor(eccLen);
    const blocks = [];
    for (let i = 0, k = 0; i < nBlocks; i++) {
      const d = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1)); k += d.length;
      const e = rsRemainder(d, div);
      if (i < nShort) d.push(0);
      blocks.push(d.concat(e));
    }
    const out = [];
    for (let i = 0; i < blocks[0].length; i++) {
      blocks.forEach((b, j) => { if (i !== shortLen - eccLen || j >= nShort) out.push(b[i]); });
    }
    return { ver, words: out };
  }

  const MASKS = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x, y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => x * y % 2 + x * y % 3 === 0,
    (x, y) => (x * y % 2 + x * y % 3) % 2 === 0,
    (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0,
  ];

  /** Penalty of a finished symbol (the four rules of the standard); the mask with the lowest one is used. */
  function penalty(m) {
    const n = m.length; let p = 0, dark = 0;
    const lines = [];
    for (let i = 0; i < n; i++) { lines.push(m[i]); lines.push(m.map(r => r[i])); }
    const F1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0].join(''), F2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1].join('');
    for (const l of lines) {
      let run = 1;
      for (let i = 1; i <= n; i++) {
        if (i < n && l[i] === l[i - 1]) run++;
        else { if (run >= 5) p += run - 2; run = 1; }
      }
      const s = l.map(Number).join('');
      for (let i = s.indexOf(F1); i >= 0; i = s.indexOf(F1, i + 1)) p += 40;
      for (let i = s.indexOf(F2); i >= 0; i = s.indexOf(F2, i + 1)) p += 40;
    }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (m[y][x]) dark++;
      if (x < n - 1 && y < n - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
    }
    return p + 10 * (Math.ceil(Math.abs(dark * 20 - n * n * 10) / (n * n)) - 1);
  }

  /** QR modules of `text` (UTF-8): an array of rows, true = dark. */
  function matrix(text) {
    const { ver, words } = codewords([...new TextEncoder().encode(text)]);
    const n = ver * 4 + 17;
    const m = Array.from({ length: n }, () => new Array(n).fill(false));
    const fixed = Array.from({ length: n }, () => new Array(n).fill(false));
    const set = (x, y, dark) => { m[y][x] = dark; fixed[y][x] = true; };

    for (let i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }   // timing
    for (const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]]) {                           // finders + separators
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < n && y >= 0 && y < n) set(x, y, d !== 2 && d !== 4);
      }
    }
    if (ver >= 2) {                                                                       // alignment
      const a = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (a * 2 - 2)) * 2, pos = [6];
      for (let p = n - 7; pos.length < a; p -= step) pos.splice(1, 0, p);
      pos.forEach((x, i) => pos.forEach((y, j) => {
        if ((i === 0 && j === 0) || (i === 0 && j === a - 1) || (i === a - 1 && j === 0)) return;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }));
    }
    const drawFormat = mask => {
      const d = FORMAT_M << 3 | mask; let r = d;
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = (d << 10 | r) ^ 0x5412, bit = i => ((b >>> i) & 1) === 1;
      for (let i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(n - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) set(8, n - 15 + i, bit(i));
      set(8, n - 8, true);
    };
    drawFormat(0);   // reserve the format areas before the data goes in
    if (ver >= 7) {
      let r = ver;
      for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      const b = ver << 12 | r;
      for (let i = 0; i < 18; i++) {
        const dark = ((b >>> i) & 1) === 1, a = n - 11 + i % 3, c = Math.floor(i / 3);
        set(a, c, dark); set(c, a, dark);
      }
    }
    let i = 0;                                                                            // data, in the zigzag
    for (let right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let v = 0; v < n; v++) for (let j = 0; j < 2; j++) {
        const x = right - j, y = ((right + 1) & 2) === 0 ? n - 1 - v : v;
        if (!fixed[y][x] && i < words.length * 8) { m[y][x] = ((words[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
      }
    }
    let best = null;
    MASKS.forEach((f, k) => {
      const c = m.map((row, y) => row.map((dark, x) => fixed[y][x] ? dark : dark !== f(x, y)));
      const save = m.map(r => r.slice());
      for (let y = 0; y < n; y++) m[y] = c[y];
      drawFormat(k);
      const p = penalty(m);
      if (!best || p < best.p) best = { p, m: m.map(r => r.slice()) };
      for (let y = 0; y < n; y++) m[y] = save[y];
    });
    return best.m;
  }

  /** The modules as an SVG picture with a quiet zone of `margin` modules. */
  function svg(text, margin = 2) {
    const m = matrix(text), size = m.length + 2 * margin;
    let d = '';
    m.forEach((row, y) => row.forEach((dark, x) => { if (dark) d += `M${x + margin} ${y + margin}h1v1h-1z`; }));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true">`
      + `<rect width="${size}" height="${size}" fill="#fff"/><path fill="#000" d="${d}"/></svg>`;
  }

  if (typeof document === 'undefined') return { matrix, svg, SITE };

  /* ---------- on the page ---------- */
  const TEXT = {
    pl: { toggle: 'Kod QR na wydruku', more: 'Więcej gier na stronie – zeskanuj', scan: 'Zeskanuj telefonem, aby otworzyć tę kartę na stronie' },
    en: { toggle: 'QR code on the printout', more: 'More games on the website – scan me', scan: 'Scan with a phone to open this sheet on the website' },
    uk: { toggle: 'QR-код на роздруківці', more: 'Більше ігор на сайті – скануй', scan: 'Скануйте телефоном, щоб відкрити цей аркуш на сайті' },
    vi: { toggle: 'Mã QR trên bản in', more: 'Thêm trò chơi trên trang web – quét mã', scan: 'Quét bằng điện thoại để mở phiếu này trên trang web' },
    fr: { toggle: 'Code QR sur la fiche imprimée', more: 'Plus de jeux sur le site – scanne-moi', scan: 'Scanne avec un téléphone pour ouvrir cette fiche sur le site' },
    it: { toggle: 'Codice QR sulla stampa', more: 'Altri giochi sul sito – inquadrami', scan: 'Inquadra con il telefono per aprire questa scheda sul sito' },
    es: { toggle: 'Código QR en la copia impresa', more: 'Más juegos en la web – escanéame', scan: 'Escanea con el móvil para abrir esta ficha en la web' },
  };
  const KEY = 'printQr';
  const t = k => I18N.t(TEXT, k);
  let on = true;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (_) { /* no storage: on */ }
  let params = null;
  const listeners = [];

  // the folder of this script is the site root, so the page's path inside the site is known also offline
  const root = new URL('.', document.currentScript.src).href;

  /** Address of this sheet on the site. */
  function link() {
    const here = location.href.split(/[?#]/)[0];
    const path = here.startsWith(root) ? here.slice(root.length) : here.split('/').slice(-2).join('/');
    const q = new URLSearchParams(params ? '' : location.search);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === '') continue;
        q.set(k, v === true ? '1' : v === false ? '0' : String(v));
      }
    }
    if (I18N.get() === I18N.DEFAULT) q.delete('lang'); else q.set('lang', I18N.get());
    const qs = q.toString();
    return SITE + path.replace(/(^|\/)index\.html$/, '$1') + (qs ? '?' + qs : '');
  }
  function picture() {
    const url = link();
    try { return svg(url); } catch (_) { return svg(url.split('?')[0]); }   // too long: the page without its settings
  }

  const style = document.createElement('style');
  style.textContent = '.print-qr{flex:none;display:flex;align-items:center;gap:2mm;margin-left:auto;}'
    + '.print-qr-code{flex:none;width:15mm;height:15mm;}.print-qr-code svg{display:block;width:100%;height:100%;}'
    + '.print-qr-more{width:20mm;font:600 7.5pt/1.2 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#555;text-align:right;}'
    + '.sheet-head.qr-head > :first-child{flex-grow:1;}html.no-print-qr .print-qr{display:none !important;}'
    + '.qr-toggle{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin:2px 0;min-height:32px;}'
    + '.qr-toggle input{width:18px;height:18px;flex:0 0 auto;margin:0;}'
    + '@media screen and (max-width:900px){.print-qr-more{display:none;}}'   // narrow screens: room for the title (the printout has it)
    + '@media print{.qr-toggle{display:none !important;}}';
  document.head.appendChild(style);

  /** Put a code into every head of `scope` that has none yet. */
  function stamp(scope = document) {
    const heads = [...scope.querySelectorAll('.sheet-head:not(.slim), [data-qr]')].filter(h => !h.querySelector(':scope > .print-qr'));
    if (!heads.length) return;
    const pic = picture(), title = t('scan');
    for (const h of heads) {
      const box = document.createElement('div');
      box.className = 'print-qr'; box.title = title;
      box.innerHTML = '<span class="print-qr-more"></span><span class="print-qr-code"></span>';
      box.firstChild.textContent = t('more'); box.lastChild.innerHTML = pic;
      h.classList.add('qr-head');
      h.appendChild(box);
    }
  }
  /** Draw every code again (the settings or the language changed). */
  function refresh() {
    const boxes = document.querySelectorAll('.print-qr');
    if (!boxes.length) return;
    const pic = picture(), title = t('scan');
    boxes.forEach(b => { b.lastChild.innerHTML = pic; b.firstChild.textContent = t('more'); b.title = title; });
  }
  function set(p) { params = p; refresh(); }

  function renderToggle() {
    let label = document.querySelector('.qr-toggle');
    if (!label) {
      const btn = document.getElementById('printBtn');
      if (!btn) return;
      label = document.createElement('label');
      label.className = 'qr-toggle';
      label.innerHTML = '<input type="checkbox"> <span></span>';
      const box = label.firstChild;
      box.checked = on;
      box.addEventListener('change', () => {
        on = box.checked;
        try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (_) { /* ignore */ }
        document.documentElement.classList.toggle('no-print-qr', !on);
        listeners.forEach(f => f(on));
      });
      btn.parentNode.insertBefore(label, btn);
    }
    label.querySelector('span').textContent = t('toggle');
  }

  document.documentElement.classList.toggle('no-print-qr', !on);
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; stamp(); });
  });
  document.addEventListener('DOMContentLoaded', () => {
    renderToggle(); stamp();
    observer.observe(document.body, { childList: true, subtree: true });
  });
  I18N.onChange(() => { renderToggle(); refresh(); });

  return { matrix, svg, set, stamp, refresh, link, onChange: f => listeners.push(f), isOn: () => on, SITE };
})();
if (typeof module !== 'undefined') module.exports = PRINTQR;
