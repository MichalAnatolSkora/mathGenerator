# Mazes (Labirynty)

Printable A4 mazes for little ones: draw the way from the character to its goal. Plain HTML + vanilla JS,
no build step, seven languages (pl/en/uk/vi/fr/it/es). Built on the shared worksheet kit (`../sheet-kit/`).
There is no online game.

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + answer key |
| [`engine.js`](engine.js) | The mazes (square and round), the solution, the SVG drawing, the themes |
| [`strings.js`](strings.js) | Texts in seven languages: levels, characters, one goal line per character |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Mazes

Every maze is a perfect maze: the corridors are carved by a random depth-first walk (the "recursive
backtracker"), which gives long winding corridors and few short dead ends; every cell can be reached and
there is exactly one way between any two cells. The entrance and the exit are picked among the pairs that
are far apart along the corridors (at least 80 % of the longest way), so the way is never a short cut.

- **Square:** w×h cells, the entrance in the top wall, the exit in the bottom wall.
- **Round:** rings around a middle disc (6 cells in the first ring, a ring doubles its cells when they would
  get too long). The entrance is in the outer wall near the top, the goal sits in the middle.

Walls are 0.85 mm with round ends; the character stands over the entrance, the goal under the exit (or in
the middle). The test checks that every maze is perfect (n−1 open ways, all cells reached), that the way
goes from the entrance to the exit through open ways, the corridor widths and that the same seed gives the
same maze.

## Worksheet

Levels (four mazes in a 2×2 grid on one A4 page, except the giant one):

- **Mixed** (default): 5×5, 7×7, 9×9 and 12×12, ★ to ★★★★. Corridors 17 mm down to 7 mm.
- **Small 5×5**, **Medium 8×8**, **Large 12×12**: four of the same size.
- **One giant maze:** 20×24 on the whole page (corridors ≈ 8.7 mm).
- **Round:** 4, 5, 6 and 7 rings.

**Characters:** mouse → cheese, bee → flower, dog → bone, bunny → carrot, rocket → planet,
squirrel → nut, bear → honey, monkey → banana, cat → fish, car → home; "mixed" gives every maze another one.
Each maze has its own line ("Help the mouse get to the cheese."). The answer key page shows the same mazes
with the way drawn in red. Same code + same settings ⇒ the same sheet.
URL: `?seed=&level=mix|small|medium|large|big|round&theme=mix|mouse|bee|…&key=1|0`.
