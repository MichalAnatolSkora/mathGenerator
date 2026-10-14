# Picture Sudoku (Sudoku obrazkowe)

Small sudoku for children who cannot read yet: 4×4 boards with 2×2 boxes and 6×6 boards with 2×3 boxes,
with shapes, fruit, animals, colours or numbers instead of digits. Printable A4 worksheets only (no
online game), seven languages (pl/en/uk/vi/fr/it/es). Built on the shared [`sheet-kit`](../sheet-kit/kit.js).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + answer key |
| [`engine.js`](engine.js) | Boards: a random solution, the solver that counts solutions, the puzzle, the SVG drawing |
| [`strings.js`](strings.js) | Texts in seven languages |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Boards

A solution is a fixed pattern with shuffled symbols, rows inside bands, bands, columns inside stacks and
stacks. Then squares are emptied in random order; a square stays empty only if the board still has
exactly one solution. Levels (empty squares): easy 4×4 (5), medium 4×4 (8), hard 4×4 (as many as possible,
11–12), big 6×6 (16).

**Symbols:** shapes the child can draw (circle, square, triangle, star, heart, diamond), fruit and animals
(emoji), colours (the child colours the square) or numbers (the child writes them). The instruction
follows: draw / colour / write.

## Worksheet

Default: mixed, one page of nine 4×4 boards — a row of easy, a row of medium, a row of hard ones (★ ★★ ★★★),
under the instruction and the symbols to choose from. Other levels: nine boards of one kind, or four
6×6 boards. The answer key page fills in the empty squares on a pale yellow background.
Same code + same settings ⇒ the same sheet. URL: `?seed=&level=mix|easy|medium|hard|big&set=shapes|fruits|animals|colors|numbers&key=1|0`.
