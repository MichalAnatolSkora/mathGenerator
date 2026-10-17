/**
 * "How did Enigma work?" — the explainer of the full Zygalski pack (two printable pages) and of the online light
 * table (the same texts plus a machine you can type on). Classic script; defines the global `ENIGMA_HOW` (also
 * exported for Node). Every letter it shows is computed with the Enigma I of ../zygalski-sheets/engine.js from
 * one example daily key (`EX`), never typed. Texts: `ENIGMA_TEXT` (enigma-strings.js).
 *
 *   ENIGMA_HOW.EX                     → the example: daily key, the key press drawn, the message sent
 *   ENIGMA_HOW.machine                → that Enigma (ZYG.machine)
 *   ENIGMA_HOW.diagram(win, key, X)   → SVG: the current's way through every part for key `key` (0–25) with the
 *                                        windows `win` (after the step), or no current for key null; X = the texts' `diagram`
 *   ENIGMA_HOW.path(win, key)         → the letters of that way, e.g. 'A → Q → I → … → W'
 *   ENIGMA_HOW.partsHtml(T, esc, o)   → part 1: the intro, the drawing and the parts of the machine
 *                                        (o.intro / o.figure = false leave those out)
 *   ENIGMA_HOW.procHtml(T, esc)       → part 2: the daily key, sender, radio, receiver, the weak point, the count,
 *                                        how the wiring was found
 *   ENIGMA_HOW.presses(from, text)    → typing `text` from the windows `from`: [{ win, key, lamp }] per press
 *   ENIGMA_HOW.ind / cipher           → the example's enciphered doubled key (6 letters) and message
 *   ENIGMA_HOW.KEYBOARD               → the rows of Enigma's keyboard (QWERTZ…)
 */
