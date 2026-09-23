# Zagadki dla dzieci — logic & math puzzles for kids

A small static site of logic and math puzzles for children. Every puzzle is a plain web page
(HTML + CSS + vanilla JS, no build step, no dependencies, no network) that works from `file://`,
from any static server, and on GitHub Pages. Puzzles can be played online and/or printed as A4
worksheets with answer keys.

**Languages:** Polish (default), English, Ukrainian, Vietnamese. Every page has flag buttons; the
choice is remembered in the browser and follows the links between pages. A language can also be
forced with `?lang=pl|en|uk|vi`. The shared helper is [`i18n.js`](i18n.js); each page keeps its own
dictionary of strings. Cipher Detective also switches the **alphabet and the secret messages** with
the language (Polish letters incl. ą/ż, the Ukrainian Cyrillic alphabet, the Vietnamese alphabet).

| Page | What it is |
|---|---|
| [`index.html`](index.html) | **Home page** — pick a puzzle (four languages) |
| [`i18n.js`](i18n.js) | Shared language helper (flags, `?lang=`, saved choice) |
| [`cipher-detective/index.html`](cipher-detective/index.html) | **Cipher Detective**, online game: which cipher did the spy use? |
| [`cipher-detective/worksheet.html`](cipher-detective/worksheet.html) | Cipher Detective **printable worksheets** (+ guide and answer key) |
| [`math-crossword/index.html`](math-crossword/index.html) | **Math Crossword** printable worksheet generator (+ answer key) |

Details: [`cipher-detective/README.md`](cipher-detective/README.md), [`math-crossword/PRD.md`](math-crossword/PRD.md).

## Run locally

```bash
python3 -m http.server 8123
```

then open <http://localhost:8123/>. Opening `index.html` directly from the file system also works.

## Adding a puzzle

Put it in its own folder with an `index.html`, load `../i18n.js` and give it a `<nav class="langs">`
plus a dictionary for the four languages, add a home link back to `../index.html` (with
`data-keep-lang`), and add a card with a screenshot (`assets/`) to the root `index.html`.
