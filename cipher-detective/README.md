# Cipher Detective

A code-breaking guessing game for kids (ages ~8–12). The child sees a short message and its
encrypted version and must work out **which cipher** was used. Comes in two forms:

- **`index.html` — the online game.** Two hints per case (gentle, then specific), a "magnifier"
  that shows how many steps each letter moved, a cipher guide, and a kid-friendly explanation after
  every answer.
- **`worksheet.html` — the printable A4 worksheet generator.** Seed-based sheets with the message
  and code tiles, tick-boxes for the cipher, step boxes for counting the shift, plus optional
  detective's guide and answer-key pages. Print or Save as PDF from the browser.

Both pages share **`engine.js`** (the puzzle engine, logic only) and **`strings.js`** (every
user-facing text in Polish, English, Ukrainian and Vietnamese: cipher descriptions, hints,
explanations, "why not" notes, and the UI of both pages). The language helper is `../i18n.js`.

Each language has its **own alphabet, message bank and key words**:

| Language | Alphabet | Letters | Half-turn cipher | Affine `a` |
|---|---|---|---|---|
| English | A–Z | 26 | ROT13 | 3, 5, 7, 11 |
| Polish | A Ą B C Ć … Z Ź Ż | 32 | ROT16 | 3, 5, 7, 11 |
| Ukrainian | А Б В Г Ґ … Ю Я | 33 | ROT16 | 5, 7, 2, 4 |
| Vietnamese | A Ă Â B … X Y (base letters, no tone marks) | 29 | ROT14 | 3, 5, 7, 11 |

Letters are numbered 0 … n−1 in alphabet order; Caesar shifts are 1 … n−1 except the half-turn;
Atbash mirrors the alphabet (first ↔ last); Affine uses `a` coprime with n. An **alphabet strip**
(🔤) with the letter numbers is available in the game and on the worksheets as help for younger
kids. No build, no dependencies, no network. Works from `file://`, from any static server, and on
GitHub Pages. Scales from desktop to phones.

## Run

Open `index.html` or `worksheet.html` directly, or from the repo root:

```bash
python3 -m http.server 8123
```

then visit <http://localhost:8123/cipher-detective/> (game) or
<http://localhost:8123/cipher-detective/worksheet.html> (worksheets).

## Play online

- **Easy**: Caesar, ROT13, Atbash. **Hard**: those three plus Vigenère, Affine, Beaufort.
- **💡 Hint** — hint 1 is gentle, hint 2 is specific. Each hint used costs one star (3 → 2 → 1).
- **🔍 Magnifier** — shows the shift (code number − letter number, mod n) under every letter. Free to use.
- **🔤 Alphabet** — the alphabet with letter numbers; tap a letter in the message to see its jump.
- **📖 Cipher guide** — how each cipher works, how to spot it, and a live example.
- Keyboard: `1`–`6` pick a cipher, `H` hint, `M` magnifier, `A` alphabet, `G` guide, `Enter`/`N` next case.
- Stars, streak and solved count are saved in `localStorage` (Reset progress clears them).

## Print worksheets

- **Seed** — the same seed + level always gives the same worksheet (and the same answer key).
  A longer worksheet starts with the same cases as a shorter one.
- **Level** Easy (3 ciphers) or Hard (6). **Cases** 1–10; about 6 fit on one A4 page.
- **Options**: step boxes (a blank row under each word for counting the shift), hints printed
  upside-down at the bottom of the sheet, a one-page **Detective's guide** (checklist, letter
  numbers A=0…Z=25, each cipher with an example), and an **Answer key** page (cipher, parameters,
  explanation, and the step numbers filled in).
- Ciphers are dealt evenly across the cases, never the same one twice in a row, and no message
  repeats within a sheet.
- The page also accepts `?seed=…&level=easy|hard&n=…` in the URL, e.g.
  `worksheet.html?seed=SPY-4821&level=hard&n=6`.
- Print settings are saved in `localStorage`; the browser's print dialog does the rest
  (A4, 12 mm margins are set by the page; enable "background graphics" if the grey code tiles
  print white — they still have a thick border either way).

## Puzzle engine

