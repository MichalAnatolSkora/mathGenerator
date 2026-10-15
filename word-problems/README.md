# Word problems (Zadania z treścią — wyzwania)

Short word problems for children of 6–9 on small cards to cut out and glue into an exercise book, like the
"Wyzwanie nr 1" cards used in Polish primary schools: a grey band with the challenge number and a line for the
date, the story, room to think and a place for the grade. Printable A4 worksheets only (no
online game), seven languages (pl/en/uk/vi/fr/it/es). Built on the shared [`sheet-kit`](../sheet-kit/kit.js).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 page of eight cards + answer key |
| [`engine.js`](engine.js) | The numbers and the choice of story (language-independent) |
| [`strings.js`](strings.js) | Page texts and the stories in seven languages, with plural forms and genders |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Problems

| Kind | Example | Answer key |
|---|---|---|
| join | Natalka collected 8 chestnuts and 7 acorns. How many autumn treasures altogether? (also pages read on two days, people getting on a bus) | 8 + 7 = 15 |
| separate | Grandma baked 12 muffins, the children ate 5 (also sweets given away, sparrows flying off) | 12 − 5 = 7 |
| missing | 7 full-price tickets and some child tickets, 16 in all (also "got some more", "some crayons fell out") | 16 − 7 = 9 |
| compare | how many more? / 4 more / 4 fewer | 13 − 9 = 4 |
| open | 16 apples in 2 baskets — how many could be in each? Give a few ideas. | 1 + 15, 2 + 14, … 8 + 8 (and the other way round) |
| groups | 4 plates with 3 cookies on each | 4 × 3 = 3 + 3 + 3 + 3 = 12 |

Numbers in a story are at least 2 (so plural forms are enough), up to 10, 20 or 100; with 20 the totals are
11–20, so most sums cross ten. 21, 31… never appear, because Ukrainian would need a singular noun there.
Names are used only as the subject; Polish and Ukrainian past tenses follow the child's gender, Italian and
Spanish question words follow the noun's gender, French gets elision (d’autocollants) and a no-break space before ?.

## Worksheet

Default: numbers to 20, mixed — eight cards with every kind of problem (with numbers to 100 one "join" becomes
"groups"). One kind only: eight cards with its stories taking turns. "Challenge numbers" 1–8, 9–16 … 41–48
continue the series on the next page, with different problems. "Grading": by default the child circles one of three faces under "How did I do?" (self-assessment);
"Teacher’s grade" gives an empty circle for the teacher; "No grading" leaves it out. The instruction above the
cards says which. Cards are 2 × 4, about 91 × 56 mm, with
dashed cut lines; the page fits A4 in every language. The answer key repeats each story with its calculation.
Same code + same settings ⇒ the same sheet. URL: `?seed=&range=10|20|100&type=mix|join|separate|missing|compare|open|groups&start=1|9|17|25|33|41&grade=self|teacher|none&key=1|0`.
