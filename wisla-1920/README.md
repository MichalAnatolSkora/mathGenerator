# Secret Telegrams of 1920 (Tajne depesze 1920 — Cud nad Wisłą)

A paper game for ages 9–12: read intercepted Red Army telegrams from August 1920 the way Polish radio
intelligence did before the Battle of Warsaw, advise the Commander-in-Chief where to strike, and learn why the
"Miracle on the Vistula" mattered for the whole West. Printable A4 pages only, seven languages
(pl/en/uk/vi/fr/it/es), built on the shared [`sheet-kit`](../sheet-kit/kit.js).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | The sheet: how the cipher works, the mission, the story, a real decrypt (photo + transcription), the answers |
| [`engine.js`](engine.js) | Telegrams, the day's key, the solvers used by the tests, the map (SVG; the ["Revolution" cipher](../rewolucja-1920/README.md) sheet draws its own arrows and units on it), the real decrypt's text |
| [`strings.js`](strings.js) | Texts in seven languages |
| [`engine.test.js`](engine.test.js) | `node engine.test.js`: keys, the ДИВИЗИЯ pattern, every level solvable (★★★★ with exactly one answer) |
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
- **★★★★** like a real telegram: no gaps between words, numbers in groups of five. The ДИВИЗИЯ pattern may
  also fit one overlapping false place (ВИЗИЯИД); tested: the false place leads to no reading, the true one to
  exactly one.

## Pages

1. **How does the cipher work?** (option, on): substitution with a piece of a key, the receiver, the
   "fingerprint" of a word, five steps of breaking a cipher without the key, the real 1920 ciphers ("Revolution"
   of 12 August), today's encryption, a warm-up (decode АРМИЯ; which numbers can be МАМА).
2. **The mission**: three telegrams with boxes under the numbers, the key table, the glossary (all 23 words),
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
