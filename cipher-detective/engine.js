/**
 * Cipher Detective — shared puzzle engine (used by index.html, the game, and worksheet.html,
 * the printable worksheet generator). Classic script: defines the global `ENGINE`.
 *
 * The engine holds the logic only. All user-facing text lives in strings.js, which registers
 * one dictionary per language in ENGINE.TEXT (see textFor()).
 *
 * Every language has its own alphabet, message bank and key words (see ALPHABETS / BANK):
 *   en  A–Z (26)          pl  A Ą B … Ź Ż (32)        uk  А Б … Ю Я (33)        vi  A Ă Â … X Y (29)
 * Letters are indexed 0 … n−1 in alphabet order. Characters outside the alphabet (spaces) pass
 * through unchanged; `i` (the key index for Vigenère/Beaufort) counts letters only.
 * The "ROT13" cipher is the half-alphabet rotation: shift = floor(n / 2) (13, 16, 16, 14).
 */
const ENGINE = (() => {
  const mod = (n, m) => ((n % m) + m) % m;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
  /** Modular inverse of a mod n (a and n coprime). */
  function modInverse(a, n) {
    let [r0, r1, t0, t1] = [n, mod(a, n), 0, 1];
    while (r1) { const q = Math.floor(r0 / r1); [r0, r1] = [r1, r0 - q * r1]; [t0, t1] = [t1, t0 - q * t1]; }
    if (r0 !== 1) throw new Error(`${a} has no inverse mod ${n}`);
    return mod(t0, n);
  }

  // ---------- alphabets ----------
  const ALPHABETS = {
    en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    pl: 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ',
    uk: 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ',
    vi: 'AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY',
  };
  const ALPHA = {};
  for (const [lang, str] of Object.entries(ALPHABETS)) {
    const letters = [...str.normalize('NFC')];
    const index = new Map(letters.map((ch, i) => [ch, i]));
    const n = letters.length;
    ALPHA[lang] = {
      lang, letters, index, n,
      half: Math.floor(n / 2),                                                  // the ROT shift
      affineA: [3, 5, 7, 11, 2, 4, 13, 9].filter(a => a < n && gcd(a, n) === 1).slice(0, 4),
      has: ch => index.has(ch),
      idx: ch => index.get(ch),
      at: i => letters[mod(i, n)],
    };
  }
  const alphabet = lang => ALPHA[lang] || ALPHA.en;

  /** Apply fn(letterIndex, letterCounter) to every letter of text; everything else unchanged. */
  function mapLetters(text, fn, A) {
    let i = 0, out = '';
    for (const ch of String(text).normalize('NFC').toUpperCase()) {
      if (A.has(ch)) { out += A.at(fn(A.idx(ch), i)); i++; }
      else out += ch;
    }
    return out;
  }

  // ---------- message banks (short, positive, kid-safe: 3–6 words, max 30 characters) ----------
  const BANK = {
    en: {
      keys: ['KEY','CAT','DOG','SUN','FUN','SPY','HAT','MAP','BOX','RED','SKY','OWL','BEE','FOX',
             'BLUE','STAR','MOON','LION','FROG','TREE','FISH','BEAR','CODE','BIRD','SHIP','GOLD','KITE','DUCK'],
      messages: [
        'MEET AT THE TREEHOUSE', 'THE CAKE IS READY', 'LOOK UNDER THE BED', 'YOU ARE A SUPER SPY',
        'PIZZA FOR DINNER TONIGHT', 'THE DOG LIKES TO DANCE', 'FIND THE HIDDEN KEY', 'GOOD JOB DETECTIVE',
        'MY CAT CAN JUMP HIGH', 'RACE YOU TO THE PARK', 'THE MAP IS IN THE BOX', 'BRING YOUR BLUE HAT',
        'HAPPY BIRTHDAY TO YOU', 'THE SUN IS SHINING', 'I LOVE ICE CREAM', 'LET US BUILD A FORT',
        'THE ROBOT SAYS HELLO', 'SECRET CLUB MEETS AT NOON', 'WATCH OUT FOR THE PUDDLE', 'THE PIRATE LOST HIS HAT',
        'COOKIES ARE IN THE JAR', 'MEET ME BY THE SWINGS', 'THE TREASURE IS NEAR', 'PACK YOUR SWIM SUIT',
        'THE OWL HOOTS AT NIGHT', 'WE WON THE BIG GAME', 'THE FROG CAN SING', 'YOUR CLUE IS THE RED DOOR',
        'CHECK THE MAIL BOX', 'THE PARTY STARTS AT FOUR', 'GRANDMA BAKED A PIE', 'THE MOON IS FULL TONIGHT',
        'LETS GO FLY A KITE', 'THE BUS COMES AT EIGHT', 'HIGH FIVE FOR YOU', 'THE PUPPY FOUND A SOCK',
        'TURN LEFT AT THE OAK TREE', 'DRAW A DRAGON WITH WINGS', 'THE SNOW IS PERFECT TODAY', 'YOU CRACKED THE CODE',
        'BEST FRIENDS FOREVER', 'THE GARDEN HAS A GNOME', 'HOT COCOA WITH MARSHMALLOWS', 'THE ZOO OPENS AT TEN',
        'THE PRIZE IS IN THE SHED', 'LOOK BEHIND THE BIG ROCK', 'THE CLASS TRIP IS FRIDAY', 'WEAR YOUR RAIN BOOTS',
        'THE FOX JUMPED THE FENCE', 'TEA PARTY IN THE GARDEN', 'YOU ARE A CODE MASTER', 'FEED THE FISH AT NOON',
        'THE TRAIN LEAVES AT NINE', 'MY BIKE IS BRIGHT GREEN', 'THE KITTEN LIKES BOXES', 'JUMP IN THE LEAF PILE',
        'THE RIVER IS COLD', 'WELL DONE YOUNG SPY', 'THE LIBRARY HAS NEW BOOKS', 'STARS SHINE AT NIGHT',
      ],
      words: 'A AT ARE BAKED BED BEHIND BEST BIG BIKE BIRTHDAY BOOKS BOOTS BOX BOXES BRIGHT BRING BLUE BUILD BUS BY CAKE CAN CAT CHECK CLASS CLUB CLUE COCOA CODE COLD COMES COOKIES CRACKED CREAM DANCE DETECTIVE DINNER DOG DONE DOOR DRAGON DRAW EIGHT FEED FENCE FIND FISH FIVE FLY FOR FOREVER FORT FOUND FOUR FOX FRIDAY FRIENDS FROG FULL GAME GARDEN GNOME GO GOOD GRANDMA GREEN HAPPY HAS HAT HELLO HIDDEN HIGH HIS HOOTS HOT I ICE IN IS JAR JOB JUMP JUMPED KEY KITE KITTEN LEAF LEAVES LEFT LET LETS LIBRARY LIKES LOOK LOST LOVE MAIL MAP MARSHMALLOWS MASTER ME MEET MEETS MOON MY NEAR NEW NIGHT NINE NOON OAK OPENS OUT OWL PACK PARK PARTY PERFECT PIE PILE PIRATE PIZZA PRIZE PUDDLE PUPPY RACE RAIN READY RED RIVER ROBOT ROCK SAYS SECRET SHED SHINE SHINING SING SNOW SOCK SPY STARS STARTS SUIT SUN SUPER SWIM SWINGS TEA TEN THE TO TODAY TONIGHT TRAIN TREASURE TREE TREEHOUSE TRIP TURN UNDER US WATCH WE WEAR WELL WINGS WITH WON YOU YOUNG YOUR ZOO',
    },
    pl: {
      keys: ['KOT','PIES','DOM','LAS','LEW','SOWA','GRA','MAPA','KOD','NOC','LIS','ŻABA','RYBA','MYSZ','JEŻ','LUPA','WILK','SŁOŃ','BÓBR','KRAB'],
      messages: [
        'SPOTKAJMY SIĘ W PARKU', 'TORT JEST GOTOWY', 'ZAJRZYJ POD ŁÓŻKO', 'JESTEŚ SUPER SZPIEGIEM',
        'PIZZA NA KOLACJĘ', 'PIES LUBI TAŃCZYĆ', 'ZNAJDŹ UKRYTY KLUCZ', 'BRAWO MŁODY DETEKTYWIE',
        'MÓJ KOT SKACZE WYSOKO', 'WYŚCIG DO PARKU', 'MAPA JEST W PUDEŁKU', 'WEŹ SWOJĄ NIEBIESKĄ CZAPKĘ',
        'STO LAT DLA CIEBIE', 'SŁOŃCE ŚWIECI DZIŚ', 'UWIELBIAM LODY TRUSKAWKOWE', 'ZBUDUJMY WIELKĄ BAZĘ',
        'ROBOT MÓWI CZEŚĆ', 'TAJNY KLUB O DWUNASTEJ', 'UWAŻAJ NA KAŁUŻĘ', 'PIRAT ZGUBIŁ KAPELUSZ',
        'CIASTKA SĄ W SŁOIKU', 'CZEKAM PRZY HUŚTAWKACH', 'SKARB JEST BLISKO', 'SPAKUJ STRÓJ KĄPIELOWY',
        'SOWA HUKA W NOCY', 'WYGRALIŚMY WIELKI MECZ', 'ŻABA UMIE ŚPIEWAĆ', 'WSKAZÓWKA TO CZERWONE DRZWI',
        'SPRAWDŹ SKRZYNKĘ NA LISTY', 'IMPREZA ZACZYNA SIĘ O CZWARTEJ', 'BABCIA UPIEKŁA CIASTO', 'DZIŚ JEST PEŁNIA KSIĘŻYCA',
        'PUŚĆMY RAZEM LATAWCA', 'AUTOBUS JEDZIE O ÓSMEJ', 'PIĄTKA DLA CIEBIE', 'SZCZENIAK ZNALAZŁ SKARPETKĘ',
        'SKRĘĆ W LEWO PRZY DĘBIE', 'NARYSUJ SMOKA ZE SKRZYDŁAMI', 'ŚNIEG JEST DZIŚ IDEALNY', 'SZYFR ZOSTAŁ ZŁAMANY',
        'NAJLEPSI PRZYJACIELE NA ZAWSZE', 'W OGRODZIE MIESZKA KRASNAL', 'GORĄCE KAKAO Z PIANKAMI', 'ZOO OTWIERA SIĘ O DZIESIĄTEJ',
        'NAGRODA JEST W SZOPIE', 'ZAJRZYJ ZA WIELKI KAMIEŃ', 'WYCIECZKA JEST W PIĄTEK', 'ZAŁÓŻ KALOSZE NA DESZCZ',
        'LIS PRZESKOCZYŁ PŁOT', 'HERBATKA W OGRODZIE', 'JESTEŚ MISTRZEM SZYFRÓW', 'NAKARM RYBKI W POŁUDNIE',
        'POCIĄG ODJEŻDŻA O DZIEWIĄTEJ', 'MÓJ ROWER JEST ZIELONY', 'KOTEK LUBI PUDEŁKA', 'SKACZ W STERTĘ LIŚCI',
        'RZEKA JEST ZIMNA', 'DOBRA ROBOTA MŁODY SZPIEGU', 'W BIBLIOTECE SĄ NOWE KSIĄŻKI', 'GWIAZDY ŚWIECĄ W NOCY',
      ],
      words: 'AUTOBUS BABCIA BAZĘ BIBLIOTECE BLISKO BRAWO CIASTKA CIASTO CIEBIE CZAPKĘ CZEKAM CZERWONE CZEŚĆ CZWARTEJ DESZCZ DETEKTYWIE DĘBIE DLA DO DOBRA DRZWI DWUNASTEJ DZIESIĄTEJ DZIEWIĄTEJ DZIŚ GORĄCE GOTOWY GWIAZDY HERBATKA HUKA HUŚTAWKACH IDEALNY IMPREZA JEDZIE JEST JESTEŚ KAKAO KALOSZE KAMIEŃ KAPELUSZ KAŁUŻĘ KLUB KLUCZ KOLACJĘ KOT KOTEK KRASNAL KSIĄŻKI KSIĘŻYCA LAT LATAWCA LEWO LIS LISTY LIŚCI LODY LUBI MAPA MECZ MIESZKA MISTRZEM MŁODY MÓJ MÓWI NA NAGRODA NAJLEPSI NAKARM NARYSUJ NIEBIESKĄ NOCY NOWE O ODJEŻDŻA OGRODZIE OTWIERA PARKU PEŁNIA PIANKAMI PIES PIRAT PIZZA PIĄTEK PIĄTKA POCIĄG POD POŁUDNIE PRZESKOCZYŁ PRZY PRZYJACIELE PUDEŁKA PUDEŁKU PUŚĆMY PŁOT RAZEM ROBOT ROBOTA ROWER RYBKI RZEKA SIĘ SKACZ SKACZE SKARB SKARPETKĘ SKRZYDŁAMI SKRZYNKĘ SKRĘĆ SMOKA SOWA SPAKUJ SPOTKAJMY SPRAWDŹ STERTĘ STO STRÓJ SUPER SWOJĄ SZCZENIAK SZOPIE SZPIEGIEM SZPIEGU SZYFR SZYFRÓW SĄ SŁOIKU SŁOŃCE TAJNY TAŃCZYĆ TO TORT TRUSKAWKOWE UKRYTY UMIE UPIEKŁA UWAŻAJ UWIELBIAM W WEŹ WIELKI WIELKĄ WSKAZÓWKA WYCIECZKA WYGRALIŚMY WYSOKO WYŚCIG Z ZA ZACZYNA ZAJRZYJ ZAWSZE ZAŁÓŻ ZBUDUJMY ZE ZGUBIŁ ZIELONY ZIMNA ZNAJDŹ ZNALAZŁ ZOO ZOSTAŁ ZŁAMANY ÓSMEJ ĆWIERĆ ŁÓŻKO ŚNIEG ŚPIEWAĆ ŚWIECI ŚWIECĄ ŻABA KĄPIELOWY',
    },
    uk: {
      keys: ['КІТ','ПЕС','ДІМ','ЛІС','ЛЕВ','СОВА','ГРА','КОД','НІЧ','РИБА','ЖАБА','КРАБ','ВОВК','ЛИС','МАПА','СЛОН','ЇЖАК','КЛЮЧ','ШИФР','ЗОРЯ'],
      messages: [
        'ЗУСТРІНЕМОСЯ В ПАРКУ', 'ТОРТ УЖЕ ГОТОВИЙ', 'ПОДИВИСЬ ПІД ЛІЖКО', 'ТИ СУПЕР ШПИГУН',
        'ПІЦА НА ВЕЧЕРЮ', 'ПЕС ЛЮБИТЬ ТАНЦЮВАТИ', 'ЗНАЙДИ СХОВАНИЙ КЛЮЧ', 'МОЛОДЕЦЬ ЮНИЙ ДЕТЕКТИВ',
        'МІЙ КІТ СТРИБАЄ ВИСОКО', 'НАВИПЕРЕДКИ ДО ПАРКУ', 'МАПА ЛЕЖИТЬ У КОРОБЦІ', 'ВІЗЬМИ СИНЮ ШАПКУ',
        'З ДНЕМ НАРОДЖЕННЯ ТЕБЕ', 'СОНЦЕ СЬОГОДНІ СЯЄ', 'Я ЛЮБЛЮ МОРОЗИВО', 'ЗБУДУЙМО ВЕЛИКУ ФОРТЕЦЮ',
        'РОБОТ КАЖЕ ПРИВІТ', 'ТАЄМНИЙ КЛУБ ОПІВДНІ', 'ОБЕРЕЖНО ВЕЛИКА КАЛЮЖА', 'ПІРАТ ЗАГУБИВ КАПЕЛЮХ',
        'ПЕЧИВО У БАНЦІ', 'ЧЕКАЮ БІЛЯ ГОЙДАЛКИ', 'СКАРБ ЗОВСІМ БЛИЗЬКО', 'СПАКУЙ КУПАЛЬНИЙ КОСТЮМ',
        'СОВА КРИЧИТЬ УНОЧІ', 'МИ ВИГРАЛИ ВЕЛИКУ ГРУ', 'ЖАБА ВМІЄ СПІВАТИ', 'ПІДКАЗКА ЧЕРВОНІ ДВЕРІ',
        'ПЕРЕВІР ПОШТОВУ СКРИНЬКУ', 'СВЯТО ПОЧИНАЄТЬСЯ О ЧЕТВЕРТІЙ', 'БАБУСЯ СПЕКЛА ПИРІГ', 'СЬОГОДНІ ПОВНИЙ МІСЯЦЬ',
        'ЗАПУСТИМО ПОВІТРЯНОГО ЗМІЯ', 'АВТОБУС ЇДЕ О ВОСЬМІЙ', 'ПЛЕСКАЮ ТОБІ В ДОЛОНІ', 'ЦУЦЕНЯ ЗНАЙШЛО ШКАРПЕТКУ',
        'ПОВЕРНИ ЛІВОРУЧ БІЛЯ ДУБА', 'НАМАЛЮЙ ДРАКОНА З КРИЛАМИ', 'СНІГ СЬОГОДНІ ЧУДОВИЙ', 'ШИФР РОЗГАДАНО ВІРНО',
        'НАЙКРАЩІ ДРУЗІ НАЗАВЖДИ', 'У САДКУ ЖИВЕ ГНОМ', 'ГАРЯЧЕ КАКАО З ЗЕФІРОМ', 'ЗООПАРК ВІДКРИТО О ДЕСЯТІЙ',
        'ПРИЗ ЛЕЖИТЬ У САРАЇ', 'ЗАЗИРНИ ЗА ВЕЛИКИЙ КАМІНЬ', 'ПОДОРОЖ КЛАСОМ У СУБОТУ', 'ВЗУЙ ГУМОВІ ЧОБОТИ',
        'ЛИС ПЕРЕСТРИБНУВ ПАРКАН', 'ЧАЮВАННЯ В САДКУ', 'ТИ МАЙСТЕР ШИФРІВ', 'НАГОДУЙ РИБОК ОПІВДНІ',
        'ПОТЯГ РУШАЄ О ШОСТІЙ', 'МІЙ ВЕЛОСИПЕД ЗЕЛЕНИЙ', 'КОШЕНЯ ЛЮБИТЬ КОРОБКИ', 'СТРИБНИ В КУПУ ЛИСТЯ',
        'РІЧКА ДУЖЕ ХОЛОДНА', 'МОЛОДЕЦЬ ЮНИЙ ШПИГУН', 'У БІБЛІОТЕЦІ НОВІ КНИЖКИ', 'ЗОРІ СЯЮТЬ УНОЧІ',
      ],
      words: 'АВТОБУС БАБУСЯ БАНЦІ БІБЛІОТЕЦІ БІЛЯ БЛИЗЬКО В ВЕЛИКА ВЕЛИКИЙ ВЕЛИКУ ВЕЛОСИПЕД ВЕЧЕРЮ ВЗУЙ ВИГРАЛИ ВИСОКО ВІДКРИТО ВІЗЬМИ ВІРНО ВМІЄ ВОСЬМІЙ ГАРЯЧЕ ГНОМ ГОЙДАЛКИ ГОТОВИЙ ГРУ ГУМОВІ ДВЕРІ ДЕСЯТІЙ ДЕТЕКТИВ ДНЕМ ДО ДОЛОНІ ДРАКОНА ДРУЗІ ДУБА ДУЖЕ ЖАБА ЖИВЕ З ЗА ЗАГУБИВ ЗАЗИРНИ ЗАПУСТИМО ЗБУДУЙМО ЗЕЛЕНИЙ ЗЕФІРОМ ЗМІЯ ЗНАЙДИ ЗНАЙШЛО ЗОВСІМ ЗООПАРК ЗОРІ ЗУСТРІНЕМОСЯ КАЖЕ КАКАО КАЛЮЖА КАМІНЬ КАПЕЛЮХ КІТ КЛАСОМ КЛУБ КЛЮЧ КНИЖКИ КОРОБКИ КОРОБЦІ КОСТЮМ КОШЕНЯ КРИЛАМИ КРИЧИТЬ КУПАЛЬНИЙ КУПУ ЛЕЖИТЬ ЛИС ЛИСТЯ ЛІВОРУЧ ЛІЖКО ЛЮБИТЬ ЛЮБЛЮ МАЙСТЕР МАПА МИ МІЙ МІСЯЦЬ МОЛОДЕЦЬ МОРОЗИВО НА НАВИПЕРЕДКИ НАГОДУЙ НАЗАВЖДИ НАЙКРАЩІ НАМАЛЮЙ НАРОДЖЕННЯ НОВІ О ОБЕРЕЖНО ОПІВДНІ ПАРКАН ПАРКУ ПЕРЕВІР ПЕРЕСТРИБНУВ ПЕС ПЕЧИВО ПИРІГ ПІД ПІДКАЗКА ПІРАТ ПІЦА ПЛЕСКАЮ ПОВЕРНИ ПОВІТРЯНОГО ПОВНИЙ ПОДИВИСЬ ПОДОРОЖ ПОТЯГ ПОЧИНАЄТЬСЯ ПОШТОВУ ПРИВІТ ПРИЗ РИБОК РОБОТ РОЗГАДАНО РУШАЄ РІЧКА САДКУ САРАЇ СВЯТО СИНЮ СКАРБ СКРИНЬКУ СЛОН СНІГ СОВА СОНЦЕ СПАКУЙ СПЕКЛА СПІВАТИ СТРИБАЄ СТРИБНИ СУБОТУ СУПЕР СХОВАНИЙ СЬОГОДНІ СЯЄ СЯЮТЬ ТАНЦЮВАТИ ТАЄМНИЙ ТЕБЕ ТИ ТОБІ ТОРТ У УЖЕ УНОЧІ ФОРТЕЦЮ ХОЛОДНА ЦУЦЕНЯ ЧАЮВАННЯ ЧЕКАЮ ЧЕРВОНІ ЧЕТВЕРТІЙ ЧОБОТИ ЧУДОВИЙ ШАПКУ ШИФР ШИФРІВ ШКАРПЕТКУ ШОСТІЙ ШПИГУН Ю ЮНИЙ Я ЇДЕ',
    },
    vi: {
      keys: ['MEO','CHO','SAO','HOA','MƯA','CÂY','THO','VOI','RUA','NAI','SOI','ĐEN','SACH','BIÊN','TRAI','NĂNG','BONG','CHIM','HÔM','VUI'],
      messages: [
        'GĂP NHAU Ơ NHA CÂY', 'BANH ĐA SĂN SANG', 'NHIN DƯƠI GÂM GIƯƠNG', 'BAN LA SIÊU ĐIÊP VIÊN',
        'TÔI NAY ĂN PHƠ', 'CHO THICH NHAY MUA', 'TIM CHIA KHOA BI MÂT', 'THAM TƯ NHI GIOI LĂM',
        'MEO TÔI NHAY RÂT CAO', 'ĐUA RA CÔNG VIÊN NAO', 'BAN ĐÔ Ơ TRONG HÔP', 'MANG MU XANH CUA BAN',
        'CHUC MƯNG SINH NHÂT BAN', 'HÔM NAY TRƠI NĂNG ĐEP', 'TÔI THICH ĂN KEM', 'CUNG XÂY PHAO ĐAI NAO',
        'ROBOT NOI XIN CHAO', 'CÂU LAC BÔ HOP LUC TRƯA', 'COI CHƯNG VUNG NƯƠC', 'HAI TĂC LAM MÂT MU',
        'BANH QUY Ơ TRONG LO', 'GĂP TÔI Ơ XICH ĐU', 'KHO BAU Ơ RÂT GÂN', 'MANG ĐÔ BƠI ĐI NHE',
        'CU KÊU LUC ĐÊM', 'CHUNG TA ĐA THĂNG', 'ÊCH BIÊT HAT', 'MANH MÔI LA CƯA ĐO',
        'KIÊM TRA HÔP THƯ', 'TIÊC BĂT ĐÂU LUC BÔN GIƠ', 'BA NƯƠNG BANH NGON', 'ĐÊM NAY TRĂNG TRON',
        'CUNG ĐI THA DIÊU NAO', 'XE BUYT ĐÊN LUC TAM GIƠ', 'ĐÂP TAY NAO BAN ƠI', 'CUN CON TIM THÂY CHIÊC TÂT',
        'RE TRAI Ơ CÂY SÔI', 'VE MÔT CON RÔNG CO CANH', 'HÔM NAY TUYÊT RÂT ĐEP', 'BAN ĐA GIAI ĐƯƠC MÂT MA',
        'BAN THÂN MAI MAI', 'TRONG VƯƠN CO CHU LUN', 'CACAO NONG VƠI KEO DEO', 'SƠ THU MƠ LUC MƯƠI GIƠ',
        'PHÂN THƯƠNG Ơ TRONG KHO', 'NHIN SAU TANG ĐA LƠN', 'LƠP ĐI CHƠI VAO THƯ SAU', 'MANG UNG ĐI MƯA NHE',
        'CAO NHAY QUA HANG RAO', 'TIÊC TRA TRONG VƯƠN', 'BAN LA BÂC THÂY MÂT MA', 'CHO CA ĂN LUC TRƯA',
        'TAU RƠI GA LUC CHIN GIƠ', 'XE ĐAP TÔI MAU XANH LA', 'MEO CON THICH CAI HÔP', 'NHAY VAO ĐÔNG LA NAO',
        'NƯƠC SÔNG RÂT LANH', 'GIOI LĂM ĐIÊP VIÊN NHI', 'THƯ VIÊN CO SACH MƠI', 'SAO SANG LUC ĐÊM',
      ],
      words: 'BA BAN BANH BAU BI BIÊT BONG BÂC BÂU BĂT BÔ BÔN BƠI CA CACAO CAI CANH CAO CHAO CHI CHIA CHIÊC CHIN CHO CHU CHUC CHUNG CHƠI CHƯNG CO COI CON CU CUA CUN CUNG CÂU CÂY CÔNG CƯA DEO DIÊU DƯƠI GA GIAI GIOI GIƠ GIƯƠNG GÂM GÂN GĂP HAI HANG HAT HOA HOP HÔM HÔP KEM KEO KHO KHOA KIÊM KÊU LA LAC LAM LANH LO LUC LUN LĂM LƠN LƠP MA MAI MANG MANH MAU MEO MU MUA MÂT MÔI MÔT MƠ MƠI MƯA MƯNG MƯƠI NAI NAO NAY NGON NHA NHAU NHAY NHE NHI NHIN NHÂT NOI NONG NƯƠC NƯƠNG NĂNG PHAO PHÂN PHƠ QUA QUY RA RAO RE ROBOT RUA RÂT RÔNG RƠI SACH SANG SAO SAU SINH SIÊU SOI SÔI SÔNG SĂN SƠ TA TAM TANG TAU TAY THA THAM THANG THICH THO THU THÂN THÂY THĂNG THƯ THƯƠNG TIM TIÊC TRA TRAI TRON TRONG TRĂNG TRƠI TRƯA TUYÊT TÂT TÔI TƯ UNG VAO VE VIÊN VOI VUI VUNG VƠI VƯƠN XANH XE XICH XIN XÂY ĐA ĐAI ĐAP ĐEN ĐEP ĐI ĐO ĐU ĐUA ĐÂP ĐÂU ĐÊM ĐÊN ĐIÊP ĐÔ ĐÔNG ĐƯƠC ÊCH Ơ ƠI ĂN TĂC BUYT',
    },
  };
  for (const b of Object.values(BANK)) { b.words = new Set(b.words.split(/\s+/)); b.messages = b.messages.map(m => m.normalize('NFC')); b.keys = b.keys.map(k => k.normalize('NFC')); }
  const bank = lang => BANK[lang] || BANK.en;

  // ---------- ciphers (logic only; A = alphabet of the puzzle's language) ----------
  const CIPHERS = {
    caesar: {
      level: 'easy', icon: '🏛️',
      params(rng, A) { let s; do { s = 1 + Math.floor(rng() * (A.n - 1)); } while (s === A.half); return { shift: s }; },
      enc: (p, { shift }, A) => mapLetters(p, x => x + shift, A),
      dec: (c, { shift }, A) => mapLetters(c, x => x - shift, A),
    },
    rot13: {   // half-alphabet rotation: 13 of 26, 16 of 32, 16 of 33, 14 of 29
      level: 'easy', icon: '🔄',
      params: () => ({}),
      enc: (p, _, A) => mapLetters(p, x => x + A.half, A),
      dec: (c, _, A) => mapLetters(c, x => x - A.half, A),
    },
    atbash: {
      level: 'easy', icon: '🪞',
      params: () => ({}),
      enc: (p, _, A) => mapLetters(p, x => A.n - 1 - x, A),
      dec: (c, _, A) => mapLetters(c, x => A.n - 1 - x, A),
    },
    vigenere: {
      level: 'hard', icon: '🔑',
      params(rng, A, B) { return { key: pick(B.keys, rng) }; },
      enc: (p, { key }, A) => { const k = [...key]; return mapLetters(p, (x, i) => x + A.idx(k[i % k.length]), A); },
      dec: (c, { key }, A) => { const k = [...key]; return mapLetters(c, (x, i) => x - A.idx(k[i % k.length]), A); },
    },
    affine: {
      level: 'hard', icon: '✖️',
      params(rng, A) { return { a: pick(A.affineA, rng), b: Math.floor(rng() * A.n) }; },
      enc: (p, { a, b }, A) => mapLetters(p, x => a * x + b, A),
      dec: (c, { a, b }, A) => { const inv = modInverse(a, A.n); return mapLetters(c, x => inv * (x - b), A); },
    },
    beaufort: {
      level: 'hard', icon: '🧭',
      params(rng, A, B) { return { key: pick(B.keys, rng) }; },
      enc: (p, { key }, A) => { const k = [...key]; return mapLetters(p, (x, i) => A.idx(k[i % k.length]) - x, A); },
      dec: (c, { key }, A) => { const k = [...key]; return mapLetters(c, (x, i) => A.idx(k[i % k.length]) - x, A); },
    },
  };

  const LEVELS = {
    easy: ['caesar', 'rot13', 'atbash'],
    hard: ['caesar', 'rot13', 'atbash', 'vigenere', 'affine', 'beaufort'],
  };

  const encrypt = (id, text, params, lang) => CIPHERS[id].enc(text, params || {}, alphabet(lang));
  const decrypt = (id, text, params, lang) => CIPHERS[id].dec(text, params || {}, alphabet(lang));

  /** Letter-by-letter pairs: {p, c, pn, cn, s} where s = (cn − pn) mod n. */
  function letterPairs(plain, cipher, lang) {
    const A = alphabet(lang), out = [];
    const P = [...plain], Cc = [...cipher];
    for (let i = 0; i < P.length; i++) {
      const p = P[i], c = Cc[i];
      if (A.has(p)) out.push({ p, c, pn: A.idx(p), cn: A.idx(c), s: mod(A.idx(c) - A.idx(p), A.n) });
    }
    return out;
  }

  // ---------- texts (registered by strings.js) ----------
  const TEXT = {};
  function textFor(lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!t) throw new Error('Cipher texts not loaded: include strings.js after engine.js');
    return t;
  }
  /** First letter pair of a puzzle, used as the worked example in hints and explanations. */
  const example = puzzle => letterPairs(puzzle.plaintext, puzzle.ciphertext, puzzle.lang)[0];
  /** Hints [gentle, specific] and the explanation for a puzzle, in a language. */
  function puzzleText(puzzle, lang) {
    const t = textFor(lang).ciphers[puzzle.cipher_id], ex = example(puzzle), A = alphabet(puzzle.lang);
    return { hints: t.hints(puzzle.params, ex, A), explanation: t.explain(puzzle.params, ex, A) };
  }
  /** Cipher name (short) and full name for sentences, in a language. */
  const cipherName = (id, lang) => textFor(lang).ciphers[id].name;
  const cipherFull = (id, lang) => textFor(lang).ciphers[id].full || textFor(lang).ciphers[id].name;

  function checkMessage(text, lang) {
    const A = alphabet(lang), B = bank(lang), errors = [];
    const chars = [...text];
    if (!chars.every(ch => ch === ' ' || A.has(ch))) errors.push(`message must contain only letters of the ${A.lang} alphabet and spaces`);
    if (chars.length > 30) errors.push(`message is ${chars.length} characters (max 30)`);
    const words = text.split(' ').filter(Boolean);
    if (words.length < 3 || words.length > 6) errors.push(`message has ${words.length} words (need 3–6)`);
    for (const w of words) if (!B.words.has(w)) errors.push(`word not on the kid-safe list: ${w}`);
    return errors;
  }

  /** Validation that must pass before a puzzle is returned. */
  function validatePuzzle(puzzle, level) {
    const errors = [];
    const c = CIPHERS[puzzle.cipher_id], A = alphabet(puzzle.lang);
    if (!c) errors.push(`unknown cipher: ${puzzle.cipher_id}`);
    if (!LEVELS[level]) errors.push(`unknown level: ${level}`);
    if (!ALPHA[puzzle.lang]) errors.push(`unknown language: ${puzzle.lang}`);
    if (c && LEVELS[level] && !LEVELS[level].includes(puzzle.cipher_id)) errors.push(`${puzzle.cipher_id} is not allowed at level ${level}`);
    if (c) {
      const back = c.dec(puzzle.ciphertext, puzzle.params, A);
      if (back !== puzzle.plaintext) errors.push(`decrypting the ciphertext gives "${back}", not the plaintext`);
      if (puzzle.ciphertext === puzzle.plaintext) errors.push('ciphertext equals plaintext');
      if (puzzle.cipher_id === 'caesar' && (puzzle.params.shift < 1 || puzzle.params.shift > A.n - 1 || puzzle.params.shift === A.half)) errors.push('bad Caesar shift');
      if (puzzle.cipher_id === 'affine' && gcd(puzzle.params.a, A.n) !== 1) errors.push('bad Affine a');
      if (puzzle.params && puzzle.params.key !== undefined) {
        const k = [...puzzle.params.key];
        if (k.length < 3 || k.length > 4 || !k.every(ch => A.has(ch))) errors.push('key must be 3–4 letters of the alphabet');
        if (new Set(k).size < 2) errors.push('key must have at least two different letters');
      }
    }
    errors.push(...checkMessage(puzzle.plaintext, puzzle.lang));
    return { ok: errors.length === 0, errors };
  }

  /**
   * Generate one puzzle for a level. Returns the JSON shape from the spec
   * (plus `lang`, and `hints` = [gentle, specific]; `hint` is the gentle one).
   * opts: { rng, lang, cipher, avoidCipher, avoidMessage, excludeMessages }
   *   lang            — language of the message (alphabet) and of hint/explanation texts (default 'en')
   *   cipher          — force this cipher id (must be allowed for the level)
   *   excludeMessages — Set/array of plaintexts not to use (e.g. already on the worksheet)
   */
  function generatePuzzle(level, opts = {}) {
    const rng = opts.rng || Math.random, lang = ALPHA[opts.lang] ? opts.lang : 'en';
    const A = alphabet(lang), B = bank(lang);
    const allowed = LEVELS[level];
    if (!allowed) throw new Error('Unknown level: ' + level);
    if (opts.cipher && !allowed.includes(opts.cipher)) throw new Error(`${opts.cipher} is not allowed at level ${level}`);
    const excluded = new Set(opts.excludeMessages || []);
    if (opts.avoidMessage) excluded.add(opts.avoidMessage);
    let lastErr = null;
    for (let attempt = 0; attempt < 20; attempt++) {
      let ids = opts.cipher ? [opts.cipher] : allowed.filter(id => id !== opts.avoidCipher);
      if (!ids.length) ids = allowed;
      const cipher_id = pick(ids, rng);
      const cipher = CIPHERS[cipher_id];
      const params = cipher.params(rng, A, B);
      let msgs = B.messages.filter(m => !excluded.has(m));
      if (!msgs.length) msgs = B.messages;
      const plaintext = pick(msgs, rng);
      const ciphertext = cipher.enc(plaintext, params, A);
      const puzzle = { cipher_id, params, plaintext, ciphertext, lang };
      const v = validatePuzzle(puzzle, level);
      if (v.ok) {
        const text = puzzleText(puzzle, lang);
        return { ...puzzle, hint: text.hints[0], hints: text.hints, explanation: text.explanation };
      }
      lastErr = v.errors.join('; ');
    }
    throw new Error('Could not generate a valid puzzle: ' + lastErr);
  }

  /** Friendly reason why the child's guess does not fit this puzzle ('' if nothing simple to say). */
  function whyNot(guess, puzzle, lang) {
    const actual = puzzle.cipher_id;
    if (guess === actual) return '';
    const W = textFor(lang).whyNot, A = alphabet(puzzle.lang);
    const gname = cipherFull(guess, lang);
    const pairs = letterPairs(puzzle.plaintext, puzzle.ciphertext, puzzle.lang);
    const sameShift = pairs.every(x => x.s === pairs[0].s);
    const mirrored = pairs.every(x => x.pn + x.cn === A.n - 1);
    const key = puzzle.params && puzzle.params.key;

    // Special Caesar / ROT mix-ups
    if (guess === 'caesar' && actual === 'rot13') return W.closeRot13(A.half);
    if (guess === 'rot13' && actual === 'caesar') return W.closeCaesar(puzzle.params.shift, A.half);

    // Guessed a same-shift cipher, but the steps differ
    if (guess === 'caesar' || guess === 'rot13') {
      const d = pairs.find(x => x.s !== pairs[0].s);
      if (d) return W.stepsDiffer(gname, pairs[0], d);
    }
    // Guessed Atbash, but some letter does not mirror
    if (guess === 'atbash') {
      const d = pairs.find(x => x.pn + x.cn !== A.n - 1);
      if (d) return W.notMirror(d.p, A.at(A.n - 1 - d.pn), d.c);
    }
    // Guessed a "same letter → same code letter" cipher, but a letter changed its code
    if (guess === 'affine' || guess === 'atbash' || guess === 'caesar' || guess === 'rot13') {
      const seen = new Map();
      for (const x of pairs) {
        if (seen.has(x.p) && seen.get(x.p) !== x.c) return W.sameLetterDiff(gname, x.p, seen.get(x.p), x.c);
        seen.set(x.p, x.c);
      }
    }
    // Guessed Affine / a key-word cipher, but the answer was a simpler pattern
    if (sameShift && (actual === 'caesar' || actual === 'rot13')) return W.sameShift(gname, pairs[0].s, guess === 'affine');
    if (mirrored && actual === 'atbash') return W.mirrored(gname);
    if ((guess === 'vigenere' || guess === 'beaufort') && actual === 'affine') return W.monoClue;
    if (guess === 'beaufort' && actual === 'vigenere' && key) return W.cycle([...key].length, [...key].map(A.idx).join(', '));
    if (guess === 'vigenere' && actual === 'beaufort' && key) {
      const n = [...key].length;
      const d = pairs.find((x, i) => i >= n && x.s !== pairs[i - n].s);
      if (d) return W.noCycle;
    }
    if (key) return W.keyFallback(gname, key);
    return '';
  }

  /** Seedable PRNG (cyrb-style string hash -> mulberry32), same construction as the math worksheet app. */
  function makePRNG(seed) {
    const str = String(seed);
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    const rnd = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; };
    return { rnd, shuffle };
  }

  /**
   * A printable worksheet: `count` distinct cases for `level` in `lang`, reproducible from `seed`.
   * The same seed + level + language gives the same sequence of cases, so a longer worksheet
   * starts with the same cases as a shorter one. Ciphers are dealt evenly (shuffled rounds),
   * and no message repeats.
   */
  function generateWorksheet(seed, level, count, lang) {
    const allowed = LEVELS[level];
    if (!allowed) throw new Error('Unknown level: ' + level);
    lang = ALPHA[lang] ? lang : 'en';
    count = Math.max(1, Math.min(bank(lang).messages.length, Math.floor(count) || 1));
    const prng = makePRNG(String(seed) + '|' + level + '|' + lang);
    const used = new Set(), cases = [];
    let bag = [], last = null;
    for (let i = 0; i < count; i++) {
      if (!bag.length) {
        bag = prng.shuffle(allowed.slice());
        if (bag.length > 1 && bag[0] === last) bag.push(bag.shift());   // no cipher twice in a row
      }
      const cipher = bag.shift();
      const p = generatePuzzle(level, { rng: prng.rnd, cipher, excludeMessages: used, lang });
      used.add(p.plaintext); last = cipher;
      cases.push(p);
    }
    return { seed: String(seed), level, count, lang, cases };
  }

  return { CIPHERS, LEVELS, ALPHABETS, BANK, TEXT, alphabet, bank, textFor, encrypt, decrypt, letterPairs, example,
           puzzleText, cipherName, cipherFull, generatePuzzle, validatePuzzle, checkMessage, whyNot, makePRNG, generateWorksheet, mod, modInverse };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ENGINE;
