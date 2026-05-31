# PRD — Math Crossword Worksheet Generator

| | |
|---|---|
| **Product** | Math Crossword Worksheet Generator (working title) |
| **Version** | 1.0 |
| **Status** | Built — this document reflects the shipped `index.html` |
| **Date** | 2026-05-31 |
| **Owner** | llm@infotek.pl |
| **Target platform** | Static web page, hostable on GitHub Pages; output is a **printable A4 worksheet** (print / Save-as-PDF) |

> This PRD documents what was actually built. Function names in §9 / Appendix A match the code
> in `index.html`.

---

## 1. Summary

A single-page web app that generates **printable math-crossword worksheets**. Each worksheet is
a **dense interlocking grid** of short equations of the form **`A op B = C`** (one operator each)
that read **across and down** and **share number cells where they cross** (forming loops, like a
real crossword). All numbers stay **within a user-selected range** (e.g. `0–10`, `0–20`, `-10–10`,
or any custom min/max), and division is **exact**.

**Both the crossword's shape and its numbers are generated from a single seed.** A seeded PRNG
drives every stochastic choice — the layout, operators, numbers, and which cells are blanked — so
**the same seed (with the same maths settings) reproduces the exact same worksheet**.

The generator:
1. From the **seed**, **grows a random dense interlocking mesh** on a lattice **and assigns the
   numbers and operators as it grows**, so every equation already holds the moment it is placed
   (consistency *by construction*) — the **solution**.
2. **Blanks out** a subset of number cells, chosen so the worksheet stays **uniquely solvable by
   single-step arithmetic deduction** (no guessing).
3. Renders a **clean, A4-fitted, print-ready worksheet** (title, "Name:" field, instruction, grid)
   plus an optional **answer key**.

Ships as **one self-contained `index.html`** — inline HTML/CSS/vanilla JS, no build, no
dependencies, no network — and prints/exports to PDF using the browser's native print. Works from
`file://` and on GitHub Pages, and **scales from desktop down to phones**.

---

## 2. Problem & motivation
Teachers and parents want printable, varied, **always-correct** arithmetic worksheets in a fun
crossword format, tuned to whatever number range a class is practising, and reproducible later via
a seed. Guarantees baked in:

- **Internally consistent by construction** — numbers are derived so every equation holds.
- **Solvable by a child without guessing** — blanks are chosen so each can be deduced one step at a
  time, and the solution is unique.
- **Reproducible** — `seed + maths-settings` regenerates the identical worksheet (and key).
- **Zero infrastructure** — one static file; print or save to PDF locally.

---

## 3. Goals & non-goals

### 3.1 Goals
- G1. Generate a **printable worksheet** in a dense interlocking-crossword style.
- G2. **Procedurally generate a random dense mesh** (with crossings/loops) per worksheet.
- G3. **Seed-driven determinism**: one seed drives layout **and** numbers/operators/blanks.
- G4. **Internally consistent** — all equations hold.
- G5. **Uniquely solvable by single-step deduction** (no guessing) from the given clues.
- G6. Produce a matching **answer key**.
- G7. **Fully adjustable value range** (min/max, negatives allowed); presets + custom.
- G8. Settings: **size (incl. a full-page A4 size)**, allowed operators, difficulty, operator
  notation, operand-blanks toggle.
- G9. **Real arithmetic** — avoid trivial equations (no `×0`, `÷1`, `0±x`) where possible.
- G10. **A4-printable at every size**, and **responsive** (scales to phones).
- G11. **One shared validation engine** for generation, blank-selection, and answer key.

### 3.2 Non-goals
- NG1. **No on-screen interactive solving / checking** (possible future "solve online" mode).
- NG2. No accounts, server, or saved progress (a seed recalls a sheet).
- NG3. **Whole numbers only** — no fractions/decimals/exponents. (Negative whole numbers are in
  scope when `min < 0`.)
