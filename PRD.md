# PRD — Math Crossword Worksheet Generator

| | |
|---|---|
| **Product** | Math Crossword Worksheet Generator (working title) |
| **Version** | 1.0 |
| **Status** | Draft for build |
| **Date** | 2026-05-31 |
| **Owner** | llm@infotek.pl |
| **Target platform** | Static web page, hostable on GitHub Pages; output is a **printable worksheet** (print / Save-as-PDF) |

---

## 1. Summary

A single-page web app that generates **printable math-crossword worksheets**. Each
worksheet is an interlocking grid of short equations of the form **`A op B = C`** (one
operator each) that read **across and down** and **share number cells where they cross** —
like a word crossword, but with arithmetic. All numbers stay **within a user-selected range**
(e.g. `0–10`, `0–20`, `-10–10`, or any custom min/max), and division is **exact**.

**Both the crossword's shape and its numbers are randomly generated from a single seed.** A
seeded pseudo-random number generator drives every stochastic choice — the layout, the
operators, the numbers, and which cells are blanked — so that **the same seed (with the same
settings) always reproduces the exact same worksheet**. This makes sheets reproducible and
shareable (hand someone a seed, they regenerate your puzzle and its answer key), while a new
random seed yields a brand-new shape every time.

The generator:
1. From the **seed**, **grows a random interlocking layout** (which cells are numbers,
   operators, equals signs, or blocked).
2. **Fills** it with numbers and operators so **every** across/down equation holds
   simultaneously (constraint satisfaction over the shared cells) — the **solution**.
3. **Blanks out** a subset of number cells, chosen so the worksheet stays **uniquely solvable
   by single-step arithmetic deduction**.
4. Renders a **clean, print-ready worksheet** (title, "Name:" field, instructions, grid) plus
   an optional **answer key**.

Ships as **one self-contained `index.html`** — inline HTML/CSS/vanilla JS, no build, no
dependencies, no network — and prints/exports to PDF using the browser's native print
("Save as PDF"). Works from `file://` and on GitHub Pages.

---

## 2. Problem & motivation
Teachers and parents want printable, varied, **always-correct** arithmetic worksheets in a
fun crossword format, tuned to whatever number range a class is practising — and want to be
able to **reproduce** a specific sheet (and its key) later. This product produces unlimited
seed-addressable variants, with guarantees baked in:

- **Internally consistent by construction** — numbers are derived so every equation holds.
- **Uniquely solvable by a child** — blanks are chosen so each can be deduced one step at a
  time (no algebra, no guessing), and the solution is unique.
- **Reproducible** — `seed + settings` deterministically regenerates the identical worksheet.
- **Zero infrastructure** — one static file; print or save to PDF locally.

---

## 3. Goals & non-goals

### 3.1 Goals
- G1. Generate a **printable worksheet** in an interlocking-crossword style.
- G2. **Procedurally generate a random interlocking layout** (shape) for each worksheet.
- G3. **Seed-driven determinism**: a single seed drives the layout **and** the numbers/
  operators/blanks; `seed + settings` reproduces the identical worksheet.
- G4. Guarantee every generated worksheet is **internally consistent** (all equations hold).
- G5. Guarantee every worksheet is **uniquely solvable by single-step deduction** from its
  given clues.
- G6. Produce a matching **answer key**.
- G7. **Fully adjustable value range**: the user sets **min and max** (min may be negative);
  presets (`0–10`, `0–20`, `0–100`, `-10–10`) plus a custom min/max input.
- G8. Other settings: layout **size**, allowed operators, number of blanks (difficulty),
  operator notation, and whether blanks may appear in operand positions.
- G9. **Print / Save-as-PDF** cleanly on A4 and US-Letter; **single static `index.html`** that
  works offline and on GitHub Pages.
- G10. Use **one shared validation engine** for generation, blank-selection, and answer key.

### 3.2 Non-goals
- NG1. **No on-screen interactive solving / checking** (a possible future "solve online" mode — §16).
- NG2. No accounts, server, or saved progress (a seed is the only thing needed to recall a sheet).
- NG3. **Whole numbers only** — no fractions, decimals, or exponents. (Negative *whole*
  numbers **are** supported when the range has `min < 0`.)
- NG4. No localization of UI beyond operator notation choice.
- NG5. **Seeds are stable within a generator version, not across versions** — changing the
  generation algorithm may change what a given seed produces (§7.1, §19-O5).

