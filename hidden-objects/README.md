# Hidden Objects (Ukryte przedmioty)

Printable A4 worksheets: a drawn scene with 8, 12 or 16 objects hidden in it. The things to find stand on
the margins of the picture (a column on the right, a row below); the child finds them in the picture and
colours them in. Every code gives another picture. Plain HTML + vanilla JS, no build step, no image files:
every line is drawn by code. Seven languages (pl/en/uk/vi/fr/it/es). Built on the shared worksheet kit
(`../sheet-kit/`). There is no online game.

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 worksheet + answer page |
| [`engine.js`](engine.js) | The pen (hand-drawn lines), the grid that knows what is seen where, hiding the objects, SVG |
| [`objects.js`](objects.js) | The 67 things to find, each drawn with the pen |
| [`scenes.js`](scenes.js) | The four pictures (forest, farm, under the sea, space) and everything in them |
| [`strings.js`](strings.js) | Texts in seven languages, the names of the objects |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## How a picture is made

**The pen.** A shape is a handful of points in millimetres. The pen joins them with smooth curves (a point
can be marked as a sharp corner), moves every point a little and bends long straight edges, so everything
looks drawn by hand, in one style. Closed shapes are white inside, so near things cover far things; round
blobs can melt into one outline (clouds, tree crowns, wool) and fat lines into branches (coral, tentacles).

**The scene** is built like a stage set from the back to the front: sky, far hills, the ground, then the
things on the ground sorted by how near they are (nearer = lower = bigger = drawn later). What stands
where, how many and how big comes from the code of the sheet, so the picture is new every time. Animals
are kept free: nothing may stand in front of them.

**Hiding.** While it is drawn, every thing offers places for an object, of two kinds:

- *standing in for a part of the thing* — a board or a picket of a fence, a brace of the barn door, the
  rail of a ladder, the bars of a window, the hub of the tractor wheel, the weather vane, a sail of the
  windmill, the middle of a sunflower, a cabbage in its row, a towel on the line, a reed, a leaf of a
  spray, a branch, a fruit, a mushroom in its group, a ray of the sun, the shell of a snail; under the sea
  the bell of a jellyfish, a fish of a shoal, the body of a fish, a frond of seaweed, a branch of coral,
  the periscope or a window of the submarine, a bubble, the catch on a fishing line; in space the dome of
  the flying saucer and what its beam lifts, the planet inside its ring, the window and the tip of the
  rocket, a solar panel, the head of a comet, a wheel or the mast of the rover, the flag pole…
  Some places only take a fitting shape (`round`, `dome`, `cone`): a button or a clock for a wheel, an
  umbrella or a bell for a jellyfish.
- *lying on the thing* — in the bark of the big tree in the foreground (a clean shape among the bark
  lines), among the leaves of a crown or a bush, between the planks of the barn, on a turtle's shell, in
  the grass, half under the sand.

The picture is drawn **twice** from the same random numbers. The first, plain pass paints every closed
shape on a 1 mm grid with the number of its thing, so the engine knows what is seen at each spot. It then
picks the objects and their places: the object must fit the place at the size of the level, lie wholly on
its host (or, for a stand-in, not be covered by anything nearer and not cover an animal), stay inside the
frame and keep away from the other objects. Places where the object is a part of the scene are preferred,
and among them the place whose shape the object fills best: a ruler fills a fence board (about 90 % of it)
but only a quarter of a window, so it goes into the fence and the tent into the window. A stand-in that
would fill less than 30 % of its place is not allowed at all. Fences are kept free like the animals —
nothing stands in front of them — so their boards stay in sight.
The second pass draws the scene again, and now each chosen place draws its object at once, with the same
pen — the thing leaves out the part the object stands in for (no board where the ruler is) and goes on
drawing over it (leaf marks, grain, grass in front, pegs, window bars). So the object is built into the
picture, not laid on top of it. The scene itself is the same on every level.

To make the search harder the scenes are full of things that look alike: twigs, reeds, boards, pebbles,
bubbles, mushrooms, leaves.

## Worksheet

- **Picture:** random (the code picks it), forest, farm, under the sea, space.
- **Level:** easy — 8 objects 12–19 mm long; medium — 12 objects 9.5–15 mm; hard — 16 objects 8–12.5 mm,
  closer to one another.
- **List without pictures:** only the names, as a checklist (harder).
- The picture is 160 × 200 mm; the list is in the order of the alphabet, so it gives no place away.
  The answer page shows the same picture with the objects yellow and ringed in red.
- Objects that would be at home in a scene are never hidden there (no fish in the sea, no star in space,
  no mushroom in the forest).

Same code + same settings ⇒ the same sheet.
URL: `?seed=&scene=mix|forest|farm|sea|space&level=easy|medium|hard&words=1|0&key=1|0`.

## Tests

`node engine.test.js`: 40 codes × 4 scenes × 3 levels — all objects of the level are hidden, all
different, of the right size, inside the frame and apart; a stand-in fills at least 30 % of its place;
both passes offer the same places; the same code
gives the same picture and another code another one; the scene does not change with the level; texts and
all 67 names in seven languages. Printing to PDF was checked for every language × scene × level (and the
list without pictures) with three codes: the sheet and the answer page are one A4 page each.

## Adding things

- **An object:** `O('id', g => { … }, ['scenes to stay out of'], 'tags')` in `objects.js`, about 20 units
  long, and its name in every language in `strings.js` (same position in `IDS` and in each list).
- **A thing of a scene:** a function that draws at size 1 with its foot at (0, 0). Offer places with
  `g.slot(…)` / `g.stand(…)` and write `if (!g.stand(…)) drawTheUsualPart();`. Work out all random numbers
  before such an `if`, so both passes draw the same scene (the test checks that).
