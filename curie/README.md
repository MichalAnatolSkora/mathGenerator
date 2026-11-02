# Marie Curie's laboratory (Laboratorium Marii Skłodowskiej-Curie)

A paper game for ages 8–12 about how Maria Skłodowska-Curie and Pierre Curie found polonium and radium in 1898:
division, comparing and a graph. Printable A4 pages only, built on the shared [`sheet-kit`](../sheet-kit/kit.js),
seven languages (pl/en/uk/vi/fr/it/es). Card on the home page in the "bigger kids" group, before the Dwójka dossier
(screenshot `../assets/curie.png`).

| File | What it is |
|---|---|
| [`worksheet.html`](worksheet.html) | The sheet: "How did Marie work?", three missions, "How it really was", the answers |
| [`engine.js`](engine.js) | The three missions' generators, the separation tree, the bar chart and the decay graph |
| [`strings.js`](strings.js) | Texts in seven languages |
| [`curie-lab.jpg`](curie-lab.jpg), [`curie-room.jpg`](curie-room.jpg), [`curie-notebook.jpg`](curie-notebook.jpg) | Two photos and two pages of Marie's handwritten notebook on "How it really was" (see below) |
| [`engine.test.js`](engine.test.js) | `node engine.test.js`: 150 seeds × 3 levels (numbers whole, masses and units add up, the right tubes stronger, halves), drawings in every language, the same keys in every language |

## Pages

0. **How did Marie work?** (option, on): Maria's way from Warsaw to Paris, Becquerel's rays, the electrometer, the
   artificial chalcolite, splitting the ore, polonium and radium, half-life; a worked example of following the
   stronger tube; what we simplified (including that she carried tubes in her pocket, not knowing the danger).
1. **Mission 1 · Something is hiding in the ore** (comparing, division): six samples measured with the electrometer
   (pure uranium, pitchblende, natural chalcolite, chalcolite made by Marie, thorite, quartz). Our made-up scale:
   1 g of uranium = 2 units; thorite is as active as uranium per gram, so on ★/★★ it is never "stronger than uranium". ★ 1 g each, a bar chart to colour, "stronger than uranium?", times = units ÷ 2;
   ★★ different masses (units per 1 g = units ÷ grams), and the sample with the most units is never the strongest per gram (the question asks why); ★★★ grams of uranium in each sample, "extra" = units − 2 ×
   uranium, extra per gram; thorite has extra but it is thorium (not new), the made chalcolite has none.
2. **Mission 2 · Follow the stronger test tube** (comparing, division): 1 kg of pitchblende split in three steps as
   in 1898 (sulphides / solution / rest → bismuth → the sulphide that flies off when heated = polonium; solution →
   barium chloride → crystals = radium). Masses and units add up at every step (activity is not lost when splitting).
   The tube on the path is stronger per gram than its parent, the others weaker. ★ per-gram numbers, follow the
   strongest, polonium only (the solution waits "for later"); ★★ both paths; ★★★ tubes show mass and total units,
   per gram to work out, with at least one weaker but bigger tube that has more units in total (the trap) and a
   question on the sum of the first step. Polonium is always 800 units/g (400× uranium) and radium 1800 (900×),
   the Curies' own figures; the names are filled in from "P _ L _ N" with a hint.
3. **Mission 3 · Polonium grows weaker** (halving, a graph): a sample measured every 140 days (Marie's 1906 figure,
   today 138.4). ★ table and "when below …?", "after a year, more or less than a quarter?"; ★★ table, graph, 1/16;
   ★★★ counting back, radium's 1600 years (half left in 3502), how many 140-day halvings since 1902 (the notebooks
   are still radioactive because of radium).
4. **How it really was** (option, on): Marie's real table of 12 April 1898 (8 rows, original French names, current in
   10⁻¹² A), three questions on it, the July 1898 sentence naming polonium (French + translation), the notebooks at
   the BnF, the two Nobel Prizes, the Radium Institute in Warsaw (1932), two photos and two pages of Marie's handwritten laboratory notebook, with captions.
5. **Answers** (option, on): the solved tree and graph.

Same code + same settings ⇒ the same sheet. URL: `?seed=&level=easy|mid|hard&how=1|0&real=1|0&key=1|0`.

## Sources and care

M. Curie, "Rayons émis par les composés de l'uranium et du thorium", Comptes rendus 126 (1898), pp. 1101–1103 (the
table, the artificial chalcolite); P. Curie, M. Curie, "Sur une substance nouvelle radio-active, contenue dans la
pechblende", CR 127 (1898), pp. 175–178 (bismuth sulphide, volatility, 400×, the name); P. Curie, M. Curie,
G. Bémont, CR 127 (1898), pp. 1215–1217 (radium with barium, 900×); M. Curie, CR 142 (1906), p. 273 (polonium halves
in about 140 days); BnF, "Les cahiers de Marie Curie conservés à la BnF sont-ils radioactifs ?". The chemistry in the
tree is simplified (real work had dozens of steps and tonnes of ore); the numbers in the missions are made up and the
sheet says so. Photos, via Wikimedia Commons, made smaller (900 px):
- `curie-lab.jpg`: Marie Curie at Pierre Curie's quartz electrometer, about 1900; anonymous, public domain
  (`File:Marie Curie in her laboratory.jpg`).
- `curie-room.jpg`: inside the shed in rue Lhomond where the ore was processed and radium concentrated, *Œuvres de
  Pierre Curie* (1908), plate II, view 1, via Gallica; public domain.
- `curie-notebook.jpg`: two pages of Marie Curie's handwritten laboratory notebook (dates 19, 21, 22 January,
  drawings, measurements, "rien"), Wellcome Collection, CC BY 4.0 (`File:Pages from Marie Curie's notebook, Wellcome
  L0001764.jpg`); the credit is printed on the page.
