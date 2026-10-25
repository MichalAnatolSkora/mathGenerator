# Zygalski Sheets, full version (Płachty Zygalskiego — pełna wersja)

Part 7 of the cipher series **Young Codebreakers Academy (Akademia Młodych Szyfrantów)**, see [`../series.js`](../series.js). The instructions page has a "First time?" box that sends beginners to part 6, the children's version.

For the ambitious (teens and adults): find a day's Enigma key the way the Polish Cipher Bureau did in autumn
1938, with Henryk Zygalski's perforated sheets. Printable A4 pages only, seven languages (pl/en/uk/vi/fr/it/es),
built on the shared [`sheet-kit`](../sheet-kit/kit.js). The Enigma simulation, the sheets and the solver live in
[`../zygalski-sheets/engine.js`](../zygalski-sheets/engine.js) (tested there with `node engine.test.js`); the
children's version is [`../zygalski-sheets/`](../zygalski-sheets/README.md).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | The pack: instructions, the day's traffic, the work table, the sheets, the answer |
| [`strings.js`](strings.js) | Texts in seven languages |
| [`strings.test.js`](strings.test.js) | `node strings.test.js`: every language has the same keys |
| [`play.html`](play.html) | The online light table: the same day on screen, the sheets stacked by the computer |
| [`play-strings.js`](play-strings.js) | Texts of the online game in seven languages (the six steps, work-table columns and answer labels come from `strings.js`) |
| [`play-strings.test.js`](play-strings.test.js) | `node play-strings.test.js`: same keys in every language, every text renders, the light gives the day's rings |
| [`enigma-how.js`](enigma-how.js) | "How did Enigma work?": the drawing of the current's way, the parts of the machine, how a message was sent, Rejewski's wiring and the plugboard, with their tasks, for the pack and the game |
| [`enigma-strings.js`](enigma-strings.js) | Its texts in seven languages |
| [`enigma-how.test.js`](enigma-how.test.js) | `node enigma-how.test.js`: same keys in every language, every text renders, the example does what the texts say |

## The day

`ZYG.day(rnd)` draws a daily key — rotor order (I–III in any order), ring settings, 6 plugboard pairs,
reflector B — and messages: a ground setting sent in the clear and the doubled message key enciphered from
it (6 letters). Ground settings where the middle rotor would turn during the key are skipped (the real sheets
assumed it does not turn). Messages are added until their females (the same letter in places 1/4, 2/5 or
3/6) single out exactly one answer over all 6 rotor orders × 26 trials, checked by brute force; that answer is
always the daily key (tested). A day has about 80–130 messages and 10–16 females.

## The method (as on the instructions page)

For a female in a message with window letters (L, M, R) and type t (0, 1, 2): R′ = R + t. The first female is
the reference. Each other female needs sheet s + (L − L₁) for trial s, laid so that its square
(row M − M₁, column R′ − R′₁) lies on the corner square A/A of the first sheet's frame. Light at (row y,
column x) gives the rings: left L₁ − s, middle M₁ − y, right R′₁ − x. The plugboard does not change where
females can appear, which is why the sheets work without it.

## How did Enigma work? (`enigma-how.js`)

For readers who have never seen an Enigma. Every letter shown is computed with `ZYG.machine` from one example daily key
(rotors II I III, rings KUM, plugboard AQ BT CF DL EY GH — not the pack's day), never typed:

- **Part 1, the machine**: the intro, a drawing of one key press (`ZYG.machine(…).trace`): keys and lamps, plugboard,
  the three rotors with all their wires faint and the window letters, the reflector's 13 pairs; the way there in red,
  back in blue, the letter after every part written in the gaps; the caption says the window letters are the
  rotors' positions (26 each, like the digits on a lock), not letters of the text. Then the rotor, the reflector (deciphers = enciphers,
  no letter to itself), the stepping (A six times from ADT: WUNUCZ, the middle rotor turns at the 3rd press), the
  plugboard and the ring (a picture: ring C, window E, wires at C; core = window − ring).
- **Part 2, how a message was sent in 1938**: the daily key as a row of a key table, the sender's five steps (ground
  PKE, message key LKW typed twice → KIJKYL, then the text from LKW), what the radio carried, what of the start was
  secret (only PKE in the clear, and it says nothing without the rotor order, rings and plugboard; KIJKYL is already
  cipher; why the key was doubled — Morse errors — and that this gave the females; no clear letters before
  15 September 1938; no doubled key from May 1940), the receiver, the weak
  point (KIJKYL has K in places 1 and 4: a female, with the six presses in a table), 15 September 1938, the count
  of settings (≈ 7 · 10¹⁸).
- **Part 3, how Rejewski found the wiring (December 1932)**: one ground setting for a whole day (1932), chains of
  letters (place 1 → place 4), the theorem (chains come in pairs of equal length, because the reflector swaps in
  pairs), the equations, the Schmidt documents via Bertrand, the entry-drum guess (QWERTZ ✗, A→A ✓), two quarters →
  two rotors on the right, AVA doubles, reflector B and rotors IV–V; then, full width, the day's fingerprint: chain
  lengths do not depend on the plugboard, so the cyclometer catalogue of 105,456 settings gave the daily rotor
  setting until 15 September 1938.
