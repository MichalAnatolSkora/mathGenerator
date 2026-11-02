# Secret Telegrams of 1920 (Tajne depesze 1920 — Cud nad Wisłą)

Part 3 of the cipher series **Young Codebreakers Academy (Akademia Młodych Szyfrantów)**, see [`../series.js`](../series.js). "How does the cipher work?" calls the day's key a mixed-up alphabet as in part 2, only with numbers, and
says the "Revolution" cipher is broken in part 4.

A paper game for ages 9–12: read intercepted Red Army telegrams from August 1920 the way Polish radio
intelligence did before the Battle of Warsaw, advise the Commander-in-Chief where to strike, and learn why the
"Miracle on the Vistula" mattered for the whole West. Printable A4 pages only, seven languages
(pl/en/uk/vi/fr/it/es), built on the shared [`sheet-kit`](../sheet-kit/kit.js).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | The sheet: how the cipher works, the mission, the story, a real decrypt (photo + transcription), the answers |
| [`engine.js`](engine.js) | Telegrams, the day's key, the solvers used by the tests, the map (SVG; the ["Revolution" cipher](../rewolucja-1920/README.md) sheet draws its own arrows and units on it), the real decrypt's text |
| [`strings.js`](strings.js) | Texts in seven languages |
| [`engine.test.js`](engine.test.js) | `node engine.test.js`: keys, the ДИВИЗИЯ pattern, every level solvable (★★★★ with exactly one answer, also with the bigger dictionary), the counts |
| [`strings.test.js`](strings.test.js) | `node strings.test.js`: same keys in every language, every word and telegram explained |
| [`depesza-1920.jpg`](depesza-1920.jpg) | Photo of a real "Tłumaczenie szyfrogramu" of 25 July 1920, signed by Jan Kowalewski (public domain; Archive of the Piłsudski Institute of America, coll. 3, vol. 1, p. 29, via poznajhistorie.org) |

## The cipher and the levels

A simple substitution: every letter of the Russian alphabet (32 letters, Ё written as Е) becomes a two-digit
number, all different (no 20, 30…). The same code gives the same key and the same telegrams on every level.
Three telegrams, all with the day's key:

1. where the 4th Army goes (Płock / Włocławek / the Vistula), signed Shuvayev — always contains ДИВИЗИЯ;
2. the weak spot (Budyonny's cavalry at Lwów, signed Budyonny / the Mozyr Group has few forces);
3. Tukhachevsky's order for the 4th Army to turn south — the one the Poles jammed.

Kowalewski is said to have found his first letter, И, in ДИВИЗИЯ: И in places 2, 4 and 6 is a pattern you
can see in the numbers. Every level starts from it.

- **★** the key table has every letter but those of ДИВИЗИЯ;
- **★★** half the key: half of the other letters the telegrams use are given (`W20.halfKey`, seeded); with
  ДИВИЗИЯ and the glossary the rest follows (tested);
- **★★★** the key table is empty: from ДИВИЗИЯ, guess glossary words that fit (tested: always reads to the end);
- **★★★★** the real way: like a real telegram, no gaps between words, numbers in groups of five, in rows of 25
  (`W20.stream`) with equal cells: groups are split by a thin line, not a gap, so the comb fits anywhere in a row.
  The ДИВИЗИЯ pattern may also fit one overlapping false place (ВИЗИЯИД). And worked the way the codebreakers
  worked, as far as it is known (the hint lists four steps):
  1. counting, as in Poe's "The Gold-Bug", which Kowalewski's memoir names: the key table gets a "how many" box
     under every number (`W20.counts`; the answers fill it in); the most frequent numbers are usually vowels
     (О, Е, А, И in Russian) — И, the letter of the comb, is the most frequent number on most sheets and the
     third on the rest;
  2. the comb (the legend below);
  3. the signature: the listeners knew which station sent a telegram (the heading), and telegrams usually end with
     the commander's name;
  4. no list of exactly the telegrams' words: the codebreakers knew Russian, so the "military dictionary" has
     14 more words the telegrams do not use (`W20.EXTRA`, `W20.DICT`; meanings in `extra` in strings.js).

  Tested: with the dictionary the false comb place leads to no reading and the true one to exactly one, and
  ДИВИЗИЯ never crosses a row. ★★★★ has two mission pages: the hint, the telegrams and the key; then the
  dictionary, the report and the map.

### The comb

Legend (as told by Prof. Grzegorz Nowik, PAP 2020; Kowalewski's own memoir only names Poe) has it that
Kowalewski broke teeth out of a comb and slid it along the telegram until the gaps fell on three equal groups
of digits. The hint box on the mission page has that comb to cut out (`W20.combSvg`), 1:1 with the cells:
seven teeth 6.1 mm apart (5.5 mm cell + 0.6 mm gap, tested against the CSS), teeth 2, 4 and 6 grey, to cut
off. Laid on the telegram, the teeth cover numbers 1, 3, 5, 7 and the slots show 2, 4, 6: three equal numbers
→ maybe ДИВИЗИЯ. It works on every level (in a word of 7 numbers on ★–★★★, anywhere in a row on ★★★★).
Part 4 (`rewolucja-1920`) says why the comb stops working there.

## Pages

1. **How does the cipher work?** (option, on): substitution with a piece of a key, the receiver, the
   "fingerprint" of a word, five steps of breaking a cipher without the key, the real 1920 ciphers ("Revolution"
   of 12 August), today's encryption, a warm-up (decode АРМИЯ; which numbers can be МАМА).
2. **The mission**: the hint with the comb to cut out, three telegrams with boxes under the numbers, the key table, the glossary (all 23 words),
   a report: where the 4th Army goes, what telegram 2 says, which arrow A/B/C to strike (on a small map),
   how to stop the 4th Army hearing its order.
3. **The story** (option, on): 1920, the ears of the Polish Army (Kowalewski, Sierpiński, Mazurkiewicz,
   Leśniewski; ~100 ciphers, 410 telegrams in August), Piłsudski's plan, the jammed radio, why "miracle",
   why it mattered for the West (D'Abernon's "eighteenth decisive battle"), what came next (Enigma, 1932/1939),
   our simplifications; the battle map.
4. **A real telegram** (option, on): the photo of the archive document and three tasks; then its
   transcription in the 1920 spelling, a translation / modern wording, a glossary of the document and why it
   mattered (Budyonny sent to Lwów, not Warsaw).
5. **Answers** (option, on): the whole key, the telegrams read and translated, the report, the warm-up, the
   real-telegram tasks.

Same code + same settings ⇒ the same sheet. URL:
`?seed=&level=easy|mid|hard|expert&how=1|0&story=1|0&real=1|0&key=1|0`.

## Sources and care

Facts checked against the English Wikipedia articles on the Battle of Warsaw and the Cipher
Bureau, bitwa1920.gov.pl, polishhistory.pl, polska-zbrojna.pl and the Orange archive blog on radio intelligence.
Accounts of the jamming differ (Genesis or St John's Gospel, two days or 36 hours), so the sheet says
"passages from the Bible … for almost two days". Our telegrams are short and written by us from what the
decrypts revealed; the sheet says so.
