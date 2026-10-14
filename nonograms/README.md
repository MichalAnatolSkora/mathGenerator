# Mini nonograms (Obrazki logiczne)

Picture logic for little ones: the numbers left of each row and above each column say how many squares in
a row to colour (several numbers = several groups with at least one empty square between them). Colour the
right squares and a picture appears. Plain HTML + vanilla JS, no build step, seven languages
(pl/en/uk/vi/fr/it/es). Printable worksheets only, no online game.

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + answer key (built on [`../sheet-kit`](../sheet-kit/kit.js)) |
| [`engine.js`](engine.js) | The pictures, clues, line solver + backtracking, the puzzle as SVG |
| [`strings.js`](strings.js) | Texts in seven languages, picture names |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Pictures

53 pictures drawn by hand, each maybe mirrored left↔right on the sheet:

- **5×5** (27): heart, house, arrow, face, cross, boat, cat, star, tulip, cup, umbrella, bell, rocket, ladder,
  chair, table, T-shirt, crown, ghost, sun, moon, apple, bow tie, hourglass, window, mushroom, duck.
- **8×8** (12): mug, Christmas tree, house, rocket, cat, sailing boat, castle, robot, bunny, mushroom, ice cream, star.
- **10×10** (14): butterfly, elephant, owl, frog, strawberry, snowman, penguin, tree, anchor, plane, teddy bear,
  fish, sunflower, cupcake.

The test checks that every picture (and its mirror) has exactly one solution, that line solving alone gets
there (no guessing), and that it has at least one line the clue fills by itself (`5`, `2 2`, `1 1 1` in 5).

## Worksheet

**Levels:** mixed (three 5×5, one 8×8, one 10×10 — the default), six 5×5, four 8×8 or four 10×10, always one
A4 page. Squares 8 mm (5×5), 7–8 mm (8×8), 6 mm (10×10); a thick line every 5 squares; clue bands in
alternating shades so a row's numbers are easy to follow. On top: the rule and a worked example
(`3` = three squares side by side, `1 1` = one, a gap, one), "put a dot in a square that stays empty".
Under each puzzle: "What is it? ____".

**Help for little ones** (on by default): the lines the clue fills alone are yellow with a ★ ("start here"),
and a few squares (2 / 3 / 4) are already coloured grey.

The answer key page shows the solved pictures, smaller, with their names. Same code + same settings ⇒ the same
sheet. URL: `?seed=&level=mix|5|8|10&help=1|0&key=1|0`.
