# Connect the Dots (Połącz kropki)

Printable A4 worksheets: join the numbered dots in order, go back from the last dot to the green one, and
a picture appears — then write what it is and colour it in. Paper only, no online game. Plain HTML +
vanilla JS, no build step, seven languages (pl/en/uk/vi/fr/it/es).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + answer key (built on [`../sheet-kit`](../sheet-kit/kit.js)) |
| [`engine.js`](engine.js) | Dots, levels, numbers, placing the numbers, page layout, SVG |
| [`strings.js`](strings.js) | Texts in seven languages |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

The pictures and their names come from the graphic dictation: the page loads
[`../graphic-dictation/engine.js`](../graphic-dictation/engine.js) (`DICT.PICS`, `DICT.variant`) and
[`../graphic-dictation/strings.js`](../graphic-dictation/strings.js) (`DICT_TEXT[lang].common.pics`).

## Dots and levels

A dot on every corner of the outline, plus evenly spread dots on sides longer than 3 squares. Every sheet
shows a variant (maybe mirrored, walked the other way, starting from another corner); dot 1 is bigger
and green. The level is the number of dots (not the dictation's level):

- **Easy** (10–16 dots): chair, key, T-shirt, crown, heart, fish, house, rocket, fox, diamond; cross, dove, star.
- **Medium** (18–21): cactus, table, mushroom, car, sailboat, umbrella; bell, chalice, candle, tablets.
- **Hard** (22–36): elephant, giraffe, dog, duck, robot, steam engine, castle, fir tree, cat; chapel, angel.
- **Mixed** (default): an easy picture and a medium or hard one.

The church and the wayside shrine are left out: their crosses have arms one square wide, too small for
a number next to each corner. **Themes:** everyday, Catholic motifs or all, as in the dictation.

**Counting:** 1, 2, 3… · in twos 2, 4, 6… · from a bigger number (11, 21… 71, always below 100) · in tens 10, 20, 30….

## Numbers by the dots

Each number goes outside the outline, along the corner's bisector (the outward side found from the
signed area), turning further round only when needed. A number never touches another dot, another
number or a line, and is always nearer to its own dot than to any other. Numbers are 4.6 mm high,
smaller (down to 3 mm) only when a crowded picture needs it. The test checks this on hundreds of sheets.

## Page

Two pictures on one A4 page, as big as possible: stacked or side by side, the room shared evenly or
unevenly, whichever gives the most crowded picture the most room. Above each picture its numbers
(`1, 2, 3 … 24`), below it "What is it? ____". The answer key page shows the same pictures with the
outline drawn and filled, and the name. Same code + same settings ⇒ the same sheet.
URL: `?seed=&level=mix|easy|medium|hard&count=ones|twos|from|tens&theme=basic|faith|all&key=1|0`.
