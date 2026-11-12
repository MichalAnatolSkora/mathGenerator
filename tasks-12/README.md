# Tasks for 12-year-olds (Zadania dla 12-latków)

Printable worksheets in the style of a Polish grade 5–6 test "Liczby i działania" (Numbers and operations): the same
thirty kinds of tasks, with new numbers for every sheet code. Printable A4 worksheets only (no online game), seven
languages (pl/en/uk/vi/fr/it/es). Built on the shared [`sheet-kit`](../sheet-kit/kit.js).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 pages + answer key; lays the tasks out on pages by measuring them |
| [`engine.js`](engine.js) | The numbers, the right and wrong answers, worked out with exact fractions (language-independent) |
| [`math.js`](math.js) | Draws the engine's math text in a language: stacked fractions, decimal comma or point, · or ×, : or ÷, money |
| [`strings.js`](strings.js) | Page texts and the tasks in seven languages, with plural forms |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` — checks every answer line with its own exact evaluator |

## Tasks (in the order of the test)

| Section | Tasks |
|---|---|
| Natural numbers | 1 mental + and − (choose A/B, C/D) · 2 two prices from the sum and the difference · 3 written × and : (choose) · 4 product and quotient · 5 which expression gives the cost of the shopping · 6 which expression gives the pages left |
| Fractions and decimals | 7 fraction as a division · 8 decimal = fraction with one number missing · 9 compare a mixed number with a decimal · 10 a table of parts (beads of six colours, they add up to 1) · 11 who paid more and by how much (price per kg, 2⅓ kg against 2 kg 30 dag) · 12 match fractions with equal decimals · 13 true or false: repeating decimals (the false one is the classic slip 2/9 = 0.29…) · 14 repeating decimals in bracket notation · 15 the n-th digit after the point · 16 order decimals and mixed numbers |
| Calculating with fractions | 17 + and − with the same denominator · 18 × · 19 : · 20 the whole from a part (choose) · 21 order of operations with mixed numbers · 22 + and − of mixed numbers · 23 the mean of three distances (write the expression) |
| Decimals in everyday life | 24 brackets · 25 inches to cm · 26 order of operations · 27 curtain: half a door, 3½ times the whole door (choose) · 28 a fraction of a book (choose) · 29 a sale: price lowered by 0.3 of it (choose) · 30 price per kg → price of 250 g (choose) |

Wrong answers to choose from are typical mistakes (carrying ±100, the half door instead of the whole, the discount
instead of the new price, the part left instead of the part read), and the tests check that exactly one choice is right.

## Worksheet

- **Topic**: mixed (default, 8 tasks, two of each section, at most one big one, always one A4 page), one section,
  or the whole test (30 tasks, about 5 pages).
- **Group** A or B: the same kinds of tasks with different numbers, for two rows of desks.
- **Squared paper for working** (default on): tasks that need working get squared paper (5 mm squares); the free space
  of each page is shared among them, so a page is full but never longer than A4.
- Answer key: every calculation, money with its currency, and a sentence where the task asks for one.

Pages are made by measuring every task in a hidden A4-wide sheet (with the QR code in the head), so they fit in every
language. Money: zł, £, грн, € and đồng (Vietnamese amounts × 10 000, so 3,60 zł becomes 36.000 đồng). Decimal comma in
every language except English; × and ÷ in English, × in vi/fr/it/es, · and : in Polish and Ukrainian.
Same code + same settings ⇒ the same sheet.
URL: `?seed=&topic=mix|nat|frac|ops|dec|all&grp=A|B&work=1|0&key=1|0`.