- NG4. No localization beyond operator notation.
- NG5. **Seeds are stable within a generator version, not across** — algorithm changes may change a
  seed's output.

---

## 4. Target users
- **Teachers** printing classroom worksheets + answer keys at a chosen range/difficulty.
- **Parents / tutors** generating quick practice sheets.
- **Students** (primary level) solving the printed sheet on paper.

No install, sign-up, or connectivity required.

---

## 5. Tech constraints (hard requirements)
- TC1. **One file**: all HTML/CSS/vanilla JS inside `index.html`.
- TC2. **No external dependencies / no network** — no CDN, framework, fonts, or PDF library. PDF via
  the browser's print → Save as PDF. The PRNG is a tiny hand-rolled function.
- TC3. Fully functional from `file://`; **static-host friendly** (GitHub Pages).
- TC4. Vanilla **JavaScript** (ES2019+).
- TC5. **Print-correct on A4**: `@page { size:A4 }`; `@media print` hides controls; cells sized in mm
  to fit A4; answer key on its own page. (Letter degrades gracefully — laid out for A4 width.)
- TC6. **Responsive**: usable from desktop down to ~320px phones (no horizontal scrolling).
- TC7. Optional `localStorage` for remembering settings only; works without it.

---

## 6. Puzzle format specification

### 6.1 Equations
Every equation is **binary**: `A op B = C`, five consecutive cells in a line —
`[number][operator][number][=][number]` — read left→right (horizontal) or top→bottom (vertical).
Examples: `8 : 2 = 4`, `6 + 9 = 15`, `7 - 9 = -2` (negative range), `3 · 4 = 12`.

### 6.2 Operators & notation
Set: `+`, `-`, `×`, `÷`. **Default notation is European**: `·` (multiply), `:` (divide); `+`/`-`
unchanged. A setting switches to `×`/`÷`. Stored canonically as `'+','-','*','/'`.

### 6.3 Interlocking & crossings
A **number cell at a crossing is shared** by one horizontal and one vertical equation; its single
value must satisfy **both**. A number cell belongs to **at most one horizontal and one vertical**
equation (so equations never chain in the same direction). Operator/`=` cells belong to exactly one
equation. Cells outside the mesh are blank background.

### 6.4 Value range & validity rules
The user chooses a **range `[minValue, maxValue]`** applied to **every operand and result**
(`minValue` may be negative). For each equation `A op B = C`:
- **VR1 — Range**: `A`, `B`, `C` are **whole numbers** in `[minValue, maxValue]`.
- **VR2 — Exact division**: for `÷`, `B ≠ 0` and `A mod B = 0` (works for negatives, `-6÷3=-2`).
- **VR3 — No division by zero**.
- **VR4 — Both bounds apply**: overshooting `maxValue` or undershooting `minValue` is invalid
  (`0–20`: `5·6=30` rejected; `-10–10`: `-4·5=-20` rejected).

Enforced by the **shared engine** (§11) at generation, blank-selection, and answer-key time.

### 6.5 What is shown vs. hidden
- **Always shown**: all operators, `=` signs, header.
- **Mixed**: each number cell is a **given** (printed) or a **blank** (empty box). Blanks may be in
  **result** position (`8 : 2 = ▢`, forward) or **operand** position (`▢ · 7 = 21`, inverse), gated
  by difficulty (§13).

### 6.6 Worked example (negatives + a crossing)
```
horizontal:  A : 2 = ▢          vertical:   A
                                            -
                                            9
                                            =
                                            ▢
```
With `A = 6`: `6 : 2 = 3` and `6 - 9 = -3`. The shared `6` satisfies both; both results are
single-step deductions.

---

## 7. Procedural generation (seeded dense mesh)

### 7.1 Determinism principle
**All randomness draws from one seeded PRNG, consumed in a fixed order.** Given identical
**mathematical settings** (range, operators, difficulty, size), the whole worksheet is a **pure
function of the seed**.
- **Rendering-only settings** (notation, answer-key toggle, header) do **not** consume the PRNG, so
  they don't change the puzzle for a given seed.
