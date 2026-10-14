/**
 * Texts of the clock game and worksheet in five languages. Classic script; defines the global `CLOCK_TEXT`.
 * `common` is shared by both pages, `game` belongs to index.html, `sheet` to worksheet.html.
 * Functions get plain values and return plain text (the pages escape it).
 */
const CLOCK_TEXT = (() => {
  // Plural forms. pl: 1 / 2–4 (not 12–14) / rest.  uk: like pl, but 21, 31… take the singular form.
  const plPl = (n, one, few, many) => n === 1 ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  const ukPl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11) ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  // o = { h, nx, m, dig, words, per, dig24, h24, num } — h/nx: the hour and the next one (1–12), num: the number the long hand points at
  const T = {};

  T.pl = {
    common: {
      brand: '🕐 Nauka zegara',
      allPuzzles: '🧩 Wszystkie zagadki', printWorksheet: '🖨️ Karta pracy', playOnline: '🎮 Graj online',
      level: 'Poziom', levels: { hour: 'Pełne godziny', half: 'Pełne i wpół', quarter: 'Kwadranse', five: 'Co 5 minut', minute: 'Co minutę' },
      periods: { night: '🌙 w nocy', morning: '🌅 rano', afternoon: '☀️ po południu', evening: '🌆 wieczorem' },
      optMinutes: 'Minuty na tarczy (00, 05, 10…)', opt24: 'Zegar 24-godzinny (np. 15:30)',
      hourHand: 'krótka wskazówka — godziny', minuteHand: 'długa wskazówka — minuty',
    },
    game: {
      title: 'Nauka zegara — gra',
      modeLabel: 'Rodzaj gry', modeRead: '🔎 Która godzina?', modeSet: '✋ Ustaw zegar',
      settings: 'Ustawienia',
      readQ: 'Która godzina jest na zegarze?',
      setQ: 'Ustaw zegar na godzinę:',
      setHelp: 'Przeciągnij wskazówkę palcem albo myszką. Możesz też użyć przycisków.',
      hourMinus: '−1 godz.', hourPlus: '+1 godz.', minMinus: s => `−${s} min`, minPlus: s => `+${s} min`,
      check: '✅ Sprawdź', next: 'Dalej ➜', show: '👀 Pokaż rozwiązanie',
      good: ['Brawo!', 'Świetnie!', 'Super!', 'Tak jest!', 'Doskonale!'], bad: 'Niestety nie.', shown: 'Oto rozwiązanie.',
      taskN: n => `Zadanie ${n}`,
      explain: o => (o.m === 0
        ? `Krótka wskazówka pokazuje ${o.h}, a długa stoi na 12 — to pełna godzina.`
        : `Krótka wskazówka jest między ${o.h} a ${o.nx} — liczy się ${o.h}, bo tę liczbę już minęła. Długa wskazówka pokazuje ${o.m} ${plPl(o.m, 'minutę', 'minuty', 'minut')}.`)
        + ` Jest ${o.dig}${o.words ? ` — ${o.words}` : ''}.` + (o.h24 ? ` Jest ${o.per}, więc w zapisie 24-godzinnym to ${o.dig24}.` : ''),
      yourClock: dig => `Na twoim zegarze jest ${dig}.`,
      fixMinute: o => o.m === 0 ? 'Długa wskazówka powinna stać na 12 — to pełna godzina.' : `Długa wskazówka powinna pokazywać ${o.m} ${plPl(o.m, 'minutę', 'minuty', 'minut')}${o.num ? ` — czyli stać na liczbie ${o.num}` : ''}.`,
      fixHour: o => o.m === 0 ? `Minuty są dobrze, ale krótka wskazówka powinna pokazywać ${o.h}.` : `Minuty są dobrze, ale krótka wskazówka powinna być między ${o.h} a ${o.nx}.`,
      tryAgain: 'Popraw i sprawdź jeszcze raz.',
      starsTitle: 'Zebrane gwiazdki', streakTitle: 'Seria dobrych odpowiedzi',
      stats: (ok, all, best) => `Dobrze: ${ok} z ${all} · najdłuższa seria: ${best}`,
      reset: 'Wyzeruj wyniki', resetConfirm: 'Wyzerować gwiazdki i wyniki?',
      clockLabel: dig => `Zegar pokazuje ${dig}`, clockSetLabel: 'Zegar do ustawienia',
    },
    sheet: {
      title: 'Nauka zegara — karta pracy',
      appTitle: '🕐 Nauka zegara — karta pracy',
      appSub: 'Karty A4 do druku: odczytaj godzinę albo narysuj wskazówki. Z rozwiązaniami.',
      seed: 'Kod karty', seedHint: 'Ten sam kod i te same ustawienia ⇒ ta sama karta.', randomSeed: 'Losowy kod',
      task: 'Zadanie', tasks: { read: '🔎 Odczytaj godzinę', draw: '✏️ Narysuj wskazówki', mix: '🔀 Mieszane' },
      count: 'Liczba zegarów', options: 'Opcje',
      optWords: 'Godzina słowami przy rysowaniu', optKey: 'Strona z rozwiązaniami',
      newWorksheet: 'Nowa karta', print: 'Drukuj / zapisz PDF',
      sheetTitle: 'Która godzina?', sheetSub: (lvl, n) => `${lvl} · ${n} ${plPl(n, 'zegar', 'zegary', 'zegarów')}`,
      instr: { read: 'Odczytaj godzinę z każdego zegara i wpisz ją w okienka.', draw: 'Narysuj wskazówki: krótką dla godzin i długą dla minut.', mix: 'Pod zegarem ze wskazówkami wpisz godzinę. Na pustym zegarze narysuj wskazówki: krótką dla godzin, długą dla minut.' },
      instr24: ' Pora dnia podpowiada, czy to godzina rano, czy po południu (np. 3:30 po południu to 15:30).',
      name: 'Imię: ____________________', date: 'Data: ____________________', seedLabel: 'Kod:',
      keyTitle: 'Rozwiązania', keySub: (lvl, n) => `${lvl} · ${n} ${plPl(n, 'zegar', 'zegary', 'zegarów')}`,
      summary: (n, p) => `${n} ${plPl(n, 'zegar', 'zegary', 'zegarów')} · ${p} ${plPl(p, 'strona', 'strony', 'stron')}`,
      genError: 'Błąd: ',
    },
  };

  T.en = {
    common: {
      brand: '🕐 Tell the Time',
      allPuzzles: '🧩 All puzzles', printWorksheet: '🖨️ Worksheet', playOnline: '🎮 Play online',
      level: 'Level', levels: { hour: 'O’clock', half: 'O’clock & half past', quarter: 'Quarters', five: 'Every 5 minutes', minute: 'Every minute' },
      periods: { night: '🌙 at night', morning: '🌅 in the morning', afternoon: '☀️ in the afternoon', evening: '🌆 in the evening' },
      optMinutes: 'Minutes on the dial (00, 05, 10…)', opt24: '24-hour clock (e.g. 15:30)',
      hourHand: 'short hand — hours', minuteHand: 'long hand — minutes',
    },
    game: {
      title: 'Tell the Time — game',
      modeLabel: 'Game mode', modeRead: '🔎 What time is it?', modeSet: '✋ Set the clock',
      settings: 'Settings',
      readQ: 'What time does the clock show?',
      setQ: 'Set the clock to:',
      setHelp: 'Drag a hand with your finger or the mouse. You can also use the buttons.',
      hourMinus: '−1 hour', hourPlus: '+1 hour', minMinus: s => `−${s} min`, minPlus: s => `+${s} min`,
      check: '✅ Check', next: 'Next ➜', show: '👀 Show the answer',
      good: ['Well done!', 'Great!', 'Super!', 'That’s right!', 'Excellent!'], bad: 'Not quite.', shown: 'Here is the answer.',
      taskN: n => `Task ${n}`,
      explain: o => (o.m === 0
        ? `The short hand points at ${o.h} and the long hand is on 12 — it is a full hour.`
        : `The short hand is between ${o.h} and ${o.nx} — it counts as ${o.h}, because it has already passed ${o.h}. The long hand shows ${o.m} ${o.m === 1 ? 'minute' : 'minutes'}.`)
        + ` It is ${o.dig}${o.words ? ` — ${o.words}` : ''}.` + (o.h24 ? ` It is ${o.per}, so on a 24-hour clock it is ${o.dig24}.` : ''),
      yourClock: dig => `Your clock shows ${dig}.`,
      fixMinute: o => o.m === 0 ? 'The long hand should point at 12 — it is a full hour.' : `The long hand should show ${o.m} ${o.m === 1 ? 'minute' : 'minutes'}${o.num ? ` — it should point at ${o.num}` : ''}.`,
      fixHour: o => o.m === 0 ? `The minutes are right, but the short hand should point at ${o.h}.` : `The minutes are right, but the short hand should be between ${o.h} and ${o.nx}.`,
      tryAgain: 'Fix it and check again.',
      starsTitle: 'Stars collected', streakTitle: 'Right answers in a row',
      stats: (ok, all, best) => `Right: ${ok} of ${all} · best streak: ${best}`,
      reset: 'Reset scores', resetConfirm: 'Reset the stars and scores?',
      clockLabel: dig => `The clock shows ${dig}`, clockSetLabel: 'Clock to set',
    },
    sheet: {
      title: 'Tell the Time — worksheet',
      appTitle: '🕐 Tell the Time — worksheet',
      appSub: 'Printable A4 sheets: read the time or draw the hands. With an answer key.',
      seed: 'Sheet code', seedHint: 'Same code + same settings ⇒ the same sheet.', randomSeed: 'Random code',
      task: 'Task', tasks: { read: '🔎 Read the time', draw: '✏️ Draw the hands', mix: '🔀 Mixed' },
      count: 'Number of clocks', options: 'Options',
      optWords: 'Time in words when drawing', optKey: 'Answer key page',
      newWorksheet: 'New sheet', print: 'Print / Save PDF',
      sheetTitle: 'What time is it?', sheetSub: (lvl, n) => `${lvl} · ${n} ${n === 1 ? 'clock' : 'clocks'}`,
      instr: { read: 'Read the time on each clock and write it in the boxes.', draw: 'Draw the hands: a short one for the hours and a long one for the minutes.', mix: 'Under a clock with hands, write the time. On an empty clock, draw the hands: a short one for the hours, a long one for the minutes.' },
      instr24: ' The time of day tells you whether it is morning or afternoon (3:30 in the afternoon is 15:30).',
      name: 'Name: ____________________', date: 'Date: ____________________', seedLabel: 'Code:',
      keyTitle: 'Answer key', keySub: (lvl, n) => `${lvl} · ${n} ${n === 1 ? 'clock' : 'clocks'}`,
      summary: (n, p) => `${n} ${n === 1 ? 'clock' : 'clocks'} · ${p} ${p === 1 ? 'page' : 'pages'}`,
      genError: 'Error: ',
    },
  };

  T.uk = {
    common: {
      brand: '🕐 Котра година?',
      allPuzzles: '🧩 Усі головоломки', printWorksheet: '🖨️ Робочий аркуш', playOnline: '🎮 Грати онлайн',
      level: 'Рівень', levels: { hour: 'Повні години', half: 'Рівно і пів', quarter: 'Чверті', five: 'Кожні 5 хвилин', minute: 'Кожна хвилина' },
      periods: { night: '🌙 уночі', morning: '🌅 уранці', afternoon: '☀️ удень', evening: '🌆 увечері' },
      optMinutes: 'Хвилини на циферблаті (00, 05, 10…)', opt24: '24-годинний формат (напр. 15:30)',
      hourHand: 'коротка стрілка — години', minuteHand: 'довга стрілка — хвилини',
    },
    game: {
      title: 'Котра година? — гра',
      modeLabel: 'Режим гри', modeRead: '🔎 Котра година?', modeSet: '✋ Постав годинник',
      settings: 'Налаштування',
      readQ: 'Котру годину показує годинник?',
      setQ: 'Постав годинник на:',
      setHelp: 'Перетягни стрілку пальцем або мишкою. Можна також натискати кнопки.',
      hourMinus: '−1 год', hourPlus: '+1 год', minMinus: s => `−${s} хв`, minPlus: s => `+${s} хв`,
      check: '✅ Перевірити', next: 'Далі ➜', show: '👀 Показати відповідь',
      good: ['Молодець!', 'Чудово!', 'Супер!', 'Так!', 'Відмінно!'], bad: 'На жаль, ні.', shown: 'Ось відповідь.',
      taskN: n => `Завдання ${n}`,
      explain: o => (o.m === 0
        ? `Коротка стрілка показує на ${o.h}, а довга стоїть на 12 — це рівно година.`
        : `Коротка стрілка між ${o.h} і ${o.nx} — рахуємо ${o.h}, бо це число вона вже минула. Довга стрілка показує ${o.m} ${ukPl(o.m, 'хвилину', 'хвилини', 'хвилин')}.`)
        + ` Зараз ${o.dig}${o.words ? ` — ${o.words}` : ''}.` + (o.h24 ? ` Зараз ${o.per}, тож у 24-годинному форматі це ${o.dig24}.` : ''),
      yourClock: dig => `Твій годинник показує ${dig}.`,
      fixMinute: o => o.m === 0 ? 'Довга стрілка має стояти на 12 — це рівно година.' : `Довга стрілка має показувати ${o.m} ${ukPl(o.m, 'хвилину', 'хвилини', 'хвилин')}${o.num ? ` — тобто стояти на числі ${o.num}` : ''}.`,
      fixHour: o => o.m === 0 ? `Хвилини правильні, але коротка стрілка має показувати на ${o.h}.` : `Хвилини правильні, але коротка стрілка має бути між ${o.h} і ${o.nx}.`,
      tryAgain: 'Виправ і перевір ще раз.',
      starsTitle: 'Зібрані зірочки', streakTitle: 'Правильні відповіді поспіль',
      stats: (ok, all, best) => `Правильно: ${ok} з ${all} · найдовша серія: ${best}`,
      reset: 'Скинути результати', resetConfirm: 'Скинути зірочки й результати?',
      clockLabel: dig => `Годинник показує ${dig}`, clockSetLabel: 'Годинник, який треба поставити',
    },
    sheet: {
      title: 'Котра година? — робочий аркуш',
      appTitle: '🕐 Котра година? — робочий аркуш',
      appSub: 'Аркуші A4 для друку: визнач час або намалюй стрілки. З відповідями.',
      seed: 'Код аркуша', seedHint: 'Той самий код і ті самі налаштування ⇒ той самий аркуш.', randomSeed: 'Випадковий код',
      task: 'Завдання', tasks: { read: '🔎 Визнач час', draw: '✏️ Намалюй стрілки', mix: '🔀 Змішане' },
      count: 'Кількість годинників', options: 'Параметри',
      optWords: 'Час словами для малювання', optKey: 'Сторінка з відповідями',
      newWorksheet: 'Новий аркуш', print: 'Друкувати / зберегти PDF',
      sheetTitle: 'Котра година?', sheetSub: (lvl, n) => `${lvl} · ${n} ${ukPl(n, 'годинник', 'годинники', 'годинників')}`,
      instr: { read: 'Визнач час на кожному годиннику і запиши його в клітинки.', draw: 'Намалюй стрілки: коротку для годин і довгу для хвилин.', mix: 'Під годинником зі стрілками запиши час. На порожньому годиннику намалюй стрілки: коротку для годин, довгу для хвилин.' },
      instr24: ' Частина доби підказує, ранок це чи день (3:30 удень — це 15:30).',
      name: 'Ім’я: ____________________', date: 'Дата: ____________________', seedLabel: 'Код:',
      keyTitle: 'Відповіді', keySub: (lvl, n) => `${lvl} · ${n} ${ukPl(n, 'годинник', 'годинники', 'годинників')}`,
      summary: (n, p) => `${n} ${ukPl(n, 'годинник', 'годинники', 'годинників')} · ${p} ${ukPl(p, 'сторінка', 'сторінки', 'сторінок')}`,
      genError: 'Помилка: ',
    },
  };

  T.vi = {
    common: {
      brand: '🕐 Xem đồng hồ',
      allPuzzles: '🧩 Tất cả câu đố', printWorksheet: '🖨️ Phiếu bài tập', playOnline: '🎮 Chơi trực tuyến',
      level: 'Mức độ', levels: { hour: 'Giờ đúng', half: 'Giờ đúng và rưỡi', quarter: 'Mười lăm phút', five: 'Mỗi 5 phút', minute: 'Từng phút' },
      periods: { night: '🌙 ban đêm', morning: '🌅 buổi sáng', afternoon: '☀️ buổi chiều', evening: '🌆 buổi tối' },
      optMinutes: 'Số phút trên mặt đồng hồ (00, 05, 10…)', opt24: 'Đồng hồ 24 giờ (ví dụ 15:30)',
      hourHand: 'kim ngắn — giờ', minuteHand: 'kim dài — phút',
    },
    game: {
      title: 'Xem đồng hồ — trò chơi',
      modeLabel: 'Chế độ chơi', modeRead: '🔎 Mấy giờ rồi?', modeSet: '✋ Chỉnh đồng hồ',
      settings: 'Cài đặt',
      readQ: 'Đồng hồ chỉ mấy giờ?',
      setQ: 'Chỉnh đồng hồ thành:',
      setHelp: 'Kéo kim bằng ngón tay hoặc chuột. Bạn cũng có thể dùng các nút.',
      hourMinus: '−1 giờ', hourPlus: '+1 giờ', minMinus: s => `−${s} phút`, minPlus: s => `+${s} phút`,
      check: '✅ Kiểm tra', next: 'Tiếp ➜', show: '👀 Xem đáp án',
      good: ['Giỏi lắm!', 'Tuyệt vời!', 'Siêu!', 'Đúng rồi!', 'Xuất sắc!'], bad: 'Chưa đúng.', shown: 'Đây là đáp án.',
      taskN: n => `Bài ${n}`,
      explain: o => (o.m === 0
        ? `Kim ngắn chỉ số ${o.h}, kim dài chỉ số 12 — đó là giờ đúng.`
        : `Kim ngắn nằm giữa số ${o.h} và ${o.nx} — ta tính là ${o.h}, vì kim đã qua số ${o.h}. Kim dài chỉ ${o.m} phút.`)
        + ` Bây giờ là ${o.dig}${o.words ? ` — ${o.words}` : ''}.` + (o.h24 ? ` Đang là ${o.per}, nên theo cách viết 24 giờ là ${o.dig24}.` : ''),
      yourClock: dig => `Đồng hồ của bạn chỉ ${dig}.`,
      fixMinute: o => o.m === 0 ? 'Kim dài phải chỉ vào số 12 — đó là giờ đúng.' : `Kim dài phải chỉ ${o.m} phút${o.num ? ` — tức là chỉ vào số ${o.num}` : ''}.`,
      fixHour: o => o.m === 0 ? `Phút đã đúng, nhưng kim ngắn phải chỉ số ${o.h}.` : `Phút đã đúng, nhưng kim ngắn phải nằm giữa số ${o.h} và ${o.nx}.`,
      tryAgain: 'Sửa lại rồi kiểm tra lần nữa.',
      starsTitle: 'Số sao đã nhận', streakTitle: 'Số câu đúng liên tiếp',
      stats: (ok, all, best) => `Đúng: ${ok}/${all} · chuỗi dài nhất: ${best}`,
      reset: 'Xóa kết quả', resetConfirm: 'Xóa số sao và kết quả?',
      clockLabel: dig => `Đồng hồ chỉ ${dig}`, clockSetLabel: 'Đồng hồ cần chỉnh',
    },
    sheet: {
      title: 'Xem đồng hồ — phiếu bài tập',
      appTitle: '🕐 Xem đồng hồ — phiếu bài tập',
      appSub: 'Phiếu A4 để in: đọc giờ hoặc vẽ kim. Kèm đáp án.',
      seed: 'Mã phiếu', seedHint: 'Cùng mã + cùng cài đặt ⇒ cùng một phiếu.', randomSeed: 'Mã ngẫu nhiên',
      task: 'Bài tập', tasks: { read: '🔎 Đọc giờ', draw: '✏️ Vẽ kim', mix: '🔀 Kết hợp' },
      count: 'Số đồng hồ', options: 'Tùy chọn',
      optWords: 'Ghi giờ bằng chữ khi vẽ kim', optKey: 'Trang đáp án',
      newWorksheet: 'Phiếu mới', print: 'In / Lưu PDF',
      sheetTitle: 'Mấy giờ rồi?', sheetSub: (lvl, n) => `${lvl} · ${n} đồng hồ`,
      instr: { read: 'Đọc giờ trên mỗi đồng hồ và viết vào ô.', draw: 'Vẽ kim: kim ngắn chỉ giờ, kim dài chỉ phút.', mix: 'Dưới đồng hồ có kim, hãy viết giờ. Trên đồng hồ trống, hãy vẽ kim: kim ngắn chỉ giờ, kim dài chỉ phút.' },
      instr24: ' Buổi trong ngày cho biết đó là buổi sáng hay buổi chiều (3:30 chiều là 15:30).',
      name: 'Họ tên: ____________________', date: 'Ngày: ____________________', seedLabel: 'Mã:',
      keyTitle: 'Đáp án', keySub: (lvl, n) => `${lvl} · ${n} đồng hồ`,
      summary: (n, p) => `${n} đồng hồ · ${p} trang`,
      genError: 'Lỗi: ',
    },
  };

  T.fr = {
    common: {
      brand: '🕐 Lire l’heure',
      allPuzzles: '🧩 Toutes les énigmes', printWorksheet: '🖨️ Fiche d’exercices', playOnline: '🎮 Jouer en ligne',
      level: 'Niveau', levels: { hour: 'Heures pile', half: 'Heures et demies', quarter: 'Quarts d’heure', five: 'Toutes les 5 minutes', minute: 'À la minute' },
      periods: { night: '🌙 la nuit', morning: '🌅 le matin', afternoon: '☀️ l’après-midi', evening: '🌆 le soir' },
      optMinutes: 'Minutes sur le cadran (00, 05, 10…)', opt24: 'Horloge de 24 heures (ex. 15:30)',
      hourHand: 'petite aiguille — heures', minuteHand: 'grande aiguille — minutes',
    },
    game: {
      title: 'Lire l’heure — jeu',
      modeLabel: 'Mode de jeu', modeRead: '🔎 Quelle heure est-il ?', modeSet: '✋ Règle l’horloge',
      settings: 'Réglages',
      readQ: 'Quelle heure indique l’horloge ?',
      setQ: 'Règle l’horloge sur :',
      setHelp: 'Fais glisser une aiguille avec le doigt ou la souris. Tu peux aussi utiliser les boutons.',
      hourMinus: '−1 h', hourPlus: '+1 h', minMinus: s => `−${s} min`, minPlus: s => `+${s} min`,
      check: '✅ Vérifier', next: 'Suivant ➜', show: '👀 Voir la réponse',
      good: ['Bravo !', 'Génial !', 'Super !', 'C’est ça !', 'Excellent !'], bad: 'Pas tout à fait.', shown: 'Voici la réponse.',
      taskN: n => `Exercice ${n}`,
      explain: o => (o.m === 0
        ? `La petite aiguille montre le ${o.h} et la grande est sur le 12 : c’est une heure pile.`
        : `La petite aiguille est entre le ${o.h} et le ${o.nx} : on compte ${o.h}, car elle a déjà dépassé le ${o.h}. La grande aiguille montre ${o.m} ${o.m === 1 ? 'minute' : 'minutes'}.`)
        + ` Il est ${o.dig}${o.words ? ` — ${o.words}` : ''}.` + (o.h24 ? ` C’est ${o.per}, donc sur 24 heures il est ${o.dig24}.` : ''),
      yourClock: dig => `Ton horloge indique ${dig}.`,
      fixMinute: o => o.m === 0 ? 'La grande aiguille doit être sur le 12 : c’est une heure pile.' : `La grande aiguille doit montrer ${o.m} ${o.m === 1 ? 'minute' : 'minutes'}${o.num ? ` : elle doit être sur le ${o.num}` : ''}.`,
      fixHour: o => o.m === 0 ? `Les minutes sont bonnes, mais la petite aiguille doit montrer le ${o.h}.` : `Les minutes sont bonnes, mais la petite aiguille doit être entre le ${o.h} et le ${o.nx}.`,
      tryAgain: 'Corrige et vérifie encore une fois.',
      starsTitle: 'Étoiles gagnées', streakTitle: 'Bonnes réponses d’affilée',
      stats: (ok, all, best) => `Juste : ${ok} sur ${all} · meilleure série : ${best}`,
      reset: 'Remettre à zéro', resetConfirm: 'Remettre à zéro les étoiles et les scores ?',
      clockLabel: dig => `L’horloge indique ${dig}`, clockSetLabel: 'Horloge à régler',
    },
    sheet: {
      title: 'Lire l’heure — fiche d’exercices',
      appTitle: '🕐 Lire l’heure — fiche d’exercices',
      appSub: 'Fiches A4 à imprimer : lis l’heure ou dessine les aiguilles. Avec le corrigé.',
      seed: 'Code de la fiche', seedHint: 'Même code + mêmes réglages ⇒ la même fiche.', randomSeed: 'Code au hasard',
      task: 'Exercice', tasks: { read: '🔎 Lire l’heure', draw: '✏️ Dessiner les aiguilles', mix: '🔀 Mélangé' },
      count: 'Nombre d’horloges', options: 'Options',
      optWords: 'Heure en lettres pour le dessin', optKey: 'Page du corrigé',
      newWorksheet: 'Nouvelle fiche', print: 'Imprimer / PDF',
      sheetTitle: 'Quelle heure est-il ?', sheetSub: (lvl, n) => `${lvl} · ${n} ${n <= 1 ? 'horloge' : 'horloges'}`,
      instr: { read: 'Lis l’heure sur chaque horloge et écris-la dans les cases.', draw: 'Dessine les aiguilles : une petite pour les heures et une grande pour les minutes.', mix: 'Sous une horloge avec aiguilles, écris l’heure. Sur une horloge vide, dessine les aiguilles : une petite pour les heures, une grande pour les minutes.' },
      instr24: ' Le moment de la journée te dit si c’est le matin ou l’après-midi (3:30 l’après-midi, c’est 15:30).',
      name: 'Prénom : ____________________', date: 'Date : ____________________', seedLabel: 'Code :',
      keyTitle: 'Corrigé', keySub: (lvl, n) => `${lvl} · ${n} ${n <= 1 ? 'horloge' : 'horloges'}`,
      summary: (n, p) => `${n} ${n <= 1 ? 'horloge' : 'horloges'} · ${p} ${p <= 1 ? 'page' : 'pages'}`,
      genError: 'Erreur : ',
    },
  };

  return T;
})();
if (typeof module !== 'undefined') module.exports = CLOCK_TEXT;
