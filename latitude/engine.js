/**
 * Latitude (N and S) — shared engine for the online game (index.html) and the printable worksheet (worksheet.html).
 * Classic script; defines the global `LAT` (also exported for Node: `node engine.test.js`).
 *
 * A latitude is a whole number −90..90: north is positive, south negative, 0 is the equator.
 *   LAT.LEVELS                         → per level: the step of the answers and of the map grid
 *   LAT.rng(seed)                      → seeded random numbers 0..1 (same seed ⇒ same worksheet)
 *   LAT.fmt(lat, letters)              → "40°N", "40°S", "0°" (letters: { N, S } of the page language)
 *   LAT.randomLat(rnd, level)          → a latitude that fits the level
 *   LAT.CITIES                         → real places with their latitude and longitude
 *   LAT.readDistractors(lat, level, rnd)   → three wrong answers built from typical mistakes
 *   LAT.diffDistractors(a, b, level, rnd)  → three wrong answers for "how many degrees between a and b?"
 *   LAT.mapSvg(opts) / LAT.ladderSvg(opts) → the map (equirectangular, so parallels are evenly spaced) and a latitude scale
 *
 * Longitude (W / E) works the same way: −180..180, east positive; LAT.fmtLon, LAT.randomLon(s), LAT.lonDistractors,
 * LAT.pointDistractors (both coordinates), LAT.lonScaleSvg, and LAT.noonSvg — the sun at noon and a Greenwich chronometer.
 */