- **Mathematical settings** do, so changing them changes the puzzle.
- Reproducibility holds **within a generator version** (NG5).

### 7.2 Seedable PRNG — `makePRNG(seed)`
A cyrb-style string hash → **mulberry32** generator. Provides `rnd()`, `rndInt(lo,hi)`, `pick(arr)`,
`shuffle(arr)`. No deps. A **seed is any string** (the UI uses a short token like `8F3K-217` and a
"randomize" 🎲 control).

### 7.3 Lattice & coordinate model
Equations live on a **logical lattice**: number cell `(i,j)` maps to **physical** grid cell
`(2i, 2j)`, leaving the gaps for operators/`=`:
- **Horizontal** equation at `(i,j)`: number cells `(i,j),(i,j+1),(i,j+2)` → physical
  `A=(2i,2j)`, `B=(2i,2j+2)`, `C=(2i,2j+4)`, with `op` at `(2i,2j+1)` and `=` at `(2i,2j+3)`.
- **Vertical** equation at `(i,j)`: number cells `(i,j),(i+1,j),(i+2,j)`, analogous downward.

Because horizontal op/`=` land on (even row, odd col) and vertical op/`=` on (odd row, even col),
operator cells of perpendicular equations **never collide** — only number cells (even,even) are
ever shared.

### 7.4 Dense growth **with value assignment** — `buildPuzzle(prng, settings)`
The key design choice: **numbers are assigned while the mesh grows**, so every equation already
holds when placed — the grid is *consistent by construction* (no separate solve that could fail).

1. Place a **seed equation** (random orientation), choosing operator + values that satisfy it.
2. Repeatedly grow: gather candidate equation slots that **cross the existing structure at ≥1
   number cell**, shuffle, and try to place them. A new equation may cross existing cells at **one
   or two** number positions → this creates the **loops** that make the mesh dense (not a tree).
3. **Placement rules**: each of the 3 number cells must be free in that direction (≤1 horizontal +
   ≤1 vertical per cell); must stay within the size's logical span; must touch existing structure
   (connected).
4. **Value assignment on placement** ([satisfy], §7.5): some of the new equation's cells are already
   valued (the crossings). For an operator from the allowed set, derive the **missing** values so
   the equation holds with the fixed ones. Commit only if a valid `(operator, values)` is found.
5. Stop at the size's target / when the region saturates.

Because each equation is satisfied the instant it is placed (using already-fixed crossing values),
**all crossings are automatically consistent** and no global backtracking is needed.

### 7.5 Value selection — `satisfyOnce` / `computeMissing` / `isTrivial`
- **`computeMissing(op, unknown, vals)`** inverts `A op B = C` for the one unknown cell:
  `C=A op B`; `A`= `C-B` / `C+B` / `C/B` / `C·B`; `B`= `C-A` / `A-C` / `C/A` / `A/C` — each
  re-validated through `checkEquation` (range, exact `÷`, no `÷0`). Returns `null` if impossible or
  **ambiguous** (e.g. `A·0=0` leaves `A` undetermined).
- **Two-pass preference for real arithmetic (G9)**: placement tries **all operators preferring
  non-trivial** values first (`poolVals` drops `0`, and drops `1` for `×`/`÷`; `isTrivial` rejects
  any zero or `×1`/`÷1`), and only **falls back** to allowing a trivial value if nothing else fits.
  This removes the `0·x=0` cascades and `×1` filler that plagued the first dense version.

### 7.6 Sizes (logical span → physical grid)
| Size | logical span (r×c) | physical grid | typical equations |
|---|---|---|---|
| Small | 4×4 | 9×9 | ~10 |
| Medium | 6×6 | 13×13 | ~23 |
| Large | 8×7 | 17×15 | ~35 |
| **Full page (A4)** | 11×9 (portrait) | **23×19** | **~60** |

