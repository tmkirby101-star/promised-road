// Books of the Bible, grouped by division — the data behind the arcade's
// Ordering and Sorting games. Ported verbatim from the Route 66 v9 prototype.

export interface BookDivision {
  div: string;
  testament: 'Old' | 'New';
  books: string[];
}

export const BOOKS_DIV: BookDivision[] = [
  { div: 'Law', testament: 'Old', books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'] },
  { div: 'History', testament: 'Old', books: ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'] },
  { div: 'Poetry/Wisdom', testament: 'Old', books: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'] },
  { div: 'Major Prophets', testament: 'Old', books: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'] },
  { div: 'Minor Prophets', testament: 'Old', books: ['Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'] },
  { div: 'Gospels', testament: 'New', books: ['Matthew', 'Mark', 'Luke', 'John'] },
  { div: 'History', testament: 'New', books: ['Acts'] },
  { div: 'Paul’s Letters', testament: 'New', books: ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'] },
  { div: 'General Letters', testament: 'New', books: ['Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'] },
  { div: 'Prophecy', testament: 'New', books: ['Revelation'] },
];

export function divLabel(d: BookDivision): string {
  if (d.testament === 'New' && d.div === 'History') return 'History (NT)';
  if (d.testament === 'Old' && d.div === 'History') return 'History (OT)';
  return d.div;
}

export function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function allBooksFlat(): { book: string; divIndex: number }[] {
  const arr: { book: string; divIndex: number }[] = [];
  BOOKS_DIV.forEach((d, di) => d.books.forEach((b) => arr.push({ book: b, divIndex: di })));
  return arr;
}

// Divisions with 2+ books can be ordered; single-book divisions can't.
export function orderableDivs(): number[] {
  const arr: number[] = [];
  BOOKS_DIV.forEach((d, i) => { if (d.books.length > 1) arr.push(i); });
  return arr;
}
