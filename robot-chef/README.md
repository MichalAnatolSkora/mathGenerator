# Robot Chef (Robot-kucharz): a first look at AI

A game and printable worksheets for ages 8–12. The robot chef cannot taste, so it counts. A dish is a
list of portions, and a guest's **taste card** is a list of points (weights). Points = Σ portions ×
weight. The guest likes the dish 😋 when the points reach a threshold, otherwise 🤢. That is one
artificial neuron. Plain HTML + vanilla JS, no build step, seven languages (pl/en/uk/vi/fr/it/es; the game is
"Robot cuoco" in Italian and "Robot cocinero" in Spanish).

| File | What it is |
|---|---|
| [`index.html`](index.html) | Online game: 7 chapters with tasks A/B(/C), a lesson box, a discovery after each chapter, and a finish page with a certificate |
| [`worksheet.html`](worksheet.html) | Printable A4 sheets: one per chapter (or all 7), answer key pages, an optional teacher page (unplugged activity) |
| [`engine.js`](engine.js) | Shared: ingredients, guests, seeded generators for every chapter, the perceptron, the taste map and network SVGs |
| [`strings.js`](strings.js) | Texts in seven languages (`common`, `game`, `sheet`) |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Chapters

1. **Count: will they like it?** (8+) Add up the points of the ingredients on a plate and compare
   with the guest's threshold. B: which of three plates scores most?
2. **A pinch or a handful** (8+) Portions × points, with negative points. B: cook a dish yourself. One
   disliked ingredient must go in, and the plate holds at most 6 portions. You serve it before you see the score.
3. **Taste detective** (9+) Work out a guest's hidden weights from three scored dishes (a small system
   of equations that can be solved step by step). B: which ingredient spoils the dish, from 😋/🤢 only?
4. **Training the robot** (9+) The perceptron: the robot starts with all weights 0 and says 😋 at ≥ 1
   point. The child applies the rule step by step: robot 🤢 but guest 😋 → +1 on every ingredient on the
   plate; robot 😋 but guest 🤢 → −1; right → no change. Rounds repeat until one is error-free. At the
   end the guest's real card is revealed. The generator makes sure it differs from the robot's.
5. **New dishes** (9+) A robot trained on 3 dishes is tested on new ones (always at least one surprise).
   B: questions about data, generalisation and bias.
6. **The taste map** (10+) Dishes are points (sweet, spicy) on a 0–6 grid. The rule
   `a·sweet + b·spicy ≥ t` is a straight line. Use the steppers to find weights and a threshold that
   sort every dish. The 😋 side is shaded, and wrongly sorted dishes get a red ring.
7. **The fussy princess** (10+) She likes sweet or spicy food, but not both at once (XOR). No single
   line works, so the child presses "one line can't do it". B: two helpers (sweet + spicy ≥ 3,
   ≥ 7) give 1/0. C: set the head chef's weights (e.g. 2·h1 − 3·h2 ≥ 1). That makes a small neural network.

Progress (tasks done) is saved in `localStorage` (`robotchef.v1`). URL: `?chapter=1…7|8`.

## Worksheets

Seeded like the other puzzles (same code ⇒ same sheets): `?seed=&chapter=1…7|all&key=1&teacher=1`.
The answer key repeats each page with the answers in red. The tests check that each generator gives
solvable, varied puzzles: both faces appear, the training converges within 3 rounds (≤ 15 table rows),
the map rule fits the stepper ranges, and no single line separates the XOR dishes.
