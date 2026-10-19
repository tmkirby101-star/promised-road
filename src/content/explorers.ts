// Fictional demo explorers. Portraits are simple initial-badges for now —
// individually framed portrait art (8 of them) is a later asset task.
export interface Explorer {
  id: string;
  name: string;
  grade: number; // 1, 4, 7
  gradeLabel: string;
  tint: string; // avatar color
  chapterId: string | null; // the chapter built for this explorer, or null = coming soon
}

export const EXPLORERS: Explorer[] = [
  { id: 'ellis', name: 'Ellis', grade: 1, gradeLabel: 'Grade 1', tint: '#2f7d6b', chapterId: 'genesis-01' },
  { id: 'rowan', name: 'Rowan', grade: 4, gradeLabel: 'Grade 4', tint: '#b8894f', chapterId: null },
  { id: 'avery', name: 'Avery', grade: 7, gradeLabel: 'Grade 7', tint: '#4f6fa8', chapterId: null },
];

export const explorerById = (id: string) => EXPLORERS.find((e) => e.id === id) ?? null;