---

## 4. Target users
- **Teachers** printing classroom worksheets (and answer keys) at a chosen range/difficulty,
  who may want to reprint or share the *exact* sheet later via its seed.
- **Parents / tutors** generating quick at-home practice sheets.
- **Students** (primary/elementary level) who solve the printed sheet on paper.

No one needs to install anything, sign up, or be online.

---

## 5. Tech constraints (hard requirements)
- TC1. **One file**: all HTML, CSS, vanilla JS inside `index.html`.
- TC2. **No external dependencies / no network** at runtime — no CDN, framework, fonts, or PDF
  library. PDF output uses the **browser's built-in print → Save as PDF**. The PRNG is a tiny
  hand-rolled deterministic function (no library — §7.2).
- TC3. Fully functional from `file://`; **static-host friendly** (GitHub Pages).
- TC4. Vanilla **JavaScript** (ES2019+ for evergreen browsers).
- TC5. **Print-correct**: a dedicated `@media print` / `@page` layout that hides on-screen
  controls and renders only the worksheet (+ answer key on its own page), fitting A4 and
  Letter without clipping.
- TC6. Optional `localStorage` for remembering settings only; app must work without it.

---

## 6. Puzzle format specification

### 6.1 Equations
Every equation is **binary**: `A op B = C`, occupying **5 consecutive cells** in a line —
`[number][operator][number][=][number]` — read **left→right** (horizontal) or **top→bottom**
(vertical). Examples: `8 : 2 = 4`, `6 + 9 = 15`, `7 - 9 = -2` (in a negative range), `3 · 4 = 12`.

### 6.2 Operators & notation
Operator set: `+`, `-`, `×` (multiply), `÷` (divide). **Default display notation is European**:
**`·`** for multiply and **`:`** for divide (with `+`/`-` unchanged). A setting switches to
`×`/`÷`. Internally operators are stored canonically (`'+','-','*','/'`).

### 6.3 Interlocking & crossings
A **number cell at a crossing is shared** by one horizontal and one vertical equation, and its
single value must satisfy **both**. Operator and `=` cells belong to exactly one equation and
are never shared. Some grid cells are **blocked/empty**.

### 6.4 Value range & validity rules
The user chooses a **range `[minValue, maxValue]`** that applies to **every operand and every
result** (`minValue` may be negative). For each equation `A op B = C`:
- **VR1 — Range**: `A`, `B`, `C` are **whole numbers** in `[minValue, maxValue]`.
  - `minValue ≥ 0` → all values non-negative (e.g. `0–10`, `0–20`, `0–100`).
  - `minValue < 0` → negatives allowed down to `minValue` (e.g. in `-10–10`, `3 - 8 = -5` is
    valid; `3 - 20 = -17` is not).
- **VR2 — Exact division**: for `÷`, require `B ≠ 0` and `A mod B = 0` (works for negatives,
  e.g. `-6 ÷ 3 = -2`).
- **VR3 — No division by zero** (`0` is never a divisor, even where `0` is a valid operand).
- **VR4 — Both bounds always apply**: results that overshoot `maxValue` *or* undershoot
  `minValue` are invalid (e.g. `0–20`: `5·6=30` rejected; `-10–10`: `-4·5=-20` rejected).

Enforced by the shared engine (§11) at **generation**, **blank-selection**, and **answer-key**
time — one code path, no per-feature special cases.

### 6.5 What is shown vs. hidden
- **Always shown** (clues): all operators and `=` signs; the worksheet header.
- **Mixed**: each number cell is a **given** (printed) or a **blank** (empty box). Blanks may
  sit in **result** position (`8 : 2 = ▢` → forward computation) or **operand** position
  (`▢ · 7 = 21` → inverse operation), gated by a difficulty setting (§13).

### 6.6 Worked example (negatives + a crossing)
Two equations crossing at a shared cell `A`, in the `-10–10` range:

```
horizontal:  A : 2 = ▢          vertical:   A
                                            -
                                            9
                                            =
                                            ▢
```
With `A = 6`: horizontal `6 : 2 = 3`; vertical `6 - 9 = -3` (valid because `-3 ≥ minValue`).
The shared cell `6` satisfies both. With the two results blanked, the student computes `3` and
`-3` directly — each a single-step deduction.