const ENIGMA_HOW = (() => {
  const Z = typeof ZYG !== 'undefined' ? ZYG : require('../zygalski-sheets/engine.js');
  const mod = x => ((x % 26) + 26) % 26;
  const L = i => String.fromCharCode(65 + mod(i));
  const code = ch => ch.charCodeAt(0) - 65;

  /** The example: a daily key, the windows before the six presses of A, and one message sent with it. */
  const EX = { order: ['II', 'I', 'III'], rings: 'KUM', plug: 'AQ BT CF DL EY GH', day: '17', before: 'ADT', ground: 'PKE', key: 'LKW', plain: 'KEINEBESONDERENEREIGNISSE' };
  const machine = Z.machine(EX.order, EX.rings, EX.plug);
  const KEYBOARD = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];

  /** Typing `text` from the windows `from`: the windows after each step, the key and the lamp. */
  function presses(from = EX.before, text = 'AAAAAA') {
    let win = [...from].map(code);
    return [...text].map(ch => { win = machine.step(win); return { win: win.map(L).join(''), key: ch, lamp: L(machine.perm(win)[code(ch)]) }; });
  }
  /** The presses as a table: press number, windows (`moved` = the press where the middle rotor turned), key, lamp. */
  function pressTable(pr, T, esc, o = {}) {
    const hl = i => (o.cols || []).includes(i) ? ' class="eh-hl"' : '';
    return `<table class="eh-steps"><tr><th>${esc(T.press)}</th>${pr.map((_, i) => `<td${hl(i)}>${i + 1}</td>`).join('')}</tr>
      <tr><th>${esc(T.windows)}</th>${pr.map((p, i) => `<td${hl(i)}>${p.win[0]}<b${i === o.moved ? ' class="eh-moved"' : ''}>${p.win[1]}</b><b>${p.win[2]}</b></td>`).join('')}</tr>
      <tr><th>${esc(T.key)}</th>${pr.map((p, i) => `<td${hl(i)}>${p.key}</td>`).join('')}</tr>
      <tr><th>${esc(T.lamp)}</th>${pr.map((p, i) => `<td class="eh-lamp${(o.cols || []).includes(i) ? ' eh-hl' : ''}">${p.lamp}</td>`).join('')}</tr></table>`;
  }
  const ind = machine.encrypt(EX.ground, EX.key + EX.key);
  const cipher = machine.encrypt(EX.key, EX.plain);
  const groups = s => s.match(/.{1,5}/g).join(' ');

  const path = (win, key) => machine.trace(win, key).map(L).join(' → ');

  /* ---------- the drawing ---------- */
  const W = 640, TOP = 46, ROW = 9, H = TOP + 26 * ROW + 6;
  const y = c => TOP + c * ROW + ROW / 2;
  const RED = '#c0252b', BLUE = '#1f5fbf', WIRE = '#c9ced9';
  // x ranges of the parts, left to right: reflector, left, middle, right rotor, plugboard, keys
  const X = { refl: [22, 50], rot: [[80, 166], [200, 286], [320, 406]], plug: [440, 492], keys: [528, 632] };
  const gaps = [[50, 80], [166, 200], [286, 320], [406, 440], [492, 528]];   // where the letters of the way are written
  const sx = s => s.toFixed(1);
  const escX = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  /** The wires of the rotor in place i (0 = left) with the windows `win`: right contact e → left contact. */
  function wires(i, win) {
    const fwd = [...Z.ROTORS[EX.order[i]][0]].map(code), p = mod(win[i] - code(EX.rings[i]));
    return Array.from({ length: 26 }, (_, e) => mod(fwd[mod(e + p)] - p));
  }

  function diagram(win, key, T) {
    // key == null: the machine alone, no current
    const t = key == null ? Array(10).fill(-1) : machine.trace(win, key);   // [key, plug, R, M, L, refl, L, M, R, lamp]
    const aria = key == null ? T.aria(win.map(L).join(''), '–', '–') : T.aria(win.map(L).join(''), L(key), L(t[9]));
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escX(aria)}" font-family="system-ui,Segoe UI,Arial,sans-serif">`;
    const label = (x, yy, txt, o = '', anchor = 'middle') => `<text x="${sx(x)}" y="${sx(yy)}" text-anchor="${anchor}" ${o}>${escX(txt)}</text>`;
    const line = (x1, y1, x2, y2, col, w) => `<line x1="${sx(x1)}" y1="${sx(y1)}" x2="${sx(x2)}" y2="${sx(y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    const box = ([a, b], fill) => `<rect x="${a}" y="${TOP - 3}" width="${b - a}" height="${26 * ROW + 6}" rx="5" fill="${fill}" stroke="#8a90a0" stroke-width="0.8"/>`;

    // headings
    s += `<g font-size="9.5" font-weight="700" fill="#1E3A5F">`;
    s += label((X.refl[0] + X.refl[1]) / 2, 12, T.refl[0]) + label((X.refl[0] + X.refl[1]) / 2, 22, T.refl[1]);
    X.rot.forEach(([a, b], i) => { s += label((a + b) / 2, 12, `${T.rotors[i]} · ${EX.order[i]}`); });
    s += label((X.plug[0] + X.plug[1]) / 2, 12, T.plug) + label((X.keys[0] + X.keys[1]) / 2, 12, T.keys);
    s += '</g>';
    // the windows
    X.rot.forEach(([a, b], i) => {
      const c = (a + b) / 2;
      s += `<rect x="${c - 9}" y="17" width="18" height="16" rx="3" fill="#fff" stroke="#1E3A5F" stroke-width="1.2"/>`;
      s += label(c, 29.5, L(win[i]), 'font-size="12" font-weight="800" fill="#1B1B1F" font-family="ui-monospace,Menlo,Consolas,monospace"');
      s += label(c + 26, 28, T.window, 'font-size="7" fill="#5b6070"');
    });

    // the parts, with every wire faint
    s += box(X.refl, '#f1ecfa') + X.rot.map(r => box(r, '#f5f7fb')).join('') + box(X.plug, '#fbf6ea');
    const pairs = [];
    for (let c = 0; c < 26; c++) { const o = code(Z.REFLECTOR_B[c]); if (c < o) pairs.push([c, o]); }
    const arc = ([a, b], col, w) => {
      const depth = 4 + Math.abs(b - a) * 1.05, x0 = X.refl[1];
      return `<path d="M${x0} ${sx(y(a))} C ${sx(x0 - depth)} ${sx(y(a))}, ${sx(x0 - depth)} ${sx(y(b))}, ${x0} ${sx(y(b))}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
    };
    s += pairs.map(p => arc(p, WIRE, 0.6)).join('');
    X.rot.forEach(([a, b], i) => { wires(i, win).forEach((o, e) => { s += line(b, y(e), a, y(o), WIRE, 0.55); }); });
    const sw = Array.from({ length: 26 }, (_, i) => i);
    for (const pr of EX.plug.split(' ')) { sw[code(pr[0])] = code(pr[1]); sw[code(pr[1])] = code(pr[0]); }
    sw.forEach((o, c) => { s += line(X.plug[1], y(c), X.plug[0], y(o), o === c ? '#e3e6ee' : '#d8b25a', o === c ? 0.6 : 0.9); });
    // the keys and lamps
    for (let c = 0; c < 26; c++) {
      const isKey = c === t[0], isLamp = c === t[9], cx = X.keys[0] + 22;
      if (isLamp) s += `<circle cx="${cx}" cy="${sx(y(c))}" r="5.4" fill="#ffd84a" stroke="#d29a00" stroke-width="1"/>`;
      if (isKey) s += `<rect x="${cx - 6}" y="${sx(y(c) - 4.8)}" width="12" height="9.6" rx="2.5" fill="${RED}"/>`;
      s += label(cx, y(c) + 2.8, L(c), `font-size="7.8" font-weight="${isKey || isLamp ? 800 : 500}" fill="${isKey ? '#fff' : '#3a3f4c'}" font-family="ui-monospace,Menlo,Consolas,monospace"`);
      if (isKey) s += label(cx + 12, y(c) + 3, T.key, `font-size="8" font-weight="700" fill="${RED}"`, 'start');
      if (isLamp) s += label(cx + 12, y(c) + 3, T.lamp, `font-size="8" font-weight="700" fill="#9a6b00"`, 'start');
    }

    if (key == null) return s + '</svg>';
    // the way there (red) and back (blue)
    const xs = [X.keys[0] + 14, X.plug[1], X.plug[0], X.rot[2][1], X.rot[2][0], X.rot[1][1], X.rot[1][0], X.rot[0][1], X.rot[0][0], X.refl[1]];
    // there: key → plug right (t0), plug left (t1) → right rotor right (t1) → its left (t2) … → reflector (t4)
    const there = [[xs[0], t[0]], [xs[1], t[0]], [xs[2], t[1]], [xs[3], t[1]], [xs[4], t[2]], [xs[5], t[2]], [xs[6], t[3]], [xs[7], t[3]], [xs[8], t[4]], [xs[9], t[4]]];
    const back = [[xs[9], t[5]], [xs[8], t[5]], [xs[7], t[6]], [xs[6], t[6]], [xs[5], t[7]], [xs[4], t[7]], [xs[3], t[8]], [xs[2], t[8]], [xs[1], t[9]], [xs[0] + 1, t[9]]];
    const poly = (pts, col) => `<polyline points="${pts.map(([px, c]) => `${sx(px)},${sx(y(c))}`).join(' ')}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += arc([t[4], t[5]].sort((a, b) => a - b), '#7a3fb8', 2.2);
    s += poly(back, BLUE) + poly(there, RED);
    // the letters of the way, in the gaps between the parts
    const badge = (x, c, col) => `<rect x="${sx(x - 6.5)}" y="${sx(y(c) - 4.7)}" width="13" height="9.4" rx="2.4" fill="#fff" stroke="${col}" stroke-width="1.1"/>`
      + label(x, y(c) + 2.8, L(c), `font-size="7.6" font-weight="800" fill="${col}" font-family="ui-monospace,Menlo,Consolas,monospace"`);
    const gx = g => (gaps[g][0] + gaps[g][1]) / 2;
    s += badge(gx(4), t[0], RED) + badge(gx(3), t[1], RED) + badge(gx(2), t[2], RED) + badge(gx(1), t[3], RED) + badge(gx(0), t[4], RED);
    s += badge(gx(0), t[5], BLUE) + badge(gx(1), t[6], BLUE) + badge(gx(2), t[7], BLUE) + badge(gx(3), t[8], BLUE) + badge(gx(4), t[9], BLUE);
    return s + '</svg>';
  }

  /** A small picture of a ring: the ring letters over the wires (core), the window over one of them. */
  function ringSvg(T) {
    const ring = 2, win = 4, n = 9, C = 17, x0 = 52, w = x0 + n * C + 4;   // ring C, window E → core C
    let s = `<svg viewBox="0 0 ${w} 50" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escX(T.ringAria)}" font-family="system-ui,Segoe UI,Arial,sans-serif" style="max-width:100%">`;
    s += `<text x="0" y="17" font-size="8.5" fill="#5b6070">${escX(T.ringRow)}</text><text x="0" y="40" font-size="8.5" fill="#5b6070">${escX(T.coreRow)}</text>`;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * C;
      s += `<rect x="${x}" y="5" width="${C - 2}" height="16" rx="2" fill="#fbf6ea" stroke="#c9b27a" stroke-width="0.7"/>`;
      s += `<text x="${x + (C - 2) / 2}" y="17" text-anchor="middle" font-size="10" font-weight="700" font-family="ui-monospace,Menlo,Consolas,monospace">${L(i)}</text>`;
      s += `<rect x="${x}" y="28" width="${C - 2}" height="16" rx="2" fill="#f5f7fb" stroke="#8a90a0" stroke-width="0.7"/>`;
      s += `<text x="${x + (C - 2) / 2}" y="40" text-anchor="middle" font-size="10" fill="#1f5fbf" font-weight="700" font-family="ui-monospace,Menlo,Consolas,monospace">${L(i - ring)}</text>`;
    }
    const x = x0 + win * C;
    s += `<rect x="${x - 2}" y="2" width="${C + 2}" height="45" rx="3" fill="none" stroke="#c0252b" stroke-width="1.6"/>`;
    return s + '</svg>';
  }

  /* ---------- the texts around the drawing ---------- */
  function partsHtml(T, esc, o = {}) {
    const P = T.parts, pr = presses(), first = pr[0];
    const win0 = [...first.win].map(code);
    // where the middle rotor moved, and the right rotor's step just before
    const k = pr.findIndex((p, i) => i && p.win[1] !== pr[i - 1].win[1]);
    const tbl = pressTable(pr, T.stepping, esc, { moved: k });
    const cap = T.stepping.cap('AAAAAA', pr.map(p => p.lamp).join(''), k + 1, `${pr[k - 1].win[1]} → ${pr[k].win[1]}`, `${pr[k - 1].win[2]} → ${pr[k].win[2]}`);
    const block = ([h, p], extra = '') => `<div class="eh-block"><h3>${esc(h)}</h3><p>${esc(p)}</p>${extra}</div>`;
    return `${o.intro === false ? '' : `<p class="eh-intro">${esc(T.intro)}</p>`}
      ${o.figure === false ? '' : `<div class="eh-figure"><h3>${esc(T.diagram.title)}</h3>
        <div class="eh-svg">${diagram(win0, 0, T.diagram)}</div>
        <p class="eh-cap">${esc(T.diagram.cap(first.win, 'A', first.lamp, path(win0, 0)))}</p></div>`}
      <div class="eh-grid">
        ${block(P.rotor)}
        ${block(P.refl)}
        <div class="eh-block eh-wide"><div><h3>${esc(P.step[0])}</h3><p>${esc(P.step[1])}</p></div><div>${tbl}<p class="eh-small">${esc(cap)}</p></div></div>
        ${block(P.plug)}
        ${block(P.ring, `<div class="eh-ring">${ringSvg(T.diagram)}</div><p class="eh-small">${esc(T.diagram.ringCap)}</p>`)}
      </div>`;
  }

  function procHtml(T, esc) {
    const D = T.daily, S = T.sender, R = T.radio;
    const plainSp = 'KEINE BESONDEREN EREIGNISSE';
    const fem = [0, 1, 2].find(i => ind[i] === ind[i + 3]);
    const indHl = [...ind].map((ch, i) => i === fem || i === fem + 3 ? `<u>${ch}</u>` : ch).join('');
    return `<div class="eh-box">
        <h3>${esc(D.title)}</h3><p>${esc(D.text)}</p>
        <table class="eh-keycard"><tr>${D.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>
          <tr><td>${EX.day}</td><td>${EX.order.join(' ')}</td><td>${EX.rings.split('').join(' ')}</td><td>${EX.plug}</td></tr>
          <tr class="eh-other"><td>18</td><td>III I II</td><td>B X F</td><td>CK DQ HS JW OZ RU</td></tr></table>
        <p class="eh-small">${esc(D.note)}</p>
      </div>
      <div class="eh-two">
        <div class="eh-box"><h3>${esc(S.title)}</h3><ol class="eh-ol">${S.steps.map(f => `<li>${esc(f(EX.ground, EX.key, ind))}</li>`).join('')}</ol></div>
        <div class="eh-box"><h3>${esc(R.title)}</h3>
          <div class="eh-radio"><span><b>${EX.ground}</b><i>${esc(R.clear)}</i></span><span><b>${ind}</b><i>${esc(R.ind)}</i></span><span class="eh-body"><b>${groups(cipher)}</b><i>${esc(R.body)}</i></span></div>
          <p class="eh-small">${esc(R.history)}</p></div>
      </div>
      <div class="eh-box"><h3>${esc(T.receiver.title)}</h3><p>${esc(T.receiver.text(EX.ground, ind, EX.key, plainSp, T.meaning))}</p></div>
      <div class="eh-box eh-tip"><h3>${esc(T.weak.title)}</h3><div class="eh-wide eh-plain"><p>${esc(T.weak.text(EX.key[fem], ind, ind[fem], fem + 1)).replace(ind, `<b class="eh-mono">${indHl}</b>`)}</p>
        <div>${pressTable(presses(EX.ground, EX.key + EX.key), T.stepping, esc, { cols: [fem, fem + 3] })}</div></div></div>
      <div class="eh-box"><h3>${esc(T.count.title)}</h3><p>${esc(T.count.text)}</p></div>
      <div class="eh-box"><h3>${esc(T.wiring.title)}</h3><p>${esc(T.wiring.text)}</p>
        <div class="eh-guess">${[[KEYBOARD.join(''), false], ['ABCDEFGHI', true]].map(([from, right], i) => `<p><span>${esc(T.wiring.rows[i])}</span>`
          + `<b class="eh-mono">${[...from.slice(0, 5)].map((ch, j) => `${ch}→${L(j)}`).join(' ')} …</b> <i class="${right ? 'eh-yes">✓' : 'eh-no">✗'}</i></p>`).join('')}</div></div>
      <p class="eh-next">${esc(T.next)}</p>`;
  }

  return { EX, machine, KEYBOARD, presses, ind, cipher, diagram, path, partsHtml, procHtml };
})();
if (typeof module !== 'undefined') module.exports = ENIGMA_HOW;
