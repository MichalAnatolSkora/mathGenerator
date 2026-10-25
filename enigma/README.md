# The Paper Enigma (Papierowa Enigma)

Part 2 of the cipher series **Young Codebreakers Academy (Akademia Młodych Szyfrantów)**, see [`../series.js`](../series.js).
The cover names the series and the part; Mission 1 ends with the Polish codebreakers' "ANX" crib (German *an* "to" + X for a space),
the certificate on page 10 sends the child on to part 3 (Secret Telegrams 1920) and Mission 7 points to part 5 (The Real Enigma 1932, where the child builds the real machine) and part 6 (Zygalski Sheets).

A set of **13 printable A4 pages** for kids aged 8–10 that explain, step by step, how the Enigma
machine worked: Caesar cipher → mixed-up alphabet (a permutation) → counting permutations (n!) →
a turning wheel (the rotor) → a mirror (the reflector) → a paper mini-Enigma that codes and decodes
with the same steps → a final report (the real machine, a quiz, a certificate). Pages 12–13 are an
extra for keen kids: an Enigma wheel with the whole alphabet.

| Page | What |
|---|---|
| 1 | Cover: the true story (Rejewski, Różycki, Zygalski, 1932), agent ID card, what you need |
| 2 | Cut-out: Caesar wheel (Ø130 mm + Ø100 mm) |
| 3–5 | Missions 1–3: Caesar cipher with a crib, mixed-up alphabet, counting arrangements (+ cards to cut out) |
| 6 | Cut-out: Enigma wheel (8 letters, Ø140 mm + Ø96 mm with a star pointer) |
| 7–9 | Missions 4–6: the turning wheel, the mirror, your Enigma |
| 10 | Final report: a picture of the real machine (key → plugboard → 3 rotors → mirror → lamp), a 5-question quiz, the certificate |
| 11 | Answer key for the parent, own messages, what maps to the real Enigma |
| 12 | For the keen, cut-out: the big Enigma wheel with the whole alphabet (Ø136 mm + Ø104 mm) |
| 13 | For the keen, Mission 7: the big Enigma (mirror card with every pair, a message, counting settings; answers upside down at the bottom) |

- **`play.html`** (+ `play-strings.js`, `play.test.js`): the **online game** with the same missions 1–7 and the final
  report: wheels you turn by dragging, −/+ or arrow keys, letters typed or tapped, instant feedback,
  stars saved in `localStorage` (`enigma.play`), `?mission=1..8` opens a mission. It reuses the engine
  and many worksheet texts.
- **`index.html`**: settings (presets *For the child* 1–10, *Cut-outs* 2, 6 and 12, *Answer key* 11,
  *For the keen* 12–13, *Everything* 1–13, or single pages), preview, **Print**. The choice is saved in
  `localStorage` (`enigma.pages2`, all 13 pages by default); `?pages=1-10` / `?pages=2,6` in the URL wins. Footers always keep the
  original page number ("page 6 of 13").
- **`engine.js`**: the language packs, the ciphers (`caesar`, `sub`, `diskEnc`, `diskDec`, `mirror`,
  `enigma`) and the page builders (DOM only, no `innerHTML`). Every code, answer and letter named in
  a text is computed from the pack, never typed.
- **`strings.js`**: every text in Polish (source), English, Ukrainian, Vietnamese, French, Italian and Spanish.
- **`engine.test.js`**: `node enigma/engine.test.js`.

Each page language has its own pack: pl/en/fr/it/es use A–Z (messages without accents; es avoids Ñ,
which is not on the wheels), uk the 33-letter
Ukrainian alphabet, vi the 29 base letters without tone marks. The mini-Enigma is built from the same
indices everywhere (`out` = 8 letters, red wheel `inn[i] = out[INN_IDX[i]]`, mirror pairs `MIR_IDX`),
e.g. pl: `AEIKLMOT`, red wheel `MTAOKIEL`, mirror A↔O E↔T I↔K L↔M. The big wheel (`bigPack`) uses the
whole alphabet; its red wheel is the Mission 2 mixed alphabet and its mirror pairs come from a fixed
shuffle. The mirror needs pairs, so the odd alphabets leave out one rare letter (uk Ґ, vi Q). The uk and
vi messages still need a check by a native speaker.

Print in Chrome: A4, scale 100%, default margins, background graphics on. Pages whose text would
overflow shrink it slightly (never below 9 pt).