Size is a target; under tight settings the achieved count may be lower (it saturates and stops).

### 7.7 Top-level `generate(seed, settings)`
Builds the PRNG, then loops `buildPuzzle` until a build reaches the size's **minimum equation
count** and `checkGrid` confirms consistency; tracks the best build as fallback. If the operator
set is too tight for the range, it **relaxes operators** (graceful degrade, FR-8). It **never
returns an inconsistent grid**, and is **deterministic** in `(seed, maths-settings)`.

---

## 8. Worksheet structure (output)
- **Title** auto-derived from the range: `min ≥ 0` → *"Mixed math operations to {max}"*; `min < 0`
  → *"…from {min} to {max}"*.
- **Subtitle** listing the operations + "left → right, top → bottom".
- **Seed label** (e.g. `seed: 8F3K-217`) so a printout is self-identifying/reproducible.
- **"Name:"** line.
- One-line **instruction**.
- The **grid**: connected bordered square cells (numbers, operators, `=`); given numbers printed,
  blanks as empty boxes; background cells empty.
- **Answer key** (optional): the fully-filled grid on a **separate page**, blanks shown in red,
  labelled with the same seed.

---

## 9. Functional requirements (map to code)

### 9.1 Core engine — single source of truth (G11)
- **FR-1 `evaluate(values, operators, opts)`** — left-to-right; returns the number or `INVALID`
  (out of range, non-exact `÷`, `÷0`). `opts = {minValue, maxValue}`.
- **FR-2 `checkEquation(a, op, b, c, opts)`** — `a,b,c` whole & in range, op valid, `evaluate===c`.
- **FR-3 `checkGrid(layout, assign, opAssign, opts)`** — all equations via `checkEquation`;
  `{status, consistent}`.
- **FR-4 `solveByPropagation(layout, givens, opAssign, opts)`** — fills any equation with **exactly
  one unknown** (via `computeMissing`); returns the resolved map, `'STUCK'`, or `'CONTRADICTION'`.
  Powers blank-selection and the solvability/uniqueness guarantee.

### 9.2 Seeded generation (G2–G4, G9)
- **FR-5 `makePRNG(seed)`** — the only randomness source (§7.2).
- **FR-6 `buildPuzzle(prng, settings)`** — grow the dense mesh on the lattice **and assign
  values/operators during growth** (§7.4); returns `{layout, assign, opAssign}`.
- **FR-7 value selection** — `satisfyOnce` + `computeMissing` + `isTrivial` + `poolVals` (§7.5):
  derive missing values, preferring non-trivial arithmetic.
- **FR-8 `generate(seed, settings)`** — retry builds to reach min size; operator-relax fallback;
  asserts `checkGrid(...).consistent`; deterministic.

### 9.3 Blank selection — unique, single-step solvability (G5)
- **FR-9 `chooseBlanks(layout, assign, opAssign, prng, settings)`** — greedily blank cells toward
  the difficulty target, **keeping a blank only if `solveByPropagation` over the remaining givens
  still fully resolves to exactly the solution**; otherwise skip. Guarantees single-step
  solvability and uniqueness (see §10.1).

### 9.4 Rendering, sizing & controls (G1, G8, G10)
- **FR-10 `buildSheet(W, isKey)`** — render the worksheet / answer-key page (§8).
- **FR-11 sizing** — `applyPrintCell(cols, rows)` sets `--cell-print` (mm) to **fit A4** (page minus
  margins minus header reserve, capped at 12mm); `fitGrid()` **measures the real on-screen sheet
  width** and sets `--cell` (px) so the grid fits the device — the basis of responsiveness; a
  `resize` listener re-runs it on rotate/resize. Font size scales with `--cell`.
- **FR-12 seed control** — editable seed field + "Randomize" (🎲). **New worksheet** picks a new
  random seed; typing a seed regenerates that exact sheet.
