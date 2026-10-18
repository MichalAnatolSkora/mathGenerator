# The "Revolution" cipher, 1920 (Szyfr „Rewolucja” 1920)

A paper game for ages 10–14: on 12 August 1920, on the eve of the attack on Warsaw, the Red Army brought in a new
cipher called "Revolution" (Революция), a cipher of "double transformation". Break two telegrams of the Soviet 16th
Army the way Polish radio intelligence broke such ciphers, find out where the army will strike, and see a real key
card from the codebreakers' archive. Printable A4 pages only, seven languages (pl/en/uk/vi/fr/it/es), built on the
shared [`sheet-kit`](../sheet-kit/kit.js); the map, the Russian alphabet and the battle map come from
[`wisla-1920`](../wisla-1920/README.md).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | The sheet: how the cipher works, the mission, the story, a real key card, the answers |
| [`engine.js`](engine.js) | The grid, the key, enciphering and deciphering, the telegrams of a sheet (`REW.day`) |
| [`strings.js`](strings.js) | Texts in seven languages (`REW_TEXT`) and the transcription of the real card (`REW_DOC`) |
| [`engine.test.js`](engine.test.js) | `node engine.test.js`: every telegram reads back, fits one line, the opening word gives the key, on ★★★ only the true word mirrors |
| [`strings.test.js`](strings.test.js) | `node strings.test.js`: same keys in every language, every word and telegram explained |
| [`delegat-1919.jpg`](delegat-1919.jpg) | The key card of the "Delegat" cipher (1919) with Lt Kowalewski's notes, Central Military Archive, Poland; photo from M. Grajek, "Documents of Polish-Soviet War of 1919-1920 Codebreaking", HistoCrypt 2021, CC BY 4.0 |

## The cipher

Built the way the Soviet ciphers of 1919–1920 in the archive were (Grajek 2021; Kowalewski's note on "Delegat"):

1. **The grid** ("krata", 4 rows × 8 columns, the same on every sheet): a letter becomes two digits, row and
   column (И = 10). Our grid is our own: the real grid of "Revolution" is not published.
2. **The key** ("zmiennik"): 6 secret digits, then the same 6 backwards, again and again from the start of every
   telegram, added digit by digit "leaving out the tens" (no carry).
3. Groups of five digits for the radio; the open heading `РЕВОЛЮЦИЯ n` names the key.

The receiver subtracts without borrowing. Breaking it uses the clerks' real mistakes: the key restarts with every
telegram, half of it is the other half backwards (12 digits that read the same both ways), telegrams open with
usual words, and the key number is sent in clear. So a guessed opening word gives the key: cipher − word = key, and
the mirror shows whether the guess was right.

Telegrams (our wording of what the order of 12 August revealed): 1 = `ПРИКАЗ|СРОЧНО НА ВАРШАВУ`, 2 = where from
(`УДАР С ВОСТОКА`, `ИДЕМ НА ПРАГУ`, `АТАКА С ВОСТОКА`) — always from the east, arrow A on the map. At most 15 letters
(30 digits), so each telegram fits one line of 5 mm boxes.

## Levels

- **★** the key is given (Polish intelligence also captured real keys, e.g. a copy of "Delegat"): subtract and read;
- **★★** the first word of telegram 1 is written in: cipher − word = the key, check the mirror;
- **★★★** try three usual opening words (ПРИКАЗ, СРОЧНО, ДИВИЗИЯМ) under the first 12 digits; only the true one
  gives a mirrored key (tested for every key the sheet can draw).

## Pages

1. **How does the cipher work?** (option, on): the Russian alphabet, the grid, the key with a worked example
   (ДИВИЗИЯ: the three И are 10 10 10 without the key and three different pairs with it — why Kowalewski's comb no
   longer worked), the radio heading, the receiver, the clerks' mistakes, the trick "cipher − known word = key",
   a warm-up (add/subtract leaving out the tens, write a key out, decipher МИР).
2. **The mission**: the grid, the hint for the level, the key boxes (blue = 6 digits, orange = backwards), the
   trials (★★★), two telegrams with boxes for the key, the text digits and the letters, a glossary, a report with a
   map (A east / B north-west / C south).
3. **The story** (option, on): 12 August, the double-transformation cipher (Kowalewski and Mazurkiewicz according to
   G. Nowik; accounts differ), what the order said and Radzymin, the strike from the Wieprz, the clerks' mistakes,
   the archive's fate (Germany 1939, USSR 1945, back to Poland, UNESCO Memory of the World), today (one-time pad),
   our simplifications and sources.
4. **A real key from 1919** (option, on): the "Delegat" card, a transcription of the handwritten notes (marked where
   uncertain), a translation, a glossary and three tasks (who broke it, write key 51702 out, encipher и → 61).
5. **Answers** (option, on).

Same code + same settings ⇒ the same sheet. URL: `?seed=&level=easy|mid|hard&how=1|0&story=1|0&real=1|0&key=1|0`.
Every page fits one A4 sheet in all seven languages (checked by printing to PDF).
