/**
 * The Real Enigma 1932 (Prawdziwa Enigma 1932), part 5 of the Young Codebreakers Academy: a paper Enigma I,
 * the army machine Marian Rejewski broke in December 1932. Classic script; defines the global `E32` (and
 * module.exports for node tests). Needs ZYG (../zygalski-sheets/engine.js) for the machine itself.
 *
 * The paper machine is four wheels on one split pin, biggest at the bottom, so every wheel shows only its outer
 * band: the black wheel (keyboard and lamps, fixed), the right, middle and left rotor (I, II, III, real wiring and
 * notches) and, on top, the small mirror (reflector B, fixed). A separate card is the plugboard (6 cables).
 *
 * A "spot" is one of the 26 directions from the pin, named by the black letter there. A rotor's band has the
 * alphabet (black letters) and, under each black letter, the letter it is wired to (coloured). With the rotor
 * showing window letter k, spot p has black letter p + k, so "read the coloured letter, find the same black
 * letter" moves the current from spot p to W(p + k) − k, exactly a real rotor (rings at A). `paper()` does that
 * by hand and the tests compare it with ZYG.machine. Every letter on the pages comes from the machine, never typed.
 *
 * All text lives in strings.js (E32.TEXT[lang]); a text is a string or a function of the values `v`.
 * Light markup: **bold** and {{code letters}}.
 */