---

## 7. Procedural layout generation (seeded)

### 7.1 Determinism principle (core)
**All stochastic choices draw from a single seeded PRNG, consumed in a fixed order.** Given
identical **mathematical settings** (range, operators, difficulty, size), the entire worksheet
— layout shape, operators, numbers, and blanks — is a **pure function of the seed**.
- **Rendering-only settings** (notation, answer-key on/off, header text) do **not** consume the
  PRNG and therefore do **not** change the puzzle for a given seed.
- **Mathematical settings** do change PRNG consumption/branching, so changing them yields a
  different puzzle for the same seed (expected).
- Reproducibility holds **within a generator version**; algorithm changes may change a seed's
  output (NG5, §19-O5).

### 7.2 Seedable PRNG (no dependencies)
A tiny deterministic PRNG (e.g. **mulberry32**) seeded by hashing the seed string/integer with
a small string hash (e.g. **cyrb53/cyrb128**) into a 32-bit state. Provides `rnd()` (float),
`rndInt(lo,hi)`, `pick(arr)`, `shuffle(arr)` — all advancing the same internal state. No crypto,
no library (TC2). A **seed may be any string or integer**; the UI shows the current seed and a
"randomize" control.

### 7.3 Grid & cell model
A bounded canvas (`rows × cols`) sized from the **size** setting. Each cell has a role:
`num` | `op` | `eq` | `block`. An equation occupies a 5-cell line with roles `[num, op, num,
eq, num]`. The generator records the authoritative **equation list** and **crossing graph** as
it places equations (it does not re-derive them by scanning, avoiding accidental readings).

### 7.4 Placement rules (what makes a layout valid)
- **Cross only at number cells** — a new equation may overlap existing cells **only** at a
  `num`∩`num` crossing.
- **Operators/equals are exclusive** — an `op` or `eq` cell may never overlap any existing
  non-empty cell.
- **Separation/adjacency** — a newly placed cell may be orthogonally adjacent to cells of other
  equations **only at intended crossings** (the standard crossword no-touching rule), so no two
  equations merge or create an unintended 5-cell reading.
- **Connected** — the finished layout is a single connected component (every equation crosses at
  least one other).
- **In bounds** — all 5 cells fit the canvas.

### 7.5 Growth algorithm (seeded, sketch)
1. Place a **seed equation**: random orientation + position; mark its 5 cells.
2. Repeat until the **target equation count** (from size) is reached, or growth stalls after a
   bounded number of seeded attempts:
   a. `pick` an existing **number cell** (candidate crossing) via the PRNG.
   b. `pick` a perpendicular orientation and which of the new equation's number positions
      (`A`/`B`/`C`) lands on that cell.
   c. Compute the 5 cells; validate against §7.4.
   d. If valid, commit (mark cells, append equation + crossing); else retry another candidate.
3. Output a **Layout** (cells, numberCells, equations, crossings).

This yields organic, varied, connected shapes — different for each seed, identical for the same
seed.

### 7.6 Size
A **size** setting (e.g. Small / Medium / Large) maps to a target equation count and canvas
dimensions, **bounded to fit one printed page** (§12, §19-O6). Under very tight mathematical
settings the achieved size may fall slightly short of target if growth/fill stalls (size is a
target, not a hard guarantee — §7.7).

### 7.7 Interaction with filling (deterministic retries)
A random layout is **not guaranteed fillable** for every range/operator combination (unlike a
pre-vetted template). The pipeline therefore loops deterministically: if the CSP fill (§9.2)
fails for a generated layout within budget, the generator **continues drawing from the same
seeded PRNG** to grow a fresh layout and tries again, up to a total budget; a final fallback
relaxes to an easier operator subset. Because every attempt consumes the one seeded stream in
order, the outcome remains a pure function of `(seed, settings)`.

---

## 8. Worksheet structure (print output)
- **Title** — auto-derived from the range (overridable): `min ≥ 0` → *"Mixed math operations to
  {max}"*; `min < 0` → *"…from {min} to {max}"*.
- **Subtitle** listing the operations included (from the allowed-operator setting).
- A **seed label** (e.g. "seed: 8F3K-217") so a printed sheet is self-identifying / reproducible.
- A **"Name:" line** (and optional date line).
- A one-line **instruction**: *"Fill in the blanks to make every equation true."*
- The **grid**: given numbers printed; blanks as uniform empty boxes; operator glyphs; `=` signs;
  blocked cells empty.
