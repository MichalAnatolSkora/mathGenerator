/**
 * Hidden objects — engine of the printable worksheet. Classic script; defines the global `HID`
 * (also exported for Node: `node engine.test.js`). Needs KIT (../sheet-kit/kit.js) for the random helpers.
 * objects.js adds the things to find (HID.OBJECTS), scenes.js the pictures (HID.SCENES).
 *
 * A picture is a line drawing made by code, in millimetres. Everything is drawn with one "pen":
 *   - shapes are a few points; the pen joins them with smooth curves (a point marked [x, y, 1] is a sharp
 *     corner), moves every point a little and bends long straight edges, so the lines look drawn by hand;
 *   - a closed shape is filled white, so what is drawn later covers what is behind it (near things are
 *     drawn last);
 *   - every closed shape is also painted on a 1 mm grid with the number of the thing it belongs to
 *     (`cells`): the grid tells which thing is seen at each spot of the finished picture.
 * While a scene is drawn, its things offer places for a hidden object: `slot` = lying on the thing (on a
 * tree crown, along a trunk), `stand` = standing in for a part of the thing (a fence picket, a branch, a
 * window bar, a wheel hub). HID.make draws the scene twice. After the first, plain pass it picks the
 * objects and their places — only where the object fits, nothing nearer covers it (checked on the grid)
 * and far from the other objects. The second pass draws the same scene from the same random numbers, but
 * now each chosen place draws its object at once, with the same pen, and the thing leaves out the part
 * the object stands in for — so the object is built into the picture, not laid on top of it.
 *
 *   HID.make(seed, scene, level) → { W, H, found: [{ id, x, y, r, part, fill }], svg(mm, solved), slots }
 *                                  (part = it stands in for a part of the scene; fill = how much of its place it fills)
 *   HID.icon(id, mm)             → the object alone, as an SVG string (for the list under the picture)
 *   HID.LEVELS                   → { easy, medium, hard }: how many objects, how long they are and how far apart (mm)
 */
