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
 *   ENIGMA_HOW.procHtml(T, esc)       → part 2: the daily key, sender, radio, what of the start was secret, receiver,
 *                                        the weak point, the count
 *   ENIGMA_HOW.rejHtml(T, esc, o)     → part 3: how Rejewski found the wiring in 1932 (o.part 'story'), the task — the
 *                                        chains of one 1932 day (o.part 'task'), or both; o.inputs: inputs, for the game;
 *                                        rejAnswer() the task's answer
 *   ENIGMA_HOW.DAY32                  → that day: { ground, keys, inds, ad (place 1 → place 4), chains }
 *   ENIGMA_HOW.plugHtml(T, esc, o)    → part 4: the plugboard (o.part 'story'), the task — through the plugboard at the
 *                                        drawn press (o.part 'task'), or both; o.inputs: inputs, for the game;
 *                                        plugAnswer() the task's answer
 *   ENIGMA_HOW.PLUG                   → that task: { win, pairs, rows, recip, old, twin, twinRows, swap } (rows: key, to the
 *                                        rotors, from the rotors, lamp)
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
    const block = ([h, p], extra = '', cls = '') => `<div class="eh-block${cls}"><h3>${esc(h)}</h3><p>${esc(p)}</p>${extra}</div>`;
    return `${o.intro === false ? '' : `<p class="eh-intro">${esc(T.intro)}</p>`}
      ${o.figure === false ? '' : `<div class="eh-figure"><h3>${esc(T.diagram.title)}</h3>
        <div class="eh-svg">${diagram(win0, 0, T.diagram)}</div>
        <p class="eh-cap">${esc(T.diagram.cap(first.win, 'A', first.lamp, path(win0, 0)))}</p></div>`}
      <div class="eh-grid">
        ${block(P.rotor)}
        ${block(P.refl)}
        <div class="eh-block eh-wide"><div><h3>${esc(P.step[0])}</h3><p>${esc(P.step[1])}</p></div><div>${tbl}<p class="eh-small">${esc(cap)}</p></div></div>
        ${block(P.plug, '', ' eh-full')}
        <div class="eh-block eh-wide"><div><h3>${esc(P.ring[0])}</h3><p>${esc(P.ring[1])}</p></div><div><div class="eh-ring">${ringSvg(T.diagram)}</div><p class="eh-small">${esc(T.diagram.ringCap)}</p></div></div>
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
      <div class="eh-box"><h3>${esc(T.start.title)}</h3><p>${esc(T.start.text(EX.ground, ind, EX.key)).replace(EX.ground, `<b class="eh-mono">${EX.ground}</b>`).replace(ind, `<b class="eh-mono">${ind}</b>`)}</p>
        <p class="eh-small">${esc(T.start.why)}</p></div>
      <div class="eh-box"><h3>${esc(T.receiver.title)}</h3><p>${esc(T.receiver.text(EX.ground, ind, EX.key, plainSp, T.meaning))}</p></div>
      <div class="eh-box eh-tip"><h3>${esc(T.weak.title)}</h3><div class="eh-wide eh-plain"><p>${esc(T.weak.text(EX.key[fem], ind, ind[fem], fem + 1)).replace(ind, `<b class="eh-mono">${indHl}</b>`)}</p>
        <div>${pressTable(presses(EX.ground, EX.key + EX.key), T.stepping, esc, { cols: [fem, fem + 3] })}</div></div></div>
      <div class="eh-box"><h3>${esc(T.count.title)}</h3><p>${esc(T.count.text)}</p></div>`;
  }

  /* ---------- part 3: how Rejewski found the wiring (1932) ---------- */
  /**
   * A day of 1932: one ground setting for every message (it was part of the daily key then), 30 message keys typed twice
   * on the example machine. The first letters of the keys cover A–Z, so the places 1 → 4 give a whole permutation (AD);
   * it is a product of two swaps in pairs, so its chains (cycles) come in pairs of the same length.
   */
  function day1932() {
    let x = 1932;
    const rnd = () => { x = (Math.imul(x, 1103515245) + 12345) >>> 0; return x / 4294967296; };
    const first = [...Array(26).keys()];
    for (let i = 25; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [first[i], first[j]] = [first[j], first[i]]; }
    for (let i = 0; i < 4; i++) first.splice(Math.floor(rnd() * first.length), 0, Math.floor(rnd() * 26));
    const ground = 'BLA', keys = first.map(f => L(f) + L(Math.floor(rnd() * 26)) + L(Math.floor(rnd() * 26)));
    const inds = keys.map(k => machine.encrypt(ground, k + k)), ad = Array(26).fill(-1);
    for (const s of inds) ad[code(s[0])] = code(s[3]);
    const seen = new Set(), chains = [];
    for (let a = 0; a < 26; a++) {
      if (seen.has(a)) continue;
      let c = '';
      for (let b = a; !seen.has(b); b = ad[b]) { seen.add(b); c += L(b); }
      chains.push(c);
    }
    return { ground, keys, inds, ad, chains };
  }
  const DAY32 = day1932();

  /** The two ways the entry drum could be wired: in keyboard order (commercial Enigma) or A→A, B→B… (military). */
  const guessFig = (rows, esc) => `<div class="eh-guess">${[[KEYBOARD.join(''), false], ['ABCDEFGHI', true]].map(([from, right], i) => `<p><span>${esc(rows[i])}</span>`
    + `<b class="eh-mono">${[...from.slice(0, 5)].map((ch, j) => `${ch}→${L(j)}`).join(' ')} …</b> <i class="${right ? 'eh-yes">✓' : 'eh-no">✗'}</i></p>`).join('')}</div>`;

  /** Part 3: the story in steps (o.part 'story'), the task — the chains of one 1932 day (o.part 'task'), or both; o.inputs: inputs in the table, for the game. */
  function rejHtml(T, esc, o = {}) {
    const R = T.rej, K = R.task, d = DAY32;
    // the story in steps; the last one (the day's fingerprint) runs the full width, it leads to the task
    const step = ([h, p], i) => `<div class="eh-block${i === R.steps.length - 1 ? ' eh-finger' : ''}"><h3>${esc(h)}</h3><p>${esc(p)}</p>${i === R.guessStep ? guessFig(R.rows, esc) : ''}</div>`;
    const story = `<p class="eh-intro">${esc(R.intro)}</p>
      <div class="eh-grid">${R.steps.slice(0, -1).map(step).join('')}</div>
      ${step(R.steps[R.steps.length - 1], R.steps.length - 1)}`;
    const msgs = d.inds.map((s, i) => `<span><i>${String(i + 1).padStart(2, '0')}</i> ${s.slice(0, 3)} ${s.slice(3)}</span>`).join('');
    const cell = i => o.inputs ? `<td><input data-l="${i}" maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="${esc(K.row4)} ${L(i)}"></td>` : '<td></td>';
    const table = `<table class="eh-chain"><tr><th>${esc(K.row1)}</th>${Array.from({ length: 26 }, (_, i) => `<th>${L(i)}</th>`).join('')}</tr>`
      + `<tr><th>${esc(K.row4)}</th>${Array.from({ length: 26 }, (_, i) => cell(i)).join('')}</tr></table>`;
    const lines = n => Array.from({ length: n }, () => '<p class="eh-lines"><span></span></p>').join('');
    // a worked start: the first message, then the one that begins with its 4th letter
    const n = i => String(i + 1).padStart(2, '0'), sp = x => `${x.slice(0, 3)} ${x.slice(3)}`;
    const i1 = 0, b = d.inds[i1][3], i2 = d.inds.findIndex(x => x[0] === b);
    const start = K.ex(n(i1), sp(d.inds[i1]), n(i2), sp(d.inds[i2]), d.inds[i1][0], b, d.inds[i2][3]);
    const task = `<div class="eh-box eh-tip">${o.part === 'task' ? '' : `<h3>${esc(K.title)}</h3>`}<p>${esc(K.text(d.ground))}</p>
        <p class="eh-start">✏️ ${esc(start)}</p>
        <p class="eh-small">💡 ${esc(K.why)}</p>
        <div class="eh-msgs">${msgs}</div>
        <div class="eh-chainwrap">${table}</div>
        ${o.inputs ? '' : `<h3>${esc(K.chains)}</h3>${lines(4)}<h3>${esc(K.lengths)}</h3>${lines(1)}`}
      </div>`;
    return o.part === 'story' ? story : o.part === 'task' ? task : story + task;
  }
  /** The task's answer: the chains and their lengths, longest first. */
  const rejAnswer = () => ({ chains: DAY32.chains.map(c => `(${c})`).join(' '), lengths: DAY32.chains.map(c => c.length).sort((a, b) => b - a).join(', ') });

  /* ---------- part 4: the plugboard ---------- */
  const plugSwap = plug => {
    const s = Array.from({ length: 26 }, (_, i) => i);
    for (const p of plug.split(' ')) { s[code(p[0])] = code(p[1]); s[code(p[1])] = code(p[0]); }
    return s;
  };
  /**
   * The task: the press drawn on page 1 (windows ADU). R = what the rotors and the reflector do there without cables
   * (13 pairs); a row is key → to the rotors → from the rotors → lamp. The twin: the first cable (A–Q) taken out and
   * R(A)–R(Q) put in gives the same lamps at this press — one press cannot tell the two cables apart.
   */
  const PLUG = (() => {
    const win = [...presses()[0].win].map(code), R = Z.machine(EX.order, EX.rings, '').perm(win), swap = plugSwap(EX.plug);
    const pairs = [];
    R.forEach((o, c) => { if (c < o) pairs.push(L(c) + L(o)); });
    const row = (s, k) => [k, s[k], R[s[k]], s[R[s[k]]]].map(L);
    const old = EX.plug.split(' ')[0], twin = [R[code(old[0])], R[code(old[1])]].sort((a, b) => a - b).map(L).join('');
    const twinKeys = [...old + twin].sort(), sw2 = plugSwap(EX.plug.replace(old, twin));
    const rows = [...'ADEKMOQW'].map(ch => row(swap, code(ch)));
    // the rows whose lamp is another row's key: they come in pairs (A → W and W → A)
    const recip = rows.filter(r => r[0] < r[3] && rows.some(x => x[0] === r[3])).map(r => [r[0], r[3]]);
    return { win: win.map(L).join(''), winN: win, pairs, swap, old, twin, rows, recip, twinRows: twinKeys.map(ch => row(sw2, code(ch))) };
  })();
  /** Ways to plug n cables into 26 sockets: 26! / ((26 − 2n)! · n! · 2ⁿ). */
  function ways(n) {
    let x = 1n;
    for (let i = 0; i < n; i++) x = x * BigInt(26 - 2 * i) * BigInt(25 - 2 * i) / 2n;
    for (let i = 2; i <= n; i++) x /= BigInt(i);
    return x;
  }

  /** The front of the plugboard: 26 sockets in keyboard order, two holes each, the example's cables (the first one red). */
  function plugSvg(F) {
    const W = 640, H = 178, dx = 64, x0 = [64, 96, 64], y0 = [34, 80, 126], at = {};
    KEYBOARD.forEach((r, i) => [...r].forEach((ch, j) => { at[ch] = [x0[i] + j * dx, y0[i]]; }));
    const cables = EX.plug.split(' '), plugged = new Set(cables.join(''));
    const COLS = [RED, '#2f6f4f', '#7a3fb8', '#b5651d', BLUE, '#5b6070'];
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escX(F.aria(EX.plug))}" font-family="system-ui,Segoe UI,Arial,sans-serif">`;
    s += `<rect x="8" y="6" width="${W - 16}" height="${y0[2] + 26}" rx="8" fill="#f3efe6" stroke="#8a90a0" stroke-width="1"/>`;
    for (const ch of KEYBOARD.join('')) {
      const [x, y] = at[ch];
      s += `<text x="${x}" y="${y - 9}" text-anchor="middle" font-size="11" font-weight="${plugged.has(ch) ? 800 : 500}" fill="#1B1B1F" font-family="ui-monospace,Menlo,Consolas,monospace">${ch}</text>`;
      s += `<rect x="${x - 12}" y="${y - 4}" width="24" height="14" rx="3" fill="#fff" stroke="#b9bfcc" stroke-width="0.8"/>`;
      s += `<circle cx="${x - 5}" cy="${y + 3}" r="3.2" fill="#1B1B1F"/><circle cx="${x + 5}" cy="${y + 3}" r="2.2" fill="#1B1B1F"/>`;
    }
    cables.forEach((p, i) => {
      const [a, b] = [at[p[0]], at[p[1]]], sag = Math.max(a[1], b[1]) + 30 + Math.abs(a[0] - b[0]) * 0.05;
      s += `<path d="M${a[0]} ${a[1] + 10} C ${a[0]} ${sx(sag)}, ${b[0]} ${sx(sag)}, ${b[0]} ${b[1] + 10}" fill="none" stroke="${COLS[i % COLS.length]}" stroke-width="${i ? 2.6 : 3.4}" stroke-linecap="round" opacity="0.9"/>`;
      for (const [x, y] of [a, b]) s += `<rect x="${x - 10}" y="${y - 3}" width="20" height="13" rx="3" fill="${COLS[i % COLS.length]}" stroke="#1B1B1F" stroke-width="0.8"/>`;
    });
    return s + '</svg>';
  }

  /** Part 4: the plugboard (o.part 'story'), the task (o.part 'task'), or both; o.inputs: inputs, for the game. */
  function plugHtml(T, esc, o = {}) {
    const P = T.plug, F = P.fig, K = P.task, X = PLUG;
    const block = ([h, p], extra = '') => `<div class="eh-block"><h3>${esc(h)}</h3><p>${esc(p)}</p>${extra}</div>`;
    const free = X.swap.filter((x, i) => x === i).length;
    const strip = `<table class="eh-strip"><tr><th>${esc(F.rowIn)}</th>${X.swap.map((_, i) => `<td>${L(i)}</td>`).join('')}</tr>`
      + `<tr><th>${esc(F.rowOut)}</th>${X.swap.map((x, i) => `<td${x === i ? '' : ' class="eh-sw"'}>${L(x)}</td>`).join('')}</tr></table>`;
    const t = machine.trace(X.winN, code(X.rows[0][0]));
    const num = n => ways(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, P.sep);
    const count = `<table class="eh-ways"><tr><th>${esc(P.count.cols[0])}</th><th>${esc(P.count.cols[1])}</th></tr>`
      + [1, 6, 8, 10, 11, 13].map(n => `<tr${n === 11 ? ' class="eh-max"' : ''}><td>${n}</td><td>${num(n)}</td></tr>`).join('') + '</table>';
    // the example message of page 2 typed on a double without cables: the letters that come out right, and E → Y
    const bare = Z.machine(EX.order, EX.rings, '').encrypt(EX.key, cipher);
    const right = [...bare].filter((ch, i) => ch === EX.plain[i]).length;
    const freq = {};
    for (const ch of EX.plain) if (X.swap[code(ch)] !== code(ch)) freq[ch] = (freq[ch] || 0) + 1;
    const p = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0], q = L(X.swap[code(p)]);
    const asQ = [...EX.plain].filter((ch, i) => ch === p && bare[i] === q).length;
    const demoRow = (h, txt, mark) => `<tr><th>${esc(h)}</th>${[...txt].map((ch, i) => `<td${mark && ch === EX.plain[i] ? ' class="eh-ok"' : mark && EX.plain[i] === p && ch === q ? ' class="eh-eq"' : ''}>${ch}</td>`).join('')}</tr>`;
    const demo = `<div class="eh-chainwrap"><table class="eh-demo">${demoRow(P.find.rows[0], cipher)}${demoRow(P.find.rows[1], bare, true)}${demoRow(P.find.rows[2], EX.plain)}</table></div>`;
    const story = `<p class="eh-intro">${esc(P.intro)}</p>
      <div class="eh-figure"><h3>${esc(F.title)}</h3><div class="eh-plugsvg">${plugSvg(F)}</div>
        <div class="eh-chainwrap">${strip}</div>
        <p class="eh-cap">${esc(F.cap(EX.plug, free))}</p></div>
      <div class="eh-grid">
        ${block(P.blocks[0])}
        ${block([P.twice[0], P.twice[1](L(t[0]), L(t[1]), path(X.winN, t[0]), L(t[8]), L(t[9]))])}
        ${block(P.blocks[1])}
        ${block(P.blocks[2])}
        ${block([P.count.title, P.count.text], `${count}<p class="eh-small">${esc(P.count.note)}</p>`)}
        ${block(P.blocks[3])}
      </div>
      <div class="eh-block eh-finger"><h3>${esc(P.find.title)}</h3><p>${esc(P.find.text)}</p>${demo}
        <p class="eh-small">${esc(P.find.cap(right, EX.plain.length, p, q, asQ, freq[p]))}</p></div>`;

    // the task
    const cell = (k, v) => o.inputs ? `<td><input data-${k} maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="${esc(v)}"></td>` : '<td></td>';
    const table = (rows, k, filled) => `<table class="eh-ptable"><tr>${K.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>`
      + rows.map((r, i) => `<tr><th>${r[0]}</th>${r.slice(1).map((x, j) => i < filled ? `<td class="eh-done">${x}</td>` : cell(`${k}="${i},${j + 1}"`, `${r[0]}: ${K.cols[j + 1]}`)).join('')}</tr>`).join('') + '</table>';
    const lines = n => o.inputs ? '' : Array.from({ length: n }, () => '<p class="eh-lines"><span></span></p>').join('');
    const r0 = X.rows[0], back = r0[2], lamp = r0[3];
    const [a, b] = X.recip;
    const q1 = K.q1(a[0], a[1], b[0], b[1]);
    const task = `<div class="eh-box eh-tip">${o.part === 'task' ? '' : `<h3>${esc(K.title)}</h3>`}<p>${esc(K.text(X.win, EX.plug))}</p>
        <h3>${esc(K.pairsTitle(X.win))}</h3>
        <div class="eh-pairs">${X.pairs.map(pr => `<span>${pr[0]} ↔ ${pr[1]}</span>`).join('')}</div>
        <p class="eh-start">✏️ ${esc(K.ex(r0[0], r0[1], back, lamp, back !== lamp))}</p>
        ${table(X.rows, 'p', 1)}
        <p>${esc(q1)}</p>${lines(1)}
      </div>
      <div class="eh-box"><h3>${esc(K.twinTitle)}</h3><p>${esc(K.twin(`${X.old[0]}–${X.old[1]}`, `${X.twin[0]}–${X.twin[1]}`))}</p>
        ${table(X.twinRows, 't', 0)}
        <p>${esc(K.q2)}</p>${lines(2)}
      </div>
      <p class="eh-small">💡 ${esc(K.why)}</p>
      ${o.inputs ? '' : `<p class="eh-next">${esc(T.next)}</p>`}`;
    return o.part === 'story' ? story : o.part === 'task' ? task : story + task;
  }
  /** The task's answer, as one text in the language of T. */
  function plugAnswer(T) {
    const X = PLUG, f = r => `${r[0]} → ${r[1]} → ${r[2]} → ${r[3]}`;
    return T.plug.task.key(X.rows.slice(1).map(f).join(', '), X.recip.map(([a, b]) => `${a} ↔ ${b}`).join(', '),
      X.twinRows.map(r => `${r[0]} → ${r[3]}`).join(', '), `${X.old[0]}–${X.old[1]}`, `${X.twin[0]}–${X.twin[1]}`);
  }

  return { EX, machine, KEYBOARD, presses, ind, cipher, diagram, path, partsHtml, procHtml, rejHtml, rejAnswer, DAY32, plugHtml, plugAnswer, PLUG, ways };
})();
if (typeof module !== 'undefined') module.exports = ENIGMA_HOW;
