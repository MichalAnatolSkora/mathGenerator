/**
 * Texts of the hidden objects worksheet in seven languages (pl, en, uk, vi, fr, it, es). Classic script;
 * defines the global `HID_TEXT`. The kit (../sheet-kit/kit.js) adds the shared ones (seed, options, print…).
 * `objects` = the names under the little pictures, keyed by the object ids of objects.js.
 */
const HID_TEXT = (() => {
  const K = typeof KIT !== 'undefined' ? KIT : require('../sheet-kit/kit.js');
  /** Object names in the order of IDS. */
  const IDS = ['pencil', 'banana', 'spoon', 'heart', 'crown', 'sock', 'key', 'comb', 'toothbrush', 'icecream', 'pizza', 'moon', 'star', 'fish', 'bell', 'cup', 'candle', 'carrot', 'umbrella', 'button', 'ring', 'mitten', 'hat', 'kite', 'bulb', 'bone', 'envelope', 'book', 'ruler', 'lollipop', 'feather', 'horseshoe', 'boot', 'pear', 'apple', 'flag', 'sailboat', 'bottle', 'hammer', 'fork', 'brush', 'balloon', 'mushroom', 'cherries', 'glasses', 'die', 'magnet', 'tooth', 'bolt', 'melon', 'cheese', 'donut', 'arrow', 'anchor', 'cupcake', 'saw', 'drum', 'partyhat', 'drop', 'coin', 'ball', 'clock', 'cookie', 'lemon', 'ladybug', 'beehive', 'tent'];
  const names = list => Object.fromEntries(list.split('|').map((n, i) => [IDS[i], n]));
  return {
    pl: {
      title: 'Ukryte przedmioty — karta pracy',
      appTitle: '🔎 Ukryte przedmioty — karta pracy',
      appSub: 'Karty A4 do druku: obrazek, w którym schowały się przedmioty. Za każdym kodem inny obrazek. Z rozwiązaniem.',
      scene: 'Obrazek', scenes: { mix: '🎲 Losowy', forest: '🌳 Las', farm: '🚜 Wieś', sea: '🐠 Pod wodą', space: '🚀 Kosmos' },
      level: 'Poziom', levels: { easy: 'Łatwy · 8', medium: 'Średni · 12', hard: 'Trudny · 16' },
      optWords: 'Lista bez obrazków, same nazwy (trudniej)',
      sheetTitle: 'Ukryte przedmioty',
      instr: n => `Na obrazku ${K.plPl(n, 'schował się', 'schowały się', 'schowało się')} ${n} ${K.plPl(n, 'przedmiot', 'przedmioty', 'przedmiotów')}. Niektóre udają część rysunku: deskę w płocie, gałąź, okno, koło… Znajdź wszystkie i pokoloruj.`,
      objects: names('ołówek|banan|łyżka|serce|korona|skarpetka|klucz|grzebień|szczoteczka do zębów|lody|kawałek pizzy|księżyc|gwiazdka|rybka|dzwonek|kubek|świeczka|marchewka|parasol|guzik|pierścionek|rękawiczka|kapelusz|latawiec|żarówka|kość|koperta|książka|linijka|lizak|piórko|podkowa|kalosz|gruszka|jabłko|chorągiewka|żaglówka|butelka|młotek|widelec|pędzel|balonik|grzyb|wiśnie|okulary|kostka do gry|magnes|ząb|błyskawica|arbuz|ser|pączek z dziurką|strzała|kotwica|babeczka|piła|bębenek|czapeczka urodzinowa|kropla|moneta|piłka|zegar|ciastko|plasterek cytryny|biedronka|ul|namiot'),
    },
    en: {
      title: 'Hidden objects — worksheet',
      appTitle: '🔎 Hidden objects — worksheet',
      appSub: 'Printable A4 sheets: a picture with objects hidden in it. A new picture for every code. With the answer.',
      scene: 'Picture', scenes: { mix: '🎲 Random', forest: '🌳 Forest', farm: '🚜 Farm', sea: '🐠 Under the sea', space: '🚀 Space' },
      level: 'Level', levels: { easy: 'Easy · 8', medium: 'Medium · 12', hard: 'Hard · 16' },
      optWords: 'List without pictures, names only (harder)',
      sheetTitle: 'Hidden objects',
      instr: n => `${n} ${n === 1 ? 'object is' : 'objects are'} hidden in the picture. Some pretend to be a part of the drawing: a fence board, a branch, a window, a wheel… Find them all and colour them in.`,
      objects: names('pencil|banana|spoon|heart|crown|sock|key|comb|toothbrush|ice cream|slice of pizza|moon|star|fish|bell|mug|candle|carrot|umbrella|button|ring|mitten|hat|kite|light bulb|bone|envelope|book|ruler|lollipop|feather|horseshoe|wellington boot|pear|apple|flag|sailing boat|bottle|hammer|fork|paintbrush|balloon|mushroom|cherries|glasses|dice|magnet|tooth|lightning bolt|slice of watermelon|cheese|doughnut|arrow|anchor|cupcake|saw|drum|party hat|drop|coin|ball|clock|biscuit|slice of lemon|ladybird|beehive|tent'),
    },
    uk: {
      title: 'Сховані предмети — робочий аркуш',
      appTitle: '🔎 Сховані предмети — робочий аркуш',
      appSub: 'Аркуші A4 для друку: малюнок, у якому сховалися предмети. Для кожного коду інший малюнок. З відповіддю.',
      scene: 'Малюнок', scenes: { mix: '🎲 Випадковий', forest: '🌳 Ліс', farm: '🚜 Село', sea: '🐠 Під водою', space: '🚀 Космос' },
      level: 'Рівень', levels: { easy: 'Легкий · 8', medium: 'Середній · 12', hard: 'Складний · 16' },
      optWords: 'Список без малюнків, самі назви (складніше)',
      sheetTitle: 'Сховані предмети',
      instr: n => `На малюнку ${K.ukPl(n, 'сховався', 'сховалися', 'сховалося')} ${n} ${K.ukPl(n, 'предмет', 'предмети', 'предметів')}. Деякі вдають частину малюнка: дошку в паркані, гілку, вікно, колесо… Знайди всі й розфарбуй.`,
      objects: names('олівець|банан|ложка|серце|корона|шкарпетка|ключ|гребінець|зубна щітка|морозиво|шматок піци|місяць|зірочка|рибка|дзвоник|чашка|свічка|морква|парасолька|ґудзик|каблучка|рукавичка|капелюх|повітряний змій|лампочка|кістка|конверт|книжка|лінійка|льодяник|пір’їнка|підкова|гумовий чобіт|груша|яблуко|прапорець|вітрильник|пляшка|молоток|виделка|пензлик|кулька|гриб|вишні|окуляри|гральний кубик|магніт|зуб|блискавка|кавун|сир|пончик|стріла|якір|кекс|пилка|барабан|святковий ковпак|крапля|монета|м’яч|годинник|печиво|скибочка лимона|сонечко|вулик|намет'),
    },
    vi: {
      title: 'Tìm đồ vật ẩn — phiếu bài tập',
      appTitle: '🔎 Tìm đồ vật ẩn — phiếu bài tập',
      appSub: 'Phiếu A4 để in: một bức tranh có các đồ vật ẩn bên trong. Mỗi mã cho một bức tranh khác. Có đáp án.',
      scene: 'Bức tranh', scenes: { mix: '🎲 Ngẫu nhiên', forest: '🌳 Khu rừng', farm: '🚜 Nông trại', sea: '🐠 Dưới biển', space: '🚀 Vũ trụ' },
      level: 'Mức độ', levels: { easy: 'Dễ · 8', medium: 'Vừa · 12', hard: 'Khó · 16' },
      optWords: 'Danh sách không có hình, chỉ có tên (khó hơn)',
      sheetTitle: 'Tìm đồ vật ẩn',
      instr: n => `Trong tranh có ${n} đồ vật đang ẩn. Có món giả làm một phần của bức tranh: tấm ván hàng rào, cành cây, cửa sổ, bánh xe… Em hãy tìm hết và tô màu.`,
      objects: names('bút chì|quả chuối|cái thìa|trái tim|vương miện|chiếc tất|chìa khóa|cái lược|bàn chải đánh răng|kem ốc quế|miếng pizza|mặt trăng|ngôi sao|con cá|cái chuông|cái cốc|cây nến|củ cà rốt|cái ô|cái cúc áo|chiếc nhẫn|găng tay|cái mũ|con diều|bóng đèn|khúc xương|phong bì|quyển sách|cái thước|kẹo mút|lông vũ|móng ngựa|chiếc ủng|quả lê|quả táo|lá cờ|thuyền buồm|cái chai|cái búa|cái nĩa|cọ vẽ|bóng bay|cây nấm|quả anh đào|cặp kính|xúc xắc|nam châm|cái răng|tia chớp|miếng dưa hấu|miếng pho mát|bánh vòng|mũi tên|mỏ neo|bánh nướng nhỏ|cái cưa|cái trống|mũ sinh nhật|giọt nước|đồng xu|quả bóng|đồng hồ|bánh quy|lát chanh|bọ rùa|tổ ong|cái lều'),
    },
    fr: {
      title: 'Objets cachés — fiche',
      appTitle: '🔎 Objets cachés — fiche',
      appSub: 'Fiches A4 à imprimer : un dessin où des objets se sont cachés. Un nouveau dessin pour chaque code. Avec le corrigé.',
      scene: 'Dessin', scenes: { mix: '🎲 Au hasard', forest: '🌳 Forêt', farm: '🚜 Ferme', sea: '🐠 Sous la mer', space: '🚀 Espace' },
      level: 'Niveau', levels: { easy: 'Facile · 8', medium: 'Moyen · 12', hard: 'Difficile · 16' },
      optWords: 'Liste sans images, seulement les noms (plus difficile)',
      sheetTitle: 'Objets cachés',
      instr: n => `${n} ${n <= 1 ? 'objet s’est caché' : 'objets se sont cachés'} dans le dessin. Certains font semblant d’être une partie du dessin : une planche de la barrière, une branche, une fenêtre, une roue… Trouve-les tous et colorie-les.`,
      objects: names('crayon|banane|cuillère|cœur|couronne|chaussette|clé|peigne|brosse à dents|glace|part de pizza|lune|étoile|poisson|cloche|tasse|bougie|carotte|parapluie|bouton|bague|moufle|chapeau|cerf-volant|ampoule|os|enveloppe|livre|règle|sucette|plume|fer à cheval|botte|poire|pomme|drapeau|voilier|bouteille|marteau|fourchette|pinceau|ballon de baudruche|champignon|cerises|lunettes|dé|aimant|dent|éclair|tranche de pastèque|fromage|donut|flèche|ancre|cupcake|scie|tambour|chapeau de fête|goutte|pièce|ballon|horloge|biscuit|rondelle de citron|coccinelle|ruche|tente'),
    },
    it: {
      title: 'Oggetti nascosti — scheda',
      appTitle: '🔎 Oggetti nascosti — scheda',
      appSub: 'Schede A4 da stampare: un disegno in cui si sono nascosti degli oggetti. Un disegno nuovo per ogni codice. Con la soluzione.',
      scene: 'Disegno', scenes: { mix: '🎲 A caso', forest: '🌳 Bosco', farm: '🚜 Fattoria', sea: '🐠 In fondo al mare', space: '🚀 Spazio' },
      level: 'Livello', levels: { easy: 'Facile · 8', medium: 'Medio · 12', hard: 'Difficile · 16' },
      optWords: 'Elenco senza figure, solo i nomi (più difficile)',
      sheetTitle: 'Oggetti nascosti',
      instr: n => `Nel disegno ${n === 1 ? 'si è nascosto 1 oggetto' : `si sono nascosti ${n} oggetti`}. Alcuni fanno finta di essere una parte del disegno: un’asse dello steccato, un ramo, una finestra, una ruota… Trovali tutti e colorali.`,
      objects: names('matita|banana|cucchiaio|cuore|corona|calzino|chiave|pettine|spazzolino|gelato|fetta di pizza|luna|stella|pesce|campanella|tazza|candela|carota|ombrello|bottone|anello|muffola|cappello|aquilone|lampadina|osso|busta|libro|righello|lecca-lecca|piuma|ferro di cavallo|stivale|pera|mela|bandierina|barca a vela|bottiglia|martello|forchetta|pennello|palloncino|fungo|ciliegie|occhiali|dado|calamita|dente|fulmine|fetta di anguria|formaggio|ciambella|freccia|ancora|tortina|sega|tamburo|cappellino da festa|goccia|moneta|palla|orologio|biscotto|fetta di limone|coccinella|alveare|tenda'),
    },
    es: {
      title: 'Objetos escondidos — ficha',
      appTitle: '🔎 Objetos escondidos — ficha',
      appSub: 'Fichas A4 para imprimir: un dibujo en el que se han escondido objetos. Un dibujo nuevo con cada código. Con la solución.',
      scene: 'Dibujo', scenes: { mix: '🎲 Al azar', forest: '🌳 Bosque', farm: '🚜 Granja', sea: '🐠 Bajo el mar', space: '🚀 Espacio' },
      level: 'Nivel', levels: { easy: 'Fácil · 8', medium: 'Medio · 12', hard: 'Difícil · 16' },
      optWords: 'Lista sin dibujos, solo los nombres (más difícil)',
      sheetTitle: 'Objetos escondidos',
      instr: n => `En el dibujo ${n === 1 ? 'se ha escondido 1 objeto' : `se han escondido ${n} objetos`}. Algunos fingen ser una parte del dibujo: una tabla de la valla, una rama, una ventana, una rueda… Encuéntralos todos y coloréalos.`,
      objects: names('lápiz|plátano|cuchara|corazón|corona|calcetín|llave|peine|cepillo de dientes|helado|trozo de pizza|luna|estrella|pez|campana|taza|vela|zanahoria|paraguas|botón|anillo|manopla|sombrero|cometa|bombilla|hueso|sobre|libro|regla|piruleta|pluma|herradura|bota de agua|pera|manzana|banderín|velero|botella|martillo|tenedor|pincel|globo|seta|cerezas|gafas|dado|imán|diente|rayo|rodaja de sandía|queso|rosquilla|flecha|ancla|magdalena|sierra|tambor|gorro de fiesta|gota|moneda|pelota|reloj|galleta|rodaja de limón|mariquita|colmena|tienda de campaña'),
    },
  };
})();
if (typeof module !== 'undefined') module.exports = HID_TEXT;
