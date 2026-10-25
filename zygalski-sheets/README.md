# Zygalski Sheets (Płachty Zygalskiego)

Part 6 of the cipher series **Young Codebreakers Academy (Akademia Młodych Szyfrantów)**, see [`../series.js`](../series.js), for ages 10–14. "How did it work?" (step 1) compares the rotors with the paper wheels
of part 5 (The Real Enigma 1932).

An educational paper game about how the Polish codebreakers found the Enigma settings in 1938 with
Henryk Zygalski's perforated sheets. Printable A4 pages only (no online game), seven languages
(pl/en/uk/vi/fr/it/es). Built on the shared [`sheet-kit`](../sheet-kit/kit.js). The full version for teens and
adults is [`../zygalski-full/`](../zygalski-full/README.md); it uses this folder's engine.

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | The pages: "How did it work?", the game, the cut-out sheets, the answer key |
| [`engine.js`](engine.js) | Rounds (holes, shifts, the one common square), the SVG grids, the Enigma I simulation (rings, plugboard), the real sheets, one day of traffic and the solver |
| [`strings.js`](strings.js) | Texts in seven languages |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |
| [`henryk-zygalski.jpg`](henryk-zygalski.jpg) | Portrait of Henryk Zygalski, 1930s (public domain in Poland and the US; [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Henryk_Zygalski.jpg), first printed in *Nowy Dziennik*, 12 Dec 1994; photographer unknown) |

## Pages

1. **How did it work?** (option, on by default), two A4 pages read top to bottom. The first has five numbered
   steps, each with a short text and its own picture: (1) Enigma and the daily key — a secret key list with
   the rotor order, rings and plugs for each day; (2) the message key, just 3 letters: the operator's open start
   letters (RTJ), the key typed twice from there (ABC ABC → WAHWIK), then the text from ABC — pictured as the
   start of a message — and why the open RTJ gives nothing away (without the daily key nobody knows what the machine
   does at RTJ; the key itself goes out enciphered); (3) the "female": the same key letter enciphered 3 steps apart came out the same;
   (4) how a sheet maps the rotor settings: one sheet = one rotor order and one left rotor position (6 × 26 =
   156), column = right rotor, row = middle rotor, a hole where a female is possible, the grid drawn twice
   because sheets were laid shifted by the differences in the open letters — a 6 × 6 sheet with one square
   labelled as a full setting; (5) the light table, a side view of light going through the holes, which gives
   the rotor order and the rings. The second page is (6) a worked example: three fixed 4 × 4 sheets, each above
   the light table as it looks after that sheet (dots, crossed-out dots, the one dot left) and the answer
   "middle B, right C", plus a line on the ★★★ shifts. Under it, the task **find the females** (`ZYG.femaleTask`):
   how 8 messages of one day began, computed on an Enigma I (open letters grey, the 6 key letters numbered 1–6); exactly
   three have a female, one each in places 1/4, 2/5 and 3/6; the child circles them and writes how many sheets go on the
   table. The answer key lists them.
2. **The game** (one A4 page): three rounds. Each round has 3–4 sheets with holes (black dots) and an empty light
   table; rows and columns are lettered as on Zygalski's sheets (row = middle rotor, column = right rotor). The
   child dots the holes of sheet 1, then crosses out every dot where the next sheet has no hole; one dot is
   left, and its two letters are the answer ("middle C, right E"), as in 1938.
   Levels: mixed ★ ★★ ★★★ (default), easy 4×4 with 3 sheets, medium 6×6 with 4 sheets, hard 6×6 with 4 sheets
   and shifts: a sheet marked "→1 ↓2" moves 1 right and 2 down first, and a hole over the edge comes back on
   the other side (Zygalski drew the grid twice, 51 × 51, for the same reason). In ★★★ rounds each sheet also shows
   the open letters of its message (grey): its middle letter is sheet 1's plus the shift down, its right letter sheet 1's
   plus the shift right, so the arrows are the letter differences, as with the real sheets (the direction is our
   convention).
2b. **Decipher the message** (option, on by default), right after the game: the full path for kids. The last round's
   answer (middle, right) is the rotor setting of an intercepted German message — the table already has the middle
   rotor set (its letter is not printed, so the page does not give away round 3), the right one gives the start row (`ZYG.message`: Enigma I, rotors
   II I III, rings at A, no plugboard, left window A; words split by X as in 1938; one of 8 harmless messages). The
   page is a paper Enigma: one row per right rotor letter B … (n − 1 + length), each row the machine's 26-letter swap
   at windows A, middle, that letter. Letter i is read in row right + i + 1 (the rotor turns before each letter);
   a wrong start gives nonsense. Boxes for row and letter under each cipher letter, four steps, a glossary of the 19
   German words in the page language and a line for the translation; the answer key gives the start row, the
   message and its meaning. The note at the bottom says what is simplified: no message key step, no plugs, rings at A. Rotors chosen so no other rotor turns inside the table (I turns at Q, III at V).
   Before it, a worked example on a page of its own (`ZYG.paper`): HALLO from middle B, right C → BYMWJ — the
   windows before each letter (ABC → ABD … ABH), the five rows D–H of the paper Enigma with each letter's square
   marked, the five lookups, the filled boxes, and why the two Ls became M and W (the rotor turned).
3. **Cut-out sheets** (option, on by default): a 5 × 5 board with each square's two letters and 3 sheets with
   grey windows to cut out; stacked on the board, only one square shows through every window.
4. **Answer key** (option, on by default): each round's light table solved — the dots of sheet 1, every crossed-out
   dot with the number of the sheet that crossed it, the answer square in yellow — plus the females, the cut-out and the
   message answers.
5. **A real sheet** (option, on by default), last: one sheet of 1938 recomputed, 51 × 51 squares with the letters
   around and the 26 × 26 pattern framed in red; the rotor order and the left rotor position come from the
   sheet code. The holes are computed by simulating an Enigma I (rotors I–III, reflector B, rings at A): a
   square (middle rotor, right rotor) is a hole when the 1st and 4th key presses from there can turn some
   letter into the same letter, so a doubled key could show a female. Like Zygalski's sheets, it takes the
   middle rotor not to turn during the six letters. The page says it is a reconstruction,
   not a scan (no original sheets survive). Beside the texts, a portrait of Zygalski from the 1930s with its source. Under it, a five-item timeline of what happened next (Dec 1938 → May 1940).

## Rounds

The holes are drawn where they land on the light table: the answer is a hole in every sheet, each sheet
has holes in about 4 of 10 squares, any other square that is a hole in all of them loses one, and a round is kept
only if every sheet is needed (leave any one out and more than one square is left). The printed holes are
the table holes shifted back by the sheet's shift. Same code + same settings ⇒ the same sheet.
URL: `?seed=&level=mix|easy|medium|hard&learn=1|0&msg=1|0&orig=1|0&cut=1|0&key=1|0`.
Every page is ticked for printing by default; the last choice is kept in `localStorage` (`zygalski.sheet2`), and the URL wins.
