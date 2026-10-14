# Mirror Drawing (Dokończ w lustrze)

Symmetry on squared paper: one half of a pixel picture is coloured in, a red dashed line is the mirror, and the
child colours the matching squares on the other side. Printable worksheets only (no online game). Plain HTML +
vanilla JS on the shared [sheet kit](../sheet-kit/kit.js), no build step, seven languages (pl/en/uk/vi/fr/it/es).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + answer key |
| [`engine.js`](engine.js) | The pictures (drawn as text), random monsters, task types, page plans, the SVG |
| [`strings.js`](strings.js) | Texts in seven languages, picture names |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Pictures

31 hand-drawn pictures, one text line per row, one letter per square (`r` red, `g` green, `k` black, `.` empty…):

- **Small, 8 wide** (easy): heart, toadstool, ladybird, strawberry, ice cream, crown, cat, house, cross, tulip, car, frog.
- **Medium, 8–12 wide:** butterfly, owl, rocket, castle, bee, snowman, penguin.
- **Large, 14 wide:** robot, Christmas tree, teddy bear, church.
- **Two mirrors** (symmetric both ways): snowflake, sun, four-leaf clover, star, diamond, sweet.
- **Horizontal mirror:** fish, plane, and the rocket, butterfly, bee and ladybird turned on their side.

**Monsters:** random creatures (a body of random width, maybe antennae and an arm, legs, eyes, a mouth), and for
two mirrors random kaleidoscope patterns. Endless variety; on the sheet "Give it a name: ____".

## Levels

- **Easy:** 4 small pictures, the left half given, squares 10 mm.
- **Medium:** 2 bigger pictures, either half given, squares 7.5–9 mm.
- **One big picture:** a large picture on a whole page, squares 10 mm.
- **Hard:** a horizontal mirror (top or bottom given) and two mirrors (a quarter given, colour three quarters).
- **Mixed** (default): an easy one, a two-mirror one and a medium one on one page.

Options: pictures / monsters / both; "given part in one dark colour" for black-and-white printers; the answer key
page shows the whole pictures with their names. Same code + same settings ⇒ the same sheet.
URL: `?seed=&level=mix|easy|medium|big|hard&kind=pics|monsters|both&mono=1&key=1`.

The test checks that every picture is rectangular, uses known colours and is exactly symmetric, that monsters are
symmetric and not empty, that every picture fits its box on A4 with squares of at least 9 mm (easy) or 7 mm, that
the same seed gives the same sheet, and that every language has every text and every picture name.
