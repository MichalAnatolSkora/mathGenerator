# Lighthouse Keeper (Latarnik) — Morse code

Learning Morse code as a lighthouse keeper: ships in the fog send signals, the child reads and sends them.
Plain HTML + vanilla JS, no build step, five languages (pl/en/uk/vi/fr). The worksheets come first.

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | Printable A4 worksheets: a mixed page of tasks + cheat sheet, answer key, diploma |
| [`index.html`](index.html) | Online game: receive, send, dictation from a worksheet |
| [`engine.js`](engine.js) | Shared: the Morse tables, letter groups, the worksheet generator, the Morse tree, the lighthouse, dots and dashes as SVG |
| [`bank.js`](bank.js) | Words, riddles, messages from the sea and ship names in five languages; the Polish key words (mnemonics) |
| [`strings.js`](strings.js) | Texts in five languages (`common`, `game`, `sheet`) |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

The colouring task borrows the pictures of the graphic dictation (`../graphic-dictation/engine.js`, names from
`../graphic-dictation/strings.js`): the everyday pictures drawn along the grid lines that fit 12 × 10 squares.

## Alphabets

International Morse for A–Z (en, vi, fr); Polish adds Ą Ć Ę Ł Ń Ó Ś Ź Ż, French adds É, Ukrainian has its own
Cyrillic table (Ґ has no code of its own and is left out). Vietnamese is sent without marks (đ → D, ă/â → A …),
the way Vietnamese telegrams were sent; the answer key shows the normal spelling next to it. French keeps É and
drops the other accents.

## Letter groups

Letters are learned in groups (the same in the game and on the sheets); a sheet uses only the letters learned so far:

1. **E T A N I M** (Ukrainian: Е Т А Н І М) · 2. **+ S O K R** · 3. **+ U D W G L** (В for W, Г for G) · 4. the rest of the alphabet
5. the language's own letters (Polish Ą Ć …, French É, Ukrainian Є Ї), switched on separately.

Words with a letter of the newest group are picked two times out of three, so the letters learned last get practised most.

## Worksheet

One A4 page of mixed tasks; the page is filled by measuring every task at print width, so tasks never break across
pages (a task that does not fit starts the next page). The default mix fits one page for every language and letter group.

- **Younger (6–8):** telegrams as code tiles over answer boxes (the first letter written in) · riddles whose answer is
  in Morse (the answer checks itself) · sending: a letter over one empty circle per dot/dash · the **mystery picture**:
  every square holds a letter's code; a key beside the grid shows the letters to colour (yellow) and to leave white, each
  with its code, numbered steps and a worked example (one square to colour, one to leave), so the task works without
  the cheat strip. Match letters and codes is one more task to switch on.
  Words are chosen so a word fits one row of tiles in half a page.
- **Older (9–12):** one longer telegram written continuously (`/` between letters, `//` between words) · riddles ·
  sending into empty boxes · the **keeper's password**: the letters in the bold boxes of 5–6 words make a word.
- More tasks to switch on: **spot the mistake** (one letter of a word has a code one dot/dash away — another letter),
  the **Morse tree** with empty circles to fill, and a **dictation** read by a grown-up (or played by the game:
  the sheet prints a code like `AB12C-345/2`).
- **Cheat sheet on the page:** a strip with the letters of the sheet, or the Morse tree (letters not learned yet in grey);
  the tree is left out when the tree task is on the sheet.
- **Extra pages:** the full cheat sheet (the alphabet with codes, the Polish key words, the tree), the answer key, a diploma,
  and the **Morse tree poster**: the whole A4 page, every letter with its code under it, letters with 5+ signs listed
  below (also printable on its own with the "Print the tree only" button, or `?tasks=&treepage=1`).
- Same code + same settings ⇒ the same sheet.
  URL: `?seed=&level=young|older&upto=1-4&extra=1&tasks=telegram,riddle,…&aid=none|strip|tree&cheat=1&key=1&treepage=1&diploma=1`.

## Game

- **👂 Receive:** a ship sends a letter (beeps and the lighthouse lamp; vibration on Android); pick it from 4 (6 from
  group 3 on) — the wrong answers are letters with similar codes. A wrong pick shows the code and plays it slower.
- **✋ Send:** send the shown letter with two buttons (dot / dash, then Send) or one telegraph key (tap = dot,
  hold = dash; it is sent after a pause). Keyboard: `.`/`←` dot, `-`/`→` dash, space = the key, Enter = send.
- **📝 Dictation from a worksheet:** type the code printed on the sheet, play each word, type the answers, check.
- **🌳 The tree** (option): the Morse tree under the task, the way to the letter lights up (while sending, step by step).
- Letters missed more often come up more often. Speed: slow / medium / fast, with extra room between letters.
- Ships saved, streak and per-letter results are kept in `localStorage` (`morse.v1`). URL: `?mode=rx|tx|dict&upto=1-4`.
