/**
 * Secret telegrams of 1920 (Tajne depesze 1920): read Red Army radio messages the way Polish radio
 * intelligence did before the Battle of Warsaw. Classic script; defines the global `W20` (also exported for Node).
 *
 *   W20.ALPHABET            → the Russian alphabet of the telegrams (32 letters, Ё written as Е, as in telegrams)
 *   W20.VOCAB               → every word the telegrams use (the glossary on the sheet); meanings live in strings.js
 *   W20.SLOTS               → the three telegrams: [variants…] each { id, text, sign }
 *   W20.key(rnd)            → the day's key: letter → a two-digit number, all different
 *   W20.day(rnd)            → { key, telegrams: [{ slot, id, words: [[number…]…], plain: [word…] }] }
 *   W20.lettersUsed(day)    → the letters that appear in the day's telegrams, sorted by their number
 *   W20.halfKey(day, rnd)   → ★★: the letters given in the key table (half of the used ones, not ДИВИЗИЯ's)
 *   W20.findPattern(day)    → index of the one word in telegram 1 shaped like ДИВИЗИЯ (same number at 2, 4, 6)
 *   W20.patternHits(day)    → ★★★ (no gaps): where a ДИВИЗИЯ-shaped run starts in telegram 1 (can be twice)
 *   W20.countStreamSolutions(day, known) → ★★★: ways to split the gapless telegrams into glossary words (0, 1 or 2)
 *   W20.solve(day, known)   → what a child can read, starting from `known` (number → letter) and guessing
 *                             glossary words that fit; returns the final map
 *   W20.mapSvg(opts)        → the map of the battle (base, unit markers, arrows), labels from the strings file
 *
 * The cipher is a simple substitution: every letter becomes a two-digit number (one of the simpler kinds of
 * cipher of the time). Kowalewski is said to have found his first letter, И, in the word ДИВИЗИЯ — "division"
 * has И in places 2, 4 and 6, so its numbers make a pattern you can spot. That is how the sheet starts too.
 */