- **FR-13 print** — `window.print()`; print stylesheet emits only the worksheet (+ key page).
- **FR-14 answer key** toggle.

### 9.5 Settings (G7, G8)
- **FR-15 range** — presets `0–10 / 0–20 / 0–100 / -10–10` + custom min/max; `min ≤ max` enforced;
  negatives enabled automatically when `min < 0`.
- **FR-16 others** — size (incl. `a4`), allowed operators (≥1), difficulty, notation,
  operand-blanks, answer-key, optional footer.
- **FR-17** — maths settings change the puzzle for a seed; rendering-only settings don't.

---

## 10. Generation pipeline (summary)
0. **PRNG** from seed.
1. **`buildPuzzle`** — grow dense mesh **and assign numbers/operators together** (consistent by
   construction).
2. **`generate`** — retry to reach min size; operator-relax fallback.
3. **`chooseBlanks`** — propagation-verified blanks.
4. **`applyPrintCell` + `fitGrid`** — A4-fit (mm) and screen-fit (px).
5. **render** worksheet (+ key).

### 10.1 Why it is solvable without guessing **and** unique
A blank is kept only if `solveByPropagation` — which fills a cell **only when its equation has
exactly one unknown** — still resolves the entire grid. Therefore the final puzzle is always
fully deducible one step at a time (never "≥2 unknowns ⇒ guess"). And because every step is
**forced** (the inverse yields a single value), any valid solution must agree on every cell ⇒ the
solution is **unique**. The genuinely-ambiguous arithmetic cases (e.g. `A·0=0`) make `computeMissing`
return `null`, so such a cell is never chosen as a blank.

**Independently verified** (two separate checkers with their own arithmetic):
- a forced-step solver solved **600/600** worksheets (all sizes incl. A4, all difficulties incl.
  Hard, all ranges incl. `-10–10`) with **0 STUCK / 0 contradiction / 0 mismatch**;
- a brute-force solution counter found **exactly one** solution on every sampled Hard puzzle.

---

## 11. Shared-engine principle
Exactly **one** arithmetic implementation (`evaluate`); `checkEquation`, `checkGrid`,
`computeMissing`, and `solveByPropagation` all route through it. Range bounds, exact `÷`, `÷0`, and
negatives behave identically everywhere — at generation, blanking, and the answer key.

---

## 12. Print / PDF requirements
- P1. `@page { size:A4; margin:12mm }`; `@media print` hides all controls.
- P2. Cells sized in **mm** (`--cell-print`) to fit the A4 printable area minus a header reserve, so
  every size — up to the portrait **A4** size (≈186×225mm) — fits one page without clipping.
- P3. Crisp black-on-white connected grid (square bordered cells); proportional, legible font.
- P4. Answer key on its **own page**, blanks in red, same seed.
- P5. "Save as PDF" via the browser; no PDF library (TC2). Letter degrades gracefully.

---

## 13. Difficulty model
- **Easy**: fewer blanks (~0.30), **result-position only** (forward computation), simpler.
- **Medium**: moderate blanks (~0.42), results + some operands, all operators.
- **Hard**: more blanks (target ~0.55), operand blanks allowed (inverse ops).

The blank count **self-clamps**: `chooseBlanks` stops once another blank would break unique
single-step solvability (so Hard typically lands ~0.48, not 0.55). Difficulty, range, and size are
independent.

---

