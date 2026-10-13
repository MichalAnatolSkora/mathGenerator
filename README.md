# Zagadki dla dzieci — logic & math puzzles for kids

A small static site of logic and math puzzles for children. Every puzzle is a plain web page
(HTML + CSS + vanilla JS, no build step, no dependencies, no network) that works from `file://`,
from any static server, and on GitHub Pages. Puzzles can be played online and/or printed as A4
worksheets with answer keys.

**Languages:** Polish (default), English, Ukrainian, Vietnamese, French. Every page has a language
dropdown; the choice is remembered in the browser and follows the links between pages. A language can
also be forced with `?lang=pl|en|uk|vi|fr`. The shared helper is [`i18n.js`](i18n.js); each page keeps its own
dictionary of strings. Cipher Detective has a second choice, the **message language**: the alphabet
and the secret messages (Polish letters incl. ą/ż, the Ukrainian Cyrillic alphabet, the Vietnamese
alphabet, French without accents) can be in a different language than the game texts (`?msg=`).

| Page | What it is |
|---|---|
| [`index.html`](index.html) | **Home page** — pick a puzzle, grouped by age: for little ones (5–8) on top, for bigger kids (8–12) below (five languages) |
| [`i18n.js`](i18n.js) | Shared language helper (language dropdown, `?lang=`, saved choice) |
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
| [`math-crossword/index.html`](math-crossword/index.html) | **Math Crossword** printable worksheet generator (+ answer key) |

Details: [`cipher-detective/README.md`](cipher-detective/README.md), [`enigma/README.md`](enigma/README.md), [`clock/README.md`](clock/README.md), [`graphic-dictation/README.md`](graphic-dictation/README.md), [`robot-chef/README.md`](robot-chef/README.md), [`math-crossword/PRD.md`](math-crossword/PRD.md).

## Run locally

```bash
python3 -m http.server 8123
```

then open <http://localhost:8123/>. Opening `index.html` directly from the file system also works.

## Adding a puzzle

Put it in its own folder with an `index.html`, load `../i18n.js` and give it a `<nav class="langs">`
plus a dictionary for the five languages, add a home link back to `../index.html` (with
`data-keep-lang`), and add a card with a screenshot (`assets/`) to the root `index.html`. On the home page the worksheet button is the
main one (blue, first) and the screenshot links to the worksheet; "Play" comes second.
