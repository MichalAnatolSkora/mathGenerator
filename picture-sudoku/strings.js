/**
 * Texts of the picture sudoku worksheet in seven languages (pl, en, uk, vi, fr, it, es). Classic script; defines
 * the global `SUDOKU_TEXT`. The kit (../sheet-kit/kit.js) adds the shared ones (seed, options, print…).
 * `instr` is keyed by what the child does in an empty square: draw, color or write.
 */
const SUDOKU_TEXT = {
  pl: {
    title: 'Sudoku obrazkowe — karta pracy',
    appTitle: '🍓 Sudoku obrazkowe — karta pracy',
    appSub: 'Karty A4 do druku: małe sudoku 4×4 i 6×6 z obrazkami zamiast cyfr. Z rozwiązaniami.',
    level: 'Poziom', levels: { mix: 'Mieszane 4×4', easy: 'Łatwe 4×4', medium: 'Średnie 4×4', hard: 'Trudne 4×4', big: 'Duże 6×6' },
    symbols: 'Obrazki', sets: { shapes: '⭐ Kształty', fruits: '🍎 Owoce', animals: '🐶 Zwierzęta', colors: '🎨 Kolory', numbers: '🔢 Cyfry' },
    sheetTitle: 'Sudoku obrazkowe',
    instr: {
      draw: 'W każdym rzędzie, w każdej kolumnie i w każdym kwadracie z grubą ramką każdy obrazek jest tylko raz. Dorysuj brakujące obrazki.',
      color: 'W każdym rzędzie, w każdej kolumnie i w każdym kwadracie z grubą ramką każdy kolor jest tylko raz. Pokoloruj puste kratki.',
      write: 'W każdym rzędzie, w każdej kolumnie i w każdym kwadracie z grubą ramką każda cyfra jest tylko raz. Wpisz brakujące cyfry.',
    },
    use: 'Do wyboru:',
  },
  en: {
    title: 'Picture sudoku — worksheet',
    appTitle: '🍓 Picture sudoku — worksheet',
    appSub: 'Printable A4 sheets: small 4×4 and 6×6 sudoku with pictures instead of numbers. With answer keys.',
    level: 'Level', levels: { mix: 'Mixed 4×4', easy: 'Easy 4×4', medium: 'Medium 4×4', hard: 'Hard 4×4', big: 'Big 6×6' },
    symbols: 'Pictures', sets: { shapes: '⭐ Shapes', fruits: '🍎 Fruit', animals: '🐶 Animals', colors: '🎨 Colours', numbers: '🔢 Numbers' },
    sheetTitle: 'Picture sudoku',
    instr: {
      draw: 'Every row, every column and every box with a thick border has each picture only once. Draw the missing pictures.',
      color: 'Every row, every column and every box with a thick border has each colour only once. Colour the empty squares.',
      write: 'Every row, every column and every box with a thick border has each number only once. Write the missing numbers.',
    },
    use: 'Choose from:',
  },
  uk: {
    title: 'Судоку з картинками — робочий аркуш',
    appTitle: '🍓 Судоку з картинками — робочий аркуш',
    appSub: 'Аркуші A4 для друку: маленькі судоку 4×4 і 6×6 з картинками замість цифр. З відповідями.',
    level: 'Рівень', levels: { mix: 'Змішані 4×4', easy: 'Легкі 4×4', medium: 'Середні 4×4', hard: 'Складні 4×4', big: 'Великі 6×6' },
    symbols: 'Картинки', sets: { shapes: '⭐ Фігури', fruits: '🍎 Фрукти', animals: '🐶 Тварини', colors: '🎨 Кольори', numbers: '🔢 Цифри' },
    sheetTitle: 'Судоку з картинками',
    instr: {
      draw: 'У кожному рядку, кожному стовпчику і кожному квадраті з товстою рамкою кожна картинка є лише один раз. Домалюй картинки, яких бракує.',
      color: 'У кожному рядку, кожному стовпчику і кожному квадраті з товстою рамкою кожен колір є лише один раз. Розфарбуй порожні клітинки.',
      write: 'У кожному рядку, кожному стовпчику і кожному квадраті з товстою рамкою кожна цифра є лише один раз. Впиши цифри, яких бракує.',
    },
    use: 'На вибір:',
  },
  vi: {
    title: 'Sudoku hình ảnh — phiếu bài tập',
    appTitle: '🍓 Sudoku hình ảnh — phiếu bài tập',
    appSub: 'Phiếu A4 để in: sudoku nhỏ 4×4 và 6×6 với hình ảnh thay cho chữ số. Có đáp án.',
    level: 'Cấp độ', levels: { mix: 'Trộn 4×4', easy: 'Dễ 4×4', medium: 'Vừa 4×4', hard: 'Khó 4×4', big: 'Lớn 6×6' },
    symbols: 'Hình', sets: { shapes: '⭐ Hình khối', fruits: '🍎 Trái cây', animals: '🐶 Con vật', colors: '🎨 Màu sắc', numbers: '🔢 Chữ số' },
    sheetTitle: 'Sudoku hình ảnh',
    instr: {
      draw: 'Mỗi hàng, mỗi cột và mỗi ô vuông viền đậm có mỗi hình đúng một lần. Hãy vẽ những hình còn thiếu.',
      color: 'Mỗi hàng, mỗi cột và mỗi ô vuông viền đậm có mỗi màu đúng một lần. Hãy tô màu các ô trống.',
      write: 'Mỗi hàng, mỗi cột và mỗi ô vuông viền đậm có mỗi số đúng một lần. Hãy viết các số còn thiếu.',
    },
    use: 'Chọn trong:',
  },
  fr: {
    title: 'Sudoku en images — fiche',
    appTitle: '🍓 Sudoku en images — fiche',
    appSub: 'Fiches A4 à imprimer : petits sudokus 4×4 et 6×6 avec des images à la place des chiffres. Avec corrigés.',
    level: 'Niveau', levels: { mix: 'Mélangé 4×4', easy: 'Facile 4×4', medium: 'Moyen 4×4', hard: 'Difficile 4×4', big: 'Grand 6×6' },
    symbols: 'Images', sets: { shapes: '⭐ Formes', fruits: '🍎 Fruits', animals: '🐶 Animaux', colors: '🎨 Couleurs', numbers: '🔢 Chiffres' },
    sheetTitle: 'Sudoku en images',
    instr: {
      draw: 'Dans chaque ligne, chaque colonne et chaque carré au bord épais, chaque image apparaît une seule fois. Dessine les images qui manquent.',
      color: 'Dans chaque ligne, chaque colonne et chaque carré au bord épais, chaque couleur apparaît une seule fois. Colorie les cases vides.',
      write: 'Dans chaque ligne, chaque colonne et chaque carré au bord épais, chaque chiffre apparaît une seule fois. Écris les chiffres qui manquent.',
    },
    use: 'Au choix :',
  },
  it: {
    title: 'Sudoku con le figure — scheda',
    appTitle: '🍓 Sudoku con le figure — scheda',
    appSub: 'Schede A4 da stampare: piccoli sudoku 4×4 e 6×6 con figure al posto dei numeri. Con le soluzioni.',
    level: 'Livello', levels: { mix: 'Misto 4×4', easy: 'Facile 4×4', medium: 'Medio 4×4', hard: 'Difficile 4×4', big: 'Grande 6×6' },
    symbols: 'Figure', sets: { shapes: '⭐ Forme', fruits: '🍎 Frutta', animals: '🐶 Animali', colors: '🎨 Colori', numbers: '🔢 Numeri' },
    sheetTitle: 'Sudoku con le figure',
    instr: {
      draw: 'In ogni riga, in ogni colonna e in ogni riquadro con il bordo spesso ogni figura compare una sola volta. Disegna le figure che mancano.',
      color: 'In ogni riga, in ogni colonna e in ogni riquadro con il bordo spesso ogni colore compare una sola volta. Colora le caselle vuote.',
      write: 'In ogni riga, in ogni colonna e in ogni riquadro con il bordo spesso ogni numero compare una sola volta. Scrivi i numeri che mancano.',
    },
    use: 'Da scegliere:',
  },
  es: {
    title: 'Sudoku de dibujos — ficha',
    appTitle: '🍓 Sudoku de dibujos — ficha',
    appSub: 'Fichas A4 para imprimir: sudokus pequeños de 4×4 y 6×6 con dibujos en lugar de números. Con soluciones.',
    level: 'Nivel', levels: { mix: 'Mezcla 4×4', easy: 'Fácil 4×4', medium: 'Medio 4×4', hard: 'Difícil 4×4', big: 'Grande 6×6' },
    symbols: 'Dibujos', sets: { shapes: '⭐ Formas', fruits: '🍎 Frutas', animals: '🐶 Animales', colors: '🎨 Colores', numbers: '🔢 Números' },
    sheetTitle: 'Sudoku de dibujos',
    instr: {
      draw: 'En cada fila, cada columna y cada cuadrado de borde grueso, cada dibujo aparece una sola vez. Dibuja los que faltan.',
      color: 'En cada fila, cada columna y cada cuadrado de borde grueso, cada color aparece una sola vez. Colorea las casillas vacías.',
      write: 'En cada fila, cada columna y cada cuadrado de borde grueso, cada número aparece una sola vez. Escribe los números que faltan.',
    },
    use: 'Elige entre:',
  },
};
if (typeof module !== 'undefined') module.exports = SUDOKU_TEXT;
