# Zagadki dla dzieci — logic & math puzzles for kids

A small static site of logic and math puzzles for children. Every puzzle is a plain web page
(HTML + CSS + vanilla JS, no build step, no dependencies, no network) that works from `file://`,
from any static server, and on GitHub Pages. Puzzles can be played online and/or printed as A4
worksheets with answer keys.

**Languages:** Polish (default), English, Ukrainian, Vietnamese, French, Italian, Spanish. Every page
has a language dropdown; the choice is remembered in the browser and follows the links between pages. A
language can also be forced with `?lang=pl|en|uk|vi|fr|it|es`. The shared helper is [`i18n.js`](i18n.js); each page keeps its own
dictionary of strings. Cipher Detective has a second choice, the **message language**: the alphabet
and the secret messages (Polish letters incl. ą/ż, the Ukrainian Cyrillic alphabet, the Vietnamese
alphabet, French without accents, the 21-letter Italian alphabet, Spanish with Ñ) can be in a
different language than the game texts (`?msg=`).

| Page | What it is |
|---|---|
| [`index.html`](index.html) | **Home page** — pick a puzzle: a grid of cards grouped by age, for little ones (5–8) on top, for bigger kids (8–12) below, for the ambitious (14+ and adults) last, with buttons to jump to a group; one card per row on phones (seven languages) |
| [`i18n.js`](i18n.js) | Shared language helper (language dropdown, `?lang=`, saved choice) |
| [`print-qr.js`](print-qr.js) | Small QR code in the head of every printed sheet, with "More games on the website – scan me": it opens the same sheet (code, settings, language) on the site; a checkbox next to the print button leaves it off the printout. Own QR encoder, no network (`node print-qr.test.js`) |
| [`cipher-detective/index.html`](cipher-detective/index.html) | **Cipher Detective**, online game: which cipher did the spy use? — or, knowing it is Caesar, what was the shift? |
| [`cipher-detective/worksheet.html`](cipher-detective/worksheet.html) | Cipher Detective **printable worksheets** (+ guide and answer key) |
| [`enigma/play.html`](enigma/play.html) | **Young Codebreakers Academy**, online game: turn the paper wheels on screen, from the Caesar cipher to the Enigma with a mirror, and a final quiz |
| [`enigma/index.html`](enigma/index.html) | **Young Codebreakers Academy** printable worksheets: six missions from the Caesar cipher to a paper Enigma with a turning wheel and a mirror, a final report (+ cut-outs, answer key, and a full-alphabet Enigma for the keen) |
| [`clock/index.html`](clock/index.html) | **Tell the Time**, online game: read an analog clock (4 answers) or drag the hands to set it |
| [`clock/worksheet.html`](clock/worksheet.html) | Tell the Time **printable worksheets**: read the time / draw the hands (+ answer key) |
| [`graphic-dictation/index.html`](graphic-dictation/index.html) | **Graphic Dictation**, online game: draw on squared paper by arrows (3→ 2↑ 1↗…) and a picture appears; numbers can be sums or products |
| [`graphic-dictation/worksheet.html`](graphic-dictation/worksheet.html) | Graphic Dictation **printable worksheets** (+ answer key) |
| [`robot-chef/index.html`](robot-chef/index.html) | **Robot Chef**, online game: a first look at AI in 7 chapters, from counting taste points (an artificial neuron) through training the robot (perceptron) to a taste map and a tiny neural network |
| [`robot-chef/worksheet.html`](robot-chef/worksheet.html) | Robot Chef **printable worksheets**: one A4 page per chapter (+ answer keys and an unplugged class activity) |
| [`morse/index.html`](morse/index.html) | **Lighthouse Keeper** (Latarnik), online game: receive and send Morse code by sound and the lighthouse lamp, with the Morse tree lighting up the way; plays the dictation of a worksheet by its code |
| [`morse/worksheet.html`](morse/worksheet.html) | Lighthouse Keeper **printable worksheets**: a mixed page of Morse tasks (telegrams, riddles, sending, mystery picture, pairs, mistakes, password, tree, dictation) learned in letter groups (+ cheat sheet, answer key, diploma) |
| [`latitude/index.html`](latitude/index.html) | **Coordinates: N S W E**, online game: latitude (N/S), longitude (W/E) or both — read a point on a world map, mark a parallel, meridian or point, count the degrees between two places (subtract on one side, add across the equator or Greenwich), find a ship's position from the stars (Pole Star / Southern Cross) or from the noon sun and a Greenwich clock (15° an hour), with an Earth drawing that shows why the angle and the clock work; real world cities; a story about how the Titanic knew its position |
| [`latitude/worksheet.html`](latitude/worksheet.html) | Coordinates **printable worksheets** for N/S, W/E or both: one A4 page mixing map reading, marking, the night sky and noon clocks, "further north/east?" and "how many degrees?" (+ a "Why does it work?" page, a Titanic story page and an answer key) |
| [`math-crossword/index.html`](math-crossword/index.html) | **Math Crossword** printable worksheet generator (+ answer key) |
| [`picture-sudoku/worksheet.html`](picture-sudoku/worksheet.html) | **Picture Sudoku** printable worksheets: 4×4 and 6×6 sudoku with shapes, fruit, animals, colours or numbers (+ answer key) |
| [`mazes/worksheet.html`](mazes/worksheet.html) | **Mazes** printable worksheets: help the mouse to the cheese, from small to big mazes (+ answer key) |
| [`connect-dots/worksheet.html`](connect-dots/worksheet.html) | **Connect the Dots** printable worksheets: join the numbered dots and a picture appears (+ answer key) |
| [`nonograms/worksheet.html`](nonograms/worksheet.html) | **Picture Logic Puzzles** (mini nonograms) printable worksheets, 5×5 to 10×10 (+ answer key) |
| [`mirror-drawing/worksheet.html`](mirror-drawing/worksheet.html) | **Mirror Drawing** printable worksheets: colour the other half of a symmetric picture (+ answer key) |
| [`word-problems/worksheet.html`](word-problems/worksheet.html) | **Word problems** printable challenge cards: eight short stories per A4 page ("Challenge no. 1", date, faces for self-assessment or a circle for the teacher's grade) to cut out and glue into an exercise book — how many altogether, left, missing, more/fewer, several answers, equal groups; numbers to 10, 20 or 100 (+ answer key) |
| [`color-by-math/worksheet.html`](color-by-math/worksheet.html) | **Colour by Maths** printable worksheets: a pixel picture cut into fields, each with a sum or a difference to 10 or to 20; colour every field in the colour of its result and the picture appears (+ answer key) |
| [`wisla-1920/worksheet.html`](wisla-1920/worksheet.html) | **Secret Telegrams of 1920** printable paper game: read intercepted Red Army telegrams (a two-digit-number substitution, starting from ДИВИЗИЯ like Lt Kowalewski) on four levels, advise where to strike on a map, a "How does the cipher work?" page, the story of the Miracle on the Vistula and why it mattered for the West, and a photo of a real 1920 decrypt signed by Kowalewski (+ answer key) |
| [`zygalski-sheets/worksheet.html`](zygalski-sheets/worksheet.html) | **Zygalski Sheets** printable educational game: how the Polish codebreakers found the Enigma settings in 1938 with sheets full of holes — a "How did it work?" page, a real sheet recomputed with an Enigma simulation, three rounds of stacking sheets on a light table whose answer is a pair of rotor letters (with shifting on ★★★), sheets to cut out (+ answer key) |
| [`zygalski-full/worksheet.html`](zygalski-full/worksheet.html) | **Zygalski Sheets, full version** (for the ambitious, 14+ and adults): one day of intercepted messages simulated with a real Enigma I, full sets of 51 × 51 sheets (paper or film), a work table, three levels of help and the answer — find the rotor order and the ring settings as the Cipher Bureau did in 1938 |
| [`sheet-kit/`](sheet-kit/) | Shared kit of the paper-only worksheets above: controls, sheet code, A4 print layout, common texts |

Details: [`cipher-detective/README.md`](cipher-detective/README.md), [`enigma/README.md`](enigma/README.md), [`clock/README.md`](clock/README.md), [`graphic-dictation/README.md`](graphic-dictation/README.md), [`robot-chef/README.md`](robot-chef/README.md), [`morse/README.md`](morse/README.md), [`latitude/README.md`](latitude/README.md), [`math-crossword/PRD.md`](math-crossword/PRD.md), [`picture-sudoku/README.md`](picture-sudoku/README.md), [`mazes/README.md`](mazes/README.md), [`connect-dots/README.md`](connect-dots/README.md), [`nonograms/README.md`](nonograms/README.md), [`mirror-drawing/README.md`](mirror-drawing/README.md), [`word-problems/README.md`](word-problems/README.md), [`color-by-math/README.md`](color-by-math/README.md), [`wisla-1920/README.md`](wisla-1920/README.md), [`zygalski-sheets/README.md`](zygalski-sheets/README.md), [`zygalski-full/README.md`](zygalski-full/README.md).

## Run locally

```bash
python3 -m http.server 8123
```

then open <http://localhost:8123/>. Opening `index.html` directly from the file system also works.

## Adding a puzzle

Put it in its own folder with an `index.html`, load `../i18n.js` and give it a `<nav class="langs">`
plus a dictionary for the seven languages, add a home link back to `../index.html` (with
`data-keep-lang`), and add a card with a screenshot (`assets/`) to the root `index.html`. On the home page the worksheet button is the
main one (blue, first) and the screenshot links to the worksheet; "Play" comes second.

A paper-only puzzle (no online game) can use [`sheet-kit/kit.js`](sheet-kit/kit.js): the page has a
`<form id="controls">` and a `<div id="out">`, and calls `KIT.app({ store, text, groups, checks, render })`;
the kit draws the controls, keeps the sheet code and the settings (URL and localStorage) and adds the
shared texts in seven languages. See [`picture-sudoku/worksheet.html`](picture-sudoku/worksheet.html).

A printable page also loads `../print-qr.js` right after `../i18n.js`: the QR code goes into every `.sheet-head`
(or `[data-qr]`) and the checkbox before the `#printBtn` button. A page with its own settings calls
`PRINTQR.set({ seed, … })` with the same names its URL reads (the kit does this by itself).
