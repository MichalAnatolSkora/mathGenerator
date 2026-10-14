/**
 * Texts of the mazes worksheet in seven languages (pl, en, uk, vi, fr, it, es). Classic script; defines
 * the global `MAZE_TEXT`. The kit (../sheet-kit/kit.js) adds the shared ones (seed, options, print…).
 * `goals` is the line over each maze, one per theme (the emoji are in engine.js, MAZE.THEMES).
 */
const MAZE_TEXT = {
  pl: {
    title: 'Labirynty — karta pracy',
    appTitle: '🐭 Labirynty — karta pracy',
    appSub: 'Karty A4 do druku: labirynty od małych 5×5 do jednego wielkiego, także okrągłe. Z rozwiązaniami.',
    level: 'Poziom', levels: { mix: 'Mieszane', small: 'Małe 5×5', medium: 'Średnie 8×8', large: 'Duże 12×12', big: 'Jeden wielki', round: 'Okrągłe' },
    theme: 'Postacie',
    themes: {
      mix: '🎲 Różne', mouse: '🐭 Myszka', bee: '🐝 Pszczółka', dog: '🐶 Piesek', bunny: '🐰 Króliczek', rocket: '🚀 Rakieta',
      squirrel: '🐿️ Wiewiórka', bear: '🐻 Miś', monkey: '🐵 Małpka', cat: '🐱 Kotek', car: '🚗 Autko',
    },
    sheetTitle: 'Labirynty',
    instr: 'Narysuj drogę przez labirynt od startu do celu. Nie przechodź przez ściany!',
    goals: {
      mouse: 'Pomóż myszce dojść do sera.', bee: 'Pomóż pszczółce dolecieć do kwiatka.', dog: 'Pomóż pieskowi dojść do kości.',
      bunny: 'Pomóż króliczkowi dojść do marchewki.', rocket: 'Pomóż rakiecie dolecieć do planety.',
      squirrel: 'Pomóż wiewiórce dojść do orzeszka.', bear: 'Pomóż misiowi dojść do miodu.', monkey: 'Pomóż małpce dojść do banana.',
      cat: 'Pomóż kotkowi dojść do rybki.', car: 'Pomóż autku dojechać do domu.',
    },
  },
  en: {
    title: 'Mazes — worksheet',
    appTitle: '🐭 Mazes — worksheet',
    appSub: 'Printable A4 sheets: mazes from small 5×5 ones to one giant maze, round ones too. With answer keys.',
    level: 'Level', levels: { mix: 'Mixed', small: 'Small 5×5', medium: 'Medium 8×8', large: 'Large 12×12', big: 'One giant maze', round: 'Round' },
    theme: 'Characters',
    themes: {
      mix: '🎲 Mixed', mouse: '🐭 Mouse', bee: '🐝 Bee', dog: '🐶 Dog', bunny: '🐰 Bunny', rocket: '🚀 Rocket',
      squirrel: '🐿️ Squirrel', bear: '🐻 Bear', monkey: '🐵 Monkey', cat: '🐱 Cat', car: '🚗 Car',
    },
    sheetTitle: 'Mazes',
    instr: 'Draw a path through the maze from the start to the goal. Don’t cross any walls!',
    goals: {
      mouse: 'Help the mouse get to the cheese.', bee: 'Help the bee fly to the flower.', dog: 'Help the dog find its bone.',
      bunny: 'Help the bunny get to the carrot.', rocket: 'Help the rocket fly to the planet.',
      squirrel: 'Help the squirrel get to the nut.', bear: 'Help the bear get to the honey.', monkey: 'Help the monkey get to the banana.',
      cat: 'Help the cat get to the fish.', car: 'Help the car drive home.',
    },
  },
  uk: {
    title: 'Лабіринти — робочий аркуш',
    appTitle: '🐭 Лабіринти — робочий аркуш',
    appSub: 'Аркуші A4 для друку: лабіринти від маленьких 5×5 до одного величезного, а також круглі. З відповідями.',
    level: 'Рівень', levels: { mix: 'Змішані', small: 'Малі 5×5', medium: 'Середні 8×8', large: 'Великі 12×12', big: 'Один величезний', round: 'Круглі' },
    theme: 'Персонажі',
    themes: {
      mix: '🎲 Різні', mouse: '🐭 Мишка', bee: '🐝 Бджілка', dog: '🐶 Цуценя', bunny: '🐰 Кролик', rocket: '🚀 Ракета',
      squirrel: '🐿️ Білочка', bear: '🐻 Ведмедик', monkey: '🐵 Мавпочка', cat: '🐱 Котик', car: '🚗 Машинка',
    },
    sheetTitle: 'Лабіринти',
    instr: 'Намалюй дорогу через лабіринт від початку до мети. Не перетинай стінок!',
    goals: {
      mouse: 'Допоможи мишці дістатися до сиру.', bee: 'Допоможи бджілці долетіти до квітки.', dog: 'Допоможи цуценяті знайти кісточку.',
      bunny: 'Допоможи кроликові дістатися до морквини.', rocket: 'Допоможи ракеті долетіти до планети.',
      squirrel: 'Допоможи білочці дістатися до горішка.', bear: 'Допоможи ведмедикові дістатися до меду.', monkey: 'Допоможи мавпочці дістатися до банана.',
      cat: 'Допоможи котикові дістатися до рибки.', car: 'Допоможи машинці доїхати додому.',
    },
  },
  vi: {
    title: 'Mê cung — phiếu bài tập',
    appTitle: '🐭 Mê cung — phiếu bài tập',
    appSub: 'Phiếu A4 để in: mê cung từ nhỏ 5×5 đến một mê cung khổng lồ, có cả mê cung hình tròn. Có đáp án.',
    level: 'Cấp độ', levels: { mix: 'Trộn', small: 'Nhỏ 5×5', medium: 'Vừa 8×8', large: 'Lớn 12×12', big: 'Một mê cung khổng lồ', round: 'Hình tròn' },
    theme: 'Nhân vật',
    themes: {
      mix: '🎲 Ngẫu nhiên', mouse: '🐭 Chuột', bee: '🐝 Ong', dog: '🐶 Cún', bunny: '🐰 Thỏ', rocket: '🚀 Tên lửa',
      squirrel: '🐿️ Sóc', bear: '🐻 Gấu', monkey: '🐵 Khỉ', cat: '🐱 Mèo', car: '🚗 Xe hơi',
    },
    sheetTitle: 'Mê cung',
    instr: 'Hãy vẽ đường đi qua mê cung từ điểm xuất phát đến đích. Không được đi xuyên qua tường!',
    goals: {
      mouse: 'Giúp chú chuột tìm đường đến miếng phô mai.', bee: 'Giúp chú ong bay đến bông hoa.', dog: 'Giúp chú cún tìm khúc xương.',
      bunny: 'Giúp chú thỏ đến chỗ củ cà rốt.', rocket: 'Giúp tên lửa bay đến hành tinh.',
      squirrel: 'Giúp chú sóc tìm hạt dẻ.', bear: 'Giúp chú gấu tìm hũ mật ong.', monkey: 'Giúp chú khỉ tìm quả chuối.',
      cat: 'Giúp chú mèo tìm con cá.', car: 'Giúp chiếc xe về đến nhà.',
    },
  },
  fr: {
    title: 'Labyrinthes — fiche',
    appTitle: '🐭 Labyrinthes — fiche',
    appSub: 'Fiches A4 à imprimer : des labyrinthes, des petits 5×5 jusqu’à un labyrinthe géant, et aussi des ronds. Avec corrigés.',
    level: 'Niveau', levels: { mix: 'Mélangés', small: 'Petits 5×5', medium: 'Moyens 8×8', large: 'Grands 12×12', big: 'Un labyrinthe géant', round: 'Ronds' },
    theme: 'Personnages',
    themes: {
      mix: '🎲 Au hasard', mouse: '🐭 Souris', bee: '🐝 Abeille', dog: '🐶 Chien', bunny: '🐰 Lapin', rocket: '🚀 Fusée',
      squirrel: '🐿️ Écureuil', bear: '🐻 Ourson', monkey: '🐵 Singe', cat: '🐱 Chat', car: '🚗 Voiture',
    },
    sheetTitle: 'Labyrinthes',
    instr: 'Trace le chemin dans le labyrinthe, du départ à l’arrivée. Ne traverse pas les murs !',
    goals: {
      mouse: 'Aide la souris à trouver le fromage.', bee: 'Aide l’abeille à voler jusqu’à la fleur.', dog: 'Aide le chien à trouver son os.',
      bunny: 'Aide le lapin à trouver la carotte.', rocket: 'Aide la fusée à voler jusqu’à la planète.',
      squirrel: 'Aide l’écureuil à trouver la châtaigne.', bear: 'Aide l’ourson à trouver le miel.', monkey: 'Aide le singe à trouver la banane.',
      cat: 'Aide le chat à trouver le poisson.', car: 'Aide la voiture à rentrer à la maison.',
    },
  },
  it: {
    title: 'Labirinti — scheda',
    appTitle: '🐭 Labirinti — scheda',
    appSub: 'Schede A4 da stampare: labirinti dai piccoli 5×5 fino a uno gigante, anche rotondi. Con le soluzioni.',
    level: 'Livello', levels: { mix: 'Misti', small: 'Piccoli 5×5', medium: 'Medi 8×8', large: 'Grandi 12×12', big: 'Un labirinto gigante', round: 'Rotondi' },
    theme: 'Personaggi',
    themes: {
      mix: '🎲 A caso', mouse: '🐭 Topolino', bee: '🐝 Ape', dog: '🐶 Cagnolino', bunny: '🐰 Coniglietto', rocket: '🚀 Razzo',
      squirrel: '🐿️ Scoiattolo', bear: '🐻 Orsetto', monkey: '🐵 Scimmietta', cat: '🐱 Gattino', car: '🚗 Macchinina',
    },
    sheetTitle: 'Labirinti',
    instr: 'Traccia la strada nel labirinto dalla partenza all’arrivo. Non attraversare i muri!',
    goals: {
      mouse: 'Aiuta il topolino a raggiungere il formaggio.', bee: 'Aiuta l’ape a volare fino al fiore.', dog: 'Aiuta il cagnolino a trovare l’osso.',
      bunny: 'Aiuta il coniglietto a raggiungere la carota.', rocket: 'Aiuta il razzo a volare fino al pianeta.',
      squirrel: 'Aiuta lo scoiattolo a trovare la castagna.', bear: 'Aiuta l’orsetto a raggiungere il miele.', monkey: 'Aiuta la scimmietta a raggiungere la banana.',
      cat: 'Aiuta il gattino a raggiungere il pesce.', car: 'Aiuta la macchinina a tornare a casa.',
    },
  },
  es: {
    title: 'Laberintos — ficha',
    appTitle: '🐭 Laberintos — ficha',
    appSub: 'Fichas A4 para imprimir: laberintos desde pequeños de 5×5 hasta uno gigante, también redondos. Con soluciones.',
    level: 'Nivel', levels: { mix: 'Mezclados', small: 'Pequeños 5×5', medium: 'Medianos 8×8', large: 'Grandes 12×12', big: 'Un laberinto gigante', round: 'Redondos' },
    theme: 'Personajes',
    themes: {
      mix: '🎲 Al azar', mouse: '🐭 Ratón', bee: '🐝 Abeja', dog: '🐶 Perrito', bunny: '🐰 Conejito', rocket: '🚀 Cohete',
      squirrel: '🐿️ Ardilla', bear: '🐻 Osito', monkey: '🐵 Monito', cat: '🐱 Gatito', car: '🚗 Cochecito',
    },
    sheetTitle: 'Laberintos',
    instr: 'Traza el camino por el laberinto desde la salida hasta la meta. ¡No atravieses las paredes!',
    goals: {
      mouse: 'Ayuda al ratón a llegar al queso.', bee: 'Ayuda a la abeja a volar hasta la flor.', dog: 'Ayuda al perrito a encontrar su hueso.',
      bunny: 'Ayuda al conejito a llegar a la zanahoria.', rocket: 'Ayuda al cohete a volar hasta el planeta.',
      squirrel: 'Ayuda a la ardilla a llegar a la castaña.', bear: 'Ayuda al osito a llegar a la miel.', monkey: 'Ayuda al monito a llegar al plátano.',
      cat: 'Ayuda al gatito a llegar al pez.', car: 'Ayuda al cochecito a llegar a casa.',
    },
  },
};
if (typeof module !== 'undefined') module.exports = MAZE_TEXT;
