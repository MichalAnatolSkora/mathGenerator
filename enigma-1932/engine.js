/**
 * The Real Enigma 1932 (Prawdziwa Enigma 1932), part 5 of the Young Codebreakers Academy: a paper Enigma I,
 * the army machine Marian Rejewski broke in December 1932. Classic script; defines the global `E32` (and
 * module.exports for node tests). Needs ZYG (../zygalski-sheets/engine.js) for the machine itself.
 *
 * The paper machine is four wheels on one split pin, biggest at the bottom, so every wheel shows only its outer
 * band: the black wheel (keyboard and lamps, fixed), the right, middle and left rotor (I, II, III, real wiring and
 * notches) and, on top, the small mirror (reflector B, fixed, its wires drawn). A separate card is the plugboard (6 cables).
 *
 * A "spot" is one of the 26 directions from the pin, named by the black letter there. A rotor's band has the
 * alphabet (black letters, inside) and, over each black letter at the edge, the letter it is wired to (coloured),
 * with a white path between the two rows. With the rotor showing window letter k, spot p has black letter p + k, so
 * "read the coloured letter, go along the white path to the same black letter" moves the current from spot p to
 * W(p + k) − k, exactly a real rotor (rings at A). The current meets the coloured row first on the way in and the
 * black row first on the way back, so it never turns back on a wheel. The mirror has its 13 wires drawn on it.
 * `paper()` does this by hand and the tests compare it with ZYG.machine. Every letter on the pages comes from the
 * machine, never typed.
 *
 * All text lives in strings.js (E32.TEXT[lang]); a text is a string or a function of the values `v`.
 * Light markup: **bold** and {{code letters}}.
 */
