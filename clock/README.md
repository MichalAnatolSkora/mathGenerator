# Tell the Time (Nauka zegara)

Learning to read an analog clock. Plain HTML + vanilla JS, no build step, five languages (pl/en/uk/vi/fr).

| File | What it is |
|---|---|
| [`index.html`](index.html) | Online game |
| [`worksheet.html`](worksheet.html) | Printable A4 worksheets + answer key |
| [`engine.js`](engine.js) | Shared: seeded random times, clock SVG, time in words, wrong answers |
| [`strings.js`](strings.js) | Texts in five languages (`common`, `game`, `sheet`) |
| [`engine.test.js`](engine.test.js) | `node engine.test.js` |

## Levels and options (game and worksheet)

- **Levels:** o'clock and half past (`:00`, `:30`) · quarters · every 5 minutes · every minute.
- **Minutes on the dial:** small 00, 05, 10… labels round the edge (help for beginners).
- **24-hour clock:** times 0:00–23:59 with a time-of-day label (🌙 night, 🌅 morning, ☀️ afternoon, 🌆 evening);
  the clock face looks the same, the label tells whether to answer 3:30 or 15:30.

## Game

- **🔎 What time is it?** — the clock and four answers (digital + how it is said). The wrong answers come
  from typical mistakes: hands swapped, the hour one off (the short hand is already close to the next number),
  minutes read as the number the long hand points at (6 → "3:06"), the other half of the day.
- **✋ Set the clock** — drag the hands (or use ±1 h / ±5 min buttons; ±1 min on the "every minute" level).
  The hands are geared like a real teaching clock: turning the long hand moves the short one too.
  A wrong check says which hand is off and lets the child fix it; stars: 3 on the first try, 2 on the second, 1 later.
  After a wrong check "Show the answer" turns the hands to the right time.

Stars, streak and the chosen mode/level are saved in `localStorage` (`clock.v1`). URL: `?mode=read|set&level=half|quarter|five|minute`.

## Worksheet

Task: read the time (write it in boxes), draw the hands (empty face + the time, optionally in words), or mixed.
6 / 9 / 12 / 16 / 20 clocks on one A4 page; the answer key fits on a second page. Same code + same settings ⇒
the same sheet. URL: `?seed=&task=read|draw|mix&level=&n=&minutes=1&h24=1&words=1&key=1`.

## Time in words

Only for multiples of 5 minutes (otherwise just digits): pl "wpół do czwartej", "za kwadrans czwarta";
en "half past three"; uk "пів на четверту", "чверть по третій"; vi "3 giờ rưỡi", "4 giờ kém 15 phút";
fr "trois heures et demie", "quatre heures moins le quart".