## 14. Configuration model (defaults)
```
Settings = {
  seed:          '(random on load, e.g. 8F3K-217)',
  size:          'medium',           // 'small' | 'medium' | 'large' | 'a4'
  minValue:      0,                  // adjustable; may be negative
  maxValue:      20,                 // adjustable
  operators:     ['+','-','*','/'],  // allowed set (>=1)
  notation:      'eu',               // 'eu' => · :   | 'std' => × ÷
  difficulty:    'medium',           // 'easy' | 'medium' | 'hard'
  operandBlanks: true,               // allow blanks in operand positions (inverse ops)
  answerKey:     true
}
```
*Mathematical (affect the seed's output): `size, minValue, maxValue, operators, difficulty,
operandBlanks`. Rendering-only: `notation, answerKey, header`.*

---

## 15. Responsive / on-screen behaviour
- The grid cell size on screen comes from **`fitGrid()`**, which measures the **actual sheet width**
  and divides by the column count (clamped 14–46px) → the whole puzzle fits the viewport, **no
  horizontal scroll**, on desktop and phones. A `resize` listener re-fits on rotate/resize.
- A **≤600px breakpoint** stacks controls full-width, reduces sheet padding, wraps the header
  ("Name:" below the title), and sets form inputs to **16px** (stops iOS zoom-on-focus).
- Print sizing (`applyPrintCell`, mm) is independent of screen sizing.

---

## 16. Bonus / optional (not built)
- B1. **Shareable code** encoding `seed + maths-settings` in one token.
- B2. **Batch generation** of N sheets from derived seeds.
- B3. **Denser interlocking variants** / multiple lattice aspect ratios.

---

## 17. Out of scope (deferred)
- Interactive on-screen solving / Check / Reveal.
- Non-binary equations; decimals/fractions (negative whole numbers are in scope).
- Cross-version seed stability (NG5).

---

## 18. Acceptance criteria (status)
- AC1. **Single `index.html`**, no external requests; works from `file://` and GitHub Pages. ✔
- AC2. **Determinism**: same `seed` + same maths-settings ⇒ identical worksheet; rendering-only
  settings don't change the puzzle. ✔ (0 failures across 900+ generations)
- AC3. **Consistency**: every generated sheet passes `checkGrid` — incl. negative & small ranges,
  all sizes. ✔ (0 failures)
- AC4. **Solvable without guessing & unique**: `solveByPropagation` fully resolves every sheet;
  independently re-verified by a forced-step solver (600/600) and a brute-force uniqueness counter
  (exactly one solution). ✔
- AC5. **Real arithmetic**: zero-operand frequency ~0.1%, trivial `×1`/`÷1` ~1.6%; all four
  operators present. ✔
- AC6. **Shared engine** — no duplicated arithmetic. ✔
- AC7. **Range controls** — presets + custom min/max; negatives; title reflects range. ✔
- AC8. **Answer key** matches exactly, separate page, seed-labelled. ✔
- AC9. **A4 print fit** — all sizes compute to fit A4 (worst case ≈186×225mm for the A4 size). ✔
  *(verified by the mm fit math; not yet validated on a physical print)*
- AC10. **Responsive** — no horizontal overflow at mobile widths; controls stack; 16px inputs. ✔
- AC11. **No hang** — bounded build retries + operator-relax fallback; degenerate ranges return a
  friendly error instead of hanging. ✔

---

## 19. Open questions / notes
- O1. **Product name** and default footer text.
- O2. **A4 print** is verified by the fit math, not by an actual paper/PDF print — worth one real
  print test (the header reserve is generous, so risk is low).
- O3. **Cross-version seed stability** (NG5) — acceptable today; if ever needed, version the seed.
- O4. **A4 on phones** uses small cells (~18px) so 19 columns fit the width — fine as a preview;
  for on-screen solving, Small/Medium read better.

---

## Appendix A — Reference pseudocode (matches the code)

```js
const INVALID = Symbol('INVALID');
const inRange = (x,o) => Number.isInteger(x) && x>=o.minValue && x<=o.maxValue;

// FR-1
function evaluate(values, operators, opts){
  let acc = values[0];
  if(!inRange(acc,opts)) return INVALID;
  for(let k=0;k<operators.length;k++){
    const n = values[k+1];
    switch(operators[k]){
      case '+': acc+=n; break;  case '-': acc-=n; break;  case '*': acc*=n; break;
      case '/': if(n===0 || acc%n!==0) return INVALID; acc/=n; break;
    }
    if(!inRange(acc,opts)) return INVALID;        // VR1/VR4
  }
  return acc;
}

// FR-2 / FR-3 route through evaluate (checkEquation, checkGrid) — the single source of truth.

// FR-7 — invert one equation for its single unknown (re-validated via checkEquation); null if
// impossible or ambiguous (e.g. A*0=0). isTrivial rejects zeros and ×1/÷1 in the "nice" pass.
function computeMissing(op, unknown, vals, opts){ /* C=A op B; A,B via inverse; check & range */ }
function isTrivial(op,a,b,c){ return a===0||b===0||c===0 || ((op==='*'||op==='/')&&(Math.abs(a)===1||Math.abs(b)===1)); }

// FR-6 — grow a DENSE mesh AND assign values together (consistency by construction)
function buildPuzzle(prng, settings){
  // seed equation, then repeatedly:
  //   pick candidate equation slots that cross existing number cells (1–2 crossings => loops)
  //   for each operator (preferring non-trivial via two passes), derive the FREE cells with
  //   computeMissing so the equation holds with the already-fixed crossing values; commit if ok.
  // bounded by the size's logical span; stop at target / saturation.
  // returns { layout:{cells,equations,numberCells,rows,cols}, assign, opAssign }
}

// FR-8 — deterministic top-level
function generate(seed, settings){
  const prng = makePRNG(seed);
  // attempt(): loop buildPuzzle until equations >= minEq(size) && checkGrid consistent; keep best.
  // fall back to a relaxed operator set if needed; then chooseBlanks(); else { error:true }.
}

// FR-4 — single-step deduction solver (blank validation + uniqueness)
function solveByPropagation(layout, givens, opAssign, opts){
  const v = new Map(givens);
  let progressed = true;
  while(progressed){ progressed=false;
    for(const e of layout.equations){
      if(['a','b','c'].filter(k=>!v.has(e[k])).length===1){    // exactly one unknown
        const r = solveOneUnknown(e, v, opAssign, opts);        // uses computeMissing
        if(r){ if(v.has(r.id)){ if(v.get(r.id)!==r.val) return 'CONTRADICTION'; }
               else { v.set(r.id,r.val); progressed=true; } }
      }
    }
  }
  return layout.numberCells.every(id=>v.has(id)) ? v : 'STUCK';
}

// FR-9 — keep a blank only if propagation still fully resolves to the solution
function chooseBlanks(layout, assign, opAssign, prng, settings){
  const blanks = new Set();
  for(const id of prng.shuffle(candidateCells(layout, settings))){   // honors operandBlanks/easy
    if(blanks.size >= target) break;
    const trial = new Set(blanks); trial.add(id);
    const res = solveByPropagation(layout, givensFrom(assign, trial), opAssign, settings);
    if(res!=='STUCK' && res!=='CONTRADICTION' && equals(res, assign)) blanks.add(id);
  }
  return blanks;
}

// FR-11 — sizing
function applyPrintCell(cols, rows){ /* --cell-print = min((210-24)/cols,(297-24-40)/rows,12) mm */ }
function fitGrid(){ /* --cell = clamp(floor(measuredSheetWidth / cols), 14, 46) px ; on resize too */ }
```

## Appendix B — Data model
```
Layout = {
  rows, cols,
  cells:       Map "r,c" -> { role: 'num'|'op'|'eq' },   // background cells absent from the map
  numberCells: cellId[],                                  // all role==='num'
  equations:   [ { a, op, b, eq, c, dir:'h'|'v' } ]       // a/b/c=number cells, op/eq=their cells
}

Worksheet (from generate) = {
  seed,
  layout:    Layout,
  assign:    Map numCellId -> number,    // the full solution (answer key)
  opAssign:  Map opCellId  -> '+|-|*|/',
  blanks:    Set numCellId,              // hidden cells the student fills
  settings:  Settings
}
```

---

*End of PRD.*