const E32 = (() => {
  const Z = typeof ZYG !== 'undefined' ? ZYG : require('../zygalski-sheets/engine.js');
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', L = i => ALPHA[((i % 26) + 26) % 26], C = ch => ch.charCodeAt(0) - 65;
  const mod = x => ((x % 26) + 26) % 26, TH = 360 / 26;
  const groupDigits = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const TOTAL = 10, DEFAULT_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // ---------- the day's key and the message ----------
  /**
   * Rotors left → right, the window letters to start from, the plugboard cables, the message to decipher. The start
   * and the cables are chosen so that the first letter, drawn on pages 2 and 3, takes short steps on every wheel and its way to
   * the mirror and back never shares a place on a wheel (the path stays readable); its last step uses the first cable.
   */
  const KEY = { order: ['I', 'II', 'III'], start: 'SSQ', plug: 'JR EM KS PW BX CZ', plain: 'REJEWSKI' };
  const M = Z.machine(KEY.order, 'AAA', KEY.plug);
  const CODE = M.encrypt(KEY.start, KEY.plain);
  /** The window after each key press, and the way of every code letter typed (deciphering). */
  const WINS = [], TRACES = [];
  { let w = [...KEY.start].map(C); for (const ch of CODE) { w = M.step(w); WINS.push(w.map(L).join('')); TRACES.push(M.trace(w, C(ch))); } }
  const CABLES = KEY.plug.split(' ');
  const swap = Array.from({ length: 26 }, (_, i) => i);
  CABLES.forEach(([a, b]) => { swap[C(a)] = C(b); swap[C(b)] = C(a); });
  const cableOf = ch => CABLES.findIndex(c => c.includes(ch));
  const W = name => Z.ROTORS[name][0], NOTCH = name => C(Z.ROTORS[name][1]);

  /**
   * The kid's procedure on the paper wheels, step by step with the printed letters: turn first (check, then turn),
   * plugboard, the black wheel, in through the rotors (coloured → same black), the mirror, out (black → same
   * coloured), plugboard. Returns the lamps. Must equal ZYG.machine(order, 'AAA', plug).encrypt(start, text).
   */
  function paper(order, start, plug, text) {
    const sw = {};
    for (const [a, b] of plug.split(' ').filter(Boolean)) { sw[a] = b; sw[b] = a; }
    const pb = ch => sw[ch] || ch;
    let [l, m, r] = [...start].map(C);
    const N = order.map(NOTCH);
    const ring = (wires, k) => ({
      black: p => L(p + k), coloured: p => wires[mod(p + k)],
      findBlack: ch => mod(C(ch) - k), findColoured: ch => mod(wires.indexOf(ch) - k),
    });
    let out = '';
    for (const ch of text) {
      const turnMiddle = r === N[2] || m === N[1], turnLeft = m === N[1];
      r = mod(r + 1); if (turnMiddle) m = mod(m + 1); if (turnLeft) l = mod(l + 1);
      const rotors = [ring(W(order[2]), r), ring(W(order[1]), m), ring(W(order[0]), l)], mirror = ring(Z.REFLECTOR_B, 0);
      let spot = C(pb(ch));
      for (const w of rotors) spot = w.findBlack(w.coloured(spot));
      spot = mirror.findBlack(mirror.coloured(spot));
      for (const w of rotors.slice().reverse()) spot = w.findColoured(w.black(spot));
      out += pb(L(spot));
    }
    return out;
  }

  /** Ways to plug n cables into 26 sockets: 26! / ((26 − 2n)! · n! · 2ⁿ). */
  function ways(n) {
    let f = 1n;
    for (let i = 0; i < n; i++) f = f * BigInt(26 - 2 * i) * BigInt(25 - 2 * i) / 2n / BigInt(i + 1);
    return f;
  }

  /**
   * What the child reads and looks for at one key press, as letters: the key, the black letter after the plugboard,
   * on the way in the letter of each rotor and of the mirror (the coloured letter read is the black one looked for),
   * on the way out the letter of each rotor (the black letter read is the coloured one looked for), the black letter at
   * the end and the lamp. win = window letters [left, middle, right] (numbers), t = ZYG machine.trace.
   * A rotor at window k has black letter p + k at spot p; the mirror does not turn.
   */
  function kidSteps(win, t) {
    const [kL, kM, kR] = win;
    return [t[0], t[1], t[2] + kR, t[3] + kM, t[4] + kL, t[5], t[5] + kL, t[6] + kM, t[7] + kR, t[8], t[9]].map(L);
  }
  const STEPS = TRACES.map((t, i) => kidSteps([...WINS[i]].map(C), t));

  /** Every letter, word and number the texts need. */
  function values() {
    const t = TRACES[0], st = STEPS[0], mid = WINS.findIndex(w => w[1] !== KEY.start[1]);
    return {
      order: KEY.order, start: KEY.start, plug: KEY.plug, plain: KEY.plain, code: CODE, nCables: CABLES.length, cable0: CABLES[0],
      win1: WINS[0], exKey: st[0], exPlug: st[1], exWire: L(t[1] + C(WINS[0][2])), exRead: st[2], exRead2: st[3], exBack: st[9], exLamp: st[10], inCable: t[0] !== t[1], outCable: t[8] !== t[9],
      midTurn: mid + 1, midFrom: mid > 0 ? WINS[mid - 1] : KEY.start, midTo: WINS[mid],
      notches: KEY.order.map(n => Z.ROTORS[n][1]),   // left, middle, right
      ways: groupDigits(ways(CABLES.length)), n3: groupDigits(26 ** 3), total: groupDigits(6n * 26n ** 3n * ways(CABLES.length)),
    };
  }

  /** "?pages=1-3,6" → [1, 2, 3, 6]. Unknown parts are ignored; nothing valid → every page. */
  function parsePages(str) {
    const set = new Set();
    for (const part of String(str || '').split(',')) {
      const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) continue;
      const a = +m[1], b = m[2] === undefined ? a : +m[2];
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) if (i >= 1 && i <= TOTAL) set.add(i);
    }
    return set.size ? [...set].sort((x, y) => x - y) : DEFAULT_PAGES.slice();
  }
  /** [1,2,3,6] → "1-3,6" */
  function formatPages(list) {
    const out = [];
    for (let i = 0; i < list.length; i++) {
      let j = i;
      while (j + 1 < list.length && list[j + 1] === list[j] + 1) j++;
      out.push(j > i ? `${list[i]}-${list[j]}` : `${list[i]}`);
      i = j;
    }
    return out.join(',');
  }

  const TEXT = {};
  const textFor = lang => TEXT[lang] || TEXT.pl;

  // ================= DOM builders (browser only) =================
  const SVGNS = 'http://www.w3.org/2000/svg';
  function el(ns, tag, attrs, kids) {
    const e = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null && v !== false) e.setAttribute(k, v);
    const add = k => {
      if (k == null || k === false) return;
      if (Array.isArray(k)) k.forEach(add);
      else e.appendChild(typeof k === 'object' ? k : document.createTextNode(String(k)));
    };
    add(kids);
    return e;
  }
  const h = (tag, attrs, ...kids) => el(null, tag, attrs, kids);
  const s = (tag, attrs, ...kids) => el(SVGNS, tag, attrs, kids);
  /** **bold** and {{code letters}}, as in ../enigma/strings.js (never HTML). */
  function rich(str) {
    return String(str).split(/(\*\*[^*]+\*\*|\{\{[^}]+\}\})/).filter(Boolean).map(x =>
      x.startsWith('**') ? h('b', null, rich(x.slice(2, -2))) : x.startsWith('{{') ? h('span', { class: 'ams-l' }, x.slice(2, -2)) : document.createTextNode(x));
  }

  const INK = '#1B1B1F', RED = '#B3261E', BLUE = '#1E5AA8', GREY = '#4A4A55';
  /** The cables, on the plugboard panel and on the plugboard ring: never red or blue, the colours of the current. */
  const CABLE_COLORS = ['#D9822B', '#2F6F4F', '#8E44AD', '#A67C00', '#00838F', '#6D4C41'];
  /**
   * The wheels, outer to inner. R = disc radius (mm), rIn = where the next disc covers it. A rotor's band has the
   * coloured letters at the edge (col), then a white path (lane), then the black letters (blk): the current comes in at
   * the coloured letter, goes along the white path (the wire inside the rotor) to the same black letter and on inwards,
   * and on the way back the other way round, so it never turns back on a wheel. The plugboard ring reads the same way
   * but does not turn: over a letter with a cable, the cable's other end on a chip in the cable's colour; over a letter
   * without one, an empty slot (the current goes straight on). The mirror has one ring of letters and its 13 wires drawn
   * across its face (they start at wireR). No wheel uses red or blue, the colours of the current.
   */
  const PARTS = {
    frame: { R: 87.5, rIn: 79, blk: 83.25, fs: 5.4 },
    plug: { R: 79, rIn: 66, col: 75.6, lane: 72.3, blk: 69, fs: 4.6, fsc: 4.4, color: '#4A4A55', tint: '#EFEDE8' },
    right: { rotor: 2, R: 66, rIn: 53, col: 62.6, lane: 59.3, blk: 56, fs: 4.6, fsc: 4.2, color: '#3B6E1F', tint: '#E8F2DD' },
    middle: { rotor: 1, R: 53, rIn: 40, col: 49.6, lane: 46.3, blk: 43, fs: 4.4, fsc: 4, color: '#8A4B0F', tint: '#F7EADB' },
    left: { rotor: 0, R: 40, rIn: 27, col: 36.6, lane: 33.3, blk: 30, fs: 4.2, fsc: 3.8, color: '#6A3DA8', tint: '#EEE6F8' },
    mirror: { R: 27, rIn: 21.4, blk: 23.7, wireR: 20.6, fs: 3.6, color: '#0E6670', tint: '#DCEFF0' },
  };
  const LANE_W = 2.4;
  const ROT = ['right', 'middle', 'left'], ORDER_OUT_IN = ['frame', 'plug', 'right', 'middle', 'left', 'mirror'];
  /** The wheels with two rows and a white path: the plugboard ring and the rotors. */
  const BANDED = ['plug', ...ROT];
  const wiring = part => part === 'mirror' ? [...Z.REFLECTOR_B] : [...W(KEY.order[PARTS[part].rotor])];
  /** The mirror's 13 wires: pairs of places [a, b], a < b. */
  const MIRROR_PAIRS = [...Z.REFLECTOR_B].map((ch, i) => [i, C(ch)]).filter(([a, b]) => a < b);

  const pol = (r, deg) => { const a = deg * Math.PI / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };
  const f2 = x => x.toFixed(2);
  /** The sector of spot 0 (the window) between radii r1 and r2. */
  function sector(r1, r2) {
    const [a, b] = [pol(r2, -TH / 2), pol(r2, TH / 2)], [c, d] = [pol(r1, TH / 2), pol(r1, -TH / 2)];
    return `M${f2(a[0])} ${f2(a[1])}A${r2} ${r2} 0 0 1 ${f2(b[0])} ${f2(b[1])}L${f2(c[0])} ${f2(c[1])}A${r1} ${r1} 0 0 0 ${f2(d[0])} ${f2(d[1])}Z`;
  }
  /** One mirror wire between places a and b, bent towards the pin so that neighbours make small loops. */
  function mirrorWire(a, b, r) {
    const [p, q] = [pol(r, a * TH), pol(r, b * TH)];
    return `M${f2(p[0])} ${f2(p[1])}Q${f2((p[0] + q[0]) * 0.35)} ${f2((p[1] + q[1]) * 0.35)} ${f2(q[0])} ${f2(q[1])}`;
  }

  /**
   * One wheel in its own frame (letter i at i·TH degrees clockwise from the top), as two layers: `bg` (the disc,
   * the tinted band, the white path, the spot lines, the mirror's wires, the marks of the worked example) and `fg`
   * (letters, notch, labels), so that the drawn way of the current can go between them and never cover a letter.
   * marks: [{ ring: 'col'|'blk', i, color }]; on the mirror the wire between two marked letters is drawn thick.
   * labels: the texts printed on a wheel to cut out (null: none); the mirror's go under it.
   * blank: the plugboard ring with empty boxes, for your own cables.
   */
  function wheelLayers(part, marks, labels, blank) {
    const P = PARTS[part], bg = [], fg = [], isRotor = ROT.includes(part), banded = BANDED.includes(part), wires = isRotor ? wiring(part) : null;
    bg.push(s('circle', { r: P.R, fill: '#fff', stroke: INK, 'stroke-width': labels ? 0.6 : 0.45 }));
    if (banded) bg.push(s('circle', { r: f2((P.R + P.rIn) / 2), fill: 'none', stroke: P.tint, 'stroke-width': P.R - P.rIn }));
    if (part === 'mirror') bg.push(s('circle', { r: P.R - 0.25, fill: P.tint }));
    if (part === 'frame') bg.push(s('path', { d: sector(P.rIn + 0.4, P.R - 0.8), fill: '#FFF1BF', stroke: RED, 'stroke-width': 0.5 }));
    if (part !== 'mirror') bg.push(s('circle', { r: P.rIn, fill: 'none', stroke: '#9A9488', 'stroke-width': 0.3, 'stroke-dasharray': '1.2 1' }));
    // the spot lines: 26 narrow wedges, which line up on every wheel
    for (let i = 0; i < 26; i++) bg.push(s('line', { x1: 0, y1: -P.rIn, x2: 0, y2: -P.R + 0.3, stroke: '#B8B2A6', 'stroke-width': 0.3, transform: `rotate(${f2((i + 0.5) * TH)})` }));
    // the white path: the inside of the rotor, where the wires run
    if (banded) bg.push(s('circle', { r: P.lane, fill: 'none', stroke: '#fff', 'stroke-width': LANE_W }));
    if (part === 'mirror') {
      const hit = (marks || []).map(m => m.i);
      for (const [a, b] of MIRROR_PAIRS) {
        const used = hit.includes(a) && hit.includes(b);
        bg.push(s('path', { d: mirrorWire(a, b, P.wireR), fill: 'none', stroke: P.color, 'stroke-width': used ? 1 : 0.4, 'stroke-opacity': used ? 1 : 0.7, 'stroke-linecap': 'round' }));
      }
      for (let i = 0; i < 26; i++) { const [x, y] = pol(P.wireR, i * TH); bg.push(s('circle', { cx: f2(x), cy: f2(y), r: 0.45, fill: P.color })); }
    }
    for (const m of marks || []) {
      const [x, y] = pol(P[m.ring], m.i * TH), size = m.ring === 'col' ? P.fsc : P.fs;
      bg.push(s('circle', { cx: f2(x), cy: f2(y), r: f2(size * 0.64), fill: m.color === RED ? '#FADAD6' : '#D8E6F8', stroke: m.color, 'stroke-width': 0.55 }));
    }
    const notch = isRotor ? NOTCH(KEY.order[P.rotor]) : -1;
    /** A letter on a ring; M and W are underlined, so they are not mixed up upside down. */
    const letter = (ch, i, r, size, fill) => {
      const rot = `rotate(${f2(i * TH)})`;
      fg.push(s('text', { transform: rot, y: -r, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size, class: 're-wl', fill }, ch));
      if (ch === 'M' || ch === 'W') fg.push(s('path', { d: `M${f2(-size * 0.3)} ${f2(-r + size * 0.5)}H${f2(size * 0.3)}`, stroke: fill, 'stroke-width': 0.35, transform: rot }));
    };
    for (let i = 0; i < 26; i++) {
      letter(L(i), i, P.blk, P.fs, INK);
      if (wires) letter(wires[i], i, P.col, P.fsc, P.color);
    }
    if (part === 'plug') {   // over a letter with a cable its other end on a chip in the cable's colour; else an empty slot
      for (let i = 0; i < 26; i++) {
        const rot = `rotate(${f2(i * TH)})`, c = cableOf(L(i)), y = -P.col;
        if (blank) fg.push(s('rect', { x: -2.6, y: f2(y - 2.6), width: 5.2, height: 5.2, rx: 0.8, fill: '#fff', stroke: '#9A9488', 'stroke-width': 0.3, transform: rot }));
        else if (c >= 0) {
          fg.push(s('rect', { x: -2.7, y: f2(y - 2.7), width: 5.4, height: 5.4, rx: 1, fill: CABLE_COLORS[c], transform: rot }));
          letter(L(swap[i]), i, P.col, P.fsc, '#fff');
        } else fg.push(s('circle', { cy: f2(y), r: 0.5, fill: '#9A9488', transform: rot }));
      }
    }
    if (isRotor) fg.push(s('path', { d: `M-1.6 ${-P.R}L0 ${-P.R + 1.4}L1.6 ${-P.R}Z`, fill: RED, transform: `rotate(${f2(notch * TH)})` }));   // the notch, at the edge over the coloured letter
    if (part === 'frame') fg.push(s('path', { d: `M-2 ${-P.R + 0.9}L2 ${-P.R + 0.9}L0 ${-P.R + 3.6}Z`, fill: RED }));
    if (part === 'mirror') fg.push(s('path', { d: `M-1.5 ${-P.R + 0.25}L1.5 ${-P.R + 0.25}L0 ${-P.R + 1.75}Z`, fill: RED }));
    if (part === 'plug') fg.push(s('path', { d: `M-1.6 ${-P.R + 0.25}L1.6 ${-P.R + 0.25}L0 ${-P.R + 1.65}Z`, fill: RED }));
    if (labels) {
      const lab = (y, txt, size, fill, bold) => fg.push(s('text', { y, 'text-anchor': 'middle', 'font-size': size, class: bold ? 'ams-wt' : 'ams-wt2', fill }, txt));
      if (part === 'frame') {
        lab(-24, labels[0], 5, INK, 1); lab(-17.5, labels[1], 3.8, GREY); lab(-11, labels[2], 3.8, GREY); lab(22, labels[3], 3.6, RED);
      } else if (isRotor) {
        const top = -P.rIn + (part === 'left' ? 9 : 11), big = part === 'left' ? 3.6 : 4.2;
        lab(top, labels[0], big, P.color, 1); lab(top + 5, labels[1], 3.2, GREY); lab(top + 10, labels[2], 3.2, RED);
      } else if (part === 'plug') {
        lab(-40, labels[0], 5, INK, 1); labels.slice(1, -1).forEach((x, i) => lab(-32 + i * 6.5, x, 3.8, GREY)); lab(-32 + (labels.length - 2) * 6.5, labels[labels.length - 1], 3.8, RED);
      } else {
        lab(P.R + 5.2, labels[0], 4, P.color, 1); lab(P.R + 9.6, labels[1], 3.2, GREY); lab(P.R + 13.6, labels[2], 3.2, RED);
      }
      fg.push(s('path', { d: part === 'mirror' ? 'M-1.5 0H1.5M0 -1.5V1.5' : 'M-2.5 0H2.5M0 -2.5V2.5', stroke: INK, 'stroke-width': 0.35 }));
    }
    return { bg, fg };
  }

  /**
   * The assembled machine showing window `win` ([left, middle, right] numbers), `sizeMm` wide. With a trace t
   * (ZYG machine.trace: spots after key, plugboard, right, middle, left, mirror, left, middle, right, lamp) it draws
   * the way of the current, red to the mirror, blue back, and rings the letters read: a rotor at window k has black
   * letter p + k at spot p. On a rotor the way runs along the white path, red just outside its middle, blue just inside.
   */
  function assembled(win, t, sizeMm, label) {
    const k = { frame: 0, left: win[0], middle: win[1], right: win[2], mirror: 0 };
    const marks = { frame: [], plug: [], right: [], middle: [], left: [], mirror: [] }, way = [];
    if (t) {
      // the plugboard ring: in from the key (spot t0) to spot t1, back from spot t8 to the lamp (spot t9)
      marks.plug.push({ ring: 'col', i: t[0], color: RED }, { ring: 'blk', i: t[1], color: RED }, { ring: 'blk', i: t[8], color: BLUE }, { ring: 'col', i: t[9], color: BLUE });
      ROT.forEach((p, i) => {   // in: the coloured letter at spot t[i+1], the same black one is at spot t[i+2]
        marks[p].push({ ring: 'col', i: mod(t[i + 1] + k[p]), color: RED }, { ring: 'blk', i: mod(t[i + 2] + k[p]), color: RED });
      });
      ['left', 'middle', 'right'].forEach((p, i) => {   // back: the black letter at spot t[i+5], the same coloured one is at spot t[i+6]
        marks[p].push({ ring: 'blk', i: mod(t[i + 5] + k[p]), color: BLUE }, { ring: 'col', i: mod(t[i + 6] + k[p]), color: BLUE });
      });
      marks.mirror.push({ ring: 'blk', i: t[4], color: RED }, { ring: 'blk', i: t[5], color: BLUE });
      marks.frame.push({ ring: 'blk', i: t[0], color: RED }, { ring: 'blk', i: t[9], color: BLUE });
      const line = (r1, r2, spot, color) => {
        const [a, b] = [pol(r1, spot * TH), pol(r2, spot * TH)];
        way.push(s('path', { d: `M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}`, stroke: color, 'stroke-width': 0.6, fill: 'none', 'stroke-linecap': 'round' }));
      };
      const arc = (r, s1, s2, color) => {
        let d = mod(s2 - s1); if (d > 13) d -= 26;
        if (!d) return;   // the plugboard ring without a cable: straight on
        const [a, b] = [pol(r, s1 * TH), pol(r, (s1 + d) * TH)];
        way.push(s('path', { d: `M${f2(a[0])} ${f2(a[1])}A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${f2(b[0])} ${f2(b[1])}`, stroke: color, 'stroke-width': 1, fill: 'none', 'stroke-linecap': 'round', 'marker-end': `url(#e32-arrow-${color === RED ? 'r' : 'b'})` }));
      };
      const lane = (p, d) => PARTS[p].lane + d;
      // in: key (spot t0) → plugboard ring → right → middle → left, along each white path, then into the mirror
      let r = PARTS.frame.blk;
      line(r, lane('plug', 0.5), t[0], RED); arc(lane('plug', 0.5), t[0], t[1], RED); r = lane('plug', 0.5);
      ROT.forEach((p, i) => { line(r, lane(p, 0.5), t[i + 1], RED); arc(lane(p, 0.5), t[i + 1], t[i + 2], RED); r = lane(p, 0.5); });
      line(r, PARTS.mirror.blk, t[4], RED);
      // the mirror's wire is drawn thick on the mirror; back: left → middle → right → black wheel (spot t8)
      r = PARTS.mirror.blk;
      ['left', 'middle', 'right', 'plug'].forEach((p, i) => { line(r, lane(p, -0.5), t[i + 5], BLUE); arc(lane(p, -0.5), t[i + 5], t[i + 6], BLUE); r = lane(p, -0.5); });
      line(r, PARTS.frame.blk, t[9], BLUE);
    }
    const layers = {};
    for (const p of ORDER_OUT_IN) layers[p] = wheelLayers(p, marks[p], null);
    const turned = (p, kids) => s('g', { transform: `rotate(${f2(-k[p] * TH)})` }, kids);
    const defs = s('defs', null, [['r', RED], ['b', BLUE]].map(([id, c]) => s('marker', { id: `e32-arrow-${id}`, viewBox: '0 0 6 6', refX: 4, refY: 3, markerWidth: 3, markerHeight: 3, orient: 'auto-start-reverse', markerUnits: 'strokeWidth' },
      s('path', { d: 'M0 0L6 3L0 6Z', fill: c }))));
    const R = PARTS.frame.R + 0.6;
    // discs (biggest first), the window across all of them, the way of the current, and only then the letters
    return s('svg', { class: 're-big', width: `${sizeMm}mm`, height: `${sizeMm}mm`, viewBox: `${-R} ${-R} ${2 * R} ${2 * R}`, role: 'img', 'aria-label': label }, defs,
      ORDER_OUT_IN.map(p => turned(p, layers[p].bg)),
      s('path', { d: sector(PARTS.mirror.rIn, PARTS.frame.R - 0.8), fill: '#FFD34D', 'fill-opacity': 0.28, stroke: RED, 'stroke-width': 0.45 }),
      way,
      ORDER_OUT_IN.map(p => turned(p, layers[p].fg)),
      s('circle', { r: 2.2, fill: '#C9A227', stroke: '#7A6418', 'stroke-width': 0.4 }));   // the split pin
  }

  /** A letter centred on (x, y) for the straightened wheels; M and W are underlined, as on the round ones. */
  function flatLetter(out, ch, x, y, size, fill) {
    out.push(s('text', { x: f2(x), y: f2(y), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size, class: 're-wl', fill }, ch));
    if (ch === 'M' || ch === 'W') out.push(s('path', { d: `M${f2(x - size * 0.3)} ${f2(y + size * 0.5)}H${f2(x + size * 0.3)}`, stroke: fill, 'stroke-width': 0.35 }));
  }
  const arrowDefs = id => s('defs', null, [['r', RED], ['b', BLUE]].map(([c, col]) => s('marker', { id: `${id}-${c}`, viewBox: '0 0 6 6', refX: 4, refY: 3, markerWidth: 3, markerHeight: 3, orient: 'auto-start-reverse', markerUnits: 'strokeWidth' },
    s('path', { d: 'M0 0L6 3L0 6Z', fill: col }))));

  /**
   * Page 2: the wheels cut open next to the window and straightened, one band under another. A column is a place,
   * named by the black wheel; a rotor at window k has black letter p + k in column p and over it, on the coloured
   * strip, the letter its wire leads to; between them the white path. The plugboard ring, under the black wheel, has
   * the cables' other ends on chips. So the window is column A. With a trace t it
   * draws the way of the current as on the assembled machine: down a column, along the white path from the coloured
   * letter read to the same black letter and on down (red), through the mirror's wire (drawn under its letters), and
   * back up the other way round (blue). The way of the example never crosses the cut (the tests check it).
   * names: the six wheels, outer to inner.
   */
  function ladder(win, t, names, label) {
    const k = { frame: 0, plug: 0, left: win[0], middle: win[1], right: win[2], mirror: 0 };
    const Wd = 180, x0 = 21, cw = (Wd - x0 - 0.4) / 26, rh = 3.8, lw = 1.6, gap = 1.2, wiresH = 4.2, band = {}, hgt = {};
    let y = 0.4;
    for (const p of ORDER_OUT_IN) { band[p] = y; hgt[p] = BANDED.includes(p) ? 2 * rh + lw : rh; y += hgt[p] + (p === 'mirror' ? wiresH : gap); }
    const Hd = y + 0.4, cx = c => x0 + (c + 0.5) * cw, bg = [], way = [], fg = [];
    const rowY = (p, ring) => band[p] + (ring === 'col' || !BANDED.includes(p) ? 0.5 * rh : 1.5 * rh + lw);
    const laneY = p => band[p] + rh + lw / 2;
    const marks = [];
    if (t) {
      ROT.forEach((p, i) => marks.push([p, 'col', t[i + 1], RED], [p, 'blk', t[i + 2], RED]));
      ['left', 'middle', 'right'].forEach((p, i) => marks.push([p, 'blk', t[i + 5], BLUE], [p, 'col', t[i + 6], BLUE]));
      marks.push(['frame', 'blk', t[0], RED], ['frame', 'blk', t[9], BLUE], ['mirror', 'blk', t[4], RED], ['mirror', 'blk', t[5], BLUE],
        ['plug', 'col', t[0], RED], ['plug', 'blk', t[1], RED], ['plug', 'blk', t[8], BLUE], ['plug', 'col', t[9], BLUE]);
    }
    ORDER_OUT_IN.forEach((p, i) => {
      const P = PARTS[p], banded = BANDED.includes(p), wires = ROT.includes(p) ? wiring(p) : null, top = band[p], H = hgt[p];
      bg.push(s('rect', { x: x0, y: top, width: f2(26 * cw), height: H, fill: P.tint || '#fff' }));
      for (let c = 1; c < 26; c++) bg.push(s('line', { x1: f2(x0 + c * cw), y1: top, x2: f2(x0 + c * cw), y2: f2(top + H), stroke: '#B8B2A6', 'stroke-width': 0.25 }));
      if (banded) bg.push(s('rect', { x: x0, y: top + rh, width: f2(26 * cw), height: lw, fill: '#fff' }));   // the white path
      bg.push(s('rect', { x: x0, y: top, width: f2(26 * cw), height: H, fill: 'none', stroke: INK, 'stroke-width': 0.35 }));
      fg.push(s('text', { x: 0.3, y: f2(top + H / 2), 'dominant-baseline': 'central', 'font-size': 2.9, class: 'ams-wt', fill: P.color || INK }, names[i]));
      for (let c = 0; c < 26; c++) {
        flatLetter(fg, L(c + k[p]), cx(c), rowY(p, 'blk'), 3.2, INK);
        if (wires) flatLetter(fg, wires[mod(c + k[p])], cx(c), rowY(p, 'col'), 3, P.color);
        if (p === 'plug') {   // a chip in the cable's colour with the cable's other end, or an empty slot
          const cab = cableOf(L(c)), yc = rowY(p, 'col');
          if (cab < 0) fg.push(s('circle', { cx: f2(cx(c)), cy: f2(yc), r: 0.4, fill: '#9A9488' }));
          else { fg.push(s('rect', { x: f2(cx(c) - 2.2), y: f2(yc - 1.8), width: 4.4, height: 3.6, rx: 0.7, fill: CABLE_COLORS[cab] })); flatLetter(fg, L(swap[c]), cx(c), yc, 3, '#fff'); }
        }
      }
    });
    // the mirror's wires, under its letters; the one of the example thick
    const yW = band.mirror + rh;
    for (const [a, b] of MIRROR_PAIRS) {
      const used = t && [a, b].includes(t[4]) && [a, b].includes(t[5]), d = 0.8 + (b - a) * 0.15;
      bg.push(s('path', { d: `M${f2(cx(a))} ${f2(yW)}C${f2(cx(a))} ${f2(yW + d)} ${f2(cx(b))} ${f2(yW + d)} ${f2(cx(b))} ${f2(yW)}`, fill: 'none', stroke: PARTS.mirror.color, 'stroke-width': used ? 0.9 : 0.3, 'stroke-opacity': used ? 1 : 0.6 }));
    }
    for (const [p, ring, c, color] of marks) {
      bg.push(s('circle', { cx: f2(cx(c)), cy: f2(rowY(p, ring)), r: 1.9, fill: color === RED ? '#FADAD6' : '#D8E6F8', stroke: color, 'stroke-width': 0.5 }));
    }
    if (t) {
      const seg = (x1, y1, x2, y2, color, arrow) => { if (x1 === x2 && y1 === y2) return; way.push(s('path', { d: `M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}`, stroke: color, 'stroke-width': arrow ? 0.8 : 0.55, fill: 'none', 'stroke-linecap': 'round', 'marker-end': arrow ? `url(#e32-flat-${color === RED ? 'r' : 'b'})` : null })); };
      // in: down a column to the white path, along it, and on down; back: up, along it, and on up
      let yPrev = rowY('frame', 'blk');
      ['plug', ...ROT].forEach((p, i) => {
        const yy = laneY(p) - 0.4;
        seg(cx(t[i]), yPrev, cx(t[i]), yy, RED); seg(cx(t[i]), yy, cx(t[i + 1]), yy, RED, true); yPrev = yy;
      });
      seg(cx(t[4]), yPrev, cx(t[4]), rowY('mirror', 'blk'), RED);
      yPrev = rowY('mirror', 'blk');
      ['left', 'middle', 'right', 'plug'].forEach((p, i) => {
        const yy = laneY(p) + 0.4;
        seg(cx(t[i + 5]), yPrev, cx(t[i + 5]), yy, BLUE); seg(cx(t[i + 5]), yy, cx(t[i + 6]), yy, BLUE, true); yPrev = yy;
      });
      seg(cx(t[9]), yPrev, cx(t[9]), rowY('frame', 'blk'), BLUE);
    }
    const win0 = s('rect', { x: x0, y: band.frame, width: f2(cw), height: f2(band.mirror + rh - band.frame), fill: '#FFD34D', 'fill-opacity': 0.28, stroke: RED, 'stroke-width': 0.4 });
    return s('svg', { class: 're-ladder', width: `${Wd}mm`, height: `${f2(Hd)}mm`, viewBox: `0 0 ${Wd} ${f2(Hd)}`, role: 'img', 'aria-label': label },
      arrowDefs('e32-flat'), bg, win0, way, fg);
  }

  /**
   * Page 2, inside a rotor: six places of the right rotor at window k around the first letter's step on it (place p,
   * where the current comes in, to place q). First the real rotor from the side: the same letters on both faces and
   * the wires between them (the wire from p red, the others grey and cut off at the edge of the piece). Then the same
   * piece on paper: over each black letter the coloured one, the letter its wire leads to, and between them the
   * white path, where the current goes along the wire.
   */
  function wireFigs(k, p, q) {
    const lo = Math.min(p, q) - 1, n = 6, cw = 7.8, Wd = n * cw + 1, cx = c => 0.5 + (c - lo + 0.5) * cw, P = PARTS.right, wires = wiring('right');
    const cols = Array.from({ length: n }, (_, i) => lo + i);
    // the real rotor: letters, contacts, the body with its wires
    const real = [], top = 6, bot = 15, realFg = [];
    real.push(s('clipPath', { id: 'e32-body' }, s('rect', { x: 0.5, y: top, width: n * cw, height: bot - top })));
    real.push(s('rect', { x: 0.5, y: top, width: n * cw, height: bot - top, rx: 1.2, fill: P.tint, stroke: P.color, 'stroke-width': 0.35 }));
    const wire = (c, color, w) => {
      let d = mod(C(wires[mod(c + k)]) - k - c); if (d > 13) d -= 26;
      const [x1, x2] = [cx(c), cx(c + d)], mid = (top + bot) / 2;
      real.push(s('path', { d: `M${f2(x1)} ${top}C${f2(x1)} ${mid} ${f2(x2)} ${mid} ${f2(x2)} ${bot}`, fill: 'none', stroke: color, 'stroke-width': w, 'clip-path': 'url(#e32-body)' }));
    };
    cols.filter(c => c !== p).forEach(c => wire(c, '#9A9488', 0.4));
    wire(p, RED, 0.8);
    for (const c of cols) {
      for (const yy of [top, bot]) real.push(s('circle', { cx: f2(cx(c)), cy: yy, r: 0.7, fill: INK }));
      flatLetter(realFg, L(c + k), cx(c), top - 2.6, 3.6, INK);
      flatLetter(realFg, L(c + k), cx(c), bot + 2.6, 3.6, INK);
    }
    const H1 = bot + 5;
    // the same piece on paper, read as on the wheel: coloured letter at p → along the white path → the same black letter at q
    const rh = 4.7, lw = 1.9, y0 = 3, paper = [], paperFg = [], laneY = y0 + rh + lw / 2, yBlk = y0 + rh + lw + rh / 2, pb = y0 + 2 * rh + lw;
    paper.push(s('rect', { x: 0.5, y: y0, width: n * cw, height: 2 * rh + lw, fill: P.tint }));
    for (let i = 1; i < n; i++) paper.push(s('line', { x1: f2(0.5 + i * cw), y1: y0, x2: f2(0.5 + i * cw), y2: pb, stroke: '#B8B2A6', 'stroke-width': 0.25 }));
    paper.push(s('rect', { x: 0.5, y: y0 + rh, width: n * cw, height: lw, fill: '#fff' }));
    paper.push(s('rect', { x: 0.5, y: y0, width: n * cw, height: 2 * rh + lw, fill: 'none', stroke: INK, 'stroke-width': 0.35 }));
    paper.push(s('circle', { cx: f2(cx(p)), cy: f2(y0 + rh / 2), r: 2.1, fill: '#FADAD6', stroke: RED, 'stroke-width': 0.5 }));
    paper.push(s('circle', { cx: f2(cx(q)), cy: f2(yBlk), r: 2.1, fill: '#FADAD6', stroke: RED, 'stroke-width': 0.5 }));
    paper.push(s('path', { d: `M${f2(cx(p))} 0L${f2(cx(p))} ${f2(laneY)}`, stroke: RED, 'stroke-width': 0.55, fill: 'none' }));
    paper.push(s('path', { d: `M${f2(cx(p))} ${f2(laneY)}L${f2(cx(q))} ${f2(laneY)}`, stroke: RED, 'stroke-width': 0.8, fill: 'none', 'stroke-linecap': 'round', 'marker-end': 'url(#e32-fig-r)' }));
    paper.push(s('path', { d: `M${f2(cx(q))} ${f2(laneY)}L${f2(cx(q))} ${f2(pb + 3)}`, stroke: RED, 'stroke-width': 0.55, fill: 'none' }));
    for (const c of cols) {
      flatLetter(paperFg, wires[mod(c + k)], cx(c), y0 + rh / 2, 3.3, P.color);
      flatLetter(paperFg, L(c + k), cx(c), yBlk, 3.6, INK);
    }
    const H2 = pb + 3;
    const svg = (H, kids) => s('svg', { class: 're-fig', width: `${f2(Wd)}mm`, height: `${f2(H)}mm`, viewBox: `0 0 ${f2(Wd)} ${f2(H)}` }, kids);
    return [svg(H1, [real, realFg]), svg(H2, [arrowDefs('e32-fig'), paper, paperFg])];
  }

  // ---------- the plugboard ----------
  const KEYBOARD = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];
  /** The front panel in mm: 26 sockets in the German keyboard order, two holes each, and the cables (none: empty). */
  function plugboard(cables, label) {
    const Wd = 176, Hd = 66, dx = 18.5, x0 = [14, 23.25, 14], y0 = [13, 31, 49], at = {}, PANEL = '#F3EFE6', colorOf = {};
    KEYBOARD.forEach((row, i) => [...row].forEach((ch, j) => { at[ch] = [x0[i] + j * dx, y0[i]]; }));
    cables.forEach((c, i) => { colorOf[c[0]] = colorOf[c[1]] = CABLE_COLORS[i % CABLE_COLORS.length]; });
    const g = [s('rect', { x: 1, y: 1, width: Wd - 2, height: Hd - 2, rx: 3, fill: PANEL, stroke: '#8A90A0', 'stroke-width': 0.4 })];
    // cables first: where one passes a socket it goes behind it, so every plug clearly sits in its own socket;
    // each cable has a panel-coloured edge, so where two cross you see which one lies on top
    cables.forEach(([a, b]) => {
      const [p, q] = [at[a], at[b]], sag = Math.max(p[1], q[1]) + 9 + Math.abs(p[0] - q[0]) * 0.04;
      const d = `M${p[0]} ${p[1] + 2}C${p[0]} ${sag} ${q[0]} ${sag} ${q[0]} ${q[1] + 2}`;
      g.push(s('path', { d, fill: 'none', stroke: PANEL, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
      g.push(s('path', { d, fill: 'none', stroke: colorOf[a], 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
    });
    for (const ch of KEYBOARD.join('')) {
      const [x, y] = at[ch], col = colorOf[ch];
      g.push(s('rect', { x: x - 5, y: y - 1.6, width: 10, height: 6, rx: 1.2, fill: '#fff', stroke: '#9AA0AE', 'stroke-width': 0.3 }));
      if (col) g.push(s('rect', { x: x - 4, y: y - 1.2, width: 8, height: 5.2, rx: 1.2, fill: col, stroke: INK, 'stroke-width': 0.3 }));
      else g.push(s('circle', { cx: x - 2.2, cy: y + 1.4, r: 1.25, fill: INK }), s('circle', { cx: x + 2.2, cy: y + 1.4, r: 0.85, fill: INK }));
      // the letter over the socket, in the cable's colour when it is plugged, with a halo so a cable never hides it
      g.push(s('text', { x, y: y - 4, 'text-anchor': 'middle', 'font-size': col ? 5 : 4.4, class: 're-wl', fill: col || INK, stroke: PANEL, 'stroke-width': 1.4, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, ch));
    }
    return s('svg', { class: 're-plug', width: `${Wd}mm`, height: `${Hd}mm`, viewBox: `0 0 ${Wd} ${Hd}`, role: 'img', 'aria-label': label }, g);
  }

  // ---------- the pages ----------
  function makeKit(lang) {
    const T = textFor(lang), v = values();
    /** French: no line break before : ; ? ! (strings, also inside lists). */
    const fix = x => (typeof x === 'string' ? (lang === 'fr' ? x.replace(/ ([:;?!»])/g, ' $1') : x) : Array.isArray(x) ? x.map(fix) : x);
    const t = (k, ...a) => {
      const x = T[k] !== undefined ? T[k] : TEXT.pl[k];
      return fix(typeof x === 'function' ? x(v, ...a) : x);
    };
    const r = (k, ...a) => rich(t(k, ...a));
    const list = (k, cls) => h('ul', cls ? { class: cls } : null, t(k).map(x => h('li', null, rich(x))));
    const olist = (k, cls) => h('ol', cls ? { class: cls } : null, t(k).map(x => h('li', null, rich(x))));
    // ../print-qr.js puts the QR code at the right end of every [data-qr] head
    const pageHead = (over, title, cls, sub) => h('div', { class: 'ams-phead re-qhead', 'data-qr': '' },
      h('div', null, h('div', { class: 'ams-over' }, over), h('h1', { class: `ams-h1 ${cls || ''}` }, title), sub ? h('p', { class: 'ams-sub' }, rich(sub)) : null));
    const taskTitle = (letter, text) => h('div', { class: 'ams-task' }, h('span', { class: 'ams-dot' }, letter), h('h2', null, rich(text)));
    const boxes = (n, cls) => Array.from({ length: n }, () => h('span', { class: `ams-box ${cls || ''}` }));
    const emptyBoxes = (n, red, label) => h('div', { class: 'ams-erow' }, h('span', { class: `ams-elabel${red ? ' ams-red' : ''}` }, label), boxes(n, red ? 'ams-b-red' : ''));
    function cipherRow(text, prefill) {
      return h('div', { class: 'ams-crow' }, h('div', { class: 'ams-word' }, [...text].map((ch, i) =>
        h('div', { class: 'ams-cell' }, h('span', { class: 'ams-cl ams-red' }, ch), h('span', { class: 'ams-box' }, prefill[i] || '')))));
    }
    const box = (cls, title, ...kids) => h('section', { class: cls }, h('h3', null, title), kids);
    /** The letters of kidSteps in boxes: the key, red on the way to the mirror, blue on the way back, the lamp. */
    function chain(steps) {
      const names = t('chainNames');
      return h('div', { class: 're-chain' }, steps.map((x, i) => h('div', null,
        h('b', { class: `${i === 0 ? '' : i <= 5 ? 're-in' : 're-out'}${i === 10 ? ' re-end' : ''}` }, x), h('span', null, names[i]))));
    }
    function strip(filled) {
      return h('table', { class: 're-strip' },
        h('tr', null, h('th', null, t('stripIn')), [...ALPHA].map(ch => h('td', null, ch))),
        h('tr', null, h('th', null, t('stripOut')), [...ALPHA].map((ch, i) => {
          if (!filled) return h('td');
          const c = cableOf(ch);
          return h('td', c < 0 ? null : { class: 're-sw', style: `background:${CABLE_COLORS[c]}` }, L(swap[i]));
        })));
    }
    /** The colours of the drawn way of the current, and what the yellow window shows. */
    const legend = win => h('div', { class: 're-legend' },
      h('span', null, h('i', { style: `border-color:${RED}` }), t('legendIn')), h('span', null, h('i', { style: `border-color:${BLUE}` }), t('legendOut')),
      h('span', { class: 're-lw' }, rich(win)));   // inline: a flex gap would split the text round the letters
    const cutWheel = (part, labels, blank) => {
      const R = PARTS[part].R + 0.6, { bg, fg } = wheelLayers(part, null, labels, blank), H = 2 * R + (part === 'mirror' ? 15 : 0);   // the mirror's labels go under it
      return s('svg', { class: 'ams-wheel', width: `${2 * R}mm`, height: `${H}mm`, viewBox: `${-R} ${-R} ${2 * R} ${H}` }, bg, fg);
    };
    const rotorLabels = part => {
      const name = KEY.order[PARTS[part].rotor];
      return [`${t('rotorNames')[ROT.indexOf(part)]} ${name}`, t('rotorRoles')[ROT.indexOf(part)], t('notchAt', Z.ROTORS[name][1])];
    };
    return { T, v, t, r, list, olist, pageHead, taskTitle, emptyBoxes, cipherRow, box, chain, strip, legend, cutWheel, rotorLabels };
  }

  const PAGES = {
    1(K) {   // cover: the story of December 1932, what is inside, what you need
      const { t, r } = K;
      return [
        K.pageHead(t('coverOver'), t('coverTitle'), 'ams-big', t('coverSub')),
        h('section', { class: 'ams-frame-box re-story' },
          h('div', null, h('h3', null, t('storyTitle')), h('p', null, r('story1')), h('p', null, r('story2'))),
          assembled([...KEY.start].map(C), null, 62, t('coverPic'))),
        K.box('ams-sec', t('partsTitle'), K.list('parts')),
        h('div', { class: 'ams-cols' },
          K.box('ams-sec', t('needTitle'), K.list('needItems')),
          K.box('ams-sec', t('planTitle'), K.list('plan'))),
        h('p', { class: 'ams-disc' }, r('planNote')),
      ];
    },
    2(K) {   // step by step: what each wheel is for, the wires in a rotor, the wheels cut open and straightened
      const { t, r, v } = K, tr = TRACES[0], win = [...v.win1].map(C);
      const figs = wireFigs(win[2], tr[1], tr[2]).map((svg, i) => h('figure', null, svg, h('figcaption', null, r(i ? 'figPaper' : 'figReal'))));
      const sec = (title, ...kids) => h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, t(title)), kids);
      return [
        K.pageHead(t('inOver'), t('inTitle')),
        sec('in1Title', h('p', null, r('in1Text'))),
        h('div', { class: 're-in2' }, sec('in2Title', h('p', null, r('in2Text')), h('p', null, r('in2Rule'))), h('div', { class: 're-figs' }, figs)),
        sec('in3Title', h('p', null, r('in3Text')), ladder(win, tr, [t('frameName'), ...t('chainNames').slice(1, 6)], t('ladderAria')), K.legend(t('ladderWin'))),
        sec('in4Title', h('p', null, r('in4Text'))),
        h('section', { class: 'ams-disc' }, h('h3', null, t('newTitle')), K.list('newList', 'ams-small')),
      ];
    },
    3(K) {   // how it works: the assembled machine and one letter's way
      const { t, r, v } = K, tr = TRACES[0];
      return [
        K.pageHead(t('howOver'), t('howTitle')),
        h('p', null, r('howIntro')),
        assembled([...v.win1].map(C), tr, 146, t('bigAria')),
        K.legend(t('legendWin')),
        h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, r('exTitle')), K.chain(STEPS[0]), h('p', { class: 'ams-small' }, r('exText'))),
      ];
    },
    4(K) {   // cut-out 1 of 3: the black wheel and the mirror
      const { t, r } = K;
      return [
        K.pageHead(t('cut1Over'), t('cut1Title')),
        h('div', { class: 'ams-wheels' },
          h('div', { style: 'left:4mm;top:0' }, K.cutWheel('frame', t('frameLabels'))),
          h('div', { style: 'right:2mm;bottom:0' }, K.cutWheel('mirror', t('mirrorLabels'))),
          h('section', { class: 'ams-howto ams-small', style: 'left:0;bottom:0;width:80mm' },
            h('h3', null, t('frameNoteTitle')), h('p', null, r('frameNote')), h('h3', null, t('colorTitle')), h('p', null, r('colorNote')))),
      ];
    },
    5(K) {   // cut-out 2 of 3: today's plugboard ring and the left rotor
      const { t, r } = K;
      return [
        K.pageHead(t('cut2Over'), t('cut2Title')),
        h('div', { class: 'ams-wheels' },
          h('div', { style: 'left:0;top:0' }, K.cutWheel('plug', t('plugLabels'))),
          h('div', { style: 'right:0;bottom:0' }, K.cutWheel('left', K.rotorLabels('left'))),
          h('section', { class: 'ams-howto ams-small', style: 'left:0;bottom:0;width:92mm' }, h('h3', null, t('ringNoteTitle')), h('p', null, r('ringNote')))),
      ];
    },
    6(K) {   // cut-out 3 of 3, how to build it, the window
      const { t, r } = K;
      return [
        K.pageHead(t('cut3Over'), t('cut3Title')),
        h('div', { class: 'ams-wheels' },
          h('div', { style: 'left:0;top:0' }, K.cutWheel('right', K.rotorLabels('right'))),
          h('div', { style: 'right:0;bottom:0' }, K.cutWheel('middle', K.rotorLabels('middle'))),
          h('section', { class: 'ams-howto', style: 'right:0;top:0;width:46mm' }, h('h3', null, t('buildTitle')), K.olist('buildSteps', 'ams-small')),
          h('section', { class: 'ams-howto', style: 'left:0;bottom:0;width:72mm' }, h('h3', null, t('windowTitle')), h('p', { class: 'ams-small' }, r('windowText')))),
      ];
    },
    7(K) {   // the plugboard
      const { t, r } = K;
      return [
        K.pageHead(t('plugOver'), t('plugTitle')),
        h('p', null, r('plugIntro')),
        plugboard(CABLES, t('plugAria')),
        K.strip(true),
        K.box('ams-frame-box', t('twiceTitle'), h('p', null, r('twiceText'))),
        h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, t('ownTitle')), plugboard([], t('plugEmptyAria')), K.strip(false)),
        h('p', { class: 'ams-small' }, r('plugNote')),
      ];
    },
    8(K) {   // the mission
      const { t, r, v } = K, rows = t('keyRows');
      const keyVals = [t('keyRotors'), `{{${v.start}}}`, `{{${v.plug}}}`, t('keyMirror')];
      return [
        h('div', { class: 'ams-mhead', 'data-qr': '' }, h('div', { class: 'ams-stamp' }, h('span', null, t('missionStamp')), h('b', null, '1932')),
          h('div', null, h('h1', { class: 'ams-h1' }, t('missionTitle')), h('p', { class: 'ams-sub' }, r('missionSub')))),
        h('div', { class: 'ams-two' },
          K.box('ams-frame-box', t('keyTitle'), h('dl', { class: 're-key' }, rows.map((x, i) => [h('dt', null, x), h('dd', null, rich(keyVals[i]))]))),
          K.box('ams-frame-box', t('stepTitle'), K.list('stepRules', 'ams-small'), h('p', { class: 'ams-small' }, r('stepNote')))),
        K.box('ams-frame-box', t('pathTitle'), K.olist('pathSteps', 'ams-small'), h('p', { class: 'ams-small' }, r('pathNote'))),
        h('section', { class: 'ams-sec' }, K.taskTitle('A', t('taskA')), K.cipherRow(v.code, v.plain[0])),
        h('section', { class: 'ams-sec' }, K.taskTitle('B', t('taskB')), h('p', { class: 'ams-small' }, r('taskBNote')),
          K.emptyBoxes(10, false, t('nameLabel')), K.emptyBoxes(10, true, t('codeLabel'))),
        h('section', { class: 'ams-sec' }, K.taskTitle('C', t('taskC')), h('p', { class: 'ams-small' }, r('taskCText')),
          h('div', { class: 'ams-keyline' }, h('span', { class: 'ams-l' }, `6 × ${v.n3} × ${v.ways} =`), h('span', { class: 'ams-box ams-b-navy re-wide' }))),
        h('section', { class: 'ams-disc' }, h('h3', null, t('discTitle')), h('p', { class: 'ams-small' }, r('discText'))),
      ];
    },
    9(K) {   // answer key for the parent
      const { t, r } = K;
      const head = t('traceHead');
      const table = h('table', { class: 're-trace' },
        h('tr', null, head.map(x => h('th', null, x))),
        STEPS.map((st, i) => h('tr', null, h('td', null, String(i + 1)), h('td', { class: 'ams-l' }, WINS[i]),
          st.map((x, j) => h('td', { class: j === 0 ? 're-tin' : j === 10 ? 're-tout' : null }, x)))));
      return [
        h('div', { class: 'ams-keyhead', 'data-qr': '' }, h('h1', { class: 'ams-h1' }, t('keyPageTitle')), h('span', { class: 'ams-secret' }, t('parentOnly'))),
        h('p', null, r('ansA')),
        h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, t('traceTitle')), table, h('p', { class: 'ams-small' }, r('traceNote'))),
        h('p', null, r('ansB')),
        h('p', null, r('ansC')),
        K.box('ams-frame-box', t('mistakesTitle'), K.list('mistakes', 'ams-small')),
        h('section', { class: 'ams-sec' }, h('h3', { class: 'ams-h3' }, t('diffTitle')),
          h('table', { class: 'ams-real' }, t('diffs').map(([a, b]) => h('tr', null, h('td', null, rich(a)), h('td', null, rich(b)))))),
      ];
    },
    10(K) {   // for the keen: the empty plugboard ring, for your own cables
      const { t, r } = K;
      return [
        K.pageHead(t('blankOver'), t('blankTitle'), null, t('blankSub')),
        h('div', { class: 'ams-wheels' },
          h('div', { style: 'left:50%;top:0;transform:translateX(-50%)' }, K.cutWheel('plug', t('plugBlankLabels'), true)),
          h('section', { class: 'ams-howto', style: 'left:0;right:0;bottom:0' }, h('h3', null, t('blankHowTitle')), K.olist('blankSteps', 'ams-small'), h('p', { class: 'ams-small' }, r('blankNote')))),
      ];
    },
  };

  /** One A4 page (an .ams-page element) in the given language. */
  function renderPage(n, lang) {
    const K = makeKit(lang);
    const body = h('div', { class: `ams-body e32-p${n}` }, PAGES[n](K));
    return h('div', { class: 'ams-page', 'data-page': n, lang }, body,
      h('div', { class: 'ams-foot' }, h('span', null, K.t('puzzle')), h('span', null, K.t('pageOf', n, TOTAL))));
  }
  /** Shrink the text of a page (from its CSS size, 12pt, down to 9pt at most) until it fits its A4 box. */
  function fitPage(page) {
    const body = page.querySelector('.ams-body');
    if (!page.dataset.fs0) page.dataset.fs0 = parseFloat(getComputedStyle(body).fontSize) * 0.75;   // px → pt
    let fs = parseFloat(page.dataset.fs0);
    body.style.fontSize = fs + 'pt';
    while (body.scrollHeight > body.clientHeight + 1 && fs > 9) {
      fs -= 0.25;
      body.style.fontSize = fs + 'pt';
    }
    page.dataset.fit = fs;
    return fs;
  }

  return { TOTAL, DEFAULT_PAGES, KEY, CODE, WINS, TRACES, STEPS, PARTS, LANE_W, MIRROR_PAIRS, CABLE_COLORS, TEXT, textFor, values, paper, ways, parsePages, formatPages, renderPage, fitPage };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = E32;
