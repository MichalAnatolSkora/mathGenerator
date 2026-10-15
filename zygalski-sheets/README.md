# Zygalski Sheets (Płachty Zygalskiego)

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

## Pages

1. **How did it work?** (option, on by default): Enigma and Rejewski, Różycki, Zygalski; the doubled message
   key and the "females"; the sheets (26 × 26, holes cut by hand, 156 sheets); the light table; a side-view
   picture of light going through the holes; what happened next (Dec 1938 → May 1940); a table of what in
   1938 maps to what on our sheet.
2. **A real sheet** (option, on by default): one sheet of 1938 recomputed, 51 × 51 squares with the letters
   around and the 26 × 26 pattern framed in red; the rotor order and the left rotor position come from the
   sheet code. The holes are computed by simulating an Enigma I (rotors I–III, reflector B, rings at A): a
   square (middle rotor, right rotor) is a hole when the 1st and 4th key presses from there can turn some
   letter into the same letter, so a doubled key could show a female. Like Zygalski's sheets, it takes the
   middle rotor not to turn during the six letters. The page says it is a reconstruction,
   not a scan.
3. **The game** (one A4 page): three rounds. Each round has 3–4 sheets with holes (black dots) and an empty light
   table; rows and columns are lettered as on Zygalski's sheets (row = middle rotor, column = right rotor). The
   child dots the holes of sheet 1, then crosses out every dot where the next sheet has no hole; one dot is
   left, and its two letters are the answer ("middle C, right E"), as in 1938.
   Levels: mixed ★ ★★ ★★★ (default), easy 4×4 with 3 sheets, medium 6×6 with 4 sheets, hard 6×6 with 4 sheets
   and shifts: a sheet marked "→1 ↓2" moves 1 right and 2 down first, and a hole over the edge comes back on
   the other side (Zygalski drew the grid twice, 51 × 51, for the same reason).
4. **Cut-out sheets** (option, off by default): a 5 × 5 board with each square's two letters and 3 sheets with
   grey windows to cut out; stacked on the board, only one square shows through every window.
5. **Answer key** (option, on by default).

## Rounds

The holes are drawn where they land on the light table: the answer is a hole in every sheet, each sheet
has holes in about 4 of 10 squares, any other square that is a hole in all of them loses one, and a round is kept
only if every sheet is needed (leave any one out and more than one square is left). The printed holes are
the table holes shifted back by the sheet's shift. Same code + same settings ⇒ the same sheet.
URL: `?seed=&level=mix|easy|medium|hard&learn=1|0&orig=1|0&cut=1|0&key=1|0`.
