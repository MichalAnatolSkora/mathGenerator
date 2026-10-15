# Zygalski Sheets, full version (Płachty Zygalskiego — pełna wersja)

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

## Pages

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
`?seed=&level=full|females|trial&sheets=day|all|none&intro=1|0&film=1|0&key=1|0`.
