/**
 * The Dwójka agent's dossier (Teczka agenta Dwójki): four paper missions about the methods of Polish military
 * intelligence (Oddział II Sztabu Głównego, "Dwójka") between the wars. Classic script; defines the global `DW2`
 * (also exported for Node, so `node engine.test.js` can check it).
 *
 *   DW2.RATES                     → what one railway wagon carries: soldiers per coach, horses per boxcar, guns per flat
 *   DW2.rail(rnd, level)          → mission 1: trains counted at 1–2 stations over 4–5 days, the day of the big transport
 *   DW2.trainSvg(day, rnd)        → one drawn train of that day's wagons (coaches, boxcars, flats with guns), shuffled
 *   DW2.wagonSvg(kind)            → one wagon alone ('p' | 'h' | 'g'), for the legend
 *   DW2.mole(rnd, level)          → mission 2: 4/8/16 suspects, each given his own version of 2/3/4 details; the mole
 *   DW2.df(rnd, level)            → mission 3: listening posts in Warsaw and the bearings of a hidden transmitter; its cell
 *   DW2.mapSvg(opts)              → the schematic map of 1930s Warsaw with a lettered grid, labels from strings.js
 *   DW2.legend(rnd, level)        → mission 4: an agent's cover papers with 1–2 mistakes (and a false trail on ★★★)
 *   DW2.age(birth, at)            → full years between two dates
 *   DW2.LISTEN, DW2.polandSvg(L)  → the seven listening stations of the Cipher Bureau and a small map of Poland with them
 *   DW2.stationKm(a, b)           → km between two of them (the answer to the measuring task)
 *
 * Levels: 'easy' ★, 'mid' ★★, 'hard' ★★★. The same rnd ⇒ the same mission.
 */
