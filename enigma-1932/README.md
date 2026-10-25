# The Real Enigma 1932 (Prawdziwa Enigma 1932)

Part 5 of the cipher series **Young Codebreakers Academy (Akademia Młodych Szyfrantów)**, see [`../series.js`](../series.js),
for ages 10–14. It comes after the training (part 2, The Paper Enigma, with one wheel and a mirror) and the 1920 ciphers, and
before Zygalski's sheets (parts 6–7), which were made for exactly this machine.

A printable paper game: build the army **Enigma I** that Marian Rejewski broke in December 1932, then work it by hand.
The paper machine is four wheels on one split pin, biggest at the bottom, so each wheel shows only its outer band:

- the **black wheel** (keyboard and lamps, fixed), with the yellow window at the top;
- the **right, middle and left rotor** (I, II, III from left to right in the window), each with the alphabet in black and,
  on a tinted strip under each black letter, the letter its wire leads to (the real wiring) and a red notch (Q, E, V);
- the **mirror** (reflector B, fixed) on top;
- and a separate card: the **plugboard**, drawn like the real front panel (QWERTZ order) with 6 cables, a strip
  "letter → after the plugboard" and an empty panel for your own cables.

A "spot" is one of the 26 wedges from the pin; the wedges line up on every wheel. With a rotor showing window letter k,
spot p has black letter p + k, so "read the coloured letter, find the same black letter on that wheel" moves the current
from spot p to W(p + k) − k, which is exactly a real rotor with its ring at A. Outwards it is the other way round (black →
same coloured). The turning rules are the real ones, double step included: before each letter the right rotor turns; the
middle one turns if the right one, or the middle one itself, shows its notch letter; the left one if the middle one does.
`E32.paper()` does all this with the printed letters and the tests compare it with `ZYG.machine` (2000 random days).

| Page | What |
|---|---|
| 1 | Cover: December 1932 (Rejewski, the wiring guessed from intercepts, maths and French documents; reading from January 1933 with Różycki and Zygalski, AVA's copies), what is inside, what you need, the order of the pages, a small picture of the machine put together |
| 2 | How it works: the machine put together at window SSR with the way of the first letter (red to the mirror, blue back, the letters read ringed, drawn under the letters) and the letters the child reads and looks for, in boxes: key F, black F, right U, middle Y, left C, mirror N, left F, middle D, right B, black J, lamp R (`E32.STEPS`). The day's key is chosen so that this way is short (at most 4 places on any wheel) and the way back never runs over the way in; the tests keep it so |
| 3 | Cut-out 1 of 2: black wheel, left rotor, mirror |
| 4 | Cut-out 2 of 2: right and middle rotor, how to build it, how to read the window |
| 5 | The plugboard: the panel with today's cables, the strip, "through the plugboard twice", an empty panel to draw on, how many ways (6 cables: 100 391 791 500) |
| 6 | Mission, the cipher clerk's exam: today's key (rotors I II III, window SSQ, plugboard JR EM KS PW BX CZ, mirror B), the turning rules, the way of the current; A decode FGHUCWAN → REJEWSKI (first letter given; the middle rotor turns at letter 6), B encode your name, C how many settings (6 × 17 576 × 100 391 791 500) |
| 7 | Answer key: the name, every letter step by step (the window and the same letters as in the example on page 2, so a parent can find where it went wrong), how to check B, C, common mistakes, paper vs the real machine (rings at A, fixed rotor order) |

- **`worksheet.html`**: settings (presets *For the child* 1–6, *Cut-outs* 3–5, *Answer key* 7, *Everything*, or single
  pages), preview, **Print**. The choice is saved in `localStorage` (`enigma1932.pages`); `?pages=1-6` in the URL wins.
- **`engine.js`**: the day's key, the paper procedure, the drawings (wheels to cut out, the machine put together, the
  plugboard) and the page builders (DOM only, no `innerHTML`). Needs [`../zygalski-sheets/engine.js`](../zygalski-sheets/engine.js)
  for the machine; every letter on the pages comes from it.
- **`strings.js`**: every text in Polish (source), English, Ukrainian, Vietnamese, French, Italian and Spanish. The
  machine has only A–Z, so task B tells each language how to write a name (no diacritics, Ukrainian in Latin letters).
- **`engine.test.js`**: `node enigma-1932/engine.test.js`.

Wheel letters are bold Verdana (thicker than Courier at small sizes); M and W are underlined so they are not mixed up
upside down. The rotors' colours avoid red and blue, the colours of the current. Print in Chrome: A4, scale 100%,
default margins, background graphics on. Pages whose text would overflow shrink it slightly (never below 9 pt).