const HID = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');
  const INK = '#1b1b1f', OUT = 0.55, THIN = 0.36;      // line colour, outline and detail width (mm)
  const TAU = Math.PI * 2, f2 = v => +v.toFixed(2);
  const W = 160, H = 200;                               // the picture, mm
  const LEVELS = { easy: { n: 8, len: [12, 19], gap: 26 }, medium: { n: 12, len: [9.5, 15], gap: 20 }, hard: { n: 16, len: [8, 12.5], gap: 16 } };
  const PI = Math.PI;

  /* ---------- the pen ---------- */
  /** Points {x, y, k} → the SVG path through them and the same line as a polygon. A run between two
   *  corners (k = 1) is a smooth Catmull–Rom curve; two neighbouring corners give a straight edge. */
  function trace(P, closed) {
    let d = '';
    const poly = [];
    const span = (p0, p1, p2, p3) => {
      const ax = p1.x + (p2.x - p0.x) / 6, ay = p1.y + (p2.y - p0.y) / 6;
      const bx = p2.x - (p3.x - p1.x) / 6, by = p2.y - (p3.y - p1.y) / 6;
      d += `C${f2(ax)} ${f2(ay)} ${f2(bx)} ${f2(by)} ${f2(p2.x)} ${f2(p2.y)}`;
      for (let i = 1; i <= 4; i++) {
        const t = i / 4, u = 1 - t;
        poly.push([u * u * u * p1.x + 3 * u * u * t * ax + 3 * u * t * t * bx + t * t * t * p2.x,
          u * u * u * p1.y + 3 * u * u * t * ay + 3 * u * t * t * by + t * t * t * p2.y]);
      }
    };
    const n = P.length;
    if (closed && !P.some(p => p.k)) {
      d = `M${f2(P[0].x)} ${f2(P[0].y)}`;
      for (let i = 0; i < n; i++) span(P[(i + n - 1) % n], P[i], P[(i + 1) % n], P[(i + 2) % n]);
      return { d: d + 'Z', poly };
    }
    let Q = P;
    if (closed) { const c = P.findIndex(p => p.k); Q = [...P.slice(c), ...P.slice(0, c), P[c]]; }
    const mirror = (p, q) => ({ x: 2 * p.x - q.x, y: 2 * p.y - q.y });
    d = `M${f2(Q[0].x)} ${f2(Q[0].y)}`; poly.push([Q[0].x, Q[0].y]);
    for (let a = 0, b = 1; b < Q.length; b++) {
      if (!Q[b].k && b < Q.length - 1) continue;
      if (b - a === 1) { d += `L${f2(Q[b].x)} ${f2(Q[b].y)}`; poly.push([Q[b].x, Q[b].y]); }
      else for (let i = a; i < b; i++) span(i > a ? Q[i - 1] : mirror(Q[a], Q[a + 1]), Q[i], Q[i + 1], i + 2 <= b ? Q[i + 2] : mirror(Q[b], Q[b - 1]));
      a = b;
    }
    if (closed) poly.pop();
    return { d: d + (closed ? 'Z' : ''), poly };
  }

  /** Calls fn(index) for every grid cell whose middle lies inside the polygon. */
  function scan(poly, fn) {
    let y0 = Infinity, y1 = -Infinity;
    for (const p of poly) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    for (let j = Math.max(0, Math.floor(y0)); j <= Math.min(H - 1, Math.floor(y1)); j++) {
      const y = j + 0.5, xs = [];
      for (let i = 0, n = poly.length; i < n; i++) {
        const a = poly[i], b = poly[(i + 1) % n];
        if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const i1 = Math.min(W - 1, Math.floor(xs[k + 1] - 0.5));
        for (let i = Math.max(0, Math.ceil(xs[k] - 0.5)); i <= i1; i++) fn(j * W + i);
      }
    }
  }
  /** Calls fn(index) for the grid cells within `rad` of the line. */
  function scanLine(poly, rad, fn) {
    const disc = (x, y) => {
      for (let j = Math.max(0, Math.floor(y - rad)); j <= Math.min(H - 1, Math.floor(y + rad)); j++)
        for (let i = Math.max(0, Math.floor(x - rad)); i <= Math.min(W - 1, Math.floor(x + rad)); i++)
          if ((i + 0.5 - x) ** 2 + (j + 0.5 - y) ** 2 <= rad * rad + 0.3) fn(j * W + i);
    };
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[i + 1];
      disc(a[0], a[1]);
      if (!b) break;
      const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.7);
      for (let q = 1; q < n; q++) disc(a[0] + (b[0] - a[0]) * q / n, a[1] + (b[1] - a[1]) * q / n);
    }
  }

  /** A sheet to draw on. `probe` sheets only collect the outlines (no paths, no hand wobble).
   *  `plan` (second pass): slot number → the object that goes there. */
  const canvas = (probe, plan, seed) => ({ items: [], cells: probe ? null : new Int16Array(W * H), slots: [], id: 0, tag: -1, keep: new Set(), probe: !!probe, plan: plan || null, seed: seed || '', shapes: [], box: [Infinity, Infinity, -Infinity, -Infinity] });
  const I = [1, 0, 0, 1, 0, 0];
  /** Random numbers of a pen: `rnd` decides what is drawn (sizes, counts — a new stream for every thing,
   *  so a thing never changes its neighbours), `jr` only wobbles the lines. */
  const dice = (cv, salt) => ({ rnd: K.rng(`${cv.seed}|${salt}`), jr: K.rng(`${cv.seed}|pen|${salt}`) });

  /** The pen on sheet `cv`, drawing in its own units: m = [a, b, c, d, e, f] takes them to mm. */
  function pen(cv, st, m) {
    const X = (x, y) => m[0] * x + m[2] * y + m[4], Y = (x, y) => m[1] * x + m[3] * y + m[5];
    const sc = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
    const jit = (p, j) => { if (j > 0) { const a = st.jr() * TAU, r = Math.sqrt(st.jr()) * j; p.x += Math.cos(a) * r; p.y += Math.sin(a) * r; } return p; };

    /** Points in own units → points in mm, long straight edges cut into wobbly pieces, every point moved by up to j mm. */
    function prep(pts, closed, j) {
      const P = pts.map(p => ({ x: X(p[0], p[1]), y: Y(p[0], p[1]), k: p[2] ? 1 : 0 }));
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of P) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
      const b = cv.box; b[0] = Math.min(b[0], x0); b[1] = Math.min(b[1], y0); b[2] = Math.max(b[2], x1); b[3] = Math.max(b[3], y1);
      if (cv.probe) return P;
      j = Math.min(j, 0.045 * Math.hypot(x1 - x0, y1 - y0));
      const out = [], n = P.length, end = i => !closed && (i === 0 || i === n - 1);
      for (let i = 0; i < n; i++) {
        const a = P[i], c = closed ? P[(i + 1) % n] : P[i + 1];
        const ax = a.x, ay = a.y;
        out.push(jit(a, j));
        if (c && (a.k || end(i)) && (c.k || end(i + 1))) {
          const cuts = Math.floor(Math.hypot(c.x - ax, c.y - ay) / 9);
          for (let q = 1; q <= cuts; q++) out.push(jit({ x: ax + (c.x - ax) * q / (cuts + 1), y: ay + (c.y - ay) * q / (cuts + 1), k: 0 }, j * 0.8));
        }
      }
      return out;
    }
    const own = i => { cv.cells[i] = cv.id; };
    function path(pts, closed, o = {}) {
      const { d, poly } = trace(prep(pts, closed, o.j === undefined ? 0.22 : o.j), closed);
      const fill = o.f === undefined ? (closed ? '#fff' : 'none') : o.f === 'k' ? INK : o.f;
      const solid = closed && fill !== 'none';
      if (cv.probe) { cv.shapes.push({ poly, solid }); return poly; }
      cv.items.push({ d, f: fill, s: o.s, w: o.w || (o.t ? THIN : OUT), tag: cv.tag });
      if (solid && o.own !== false && cv.tag < 0) scan(poly, own);
      return poly;
    }

    const g = {
      cv, sc,
      r: (a, b) => a + st.rnd() * (b - a),
      ri: (a, b) => a + Math.floor(st.rnd() * (b - a + 1)),
      pick: arr => arr[Math.floor(st.rnd() * arr.length)],
      chance: p => st.rnd() < p,
      /** The same pen moved to (x, y), scaled, turned (radians) and maybe mirrored left–right. */
      at(x, y, s = 1, rot = 0, flip = false) {
        const c = Math.cos(rot) * s, sn = Math.sin(rot) * s, fx = flip ? -1 : 1;
        return pen(cv, st, [m[0] * c * fx + m[2] * sn * fx, m[1] * c * fx + m[3] * sn * fx, -m[0] * sn + m[2] * c, -m[1] * sn + m[3] * c, X(x, y), Y(x, y)]);
      },
      /** Closed shape (white inside unless o.f says otherwise: 'none', 'k' = black). o.t = thin line. */
      b: (pts, o) => path(pts, true, o),
      /** Open line. */
      l: (pts, o) => path(pts, false, o),
      /** Ellipse; o.rot turns it, o.n = how many points carry it. */
      e(cx, cy, rx, ry, o = {}) {
        const n = o.n || 10, c = Math.cos(o.rot || 0), s = Math.sin(o.rot || 0), pts = [];
        for (let i = 0; i < n; i++) { const a = i / n * TAU, u = rx * Math.cos(a), v = ry * Math.sin(a); pts.push([cx + u * c - v * s, cy + u * s + v * c]); }
        return path(pts, true, o);
      },
      /** Black dot (an eye, a nose). */
      d: (cx, cy, r) => g.e(cx, cy, r, r, { f: 'k', n: 6, j: 0.04, w: 0.2, own: false }),
      /** Part of an ellipse from angle a0 to a1 (radians, clockwise on the page from "3 o'clock"). */
      arc(cx, cy, rx, ry, a0, a1, o) {
        const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.6)), pts = [];
        for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
        return path(pts, false, o);
      },
      /** Fat white lines with an outline that melt into one another where they meet (branches, tentacles):
       *  list = [{ p: points, w: width in own units }]. */
      tube(list, o = {}) {
        const done = list.map(t => ({ ...trace(prep(t.p, false, o.j === undefined ? 0.22 : o.j), false), w: t.w * sc }));
        for (const t of done) {
          if (cv.probe) { cv.shapes.push({ poly: t.poly, solid: true, rad: t.w / 2 }); continue; }
          cv.items.push({ d: t.d, f: 'none', w: t.w + 2 * OUT, tag: cv.tag });
          if (cv.tag < 0) scanLine(t.poly, t.w / 2 + OUT / 2, own);
        }
        if (!cv.probe) for (const t of done) cv.items.push({ d: t.d, f: 'none', w: t.w, s: '#fff', tag: cv.tag });
      },
      /** Round blobs [cx, cy, rx, ry, turn] melted into one shape with one outline (cloud, tree crown, bush, wool). */
      clump(list, o = {}) {
        const done = list.map(([cx, cy, rx, ry, rot = 0]) => {
          const n = 10, c = Math.cos(rot), s = Math.sin(rot), pts = [];
          for (let i = 0; i < n; i++) { const a = i / n * TAU, u = rx * Math.cos(a), v = ry * Math.sin(a); pts.push([cx + u * c - v * s, cy + u * s + v * c]); }
          return trace(prep(pts, true, o.j === undefined ? 0.22 : o.j), true);
        });
        for (const t of done) {
          if (cv.probe) { cv.shapes.push({ poly: t.poly, solid: true }); continue; }
          cv.items.push({ d: t.d, f: '#fff', w: 2 * OUT, tag: cv.tag });
          scan(t.poly, own);
        }
        if (!cv.probe) for (const t of done) cv.items.push({ d: t.d, f: '#fff', s: 'none', w: OUT, tag: cv.tag });
      },
      /** A place for a hidden object lying ON this thing: a box hw × hh (half sizes) around (x, y) whose
       *  long side runs at angle rot; rot = null: a round place, the object may be turned any way.
       *  The whole object must lie on the thing and nothing nearer may cover it.
       *  o.p = how gladly the place is used (1 = as any other); o.want = only objects with this shape tag
       *  ('round', 'dome', 'cone'); o.fill = the least part of the box the object must fill (a stand-in place
       *  always asks for 0.3); o.cap = how many objects one thing may carry (2); o.after(q, f, slot) =
       *  what is drawn right after the object with its own pen q.
       *  First pass: only notes the place and returns null. Second pass: if an object was planned here, it
       *  is drawn NOW (so what the thing draws next lies over it) and its placement is returned — the thing
       *  then leaves out the part the object stands in for. Draw the same random numbers either way. */
      slot(x, y, hw, hh, rot = null, o = {}) {
        if (cv.probe) return null;
        let ang = null;
        if (rot !== null) { const dx = Math.cos(rot), dy = Math.sin(rot); ang = Math.atan2(m[1] * dx + m[3] * dy, m[0] * dx + m[2] * dy); }
        const k = cv.slots.length;
        const s = { x: X(x, y), y: Y(x, y), hw: hw * sc, hh: hh * sc, ang, host: cv.id, sc, p: o.p || 1, free: !!o.free, foot: !!o.foot, up: !!o.up, cap: o.cap || 2, want: o.want || '', fill: o.fill || 0 };
        cv.slots.push(s);
        const hit = cv.plan && cv.plan.get(k);
        if (!hit) return null;
        const q = pen(cv, dice(cv, 'object' + k), I);
        cv.tag = hit.tag; place(q, hit.ob, hit.f); cv.tag = -1;
        if (o.after) o.after(q, hit.f, s);
        return hit.f;
      },
      /** A place where an object STANDS IN for a part of the scene (a fence picket, a branch, a window
       *  bar, a fruit on a tree): it starts at (x, y), runs towards angle rot (-π/2 = up) for at most `len`
       *  and is at most `wid` wide. o.up: the object keeps its own upright look (rot only says where it
       *  hangs or grows from). It covers what is behind it, and nothing nearer may cover it. */
      stand(x, y, len, wid, rot = -PI / 2, o = {}) {
        return g.slot(x + Math.cos(rot) * len / 2, y + Math.sin(rot) * len / 2, len / 2, wid / 2, rot, { p: 1.5, ...o, free: true, foot: true });
      },
      /** n points inside an ellipse, at least `gap` apart (fewer when they do not fit). */
      spots(cx, cy, rx, ry, n, gap) {
        const out = [];
        for (let i = 0; i < n * 12 && out.length < n; i++) {
          const a = st.rnd() * TAU, q = Math.sqrt(st.rnd()), p = [cx + Math.cos(a) * q * rx, cy + Math.sin(a) * q * ry];
          if (out.every(o => Math.hypot(o[0] - p[0], o[1] - p[1]) >= gap)) out.push(p);
        }
        return out;
      },
      /** Starts a new thing: what is drawn from now on belongs to it on the grid. keep = an object may not cover it. */
      thing(keep) { cv.id++; if (keep) cv.keep.add(cv.id); st.rnd = K.rng(`${cv.seed}|${cv.id}`); return g; },
    };
    return g;
  }

  /* ---------- the things to find ---------- */
  const OBJECTS = [];        // { id, not: [scenes it must stay out of], tags, draw(g) } — filled by objects.js
  const SCENES = {};         // id → function(g) that draws the scene on a W × H sheet — filled by scenes.js
  const still = { rnd: null, jr: null };
  /** Size of an object as drawn at scale 1: box middle, long and short side, and whether it stands upright. */
  function measure(ob) {
    if (!ob.dim) {
      const cv = canvas(true);
      ob.draw(pen(cv, still, I));
      const [x0, y0, x1, y1] = cv.box, w = x1 - x0, h = y1 - y0;
      ob.dim = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w, h, long: Math.max(w, h), short: Math.min(w, h), tall: h > w };
    }
    return ob.dim;
  }
  const place = (g, ob, f) => ob.draw(g.at(f.x, f.y, f.s, f.rot).at(-ob.dim.cx, -ob.dim.cy));

  /** Where object `ob` would go in slot `s` ({ x, y, s, rot, r }), or null when it comes out too small. */
  function fit(ob, s, len) {
    const D = measure(ob);
    let scale, rot, along;      // along = the object's size along the slot at scale 1
    let across;                 // … and across it
    if (s.up) { rot = (s.luck - 0.5) * 0.44; scale = Math.min(2 * s.hh / D.w, 2 * s.hw / D.h); along = D.h; across = D.w; }
    else if (s.ang === null) { rot = s.turn; scale = 2 * Math.min(s.hw, s.hh) / Math.hypot(D.w, D.h); along = 0; across = 0; }
    else { rot = s.ang + (D.tall ? PI / 2 : 0) + (s.turn > PI && !(s.foot && D.tall) ? PI : 0); scale = Math.min(2 * s.hw / D.long, 2 * s.hh / D.short); along = D.long; across = D.short; }
    scale = Math.min(scale, len[1] / D.long);
    if (scale * D.long < len[0]) return null;
    // how much of the place the object fills (1 = all of it): a ruler fills a fence board, not a window
    const fill = s.ang === null ? (scale * Math.hypot(D.w, D.h) / (2 * Math.min(s.hw, s.hh))) ** 2 : scale * along * scale * across / (4 * s.hw * s.hh);
    if (fill < (s.free ? 0.3 : s.fill)) return null;
    let x = s.x, y = s.y;
    if (s.foot) { const d = s.hw - scale * along / 2; x -= Math.cos(s.ang) * d; y -= Math.sin(s.ang) * d; }   // one end stays at the foot
    return { x, y, s: scale, rot, fill, r: scale * Math.hypot(D.w, D.h) / 2, w2: scale * D.w / 2, h2: scale * D.h / 2 };
  }
  /** The grid cells an object covers at placement f (with about 1 mm around it). */
  function footprint(ob, f) {
    const cv = canvas(true), set = new Set();
    place(pen(cv, still, I), ob, f);
    const add = i => { set.add(i); set.add(i - 1); set.add(i + 1); set.add(i - W); set.add(i + W); };
    for (const sh of cv.shapes) {
      if (sh.rad) scanLine(sh.poly, sh.rad + 0.5, add);
      else if (sh.solid) { scan(sh.poly, add); scanLine([...sh.poly, sh.poly[0]], 0.6, add); }
      else scanLine(sh.poly, 0.6, add);
    }
    return set;
  }

  /** Picks n objects and their places among the slots of the scene drawn on `cv` (first pass).
   *  Returns { plan: slot number → { ob, f, tag }, found: [{ id, x, y, r }] }. */
  function hide(cv, rnd, scene, level) {
    const { n, len, gap } = LEVELS[level], taken = new Uint8Array(W * H), found = [], plan = new Map(), perHost = new Map();
    const pool = K.shuffle(rnd, OBJECTS.filter(o => !o.not.includes(scene)));
    const slots = K.shuffle(rnd, cv.slots.map((s, k) => ({ ...s, k }))).map(s => ({ ...s, turn: rnd() * TAU, luck: rnd() }));
    // if the picture is too full for all n at the usual distance, the last ones may come closer
    const done = new Set();
    for (const minGap of [gap, gap * 0.7, gap * 0.45]) for (const ob of pool) {
      if (found.length === n) break;
      if (done.has(ob)) continue;
      let best = null;
      for (const s of slots) {
        if (s.used || (perHost.get(s.host) || 0) >= s.cap || (s.want && !ob.tags.includes(s.want))) continue;
        const f = fit(ob, s, len);
        if (!f || f.x - f.r < 2 || f.y - f.r < 2 || f.x + f.r > W - 2 || f.y + f.r > H - 2) continue;
        // far from the objects already hidden; places where the object is a part of the scene come first,
        // and among them the place whose shape the object fills best
        let far = 70;
        for (const p of found) far = Math.min(far, Math.hypot(p.x - f.x, p.y - f.y));
        if (far < minGap) continue;
        const score = (far + s.luck * 30) * s.p * (0.25 + f.fill) ** 2;
        if (best && score <= best.score) continue;
        const cells = footprint(ob, f);
        let ok = true;
        for (const i of cells) {
          const id = cv.cells[i];
          if (i < 0 || i >= W * H || taken[i] || (s.free ? id > s.host || (id !== s.host && cv.keep.has(id)) : id !== s.host)) { ok = false; break; }
        }
        if (ok) best = { s, f, cells, score };
      }
      if (!best) continue;
      done.add(ob); best.s.used = true; perHost.set(best.s.host, (perHost.get(best.s.host) || 0) + 1);
      for (const i of best.cells) taken[i] = 1;
      plan.set(best.s.k, { ob, f: best.f, tag: found.length });
      found.push({ id: ob.id, x: best.f.x, y: best.f.y, r: best.f.r, part: best.s.free, fill: best.f.fill });
    }
    return { plan, found };
  }

  /* ---------- SVG ---------- */
  /** Paths as SVG; neighbouring open lines of one width go into one path. `mark(tag)` → extra style or ''. */
  function paths(items, solved) {
    let out = '', run = null;
    const flush = () => { if (run) { out += `<path d="${run.d}"${run.a}/>`; run = null; } };
    for (const it of items) {
      const hit = solved && it.tag >= 0;
      const fill = hit && it.f === '#fff' ? '#ffd23f' : it.f;
      const stroke = it.s || (hit ? '#c0252b' : '');
      const a = (fill !== 'none' ? ` fill="${fill}"` : '') + (stroke ? ` stroke="${stroke}"` : '') + (it.w !== OUT ? ` stroke-width="${f2(it.w)}"` : '');
      if (fill === 'none' && run && run.a === a) { run.d += it.d; continue; }
      flush();
      if (fill === 'none') run = { d: it.d, a }; else out += `<path d="${it.d}"${a}/>`;
    }
    flush();
    return out;
  }
  const svgOpen = (w, h, mm, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(w)} ${f2(h)}" width="${f2(mm)}mm" height="${f2(mm * h / w)}mm"${extra}>`
    + `<g fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linecap="round" stroke-linejoin="round">`;

  /** The picture of `scene` for a seed with the objects of `level` hidden in it. The scene is drawn twice:
   *  first plain, to see where objects could go; then again from the same random numbers with the chosen
   *  objects built in. The scene itself does not depend on the level. */
  function make(seed, scene, level) {
    const run = plan => { const cv = canvas(false, plan, `${seed}|${scene}`); SCENES[scene](pen(cv, dice(cv, 0), I)); return cv; };
    const first = run(null);
    const { plan, found } = hide(first, K.rng(`${seed}|${scene}|hide|${level}`), scene, level);
    const cv = run(plan);
    let uid = 0;
    return {
      W, H, found, slots: cv.slots, firstSlots: first.slots, cells: first.cells, items: cv.items,
      /** mm = printed width; solved = the objects coloured and ringed. */
      svg(mm = W, solved = false) {
        const id = `hid${++uid}${solved ? 's' : ''}${String(seed).replace(/\W/g, '')}`;
        const rings = solved ? found.map(f => `<circle cx="${f2(f.x)}" cy="${f2(f.y)}" r="${f2(f.r + 2.5)}" stroke="#c0252b" stroke-width="0.7" stroke-dasharray="2 1.6"/>`).join('') : '';
        return svgOpen(W, H, mm, ' class="hid-pic"')
          + `<clipPath id="${id}"><rect x="0.4" y="0.4" width="${W - 0.8}" height="${H - 0.8}" rx="5"/></clipPath>`
          + `<g clip-path="url(#${id})">${paths(cv.items, solved)}${rings}</g>`
          + `<rect x="0.4" y="0.4" width="${W - 0.8}" height="${H - 0.8}" rx="5" stroke-width="0.8"/></g></svg>`;
      },
    };
  }

  /** One object alone in a box of `mm` millimetres (drawn at the size of a 20 mm long object). */
  function icon(id, mm = 16) {
    const ob = OBJECTS.find(o => o.id === id), D = measure(ob), cv = canvas(false, null, 'icon'), box = 23;
    place(pen(cv, dice(cv, id), I), ob, { x: box / 2, y: box / 2, s: 20 / D.long, rot: 0 });
    return svgOpen(box, box, mm, ' class="hid-icon"') + paths(cv.items, false) + '</g></svg>';
  }

  return { W, H, LEVELS, OBJECTS, SCENES, INK, make, icon, measure, fit, footprint };
})();
if (typeof module !== 'undefined') module.exports = HID;