- A configurable **footer** (attribution/credit text).
- **Answer key** (optional, §13): the fully-filled grid on a **separate page**, labelled with the
  same seed.

---

## 9. Functional requirements

### 9.1 Core engine — single source of truth (G10)
**FR-1 `evaluate(values, operators, opts)`** — left-to-right evaluator (binary use:
`evaluate([A,B],[op])`). Returns the number or **`INVALID`** when any intermediate/final value
leaves `[minValue,maxValue]`, on non-exact division, or on `÷0` (VR1–VR4). `opts` carries
`{ minValue, maxValue }`.
**FR-2 `checkEquation(a,op,b,c,opts)`** — true iff `a,b,c` are whole numbers in range, the
operation is valid (exact `÷`, no `÷0`), and `evaluate([a,b],[op],opts) === c`.
**FR-3 `checkGrid(layout, values, opts)`** — runs `checkEquation` over all equations; returns
per-equation status + `consistent`.
**FR-4 `solveByPropagation(layout, givens, opts)`** — the **deduction solver**: repeatedly fills
any equation with **exactly one unknown** via the inverse operation (Appendix A), enforcing
whole-number/range/validity. Returns a **fully-resolved unique solution**, **STUCK**, or
**CONTRADICTION**. Powers blank-selection (§9.3) and the **uniqueness/solvability guarantee** (G5).

### 9.2 Seeded generation (G2, G3, G4)
**FR-5 PRNG (`makePRNG(seed)`)** — deterministic seedable PRNG per §7.2; the **only** source of
randomness in generation.
**FR-6 `growLayout(prng, settings)`** — produce a valid random Layout per §7.4–7.5 (connected,
well-formed, bounded to size).
**FR-7 `fillLayout(layout, prng, settings)`** — assign every number cell and every operator by
**backtracking CSP** so all equations satisfy VR1–VR4 simultaneously; candidate order driven by
`prng` (deterministic). Returns the **solution** or fails.
**FR-8 `generate(seed, settings)`** — top-level: build PRNG → `growLayout` → `fillLayout`; on
fill failure, loop (same PRNG stream) to a new layout within a **total budget**; final fallback
relaxes operators. Asserts `checkGrid(layout, solution).consistent`. Never returns an
inconsistent grid. **Deterministic**: identical `(seed, mathematical-settings)` ⇒ identical output.

