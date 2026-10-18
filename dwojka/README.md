# The Dwójka agent's dossier (Teczka agenta Dwójki)

A paper game for ages 9–13 about the methods of Polish military intelligence between the wars (Oddział II
Sztabu Głównego, "the Dwójka"): maths and logic, not ciphers (those are the
[Young Codebreakers Academy](../series.js) series). Printable A4 pages only, built on the shared
[`sheet-kit`](../sheet-kit/kit.js), seven languages (pl/en/uk/vi/fr/it/es). Card on the home page in the
"bigger kids" group, before the cipher series (screenshot `../assets/dwojka.png`).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | The sheet: "How did the Dwójka work?", four missions, the answers |
| [`engine.js`](engine.js) | The four missions' generators, the drawn trains, the schematic map of 1930s Warsaw |
| [`strings.js`](strings.js) | Texts in seven languages |
| [`engine.test.js`](engine.test.js) | `node engine.test.js`: every mission solvable and its answer right, 150 seeds × 3 levels; the same keys in every language |

## Pages

0. **How did the Dwójka work?** (option, on): what Section II was, one paragraph per method, what we simplified.
1. **Mission 1 · The railway watcher's diary** (counting): wagons seen at German stations (Allenstein, Marienburg…).
   A coach = 40 soldiers, a boxcar = 8 horses ("40 men or 8 horses"), a flat = 1 gun.
   ★ four drawn trains to count, sums; ★★ two stations' tables, multiplication; ★★★ comparison with a usual week,
   how many days to move a regiment of 3,000, which station to report.
2. **Mission 2 · Hunting the mole** (binary): every suspect got his own version of the planted message (two versions
   of each detail); the intercepted report shows the mole. ★ 4 suspects × 2 details, ★★ 8 × 3, ★★★ 16 × 4 with
   the table written as 0/1 codes, plus turning the code into a number.
3. **Mission 3 · Locate the transmitter** (geometry): a 12 × 12 lettered grid (one square ≈ 650 m) over a
   schematic map of 1930s Warsaw (the Vistula in its real course, the Kierbedź and Poniatowski bridges and two railway
   bridges, built-up areas, parks, the Powązki cemetery, the Citadel, main streets, districts, well-known places);
   listening posts stand at eight of those places (Citadel, the Prudential tower, Polytechnic, Belweder…). ★ compass direction +
   number of squares from two posts (posts sit in their places' squares); ★★ two bearings in degrees, protractor
   and ruler; ★★★ three bearings each 1.5–2° off, the lines make a small triangle in the answer square (the
   generator checks that). The transmitter always stands among houses: never in the river, a park, the cemetery or
   the Citadel.
4. **Mission 4 · Check the agent's cover story** (dates, time): counterintelligence checks a hotel guest who may be
   a German spy: passport, ticket, timetable, hotel card and an intercepted letter.
   ★ one mistake (age / passport issued after the trip / the letter's "yesterday"); ★★ one mistake found with the
   timetable (hotel arrival before the train arrives); ★★★ two mistakes and a false trail (birthday just after the
   trip, or a night train arriving the next day).
5. **Answers** (option, on).

Same code + same settings ⇒ the same sheet. URL: `?seed=&level=easy|mid|hard&how=1|0&key=1|0`.

## Sources and care

The methods are real: train watching by the Bydgoszcz station (Ekspozytura nr 3) of Section II in East Prussia
and Pomerania, canary-trap style leak tests in counterintelligence, radio direction finding of clandestine
transmitters, and the checking of agents' cover papers. Names, numbers and places in the missions are made up and
the sheet says so. The Warsaw map is schematic (coordinates of real places, streets simplified); no archive document yet.
