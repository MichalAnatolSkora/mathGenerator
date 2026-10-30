# The Real Enigma 1932 (Prawdziwa Enigma 1932)

Part 5 of the cipher series **Young Codebreakers Academy (Akademia Młodych Szyfrantów)**, see [`../series.js`](../series.js),
for ages 10–14. It comes after the training (part 2, The Paper Enigma, with one wheel and a mirror) and the 1920 ciphers, and
before Zygalski's sheets (parts 6–7), which were made for exactly this machine.

A printable paper game: build the army **Enigma I** that Marian Rejewski broke in December 1932, then work it by hand.
The paper machine is six wheels on one split pin, biggest at the bottom, so each wheel shows only its outer band:

- the **black wheel** (keyboard and lamps, fixed), with the yellow window at the top;
- the **plugboard ring** (fixed), read like a rotor: the alphabet in black inside and, over each letter with a cable, the
  cable's other end on a chip in the cable's colour; over a letter without a cable an empty slot (straight on). The current
  goes through it twice, from the key and to the lamp. Page 10 has an empty ring for your own cables;
- the **right, middle and left rotor** (I, II, III from left to right in the window). Each band has, at the edge, the
  coloured letters (over each black letter, the letter its wire leads to: the real wiring), then a **white path** (the
  inside of the rotor, where the current goes along the wire), then the alphabet in black; and a red notch (Q, E, V);
- the **mirror** (reflector B, fixed) on top, one ring of letters with its 13 wires drawn across it;
- and a page about the **plugboard**, drawn like the real front panel (QWERTZ order) with 6 cables, a strip
  "letter → after the plugboard" and an empty panel for your own cables. The cables (panel, strip and ring) are never red
  or blue, the colours of the current.

A "spot" is one of the 26 wedges from the pin; the wedges line up on every wheel. With a rotor showing window letter k,
spot p has black letter p + k, so "read the coloured letter, go along the white path to the same black letter" moves the
current from spot p to W(p + k) − k, which is exactly a real rotor with its ring at A. Outwards it is the other way round
(black → same coloured). Because the coloured row is outside and the black row inside, the current always meets first the
row it reads and then the row it looks in, so it never turns back on a wheel: one rule both ways, "read the row you come
to, look in the other one". (Part 2 has its black letters outside; page 2 says why part 5 is the other way round.) On the
plugboard ring the same rule reads: an empty slot by the pencil, straight on; else the same letter in the other row. The turning rules are the real ones, double step included: before each letter the right rotor turns; the
middle one turns if the right one, or the middle one itself, shows its notch letter; the left one if the middle one does.
`E32.paper()` does all this with the printed letters and the tests compare it with `ZYG.machine` (2000 random days).

| Page | What |
|---|---|
| 1 | Cover: December 1932 (Rejewski, the wiring guessed from intercepts, maths and French documents; reading from January 1933 with Różycki and Zygalski, AVA's copies), what is inside, what you need, the order of the pages, a small picture of the machine put together |
| 2 | Step by step, what each wheel is for: the black wheel is the keyboard and lamps of part 2, does not turn or change letters (A leads to A; Rejewski had to guess this) and names the places; a rotor has wires inside, drawn as a real rotor from the side next to the same piece on paper (coloured letters at the edge, the white path, black letters inside; the coloured letter is where the wire ends, so going along the white path to the same black letter is going along the wire); the wheels cut open at the window and straightened, one band under another, with the same first letter (a place is a column, the current goes along the white path, then straight down onto the next wheel; the mirror's wires drawn under it); the way back, the same rule the other way round; what is different from part 2 (turn before the letter, not after; the place counts, not the letter's name; coloured letters outside, so you never turn back on a wheel) |
| 3 | How it works: the machine put together at window SSR with the way of the first letter (red to the mirror, blue back, along the white paths, the letters read ringed, the mirror's wire thick, drawn under the letters) and the letters the child reads and looks for, in boxes: key F, plugboard F (an empty slot: straight on), right U, middle Y, left C, mirror N, left F, middle D, right B, plugboard J (the coloured J is over the black R: cable J–R), lamp R (`E32.STEPS`). The day's key is chosen so that this way is short (at most 4 places on any rotor; the cable J–R on the plugboard ring is 8) and the way back never runs over the way in; the tests keep it so |
| 4 | Cut-out 1 of 3: black wheel (Ø176 mm), mirror (Ø54 mm, labels under it), notes on the black wheel and the coloured letters |
| 5 | Cut-out 2 of 3: today's plugboard ring (Ø159 mm), left rotor (Ø80 mm), how to read the plugboard |
| 6 | Cut-out 3 of 3: right (Ø132 mm) and middle rotor (Ø106 mm), how to build it (six wheels), how to read the window (the black letters) |
| 7 | The plugboard: the panel with today's cables, the strip, "through the plugboard twice" (on the wheels it is the ring on page 5), an empty panel to draw on, how many ways (6 cables: 100 391 791 500) |
| 8 | Mission, the cipher clerk's exam: today's key (rotors I II III, window SSQ, plugboard JR EM KS PW BX CZ, mirror B), the turning rules, the way of the current in six steps (the black wheel; the plugboard ring at the start and at the end; in: coloured → white path → same black; the mirror: follow its wire; out: black → white path → same coloured; the lamp); A decode FGHUCWAN → REJEWSKI (first letter given; the middle rotor turns at letter 6), B encode your name, C how many settings (6 × 17 576 × 100 391 791 500) |
| 9 | Answer key: the name, every letter step by step (the window and the same letters as in the example on page 3, so a parent can find where it went wrong), how to check B, C, common mistakes, paper vs the real machine (rings at A, fixed rotor order, the plugboard as a ring) |
| 10 | For the keen, cut-out: an empty plugboard ring (Ø159 mm) to write your own cables in, and how to do it |

- **`worksheet.html`**: settings (presets *For the child* 1–8, *Cut-outs* 4–6 and 10, *Answer key* 9, *Everything* 1–10, or single
  pages), preview, **Print**. The choice is saved in `localStorage` (`enigma1932.pages3`; the 7-page set was `.pages`, the 8-page one `.pages2`); `?pages=1-8` in the URL wins.
- **`engine.js`**: the day's key, the paper procedure, the drawings (wheels to cut out, the machine put together, the
  plugboard) and the page builders (DOM only, no `innerHTML`). Needs [`../zygalski-sheets/engine.js`](../zygalski-sheets/engine.js)
  for the machine; every letter on the pages comes from it.
- **`strings.js`**: every text in Polish (source), English, Ukrainian, Vietnamese, French, Italian and Spanish. The
  machine has only A–Z, so task B tells each language how to write a name (no diacritics, Ukrainian in Latin letters).
- **`engine.test.js`**: `node enigma-1932/engine.test.js`.

Wheel letters are bold Verdana (thicker than Courier at small sizes); M and W are underlined so they are not mixed up
upside down. The rotors' colours avoid red and blue, the colours of the current. Print in Chrome: A4, scale 100%,
default margins, background graphics on. Pages whose text would overflow shrink it slightly (never below 9 pt).
