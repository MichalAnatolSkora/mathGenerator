/**
 * Texts of the latitude game and worksheet in seven languages (pl, en, uk, vi, fr, it, es). Classic script; defines the global `LAT_TEXT`.
 * `common` is shared by both pages, `game` belongs to index.html, `sheet` to worksheet.html.
 * Functions get plain values and return plain text (the pages escape it).
 *
 * N and S: the international letters, as on maps and GPS. Vietnamese schools write B (Bắc) and N (Nam) instead —
 * there "N" means south — so the Vietnamese texts use B / N and say what N / S mean on international maps.
 *
 * explainRead(o):  o = { f: "40°S", abs: 40, h: 'N' | 'S' | '0', city: name | null, km: "4 440" | null }
 * explainDiff(o):  o = { a, b: degrees from the equator, ha, hb: 'N' | 'S' | '0', d: degrees between, nA, nB: names or "A"/"B",
 *                        city: true for real places, km: "9 550" | null }
 */
const LAT_TEXT = (() => {
  const plPl = (n, one, few, many) => n === 1 ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  const ukPl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11) ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const hi = o => Math.max(o.a, o.b), lo = o => Math.min(o.a, o.b);
  const T = {};

  T.pl = {
    common: {
      brand: '🌍 Szerokość geograficzna: N i S',
      allPuzzles: '🧩 Wszystkie zagadki', printWorksheet: '🖨️ Karta pracy', playOnline: '🎮 Graj online',
      level: 'Poziom', levels: { l30: 'Co 30°', l10: 'Co 10°', l5: 'Co 5°', city: 'Miasta świata' },
      N: 'N', S: 'S',
      equator: 'Równik', cancer: 'Zwrotnik Raka', capricorn: 'Zwrotnik Koziorożca', arctic: 'Koło podbiegunowe północne', antarctic: 'Koło podbiegunowe południowe',
      optLines: 'Zwrotniki i koła podbiegunowe',
      rule: 'Równik to 0°. Na północ od równika jest N (półkula północna), na południe — S (półkula południowa). Liczymy zawsze od równika, aż do 90° na biegunie.',
      latWords: (a, h) => h === '0' ? 'równik' : `${a}° szerokości geograficznej ${h === 'N' ? 'północnej' : 'południowej'}`,
      cities: {
        northPole: 'Biegun Północny', reykjavik: 'Reykjavík', oslo: 'Oslo', gdansk: 'Gdańsk', warsaw: 'Warszawa', london: 'Londyn',
        krakow: 'Kraków', kyiv: 'Kijów', lviv: 'Lwów', paris: 'Paryż', marseille: 'Marsylia', rome: 'Rzym', newYork: 'Nowy Jork',
        madrid: 'Madryt', tokyo: 'Tokio', cairo: 'Kair', hanoi: 'Hanoi', mexico: 'Meksyk', mumbai: 'Mumbaj', hcmc: 'Ho Chi Minh',
        singapore: 'Singapur', quito: 'Quito', nairobi: 'Nairobi', jakarta: 'Dżakarta', lima: 'Lima', rio: 'Rio de Janeiro',
        johannesburg: 'Johannesburg', perth: 'Perth', santiago: 'Santiago de Chile', capeTown: 'Kapsztad', sydney: 'Sydney',
        buenosAires: 'Buenos Aires', wellington: 'Wellington', ushuaia: 'Ushuaia', southPole: 'Biegun Południowy',
      },
    },
    game: {
      title: 'Szerokość geograficzna N i S — gra',
      modeLabel: 'Rodzaj gry', modeRead: '🔎 Odczytaj', modeSet: '📍 Zaznacz', modeDiff: '📏 Ile stopni?',
      readQ: 'Na jakiej szerokości geograficznej leży czerwony punkt?',
      readQCity: n => `Na jakiej szerokości geograficznej leży ${n}?`,
      setQ: 'Zaznacz na mapie równoleżnik:',
      setQCity: n => `Zaznacz na mapie, na jakiej szerokości leży ${n}:`,
      setHelp: 'Stuknij mapę na właściwej wysokości albo przesuwaj linię strzałkami.',
      up: '▲ Na północ', down: '▼ Na południe',
      diffQ: 'Ile stopni dzieli punkty A i B z północy na południe?',
      diffQCity: (a, b) => `${a} i ${b} — ile stopni dzieli te miejsca z północy na południe?`,
      check: '✅ Sprawdź', next: 'Dalej ➜', show: '👀 Pokaż rozwiązanie',
      good: ['Brawo!', 'Świetnie!', 'Super!', 'Tak jest!', 'Doskonale!'], bad: 'Niestety nie.', shown: 'Oto rozwiązanie.',
      taskN: n => `Zadanie ${n}`,
      explainRead: o => {
        const who = o.city ? `${o.city} leży` : 'Punkt leży';
        let s;
        if (o.h === '0') s = `${who} na równiku — to 0°, bez litery N ani S.`;
        else if (o.h === 'N') s = `${who} nad równikiem, na półkuli północnej, więc piszemy N. Od równika w górę jest ${o.abs}°, czyli ${o.f}.${o.abs === 90 ? ' To biegun północny — bardziej na północ się nie da.' : ''}`;
        else s = `${who} pod równikiem, na półkuli południowej, więc piszemy S. Od równika w dół jest ${o.abs}°, czyli ${o.f}.${o.abs === 90 ? ' To biegun południowy — bardziej na południe się nie da.' : ''}`;
        return s + (o.km ? ` Do równika jest stąd ok. ${o.km} km (1° to ok. 111 km).` : '');
      },
      explainDiff: o => {
        let s;
        if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; s = `${o.city ? z : `Punkt ${z}`} leży na równiku, więc liczymy tylko od równika do drugiego: ${o.d}°.`; }
        else if (o.ha === o.hb) s = `Oba ${o.city ? 'miejsca' : 'punkty'} leżą na półkuli ${o.ha === 'N' ? 'północnej' : 'południowej'}, więc odejmujemy: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
        else s = `${o.city ? 'Te miejsca' : 'Punkty'} leżą po dwóch stronach równika, więc dodajemy drogę do równika i dalej: ${o.a} + ${o.b} = ${o.d}°.`;
        return s + (o.km ? ` To ok. ${o.km} km z północy na południe (1° to ok. 111 km).` : '');
      },
      yourLine: f => `Twoja linia jest na ${f}.`,
      fbSide: 'To po drugiej stronie równika: N jest nad równikiem, S pod nim.',
      fbNorth: 'Linia jest za daleko na północ — przesuń ją w dół.',
      fbSouth: 'Linia jest za daleko na południe — przesuń ją w górę.',
      tryAgain: 'Popraw i sprawdź jeszcze raz.',
      starsTitle: 'Zebrane gwiazdki', streakTitle: 'Seria dobrych odpowiedzi',
      stats: (ok, all, best) => `Dobrze: ${ok} z ${all} · najdłuższa seria: ${best}`,
      reset: 'Wyzeruj wyniki', resetConfirm: 'Wyzerować gwiazdki i wyniki?',
      mapLabel: 'Mapa świata z równoleżnikami',
    },
    sheet: {
      title: 'Szerokość geograficzna N i S — karta pracy',
      appTitle: '🌍 Szerokość geograficzna N i S — karta pracy',
      appSub: 'Karta A4 do druku: odczytaj z mapy, zaznacz na drabince, porównaj i policz stopnie. Z rozwiązaniami.',
      seed: 'Kod karty', seedHint: 'Ten sam kod i te same ustawienia ⇒ ta sama karta.', randomSeed: 'Losowy kod',
      tasks: 'Zadania', secs: { map: '🗺️ Odczytaj z mapy', ladder: '📍 Zaznacz na drabince', compare: '⬆️ Co bardziej na północ?', diff: '📏 Ile stopni?' },
      options: 'Opcje', optKey: 'Strona z rozwiązaniami',
      newWorksheet: 'Nowa karta', print: 'Drukuj / zapisz PDF',
      sheetTitle: 'Szerokość geograficzna: N i S', sheetSub: lvl => `Poziom: ${lvl}`,
      instr: {
        map: 'Odczytaj szerokość geograficzną punktów. Wpisz liczbę stopni i zakreśl N albo S (na równiku nie zakreślaj nic).',
        mapCity: 'Odczytaj z mapy, na jakiej szerokości leżą te miejsca (w przybliżeniu). Wpisz liczbę stopni i zakreśl N albo S.',
        ladder: 'Narysuj kropkę na każdej drabince w podanym miejscu.',
        compare: 'Zakreśl miejsce, które leży bardziej na północ.',
        diff: 'Ile stopni dzieli te miejsca z północy na południe?',
      },
      diffHint: 'Po tej samej stronie równika odejmij, po dwóch stronach dodaj.',
      name: 'Imię: ____________________', date: 'Data: ____________________', seedLabel: 'Kod:',
      keyTitle: 'Rozwiązania', keySub: lvl => `Poziom: ${lvl}`, keyApprox: 'Przy miastach liczy się wynik z dokładnością do kilku stopni.',
      summary: p => `${p} ${plPl(p, 'strona', 'strony', 'stron')}`,
      genError: 'Błąd: ', noTasks: 'Wybierz przynajmniej jedno zadanie.',
    },
  };

  T.en = {
    common: {
      brand: '🌍 Latitude: N and S',
      allPuzzles: '🧩 All puzzles', printWorksheet: '🖨️ Worksheet', playOnline: '🎮 Play online',
      level: 'Level', levels: { l30: 'Every 30°', l10: 'Every 10°', l5: 'Every 5°', city: 'World cities' },
      N: 'N', S: 'S',
      equator: 'Equator', cancer: 'Tropic of Cancer', capricorn: 'Tropic of Capricorn', arctic: 'Arctic Circle', antarctic: 'Antarctic Circle',
      optLines: 'Tropics and polar circles',
      rule: 'The equator is 0°. North of the equator is N (the Northern Hemisphere), south of it is S (the Southern Hemisphere). Always count from the equator, up to 90° at the poles.',
      latWords: (a, h) => h === '0' ? 'the equator' : `${a} degrees ${h === 'N' ? 'north' : 'south'}`,
      cities: {
        northPole: 'the North Pole', reykjavik: 'Reykjavík', oslo: 'Oslo', gdansk: 'Gdańsk', warsaw: 'Warsaw', london: 'London',
        krakow: 'Kraków', kyiv: 'Kyiv', lviv: 'Lviv', paris: 'Paris', marseille: 'Marseille', rome: 'Rome', newYork: 'New York',
        madrid: 'Madrid', tokyo: 'Tokyo', cairo: 'Cairo', hanoi: 'Hanoi', mexico: 'Mexico City', mumbai: 'Mumbai', hcmc: 'Ho Chi Minh City',
        singapore: 'Singapore', quito: 'Quito', nairobi: 'Nairobi', jakarta: 'Jakarta', lima: 'Lima', rio: 'Rio de Janeiro',
        johannesburg: 'Johannesburg', perth: 'Perth', santiago: 'Santiago', capeTown: 'Cape Town', sydney: 'Sydney',
        buenosAires: 'Buenos Aires', wellington: 'Wellington', ushuaia: 'Ushuaia', southPole: 'the South Pole',
      },
    },
    game: {
      title: 'Latitude N and S — game',
      modeLabel: 'Game mode', modeRead: '🔎 Read', modeSet: '📍 Mark', modeDiff: '📏 How many degrees?',
      readQ: 'What is the latitude of the red dot?',
      readQCity: n => `What is the latitude of ${n}?`,
      setQ: 'Mark this latitude on the map:',
      setQCity: n => `Mark the latitude of ${n} on the map:`,
      setHelp: 'Tap the map at the right height, or move the line with the arrows.',
      up: '▲ North', down: '▼ South',
      diffQ: 'How many degrees apart are A and B, from north to south?',
      diffQCity: (a, b) => `${cap(a)} and ${b}: how many degrees apart are they, from north to south?`,
      check: '✅ Check', next: 'Next ➜', show: '👀 Show the answer',
      good: ['Well done!', 'Great!', 'Super!', 'That’s right!', 'Excellent!'], bad: 'Not quite.', shown: 'Here is the answer.',
      taskN: n => `Task ${n}`,
      explainRead: o => {
        const who = o.city ? `${cap(o.city)} is` : 'The dot is';
        let s;
        if (o.h === '0') s = `${who} on the equator: 0°, with no N or S.`;
        else if (o.h === 'N') s = `${who} above the equator, in the Northern Hemisphere, so we write N. From the equator up it is ${o.abs}°, so ${o.f}.${o.abs === 90 ? ' That is the North Pole — you cannot go further north.' : ''}`;
        else s = `${who} below the equator, in the Southern Hemisphere, so we write S. From the equator down it is ${o.abs}°, so ${o.f}.${o.abs === 90 ? ' That is the South Pole — you cannot go further south.' : ''}`;
        return s + (o.km ? ` From here to the equator is about ${o.km} km (1° is about 111 km).` : '');
      },
      explainDiff: o => {
        let s;
        if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; s = `${o.city ? cap(z) : `Point ${z}`} is on the equator, so we only count from the equator to the other one: ${o.d}°.`; }
        else if (o.ha === o.hb) s = `Both are in the ${o.ha === 'N' ? 'Northern' : 'Southern'} Hemisphere, so we subtract: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
        else s = `They are on opposite sides of the equator, so we add the way to the equator and on from it: ${o.a} + ${o.b} = ${o.d}°.`;
        return s + (o.km ? ` That is about ${o.km} km from north to south (1° is about 111 km).` : '');
      },
      yourLine: f => `Your line is at ${f}.`,
      fbSide: 'That is on the other side of the equator: N is above the equator, S below it.',
      fbNorth: 'The line is too far north — move it down.',
      fbSouth: 'The line is too far south — move it up.',
      tryAgain: 'Fix it and check again.',
      starsTitle: 'Stars collected', streakTitle: 'Right answers in a row',
      stats: (ok, all, best) => `Right: ${ok} of ${all} · best streak: ${best}`,
      reset: 'Reset scores', resetConfirm: 'Reset the stars and scores?',
      mapLabel: 'World map with lines of latitude',
    },
    sheet: {
      title: 'Latitude N and S — worksheet',
      appTitle: '🌍 Latitude N and S — worksheet',
      appSub: 'A printable A4 sheet: read the map, mark the scale, compare and count degrees. With an answer key.',
      seed: 'Sheet code', seedHint: 'Same code + same settings ⇒ the same sheet.', randomSeed: 'Random code',
      tasks: 'Tasks', secs: { map: '🗺️ Read the map', ladder: '📍 Mark the scale', compare: '⬆️ Which is further north?', diff: '📏 How many degrees?' },
      options: 'Options', optKey: 'Answer key page',
      newWorksheet: 'New sheet', print: 'Print / Save PDF',
      sheetTitle: 'Latitude: N and S', sheetSub: lvl => `Level: ${lvl}`,
      instr: {
        map: 'Read the latitude of each point. Write the number of degrees and circle N or S (on the equator, circle nothing).',
        mapCity: 'Read from the map at what latitude these places are (roughly). Write the number of degrees and circle N or S.',
        ladder: 'Draw a dot on each scale at the given latitude.',
        compare: 'Circle the place that is further north.',
        diff: 'How many degrees apart are these places, from north to south?',
      },
      diffHint: 'On the same side of the equator, subtract; on opposite sides, add.',
      name: 'Name: ____________________', date: 'Date: ____________________', seedLabel: 'Code:',
      keyTitle: 'Answer key', keySub: lvl => `Level: ${lvl}`, keyApprox: 'For cities, an answer a few degrees off is fine.',
      summary: p => `${p} ${p === 1 ? 'page' : 'pages'}`,
      genError: 'Error: ', noTasks: 'Pick at least one task.',
    },
  };

  T.uk = {
    common: {
      brand: '🌍 Географічна широта: N і S',
      allPuzzles: '🧩 Усі головоломки', printWorksheet: '🖨️ Робочий аркуш', playOnline: '🎮 Грати онлайн',
      level: 'Рівень', levels: { l30: 'Кожні 30°', l10: 'Кожні 10°', l5: 'Кожні 5°', city: 'Міста світу' },
      N: 'N', S: 'S',
      equator: 'Екватор', cancer: 'Північний тропік', capricorn: 'Південний тропік', arctic: 'Північне полярне коло', antarctic: 'Південне полярне коло',
      optLines: 'Тропіки й полярні кола',
      rule: 'Екватор — це 0°. На північ від екватора — N (північна широта, пн. ш.), на південь — S (південна широта, пд. ш.). Завжди рахуємо від екватора, аж до 90° на полюсі.',
      latWords: (a, h) => h === '0' ? 'екватор' : `${a}° ${h === 'N' ? 'північної' : 'південної'} широти`,
      cities: {
        northPole: 'Північний полюс', reykjavik: 'Рейк’явік', oslo: 'Осло', gdansk: 'Гданськ', warsaw: 'Варшава', london: 'Лондон',
        krakow: 'Краків', kyiv: 'Київ', lviv: 'Львів', paris: 'Париж', marseille: 'Марсель', rome: 'Рим', newYork: 'Нью-Йорк',
        madrid: 'Мадрид', tokyo: 'Токіо', cairo: 'Каїр', hanoi: 'Ханой', mexico: 'Мехіко', mumbai: 'Мумбаї', hcmc: 'Хошимін',
        singapore: 'Сінгапур', quito: 'Кіто', nairobi: 'Найробі', jakarta: 'Джакарта', lima: 'Ліма', rio: 'Ріо-де-Жанейро',
        johannesburg: 'Йоганнесбург', perth: 'Перт', santiago: 'Сантьяго', capeTown: 'Кейптаун', sydney: 'Сідней',
        buenosAires: 'Буенос-Айрес', wellington: 'Веллінгтон', ushuaia: 'Ушуая', southPole: 'Південний полюс',
      },
    },
    game: {
      title: 'Широта N і S — гра',
      modeLabel: 'Режим гри', modeRead: '🔎 Визнач', modeSet: '📍 Познач', modeDiff: '📏 Скільки градусів?',
      readQ: 'На якій широті лежить червона точка?',
      readQCity: n => `На якій широті лежить ${n}?`,
      setQ: 'Познач на мапі паралель:',
      setQCity: n => `Познач на мапі широту, на якій лежить ${n}:`,
      setHelp: 'Торкнися мапи на потрібній висоті або пересувай лінію стрілками.',
      up: '▲ На північ', down: '▼ На південь',
      diffQ: 'Скільки градусів між точками A і B з півночі на південь?',
      diffQCity: (a, b) => `${a} і ${b}: скільки градусів між ними з півночі на південь?`,
      check: '✅ Перевірити', next: 'Далі ➜', show: '👀 Показати відповідь',
      good: ['Молодець!', 'Чудово!', 'Супер!', 'Так!', 'Відмінно!'], bad: 'На жаль, ні.', shown: 'Ось відповідь.',
      taskN: n => `Завдання ${n}`,
      explainRead: o => {
        const who = o.city ? `${o.city} лежить` : 'Точка лежить';
        let s;
        if (o.h === '0') s = `${who} на екваторі — це 0°, без літери N чи S.`;
        else if (o.h === 'N') s = `${who} над екватором, у Північній півкулі, тому пишемо N. Від екватора вгору ${o.abs}°, тобто ${o.f}.${o.abs === 90 ? ' Це Північний полюс — далі на північ уже нікуди.' : ''}`;
        else s = `${who} під екватором, у Південній півкулі, тому пишемо S. Від екватора вниз ${o.abs}°, тобто ${o.f}.${o.abs === 90 ? ' Це Південний полюс — далі на південь уже нікуди.' : ''}`;
        return s + (o.km ? ` Звідси до екватора близько ${o.km} км (1° — це приблизно 111 км).` : '');
      },
      explainDiff: o => {
        let s;
        if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; s = `${o.city ? z : `Точка ${z}`} лежить на екваторі, тож рахуємо лише від екватора до другої: ${o.d}°.`; }
        else if (o.ha === o.hb) s = `Обидві ${o.city ? 'місцини' : 'точки'} лежать у ${o.ha === 'N' ? 'Північній' : 'Південній'} півкулі, тож віднімаємо: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
        else s = `Вони лежать по різні боки екватора, тож додаємо шлях до екватора й далі: ${o.a} + ${o.b} = ${o.d}°.`;
        return s + (o.km ? ` Це близько ${o.km} км з півночі на південь (1° — приблизно 111 км).` : '');
      },
      yourLine: f => `Твоя лінія на ${f}.`,
      fbSide: 'Це з іншого боку екватора: N — над екватором, S — під ним.',
      fbNorth: 'Лінія задалеко на північ — посунь її вниз.',
      fbSouth: 'Лінія задалеко на південь — посунь її вгору.',
      tryAgain: 'Виправ і перевір ще раз.',
      starsTitle: 'Зібрані зірочки', streakTitle: 'Правильні відповіді поспіль',
      stats: (ok, all, best) => `Правильно: ${ok} з ${all} · найдовша серія: ${best}`,
      reset: 'Скинути результати', resetConfirm: 'Скинути зірочки й результати?',
      mapLabel: 'Мапа світу з паралелями',
    },
    sheet: {
      title: 'Широта N і S — робочий аркуш',
      appTitle: '🌍 Широта N і S — робочий аркуш',
      appSub: 'Аркуш A4 для друку: визнач на мапі, познач на шкалі, порівняй і порахуй градуси. З відповідями.',
      seed: 'Код аркуша', seedHint: 'Той самий код і ті самі налаштування ⇒ той самий аркуш.', randomSeed: 'Випадковий код',
      tasks: 'Завдання', secs: { map: '🗺️ Визнач на мапі', ladder: '📍 Познач на шкалі', compare: '⬆️ Що далі на північ?', diff: '📏 Скільки градусів?' },
      options: 'Параметри', optKey: 'Сторінка з відповідями',
      newWorksheet: 'Новий аркуш', print: 'Друкувати / зберегти PDF',
      sheetTitle: 'Географічна широта: N і S', sheetSub: lvl => `Рівень: ${lvl}`,
      instr: {
        map: 'Визнач широту кожної точки. Впиши кількість градусів і обведи N або S (на екваторі нічого не обводь).',
        mapCity: 'Визнач за мапою, на якій широті лежать ці місця (приблизно). Впиши кількість градусів і обведи N або S.',
        ladder: 'Намалюй крапку на кожній шкалі в указаному місці.',
        compare: 'Обведи місце, яке лежить далі на північ.',
        diff: 'Скільки градусів між цими місцями з півночі на південь?',
      },
      diffHint: 'По один бік екватора — віднімай, по різні боки — додавай.',
      name: 'Ім’я: ____________________', date: 'Дата: ____________________', seedLabel: 'Код:',
      keyTitle: 'Відповіді', keySub: lvl => `Рівень: ${lvl}`, keyApprox: 'Для міст відповідь може відрізнятися на кілька градусів.',
      summary: p => `${p} ${ukPl(p, 'сторінка', 'сторінки', 'сторінок')}`,
      genError: 'Помилка: ', noTasks: 'Вибери хоча б одне завдання.',
    },
  };

  T.vi = {
    common: {
      brand: '🌍 Vĩ độ Bắc và Nam',
      allPuzzles: '🧩 Tất cả câu đố', printWorksheet: '🖨️ Phiếu bài tập', playOnline: '🎮 Chơi trực tuyến',
      level: 'Mức độ', levels: { l30: 'Mỗi 30°', l10: 'Mỗi 10°', l5: 'Mỗi 5°', city: 'Các thành phố' },
      N: 'B', S: 'N',
      equator: 'Xích đạo', cancer: 'Chí tuyến Bắc', capricorn: 'Chí tuyến Nam', arctic: 'Vòng cực Bắc', antarctic: 'Vòng cực Nam',
      optLines: 'Chí tuyến và vòng cực',
      rule: 'Xích đạo là 0°. Phía bắc xích đạo ghi B (Bắc bán cầu), phía nam ghi N (Nam bán cầu). Luôn đếm từ xích đạo, đến 90° ở hai cực. Bản đồ quốc tế và GPS viết N/S: N = North = Bắc, S = South = Nam.',
      latWords: (a, h) => h === '0' ? 'xích đạo' : `vĩ độ ${a}° ${h === 'N' ? 'Bắc' : 'Nam'}`,
      cities: {
        northPole: 'Bắc Cực', reykjavik: 'Reykjavík', oslo: 'Oslo', gdansk: 'Gdańsk', warsaw: 'Vác-sa-va', london: 'Luân Đôn',
        krakow: 'Kraków', kyiv: 'Kyiv', lviv: 'Lviv', paris: 'Paris', marseille: 'Marseille', rome: 'Roma', newYork: 'New York',
        madrid: 'Madrid', tokyo: 'Tokyo', cairo: 'Cairo', hanoi: 'Hà Nội', mexico: 'Thành phố México', mumbai: 'Mumbai', hcmc: 'TP. Hồ Chí Minh',
        singapore: 'Singapore', quito: 'Quito', nairobi: 'Nairobi', jakarta: 'Jakarta', lima: 'Lima', rio: 'Rio de Janeiro',
        johannesburg: 'Johannesburg', perth: 'Perth', santiago: 'Santiago', capeTown: 'Cape Town', sydney: 'Sydney',
        buenosAires: 'Buenos Aires', wellington: 'Wellington', ushuaia: 'Ushuaia', southPole: 'Nam Cực',
      },
    },
    game: {
      title: 'Vĩ độ Bắc và Nam — trò chơi',
      modeLabel: 'Chế độ chơi', modeRead: '🔎 Đọc vĩ độ', modeSet: '📍 Đánh dấu', modeDiff: '📏 Bao nhiêu độ?',
      readQ: 'Chấm đỏ nằm ở vĩ độ nào?',
      readQCity: n => `${n} nằm ở vĩ độ nào?`,
      setQ: 'Đánh dấu vĩ tuyến này trên bản đồ:',
      setQCity: n => `Đánh dấu trên bản đồ vĩ độ của ${n}:`,
      setHelp: 'Chạm vào bản đồ ở đúng độ cao, hoặc dịch đường kẻ bằng các mũi tên.',
      up: '▲ Lên phía bắc', down: '▼ Xuống phía nam',
      diffQ: 'Từ bắc xuống nam, A và B cách nhau bao nhiêu độ?',
      diffQCity: (a, b) => `${a} và ${b}: từ bắc xuống nam cách nhau bao nhiêu độ?`,
      check: '✅ Kiểm tra', next: 'Tiếp ➜', show: '👀 Xem đáp án',
      good: ['Giỏi lắm!', 'Tuyệt vời!', 'Siêu!', 'Đúng rồi!', 'Xuất sắc!'], bad: 'Chưa đúng.', shown: 'Đây là đáp án.',
      taskN: n => `Bài ${n}`,
      explainRead: o => {
        const who = o.city ? `${o.city} nằm` : 'Chấm đỏ nằm';
        let s;
        if (o.h === '0') s = `${who} trên xích đạo: 0°, không ghi B hay N.`;
        else if (o.h === 'N') s = `${who} phía trên xích đạo, ở Bắc bán cầu, nên ghi B. Từ xích đạo đi lên ${o.abs}°, tức là ${o.f}.${o.abs === 90 ? ' Đó là Bắc Cực — không thể đi xa hơn về phía bắc.' : ''}`;
        else s = `${who} phía dưới xích đạo, ở Nam bán cầu, nên ghi N. Từ xích đạo đi xuống ${o.abs}°, tức là ${o.f}.${o.abs === 90 ? ' Đó là Nam Cực — không thể đi xa hơn về phía nam.' : ''}`;
        return s + (o.km ? ` Từ đây đến xích đạo khoảng ${o.km} km (1° khoảng 111 km).` : '');
      },
      explainDiff: o => {
        let s;
        if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; s = `${o.city ? z : `Điểm ${z}`} nằm trên xích đạo, nên chỉ cần đếm từ xích đạo đến điểm kia: ${o.d}°.`; }
        else if (o.ha === o.hb) s = `Cả hai đều ở ${o.ha === 'N' ? 'Bắc' : 'Nam'} bán cầu, nên ta trừ: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
        else s = `Hai nơi ở hai bên xích đạo, nên ta cộng đoạn đến xích đạo và đoạn tiếp theo: ${o.a} + ${o.b} = ${o.d}°.`;
        return s + (o.km ? ` Tức là khoảng ${o.km} km từ bắc xuống nam (1° khoảng 111 km).` : '');
      },
      yourLine: f => `Đường của em ở ${f}.`,
      fbSide: 'Đó là phía bên kia xích đạo: B ở trên xích đạo, N ở dưới.',
      fbNorth: 'Đường kẻ quá xa về phía bắc — hãy dịch xuống.',
      fbSouth: 'Đường kẻ quá xa về phía nam — hãy dịch lên.',
      tryAgain: 'Sửa lại rồi kiểm tra lần nữa.',
      starsTitle: 'Số sao đã nhận', streakTitle: 'Số câu đúng liên tiếp',
      stats: (ok, all, best) => `Đúng: ${ok}/${all} · chuỗi dài nhất: ${best}`,
      reset: 'Xóa kết quả', resetConfirm: 'Xóa số sao và kết quả?',
      mapLabel: 'Bản đồ thế giới với các vĩ tuyến',
    },
    sheet: {
      title: 'Vĩ độ Bắc và Nam — phiếu bài tập',
      appTitle: '🌍 Vĩ độ Bắc và Nam — phiếu bài tập',
      appSub: 'Phiếu A4 để in: đọc bản đồ, đánh dấu trên thang, so sánh và tính số độ. Kèm đáp án.',
      seed: 'Mã phiếu', seedHint: 'Cùng mã + cùng cài đặt ⇒ cùng một phiếu.', randomSeed: 'Mã ngẫu nhiên',
      tasks: 'Bài tập', secs: { map: '🗺️ Đọc bản đồ', ladder: '📍 Đánh dấu trên thang', compare: '⬆️ Nơi nào xa hơn về phía bắc?', diff: '📏 Bao nhiêu độ?' },
      options: 'Tùy chọn', optKey: 'Trang đáp án',
      newWorksheet: 'Phiếu mới', print: 'In / Lưu PDF',
      sheetTitle: 'Vĩ độ Bắc (B) và Nam (N)', sheetSub: lvl => `Mức độ: ${lvl}`,
      instr: {
        map: 'Đọc vĩ độ của mỗi điểm. Viết số độ và khoanh B hoặc N (trên xích đạo thì không khoanh gì).',
        mapCity: 'Đọc trên bản đồ xem các nơi này nằm ở vĩ độ nào (gần đúng). Viết số độ và khoanh B hoặc N.',
        ladder: 'Vẽ một chấm trên mỗi thang ở vĩ độ đã cho.',
        compare: 'Khoanh nơi nằm xa hơn về phía bắc.',
        diff: 'Từ bắc xuống nam, các nơi này cách nhau bao nhiêu độ?',
      },
      diffHint: 'Cùng một bên xích đạo thì trừ; ở hai bên thì cộng.',
      name: 'Họ tên: ____________________', date: 'Ngày: ____________________', seedLabel: 'Mã:',
      keyTitle: 'Đáp án', keySub: lvl => `Mức độ: ${lvl}`, keyApprox: 'Với các thành phố, sai lệch vài độ vẫn được tính là đúng.',
      summary: p => `${p} trang`,
      genError: 'Lỗi: ', noTasks: 'Hãy chọn ít nhất một bài tập.',
    },
  };

  T.fr = {
    common: {
      brand: '🌍 Latitude : N et S',
      allPuzzles: '🧩 Toutes les énigmes', printWorksheet: '🖨️ Fiche d’exercices', playOnline: '🎮 Jouer en ligne',
      level: 'Niveau', levels: { l30: 'Tous les 30°', l10: 'Tous les 10°', l5: 'Tous les 5°', city: 'Villes du monde' },
      N: 'N', S: 'S',
      equator: 'Équateur', cancer: 'Tropique du Cancer', capricorn: 'Tropique du Capricorne', arctic: 'Cercle arctique', antarctic: 'Cercle antarctique',
      optLines: 'Tropiques et cercles polaires',
      rule: 'L’équateur, c’est 0°. Au nord de l’équateur, on écrit N (hémisphère Nord) ; au sud, S (hémisphère Sud). On compte toujours à partir de l’équateur, jusqu’à 90° au pôle.',
      latWords: (a, h) => h === '0' ? 'l’équateur' : `${a}° de latitude ${h === 'N' ? 'nord' : 'sud'}`,
      cities: {
        northPole: 'le pôle Nord', reykjavik: 'Reykjavik', oslo: 'Oslo', gdansk: 'Gdańsk', warsaw: 'Varsovie', london: 'Londres',
        krakow: 'Cracovie', kyiv: 'Kyiv', lviv: 'Lviv', paris: 'Paris', marseille: 'Marseille', rome: 'Rome', newYork: 'New York',
        madrid: 'Madrid', tokyo: 'Tokyo', cairo: 'Le Caire', hanoi: 'Hanoï', mexico: 'Mexico', mumbai: 'Bombay', hcmc: 'Hô-Chi-Minh-Ville',
        singapore: 'Singapour', quito: 'Quito', nairobi: 'Nairobi', jakarta: 'Jakarta', lima: 'Lima', rio: 'Rio de Janeiro',
        johannesburg: 'Johannesburg', perth: 'Perth', santiago: 'Santiago du Chili', capeTown: 'Le Cap', sydney: 'Sydney',
        buenosAires: 'Buenos Aires', wellington: 'Wellington', ushuaia: 'Ushuaïa', southPole: 'le pôle Sud',
      },
    },
    game: {
      title: 'Latitude N et S — jeu',
      modeLabel: 'Mode de jeu', modeRead: '🔎 Lire', modeSet: '📍 Placer', modeDiff: '📏 Combien de degrés ?',
      readQ: 'À quelle latitude se trouve le point rouge ?',
      readQCity: n => `À quelle latitude se trouve ${n} ?`,
      setQ: 'Trace ce parallèle sur la carte :',
      setQCity: n => `Trace sur la carte la latitude de ${n.replace(/^le /, 'du ')} :`,
      setHelp: 'Touche la carte à la bonne hauteur, ou déplace la ligne avec les flèches.',
      up: '▲ Vers le nord', down: '▼ Vers le sud',
      diffQ: 'Combien de degrés séparent A et B, du nord au sud ?',
      diffQCity: (a, b) => `${cap(a)} et ${b} : combien de degrés les séparent, du nord au sud ?`,
      check: '✅ Vérifier', next: 'Suivant ➜', show: '👀 Voir la réponse',
      good: ['Bravo !', 'Génial !', 'Super !', 'C’est ça !', 'Excellent !'], bad: 'Pas tout à fait.', shown: 'Voici la réponse.',
      taskN: n => `Exercice ${n}`,
      explainRead: o => {
        const who = o.city ? `${cap(o.city)} se trouve` : 'Le point se trouve';
        let s;
        if (o.h === '0') s = `${who} sur l’équateur : 0°, sans N ni S.`;
        else if (o.h === 'N') s = `${who} au-dessus de l’équateur, dans l’hémisphère Nord, donc on écrit N. De l’équateur vers le haut, il y a ${o.abs}°, donc ${o.f}.${o.abs === 90 ? ' C’est le pôle Nord : impossible d’aller plus au nord.' : ''}`;
        else s = `${who} au-dessous de l’équateur, dans l’hémisphère Sud, donc on écrit S. De l’équateur vers le bas, il y a ${o.abs}°, donc ${o.f}.${o.abs === 90 ? ' C’est le pôle Sud : impossible d’aller plus au sud.' : ''}`;
        return s + (o.km ? ` D’ici à l’équateur, il y a environ ${o.km} km (1° fait environ 111 km).` : '');
      },
      explainDiff: o => {
        let s;
        if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; s = `${o.city ? cap(z) : `Le point ${z}`} est sur l’équateur, on compte donc seulement de l’équateur jusqu’à l’autre : ${o.d}°.`; }
        else if (o.ha === o.hb) s = `Les deux sont dans l’hémisphère ${o.ha === 'N' ? 'Nord' : 'Sud'}, donc on soustrait : ${hi(o)} − ${lo(o)} = ${o.d}°.`;
        else s = `Ils sont de part et d’autre de l’équateur, donc on additionne le chemin jusqu’à l’équateur et au-delà : ${o.a} + ${o.b} = ${o.d}°.`;
        return s + (o.km ? ` Cela fait environ ${o.km} km du nord au sud (1° fait environ 111 km).` : '');
      },
      yourLine: f => `Ta ligne est à ${f}.`,
      fbSide: 'C’est de l’autre côté de l’équateur : N est au-dessus de l’équateur, S au-dessous.',
      fbNorth: 'La ligne est trop au nord : descends-la.',
      fbSouth: 'La ligne est trop au sud : monte-la.',
      tryAgain: 'Corrige et vérifie encore une fois.',
      starsTitle: 'Étoiles gagnées', streakTitle: 'Bonnes réponses d’affilée',
      stats: (ok, all, best) => `Juste : ${ok} sur ${all} · meilleure série : ${best}`,
      reset: 'Remettre à zéro', resetConfirm: 'Remettre à zéro les étoiles et les scores ?',
      mapLabel: 'Carte du monde avec les parallèles',
    },
    sheet: {
      title: 'Latitude N et S — fiche d’exercices',
      appTitle: '🌍 Latitude N et S — fiche d’exercices',
      appSub: 'Une fiche A4 à imprimer : lire la carte, placer sur l’échelle, comparer et compter les degrés. Avec le corrigé.',
      seed: 'Code de la fiche', seedHint: 'Même code + mêmes réglages ⇒ la même fiche.', randomSeed: 'Code au hasard',
      tasks: 'Exercices', secs: { map: '🗺️ Lire la carte', ladder: '📍 Placer sur l’échelle', compare: '⬆️ Le plus au nord ?', diff: '📏 Combien de degrés ?' },
      options: 'Options', optKey: 'Page du corrigé',
      newWorksheet: 'Nouvelle fiche', print: 'Imprimer / PDF',
      sheetTitle: 'Latitude : N et S', sheetSub: lvl => `Niveau : ${lvl}`,
      instr: {
        map: 'Lis la latitude de chaque point. Écris le nombre de degrés et entoure N ou S (sur l’équateur, n’entoure rien).',
        mapCity: 'Lis sur la carte à quelle latitude se trouvent ces lieux (à peu près). Écris le nombre de degrés et entoure N ou S.',
        ladder: 'Dessine un point sur chaque échelle à la latitude donnée.',
        compare: 'Entoure le lieu qui est le plus au nord.',
        diff: 'Combien de degrés séparent ces lieux, du nord au sud ?',
      },
      diffHint: 'Du même côté de l’équateur, on soustrait ; de part et d’autre, on additionne.',
      name: 'Prénom : ____________________', date: 'Date : ____________________', seedLabel: 'Code :',
      keyTitle: 'Corrigé', keySub: lvl => `Niveau : ${lvl}`, keyApprox: 'Pour les villes, quelques degrés d’écart sont acceptés.',
      summary: p => `${p} ${p <= 1 ? 'page' : 'pages'}`,
      genError: 'Erreur : ', noTasks: 'Choisis au moins un exercice.',
    },
  };

  T.it = {
    common: {
      brand: '🌍 Latitudine: N e S',
      allPuzzles: '🧩 Tutti i rompicapi', printWorksheet: '🖨️ Scheda di esercizi', playOnline: '🎮 Gioca online',
      level: 'Livello', levels: { l30: 'Ogni 30°', l10: 'Ogni 10°', l5: 'Ogni 5°', city: 'Città del mondo' },
      N: 'N', S: 'S',
      equator: 'Equatore', cancer: 'Tropico del Cancro', capricorn: 'Tropico del Capricorno', arctic: 'Circolo polare artico', antarctic: 'Circolo polare antartico',
      optLines: 'Tropici e circoli polari',
      rule: 'L’equatore è 0°. A nord dell’equatore si scrive N (emisfero boreale), a sud S (emisfero australe). Si conta sempre dall’equatore, fino a 90° al polo.',
      latWords: (a, h) => h === '0' ? 'l’equatore' : `${a}° di latitudine ${h === 'N' ? 'nord' : 'sud'}`,
      cities: {
        northPole: 'il Polo Nord', reykjavik: 'Reykjavík', oslo: 'Oslo', gdansk: 'Danzica', warsaw: 'Varsavia', london: 'Londra',
        krakow: 'Cracovia', kyiv: 'Kiev', lviv: 'Leopoli', paris: 'Parigi', marseille: 'Marsiglia', rome: 'Roma', newYork: 'New York',
        madrid: 'Madrid', tokyo: 'Tokyo', cairo: 'Il Cairo', hanoi: 'Hanoi', mexico: 'Città del Messico', mumbai: 'Mumbai', hcmc: 'Città di Ho Chi Minh',
        singapore: 'Singapore', quito: 'Quito', nairobi: 'Nairobi', jakarta: 'Giacarta', lima: 'Lima', rio: 'Rio de Janeiro',
        johannesburg: 'Johannesburg', perth: 'Perth', santiago: 'Santiago del Cile', capeTown: 'Città del Capo', sydney: 'Sydney',
        buenosAires: 'Buenos Aires', wellington: 'Wellington', ushuaia: 'Ushuaia', southPole: 'il Polo Sud',
      },
    },
    game: {
      title: 'Latitudine N e S — gioco',
      modeLabel: 'Tipo di gioco', modeRead: '🔎 Leggi', modeSet: '📍 Segna', modeDiff: '📏 Quanti gradi?',
      readQ: 'A che latitudine si trova il punto rosso?',
      readQCity: n => `A che latitudine si trova ${n}?`,
      setQ: 'Segna questo parallelo sulla carta:',
      setQCity: n => `Segna sulla carta la latitudine di ${n.replace(/^il /, '')}:`,
      setHelp: 'Tocca la carta all’altezza giusta, oppure sposta la linea con le frecce.',
      up: '▲ Verso nord', down: '▼ Verso sud',
      diffQ: 'Quanti gradi separano A e B, da nord a sud?',
      diffQCity: (a, b) => `${cap(a)} e ${b}: quanti gradi li separano, da nord a sud?`,
      check: '✅ Controlla', next: 'Avanti ➜', show: '👀 Mostra la soluzione',
      good: ['Ben fatto!', 'Ottimo!', 'Super!', 'Esatto!', 'Fantastico!'], bad: 'Purtroppo no.', shown: 'Ecco la soluzione.',
      taskN: n => `Esercizio ${n}`,
      explainRead: o => {
        const who = o.city ? `${cap(o.city)} si trova` : 'Il punto si trova';
        let s;
        if (o.h === '0') s = `${who} sull’equatore: 0°, senza N né S.`;
        else if (o.h === 'N') s = `${who} sopra l’equatore, nell’emisfero boreale, quindi si scrive N. Dall’equatore verso l’alto ci sono ${o.abs}°, cioè ${o.f}.${o.abs === 90 ? ' È il Polo Nord: più a nord non si può andare.' : ''}`;
        else s = `${who} sotto l’equatore, nell’emisfero australe, quindi si scrive S. Dall’equatore verso il basso ci sono ${o.abs}°, cioè ${o.f}.${o.abs === 90 ? ' È il Polo Sud: più a sud non si può andare.' : ''}`;
        return s + (o.km ? ` Da qui all’equatore ci sono circa ${o.km} km (1° è circa 111 km).` : '');
      },
      explainDiff: o => {
        let s;
        if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; s = `${o.city ? cap(z) : `Il punto ${z}`} è sull’equatore, quindi si conta solo dall’equatore all’altro: ${o.d}°.`; }
        else if (o.ha === o.hb) s = `Sono tutti e due nell’emisfero ${o.ha === 'N' ? 'boreale' : 'australe'}, quindi si sottrae: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
        else s = `Sono ai due lati dell’equatore, quindi si somma la strada fino all’equatore e oltre: ${o.a} + ${o.b} = ${o.d}°.`;
        return s + (o.km ? ` Sono circa ${o.km} km da nord a sud (1° è circa 111 km).` : '');
      },
      yourLine: f => `La tua linea è a ${f}.`,
      fbSide: 'È dall’altra parte dell’equatore: N è sopra l’equatore, S sotto.',
      fbNorth: 'La linea è troppo a nord: spostala in giù.',
      fbSouth: 'La linea è troppo a sud: spostala in su.',
      tryAgain: 'Correggi e controlla di nuovo.',
      starsTitle: 'Stelle raccolte', streakTitle: 'Risposte giuste di fila',
      stats: (ok, all, best) => `Giuste: ${ok} su ${all} · serie migliore: ${best}`,
      reset: 'Azzera i punteggi', resetConfirm: 'Azzerare le stelle e i punteggi?',
      mapLabel: 'Carta del mondo con i paralleli',
    },
    sheet: {
      title: 'Latitudine N e S — scheda di esercizi',
      appTitle: '🌍 Latitudine N e S — scheda di esercizi',
      appSub: 'Una scheda A4 da stampare: leggi la carta, segna sulla scala, confronta e conta i gradi. Con le soluzioni.',
      seed: 'Codice della scheda', seedHint: 'Stesso codice + stesse impostazioni ⇒ la stessa scheda.', randomSeed: 'Codice a caso',
      tasks: 'Esercizi', secs: { map: '🗺️ Leggi la carta', ladder: '📍 Segna sulla scala', compare: '⬆️ Più a nord?', diff: '📏 Quanti gradi?' },
      options: 'Opzioni', optKey: 'Pagina delle soluzioni',
      newWorksheet: 'Nuova scheda', print: 'Stampa / PDF',
      sheetTitle: 'Latitudine: N e S', sheetSub: lvl => `Livello: ${lvl}`,
      instr: {
        map: 'Leggi la latitudine di ogni punto. Scrivi il numero di gradi e cerchia N o S (sull’equatore non cerchiare niente).',
        mapCity: 'Leggi sulla carta a che latitudine si trovano questi luoghi (all’incirca). Scrivi il numero di gradi e cerchia N o S.',
        ladder: 'Disegna un punto su ogni scala alla latitudine indicata.',
        compare: 'Cerchia il luogo che si trova più a nord.',
        diff: 'Quanti gradi separano questi luoghi, da nord a sud?',
      },
      diffHint: 'Dalla stessa parte dell’equatore si sottrae, ai due lati si somma.',
      name: 'Nome: ____________________', date: 'Data: ____________________', seedLabel: 'Codice:',
      keyTitle: 'Soluzioni', keySub: lvl => `Livello: ${lvl}`, keyApprox: 'Per le città va bene anche una risposta sbagliata di pochi gradi.',
      summary: p => `${p} ${p === 1 ? 'pagina' : 'pagine'}`,
      genError: 'Errore: ', noTasks: 'Scegli almeno un esercizio.',
    },
  };

  T.es = {
    common: {
      brand: '🌍 Latitud: N y S',
      allPuzzles: '🧩 Todos los acertijos', printWorksheet: '🖨️ Ficha de ejercicios', playOnline: '🎮 Jugar en línea',
      level: 'Nivel', levels: { l30: 'Cada 30°', l10: 'Cada 10°', l5: 'Cada 5°', city: 'Ciudades del mundo' },
      N: 'N', S: 'S',
      equator: 'Ecuador', cancer: 'Trópico de Cáncer', capricorn: 'Trópico de Capricornio', arctic: 'Círculo polar ártico', antarctic: 'Círculo polar antártico',
      optLines: 'Trópicos y círculos polares',
      rule: 'El ecuador es 0°. Al norte del ecuador se escribe N (hemisferio norte); al sur, S (hemisferio sur). Siempre se cuenta desde el ecuador, hasta 90° en el polo.',
      latWords: (a, h) => h === '0' ? 'el ecuador' : `${a}° de latitud ${h === 'N' ? 'norte' : 'sur'}`,
      cities: {
        northPole: 'el Polo Norte', reykjavik: 'Reikiavik', oslo: 'Oslo', gdansk: 'Gdansk', warsaw: 'Varsovia', london: 'Londres',
        krakow: 'Cracovia', kyiv: 'Kiev', lviv: 'Leópolis', paris: 'París', marseille: 'Marsella', rome: 'Roma', newYork: 'Nueva York',
        madrid: 'Madrid', tokyo: 'Tokio', cairo: 'El Cairo', hanoi: 'Hanói', mexico: 'Ciudad de México', mumbai: 'Bombay', hcmc: 'Ciudad Ho Chi Minh',
        singapore: 'Singapur', quito: 'Quito', nairobi: 'Nairobi', jakarta: 'Yakarta', lima: 'Lima', rio: 'Río de Janeiro',
        johannesburg: 'Johannesburgo', perth: 'Perth', santiago: 'Santiago de Chile', capeTown: 'Ciudad del Cabo', sydney: 'Sídney',
        buenosAires: 'Buenos Aires', wellington: 'Wellington', ushuaia: 'Ushuaia', southPole: 'el Polo Sur',
      },
    },
    game: {
      title: 'Latitud N y S — juego',
      modeLabel: 'Modo de juego', modeRead: '🔎 Lee', modeSet: '📍 Marca', modeDiff: '📏 ¿Cuántos grados?',
      readQ: '¿En qué latitud está el punto rojo?',
      readQCity: n => `¿En qué latitud está ${n}?`,
      setQ: 'Marca este paralelo en el mapa:',
      setQCity: n => `Marca en el mapa la latitud de ${n.replace(/^el /, '')}:`,
      setHelp: 'Toca el mapa a la altura correcta o mueve la línea con las flechas.',
      up: '▲ Hacia el norte', down: '▼ Hacia el sur',
      diffQ: '¿Cuántos grados separan A y B, de norte a sur?',
      diffQCity: (a, b) => `${cap(a)} y ${b}: ¿cuántos grados los separan, de norte a sur?`,
      check: '✅ Comprobar', next: 'Siguiente ➜', show: '👀 Ver la solución',
      good: ['¡Muy bien!', '¡Genial!', '¡Súper!', '¡Eso es!', '¡Excelente!'], bad: 'Esta vez no.', shown: 'Aquí tienes la solución.',
      taskN: n => `Ejercicio ${n}`,
      explainRead: o => {
        const who = o.city ? `${cap(o.city)} está` : 'El punto está';
        let s;
        if (o.h === '0') s = `${who} en el ecuador: 0°, sin N ni S.`;
        else if (o.h === 'N') s = `${who} por encima del ecuador, en el hemisferio norte, así que se escribe N. Desde el ecuador hacia arriba hay ${o.abs}°, es decir, ${o.f}.${o.abs === 90 ? ' Es el Polo Norte: más al norte no se puede ir.' : ''}`;
        else s = `${who} por debajo del ecuador, en el hemisferio sur, así que se escribe S. Desde el ecuador hacia abajo hay ${o.abs}°, es decir, ${o.f}.${o.abs === 90 ? ' Es el Polo Sur: más al sur no se puede ir.' : ''}`;
        return s + (o.km ? ` De aquí al ecuador hay unos ${o.km} km (1° son unos 111 km).` : '');
      },
      explainDiff: o => {
        let s;
        if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; s = `${o.city ? cap(z) : `El punto ${z}`} está en el ecuador, así que solo se cuenta desde el ecuador hasta el otro: ${o.d}°.`; }
        else if (o.ha === o.hb) s = `Los dos están en el hemisferio ${o.ha === 'N' ? 'norte' : 'sur'}, así que se resta: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
        else s = `Están a los dos lados del ecuador, así que se suma el camino hasta el ecuador y el que sigue: ${o.a} + ${o.b} = ${o.d}°.`;
        return s + (o.km ? ` Son unos ${o.km} km de norte a sur (1° son unos 111 km).` : '');
      },
      yourLine: f => `Tu línea está en ${f}.`,
      fbSide: 'Eso está al otro lado del ecuador: N está por encima del ecuador y S por debajo.',
      fbNorth: 'La línea está demasiado al norte: bájala.',
      fbSouth: 'La línea está demasiado al sur: súbela.',
      tryAgain: 'Corrígelo y vuelve a comprobarlo.',
      starsTitle: 'Estrellas conseguidas', streakTitle: 'Respuestas correctas seguidas',
      stats: (ok, all, best) => `Bien: ${ok} de ${all} · mejor racha: ${best}`,
      reset: 'Borrar resultados', resetConfirm: '¿Borrar las estrellas y los resultados?',
      mapLabel: 'Mapa del mundo con los paralelos',
    },
    sheet: {
      title: 'Latitud N y S — ficha de ejercicios',
      appTitle: '🌍 Latitud N y S — ficha de ejercicios',
      appSub: 'Una ficha A4 para imprimir: lee el mapa, marca en la escala, compara y cuenta grados. Con las soluciones.',
      seed: 'Código de la ficha', seedHint: 'Mismo código + mismos ajustes ⇒ la misma ficha.', randomSeed: 'Código al azar',
      tasks: 'Ejercicios', secs: { map: '🗺️ Lee el mapa', ladder: '📍 Marca en la escala', compare: '⬆️ ¿Más al norte?', diff: '📏 ¿Cuántos grados?' },
      options: 'Opciones', optKey: 'Página de soluciones',
      newWorksheet: 'Nueva ficha', print: 'Imprimir / PDF',
      sheetTitle: 'Latitud: N y S', sheetSub: lvl => `Nivel: ${lvl}`,
      instr: {
        map: 'Lee la latitud de cada punto. Escribe el número de grados y rodea N o S (en el ecuador no rodees nada).',
        mapCity: 'Lee en el mapa en qué latitud están estos lugares (más o menos). Escribe el número de grados y rodea N o S.',
        ladder: 'Dibuja un punto en cada escala en la latitud indicada.',
        compare: 'Rodea el lugar que está más al norte.',
        diff: '¿Cuántos grados separan estos lugares, de norte a sur?',
      },
      diffHint: 'Al mismo lado del ecuador se resta; a los dos lados se suma.',
      name: 'Nombre: ____________________', date: 'Fecha: ____________________', seedLabel: 'Código:',
      keyTitle: 'Soluciones', keySub: lvl => `Nivel: ${lvl}`, keyApprox: 'En las ciudades vale una respuesta con unos pocos grados de diferencia.',
      summary: p => `${p} ${p === 1 ? 'página' : 'páginas'}`,
      genError: 'Error: ', noTasks: 'Elige al menos un ejercicio.',
    },
  };

  /* ---------- position from the stars, and the Titanic story ----------
   * explainStar(o): o = { h: height of the sky's pole above the horizon, f: "50°N", south: bool, city: name | null }
   * The facts (as in the Lighthouse Keeper story): star sights taken about 19:30 on 14 April 1912, dead reckoning
   * through the night, Boxhall's distress position 41°46′ N, 50°14′ W, the wreck found in 1985 about 24 km away. */
  const STARS = {
    pl: {
      common: { starName: 'Gwiazda Polarna', dipper: 'Wielki Wóz', cross: 'Krzyż Południa', skyPole: 'biegun nieba', lookN: 'patrzysz na północ (N)', lookS: 'patrzysz na południe (S)' },
      game: {
        modeStar: '⭐ Z gwiazd',
        starQN: 'Żeglarz widzi Gwiazdę Polarną tak wysoko nad horyzontem. Na jakiej szerokości geograficznej jest statek?',
        starQS: 'Żeglarz znalazł biegun nieba dzięki Krzyżowi Południa. Na jakiej szerokości geograficznej jest statek?',
        starHelp: 'Łuk ze stopniami to wysokość nad horyzontem: 0° to horyzont, 90° to punkt prosto nad głową.',
        explainStar: o => (o.h === 0 ? 'Gwiazda Polarna leży na samym horyzoncie, więc statek jest na równiku: 0°.'
          : o.south ? `Na półkuli południowej nie ma gwiazdy nad biegunem. Żeglarze przedłużają dłuższą belkę Krzyża Południa mniej więcej 4,5 raza i tak znajdują biegun nieba. Ile stopni jest nad horyzontem, tyle wynosi szerokość S: ${o.h}° → ${o.f}.`
          : `Na półkuli północnej Gwiazda Polarna świeci prawie dokładnie nad biegunem. Ile stopni nad horyzontem ją widać, tyle wynosi szerokość N: ${o.h}° → ${o.f}. Znajdziesz ją, przedłużając tylną ściankę Wielkiego Wozu mniej więcej 5 razy.${o.h === 90 ? ' Gwiazda prosto nad głową — to biegun północny.' : ''}`)
          + (o.city ? ` Tak widać niebo tam, gdzie leży ${o.city}.` : ''),
        factTitle: 'Ciekawostka: skąd Titanic wiedział, gdzie jest?',
        fact: [
          'W 1912 roku nie było GPS-u, a na oceanie nie ma drogowskazów. Dlatego oficerowie statku kilka razy na dobę mierzyli słońce i gwiazdy. Przyrządem zwanym sekstantem sprawdzali, jak wysoko nad horyzontem świeci gwiazda — tak jak w tej grze. Gwiazdy mierzy się o zmierzchu i o świcie, kiedy widać i gwiazdy, i linię horyzontu.',
          '14 kwietnia 1912 roku, około 19:30, oficer Titanica zmierzył kilka gwiazd i policzono z tego, gdzie jest statek. Potem przez noc liczono dalej: statek płynie tak szybko i w tę stronę, więc po godzinie jest o tyle dalej. Marynarze nazywają to nawigacją zliczeniową.',
          'Kiedy w nocy Titanic uderzył w górę lodową, czwarty oficer Joseph Boxhall policzył z tych liczb pozycję statku. Radiooperatorzy nadali ją w telegramie: 41°46′ N, 50°14′ W. Dzięki temu Carpathia wiedziała, dokąd płynąć.',
          'Nocne liczenie trochę się pomyliło: wrak Titanica odnaleziono w 1985 roku około 24 km od tego miejsca. Ale o świcie Carpathia i tak odnalazła łodzie ratunkowe.',
          '41°46′ to prawie 42°, bo jeden stopień ma 60 minut (60′). Gdyby ktoś stał tej nocy na pokładzie, zobaczyłby Gwiazdę Polarną mniej więcej 42° nad horyzontem — jak na obrazku.',
          'Dziś statki mają GPS, ale oficerowie wciąż uczą się nawigacji z gwiazd, na wypadek gdyby GPS przestał działać.',
        ],
      },
      sheet: {
        secStars: '⭐ Gdzie jest statek?', instrStars: 'Odczytaj, jak wysoko nad horyzontem jest Gwiazda Polarna (★) albo biegun nieba (⊕), i wpisz szerokość statku.',
        starsHint: 'Gwiazda Polarna → N, Krzyż Południa → S.',
        optFact: 'Ciekawostka: Titanic (osobna strona)',
        factT1Title: 'Minuty i stopnie', factT1: 'Jeden stopień ma 60 minut (60′). Do ilu pełnych stopni najbliżej jest 41°46′?',
        factT2Title: 'Niebo nad Titanikiem', factT2: 'Narysuj Gwiazdę Polarną tak, jak widzieli ją marynarze na pozycji z telegramu.',
        factT3Title: 'Pomyśl', factT3: 'Dlaczego gwiazdy mierzy się o zmierzchu i o świcie, a nie w środku nocy?',
        factKey: '41°46′ ≈ 42°N. Gwiazda Polarna około 42° nad horyzontem. W środku nocy nie widać linii horyzontu, a bez niej nie zmierzysz wysokości gwiazdy.',
      },
    },
    en: {
      common: { starName: 'Pole Star', dipper: 'Big Dipper', cross: 'Southern Cross', skyPole: 'sky’s pole', lookN: 'looking north (N)', lookS: 'looking south (S)' },
      game: {
        modeStar: '⭐ From the stars',
        starQN: 'A sailor sees the Pole Star this high above the horizon. What is the ship’s latitude?',
        starQS: 'A sailor found the sky’s pole with the Southern Cross. What is the ship’s latitude?',
        starHelp: 'The arc with degrees is the height above the horizon: 0° is the horizon, 90° is straight overhead.',
        explainStar: o => (o.h === 0 ? 'The Pole Star sits right on the horizon, so the ship is on the equator: 0°.'
          : o.south ? `In the Southern Hemisphere there is no star above the pole. Sailors follow the long bar of the Southern Cross about 4½ times its length and find the sky’s pole. Its height above the horizon is the latitude S: ${o.h}° → ${o.f}.`
          : `In the Northern Hemisphere the Pole Star shines almost exactly above the pole. However many degrees above the horizon you see it, that is your latitude N: ${o.h}° → ${o.f}. You find it by following the back of the Big Dipper about 5 times further.${o.h === 90 ? ' The star straight overhead: that is the North Pole.' : ''}`)
          + (o.city ? ` This is the sky as seen from ${o.city}.` : ''),
        factTitle: 'Did you know? How did the Titanic know where it was?',
        fact: [
          'In 1912 there was no GPS, and there are no signposts on the ocean. So a ship’s officers measured the sun and the stars a few times a day. With a tool called a sextant they checked how high above the horizon a star shone — just like in this game. Stars are measured at dusk and dawn, when you can see both the stars and the horizon.',
          'On 14 April 1912, at about 7:30 in the evening, an officer of the Titanic measured several stars, and from that they worked out where the ship was. Through the night they kept counting: the ship goes this fast in this direction, so after an hour it is this much further on. Sailors call this dead reckoning.',
          'When the Titanic hit an iceberg that night, Fourth Officer Joseph Boxhall worked out the ship’s position from those numbers. The wireless operators sent it in the telegram: 41°46′ N, 50°14′ W. That is how the Carpathia knew where to go.',
          'The night-time counting was a little off: the wreck of the Titanic was found in 1985 about 24 km from that spot. But at dawn the Carpathia still found the lifeboats.',
          '41°46′ is almost 42°, because one degree has 60 minutes (60′). Anyone on deck that night would have seen the Pole Star about 42° above the horizon — as in the picture.',
          'Today ships have GPS, but officers still learn to navigate by the stars, in case the GPS stops working.',
        ],
      },
      sheet: {
        secStars: '⭐ Where is the ship?', instrStars: 'Read how high above the horizon the Pole Star (★) or the sky’s pole (⊕) is, and write the ship’s latitude.',
        starsHint: 'Pole Star → N, Southern Cross → S.',
        optFact: 'Did you know: the Titanic (extra page)',
        factT1Title: 'Minutes and degrees', factT1: 'One degree has 60 minutes (60′). Which whole number of degrees is 41°46′ closest to?',
        factT2Title: 'The sky above the Titanic', factT2: 'Draw the Pole Star as the sailors saw it at the position in the telegram.',
        factT3Title: 'Think', factT3: 'Why are stars measured at dusk and dawn, and not in the middle of the night?',
        factKey: '41°46′ ≈ 42°N. The Pole Star about 42° above the horizon. In the middle of the night you cannot see the horizon, and without it you cannot measure a star’s height.',
      },
    },
    uk: {
      common: { starName: 'Полярна зоря', dipper: 'Великий Віз', cross: 'Південний Хрест', skyPole: 'полюс неба', lookN: 'дивишся на північ (N)', lookS: 'дивишся на південь (S)' },
      game: {
        modeStar: '⭐ За зорями',
        starQN: 'Моряк бачить Полярну зорю ось так високо над горизонтом. На якій широті корабель?',
        starQS: 'Моряк знайшов полюс неба за Південним Хрестом. На якій широті корабель?',
        starHelp: 'Дуга з градусами — це висота над горизонтом: 0° — горизонт, 90° — точка просто над головою.',
        explainStar: o => (o.h === 0 ? 'Полярна зоря на самому горизонті, тож корабель на екваторі: 0°.'
          : o.south ? `У Південній півкулі над полюсом немає зорі. Моряки продовжують довгу перекладину Південного Хреста приблизно в 4,5 раза й так знаходять полюс неба. Скільки градусів він над горизонтом, така й широта S: ${o.h}° → ${o.f}.`
          : `У Північній півкулі Полярна зоря світить майже точно над полюсом. Скільки градусів вона над горизонтом, така й широта N: ${o.h}° → ${o.f}. Її знаходять, продовживши задню стінку ковша Великого Воза приблизно в 5 разів.${o.h === 90 ? ' Зоря просто над головою — це Північний полюс.' : ''}`)
          + (o.city ? ` Таке небо видно там, де лежить ${o.city}.` : ''),
        factTitle: 'Цікавинка: звідки «Титанік» знав, де він?',
        fact: [
          'У 1912 році не було GPS, а в океані немає дорожніх знаків. Тому офіцери корабля кілька разів на добу вимірювали Сонце й зорі. Приладом, що зветься секстант, вони визначали, як високо над горизонтом світить зоря, — як у цій грі. Зорі вимірюють у сутінках і на світанку, коли видно і зорі, і лінію горизонту.',
          '14 квітня 1912 року, близько 19:30, офіцер «Титаніка» виміряв кілька зір, і з цього обчислили, де корабель. Потім уночі рахували далі: корабель пливе так швидко й у той бік, тож за годину він ось настільки далі. Моряки називають це численням шляху.',
          'Коли вночі «Титанік» ударився об айсберг, четвертий офіцер Джозеф Боксхолл обчислив із цих чисел місце корабля. Радисти передали його в телеграмі: 41°46′ пн. ш., 50°14′ зх. д. Завдяки цьому «Карпатія» знала, куди пливти.',
          'Нічний розрахунок трохи помилився: уламки «Титаніка» знайшли 1985 року приблизно за 24 км від цього місця. Але на світанку «Карпатія» все одно знайшла рятувальні шлюпки.',
          '41°46′ — це майже 42°, бо в одному градусі 60 хвилин (60′). Якби хтось стояв тієї ночі на палубі, побачив би Полярну зорю приблизно на 42° над горизонтом — як на малюнку.',
          'Сьогодні кораблі мають GPS, але офіцери й далі вчаться орієнтуватися за зорями — на випадок, якщо GPS перестане працювати.',
        ],
      },
      sheet: {
        secStars: '⭐ Де корабель?', instrStars: 'Визнач, як високо над горизонтом Полярна зоря (★) або полюс неба (⊕), і впиши широту корабля.',
        starsHint: 'Полярна зоря → N, Південний Хрест → S.',
        optFact: 'Цікавинка: «Титанік» (окрема сторінка)',
        factT1Title: 'Хвилини й градуси', factT1: 'В одному градусі 60 хвилин (60′). До скількох цілих градусів найближче 41°46′?',
        factT2Title: 'Небо над «Титаніком»', factT2: 'Намалюй Полярну зорю так, як її бачили моряки в місці з телеграми.',
        factT3Title: 'Подумай', factT3: 'Чому зорі вимірюють у сутінках і на світанку, а не посеред ночі?',
        factKey: '41°46′ ≈ 42° пн. ш. (42°N). Полярна зоря приблизно на 42° над горизонтом. Посеред ночі не видно лінії горизонту, а без неї висоту зорі не виміряєш.',
      },
    },
    vi: {
      common: { starName: 'Sao Bắc Cực', dipper: 'Bắc Đẩu', cross: 'Nam Thập Tự', skyPole: 'cực trời', lookN: 'nhìn về phía bắc (B)', lookS: 'nhìn về phía nam (N)' },
      game: {
        modeStar: '⭐ Nhìn sao',
        starQN: 'Thủy thủ thấy sao Bắc Cực cao như thế này trên đường chân trời. Con tàu ở vĩ độ nào?',
        starQS: 'Thủy thủ tìm cực trời nhờ chòm Nam Thập Tự. Con tàu ở vĩ độ nào?',
        starHelp: 'Cung chia độ là độ cao trên đường chân trời: 0° là chân trời, 90° là điểm ngay trên đầu.',
        explainStar: o => (o.h === 0 ? 'Sao Bắc Cực nằm ngay trên đường chân trời, nên con tàu ở xích đạo: 0°.'
          : o.south ? `Ở Nam bán cầu không có ngôi sao nào ngay trên cực. Thủy thủ kéo dài thanh dài của chòm Nam Thập Tự khoảng 4,5 lần để tìm cực trời. Cực trời cao bao nhiêu độ thì vĩ độ Nam bấy nhiêu: ${o.h}° → ${o.f}.`
          : `Ở Bắc bán cầu, sao Bắc Cực sáng gần như ngay trên cực bắc. Sao cao bao nhiêu độ trên chân trời thì vĩ độ Bắc bấy nhiêu: ${o.h}° → ${o.f}. Muốn tìm sao, hãy kéo dài cạnh sau của gầu Bắc Đẩu khoảng 5 lần.${o.h === 90 ? ' Sao ngay trên đầu — đó là Bắc Cực.' : ''}`)
          + (o.city ? ` Đây là bầu trời nhìn từ ${o.city}.` : ''),
        factTitle: 'Có thể em chưa biết: tàu Titanic biết mình ở đâu bằng cách nào?',
        fact: [
          'Năm 1912 chưa có GPS, và trên biển không có biển chỉ đường. Vì vậy các sĩ quan trên tàu đo mặt trời và các vì sao vài lần mỗi ngày. Với dụng cụ gọi là kính lục phân, họ đo xem ngôi sao cao bao nhiêu trên đường chân trời — giống như trong trò chơi này. Sao được đo lúc chạng vạng và lúc rạng sáng, khi nhìn thấy cả sao lẫn đường chân trời.',
          'Ngày 14 tháng 4 năm 1912, khoảng 19 giờ 30, một sĩ quan tàu Titanic đo vài ngôi sao, và từ đó tính ra con tàu đang ở đâu. Suốt đêm họ tiếp tục tính: tàu đi nhanh chừng này theo hướng này, nên sau một giờ sẽ đi thêm chừng ấy. Người đi biển gọi cách này là dự đoán vị trí theo đường đi.',
          'Khi tàu Titanic đâm vào băng trôi trong đêm, sĩ quan thứ tư Joseph Boxhall tính vị trí con tàu từ các con số đó. Các nhân viên vô tuyến gửi vị trí trong bức điện: 41°46′ B, 50°14′ T. Nhờ vậy tàu Carpathia biết phải đi về đâu.',
          'Phép tính ban đêm hơi bị lệch: năm 1985 người ta tìm thấy xác tàu Titanic cách chỗ đó khoảng 24 km. Nhưng lúc rạng sáng, tàu Carpathia vẫn tìm được các xuồng cứu sinh.',
          '41°46′ gần bằng 42°, vì một độ có 60 phút (60′). Nếu ai đó đứng trên boong tàu đêm ấy, họ sẽ thấy sao Bắc Cực cao khoảng 42° trên chân trời — như trong hình.',
          'Ngày nay tàu có GPS, nhưng các sĩ quan vẫn học cách đi biển nhờ sao, phòng khi GPS ngừng hoạt động.',
        ],
      },
      sheet: {
        secStars: '⭐ Con tàu ở đâu?', instrStars: 'Đọc xem sao Bắc Cực (★) hoặc cực trời (⊕) cao bao nhiêu trên chân trời, rồi viết vĩ độ của con tàu.',
        starsHint: 'Sao Bắc Cực → B, Nam Thập Tự → N.',
        optFact: 'Có thể em chưa biết: tàu Titanic (trang riêng)',
        factT1Title: 'Phút và độ', factT1: 'Một độ có 60 phút (60′). 41°46′ gần với bao nhiêu độ tròn nhất?',
        factT2Title: 'Bầu trời trên tàu Titanic', factT2: 'Vẽ sao Bắc Cực như các thủy thủ đã thấy ở vị trí ghi trong bức điện.',
        factT3Title: 'Suy nghĩ', factT3: 'Vì sao người ta đo sao lúc chạng vạng và rạng sáng, chứ không phải lúc nửa đêm?',
        factKey: '41°46′ ≈ 42°B. Sao Bắc Cực cao khoảng 42° trên chân trời. Lúc nửa đêm không nhìn thấy đường chân trời, mà thiếu nó thì không đo được độ cao của sao.',
      },
    },
    fr: {
      common: { starName: 'étoile Polaire', dipper: 'Grande Ourse', cross: 'Croix du Sud', skyPole: 'pôle céleste', lookN: 'tu regardes vers le nord (N)', lookS: 'tu regardes vers le sud (S)' },
      game: {
        modeStar: '⭐ Par les étoiles',
        starQN: 'Un marin voit l’étoile Polaire aussi haut au-dessus de l’horizon. À quelle latitude est le bateau ?',
        starQS: 'Un marin a trouvé le pôle céleste grâce à la Croix du Sud. À quelle latitude est le bateau ?',
        starHelp: 'L’arc gradué donne la hauteur au-dessus de l’horizon : 0° est l’horizon, 90° le point juste au-dessus de la tête.',
        explainStar: o => (o.h === 0 ? 'L’étoile Polaire est juste sur l’horizon : le bateau est sur l’équateur, à 0°.'
          : o.south ? `Dans l’hémisphère Sud, il n’y a pas d’étoile au-dessus du pôle. Les marins prolongent la grande branche de la Croix du Sud environ 4 fois et demie et trouvent ainsi le pôle céleste. Sa hauteur au-dessus de l’horizon est la latitude S : ${o.h}° → ${o.f}.`
          : `Dans l’hémisphère Nord, l’étoile Polaire brille presque exactement au-dessus du pôle. Autant de degrés au-dessus de l’horizon, autant de degrés de latitude N : ${o.h}° → ${o.f}. On la trouve en prolongeant environ 5 fois l’arrière de la casserole de la Grande Ourse.${o.h === 90 ? ' L’étoile juste au-dessus de la tête : c’est le pôle Nord.' : ''}`)
          + (o.city ? ` Voici le ciel vu depuis ${o.city}.` : ''),
        factTitle: 'Le savais-tu ? Comment le Titanic savait-il où il était ?',
        fact: [
          'En 1912, il n’y avait pas de GPS, et il n’y a pas de panneaux sur l’océan. Les officiers d’un navire mesuraient donc le soleil et les étoiles plusieurs fois par jour. Avec un instrument appelé sextant, ils regardaient à quelle hauteur au-dessus de l’horizon brillait une étoile — comme dans ce jeu. On mesure les étoiles au crépuscule et à l’aube, quand on voit à la fois les étoiles et l’horizon.',
          'Le 14 avril 1912, vers 19 h 30, un officier du Titanic a mesuré plusieurs étoiles, et on en a déduit où était le navire. Ensuite, pendant la nuit, on a continué à calculer : le navire va à telle vitesse dans telle direction, donc au bout d’une heure il est tant plus loin. Les marins appellent cela la navigation à l’estime.',
          'Quand le Titanic a heurté un iceberg pendant la nuit, le quatrième officier Joseph Boxhall a calculé la position du navire avec ces nombres. Les radiotélégraphistes l’ont envoyée dans le télégramme : 41°46′ N, 50°14′ O. C’est ainsi que le Carpathia a su où aller.',
          'Le calcul de nuit s’était un peu trompé : l’épave du Titanic a été retrouvée en 1985 à environ 24 km de cet endroit. Mais à l’aube, le Carpathia a quand même retrouvé les canots de sauvetage.',
          '41°46′, c’est presque 42°, car un degré compte 60 minutes (60′). Quelqu’un sur le pont cette nuit-là aurait vu l’étoile Polaire à environ 42° au-dessus de l’horizon — comme sur l’image.',
          'Aujourd’hui, les navires ont le GPS, mais les officiers apprennent toujours à naviguer avec les étoiles, au cas où le GPS tomberait en panne.',
        ],
      },
      sheet: {
        secStars: '⭐ Où est le bateau ?', instrStars: 'Lis à quelle hauteur au-dessus de l’horizon se trouve l’étoile Polaire (★) ou le pôle céleste (⊕), et écris la latitude du bateau.',
        starsHint: 'Étoile Polaire → N, Croix du Sud → S.',
        optFact: 'Le savais-tu : le Titanic (page à part)',
        factT1Title: 'Minutes et degrés', factT1: 'Un degré compte 60 minutes (60′). De quel nombre entier de degrés 41°46′ est-il le plus proche ?',
        factT2Title: 'Le ciel au-dessus du Titanic', factT2: 'Dessine l’étoile Polaire comme les marins la voyaient à la position du télégramme.',
        factT3Title: 'Réfléchis', factT3: 'Pourquoi mesure-t-on les étoiles au crépuscule et à l’aube, et pas au milieu de la nuit ?',
        factKey: '41°46′ ≈ 42°N. L’étoile Polaire à environ 42° au-dessus de l’horizon. Au milieu de la nuit, on ne voit pas l’horizon, et sans lui on ne peut pas mesurer la hauteur d’une étoile.',
      },
    },
    it: {
      common: { starName: 'Stella Polare', dipper: 'Grande Carro', cross: 'Croce del Sud', skyPole: 'polo celeste', lookN: 'guardi verso nord (N)', lookS: 'guardi verso sud (S)' },
      game: {
        modeStar: '⭐ Dalle stelle',
        starQN: 'Un marinaio vede la Stella Polare così in alto sull’orizzonte. A che latitudine è la nave?',
        starQS: 'Un marinaio ha trovato il polo celeste grazie alla Croce del Sud. A che latitudine è la nave?',
        starHelp: 'L’arco con i gradi è l’altezza sull’orizzonte: 0° è l’orizzonte, 90° il punto proprio sopra la testa.',
        explainStar: o => (o.h === 0 ? 'La Stella Polare è proprio sull’orizzonte, quindi la nave è sull’equatore: 0°.'
          : o.south ? `Nell’emisfero australe non c’è una stella sopra il polo. I marinai prolungano il braccio lungo della Croce del Sud circa 4 volte e mezzo e così trovano il polo celeste. La sua altezza sull’orizzonte è la latitudine S: ${o.h}° → ${o.f}.`
          : `Nell’emisfero boreale la Stella Polare brilla quasi esattamente sopra il polo. Quanti gradi è alta sull’orizzonte, tanti gradi di latitudine N: ${o.h}° → ${o.f}. La trovi prolungando circa 5 volte il lato posteriore del Grande Carro.${o.h === 90 ? ' La stella proprio sopra la testa: è il Polo Nord.' : ''}`)
          + (o.city ? ` Così si vede il cielo da ${o.city}.` : ''),
        factTitle: 'Lo sapevi? Come faceva il Titanic a sapere dov’era?',
        fact: [
          'Nel 1912 non c’era il GPS, e sull’oceano non ci sono cartelli. Per questo gli ufficiali della nave misuravano il sole e le stelle alcune volte al giorno. Con uno strumento chiamato sestante controllavano quanto in alto sull’orizzonte brillava una stella — proprio come in questo gioco. Le stelle si misurano al crepuscolo e all’alba, quando si vedono sia le stelle sia l’orizzonte.',
          'Il 14 aprile 1912, verso le 19:30, un ufficiale del Titanic misurò alcune stelle e da qui si calcolò dove si trovava la nave. Poi, durante la notte, si continuò a calcolare: la nave va a questa velocità in questa direzione, quindi dopo un’ora è tanto più avanti. I marinai la chiamano navigazione stimata.',
          'Quando di notte il Titanic urtò un iceberg, il quarto ufficiale Joseph Boxhall calcolò con quei numeri la posizione della nave. I radiotelegrafisti la trasmisero nel telegramma: 41°46′ N, 50°14′ O. Così la Carpathia seppe dove andare.',
          'Il calcolo notturno sbagliò un po’: il relitto del Titanic fu ritrovato nel 1985 a circa 24 km da quel punto. Ma all’alba la Carpathia trovò comunque le scialuppe di salvataggio.',
          '41°46′ è quasi 42°, perché un grado ha 60 minuti (60′). Chi fosse stato sul ponte quella notte avrebbe visto la Stella Polare a circa 42° sull’orizzonte — come nel disegno.',
          'Oggi le navi hanno il GPS, ma gli ufficiali imparano ancora a navigare con le stelle, nel caso in cui il GPS smetta di funzionare.',
        ],
      },
      sheet: {
        secStars: '⭐ Dov’è la nave?', instrStars: 'Leggi quanto in alto sull’orizzonte è la Stella Polare (★) o il polo celeste (⊕) e scrivi la latitudine della nave.',
        starsHint: 'Stella Polare → N, Croce del Sud → S.',
        optFact: 'Lo sapevi: il Titanic (pagina a parte)',
        factT1Title: 'Minuti e gradi', factT1: 'Un grado ha 60 minuti (60′). A quanti gradi interi è più vicino 41°46′?',
        factT2Title: 'Il cielo sopra il Titanic', factT2: 'Disegna la Stella Polare come la vedevano i marinai nella posizione del telegramma.',
        factT3Title: 'Pensa', factT3: 'Perché le stelle si misurano al crepuscolo e all’alba, e non a metà notte?',
        factKey: '41°46′ ≈ 42°N. La Stella Polare a circa 42° sull’orizzonte. A metà notte non si vede l’orizzonte, e senza di esso non si può misurare l’altezza di una stella.',
      },
    },
    es: {
      common: { starName: 'Estrella Polar', dipper: 'Osa Mayor', cross: 'Cruz del Sur', skyPole: 'polo celeste', lookN: 'miras al norte (N)', lookS: 'miras al sur (S)' },
      game: {
        modeStar: '⭐ Por las estrellas',
        starQN: 'Un marinero ve la Estrella Polar así de alta sobre el horizonte. ¿En qué latitud está el barco?',
        starQS: 'Un marinero encontró el polo celeste gracias a la Cruz del Sur. ¿En qué latitud está el barco?',
        starHelp: 'El arco con grados es la altura sobre el horizonte: 0° es el horizonte y 90°, el punto justo encima de la cabeza.',
        explainStar: o => (o.h === 0 ? 'La Estrella Polar está justo en el horizonte, así que el barco está en el ecuador: 0°.'
          : o.south ? `En el hemisferio sur no hay ninguna estrella sobre el polo. Los marineros prolongan el palo largo de la Cruz del Sur unas 4 veces y media y así encuentran el polo celeste. Su altura sobre el horizonte es la latitud S: ${o.h}° → ${o.f}.`
          : `En el hemisferio norte la Estrella Polar brilla casi exactamente sobre el polo. Tantos grados como está sobre el horizonte, tantos grados de latitud N: ${o.h}° → ${o.f}. La encuentras prolongando unas 5 veces la parte de atrás del carro de la Osa Mayor.${o.h === 90 ? ' La estrella justo encima de la cabeza: es el Polo Norte.' : ''}`)
          + (o.city ? ` Así se ve el cielo desde ${o.city}.` : ''),
        factTitle: '¿Sabías que…? ¿Cómo sabía el Titanic dónde estaba?',
        fact: [
          'En 1912 no había GPS, y en el océano no hay señales. Por eso los oficiales del barco medían el sol y las estrellas varias veces al día. Con un instrumento llamado sextante comprobaban a qué altura sobre el horizonte brillaba una estrella — igual que en este juego. Las estrellas se miden al anochecer y al amanecer, cuando se ven a la vez las estrellas y el horizonte.',
          'El 14 de abril de 1912, hacia las 19:30, un oficial del Titanic midió varias estrellas, y con eso se calculó dónde estaba el barco. Después, durante la noche, se siguió calculando: el barco va a tal velocidad en tal dirección, así que al cabo de una hora está tanto más lejos. Los marineros lo llaman navegación por estima.',
          'Cuando esa noche el Titanic chocó con un iceberg, el cuarto oficial Joseph Boxhall calculó con esos números la posición del barco. Los radiotelegrafistas la enviaron en el telegrama: 41°46′ N, 50°14′ O. Así el Carpathia supo adónde ir.',
          'El cálculo nocturno se equivocó un poco: los restos del Titanic se encontraron en 1985 a unos 24 km de ese lugar. Pero al amanecer el Carpathia encontró igualmente los botes salvavidas.',
          '41°46′ es casi 42°, porque un grado tiene 60 minutos (60′). Quien estuviera en cubierta esa noche habría visto la Estrella Polar a unos 42° sobre el horizonte — como en el dibujo.',
          'Hoy los barcos tienen GPS, pero los oficiales siguen aprendiendo a navegar con las estrellas, por si el GPS deja de funcionar.',
        ],
      },
      sheet: {
        secStars: '⭐ ¿Dónde está el barco?', instrStars: 'Lee a qué altura sobre el horizonte está la Estrella Polar (★) o el polo celeste (⊕) y escribe la latitud del barco.',
        starsHint: 'Estrella Polar → N, Cruz del Sur → S.',
        optFact: '¿Sabías que…?: el Titanic (página aparte)',
        factT1Title: 'Minutos y grados', factT1: 'Un grado tiene 60 minutos (60′). ¿A cuántos grados enteros está más cerca 41°46′?',
        factT2Title: 'El cielo sobre el Titanic', factT2: 'Dibuja la Estrella Polar como la veían los marineros en la posición del telegrama.',
        factT3Title: 'Piensa', factT3: '¿Por qué las estrellas se miden al anochecer y al amanecer, y no a medianoche?',
        factKey: '41°46′ ≈ 42°N. La Estrella Polar a unos 42° sobre el horizonte. A medianoche no se ve el horizonte, y sin él no se puede medir la altura de una estrella.',
      },
    },
  };
  for (const l of Object.keys(STARS)) for (const part of ['common', 'game', 'sheet']) Object.assign(T[l][part], STARS[l][part]);
  // the sextant drawing (latitude/sextant-officer.jpg, public domain, from Wikimedia Commons: "An Officer using a Sextant", IWM ART 5002)
  const SEXTANT = {
    pl: 'Oficer marynarki z sekstantem przy oku. Rysunek: Philip Connard, czasy I wojny światowej, Imperial War Museum (domena publiczna).',
    en: 'A naval officer with a sextant to his eye. Drawing by Philip Connard, First World War, Imperial War Museum (public domain).',
    uk: 'Морський офіцер із секстантом біля ока. Малюнок Філіпа Коннарда часів Першої світової війни, Імперський військовий музей (суспільне надбання).',
    vi: 'Một sĩ quan hải quân đưa kính lục phân lên mắt. Tranh của Philip Connard thời Chiến tranh thế giới thứ nhất, Bảo tàng Chiến tranh Hoàng gia Anh (phạm vi công cộng).',
    fr: 'Un officier de marine, le sextant à l’œil. Dessin de Philip Connard, Première Guerre mondiale, Imperial War Museum (domaine public).',
    it: 'Un ufficiale di marina con il sestante all’occhio. Disegno di Philip Connard, prima guerra mondiale, Imperial War Museum (pubblico dominio).',
    es: 'Un oficial de marina con el sextante en el ojo. Dibujo de Philip Connard, Primera Guerra Mundial, Imperial War Museum (dominio público).',
  };
  for (const l of Object.keys(SEXTANT)) T[l].common.sextant = SEXTANT[l];
  /* ---------- longitude (W / E) ----------
   * Letters as each language writes them: E/W, but Vietnamese Đ (Đông) / T (Tây) and French, Italian and Spanish O (ouest/ovest/oeste).
   * explainLon(o):   o = { f: "30°W", abs, h: 'E' | 'W' | '0' | '180', city }
   * explainBoth(o):  o = { f: "40°N 30°W", hLat, hLon, city }
   * explainDiffLon(o): like explainDiff with ha, hb: 'E' | 'W' | '0'
   * explainClock(o): o = { abs, f, time: "14:00", dur: "2 godz.", later: bool } (later than 12:00 ⇒ west) */
  const LON = {
    pl: {
      common: {
        E: 'E', W: 'W', both: 'obie', axisTitle: 'Współrzędne',
        ruleLon: 'Południk zerowy (Greenwich) to 0°. Na wschód od niego jest E (półkula wschodnia), na zachód — W (półkula zachodnia), aż do 180° po drugiej stronie Ziemi.',
        lonWords: (a, h) => h === '0' ? 'południk zerowy (Greenwich)' : h === '180' ? 'południk 180°' : `${a}° długości geograficznej ${h === 'E' ? 'wschodniej' : 'zachodniej'}`,
        sunName: 'słońce najwyżej', chronoName: 'czas w Greenwich',
        dur: (h, m) => [h ? `${h} godz.` : '', m ? `${m} min` : ''].filter(Boolean).join(' '),
      },
      game: {
        modeClock: '☀️ Słońce i zegar', modeSky: '⭐ Niebo i zegar',
        readQLon: 'Na jakiej długości geograficznej leży czerwony punkt?', readQLonCity: n => `Na jakiej długości geograficznej leży ${n}?`,
        readQBoth: 'Jakie współrzędne ma czerwony punkt?', readQBothCity: n => `Jakie współrzędne ma ${n}?`,
        setQLon: 'Zaznacz na mapie południk:', setQLonCity: n => `Zaznacz na mapie, na jakiej długości leży ${n}:`,
        setQBoth: 'Postaw kropkę w punkcie:', setQBothCity: n => `Postaw kropkę tam, gdzie leży ${n}:`,
        setHelpBoth: 'Stuknij mapę we właściwym miejscu albo przesuwaj kropkę strzałkami.',
        west: '◀ Na zachód', east: 'Na wschód ▶',
        diffQLon: 'Ile stopni dzieli punkty A i B z zachodu na wschód?', diffQLonCity: (a, b) => `${a} i ${b} — ile stopni dzieli te miejsca z zachodu na wschód?`,
        clockQ: 'Na statku jest południe: słońce stoi najwyżej. Zegar pokazuje czas w Greenwich. Na jakiej długości geograficznej jest statek?',
        explainLon: o => {
          const who = o.city ? `${o.city} leży` : 'Punkt leży';
          if (o.h === '0') return `${who} na południku zerowym, który przechodzi przez Greenwich w Londynie — to 0°, bez litery E ani W.`;
          if (o.h === '180') return `${who} na południku 180°, po drugiej stronie Ziemi niż Greenwich. Tu wschód spotyka się z zachodem, więc piszemy 180° bez litery.`;
          return `${who} na ${o.h === 'E' ? 'wschód (na prawo)' : 'zachód (na lewo)'} od Greenwich, więc piszemy ${o.h === 'E' ? 'E' : 'W'}. Od południka zerowego jest ${o.abs}°, czyli ${o.f}.`;
        },
        explainBoth: o => `${o.city ? `${o.city} leży` : 'Punkt leży'} ${o.hLat === 'N' ? 'nad równikiem (N)' : o.hLat === 'S' ? 'pod równikiem (S)' : 'na równiku'} i ${o.hLon === 'E' ? 'na wschód od Greenwich (E)' : o.hLon === 'W' ? 'na zachód od Greenwich (W)' : 'na południku 0° albo 180°'}. Współrzędne: ${o.f}. Najpierw piszemy szerokość (N/S), potem długość (W/E).`,
        explainDiffLon: o => {
          let s;
          if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; s = `${o.city ? z : `Punkt ${z}`} leży na południku zerowym, więc liczymy tylko od Greenwich do drugiego: ${o.d}°.`; }
          else if (o.ha === o.hb) s = `Oba ${o.city ? 'miejsca' : 'punkty'} leżą na ${o.ha === 'E' ? 'wschód' : 'zachód'} od Greenwich, więc odejmujemy: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
          else s = `${o.city ? 'Te miejsca' : 'Punkty'} leżą po dwóch stronach Greenwich, więc dodajemy: ${o.a} + ${o.b} = ${o.d}°.`;
          return s;
        },
        explainClock: o => o.abs === 0 ? 'Zegar pokazuje 12:00, tak jak w Greenwich w południe — statek jest na południku zerowym: 0°.'
          : `Ziemia obraca się o 15° na godzinę, czyli o 1° w 4 minuty. W Greenwich słońce stoi najwyżej o 12:00. Tu stanęło najwyżej, gdy w Greenwich była ${o.time} — ${o.dur} ${o.later ? 'później' : 'wcześniej'}, więc statek jest ${o.abs}° na ${o.later ? 'zachód' : 'wschód'}: ${o.f}.`,
        yourPoint: f => `Twoja kropka jest w punkcie ${f}.`,
        fbSideLon: 'To po drugiej stronie Greenwich: E jest na prawo, W na lewo.',
        fbEast: 'Za daleko na wschód — przesuń w lewo.', fbWest: 'Za daleko na zachód — przesuń w prawo.',
        fbOkLat: 'Szerokość (N/S) jest dobrze.', fbOkLon: 'Długość (W/E) jest dobrze.',
        factLon: 'Z gwiazd odczytuje się szerokość (N/S). Do długości (W/E) potrzebny był jeszcze bardzo dokładny zegar — chronometr — który przez cały rejs pokazywał czas w Greenwich. Ziemia obraca się o 15° na godzinę, więc z różnicy między czasem na statku a czasem w Greenwich liczono, jak daleko na zachód jest statek. Stąd w telegramie 50°14′ W.',
      },
      sheet: {
        secLon: { ladder: '📍 Zaznacz na skali', compare: '➡️ Co bardziej na wschód?' },
        secBoth: { ladder: '📍 Zaznacz na mapie', compare: '🧭 Co bardziej na północ, co na wschód?' },
        instrLon: {
          map: 'Odczytaj długość geograficzną punktów. Wpisz liczbę stopni i zakreśl W albo E (na 0° i 180° nie zakreślaj nic).',
          mapCity: 'Odczytaj z mapy, na jakiej długości leżą te miejsca (w przybliżeniu). Wpisz liczbę stopni i zakreśl W albo E.',
          ladder: 'Narysuj kropkę na każdej skali w podanym miejscu.',
          compare: 'Zakreśl miejsce, które leży bardziej na wschód.',
          diff: 'Ile stopni dzieli te miejsca z zachodu na wschód?',
        },
        instrBoth: {
          map: 'Odczytaj współrzędne punktów: najpierw szerokość (N/S), potem długość (W/E).',
          mapCity: 'Odczytaj z mapy współrzędne tych miejsc (w przybliżeniu): najpierw szerokość (N/S), potem długość (W/E).',
          ladder: 'Narysuj na mapie powyżej kropki w tych punktach i podpisz je numerami.',
          compare: '↑ — zakreśl miejsce bardziej na północ. → — zakreśl miejsce bardziej na wschód.',
          diff: '↕ — ile stopni z północy na południe? ↔ — ile stopni z zachodu na wschód?',
        },
        instrClocks: 'Na statku jest południe, a zegar pokazuje czas w Greenwich. Wpisz długość geograficzną statku.',
        clocksHint: 'Każda godzina to 15°, każde 4 minuty to 1°. Później niż 12:00 → W, wcześniej → E.',
        diffHintLon: 'Po tej samej stronie Greenwich odejmij, po dwóch stronach dodaj.',
      },
    },
    en: {
      common: {
        E: 'E', W: 'W', both: 'both', axisTitle: 'Coordinates',
        ruleLon: 'The prime meridian (Greenwich) is 0°. East of it is E (the Eastern Hemisphere), west of it is W (the Western Hemisphere), up to 180° on the other side of the Earth.',
        lonWords: (a, h) => h === '0' ? 'the prime meridian (Greenwich)' : h === '180' ? 'the 180° meridian' : `${a} degrees ${h === 'E' ? 'east' : 'west'}`,
        sunName: 'sun at its highest', chronoName: 'Greenwich time',
        dur: (h, m) => [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' '),
      },
      game: {
        modeClock: '☀️ Sun and clock', modeSky: '⭐ Sky and clock',
        readQLon: 'What is the longitude of the red dot?', readQLonCity: n => `What is the longitude of ${n}?`,
        readQBoth: 'What are the coordinates of the red dot?', readQBothCity: n => `What are the coordinates of ${n}?`,
        setQLon: 'Mark this longitude on the map:', setQLonCity: n => `Mark the longitude of ${n} on the map:`,
        setQBoth: 'Put a dot at this point:', setQBothCity: n => `Put a dot where ${n} is:`,
        setHelpBoth: 'Tap the map at the right place, or move the dot with the arrows.',
        west: '◀ West', east: 'East ▶',
        diffQLon: 'How many degrees apart are A and B, from west to east?', diffQLonCity: (a, b) => `${cap(a)} and ${b}: how many degrees apart are they, from west to east?`,
        clockQ: 'It is noon on the ship: the sun is at its highest. The clock shows Greenwich time. What is the ship’s longitude?',
        explainLon: o => {
          const who = o.city ? `${cap(o.city)} is` : 'The dot is';
          if (o.h === '0') return `${who} on the prime meridian, which runs through Greenwich in London: 0°, with no E or W.`;
          if (o.h === '180') return `${who} on the 180° meridian, on the other side of the Earth from Greenwich. East meets west there, so we write 180° with no letter.`;
          return `${who} ${o.h === 'E' ? 'east (to the right)' : 'west (to the left)'} of Greenwich, so we write ${o.h}. From the prime meridian it is ${o.abs}°, so ${o.f}.`;
        },
        explainBoth: o => `${o.city ? `${cap(o.city)} is` : 'The dot is'} ${o.hLat === 'N' ? 'above the equator (N)' : o.hLat === 'S' ? 'below the equator (S)' : 'on the equator'} and ${o.hLon === 'E' ? 'east of Greenwich (E)' : o.hLon === 'W' ? 'west of Greenwich (W)' : 'on the 0° or 180° meridian'}. Coordinates: ${o.f}. Latitude (N/S) comes first, then longitude (W/E).`,
        explainDiffLon: o => {
          if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; return `${o.city ? cap(z) : `Point ${z}`} is on the prime meridian, so we only count from Greenwich to the other one: ${o.d}°.`; }
          if (o.ha === o.hb) return `Both are ${o.ha === 'E' ? 'east' : 'west'} of Greenwich, so we subtract: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
          return `They are on opposite sides of Greenwich, so we add: ${o.a} + ${o.b} = ${o.d}°.`;
        },
        explainClock: o => o.abs === 0 ? 'The clock shows 12:00, just like Greenwich at noon — the ship is on the prime meridian: 0°.'
          : `The Earth turns 15° an hour, which is 1° every 4 minutes. In Greenwich the sun is highest at 12:00. Here it was highest when it was ${o.time} in Greenwich — ${o.dur} ${o.later ? 'later' : 'earlier'}, so the ship is ${o.abs}° ${o.later ? 'west' : 'east'}: ${o.f}.`,
        yourPoint: f => `Your dot is at ${f}.`,
        fbSideLon: 'That is on the other side of Greenwich: E is to the right, W to the left.',
        fbEast: 'Too far east — move it left.', fbWest: 'Too far west — move it right.',
        fbOkLat: 'The latitude (N/S) is right.', fbOkLon: 'The longitude (W/E) is right.',
        factLon: 'The stars give the latitude (N/S). For the longitude (W/E) you also need a very exact clock — a chronometer — that keeps Greenwich time for the whole voyage. The Earth turns 15° an hour, so the difference between the ship’s time and Greenwich time tells how far west the ship is. That is where the 50°14′ W in the telegram came from.',
      },
      sheet: {
        secLon: { ladder: '📍 Mark the scale', compare: '➡️ Which is further east?' },
        secBoth: { ladder: '📍 Mark the map', compare: '🧭 Further north? Further east?' },
        instrLon: {
          map: 'Read the longitude of each point. Write the number of degrees and circle W or E (at 0° and 180°, circle nothing).',
          mapCity: 'Read from the map at what longitude these places are (roughly). Write the number of degrees and circle W or E.',
          ladder: 'Draw a dot on each scale at the given longitude.',
          compare: 'Circle the place that is further east.',
          diff: 'How many degrees apart are these places, from west to east?',
        },
        instrBoth: {
          map: 'Read the coordinates of each point: latitude (N/S) first, then longitude (W/E).',
          mapCity: 'Read from the map the coordinates of these places (roughly): latitude (N/S) first, then longitude (W/E).',
          ladder: 'Draw dots at these points on the map above and number them.',
          compare: '↑ — circle the place further north. → — circle the place further east.',
          diff: '↕ — how many degrees from north to south? ↔ — how many degrees from west to east?',
        },
        instrClocks: 'It is noon on the ship, and the clock shows Greenwich time. Write the ship’s longitude.',
        clocksHint: 'Each hour is 15°, every 4 minutes is 1°. Later than 12:00 → W, earlier → E.',
        diffHintLon: 'On the same side of Greenwich, subtract; on opposite sides, add.',
      },
    },
    uk: {
      common: {
        E: 'E', W: 'W', both: 'обидві', axisTitle: 'Координати',
        ruleLon: 'Нульовий меридіан (Гринвіч) — це 0°. На схід від нього — E (східна довгота, сх. д.), на захід — W (західна довгота, зх. д.), аж до 180° з іншого боку Землі.',
        lonWords: (a, h) => h === '0' ? 'нульовий меридіан (Гринвіч)' : h === '180' ? 'меридіан 180°' : `${a}° ${h === 'E' ? 'східної' : 'західної'} довготи`,
        sunName: 'Сонце найвище', chronoName: 'час у Гринвічі',
        dur: (h, m) => [h ? `${h} год` : '', m ? `${m} хв` : ''].filter(Boolean).join(' '),
      },
      game: {
        modeClock: '☀️ Сонце й годинник', modeSky: '⭐ Небо й годинник',
        readQLon: 'На якій довготі лежить червона точка?', readQLonCity: n => `На якій довготі лежить ${n}?`,
        readQBoth: 'Які координати червоної точки?', readQBothCity: n => `Які координати має ${n}?`,
        setQLon: 'Познач на мапі меридіан:', setQLonCity: n => `Познач на мапі довготу, на якій лежить ${n}:`,
        setQBoth: 'Постав крапку в точці:', setQBothCity: n => `Постав крапку там, де лежить ${n}:`,
        setHelpBoth: 'Торкнися мапи в потрібному місці або пересувай крапку стрілками.',
        west: '◀ На захід', east: 'На схід ▶',
        diffQLon: 'Скільки градусів між точками A і B із заходу на схід?', diffQLonCity: (a, b) => `${a} і ${b}: скільки градусів між ними із заходу на схід?`,
        clockQ: 'На кораблі полудень: Сонце стоїть найвище. Годинник показує час у Гринвічі. На якій довготі корабель?',
        explainLon: o => {
          const who = o.city ? `${o.city} лежить` : 'Точка лежить';
          if (o.h === '0') return `${who} на нульовому меридіані, що проходить через Гринвіч у Лондоні, — це 0°, без літери E чи W.`;
          if (o.h === '180') return `${who} на меридіані 180°, з іншого боку Землі від Гринвіча. Тут схід зустрічається із заходом, тож пишемо 180° без літери.`;
          return `${who} на ${o.h === 'E' ? 'схід (праворуч)' : 'захід (ліворуч)'} від Гринвіча, тому пишемо ${o.h}. Від нульового меридіана ${o.abs}°, тобто ${o.f}.`;
        },
        explainBoth: o => `${o.city ? `${o.city} лежить` : 'Точка лежить'} ${o.hLat === 'N' ? 'над екватором (N)' : o.hLat === 'S' ? 'під екватором (S)' : 'на екваторі'} і ${o.hLon === 'E' ? 'на схід від Гринвіча (E)' : o.hLon === 'W' ? 'на захід від Гринвіча (W)' : 'на меридіані 0° або 180°'}. Координати: ${o.f}. Спершу пишемо широту (N/S), потім довготу (W/E).`,
        explainDiffLon: o => {
          if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; return `${o.city ? z : `Точка ${z}`} лежить на нульовому меридіані, тож рахуємо лише від Гринвіча до другої: ${o.d}°.`; }
          if (o.ha === o.hb) return `Обидві лежать на ${o.ha === 'E' ? 'схід' : 'захід'} від Гринвіча, тож віднімаємо: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
          return `Вони лежать по різні боки Гринвіча, тож додаємо: ${o.a} + ${o.b} = ${o.d}°.`;
        },
        explainClock: o => o.abs === 0 ? 'Годинник показує 12:00, як у Гринвічі опівдні, — корабель на нульовому меридіані: 0°.'
          : `Земля обертається на 15° за годину, тобто на 1° за 4 хвилини. У Гринвічі Сонце найвище о 12:00. Тут воно було найвище, коли в Гринвічі було ${o.time}, — на ${o.dur} ${o.later ? 'пізніше' : 'раніше'}, тож корабель на ${o.abs}° ${o.later ? 'на захід' : 'на схід'}: ${o.f}.`,
        yourPoint: f => `Твоя крапка в точці ${f}.`,
        fbSideLon: 'Це з іншого боку Гринвіча: E — праворуч, W — ліворуч.',
        fbEast: 'Задалеко на схід — посунь ліворуч.', fbWest: 'Задалеко на захід — посунь праворуч.',
        fbOkLat: 'Широта (N/S) правильна.', fbOkLon: 'Довгота (W/E) правильна.',
        factLon: 'За зорями визначають широту (N/S). Для довготи (W/E) потрібен був ще дуже точний годинник — хронометр, — який увесь рейс показував час у Гринвічі. Земля обертається на 15° за годину, тож із різниці між часом на кораблі й часом у Гринвічі обчислювали, наскільки далеко на захід корабель. Звідси в телеграмі 50°14′ зх. д.',
      },
      sheet: {
        secLon: { ladder: '📍 Познач на шкалі', compare: '➡️ Що далі на схід?' },
        secBoth: { ladder: '📍 Познач на мапі', compare: '🧭 Що далі на північ, що на схід?' },
        instrLon: {
          map: 'Визнач довготу кожної точки. Впиши кількість градусів і обведи W або E (на 0° і 180° нічого не обводь).',
          mapCity: 'Визнач за мапою, на якій довготі лежать ці місця (приблизно). Впиши кількість градусів і обведи W або E.',
          ladder: 'Намалюй крапку на кожній шкалі в указаному місці.',
          compare: 'Обведи місце, яке лежить далі на схід.',
          diff: 'Скільки градусів між цими місцями із заходу на схід?',
        },
        instrBoth: {
          map: 'Визнач координати точок: спершу широту (N/S), потім довготу (W/E).',
          mapCity: 'Визнач за мапою координати цих місць (приблизно): спершу широту (N/S), потім довготу (W/E).',
          ladder: 'Намалюй на мапі вгорі крапки в цих точках і підпиши їх номерами.',
          compare: '↑ — обведи місце, що далі на північ. → — обведи місце, що далі на схід.',
          diff: '↕ — скільки градусів з півночі на південь? ↔ — скільки градусів із заходу на схід?',
        },
        instrClocks: 'На кораблі полудень, а годинник показує час у Гринвічі. Впиши довготу корабля.',
        clocksHint: 'Кожна година — це 15°, кожні 4 хвилини — 1°. Пізніше за 12:00 → W, раніше → E.',
        diffHintLon: 'По один бік Гринвіча — віднімай, по різні боки — додавай.',
      },
    },
    vi: {
      common: {
        E: 'Đ', W: 'T', both: 'cả hai', axisTitle: 'Tọa độ',
        ruleLon: 'Kinh tuyến gốc (Greenwich) là 0°. Phía đông ghi Đ (Đông bán cầu), phía tây ghi T (Tây bán cầu), đến 180° ở phía bên kia Trái Đất. Bản đồ quốc tế viết E/W: E = East = Đông, W = West = Tây.',
        lonWords: (a, h) => h === '0' ? 'kinh tuyến gốc (Greenwich)' : h === '180' ? 'kinh tuyến 180°' : `kinh độ ${a}° ${h === 'E' ? 'Đông' : 'Tây'}`,
        sunName: 'mặt trời cao nhất', chronoName: 'giờ Greenwich',
        dur: (h, m) => [h ? `${h} giờ` : '', m ? `${m} phút` : ''].filter(Boolean).join(' '),
      },
      game: {
        modeClock: '☀️ Mặt trời và đồng hồ', modeSky: '⭐ Bầu trời và đồng hồ',
        readQLon: 'Chấm đỏ nằm ở kinh độ nào?', readQLonCity: n => `${n} nằm ở kinh độ nào?`,
        readQBoth: 'Tọa độ của chấm đỏ là gì?', readQBothCity: n => `Tọa độ của ${n} là gì?`,
        setQLon: 'Đánh dấu kinh tuyến này trên bản đồ:', setQLonCity: n => `Đánh dấu trên bản đồ kinh độ của ${n}:`,
        setQBoth: 'Đặt một chấm tại điểm:', setQBothCity: n => `Đặt một chấm ở chỗ ${n}:`,
        setHelpBoth: 'Chạm vào bản đồ ở đúng chỗ, hoặc dịch chấm bằng các mũi tên.',
        west: '◀ Sang tây', east: 'Sang đông ▶',
        diffQLon: 'Từ tây sang đông, A và B cách nhau bao nhiêu độ?', diffQLonCity: (a, b) => `${a} và ${b}: từ tây sang đông cách nhau bao nhiêu độ?`,
        clockQ: 'Trên tàu đang là giữa trưa: mặt trời lên cao nhất. Đồng hồ chỉ giờ Greenwich. Con tàu ở kinh độ nào?',
        explainLon: o => {
          const who = o.city ? `${o.city} nằm` : 'Chấm đỏ nằm';
          if (o.h === '0') return `${who} trên kinh tuyến gốc, đi qua Greenwich ở Luân Đôn: 0°, không ghi Đ hay T.`;
          if (o.h === '180') return `${who} trên kinh tuyến 180°, ở phía bên kia Trái Đất so với Greenwich. Ở đó đông gặp tây, nên ghi 180° không kèm chữ.`;
          return `${who} ở phía ${o.h === 'E' ? 'đông (bên phải)' : 'tây (bên trái)'} của Greenwich, nên ghi ${o.h === 'E' ? 'Đ' : 'T'}. Cách kinh tuyến gốc ${o.abs}°, tức là ${o.f}.`;
        },
        explainBoth: o => `${o.city ? `${o.city} nằm` : 'Chấm đỏ nằm'} ${o.hLat === 'N' ? 'phía trên xích đạo (B)' : o.hLat === 'S' ? 'phía dưới xích đạo (N)' : 'trên xích đạo'} và ${o.hLon === 'E' ? 'phía đông Greenwich (Đ)' : o.hLon === 'W' ? 'phía tây Greenwich (T)' : 'trên kinh tuyến 0° hoặc 180°'}. Tọa độ: ${o.f}. Viết vĩ độ (B/N) trước, kinh độ (Đ/T) sau.`,
        explainDiffLon: o => {
          if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; return `${o.city ? z : `Điểm ${z}`} nằm trên kinh tuyến gốc, nên chỉ cần đếm từ Greenwich đến điểm kia: ${o.d}°.`; }
          if (o.ha === o.hb) return `Cả hai đều ở phía ${o.ha === 'E' ? 'đông' : 'tây'} Greenwich, nên ta trừ: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
          return `Hai nơi ở hai bên Greenwich, nên ta cộng: ${o.a} + ${o.b} = ${o.d}°.`;
        },
        explainClock: o => o.abs === 0 ? 'Đồng hồ chỉ 12:00, giống giữa trưa ở Greenwich — con tàu ở kinh tuyến gốc: 0°.'
          : `Trái Đất quay 15° mỗi giờ, tức là 1° mỗi 4 phút. Ở Greenwich mặt trời cao nhất lúc 12:00. Ở đây mặt trời cao nhất khi ở Greenwich là ${o.time} — ${o.later ? 'muộn' : 'sớm'} hơn ${o.dur}, nên con tàu ở ${o.abs}° về phía ${o.later ? 'tây' : 'đông'}: ${o.f}.`,
        yourPoint: f => `Chấm của em ở ${f}.`,
        fbSideLon: 'Đó là phía bên kia Greenwich: Đ ở bên phải, T ở bên trái.',
        fbEast: 'Quá xa về phía đông — dịch sang trái.', fbWest: 'Quá xa về phía tây — dịch sang phải.',
        fbOkLat: 'Vĩ độ (B/N) đã đúng.', fbOkLon: 'Kinh độ (Đ/T) đã đúng.',
        factLon: 'Nhờ các vì sao ta biết vĩ độ (B/N). Muốn biết kinh độ (Đ/T) còn cần một chiếc đồng hồ rất chính xác — đồng hồ hàng hải — luôn chỉ giờ Greenwich suốt chuyến đi. Trái Đất quay 15° mỗi giờ, nên từ chênh lệch giữa giờ trên tàu và giờ Greenwich, người ta tính được con tàu ở xa về phía tây bao nhiêu. Vì thế bức điện ghi 50°14′ T.',
      },
      sheet: {
        secLon: { ladder: '📍 Đánh dấu trên thang', compare: '➡️ Nơi nào xa hơn về phía đông?' },
        secBoth: { ladder: '📍 Đánh dấu trên bản đồ', compare: '🧭 Xa hơn về phía bắc? Về phía đông?' },
        instrLon: {
          map: 'Đọc kinh độ của mỗi điểm. Viết số độ và khoanh T hoặc Đ (ở 0° và 180° thì không khoanh gì).',
          mapCity: 'Đọc trên bản đồ xem các nơi này nằm ở kinh độ nào (gần đúng). Viết số độ và khoanh T hoặc Đ.',
          ladder: 'Vẽ một chấm trên mỗi thang ở kinh độ đã cho.',
          compare: 'Khoanh nơi nằm xa hơn về phía đông.',
          diff: 'Từ tây sang đông, các nơi này cách nhau bao nhiêu độ?',
        },
        instrBoth: {
          map: 'Đọc tọa độ của mỗi điểm: vĩ độ (B/N) trước, kinh độ (Đ/T) sau.',
          mapCity: 'Đọc trên bản đồ tọa độ của các nơi này (gần đúng): vĩ độ (B/N) trước, kinh độ (Đ/T) sau.',
          ladder: 'Vẽ các chấm tại những điểm này trên bản đồ ở trên và ghi số.',
          compare: '↑ — khoanh nơi xa hơn về phía bắc. → — khoanh nơi xa hơn về phía đông.',
          diff: '↕ — bao nhiêu độ từ bắc xuống nam? ↔ — bao nhiêu độ từ tây sang đông?',
        },
        instrClocks: 'Trên tàu đang là giữa trưa, đồng hồ chỉ giờ Greenwich. Viết kinh độ của con tàu.',
        clocksHint: 'Mỗi giờ là 15°, mỗi 4 phút là 1°. Muộn hơn 12:00 → T, sớm hơn → Đ.',
        diffHintLon: 'Cùng một bên Greenwich thì trừ; ở hai bên thì cộng.',
      },
    },
    fr: {
      common: {
        E: 'E', W: 'O', both: 'les deux', axisTitle: 'Coordonnées',
        ruleLon: 'Le méridien de Greenwich, c’est 0°. À l’est, on écrit E ; à l’ouest, O (W sur les GPS et les cartes internationales), jusqu’à 180° de l’autre côté de la Terre.',
        lonWords: (a, h) => h === '0' ? 'le méridien de Greenwich' : h === '180' ? 'le méridien 180°' : `${a}° de longitude ${h === 'E' ? 'est' : 'ouest'}`,
        sunName: 'soleil au plus haut', chronoName: 'heure de Greenwich',
        dur: (h, m) => [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' '),
      },
      game: {
        modeClock: '☀️ Soleil et horloge', modeSky: '⭐ Ciel et horloge',
        readQLon: 'À quelle longitude se trouve le point rouge ?', readQLonCity: n => `À quelle longitude se trouve ${n} ?`,
        readQBoth: 'Quelles sont les coordonnées du point rouge ?', readQBothCity: n => `Quelles sont les coordonnées de ${n.replace(/^le /, '')} ?`,
        setQLon: 'Trace ce méridien sur la carte :', setQLonCity: n => `Trace sur la carte la longitude de ${n.replace(/^le /, 'du ')} :`,
        setQBoth: 'Place un point ici :', setQBothCity: n => `Place un point là où se trouve ${n} :`,
        setHelpBoth: 'Touche la carte au bon endroit, ou déplace le point avec les flèches.',
        west: '◀ Vers l’ouest', east: 'Vers l’est ▶',
        diffQLon: 'Combien de degrés séparent A et B, d’ouest en est ?', diffQLonCity: (a, b) => `${cap(a)} et ${b} : combien de degrés les séparent, d’ouest en est ?`,
        clockQ: 'Il est midi sur le bateau : le soleil est au plus haut. L’horloge donne l’heure de Greenwich. À quelle longitude est le bateau ?',
        explainLon: o => {
          const who = o.city ? `${cap(o.city)} se trouve` : 'Le point se trouve';
          if (o.h === '0') return `${who} sur le méridien de Greenwich, qui passe à Londres : 0°, sans E ni O.`;
          if (o.h === '180') return `${who} sur le méridien 180°, de l’autre côté de la Terre par rapport à Greenwich. L’est y rejoint l’ouest, donc on écrit 180° sans lettre.`;
          return `${who} à l’${o.h === 'E' ? 'est (à droite)' : 'ouest (à gauche)'} de Greenwich, donc on écrit ${o.h === 'E' ? 'E' : 'O'}. Depuis le méridien de Greenwich, il y a ${o.abs}°, donc ${o.f}.`;
        },
        explainBoth: o => `${o.city ? `${cap(o.city)} se trouve` : 'Le point se trouve'} ${o.hLat === 'N' ? 'au-dessus de l’équateur (N)' : o.hLat === 'S' ? 'au-dessous de l’équateur (S)' : 'sur l’équateur'} et ${o.hLon === 'E' ? 'à l’est de Greenwich (E)' : o.hLon === 'W' ? 'à l’ouest de Greenwich (O)' : 'sur le méridien 0° ou 180°'}. Coordonnées : ${o.f}. On écrit d’abord la latitude (N/S), puis la longitude (O/E).`,
        explainDiffLon: o => {
          if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; return `${o.city ? cap(z) : `Le point ${z}`} est sur le méridien de Greenwich, on compte donc seulement de Greenwich jusqu’à l’autre : ${o.d}°.`; }
          if (o.ha === o.hb) return `Les deux sont à l’${o.ha === 'E' ? 'est' : 'ouest'} de Greenwich, donc on soustrait : ${hi(o)} − ${lo(o)} = ${o.d}°.`;
          return `Ils sont de part et d’autre de Greenwich, donc on additionne : ${o.a} + ${o.b} = ${o.d}°.`;
        },
        explainClock: o => o.abs === 0 ? 'L’horloge indique 12:00, comme à Greenwich à midi : le bateau est sur le méridien de Greenwich, à 0°.'
          : `La Terre tourne de 15° par heure, soit 1° toutes les 4 minutes. À Greenwich, le soleil est au plus haut à 12:00. Ici, il était au plus haut quand il était ${o.time} à Greenwich — ${o.dur} plus ${o.later ? 'tard' : 'tôt'}, donc le bateau est à ${o.abs}° à l’${o.later ? 'ouest' : 'est'} : ${o.f}.`,
        yourPoint: f => `Ton point est à ${f}.`,
        fbSideLon: 'C’est de l’autre côté de Greenwich : E est à droite, O à gauche.',
        fbEast: 'Trop à l’est : déplace-le vers la gauche.', fbWest: 'Trop à l’ouest : déplace-le vers la droite.',
        fbOkLat: 'La latitude (N/S) est juste.', fbOkLon: 'La longitude (O/E) est juste.',
        factLon: 'Les étoiles donnent la latitude (N/S). Pour la longitude (O/E), il faut en plus une horloge très précise — un chronomètre de marine — qui garde l’heure de Greenwich pendant tout le voyage. La Terre tourne de 15° par heure : l’écart entre l’heure du bateau et celle de Greenwich dit à quelle distance vers l’ouest se trouve le navire. D’où le 50°14′ O du télégramme.',
      },
      sheet: {
        secLon: { ladder: '📍 Placer sur l’échelle', compare: '➡️ Le plus à l’est ?' },
        secBoth: { ladder: '📍 Placer sur la carte', compare: '🧭 Plus au nord ? Plus à l’est ?' },
        instrLon: {
          map: 'Lis la longitude de chaque point. Écris le nombre de degrés et entoure O ou E (à 0° et à 180°, n’entoure rien).',
          mapCity: 'Lis sur la carte à quelle longitude se trouvent ces lieux (à peu près). Écris le nombre de degrés et entoure O ou E.',
          ladder: 'Dessine un point sur chaque échelle à la longitude donnée.',
          compare: 'Entoure le lieu qui est le plus à l’est.',
          diff: 'Combien de degrés séparent ces lieux, d’ouest en est ?',
        },
        instrBoth: {
          map: 'Lis les coordonnées de chaque point : d’abord la latitude (N/S), puis la longitude (O/E).',
          mapCity: 'Lis sur la carte les coordonnées de ces lieux (à peu près) : d’abord la latitude (N/S), puis la longitude (O/E).',
          ladder: 'Dessine des points à ces endroits sur la carte ci-dessus et numérote-les.',
          compare: '↑ — entoure le lieu le plus au nord. → — entoure le lieu le plus à l’est.',
          diff: '↕ — combien de degrés du nord au sud ? ↔ — combien de degrés d’ouest en est ?',
        },
        instrClocks: 'Il est midi sur le bateau, et l’horloge donne l’heure de Greenwich. Écris la longitude du bateau.',
        clocksHint: 'Chaque heure vaut 15°, chaque tranche de 4 minutes vaut 1°. Après 12:00 → O, avant → E.',
        diffHintLon: 'Du même côté de Greenwich, on soustrait ; de part et d’autre, on additionne.',
      },
    },
    it: {
      common: {
        E: 'E', W: 'O', both: 'entrambe', axisTitle: 'Coordinate',
        ruleLon: 'Il meridiano di Greenwich è 0°. A est si scrive E, a ovest O (W sui GPS e sulle carte internazionali), fino a 180° dall’altra parte della Terra.',
        lonWords: (a, h) => h === '0' ? 'il meridiano di Greenwich' : h === '180' ? 'il meridiano 180°' : `${a}° di longitudine ${h === 'E' ? 'est' : 'ovest'}`,
        sunName: 'sole al punto più alto', chronoName: 'ora di Greenwich',
        dur: (h, m) => [h ? `${h} ${h === 1 ? 'ora' : 'ore'}` : '', m ? `${m} min` : ''].filter(Boolean).join(' e '),
      },
      game: {
        modeClock: '☀️ Sole e orologio', modeSky: '⭐ Cielo e orologio',
        readQLon: 'A che longitudine si trova il punto rosso?', readQLonCity: n => `A che longitudine si trova ${n}?`,
        readQBoth: 'Quali sono le coordinate del punto rosso?', readQBothCity: n => `Quali sono le coordinate di ${n.replace(/^il /, '')}?`,
        setQLon: 'Segna questo meridiano sulla carta:', setQLonCity: n => `Segna sulla carta la longitudine di ${n.replace(/^il /, '')}:`,
        setQBoth: 'Metti un punto qui:', setQBothCity: n => `Metti un punto dove si trova ${n}:`,
        setHelpBoth: 'Tocca la carta nel punto giusto, oppure sposta il punto con le frecce.',
        west: '◀ Verso ovest', east: 'Verso est ▶',
        diffQLon: 'Quanti gradi separano A e B, da ovest a est?', diffQLonCity: (a, b) => `${cap(a)} e ${b}: quanti gradi li separano, da ovest a est?`,
        clockQ: 'Sulla nave è mezzogiorno: il sole è al punto più alto. L’orologio segna l’ora di Greenwich. A che longitudine è la nave?',
        explainLon: o => {
          const who = o.city ? `${cap(o.city)} si trova` : 'Il punto si trova';
          if (o.h === '0') return `${who} sul meridiano di Greenwich, che passa per Londra: 0°, senza E né O.`;
          if (o.h === '180') return `${who} sul meridiano 180°, dall’altra parte della Terra rispetto a Greenwich. Lì l’est incontra l’ovest, quindi si scrive 180° senza lettera.`;
          return `${who} a ${o.h === 'E' ? 'est (a destra)' : 'ovest (a sinistra)'} di Greenwich, quindi si scrive ${o.h === 'E' ? 'E' : 'O'}. Dal meridiano di Greenwich ci sono ${o.abs}°, cioè ${o.f}.`;
        },
        explainBoth: o => `${o.city ? `${cap(o.city)} si trova` : 'Il punto si trova'} ${o.hLat === 'N' ? 'sopra l’equatore (N)' : o.hLat === 'S' ? 'sotto l’equatore (S)' : 'sull’equatore'} e ${o.hLon === 'E' ? 'a est di Greenwich (E)' : o.hLon === 'W' ? 'a ovest di Greenwich (O)' : 'sul meridiano 0° o 180°'}. Coordinate: ${o.f}. Prima si scrive la latitudine (N/S), poi la longitudine (O/E).`,
        explainDiffLon: o => {
          if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; return `${o.city ? cap(z) : `Il punto ${z}`} è sul meridiano di Greenwich, quindi si conta solo da Greenwich all’altro: ${o.d}°.`; }
          if (o.ha === o.hb) return `Sono tutti e due a ${o.ha === 'E' ? 'est' : 'ovest'} di Greenwich, quindi si sottrae: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
          return `Sono ai due lati di Greenwich, quindi si somma: ${o.a} + ${o.b} = ${o.d}°.`;
        },
        explainClock: o => o.abs === 0 ? 'L’orologio segna le 12:00, come a Greenwich a mezzogiorno: la nave è sul meridiano di Greenwich, a 0°.'
          : `La Terra gira di 15° all’ora, cioè di 1° ogni 4 minuti. A Greenwich il sole è al punto più alto alle 12:00. Qui lo era quando a Greenwich erano le ${o.time}: ${o.dur} più ${o.later ? 'tardi' : 'presto'}, quindi la nave è ${o.abs}° a ${o.later ? 'ovest' : 'est'}: ${o.f}.`,
        yourPoint: f => `Il tuo punto è a ${f}.`,
        fbSideLon: 'È dall’altra parte di Greenwich: E è a destra, O a sinistra.',
        fbEast: 'Troppo a est: spostalo a sinistra.', fbWest: 'Troppo a ovest: spostalo a destra.',
        fbOkLat: 'La latitudine (N/S) è giusta.', fbOkLon: 'La longitudine (O/E) è giusta.',
        factLon: 'Le stelle danno la latitudine (N/S). Per la longitudine (O/E) serviva anche un orologio precisissimo — il cronometro marino — che per tutto il viaggio segnava l’ora di Greenwich. La Terra gira di 15° all’ora, quindi dalla differenza tra l’ora della nave e quella di Greenwich si calcolava quanto a ovest fosse la nave. Da qui il 50°14′ O del telegramma.',
      },
      sheet: {
        secLon: { ladder: '📍 Segna sulla scala', compare: '➡️ Più a est?' },
        secBoth: { ladder: '📍 Segna sulla carta', compare: '🧭 Più a nord? Più a est?' },
        instrLon: {
          map: 'Leggi la longitudine di ogni punto. Scrivi il numero di gradi e cerchia O o E (a 0° e a 180° non cerchiare niente).',
          mapCity: 'Leggi sulla carta a che longitudine si trovano questi luoghi (all’incirca). Scrivi il numero di gradi e cerchia O o E.',
          ladder: 'Disegna un punto su ogni scala alla longitudine indicata.',
          compare: 'Cerchia il luogo che si trova più a est.',
          diff: 'Quanti gradi separano questi luoghi, da ovest a est?',
        },
        instrBoth: {
          map: 'Leggi le coordinate di ogni punto: prima la latitudine (N/S), poi la longitudine (O/E).',
          mapCity: 'Leggi sulla carta le coordinate di questi luoghi (all’incirca): prima la latitudine (N/S), poi la longitudine (O/E).',
          ladder: 'Disegna dei punti in queste posizioni sulla carta qui sopra e numerali.',
          compare: '↑ — cerchia il luogo più a nord. → — cerchia il luogo più a est.',
          diff: '↕ — quanti gradi da nord a sud? ↔ — quanti gradi da ovest a est?',
        },
        instrClocks: 'Sulla nave è mezzogiorno e l’orologio segna l’ora di Greenwich. Scrivi la longitudine della nave.',
        clocksHint: 'Ogni ora vale 15°, ogni 4 minuti 1°. Dopo le 12:00 → O, prima → E.',
        diffHintLon: 'Dalla stessa parte di Greenwich si sottrae, ai due lati si somma.',
      },
    },
    es: {
      common: {
        E: 'E', W: 'O', both: 'ambas', axisTitle: 'Coordenadas',
        ruleLon: 'El meridiano de Greenwich es 0°. Al este se escribe E; al oeste, O (W en los GPS y los mapas internacionales), hasta 180° al otro lado de la Tierra.',
        lonWords: (a, h) => h === '0' ? 'el meridiano de Greenwich' : h === '180' ? 'el meridiano 180°' : `${a}° de longitud ${h === 'E' ? 'este' : 'oeste'}`,
        sunName: 'sol en lo más alto', chronoName: 'hora de Greenwich',
        dur: (h, m) => [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' '),
      },
      game: {
        modeClock: '☀️ Sol y reloj', modeSky: '⭐ Cielo y reloj',
        readQLon: '¿En qué longitud está el punto rojo?', readQLonCity: n => `¿En qué longitud está ${n}?`,
        readQBoth: '¿Cuáles son las coordenadas del punto rojo?', readQBothCity: n => `¿Cuáles son las coordenadas de ${n.replace(/^el /, '')}?`,
        setQLon: 'Marca este meridiano en el mapa:', setQLonCity: n => `Marca en el mapa la longitud de ${n.replace(/^el /, '')}:`,
        setQBoth: 'Pon un punto aquí:', setQBothCity: n => `Pon un punto donde está ${n}:`,
        setHelpBoth: 'Toca el mapa en el lugar correcto o mueve el punto con las flechas.',
        west: '◀ Hacia el oeste', east: 'Hacia el este ▶',
        diffQLon: '¿Cuántos grados separan A y B, de oeste a este?', diffQLonCity: (a, b) => `${cap(a)} y ${b}: ¿cuántos grados los separan, de oeste a este?`,
        clockQ: 'En el barco es mediodía: el sol está en lo más alto. El reloj marca la hora de Greenwich. ¿En qué longitud está el barco?',
        explainLon: o => {
          const who = o.city ? `${cap(o.city)} está` : 'El punto está';
          if (o.h === '0') return `${who} en el meridiano de Greenwich, que pasa por Londres: 0°, sin E ni O.`;
          if (o.h === '180') return `${who} en el meridiano 180°, al otro lado de la Tierra respecto a Greenwich. Allí el este se junta con el oeste, así que se escribe 180° sin letra.`;
          return `${who} al ${o.h === 'E' ? 'este (a la derecha)' : 'oeste (a la izquierda)'} de Greenwich, así que se escribe ${o.h === 'E' ? 'E' : 'O'}. Desde el meridiano de Greenwich hay ${o.abs}°, es decir, ${o.f}.`;
        },
        explainBoth: o => `${o.city ? `${cap(o.city)} está` : 'El punto está'} ${o.hLat === 'N' ? 'por encima del ecuador (N)' : o.hLat === 'S' ? 'por debajo del ecuador (S)' : 'en el ecuador'} y ${o.hLon === 'E' ? 'al este de Greenwich (E)' : o.hLon === 'W' ? 'al oeste de Greenwich (O)' : 'en el meridiano 0° o 180°'}. Coordenadas: ${o.f}. Primero se escribe la latitud (N/S) y después la longitud (O/E).`,
        explainDiffLon: o => {
          if (o.ha === '0' || o.hb === '0') { const z = o.ha === '0' ? o.nA : o.nB; return `${o.city ? cap(z) : `El punto ${z}`} está en el meridiano de Greenwich, así que solo se cuenta desde Greenwich hasta el otro: ${o.d}°.`; }
          if (o.ha === o.hb) return `Los dos están al ${o.ha === 'E' ? 'este' : 'oeste'} de Greenwich, así que se resta: ${hi(o)} − ${lo(o)} = ${o.d}°.`;
          return `Están a los dos lados de Greenwich, así que se suma: ${o.a} + ${o.b} = ${o.d}°.`;
        },
        explainClock: o => o.abs === 0 ? 'El reloj marca las 12:00, como Greenwich a mediodía: el barco está en el meridiano de Greenwich, a 0°.'
          : `La Tierra gira 15° por hora, es decir, 1° cada 4 minutos. En Greenwich el sol está en lo más alto a las 12:00. Aquí lo estuvo cuando en Greenwich eran las ${o.time}: ${o.dur} más ${o.later ? 'tarde' : 'temprano'}, así que el barco está ${o.abs}° al ${o.later ? 'oeste' : 'este'}: ${o.f}.`,
        yourPoint: f => `Tu punto está en ${f}.`,
        fbSideLon: 'Eso está al otro lado de Greenwich: E está a la derecha y O a la izquierda.',
        fbEast: 'Demasiado al este: muévelo a la izquierda.', fbWest: 'Demasiado al oeste: muévelo a la derecha.',
        fbOkLat: 'La latitud (N/S) está bien.', fbOkLon: 'La longitud (O/E) está bien.',
        factLon: 'Las estrellas dan la latitud (N/S). Para la longitud (O/E) hacía falta además un reloj muy exacto — un cronómetro marino — que durante todo el viaje marcaba la hora de Greenwich. La Tierra gira 15° por hora, así que la diferencia entre la hora del barco y la de Greenwich decía cuánto al oeste estaba el barco. De ahí el 50°14′ O del telegrama.',
      },
      sheet: {
        secLon: { ladder: '📍 Marca en la escala', compare: '➡️ ¿Más al este?' },
        secBoth: { ladder: '📍 Marca en el mapa', compare: '🧭 ¿Más al norte? ¿Más al este?' },
        instrLon: {
          map: 'Lee la longitud de cada punto. Escribe el número de grados y rodea O o E (en 0° y 180° no rodees nada).',
          mapCity: 'Lee en el mapa en qué longitud están estos lugares (más o menos). Escribe el número de grados y rodea O o E.',
          ladder: 'Dibuja un punto en cada escala en la longitud indicada.',
          compare: 'Rodea el lugar que está más al este.',
          diff: '¿Cuántos grados separan estos lugares, de oeste a este?',
        },
        instrBoth: {
          map: 'Lee las coordenadas de cada punto: primero la latitud (N/S) y después la longitud (O/E).',
          mapCity: 'Lee en el mapa las coordenadas de estos lugares (más o menos): primero la latitud (N/S) y después la longitud (O/E).',
          ladder: 'Dibuja puntos en estas posiciones en el mapa de arriba y numéralos.',
          compare: '↑ — rodea el lugar más al norte. → — rodea el lugar más al este.',
          diff: '↕ — ¿cuántos grados de norte a sur? ↔ — ¿cuántos grados de oeste a este?',
        },
        instrClocks: 'En el barco es mediodía y el reloj marca la hora de Greenwich. Escribe la longitud del barco.',
        clocksHint: 'Cada hora son 15° y cada 4 minutos, 1°. Después de las 12:00 → O, antes → E.',
        diffHintLon: 'Al mismo lado de Greenwich se resta; a los dos lados se suma.',
      },
    },
  };
  for (const l of Object.keys(LON)) for (const part of ['common', 'game', 'sheet']) Object.assign(T[l][part], LON[l][part]);
  // the story gets the chronometer, before the last paragraph (GPS today)
  for (const l of Object.keys(LON)) { const f = T[l].game.fact; f.splice(f.length - 1, 0, T[l].game.factLon); }

  /* ---------- titles now that the game has N S W E, and "why does it work?" ---------- */
  const WHY = {
    pl: {
      common: {
        brand: '🌍 Współrzędne geograficzne: N S W E',
        whyTitle: 'Dlaczego kąt mówi, gdzie jesteś?', whyLonTitle: 'Dlaczego zegar mówi, gdzie jesteś?',
        whyText: 'Gwiazda Polarna jest tak daleko, że jej światło dociera do każdego miejsca na Ziemi po liniach równoległych do osi Ziemi. Horyzont to linia, która dotyka Ziemi tam, gdzie stoisz. Na biegunie widzisz gwiazdę prosto nad głową (90°), na równiku — na samym horyzoncie (0°). Pomiędzy kąt nad horyzontem jest dokładnie równy kątowi od równika do ciebie, mierzonemu ze środka Ziemi — a ten kąt to właśnie szerokość geograficzna. Na półkuli południowej tak samo działa biegun nieba, który wskazuje Krzyż Południa.',
        whyLonText: 'Ziemia obraca się raz na dobę: 360° w 24 godziny, czyli 15° na godzinę. Południe jest tam, gdzie Słońce stoi najwyżej — na południku, który akurat patrzy prosto na Słońce. Południk statku i południk Greenwich mijają Słońce o różnych porach. Ile godzin dzieli te dwa południa, tyle razy 15° dzieli te dwa południki. Jeśli w Greenwich południe było wcześniej, statek jest na zachód (W), a jeśli dopiero będzie — na wschód (E).',
        whyNames: { star: 'Gwiazda Polarna (bardzo daleko)', skyPole: 'biegun nieba (bardzo daleko)', axis: 'oś Ziemi', equator: 'równik', horizon: 'horyzont', same: 'te same kąty', sun: 'Słońce', ship: 'statek: 12:00', turn: 'Ziemia obraca się o 15° na godzinę', pole: 'biegun N' },
      },
      game: { title: 'Współrzędne geograficzne N S W E — gra', setHelpBoth: 'Stuknij mapę we właściwym miejscu albo użyj strzałek.' },
      sheet: {
        title: 'Współrzędne geograficzne N S W E — karta pracy', appTitle: '🌍 Współrzędne geograficzne N S W E — karta pracy',
        appSub: 'Karta A4 do druku: odczytaj z mapy, zaznacz, odczytaj z gwiazd i z zegara, porównaj i policz stopnie. Z rozwiązaniami.',
        sheetTitleLon: 'Długość geograficzna: W i E', sheetTitleBoth: 'Współrzędne geograficzne',
        optWhy: 'Dlaczego to działa? (osobna strona)', whyPageTitle: 'Dlaczego to działa?',
      },
    },
    en: {
      common: {
        brand: '🌍 Latitude and longitude: N S W E',
        whyTitle: 'Why does the angle tell you where you are?', whyLonTitle: 'Why does the clock tell you where you are?',
        whyText: 'The Pole Star is so far away that its light reaches every place on Earth along lines parallel to the Earth’s axis. The horizon is the line that touches the Earth where you stand. At the pole you see the star straight overhead (90°), on the equator right on the horizon (0°). In between, the angle above the horizon is exactly the angle from the equator to you, measured from the centre of the Earth — and that angle is your latitude. In the Southern Hemisphere the sky’s pole, found with the Southern Cross, works the same way.',
        whyLonText: 'The Earth turns once a day: 360° in 24 hours, which is 15° an hour. Noon is where the sun stands highest — on the meridian that is facing the sun right now. The ship’s meridian and the Greenwich meridian pass the sun at different times. However many hours lie between the two noons, that many times 15° lie between the two meridians. If noon came to Greenwich earlier, the ship is west (W); if it is still to come, the ship is east (E).',
        whyNames: { star: 'Pole Star (very far away)', skyPole: 'sky’s pole (very far away)', axis: 'Earth’s axis', equator: 'equator', horizon: 'horizon', same: 'the same angles', sun: 'Sun', ship: 'ship: 12:00', turn: 'The Earth turns 15° an hour', pole: 'North Pole' },
      },
      game: { title: 'Latitude and longitude N S W E — game', setHelpBoth: 'Tap the map at the right place, or use the arrows.' },
      sheet: {
        title: 'Latitude and longitude N S W E — worksheet', appTitle: '🌍 Latitude and longitude N S W E — worksheet',
        appSub: 'A printable A4 sheet: read the map, mark, read the stars and the clock, compare and count degrees. With an answer key.',
        sheetTitleLon: 'Longitude: W and E', sheetTitleBoth: 'Coordinates: latitude and longitude',
        optWhy: 'Why does it work? (extra page)', whyPageTitle: 'Why does it work?',
      },
    },
    uk: {
      common: {
        brand: '🌍 Географічні координати: N S W E',
        whyTitle: 'Чому кут показує, де ти?', whyLonTitle: 'Чому годинник показує, де ти?',
        whyText: 'Полярна зоря так далеко, що її світло доходить до кожного місця на Землі вздовж ліній, паралельних осі Землі. Горизонт — це лінія, що торкається Землі там, де ти стоїш. На полюсі зорю видно просто над головою (90°), на екваторі — на самому горизонті (0°). Між ними кут над горизонтом точно дорівнює куту від екватора до тебе, виміряному з центру Землі, — а цей кут і є географічна широта. У Південній півкулі так само діє полюс неба, який показує Південний Хрест.',
        whyLonText: 'Земля обертається раз на добу: 360° за 24 години, тобто 15° за годину. Полудень там, де Сонце стоїть найвище, — на меридіані, що саме дивиться на Сонце. Меридіан корабля й меридіан Гринвіча проходять повз Сонце в різний час. Скільки годин між цими двома полуднями, стільки разів по 15° між двома меридіанами. Якщо в Гринвічі полудень був раніше, корабель на заході (W), а якщо ще буде — на сході (E).',
        whyNames: { star: 'Полярна зоря (дуже далеко)', skyPole: 'полюс неба (дуже далеко)', axis: 'вісь Землі', equator: 'екватор', horizon: 'горизонт', same: 'однакові кути', sun: 'Сонце', ship: 'корабель: 12:00', turn: 'Земля обертається на 15° за годину', pole: 'Північний полюс' },
      },
      game: { title: 'Географічні координати N S W E — гра', setHelpBoth: 'Торкнися мапи в потрібному місці або скористайся стрілками.' },
      sheet: {
        title: 'Географічні координати N S W E — робочий аркуш', appTitle: '🌍 Географічні координати N S W E — робочий аркуш',
        appSub: 'Аркуш A4 для друку: визнач на мапі, познач, визнач за зорями й годинником, порівняй і порахуй градуси. З відповідями.',
        sheetTitleLon: 'Географічна довгота: W і E', sheetTitleBoth: 'Географічні координати',
        optWhy: 'Чому це працює? (окрема сторінка)', whyPageTitle: 'Чому це працює?',
      },
    },
    vi: {
      common: {
        brand: '🌍 Tọa độ địa lý: B N T Đ',
        whyTitle: 'Vì sao góc cho biết em ở đâu?', whyLonTitle: 'Vì sao đồng hồ cho biết em ở đâu?',
        whyText: 'Sao Bắc Cực ở rất xa, nên ánh sáng của nó đến mọi nơi trên Trái Đất theo những đường song song với trục Trái Đất. Đường chân trời là đường chạm vào Trái Đất ở chỗ em đứng. Ở cực, em thấy sao ngay trên đầu (90°); ở xích đạo, sao nằm sát chân trời (0°). Ở giữa, góc trên chân trời đúng bằng góc từ xích đạo đến chỗ em, đo từ tâm Trái Đất — và góc đó chính là vĩ độ. Ở Nam bán cầu, cực trời mà chòm Nam Thập Tự chỉ tới cũng giúp đo như vậy.',
        whyLonText: 'Trái Đất quay một vòng mỗi ngày: 360° trong 24 giờ, tức 15° mỗi giờ. Giữa trưa là lúc mặt trời cao nhất — ở kinh tuyến đang quay thẳng về phía mặt trời. Kinh tuyến của tàu và kinh tuyến Greenwich đi qua mặt trời vào những lúc khác nhau. Hai buổi trưa cách nhau bao nhiêu giờ thì hai kinh tuyến cách nhau bấy nhiêu lần 15°. Nếu Greenwich đến trưa sớm hơn, tàu ở phía tây (T); nếu Greenwich chưa đến trưa, tàu ở phía đông (Đ).',
        whyNames: { star: 'Sao Bắc Cực (rất xa)', skyPole: 'cực trời (rất xa)', axis: 'trục Trái Đất', equator: 'xích đạo', horizon: 'chân trời', same: 'hai góc bằng nhau', sun: 'Mặt Trời', ship: 'tàu: 12:00', turn: 'Trái Đất quay 15° mỗi giờ', pole: 'Bắc Cực' },
      },
      game: { title: 'Tọa độ địa lý B N T Đ — trò chơi', setHelpBoth: 'Chạm vào bản đồ ở đúng chỗ, hoặc dùng các mũi tên.' },
      sheet: {
        title: 'Tọa độ địa lý B N T Đ — phiếu bài tập', appTitle: '🌍 Tọa độ địa lý B N T Đ — phiếu bài tập',
        appSub: 'Phiếu A4 để in: đọc bản đồ, đánh dấu, đọc sao và đồng hồ, so sánh và tính số độ. Kèm đáp án.',
        sheetTitleLon: 'Kinh độ Đông (Đ) và Tây (T)', sheetTitleBoth: 'Tọa độ địa lý',
        optWhy: 'Vì sao lại đúng? (trang riêng)', whyPageTitle: 'Vì sao lại đúng?',
      },
    },
    fr: {
      common: {
        brand: '🌍 Latitude et longitude : N S O E',
        whyTitle: 'Pourquoi l’angle dit-il où tu es ?', whyLonTitle: 'Pourquoi l’horloge dit-elle où tu es ?',
        whyText: 'L’étoile Polaire est si loin que sa lumière arrive partout sur Terre selon des lignes parallèles à l’axe de la Terre. L’horizon est la ligne qui touche la Terre là où tu te tiens. Au pôle, tu vois l’étoile juste au-dessus de ta tête (90°) ; à l’équateur, tout au ras de l’horizon (0°). Entre les deux, l’angle au-dessus de l’horizon est exactement l’angle entre l’équateur et toi, mesuré depuis le centre de la Terre — et cet angle, c’est ta latitude. Dans l’hémisphère Sud, le pôle céleste indiqué par la Croix du Sud fonctionne de la même façon.',
        whyLonText: 'La Terre fait un tour par jour : 360° en 24 heures, soit 15° par heure. Il est midi là où le soleil est au plus haut — sur le méridien qui fait face au soleil à ce moment. Le méridien du bateau et celui de Greenwich passent devant le soleil à des heures différentes. Autant d’heures entre les deux midis, autant de fois 15° entre les deux méridiens. Si midi est arrivé plus tôt à Greenwich, le bateau est à l’ouest (O) ; s’il n’y est pas encore arrivé, il est à l’est (E).',
        whyNames: { star: 'étoile Polaire (très loin)', skyPole: 'pôle céleste (très loin)', axis: 'axe de la Terre', equator: 'équateur', horizon: 'horizon', same: 'les mêmes angles', sun: 'Soleil', ship: 'bateau : 12:00', turn: 'La Terre tourne de 15° par heure', pole: 'pôle Nord' },
      },
      game: { title: 'Latitude et longitude N S O E — jeu', setHelpBoth: 'Touche la carte au bon endroit, ou utilise les flèches.' },
      sheet: {
        title: 'Latitude et longitude N S O E — fiche d’exercices', appTitle: '🌍 Latitude et longitude N S O E — fiche d’exercices',
        appSub: 'Une fiche A4 à imprimer : lire la carte, placer, lire les étoiles et l’horloge, comparer et compter les degrés. Avec le corrigé.',
        sheetTitleLon: 'Longitude : O et E', sheetTitleBoth: 'Coordonnées géographiques',
        optWhy: 'Pourquoi ça marche ? (page à part)', whyPageTitle: 'Pourquoi ça marche ?',
      },
    },
    it: {
      common: {
        brand: '🌍 Latitudine e longitudine: N S O E',
        whyTitle: 'Perché l’angolo dice dove sei?', whyLonTitle: 'Perché l’orologio dice dove sei?',
        whyText: 'La Stella Polare è così lontana che la sua luce arriva in ogni punto della Terra lungo linee parallele all’asse terrestre. L’orizzonte è la linea che tocca la Terra nel punto in cui ti trovi. Al polo vedi la stella proprio sopra la testa (90°), all’equatore proprio sull’orizzonte (0°). In mezzo, l’angolo sopra l’orizzonte è esattamente l’angolo tra l’equatore e te, misurato dal centro della Terra — e quell’angolo è la latitudine. Nell’emisfero australe funziona allo stesso modo il polo celeste indicato dalla Croce del Sud.',
        whyLonText: 'La Terra fa un giro al giorno: 360° in 24 ore, cioè 15° all’ora. È mezzogiorno dove il sole è al punto più alto — sul meridiano che in quel momento guarda il sole. Il meridiano della nave e quello di Greenwich passano davanti al sole in momenti diversi. Quante ore ci sono tra i due mezzogiorni, tante volte 15° ci sono tra i due meridiani. Se a Greenwich mezzogiorno è arrivato prima, la nave è a ovest (O); se deve ancora arrivare, è a est (E).',
        whyNames: { star: 'Stella Polare (lontanissima)', skyPole: 'polo celeste (lontanissimo)', axis: 'asse della Terra', equator: 'equatore', horizon: 'orizzonte', same: 'gli stessi angoli', sun: 'Sole', ship: 'nave: 12:00', turn: 'La Terra gira di 15° all’ora', pole: 'Polo Nord' },
      },
      game: { title: 'Latitudine e longitudine N S O E — gioco', setHelpBoth: 'Tocca la carta nel punto giusto, oppure usa le frecce.' },
      sheet: {
        title: 'Latitudine e longitudine N S O E — scheda di esercizi', appTitle: '🌍 Latitudine e longitudine N S O E — scheda di esercizi',
        appSub: 'Una scheda A4 da stampare: leggi la carta, segna, leggi le stelle e l’orologio, confronta e conta i gradi. Con le soluzioni.',
        sheetTitleLon: 'Longitudine: O ed E', sheetTitleBoth: 'Coordinate geografiche',
        optWhy: 'Perché funziona? (pagina a parte)', whyPageTitle: 'Perché funziona?',
      },
    },
    es: {
      common: {
        brand: '🌍 Latitud y longitud: N S O E',
        whyTitle: '¿Por qué el ángulo dice dónde estás?', whyLonTitle: '¿Por qué el reloj dice dónde estás?',
        whyText: 'La Estrella Polar está tan lejos que su luz llega a cualquier lugar de la Tierra por líneas paralelas al eje de la Tierra. El horizonte es la línea que toca la Tierra donde estás. En el polo ves la estrella justo encima de la cabeza (90°); en el ecuador, justo en el horizonte (0°). Entre medias, el ángulo sobre el horizonte es exactamente el ángulo entre el ecuador y tú, medido desde el centro de la Tierra — y ese ángulo es la latitud. En el hemisferio sur funciona igual el polo celeste que señala la Cruz del Sur.',
        whyLonText: 'La Tierra da una vuelta al día: 360° en 24 horas, es decir, 15° por hora. Es mediodía donde el sol está en lo más alto — en el meridiano que en ese momento mira al sol. El meridiano del barco y el de Greenwich pasan frente al sol a horas distintas. Tantas horas como haya entre los dos mediodías, tantas veces 15° hay entre los dos meridianos. Si a Greenwich el mediodía llegó antes, el barco está al oeste (O); si aún no ha llegado, está al este (E).',
        whyNames: { star: 'Estrella Polar (muy lejos)', skyPole: 'polo celeste (muy lejos)', axis: 'eje de la Tierra', equator: 'ecuador', horizon: 'horizonte', same: 'los mismos ángulos', sun: 'Sol', ship: 'barco: 12:00', turn: 'La Tierra gira 15° por hora', pole: 'Polo Norte' },
      },
      game: { title: 'Latitud y longitud N S O E — juego', setHelpBoth: 'Toca el mapa en el lugar correcto o usa las flechas.' },
      sheet: {
        title: 'Latitud y longitud N S O E — ficha de ejercicios', appTitle: '🌍 Latitud y longitud N S O E — ficha de ejercicios',
        appSub: 'Una ficha A4 para imprimir: lee el mapa, marca, lee las estrellas y el reloj, compara y cuenta grados. Con las soluciones.',
        sheetTitleLon: 'Longitud: O y E', sheetTitleBoth: 'Coordenadas geográficas',
        optWhy: '¿Por qué funciona? (página aparte)', whyPageTitle: '¿Por qué funciona?',
      },
    },
  };
  for (const l of Object.keys(WHY)) for (const part of ['common', 'game', 'sheet']) Object.assign(T[l][part], WHY[l][part]);

  // the worksheet's task list knows the star task too
  for (const l of Object.keys(T)) T[l].sheet.secs.stars = T[l].sheet.secStars;

  return T;
})();
if (typeof module !== 'undefined') module.exports = LAT_TEXT;
