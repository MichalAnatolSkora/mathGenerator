# Colour by maths (Kolorowanka z działaniami)

A pixel picture is cut into fields of a few squares; every field has a sum or a difference. The legend says
which result means which colour (e.g. 7 = red, 9 = white — leave it). Work out every field, colour it, and the
picture appears: a house, a rocket, an owl, a ladybird… Plain HTML + vanilla JS, no build step, seven languages
(pl/en/uk/vi/fr/it/es). Printable worksheets only, no online game. For ages 5–7.

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + answer key (built on [`../sheet-kit`](../sheet-kit/kit.js)) |
| [`engine.js`](engine.js) | The pictures, cutting them into fields, the sums, the picture as SVG |
| [`strings.js`](strings.js) | Texts in seven languages, colour and picture names |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Pictures

15 pictures drawn by hand, 10–12 squares wide, up to 14 tall, 4–7 colours each (white counted), each maybe
mirrored left↔right on the sheet: house, rocket, fish, toadstool, flower, ladybird, car, apple, owl, sailing
boat, tree, ice cream, frog, cat, butterfly.

## Fields and sums

- The background is cut into fields too ("white — leave it"), so the shape only shows once everything is worked out.
- A field is one colour, joined side by side: 3–5 squares (background 5–8) with **big fields**, 2–3 (background 3–5)
  with **small fields**. The sum is written in the square nearest the middle of its field.
- Every colour gets its own result, random on every sheet. **Adding to 10** (results 4–10), **adding and taking
  away to 10** (2–10), **adding to 20** (8–20), **adding and taking away to 20** (5–20); no zeros, and to 20 no
  "+1"/"−1" sums when there are others. Neighbouring fields never show the same sum: a colour gets a result with
  enough different sums for its fields' neighbours.

## Worksheet

One picture per A4 page (1, 2 or 3 pictures, all different). On top the instruction and the legend: the result
big, a colour swatch and the colour's name (so it also works printed in black and white). Under the picture:
"What is it? ____". The answer key page shows the coloured pictures with their names and legends.

Same code + same settings ⇒ the same sheet. URL: `?seed=&math=add10|mix10|add20|mix20&fields=big|small&count=1|2|3&key=1|0`.