- **Task: Rejewski's chains** (a page of its own in the pack, an exercise with inputs in the game): 30 indicators of
  one 1932-style day (`DAY32`: ground setting BLA on the example machine, key first letters covering A–Z), a worked
  start (message 01 AHF TMQ: under A write T, message 14 TEL IOP: under T write I, …), why it works, the A–Z table
  to fill, lines for the chains and their lengths. Answer: (ATIMJR) (BGZEVNC) (DYUPQOL) (FKWSHX), lengths 7, 7, 6, 6;
  it is on the answer page (and behind "Show the chains" in the game).
- **Part 4, the plugboard**: the commercial Enigma had none, the army added it in 1930; a drawing of the front panel
  (`plugSvg`: 26 sockets in keyboard order, two holes each, the example's 6 cables, A–Q in red) and the whole plugboard
  as a strip (letter → after the plugboard); the plug with two pins (crossed wires: A–Q swaps both ways, an empty
  socket goes straight), twice on the way (the drawn press: A → Q … W → lamp W), still in pairs, how many cables (6 from
  1930, 5–8 from 1 Oct 1936, 7–10 from 1 Jan 1939), how many ways (`ways(n)` = 26! / ((26 − 2n)! · n! · 2ⁿ), the most
  at 11 cables), the weak point (it only renames letters: females, chains and sheets ignore it); then, full width, how
  the Poles found the cables: the page 2 message typed on a double without cables, the right letters green and E → Y
  (yellow) as the hint for cable E–Y.
- **Task: through the plugboard** (a page of its own, inputs in the game): the drawn press (windows ADU), the 13 pairs
  the rotors and reflector make there without cables, the cables; for the keys A D E K M O Q W write to the rotors →
  from the rotors → lamp (A filled in: A → Q → W → W), compare A/W and O/Q (the pairs survive); then the twin cable:
  O–W instead of A–Q gives the same lamps at this press (tested: not at the next one), so one press cannot tell
  cables apart. The answer (`plugAnswer`) is on the answer page and behind "Show the answer" in the game.

## Pages

0. **How did Enigma work?** (option, on): parts 1–4 and the two tasks above, six A4 pages in every language.
1. **Instructions** (option, on): what you have, what you look for, six steps, how to stack the sheets
   (film on a window, or pencil on paper), the simplifications.
2. **Intercepted messages**: the day's traffic in four columns; with help, the females are marked.
3. **Work table**: one row per female (blank, or filled in with help) and the result lines; the third help
   level also names the right rotor order and trial.
4. **Sheets**: the day's set (26 pages, default), all 6 sets (156 pages) or none; 51 × 51 squares, the
   26 × 26 pattern framed in red. "Film" prints everything black but the holes, for transparencies.
5. **Answer** (option, on): the daily key, the filled table, how the light gives the rings, and one message
   deciphered with the key as a check.

Same code + same settings ⇒ the same pack. URL:
`?seed=&level=full|females|trial&sheets=day|all|none&how=1|0&intro=1|0&film=1|0&key=1|0`.

## Online light table (`play.html`)

The same day as the pack: `ZYG.day(KIT.rng(code + '|day'))`, exactly as `worksheet.html` draws it, so a
printed pack and the game with the same code show the same messages and sheets. The code comes from
`?seed=`, else the last game, else the last printed pack (`localStorage`), else a new one; "🖨️ Print this
pack" opens `worksheet.html?seed=` with it. Progress is kept per code in `localStorage` (`zygalskiFull.play`).

0. **How did Enigma work? Try the machine** (folds; open by default, the choice kept in `zygalskiFull.enigmaOpen`):
   the example Enigma to type on — window letters with ▲ ▼ and a line on what they are (ring letters A–Z, one of 26
   positions, not letters of the text; a key press turns the right one: ADT → ADU), the drawing of the last key press (the windows that
   turned are marked), a QWERTZ keyboard (or the computer's own while the card has the focus), what was typed and what
   lit, a suggestion to repeat the sender's example; parts 1 and 2, part 3 with the chain task and part 4 with the
   plugboard task fold out below. On a phone the drawing scrolls
   sideways and starts at the keys.
1. **Find the females**: tap the messages with the same letter in places 1/4, 2/5 or 3/6 (checked against
   `ZYG.females`; a wrong tap says why and counts as a mistake; "show all" is the help).
2. **Light table**: pick a rotor order (6 sets) and step the trial s (buttons or ← →). The page lays the
   sheets with `ZYG.layout`: female j gets sheet s + ΔL, shifted by its row and column, and the first sheet's
   26 × 26 frame lights only where every sheet has a hole. Sheets can be taken off and put back one at a time
   to watch the light shrink. A hint names the right set, then the trial. The work table (with the sheet
   letter for this trial) folds out under the grid.
3. **Rings**: when exactly one square lights with all sheets on, its row and column labels light up; enter
   L₁ − s, M₁ − y, R′₁ − x (checked against the day's rings; a letters-as-numbers crib folds out).
4. **Daily key**: rotor order, trial, light, rings with the subtraction, plugboard, and one message key
   deciphered with `ZYG.machine` (any message, one at a time).
