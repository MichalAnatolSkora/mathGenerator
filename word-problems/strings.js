/**
 * Texts of the word-problem cards in seven languages (pl, en, uk, vi, fr, it, es). Classic script; defines the
 * global `WORDS_TEXT`. The kit (../sheet-kit/kit.js) adds the shared ones (seed, options, print…).
 *
 * Besides the page texts every language has the words of the stories:
 *   names  → eight children, { n: name, g: 'm'|'f' } (the stories use names only as the subject)
 *   nouns  → things by id. pl/uk: [form after 2–4, form after 5+ and after "ile"]; en/fr/vi: plural;
 *            it/es: [plural, gender]
 *   cats   → the word for two kinds of things together ("darów jesieni")
 *   cont   → containers: in(n) "W 4 koszykach", each "w każdym koszyku", all "we wszystkich koszykach", many "koszyki"
 *   tpl    → per problem type, one function per story variant: ctx → text
 * WORDS_TEXT.say(lang, problem) builds the helpers of a language and returns the text of the card.
 * Numbers in stories are never 1, so the plural forms are enough.
 */
const WORDS_TEXT = (() => {
  /** pl/uk form after a number ≥ 2: 2–4, 22–24… or the rest. (21, 31… take a singular form in Ukrainian; the engine
   *  never puts such numbers into a story.) */
  const plPl = (n, few, many) => (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;

  const T = {
    pl: {
      title: 'Zadania z treścią — wyzwania',
      appTitle: '🧺 Zadania z treścią — wyzwania',
      appSub: 'Karty do druku, wycięcia i wklejenia do zeszytu: krótkie zadania tekstowe z dodawania i odejmowania. Z rozwiązaniami.',
      range: 'Liczby', ranges: { 10: 'Do 10', 20: 'Do 20', 100: 'Do 100' },
      type: 'Rodzaj zadań',
      types: { mix: 'Mieszane', join: 'Ile razem?', separate: 'Ile zostało?', missing: 'Ile brakuje?', compare: 'O ile więcej, o ile mniej', open: 'Kilka odpowiedzi', groups: 'Po tyle samo (mnożenie)' },
      start: 'Numery wyzwań',
      sheetTitle: 'Zadania z treścią',
      instr: 'Wytnij karty i wklej je do zeszytu. Rozwiąż zadanie: zapisz działanie i odpowiedź.',
      instrSelf: 'Potem zakreśl buźkę, która pokazuje, jak ci poszło.', instrTeacher: 'Nauczyciel wpisze ocenę w kółku.',
      challenge: 'Wyzwanie nr', date: 'Data',
      gradeBy: 'Ocena', grades: { self: 'Jak mi poszło? (buźki)', teacher: 'Ocena nauczyciela', none: 'Bez oceny' }, gradeSelf: 'Jak mi poszło?', gradeTeacher: 'Ocena nauczyciela',
      swap: '(i na odwrót)',
      names: [{ n: 'Ola', g: 'f' }, { n: 'Kuba', g: 'm' }, { n: 'Natalka', g: 'f' }, { n: 'Staś', g: 'm' }, { n: 'Zosia', g: 'f' }, { n: 'Antek', g: 'm' }, { n: 'Hania', g: 'f' }, { n: 'Franek', g: 'm' }],
      nouns: {
        chestnut: ['kasztany', 'kasztanów'], acorn: ['żołędzie', 'żołędzi'], apple: ['jabłka', 'jabłek'], pear: ['gruszki', 'gruszek'],
        shell: ['muszelki', 'muszelek'], pebble: ['kamyki', 'kamyków'], page: ['strony', 'stron'], person: ['osoby', 'osób'],
        candy: ['cukierki', 'cukierków'], sticker: ['naklejki', 'naklejek'], balloon: ['baloniki', 'baloników'],
        muffin: ['babeczki', 'babeczek'], cookie: ['ciastka', 'ciastek'], sparrow: ['wróble', 'wróbli'],
        ticketA: ['bilety normalne', 'biletów normalnych'], ticket: ['bilety', 'biletów'],
        marble: ['kulki', 'kulek'], crayon: ['kredki', 'kredek'], book: ['książki', 'książek'], car: ['samochodziki', 'samochodzików'],
        fish: ['rybki', 'rybek'], flower: ['kwiaty', 'kwiatów'],
      },
      cats: { autumn: 'darów jesieni', fruit: 'owoców', beach: 'skarbów z plaży' },
      cont: {
        basket: { in: n => `W ${n} koszykach`, each: 'w każdym koszyku', all: 'we wszystkich koszykach' },
        plate: { in: n => `Na ${n} talerzach`, each: 'na każdym talerzu', all: 'na wszystkich talerzach' },
        aquarium: { in: n => `W ${n} akwariach`, each: 'w każdym akwarium', all: 'we wszystkich akwariach' },
        shelf: { in: n => `Na ${n} półkach`, each: 'na każdej półce', all: 'na wszystkich półkach' },
        vase: { in: n => `W ${n} wazonach`, each: 'w każdym wazonie', all: 'we wszystkich wazonach' },
        box: { in: n => `W ${n} pudełkach`, each: 'w każdym pudełku', all: 'we wszystkich pudełkach' },
      },
      tpl: {
        join: [
          ({ A, a, b, N, cat, g }) => `${A.n} ${g(A, 'zebrał', 'zebrała')} ${N(a, 'X')} i ${N(b, 'Y')}. Ile ${cat} ${g(A, 'zebrał', 'zebrała')} razem?`,
          ({ A, a, b, N, g }) => `W poniedziałek ${A.n} ${g(A, 'przeczytał', 'przeczytała')} ${N(a, 'page')}, a we wtorek ${N(b, 'page')}. Ile stron ${g(A, 'przeczytał', 'przeczytała')} w oba dni?`,
          ({ a, b, N, V }) => `W autobusie ${V(a, 'jechały', 'jechało')} ${N(a, 'person')}. Na przystanku ${V(b, 'wsiadły', 'wsiadło')} jeszcze ${N(b, 'person')}. Ile osób jedzie teraz autobusem?`,
        ],
        separate: [
          ({ A, a, b, N, n, g }) => `${A.n} ${g(A, 'miał', 'miała')} ${N(a, 'X')}. Kolegom z klasy ${g(A, 'dał', 'dała')} ${N(b, 'X')}. Ile ${n('X')} ma teraz ${A.n}?`,
          ({ a, b, N, V }) => `Na drzewie ${V(a, 'siedziały', 'siedziało')} ${N(a, 'sparrow')}. Po chwili ${V(b, 'odleciały', 'odleciało')} ${b}. Ile wróbli zostało na drzewie?`,
          ({ a, b, N, n }) => `Babcia upiekła ${N(a, 'X')}. Dzieci zjadły ${N(b, 'X')}. Ile ${n('X')} zostało?`,
        ],
        missing: [
          ({ a, c, N }) => `W kasie teatru lalek sprzedano ${N(a, 'ticketA')} i kilka ulgowych. Razem sprzedano ${N(c, 'ticket')}. Ile sprzedano biletów ulgowych?`,
          ({ A, a, c, N, n, g }) => `${A.n} ${g(A, 'miał', 'miała')} ${N(a, 'X')}. ${g(A, 'Dostał', 'Dostała')} jeszcze kilka i teraz ma ${N(c, 'X')}. Ile ${n('X')} ${g(A, 'dostał', 'dostała')}?`,
          ({ a, c, N, V }) => `W pudełku ${V(c, 'były', 'było')} ${N(c, 'crayon')}. Kilka wypadło i ${V(a, 'zostały', 'zostało')} ${a}. Ile kredek wypadło?`,
        ],
        compare: [
          ({ A, B, a, b, N, n }) => `${A.n} ma ${N(a, 'X')}, a ${B.n} ma ${N(b, 'X')}. O ile więcej ${n('X')} ma ${B.n}?`,
          ({ A, B, a, d, N, n }) => `${A.n} ma ${N(a, 'X')}. ${B.n} ma o ${N(d, 'X')} więcej. Ile ${n('X')} ma ${B.n}?`,
          ({ A, B, a, d, N, n }) => `${A.n} ma ${N(a, 'X')}. ${B.n} ma o ${N(d, 'X')} mniej. Ile ${n('X')} ma ${B.n}?`,
        ],
        open: [
          ({ c, f, n, C, V }) => `${C.in(2)} są ${f('X')}. Ile ${n('X')} może być ${C.each}, jeśli razem ${V(c, 'są', 'jest')} ich ${c}? Podaj kilka propozycji.`,
        ],
        groups: [
          ({ a, b, N, n, C }) => `${C.in(a)} jest po ${N(b, 'X')}. Ile ${n('X')} jest ${C.all}?`,
        ],
      },
    },
    en: {
      title: 'Word problems — challenges',
      appTitle: '🧺 Word problems — challenges',
      appSub: 'Cards to print, cut out and glue into an exercise book: short addition and subtraction word problems. With answer keys.',
      range: 'Numbers', ranges: { 10: 'Up to 10', 20: 'Up to 20', 100: 'Up to 100' },
      type: 'Kind of problems',
      types: { mix: 'Mixed', join: 'How many altogether?', separate: 'How many are left?', missing: 'How many are missing?', compare: 'How many more or fewer', open: 'Many answers', groups: 'Equal groups (times)' },
      start: 'Challenge numbers',
      sheetTitle: 'Word problems',
      instr: 'Cut out the cards and glue them into your exercise book. Solve the problem: write the calculation and the answer.',
      instrSelf: 'Then circle the face that shows how it went.', instrTeacher: 'Your teacher writes a grade in the circle.',
      challenge: 'Challenge no.', date: 'Date',
      gradeBy: 'Grading', grades: { self: 'How did I do? (faces)', teacher: 'Teacher’s grade', none: 'No grading' }, gradeSelf: 'How did I do?', gradeTeacher: 'Teacher’s grade',
      swap: '(and the other way round)',
      names: [{ n: 'Amy', g: 'f' }, { n: 'Tom', g: 'm' }, { n: 'Lily', g: 'f' }, { n: 'Jack', g: 'm' }, { n: 'Emma', g: 'f' }, { n: 'Sam', g: 'm' }, { n: 'Mia', g: 'f' }, { n: 'Ben', g: 'm' }],
      nouns: {
        chestnut: 'conkers', acorn: 'acorns', apple: 'apples', pear: 'pears', shell: 'shells', pebble: 'pebbles', page: 'pages', person: 'people',
        candy: 'sweets', sticker: 'stickers', balloon: 'balloons', muffin: 'muffins', cookie: 'cookies', sparrow: 'sparrows',
        ticketA: 'full-price tickets', ticket: 'tickets', marble: 'marbles', crayon: 'crayons', book: 'books', car: 'toy cars', fish: 'fish', flower: 'flowers',
      },
      cats: { autumn: 'autumn treasures', fruit: 'pieces of fruit', beach: 'beach treasures' },
      cont: {
        basket: { in: n => `in ${n} baskets`, each: 'in each basket', many: 'baskets' },
        plate: { in: n => `on ${n} plates`, each: 'on each plate', many: 'plates' },
        aquarium: { in: n => `in ${n} fish tanks`, each: 'in each tank', many: 'fish tanks' },
        shelf: { in: n => `on ${n} shelves`, each: 'on each shelf', many: 'shelves' },
        vase: { in: n => `in ${n} vases`, each: 'in each vase', many: 'vases' },
        box: { in: n => `in ${n} boxes`, each: 'in each box', many: 'boxes' },
      },
      tpl: {
        join: [
          ({ A, a, b, n, cat }) => `${A.n} collected ${a} ${n('X')} and ${b} ${n('Y')}. How many ${cat} did ${A.n} collect altogether?`,
          ({ A, a, b }) => `On Monday ${A.n} read ${a} pages, and on Tuesday ${b} pages. How many pages did ${A.n} read on both days?`,
          ({ a, b }) => `There were ${a} people on the bus. At the stop ${b} more people got on. How many people are on the bus now?`,
        ],
        separate: [
          ({ A, a, b, n }) => `${A.n} had ${a} ${n('X')} and gave ${b} of them to classmates. How many ${n('X')} does ${A.n} have now?`,
          ({ a, b }) => `There were ${a} sparrows sitting in a tree. Then ${b} flew away. How many sparrows are left in the tree?`,
          ({ a, b, n }) => `Grandma baked ${a} ${n('X')}. The children ate ${b}. How many ${n('X')} are left?`,
        ],
        missing: [
          ({ a, c }) => `The puppet theatre sold ${a} full-price tickets and some child tickets. ${c} tickets were sold in total. How many child tickets were sold?`,
          ({ A, a, c, n }) => `${A.n} had ${a} ${n('X')}, got some more, and now has ${c}. How many ${n('X')} did ${A.n} get?`,
          ({ a, c }) => `There were ${c} crayons in a box. Some fell out and ${a} were left. How many crayons fell out?`,
        ],
        compare: [
          ({ A, B, a, b, n }) => `${A.n} has ${a} ${n('X')} and ${B.n} has ${b} ${n('X')}. How many more ${n('X')} does ${B.n} have?`,
          ({ A, B, a, d, n }) => `${A.n} has ${a} ${n('X')}. ${B.n} has ${d} more ${n('X')} than ${A.n}. How many ${n('X')} does ${B.n} have?`,
          ({ A, B, a, d, n }) => `${A.n} has ${a} ${n('X')}. ${B.n} has ${d} fewer ${n('X')} than ${A.n}. How many ${n('X')} does ${B.n} have?`,
        ],
        open: [
          ({ c, n, C }) => `There are ${c} ${n('X')} ${C.in(2)} altogether. How many ${n('X')} could there be ${C.each}? Give a few ideas.`,
        ],
        groups: [
          ({ a, b, n, C }) => `There are ${a} ${C.many} with ${b} ${n('X')} ${C.each}. How many ${n('X')} are there altogether?`,
        ],
      },
    },
    uk: {
      title: 'Задачі — виклики',
      appTitle: '🧺 Задачі — виклики',
      appSub: 'Картки, щоб роздрукувати, вирізати й вклеїти в зошит: короткі текстові задачі на додавання і віднімання. З відповідями.',
      range: 'Числа', ranges: { 10: 'До 10', 20: 'До 20', 100: 'До 100' },
      type: 'Вид задач',
      types: { mix: 'Змішані', join: 'Скільки разом?', separate: 'Скільки залишилося?', missing: 'Скільки бракує?', compare: 'На скільки більше чи менше', open: 'Кілька відповідей', groups: 'Порівну (множення)' },
      start: 'Номери викликів',
      sheetTitle: 'Задачі',
      instr: 'Виріж картки й вклей їх у зошит. Розв’яжи задачу: запиши дію і відповідь.',
      instrSelf: 'Потім обведи смайлик, який показує, як у тебе вийшло.', instrTeacher: 'Учитель поставить оцінку в кружечку.',
      challenge: 'Виклик №', date: 'Дата',
      gradeBy: 'Оцінка', grades: { self: 'Як у мене вийшло? (смайлики)', teacher: 'Оцінка вчителя', none: 'Без оцінки' }, gradeSelf: 'Як у мене вийшло?', gradeTeacher: 'Оцінка вчителя',
      swap: '(і навпаки)',
      names: [{ n: 'Оля', g: 'f' }, { n: 'Тарас', g: 'm' }, { n: 'Соня', g: 'f' }, { n: 'Андрій', g: 'm' }, { n: 'Марійка', g: 'f' }, { n: 'Остап', g: 'm' }, { n: 'Даринка', g: 'f' }, { n: 'Богдан', g: 'm' }],
      nouns: {
        chestnut: ['каштани', 'каштанів'], acorn: ['жолуді', 'жолудів'], apple: ['яблука', 'яблук'], pear: ['груші', 'груш'],
        shell: ['мушлі', 'мушель'], pebble: ['камінці', 'камінців'], page: ['сторінки', 'сторінок'], person: ['людини', 'людей'],
        candy: ['цукерки', 'цукерок'], sticker: ['наліпки', 'наліпок'], balloon: ['повітряні кульки', 'повітряних кульок'],
        muffin: ['кекси', 'кексів'], cookie: ['пряники', 'пряників'], sparrow: ['горобці', 'горобців'],
        ticketA: ['дорослі квитки', 'дорослих квитків'], ticket: ['квитки', 'квитків'],
        marble: ['кульки', 'кульок'], crayon: ['олівці', 'олівців'], book: ['книжки', 'книжок'], car: ['машинки', 'машинок'],
        fish: ['рибки', 'рибок'], flower: ['квіти', 'квітів'],
      },
      cats: { autumn: 'осінніх дарів', fruit: 'фруктів', beach: 'скарбів з пляжу' },
      cont: {
        basket: { in: n => `У ${n} кошиках`, each: 'в кожному кошику', all: 'в усіх кошиках' },
        plate: { in: n => `На ${n} тарілках`, each: 'на кожній тарілці', all: 'на всіх тарілках' },
        aquarium: { in: n => `У ${n} акваріумах`, each: 'в кожному акваріумі', all: 'в усіх акваріумах' },
        shelf: { in: n => `На ${n} полицях`, each: 'на кожній полиці', all: 'на всіх полицях' },
        vase: { in: n => `У ${n} вазах`, each: 'в кожній вазі', all: 'в усіх вазах' },
        box: { in: n => `У ${n} коробках`, each: 'в кожній коробці', all: 'в усіх коробках' },
      },
      tpl: {
        join: [
          ({ A, a, b, N, cat, g }) => `${A.n} ${g(A, 'зібрав', 'зібрала')} ${N(a, 'X')} і ${N(b, 'Y')}. Скільки ${cat} ${g(A, 'він зібрав', 'вона зібрала')} разом?`,
          ({ A, a, b, N, g }) => `У понеділок ${A.n} ${g(A, 'прочитав', 'прочитала')} ${N(a, 'page')}, а у вівторок — ${N(b, 'page')}. Скільки сторінок ${g(A, 'він прочитав', 'вона прочитала')} за два дні?`,
          ({ a, b, N, V }) => `В автобусі ${V(a, 'їхали', 'їхало')} ${N(a, 'person')}. На зупинці ${V(b, 'зайшли', 'зайшло')} ще ${N(b, 'person')}. Скільки людей тепер їде в автобусі?`,
        ],
        separate: [
          ({ A, a, b, N, n, g }) => `${A.n} ${g(A, 'мав', 'мала')} ${N(a, 'X')}. ${g(A, 'Він роздав', 'Вона роздала')} друзям ${N(b, 'X')}. Скільки ${n('X')} ${g(A, 'у нього', 'у неї')} залишилося?`,
          ({ a, b, N, V }) => `На дереві ${V(a, 'сиділи', 'сиділо')} ${N(a, 'sparrow')}. Потім ${V(b, 'відлетіли', 'відлетіло')} ${b}. Скільки горобців залишилося на дереві?`,
          ({ a, b, N, n }) => `Бабуся спекла ${N(a, 'X')}. Діти з’їли ${N(b, 'X')}. Скільки ${n('X')} залишилося?`,
        ],
        missing: [
          ({ a, c, N }) => `У касі лялькового театру продали ${N(a, 'ticketA')} і кілька дитячих. Усього продали ${N(c, 'ticket')}. Скільки дитячих квитків продали?`,
          ({ A, a, c, N, n, g }) => `${A.n} ${g(A, 'мав', 'мала')} ${N(a, 'X')}. ${g(A, 'Йому', 'Їй')} подарували ще кілька, і тепер ${g(A, 'у нього', 'у неї')} ${N(c, 'X')}. Скільки ${n('X')} ${g(A, 'йому', 'їй')} подарували?`,
          ({ a, c, N, V }) => `У коробці ${V(c, 'були', 'було')} ${N(c, 'crayon')}. Кілька випало, і ${V(a, 'залишилися', 'залишилося')} ${a}. Скільки олівців випало?`,
        ],
        compare: [
          ({ A, B, a, b, N, n }) => `${A.n} має ${N(a, 'X')}, а ${B.n} — ${N(b, 'X')}. На скільки більше ${n('X')} має ${B.n}?`,
          ({ A, B, a, d, N, n }) => `${A.n} має ${N(a, 'X')}. ${B.n} має на ${N(d, 'X')} більше. Скільки ${n('X')} має ${B.n}?`,
          ({ A, B, a, d, N, n }) => `${A.n} має ${N(a, 'X')}. ${B.n} має на ${N(d, 'X')} менше. Скільки ${n('X')} має ${B.n}?`,
        ],
        open: [
          ({ c, f, n, C }) => `${C.in(2)} є ${f('X')}. Скільки ${n('X')} може бути ${C.each}, якщо разом їх ${c}? Запропонуй кілька варіантів.`,
        ],
        groups: [
          ({ a, b, N, n, C }) => `${C.in(a)} є по ${N(b, 'X')}. Скільки ${n('X')} ${C.all}?`,
        ],
      },
    },
    vi: {
      title: 'Toán có lời văn — thử thách',
      appTitle: '🧺 Toán có lời văn — thử thách',
      appSub: 'Thẻ để in, cắt và dán vào vở: các bài toán có lời văn ngắn về phép cộng và phép trừ. Có đáp án.',
      range: 'Phạm vi số', ranges: { 10: 'Đến 10', 20: 'Đến 20', 100: 'Đến 100' },
      type: 'Loại bài',
      types: { mix: 'Trộn', join: 'Tất cả bao nhiêu?', separate: 'Còn lại bao nhiêu?', missing: 'Thiếu bao nhiêu?', compare: 'Nhiều hơn, ít hơn', open: 'Nhiều đáp án', groups: 'Mỗi nhóm bằng nhau (nhân)' },
      start: 'Số thử thách',
      sheetTitle: 'Toán có lời văn',
      instr: 'Cắt các thẻ và dán vào vở. Giải bài toán: viết phép tính và câu trả lời.',
      instrSelf: 'Sau đó khoanh vào khuôn mặt cho biết em làm bài thế nào.', instrTeacher: 'Thầy cô sẽ ghi điểm vào vòng tròn.',
      challenge: 'Thử thách số', date: 'Ngày',
      gradeBy: 'Đánh giá', grades: { self: 'Em làm thế nào? (mặt cười)', teacher: 'Điểm của thầy cô', none: 'Không đánh giá' }, gradeSelf: 'Em làm thế nào?', gradeTeacher: 'Điểm của thầy cô',
      swap: '(và ngược lại)',
      names: [{ n: 'Lan', g: 'f' }, { n: 'Minh', g: 'm' }, { n: 'Mai', g: 'f' }, { n: 'Huy', g: 'm' }, { n: 'Linh', g: 'f' }, { n: 'Nam', g: 'm' }, { n: 'Hoa', g: 'f' }, { n: 'Bảo', g: 'm' }],
      nouns: {
        chestnut: 'hạt dẻ', acorn: 'quả sồi', apple: 'quả táo', pear: 'quả lê', shell: 'vỏ sò', pebble: 'viên sỏi', page: 'trang sách', person: 'người',
        candy: 'cái kẹo', sticker: 'hình dán', balloon: 'quả bóng bay', muffin: 'cái bánh nướng', cookie: 'cái bánh quy', sparrow: 'con chim sẻ',
        ticketA: 'vé người lớn', ticket: 'vé', marble: 'viên bi', crayon: 'cây bút màu', book: 'quyển sách', car: 'chiếc ô tô đồ chơi', fish: 'con cá', flower: 'bông hoa',
      },
      cats: { autumn: 'món quà mùa thu', fruit: 'quả', beach: 'món quà từ bãi biển' },
      cont: {
        basket: { many: 'cái giỏ', one: 'giỏ' }, plate: { many: 'cái đĩa', one: 'đĩa' }, aquarium: { many: 'bể cá', one: 'bể' },
        shelf: { many: 'cái kệ', one: 'kệ' }, vase: { many: 'bình hoa', one: 'bình' }, box: { many: 'cái hộp', one: 'hộp' },
      },
      tpl: {
        join: [
          ({ A, a, b, n, cat }) => `${A.n} nhặt được ${a} ${n('X')} và ${b} ${n('Y')}. Hỏi ${A.n} nhặt được tất cả bao nhiêu ${cat}?`,
          ({ A, a, b }) => `Thứ Hai ${A.n} đọc được ${a} trang sách, thứ Ba đọc được ${b} trang. Hỏi cả hai ngày ${A.n} đọc được bao nhiêu trang sách?`,
          ({ a, b }) => `Trên xe buýt có ${a} người. Đến bến, có thêm ${b} người lên xe. Hỏi bây giờ trên xe buýt có bao nhiêu người?`,
        ],
        separate: [
          ({ A, a, b, n }) => `${A.n} có ${a} ${n('X')}. ${A.n} cho các bạn ${b} ${n('X')}. Hỏi ${A.n} còn lại bao nhiêu ${n('X')}?`,
          ({ a, b }) => `Trên cây có ${a} con chim sẻ. Sau đó ${b} con bay đi. Hỏi trên cây còn lại bao nhiêu con chim sẻ?`,
          ({ a, b, n }) => `Bà nướng ${a} ${n('X')}. Các cháu ăn hết ${b} ${n('X')}. Hỏi còn lại bao nhiêu ${n('X')}?`,
        ],
        missing: [
          ({ a, c }) => `Quầy vé nhà hát múa rối bán được ${a} vé người lớn và một số vé trẻ em. Tất cả bán được ${c} vé. Hỏi bán được bao nhiêu vé trẻ em?`,
          ({ A, a, c, n }) => `${A.n} có ${a} ${n('X')}. ${A.n} được cho thêm một ít nữa và bây giờ có ${c} ${n('X')}. Hỏi ${A.n} được cho thêm bao nhiêu ${n('X')}?`,
          ({ a, c }) => `Trong hộp có ${c} cây bút màu. Một số cây bị rơi ra ngoài, trong hộp còn lại ${a} cây. Hỏi có bao nhiêu cây bút màu bị rơi ra?`,
        ],
        compare: [
          ({ A, B, a, b, n }) => `${A.n} có ${a} ${n('X')}, ${B.n} có ${b} ${n('X')}. Hỏi ${B.n} có nhiều hơn ${A.n} bao nhiêu ${n('X')}?`,
          ({ A, B, a, d, n }) => `${A.n} có ${a} ${n('X')}. ${B.n} có nhiều hơn ${A.n} ${d} ${n('X')}. Hỏi ${B.n} có bao nhiêu ${n('X')}?`,
          ({ A, B, a, d, n }) => `${A.n} có ${a} ${n('X')}. ${B.n} có ít hơn ${A.n} ${d} ${n('X')}. Hỏi ${B.n} có bao nhiêu ${n('X')}?`,
        ],
        open: [
          ({ c, n, C }) => `Có ${c} ${n('X')} xếp vào 2 ${C.many}. Hỏi mỗi ${C.one} có thể có bao nhiêu ${n('X')}? Hãy nêu vài cách khác nhau.`,
        ],
        groups: [
          ({ a, b, n, C }) => `Có ${a} ${C.many}, mỗi ${C.one} có ${b} ${n('X')}. Hỏi có tất cả bao nhiêu ${n('X')}?`,
        ],
      },
    },
    fr: {
      title: 'Problèmes — défis',
      appTitle: '🧺 Problèmes — défis',
      appSub: 'Cartes à imprimer, découper et coller dans le cahier : de petits problèmes d’addition et de soustraction. Avec corrigés.',
      range: 'Nombres', ranges: { 10: 'Jusqu’à 10', 20: 'Jusqu’à 20', 100: 'Jusqu’à 100' },
      type: 'Type de problèmes',
      types: { mix: 'Mélangés', join: 'Combien en tout ?', separate: 'Combien en reste-t-il ?', missing: 'Combien en manque-t-il ?', compare: 'Combien de plus, de moins', open: 'Plusieurs réponses', groups: 'Parts égales (multiplication)' },
      start: 'Numéros des défis',
      sheetTitle: 'Problèmes',
      instr: 'Découpe les cartes et colle-les dans ton cahier. Résous le problème : écris le calcul et la réponse.',
      instrSelf: 'Puis entoure le visage qui montre comment ça s’est passé.', instrTeacher: 'L’enseignant écrit la note dans le rond.',
      challenge: 'Défi n°', date: 'Date',
      gradeBy: 'Évaluation', grades: { self: 'Comment ça s’est passé ? (visages)', teacher: 'Note de l’enseignant', none: 'Sans évaluation' }, gradeSelf: 'Comment ça s’est passé ?', gradeTeacher: 'Note de l’enseignant',
      swap: '(et inversement)',
      names: [{ n: 'Léa', g: 'f' }, { n: 'Hugo', g: 'm' }, { n: 'Chloé', g: 'f' }, { n: 'Louis', g: 'm' }, { n: 'Emma', g: 'f' }, { n: 'Lucas', g: 'm' }, { n: 'Inès', g: 'f' }, { n: 'Jules', g: 'm' }],
      nouns: {
        chestnut: 'marrons', acorn: 'glands', apple: 'pommes', pear: 'poires', shell: 'coquillages', pebble: 'galets', page: 'pages', person: 'personnes',
        candy: 'bonbons', sticker: 'autocollants', balloon: 'ballons', muffin: 'muffins', cookie: 'biscuits', sparrow: 'moineaux',
        ticketA: 'billets plein tarif', ticket: 'billets', marble: 'billes', crayon: 'crayons', book: 'livres', car: 'petites voitures', fish: 'poissons', flower: 'fleurs',
      },
      cats: { autumn: 'trésors d’automne', fruit: 'fruits', beach: 'trésors de la plage' },
      cont: {
        basket: { in: n => `dans ${n} paniers`, each: 'dans chaque panier', many: 'paniers' },
        plate: { in: n => `sur ${n} assiettes`, each: 'sur chaque assiette', many: 'assiettes' },
        aquarium: { in: n => `dans ${n} aquariums`, each: 'dans chaque aquarium', many: 'aquariums' },
        shelf: { in: n => `sur ${n} étagères`, each: 'sur chaque étagère', many: 'étagères' },
        vase: { in: n => `dans ${n} vases`, each: 'dans chaque vase', many: 'vases' },
        box: { in: n => `dans ${n} boîtes`, each: 'dans chaque boîte', many: 'boîtes' },
      },
      tpl: {
        join: [
          ({ A, a, b, n, cat }) => `${A.n} ramasse ${a} ${n('X')} et ${b} ${n('Y')}. Combien de ${cat} cela fait-il en tout ?`,
          ({ A, a, b, g }) => `Lundi, ${A.n} a lu ${a} pages et mardi ${b} pages. Combien de pages ${g(A, 'a-t-il', 'a-t-elle')} lues en tout ?`,
          ({ a, b }) => `Il y a ${a} personnes dans le bus. À l’arrêt, ${b} personnes montent encore. Combien de personnes y a-t-il maintenant dans le bus ?`,
        ],
        separate: [
          ({ A, a, b, n, de, g }) => `${A.n} a ${a} ${n('X')}. ${g(A, 'Il', 'Elle')} en donne ${b} à ses camarades. Combien ${de('X')} lui reste-t-il ?`,
          ({ a, b }) => `Sur un arbre, il y a ${a} moineaux. ${b} s’envolent. Combien de moineaux reste-t-il sur l’arbre ?`,
          ({ a, b, n, de }) => `Mamie a préparé ${a} ${n('X')}. Les enfants en ont mangé ${b}. Combien ${de('X')} reste-t-il ?`,
        ],
        missing: [
          ({ a, c }) => `Au théâtre de marionnettes, on a vendu ${a} billets plein tarif et quelques billets à tarif réduit. En tout, on a vendu ${c} billets. Combien de billets à tarif réduit a-t-on vendus ?`,
          ({ A, a, c, n, de, g }) => `${A.n} a ${a} ${n('X')}. On lui en donne encore et maintenant ${g(A, 'il', 'elle')} en a ${c}. Combien ${de('X')} ${g(A, 'a-t-il', 'a-t-elle')} en plus ?`,
          ({ a, c }) => `Il y avait ${c} crayons dans une boîte. Quelques-uns sont tombés et il en reste ${a}. Combien de crayons sont tombés ?`,
        ],
        compare: [
          ({ A, B, a, b, n, de, g }) => `${A.n} a ${a} ${n('X')} et ${B.n} en a ${b}. Combien ${de('X')} ${B.n} ${g(B, 'a-t-il', 'a-t-elle')} de plus que ${A.n} ?`,
          ({ A, B, a, d, n, de, g }) => `${A.n} a ${a} ${n('X')}. ${B.n} en a ${d} de plus. Combien ${de('X')} ${B.n} ${g(B, 'a-t-il', 'a-t-elle')} ?`,
          ({ A, B, a, d, n, de, g }) => `${A.n} a ${a} ${n('X')}. ${B.n} en a ${d} de moins. Combien ${de('X')} ${B.n} ${g(B, 'a-t-il', 'a-t-elle')} ?`,
        ],
        open: [
          ({ c, n, de, C }) => `Il y a ${c} ${n('X')} ${C.in(2)} en tout. Combien ${de('X')} peut-il y avoir ${C.each} ? Donne plusieurs propositions.`,
        ],
        groups: [
          ({ a, b, n, de, C }) => `Il y a ${a} ${C.many} avec ${b} ${n('X')} ${C.each}. Combien ${de('X')} y a-t-il en tout ?`,
        ],
      },
    },
    it: {
      title: 'Problemi — sfide',
      appTitle: '🧺 Problemi — sfide',
      appSub: 'Schede da stampare, ritagliare e incollare sul quaderno: brevi problemi di addizione e sottrazione. Con le soluzioni.',
      range: 'Numeri', ranges: { 10: 'Fino a 10', 20: 'Fino a 20', 100: 'Fino a 100' },
      type: 'Tipo di problemi',
      types: { mix: 'Misti', join: 'Quanti in tutto?', separate: 'Quanti ne restano?', missing: 'Quanti ne mancano?', compare: 'Quanti in più, in meno', open: 'Più risposte', groups: 'Gruppi uguali (moltiplicazione)' },
      start: 'Numeri delle sfide',
      sheetTitle: 'Problemi',
      instr: 'Ritaglia le schede e incollale sul quaderno. Risolvi il problema: scrivi l’operazione e la risposta.',
      instrSelf: 'Poi cerchia la faccina che mostra come è andata.', instrTeacher: 'L’insegnante scrive il voto nel cerchio.',
      challenge: 'Sfida n.', date: 'Data',
      gradeBy: 'Valutazione', grades: { self: 'Come è andata? (faccine)', teacher: 'Voto dell’insegnante', none: 'Senza valutazione' }, gradeSelf: 'Come è andata?', gradeTeacher: 'Voto dell’insegnante',
      swap: '(e viceversa)',
      names: [{ n: 'Giulia', g: 'f' }, { n: 'Marco', g: 'm' }, { n: 'Sofia', g: 'f' }, { n: 'Luca', g: 'm' }, { n: 'Anna', g: 'f' }, { n: 'Matteo', g: 'm' }, { n: 'Chiara', g: 'f' }, { n: 'Leo', g: 'm' }],
      nouns: {
        chestnut: ['castagne', 'f'], acorn: ['ghiande', 'f'], apple: ['mele', 'f'], pear: ['pere', 'f'], shell: ['conchiglie', 'f'], pebble: ['sassolini', 'm'],
        page: ['pagine', 'f'], person: ['persone', 'f'], candy: ['caramelle', 'f'], sticker: ['adesivi', 'm'], balloon: ['palloncini', 'm'],
        muffin: ['muffin', 'm'], cookie: ['biscotti', 'm'], sparrow: ['passerotti', 'm'], ticketA: ['biglietti interi', 'm'], ticket: ['biglietti', 'm'],
        marble: ['biglie', 'f'], crayon: ['pastelli', 'm'], book: ['libri', 'm'], car: ['macchinine', 'f'], fish: ['pesci', 'm'], flower: ['fiori', 'm'],
      },
      cats: { autumn: 'tesori d’autunno', fruit: 'frutti', beach: 'tesori della spiaggia' },
      cont: {
        basket: { in: n => `in ${n} cestini`, each: 'in ogni cestino', many: 'cestini' },
        plate: { in: n => `su ${n} piatti`, each: 'su ogni piatto', many: 'piatti' },
        aquarium: { in: n => `in ${n} acquari`, each: 'in ogni acquario', many: 'acquari' },
        shelf: { in: n => `su ${n} mensole`, each: 'su ogni mensola', many: 'mensole' },
        vase: { in: n => `in ${n} vasi`, each: 'in ogni vaso', many: 'vasi' },
        box: { in: n => `in ${n} scatole`, each: 'in ogni scatola', many: 'scatole' },
      },
      tpl: {
        join: [
          ({ A, a, b, n, cat }) => `${A.n} ha raccolto ${a} ${n('X')} e ${b} ${n('Y')}. Quanti ${cat} ha raccolto in tutto?`,
          ({ A, a, b }) => `Lunedì ${A.n} ha letto ${a} pagine e martedì ${b} pagine. Quante pagine ha letto in tutto?`,
          ({ a, b }) => `Sull’autobus ci sono ${a} persone. Alla fermata salgono altre ${b} persone. Quante persone ci sono adesso sull’autobus?`,
        ],
        separate: [
          ({ A, a, b, n, q }) => `${A.n} ha ${a} ${n('X')}. Ne regala ${b} ai compagni. ${q('X')} ${n('X')} ha adesso ${A.n}?`,
          ({ a, b }) => `Su un albero ci sono ${a} passerotti. Poi ${b} volano via. Quanti passerotti restano sull’albero?`,
          ({ a, b, n, q, e }) => `La nonna ha preparato ${a} ${n('X')}. I bambini ne hanno mangiat${e('X')} ${b}. ${q('X')} ${n('X')} sono rimast${e('X')}?`,
        ],
        missing: [
          ({ a, c }) => `Alla cassa del teatro dei burattini hanno venduto ${a} biglietti interi e alcuni ridotti. In tutto hanno venduto ${c} biglietti. Quanti biglietti ridotti hanno venduto?`,
          ({ A, a, c, n, q, e }) => `${A.n} ha ${a} ${n('X')}. Ne riceve ancora alcun${e('X')} e adesso ne ha ${c}. ${q('X')} ${n('X')} ha ricevuto?`,
          ({ a, c }) => `In una scatola c’erano ${c} pastelli. Alcuni sono caduti e ne sono rimasti ${a}. Quanti pastelli sono caduti?`,
        ],
        compare: [
          ({ A, B, a, b, n, q }) => `${A.n} ha ${a} ${n('X')} e ${B.n} ne ha ${b}. ${q('X')} ${n('X')} ha in più ${B.n}?`,
          ({ A, B, a, d, n, q }) => `${A.n} ha ${a} ${n('X')}. ${B.n} ne ha ${d} in più. ${q('X')} ${n('X')} ha ${B.n}?`,
          ({ A, B, a, d, n, q }) => `${A.n} ha ${a} ${n('X')}. ${B.n} ne ha ${d} in meno. ${q('X')} ${n('X')} ha ${B.n}?`,
        ],
        open: [
          ({ c, n, q, C, cap }) => `${cap(C.in(2))} ci sono ${c} ${n('X')} in tutto. ${q('X')} ${n('X')} possono esserci ${C.each}? Scrivi alcune possibilità.`,
        ],
        groups: [
          ({ a, b, n, q, C }) => `Ci sono ${a} ${C.many} e ${C.each} ci sono ${b} ${n('X')}. ${q('X')} ${n('X')} ci sono in tutto?`,
        ],
      },
    },
    es: {
      title: 'Problemas — retos',
      appTitle: '🧺 Problemas — retos',
      appSub: 'Tarjetas para imprimir, recortar y pegar en el cuaderno: problemas cortos de suma y resta. Con soluciones.',
      range: 'Números', ranges: { 10: 'Hasta 10', 20: 'Hasta 20', 100: 'Hasta 100' },
      type: 'Tipo de problemas',
      types: { mix: 'Mezclados', join: '¿Cuántos en total?', separate: '¿Cuántos quedan?', missing: '¿Cuántos faltan?', compare: 'Cuántos más, cuántos menos', open: 'Varias respuestas', groups: 'Grupos iguales (multiplicación)' },
      start: 'Números de los retos',
      sheetTitle: 'Problemas',
      instr: 'Recorta las tarjetas y pégalas en tu cuaderno. Resuelve el problema: escribe la operación y la respuesta.',
      instrSelf: 'Luego rodea la carita que muestra cómo te ha ido.', instrTeacher: 'El profesor escribe la nota en el círculo.',
      challenge: 'Reto n.º', date: 'Fecha',
      gradeBy: 'Evaluación', grades: { self: '¿Qué tal me ha ido? (caritas)', teacher: 'Nota del profesor', none: 'Sin evaluación' }, gradeSelf: '¿Qué tal me ha ido?', gradeTeacher: 'Nota del profesor',
      swap: '(y al revés)',
      names: [{ n: 'Lucía', g: 'f' }, { n: 'Pablo', g: 'm' }, { n: 'Sofía', g: 'f' }, { n: 'Hugo', g: 'm' }, { n: 'Martina', g: 'f' }, { n: 'Mateo', g: 'm' }, { n: 'Valeria', g: 'f' }, { n: 'Leo', g: 'm' }],
      nouns: {
        chestnut: ['castañas', 'f'], acorn: ['bellotas', 'f'], apple: ['manzanas', 'f'], pear: ['peras', 'f'], shell: ['conchas', 'f'], pebble: ['piedritas', 'f'],
        page: ['páginas', 'f'], person: ['personas', 'f'], candy: ['caramelos', 'm'], sticker: ['pegatinas', 'f'], balloon: ['globos', 'm'],
        muffin: ['magdalenas', 'f'], cookie: ['galletas', 'f'], sparrow: ['gorriones', 'm'], ticketA: ['entradas normales', 'f'], ticket: ['entradas', 'f'],
        marble: ['canicas', 'f'], crayon: ['lápices de colores', 'm'], book: ['libros', 'm'], car: ['cochecitos', 'm'], fish: ['peces', 'm'], flower: ['flores', 'f'],
      },
      cats: { autumn: ['tesoros de otoño', 'm'], fruit: ['frutas', 'f'], beach: ['tesoros de la playa', 'm'] },
      cont: {
        basket: { in: n => `en ${n} cestas`, each: 'en cada cesta', many: 'cestas' },
        plate: { in: n => `en ${n} platos`, each: 'en cada plato', many: 'platos' },
        aquarium: { in: n => `en ${n} peceras`, each: 'en cada pecera', many: 'peceras' },
        shelf: { in: n => `en ${n} estantes`, each: 'en cada estante', many: 'estantes' },
        vase: { in: n => `en ${n} jarrones`, each: 'en cada jarrón', many: 'jarrones' },
        box: { in: n => `en ${n} cajas`, each: 'en cada caja', many: 'cajas' },
      },
      tpl: {
        join: [
          ({ A, a, b, n, cat, catQ }) => `${A.n} ha recogido ${a} ${n('X')} y ${b} ${n('Y')}. ¿${catQ} ${cat} ha recogido en total?`,
          ({ A, a, b }) => `El lunes ${A.n} leyó ${a} páginas y el martes ${b} páginas. ¿Cuántas páginas leyó en total?`,
          ({ a, b }) => `En el autobús van ${a} personas. En la parada suben ${b} personas más. ¿Cuántas personas van ahora en el autobús?`,
        ],
        separate: [
          ({ A, a, b, n, q }) => `${A.n} tiene ${a} ${n('X')}. Les regala ${b} a sus compañeros. ¿${q('X')} ${n('X')} le quedan?`,
          ({ a, b }) => `En un árbol hay ${a} gorriones. Se van volando ${b}. ¿Cuántos gorriones quedan en el árbol?`,
          ({ a, b, n, q }) => `La abuela ha hecho ${a} ${n('X')}. Los niños se han comido ${b}. ¿${q('X')} ${n('X')} quedan?`,
        ],
        missing: [
          ({ a, c }) => `En la taquilla del teatro de títeres vendieron ${a} entradas normales y algunas reducidas. En total vendieron ${c} entradas. ¿Cuántas entradas reducidas vendieron?`,
          ({ A, a, c, n, q, os }) => `${A.n} tiene ${a} ${n('X')}. Le regalan algun${os('X')} más y ahora tiene ${c}. ¿${q('X')} ${n('X')} le han regalado?`,
          ({ a, c }) => `En una caja había ${c} lápices de colores. Se cayeron algunos y quedaron ${a}. ¿Cuántos lápices se cayeron?`,
        ],
        compare: [
          ({ A, B, a, b, n, q }) => `${A.n} tiene ${a} ${n('X')} y ${B.n} tiene ${b}. ¿${q('X')} ${n('X')} más tiene ${B.n}?`,
          ({ A, B, a, d, n, q }) => `${A.n} tiene ${a} ${n('X')}. ${B.n} tiene ${d} más. ¿${q('X')} ${n('X')} tiene ${B.n}?`,
          ({ A, B, a, d, n, q }) => `${A.n} tiene ${a} ${n('X')}. ${B.n} tiene ${d} menos. ¿${q('X')} ${n('X')} tiene ${B.n}?`,
        ],
        open: [
          ({ c, n, q, C, cap }) => `${cap(C.in(2))} hay ${c} ${n('X')} en total. ¿${q('X')} ${n('X')} puede haber ${C.each}? Escribe varias posibilidades.`,
        ],
        groups: [
          ({ a, b, n, q, C }) => `Hay ${a} ${C.many} y ${C.each} hay ${b} ${n('X')}. ¿${q('X')} ${n('X')} hay en total?`,
        ],
      },
    },
  };

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  /** The card text of problem p in language lang. */
  function say(lang, p) {
    const L = T[lang] || T.en;
    const id = k => (k === 'X' ? p.X : k === 'Y' ? p.Y : k);
    const raw = k => L.nouns[id(k)];
    const word = k => (Array.isArray(raw(k)) ? raw(k)[0] : raw(k));
    const gen = k => (Array.isArray(raw(k)) ? raw(k)[1] : 'm');
    const slav = lang === 'pl' || lang === 'uk';
    const ctx = {
      a: p.a, b: p.b, c: p.c, d: p.d, cap,
      A: L.names[p.A], B: L.names[p.B],
      g: (who, m, f) => (who.g === 'f' ? f : m),
      // pl/uk: "5 jabłek", "3 jabłka"; elsewhere "5 apples"
      N: (num, k) => `${num} ${slav ? plPl(num, raw(k)[0], raw(k)[1]) : word(k)}`,
      n: k => (slav ? raw(k)[1] : word(k)),          // after "ile"/"скільки"; the plural elsewhere
      f: k => raw(k)[0],                               // pl/uk plural without a number ("są jabłka")
      V: (num, few, many) => plPl(num, few, many),     // a verb that agrees with the number
      de: k => (/^[aeiouyhéèêàâîôû]/i.test(word(k)) ? 'd’' : 'de ') + word(k),
      q: k => (lang === 'it' ? (gen(k) === 'f' ? 'Quante' : 'Quanti') : (gen(k) === 'f' ? 'Cuántas' : 'Cuántos')),
      e: k => (gen(k) === 'f' ? 'e' : 'i'),            // it: mangiati / mangiate
      os: k => (gen(k) === 'f' ? 'as' : 'os'),         // es: algunos / algunas
    };
    if (p.cat) {
      const c = L.cats[p.cat];
      ctx.cat = Array.isArray(c) ? c[0] : c;
      ctx.catQ = Array.isArray(c) && c[1] === 'f' ? 'Cuántas' : 'Cuántos';
    }
    if (p.K) ctx.C = L.cont[p.K];
    const text = L.tpl[p.type][p.v](ctx);
    return lang === 'fr' ? text.replace(/ ([?!:;])/g, '\u00a0$1') : text;   // French: no line break before ? ! : ;
  }

  // say/plPl are not enumerable, so the kit sees only the languages
  return Object.defineProperties(T, { say: { value: say }, plPl: { value: plPl } });
})();
if (typeof module !== 'undefined') module.exports = WORDS_TEXT;