const DW2 = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');
  const { pick, int, shuffle } = K;
  const range = n => Array.from({ length: n }, (_, i) => i);

  /* ============ mission 1: counting trains ============ */
  // a coach carries 40 soldiers, a boxcar 8 horses ("40 men or 8 horses", as the wagons were marked), a flat one gun
  const RATES = { p: 40, h: 8, g: 1 };
  const STATIONS = ['olsztyn', 'malbork', 'ilawa', 'pila', 'elblag', 'frankfurt'];   // German stations watched from Poland
  const sum = (arr, k) => arr.reduce((a, d) => a + d[k], 0);

  function rail(rnd, level) {
    const n = level === 'easy' ? 1 : 2, days = level === 'easy' ? 4 : 5;
    const ids = shuffle(rnd, STATIONS).slice(0, n);
    const spike = { st: int(rnd, 0, n - 1), day: int(rnd, 1, days - 1) };
    const stations = ids.map((id, si) => {
      const list = range(days).map(d => (si === spike.st && d === spike.day)
        ? { p: int(rnd, 5, 6), h: int(rnd, 2, 3), g: int(rnd, 2, 3) }
        : { p: int(rnd, 1, 3), h: int(rnd, 0, 2), g: int(rnd, 0, 1) });
      const tot = { p: sum(list, 'p'), h: sum(list, 'h'), g: sum(list, 'g') };
      return { id, days: list, tot, soldiers: tot.p * RATES.p, horses: tot.h * RATES.h, guns: tot.g * RATES.g,
        wagons: list.map(d => d.p + d.h + d.g) };
    });
    const normal = days * 2 * RATES.p;    // ★★★: a usual week at such a station — two coaches a day
    const peak = stations[spike.st].days[spike.day];
    const regiment = 3000, daysToMove = Math.ceil(regiment / (peak.p * RATES.p));   // ★★★: how long a regiment would take at that rate
    return { level, days, stations, spike, normal, regiment, daysToMove, peakSoldiers: peak.p * RATES.p };
  }

  /** One wagon at x: a coach with windows (p), a boxcar with a braced door (h) or a flat wagon with a gun (g). */
  function car(c, x, cw = 9) {
    let s = '';
    if (c === 'p') s += `<rect x="${x}" y="2.2" width="${cw}" height="5.3" rx=".6" fill="#fff" stroke="#333" stroke-width=".5"/>`
      + [1.2, 3.6, 6].map(dx => `<rect x="${x + dx}" y="3.3" width="1.8" height="1.8" fill="#333"/>`).join('');
    else if (c === 'h') s += `<rect x="${x}" y="1.6" width="${cw}" height="5.9" fill="#fff" stroke="#333" stroke-width=".5"/>`
      + `<rect x="${x + 3}" y="2.6" width="3" height="4.9" fill="none" stroke="#333" stroke-width=".5"/><path d="M${x + 3} 2.6l3 4.9M${x + 6} 2.6l-3 4.9" stroke="#333" stroke-width=".35"/>`;
    else s += `<rect x="${x}" y="6" width="${cw}" height="1.5" fill="#333"/>`
      + `<circle cx="${x + 4.5}" cy="4.6" r="1.4" fill="#fff" stroke="#333" stroke-width=".5"/><path d="M${x + 4.5} 4.6L${x + 8.6} 2.2" stroke="#333" stroke-width="1" stroke-linecap="round"/>`;
    return s + `<circle cx="${x + 2}" cy="8.2" r=".9" fill="#333"/><circle cx="${x + cw - 2}" cy="8.2" r=".9" fill="#333"/>`;
  }
  /** One wagon alone, for the legend. */
  const wagonSvg = c => `<svg viewBox="-0.5 -0.5 10 10" width="10mm" height="10mm" xmlns="http://www.w3.org/2000/svg">${car(c, 0)}</svg>`;

  /** One train drawn in SVG: an engine and the day's wagons in a mixed order. 1 unit = 1 mm; height 10. */
  function trainSvg(day, rnd) {
    const cars = shuffle(rnd, [...'p'.repeat(day.p), ...'h'.repeat(day.h), ...'g'.repeat(day.g)]);
    const cw = 9, gap = 1.2, x0 = 13, W = x0 + cars.length * (cw + gap);
    let s = `<svg viewBox="0 -0.5 ${W} 10" width="${W}mm" height="10mm" xmlns="http://www.w3.org/2000/svg">`;
    // the engine, facing left
    s += `<path d="M0.5 7.5V4.5H2V2.2H5V4.5H6.5V1.2H11V7.5Z" fill="#333"/><rect x="7.2" y="2" width="3" height="2.4" fill="#fff"/>`
      + `<circle cx="2.8" cy="8" r="1.3" fill="#333"/><circle cx="6" cy="8" r="1.3" fill="#333"/><circle cx="9.2" cy="8" r="1.3" fill="#333"/>`;
    cars.forEach((c, i) => { s += car(c, x0 + i * (cw + gap), cw); });
    return s + `<path d="M0 9.4H${W}" stroke="#999" stroke-width=".4"/></svg>`;
  }

  /* ============ mission 2: the mole ============ */
  // Each detail of the planted message has two versions; suspect i gets the versions of the bits of i.
  const DETAILS = ['date', 'city', 'regiment', 'hour'];
  const PAIRS = 3;          // strings.js has this many version pairs for every detail
  const NAMES = 16;         // … and this many suspects
  function mole(rnd, level) {
    const k = { easy: 2, mid: 3, hard: 4 }[level], n = 1 << k;
    const chosen = new Set(shuffle(rnd, DETAILS).slice(0, k));
    const details = DETAILS.filter(d => chosen.has(d)).map(d => ({ id: d, pair: int(rnd, 0, PAIRS - 1) }));
    const suspects = shuffle(rnd, range(NAMES)).slice(0, n);
    const moleAt = int(rnd, 0, n - 1);
    const bits = i => details.map((_, j) => (i >> (k - 1 - j)) & 1);
    return { level, k, n, details, suspects, moleAt, bits, moleBits: bits(moleAt), code: i => bits(i).join('') };
  }

  /* ============ mission 3: direction finding ============ */
  // Schematic map of Warsaw in the 1930s. 1 unit = 1 mm; a 12 × 12 grid of 12.5 mm cells (A–L × 1–12),
  // lat 52.205–52.275 (7.8 km), lon 20.962–21.076 (7.8 km): one cell is about 650 m, a few streets of houses.
  const CELL = 12.5, COLS = 12, ROWS = 12, LETTERS = 'ABCDEFGHIJKL', W = COLS * CELL, H = ROWS * CELL;
  const LAT0 = 52.275, LON0 = 20.962, KY = 150 / 0.07, KX = KY * 0.612;
  const P = (lat, lon) => [+((lon - LON0) * KX).toFixed(1), +((LAT0 - lat) * KY).toFixed(1)];
  // the Vistula's middle line, south to north (in the city it is about 400 m wide)
  const VISTULA = [[52.195, 21.070], [52.205, 21.063], [52.215, 21.057], [52.225, 21.050], [52.2365, 21.0405], [52.243, 21.033],
    [52.2487, 21.024], [52.255, 21.017], [52.262, 21.0115], [52.270, 21.0035], [52.280, 20.994]].map(p => P(...p));
  const RIVER_W = 7.5;
  // The streets of the 1930s as one network: crossings (lat, lon) and the streets between them, so every street
  // meets another one, a bridge or the map edge. Names in the comments; much simplified.
  const N = {
    zamek: [52.2478, 21.0140], kierbL: [52.2485, 21.0200], kierbR: [52.2493, 21.0290], krasinskich: [52.2495, 21.0050],
    bankowy: [52.2440, 21.0010], teatralny: [52.2435, 21.0105], inwalidow: [52.2610, 20.9905], wilsona: [52.2693, 20.9845],
    uniwersytet: [52.2400, 21.0175], swietokrzyskaT: [52.2362, 21.0190], rondo: [52.2316, 21.0222], trzechKrzyzy: [52.2283, 21.0230],
    sejm: [52.2248, 21.0275], belweder: [52.2133, 21.0286], unii: [52.2127, 21.0196], zbawiciela: [52.2195, 21.0165],
    marszJeroz: [52.2300, 21.0115], swietokrzyskaM: [52.2350, 21.0084], krolewska: [52.2380, 21.0065], politechnika: [52.2205, 21.0100],
    zawiszy: [52.2255, 20.9880], narutowicza: [52.2194, 20.9849], mirowski: [52.2402, 20.9965], kercelego: [52.2380, 20.9855],
    okopowa: [52.2500, 20.9835], poniL: [52.2357, 21.0345], poniR: [52.2378, 21.0470], waszyngtona: [52.2392, 21.0520],
    zieleniecka: [52.2455, 21.0480], wilenski: [52.2546, 21.0350],
    // where streets leave the map
    xNorth: [52.2785, 20.9790], xWola: [52.2340, 20.9570], xJeroz: [52.2222, 20.9570], xGrojecka: [52.2015, 20.9710],
    xPulawska: [52.2015, 21.0205], xBelwederska: [52.2015, 21.0320], xWaszyngtona: [52.2402, 21.0810], xJagiellonska: [52.2785, 21.0215],
  };
  const STREETS = [
    ['xNorth', 'wilsona', 'inwalidow', [52.2560, 20.9965], 'krasinskich', 'zamek'],                 // Mickiewicza, Bonifraterska, Miodowa
    ['zamek', 'uniwersytet', 'swietokrzyskaT', 'rondo', 'trzechKrzyzy', 'belweder', 'xBelwederska'], // Krakowskie Przedm., Nowy Świat, Al. Ujazdowskie
    ['zamek', 'kierbL'], ['kierbR', [52.2520, 21.0330], 'wilenski'],                                  // Nowy Zjazd; Zygmuntowska
    ['zamek', 'teatralny', 'bankowy'],                                                                // Senatorska
    ['bankowy', 'krolewska', 'swietokrzyskaM', 'marszJeroz', 'zbawiciela', 'unii', 'xPulawska'],      // Marszałkowska, Puławska
    ['krolewska', 'uniwersytet'], ['swietokrzyskaM', 'swietokrzyskaT'],                               // Królewska; Świętokrzyska
    ['poniL', 'rondo', 'marszJeroz', [52.2283, 21.0030], 'zawiszy', 'xJeroz'],                        // Al. 3 Maja, Al. Jerozolimskie
    ['bankowy', 'mirowski', 'kercelego', [52.2362, 20.9720], 'xWola'],                                // Elektoralna, Chłodna, Wolska
    ['kercelego', 'okopowa', [52.2580, 20.9875], 'inwalidow'],                                       // Okopowa, Słowackiego
    ['zawiszy', 'narutowicza', 'xGrojecka'], ['narutowicza', 'politechnika', 'zbawiciela'],           // Grójecka; Filtrowa, Nowowiejska
    ['trzechKrzyzy', 'sejm'],                                                                         // Wiejska
    ['poniR', 'waszyngtona', [52.2398, 21.0640], 'xWaszyngtona'],                                     // Al. Poniatowskiego, Al. Waszyngtona
    ['waszyngtona', 'zieleniecka', [52.2505, 21.0400], 'wilenski'],                                   // Zieleniecka, Targowa
    ['kierbR', [52.2580, 21.0262], [52.2680, 21.0228], 'xJagiellonska'],                              // Jagiellońska
  ].map(st => st.map(n => typeof n === 'string' ? N[n] : n).map(p => P(...p)));
  const BRIDGES = [   // Kierbedź, Poniatowski
    { pts: [N.kierbL, N.kierbR], id: 'kierbedz' }, { pts: [N.poniL, N.poniR], id: 'poniatowski' },
  ];
  // railways: from Dworzec Gdański round the Citadel and over the railway bridge to Praga; from Dworzec Wileński north-east
  const RAIL = [[[52.2560, 20.9580], [52.2577, 20.9946], [52.2640, 20.9952], [52.2681, 20.9990], [52.2686, 21.0105], [52.2705, 21.0250], [52.2785, 21.0330]],
    [[52.2546, 21.0350], [52.2605, 21.0480], [52.2700, 21.0660], [52.2760, 21.0790]]].map(l => l.map(p => P(...p)));
  const RAIL_BRIDGE = [[52.2681, 20.9990], [52.2686, 21.0105]].map(p => P(...p));
  // green: [lat, lon, half height, half width (degrees)], and the Citadel, a fortress
  const PARKS = { saski: [52.2405, 21.0080, 0.0017, 0.0033], lazienki: [52.2155, 21.0365, 0.0055, 0.0048], mokotowskie: [52.2120, 20.9995, 0.0035, 0.0105],
    skaryszewski: [52.2440, 21.0568, 0.0034, 0.0056], powazkiC: [52.2525, 20.9772, 0.0030, 0.0052] };
  const CITADEL = [[52.2672, 21.0000], [52.2665, 21.0075], [52.2620, 21.0092], [52.2598, 21.0040], [52.2622, 20.9978]].map(p => P(...p));
  // built-up areas: the left bank from Żoliborz to Mokotów, and Praga
  const LEFT_BANK = [[52.2730, 20.9700], [52.2700, 20.9960], [52.2672, 21.0000]].map(p => P(...p))
    .concat(VISTULA.slice(1, 9).reverse().map(([x, y]) => [x - RIVER_W / 2 - 0.6, y]))
    .concat([[52.2060, 21.0420], [52.2040, 21.0150], [52.2060, 20.9800], [52.2150, 20.9600], [52.2300, 20.9560], [52.2480, 20.9620], [52.2620, 20.9650]].map(p => P(...p)));
  const RIGHT_BANK = VISTULA.slice(3, 8).map(([x, y]) => [x + RIVER_W / 2 + 0.6, y])
    .concat([[52.2600, 21.0300], [52.2690, 21.0450], [52.2690, 21.0650], [52.2560, 21.0700], [52.2400, 21.0700], [52.2260, 21.0640]].map(p => P(...p)));
  const DISTRICTS = { stareMiasto: [52.2528, 21.0090], srodmiescie: [52.2245, 21.0000], praga: [52.2615, 21.0360], mokotow: [52.2070, 21.0130],
    wola: [52.2440, 20.9700], zoliborz: [52.2738, 20.9705], ochota: [52.2150, 20.9720], saskaKepa: [52.2285, 21.0610], powisle: [52.2410, 21.0255] };
  const PLACES = {   // id: [lat, lon, label dx, dy, anchor]; the first eight are where a listening post may stand
    cytadela: [52.2633, 21.0042, -4, 1.2, 'end'], prudential: [52.2358, 21.0130, 0, 4.6, 'middle'], politechnika: [52.2205, 21.0100, -3.5, -1.5, 'end'],
    belweder: [52.2133, 21.0286, 3.5, 3.4], dwWilenski: [52.2546, 21.0350, 3.5, 1.2], plWilsona: [52.2693, 20.9845, -3.5, 1.2, 'end'],
    plNarutowicza: [52.2194, 20.9849, -3.5, 1.2, 'end'], parkSkaryszewski: [52.2440, 21.0568, 0, -4.5, 'middle'],
    zamek: [52.2478, 21.0140, -3.5, -1.5, 'end'], halaMirowska: [52.2390, 20.9975, 0, 4.4, 'middle'],
    lazienki: [52.2165, 21.0365, 3.5, 1.2], powazki: [52.2525, 20.9772, 0, 5.8, 'middle'], sejm: [52.2248, 21.0275, 3.5, 1.2],
    dwGdanski: [52.2577, 20.9946, 3.5, 2.6], kercelak: [52.2380, 20.9855, 0, 4.6, 'middle'], plUnii: [52.2127, 21.0196, -3.5, 3.6, 'end'],
  };
  const STATION_IDS = Object.keys(PLACES).slice(0, 8);
  const cellOf = (x, y) => ({ c: Math.min(COLS - 1, Math.floor(x / CELL)), r: Math.min(ROWS - 1, Math.floor(y / CELL)) });
  /** the cell a crossing point falls in, or '' when it is off the map */
  const cellAt = p => p && p[0] >= 0 && p[1] >= 0 && p[0] < W && p[1] < H ? cellName({ c: Math.floor(p[0] / CELL), r: Math.floor(p[1] / CELL) }) : '';
  const cellName = ({ c, r }) => LETTERS[c] + (r + 1);
  const center = ({ c, r }) => [(c + 0.5) * CELL, (r + 0.5) * CELL];
  function inPolygon(x, y, poly) {   // ray casting
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }
  /** distance from a point to a polyline */
  function distToLine(x, y, pts) {
    let best = Infinity;
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1], [x2, y2] = pts[i], dx = x2 - x1, dy = y2 - y1;
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(x - x1 - t * dx, y - y1 - t * dy));
    }
    return best;
  }
  /** in a house: inside the map, not in the river, a park, the cemetery or the Citadel */
  const inPark = (x, y) => Object.values(PARKS).some(([lat, lon, dh, dw]) => {
    const [x0, y0] = P(lat + dh, lon - dw), [x1, y1] = P(lat - dh, lon + dw);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
  });
  const inside = (x, y) => x >= 0 && y >= 0 && x <= W && y <= H && distToLine(x, y, VISTULA) > RIVER_W / 2 + 1.5 && !inPark(x, y) && !inPolygon(x, y, CITADEL);
  /** compass bearing from (x1,y1) to (x2,y2): 0° = north, clockwise (y grows downwards on the map) */
  const bearing = (x1, y1, x2, y2) => (Math.atan2(x2 - x1, y1 - y2) * 180 / Math.PI + 360) % 360;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const DIRS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  /** where the lines from two stations with the given bearings cross */
  function cross(a, b) {
    const [x1, y1] = a.at, [x2, y2] = b.at;
    const d1 = [Math.sin(a.deg * Math.PI / 180), -Math.cos(a.deg * Math.PI / 180)], d2 = [Math.sin(b.deg * Math.PI / 180), -Math.cos(b.deg * Math.PI / 180)];
    const det = d1[0] * d2[1] - d1[1] * d2[0];
    if (Math.abs(det) < 1e-6) return null;
    const t = ((x2 - x1) * d2[1] - (y2 - y1) * d2[0]) / det;
    return [x1 + d1[0] * t, y1 + d1[1] * t];
  }

  function df(rnd, level) {
    const stations = STATION_IDS.map(id => ({ id, at: P(PLACES[id][0], PLACES[id][1]) }));
    for (let attempt = 0; attempt < 400; attempt++) {
      const cell = { c: int(rnd, 0, COLS - 1), r: int(rnd, 0, ROWS - 1) }, T = center(cell);
      if (!inside(...T)) continue;
      if (level === 'easy') {
        // ★: posts sit in the cells of their places; the transmitter is a whole number of cells away on one of 8 compass lines
        const fits = shuffle(rnd, stations).map(s => {
          const sc = cellOf(...s.at), dx = cell.c - sc.c, dy = cell.r - sc.r, n = Math.max(Math.abs(dx), Math.abs(dy));
          if (distToLine(...center(sc), VISTULA) < RIVER_W / 2 + 1) return null;   // the post's square must not be in the river
          if (n < 2 || n > 5 || !(dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) return null;
          const di = DIRS.findIndex(([ex, ey]) => ex === Math.sign(dx) && ey === Math.sign(dy));
          return { id: s.id, cell: sc, at: center(sc), compass: COMPASS[di], cells: n };
        }).filter(Boolean);
        if (fits.length < 2) continue;
        return { level, cell, name: cellName(cell), target: T, stations: fits.slice(0, 2) };
      }
      const far = shuffle(rnd, stations).filter(s => { const d = dist(s.at, T); return d >= 35 && d <= 110; });
      if (far.length < 3) continue;
      if (level === 'mid') {
        const picked = far.slice(0, 2).map(s => ({ ...s, deg: Math.round(bearing(...s.at, ...T)) }));
        const x = cross(picked[0], picked[1]);
        if (cellAt(x) !== cellName(cell)) continue;   // rounded bearings must still meet in the cell
        const ang = Math.abs(((picked[0].deg - picked[1].deg) % 180 + 180) % 180);
        if (ang < 30 || ang > 150) continue;                                // lines not too parallel
        return { level, cell, name: cellName(cell), target: T, stations: picked };
      }
      // ★★★: three bearings, each a little off (as real ones were) — the lines make a small triangle in the cell
      const picked = far.slice(0, 3).map(s => ({ ...s, deg: Math.round(bearing(...s.at, ...T) + pick(rnd, [-2, -1.5, 1.5, 2])) }));
      const xs = [cross(picked[0], picked[1]), cross(picked[1], picked[2]), cross(picked[0], picked[2])];
      if (xs.some(x => cellAt(x) !== cellName(cell))) continue;
      const angs = [[0, 1], [1, 2], [0, 2]].map(([i, j]) => Math.abs(((picked[i].deg - picked[j].deg) % 180 + 180) % 180));
      if (angs.some(a => a < 25 || a > 155)) continue;
      return { level, cell, name: cellName(cell), target: T, stations: picked, triangle: xs };
    }
    throw new Error('df: no layout found');
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const label = (x, y, text, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 3.4}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}`
    + `${o.bold ? ' font-weight="700"' : ''}${o.italic ? ' font-style="italic"' : ''} fill="${o.color || '#222'}" paint-order="stroke" stroke="#fff" stroke-width="${o.halo || 1}" stroke-linejoin="round">${esc(text)}</text>`;
  const path = pts => 'M' + pts.map(p => p.join(' ')).join('L');

  /**
   * opts: { L: labels { places, districts, bridges, river }, stations: the mission's stations, solved?: bool,
   *         target?: [x, y] (drawn when solved) }
   */
  function mapSvg(opts) {
    const L = opts.L, M = 7, poly = pts => `M${pts.map(p => p.join(' ')).join('L')}Z`;
    let s = `<svg viewBox="${-M} ${-M} ${W + M + 1} ${H + M + 1}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,Roboto,Arial,sans-serif">`
      + `<defs><clipPath id="dw2map"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>`
      + `<pattern id="dw2grave" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M1.5 .6v1.8M.9 1.2h1.2" stroke="#7d9670" stroke-width=".25"/></pattern></defs>`
      + `<rect x="0" y="0" width="${W}" height="${H}" fill="#fbfaf4"/><g clip-path="url(#dw2map)">`
      + `<path d="${poly(LEFT_BANK)}" fill="#efe8d6"/><path d="${poly(RIGHT_BANK)}" fill="#efe8d6"/>`;
    for (const [id, [lat, lon, dh, dw]] of Object.entries(PARKS)) {
      const [x0, y0] = P(lat + dh, lon - dw), [x1, y1] = P(lat - dh, lon + dw);
      s += `<rect x="${x0}" y="${y0}" width="${(x1 - x0).toFixed(1)}" height="${(y1 - y0).toFixed(1)}" rx="1.5" fill="${id === 'powazkiC' ? 'url(#dw2grave)' : '#d6e8c8'}" stroke="#a9c597" stroke-width=".3"/>`;
    }
    s += `<path d="${poly(CITADEL)}" fill="#e2d7bd" stroke="#8a7a58" stroke-width=".5"/>`
      + `<path d="${path(VISTULA)}" stroke="#9fc5e8" stroke-width="${RIVER_W}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const l of RAIL) s += `<path d="${path(l)}" stroke="#555" stroke-width="1.1" fill="none" stroke-linejoin="round"/><path d="${path(l)}" stroke="#fff" stroke-width=".5" stroke-dasharray="1.4 1.4" fill="none" stroke-linejoin="round"/>`;
    const roads = STREETS.map(pts => path(pts)).concat(BRIDGES.map(b => path(b.pts.map(p => P(...p)))));
    s += roads.map(d => `<path d="${d}" stroke="#a89c80" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`).join('')
      + roads.map(d => `<path d="${d}" stroke="#fff" stroke-width="1.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
    // bridges: a dark rail on both sides of the roadway
    for (const b of BRIDGES) {
      const [[x1, y1], [x2, y2]] = b.pts.map(p => P(...p)), a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * 1.25, ny = Math.cos(a) * 1.25;
      s += [1, -1].map(k => `<path d="M${(x1 + nx * k).toFixed(1)} ${(y1 + ny * k).toFixed(1)}L${(x2 + nx * k).toFixed(1)} ${(y2 + ny * k).toFixed(1)}" stroke="#444" stroke-width=".45"/>`).join('');
    }
    s += `<path d="${path(RAIL_BRIDGE)}" stroke="#444" stroke-width="1.8"/><path d="${path(RAIL_BRIDGE)}" stroke="#fff" stroke-width=".5" stroke-dasharray="1.4 1.4"/>`;
    const [rx, ry] = P(52.2240, 21.0480);
    s += `<text x="${rx}" y="${ry}" font-size="3.4" font-style="italic" font-weight="600" fill="#2a6cb0" transform="rotate(-52 ${rx} ${ry})" text-anchor="middle">${esc(L.river)}</text>`;
    for (const b of BRIDGES) if (b.id) {
      const [x, y] = P(...b.pts[1]);
      s += label(x + 2, y + (b.id === 'kierbedz' ? -1.6 : 4.2), L.bridges[b.id], { size: 2.6, color: '#555', italic: true, halo: .7 });
    }
    for (const [id, [lat, lon]] of Object.entries(DISTRICTS)) {
      const [x, y] = P(lat, lon);
      s += label(x, y, L.districts[id], { size: 2.9, color: '#8a8478', anchor: 'middle', bold: true, halo: 0.6 }).replace('<text ', '<text letter-spacing=".25" ');
    }
    s += '</g>';
    // the grid and its letters and numbers
    for (let i = 0; i <= COLS; i++) s += `<path d="M${i * CELL} 0V${H}" stroke="#8d97a8" stroke-width="${i % COLS ? .25 : .6}"/>`;
    for (let i = 0; i <= ROWS; i++) s += `<path d="M0 ${i * CELL}H${W}" stroke="#8d97a8" stroke-width="${i % ROWS ? .25 : .6}"/>`;
    for (let c = 0; c < COLS; c++) s += label((c + 0.5) * CELL, -2, LETTERS[c], { size: 3.6, bold: true, anchor: 'middle', halo: 0 });
    for (let r = 0; r < ROWS; r++) s += label(-2, (r + 0.5) * CELL + 1.3, String(r + 1), { size: 3.6, bold: true, anchor: 'end', halo: 0 });
    // places
    const stIds = new Set(opts.stations.map(st => st.id));
    for (const [id, [lat, lon, dx, dy, anchor]] of Object.entries(PLACES)) {
      if (stIds.has(id)) continue;
      const [x, y] = P(lat, lon);
      s += `<circle cx="${x}" cy="${y}" r="1.1" fill="#444"/>` + label(x + dx, y + dy, L.places[id], { size: 3, color: '#444', anchor });
    }
    // listening posts: a mast in a circle, a short north tick, the bearing in degrees
    for (const st of opts.stations) {
      const [x, y] = st.at, [, , dx, dy, anchor] = PLACES[st.id];
      s += `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff" stroke="#1f4fbf" stroke-width=".8"/>`
        + `<path d="M${x} ${y + 1.7}V${y - 1.6}M${x - 1.3} ${y - 0.4}L${x} ${y - 1.6}L${x + 1.3} ${y - 0.4}" stroke="#1f4fbf" stroke-width=".6" fill="none"/>`
        + `<path d="M${x} ${y - 2.6}V${y - 6}" stroke="#1f4fbf" stroke-width=".5"/>`
        + label(x + dx * 1.2, y + dy * 1.4, L.places[st.id], { size: 3.4, bold: true, color: '#1f4fbf', anchor });
      if (opts.solved && st.deg !== undefined) {
        const t = 200, ex = x + Math.sin(st.deg * Math.PI / 180) * t, ey = y - Math.cos(st.deg * Math.PI / 180) * t;
        s += `<path d="M${x} ${y}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#c0252b" stroke-width=".5" stroke-dasharray="2 1.2" clip-path="url(#dw2map)"/>`;
      }
    }
    if (opts.solved && opts.target) {
      const [x, y] = opts.target;
      s += `<circle cx="${x}" cy="${y}" r="3.2" fill="none" stroke="#c0252b" stroke-width="1"/><circle cx="${x}" cy="${y}" r="1" fill="#c0252b"/>`;
    }
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#333" stroke-width=".6"/>`;
    // north arrow and a scale bar (1 km)
    const km = KY * 0.009, sy = H - 5;
    s += `<g transform="translate(${W - 8} 11)"><path d="M0 -6L2.6 3L0 1.2L-2.6 3Z" fill="#333"/><text y="-7.5" font-size="3.6" font-weight="700" text-anchor="middle" fill="#333">N</text></g>`
      + `<path d="M4 ${sy}h${km.toFixed(1)}" stroke="#333" stroke-width=".8"/><path d="M4 ${sy - 1.5}v3M${(4 + km).toFixed(1)} ${sy - 1.5}v3" stroke="#333" stroke-width=".6"/>`
      + label(4 + km / 2, sy - 2, '1 km', { size: 3, anchor: 'middle' });
    return s + '</svg>';
  }

  /* ============ mission 4: the cover story ============ */
  const DIM = y => [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const addDays = (d, n) => { const t = new Date(Date.UTC(d.y, d.m - 1, d.d + n)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
  function age(b, at) { let a = at.y - b.y; if (at.m < b.m || (at.m === b.m && at.d < b.d)) a--; return a; }
  const ROUTES = [['warsaw', 'torun'], ['warsaw', 'poznan'], ['krakow', 'warsaw'], ['poznan', 'gdynia'], ['warsaw', 'lwow'], ['lodz', 'krakow'], ['warsaw', 'wilno'], ['lublin', 'warsaw']];   // ids of m4.cities in strings.js
  const hm = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

  /**
   * ★   one mistake: age / passport issued after the trip / the letter's "yesterday"
   * ★★  one mistake to find with the timetable: the hotel card says he arrived before his train did
   * ★★★ two mistakes of different kinds and a false trail: the birthday falls after the trip (so he is a year
   *     younger than the years suggest) or the night train arrives the next day
   */
  function legend(rnd, level) {
    const birth = { y: int(rnd, 1898, 1910), m: int(rnd, 1, 12), d: int(rnd, 1, 28) };
    const trip = { y: int(rnd, 1935, 1938), m: int(rnd, 3, 11), d: int(rnd, 2, 26) };
    const herring = level === 'hard' ? pick(rnd, ['birthday', 'night']) : null;
    if (herring === 'birthday') { birth.m = trip.m; birth.d = Math.min(28, trip.d + int(rnd, 1, 3)); }
    else if (birth.m === trip.m && Math.abs(birth.d - trip.d) < 4) birth.m = (birth.m % 12) + 1;
    const issued = addDays(trip, -int(rnd, 20, 400));
    const route = pick(rnd, ROUTES), name = int(rnd, 0, 7);
    // the timetable: two trains on the route; the ticket is for one of them
    const dur = [int(rnd, 2, 5), int(rnd, 3, 6)], dep = herring === 'night' ? [int(rnd, 7, 10), int(rnd, 21, 23)] : [int(rnd, 6, 9), int(rnd, 12, 15)];
    const trains = dep.map((h, i) => { const m = pick(rnd, [0, 10, 20, 30, 40, 50]), a = h * 60 + m + dur[i] * 60 + pick(rnd, [5, 15, 25, 35, 45]);
      return { dep: hm(h, m), arr: hm(Math.floor(a / 60) % 24, a % 60), next: a >= 24 * 60, depMin: h * 60 + m, arrMin: a }; });
    const ticket = herring === 'night' ? 1 : int(rnd, 0, 1), tr = trains[ticket];
    const arriveDay = tr.next ? addDays(trip, 1) : trip;
    const truth = { age: age(birth, arriveDay), hotelHour: hm(Math.floor(tr.arrMin / 60) % 24 + (tr.next ? 0 : 0), 0), letterDate: addDays(arriveDay, 1) };
    const arrH = Math.floor(tr.arrMin / 60) % 24, hotelArr = hm(Math.min(23, arrH + int(rnd, 1, 2)), pick(rnd, [0, 15, 30, 45]));
    const docs = { hotelAge: truth.age, hotelArr, hotelDate: arriveDay, letterDate: truth.letterDate, issued, ticketDate: trip };
    const kinds = { easy: ['age', 'passport', 'letter'], mid: ['hour'], hard: ['age', 'passport', 'letter', ...(tr.next ? [] : ['hour'])] };   // no hour mistake on a night train: an earlier hour would be the day before
    const errs = shuffle(rnd, kinds[level]).slice(0, level === 'hard' ? 2 : 1);
    if (herring === 'birthday' && errs.includes('age')) errs[errs.indexOf('age')] = ['passport', 'letter', 'hour'].find(e => !errs.includes(e));
    for (const e of errs) {
      if (e === 'age') docs.hotelAge = truth.age + pick(rnd, [-2, -1, 1, 2, 3]);
      if (e === 'passport') docs.issued = addDays(trip, int(rnd, 3, 40));
      if (e === 'letter') docs.letterDate = addDays(arriveDay, int(rnd, 3, 6));
      if (e === 'hour') docs.hotelArr = hm(Math.max(0, arrH - int(rnd, 1, 3)), pick(rnd, [0, 15, 30, 45]));
    }
    return { level, birth, trip, issued: docs.issued, route, name, trains, ticket, arriveDay, docs, truth, errs, herring };
  }

  /* ============ "how it really was": the listening stations of the Cipher Bureau ============ */
  // A small schematic map of Poland (borders of 1923–1938, rough) with the seven fixed listening stations.
  // Kołakowski, Dzieje Najnowsze 53 (2021) 1, p. 79: nos. 3–5 listened to Germany, nos. 1, 2, 6, 7 to the USSR.
  const PL = { LAT0: 56.15, LON0: 15.5, KY: 150 / 8.3 };
  PL.KX = PL.KY * 0.616;
  const Pp = (lat, lon) => [+((lon - PL.LON0) * PL.KX).toFixed(1), +((PL.LAT0 - lat) * PL.KY).toFixed(1)];
  const PL_BORDER = [
    [54.80, 18.05], [54.65, 18.35], [54.55, 18.55], [54.45, 18.57], [54.3, 18.42], [54.1, 18.5], [53.98, 18.75], [53.92, 19.05],
    [53.75, 19.3], [53.5, 19.55], [53.35, 19.95], [53.33, 20.3], [53.2, 21.0], [53.38, 21.6], [53.45, 22.3], [53.65, 22.75],
    [53.95, 22.9], [54.2, 22.9], [54.35, 23.0], [54.4, 23.5], [54.6, 24.2], [54.9, 24.6], [55.1, 25.3], [55.3, 25.9], [55.55, 26.5],
    [55.85, 26.7], [56.0, 27.3], [55.8, 27.65], [55.6, 28.0], [55.2, 27.9], [54.8, 27.5], [54.4, 27.2], [54.0, 27.0], [53.6, 26.9],
    [53.2, 27.1], [52.8, 27.4], [52.4, 27.7], [52.1, 27.9], [51.8, 27.5], [51.5, 27.1], [51.2, 26.8], [50.8, 26.6], [50.4, 26.2],
    [49.95, 26.3], [49.5, 26.2], [49.1, 26.3], [48.75, 26.4], [48.5, 26.1], [48.45, 25.6], [48.3, 25.3], [48.25, 24.95],
    [48.35, 24.6], [48.55, 24.2], [48.7, 23.6], [48.95, 23.1], [49.1, 22.8], [49.35, 22.3], [49.4, 21.7], [49.45, 21.0], [49.3, 20.5],
    [49.2, 20.1], [49.45, 19.8], [49.6, 19.4], [49.55, 19.0], [49.75, 18.65], [49.9, 18.45], [50.0, 18.3], [50.25, 18.5],
    [50.55, 18.45], [50.85, 18.55], [51.1, 18.35], [51.4, 18.1], [51.6, 17.6], [51.7, 17.0], [51.85, 16.4], [52.1, 15.85],
    [52.45, 15.75], [52.7, 16.0], [52.95, 16.05], [53.2, 16.35], [53.45, 16.85], [53.65, 17.25], [53.95, 17.4], [54.25, 17.6], [54.55, 17.85],
  ].map(p => Pp(...p));
  const PL_VISTULA = [[49.95, 19.6], [50.06, 19.94], [50.3, 20.5], [50.6, 21.2], [50.9, 21.7], [51.3, 21.8], [51.6, 21.8], [52.0, 21.2],
    [52.23, 21.03], [52.43, 20.71], [52.4, 20.3], [52.55, 19.7], [52.65, 19.07], [53.01, 18.6], [53.3, 18.75], [53.7, 18.8], [54.1, 18.9], [54.33, 18.95]].map(p => Pp(...p));
  /** id: [number, lat, lon, 'w' (Germany) | 'e' (USSR), label dx, dy, anchor] */
  const LISTEN = {
    warszawa: [1, 52.23, 21.01, 'e', 4.5, 1.6], lida: [2, 53.89, 25.30, 'e', -4.5, 1.6, 'end'], krzeslawice: [3, 50.10, 20.03, 'w', 4.5, 1.6],
    poznan: [4, 52.41, 16.93, 'w', 4.5, 1.6], starogard: [5, 53.97, 18.53, 'w', 4.5, 1.6], rowne: [6, 50.62, 26.25, 'e', -4.5, 1.6, 'end'],
    kolomyja: [7, 48.53, 25.04, 'e', 4.5, 1.6],
  };
  const PL_NEIGHBOURS = { germany: [51.3, 16.3], prussia: [54.15, 21.2], lithuania: [55.35, 24.0], latvia: [56.05, 26.0], ussr: [52.0, 28.2],
    czechoslovakia: [48.7, 23.6], romania: [47.95, 27.2], baltic: [55.2, 18.4] };
  /** km between two stations along the ground (for the answer key) */
  function stationKm(a, b) {
    const [, la1, lo1] = LISTEN[a], [, la2, lo2] = LISTEN[b], r = Math.PI / 180;
    const x = (lo2 - lo1) * r * Math.cos((la1 + la2) / 2 * r), y = (la2 - la1) * r;
    return Math.round(Math.hypot(x, y) * 6371);
  }
  /** opts: { L: labels { stations, neighbours, west, east } } — 145 × 150 units, scale bar 100 km */
  function polandSvg(L) {
    const W = 145, H = 150;
    let s = `<svg viewBox="-2 -2 ${W + 4} ${H + 4}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,Roboto,Arial,sans-serif">`
      + `<rect x="0" y="0" width="${W}" height="${H}" fill="#eef3f7"/>`
      + `<path d="M${PL_BORDER.map(p => p.join(' ')).join('L')}Z" fill="#fbf7ea" stroke="#6b665a" stroke-width="1" stroke-linejoin="round"/>`
      + `<path d="${path(PL_VISTULA)}" stroke="#7fb2e0" stroke-width="1.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const [id, [lat, lon]] of Object.entries(PL_NEIGHBOURS)) {
      const [x, y] = Pp(lat, lon);
      s += label(x, y, L.neighbours[id], { size: 4.6, color: '#7a7466', anchor: 'middle', italic: true, halo: 0 });
    }
    for (const [id, [n, lat, lon, dir, dx, dy, anchor]] of Object.entries(LISTEN)) {
      const [x, y] = Pp(lat, lon), c = dir === 'w' ? '#b9382f' : '#1f4fbf';
      s += `<circle cx="${x}" cy="${y}" r="3.6" fill="${c}"/><text x="${x}" y="${y + 1.7}" font-size="4.6" font-weight="800" text-anchor="middle" fill="#fff">${n}</text>`
        + label(x + dx, y + dy, L.stations[id], { size: 5.2, bold: true, color: c, anchor, halo: 1.4 });
    }
    // legend and a 100 km scale bar
    const km = PL.KY * 100 / 111, lx = 4, ly = H - 22;   // legend in the bottom left corner
    s += `<rect x="${lx - 2}" y="${ly - 6}" width="60" height="26" rx="2" fill="#fff" fill-opacity=".92" stroke="#bbb" stroke-width=".5"/>`
      + `<circle cx="${lx + 3}" cy="${ly}" r="2.6" fill="#b9382f"/>` + label(lx + 8, ly + 1.8, L.west, { size: 4.6, halo: 0 })
      + `<circle cx="${lx + 3}" cy="${ly + 8}" r="2.6" fill="#1f4fbf"/>` + label(lx + 8, ly + 9.8, L.east, { size: 4.6, halo: 0 })
      + `<path d="M${lx} ${ly + 16}h${km.toFixed(1)}" stroke="#333" stroke-width="1.2"/><path d="M${lx} ${ly + 13.5}v5M${(lx + km).toFixed(1)} ${ly + 13.5}v5" stroke="#333" stroke-width="1"/>`
      + label(lx + km + 2, ly + 17.6, '100 km', { size: 4.4, halo: 0 })
      + `<g transform="translate(${W - 7} 10)"><path d="M0 -6L2.6 3L0 1.2L-2.6 3Z" fill="#333"/><text y="-7.5" font-size="4.6" font-weight="700" text-anchor="middle" fill="#333">N</text></g>`
      + `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#888" stroke-width=".6"/>`;
    return s + '</svg>';
  }

  return { RATES, STATIONS, rail, trainSvg, wagonSvg, DETAILS, PAIRS, NAMES, mole, df, mapSvg, cellName, legend, age, addDays, DIM, PLACES, STATION_IDS, LETTERS, COLS, ROWS, inside, P, bearing, LISTEN, stationKm, polandSvg };
})();
if (typeof module !== 'undefined') module.exports = DW2;