`engine.js` follows the agent spec below: puzzles are computed by the cipher rules (never
freestyled), then **validated by decrypting** before they are returned. In the browser it is
`window.ENGINE` (the game also exposes `window.CipherDetective.engine`). Texts come from
`strings.js`, which registers `ENGINE.TEXT.<lang>`.

```js
ENGINE.generatePuzzle('easy', { lang: 'pl' })   // Polish message, Polish alphabet, Polish texts
// → { cipher_id, params, plaintext, ciphertext, lang, hint, hints:[gentle, specific], explanation }
ENGINE.puzzleText(puzzle, 'uk')          // → { hints, explanation } in another language
ENGINE.whyNot('caesar', puzzle, 'vi')    // → why the guess does not fit
ENGINE.generateWorksheet('SPY-4821', 'hard', 6, 'pl')
// → { seed, level, count, lang, cases:[puzzle, …] }   deterministic for seed + level + language
```

The same puzzle JSON (with `hint2`) is shown under "Puzzle JSON" after each answer in the game.

Tests (reference vectors incl. the spec's Caesar example and textbook Vigenère/Beaufort/Affine
results, round trips of every cipher × parameter × message, generator fuzzing through
`validatePuzzle`, worksheet determinism, and text completeness in all four languages):

```bash
node engine.test.js
```

---

## Agent spec (source of truth for the game rules)

### Role
You generate puzzles for a children's game (ages ~8–12). The child sees a real message and its
encrypted version and must guess which cipher was used. You also give hints and explain answers.

### Cipher list (alphabet A–Z, indexed A=0 … Z=25; non-letters unchanged; output uppercase)

| ID | Name | Level | Rule | Parameters |
|---|---|---|---|---|
| `caesar` | Caesar | easy | C = (P + s) mod 26 | s ∈ 1..25, s ≠ 13 |
| `rot13` | ROT13 | easy | C = (P + 13) mod 26 | none |
| `atbash` | Atbash | easy | C = 25 − P | none |
| `vigenere` | Vigenère | hard | C = (P + K[i mod len]) mod 26 | key word, 3–4 letters |
| `affine` | Affine | hard | C = (a·P + b) mod 26 | a ∈ {3,5,7,11}, b ∈ 0..25 |
| `beaufort` | Beaufort | hard | C = (K[i mod len] − P) mod 26 | key word, 3–4 letters |

`i` counts letters only (spaces and punctuation do not advance the key).

Optional extensions (not in the game yet): Keyword substitution, Rail Fence (transposition — no
letter shifting), Reverse text, One-time pad (not recommended: output is indistinguishable from
random, so it can't be guessed).

### Puzzle generation
1. Pick a cipher allowed for the current level.
2. Pick parameters per the table.
3. Write a short, positive, kid-safe message: 3–6 words, max 30 characters, common words only.
4. Encrypt it deterministically using the rule above. Never "freestyle" the ciphertext — compute it
   (use a tool/code if available) and verify by decrypting.
5. Return JSON only:

```json
{
  "cipher_id": "caesar",
  "params": { "shift": 3 },
  "plaintext": "MEET AT THE TREEHOUSE",
  "ciphertext": "PHHW DW WKH WUHHKRXVH",
  "hint": "Every letter moved the same number of steps.",
  "explanation": "This was a Caesar cipher with a shift of 3, so A became D."
}
```

### Identification clues (use for hints, from vague to specific)
- Same shift on every letter → Caesar (13 exactly → ROT13).
- A↔Z, B↔Y mirror pattern → Atbash.
- Shifts repeat in a short cycle → Vigenère.
- Same letter always maps to the same letter, but shifts jump irregularly → Affine.
- Uses a key but letters count backwards from the key → Beaufort.

### Tone rules
- Short sentences, simple words, encouraging. Never say "wrong" harshly; say "Not this time — it
  was X" and explain why.
- Hint 1 is gentle ("Look at the first letter"), hint 2 is specific ("Every letter moved 3 steps").
- No personal questions to the child, no links, no content that is scary, violent or about real
  people.

### Validation (must pass before returning)
- Decrypting `ciphertext` with `params` yields `plaintext` exactly.
- `cipher_id` is allowed for the requested level.
- Plaintext passes the kid-safe word list.
