# Graphic Dictation (Dyktando graficzne)

Drawing on squared paper by arrows: `3→ 2↑ 1↗ …` — at the end the line comes back to the start and a
picture appears. Plain HTML + vanilla JS, no build step, five languages (pl/en/uk/vi/fr).

| File | What it is |
|---|---|
| [`index.html`](index.html) | Online game |
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + answer key |
| [`engine.js`](engine.js) | Shared: the pictures, variants, the steps, sums/products, arrows, squared paper SVG |
| [`strings.js`](strings.js) | Texts in five languages (`common`, `game`, `sheet`), picture names |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Pictures and levels

35 pictures, each one closed outline given by its corners (x right, y down, in squares):

- **Easy** (along the lines, up to 16 steps): cactus, chair, table, key, mushroom, T-shirt, car.
- **Medium** (along the lines, up to 28 steps): elephant, giraffe, dog, duck, robot, steam engine, castle.
- **Hard** (also diagonals ↗ ↘ ↙ ↖, corner to corner of a square): crown, heart, fish, house, sailboat,
  rocket, fir tree, umbrella, cat, fox, diamond.

**Themes:** everyday pictures (above), Catholic motifs, or all of them:

- **Easy:** cross, church bell, chapel. **Medium:** chalice, church with a tower, wayside shrine.
- **Hard:** candle, the Ten Commandments tablets, angel, dove, Star of Bethlehem, and the fish (ichthys),
  which is in both themes.

Every sheet and every game round shows a variant: maybe mirrored, walked the other way round, starting
from another corner. The test checks that every outline is closed, never touches itself, has no two
steps in a row in the same direction and has lines of at most 10 squares.

**Numbers:** plain (`3→`), as sums and differences up to 10 (`2+1→`, `5−2→`), or as products and
quotients from the times table (`2·3→`, `12:4→`; × ÷ in en). The operator signs follow the language.

## Game

The arrow pad (4 arrows, 8 on the hard level; keyboard: arrow keys, Q E Z C for diagonals): each press
draws one square. The middle of the pad shows the current step (with dots for the squares on plain
numbers). A wrong press does not draw; it says which way to go (or that the line is already long
enough). After two mistakes in one step an orange circle shows where the line ends. Stars: 3 without
mistakes, 2 for up to 3, otherwise 1. At the end the picture is coloured and named.
Stars and settings are saved in `localStorage` (`dictation.v1`). URL: `?level=easy|medium|hard&nums=plain|add|mul&theme=basic|faith|all`.

## Worksheet

One dictation per A4 page: instructions with examples, the steps as chips to cross out, squared paper
(squares up to 1 cm, the picture in the middle, a red start dot), "What is it? ____". The answer key
page shows the same grid with the picture drawn and named. Same code + same settings ⇒ the same sheet.
URL: `?seed=&level=&nums=&theme=&pic=<id>&key=1`.
