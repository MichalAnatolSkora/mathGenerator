# Coordinates: N S W E (Współrzędne geograficzne)

Learning latitude (N/S of the equator) and longitude (W/E of Greenwich) on a world map, from the stars and from the
noon sun and a clock. Plain HTML + vanilla JS, no build step, seven languages (pl/en/uk/vi/fr/it/es).
The folder is still called `latitude/` (it started as N/S only).

| File | What it is |
|---|---|
| [`index.html`](index.html) | Online game |
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + "Why does it work?" page + Titanic story page + answer key |
| [`engine.js`](engine.js) | Shared: seeded random coordinates, real places, wrong answers, the map, the scales, the night sky, the noon clock, the "why" drawings |
| [`strings.js`](strings.js) | Texts in seven languages (`common`, `game`, `sheet`) |
| [`sextant-officer.jpg`](sextant-officer.jpg) | Crop of "An Officer using a Sextant" by Philip Connard (First World War, Imperial War Museum ART 5002), public domain, from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:An_Officer_using_a_Sextant_Art.IWMART5002.jpg) |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Coordinates and levels (game and worksheet)

- **Coordinates:** N / S (latitude) · W / E (longitude) · both (a point is written latitude first, then longitude: `40°N 30°W`).
- **Levels:** every 30° · every 10° · every 5° (lines every 10°, dashed parallels at 5°) · world cities (35 real places,
  rounded to a whole degree; marking accepts ±5°, since on a phone the map has about 2 px to a degree; the poles are
  left out of longitude tasks — a pole has no longitude — and of the sky and noon tasks — no ship sails there).
- 0° and 180° of longitude are written without a letter (180° east and west are the same line).

## Game

- **🔎 Read** — a dot (or a city) on a window of the world map; four answers from typical mistakes: the other side of
  the equator / of Greenwich (always one of them), counting from the pole / from 180°, a line off; with both
  coordinates also the two numbers swapped.
- **📍 Mark** — tap the map (or use the arrows) to put a parallel, a meridian or a dot; feedback per coordinate
  ("other side of the equator/Greenwich", "too far north/south/east/west"); stars 3/2/1 like the clock.
- **📏 How many degrees?** — on one side subtract, across the equator (or Greenwich) add; latitude on the cities level
  also in km (1° ≈ 111 km). With "both" the task picks latitude or longitude.
- **⭐ From the stars / ☀️ Sun and clock** — latitude: the night sky with a 0–90° arc; the Pole Star (found with the Big
  Dipper) is as high as the latitude N; in the south the long bar of the Southern Cross, followed about 4½ times, gives
  the sky's pole and the latitude S. Longitude: noon on the ship (the sun at its highest) and a chronometer keeping
  Greenwich time; 15° an hour, 1° in 4 minutes, later than 12:00 ⇒ W, earlier ⇒ E.
  After the answer, **"Why does it work?"** opens a drawing for that very task: the Earth cut through the poles, the
  star's light parallel to the axis, the horizon touching the Earth, and the two equal angles (latitude); or the Earth
  seen from above the North Pole turning 15° an hour, the ship's meridian facing the sun and Greenwich's meridian
  turned by the longitude (longitude).
- **🚢 Did you know?** — how the Titanic knew where it was: star sights at about 19:30 on 14 April 1912, dead reckoning
  through the night, a chronometer for the longitude, Boxhall's distress position 41°46′ N, 50°14′ W (the same telegram
  as in the Morse game, with a link to it), the wreck found in 1985 about 24 km away; the sky as seen there (Pole Star ≈ 42°), the sextant drawing.

Stars, streak, mode, coordinates, level and the tropics option are saved in `localStorage` (`latitude.v1`).
URL: `?mode=read|set|diff|star&axis=lat|lon|both&level=l30|l10|l5|city&story=1`.

## Worksheet

One A4 page (checked by measuring every coordinate choice, level and language): the map with points (answers beside it,
or below it for both coordinates), marking (six latitude scales / six longitude scales / four points to draw on the
same map), three skies or noon clocks (mixed for both), "further north / east?" and "how many degrees?". Each task can
be switched off. Extra pages: "Why does it work?" (the two Earth drawings with explanations), the Titanic story with
three small tasks, the answer key.
URL: `?seed=&axis=&level=&tasks=map,ladder,stars,compare,diff&lines=1&why=1&fact=1&key=1`.

## Letters in each language

International maps and GPS use N S E W. Vietnamese schools write **B** (Bắc, north), **N** (Nam, south), **Đ** (Đông,
east), **T** (Tây, west) — there "N" means *south* — and French, Italian and Spanish write **O** for west (ouest,
ovest, oeste). Each language uses its own letters; the rule lines say what the international ones are.

## The map

Hand-drawn rough coastlines (`LAND`, `LAKES` in `engine.js`) on an equirectangular projection, so parallels and
meridians are evenly spaced. Good enough to recognise continents, not for measuring coastlines.