const E32 = (() => {
  const Z = typeof ZYG !== 'undefined' ? ZYG : require('../zygalski-sheets/engine.js');
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', L = i => ALPHA[((i % 26) + 26) % 26], C = ch => ch.charCodeAt(0) - 65;
  const mod = x => ((x % 26) + 26) % 26, TH = 360 / 26;
  const groupDigits = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const TOTAL = 8, DEFAULT_PAGES = [1, 2, 3, 4, 5, 6, 7, 8];

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
  const CABLE_COLORS = [RED, '#2F6F4F', '#7A3FB8', '#B5651D', BLUE, '#5B6070'];
  /**
   * The wheels, outer to inner. R = disc radius (mm), rIn = where the next disc covers it, big/small = radii of the
   * black and the coloured letter ring. The coloured letters sit on a tinted strip; no wheel uses red or blue,
   * the colours of the current in the worked example.
   */
  const PARTS = {
    frame: { R: 74, rIn: 59, big: 66.4, fs: 6 },
    right: { rotor: 2, R: 59, rIn: 48, big: 55.3, small: 50.6, fs: 4.6, fss: 4, color: '#3B6E1F', tint: '#E8F2DD' },
    middle: { rotor: 1, R: 48, rIn: 37, big: 44.3, small: 39.6, fs: 4.4, fss: 3.8, color: '#8A4B0F', tint: '#F7EADB' },
    left: { rotor: 0, R: 37, rIn: 26, big: 33.4, small: 28.7, fs: 4.2, fss: 3.6, color: '#6A3DA8', tint: '#EEE6F8' },
    mirror: { R: 26, rIn: 14, big: 22.4, small: 17.8, fs: 3.8, fss: 3.3, color: '#0E6670', tint: '#DCEFF0' },
  };
  const ROT = ['right', 'middle', 'left'], ORDER_OUT_IN = ['frame', 'right', 'middle', 'left', 'mirror'];
  const wiring = part => part === 'mirror' ? [...Z.REFLECTOR_B] : [...W(KEY.order[PARTS[part].rotor])];

  const pol = (r, deg) => { const a = deg * Math.PI / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };
  const f2 = x => x.toFixed(2);
  /** The sector of spot 0 (the window) between radii r1 and r2. */
  function sector(r1, r2) {
    const [a, b] = [pol(r2, -TH / 2), pol(r2, TH / 2)], [c, d] = [pol(r1, TH / 2), pol(r1, -TH / 2)];
    return `M${f2(a[0])} ${f2(a[1])}A${r2} ${r2} 0 0 1 ${f2(b[0])} ${f2(b[1])}L${f2(c[0])} ${f2(c[1])}A${r1} ${r1} 0 0 0 ${f2(d[0])} ${f2(d[1])}Z`;
  }
  /** Where the black ring ends and the tinted strip of coloured letters begins. */
  const stripEdge = P => (P.big + P.small) / 2 + 0.25;

  /**
   * One wheel in its own frame (letter i at i·TH degrees clockwise from the top), as two layers: `bg` (the disc,
   * the tinted strip, the spot lines, the marks of the worked example) and `fg` (letters, notch, labels), so that
   * the drawn way of the current can go between them and never cover a letter.
   * marks: [{ ring: 'big'|'small', i, color }]; labels: the texts printed inside a wheel to cut out (null: none).
   */
  function wheelLayers(part, marks, labels) {
    const P = PARTS[part], bg = [], fg = [], isRotor = ROT.includes(part), wires = part === 'frame' ? null : wiring(part);
    bg.push(s('circle', { r: P.R, fill: '#fff', stroke: INK, 'stroke-width': labels ? 0.6 : 0.45 }));
    if (P.tint) {
      const e = stripEdge(P);
      bg.push(s('circle', { r: f2((e + P.rIn) / 2), fill: 'none', stroke: P.tint, 'stroke-width': f2(e - P.rIn) }));
      bg.push(s('circle', { r: f2(e), fill: 'none', stroke: P.color, 'stroke-width': 0.2, 'stroke-opacity': 0.5 }));
    }
    if (part === 'frame') bg.push(s('path', { d: sector(P.rIn + 0.4, P.R - 0.8), fill: '#FFF1BF', stroke: RED, 'stroke-width': 0.5 }));
    if (part !== 'mirror') bg.push(s('circle', { r: P.rIn, fill: 'none', stroke: '#9A9488', 'stroke-width': 0.3, 'stroke-dasharray': '1.2 1' }));
    // the spot lines: 26 narrow wedges, which line up on every wheel
    for (let i = 0; i < 26; i++) bg.push(s('line', { x1: 0, y1: -P.rIn, x2: 0, y2: -P.R + 0.3, stroke: '#B8B2A6', 'stroke-width': 0.3, transform: `rotate(${f2((i + 0.5) * TH)})` }));
    for (const m of marks || []) {
      const r = m.ring === 'big' ? P.big : P.small, [x, y] = pol(r, m.i * TH);
      bg.push(s('circle', { cx: f2(x), cy: f2(y), r: f2((m.ring === 'big' ? P.fs : P.fss) * 0.64), fill: m.color === RED ? '#FADAD6' : '#D8E6F8', stroke: m.color, 'stroke-width': 0.55 }));
    }
    const notch = isRotor ? NOTCH(KEY.order[P.rotor]) : -1;
    /** A letter on a ring; M and W are underlined, so they are not mixed up upside down. */
    const letter = (ch, i, r, size, fill) => {
      const rot = `rotate(${f2(i * TH)})`;
      fg.push(s('text', { transform: rot, y: -r, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size, class: 're-wl', fill }, ch));
      if (ch === 'M' || ch === 'W') fg.push(s('path', { d: `M${f2(-size * 0.3)} ${f2(-r + size * 0.5)}H${f2(size * 0.3)}`, stroke: fill, 'stroke-width': 0.35, transform: rot }));
    };
    for (let i = 0; i < 26; i++) {
      letter(L(i), i, P.big, P.fs, INK);
      if (wires) letter(wires[i], i, P.small, P.fss, P.color);
    }
    if (isRotor) fg.push(s('path', { d: `M-1.8 ${-P.R}L0 ${-P.R + 2.4}L1.8 ${-P.R}Z`, fill: RED, transform: `rotate(${f2(notch * TH)})` }));   // the notch
    if (part === 'frame') fg.push(s('path', { d: `M-2 ${-P.R + 0.9}L2 ${-P.R + 0.9}L0 ${-P.R + 3.6}Z`, fill: RED }));
    if (part === 'mirror') fg.push(s('path', { d: 'M-1.6 -12.6L1.6 -12.6L0 -15.2Z', fill: RED }));
    if (labels) {
      const lab = (y, txt, size, fill, bold) => fg.push(s('text', { y, 'text-anchor': 'middle', 'font-size': size, class: bold ? 'ams-wt' : 'ams-wt2', fill }, txt));
      if (part === 'frame') {
        lab(-24, labels[0], 5, INK, 1); lab(-17.5, labels[1], 3.8, GREY); lab(-11, labels[2], 3.8, GREY); lab(22, labels[3], 3.6, RED);
      } else if (isRotor) {
        const top = -P.rIn + (part === 'left' ? 9 : 11), big = part === 'left' ? 3.6 : 4.2;
        lab(top, labels[0], big, P.color, 1); lab(top + 5, labels[1], 3.2, GREY); lab(top + 10, labels[2], 3.2, RED);
      } else {
        lab(-6.3, labels[0], 3.2, P.color, 1); lab(-2.6, labels[1], 2.5, GREY); lab(6.4, labels[2], 2.5, RED);
      }
      fg.push(s('path', { d: part === 'mirror' ? 'M-1.5 1.2H1.5M0 -0.3V2.7' : 'M-2.5 0H2.5M0 -2.5V2.5', stroke: INK, 'stroke-width': 0.35 }));
    }
    return { bg, fg };
  }

  /**
   * The assembled machine showing window `win` ([left, middle, right] numbers), `sizeMm` wide. With a trace t
   * (ZYG machine.trace: spots after key, plugboard, right, middle, left, mirror, left, middle, right, lamp) it draws
   * the way of the current, red to the mirror, blue back, and rings the letters read: a rotor at window k has black
   * letter p + k at spot p.
   */
  function assembled(win, t, sizeMm, label) {
    const k = { frame: 0, left: win[0], middle: win[1], right: win[2], mirror: 0 };
    const marks = { frame: [], right: [], middle: [], left: [], mirror: [] }, way = [];
    const inParts = ['right', 'middle', 'left', 'mirror'], outParts = ['left', 'middle', 'right'];
    if (t) {
      inParts.forEach((p, i) => {   // in: the coloured letter at spot t[i+1], the same black one is at spot t[i+2]
        marks[p].push({ ring: 'small', i: mod(t[i + 1] + k[p]), color: RED }, { ring: 'big', i: mod(t[i + 2] + k[p]), color: RED });
      });
      outParts.forEach((p, i) => {   // back: the black letter at spot t[i+5], the same coloured one is at spot t[i+6]
        marks[p].push({ ring: 'big', i: mod(t[i + 5] + k[p]), color: BLUE }, { ring: 'small', i: mod(t[i + 6] + k[p]), color: BLUE });
      });
      marks.frame.push({ ring: 'big', i: t[1], color: RED }, { ring: 'big', i: t[8], color: BLUE });
      const line = (r1, r2, spot, color) => {
        const [a, b] = [pol(r1, spot * TH), pol(r2, spot * TH)];
        way.push(s('path', { d: `M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}`, stroke: color, 'stroke-width': 0.6, fill: 'none', 'stroke-linecap': 'round' }));
      };
      const arc = (r, s1, s2, color) => {
        let d = mod(s2 - s1); if (d > 13) d -= 26;
        const [a, b] = [pol(r, s1 * TH), pol(r, (s1 + d) * TH)];
        way.push(s('path', { d: `M${f2(a[0])} ${f2(a[1])}A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${f2(b[0])} ${f2(b[1])}`, stroke: color, 'stroke-width': 1, fill: 'none', 'stroke-linecap': 'round', 'marker-end': `url(#e32-arrow-${color === RED ? 'r' : 'b'})` }));
      };
      const mid = p => stripEdge(PARTS[p]);
      // in: black wheel (spot t1) → right → middle → left → mirror, just outside the tinted strip
      let r = PARTS.frame.big;
      inParts.forEach((p, i) => { line(r, mid(p) + 0.6, t[i + 1], RED); arc(mid(p) + 0.6, t[i + 1], t[i + 2], RED); r = mid(p) + 0.6; });
      // back: mirror → left → middle → right → black wheel (spot t8), just inside the tinted strip
      r = mid('mirror') - 0.6;
      outParts.forEach((p, i) => { line(r, mid(p) - 0.6, t[i + 5], BLUE); arc(mid(p) - 0.6, t[i + 5], t[i + 6], BLUE); r = mid(p) - 0.6; });
      line(r, PARTS.frame.big, t[8], BLUE);
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
   * named by the black wheel; a rotor at window k has black letter p + k in column p and its coloured letter under
   * it, so the window is column A. With a trace t it draws the way of the current as on the assembled machine: down a
   * column onto the next wheel, along a wheel from the coloured letter read to the same black letter (red), and from
   * the mirror back up (blue). The way of the example never crosses the cut (the tests check it), so steps are straight.
   * names: the five wheels, outer to inner.
   */
  function ladder(win, t, names, label) {
    const k = { frame: 0, left: win[0], middle: win[1], right: win[2], mirror: 0 };
    const Wd = 180, x0 = 21, cw = (Wd - x0 - 0.4) / 26, rh = 5, gap = 2.2, band = {};
    let y = 0.4;
    for (const p of ORDER_OUT_IN) { band[p] = y; y += (p === 'frame' ? 1 : 2) * rh + gap; }
    const Hd = y - gap + 0.4, cx = c => x0 + (c + 0.5) * cw, edge = p => band[p] + rh, bg = [], way = [], fg = [];
    const rowY = (p, ring) => band[p] + (ring === 'big' ? 0.5 : 1.5) * rh;
    const marks = [];
    if (t) {
      ['right', 'middle', 'left', 'mirror'].forEach((p, i) => marks.push([p, 'small', t[i + 1], RED], [p, 'big', t[i + 2], RED]));
      ['left', 'middle', 'right'].forEach((p, i) => marks.push([p, 'big', t[i + 5], BLUE], [p, 'small', t[i + 6], BLUE]));
      marks.push(['frame', 'big', t[1], RED], ['frame', 'big', t[8], BLUE]);
    }
    ORDER_OUT_IN.forEach((p, i) => {
      const P = PARTS[p], rows = p === 'frame' ? 1 : 2, wires = p === 'frame' ? null : wiring(p);
      bg.push(s('rect', { x: x0, y: band[p], width: f2(26 * cw), height: rows * rh, fill: '#fff' }));
      if (wires) bg.push(s('rect', { x: x0, y: edge(p), width: f2(26 * cw), height: rh, fill: P.tint }));
      for (let c = 1; c < 26; c++) bg.push(s('line', { x1: f2(x0 + c * cw), y1: band[p], x2: f2(x0 + c * cw), y2: f2(band[p] + rows * rh), stroke: '#B8B2A6', 'stroke-width': 0.25 }));
      if (wires) bg.push(s('line', { x1: x0, y1: edge(p), x2: f2(x0 + 26 * cw), y2: edge(p), stroke: P.color, 'stroke-width': 0.2, 'stroke-opacity': 0.5 }));
      bg.push(s('rect', { x: x0, y: band[p], width: f2(26 * cw), height: rows * rh, fill: 'none', stroke: INK, 'stroke-width': 0.35 }));
      fg.push(s('text', { x: 0.3, y: f2(band[p] + rows * rh / 2), 'dominant-baseline': 'central', 'font-size': 2.9, class: 'ams-wt', fill: P.color || INK }, names[i]));
      for (let c = 0; c < 26; c++) {
        flatLetter(fg, L(c + k[p]), cx(c), rowY(p, 'big'), 3.4, INK);
        if (wires) flatLetter(fg, wires[mod(c + k[p])], cx(c), rowY(p, 'small'), 3.1, P.color);
      }
    });
    for (const [p, ring, c, color] of marks) {
      bg.push(s('circle', { cx: f2(cx(c)), cy: f2(rowY(p, ring)), r: 1.95, fill: color === RED ? '#FADAD6' : '#D8E6F8', stroke: color, 'stroke-width': 0.5 }));
    }
    if (t) {
      const seg = (x1, y1, x2, y2, color, arrow) => way.push(s('path', { d: `M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}`, stroke: color, 'stroke-width': arrow ? 0.8 : 0.55, fill: 'none', 'stroke-linecap': 'round', 'marker-end': arrow ? `url(#e32-flat-${color === RED ? 'r' : 'b'})` : null }));
      // in: just above the line between black and coloured letters; back: just under it
      let yPrev = rowY('frame', 'big');
      ['right', 'middle', 'left', 'mirror'].forEach((p, i) => {
        const yy = edge(p) - 0.55;
        seg(cx(t[i + 1]), yPrev, cx(t[i + 1]), yy, RED); seg(cx(t[i + 1]), yy, cx(t[i + 2]), yy, RED, true); yPrev = yy;
      });
      yPrev = edge('mirror') + 0.55;
      ['left', 'middle', 'right'].forEach((p, i) => {
        const yy = edge(p) + 0.55;
        seg(cx(t[i + 5]), yPrev, cx(t[i + 5]), yy, BLUE); seg(cx(t[i + 5]), yy, cx(t[i + 6]), yy, BLUE, true); yPrev = yy;
      });
      seg(cx(t[8]), yPrev, cx(t[8]), rowY('frame', 'big'), BLUE);
    }
    const win0 = s('rect', { x: x0, y: band.frame, width: f2(cw), height: f2(Hd - 0.8), fill: '#FFD34D', 'fill-opacity': 0.28, stroke: RED, 'stroke-width': 0.4 });
    return s('svg', { class: 're-ladder', width: `${Wd}mm`, height: `${f2(Hd)}mm`, viewBox: `0 0 ${Wd} ${f2(Hd)}`, role: 'img', 'aria-label': label },
      arrowDefs('e32-flat'), bg, win0, way, fg);
  }

  /**
   * Page 2, inside a rotor: six places of the right rotor at window k around the first letter's step on it (place p,
   * where the current comes in, to place q). First the real rotor from the side: the same letters on both faces and
   * the wires between them (the wire from p red, the others grey and cut off at the edge of the piece). Then the same
   * piece on paper: under each black letter the coloured one, the letter its wire leads to.
   */
  function wireFigs(k, p, q) {
    const lo = Math.min(p, q) - 1, n = 6, cw = 8.6, Wd = n * cw + 1, cx = c => 0.5 + (c - lo + 0.5) * cw, P = PARTS.right, wires = wiring('right');
    const cols = Array.from({ length: n }, (_, i) => lo + i);
    // the real rotor: letters, contacts, the body with its wires
    const real = [], top = 6, bot = 19, realFg = [];
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
    // the same piece on paper, read as on the wheel: coloured letter at p → the same black letter at q
    const rh = 5.6, y0 = 3, paper = [], paperFg = [], edge = y0 + rh;
    paper.push(s('rect', { x: 0.5, y: y0, width: n * cw, height: 2 * rh, fill: '#fff' }));
    paper.push(s('rect', { x: 0.5, y: edge, width: n * cw, height: rh, fill: P.tint }));
    for (let i = 1; i < n; i++) paper.push(s('line', { x1: f2(0.5 + i * cw), y1: y0, x2: f2(0.5 + i * cw), y2: y0 + 2 * rh, stroke: '#B8B2A6', 'stroke-width': 0.25 }));
    paper.push(s('rect', { x: 0.5, y: y0, width: n * cw, height: 2 * rh, fill: 'none', stroke: INK, 'stroke-width': 0.35 }));
    paper.push(s('circle', { cx: f2(cx(p)), cy: f2(edge + rh / 2), r: 2.1, fill: '#FADAD6', stroke: RED, 'stroke-width': 0.5 }));
    paper.push(s('circle', { cx: f2(cx(q)), cy: f2(y0 + rh / 2), r: 2.1, fill: '#FADAD6', stroke: RED, 'stroke-width': 0.5 }));
    const yy = edge - 0.55;
    paper.push(s('path', { d: `M${f2(cx(p))} 0L${f2(cx(p))} ${f2(yy)}`, stroke: RED, 'stroke-width': 0.55, fill: 'none' }));
    paper.push(s('path', { d: `M${f2(cx(p))} ${f2(yy)}L${f2(cx(q))} ${f2(yy)}`, stroke: RED, 'stroke-width': 0.8, fill: 'none', 'stroke-linecap': 'round', 'marker-end': 'url(#e32-fig-r)' }));
    paper.push(s('path', { d: `M${f2(cx(q))} ${f2(yy)}L${f2(cx(q))} ${f2(y0 + 2 * rh + 3)}`, stroke: RED, 'stroke-width': 0.55, fill: 'none' }));
    for (const c of cols) {
      flatLetter(paperFg, L(c + k), cx(c), y0 + rh / 2, 3.6, INK);
      flatLetter(paperFg, wires[mod(c + k)], cx(c), edge + rh / 2, 3.3, P.color);
    }
    const H2 = y0 + 2 * rh + 3;
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
    const cutWheel = (part, labels) => {
      const R = PARTS[part].R + 0.6, { bg, fg } = wheelLayers(part, null, labels);
      return s('svg', { class: 'ams-wheel', width: `${2 * R}mm`, height: `${2 * R}mm`, viewBox: `${-R} ${-R} ${2 * R} ${2 * R}` }, bg, fg);
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
        sec('in3Title', h('p', null, r('in3Text')), ladder(win, tr, t('chainNames').slice(1, 6), t('ladderAria')), K.legend(t('ladderWin'))),
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
    4(K) {   // cut-out 1 of 2
      const { t, r } = K;
      return [
        K.pageHead(t('cut1Over'), t('cut1Title')),
        h('div', { class: 'ams-wheels' },
          h('div', { style: 'left:0;top:0' }, K.cutWheel('frame', t('frameLabels'))),
          h('div', { style: 'left:0;bottom:0' }, K.cutWheel('left', K.rotorLabels('left'))),
          h('div', { style: 'right:2mm;bottom:4mm' }, K.cutWheel('mirror', t('mirrorLabels'))),
          h('section', { class: 'ams-howto ams-small', style: 'right:0;top:0;width:28mm' }, h('h3', null, t('frameNoteTitle')), h('p', null, r('frameNote'))),
          h('section', { class: 'ams-howto', style: 'left:80mm;bottom:2mm;width:44mm' }, h('h3', null, t('colorTitle')), h('p', { class: 'ams-small' }, r('colorNote')))),
      ];
    },
    5(K) {   // cut-out 2 of 2, how to build it, the window
      const { t, r } = K;
      return [
        K.pageHead(t('cut2Over'), t('cut2Title')),
        h('div', { class: 'ams-wheels' },
          h('div', { style: 'left:0;top:0' }, K.cutWheel('right', K.rotorLabels('right'))),
          h('div', { style: 'right:0;bottom:0' }, K.cutWheel('middle', K.rotorLabels('middle'))),
          h('section', { class: 'ams-howto', style: 'right:0;top:0;width:54mm' }, h('h3', null, t('buildTitle')), K.olist('buildSteps', 'ams-small')),
          h('section', { class: 'ams-howto', style: 'left:0;bottom:0;width:72mm' }, h('h3', null, t('windowTitle')), h('p', { class: 'ams-small' }, r('windowText')))),
      ];
    },
    6(K) {   // the plugboard
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
    7(K) {   // the mission
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
    8(K) {   // answer key for the parent
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

  return { TOTAL, DEFAULT_PAGES, KEY, CODE, WINS, TRACES, STEPS, TEXT, textFor, values, paper, ways, parsePages, formatPages, renderPage, fitPage };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = E32;