const W20 = (() => {
  const ALPHABET = [...'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'];
  const PATTERN_WORD = 'ДИВИЗИЯ';

  // What the decrypts really told the Poles, as short telegrams (our wording, simple Russian).
  const SLOTS = [
    [   // 1: where the 4th Army goes — with ДИВИЗИЯ, to start from
      { id: 'plock', text: 'ДИВИЗИЯ ИДЕТ НА ПЛОЦК', sign: 'ШУВАЕВ' },
      { id: 'wloclawek', text: 'КОННАЯ ДИВИЗИЯ ИДЕТ НА ВЛОЦЛАВЕК', sign: 'ШУВАЕВ' },
      { id: 'vistula', text: 'ДИВИЗИЯ ИДЕТ К ВИСЛЕ', sign: 'ШУВАЕВ' },
    ],
    [   // 2: the weak spot south of Warsaw
      { id: 'budyonny', text: 'КОННАЯ АРМИЯ СТОИТ У ЛЬВОВА', sign: 'БУДЕННЫЙ' },
      { id: 'mozyr', text: 'У МОЗЫРСКОЙ ГРУППЫ МАЛО СИЛ', sign: '' },
    ],
    [   // 3: the order that never arrived
      { id: 'turn', text: 'ЧЕТВЕРТОЙ АРМИИ ПОВЕРНУТЬ НА ЮГ', sign: 'ТУХАЧЕВСКИЙ' },
    ],
  ];
  const words = v => [...v.text.split(' '), ...(v.sign ? [v.sign] : [])];
  const VOCAB = [...new Set(SLOTS.flat().flatMap(words))].sort((a, b) => a.localeCompare(b, 'ru'));

  function key(rnd) {
    const nums = [];
    for (let n = 11; n <= 99; n++) if (n % 10) nums.push(n);       // no 20, 30… : easier to read
    for (let i = nums.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [nums[i], nums[j]] = [nums[j], nums[i]]; }
    return Object.fromEntries(ALPHABET.map((ch, i) => [ch, nums[i]]));
  }

  function day(rnd) {
    const k = key(rnd);
    const telegrams = SLOTS.map((vars, slot) => {
      const v = vars[Math.floor(rnd() * vars.length)];
      const plain = words(v);
      return { slot, id: v.id, plain, sign: v.sign, words: plain.map(w => [...w].map(ch => k[ch])) };
    });
    return { key: k, telegrams };
  }

  function lettersUsed(d) {
    const s = new Set(d.telegrams.flatMap(t => [...t.plain.join('')]));
    return [...s].sort((a, b) => d.key[a] - d.key[b]);
  }

  const shape = arr => arr.map(x => arr.indexOf(x)).join(',');
  function findPattern(d) {
    const want = shape([...PATTERN_WORD]);
    const hits = d.telegrams[0].words.map((w, i) => shape(w) === want ? i : -1).filter(i => i >= 0);
    return hits.length === 1 ? hits[0] : -1;
  }

  /** ★★ (half the key): the letters already in the key table — half of those the telegrams use, not ДИВИЗИЯ's. */
  function halfKey(d, rnd) {
    const rest = lettersUsed(d).filter(ch => !PATTERN_WORD.includes(ch));
    for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
    return new Set(rest.slice(0, Math.floor(rest.length / 2)));
  }

  /** Where a ДИВИЗИЯ-shaped run of 7 numbers starts in telegram 1 written without gaps (★★★); may be more than one. */
  function patternHits(d) {
    const st = d.telegrams[0].words.flat(), want = shape([...PATTERN_WORD]), hits = [];
    for (let i = 0; i + 7 <= st.length; i++) if (shape(st.slice(i, i + 7)) === want) hits.push(i);
    return hits;
  }

  /** ★★★: how many ways the three gapless telegrams split into glossary words with one key, from `known` (stops at 2). */
  function countStreamSolutions(d, known) {
    const streams = d.telegrams.map(t => t.words.flat());
    let count = 0;
    (function seg(t, pos, map) {
      if (count > 1) return;
      if (t === streams.length) { count++; return; }
      const st = streams[t];
      if (pos === st.length) return seg(t + 1, 0, map);
      for (const w of VOCAB) {
        if (pos + w.length > st.length) continue;
        const m = { ...map }, used = new Set(Object.values(m));
        let ok = true;
        for (let k = 0; k < w.length && ok; k++) {
          const n = st[pos + k];
          if (m[n]) ok = m[n] === w[k];
          else if (used.has(w[k])) ok = false;
          else { m[n] = w[k]; used.add(w[k]); }
        }
        if (ok) seg(t, pos + w.length, m);
      }
    })(0, 0, { ...known });
    return count;
  }

  /** Guess glossary words that fit (length, known letters, same number ⇔ same letter) until nothing changes. */
  function solve(d, known = {}) {
    const map = { ...known };
    let progress = true;
    while (progress) {
      progress = false;
      for (const t of d.telegrams) for (const w of t.words) {
        if (w.every(n => map[n])) continue;
        const used = new Set(Object.values(map));
        const fits = VOCAB.filter(cand => {
          if (cand.length !== w.length || shape([...cand]) !== shape(w)) return false;
          return w.every((n, i) => map[n] ? map[n] === cand[i] : !used.has(cand[i]));
        });
        if (fits.length === 1) { w.forEach((n, i) => { map[n] = fits[0][i]; }); progress = true; }
      }
    }
    return map;
  }

  /* ---------- the map ---------- */
  const W = 384, H = 372, LON0 = 17.75, LAT0 = 53.65, K = 90;
  const P = (lat, lon) => [+((lon - LON0) * 0.616 * K).toFixed(1), +((LAT0 - lat) * K).toFixed(1)];
  const path = pts => pts.map((p, i) => (i ? 'L' : 'M') + P(...p).join(' ')).join('');
  // [lat, lon, minor?] — minor towns only on the big (story) map
  const CITY = {
    warsaw: [52.23, 21.01], plock: [52.55, 19.70], wloclawek: [52.65, 19.07], torun: [53.01, 18.60, 1],
    ciechanow: [52.88, 20.62, 1], deblin: [51.56, 21.85], lublin: [51.25, 22.57], lwow: [49.84, 24.03], krakow: [50.06, 19.94, 1],
    brest: [52.10, 23.66, 1], bialystok: [53.13, 23.16, 1], przemysl: [49.78, 22.77, 1],
  };
  // label offsets [dx, dy, text-anchor]; default: to the right
  const CITY_LABEL = { warsaw: [-7, 17, 'end'], plock: [0, -7, 'middle'], wloclawek: [-6, 4, 'end'], torun: [-6, 4, 'end'], deblin: [-6, 4, 'end'],
    lwow: [-6, 13, 'end'], brest: [0, -8, 'middle'], bialystok: [0, 14, 'middle'], przemysl: [-6, 4, 'end'] };
  const CITY_LABEL_SMALL = { plock: [0, 18, 'middle'], wloclawek: [0, -9, 'middle'] };   // the small map has bigger letters
  const UNIT_LABEL_SMALL = { mozyr: [12, 5, 'start'] };
  const UNIT_LABEL = { army4: [0, -10, 'middle'], main: [0, -10, 'middle'], mozyr: [12, 4, 'start'], cav: [9, -10, 'end'] };
  const RIVERS = {   // [points, width, label anchor [lat, lon, dx, dy, text-anchor] | null]
    vistula: [[[50.06, 19.94], [50.25, 20.55], [50.5, 21.3], [50.68, 21.75], [51.0, 21.82], [51.42, 21.97], [51.56, 21.85], [51.9, 21.4],
      [52.23, 21.03], [52.43, 20.71], [52.4, 20.3], [52.55, 19.70], [52.65, 19.07], [53.01, 18.60], [53.3, 18.75], [53.7, 18.8]], 4, [50.75, 21.78, -7, 0, 'end']],
    wieprz: [[[50.55, 23.3], [50.98, 23.17], [51.3, 22.88], [51.46, 22.6], [51.5, 22.2], [51.56, 21.85]], 2.4, [51.05, 23.2, 6, 4]],
    bug: [[[49.6, 24.68], [50.3, 24.45], [50.85, 24.1], [51.25, 23.7], [51.6, 23.62], [52.08, 23.62], [52.3, 23.0], [52.39, 22.66], [52.6, 22.1],
      [52.7, 21.86], [52.59, 21.46], [52.51, 21.06]], 2.4, [51.45, 23.62, 6, 4]],
    narew: [[[53.4, 23.3], [53.2, 22.7], [53.18, 22.07], [53.08, 21.57], [52.88, 21.4], [52.7, 21.08], [52.51, 21.06], [52.43, 20.71]], 2.4, [53.2, 22.4, 0, -6, 'middle']],
    wkra: [[[53.3, 20.15], [52.95, 20.3], [52.7, 20.45], [52.47, 20.68]], 1.8, null],
    san: [[[49.52, 22.45], [49.78, 22.77], [50.02, 22.68], [50.18, 22.6], [50.52, 22.14], [50.68, 21.8]], 2.4, [50.42, 22.25, -6, 0, 'end']],
  };
  // East Prussia (Germany): the strip along the top edge of the map
  const PRUSSIA = [[53.65, 19.2], [53.45, 19.55], [53.3, 20.0], [53.27, 20.5], [53.2, 21.0], [53.38, 21.6], [53.45, 22.3], [53.65, 22.75]];
  const UNITS = {   // red markers: where the Red Army stood on about 15 August
    army4: [53.15, 20.0], main: [52.6, 22.2], mozyr: [51.8, 22.55], cav: [50.1, 23.6],
  };
  const RED_ARROWS = { army4: [[53.1, 20.45], [52.85, 19.35]], main: [[52.5, 22.6], [52.3, 21.35]] };
  const BLUE_ARROWS = { strike: [[51.4, 22.2], [52.35, 22.55]], pl5: [[52.47, 20.8], [52.83, 20.78]] };
  const CHOICES = { A: [[51.35, 22.0], [52.12, 22.12]], B: [[52.1, 21.2], [52.2, 21.9]], C: [[52.18, 20.85], [52.3, 20.3]] };
  const RED = '#c0252b', BLUE = '#1f4fbf', WATER = '#4a8fd6';

  function arrow(pts, color, opts = {}) {
    const [x1, y1] = P(...pts[0]), [x2, y2] = P(...pts[1]);
    const a = Math.atan2(y2 - y1, x2 - x1), s = opts.head || 9, w = opts.w || 3.2;
    const bx = x2 - s * 0.8 * Math.cos(a), by = y2 - s * 0.8 * Math.sin(a);   // line stops under the head
    const h = [[x2 - s * Math.cos(a - 0.5), y2 - s * Math.sin(a - 0.5)], [x2 - s * Math.cos(a + 0.5), y2 - s * Math.sin(a + 0.5)]];
    return `<path d="M${x1} ${y1}L${bx.toFixed(1)} ${by.toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" fill="none"${opts.dash ? ' stroke-dasharray="6 4"' : ''}/>`
      + `<path d="M${x2} ${y2}L${h[0][0].toFixed(1)} ${h[0][1].toFixed(1)}L${h[1][0].toFixed(1)} ${h[1][1].toFixed(1)}Z" fill="${color}"/>`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const label = (x, y, text, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 10.5}"${o.anchor && o.anchor !== 'start' ? ` text-anchor="${o.anchor}"` : ''}`
    + `${o.bold ? ' font-weight="700"' : ''}${o.italic ? ' font-style="italic"' : ''} fill="${o.color || '#222'}" paint-order="stroke" stroke="#fff" stroke-width="${o.halo || 3}" stroke-linejoin="round">${esc(text)}</text>`;
  const zigzag = (x0, y0, x1, y1, k, amp) => {
    const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
    let z = `M${x0} ${y0}`;
    for (let i = 1; i <= k; i++) {
      const f = i / k, o = i === k ? 0 : (i % 2 ? amp : -amp);
      z += `L${(x0 + (x1 - x0) * f + nx * o).toFixed(1)} ${(y0 + (y1 - y0) * f + ny * o).toFixed(1)}`;
    }
    return z;
  };

  /**
   * opts: { L: labels (cities, rivers, units, prussia, red, pl5, strike, jam), mode: 'story' | 'choice',
   *         cities?: extra towns { id: [lat, lon] }, units?: red markers instead of ours { id: [lat, lon] },
   *         choices?: the arrows to pick from { A: [from, to], … }, choiceLabels?: { A: [dx, dy], … } }
   *   (the extra options let the "Revolution" cipher sheet draw its own question on the same map)
   * story: the whole picture — red arrows (where they went), the blue strike from the Wieprz and Sikorski's
   *        5th Army, the jammed radio, a legend.
   * choice: the small map for the question — main towns and rivers in bigger letters, red markers only, and
   *        three dashed arrows A, B, C to pick from.
   */
  function mapSvg(opts) {
    const L = opts.L, story = opts.mode === 'story', f = story ? 1 : 1.35;   // letters bigger on the small map
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,Roboto,Arial,sans-serif">`
      + `<defs><pattern id="w20h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v6" stroke="#c9c3b3" stroke-width="1.4"/></pattern></defs>`
      + `<rect width="${W}" height="${H}" fill="#f7f4ea"/>`;
    // Germany (East Prussia) at the top
    const pr = PRUSSIA.map(p => P(...p));
    s += `<path d="M${pr.map(p => p.join(' ')).join('L')}V0H${pr[0][0]}Z" fill="url(#w20h)" stroke="#8d8676" stroke-width="1.4" stroke-dasharray="5 3"/>`
      + label(P(53.55, 20.85)[0], P(53.55, 20.85)[1], L.prussia, { size: 9.5 * (story ? 1 : 1.2), color: '#5d574a', anchor: 'middle', italic: true, bold: true });
    // the country name, faint, under everything
    if (story) {
      // kept inside the map: POLOGNE and POLONIA are a letter longer than POLSKA (a heavy capital ≈ 0.75 em + spacing)
      const [x, qy] = P(50.72, 19.2), qx = +Math.max(x, [...L.poland].length * (26 * 0.75 + 7) / 2 + 4).toFixed(1);
      s += `<text x="${qx}" y="${qy}" font-size="26" font-weight="800" letter-spacing="7" text-anchor="middle" fill="#e2dccb">${esc(L.poland)}</text>`;
    }
    // rivers
    for (const [id, [pts, w, at]] of Object.entries(RIVERS)) {
      if (!story && !['vistula', 'wieprz', 'bug', 'narew'].includes(id)) continue;
      s += `<path d="${path(pts)}" stroke="${WATER}" stroke-width="${w}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
      if (at && (story || id === 'vistula' || id === 'wieprz')) {
        const [x, y] = P(at[0], at[1]);
        s += label(x + at[2], y + at[3], L.rivers[id], { color: '#2a6cb0', anchor: at[4], italic: true, size: (id === 'vistula' ? 11.5 : 9.5) * f });
      }
    }
    // towns
    for (const [id, [lat, lon, minor]] of Object.entries({ ...CITY, ...opts.cities })) {
      if (minor && !story) continue;
      const [x, y] = P(lat, lon), big = id === 'warsaw', [dx, dy, anchor] = (!story && CITY_LABEL_SMALL[id]) || CITY_LABEL[id] || [6, 4];
      s += big ? `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="#222" stroke="#fff" stroke-width="1.5"/>`
        : `<circle cx="${x}" cy="${y}" r="3.2" fill="#fff" stroke="#222" stroke-width="1.8"/>`;
      s += label(x + dx * (big ? 1 : f), y + dy * (big ? 1 : (dy > 6 ? f : 1)), L.cities[id], { anchor, bold: big, size: (big ? 12.5 : 10) * f });
    }
    // Red Army
    for (const [id, [lat, lon]] of Object.entries(opts.units || UNITS)) {
      const [x, y] = P(lat, lon), [dx, dy, anchor] = (!story && UNIT_LABEL_SMALL[id]) || UNIT_LABEL[id] || [0, -10, 'middle'];
      s += `<rect x="${x - 9}" y="${y - 6}" width="18" height="12" fill="#fff" stroke="${RED}" stroke-width="2"/>`
        + `<path d="M${x - 9} ${y - 6}L${x + 9} ${y + 6}M${x - 9} ${y + 6}L${x + 9} ${y - 6}" stroke="${RED}" stroke-width="1.2"/>`
        + label(x + dx, y + (dy < 0 ? dy * f : dy), L.units[id], { anchor, color: '#a01d22', bold: true, size: 10 * (story ? 1 : 1.2) });
    }
    if (story) {
      for (const pts of Object.values(RED_ARROWS)) s += arrow(pts, RED);
      s += arrow(BLUE_ARROWS.strike, BLUE, { w: 5.5, head: 13 }) + arrow(BLUE_ARROWS.pl5, BLUE, { w: 3.6, head: 10 });
      const [px, py] = P(52.55, 20.9);
      s += label(px + 6, py + 4, L.pl5, { color: BLUE, bold: true, size: 9.5 });
      // the jammed radio: a zigzag from Warsaw towards the 4th Army
      const [ax, ay] = P(...CITY.warsaw), [cx, cy] = P(52.95, 20.12);
      s += `<path d="${zigzag(ax - 5, ay - 8, cx, cy, 9, 4.5)}" stroke="#d29a00" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`
        + `<circle cx="${cx}" cy="${cy}" r="3" fill="#d29a00"/>`;
      // the way west: Berlin is off the map, about 520 km from Warsaw
      s += arrow([[52.38, 18.95], [52.38, 17.8]], '#7a7466', { w: 2.4, head: 9, dash: true })
        + label(P(52.38, 17.8)[0] + 2, P(52.38, 18.95)[1] - 7, L.berlin, { size: 9.5, color: '#5d574a', bold: true });
      // legend, left, between the rivers
      const lx = 12, ly = 186;
      s += `<rect x="${lx - 6}" y="${ly - 13}" width="132" height="64" rx="3" fill="#fff" fill-opacity=".9" stroke="#bbb"/>`
        + `<path d="M${lx} ${ly}h17" stroke="${RED}" stroke-width="3.2"/><path d="M${lx + 24} ${ly}l-8 -5v10z" fill="${RED}"/>` + label(lx + 30, ly + 4, L.red, { size: 10 })
        + `<path d="M${lx} ${ly + 19}h16" stroke="${BLUE}" stroke-width="4.5"/><path d="M${lx + 25} ${ly + 19}l-9 -6v12z" fill="${BLUE}"/>` + label(lx + 30, ly + 23, L.strike, { size: 10, color: BLUE, bold: true })
        + `<path d="M${lx} ${ly + 38}l4 -4l4 8l4 -8l4 8l4 -8l4 4" stroke="#d29a00" stroke-width="2" fill="none"/>` + label(lx + 30, ly + 42, L.jam, { size: 10, color: '#8a6400', bold: true });
    } else {
      for (const [c, pts] of Object.entries(opts.choices || CHOICES)) {
        s += arrow(pts, '#444', { dash: true, w: 2.8, head: 11 });
        const [x, y] = P(...pts[1]), [ox, oy] = (opts.choiceLabels || { A: [16, 2], B: [0, -17], C: [0, -17] })[c];
        s += `<circle cx="${x + ox}" cy="${y + oy}" r="11.5" fill="#fff" stroke="#444" stroke-width="1.8"/>`
          + `<text x="${x + ox}" y="${y + oy + 5.5}" font-size="16" font-weight="800" text-anchor="middle" fill="#222">${c}</text>`;
      }
    }
    // north arrow and a scale bar (100 km ≈ 0.9° of latitude)
    const km = K * 100 / 111, sy = H - 14;
    s += `<g transform="translate(${W - 18} ${story ? 104 : 44})"><path d="M0 -14L6 6L0 2L-6 6Z" fill="#333"/><text y="-17" font-size="11" font-weight="700" text-anchor="middle" fill="#333">N</text></g>`
      + `<path d="M14 ${sy}h${km.toFixed(1)}" stroke="#333" stroke-width="2"/><path d="M14 ${sy - 4}v8M${(14 + km / 2).toFixed(1)} ${sy - 3}v6M${(14 + km).toFixed(1)} ${sy - 4}v8" stroke="#333" stroke-width="1.5"/>`
      + label(14, sy - 7, '0', { size: 9 * f, anchor: 'middle' }) + label(14 + km, sy - 7, '100 km', { size: 9 * f, anchor: 'middle' })
      + `<rect width="${W}" height="${H}" fill="none" stroke="#888"/>`;
    return s + '</svg>';
  }

  /**
   * A real decrypt, as the Cipher Bureau typed it (spelling of 1920, gaps as in the original): the Polish
   * translation of a South-Western Front order, intercepted 24 July 1920, read 25 July, signed by Kowalewski.
   * Archive of the Piłsudski Institute of America, collection 3, vol. 1, p. 29 (photo: poznajhistorie.org).
   */
  const REAL = {
    secret: 'Ściśle tajne.', title: 'Tłumaczenie szyfrogramu.',
    head: [['Od:', 'Fr. Połudn. Zachodn.'], ['Do:', 'D-ców armji XII, I-j konnej, XIV.'], ['Przejęto:', '24/VII'], ['Odczytano:', '25/VII']],
    note: '(Nowa Aleksandrja = Puławy)',
    body: [
      'ROZKAZ do armji Południowo Zach. Frontu.',
      '……(początku brak)…… 5-e sierpnia ……',
      '2) …Dubno……(przerwa)…… rejonem LWÓW–RAWA RUSKA, wyrzuciwszy przednie swoje oddziały w celu zajęcia przepraw przez SAN w rejonie SINIAWA–PRZEMYŚL.',
      '3) XIV-a armja biorąc pod uwagę zadania konnej armji, złamie opór nieprzyjaciela na linji rzeki ZBRUCZ i całą siłą swojej grupy szturmowej poprowadzi decydującą ofenzywę w ogólnym kierunku na TARNOPOL–PRZEMYSL–GÓRODOK.',
      '4) Linje graniczne między: XII-ą armją i Frontem Zachodnim: na 24/VII DOMBROWICA–RATNO–WŁODAWA–NOWA ALEKSANDRJA, wszystkie te punkty, oprócz pierwszego – dla frontu Zachodniego. XII-ą armją a Konną armją: St. KIWIERCY–ŁOMACZI–MIRCZE–ŁABUN–RUDNIK, wszystkie te punkty dla ███ XII-j armji. Konną armją a XIV-ą armją: ……(przerwa)……',
    ],
    signs: [['Głównodowodzący połud. zach. Frontem', 'JEGOROW'], ['Członek Rady rewolucyjnej frontu', 'STALIN'], ['Szef Sztabu Poł. Zach. Frontu', 'PIETIN'], ['Z oryginałem zgodne – Sz. Op. Wydz. XII arm.', 'KRAUKLIS']],
    cipher: 'Zaszyfrował WANIN.', date: '24/VII-1920 roku.',
    check: ['Za zgodność z oryginałem:', 'Kowalewski', 'Naczelnik Wydz. 2.'],
    foot: ['NACZELNE DOWÓDZTWO W.P. (SZTAB GENERALNY)', 'Oddział II. Biuro Szyfrowe', 'Sz. № 31724/II', 'Warszawa, dnia 25/VII 1920'],
    source: 'Archiwum Instytutu Józefa Piłsudskiego w Ameryce, Kolekcja nr 3, t. 1, s. 29 · poznajhistorie.org',
  };

  return { ALPHABET, PATTERN_WORD, SLOTS, VOCAB, REAL, key, day, lettersUsed, halfKey, findPattern, patternHits, countStreamSolutions, solve, mapSvg, CHOICE_ANSWER: 'A' };
})();
if (typeof module !== 'undefined') module.exports = W20;
