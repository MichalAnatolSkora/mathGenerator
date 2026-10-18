/**
 * Texts of "Secret telegrams 1920" in seven languages (pl, en, uk, vi, fr, it, es). Classic script; defines the
 * global `W20_TEXT`. The kit (../sheet-kit/kit.js) adds the shared ones (seed, options, print…).
 * `gloss` gives the meaning of every word of W20.VOCAB; `heads`, `tr`, `a1`, `a2` follow the telegram ids of W20.SLOTS.
 */
const W20_TEXT = {
  pl: {
    title: "Tajne depesze 1920",
    appTitle: "📻 Cud nad Wisłą — Tajne depesze 1920",
    appSub: 'Sierpień 1920, Armia Czerwona pod Warszawą. Odczytaj przechwycone depesze tak jak polski radiowywiad, doradź Naczelnemu Wodzowi, gdzie uderzyć, i poznaj historię Cudu nad Wisłą. Karta do druku z rozwiązaniami.',
    level: 'Poziom', levels: { easy: '★ Klucz prawie gotowy', mid: '★★ Pół klucza', hard: '★★★ Jak Kowalewski', expert: '★★★★ Bez przerw, jak prawdziwa depesza' },
    optStory: 'Strona z historią Cudu nad Wisłą',
    mission: {
      sub: 'Jesteś w polskim radiowywiadzie. Sierpień 1920 roku.',
      intro: 'Armia Czerwona stoi pod Warszawą. Jej dowódcy wysyłają rozkazy przez radio, a polskie radiostacje wszystko podsłuchują. Depesze są zaszyfrowane: każda litera rosyjskiego alfabetu zamieniła się w liczbę. Wszystkie trzy depesze mają ten sam klucz.',
      hintTitle: 'Sztuczka porucznika Kowalewskiego',
      hint: 'Słowo ДИВИЗИЯ (dywizja) ma tę samą literę И na miejscach 2, 4 i 6. W depeszy 1 znajdź słowo z 7 liczb, w którym liczby na miejscach 2, 4 i 6 są takie same, i wpisz jego litery do klucza.',
      easyNext: 'Klucz ma już prawie wszystkie litery — brakuje tylko liter słowa ДИВИЗИЯ. Uzupełnij go i odczytaj depesze: pod każdą liczbą wpisz jej literę.',
      midNext: "Połowa klucza jest już wpisana. Uzupełnij litery ДИВИЗИЯ, wpisz znane litery pod liczbami, a brakujące słowa odgadnij ze słowniczka — każdą nową literę dopisz do klucza.",
      hardNext: 'Potem zgaduj dalej jak prawdziwy kryptolog: weź słowo, w którym znasz już kilka liter, i znajdź w słowniczku słowo tej samej długości, które pasuje. Każdą nową literę wpisz do klucza — przyda się w innych słowach.',
      expertHint: "Prawdziwe depesze nie miały przerw między słowami: liczby szły w grupach po pięć, a słowo może zacząć się w środku grupy. Szukaj 7 liczb pod rząd, w których liczby nr 2, 4 i 6 są takie same — to może być ДИВИЗИЯ. Uwaga: taki wzór może pasować w dwóch miejscach; sprawdź, które daje sensowne słowa.",
      expertNext: "Potem szukaj w ciągu liczb słów ze słowniczka, które pasują do znanych liter, i zaznacz kreską, gdzie kończy się każde słowo. Każdą nową literę wpisz do klucza.",
      keyTitle: 'Klucz dnia', keyNote: 'liczba → litera',
      glossTitle: 'Słowniczek rosyjsko-polski',
      tg: n => `Depesza ${n}`,
    },
    heads: [
      'od: dowództwo 4 Armii · do: dowództwo Frontu Zachodniego · przechwycono 13 VIII 1920',
      { budyonny: 'od: 1 Armia Konna · do: dowództwo frontu · przechwycono 14 VIII 1920', mozyr: 'od: Grupa Mozyrska · do: dowództwo frontu · przechwycono 14 VIII 1920' },
      'od: dowódca Frontu Zachodniego · do: 4 Armia · przechwycono 15 VIII 1920',
    ],
    report: {
      title: 'Meldunek dla Naczelnego Wodza',
      q: [
        'Dokąd idzie 4 Armia? (depesza 1)',
        'Co ważnego mówi depesza 2?',
        'Gdzie Wojsko Polskie powinno uderzyć? Zakreśl na mapie strzałkę A, B albo C.',
        'Depesza 3 to rozkaz dla 4 Armii. Jak polscy radiotelegrafiści mogą sprawić, żeby 4 Armia go nie usłyszała?',
      ],
    },
    map: {
      cities: { warsaw: 'Warszawa', plock: 'Płock', wloclawek: 'Włocławek', torun: 'Toruń', ciechanow: 'Ciechanów', deblin: 'Dęblin', lublin: 'Lublin', lwow: 'Lwów', krakow: 'Kraków', brest: 'Brześć', bialystok: 'Białystok', przemysl: 'Przemyśl' },
      rivers: { vistula: 'Wisła', wieprz: 'Wieprz', bug: 'Bug', narew: 'Narew', wkra: 'Wkra', san: 'San' },
      prussia: 'Prusy Wschodnie (Niemcy)', berlin: 'do Berlina ok. 520 km', poland: 'POLSKA', pl5: '5 Armia',
      units: { army4: '4 Armia', main: 'główne siły', mozyr: 'Grupa Mozyrska', cav: '1 Armia Konna' },
      red: 'Armia Czerwona', strike: '16 VIII: uderzenie', jam: 'zagłuszanie radia',
    },
    gloss: {
      'АРМИИ': 'armii', 'АРМИЯ': 'armia', 'БУДЕННЫЙ': 'Budionny — dowódca 1 Armii Konnej',
      'ВИСЛЕ': 'Wiśle (К ВИСЛЕ = nad Wisłę)', 'ВЛОЦЛАВЕК': 'Włocławek', 'ГРУППЫ': 'grupy',
      'ДИВИЗИЯ': 'dywizja (duży oddział wojska)', 'ИДЕТ': 'idzie', 'К': 'do, w stronę', 'КОННАЯ': 'konna',
      'ЛЬВОВА': 'Lwowa (У ЛЬВОВА = pod Lwowem)', 'МАЛО': 'mało', 'МОЗЫРСКОЙ': 'mozyrskiej', 'НА': 'na',
      'ПЛОЦК': 'Płock', 'ПОВЕРНУТЬ': 'skręcić, zawrócić', 'СИЛ': 'sił (wojska)', 'СТОИТ': 'stoi',
      'ТУХАЧЕВСКИЙ': 'Tuchaczewski — dowódca Frontu Zachodniego', 'У': 'u, przy, pod', 'ЧЕТВЕРТОЙ': 'czwartej',
      'ШУВАЕВ': 'Szuwajew — dowódca 4 Armii', 'ЮГ': 'południe',
    },
    answers: {
      keyTitle: 'Cały klucz dnia',
      pattern: n => `ДИВИЗИЯ to w depeszy 1 słowo nr ${n}.`,
      tr: {
        plock: 'Dywizja idzie na Płock. — Szuwajew', wloclawek: 'Dywizja konna idzie na Włocławek. — Szuwajew',
        vistula: 'Dywizja idzie nad Wisłę. — Szuwajew', budyonny: 'Armia Konna stoi pod Lwowem. — Budionny',
        mozyr: 'Grupa Mozyrska ma mało wojska.', turn: 'Czwarta Armia ma skręcić na południe. — Tuchaczewski',
      },
      a1: {
        plock: 'Na zachód, na Płock — daleko od Warszawy.', wloclawek: 'Na zachód, na Włocławek — daleko od Warszawy.',
        vistula: 'Na zachód, nad Wisłę koło Płocka i Włocławka — daleko od Warszawy.',
      },
      a2: {
        budyonny: 'Konnica Budionnego jest daleko, pod Lwowem — nie pomoże pod Warszawą. Na południe od Warszawy wróg jest słaby.',
        mozyr: 'Grupa Mozyrska, na południe od Warszawy, ma mało wojska — tam jest słabe miejsce wroga.',
      },
      a3: 'A — znad Wieprza na północ, w słabe miejsce wroga. Tak zrobił Józef Piłsudski 16 sierpnia 1920 roku.',
      a4: 'Zagłuszyć rozkaz: nadawać na tej samej fali. Polska radiostacja w Warszawie przez blisko dwie doby bez przerwy nadawała fragmenty Pisma Świętego i rozkaz nie dotarł.',
    },
    abc: {"title": "Alfabet rosyjski", "sounds": "a b w g d je jo ż z i j k l m n o p r s t u f ch c cz sz szcz – y – e ju ja", "note": "Tak czyta się litery. Ъ i Ь nie mają własnego dźwięku (znak twardy i miękki). Л czyta się jak polskie ł albo l. W depeszach zamiast Ё pisano Е."},
    optHow: "Strona „Jak działa szyfr?”",
    how: {
      "title": "Jak działa szyfr z depesz?",
      "sub": "Przeczytaj, zanim zaczniesz łamać depesze",
      "s1": [
        "1. Szyfr to zamiana liter na liczby",
        "Szyfrant miał tajną tabelkę — klucz. Przy każdej literze rosyjskiego alfabetu stała w niej liczba. Pisał wiadomość, zamieniał każdą literę na jej liczbę, a radiotelegrafista nadawał przez radio same liczby, alfabetem Morse’a. Kto nie ma klucza, słyszy tylko liczby."
      ],
      "keyPiece": "Kawałek klucza",
      "plain": "słowo",
      "cipher": "w depeszy",
      "s2": [
        "2. Odbiorca z kluczem",
        "Dowódca, który ma ten sam klucz, robi to samo na odwrót: przy każdej liczbie szuka litery. 47 → Д, 35 → И, 58 → В… i czyta: ДИВИЗИЯ (dywizja)."
      ],
      "s3": [
        "3. Słaby punkt: ta sama litera = ta sama liczba",
        "Litera И jest w słowie ДИВИЗИЯ trzy razy, więc liczba 35 też pojawia się trzy razy — na miejscach 2, 4 i 6. Taki „odcisk palca” słowa zostaje w depeszy, nawet gdy nie znamy klucza. Wystarczy go wypatrzyć."
      ],
      "s4t": "4. Jak złamać szyfr bez klucza",
      "steps": [
        "Zgadnij słowo, które na pewno jest w depeszy wojskowej: dywizja, armia, nazwisko dowódcy.",
        "Znajdź w depeszy liczby z takim samym odciskiem palca jak to słowo.",
        "Wpisz odkryte litery do klucza — teraz znasz już kilka liczb.",
        "Wpisz te litery wszędzie, gdzie stoją te same liczby. Z kawałków odgadniesz kolejne słowa (pomoże słowniczek).",
        "Powtarzaj, aż przeczytasz całą depeszę. Tak pracowali Jan Kowalewski i matematycy w 1920 roku."
      ],
      "s5": [
        "5. Prawdziwe szyfry z 1920 roku",
        "Bywały trudniejsze niż nasz: klucze często zmieniano, a 12 sierpnia 1920 roku bolszewicy wprowadzili nowy szyfr o nazwie „Rewolucja”. Ale szyfranci popełniali błędy — powtarzali te same słowa i podpisy — a polscy kryptolodzy łamali nawet nowe klucze w kilka godzin."
      ],
      "s6": [
        "6. A dziś?",
        "Wiadomości w telefonie też są szyfrowane. Komputery używają jednak kluczy tak trudnych, że nie da się ich odgadnąć po odciskach palców słów. Pomysł zostaje ten sam: bez klucza widać tylko liczby."
      ],
      "warmT": "Rozgrzewka",
      "w1": "Rozszyfruj kawałkiem klucza z ramki: 37 82 66 35 91 = ? Co to znaczy? (zajrzyj do słowniczka)",
      "w2": "Słowo МАМА (mama) ktoś zaszyfrował innym kluczem. Który zapis pasuje? Zakreśl.",
      "w2opts": [
        "12 40 12 40",
        "12 40 33 40",
        "12 12 40 40"
      ],
      "a1": "АРМИЯ — armia.",
      "a2": "12 40 12 40: М i А się powtarzają, tak jak 12 i 40.",
      "levelsT": "Poziomy karty",
      "levels": [
        "★ — klucz jest prawie pełny, brakuje tylko liter słowa ДИВИЗИЯ.",
        "★★ — połowa klucza jest gotowa: zaczynasz od ДИВИЗИЯ, a resztę słów odgadujesz ze słowniczka.",
        "★★★ — klucz jest pusty: zaczynasz od ДИВИЗИЯ i zgadujesz dalej ze słowniczkiem.",
        "★★★★ — jak prawdziwa depesza: bez przerw między słowami, liczby w grupach po pięć."
      ]
    },
    optReal: "Ciekawostka: prawdziwa depesza z 1920 roku",
    real: {
      "photoTitle": "Zdjęcie oryginału: „Tłumaczenie szyfrogramu”, Biuro Szyfrów, Warszawa, 25 lipca 1920 roku",
      "photoCap": "Na dole po prawej odręczny podpis porucznika Jana Kowalewskiego, naczelnika Wydziału 2. Niebieski ołówek („do 5”) to dopisek kogoś, kto czytał depeszę w sztabie. Na następnej stronie tekst przepisany i wyjaśniony.",
      "title": "Ciekawostka: prawdziwa depesza z 1920 roku",
      "sub": "Przechwycona 24 lipca, odczytana 25 lipca — z podpisem porucznika Kowalewskiego",
      "intro": "Tak naprawdę wyglądała praca Biura Szyfrów. 24 lipca 1920 roku bolszewicki szyfrant Wanin zaszyfrował rozkaz dowództwa Frontu Południowo-Zachodniego. Polscy nasłuchowcy przechwycili go tego samego dnia, a następnego dnia gotowe było polskie tłumaczenie, podpisane przez Jana Kowalewskiego. Ten dokument przetrwał w archiwum w Nowym Jorku. Przepisaliśmy go z pisownią z 1920 roku:",
      "translTitle": "Co mówi rozkaz — po dzisiejszemu",
      "transl": "Rozkaz dla armii Frontu Południowo-Zachodniego (początek nie dotarł). Punkt 2: wojska — z całego rozkazu wynika, że chodzi o 1 Armię Konną Budionnego — mają iść w rejon Lwowa i Rawy Ruskiej i wysłać przednie oddziały, żeby zająć przeprawy przez San koło Sieniawy i Przemyśla. Punkt 3: 14 Armia ma przełamać obronę nad rzeką Zbrucz i uderzyć całą siłą w stronę Tarnopola, Przemyśla i Gródka. Punkt 4: granice między armiami, np. 12 Armii i Frontu Zachodniego: Dąbrowica–Ratno–Włodawa–Puławy (koniec nie dotarł).",
      "notesTitle": "Słowniczek dokumentu",
      "notes": [
        [
          "(przerwa), (początku brak)",
          "tych kawałków nasłuchowcy nie usłyszeli — radio trzeszczało albo stacja przestała nadawać"
        ],
        [
          "armja, linja",
          "tak pisano w 1920 roku; dziś piszemy: armia, linia"
        ],
        [
          "D-ców",
          "dowódców"
        ],
        [
          "I-j konnej",
          "1 Armii Konnej Budionnego"
        ],
        [
          "Nowa Aleksandrja",
          "dawna nazwa Puław"
        ],
        [
          "Zaszyfrował WANIN",
          "bolszewicki szyfrant, który zaszyfrował rozkaz"
        ],
        [
          "STALIN",
          "Józef Stalin — później przez prawie 30 lat dyktator Związku Sowieckiego"
        ],
        [
          "Sz. № 31724",
          "numer depeszy w Biurze Szyfrów — było ich tysiące"
        ]
      ],
      "whyTitle": "Dlaczego ta depesza była ważna",
      "why": "Rozkaz mówi, że konnica Budionnego ma iść na Lwów i nad San — na południowy zachód, a nie na północ, pod Warszawę. Z takich depesz Piłsudski wiedział, że konnica nie zdąży pomóc pod Warszawą, i mógł zaplanować uderzenie znad Wieprza. Twoja depesza 2 („КОННАЯ АРМИЯ СТОИТ У ЛЬВОВА”) jest uproszczoną wersją tej samej wiadomości.",
      "tasksTitle": "Zadania",
      "tasks": [
        "Ile dni minęło od przechwycenia depeszy do jej odczytania?",
        "Kto podpisał rozkaz? Znajdź trzy nazwiska dowódców.",
        "Na mapie znajdź Lwów. W którą stronę miała iść 1 Armia Konna: na Warszawę czy na Lwów?"
      ],
      "answers": [
        "Jeden dzień: przechwycono 24 VII, odczytano 25 VII.",
        "Jegorow, Stalin i Pietin (zgodność sprawdził Krauklis, zaszyfrował Wanin).",
        "Na Lwów i nad San — daleko od Warszawy."
      ],
      "sourceLabel": "Źródło:"
    },
    story: {
      title: 'Cud nad Wisłą i tajne depesze',
      sub: 'Prawdziwa historia z sierpnia 1920 roku',
      sections: [
        ['Rok 1920', 'Polska od niedawna, od 1918 roku, znów jest wolna — po 123 latach niewoli. Ze wschodu nadciąga Armia Czerwona bolszewickiej Rosji. Jej dowódca Michaił Tuchaczewski zakończył rozkaz słowami „Na Zachód!”. Bolszewicy chcieli przejść przez Polskę do Niemiec i dalej, i wszędzie wywołać swoją rewolucję. W sierpniu stanęli pod Warszawą.'],
        ['Uszy Wojska Polskiego', 'Dowódcy wysyłali rozkazy przez radio, a fale radiowe może usłyszeć każdy. Dlatego depesze szyfrowano. Polskie radiostacje zapisywały wszystko, a porucznik Jan Kowalewski razem z matematykami Wacławem Sierpińskim, Stefanem Mazurkiewiczem i Stanisławem Leśniewskim łamał szyfry. Według legendy Kowalewski zastępował kolegę na dyżurze, z nudów zaczął szukać klucza i pierwszą literę, И, znalazł w słowie ДИВИЗИЯ. Polacy złamali około stu szyfrów; w samym sierpniu 1920 roku odczytali 410 depesz, zwykle tego samego albo następnego dnia.'],
        ['Plan Piłsudskiego', 'Z depesz było wiadomo, że 4 Armia idzie daleko na zachód, nad Wisłę koło Płocka i Włocławka, a konnica Budionnego walczy daleko, pod Lwowem. Na południe od Warszawy, nad Wieprzem, czerwoni mieli mało wojska. Józef Piłsudski zebrał tam oddziały i 16 sierpnia uderzył znad Wieprza na północ, w słabe miejsce. Armia Czerwona musiała się wycofać.'],
        ['Zagłuszone radio', 'W nocy z 14 na 15 sierpnia polscy ułani wpadli do Ciechanowa i zniszczyli radiostację 4 Armii. Ostatnia radiostacja tej armii nadawała na fali, którą Polacy znali. Kiedy Tuchaczewski kazał 4 Armii zawrócić na południe, polska radiostacja w Warszawie nadawała na tej samej fali, bez przerwy przez blisko dwie doby… fragmenty Pisma Świętego, alfabetem Morse’a. Rozkaz nie dotarł i 4 Armia maszerowała dalej w złą stronę.'],
        ['Dlaczego „cud”?', 'Bitwa Warszawska trwała od 12 do 25 sierpnia 1920 roku. Przełom przyszedł około 15 sierpnia, w święto Matki Boskiej Wniebowziętej, dlatego publicysta Stanisław Stroński nazwał zwycięstwo „cudem nad Wisłą”. Ale pomogły też odwaga żołnierzy i ochotników, ukraińscy sojusznicy Symona Petlury, dobry plan — i matematyka. 15 sierpnia to dziś Święto Wojska Polskiego.'],
      ],
      west: ['Dlaczego to było ważne dla całego Zachodu', 'Gdyby Warszawa upadła, Armia Czerwona stanęłaby na granicy Niemiec, zmęczonych po I wojnie światowej, gdzie bolszewicy liczyli na rewolucję — a stamtąd już blisko do Francji i reszty Europy Zachodniej. Zwycięstwo zatrzymało ten marsz: Polska obroniła wolność, a rewolucja nie dotarła dalej na zachód. Brytyjski dyplomata lord D’Abernon, który w 1920 roku był w Warszawie, nazwał tę bitwę osiemnastą decydującą bitwą w dziejach świata — jedną z tych, które zmieniły historię.'],
      next: ['Co było dalej', 'Biuro Szyfrów pracowało dalej. W 1932 roku młodzi matematycy z tego biura — Marian Rejewski, Jerzy Różycki i Henryk Zygalski — złamali niemiecką Enigmę, a w lipcu 1939 roku przekazali tę wiedzę Brytyjczykom i Francuzom. Znowu pomogli całemu Zachodowi.'],
      simpl: 'Nasze depesze są krótkie i ułożone przez nas na podstawie tego, co Polacy naprawdę wyczytali z depesz. Prawdziwe szyfry Armii Czerwonej były różne i zwykle trudniejsze, a w depeszach nie było przerw między słowami.',
      mapTitle: 'Bitwa Warszawska, około 15–16 sierpnia 1920',
    },
  },

  en: {
    title: "Secret telegrams of 1920",
    appTitle: "📻 The Miracle on the Vistula — Secret telegrams of 1920",
    appSub: 'August 1920, the Red Army outside Warsaw. Read intercepted telegrams the way Polish radio intelligence did, advise the Commander-in-Chief where to strike, and discover the story of the Miracle on the Vistula. A printable sheet with answers.',
    level: 'Level', levels: { easy: '★ Key almost ready', mid: '★★ Half the key', hard: '★★★ Like Kowalewski', expert: '★★★★ No gaps, like a real telegram' },
    optStory: 'Page with the story of the Miracle on the Vistula',
    mission: {
      sub: 'You work in Polish radio intelligence. August 1920.',
      intro: 'The Red Army stands outside Warsaw. Its commanders send orders by radio, and Polish radio stations listen to everything. The telegrams are in cipher: every letter of the Russian alphabet has become a number. All three telegrams use the same key.',
      hintTitle: 'Lieutenant Kowalewski’s trick',
      hint: 'The word ДИВИЗИЯ (division) has the same letter И in places 2, 4 and 6. In telegram 1 find a word of 7 numbers whose numbers in places 2, 4 and 6 are the same, and write its letters into the key.',
      easyNext: 'The key already has almost every letter — only the letters of ДИВИЗИЯ are missing. Fill them in and read the telegrams: under every number write its letter.',
      midNext: "Half of the key is already filled in. Add the letters of ДИВИЗИЯ, write the known letters under the numbers, and guess the missing words from the glossary — add every new letter to the key.",
      hardNext: 'Then keep guessing like a real codebreaker: take a word where you already know a few letters and find a word of the same length in the glossary that fits. Write every new letter into the key — it will help in other words.',
      expertHint: "Real telegrams had no gaps between words: the numbers came in groups of five, and a word can start in the middle of a group. Look for 7 numbers in a row whose 2nd, 4th and 6th numbers are the same — that may be ДИВИЗИЯ. Careful: the pattern can fit in two places; check which one gives words that make sense.",
      expertNext: "Then look in the row of numbers for glossary words that fit the letters you know, and draw a line where each word ends. Write every new letter into the key.",
      keyTitle: 'The day’s key', keyNote: 'number → letter',
      glossTitle: 'Russian–English glossary',
      tg: n => `Telegram ${n}`,
    },
    heads: [
      'from: 4th Army HQ · to: Western Front HQ · intercepted 13 Aug 1920',
      { budyonny: 'from: 1st Cavalry Army · to: Front HQ · intercepted 14 Aug 1920', mozyr: 'from: Mozyr Group · to: Front HQ · intercepted 14 Aug 1920' },
      'from: Western Front commander · to: 4th Army · intercepted 15 Aug 1920',
    ],
    report: {
      title: 'Report for the Commander-in-Chief',
      q: [
        'Where is the 4th Army going? (telegram 1)',
        'What important news is in telegram 2?',
        'Where should the Polish Army strike? Circle arrow A, B or C on the map.',
        'Telegram 3 is an order for the 4th Army. How can Polish radio operators make sure the 4th Army does not hear it?',
      ],
    },
    map: {
      cities: { warsaw: 'Warsaw', plock: 'Płock', wloclawek: 'Włocławek', torun: 'Toruń', ciechanow: 'Ciechanów', deblin: 'Dęblin', lublin: 'Lublin', lwow: 'Lwów (Lviv)', krakow: 'Kraków', brest: 'Brest', bialystok: 'Białystok', przemysl: 'Przemyśl' },
      rivers: { vistula: 'Vistula', wieprz: 'Wieprz', bug: 'Bug', narew: 'Narew', wkra: 'Wkra', san: 'San' },
      prussia: 'East Prussia (Germany)', berlin: 'to Berlin ~520 km', poland: 'POLAND', pl5: '5th Army',
      units: { army4: '4th Army', main: 'main forces', mozyr: 'Mozyr Group', cav: '1st Cavalry Army' },
      red: 'Red Army', strike: '16 Aug: the strike', jam: 'radio jamming',
    },
    gloss: {
      'АРМИИ': 'to the army', 'АРМИЯ': 'army', 'БУДЕННЫЙ': 'Budyonny — commander of the 1st Cavalry Army',
      'ВИСЛЕ': 'Vistula (К ВИСЛЕ = to the Vistula)', 'ВЛОЦЛАВЕК': 'Włocławek', 'ГРУППЫ': 'group’s',
      'ДИВИЗИЯ': 'division (a large army unit)', 'ИДЕТ': 'is going', 'К': 'to, towards', 'КОННАЯ': 'cavalry (on horses)',
      'ЛЬВОВА': 'Lwów (У ЛЬВОВА = near Lwów)', 'МАЛО': 'few, little', 'МОЗЫРСКОЙ': 'Mozyr (name of the group)', 'НА': 'on, to',
      'ПЛОЦК': 'Płock', 'ПОВЕРНУТЬ': 'to turn', 'СИЛ': 'forces (soldiers)', 'СТОИТ': 'stands, is',
      'ТУХАЧЕВСКИЙ': 'Tukhachevsky — commander of the Western Front', 'У': 'at, near; У … = … has', 'ЧЕТВЕРТОЙ': 'fourth',
      'ШУВАЕВ': 'Shuvayev — commander of the 4th Army', 'ЮГ': 'south',
    },
    answers: {
      keyTitle: 'The whole key of the day',
      pattern: n => `ДИВИЗИЯ is word no. ${n} of telegram 1.`,
      tr: {
        plock: 'The division is going to Płock. — Shuvayev', wloclawek: 'The cavalry division is going to Włocławek. — Shuvayev',
        vistula: 'The division is going to the Vistula. — Shuvayev', budyonny: 'The Cavalry Army stands near Lwów. — Budyonny',
        mozyr: 'The Mozyr Group has few soldiers.', turn: 'The Fourth Army is to turn south. — Tukhachevsky',
      },
      a1: {
        plock: 'West, to Płock — far away from Warsaw.', wloclawek: 'West, to Włocławek — far away from Warsaw.',
        vistula: 'West, to the Vistula near Płock and Włocławek — far away from Warsaw.',
      },
      a2: {
        budyonny: 'Budyonny’s cavalry is far away, near Lwów — it cannot help at Warsaw. South of Warsaw the enemy is weak.',
        mozyr: 'The Mozyr Group, south of Warsaw, has few soldiers — that is the enemy’s weak spot.',
      },
      a3: 'A — from the Wieprz river northwards, into the enemy’s weak spot. That is what Józef Piłsudski did on 16 August 1920.',
      a4: 'Jam the order: broadcast on the same wavelength. A Polish radio station in Warsaw broadcast passages from the Bible non-stop for almost two days, and the order never arrived.',
    },
    abc: {"title": "The Russian alphabet", "sounds": "a b v g d ye yo zh z i y k l m n o p r s t u f kh ts ch sh shch – y – e yu ya", "note": "How the letters sound. Ъ and Ь have no sound of their own (the hard and soft signs). Ы is a deep “i”. Telegrams wrote Е instead of Ё."},
    optHow: "“How does the cipher work?” page",
    how: {
      "title": "How does the telegram cipher work?",
      "sub": "Read this before you start breaking the telegrams",
      "s1": [
        "1. A cipher swaps letters for numbers",
        "The cipher clerk had a secret table — the key. Next to every letter of the Russian alphabet it had a number. He wrote the message, swapped every letter for its number, and the radio operator sent only the numbers, in Morse code. Without the key you hear nothing but numbers."
      ],
      "keyPiece": "A piece of the key",
      "plain": "word",
      "cipher": "in the telegram",
      "s2": [
        "2. The receiver with the key",
        "A commander with the same key does the same thing backwards: for every number he looks up the letter. 47 → Д, 35 → И, 58 → В… and reads: ДИВИЗИЯ (division)."
      ],
      "s3": [
        "3. The weak spot: same letter = same number",
        "The letter И is in ДИВИЗИЯ three times, so the number 35 also shows up three times — in places 2, 4 and 6. This “fingerprint” of the word stays in the telegram even when you do not know the key. You only have to spot it."
      ],
      "s4t": "4. How to break the cipher without the key",
      "steps": [
        "Guess a word that is surely in a military telegram: division, army, a commander’s name.",
        "Find numbers in the telegram with the same fingerprint as that word.",
        "Write the letters you found into the key — now you know some numbers.",
        "Write those letters everywhere the same numbers stand. From the pieces you will guess more words (the glossary helps).",
        "Repeat until you can read the whole telegram. That is how Jan Kowalewski and the mathematicians worked in 1920."
      ],
      "s5": [
        "5. The real ciphers of 1920",
        "They were often harder than ours: keys were changed often, and on 12 August 1920 the Bolsheviks brought in a new cipher called “Revolution”. But cipher clerks made mistakes — they repeated the same words and signatures — and Polish codebreakers broke even new keys within hours."
      ],
      "s6": [
        "6. And today?",
        "Messages on your phone are encrypted too. But computers use keys so hard that nobody can guess them from the fingerprints of words. The idea stays the same: without the key you only see numbers."
      ],
      "warmT": "Warm-up",
      "w1": "Decipher with the piece of the key in the box: 37 82 66 35 91 = ? What does it mean? (look in the glossary)",
      "w2": "Someone enciphered the word МАМА (mum) with a different key. Which one fits? Circle it.",
      "w2opts": [
        "12 40 12 40",
        "12 40 33 40",
        "12 12 40 40"
      ],
      "a1": "АРМИЯ — army.",
      "a2": "12 40 12 40: М and А repeat, just like 12 and 40.",
      "levelsT": "Levels of the sheet",
      "levels": [
        "★ — the key is almost full; only the letters of ДИВИЗИЯ are missing.",
        "★★ — half the key is ready: you start from ДИВИЗИЯ and guess the other words from the glossary.",
        "★★★ — the key is empty: you start from ДИВИЗИЯ and keep guessing with the glossary.",
        "★★★★ — like a real telegram: no gaps between words, numbers in groups of five."
      ]
    },
    optReal: "Fun fact: a real telegram from 1920",
    real: {
      "photoTitle": "Photo of the original: “Translation of a cipher telegram”, Cipher Bureau, Warsaw, 25 July 1920",
      "photoCap": "Bottom right: the handwritten signature of Lieutenant Jan Kowalewski, head of Section 2. The blue pencil (“do 5” — “to 5”) was added by someone who read the telegram at headquarters. The next page has the text copied out and explained.",
      "title": "Fun fact: a real telegram from 1920",
      "sub": "Intercepted on 24 July, read on 25 July — signed by Lieutenant Kowalewski",
      "intro": "This is what the Cipher Bureau’s work really looked like. On 24 July 1920 the Bolshevik cipher clerk Vanin enciphered an order of the South-Western Front command. Polish listeners intercepted it the same day, and the next day the Polish translation was ready, signed by Jan Kowalewski. The document survives in an archive in New York. Here it is, copied in the Polish spelling of 1920:",
      "translTitle": "What the order says, in English",
      "transl": "Order to the armies of the South-Western Front (the beginning was not received). Point 2: troops — from the whole order it is clear this means Budyonny’s 1st Cavalry Army — are to go to the area of Lwów and Rawa Ruska and send their forward units to seize the crossings over the San river near Sieniawa and Przemyśl. Point 3: the 14th Army is to break the enemy’s defence on the Zbruch river and strike with all its force towards Tarnopol, Przemyśl and Gródek. Point 4: borders between the armies, e.g. the 12th Army and the Western Front: Dąbrowica–Ratno–Włodawa–Puławy (the end was not received).",
      "notesTitle": "Glossary of the document",
      "notes": [
        [
          "(przerwa), (początku brak)",
          "“(gap)”, “(beginning missing)”: the listeners did not hear these parts — the radio crackled or the station stopped"
        ],
        [
          "armja, linja",
          "the 1920 spelling; today Poles write armia, linia (army, line)"
        ],
        [
          "D-ców",
          "to the commanders"
        ],
        [
          "I-j konnej",
          "of the 1st Cavalry Army (Budyonny’s)"
        ],
        [
          "Nowa Aleksandrja",
          "the old name of the town of Puławy"
        ],
        [
          "Zaszyfrował WANIN",
          "“enciphered by Vanin”, the Bolshevik cipher clerk"
        ],
        [
          "STALIN",
          "Joseph Stalin — later the dictator of the Soviet Union for almost 30 years"
        ],
        [
          "Sz. № 31724",
          "the telegram’s number in the Cipher Bureau — there were thousands"
        ]
      ],
      "whyTitle": "Why this telegram mattered",
      "why": "The order says that Budyonny’s cavalry is to go to Lwów and the San — south-west, not north to Warsaw. From telegrams like this Piłsudski knew the cavalry would not reach Warsaw in time to help, and he could plan the strike from the Wieprz. Your telegram 2 (“КОННАЯ АРМИЯ СТОИТ У ЛЬВОВА”) is a simplified version of the same news.",
      "tasksTitle": "Tasks",
      "tasks": [
        "How many days passed between intercepting the telegram and reading it?",
        "Who signed the order? Find the three commanders’ names.",
        "Find Lwów on the map. Which way was the 1st Cavalry Army to go: to Warsaw or to Lwów?"
      ],
      "answers": [
        "One day: intercepted on 24 July, read on 25 July.",
        "Yegorov (Jegorow), Stalin and Petin (Pietin); checked by Krauklis, enciphered by Vanin.",
        "To Lwów and the San — far away from Warsaw."
      ],
      "sourceLabel": "Source:"
    },
    story: {
      title: 'The Miracle on the Vistula and the secret telegrams',
      sub: 'A true story from August 1920',
      sections: [
        ['The year 1920', 'Poland has only just become free again, in 1918, after 123 years under foreign rule. From the east comes the Red Army of Bolshevik Russia. Its commander Mikhail Tukhachevsky ended an order with the words “To the West!”. The Bolsheviks wanted to march through Poland to Germany and beyond and start their revolution everywhere. In August they reached Warsaw.'],
        ['The ears of the Polish Army', 'Commanders sent their orders by radio, and anyone can hear radio waves. That is why telegrams were sent in cipher. Polish radio stations wrote everything down, and Lieutenant Jan Kowalewski broke the ciphers together with the mathematicians Wacław Sierpiński, Stefan Mazurkiewicz and Stanisław Leśniewski. Legend says Kowalewski was covering a colleague’s shift, started looking for the key out of boredom and found his first letter, И, in the word ДИВИЗИЯ. The Poles broke about a hundred ciphers; in August 1920 alone they read 410 telegrams, usually the same day or the next.'],
        ['Piłsudski’s plan', 'The telegrams showed that the 4th Army was marching far to the west, to the Vistula near Płock and Włocławek, and that Budyonny’s cavalry was fighting far away, near Lwów. South of Warsaw, on the Wieprz river, the Reds had few soldiers. Józef Piłsudski gathered troops there, and on 16 August he struck northwards from the Wieprz, into the weak spot. The Red Army had to retreat.'],
        ['The jammed radio', 'On the night of 14 to 15 August Polish cavalrymen burst into Ciechanów and destroyed a radio station of the 4th Army. The army’s last radio station worked on a wavelength the Poles knew. When Tukhachevsky ordered the 4th Army to turn south, a Polish radio station in Warsaw broadcast on that same wavelength non-stop for almost two days… passages from the Bible, in Morse code. The order never arrived, and the 4th Army kept marching the wrong way.'],
        ['Why a “miracle”?', 'The Battle of Warsaw lasted from 12 to 25 August 1920. The turning point came around 15 August, the feast of the Assumption of Mary, so the journalist Stanisław Stroński called the victory the “miracle on the Vistula”. But it was also won by brave soldiers and volunteers, Ukrainian allies under Symon Petliura, a good plan — and mathematics. Today 15 August is Polish Armed Forces Day.'],
      ],
      west: ['Why it mattered for the whole West', 'Had Warsaw fallen, the Red Army would have stood on the border of Germany, worn out after the First World War, where the Bolsheviks hoped for a revolution — and from there it is not far to France and the rest of Western Europe. The victory stopped that march: Poland kept its freedom, and the revolution got no further west. The British diplomat Lord D’Abernon, who was in Warsaw in 1920, called it the eighteenth decisive battle in the history of the world — one of the battles that changed history.'],
      next: ['What came next', 'The Cipher Bureau carried on. In 1932 three young mathematicians from that bureau — Marian Rejewski, Jerzy Różycki and Henryk Zygalski — broke the German Enigma, and in July 1939 they shared what they knew with the British and the French. Once again they helped the whole West.'],
      simpl: 'Our telegrams are short; we wrote them from what the Poles really learned from the decrypts. The real Red Army ciphers were of many kinds and usually harder, and real telegrams had no gaps between words.',
      mapTitle: 'The Battle of Warsaw, about 15–16 August 1920',
    },
  },

  uk: {
    title: "Таємні телеграми 1920 року",
    appTitle: "📻 Чудо на Віслі — Таємні телеграми 1920 року",
    appSub: 'Серпень 1920 року, Червона армія під Варшавою. Прочитай перехоплені телеграми так, як польська радіорозвідка, порадь Головнокомандувачу, де вдарити, і дізнайся історію Чуда на Віслі. Аркуш для друку з відповідями.',
    level: 'Рівень', levels: { easy: '★ Ключ майже готовий', mid: '★★ Пів ключа', hard: '★★★ Як Ковалевський', expert: '★★★★ Без пропусків, як справжня телеграма' },
    optStory: 'Сторінка з історією Чуда на Віслі',
    mission: {
      sub: 'Ти працюєш у польській радіорозвідці. Серпень 1920 року.',
      intro: 'Червона армія стоїть під Варшавою. Її командири надсилають накази по радіо, а польські радіостанції все підслуховують. Телеграми зашифровані: кожна літера російської абетки стала числом. Усі три телеграми мають той самий ключ.',
      hintTitle: 'Хитрість поручника Ковалевського',
      hint: 'У слові ДИВИЗИЯ (дивізія) та сама літера И стоїть на місцях 2, 4 і 6. У телеграмі 1 знайди слово із 7 чисел, у якому числа на місцях 2, 4 і 6 однакові, і впиши його літери до ключа.',
      easyNext: 'У ключі вже є майже всі літери — бракує лише літер слова ДИВИЗИЯ. Допиши їх і прочитай телеграми: під кожним числом напиши його літеру.',
      midNext: "Половину ключа вже вписано. Допиши літери ДИВИЗИЯ, впиши відомі літери під числами, а слова, яких бракує, вгадай зі словничка — кожну нову літеру допиши до ключа.",
      hardNext: 'Далі вгадуй, як справжній криптолог: візьми слово, у якому вже знаєш кілька літер, і знайди в словничку слово такої самої довжини, яке підходить. Кожну нову літеру впиши до ключа — вона знадобиться в інших словах.',
      expertHint: "Справжні телеграми не мали пропусків між словами: числа йшли групами по п’ять, і слово може починатися посеред групи. Шукай 7 чисел поспіль, у яких 2-ге, 4-те і 6-те числа однакові, — це може бути ДИВИЗИЯ. Увага: такий візерунок може підійти у двох місцях; перевір, яке дає слова з сенсом.",
      expertNext: "Далі шукай у ряду чисел слова зі словничка, які підходять до відомих літер, і познач рискою, де закінчується кожне слово. Кожну нову літеру впиши до ключа.",
      keyTitle: 'Ключ дня', keyNote: 'число → літера',
      glossTitle: 'Російсько-український словничок',
      tg: n => `Телеграма ${n}`,
    },
    heads: [
      'від: штаб 4-ї армії · до: штаб Західного фронту · перехоплено 13.08.1920',
      { budyonny: 'від: 1-ша Кінна армія · до: штаб фронту · перехоплено 14.08.1920', mozyr: 'від: Мозирська група · до: штаб фронту · перехоплено 14.08.1920' },
      'від: командувач Західного фронту · до: 4-та армія · перехоплено 15.08.1920',
    ],
    report: {
      title: 'Донесення для Головнокомандувача',
      q: [
        'Куди йде 4-та армія? (телеграма 1)',
        'Що важливого каже телеграма 2?',
        'Де Польське військо має вдарити? Обведи на мапі стрілку A, B або C.',
        'Телеграма 3 — це наказ для 4-ї армії. Як польські радисти можуть зробити так, щоб 4-та армія його не почула?',
      ],
    },
    map: {
      cities: { warsaw: 'Варшава', plock: 'Плоцьк', wloclawek: 'Влоцлавек', torun: 'Торунь', ciechanow: 'Цеханів', deblin: 'Демблін', lublin: 'Люблін', lwow: 'Львів', krakow: 'Краків', brest: 'Брест', bialystok: 'Білосток', przemysl: 'Перемишль' },
      rivers: { vistula: 'Вісла', wieprz: 'Вепр', bug: 'Буг', narew: 'Нарев', wkra: 'Вкра', san: 'Сян' },
      prussia: 'Східна Пруссія (Німеччина)', berlin: 'до Берліна бл. 520 км', poland: 'ПОЛЬЩА', pl5: '5-та армія',
      units: { army4: '4-та армія', main: 'головні сили', mozyr: 'Мозирська група', cav: '1-ша Кінна армія' },
      red: 'Червона армія', strike: '16.08: удар', jam: 'глушіння радіо',
    },
    gloss: {
      'АРМИИ': 'армії', 'АРМИЯ': 'армія', 'БУДЕННЫЙ': 'Будьонний — командувач 1-ї Кінної армії',
      'ВИСЛЕ': 'Віслі (К ВИСЛЕ = до Вісли)', 'ВЛОЦЛАВЕК': 'Влоцлавек', 'ГРУППЫ': 'групи',
      'ДИВИЗИЯ': 'дивізія (велика військова частина)', 'ИДЕТ': 'іде', 'К': 'до, у бік', 'КОННАЯ': 'кінна',
      'ЛЬВОВА': 'Львова (У ЛЬВОВА = під Львовом)', 'МАЛО': 'мало', 'МОЗЫРСКОЙ': 'мозирської', 'НА': 'на',
      'ПЛОЦК': 'Плоцьк', 'ПОВЕРНУТЬ': 'повернути', 'СИЛ': 'сил (війська)', 'СТОИТ': 'стоїть',
      'ТУХАЧЕВСКИЙ': 'Тухачевський — командувач Західного фронту', 'У': 'у, біля, під', 'ЧЕТВЕРТОЙ': 'четвертій',
      'ШУВАЕВ': 'Шуваєв — командувач 4-ї армії', 'ЮГ': 'південь',
    },
    answers: {
      keyTitle: 'Увесь ключ дня',
      pattern: n => `ДИВИЗИЯ — це слово № ${n} у телеграмі 1.`,
      tr: {
        plock: 'Дивізія йде на Плоцьк. — Шуваєв', wloclawek: 'Кінна дивізія йде на Влоцлавек. — Шуваєв',
        vistula: 'Дивізія йде до Вісли. — Шуваєв', budyonny: 'Кінна армія стоїть під Львовом. — Будьонний',
        mozyr: 'У Мозирської групи мало сил.', turn: 'Четвертій армії повернути на південь. — Тухачевський',
      },
      a1: {
        plock: 'На захід, на Плоцьк — далеко від Варшави.', wloclawek: 'На захід, на Влоцлавек — далеко від Варшави.',
        vistula: 'На захід, до Вісли біля Плоцька і Влоцлавека — далеко від Варшави.',
      },
      a2: {
        budyonny: 'Кіннота Будьонного далеко, під Львовом, — вона не допоможе під Варшавою. На південь від Варшави ворог слабкий.',
        mozyr: 'У Мозирської групи, на південь від Варшави, мало війська — там слабке місце ворога.',
      },
      a3: 'A — від річки Вепр на північ, у слабке місце ворога. Саме так зробив Юзеф Пілсудський 16 серпня 1920 року.',
      a4: 'Заглушити наказ: передавати на тій самій хвилі. Польська радіостанція у Варшаві майже дві доби без перерви передавала уривки зі Святого Письма, і наказ не дійшов.',
    },
    abc: {"title": "Російська абетка", "sounds": "а б в ґ д є йо ж з і й к л м н о п р с т у ф х ц ч ш щ ʼ и ь е ю я", "note": "Так звучать російські літери, записані українськими. Російське И читається як українське і, Ы — як и, Э — як е, Е — як є. У телеграмах замість Ё писали Е."},
    optHow: "Сторінка «Як працює шифр?»",
    how: {
      "title": "Як працює шифр телеграм?",
      "sub": "Прочитай, перш ніж зламувати телеграми",
      "s1": [
        "1. Шифр — це заміна літер на числа",
        "Шифрувальник мав таємну табличку — ключ. Біля кожної літери російської абетки в ній стояло число. Він писав повідомлення, замінював кожну літеру на її число, а радист передавав по радіо лише числа, абеткою Морзе. Хто не має ключа, чує тільки числа."
      ],
      "keyPiece": "Шматочок ключа",
      "plain": "слово",
      "cipher": "у телеграмі",
      "s2": [
        "2. Отримувач із ключем",
        "Командир, який має той самий ключ, робить те саме навпаки: для кожного числа шукає літеру. 47 → Д, 35 → И, 58 → В… і читає: ДИВИЗИЯ (дивізія)."
      ],
      "s3": [
        "3. Слабке місце: та сама літера = те саме число",
        "Літера И є в слові ДИВИЗИЯ тричі, тож число 35 теж з’являється тричі — на місцях 2, 4 і 6. Такий «відбиток пальця» слова лишається в телеграмі, навіть коли ключа ми не знаємо. Треба лише його помітити."
      ],
      "s4t": "4. Як зламати шифр без ключа",
      "steps": [
        "Вгадай слово, яке напевно є у військовій телеграмі: дивізія, армія, прізвище командира.",
        "Знайди в телеграмі числа з таким самим відбитком пальця, як у цього слова.",
        "Впиши знайдені літери до ключа — тепер ти знаєш кілька чисел.",
        "Впиши ці літери скрізь, де стоять ті самі числа. З уривків вгадаєш наступні слова (допоможе словничок).",
        "Повторюй, доки не прочитаєш усю телеграму. Так працювали Ян Ковалевський і математики у 1920 році."
      ],
      "s5": [
        "5. Справжні шифри 1920 року",
        "Вони бували складніші за наш: ключі часто змінювали, а 12 серпня 1920 року більшовики запровадили новий шифр під назвою «Революція». Але шифрувальники помилялися — повторювали ті самі слова й підписи, — і польські криптологи зламували навіть нові ключі за кілька годин."
      ],
      "s6": [
        "6. А сьогодні?",
        "Повідомлення в телефоні теж шифруються. Але комп’ютери використовують такі складні ключі, що їх неможливо вгадати за відбитками пальців слів. Ідея та сама: без ключа видно лише числа."
      ],
      "warmT": "Розминка",
      "w1": "Розшифруй шматочком ключа з рамки: 37 82 66 35 91 = ? Що це означає? (заглянь у словничок)",
      "w2": "Слово МАМА хтось зашифрував іншим ключем. Який запис підходить? Обведи.",
      "w2opts": [
        "12 40 12 40",
        "12 40 33 40",
        "12 12 40 40"
      ],
      "a1": "АРМИЯ — армія.",
      "a2": "12 40 12 40: М і А повторюються, так само як 12 і 40.",
      "levelsT": "Рівні аркуша",
      "levels": [
        "★ — ключ майже повний, бракує лише літер слова ДИВИЗИЯ.",
        "★★ — половина ключа готова: починаєш з ДИВИЗИЯ, а решту слів вгадуєш зі словничком.",
        "★★★ — ключ порожній: починаєш з ДИВИЗИЯ і вгадуєш далі зі словничком.",
        "★★★★ — як справжня телеграма: без пропусків між словами, числа групами по п’ять."
      ]
    },
    optReal: "Цікавинка: справжня телеграма 1920 року",
    real: {
      "photoTitle": "Фото оригіналу: «Переклад шифрограми», Бюро шифрів, Варшава, 25 липня 1920 року",
      "photoCap": "Унизу праворуч — власноручний підпис поручника Яна Ковалевського, начальника 2-го відділу. Синій олівець («do 5» — «до 5») дописав хтось, хто читав телеграму в штабі. На наступній сторінці текст переписаний і пояснений.",
      "title": "Цікавинка: справжня телеграма 1920 року",
      "sub": "Перехоплена 24 липня, прочитана 25 липня — з підписом поручника Ковалевського",
      "intro": "Ось як насправді виглядала робота Бюро шифрів. 24 липня 1920 року більшовицький шифрувальник Ванін зашифрував наказ командування Південно-Західного фронту. Польські слухачі перехопили його того самого дня, а наступного дня був готовий польський переклад із підписом Яна Ковалевського. Документ зберігся в архіві в Нью-Йорку. Ми переписали його польською, як писали у 1920 році:",
      "translTitle": "Що каже наказ — українською",
      "transl": "Наказ арміям Південно-Західного фронту (початок не дійшов). Пункт 2: війська — з усього наказу видно, що йдеться про 1-шу Кінну армію Будьонного, — мають іти в район Львова і Рави-Руської та вислати передові загони, щоб захопити переправи через Сян біля Сеняви й Перемишля. Пункт 3: 14-та армія має зламати оборону на річці Збруч і всією силою вдарити в бік Тернополя, Перемишля і Городка. Пункт 4: межі між арміями, напр. 12-ї армії і Західного фронту: Домбровиця–Ратне–Влодава–Пулави (кінець не дійшов).",
      "notesTitle": "Словничок документа",
      "notes": [
        [
          "(przerwa), (początku brak)",
          "«(перерва)», «(початку бракує)»: цих шматків слухачі не почули — радіо тріщало або станція замовкла"
        ],
        [
          "armja, linja",
          "так писали польською у 1920 році; сьогодні armia, linia (армія, лінія)"
        ],
        [
          "D-ców",
          "командирам"
        ],
        [
          "I-j konnej",
          "1-ї Кінної армії Будьонного"
        ],
        [
          "Nowa Aleksandrja",
          "давня назва міста Пулави"
        ],
        [
          "Zaszyfrował WANIN",
          "«Зашифрував Ванін» — більшовицький шифрувальник"
        ],
        [
          "STALIN",
          "Йосип Сталін — пізніше майже 30 років диктатор Радянського Союзу"
        ],
        [
          "Sz. № 31724",
          "номер телеграми в Бюро шифрів — їх були тисячі"
        ]
      ],
      "whyTitle": "Чому ця телеграма була важлива",
      "why": "Наказ каже, що кіннота Будьонного має йти на Львів і до Сяну — на південний захід, а не на північ, до Варшави. З таких телеграм Пілсудський знав, що кіннота не встигне допомогти під Варшавою, і міг спланувати удар від Вепра. Твоя телеграма 2 («КОННАЯ АРМИЯ СТОИТ У ЛЬВОВА») — це спрощена версія тієї самої новини.",
      "tasksTitle": "Завдання",
      "tasks": [
        "Скільки днів минуло від перехоплення телеграми до її прочитання?",
        "Хто підписав наказ? Знайди три прізвища командирів.",
        "Знайди на мапі Львів. Куди мала йти 1-ша Кінна армія: на Варшаву чи на Львів?"
      ],
      "answers": [
        "Один день: перехоплено 24.07, прочитано 25.07.",
        "Єгоров, Сталін і Петін (звірив Крауклис, зашифрував Ванін).",
        "На Львів і до Сяну — далеко від Варшави."
      ],
      "sourceLabel": "Джерело:"
    },
    story: {
      title: 'Чудо на Віслі й таємні телеграми',
      sub: 'Справжня історія з серпня 1920 року',
      sections: [
        ['1920 рік', 'Польща лише недавно, у 1918 році, знову стала вільною — після 123 років неволі. Зі сходу наступає Червона армія більшовицької Росії. Її командувач Михайло Тухачевський закінчив наказ словами «На Захід!». Більшовики хотіли пройти через Польщу до Німеччини й далі та скрізь розпалити свою революцію. У серпні вони підійшли до Варшави.'],
        ['Вуха Польського війська', 'Командири надсилали накази по радіо, а радіохвилі може почути кожен. Тому телеграми шифрували. Польські радіостанції все записували, а поручник Ян Ковалевський разом із математиками Вацлавом Серпінським, Стефаном Мазуркевичем і Станіславом Лесьневським зламував шифри. За легендою, Ковалевський підміняв колегу на чергуванні, знудьгувавшись, почав шукати ключ і першу літеру, И, знайшов у слові ДИВИЗИЯ. Поляки зламали близько ста шифрів; лише в серпні 1920 року вони прочитали 410 телеграм, зазвичай того самого або наступного дня.'],
        ['План Пілсудського', 'З телеграм було відомо, що 4-та армія йде далеко на захід, до Вісли біля Плоцька і Влоцлавека, а кіннота Будьонного воює далеко, під Львовом. На південь від Варшави, над річкою Вепр, у червоних було мало війська. Юзеф Пілсудський зібрав там війська і 16 серпня вдарив від Вепра на північ, у слабке місце. Червона армія мусила відступити.'],
        ['Заглушене радіо', 'У ніч з 14 на 15 серпня польські улани увірвалися до Цеханова і знищили радіостанцію 4-ї армії. Остання радіостанція цієї армії працювала на хвилі, яку поляки знали. Коли Тухачевський наказав 4-й армії повернути на південь, польська радіостанція у Варшаві майже дві доби без перерви передавала на тій самій хвилі… уривки зі Святого Письма, абеткою Морзе. Наказ не дійшов, і 4-та армія йшла далі не в той бік.'],
        ['Чому «чудо»?', 'Варшавська битва тривала з 12 до 25 серпня 1920 року. Перелом настав близько 15 серпня, на свято Успіння Богородиці, тому публіцист Станіслав Стронський назвав перемогу «чудом на Віслі». Але допомогли також відвага солдатів і добровольців, українські союзники Симона Петлюри, добрий план — і математика. Сьогодні 15 серпня в Польщі — День Війська Польського.'],
      ],
      west: ['Чому це було важливо для всього Заходу', 'Якби Варшава впала, Червона армія стала б на кордоні Німеччини, виснаженої після Першої світової війни, де більшовики сподівалися на революцію, — а звідти вже недалеко до Франції та решти Західної Європи. Перемога зупинила цей похід: Польща зберегла свободу, а революція не пішла далі на захід. Британський дипломат лорд Д’Абернон, який у 1920 році був у Варшаві, назвав цю битву вісімнадцятою вирішальною битвою в історії світу — однією з тих, що змінили історію.'],
      next: ['Що було далі', 'Бюро шифрів працювало далі. У 1932 році троє молодих математиків із цього бюро — Мар’ян Реєвський, Єжи Ружицький і Генрик Зигальський — зламали німецьку Енігму, а в липні 1939 року передали ці знання британцям і французам. Вони знову допомогли всьому Заходу.'],
      simpl: 'Наші телеграми короткі, ми склали їх на основі того, що поляки справді дізналися з розшифровок. Справжні шифри Червоної армії були різні й зазвичай складніші, а в телеграмах не було пропусків між словами.',
      mapTitle: 'Варшавська битва, близько 15–16 серпня 1920 року',
    },
  },

  vi: {
    title: "Những bức điện mật năm 1920",
    appTitle: "📻 Phép màu trên sông Vistula — Những bức điện mật năm 1920",
    appSub: 'Tháng 8 năm 1920, Hồng quân đứng trước Warszawa. Hãy đọc các bức điện chặn được như tình báo vô tuyến Ba Lan, khuyên Tổng tư lệnh nên tấn công ở đâu và tìm hiểu câu chuyện Phép màu trên sông Vistula. Phiếu để in kèm đáp án.',
    level: 'Mức độ', levels: { easy: '★ Khóa gần xong', mid: '★★ Nửa khóa', hard: '★★★ Như Kowalewski', expert: '★★★★ Không cách chữ, như điện thật' },
    optStory: 'Trang kể chuyện Phép màu trên sông Vistula',
    mission: {
      sub: 'Bạn làm việc trong tình báo vô tuyến Ba Lan. Tháng 8 năm 1920.',
      intro: 'Hồng quân đứng trước Warszawa. Các chỉ huy của họ gửi mệnh lệnh qua vô tuyến, còn các đài vô tuyến Ba Lan nghe hết. Các bức điện được mã hóa: mỗi chữ cái tiếng Nga đã thành một con số. Cả ba bức điện dùng cùng một khóa.',
      hintTitle: 'Mẹo của trung úy Kowalewski',
      hint: 'Từ ДИВИЗИЯ (sư đoàn) có cùng chữ И ở vị trí 2, 4 và 6. Trong bức điện 1, hãy tìm từ gồm 7 số mà các số ở vị trí 2, 4 và 6 giống nhau, rồi viết các chữ của nó vào khóa.',
      easyNext: 'Khóa đã có gần đủ chữ — chỉ thiếu các chữ của từ ДИВИЗИЯ. Điền vào rồi đọc các bức điện: dưới mỗi số viết chữ của nó.',
      midNext: "Một nửa khóa đã được điền sẵn. Điền các chữ của ДИВИЗИЯ, viết các chữ đã biết dưới các số, rồi đoán các từ còn thiếu nhờ bảng từ — thêm mỗi chữ mới vào khóa.",
      hardNext: 'Sau đó đoán tiếp như một nhà giải mã thật: lấy một từ mà bạn đã biết vài chữ, rồi tìm trong bảng từ một từ cùng độ dài khớp với nó. Viết mỗi chữ mới vào khóa — nó sẽ giúp ở các từ khác.',
      expertHint: "Điện thật không có khoảng trống giữa các từ: các số đi thành nhóm năm, và một từ có thể bắt đầu ở giữa nhóm. Hãy tìm 7 số liền nhau mà số thứ 2, 4 và 6 giống nhau — đó có thể là ДИВИЗИЯ. Chú ý: mẫu này có thể khớp ở hai chỗ; hãy kiểm tra chỗ nào cho ra các từ có nghĩa.",
      expertNext: "Sau đó tìm trong dãy số các từ trong bảng từ khớp với những chữ đã biết, và kẻ một vạch ở chỗ mỗi từ kết thúc. Viết mỗi chữ mới vào khóa.",
      keyTitle: 'Khóa của ngày', keyNote: 'số → chữ',
      glossTitle: 'Bảng từ Nga–Việt',
      tg: n => `Bức điện ${n}`,
    },
    heads: [
      'từ: bộ chỉ huy Tập đoàn quân 4 · gửi: bộ chỉ huy Phương diện quân Tây · chặn được 13/8/1920',
      { budyonny: 'từ: Tập đoàn quân Kỵ binh 1 · gửi: bộ chỉ huy phương diện quân · chặn được 14/8/1920', mozyr: 'từ: Cụm quân Mozyr · gửi: bộ chỉ huy phương diện quân · chặn được 14/8/1920' },
      'từ: tư lệnh Phương diện quân Tây · gửi: Tập đoàn quân 4 · chặn được 15/8/1920',
    ],
    report: {
      title: 'Báo cáo gửi Tổng tư lệnh',
      q: [
        'Tập đoàn quân 4 đang đi đâu? (bức điện 1)',
        'Bức điện 2 cho biết điều gì quan trọng?',
        'Quân đội Ba Lan nên tấn công ở đâu? Khoanh mũi tên A, B hoặc C trên bản đồ.',
        'Bức điện 3 là mệnh lệnh cho Tập đoàn quân 4. Các điện báo viên Ba Lan có thể làm gì để Tập đoàn quân 4 không nghe được nó?',
      ],
    },
    map: {
      cities: { warsaw: 'Warszawa', plock: 'Płock', wloclawek: 'Włocławek', torun: 'Toruń', ciechanow: 'Ciechanów', deblin: 'Dęblin', lublin: 'Lublin', lwow: 'Lviv', krakow: 'Kraków', brest: 'Brest', bialystok: 'Białystok', przemysl: 'Przemyśl' },
      rivers: { vistula: 'Vistula', wieprz: 'Wieprz', bug: 'Bug', narew: 'Narew', wkra: 'Wkra', san: 'San' },
      prussia: 'Đông Phổ (Đức)', berlin: 'tới Berlin ~520 km', poland: 'BA LAN', pl5: 'TĐQ 5',
      units: { army4: 'TĐQ 4', main: 'lực lượng chính', mozyr: 'Cụm Mozyr', cav: 'TĐQ Kỵ binh 1' },
      red: 'Hồng quân', strike: '16/8: phản công', jam: 'gây nhiễu radio',
    },
    gloss: {
      'АРМИИ': 'cho tập đoàn quân', 'АРМИЯ': 'tập đoàn quân', 'БУДЕННЫЙ': 'Budyonny — tư lệnh Tập đoàn quân Kỵ binh 1',
      'ВИСЛЕ': 'sông Vistula (К ВИСЛЕ = tới sông Vistula)', 'ВЛОЦЛАВЕК': 'Włocławek', 'ГРУППЫ': 'của cụm quân',
      'ДИВИЗИЯ': 'sư đoàn (đơn vị quân lớn)', 'ИДЕТ': 'đang đi', 'К': 'tới, về phía', 'КОННАЯ': 'kỵ binh',
      'ЛЬВОВА': 'Lviv (У ЛЬВОВА = gần Lviv)', 'МАЛО': 'ít', 'МОЗЫРСКОЙ': 'Mozyr (tên cụm quân)', 'НА': 'tới, lên',
      'ПЛОЦК': 'Płock', 'ПОВЕРНУТЬ': 'quay, rẽ', 'СИЛ': 'lực lượng (quân lính)', 'СТОИТ': 'đứng, ở',
      'ТУХАЧЕВСКИЙ': 'Tukhachevsky — tư lệnh Phương diện quân Tây', 'У': 'ở, gần; У … = … có', 'ЧЕТВЕРТОЙ': 'thứ tư',
      'ШУВАЕВ': 'Shuvayev — tư lệnh Tập đoàn quân 4', 'ЮГ': 'phía nam',
    },
    answers: {
      keyTitle: 'Toàn bộ khóa của ngày',
      pattern: n => `ДИВИЗИЯ là từ thứ ${n} trong bức điện 1.`,
      tr: {
        plock: 'Sư đoàn đang tiến về Płock. — Shuvayev', wloclawek: 'Sư đoàn kỵ binh đang tiến về Włocławek. — Shuvayev',
        vistula: 'Sư đoàn đang tiến tới sông Vistula. — Shuvayev', budyonny: 'Tập đoàn quân Kỵ binh đang ở gần Lviv. — Budyonny',
        mozyr: 'Cụm quân Mozyr có ít quân.', turn: 'Tập đoàn quân 4 phải quay về phía nam. — Tukhachevsky',
      },
      a1: {
        plock: 'Về phía tây, tới Płock — xa Warszawa.', wloclawek: 'Về phía tây, tới Włocławek — xa Warszawa.',
        vistula: 'Về phía tây, tới sông Vistula gần Płock và Włocławek — xa Warszawa.',
      },
      a2: {
        budyonny: 'Kỵ binh của Budyonny ở xa, gần Lviv — không thể giúp ở Warszawa. Phía nam Warszawa quân địch yếu.',
        mozyr: 'Cụm quân Mozyr, ở phía nam Warszawa, có ít quân — đó là chỗ yếu của địch.',
      },
      a3: 'A — từ sông Wieprz tiến lên phía bắc, vào chỗ yếu của địch. Józef Piłsudski đã làm đúng như vậy ngày 16 tháng 8 năm 1920.',
      a4: 'Gây nhiễu mệnh lệnh: phát trên cùng một bước sóng. Một đài vô tuyến Ba Lan ở Warszawa đã phát các đoạn Kinh Thánh liên tục gần hai ngày đêm, và mệnh lệnh không bao giờ tới nơi.',
    },
    abc: {"title": "Bảng chữ cái tiếng Nga", "sounds": "a b v g đ ie io j z i i k l m n o p r x t u ph kh ts ch s sch – ư – e iu ia", "note": "Cách đọc các chữ cái. Ъ và Ь không có âm riêng (dấu cứng và dấu mềm). Trong điện báo người ta viết Е thay cho Ё."},
    optHow: "Trang “Mật mã hoạt động thế nào?”",
    how: {
      "title": "Mật mã trong các bức điện hoạt động thế nào?",
      "sub": "Hãy đọc trước khi bắt đầu phá các bức điện",
      "s1": [
        "1. Mật mã là đổi chữ thành số",
        "Nhân viên mật mã có một bảng bí mật — chiếc khóa. Cạnh mỗi chữ cái tiếng Nga có một con số. Anh ta viết tin nhắn, đổi mỗi chữ thành số của nó, rồi điện báo viên chỉ phát các con số qua radio, bằng mã Morse. Ai không có khóa chỉ nghe thấy những con số."
      ],
      "keyPiece": "Một mẩu khóa",
      "plain": "từ",
      "cipher": "trong bức điện",
      "s2": [
        "2. Người nhận có khóa",
        "Người chỉ huy có cùng chiếc khóa làm ngược lại: với mỗi số, tìm chữ của nó. 47 → Д, 35 → И, 58 → В… và đọc được: ДИВИЗИЯ (sư đoàn)."
      ],
      "s3": [
        "3. Điểm yếu: cùng chữ = cùng số",
        "Chữ И có ba lần trong từ ДИВИЗИЯ, nên số 35 cũng xuất hiện ba lần — ở vị trí 2, 4 và 6. “Dấu vân tay” này của từ vẫn còn trong bức điện, kể cả khi ta không biết khóa. Chỉ cần nhìn ra nó."
      ],
      "s4t": "4. Cách phá mật mã khi không có khóa",
      "steps": [
        "Đoán một từ chắc chắn có trong điện quân sự: sư đoàn, tập đoàn quân, tên chỉ huy.",
        "Tìm trong bức điện những con số có cùng dấu vân tay với từ đó.",
        "Viết các chữ vừa tìm được vào khóa — giờ bạn đã biết vài con số.",
        "Viết các chữ ấy vào mọi chỗ có cùng con số. Từ những mảnh ghép bạn sẽ đoán ra các từ khác (bảng từ sẽ giúp).",
        "Lặp lại cho tới khi đọc được cả bức điện. Jan Kowalewski và các nhà toán học đã làm như thế năm 1920."
      ],
      "s5": [
        "5. Mật mã thật năm 1920",
        "Chúng thường khó hơn của chúng ta: khóa được đổi thường xuyên, và ngày 12 tháng 8 năm 1920 phía Bolshevik dùng một mật mã mới tên là “Cách mạng”. Nhưng các nhân viên mật mã hay mắc lỗi — lặp lại cùng những từ và chữ ký — và các nhà giải mã Ba Lan phá được cả khóa mới chỉ trong vài giờ."
      ],
      "s6": [
        "6. Còn ngày nay?",
        "Tin nhắn trong điện thoại cũng được mã hóa. Nhưng máy tính dùng những chiếc khóa khó đến mức không ai đoán được từ dấu vân tay của các từ. Ý tưởng vẫn vậy: không có khóa thì chỉ thấy những con số."
      ],
      "warmT": "Khởi động",
      "w1": "Giải mã bằng mẩu khóa trong khung: 37 82 66 35 91 = ? Nghĩa là gì? (xem bảng từ)",
      "w2": "Ai đó đã mã hóa từ МАМА (mẹ) bằng một chiếc khóa khác. Cách viết nào khớp? Khoanh tròn.",
      "w2opts": [
        "12 40 12 40",
        "12 40 33 40",
        "12 12 40 40"
      ],
      "a1": "АРМИЯ — tập đoàn quân.",
      "a2": "12 40 12 40: М và А lặp lại, giống như 12 và 40.",
      "levelsT": "Các mức của phiếu",
      "levels": [
        "★ — khóa gần đầy đủ, chỉ thiếu các chữ của từ ДИВИЗИЯ.",
        "★★ — nửa khóa đã có sẵn: bạn bắt đầu từ ДИВИЗИЯ và đoán các từ còn lại nhờ bảng từ.",
        "★★★ — khóa trống: bạn bắt đầu từ ДИВИЗИЯ rồi đoán tiếp nhờ bảng từ.",
        "★★★★ — như điện thật: không có khoảng trống giữa các từ, các số theo nhóm năm."
      ]
    },
    optReal: "Điều thú vị: một bức điện thật năm 1920",
    real: {
      "photoTitle": "Ảnh bản gốc: “Bản dịch bức điện mật mã”, Cục Mật mã, Warszawa, 25 tháng 7 năm 1920",
      "photoCap": "Góc dưới bên phải là chữ ký tay của trung úy Jan Kowalewski, trưởng Ban 2. Nét bút chì xanh (“do 5” — “gửi 5”) do một người đọc bức điện ở bộ tham mưu ghi thêm. Trang sau có bản chép lại và giải thích.",
      "title": "Điều thú vị: một bức điện thật năm 1920",
      "sub": "Chặn được ngày 24 tháng 7, đọc được ngày 25 tháng 7 — có chữ ký của trung úy Kowalewski",
      "intro": "Đây là công việc thật của Cục Mật mã. Ngày 24 tháng 7 năm 1920, nhân viên mật mã Bolshevik tên Vanin đã mã hóa một mệnh lệnh của bộ chỉ huy Phương diện quân Tây Nam. Người nghe đài Ba Lan chặn được nó ngay hôm đó, và hôm sau bản dịch tiếng Ba Lan đã xong, có chữ ký của Jan Kowalewski. Tài liệu này còn được giữ trong một kho lưu trữ ở New York. Chúng tôi chép lại nó bằng tiếng Ba Lan theo cách viết năm 1920:",
      "translTitle": "Mệnh lệnh nói gì — bằng tiếng Việt",
      "transl": "Mệnh lệnh gửi các tập đoàn quân của Phương diện quân Tây Nam (phần đầu không nhận được). Điểm 2: quân đội — qua toàn bộ mệnh lệnh có thể thấy đó là Tập đoàn quân Kỵ binh 1 của Budyonny — phải tiến tới vùng Lviv và Rava-Ruska, cử các đơn vị đi trước chiếm các bến vượt sông San gần Sieniawa và Przemyśl. Điểm 3: Tập đoàn quân 14 phải phá tuyến phòng thủ trên sông Zbruch và dốc toàn lực tấn công về phía Ternopil, Przemyśl và Horodok. Điểm 4: ranh giới giữa các tập đoàn quân, ví dụ giữa Tập đoàn quân 12 và Phương diện quân Tây: Dąbrowica–Ratno–Włodawa–Puławy (phần cuối không nhận được).",
      "notesTitle": "Giải thích từ trong tài liệu",
      "notes": [
        [
          "(przerwa), (początku brak)",
          "“(gián đoạn)”, “(thiếu phần đầu)”: người nghe đài không nghe được các đoạn này — radio rè hoặc đài ngừng phát"
        ],
        [
          "armja, linja",
          "cách viết tiếng Ba Lan năm 1920; ngày nay viết armia, linia (tập đoàn quân, tuyến)"
        ],
        [
          "D-ców",
          "gửi các chỉ huy"
        ],
        [
          "I-j konnej",
          "của Tập đoàn quân Kỵ binh 1 (của Budyonny)"
        ],
        [
          "Nowa Aleksandrja",
          "tên cũ của thị trấn Puławy"
        ],
        [
          "Zaszyfrował WANIN",
          "“Vanin mã hóa” — nhân viên mật mã Bolshevik"
        ],
        [
          "STALIN",
          "Iosif Stalin — sau này là nhà độc tài của Liên Xô gần 30 năm"
        ],
        [
          "Sz. № 31724",
          "số của bức điện ở Cục Mật mã — có hàng nghìn bức"
        ]
      ],
      "whyTitle": "Vì sao bức điện này quan trọng",
      "why": "Mệnh lệnh nói rằng kỵ binh của Budyonny phải tiến về Lviv và sông San — về phía tây nam, chứ không lên phía bắc tới Warszawa. Nhờ những bức điện như thế, Piłsudski biết kỵ binh sẽ không kịp tới giúp ở Warszawa, và có thể lên kế hoạch tấn công từ sông Wieprz. Bức điện 2 của bạn (“КОННАЯ АРМИЯ СТОИТ У ЛЬВОВА”) là phiên bản đơn giản của cùng tin này.",
      "tasksTitle": "Nhiệm vụ",
      "tasks": [
        "Từ lúc chặn được đến lúc đọc được bức điện mất mấy ngày?",
        "Ai ký mệnh lệnh? Tìm tên ba chỉ huy.",
        "Tìm Lviv trên bản đồ. Tập đoàn quân Kỵ binh 1 phải đi về đâu: Warszawa hay Lviv?"
      ],
      "answers": [
        "Một ngày: chặn được 24/7, đọc được 25/7.",
        "Yegorov (Jegorow), Stalin và Petin (Pietin); Krauklis đối chiếu, Vanin mã hóa.",
        "Về Lviv và sông San — xa Warszawa."
      ],
      "sourceLabel": "Nguồn:"
    },
    story: {
      title: 'Phép màu trên sông Vistula và những bức điện mật',
      sub: 'Một câu chuyện có thật từ tháng 8 năm 1920',
      sections: [
        ['Năm 1920', 'Ba Lan vừa mới giành lại tự do vào năm 1918, sau 123 năm bị chia cắt. Từ phía đông, Hồng quân của nước Nga Bolshevik kéo đến. Chỉ huy của họ, Mikhail Tukhachevsky, kết thúc một mệnh lệnh bằng câu “Tiến về phía Tây!”. Những người Bolshevik muốn đi qua Ba Lan tới Đức và xa hơn nữa, để làm cách mạng ở khắp nơi. Tháng 8, họ tới trước Warszawa.'],
        ['Đôi tai của Quân đội Ba Lan', 'Các chỉ huy gửi mệnh lệnh qua vô tuyến, mà sóng vô tuyến thì ai cũng nghe được. Vì vậy điện báo được mã hóa. Các đài Ba Lan ghi lại mọi thứ, còn trung úy Jan Kowalewski cùng các nhà toán học Wacław Sierpiński, Stefan Mazurkiewicz và Stanisław Leśniewski phá các mật mã. Truyền thuyết kể rằng Kowalewski trực ca thay một đồng nghiệp, buồn chán nên bắt đầu tìm khóa, và tìm ra chữ đầu tiên, И, trong từ ДИВИЗИЯ. Người Ba Lan đã phá khoảng một trăm mật mã; riêng tháng 8 năm 1920 họ đọc được 410 bức điện, thường ngay trong ngày hoặc hôm sau.'],
        ['Kế hoạch của Piłsudski', 'Các bức điện cho biết Tập đoàn quân 4 đang đi xa về phía tây, tới sông Vistula gần Płock và Włocławek, còn kỵ binh của Budyonny đang đánh nhau ở xa, gần Lviv. Ở phía nam Warszawa, bên sông Wieprz, Hồng quân có rất ít quân. Józef Piłsudski tập hợp quân ở đó và ngày 16 tháng 8 tấn công từ sông Wieprz lên phía bắc, vào chỗ yếu. Hồng quân phải rút lui.'],
        ['Chiếc radio bị gây nhiễu', 'Đêm 14 rạng 15 tháng 8, kỵ binh Ba Lan xông vào Ciechanów và phá hủy một đài vô tuyến của Tập đoàn quân 4. Đài cuối cùng của tập đoàn quân này hoạt động trên một bước sóng mà người Ba Lan biết. Khi Tukhachevsky ra lệnh cho Tập đoàn quân 4 quay về phía nam, một đài vô tuyến Ba Lan ở Warszawa phát liên tục gần hai ngày đêm trên chính bước sóng đó… các đoạn Kinh Thánh, bằng mã Morse. Mệnh lệnh không tới nơi, và Tập đoàn quân 4 tiếp tục đi sai hướng.'],
        ['Tại sao gọi là “phép màu”?', 'Trận Warszawa kéo dài từ 12 đến 25 tháng 8 năm 1920. Bước ngoặt đến vào khoảng ngày 15 tháng 8, ngày lễ Đức Mẹ Lên Trời, nên nhà báo Stanisław Stroński gọi chiến thắng là “phép màu trên sông Vistula”. Nhưng chiến thắng còn nhờ lòng dũng cảm của binh lính và người tình nguyện, các đồng minh Ukraina của Symon Petliura, một kế hoạch tốt — và toán học. Ngày nay 15 tháng 8 là Ngày Quân đội Ba Lan.'],
      ],
      west: ['Vì sao điều này quan trọng với cả phương Tây', 'Nếu Warszawa thất thủ, Hồng quân sẽ đứng ở biên giới nước Đức, vốn kiệt sức sau Chiến tranh thế giới thứ nhất, nơi những người Bolshevik mong có cách mạng — và từ đó không còn xa tới Pháp và phần còn lại của Tây Âu. Chiến thắng đã chặn đứng cuộc hành quân ấy: Ba Lan giữ được tự do, còn cách mạng không lan xa hơn về phía tây. Nhà ngoại giao Anh, huân tước D’Abernon, người có mặt ở Warszawa năm 1920, gọi đây là trận đánh quyết định thứ mười tám trong lịch sử thế giới — một trong những trận đánh đã thay đổi lịch sử.'],
      next: ['Chuyện gì xảy ra sau đó', 'Cục Mật mã vẫn tiếp tục làm việc. Năm 1932, ba nhà toán học trẻ của cục — Marian Rejewski, Jerzy Różycki và Henryk Zygalski — đã phá được máy Enigma của Đức, và tháng 7 năm 1939 họ chia sẻ hiểu biết đó với người Anh và người Pháp. Một lần nữa họ lại giúp cả phương Tây.'],
      simpl: 'Các bức điện của chúng tôi ngắn; chúng tôi viết chúng dựa trên những gì người Ba Lan thật sự đọc được. Mật mã thật của Hồng quân có nhiều loại và thường khó hơn, và điện thật không có khoảng trống giữa các từ.',
      mapTitle: 'Trận Warszawa, khoảng 15–16 tháng 8 năm 1920',
    },
  },

  fr: {
    title: "Les télégrammes secrets de 1920",
    appTitle: "📻 Le miracle de la Vistule — Les télégrammes secrets de 1920",
    appSub: 'Août 1920, l’Armée rouge aux portes de Varsovie. Lis des télégrammes interceptés comme le renseignement radio polonais, conseille au commandant en chef où frapper et découvre l’histoire du miracle de la Vistule. Une fiche à imprimer avec les solutions.',
    level: 'Niveau', levels: { easy: '★ Clé presque prête', mid: '★★ Demi-clé', hard: '★★★ Comme Kowalewski', expert: '★★★★ Sans espaces, comme un vrai télégramme' },
    optStory: 'Page avec l’histoire du miracle de la Vistule',
    mission: {
      sub: 'Tu travailles au renseignement radio polonais. Août 1920.',
      intro: 'L’Armée rouge est aux portes de Varsovie. Ses chefs envoient leurs ordres par radio, et les stations polonaises écoutent tout. Les télégrammes sont chiffrés : chaque lettre de l’alphabet russe est devenue un nombre. Les trois télégrammes ont la même clé.',
      hintTitle: 'L’astuce du lieutenant Kowalewski',
      hint: 'Le mot ДИВИЗИЯ (division) a la même lettre И aux places 2, 4 et 6. Dans le télégramme 1, trouve un mot de 7 nombres dont les nombres aux places 2, 4 et 6 sont les mêmes, puis écris ses lettres dans la clé.',
      easyNext: 'La clé a déjà presque toutes les lettres — il ne manque que celles du mot ДИВИЗИЯ. Complète-la et lis les télégrammes : sous chaque nombre, écris sa lettre.',
      midNext: "La moitié de la clé est déjà remplie. Ajoute les lettres de ДИВИЗИЯ, écris les lettres connues sous les nombres, et devine les mots qui manquent grâce au lexique — ajoute chaque nouvelle lettre à la clé.",
      hardNext: 'Ensuite, devine comme un vrai cryptologue : prends un mot dont tu connais déjà quelques lettres et trouve dans le lexique un mot de la même longueur qui convient. Écris chaque nouvelle lettre dans la clé — elle servira dans d’autres mots.',
      expertHint: "Les vrais télégrammes n’avaient pas d’espaces entre les mots : les nombres allaient par groupes de cinq, et un mot peut commencer au milieu d’un groupe. Cherche 7 nombres à la suite dont les 2e, 4e et 6e sont les mêmes — c’est peut-être ДИВИЗИЯ. Attention : ce motif peut aller à deux endroits ; vérifie lequel donne des mots qui ont un sens.",
      expertNext: "Ensuite, cherche dans la suite de nombres des mots du lexique qui collent aux lettres connues, et trace un trait là où finit chaque mot. Écris chaque nouvelle lettre dans la clé.",
      keyTitle: 'La clé du jour', keyNote: 'nombre → lettre',
      glossTitle: 'Petit lexique russe-français',
      tg: n => `Télégramme ${n}`,
    },
    heads: [
      'de : état-major de la 4e armée · à : état-major du front de l’Ouest · intercepté le 13/08/1920',
      { budyonny: 'de : 1re armée de cavalerie · à : état-major du front · intercepté le 14/08/1920', mozyr: 'de : groupe de Mozyr · à : état-major du front · intercepté le 14/08/1920' },
      'de : commandant du front de l’Ouest · à : 4e armée · intercepté le 15/08/1920',
    ],
    report: {
      title: 'Rapport pour le commandant en chef',
      q: [
        'Où va la 4e armée ? (télégramme 1)',
        'Que dit d’important le télégramme 2 ?',
        'Où l’armée polonaise doit-elle frapper ? Entoure la flèche A, B ou C sur la carte.',
        'Le télégramme 3 est un ordre pour la 4e armée. Comment les radiotélégraphistes polonais peuvent-ils faire pour que la 4e armée ne l’entende pas ?',
      ],
    },
    map: {
      cities: { warsaw: 'Varsovie', plock: 'Płock', wloclawek: 'Włocławek', torun: 'Toruń', ciechanow: 'Ciechanów', deblin: 'Dęblin', lublin: 'Lublin', lwow: 'Lwów (Lviv)', krakow: 'Cracovie', brest: 'Brest-Litovsk', bialystok: 'Białystok', przemysl: 'Przemyśl' },
      rivers: { vistula: 'Vistule', wieprz: 'Wieprz', bug: 'Bug', narew: 'Narew', wkra: 'Wkra', san: 'San' },
      prussia: 'Prusse-Orientale (Allemagne)', berlin: 'vers Berlin ~520 km', poland: 'POLOGNE', pl5: '5e armée',
      units: { army4: '4e armée', main: 'forces principales', mozyr: 'groupe de Mozyr', cav: '1re armée de cavalerie' },
      red: 'Armée rouge', strike: '16/08 : l’attaque', jam: 'brouillage radio',
    },
    gloss: {
      'АРМИИ': 'à l’armée', 'АРМИЯ': 'armée', 'БУДЕННЫЙ': 'Boudienny — chef de la 1re armée de cavalerie',
      'ВИСЛЕ': 'Vistule (К ВИСЛЕ = vers la Vistule)', 'ВЛОЦЛАВЕК': 'Włocławek', 'ГРУППЫ': 'du groupe',
      'ДИВИЗИЯ': 'division (grande unité de l’armée)', 'ИДЕТ': 'va, marche', 'К': 'vers', 'КОННАЯ': 'de cavalerie',
      'ЛЬВОВА': 'Lwów (У ЛЬВОВА = près de Lwów)', 'МАЛО': 'peu', 'МОЗЫРСКОЙ': 'de Mozyr', 'НА': 'sur, vers',
      'ПЛОЦК': 'Płock', 'ПОВЕРНУТЬ': 'tourner', 'СИЛ': 'de forces (de soldats)', 'СТОИТ': 'se tient, est',
      'ТУХАЧЕВСКИЙ': 'Toukhatchevski — chef du front de l’Ouest', 'У': 'près de ; У … = … a', 'ЧЕТВЕРТОЙ': 'quatrième',
      'ШУВАЕВ': 'Chouvaïev — chef de la 4e armée', 'ЮГ': 'sud',
    },
    answers: {
      keyTitle: 'Toute la clé du jour',
      pattern: n => `ДИВИЗИЯ est le mot n° ${n} du télégramme 1.`,
      tr: {
        plock: 'La division marche sur Płock. — Chouvaïev', wloclawek: 'La division de cavalerie marche sur Włocławek. — Chouvaïev',
        vistula: 'La division marche vers la Vistule. — Chouvaïev', budyonny: 'L’armée de cavalerie est près de Lwów. — Boudienny',
        mozyr: 'Le groupe de Mozyr a peu de soldats.', turn: 'La quatrième armée doit tourner vers le sud. — Toukhatchevski',
      },
      a1: {
        plock: 'Vers l’ouest, sur Płock — loin de Varsovie.', wloclawek: 'Vers l’ouest, sur Włocławek — loin de Varsovie.',
        vistula: 'Vers l’ouest, vers la Vistule près de Płock et Włocławek — loin de Varsovie.',
      },
      a2: {
        budyonny: 'La cavalerie de Boudienny est loin, près de Lwów — elle ne peut pas aider à Varsovie. Au sud de Varsovie, l’ennemi est faible.',
        mozyr: 'Le groupe de Mozyr, au sud de Varsovie, a peu de soldats — c’est le point faible de l’ennemi.',
      },
      a3: 'A — depuis la rivière Wieprz vers le nord, dans le point faible de l’ennemi. C’est ce que fit Józef Piłsudski le 16 août 1920.',
      a4: 'Brouiller l’ordre : émettre sur la même longueur d’onde. Une station polonaise de Varsovie émit sans arrêt pendant près de deux jours des passages de la Bible, et l’ordre n’arriva jamais.',
    },
    abc: {"title": "L’alphabet russe", "sounds": "a b v g d ié io j z i ï k l m n o p r s t ou f kh ts tch ch chtch – y – è iou ia", "note": "Comment se lisent les lettres. Ъ et Ь n’ont pas de son à eux (signe dur et signe mou). Ы est un « i » profond. Les télégrammes écrivaient Е au lieu de Ё."},
    optHow: "Page « Comment marche le chiffre ? »",
    how: {
      "title": "Comment marche le chiffre des télégrammes ?",
      "sub": "À lire avant de casser les télégrammes",
      "s1": [
        "1. Un chiffre remplace les lettres par des nombres",
        "Le chiffreur avait un tableau secret : la clé. À côté de chaque lettre de l’alphabet russe, il y avait un nombre. Il écrivait le message, remplaçait chaque lettre par son nombre, et le radiotélégraphiste n’envoyait que des nombres, en morse. Sans la clé, on n’entend que des nombres."
      ],
      "keyPiece": "Un morceau de la clé",
      "plain": "mot",
      "cipher": "dans le télégramme",
      "s2": [
        "2. Le destinataire a la clé",
        "Un chef qui a la même clé fait la même chose à l’envers : pour chaque nombre, il cherche la lettre. 47 → Д, 35 → И, 58 → В… et il lit : ДИВИЗИЯ (division)."
      ],
      "s3": [
        "3. Le point faible : même lettre = même nombre",
        "La lettre И est trois fois dans ДИВИЗИЯ, donc le nombre 35 apparaît aussi trois fois — aux places 2, 4 et 6. Cette « empreinte digitale » du mot reste dans le télégramme, même sans connaître la clé. Il suffit de la repérer."
      ],
      "s4t": "4. Comment casser le chiffre sans la clé",
      "steps": [
        "Devine un mot qui est sûrement dans un télégramme militaire : division, armée, le nom d’un chef.",
        "Trouve dans le télégramme des nombres avec la même empreinte que ce mot.",
        "Écris les lettres trouvées dans la clé : tu connais maintenant quelques nombres.",
        "Écris ces lettres partout où se trouvent les mêmes nombres. Avec les morceaux, tu devineras d’autres mots (le lexique t’aide).",
        "Recommence jusqu’à lire tout le télégramme. C’est ainsi que travaillaient Jan Kowalewski et les mathématiciens en 1920."
      ],
      "s5": [
        "5. Les vrais chiffres de 1920",
        "Ils étaient souvent plus difficiles que le nôtre : on changeait souvent les clés, et le 12 août 1920 les bolcheviks adoptèrent un nouveau chiffre appelé « Révolution ». Mais les chiffreurs faisaient des erreurs — ils répétaient les mêmes mots et signatures — et les cryptologues polonais cassaient même les nouvelles clés en quelques heures."
      ],
      "s6": [
        "6. Et aujourd’hui ?",
        "Les messages de ton téléphone sont chiffrés eux aussi. Mais les ordinateurs utilisent des clés si difficiles que personne ne peut les deviner avec les empreintes des mots. L’idée reste la même : sans la clé, on ne voit que des nombres."
      ],
      "warmT": "Échauffement",
      "w1": "Déchiffre avec le morceau de clé du cadre : 37 82 66 35 91 = ? Qu’est-ce que ça veut dire ? (regarde le lexique)",
      "w2": "Quelqu’un a chiffré le mot МАМА (maman) avec une autre clé. Quelle écriture convient ? Entoure-la.",
      "w2opts": [
        "12 40 12 40",
        "12 40 33 40",
        "12 12 40 40"
      ],
      "a1": "АРМИЯ — armée.",
      "a2": "12 40 12 40 : М et А se répètent, comme 12 et 40.",
      "levelsT": "Les niveaux de la fiche",
      "levels": [
        "★ — la clé est presque pleine ; il ne manque que les lettres de ДИВИЗИЯ.",
        "★★ — la moitié de la clé est prête : tu pars de ДИВИЗИЯ et tu devines les autres mots avec le lexique.",
        "★★★ — la clé est vide : tu pars de ДИВИЗИЯ et tu devines la suite avec le lexique.",
        "★★★★ — comme un vrai télégramme : pas d’espaces entre les mots, des nombres par groupes de cinq."
      ]
    },
    optReal: "Le saviez-vous ? Un vrai télégramme de 1920",
    real: {
      "photoTitle": "Photo de l’original : « Traduction d’un télégramme chiffré », Bureau du chiffre, Varsovie, 25 juillet 1920",
      "photoCap": "En bas à droite, la signature manuscrite du lieutenant Jan Kowalewski, chef de la section 2. Le crayon bleu (« do 5 » — « au 5 ») a été ajouté par quelqu’un qui a lu le télégramme à l’état-major. La page suivante donne le texte recopié et expliqué.",
      "title": "Le saviez-vous ? Un vrai télégramme de 1920",
      "sub": "Intercepté le 24 juillet, lu le 25 juillet — signé par le lieutenant Kowalewski",
      "intro": "Voici à quoi ressemblait vraiment le travail du Bureau du chiffre. Le 24 juillet 1920, le chiffreur bolchevik Vanine chiffra un ordre du commandement du front du Sud-Ouest. Les écouteurs polonais l’interceptèrent le jour même, et le lendemain la traduction polonaise était prête, signée par Jan Kowalewski. Le document est conservé dans des archives à New York. Le voici, recopié en polonais avec l’orthographe de 1920 :",
      "translTitle": "Ce que dit l’ordre, en français",
      "transl": "Ordre aux armées du front du Sud-Ouest (le début n’a pas été reçu). Point 2 : les troupes — d’après tout l’ordre, il s’agit de la 1re armée de cavalerie de Boudienny — doivent aller vers Lwów et Rawa Ruska et envoyer leurs unités avancées prendre les passages sur le San près de Sieniawa et Przemyśl. Point 3 : la 14e armée doit briser la défense ennemie sur la rivière Zbroutch et frapper de toutes ses forces vers Tarnopol, Przemyśl et Gródek. Point 4 : les limites entre les armées, par ex. entre la 12e armée et le front de l’Ouest : Dąbrowica–Ratno–Włodawa–Puławy (la fin n’a pas été reçue).",
      "notesTitle": "Lexique du document",
      "notes": [
        [
          "(przerwa), (początku brak)",
          "« (coupure) », « (début manquant) » : ces passages n’ont pas été entendus — la radio grésillait ou la station s’est tue"
        ],
        [
          "armja, linja",
          "l’orthographe polonaise de 1920 ; aujourd’hui armia, linia (armée, ligne)"
        ],
        [
          "D-ców",
          "aux commandants"
        ],
        [
          "I-j konnej",
          "de la 1re armée de cavalerie (celle de Boudienny)"
        ],
        [
          "Nowa Aleksandrja",
          "ancien nom de la ville de Puławy"
        ],
        [
          "Zaszyfrował WANIN",
          "« chiffré par Vanine », le chiffreur bolchevik"
        ],
        [
          "STALIN",
          "Joseph Staline — plus tard dictateur de l’Union soviétique pendant près de 30 ans"
        ],
        [
          "Sz. № 31724",
          "le numéro du télégramme au Bureau du chiffre — il y en avait des milliers"
        ]
      ],
      "whyTitle": "Pourquoi ce télégramme était important",
      "why": "L’ordre dit que la cavalerie de Boudienny doit aller vers Lwów et le San — au sud-ouest, et non au nord vers Varsovie. Grâce à de tels télégrammes, Piłsudski savait que la cavalerie n’arriverait pas à temps à Varsovie, et il put préparer l’attaque depuis la Wieprz. Ton télégramme 2 (« КОННАЯ АРМИЯ СТОИТ У ЛЬВОВА ») est une version simplifiée de la même nouvelle.",
      "tasksTitle": "Exercices",
      "tasks": [
        "Combien de jours se sont écoulés entre l’interception du télégramme et sa lecture ?",
        "Qui a signé l’ordre ? Trouve les noms des trois chefs.",
        "Trouve Lwów sur la carte. De quel côté devait aller la 1re armée de cavalerie : vers Varsovie ou vers Lwów ?"
      ],
      "answers": [
        "Un jour : intercepté le 24 juillet, lu le 25 juillet.",
        "Iegorov (Jegorow), Staline et Petine (Pietin) ; vérifié par Krauklis, chiffré par Vanine.",
        "Vers Lwów et le San — loin de Varsovie."
      ],
      "sourceLabel": "Source :"
    },
    story: {
      title: 'Le miracle de la Vistule et les télégrammes secrets',
      sub: 'Une histoire vraie d’août 1920',
      sections: [
        ['L’année 1920', 'La Pologne est libre depuis peu, depuis 1918, après 123 ans de domination étrangère. De l’est arrive l’Armée rouge de la Russie bolchevique. Son chef, Mikhaïl Toukhatchevski, termina un ordre par ces mots : « À l’Ouest ! ». Les bolcheviks voulaient traverser la Pologne jusqu’à l’Allemagne et plus loin, pour faire leur révolution partout. En août, ils arrivèrent devant Varsovie.'],
        ['Les oreilles de l’armée polonaise', 'Les chefs envoyaient leurs ordres par radio, et tout le monde peut capter les ondes. C’est pourquoi les télégrammes étaient chiffrés. Les stations polonaises notaient tout, et le lieutenant Jan Kowalewski cassait les chiffres avec les mathématiciens Wacław Sierpiński, Stefan Mazurkiewicz et Stanisław Leśniewski. Selon la légende, Kowalewski remplaçait un collègue de garde, se mit à chercher la clé par ennui et trouva sa première lettre, И, dans le mot ДИВИЗИЯ. Les Polonais cassèrent une centaine de chiffres ; rien qu’en août 1920, ils lurent 410 télégrammes, souvent le jour même ou le lendemain.'],
        ['Le plan de Piłsudski', 'Les télégrammes montraient que la 4e armée marchait loin vers l’ouest, vers la Vistule près de Płock et Włocławek, et que la cavalerie de Boudienny se battait loin, près de Lwów. Au sud de Varsovie, sur la Wieprz, les Rouges avaient peu de soldats. Józef Piłsudski y rassembla des troupes et, le 16 août, frappa depuis la Wieprz vers le nord, dans le point faible. L’Armée rouge dut reculer.'],
        ['La radio brouillée', 'Dans la nuit du 14 au 15 août, des uhlans polonais entrèrent dans Ciechanów et détruisirent une station radio de la 4e armée. La dernière station de cette armée émettait sur une longueur d’onde que les Polonais connaissaient. Quand Toukhatchevski ordonna à la 4e armée de tourner vers le sud, une station polonaise de Varsovie émit sans arrêt pendant près de deux jours sur cette même onde… des passages de la Bible, en morse. L’ordre n’arriva pas, et la 4e armée continua dans la mauvaise direction.'],
        ['Pourquoi un « miracle » ?', 'La bataille de Varsovie dura du 12 au 25 août 1920. Le tournant arriva vers le 15 août, jour de l’Assomption, et le journaliste Stanisław Stroński appela la victoire le « miracle de la Vistule ». Mais elle fut aussi gagnée par le courage des soldats et des volontaires, les alliés ukrainiens de Symon Petlioura, un bon plan — et les mathématiques. Aujourd’hui, le 15 août est la fête de l’armée polonaise.'],
      ],
      west: ['Pourquoi c’était important pour tout l’Occident', 'Si Varsovie était tombée, l’Armée rouge se serait trouvée à la frontière de l’Allemagne, épuisée par la Première Guerre mondiale, où les bolcheviks espéraient une révolution — et de là, la France et le reste de l’Europe de l’Ouest ne sont pas loin. La victoire arrêta cette marche : la Pologne garda sa liberté et la révolution n’alla pas plus à l’ouest. Le diplomate britannique lord D’Abernon, qui était à Varsovie en 1920, l’appela la dix-huitième bataille décisive de l’histoire du monde — une de celles qui ont changé l’histoire.'],
      next: ['La suite', 'Le Bureau du chiffre continua son travail. En 1932, trois jeunes mathématiciens de ce bureau — Marian Rejewski, Jerzy Różycki et Henryk Zygalski — cassèrent l’Enigma allemande, et en juillet 1939 ils partagèrent leur savoir avec les Britanniques et les Français. Une fois encore, ils aidèrent tout l’Occident.'],
      simpl: 'Nos télégrammes sont courts ; nous les avons écrits d’après ce que les Polonais ont vraiment appris. Les vrais chiffres de l’Armée rouge étaient variés et souvent plus difficiles, et les vrais télégrammes n’avaient pas d’espaces entre les mots.',
      mapTitle: 'La bataille de Varsovie, vers les 15–16 août 1920',
    },
  },

  it: {
    title: "I telegrammi segreti del 1920",
    appTitle: "📻 Il miracolo della Vistola — I telegrammi segreti del 1920",
    appSub: 'Agosto 1920, l’Armata Rossa alle porte di Varsavia. Leggi i telegrammi intercettati come l’intelligence radio polacca, consiglia al comandante supremo dove attaccare e scopri la storia del miracolo della Vistola. Una scheda da stampare con le soluzioni.',
    level: 'Livello', levels: { easy: '★ Chiave quasi pronta', mid: '★★ Mezza chiave', hard: '★★★ Come Kowalewski', expert: '★★★★ Senza spazi, come un vero telegramma' },
    optStory: 'Pagina con la storia del miracolo della Vistola',
    mission: {
      sub: 'Lavori nell’intelligence radio polacca. Agosto 1920.',
      intro: 'L’Armata Rossa è alle porte di Varsavia. I suoi comandanti mandano ordini via radio, e le stazioni polacche ascoltano tutto. I telegrammi sono cifrati: ogni lettera dell’alfabeto russo è diventata un numero. Tutti e tre i telegrammi hanno la stessa chiave.',
      hintTitle: 'Il trucco del tenente Kowalewski',
      hint: 'La parola ДИВИЗИЯ (divisione) ha la stessa lettera И ai posti 2, 4 e 6. Nel telegramma 1 trova una parola di 7 numeri in cui i numeri ai posti 2, 4 e 6 sono uguali, e scrivi le sue lettere nella chiave.',
      easyNext: 'La chiave ha già quasi tutte le lettere — mancano solo quelle della parola ДИВИЗИЯ. Completala e leggi i telegrammi: sotto ogni numero scrivi la sua lettera.',
      midNext: "Metà della chiave è già scritta. Aggiungi le lettere di ДИВИЗИЯ, scrivi le lettere note sotto i numeri e indovina le parole mancanti con il glossario: aggiungi ogni nuova lettera alla chiave.",
      hardNext: 'Poi continua a indovinare come un vero crittologo: prendi una parola di cui conosci già qualche lettera e cerca nel glossario una parola della stessa lunghezza che vada bene. Scrivi ogni nuova lettera nella chiave — servirà in altre parole.',
      expertHint: "I veri telegrammi non avevano spazi tra le parole: i numeri andavano a gruppi di cinque, e una parola può cominciare a metà di un gruppo. Cerca 7 numeri di fila in cui il 2°, il 4° e il 6° sono uguali: potrebbe essere ДИВИЗИЯ. Attenzione: lo schema può andare bene in due punti; controlla quale dà parole sensate.",
      expertNext: "Poi cerca nella fila di numeri parole del glossario che vadano bene con le lettere note, e segna con una lineetta dove finisce ogni parola. Scrivi ogni nuova lettera nella chiave.",
      keyTitle: 'La chiave del giorno', keyNote: 'numero → lettera',
      glossTitle: 'Piccolo glossario russo-italiano',
      tg: n => `Telegramma ${n}`,
    },
    heads: [
      'da: comando della 4ª Armata · a: comando del Fronte occidentale · intercettato il 13/08/1920',
      { budyonny: 'da: 1ª Armata di cavalleria · a: comando del fronte · intercettato il 14/08/1920', mozyr: 'da: Gruppo di Mozyr · a: comando del fronte · intercettato il 14/08/1920' },
      'da: comandante del Fronte occidentale · a: 4ª Armata · intercettato il 15/08/1920',
    ],
    report: {
      title: 'Rapporto per il comandante supremo',
      q: [
        'Dove va la 4ª Armata? (telegramma 1)',
        'Che cosa dice di importante il telegramma 2?',
        'Dove deve attaccare l’esercito polacco? Cerchia sulla mappa la freccia A, B o C.',
        'Il telegramma 3 è un ordine per la 4ª Armata. Come possono i radiotelegrafisti polacchi fare in modo che la 4ª Armata non lo senta?',
      ],
    },
    map: {
      cities: { warsaw: 'Varsavia', plock: 'Płock', wloclawek: 'Włocławek', torun: 'Toruń', ciechanow: 'Ciechanów', deblin: 'Dęblin', lublin: 'Lublino', lwow: 'Leopoli', krakow: 'Cracovia', brest: 'Brest', bialystok: 'Białystok', przemysl: 'Przemyśl' },
      rivers: { vistula: 'Vistola', wieprz: 'Wieprz', bug: 'Bug', narew: 'Narew', wkra: 'Wkra', san: 'San' },
      prussia: 'Prussia Orientale (Germania)', berlin: 'verso Berlino ~520 km', poland: 'POLONIA', pl5: '5ª Armata',
      units: { army4: '4ª Armata', main: 'forze principali', mozyr: 'Gruppo di Mozyr', cav: '1ª Armata di cavalleria' },
      red: 'Armata Rossa', strike: '16/08: l’attacco', jam: 'disturbo radio',
    },
    gloss: {
      'АРМИИ': 'all’armata', 'АРМИЯ': 'armata', 'БУДЕННЫЙ': 'Budënnyj — comandante della 1ª Armata di cavalleria',
      'ВИСЛЕ': 'Vistola (К ВИСЛЕ = verso la Vistola)', 'ВЛОЦЛАВЕК': 'Włocławek', 'ГРУППЫ': 'del gruppo',
      'ДИВИЗИЯ': 'divisione (grande reparto dell’esercito)', 'ИДЕТ': 'va, marcia', 'К': 'verso', 'КОННАЯ': 'di cavalleria',
      'ЛЬВОВА': 'Leopoli (У ЛЬВОВА = vicino a Leopoli)', 'МАЛО': 'poche, poco', 'МОЗЫРСКОЙ': 'di Mozyr', 'НА': 'su, verso',
      'ПЛОЦК': 'Płock', 'ПОВЕРНУТЬ': 'girare, voltare', 'СИЛ': 'forze (soldati)', 'СТОИТ': 'sta, si trova',
      'ТУХАЧЕВСКИЙ': 'Tuchačevskij — comandante del Fronte occidentale', 'У': 'presso, vicino a; У … = … ha', 'ЧЕТВЕРТОЙ': 'quarta',
      'ШУВАЕВ': 'Šuvaev — comandante della 4ª Armata', 'ЮГ': 'sud',
    },
    answers: {
      keyTitle: 'Tutta la chiave del giorno',
      pattern: n => `ДИВИЗИЯ è la parola n. ${n} del telegramma 1.`,
      tr: {
        plock: 'La divisione marcia su Płock. — Šuvaev', wloclawek: 'La divisione di cavalleria marcia su Włocławek. — Šuvaev',
        vistula: 'La divisione marcia verso la Vistola. — Šuvaev', budyonny: 'L’Armata di cavalleria è vicino a Leopoli. — Budënnyj',
        mozyr: 'Il Gruppo di Mozyr ha pochi soldati.', turn: 'La quarta Armata deve girare verso sud. — Tuchačevskij',
      },
      a1: {
        plock: 'Verso ovest, su Płock — lontano da Varsavia.', wloclawek: 'Verso ovest, su Włocławek — lontano da Varsavia.',
        vistula: 'Verso ovest, verso la Vistola vicino a Płock e Włocławek — lontano da Varsavia.',
      },
      a2: {
        budyonny: 'La cavalleria di Budënnyj è lontana, vicino a Leopoli — non può aiutare a Varsavia. A sud di Varsavia il nemico è debole.',
        mozyr: 'Il Gruppo di Mozyr, a sud di Varsavia, ha pochi soldati — è il punto debole del nemico.',
      },
      a3: 'A — dal fiume Wieprz verso nord, nel punto debole del nemico. È ciò che fece Józef Piłsudski il 16 agosto 1920.',
      a4: 'Disturbare l’ordine: trasmettere sulla stessa lunghezza d’onda. Una stazione polacca a Varsavia trasmise senza sosta per quasi due giorni brani della Bibbia, e l’ordine non arrivò mai.',
    },
    abc: {"title": "L’alfabeto russo", "sounds": "a b v g d ie io ž z i j k l m n o p r s t u f ch z c sc šč – y – e iu ia", "note": "Come si leggono le lettere (Ч come «c» di ciao, Ш come «sc» di scena, Ц come «z» di zio, Х come «ch» tedesco). Ъ e Ь non hanno un suono proprio (segno duro e molle). Nei telegrammi si scriveva Е al posto di Ё."},
    optHow: "Pagina «Come funziona il cifrario?»",
    how: {
      "title": "Come funziona il cifrario dei telegrammi?",
      "sub": "Leggi prima di forzare i telegrammi",
      "s1": [
        "1. Un cifrario cambia le lettere in numeri",
        "Il cifratore aveva una tabella segreta: la chiave. Accanto a ogni lettera dell’alfabeto russo c’era un numero. Scriveva il messaggio, cambiava ogni lettera nel suo numero, e il radiotelegrafista trasmetteva solo numeri, in alfabeto Morse. Chi non ha la chiave sente solo numeri."
      ],
      "keyPiece": "Un pezzo della chiave",
      "plain": "parola",
      "cipher": "nel telegramma",
      "s2": [
        "2. Chi riceve ha la chiave",
        "Un comandante con la stessa chiave fa lo stesso al contrario: per ogni numero cerca la lettera. 47 → Д, 35 → И, 58 → В… e legge: ДИВИЗИЯ (divisione)."
      ],
      "s3": [
        "3. Il punto debole: stessa lettera = stesso numero",
        "La lettera И è in ДИВИЗИЯ tre volte, quindi anche il numero 35 compare tre volte, ai posti 2, 4 e 6. Questa «impronta digitale» della parola resta nel telegramma anche se non conosciamo la chiave. Basta notarla."
      ],
      "s4t": "4. Come forzare il cifrario senza chiave",
      "steps": [
        "Indovina una parola che c’è di sicuro in un telegramma militare: divisione, armata, il nome di un comandante.",
        "Trova nel telegramma numeri con la stessa impronta di quella parola.",
        "Scrivi le lettere trovate nella chiave: ora conosci alcuni numeri.",
        "Scrivi quelle lettere dovunque ci sono gli stessi numeri. Dai pezzi indovinerai altre parole (il glossario aiuta).",
        "Ripeti finché leggi tutto il telegramma. Così lavoravano Jan Kowalewski e i matematici nel 1920."
      ],
      "s5": [
        "5. I veri cifrari del 1920",
        "Spesso erano più difficili del nostro: le chiavi cambiavano spesso, e il 12 agosto 1920 i bolscevichi introdussero un nuovo cifrario chiamato «Rivoluzione». Ma i cifratori facevano errori, ripetendo le stesse parole e firme, e i crittologi polacchi forzavano anche le chiavi nuove in poche ore."
      ],
      "s6": [
        "6. E oggi?",
        "Anche i messaggi del telefono sono cifrati. Ma i computer usano chiavi così difficili che nessuno può indovinarle dalle impronte delle parole. L’idea resta la stessa: senza chiave si vedono solo numeri."
      ],
      "warmT": "Riscaldamento",
      "w1": "Decifra con il pezzo di chiave nel riquadro: 37 82 66 35 91 = ? Che cosa vuol dire? (guarda il glossario)",
      "w2": "Qualcuno ha cifrato la parola МАМА (mamma) con un’altra chiave. Quale scrittura va bene? Cerchiala.",
      "w2opts": [
        "12 40 12 40",
        "12 40 33 40",
        "12 12 40 40"
      ],
      "a1": "АРМИЯ — armata.",
      "a2": "12 40 12 40: М e А si ripetono, proprio come 12 e 40.",
      "levelsT": "I livelli della scheda",
      "levels": [
        "★ — la chiave è quasi piena; mancano solo le lettere di ДИВИЗИЯ.",
        "★★ — metà della chiave è pronta: parti da ДИВИЗИЯ e indovini le altre parole con il glossario.",
        "★★★ — la chiave è vuota: parti da ДИВИЗИЯ e indovini il resto con il glossario.",
        "★★★★ — come un vero telegramma: niente spazi tra le parole, numeri a gruppi di cinque."
      ]
    },
    optReal: "Curiosità: un vero telegramma del 1920",
    real: {
      "photoTitle": "Foto dell’originale: «Traduzione di un cifrogramma», Ufficio cifra, Varsavia, 25 luglio 1920",
      "photoCap": "In basso a destra la firma a mano del tenente Jan Kowalewski, capo della Sezione 2. La matita blu («do 5» — «al 5») l’ha aggiunta qualcuno che lesse il telegramma al comando. Nella pagina seguente il testo ricopiato e spiegato.",
      "title": "Curiosità: un vero telegramma del 1920",
      "sub": "Intercettato il 24 luglio, letto il 25 luglio — firmato dal tenente Kowalewski",
      "intro": "Ecco com’era davvero il lavoro dell’Ufficio cifra. Il 24 luglio 1920 il cifratore bolscevico Vanin cifrò un ordine del comando del Fronte sud-occidentale. Gli ascoltatori polacchi lo intercettarono quel giorno stesso, e il giorno dopo era pronta la traduzione polacca, firmata da Jan Kowalewski. Il documento si conserva in un archivio a New York. Eccolo, ricopiato in polacco con l’ortografia del 1920:",
      "translTitle": "Che cosa dice l’ordine, in italiano",
      "transl": "Ordine alle armate del Fronte sud-occidentale (l’inizio non è stato ricevuto). Punto 2: le truppe — da tutto l’ordine si capisce che si tratta della 1ª Armata di cavalleria di Budënnyj — devono andare nella zona di Leopoli e Rava Ruska e mandare avanti i reparti per prendere i passaggi sul fiume San vicino a Sieniawa e Przemyśl. Punto 3: la 14ª Armata deve spezzare la difesa nemica sul fiume Zbruč e attaccare con tutte le forze verso Tarnopol, Przemyśl e Gródek. Punto 4: i confini tra le armate, per es. tra la 12ª Armata e il Fronte occidentale: Dąbrowica–Ratno–Włodawa–Puławy (la fine non è stata ricevuta).",
      "notesTitle": "Glossario del documento",
      "notes": [
        [
          "(przerwa), (początku brak)",
          "«(interruzione)», «(manca l’inizio)»: questi pezzi non furono sentiti — la radio gracchiava o la stazione smise di trasmettere"
        ],
        [
          "armja, linja",
          "l’ortografia polacca del 1920; oggi armia, linia (armata, linea)"
        ],
        [
          "D-ców",
          "ai comandanti"
        ],
        [
          "I-j konnej",
          "della 1ª Armata di cavalleria (di Budënnyj)"
        ],
        [
          "Nowa Aleksandrja",
          "vecchio nome della città di Puławy"
        ],
        [
          "Zaszyfrował WANIN",
          "«cifrato da Vanin», il cifratore bolscevico"
        ],
        [
          "STALIN",
          "Iosif Stalin — più tardi dittatore dell’Unione Sovietica per quasi 30 anni"
        ],
        [
          "Sz. № 31724",
          "il numero del telegramma all’Ufficio cifra — ce n’erano migliaia"
        ]
      ],
      "whyTitle": "Perché questo telegramma era importante",
      "why": "L’ordine dice che la cavalleria di Budënnyj deve andare verso Leopoli e il San — a sud-ovest, non a nord verso Varsavia. Grazie a telegrammi come questo Piłsudski sapeva che la cavalleria non sarebbe arrivata in tempo ad aiutare a Varsavia, e poté preparare l’attacco dal Wieprz. Il tuo telegramma 2 («КОННАЯ АРМИЯ СТОИТ У ЛЬВОВА») è una versione semplificata della stessa notizia.",
      "tasksTitle": "Esercizi",
      "tasks": [
        "Quanti giorni passarono tra l’intercettazione del telegramma e la sua lettura?",
        "Chi firmò l’ordine? Trova i nomi dei tre comandanti.",
        "Trova Leopoli sulla mappa. Dove doveva andare la 1ª Armata di cavalleria: verso Varsavia o verso Leopoli?"
      ],
      "answers": [
        "Un giorno: intercettato il 24 luglio, letto il 25 luglio.",
        "Egorov (Jegorow), Stalin e Petin (Pietin); controllato da Krauklis, cifrato da Vanin.",
        "Verso Leopoli e il San — lontano da Varsavia."
      ],
      "sourceLabel": "Fonte:"
    },
    story: {
      title: 'Il miracolo della Vistola e i telegrammi segreti',
      sub: 'Una storia vera dell’agosto 1920',
      sections: [
        ['L’anno 1920', 'La Polonia è libera da poco, dal 1918, dopo 123 anni di dominio straniero. Da est arriva l’Armata Rossa della Russia bolscevica. Il suo comandante Michail Tuchačevskij chiuse un ordine con le parole «A Ovest!». I bolscevichi volevano attraversare la Polonia fino alla Germania e oltre, per fare ovunque la loro rivoluzione. Ad agosto arrivarono davanti a Varsavia.'],
        ['Le orecchie dell’esercito polacco', 'I comandanti mandavano gli ordini via radio, e le onde radio le può sentire chiunque. Per questo i telegrammi erano cifrati. Le stazioni polacche annotavano tutto, e il tenente Jan Kowalewski forzava i cifrari insieme ai matematici Wacław Sierpiński, Stefan Mazurkiewicz e Stanisław Leśniewski. Secondo la leggenda, Kowalewski sostituiva un collega di turno, cominciò a cercare la chiave per noia e trovò la prima lettera, И, nella parola ДИВИЗИЯ. I polacchi forzarono circa cento cifrari; solo nell’agosto 1920 lessero 410 telegrammi, di solito lo stesso giorno o il giorno dopo.'],
        ['Il piano di Piłsudski', 'I telegrammi dicevano che la 4ª Armata marciava lontano verso ovest, verso la Vistola vicino a Płock e Włocławek, e che la cavalleria di Budënnyj combatteva lontano, vicino a Leopoli. A sud di Varsavia, sul fiume Wieprz, i rossi avevano pochi soldati. Józef Piłsudski radunò lì le truppe e il 16 agosto attaccò dal Wieprz verso nord, nel punto debole. L’Armata Rossa dovette ritirarsi.'],
        ['La radio disturbata', 'Nella notte tra il 14 e il 15 agosto gli ulani polacchi entrarono a Ciechanów e distrussero una stazione radio della 4ª Armata. L’ultima stazione di quell’armata trasmetteva su una lunghezza d’onda che i polacchi conoscevano. Quando Tuchačevskij ordinò alla 4ª Armata di girare verso sud, una stazione polacca a Varsavia trasmise senza sosta per quasi due giorni su quella stessa onda… brani della Bibbia, in alfabeto Morse. L’ordine non arrivò, e la 4ª Armata continuò a marciare nella direzione sbagliata.'],
        ['Perché «miracolo»?', 'La battaglia di Varsavia durò dal 12 al 25 agosto 1920. La svolta arrivò verso il 15 agosto, festa dell’Assunzione, e per questo il giornalista Stanisław Stroński chiamò la vittoria «miracolo della Vistola». Ma l’hanno vinta anche il coraggio dei soldati e dei volontari, gli alleati ucraini di Symon Petljura, un buon piano — e la matematica. Oggi il 15 agosto è la festa delle forze armate polacche.'],
      ],
      west: ['Perché fu importante per tutto l’Occidente', 'Se Varsavia fosse caduta, l’Armata Rossa sarebbe arrivata al confine della Germania, stremata dalla Prima guerra mondiale, dove i bolscevichi speravano in una rivoluzione — e da lì la Francia e il resto dell’Europa occidentale non sono lontani. La vittoria fermò quella marcia: la Polonia conservò la libertà e la rivoluzione non andò più a ovest. Il diplomatico britannico lord D’Abernon, che nel 1920 era a Varsavia, la chiamò la diciottesima battaglia decisiva della storia del mondo — una di quelle che hanno cambiato la storia.'],
      next: ['Che cosa successe dopo', 'L’Ufficio cifra continuò a lavorare. Nel 1932 tre giovani matematici di quell’ufficio — Marian Rejewski, Jerzy Różycki e Henryk Zygalski — forzarono l’Enigma tedesca, e nel luglio 1939 condivisero ciò che sapevano con britannici e francesi. Ancora una volta aiutarono tutto l’Occidente.'],
      simpl: 'I nostri telegrammi sono brevi; li abbiamo scritti in base a ciò che i polacchi scoprirono davvero. I veri cifrari dell’Armata Rossa erano di tanti tipi e di solito più difficili, e nei veri telegrammi non c’erano spazi tra le parole.',
      mapTitle: 'La battaglia di Varsavia, verso il 15–16 agosto 1920',
    },
  },

  es: {
    title: "Los telegramas secretos de 1920",
    appTitle: "📻 El milagro del Vístula — Los telegramas secretos de 1920",
    appSub: 'Agosto de 1920, el Ejército Rojo a las puertas de Varsovia. Lee telegramas interceptados como el servicio de escucha polaco, aconseja al comandante en jefe dónde atacar y descubre la historia del milagro del Vístula. Una ficha para imprimir con soluciones.',
    level: 'Nivel', levels: { easy: '★ Clave casi lista', mid: '★★ Media clave', hard: '★★★ Como Kowalewski', expert: '★★★★ Sin espacios, como un telegrama real' },
    optStory: 'Página con la historia del milagro del Vístula',
    mission: {
      sub: 'Trabajas en el servicio de escucha de radio polaco. Agosto de 1920.',
      intro: 'El Ejército Rojo está a las puertas de Varsovia. Sus jefes envían órdenes por radio, y las estaciones polacas lo escuchan todo. Los telegramas están cifrados: cada letra del alfabeto ruso se ha convertido en un número. Los tres telegramas tienen la misma clave.',
      hintTitle: 'El truco del teniente Kowalewski',
      hint: 'La palabra ДИВИЗИЯ (división) tiene la misma letra И en los lugares 2, 4 y 6. En el telegrama 1 busca una palabra de 7 números cuyos números en los lugares 2, 4 y 6 sean iguales, y escribe sus letras en la clave.',
      easyNext: 'La clave ya tiene casi todas las letras: solo faltan las de la palabra ДИВИЗИЯ. Complétala y lee los telegramas: debajo de cada número escribe su letra.',
      midNext: "La mitad de la clave ya está escrita. Añade las letras de ДИВИЗИЯ, escribe las letras conocidas debajo de los números y adivina las palabras que faltan con el glosario: añade cada letra nueva a la clave.",
      hardNext: 'Después sigue adivinando como un verdadero criptólogo: toma una palabra de la que ya conozcas algunas letras y busca en el glosario una palabra de la misma longitud que encaje. Escribe cada letra nueva en la clave: te servirá en otras palabras.',
      expertHint: "Los telegramas reales no tenían espacios entre palabras: los números iban en grupos de cinco, y una palabra puede empezar en medio de un grupo. Busca 7 números seguidos en los que el 2.º, el 4.º y el 6.º sean iguales: puede ser ДИВИЗИЯ. Cuidado: el patrón puede encajar en dos sitios; comprueba cuál da palabras con sentido.",
      expertNext: "Después busca en la fila de números palabras del glosario que encajen con las letras conocidas, y marca con una raya dónde termina cada palabra. Escribe cada letra nueva en la clave.",
      keyTitle: 'La clave del día', keyNote: 'número → letra',
      glossTitle: 'Pequeño glosario ruso-español',
      tg: n => `Telegrama ${n}`,
    },
    heads: [
      'de: cuartel del 4.º Ejército · a: cuartel del Frente Occidental · interceptado el 13/08/1920',
      { budyonny: 'de: 1.er Ejército de Caballería · a: cuartel del frente · interceptado el 14/08/1920', mozyr: 'de: Grupo de Mozyr · a: cuartel del frente · interceptado el 14/08/1920' },
      'de: jefe del Frente Occidental · a: 4.º Ejército · interceptado el 15/08/1920',
    ],
    report: {
      title: 'Informe para el comandante en jefe',
      q: [
        '¿Adónde va el 4.º Ejército? (telegrama 1)',
        '¿Qué dice de importante el telegrama 2?',
        '¿Dónde debe atacar el ejército polaco? Rodea en el mapa la flecha A, B o C.',
        'El telegrama 3 es una orden para el 4.º Ejército. ¿Cómo pueden los radiotelegrafistas polacos conseguir que el 4.º Ejército no la oiga?',
      ],
    },
    map: {
      cities: { warsaw: 'Varsovia', plock: 'Płock', wloclawek: 'Włocławek', torun: 'Toruń', ciechanow: 'Ciechanów', deblin: 'Dęblin', lublin: 'Lublin', lwow: 'Leópolis', krakow: 'Cracovia', brest: 'Brest', bialystok: 'Białystok', przemysl: 'Przemyśl' },
      rivers: { vistula: 'Vístula', wieprz: 'Wieprz', bug: 'Bug', narew: 'Narew', wkra: 'Wkra', san: 'San' },
      prussia: 'Prusia Oriental (Alemania)', berlin: 'a Berlín ~520 km', poland: 'POLONIA', pl5: '5.º Ejército',
      units: { army4: '4.º Ejército', main: 'fuerzas principales', mozyr: 'Grupo de Mozyr', cav: '1.er Ejército de Caballería' },
      red: 'Ejército Rojo', strike: '16/08: el ataque', jam: 'interferencia',
    },
    gloss: {
      'АРМИИ': 'al ejército', 'АРМИЯ': 'ejército', 'БУДЕННЫЙ': 'Budionni — jefe del 1.er Ejército de Caballería',
      'ВИСЛЕ': 'Vístula (К ВИСЛЕ = hacia el Vístula)', 'ВЛОЦЛАВЕК': 'Włocławek', 'ГРУППЫ': 'del grupo',
      'ДИВИЗИЯ': 'división (gran unidad del ejército)', 'ИДЕТ': 'va, marcha', 'К': 'hacia', 'КОННАЯ': 'de caballería',
      'ЛЬВОВА': 'Leópolis (У ЛЬВОВА = cerca de Leópolis)', 'МАЛО': 'pocas, poco', 'МОЗЫРСКОЙ': 'de Mozyr', 'НА': 'sobre, hacia',
      'ПЛОЦК': 'Płock', 'ПОВЕРНУТЬ': 'girar', 'СИЛ': 'fuerzas (soldados)', 'СТОИТ': 'está',
      'ТУХАЧЕВСКИЙ': 'Tujachevski — jefe del Frente Occidental', 'У': 'junto a, cerca de; У … = … tiene', 'ЧЕТВЕРТОЙ': 'cuarto',
      'ШУВАЕВ': 'Shuváyev — jefe del 4.º Ejército', 'ЮГ': 'sur',
    },
    answers: {
      keyTitle: 'Toda la clave del día',
      pattern: n => `ДИВИЗИЯ es la palabra n.º ${n} del telegrama 1.`,
      tr: {
        plock: 'La división marcha sobre Płock. — Shuváyev', wloclawek: 'La división de caballería marcha sobre Włocławek. — Shuváyev',
        vistula: 'La división marcha hacia el Vístula. — Shuváyev', budyonny: 'El Ejército de Caballería está cerca de Leópolis. — Budionni',
        mozyr: 'El Grupo de Mozyr tiene pocos soldados.', turn: 'El cuarto Ejército debe girar hacia el sur. — Tujachevski',
      },
      a1: {
        plock: 'Hacia el oeste, sobre Płock: lejos de Varsovia.', wloclawek: 'Hacia el oeste, sobre Włocławek: lejos de Varsovia.',
        vistula: 'Hacia el oeste, al Vístula cerca de Płock y Włocławek: lejos de Varsovia.',
      },
      a2: {
        budyonny: 'La caballería de Budionni está lejos, cerca de Leópolis: no puede ayudar en Varsovia. Al sur de Varsovia el enemigo es débil.',
        mozyr: 'El Grupo de Mozyr, al sur de Varsovia, tiene pocos soldados: ese es el punto débil del enemigo.',
      },
      a3: 'A — desde el río Wieprz hacia el norte, al punto débil del enemigo. Eso hizo Józef Piłsudski el 16 de agosto de 1920.',
      a4: 'Interferir la orden: emitir en la misma longitud de onda. Una estación polaca en Varsovia emitió sin parar durante casi dos días pasajes de la Biblia, y la orden nunca llegó.',
    },
    abc: {"title": "El alfabeto ruso", "sounds": "a b v g d ie io zh z i i k l m n o p r s t u f j ts ch sh shch – y – e iu ia", "note": "Cómo suenan las letras. Ъ y Ь no tienen sonido propio (signo duro y signo blando). Ы es una «i» profunda. En los telegramas se escribía Е en lugar de Ё."},
    optHow: "Página «¿Cómo funciona el cifrado?»",
    how: {
      "title": "¿Cómo funciona el cifrado de los telegramas?",
      "sub": "Léelo antes de empezar a romper los telegramas",
      "s1": [
        "1. Un cifrado cambia letras por números",
        "El cifrador tenía una tabla secreta: la clave. Junto a cada letra del alfabeto ruso había un número. Escribía el mensaje, cambiaba cada letra por su número, y el radiotelegrafista solo enviaba números, en código Morse. Quien no tiene la clave solo oye números."
      ],
      "keyPiece": "Un trozo de la clave",
      "plain": "palabra",
      "cipher": "en el telegrama",
      "s2": [
        "2. El que recibe tiene la clave",
        "Un jefe con la misma clave hace lo mismo al revés: para cada número busca la letra. 47 → Д, 35 → И, 58 → В… y lee: ДИВИЗИЯ (división)."
      ],
      "s3": [
        "3. El punto débil: misma letra = mismo número",
        "La letra И está tres veces en ДИВИЗИЯ, así que el número 35 también aparece tres veces, en los lugares 2, 4 y 6. Esta «huella digital» de la palabra queda en el telegrama aunque no conozcamos la clave. Solo hay que verla."
      ],
      "s4t": "4. Cómo romper el cifrado sin la clave",
      "steps": [
        "Adivina una palabra que seguro está en un telegrama militar: división, ejército, el nombre de un jefe.",
        "Busca en el telegrama números con la misma huella que esa palabra.",
        "Escribe las letras encontradas en la clave: ya conoces algunos números.",
        "Escribe esas letras en todos los sitios donde están los mismos números. Con los trozos adivinarás otras palabras (el glosario ayuda).",
        "Repite hasta leer todo el telegrama. Así trabajaban Jan Kowalewski y los matemáticos en 1920."
      ],
      "s5": [
        "5. Los cifrados reales de 1920",
        "A menudo eran más difíciles que el nuestro: las claves cambiaban con frecuencia, y el 12 de agosto de 1920 los bolcheviques introdujeron un cifrado nuevo llamado «Revolución». Pero los cifradores cometían errores —repetían las mismas palabras y firmas— y los criptólogos polacos rompían incluso las claves nuevas en pocas horas."
      ],
      "s6": [
        "6. ¿Y hoy?",
        "Los mensajes del móvil también van cifrados. Pero los ordenadores usan claves tan difíciles que nadie puede adivinarlas por las huellas de las palabras. La idea sigue siendo la misma: sin la clave solo se ven números."
      ],
      "warmT": "Calentamiento",
      "w1": "Descifra con el trozo de clave del recuadro: 37 82 66 35 91 = ? ¿Qué significa? (mira el glosario)",
      "w2": "Alguien cifró la palabra МАМА (mamá) con otra clave. ¿Qué escritura encaja? Rodéala.",
      "w2opts": [
        "12 40 12 40",
        "12 40 33 40",
        "12 12 40 40"
      ],
      "a1": "АРМИЯ — ejército.",
      "a2": "12 40 12 40: М y А se repiten, igual que 12 y 40.",
      "levelsT": "Los niveles de la ficha",
      "levels": [
        "★ — la clave está casi llena; solo faltan las letras de ДИВИЗИЯ.",
        "★★ — la mitad de la clave está lista: empiezas por ДИВИЗИЯ y adivinas las demás palabras con el glosario.",
        "★★★ — la clave está vacía: empiezas por ДИВИЗИЯ y sigues adivinando con el glosario.",
        "★★★★ — como un telegrama real: sin espacios entre palabras, números en grupos de cinco."
      ]
    },
    optReal: "Curiosidad: un telegrama real de 1920",
    real: {
      "photoTitle": "Foto del original: «Traducción de un cifrograma», Oficina de Cifrado, Varsovia, 25 de julio de 1920",
      "photoCap": "Abajo a la derecha, la firma a mano del teniente Jan Kowalewski, jefe de la Sección 2. El lápiz azul («do 5» — «al 5») lo añadió alguien que leyó el telegrama en el cuartel general. En la página siguiente está el texto copiado y explicado.",
      "title": "Curiosidad: un telegrama real de 1920",
      "sub": "Interceptado el 24 de julio, leído el 25 de julio — firmado por el teniente Kowalewski",
      "intro": "Así era de verdad el trabajo de la Oficina de Cifrado. El 24 de julio de 1920, el cifrador bolchevique Vanin cifró una orden del mando del Frente Suroccidental. Los escuchas polacos la interceptaron ese mismo día, y al día siguiente estaba lista la traducción polaca, firmada por Jan Kowalewski. El documento se conserva en un archivo de Nueva York. Aquí está, copiado en polaco con la ortografía de 1920:",
      "translTitle": "Qué dice la orden, en español",
      "transl": "Orden a los ejércitos del Frente Suroccidental (el principio no llegó). Punto 2: las tropas —por toda la orden se ve que se trata del 1.er Ejército de Caballería de Budionni— deben ir a la zona de Leópolis y Rava Ruska y enviar sus unidades de vanguardia a tomar los pasos sobre el río San cerca de Sieniawa y Przemyśl. Punto 3: el 14.º Ejército debe romper la defensa enemiga en el río Zbruch y atacar con todas sus fuerzas hacia Tarnopol, Przemyśl y Gródek. Punto 4: los límites entre ejércitos, p. ej. entre el 12.º Ejército y el Frente Occidental: Dąbrowica–Ratno–Włodawa–Puławy (el final no llegó).",
      "notesTitle": "Glosario del documento",
      "notes": [
        [
          "(przerwa), (początku brak)",
          "«(corte)», «(falta el principio)»: estos trozos no se oyeron: la radio crepitaba o la estación dejó de emitir"
        ],
        [
          "armja, linja",
          "la ortografía polaca de 1920; hoy armia, linia (ejército, línea)"
        ],
        [
          "D-ców",
          "a los jefes"
        ],
        [
          "I-j konnej",
          "del 1.er Ejército de Caballería (el de Budionni)"
        ],
        [
          "Nowa Aleksandrja",
          "antiguo nombre de la ciudad de Puławy"
        ],
        [
          "Zaszyfrował WANIN",
          "«lo cifró Vanin», el cifrador bolchevique"
        ],
        [
          "STALIN",
          "Iósif Stalin: más tarde dictador de la Unión Soviética durante casi 30 años"
        ],
        [
          "Sz. № 31724",
          "el número del telegrama en la Oficina de Cifrado: había miles"
        ]
      ],
      "whyTitle": "Por qué este telegrama era importante",
      "why": "La orden dice que la caballería de Budionni debe ir hacia Leópolis y el San: al suroeste, no al norte hacia Varsovia. Gracias a telegramas así, Piłsudski sabía que la caballería no llegaría a tiempo para ayudar en Varsovia, y pudo preparar el ataque desde el Wieprz. Tu telegrama 2 («КОННАЯ АРМИЯ СТОИТ У ЛЬВОВА») es una versión simplificada de la misma noticia.",
      "tasksTitle": "Ejercicios",
      "tasks": [
        "¿Cuántos días pasaron entre la interceptación del telegrama y su lectura?",
        "¿Quién firmó la orden? Busca los nombres de los tres jefes.",
        "Busca Leópolis en el mapa. ¿Hacia dónde debía ir el 1.er Ejército de Caballería: hacia Varsovia o hacia Leópolis?"
      ],
      "answers": [
        "Un día: interceptado el 24 de julio, leído el 25 de julio.",
        "Yegórov (Jegorow), Stalin y Petin (Pietin); lo cotejó Krauklis y lo cifró Vanin.",
        "Hacia Leópolis y el San: lejos de Varsovia."
      ],
      "sourceLabel": "Fuente:"
    },
    story: {
      title: 'El milagro del Vístula y los telegramas secretos',
      sub: 'Una historia real de agosto de 1920',
      sections: [
        ['El año 1920', 'Polonia es libre desde hace poco, desde 1918, después de 123 años bajo dominio extranjero. Desde el este avanza el Ejército Rojo de la Rusia bolchevique. Su jefe, Mijaíl Tujachevski, terminó una orden con las palabras «¡Hacia el Oeste!». Los bolcheviques querían cruzar Polonia hasta Alemania y más allá, y hacer su revolución en todas partes. En agosto llegaron a las puertas de Varsovia.'],
        ['Los oídos del ejército polaco', 'Los jefes enviaban órdenes por radio, y las ondas de radio las puede oír cualquiera. Por eso los telegramas se cifraban. Las estaciones polacas lo anotaban todo, y el teniente Jan Kowalewski rompía los cifrados junto con los matemáticos Wacław Sierpiński, Stefan Mazurkiewicz y Stanisław Leśniewski. Cuenta la leyenda que Kowalewski cubría la guardia de un compañero, empezó a buscar la clave por aburrimiento y encontró su primera letra, И, en la palabra ДИВИЗИЯ. Los polacos rompieron unos cien cifrados; solo en agosto de 1920 leyeron 410 telegramas, normalmente el mismo día o al siguiente.'],
        ['El plan de Piłsudski', 'Los telegramas mostraban que el 4.º Ejército marchaba lejos hacia el oeste, al Vístula cerca de Płock y Włocławek, y que la caballería de Budionni luchaba lejos, cerca de Leópolis. Al sur de Varsovia, junto al río Wieprz, los rojos tenían pocos soldados. Józef Piłsudski reunió allí tropas y el 16 de agosto atacó desde el Wieprz hacia el norte, por el punto débil. El Ejército Rojo tuvo que retirarse.'],
        ['La radio interferida', 'En la noche del 14 al 15 de agosto, ulanos polacos entraron en Ciechanów y destruyeron una estación de radio del 4.º Ejército. La última estación de ese ejército emitía en una longitud de onda que los polacos conocían. Cuando Tujachevski ordenó al 4.º Ejército girar hacia el sur, una estación polaca en Varsovia emitió sin parar durante casi dos días en esa misma onda… pasajes de la Biblia, en código Morse. La orden no llegó, y el 4.º Ejército siguió marchando en la dirección equivocada.'],
        ['¿Por qué «milagro»?', 'La batalla de Varsovia duró del 12 al 25 de agosto de 1920. El giro llegó hacia el 15 de agosto, fiesta de la Asunción, y por eso el periodista Stanisław Stroński llamó a la victoria el «milagro del Vístula». Pero también la ganaron el valor de los soldados y voluntarios, los aliados ucranianos de Simón Petliura, un buen plan… y las matemáticas. Hoy el 15 de agosto es el Día de las Fuerzas Armadas de Polonia.'],
      ],
      west: ['Por qué fue importante para todo Occidente', 'Si Varsovia hubiera caído, el Ejército Rojo habría llegado a la frontera de Alemania, agotada tras la Primera Guerra Mundial, donde los bolcheviques esperaban una revolución, y desde allí no quedan lejos Francia y el resto de Europa occidental. La victoria detuvo esa marcha: Polonia conservó su libertad y la revolución no llegó más al oeste. El diplomático británico lord D’Abernon, que estaba en Varsovia en 1920, la llamó la decimoctava batalla decisiva de la historia del mundo: una de las que cambiaron la historia.'],
      next: ['Lo que vino después', 'La Oficina de Cifrado siguió trabajando. En 1932, tres jóvenes matemáticos de esa oficina —Marian Rejewski, Jerzy Różycki y Henryk Zygalski— rompieron la Enigma alemana, y en julio de 1939 compartieron lo que sabían con británicos y franceses. Una vez más ayudaron a todo Occidente.'],
      simpl: 'Nuestros telegramas son cortos; los escribimos a partir de lo que los polacos descubrieron de verdad. Los cifrados reales del Ejército Rojo eran de muchos tipos y normalmente más difíciles, y los telegramas reales no tenían espacios entre palabras.',
      mapTitle: 'La batalla de Varsovia, hacia el 15–16 de agosto de 1920',
    },
  },
};
if (typeof module !== 'undefined') module.exports = W20_TEXT;
