/**
 * Clock — shared engine for the online game (index.html) and the printable worksheet (worksheet.html).
 * Classic script; defines the global `CLOCK` (also exported for Node: `node engine.test.js`).
 *
 * A time is { h, m } with h = 0..23 and m = 0..59. Without the 24-hour option only h = 1..12 is used.
 *   CLOCK.LEVELS                      → minute step per level (hour → :00 only, half → :00/:30, quarter → :15, five → 5 min, minute → 1 min)
 *   CLOCK.rng(seed)                   → seeded random numbers 0..1 (same seed ⇒ same worksheet)
 *   CLOCK.randomTime(rnd, level, h24) → a time that fits the level
 *   CLOCK.digital(t, h24)             → "3:30" / "15:30"
 *   CLOCK.words(t, lang)              → how people say it ("wpół do czwartej", "half past three"…), null if m is not a multiple of 5
 *   CLOCK.period(t)                   → 'night' | 'morning' | 'afternoon' | 'evening' (for the 24-hour option)
 *   CLOCK.distractors(t, level, h24, rnd) → three wrong answers built from typical mistakes
 *   CLOCK.svg(opts)                   → the clock face as an SVG string
 */
const CLOCK = (() => {
  const LEVELS = { hour: 60, half: 30, quarter: 15, five: 5, minute: 1 };
  const LEVEL_IDS = Object.keys(LEVELS);

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

  const h12 = h => (((h % 12) + 12) % 12) || 12;
  const same = (a, b) => a.h === b.h && a.m === b.m;
  /** Same position of the hands (3:30 and 15:30 look the same on the clock). */
  const sameFace = (a, b) => h12(a.h) === h12(b.h) && a.m === b.m;
  const minutesOf = t => (t.h % 12) * 60 + t.m;          // 0..719, what the hands show
  const fromMinutes = (n, pm) => { n = ((n % 720) + 720) % 720; const h = Math.floor(n / 60); return { h: pm ? h + 12 : (h || 12), m: n % 60 }; };

  function randomTime(rnd, level, h24) {
    const step = LEVELS[level] || 30;
    const m = step * Math.floor(rnd() * (60 / step));
    const h = h24 ? Math.floor(rnd() * 24) : 1 + Math.floor(rnd() * 12);
    return { h, m };
  }
  /** `count` different times; a full hour and a half hour come first on the easiest level so both kinds show up. */
  function randomTimes(rnd, level, h24, count) {
    const out = [], max = (60 / LEVELS[level]) * (h24 ? 24 : 12);
    let guard = 0;
    while (out.length < count && guard++ < 5000) {
      const t = randomTime(rnd, level, h24);
      const prev = out[out.length - 1];
      if (out.length < max && out.some(o => same(o, t))) continue;
      if (prev && out.length < max - 1 && (prev.h === t.h || prev.m === t.m) && rnd() < 0.7) continue;   // vary neighbours
      out.push(t);
    }
    return out;
  }

  const pad = n => String(n).padStart(2, '0');
  const digital = (t, h24) => `${h24 ? t.h : h12(t.h)}:${pad(t.m)}`;

  function period(t) {
    if (t.h < 6 || t.h >= 22) return 'night';
    if (t.h < 12) return 'morning';
    if (t.h < 18) return 'afternoon';
    return 'evening';
  }

  /* ---------- time in words ---------- */
  const PL_NOM = ['', 'pierwsza', 'druga', 'trzecia', 'czwarta', 'piąta', 'szósta', 'siódma', 'ósma', 'dziewiąta', 'dziesiąta', 'jedenasta', 'dwunasta'];
  const PL_GEN = ['', 'pierwszej', 'drugiej', 'trzeciej', 'czwartej', 'piątej', 'szóstej', 'siódmej', 'ósmej', 'dziewiątej', 'dziesiątej', 'jedenastej', 'dwunastej'];
  const PL_MIN = { 5: 'pięć', 10: 'dziesięć', 15: 'kwadrans', 20: 'dwadzieścia', 25: 'dwadzieścia pięć' };
  const UK_NOM = ['', 'перша', 'друга', 'третя', 'четверта', 'п’ята', 'шоста', 'сьома', 'восьма', 'дев’ята', 'десята', 'одинадцята', 'дванадцята'];
  const UK_ACC = ['', 'першу', 'другу', 'третю', 'четверту', 'п’яту', 'шосту', 'сьому', 'восьму', 'дев’яту', 'десяту', 'одинадцяту', 'дванадцяту'];
  const UK_LOC = ['', 'першій', 'другій', 'третій', 'четвертій', 'п’ятій', 'шостій', 'сьомій', 'восьмій', 'дев’ятій', 'десятій', 'одинадцятій', 'дванадцятій'];
  const UK_MIN = { 5: 'п’ять', 10: 'десять', 15: 'чверть', 20: 'двадцять', 25: 'двадцять п’ять' };
  const EN_H = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const EN_MIN = { 5: 'five', 10: 'ten', 15: 'quarter', 20: 'twenty', 25: 'twenty-five' };
  const FR_H = ['', 'une heure', 'deux heures', 'trois heures', 'quatre heures', 'cinq heures', 'six heures', 'sept heures', 'huit heures', 'neuf heures', 'dix heures', 'onze heures', 'douze heures'];
  const FR_MIN = { 5: 'cinq', 10: 'dix', 20: 'vingt', 25: 'vingt-cinq' };

  /** How the time is said, from the hands only (12-hour, as people speak). null when m is not a multiple of 5. */
  function words(t, lang) {
    const m = t.m;
    if (m % 5) return null;
    const h = h12(t.h), nx = h12(h + 1), past = m, to = 60 - m;
    switch (lang) {
      case 'pl':
        if (m === 0) return `${PL_NOM[h]}`;
        if (m === 30) return `wpół do ${PL_GEN[nx]}`;
        if (m < 30) return `${PL_MIN[past]} po ${PL_GEN[h]}`;
        return `za ${PL_MIN[to]} ${PL_NOM[nx]}`;
      case 'uk':
        if (m === 0) return `${UK_NOM[h]} година`;
        if (m === 30) return `пів на ${UK_ACC[nx]}`;
        if (m < 30) return `${UK_MIN[past]} по ${UK_LOC[h]}`;
        return `за ${UK_MIN[to]} ${UK_NOM[nx]}`;
      case 'vi':
        if (m === 0) return `${h} giờ đúng`;
        if (m === 30) return `${h} giờ rưỡi`;
        if (m < 40) return `${h} giờ ${m} phút`;
        return `${nx} giờ kém ${to} phút`;
      case 'fr':
        if (m === 0) return FR_H[h];
        if (m === 15) return `${FR_H[h]} et quart`;
        if (m === 30) return `${FR_H[h]} et demie`;
        if (m === 45) return `${FR_H[nx]} moins le quart`;
        if (m < 30) return `${FR_H[h]} ${FR_MIN[past]}`;
        return `${FR_H[nx]} moins ${FR_MIN[to]}`;
      default:
        if (m === 0) return `${EN_H[h]} o’clock`;
        if (m === 30) return `half past ${EN_H[h]}`;
        if (m < 30) return `${EN_MIN[past]} past ${EN_H[h]}`;
        return `${EN_MIN[to]} to ${EN_H[nx]}`;
    }
  }

  /* ---------- wrong answers for "What time is it?" ---------- */
  /** Typical mistakes: hands swapped, hour one off (the hour hand is already close to the next number),
   *  minutes read as the number the long hand points at, the other half of the day. */
  function distractors(t, level, h24, rnd) {
    const step = LEVELS[level];
    const snap = m => (Math.round(m / step) * step) % 60;
    const pm = t.h >= 12;
    const mk = (h, m) => {   // keep the answer in the same half of the day as the right one
      h = h12(h);
      return { h: h24 ? (h % 12) + (pm ? 12 : 0) : h, m: ((m % 60) + 60) % 60 };
    };
    const ideas = [];
    // hands swapped: the short hand read as minutes, the long hand as hours
    const hourPos = (t.h % 12) + t.m / 60;               // 0..12, where the short hand points
    ideas.push(mk(Math.round(t.m / 5) || 12, snap(hourPos * 5)));
    // hour one off
    ideas.push(mk(t.m >= 30 ? t.h + 1 : t.h - 1, t.m));
    ideas.push(mk(t.m >= 30 ? t.h - 1 : t.h + 1, t.m));
    // minutes = the number the long hand points at (6 → "3:06")
    if (t.m % 5 === 0 && t.m !== 0) ideas.push(mk(t.h, t.m / 5));
    // the other half of the day
    if (h24) ideas.push({ h: (t.h + 12) % 24, m: t.m });
    // the mirrored minute (15 ↔ 45)
    if (t.m !== 0 && t.m !== 30) ideas.push(mk(t.h, 60 - t.m));
    // fillers
    for (let i = 0; i < 30; i++) ideas.push(mk(t.h + Math.floor(rnd() * 5) - 2, step * Math.floor(rnd() * (60 / step))));

    const out = [];
    // shuffle the first ideas a little so the same mistake does not always come first
    const head = ideas.slice(0, 6).sort(() => rnd() - 0.5), rest = ideas.slice(6);
    for (const d of head.concat(rest)) {
      if (out.length === 3) break;
      if (same(d, t) || out.some(o => same(o, d))) continue;
      if (!h24 && sameFace(d, t)) continue;
      out.push(d);
    }
    return out;
  }

  /* ---------- the clock face ---------- */
  /**
   * opts: { t: {h,m} | null (no hands), size (px, default 200), minutes: bool (5, 10, 15… round the edge),
   *         colors: bool (red hour hand, blue minute hand), id: string, handles: bool (wide invisible grab areas) }
   * Drawn in a 200×200 box; numbers 1–12, 60 ticks.
   */
  function svg(opts = {}) {
    const { t = null, minutes = false, colors = true, handles = false, cls = '' } = opts;
    const R = minutes ? 80 : 92;              // the dial shrinks to make room for the minute labels
    const c = 100;
    const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
    const f = n => Math.round(n * 100) / 100;
    let s = `<svg class="clockface ${cls}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img">`;
    s += `<circle cx="100" cy="100" r="${R}" fill="#fff" stroke="#1e2436" stroke-width="${minutes ? 3 : 3.5}"/>`;
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0;
      const [x1, y1] = pt(i * 6, R - (big ? 9 : 4.5)), [x2, y2] = pt(i * 6, R - 1.5);
      s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#1e2436" stroke-width="${big ? 2.4 : 1}" stroke-linecap="round"/>`;
    }
    const fs = minutes ? 15 : 17;
    for (let n = 1; n <= 12; n++) {
      const [x, y] = pt(n * 30, R - (minutes ? 21 : 24));
      s += `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" dominant-baseline="central" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" font-size="${fs}" font-weight="700" fill="#1e2436">${n}</text>`;
    }
    if (minutes) {
      for (let n = 0; n < 12; n++) {
        const [x, y] = pt(n * 30, R + 11);
        s += `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" dominant-baseline="central" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" font-size="9.5" font-weight="700" fill="#3d48b8">${pad(n * 5)}</text>`;
      }
    }
    if (t) {
      const hourDeg = ((t.h % 12) + t.m / 60) * 30, minDeg = t.m * 6;
      const hourC = colors ? '#d6455a' : '#1b1b1f', minC = colors ? '#3d48b8' : '#1b1b1f';
      const hand = (deg, len, w, col, name) => {
        const [x, y] = pt(deg, len), [bx, by] = pt(deg + 180, len * 0.14);
        let g = `<g class="hand ${name}" data-hand="${name}">`;
        if (handles) g += `<line x1="100" y1="100" x2="${f(x)}" y2="${f(y)}" stroke="transparent" stroke-width="26" stroke-linecap="round"/>`;
        g += `<line x1="${f(bx)}" y1="${f(by)}" x2="${f(x)}" y2="${f(y)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
        return g + '</g>';
      };
      s += hand(hourDeg, R * 0.52, 7, hourC, 'hour');
      s += hand(minDeg, R * 0.8, 4.2, minC, 'minute');
    }
    s += `<circle cx="100" cy="100" r="${t ? 5.5 : 3.5}" fill="#1e2436"/>`;
    return s + '</svg>';
  }

  return { LEVELS, LEVEL_IDS, rng, pick, h12, same, sameFace, minutesOf, fromMinutes, randomTime, randomTimes, digital, pad, period, words, distractors, svg };
})();
if (typeof module !== 'undefined') module.exports = CLOCK;