### 9.3 Blank selection — unique, single-step solvability (G5)
**FR-9 `chooseBlanks(layout, solution, prng, settings)`** — greedily blank number cells (toward
the difficulty's target, honoring the operand-blank rule) and **keep a blank only if
`solveByPropagation` over the remaining givens still fully resolves to exactly the solution**;
otherwise skip it. Guarantees single-step solvability and a unique answer.

### 9.4 Rendering & controls (G1, G9)
**FR-10.** Render the generated Layout as a print-ready worksheet (§8).
**FR-11. Seed control** — a visible **seed field** (editable) plus a **"Randomize seed"** action.
The current seed is always shown and printed (§8). **New worksheet** = pick a new random seed
(unless the user has locked/typed a seed, in which case it regenerates that exact sheet).
**FR-12. "Print / Save PDF"** — browser print dialog; print stylesheet emits only the worksheet
(+ answer-key page), paginated for A4/Letter.
**FR-13. Answer key** toggle — render/print the fully-solved grid on a separate page, same seed.

### 9.5 Settings / difficulty (G7, G8)
**FR-14. Range controls (fully adjustable).** Presets `0–10`, `0–20`, `0–100`, `-10–10`; **custom
min/max** integer inputs with `minValue ≤ maxValue` enforced (`minValue` may be negative).
Negatives need no separate toggle — enabled automatically when `minValue < 0`.
**FR-15. Other settings.** **Size** (Small/Medium/Large → target equations/canvas); **allowed
operators** (subset of `+ - × ÷`, default all); **difficulty** (Easy/Medium/Hard → blank count +
position rules, §13); **operator notation** (`· :` vs `× ÷`); **operand-blanks allowed?**;
**answer-key** on/off; optional **header** overrides.
**FR-16.** Mathematical settings (range, operators, difficulty, size) apply to the next generated
worksheet and change the seed's output; rendering-only settings (notation, answer key, header) do
not change the puzzle for a given seed (§7.1). Blank target clamps to the propagation-safe max.

---

## 10. Generation pipeline (summary)
0. **Build PRNG** from the seed (FR-5).
1. **Grow layout** (FR-6) — consumes PRNG.
2. **Fill** numbers + operators by CSP (FR-7) — consumes PRNG.
3. If fill fails within budget → back to step 1 (PRNG already advanced → new layout); bounded
   total budget; final fallback relaxes operators (FR-8).
4. **Choose blanks** via propagation (FR-9) — consumes PRNG.
5. **Render** worksheet + optional answer key (FR-10/13).

**Solvable & unique:** the solution exists because the CSP built it; solvability-by-child and
uniqueness are *verified*, not assumed (a blank survives only if propagation still reconstructs
the exact solution). **Reproducible:** the whole pipeline is a pure function of `(seed, math-settings)`.

---

## 11. Shared-engine principle
Exactly **one** arithmetic implementation (`evaluate`); `checkEquation`, `checkGrid`, the CSP
fill, and `solveByPropagation` all route through it. Range bounds, division exactness, `÷0`, and
negatives behave identically everywhere. No duplicated arithmetic.

---

## 12. Print / PDF requirements
- P1. `@media print` hides all controls; only the worksheet (+ answer-key page) prints.
- P2. `@page` sized for A4 **and** Letter without clipping; sensible margins; the generated grid
  is bounded (§7.6) and scaled to fit one page (key adds its own page).
- P3. Crisp black-on-white, high-contrast borders; uniform cell sizes; legible at print DPI.
- P4. Answer key prints on its **own page**, labelled with the same seed.
- P5. "Save as PDF" via the browser produces a faithful PDF with no app chrome; no PDF library (TC2).

---

## 13. Difficulty model
- **Easy**: fewer blanks; blanks only in **result** position (forward computation); fewer operators.
- **Medium**: moderate blanks; results + some operands; all operators.
- **Hard**: more blanks (up to the propagation-unique max); operand blanks allowed (inverse ops).

Blank count always clamps so the unique single-step guarantee (G5) holds. Difficulty, range, and
size are independent.

---

## 14. Configuration model (defaults)
```
Settings = {
  seed:          '(random on load)', // string or integer; hashed to PRNG state
  size:          'medium',           // 'small' | 'medium' | 'large' -> target equations/canvas
  minValue:      0,                  // fully adjustable; may be negative
  maxValue:      20,                 // fully adjustable
  rangePreset:   '0..20',            // '0..10' | '0..20' | '0..100' | '-10..10' | 'custom'
  operators:     ['+','-','*','/'],  // allowed set (>=1 required); display per notation
  notation:      'eu',               // 'eu' => · and :   | 'std' => × and ÷
  difficulty:    'medium',           // 'easy' | 'medium' | 'hard'
  operandBlanks: true,               // allow blanks in operand positions (inverse ops)
  answerKey:     true,               // also produce the answer-key page
  header: { title: '(auto from range)', showName: true, footer: '' }
}
```
*(Mathematical settings: `size, minValue, maxValue, operators, difficulty, operandBlanks`. Rendering-only: `notation, answerKey, header`.)*

---

## 15. Bonus / optional (NOT blockers)
- B1. **Shareable code** — encode `seed + mathematical settings` into one short string so a single
  paste reproduces a sheet exactly (incl. its key), regardless of the recipient's current settings.
- B2. **Batch generation** — N worksheets (and keys) from sequential/derived seeds in one print run.
- B3. **"Regenerate this exact sheet"** affordance and copy-seed button.
- B4. **Self-check decorations** (e.g. extra hint cells).

---

## 16. Out of scope (deferred)
- **Interactive on-screen solving / Check / Reveal** — a possible future "solve online" view
  reusing the same engine.
- Non-binary equations, **decimals/fractions**. (Negative whole numbers are **in scope** via the
  range setting.)
- Guaranteeing seed reproducibility **across** generator versions (NG5).

---

## 17. Definition of Done (acceptance criteria)
- AC1. **Single `index.html`**, no external requests; verified via `file://` (network off) and as a
  GitHub Pages page.
- AC2. **Determinism**: generating with the same `seed` + same **mathematical settings** twice
  yields an **identical** worksheet (layout, operators, numbers, blanks); a different seed yields a
  different layout. Rendering-only settings (notation/answer-key/header) do not change the puzzle.
- AC3. **Layout validity**: every generated layout is **connected**, all equations are well-formed
  5-cell lines, crossings are `num`∩`num`, and there are no illegal overlaps/adjacencies (§7.4).
- AC4. **Consistency**: generating N≥1000 worksheets across representative settings — **including a
  negative range (`-10–10`) and small ranges (`0–10`)** — yields **zero** sheets where
  `checkGrid(solution)` is not fully consistent.
- AC5. **Unique single-step solvability**: for every generated sheet (all ranges),
  `solveByPropagation(givens)` returns a fully-resolved solution **equal to** the stored solution
  (no STUCK, no CONTRADICTION).
- AC6. **Shared engine**: generation, blank-selection, and answer key use the same `evaluate`;
  range/exact-division/`÷0`/negatives behave identically (no duplicate arithmetic).
- AC7. **Range controls**: presets and custom min/max work; negative min yields in-range negatives;
  `min ≤ max` enforced; worksheet **title reflects the range**.
- AC8. **Answer key** matches the solution exactly, on a separate page, labelled with the seed.
- AC9. **Print fidelity**: prints/saves-to-PDF cleanly on A4 and Letter; controls hidden; no
  clipping; uniform legible cells (P1–P5).
- AC10. **Other settings honored**: size, allowed-operator subset, notation, difficulty/blank count,
  operand-blanks toggle all demonstrably affect output.
- AC11. **No hang**: New worksheet always returns promptly via the bounded layout+fill retry budget
  + operator-relax fallback, even on the tightest valid settings.

---

## 18. Suggested build milestones (non-binding)
1. **M1 — Engine**: `evaluate`, `checkEquation`, `checkGrid`, `solveByPropagation` with `[min,max]`
   (incl. negatives); console-verify inverse-op deductions.
2. **M2 — PRNG**: seedable `makePRNG` + helpers; verify determinism (same seed → same stream).
3. **M3 — Layout**: `growLayout` with placement rules; assert AC3 (connected, well-formed) over
   many seeds.
4. **M4 — Fill (CSP)**: `fillLayout` + `generate` retry/fallback loop; assert AC4 over 1000 runs
   across ranges incl. `-10–10`; assert AC2 determinism.
5. **M5 — Blanks**: propagation-validated blank selection + difficulty mapping; assert AC5.
6. **M6 — Render & print**: worksheet layout, seed label, range-derived title, notation, answer-key
   page, `@media print`/`@page`; seed field + randomize, range presets + custom min/max.
7. **M7 — Settings polish**.
8. **M8 — Bonus**: shareable seed+settings code, batch generation (§15).

---

## 19. Open questions
- O1. **Product name** and default footer/attribution text.
- O2. **Default range** (`0–20` proposed) and **default size** (`medium`) — confirm.
- O3. **Seed format/display** — accept any string *and* integer? Proposed seed display format
  (e.g. short alphanumeric like `8F3K-217`)?
- O4. **Size → equation-count / canvas** mapping (Small/Medium/Large concrete numbers), and the
  **difficulty → blank-ratio** mapping.
- O5. **Cross-version seed stability** — acceptable that an algorithm change can alter a seed's
  output (NG5)? If strict stability is ever needed, we'd version the seed string.
- O6. **Custom-range / size guardrails** — hard caps on `maxValue`, range span, and grid size so
  worksheets stay printable on one page.

---

## Appendix A — Reference pseudocode (illustrative)

```js
const INVALID = Symbol('INVALID');
const inRange = (x, o) => Number.isInteger(x) && x >= o.minValue && x <= o.maxValue;

// FR-1 — left-to-right evaluator (binary use: evaluate([A,B],[op]))
function evaluate(values, operators, opts) {
  let acc = values[0];
  if (!inRange(acc, opts)) return INVALID;
  for (let k = 0; k < operators.length; k++) {
    const n = values[k + 1];
    switch (operators[k]) {
      case '+': acc = acc + n; break;
      case '-': acc = acc - n; break;
      case '*': acc = acc * n; break;                 // shown as · or ×
      case '/':
        if (n === 0 || acc % n !== 0) return INVALID;  // VR2/VR3: exact, no /0
        acc = acc / n; break;
    }
    if (!inRange(acc, opts)) return INVALID;           // VR1/VR4: stay within [min,max]
  }
  return acc;
}

// FR-5 — seedable PRNG (no deps). cyrb-style string hash -> mulberry32 state.
function makePRNG(seed) {
  let h = 1779033703 ^ String(seed).length;
  for (const ch of String(seed)) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  const rnd = () => { a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rndInt = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  return { rnd, rndInt, pick, shuffle };
}

// FR-6 — grow a random interlocking layout (sketch)
function growLayout(prng, settings) {
  const target = equationTargetFor(settings.size);
  placeSeedEquation(prng);                  // random orientation + position
  let stall = 0;
  while (equationCount() < target && stall < MAX_STALL) {
    const cell = prng.pick(existingNumberCells());     // candidate crossing
    const place = proposePerpendicular(prng, cell);    // orientation + which of A/B/C lands on `cell`
    if (isValidPlacement(place)) { commit(place); stall = 0; }   // §7.4 rules
    else stall++;
  }
  return { cols, rows, cells, numberCells, equations, crossings }; // connected, well-formed
}

// FR-8 — deterministic top-level generate
function generate(seed, settings) {
  const prng = makePRNG(seed);
  for (let attempt = 0; attempt < TOTAL_BUDGET; attempt++) {
    const layout = growLayout(prng, settings);
    const solution = fillLayout(layout, prng, settings);     // backtracking CSP, VR1–VR4
    if (solution && checkGrid(layout, solution, settings).consistent) {
      const blanks = chooseBlanks(layout, solution, prng, settings);
      return { layout, solution, blanks, seed, settings };
    }
    // failure: prng already advanced -> next loop grows a different layout
  }
  return generateWithRelaxedOperators(seed, settings);       // final fallback
}

// FR-4 — single-step deduction solver (powers blank-selection + uniqueness)
function solveByPropagation(layout, givens, opts) {
  const v = new Map(givens);
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const e of layout.equations) {
      if ([e.a, e.b, e.c].filter(id => v.has(id)).length === 2) {  // exactly one unknown
        const r = solveOneUnknown(e, v, opts);                     // inverse op (below)
        if (r === INVALID) return 'CONTRADICTION';
        if (!v.has(r.id)) { v.set(r.id, r.val); progressed = true; }
      }
    }
  }
  return layout.numberCells.every(id => v.has(id)) ? v : 'STUCK';
}
// inverse ops for A op B = C with one unknown — result must be a whole number in range:
//   unknown C: C = A op B
//   unknown A:  +: C-B   |  -: C+B   |  *: C/B (exact,B≠0)  |  /: C*B
//   unknown B:  +: C-A   |  -: A-C   |  *: C/A (exact,A≠0)  |  /: A/C (exact,C≠0)
// reject (INVALID) if non-integer, out of [minValue,maxValue], or ÷0. (Negative is fine iff ≥ minValue.)

// FR-9 — choose blanks preserving unique single-step solvability
function chooseBlanks(layout, solution, prng, settings) {
  const target = blankTargetFor(settings);
  let blanks = new Set();
  for (const id of prng.shuffle(candidateCells(layout, settings))) {  // honors operandBlanks rule
    if (blanks.size >= target) break;
    const trial = new Set(blanks); trial.add(id);
    const res = solveByPropagation(layout, givensFrom(solution, trial), settings);
    if (res !== 'STUCK' && res !== 'CONTRADICTION' && equals(res, solution)) blanks = trial;
  }
  return blanks;
}
```

## Appendix B — Data model
```
Layout = {                          // generated per (seed, settings); replaces fixed templates
  cols, rows,
  cells:       Map cellId -> { r, c, role: 'num'|'op'|'eq'|'block' },
  numberCells: cellId[],
  equations:   [ { a:cellId, op:cellId, b:cellId, eq:cellId, c:cellId, dir:'h'|'v' } ],
  crossings:   [ cellId ]           // number cells shared by an h- and a v-equation
}

Worksheet = {
  seed,                              // reproduces this exact sheet (with the same math-settings)
  layout:    Layout,
  solution:  Map cellId -> number,   // full consistent fill (answer key)
  operators: Map cellId -> '+|-|*|/',
  blanks:    Set cellId,             // hidden number cells (student fills these)
  settings:  Settings
}
```

---

*End of PRD.*
