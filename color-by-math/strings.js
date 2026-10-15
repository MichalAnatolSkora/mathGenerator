/**
 * Texts of the colour-by-maths worksheet in seven languages (pl, en, uk, vi, fr, it, es). Classic script; defines
 * the global `CBM_TEXT`. The kit (../sheet-kit/kit.js) adds the shared ones (seed, options, print…).
 * `colors` names every colour of engine.js by its letter ('.' = white, leave it; `white` = the short form for the
 * answer key); `pics` names every picture by id.
 */
const CBM_PL = (typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js'));
const CBM_TEXT = {
  pl: {
    title: 'Kolorowanka z działaniami — karta pracy',
    appTitle: '🎨 Kolorowanka z działaniami — karta pracy',
    appSub: 'Karty A4 do druku: policz działanie w każdym polu i pokoloruj je kolorem wyniku, a pojawi się obrazek. Dodawanie i odejmowanie do 10 albo do 20. Z rozwiązaniami.',
    math: 'Działania', maths: { add10: 'Dodawanie do 10', mix10: 'Dodawanie i odejmowanie do 10', add20: 'Dodawanie do 20', mix20: 'Dodawanie i odejmowanie do 20' },
    fields: 'Pola', fieldSizes: { big: 'Duże pola (mniej działań)', small: 'Małe pola (więcej działań)' },
    count: 'Ile obrazków', counts: n => `${n} ${CBM_PL.plPl(n, 'obrazek', 'obrazki', 'obrazków')}`,
    sheetTitle: 'Kolorowanka z działaniami',
    instr: 'Policz działanie w każdym polu. Wynik mówi, jakim kolorem pomalować całe pole. Co się pojawi?',
    answer: 'Co to jest?',
    colors: { '.': 'biały — nie koloruj', white: 'biały', k: 'czarny', s: 'szary', r: 'czerwony', p: 'różowy', o: 'pomarańczowy', y: 'żółty', g: 'zielony', b: 'niebieski', c: 'błękitny', v: 'fioletowy', n: 'brązowy' },
    pics: {
      house: 'domek', rocket: 'rakieta', fish: 'rybka', mushroom: 'muchomor', flower: 'kwiatek', ladybird: 'biedronka', car: 'samochód',
      apple: 'jabłko', owl: 'sowa', sailboat: 'żaglówka', tree: 'drzewo', icecream: 'lody', frog: 'żaba', cat: 'kot', butterfly: 'motyl',
    },
  },
  en: {
    title: 'Colour by maths — worksheet',
    appTitle: '🎨 Colour by maths — worksheet',
    appSub: 'Printable A4 sheets: work out the sum in every field, colour it in the colour of the result, and a picture appears. Adding and taking away to 10 or to 20. With answer keys.',
    math: 'Sums', maths: { add10: 'Adding to 10', mix10: 'Adding and taking away to 10', add20: 'Adding to 20', mix20: 'Adding and taking away to 20' },
    fields: 'Fields', fieldSizes: { big: 'Big fields (fewer sums)', small: 'Small fields (more sums)' },
    count: 'How many pictures', counts: n => `${n} ${n === 1 ? 'picture' : 'pictures'}`,
    sheetTitle: 'Colour by maths',
    instr: 'Work out the sum in every field. The result tells you which colour to use for the whole field. What will appear?',
    answer: 'What is it?',
    colors: { '.': 'white — leave it', white: 'white', k: 'black', s: 'grey', r: 'red', p: 'pink', o: 'orange', y: 'yellow', g: 'green', b: 'blue', c: 'light blue', v: 'purple', n: 'brown' },
    pics: {
      house: 'house', rocket: 'rocket', fish: 'fish', mushroom: 'toadstool', flower: 'flower', ladybird: 'ladybird', car: 'car',
      apple: 'apple', owl: 'owl', sailboat: 'sailing boat', tree: 'tree', icecream: 'ice cream', frog: 'frog', cat: 'cat', butterfly: 'butterfly',
    },
  },
  uk: {
    title: 'Розмальовка з прикладами — робочий аркуш',
    appTitle: '🎨 Розмальовка з прикладами — робочий аркуш',
    appSub: 'Аркуші A4 для друку: розв’яжи приклад у кожному полі й розфарбуй його кольором відповіді — і з’явиться малюнок. Додавання й віднімання в межах 10 або 20. З відповідями.',
    math: 'Приклади', maths: { add10: 'Додавання в межах 10', mix10: 'Додавання й віднімання в межах 10', add20: 'Додавання в межах 20', mix20: 'Додавання й віднімання в межах 20' },
    fields: 'Поля', fieldSizes: { big: 'Великі поля (менше прикладів)', small: 'Малі поля (більше прикладів)' },
    count: 'Скільки малюнків', counts: n => `${n} ${CBM_PL.ukPl(n, 'малюнок', 'малюнки', 'малюнків')}`,
    sheetTitle: 'Розмальовка з прикладами',
    instr: 'Розв’яжи приклад у кожному полі. Відповідь підкаже, яким кольором розфарбувати все поле. Що з’явиться?',
    answer: 'Що це?',
    colors: { '.': 'білий — не фарбуй', white: 'білий', k: 'чорний', s: 'сірий', r: 'червоний', p: 'рожевий', o: 'помаранчевий', y: 'жовтий', g: 'зелений', b: 'синій', c: 'блакитний', v: 'фіолетовий', n: 'коричневий' },
    pics: {
      house: 'будиночок', rocket: 'ракета', fish: 'рибка', mushroom: 'мухомор', flower: 'квітка', ladybird: 'сонечко', car: 'автомобіль',
      apple: 'яблуко', owl: 'сова', sailboat: 'вітрильник', tree: 'дерево', icecream: 'морозиво', frog: 'жаба', cat: 'кіт', butterfly: 'метелик',
    },
  },
  vi: {
    title: 'Tô màu theo phép tính — phiếu bài tập',
    appTitle: '🎨 Tô màu theo phép tính — phiếu bài tập',
    appSub: 'Phiếu A4 để in: tính phép tính trong mỗi ô, tô ô đó bằng màu của kết quả, và một bức tranh sẽ hiện ra. Phép cộng và trừ trong phạm vi 10 hoặc 20. Có đáp án.',
    math: 'Phép tính', maths: { add10: 'Phép cộng trong phạm vi 10', mix10: 'Cộng và trừ trong phạm vi 10', add20: 'Phép cộng trong phạm vi 20', mix20: 'Cộng và trừ trong phạm vi 20' },
    fields: 'Ô', fieldSizes: { big: 'Ô lớn (ít phép tính hơn)', small: 'Ô nhỏ (nhiều phép tính hơn)' },
    count: 'Số bức tranh', counts: n => `${n} bức tranh`,
    sheetTitle: 'Tô màu theo phép tính',
    instr: 'Tính phép tính trong mỗi ô. Kết quả cho biết em tô cả ô bằng màu nào. Bức tranh gì sẽ hiện ra?',
    answer: 'Đây là gì?',
    colors: { '.': 'trắng — không tô', white: 'trắng', k: 'đen', s: 'xám', r: 'đỏ', p: 'hồng', o: 'cam', y: 'vàng', g: 'xanh lá', b: 'xanh dương', c: 'xanh da trời', v: 'tím', n: 'nâu' },
    pics: {
      house: 'ngôi nhà', rocket: 'tên lửa', fish: 'con cá', mushroom: 'cây nấm', flower: 'bông hoa', ladybird: 'con bọ rùa', car: 'ô tô',
      apple: 'quả táo', owl: 'con cú', sailboat: 'thuyền buồm', tree: 'cái cây', icecream: 'kem', frog: 'con ếch', cat: 'con mèo', butterfly: 'con bướm',
    },
  },
  fr: {
    title: 'Coloriage magique — fiche',
    appTitle: '🎨 Coloriage magique — fiche',
    appSub: 'Fiches A4 à imprimer : calcule l’opération de chaque case, colorie-la de la couleur du résultat, et un dessin apparaît. Additions et soustractions jusqu’à 10 ou jusqu’à 20. Avec corrigés.',
    math: 'Calculs', maths: { add10: 'Additions jusqu’à 10', mix10: 'Additions et soustractions jusqu’à 10', add20: 'Additions jusqu’à 20', mix20: 'Additions et soustractions jusqu’à 20' },
    fields: 'Cases', fieldSizes: { big: 'Grandes cases (moins de calculs)', small: 'Petites cases (plus de calculs)' },
    count: 'Nombre de dessins', counts: n => `${n} ${n === 1 ? 'dessin' : 'dessins'}`,
    sheetTitle: 'Coloriage magique',
    instr: 'Calcule l’opération de chaque case. Le résultat te dit de quelle couleur colorier toute la case. Qu’est-ce qui va apparaître ?',
    answer: 'Qu’est-ce que c’est ?',
    colors: { '.': 'blanc — ne colorie pas', white: 'blanc', k: 'noir', s: 'gris', r: 'rouge', p: 'rose', o: 'orange', y: 'jaune', g: 'vert', b: 'bleu', c: 'bleu clair', v: 'violet', n: 'marron' },
    pics: {
      house: 'maison', rocket: 'fusée', fish: 'poisson', mushroom: 'champignon', flower: 'fleur', ladybird: 'coccinelle', car: 'voiture',
      apple: 'pomme', owl: 'hibou', sailboat: 'voilier', tree: 'arbre', icecream: 'glace', frog: 'grenouille', cat: 'chat', butterfly: 'papillon',
    },
  },
  it: {
    title: 'Colora con i calcoli — scheda',
    appTitle: '🎨 Colora con i calcoli — scheda',
    appSub: 'Schede A4 da stampare: risolvi il calcolo in ogni casella, colorala del colore del risultato e apparirà un disegno. Addizioni e sottrazioni entro il 10 o entro il 20. Con le soluzioni.',
    math: 'Calcoli', maths: { add10: 'Addizioni entro il 10', mix10: 'Addizioni e sottrazioni entro il 10', add20: 'Addizioni entro il 20', mix20: 'Addizioni e sottrazioni entro il 20' },
    fields: 'Caselle', fieldSizes: { big: 'Caselle grandi (meno calcoli)', small: 'Caselle piccole (più calcoli)' },
    count: 'Quanti disegni', counts: n => `${n} ${n === 1 ? 'disegno' : 'disegni'}`,
    sheetTitle: 'Colora con i calcoli',
    instr: 'Risolvi il calcolo in ogni casella. Il risultato ti dice di che colore colorare tutta la casella. Che cosa apparirà?',
    answer: 'Che cos’è?',
    colors: { '.': 'bianco — non colorare', white: 'bianco', k: 'nero', s: 'grigio', r: 'rosso', p: 'rosa', o: 'arancione', y: 'giallo', g: 'verde', b: 'blu', c: 'azzurro', v: 'viola', n: 'marrone' },
    pics: {
      house: 'casetta', rocket: 'razzo', fish: 'pesce', mushroom: 'fungo', flower: 'fiore', ladybird: 'coccinella', car: 'automobile',
      apple: 'mela', owl: 'gufo', sailboat: 'barca a vela', tree: 'albero', icecream: 'gelato', frog: 'rana', cat: 'gatto', butterfly: 'farfalla',
    },
  },
  es: {
    title: 'Colorea con operaciones — ficha',
    appTitle: '🎨 Colorea con operaciones — ficha',
    appSub: 'Fichas A4 para imprimir: resuelve la operación de cada casilla, píntala del color del resultado y aparecerá un dibujo. Sumas y restas hasta 10 o hasta 20. Con soluciones.',
    math: 'Operaciones', maths: { add10: 'Sumas hasta 10', mix10: 'Sumas y restas hasta 10', add20: 'Sumas hasta 20', mix20: 'Sumas y restas hasta 20' },
    fields: 'Casillas', fieldSizes: { big: 'Casillas grandes (menos operaciones)', small: 'Casillas pequeñas (más operaciones)' },
    count: 'Cuántos dibujos', counts: n => `${n} ${n === 1 ? 'dibujo' : 'dibujos'}`,
    sheetTitle: 'Colorea con operaciones',
    instr: 'Resuelve la operación de cada casilla. El resultado te dice de qué color pintar toda la casilla. ¿Qué aparecerá?',
    answer: '¿Qué es?',
    colors: { '.': 'blanco — no pintes', white: 'blanco', k: 'negro', s: 'gris', r: 'rojo', p: 'rosa', o: 'naranja', y: 'amarillo', g: 'verde', b: 'azul', c: 'celeste', v: 'morado', n: 'marrón' },
    pics: {
      house: 'casita', rocket: 'cohete', fish: 'pez', mushroom: 'seta', flower: 'flor', ladybird: 'mariquita', car: 'coche',
      apple: 'manzana', owl: 'búho', sailboat: 'velero', tree: 'árbol', icecream: 'helado', frog: 'rana', cat: 'gato', butterfly: 'mariposa',
    },
  },
};
if (typeof module !== 'undefined') module.exports = CBM_TEXT;