const LAT = (() => {
  /** step: answers are multiples of it; grid: a parallel is drawn (and labelled) every `grid` degrees. */
  const LEVELS = { l30: { step: 30, grid: 30 }, l10: { step: 10, grid: 10 }, l5: { step: 5, grid: 10 }, city: { step: 1, grid: 10 } };
  const LEVEL_IDS = Object.keys(LEVELS);

  /** mulberry32 on a string hash: a small seeded generator (same as the clock). */
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
  function shuffle(rnd, arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }

  const hemi = lat => lat > 0 ? 'N' : lat < 0 ? 'S' : '0';
  const fmt = (lat, L = { N: 'N', S: 'S' }) => lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? L.N : L.S}`;
  /** Degrees between two latitudes (north to south) or two longitudes (west to east, never across 180°). */
  const diff = (a, b) => Math.abs(a - b);

  /* Longitude: −180..180, east positive, west negative, 0 is the prime meridian (Greenwich).
     180° east and 180° west are the same line, written "180°" without a letter. */
  const normLon = v => { v = ((((v + 180) % 360) + 360) % 360) - 180; return v === -180 ? 180 : v; };
  const hemiLon = lon => lon === 0 ? '0' : Math.abs(lon) === 180 ? '180' : lon > 0 ? 'E' : 'W';
  const fmtLon = (lon, L = { E: 'E', W: 'W' }) => (lon === 0 || Math.abs(lon) === 180) ? `${Math.abs(lon)}°` : `${Math.abs(lon)}°${lon > 0 ? L.E : L.W}`;
  /** A longitude for the level, like randomLat: 0° and 180° rare, in-between values favoured on 10° and 5°. */
  function randomLon(rnd, level, max = 180) {
    const { step } = LEVELS[level] || LEVELS.l10;
    const vals = [];
    for (let v = -180 + step; v <= 180; v += step) if (Math.abs(v) <= max) vals.push(v);
    for (let guard = 0; guard < 50; guard++) {
      const v = pick(rnd, vals), a = Math.abs(v);
      if ((a === 0 || a === 180) && rnd() < 0.75) continue;
      if (level === 'l5' && a % 10 === 0 && rnd() < 0.5) continue;
      if (level === 'l10' && a % 30 === 0 && rnd() < 0.5) continue;
      return v;
    }
    return step === 30 ? 30 : 40;
  }
  /** `count` longitudes, different while possible, at least a third on each side of Greenwich. */
  function randomLons(rnd, level, count, max = 180) {
    const out = [], need = Math.floor(count / 3);
    for (let guard = 0; out.length < count && guard < 5000; guard++) {
      const v = randomLon(rnd, level, max);
      if (out.includes(v) && guard < 4000) continue;
      const e = out.filter(x => hemiLon(x) === 'E').length, w = out.filter(x => hemiLon(x) === 'W').length, left = count - out.length;
      if (hemiLon(v) !== 'W' && need - w >= left) continue;
      if (hemiLon(v) !== 'E' && need - e >= left) continue;
      out.push(v);
    }
    return out;
  }
  /** Greenwich time (minutes after midnight) when the sun is highest at this longitude: the Earth turns 15° an hour,
   *  1° in 4 minutes; noon comes earlier in the east. */
  const noonAt = lon => 720 - lon * 4;
  const hhmm = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;   // "04:40", so the morning is not read as afternoon

  /** A latitude for the level. On "every 5°" the in-between values (5, 15, 25…) come more often, on
   *  "every 10°" the ones that are not on the 30° lines: they are the point of the level. The equator and
   *  the poles are rare (they are easy). */
  function randomLat(rnd, level) {
    const { step } = LEVELS[level] || LEVELS.l10;
    const vals = [];
    for (let v = -90; v <= 90; v += step) vals.push(v);
    for (let guard = 0; guard < 50; guard++) {
      const v = pick(rnd, vals), a = Math.abs(v);
      if ((a === 0 || a === 90) && rnd() < 0.7) continue;
      if (level === 'l5' && a % 10 === 0 && rnd() < 0.5) continue;
      if (level === 'l10' && a % 30 === 0 && rnd() < 0.5) continue;
      return v;
    }
    return step === 30 ? 30 : 40;
  }
  /** `count` latitudes, no two the same while possible, at least a third of them on each side of the equator. */
  function randomLats(rnd, level, count) {
    const out = [];
    const need = Math.floor(count / 3);
    for (let guard = 0; out.length < count && guard < 5000; guard++) {
      const v = randomLat(rnd, level);
      if (out.includes(v) && guard < 4000) continue;
      const n = out.filter(x => x > 0).length, s = out.filter(x => x < 0).length, left = count - out.length;
      if (v >= 0 && need - s >= left) continue;    // the rest must go south
      if (v <= 0 && need - n >= left) continue;    // … or north
      out.push(v);
    }
    return out;
  }

  /* ---------- real places (latitude and longitude to 0.01°; the answer is the latitude to a whole degree) ---------- */
  const CITIES = [
    ['northPole', 90, 0], ['reykjavik', 64.15, -21.94], ['oslo', 59.91, 10.75], ['gdansk', 54.35, 18.65],
    ['warsaw', 52.23, 21.01], ['london', 51.51, -0.13], ['krakow', 50.06, 19.94], ['kyiv', 50.45, 30.52],
    ['lviv', 49.84, 24.03], ['paris', 48.86, 2.35], ['marseille', 43.3, 5.37], ['rome', 41.9, 12.5],
    ['newYork', 40.71, -74.01], ['madrid', 40.42, -3.7], ['tokyo', 35.68, 139.69], ['cairo', 30.04, 31.24],
    ['hanoi', 21.03, 105.85], ['mexico', 19.43, -99.13], ['mumbai', 19.08, 72.88], ['hcmc', 10.82, 106.63],
    ['singapore', 1.35, 103.82], ['quito', -0.18, -78.47], ['nairobi', -1.29, 36.82], ['jakarta', -6.2, 106.85],
    ['lima', -12.05, -77.04], ['rio', -22.91, -43.17], ['johannesburg', -26.2, 28.05], ['perth', -31.95, 115.86],
    ['santiago', -33.45, -70.67], ['capeTown', -33.92, 18.42], ['sydney', -33.87, 151.21], ['buenosAires', -34.6, -58.38],
    ['wellington', -41.29, 174.78], ['ushuaia', -54.8, -68.3], ['southPole', -90, 0],
  ].map(([id, real, lon]) => ({ id, real, lon, lat: Math.round(real), lonR: Math.round(lon) }));
  const city = id => CITIES.find(c => c.id === id);

  /** Lines with names: the tropics and the polar circles (23°26′ and 66°34′). */
  const LINES = [
    { id: 'arctic', lat: 66.57, text: '66°34′' }, { id: 'cancer', lat: 23.44, text: '23°26′' },
    { id: 'capricorn', lat: -23.44, text: '23°26′' }, { id: 'antarctic', lat: -66.57, text: '66°34′' },
  ];

  /* ---------- wrong answers ---------- */
  const inRange = v => v >= -90 && v <= 90;
  /** Typical mistakes: the other side of the equator (N ↔ S), counting from the pole instead of the equator
   *  (30°N read as 60°N), one or two grid lines off. The N ↔ S swap always comes in when there is one. */
  function readDistractors(lat, level, rnd) {
    const step = level === 'city' ? 10 : LEVELS[level].step;
    const sg = Math.sign(lat) || 1, a = Math.abs(lat);
    const first = lat !== 0 ? [-lat] : [];
    const ideas = [];
    if (a !== 0 && a !== 45) ideas.push(sg * (90 - a));
    ideas.push(lat + step, lat - step);
    if (lat === 0) ideas.push(step, -step);
    ideas.push(lat + 2 * step, lat - 2 * step, -(lat + sg * step));
    shuffle(rnd, ideas);
    for (let i = 0; i < 40; i++) ideas.push(Math.round((rnd() * 180 - 90) / step) * step);
    const out = [];
    for (const v of first.concat(ideas)) {
      if (out.length === 3) break;
      if (!inRange(v) || v === lat || out.includes(v)) continue;
      out.push(v);
    }
    return out;
  }
  /** Longitude: the other side of Greenwich (E ↔ W, always one of them), counting from the 180° line, a line or two off. */
  function lonDistractors(lon, level, rnd) {
    const step = level === 'city' ? 10 : LEVELS[level].step;
    const sg = Math.sign(lon) || 1, a = Math.abs(lon);
    const first = hemiLon(lon) === 'E' || hemiLon(lon) === 'W' ? [-lon] : [];
    const ideas = [];
    if (a !== 0 && a !== 90 && a !== 180) ideas.push(sg * (180 - a));
    ideas.push(lon + step, lon - step, lon + 2 * step, lon - 2 * step, -(lon + sg * step));
    if (lon === 0) ideas.push(step, -step);
    shuffle(rnd, ideas);
    for (let i = 0; i < 40; i++) ideas.push(Math.round((rnd() * 360 - 180) / step) * step);
    const out = [];
    for (const v0 of first.concat(ideas)) {
      if (out.length === 3) break;
      if (v0 < -180 || v0 > 180) continue;
      const v = normLon(v0);
      if (v === normLon(lon) || out.includes(v)) continue;
      out.push(v);
    }
    return out;
  }
  /** Both coordinates: one N ↔ S swap and one E ↔ W swap when there are, the two numbers swapped, a line off. */
  function pointDistractors(p, level, rnd) {
    const step = level === 'city' ? 10 : LEVELS[level].step;
    const key = q => `${q.lat}|${q.lon}`;
    const first = [], ideas = [];
    if (p.lat) first.push({ lat: -p.lat, lon: p.lon });
    if (hemiLon(p.lon) === 'E' || hemiLon(p.lon) === 'W') first.push({ lat: p.lat, lon: -p.lon });
    shuffle(rnd, first);
    if (Math.abs(p.lon) <= 90 && p.lon !== p.lat) ideas.push({ lat: p.lon, lon: p.lat });
    ideas.push({ lat: -p.lat, lon: -p.lon }, { lat: p.lat + step, lon: p.lon }, { lat: p.lat - step, lon: p.lon }, { lat: p.lat, lon: p.lon + step }, { lat: p.lat, lon: p.lon - step });
    shuffle(rnd, ideas);
    const out = [];
    for (const q of first.slice(0, 2).concat(ideas)) {
      if (out.length === 3) break;
      if (q.lat < -90 || q.lat > 90 || q.lon < -180 || q.lon > 180) continue;
      const v = { lat: q.lat, lon: normLon(q.lon) };
      if (key(v) === key({ lat: p.lat, lon: normLon(p.lon) }) || out.some(o => key(o) === key(v))) continue;
      out.push(v);
    }
    return out;
  }
  /** For "how many degrees?": the other operation (subtracting across the equator, adding on one side),
   *  one or two grid lines off. Wrong answers stay 1..180. */
  function diffDistractors(a, b, level, rnd) {
    const step = level === 'city' ? 10 : LEVELS[level].step;
    const d = diff(a, b);
    const other = Math.sign(a) * Math.sign(b) < 0 ? Math.abs(Math.abs(a) - Math.abs(b)) : Math.abs(a) + Math.abs(b);
    const first = other !== d ? [other] : [];
    const ideas = shuffle(rnd, [d + step, d - step, d + 2 * step, d - 2 * step, 180 - d]);
    for (let i = 0; i < 40; i++) ideas.push(step * (1 + Math.floor(rnd() * (180 / step))));
    const out = [];
    for (const v of first.concat(ideas)) {
      if (out.length === 3) break;
      if (v <= 0 || v > 180 || v === d || out.includes(v)) continue;
      out.push(v);
    }
    return out;
  }

  /* ---------- the land: rough outlines, [lon, lat, lon, lat, …], drawn on an equirectangular map ---------- */
  const LAND = [
    // North America (with Hudson Bay, the Gulf of Mexico and the Gulf of California as inlets)
    [-168, 65.6, -164.5, 66.5, -166.2, 68.9, -163, 70, -156.5, 71.3, -152, 70.8, -145, 70.1, -141, 69.7, -136, 69, -130, 70, -125, 69.5, -120, 69, -115, 68, -108, 68, -100, 67.8, -96, 69, -94, 71, -89, 68.5, -86, 67, -86, 64.5, -90.7, 63.3, -94.2, 58.8, -92, 57, -87, 55.5, -82.3, 55, -80.5, 51.5, -79, 54.5, -76.7, 56.5, -77.8, 58.5, -77.6, 60.5, -78, 62.4, -72, 61.5, -69.5, 59, -65, 60.3, -61.5, 56.5, -57, 52.5, -56, 51.6, -60, 50.2, -66.5, 50, -70.5, 47, -64.2, 48.8, -65, 47, -64, 46.2, -61, 45.6, -60, 45.8, -63.5, 44.6, -66, 43.8, -67, 44.6, -70, 43.7, -70.6, 42, -70, 41.6, -74, 40.6, -74, 39.5, -75.5, 38.5, -76, 37, -75.9, 35.6, -77.9, 34, -81, 32, -81.4, 30.5, -80.6, 28.5, -80, 26.5, -80.4, 25.2, -81.2, 25.3, -82, 26.5, -82.8, 28.2, -83.7, 29.9, -85.5, 30, -88, 30.4, -89.5, 30.2, -89.4, 29, -91, 29.3, -94, 29.6, -97.2, 27.8, -97.4, 25.8, -97.8, 22.5, -97.2, 20.5, -96, 19, -94.5, 18.2, -92, 18.6, -91, 19.3, -90.4, 21, -87, 21.5, -87.5, 18.5, -88.3, 16, -85, 16, -83.4, 15, -83.7, 11, -81.8, 9, -79.5, 9.5, -77.4, 8.6, -78, 7.5, -80, 7.3, -80.5, 8.2, -82.8, 8.2, -85.7, 9.9, -85.8, 11.2, -87.6, 13, -91.4, 13.9, -94, 16, -96.5, 15.7, -100, 16.8, -103.5, 18.3, -105.6, 20.4, -105.3, 21.8, -106.4, 23.2, -108, 25, -110, 27.5, -112.8, 30.5, -114.8, 31.8, -114, 29.5, -112.3, 27.3, -110.4, 24.2, -109.9, 22.9, -112.1, 24.8, -114.2, 27.8, -115.8, 30.4, -117.1, 32.5, -118.5, 34, -120.6, 34.6, -121.9, 36.6, -122.5, 37.8, -123.8, 39.8, -124.3, 42, -124, 46.2, -124.7, 48.4, -125, 50, -127.5, 51, -130, 54.5, -133, 57, -136, 58.4, -140, 59.8, -144, 60, -147, 61, -150, 61.2, -151.5, 59.2, -154, 58, -156.5, 56.8, -159, 55.5, -163, 54.8, -159, 56.8, -157.5, 58.8, -162, 59.9, -164.5, 60.8, -165, 62.6, -164.5, 63.2, -161, 64.5, -166, 64.6],
    // Greenland, Baffin, Ellesmere, Victoria, Devon, Newfoundland, Cuba, Hispaniola
    [-73, 78, -60, 82, -30, 83.5, -20, 80, -18, 75, -22, 70, -32, 68, -40, 65, -43, 60, -48, 61, -53, 66, -55, 70, -58, 75.5, -68, 76.5],
    [-65, 62.3, -61.8, 66.5, -67, 69.5, -74, 72, -80, 73.6, -89, 71, -85, 69.7, -78, 69.5, -74, 68, -72, 67, -73, 64, -71, 62.8],
    [-75, 77, -80, 76.2, -90, 77, -92, 80.5, -80, 83, -62, 82.5, -70, 80],
    [-118, 71, -105, 73, -101, 70, -106, 68.8, -117, 69],
    [-80, 74.5, -80, 76.5, -92, 76.5, -91, 74.6],
    [-59.3, 47.6, -55.5, 51.6, -53, 49, -52.7, 47.5, -55.5, 46.9],
    [-85, 21.9, -82, 23.2, -77, 22, -74.2, 20.2, -77.5, 19.8, -80, 21.6],
    [-74.4, 18.5, -72.8, 19.9, -69.9, 19.7, -68.4, 18.5, -71.4, 17.6],
    // South America, the Falklands
    [-77.5, 8.5, -75, 11, -72, 12, -71, 10.5, -64, 10.5, -61, 10.5, -58, 7, -53, 5.5, -51, 4, -50, 0, -44, -2.5, -38, -4, -35, -5.5, -35, -9, -39, -13, -39, -17.5, -41, -22, -44, -23, -48, -26, -48.5, -28.5, -53, -34, -57, -36, -57, -38.5, -62, -39, -65, -42, -64, -43, -67.5, -46, -66, -48, -69, -51, -68.5, -53, -65, -55, -68, -55.5, -71, -54, -75, -50, -74, -44, -73.5, -40, -73.5, -37, -71.5, -33, -71.5, -28, -70.5, -23, -70.3, -18.5, -76, -14, -79, -8, -81, -5, -80, -2, -80, 1, -78.8, 1.8, -77.5, 4, -77.5, 7],
    [-61.2, -51.3, -57.8, -51.6, -58.5, -52.2, -60.5, -52.3],
    // Eurasia (with the Baltic, the Persian Gulf and the Bay of Bengal as inlets)
    [-9, 37, -9.5, 39, -8.8, 43, -1.5, 43.4, -1, 46, -4.5, 48, -1.5, 49.7, 2, 51, 4, 51.5, 8, 53.5, 8.1, 55.5, 8.5, 57, 10.5, 57.7, 10.3, 56.5, 9.8, 55, 10.5, 54.4, 11, 54, 12.5, 54.4, 14, 54, 19, 54.4, 21, 56, 21, 57.5, 23.5, 59.3, 28, 59.5, 30, 60, 28.5, 60.6, 25, 60.3, 22.5, 60.2, 21.3, 61, 21.3, 63, 25.5, 65, 24, 65.8, 22, 65.5, 21, 64, 18, 62.5, 18.8, 60, 18.5, 59.3, 16.5, 57, 14.3, 55.5, 12.8, 55.6, 12.5, 56.5, 11, 58.8, 8, 58, 5.5, 59, 5, 62, 10, 64, 14, 67.5, 17, 69, 21, 70, 26, 71, 31, 70, 33, 69.3, 41, 67, 44, 68.5, 53, 68.5, 60, 69.5, 68, 69, 69, 72.5, 73, 72.8, 80, 72, 87, 74.5, 100, 77, 106, 77.5, 113, 73.5, 128, 73, 140, 72.5, 150, 71, 160, 70, 170, 70, 180, 69, 180, 65, 178, 64, 173, 61, 163, 60, 156.7, 51, 155.5, 57, 156, 61, 150, 59.5, 143, 59, 137, 54, 141, 53, 140, 48, 135, 43, 131, 42.5, 129.5, 41, 129.5, 36, 128, 35, 126.5, 34.5, 126, 37, 125, 39.5, 121.5, 39, 122, 40.5, 119, 39.5, 118, 39, 120, 37, 122.5, 37, 120, 35, 121.5, 31.5, 122, 29, 119.5, 25, 116, 22.8, 113, 22, 110, 21, 108, 21.5, 106.5, 20, 106, 18, 108.8, 15, 109.3, 12, 107, 10.5, 104.8, 8.6, 104.8, 10.4, 103, 11, 102.3, 12.2, 100.9, 12.7, 100, 13.5, 99.2, 10, 100.3, 8, 100.5, 7, 101.3, 6.8, 102.2, 6.2, 103.4, 4.5, 103.5, 2.6, 104.2, 1.4, 103.4, 1.3, 101.3, 2.8, 100.4, 4.5, 100.3, 6.5, 98.3, 8, 98.7, 10, 98.5, 13, 97.7, 16.5, 96.5, 16.8, 94.3, 16, 94.5, 18.5, 93, 20, 92.2, 21.3, 91.8, 22.4, 90.5, 22, 89, 21.7, 87, 21.5, 86.5, 20, 85, 19.3, 82, 16.5, 80.2, 13, 79.8, 10.3, 77.5, 8.1, 76.3, 9.8, 75.7, 11.5, 74.7, 13.5, 73.4, 16, 72.8, 19, 72.6, 21.2, 70.3, 21, 69, 22.4, 68.6, 23.6, 67, 24.8, 64.5, 25.2, 61.5, 25.2, 57.5, 25.7, 56.3, 27.1, 54, 26.6, 51.4, 27.9, 50.1, 30.1, 48.5, 30, 48, 29.5, 48.4, 28.5, 49.7, 26.8, 50.2, 25.7, 51.6, 24.2, 54.3, 24.2, 55.9, 25.6, 56.3, 26.2, 56.4, 24.8, 57.2, 23.9, 58.7, 23.6, 59.8, 22.5, 58.5, 20.5, 57.8, 19, 56.6, 18.3, 55, 17, 52.2, 15.6, 49, 14.5, 45, 12.9, 43.5, 12.7, 43.2, 13.5, 42.7, 15.7, 41.2, 18.5, 39.2, 21.5, 38.2, 24, 36.6, 25.8, 35.1, 28, 34.6, 29.5, 34.2, 31.3, 35, 33, 36, 35, 36, 36.8, 32, 36.2, 30.5, 36.5, 27.3, 37, 26.5, 40, 26, 40.8, 23, 40.5, 23.5, 38, 22, 36.5, 21, 38.5, 19.5, 40, 19.5, 42, 16, 43.5, 13.7, 45.5, 12.3, 45.3, 12.5, 44, 14, 42.5, 16, 41.5, 18.5, 40.1, 17.2, 40.4, 16.6, 39.6, 17.1, 39, 16.6, 38.4, 15.7, 38, 16, 39.3, 15.6, 40, 14.3, 40.6, 13, 41.3, 12.2, 41.8, 11, 42.4, 10.5, 43, 10.2, 44, 8.8, 44.4, 7, 43.6, 4, 43.4, 3.2, 42, 0.5, 40.5, -0.3, 39.4, 0, 38.7, -2, 36.7, -5.6, 36, -6.5, 36.9, -7.5, 37.2],
    [-180, 68.5, -175, 67.5, -171, 66.8, -169.7, 66, -173, 64.5, -180, 65],
    // islands of Europe and Asia
    [-5.7, 50, 1.4, 51.3, 1.7, 52.7, 0.2, 53.5, -1.6, 55.6, -2, 57.6, -3.3, 58.6, -5, 58.6, -6.2, 57.5, -5.6, 56.3, -4.9, 55, -3, 54, -3.2, 53.4, -4.6, 53.3, -4.2, 52.3, -5.3, 51.7, -3, 51.5],
    [-6, 52.2, -6, 54, -7.3, 55.3, -8.5, 54.6, -10, 53.5, -10.3, 51.7, -8.5, 51.6],
    [-22.5, 64, -24, 65.5, -22.5, 66.4, -16.5, 66.5, -13.5, 65.2, -15, 64.3, -18.7, 63.4],
    [11, 78.5, 16, 80, 27, 80.3, 22, 77.5, 17, 76.6],
    [52, 71.5, 56, 74, 60, 76, 68.5, 77, 64, 75, 57, 72, 55, 70.6],
    [11, 55.3, 12.6, 55.6, 12.2, 56.1, 11, 55.8],
    [12.4, 37.8, 13.4, 38.2, 15.6, 38.3, 15.1, 36.7, 14.3, 37, 12.6, 37.6],
    [8.4, 39, 9.6, 39.2, 9.8, 41, 9.2, 41.3, 8.2, 40.9, 8.4, 40],
    [8.6, 41.4, 9.4, 41.4, 9.5, 43, 8.6, 42.4],
    [130, 31.3, 131.5, 31.5, 132, 33.8, 135, 33.5, 136.8, 34.5, 139, 34.9, 140.9, 35.7, 141, 38, 142, 39.5, 141.5, 41.4, 140, 40.6, 139.8, 39, 138.5, 37.5, 136.7, 37.2, 136, 35.7, 133, 35.5, 131, 34.4, 129.7, 33.2],
    [140, 41.5, 141.2, 41.8, 143.3, 42, 145.5, 43.3, 144.5, 44, 141.8, 45.4, 141.4, 43.4],
    [142, 46, 143.5, 46.7, 143, 49, 144, 52, 143, 54.3, 142.5, 53.5, 142, 50, 141.8, 48],
    [79.8, 7, 80.3, 9.8, 81.9, 7.5, 81.2, 6.2, 80, 6],
    [120.1, 23, 121.5, 25.3, 122, 24.8, 120.8, 22],
    [108.6, 19.2, 110.5, 20.1, 111, 19.6, 109.6, 18.2],
    [120, 18.5, 122.3, 18.5, 122, 16, 124, 13.5, 121.5, 13.8, 120.6, 14.4, 119.8, 16],
    [122, 7, 126.2, 9, 126.5, 6.5, 125.3, 5.7, 124, 6.5],
    [109, 1.5, 111, 2.8, 113, 3.2, 115.5, 5.5, 117, 7, 119, 5, 118, 1, 117.5, -1, 116.5, -3.5, 114.5, -4, 111.5, -3, 110, -2, 109, -0.5],
    [95.3, 5.6, 97.5, 5.2, 100.3, 2, 104, -1, 106, -3, 105.8, -5.8, 104.5, -5.9, 102, -4, 100.3, -1, 98.6, 1.8],
    [105.2, -6.8, 106.5, -6, 110.5, -6.7, 114.5, -7.7, 114.5, -8.7, 110.5, -8.2, 106.5, -7.4],
    [119.4, -5.5, 120.3, -5.5, 121, -2.5, 123.3, -1, 121.5, -0.8, 120.5, 0.5, 124.5, 1.2, 125, 1.6, 123, 0.5, 120.1, 0.7, 119.7, -0.8, 118.8, -2.8],
    [131, -1.3, 134, -1, 136, -2.2, 138, -1.6, 141, -2.6, 145, -4.5, 148, -6, 150.5, -10.5, 147, -9.5, 144, -7.7, 143, -9, 141, -9.1, 138, -8.3, 137.6, -5.2, 135, -4.2, 132.2, -2.9],
    // Africa, Madagascar
    [-5.9, 35.8, -2, 35.1, 3, 36.8, 10, 37.2, 11, 36.8, 10.2, 34, 11.5, 33, 15.5, 32.3, 19.5, 30.3, 20.1, 32, 23, 32.6, 25, 31.6, 29, 30.9, 32, 31.3, 34.2, 31.3, 34.9, 29.5, 33.5, 27.8, 35.5, 23.5, 37.2, 21, 38.5, 18, 39.5, 15.5, 42, 13, 43.3, 12.5, 44, 10.5, 51.2, 11.8, 51, 10.4, 49.8, 8, 48, 4.5, 45, 1.7, 41.5, -1.8, 39.3, -5, 39.5, -8, 40.5, -10.5, 40.5, -15, 37, -17.5, 35, -20, 35.5, -24, 32.8, -26, 32.4, -28.5, 30.5, -31, 27.5, -33.5, 25.5, -34, 22, -34, 20, -34.8, 18.4, -34.2, 17.8, -32.5, 15, -27, 14.5, -22.5, 11.8, -17.2, 12, -13, 13.8, -10.7, 12.2, -6, 9.5, -2, 9.5, 1, 9.8, 3.8, 8.5, 4.6, 6, 4.3, 4.5, 6.4, 1, 6, -2, 4.8, -7.5, 4.4, -11.5, 7, -13.3, 9, -15, 11, -16.8, 13.5, -17.4, 14.7, -16.3, 19.5, -17, 21, -15, 24.5, -13, 27.6, -9.8, 30, -9.5, 32.5, -6.8, 34.1],
    [49.3, -12, 50.5, -15.5, 49.5, -17.5, 47.5, -24.5, 45.2, -25.5, 43.6, -23, 44.2, -20, 44, -17, 46, -15.8, 48, -13.5],
    // Australia, Tasmania, New Zealand
    [113.5, -22, 114, -26, 115, -30, 115, -34, 118, -35, 123.5, -33.9, 126, -32.3, 131, -31.5, 135, -34.8, 138, -35.6, 138.5, -34.5, 140, -37.7, 144, -38.4, 146.3, -39, 150, -37.5, 151.2, -33.9, 153.6, -28, 153, -25, 149, -21, 146, -18.5, 145.5, -15, 143.6, -14, 142.5, -10.7, 141.6, -13, 141.6, -16.8, 140, -17.7, 137, -16, 135.5, -14.7, 136.8, -12.2, 133, -11.3, 130.3, -12.4, 129.5, -15, 126.8, -13.8, 125, -16, 122.2, -18, 121, -19.7, 117, -20.6],
    [144.7, -40.7, 148.3, -40.9, 148, -43.2, 146.8, -43.6, 145.2, -42.2],
    [172.7, -34.4, 174.5, -36, 175.8, -37, 178.5, -37.7, 177.9, -39.2, 176.9, -39.6, 175.3, -41.6, 174.6, -41.2, 174.9, -39.9, 173.8, -39.2, 174.6, -37.5],
    [172.7, -40.5, 174.3, -41.7, 173, -43.5, 171.2, -44.5, 170.6, -45.9, 168.4, -46.6, 166.5, -45.8, 168.3, -44, 171, -42, 172.1, -41.3],
    // Antarctica
    [-180, -78, -160, -79, -150, -77, -140, -75, -120, -74, -100, -73, -80, -73, -75, -71, -68, -67, -60, -63.3, -57, -63.5, -62, -66, -61, -70, -60, -75, -50, -78, -35, -78, -25, -75, -15, -72, 0, -70, 20, -70, 35, -69, 50, -67, 70, -68, 77, -69, 90, -66.5, 110, -66, 130, -66, 145, -67, 160, -70, 170, -72, 167, -77.5, 180, -78, 180, -90, -180, -90],
  ];
  /** Inland seas, drawn in the sea colour over the land: the Black Sea and the Caspian. */
  const LAKES = [
    [28, 41.2, 29, 41.2, 33, 42, 36, 41.6, 41.5, 41.5, 41.7, 42.5, 39, 44.3, 37.5, 45.3, 35, 45, 33.5, 44.5, 32.5, 45.5, 31, 46.6, 30, 45.7, 29.6, 45, 28.6, 44, 28, 42.5],
    [47, 45, 49, 46.5, 51.5, 47, 53, 45.5, 51.5, 44.5, 51, 43, 52.5, 41.5, 53, 40, 53.9, 37.3, 51, 36.7, 49, 38, 49.5, 40.3, 48, 42, 47.5, 43.5],
  ];
  const bbox = p => { let a = 999, b = -999; for (let i = 0; i < p.length; i += 2) { a = Math.min(a, p[i]); b = Math.max(b, p[i]); } return [a, b]; };
  const LAND_BOX = LAND.map(bbox), LAKE_BOX = LAKES.map(bbox);

  /* ---------- drawing ---------- */
  const f = n => Math.round(n * 10) / 10;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FONT = 'font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif"';

  /**
   * The map. opts:
   *   lonC, span   — the middle longitude and how many degrees of longitude to show (360 = the whole world)
   *   k            — SVG units per degree; gutter — room on the left for the labels; fs — label font size
   *   grid         — a parallel every `grid` degrees (labelled); minor — thin unlabelled parallels in between (deg) or 0
   *   letters      — { N, S } and names: { equator, cancer, capricorn, arctic, antarctic } for the labels
   *   lines        — draw the tropics and the polar circles; hemi — big faint N and S on the two halves
   *   pins         — [{ lat, lon, text, sub, cls }]   (cls: 'a' red, 'b' blue, 'key' green)
   *   cursor       — a latitude: "your line" across the map, with cursorText; target — a dashed green line
   *   print        — black-and-white friendly colours
   */
  function mapSvg(o) {
    const { lonC = 0, span = 360, k = 2, gutter = 48, fs = 11, grid = 10, minor = 0, letters = { N: 'N', S: 'S' },
      lines = false, hemi: marks = false, pins = [], cursor = null, cursorText = '', target = null, print = false, id = 'm', top = 90, bottom = -90,
      meridians = 0, lonLabels = 0, cursorLon = null, cursorLonText = '', targetLon = null } = o;
    const pad = Math.ceil(fs * 0.8), W = span * k, H = (top - bottom) * k;
    const padB = lonLabels ? Math.ceil(fs * 1.7) : pad, padR = lonLabels ? Math.ceil(fs * 1.8) : 4;
    const lonL = lonC - span / 2;
    const X = lon => gutter + (lon - lonL) * k, Y = lat => pad + (top - lat) * k;
    /** the copy of a longitude that falls inside the window (or the nearest one) */
    const inWin = lon => { while (lon < lonL) lon += 360; while (lon > lonL + span) lon -= 360; return lon; };
    const col = print
      ? { sea: '#fff', land: '#d9d9d9', coast: '#888', grid: '#9a9a9a', eq: '#111', text: '#222', mark: '#000' }
      : { sea: '#d7e9fb', land: '#b9dba6', coast: '#7fae6a', grid: '#8fb2d6', eq: '#d6455a', text: '#1e2436', mark: '#1e3a8a' };
    let s = `<svg class="map" viewBox="0 0 ${f(gutter + W + padR)} ${f(H + pad + padB)}" xmlns="http://www.w3.org/2000/svg" role="img">`;
    s += `<defs><clipPath id="${id}c"><rect x="${gutter}" y="${pad}" width="${f(W)}" height="${f(H)}"/></clipPath></defs>`;
    s += `<rect x="${gutter}" y="${pad}" width="${f(W)}" height="${f(H)}" fill="${col.sea}"/>`;
    if (marks && top === 90 && bottom === -90) {
      const fsz = Math.min(W * 0.32, H * 0.2);
      s += `<g ${FONT} font-weight="800" font-size="${f(fsz)}" fill="${col.mark}" fill-opacity="${print ? 0.08 : 0.1}" text-anchor="middle" dominant-baseline="central">`
        + `<text x="${f(gutter + W / 2)}" y="${f(Y(45))}">${esc(letters.N)}</text><text x="${f(gutter + W / 2)}" y="${f(Y(-45))}">${esc(letters.S)}</text></g>`;
    }
    // land, repeated one world to the left and right so a window across ±180° still shows it
    const poly = (p, dx) => { let d = ''; for (let i = 0; i < p.length; i += 2) d += (i ? 'L' : 'M') + f(X(p[i] + dx)) + ' ' + f(Y(p[i + 1])); return d + 'Z'; };
    const paths = (list, boxes) => {
      let d = '';
      for (const dx of [-360, 0, 360]) list.forEach((p, i) => { const [a, b] = boxes[i]; if (b + dx >= lonL && a + dx <= lonL + span) d += poly(p, dx); });
      return d;
    };
    s += `<g clip-path="url(#${id}c)"><path d="${paths(LAND, LAND_BOX)}" fill="${col.land}" stroke="${col.coast}" stroke-width="${f(k * 0.18)}" stroke-linejoin="round"/>`;
    s += `<path d="${paths(LAKES, LAKE_BOX)}" fill="${col.sea}" stroke="${col.coast}" stroke-width="${f(k * 0.18)}"/>`;
    // parallels
    if (minor) for (let v = -90 + minor; v < 90; v += minor) if (v % grid && v > bottom && v < top) s += `<line x1="${gutter}" x2="${f(gutter + W)}" y1="${f(Y(v))}" y2="${f(Y(v))}" stroke="${col.grid}" stroke-width="${f(k * 0.08)}" stroke-dasharray="${f(k)} ${f(k)}"/>`;
    for (let v = -90 + grid; v < 90; v += grid) if (v && v > bottom && v < top) s += `<line x1="${gutter}" x2="${f(gutter + W)}" y1="${f(Y(v))}" y2="${f(Y(v))}" stroke="${col.grid}" stroke-width="${f(Math.max(0.6, k * 0.16))}"/>`;
    if (lines) for (const l of LINES.filter(l => l.lat > bottom && l.lat < top)) {
      s += `<line x1="${gutter}" x2="${f(gutter + W)}" y1="${f(Y(l.lat))}" y2="${f(Y(l.lat))}" stroke="${print ? '#444' : '#b7791f'}" stroke-width="${f(Math.max(0.7, k * 0.2))}" stroke-dasharray="${f(fs * 0.5)} ${f(fs * 0.35)}"/>`;
      if (letters[l.id]) s += `<text x="${f(gutter + W - fs * 0.3)}" y="${f(Y(l.lat) - fs * 0.3)}" ${FONT} font-size="${f(fs * 0.78)}" font-weight="600" text-anchor="end" fill="${print ? '#333' : '#8a5a12'}" stroke="${col.sea}" stroke-width="${f(fs * 0.25)}" paint-order="stroke">${esc(letters[l.id])} ${l.text}</text>`;
    }
    // meridians, the prime meridian (Greenwich) drawn like the equator
    if (meridians) for (let v = Math.ceil(lonL / meridians) * meridians; v <= lonL + span; v += meridians) {
      if (v <= lonL || v >= lonL + span) continue;
      const g = normLon(v) === 0;
      s += `<line x1="${f(X(v))}" x2="${f(X(v))}" y1="${pad}" y2="${f(pad + H)}" stroke="${g ? col.eq : col.grid}" stroke-width="${f(g ? Math.max(1.2, k * 0.4) : Math.max(0.6, k * 0.16))}"/>`;
      if (g) {   // the label to the right of the line, or to the left when it would run off the map
        const left = X(v) + fs * 0.3 + fs * 0.85 * 0.58 * 9 > gutter + W;
        s += `<text x="${f(X(v) + (left ? -1 : 1) * fs * 0.3)}" y="${f(pad + fs * 0.9)}" ${FONT} font-size="${f(fs * 0.85)}" font-weight="700" text-anchor="${left ? 'end' : 'start'}" fill="${col.eq}" stroke="${col.sea}" stroke-width="${f(fs * 0.25)}" paint-order="stroke">Greenwich</text>`;
      }
    }
    if (targetLon !== null) { const x = X(inWin(targetLon)); s += `<line x1="${f(x)}" x2="${f(x)}" y1="${pad}" y2="${f(pad + H)}" stroke="#1f9d55" stroke-width="${f(k * 0.6)}" stroke-dasharray="${f(k * 2)} ${f(k * 1.4)}"/>`; }
    if (cursorLon !== null) {
      const x = X(inWin(cursorLon));
      s += `<line class="cursor" x1="${f(x)}" x2="${f(x)}" y1="${pad}" y2="${f(pad + H)}" stroke="#3d48b8" stroke-width="${f(k * 0.6)}"/>`;
      if (cursorLonText) {
        const tw = fs * 0.62 * String(cursorLonText).length + fs;
        const tx = Math.min(Math.max(x, gutter + tw / 2 + 2), gutter + W - tw / 2 - 2), ty = pad + H - fs * 1.2;
        s += `<rect x="${f(tx - tw / 2)}" y="${f(ty - fs * 0.8)}" width="${f(tw)}" height="${f(fs * 1.6)}" rx="${f(fs * 0.8)}" fill="#3d48b8"/>`;
        s += `<text x="${f(tx)}" y="${f(ty)}" ${FONT} font-size="${f(fs)}" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${esc(cursorLonText)}</text>`;
      }
    }
    if (bottom < 0 && top > 0) s += `<line x1="${gutter}" x2="${f(gutter + W)}" y1="${f(Y(0))}" y2="${f(Y(0))}" stroke="${col.eq}" stroke-width="${f(Math.max(1.2, k * 0.4))}"/>`;
    if (letters.equator && bottom < 0 && top > 0) s += `<text x="${f(gutter + W - fs * 0.3)}" y="${f(Y(0) - fs * 0.35)}" ${FONT} font-size="${f(fs * 0.85)}" font-weight="700" text-anchor="end" fill="${col.eq}" stroke="${col.sea}" stroke-width="${f(fs * 0.25)}" paint-order="stroke">${esc(letters.equator)}</text>`;
    if (target !== null) s += `<line x1="${gutter}" x2="${f(gutter + W)}" y1="${f(Y(target))}" y2="${f(Y(target))}" stroke="#1f9d55" stroke-width="${f(k * 0.6)}" stroke-dasharray="${f(k * 2)} ${f(k * 1.4)}"/>`;
    if (cursor !== null) {
      const y = Y(cursor);
      s += `<line class="cursor" x1="${gutter}" x2="${f(gutter + W)}" y1="${f(y)}" y2="${f(y)}" stroke="#3d48b8" stroke-width="${f(k * 0.6)}"/>`;
      if (cursorText) {
        const tw = fs * 0.62 * String(cursorText).length + fs;
        const ty = Math.min(Math.max(y, pad + fs), pad + H - fs);
        s += `<rect x="${f(gutter + fs * 0.4)}" y="${f(ty - fs * 0.8)}" width="${f(tw)}" height="${f(fs * 1.6)}" rx="${f(fs * 0.8)}" fill="#3d48b8"/>`;
        s += `<text x="${f(gutter + fs * 0.4 + tw / 2)}" y="${f(ty)}" ${FONT} font-size="${f(fs)}" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${esc(cursorText)}</text>`;
      }
    }
    s += '</g>';
    // pins (drawn at the nearest copy of their longitude inside the window)
    for (const p of pins) {
      const x = X(inWin(p.lon)), y = Y(p.lat), r = fs * 0.42;
      const c = p.cls === 'b' ? '#2563eb' : p.cls === 'key' ? '#1f9d55' : '#d6455a';
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${print && p.cls !== 'key' ? '#111' : c}" stroke="#fff" stroke-width="${f(r * 0.45)}"/>`;
      if (p.text) {
        const right = x < gutter + W * 0.62;
        const tx = x + (right ? 1 : -1) * r * 1.9;
        s += `<text x="${f(tx)}" y="${f(y)}" ${FONT} font-size="${f(fs * (p.big ? 1.15 : 0.95))}" font-weight="800" text-anchor="${right ? 'start' : 'end'}" dominant-baseline="central" fill="${col.text}" stroke="#fff" stroke-width="${f(fs * 0.3)}" paint-order="stroke">${esc(p.text)}${p.sub ? `<tspan font-weight="600" font-size="${f(fs * 0.8)}"> ${esc(p.sub)}</tspan>` : ''}</text>`;
      }
    }
    // the frame and the labels
    s += `<rect x="${gutter}" y="${pad}" width="${f(W)}" height="${f(H)}" fill="none" stroke="${col.text}" stroke-width="${f(Math.max(0.8, k * 0.2))}"/>`;
    s += `<g ${FONT} font-size="${f(fs)}" font-weight="700" text-anchor="end" dominant-baseline="central">`;
    for (let v = -90; v <= 90; v += grid) if (v >= bottom && v <= top) s += `<text x="${f(gutter - fs * 0.35)}" y="${f(Y(v))}" fill="${v ? col.text : col.eq}">${esc(fmt(v, letters))}</text>`;
    s += '</g>';
    if (lonLabels) {
      s += `<g ${FONT} font-size="${f(fs)}" font-weight="700" text-anchor="middle" dominant-baseline="central">`;
      for (let v = Math.ceil(lonL / lonLabels) * lonLabels; v <= lonL + span; v += lonLabels) {
        const n = normLon(v);
        s += `<text x="${f(X(v))}" y="${f(pad + H + fs * 0.95)}" fill="${n ? col.text : col.eq}">${esc(fmtLon(n, letters))}</text>`;
      }
      s += '</g>';
    }
    s += '</svg>';
    return s;
  }

  /**
   * A latitude scale from 90° north to 90° south (for "mark the point" on the worksheet).
   * opts: { grid (labelled every 30°, a tick every `grid`), minor, letters, dot: lat | null, title, sub }
   */
  function ladderSvg(o) {
    const { grid = 10, minor = 0, letters = { N: 'N', S: 'S' }, dot = null } = o;
    const k = 1, top = 8, x = 52, H = 180 * k, W = 76;
    const Y = lat => top + (90 - lat) * k;
    let s = `<svg class="ladder" viewBox="0 0 ${W} ${H + 2 * top}" xmlns="http://www.w3.org/2000/svg" role="img">`;
    s += `<line x1="${x}" x2="${x}" y1="${Y(90)}" y2="${Y(-90)}" stroke="#222" stroke-width="1.4"/>`;
    if (minor) for (let v = -90; v <= 90; v += minor) if (v % grid) s += `<line x1="${x - 3}" x2="${x + 3}" y1="${Y(v)}" y2="${Y(v)}" stroke="#555" stroke-width=".6"/>`;
    for (let v = -90; v <= 90; v += grid) {
      const big = v % 30 === 0;
      s += `<line x1="${x - (big ? 7 : 5)}" x2="${x + (big ? 7 : 5)}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v ? '#222' : '#000'}" stroke-width="${v ? (big ? 1.1 : 0.8) : 2.2}"/>`;
      if (big) s += `<text x="${x - 10}" y="${Y(v)}" ${FONT} font-size="13" font-weight="${v ? 600 : 800}" text-anchor="end" dominant-baseline="central" fill="#222">${esc(fmt(v, letters))}</text>`;
    }
    if (dot !== null) s += `<circle cx="${x}" cy="${f(Y(dot))}" r="5.5" fill="#1f9d55" stroke="#fff" stroke-width="1.2"/>`;
    return s + '</svg>';
  }

  /**
   * The night sky as a sailor sees it (for "position from the stars"). The height of the sky's pole above the
   * horizon is the latitude: in the north the Pole Star marks it (found with the Big Dipper's pointer stars),
   * in the south there is no pole star, so the long bar of the Southern Cross is followed about 4½ times its length.
   * opts: { lat (−90..90; 0 shows the northern sky with the Pole Star on the horizon), names: { star, dipper, cross, pole, look },
   *         scale: bool (the angle scale, as on a sextant/quadrant), answer: bool (write the angle at the star), print }
   */
  function skySvg(o) {
    const { lat, names = {}, scale = true, answer = false, print = false, blank = false } = o;   // blank: no stars (to draw them in)
    const south = lat < 0, h = Math.abs(lat);
    const W = 220, Hh = 140, ox = 92, oy = 118, R = 84;
    const rad = d => d * Math.PI / 180;
    const at = (deg, r) => [ox + r * Math.cos(rad(deg)), oy - r * Math.sin(rad(deg))];
    const col = print
      ? { sky: '#fff', ground: '#e6e6e6', line: '#222', star: '#000', dim: '#555', scale: '#333', text: '#111', halo: '#fff' }
      : { sky: '#14214a', ground: '#1d3b2a', line: '#cbd5f5', star: '#fff7c2', dim: '#9fb0e0', scale: '#8fa3d9', text: '#e8edff', halo: '#14214a' };
    const star = (x, y, r, c = col.star) => {
      let d = '';
      for (let i = 0; i < 10; i++) { const a = rad(i * 36 - 90), rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + f(x + rr * Math.cos(a)) + ' ' + f(y + rr * Math.sin(a)); }
      return `<path d="${d}Z" fill="${c}"${print ? '' : ` stroke="${c}" stroke-width=".4"`}/>`;
    };
    let s = `<svg class="sky" viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" role="img">`;
    s += `<defs><clipPath id="skyc${lat}"><rect x="0" y="0" width="${W}" height="${oy}"/></clipPath></defs>`;
    s += `<rect x="0" y="0" width="${W}" height="${Hh}" fill="${col.sky}" ${print ? 'stroke="#222" stroke-width=".8"' : ''}/>`;
    if (!print) for (const [x, y, r] of [[14, 14, .7], [60, 9, .5], [130, 18, .6], [200, 12, .7], [176, 46, .5], [24, 70, .6], [150, 92, .5], [206, 84, .6], [112, 54, .4], [46, 40, .5]]) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col.dim}"/>`;
    // the angle scale: an arc from the horizon (0°) to straight overhead (90°)
    if (scale) {
      const [ax, ay] = at(0, R), [bx, by] = at(90, R);
      s += `<path d="M${f(ax)} ${f(ay)}A${R} ${R} 0 0 0 ${f(bx)} ${f(by)}" fill="none" stroke="${col.scale}" stroke-width=".9"/>`;
      for (let d = 0; d <= 90; d += 5) {
        const big = d % 10 === 0, [x1, y1] = at(d, R), [x2, y2] = at(d, R + (big ? 5 : 2.8));
        s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col.scale}" stroke-width="${big ? 0.9 : 0.5}"/>`;
        if (d % 30 === 0) { const [tx, ty] = at(d, R + 11); s += `<text x="${f(tx)}" y="${f(Math.min(ty, oy - 5))}" ${FONT} font-size="7.5" font-weight="700" fill="${col.text}" text-anchor="middle" dominant-baseline="central">${d}°</text>`; }
      }
    }
    // the sky's pole and the stars that lead to it
    const [px, py] = at(h, R - 12);
    const dir = rad(h + 90 + (south ? 10 : 0));   // the constellation lies on the zenith side of the pole
    const ux = Math.cos(dir), uy = -Math.sin(dir), vx = -uy, vy = ux;
    const P = (a, b) => [px + a * ux + b * vx, py + a * uy + b * vy];
    const label = txt => { const left = px > W * 0.62; return `<text x="${f(px + (left ? -7 : 7))}" y="${f(py + (left ? 10 : -6))}" ${FONT} font-size="7.5" font-weight="700" text-anchor="${left ? 'end' : 'start'}" fill="${col.text}" stroke="${col.halo}" stroke-width="2" paint-order="stroke">${esc(txt)}</text>`; };
    if (!blank) {
    s += `<g clip-path="url(#skyc${lat})">`;
    s += `<line x1="${ox}" y1="${oy}" x2="${f(px)}" y2="${f(py)}" stroke="${col.line}" stroke-width=".8" stroke-dasharray="3 2.5"/>`;
    if (!south) {
      const D = [[24, 0], [32, 0], [33.5, 8], [25.5, 9], [24, 16], [23.5, 23], [26.5, 30]].map(([a, b]) => P(a, b));
      s += `<line x1="${f(D[1][0])}" y1="${f(D[1][1])}" x2="${f(px)}" y2="${f(py)}" stroke="${col.dim}" stroke-width=".7" stroke-dasharray="1.6 1.8"/>`;
      s += `<path d="M${D.map(([x, y]) => f(x) + ' ' + f(y)).join('L')}M${f(D[0][0])} ${f(D[0][1])}L${f(D[3][0])} ${f(D[3][1])}" fill="none" stroke="${col.dim}" stroke-width=".6"/>`;
      D.forEach(([x, y]) => { s += star(x, y, 2.3); });
      s += star(px, py, 4.2);
      if (names.dipper) { const [x, y] = P(36, 32); s += `<text x="${f(x)}" y="${f(y)}" ${FONT} font-size="7" fill="${col.text}" text-anchor="middle" stroke="${col.halo}" stroke-width="2" paint-order="stroke">${esc(names.dipper)}</text>`; }
      if (names.star) s += label(names.star);
    } else {
      const C = [[26, 0], [40, 0], [33, -6], [33, 5.5]].map(([a, b]) => P(a, b));   // Acrux, Gacrux, Mimosa, δ Crucis
      s += `<line x1="${f(C[1][0])}" y1="${f(C[1][1])}" x2="${f(px)}" y2="${f(py)}" stroke="${col.dim}" stroke-width=".7" stroke-dasharray="1.6 1.8"/>`;
      s += `<path d="M${f(C[0][0])} ${f(C[0][1])}L${f(C[1][0])} ${f(C[1][1])}M${f(C[2][0])} ${f(C[2][1])}L${f(C[3][0])} ${f(C[3][1])}" stroke="${col.dim}" stroke-width=".6"/>`;
      C.forEach(([x, y], i) => { s += star(x, y, i === 3 ? 1.8 : 2.6); });
      s += `<circle cx="${f(px)}" cy="${f(py)}" r="3.2" fill="none" stroke="${col.star}" stroke-width="1"/><path d="M${f(px - 5.5)} ${f(py)}h11M${f(px)} ${f(py - 5.5)}v11" stroke="${col.star}" stroke-width=".8"/>`;
      if (names.cross) { const [x, y] = P(47, 0); s += `<text x="${f(x)}" y="${f(y)}" ${FONT} font-size="7" fill="${col.text}" text-anchor="middle" stroke="${col.halo}" stroke-width="2" paint-order="stroke">${esc(names.cross)}</text>`; }
      if (names.pole) s += label(names.pole);
    }
    s += '</g>';
    }
    if (answer && h) { const [ex, ey] = at(h, 18); s += `<path d="M${ox + 18} ${oy}A18 18 0 0 0 ${f(ex)} ${f(ey)}" fill="none" stroke="${print ? '#1f7a43' : '#7ee2a8'}" stroke-width="1.4"/>`; }
    // the angle's number: for low stars above the dashed line, not on it
    if (answer) { const [tx, ty] = at(h < 30 ? h + 12 : h / 2, h < 30 ? 32 : 28); s += `<text x="${f(tx)}" y="${f(ty)}" ${FONT} font-size="9" font-weight="800" fill="${print ? '#1f7a43' : '#7ee2a8'}" text-anchor="middle" dominant-baseline="central">${h}°</text>`; }
    // the ground, the observer, which way we look
    s += `<rect x="0" y="${oy}" width="${W}" height="${Hh - oy}" fill="${col.ground}"/>`;
    s += `<line x1="0" y1="${oy}" x2="${W}" y2="${oy}" stroke="${col.line}" stroke-width="1"/>`;
    s += `<path d="M${ox - 4} ${oy}l4 -7l4 7z" fill="${col.line}"/>`;
    if (names.look) s += `<text x="${W - 6}" y="${oy + 12}" ${FONT} font-size="8" font-weight="700" fill="${col.text}" text-anchor="end">${esc(names.look)}</text>`;
    return s + '</svg>';
  }

  /**
   * A longitude scale from 180° west to 180° east (for "mark the point" on the worksheet).
   * opts: { grid (a tick every `grid`, labelled every 60°), minor, letters ({ E, W }), dot: lon | null }
   */
  function lonScaleSvg(o) {
    const { grid = 10, minor = 0, letters = { E: 'E', W: 'W' }, dot = null } = o;
    const k = 1, left = 24, W = 360 * k + 2 * left, y = 10, Hh = 38;
    const X = lon => left + (lon + 180) * k;
    let s = `<svg class="lonscale" viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" role="img">`;
    s += `<line x1="${X(-180)}" x2="${X(180)}" y1="${y}" y2="${y}" stroke="#222" stroke-width="1.8"/>`;
    if (minor) for (let v = -180; v <= 180; v += minor) if (v % grid) s += `<line x1="${X(v)}" x2="${X(v)}" y1="${y - 3}" y2="${y + 3}" stroke="#555" stroke-width=".8"/>`;
    for (let v = -180; v <= 180; v += grid) {
      const big = v % 60 === 0;
      s += `<line x1="${X(v)}" x2="${X(v)}" y1="${y - (big ? 7 : 5)}" y2="${y + (big ? 7 : 5)}" stroke="#222" stroke-width="${v ? (big ? 1.6 : 1.1) : 3}"/>`;
      if (big) s += `<text x="${X(v)}" y="${y + 18}" ${FONT} font-size="15" font-weight="${v ? 600 : 800}" text-anchor="middle" dominant-baseline="central" fill="#222">${esc(fmtLon(v, letters))}</text>`;
    }
    if (dot !== null) s += `<circle cx="${f(X(dot))}" cy="${y}" r="7" fill="#1f9d55" stroke="#fff" stroke-width="1.5"/>`;
    return s + '</svg>';
  }

  /**
   * Longitude the sailors' way: the sun at its highest (noon on the ship) and a chronometer that keeps Greenwich time.
   * opts: { lon, names: { sun, chrono, look }, answer: text to show (or ''), print }
   */
  function noonSvg(o) {
    const { lon, names = {}, answer = '', print = false } = o;
    const W = 240, Hh = 140, gy = 116, sx = 78, sr = 58;
    const col = print
      ? { sky: '#fff', ground: '#e6e6e6', line: '#222', sun: '#fff', sunLine: '#111', text: '#111', dial: '#fff', ring: '#222' }
      : { sky: '#cfe6fb', ground: '#5d8c4a', line: '#41608a', sun: '#ffd23f', sunLine: '#e09a00', text: '#1e2436', dial: '#fffaf0', ring: '#9a7b2f' };
    const min = ((noonAt(lon) % 1440) + 1440) % 1440;
    let s = `<svg class="noon" viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" role="img">`;
    s += `<rect x="0" y="0" width="${W}" height="${Hh}" fill="${col.sky}" ${print ? 'stroke="#222" stroke-width=".8"' : ''}/>`;
    // the sun's path over the day, the sun at its highest
    s += `<path d="M${sx - sr} ${gy}A${sr} ${sr * 0.95} 0 0 1 ${sx + sr} ${gy}" fill="none" stroke="${col.line}" stroke-width=".8" stroke-dasharray="3 2.5"/>`;
    const sy = gy - sr * 0.95;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s += `<line x1="${f(sx + 9 * Math.cos(a))}" y1="${f(sy + 9 * Math.sin(a))}" x2="${f(sx + 13 * Math.cos(a))}" y2="${f(sy + 13 * Math.sin(a))}" stroke="${col.sunLine}" stroke-width="1.3" stroke-linecap="round"/>`; }
    s += `<circle cx="${sx}" cy="${f(sy)}" r="7" fill="${col.sun}" stroke="${col.sunLine}" stroke-width="1.2"/>`;
    s += `<line x1="${sx}" y1="${f(sy + 15)}" x2="${sx}" y2="${gy}" stroke="${col.line}" stroke-width=".7" stroke-dasharray="1.5 2"/>`;
    if (names.sun) s += `<text x="${sx}" y="${f(sy - 18)}" ${FONT} font-size="7.5" font-weight="700" text-anchor="middle" fill="${col.text}">${esc(names.sun)}</text>`;
    // the chronometer: a dial with hands and the time in digits
    const cx = 190, cy = 54, r = 30;
    s += `<rect x="${cx - r - 8}" y="${cy - r - 14}" width="${2 * r + 16}" height="${2 * r + 46}" rx="7" fill="${print ? '#fff' : '#6b4a2b'}" stroke="${col.ring}" stroke-width="1"/>`;
    if (names.chrono) s += `<text x="${cx}" y="${cy - r - 6}" ${FONT} font-size="6.5" font-weight="700" fill="${print ? '#111' : '#fff'}" text-anchor="middle">${esc(names.chrono)}</text>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col.dial}" stroke="${col.ring}" stroke-width="2.2"/>`;
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      s += `<line x1="${f(cx + (r - 5) * Math.sin(a))}" y1="${f(cy - (r - 5) * Math.cos(a))}" x2="${f(cx + (r - 1.5) * Math.sin(a))}" y2="${f(cy - (r - 1.5) * Math.cos(a))}" stroke="#222" stroke-width="${i % 3 ? 0.8 : 1.6}"/>`;
      if (i % 3 === 0) s += `<text x="${f(cx + (r - 10) * Math.sin(a))}" y="${f(cy - (r - 10) * Math.cos(a))}" ${FONT} font-size="7" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#222">${i || 12}</text>`;
    }
    const ha = ((min / 60) % 12) * Math.PI / 6, ma = (min % 60) * Math.PI / 30;
    s += `<line x1="${cx}" y1="${cy}" x2="${f(cx + r * 0.5 * Math.sin(ha))}" y2="${f(cy - r * 0.5 * Math.cos(ha))}" stroke="#222" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${f(cx + r * 0.78 * Math.sin(ma))}" y2="${f(cy - r * 0.78 * Math.cos(ma))}" stroke="#222" stroke-width="1.5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="2" fill="#222"/>`;
    s += `<rect x="${cx - 22}" y="${cy + r + 5}" width="44" height="17" rx="3" fill="${print ? '#fff' : '#111'}" stroke="#222" stroke-width=".8"/>`;
    s += `<text x="${cx}" y="${f(cy + r + 14)}" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="12" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="${print ? '#111' : '#7CFC9A'}">${hhmm(min)}</text>`;
    // the ground, the ship's look-out
    s += `<rect x="0" y="${gy}" width="${cx - r - 10}" height="${Hh - gy}" fill="${col.ground}"/><line x1="0" y1="${gy}" x2="${cx - r - 10}" y2="${gy}" stroke="${col.line}" stroke-width="1"/>`;
    s += `<path d="M${sx - 4} ${gy}l4 -7l4 7z" fill="${col.line}"/>`;
    if (names.look) s += `<text x="6" y="${gy + 14}" ${FONT} font-size="7.5" font-weight="700" fill="${print ? '#111' : '#fff'}">${esc(names.look)}</text>`;
    if (answer) s += `<text x="${sx}" y="${f(sy + 26)}" ${FONT} font-size="11" font-weight="800" text-anchor="middle" fill="#1f7a43" stroke="${col.sky}" stroke-width="2.5" paint-order="stroke">${esc(answer)}</text>`;
    return s + '</svg>';
  }

  /**
   * Why the angle works (latitude): the Earth cut through the poles, the Pole Star so far away that its light
   * reaches every place along lines parallel to the Earth's axis. At the observer the star's height above the
   * horizon equals the angle at the Earth's centre between the equator and the observer — the latitude.
   * In the south the same picture is turned upside down, with the sky's pole under the Southern Cross.
   * opts: { lat, letters ({ N, S }), names: { star, skyPole, axis, equator, horizon, same }, print }
   */
  function whySvg(o) {
    const { lat, letters = { N: 'N', S: 'S' }, names = {}, print = false } = o;
    const a = Math.abs(lat), sg = lat < 0 ? -1 : 1, rad = d => d * Math.PI / 180;
    const W = 300, Hh = 250, cx = 118, cy = 125, R = 58;
    const Y = up => cy - sg * up;                       // "up" towards the sky's pole we use
    const col = print ? { earth: '#eee', land: '#ccc', line: '#222', eq: '#555', hor: '#222', sight: '#222', ang: '#1f7a43', text: '#111', star: '#000', bg: '#fff' }
      : { earth: '#d7e9fb', land: '#b9dba6', line: '#1e2436', eq: '#d6455a', hor: '#8a5a12', sight: '#c48a00', ang: '#1f9d55', text: '#1e2436', star: '#e0a800', bg: '#fff' };
    const T = (x, y, txt, opt = '') => `<text x="${f(x)}" y="${f(y)}" ${FONT} font-size="9.5" font-weight="700" fill="${col.text}" stroke="${col.bg}" stroke-width="2.4" paint-order="stroke" ${opt}>${esc(txt)}</text>`;
    let s = `<svg class="why" viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" role="img"><rect width="${W}" height="${Hh}" fill="${col.bg}"/>`;
    // the Earth, its axis and the equator
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${col.earth}" stroke="${col.line}" stroke-width="1.2"/>`;
    s += `<line x1="${cx}" y1="${f(Y(R + 14))}" x2="${cx}" y2="${f(Y(-R - 10))}" stroke="${col.line}" stroke-width="1.4"/>`;
    s += T(cx + 5, Y(R + 8), sg > 0 ? letters.N : letters.S, 'dominant-baseline="central"') + T(cx + 5, Y(-R - 6), sg > 0 ? letters.S : letters.N, 'dominant-baseline="central"');
    if (names.axis) s += T(cx - 6, Y(-R - 6), names.axis, 'text-anchor="end" dominant-baseline="central" font-weight="600"');
    s += `<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="${col.eq}" stroke-width="1.3" stroke-dasharray="4 3"/>`;
    if (names.equator) s += T(cx - R - 4, cy, names.equator, 'text-anchor="end" dominant-baseline="central" font-weight="600"');
    // the star (or the sky's pole), very far away
    const sy = Y(R + 56);
    if (sg > 0) {
      let d = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.6 : 6, t = rad(i * 36 - 90); d += (i ? 'L' : 'M') + f(cx + r * Math.cos(t)) + ' ' + f(sy + r * Math.sin(t)); }
      s += `<path d="${d}Z" fill="${col.star}"/>`;
    } else s += `<circle cx="${cx}" cy="${f(sy)}" r="4" fill="none" stroke="${col.line}" stroke-width="1.2"/><path d="M${cx - 7} ${f(sy)}h14M${cx} ${f(sy - 7)}v14" stroke="${col.line}" stroke-width="1"/>`;
    const nm = sg > 0 ? names.star : names.skyPole;
    if (nm) s += T(cx + 10, sy, nm, 'dominant-baseline="central"');
    s += `<line x1="${cx}" y1="${f(Y(R + 14))}" x2="${cx}" y2="${f(Y(R + 50))}" stroke="${col.sight}" stroke-width="1" stroke-dasharray="2 3"/>`;
    // the observer: radius, horizon (touching the Earth), the line of sight parallel to the axis
    const px = cx + R * Math.cos(rad(a)), py = Y(R * Math.sin(rad(a)));
    s += `<line x1="${cx}" y1="${cy}" x2="${f(px)}" y2="${f(py)}" stroke="${col.line}" stroke-width="1" stroke-dasharray="3 2"/>`;
    // the horizon touches the Earth at the observer; (hx, hy) points along it towards the pole, the sight line goes straight "up"
    const hx = -Math.sin(rad(a)), hy = -sg * Math.cos(rad(a));
    s += `<line x1="${f(px + 44 * hx)}" y1="${f(py + 44 * hy)}" x2="${f(px - 34 * hx)}" y2="${f(py - 34 * hy)}" stroke="${col.hor}" stroke-width="1.8"/>`;
    if (names.horizon) s += T(px - 36 * hx + 3, py - 36 * hy, names.horizon, 'dominant-baseline="central" font-weight="600"');
    const top = Y(R + 50);
    s += `<line x1="${f(px)}" y1="${f(py)}" x2="${f(px)}" y2="${f(top)}" stroke="${col.sight}" stroke-width="1.6"/><path d="M${f(px - 3.5)} ${f(top + sg * 7)}L${f(px)} ${f(top)}L${f(px + 3.5)} ${f(top + sg * 7)}" fill="none" stroke="${col.sight}" stroke-width="1.6"/>`;
    s += `<circle cx="${f(px)}" cy="${f(py)}" r="3.5" fill="${col.line}"/>`;
    // the two equal angles
    const arc = (x, y, r, a1, a2) => {       // angles in screen degrees (0 = right, counter-clockwise when sg > 0)
      const p = d => [x + r * Math.cos(rad(d)), y - sg * r * Math.sin(rad(d))];
      const [x1, y1] = p(a1), [x2, y2] = p(a2);
      return `<path d="M${f(x1)} ${f(y1)}A${r} ${r} 0 0 ${sg > 0 ? 0 : 1} ${f(x2)} ${f(y2)}" fill="none" stroke="${col.ang}" stroke-width="2"/>`;
    };
    if (a > 0) {
      s += arc(cx, cy, 22, 0, a);
      const [lx, ly] = [cx + 30 * Math.cos(rad(a / 2)), cy - sg * 30 * Math.sin(rad(a / 2))];
      s += `<text x="${f(lx)}" y="${f(ly)}" ${FONT} font-size="10" font-weight="800" fill="${col.ang}" dominant-baseline="central">${a}°</text>`;
      s += arc(px, py, 18, 90 + a, 90);   // from the horizon towards the pole round to the sight line
      const m = 90 + a / 2, [qx, qy] = [px + 27 * Math.cos(rad(m)), py - sg * 27 * Math.sin(rad(m))];
      s += `<text x="${f(qx)}" y="${f(qy)}" ${FONT} font-size="10" font-weight="800" fill="${col.ang}" text-anchor="middle" dominant-baseline="central">${a}°</text>`;
    }
    if (names.same) s += T(W - 6, sg > 0 ? Hh - 10 : 14, `${names.same}: ${a}° = ${a}°`, 'text-anchor="end" fill="' + col.ang + '"');
    return s + '</svg>';
  }

  /**
   * Why the clock works (longitude): the Earth seen from above the North Pole, turning 15° an hour towards the east;
   * the sun far to the left. It is noon on the meridian facing the sun (the ship); Greenwich passed the sun
   * (|lon| / 15) hours earlier (ship in the west) or will pass it later (ship in the east).
   * opts: { lon, letters ({ E, W }), names: { sun, ship, turn, pole }, print }
   */
  function whyLonSvg(o) {
    const { lon, letters = { E: 'E', W: 'W' }, names = {}, print = false } = o;
    const rad = d => d * Math.PI / 180;
    const W = 300, Hh = 230, cx = 178, cy = 112, R = 76;
    const col = print ? { earth: '#eee', line: '#222', spoke: '#999', ship: '#000', gw: '#555', ang: '#1f7a43', text: '#111', sun: '#fff', bg: '#fff' }
      : { earth: '#d7e9fb', line: '#1e2436', spoke: '#9db7d6', ship: '#2563eb', gw: '#d6455a', ang: '#1f9d55', text: '#1e2436', sun: '#ffd23f', bg: '#fff' };
    const P = (d, r) => [cx + r * Math.cos(rad(d)), cy - r * Math.sin(rad(d))];
    const T = (x, y, txt, opt = '') => `<text x="${f(x)}" y="${f(y)}" ${FONT} font-size="9.5" font-weight="700" fill="${col.text}" stroke="${col.bg}" stroke-width="2.4" paint-order="stroke" ${opt}>${esc(txt)}</text>`;
    let s = `<svg class="why" viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" role="img"><rect width="${W}" height="${Hh}" fill="${col.bg}"/>`;
    // the sun far to the left, its light coming in parallel
    s += `<circle cx="22" cy="${cy}" r="13" fill="${col.sun}" stroke="#e09a00" stroke-width="1.2"/>`;
    if (names.sun) s += T(22, cy + 26, names.sun, 'text-anchor="middle"');
    for (const dy of [-50, -25, 0, 25, 50]) s += `<line x1="42" y1="${cy + dy}" x2="${cx - Math.sqrt(Math.max(0, R * R - dy * dy)) - 4}" y2="${cy + dy}" stroke="#e09a00" stroke-width=".8" stroke-dasharray="3 3"/>`;
    // the Earth from above the North Pole: 24 meridians, one for each hour
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${col.earth}" stroke="${col.line}" stroke-width="1.2"/>`;
    s += `<path d="M${cx} ${cy - R}A${R} ${R} 0 0 1 ${cx} ${cy + R}Z" fill="#1e2436" fill-opacity="${print ? 0.12 : 0.18}"/>`;   // night side
    for (let i = 0; i < 24; i++) { const [x, y] = P(i * 15, R); s += `<line x1="${cx}" y1="${cy}" x2="${f(x)}" y2="${f(y)}" stroke="${col.spoke}" stroke-width=".6"/>`; }
    // the ship faces the sun (noon); Greenwich is turned by the longitude (east is counter-clockwise from above the pole)
    const shipA = 180, gwA = 180 - lon;
    const [sx, sy] = P(shipA, R), [gx, gy] = P(gwA, R);
    s += `<line x1="${cx}" y1="${cy}" x2="${f(sx)}" y2="${f(sy)}" stroke="${col.ship}" stroke-width="2.4"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${f(gx)}" y2="${f(gy)}" stroke="${col.gw}" stroke-width="2.4"/>`;
    s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="4" fill="${col.ship}"/>`;
    if (names.ship) s += T(sx - 6, sy - 12, names.ship, 'text-anchor="end"');
    // Greenwich's label just outside the Earth, kept inside the picture (about 5.3 units a letter)
    const gTxt = `Greenwich ${hhmm(((noonAt(lon) % 1440) + 1440) % 1440)}`, gw = gTxt.length * 5.3;
    let [glx, gly] = P(gwA, R + 12);
    const c = Math.cos(rad(gwA)), anchor = c < -0.3 ? 'end' : c > 0.3 ? 'start' : 'middle';
    if (anchor === 'start') glx = Math.min(glx, W - 4 - gw);
    if (anchor === 'end') glx = Math.max(glx, 4 + gw);
    if (anchor === 'middle') glx = Math.min(Math.max(glx, 4 + gw / 2), W - 4 - gw / 2);
    if (Math.abs(gly - (sy - 12)) < 12 && anchor === 'end') gly = sy - 26;   // not on top of the ship's label
    s += T(glx, Math.min(Math.max(gly, 22), Hh - 8), gTxt, `text-anchor="${anchor}" dominant-baseline="central" fill="${col.gw}"`);
    // the angle between them
    if (lon) {
      const a1 = Math.min(shipA, gwA), a2 = Math.max(shipA, gwA);
      const [x1, y1] = P(a1, 30), [x2, y2] = P(a2, 30);
      s += `<path d="M${f(x1)} ${f(y1)}A30 30 0 ${a2 - a1 > 180 ? 1 : 0} 0 ${f(x2)} ${f(y2)}" fill="none" stroke="${col.ang}" stroke-width="2"/>`;
      const [lx, ly] = P((a1 + a2) / 2, 44);
      s += `<text x="${f(lx)}" y="${f(ly)}" ${FONT} font-size="10" font-weight="800" fill="${col.ang}" text-anchor="middle" dominant-baseline="central" stroke="${col.bg}" stroke-width="2.4" paint-order="stroke">${Math.abs(lon)}°</text>`;
    }
    // the turning arrow (counter-clockwise seen from above the North Pole) and the pole
    const [ax1, ay1] = P(60, R + 8), [ax2, ay2] = P(110, R + 8);
    s += `<path d="M${f(ax1)} ${f(ay1)}A${R + 8} ${R + 8} 0 0 0 ${f(ax2)} ${f(ay2)}" fill="none" stroke="${col.line}" stroke-width="1.3"/>`;
    s += `<path d="M${f(ax2 + 6)} ${f(ay2 - 3)}L${f(ax2)} ${f(ay2)}L${f(ax2 + 5)} ${f(ay2 + 5)}" fill="none" stroke="${col.line}" stroke-width="1.3"/>`;
    if (names.turn) s += T(cx, 10, names.turn, 'text-anchor="middle" dominant-baseline="central"');
    s += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${col.line}"/>`;
    if (names.pole) s += T(cx + 5, cy + 10, names.pole, 'font-weight="600"');
    return s + '</svg>';
  }

  return { LEVELS, LEVEL_IDS, rng, pick, shuffle, hemi, fmt, diff, randomLat, randomLats, CITIES, city, LINES, readDistractors, diffDistractors, mapSvg, ladderSvg, skySvg, LAND, LAKES,
    normLon, hemiLon, fmtLon, randomLon, randomLons, noonAt, hhmm, lonDistractors, pointDistractors, lonScaleSvg, noonSvg, whySvg, whyLonSvg };
})();
if (typeof module !== 'undefined') module.exports = LAT;
