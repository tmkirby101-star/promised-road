// The single authoritative learning record — pure types and derivations.
// Everything (activities, writing, parent view) reads and writes through this.

export type UnderstandingKey = 'creator' | 'good' | 'order' | 'application';

export const UNDERSTANDINGS: { key: UnderstandingKey; child: string }[] = [
  { key: 'creator', child: 'God made everything.' },
  { key: 'good', child: 'God called His creation good.' },
  { key: 'order', child: 'God made things in an order.' },
  { key: 'application', child: 'God gives us the job of caring for His world.' },
];

// One attempt at demonstrating an understanding. `usedAnswerHint` records answer
// support on THIS attempt only — it never downgrades an earlier independent success.
// Access supports (narration, large text) are NOT recorded here; they never affect
// independence.
export interface Attempt {
  understanding: UnderstandingKey;
  source: string; // e.g. 'q.creator', 'activity.order'
  correct: boolean;
  usedAnswerHint: boolean;
  at: number;
}

export type UnderstandingState =
  | 'not_checked'
  | 'practice_needed'
  | 'with_support'
  | 'independent';

// Participation = "the child did this part." NOT a claim of comprehension.
export interface Participation {
  storyExperienced: boolean;
  memoryPracticed: boolean;
  responseSaved: boolean;
  applicationDone: boolean;
}

export interface Writing {
  subject: string;
  subjectImage: string;
  text: string;
  selfChecks: { named: 'yes' | 'help' | null; noticed: 'yes' | 'help' | null };
  gratitude?: string;
  at: number;
}

export interface AccessSupports {
  narration: boolean;
  largeText: boolean;
}

export interface ChapterRecord {
  explorerId: string;
  chapterId: string;
  attempts: Attempt[];
  participation: Participation;
  writing: Writing | null;
  completedAt: number | null;
}

export function emptyChapter(explorerId: string, chapterId: string): ChapterRecord {
  return {
    explorerId,
    chapterId,
    attempts: [],
    participation: {
      storyExperienced: false,
      memoryPracticed: false,
      responseSaved: false,
      applicationDone: false,
    },
    writing: null,
    completedAt: null,
  };
}

export const defaultAccess: AccessSupports = { narration: false, largeText: false };

// --- Derivations -----------------------------------------------------------

// State is the BEST across attempts and is sticky: a later hinted/wrong attempt
// never downgrades an earlier independent success.
export function understandingState(
  rec: ChapterRecord,
  key: UnderstandingKey,
): UnderstandingState {
  const a = rec.attempts.filter((x) => x.understanding === key);
  if (a.length === 0) return 'not_checked';
  if (a.some((x) => x.correct && !x.usedAnswerHint)) return 'independent';
  if (a.some((x) => x.correct)) return 'with_support';
  return 'practice_needed';
}

// A later wobble to surface to parents without erasing the success.
export function laterDifficulty(rec: ChapterRecord, key: UnderstandingKey): boolean {
  const a = rec.attempts.filter((x) => x.understanding === key);
  if (a.length < 2) return false;
  const best = understandingState(rec, key);
  const last = a[a.length - 1];
  return (best === 'independent' || best === 'with_support') && (!last.correct || last.usedAnswerHint);
}

// Discoveries: understandings reached at least "with support" (0–4). Measures understanding.
export function discoveries(rec: ChapterRecord): number {
  return UNDERSTANDINGS.filter((u) => {
    const s = understandingState(rec, u.key);
    return s === 'with_support' || s === 'independent';
  }).length;
}

// Chapter completion = participation bar. Supported success counts; perfect recall
// or flawless writing never blocks it.
export function isComplete(rec: ChapterRecord): boolean {
  const p = rec.participation;
  return p.storyExperienced && p.memoryPracticed && p.responseSaved && p.applicationDone;
}

export const STATE_LABEL: Record<UnderstandingState, string> = {
  not_checked: 'Not yet checked',
  practice_needed: 'Practice needed',
  with_support: 'Completed with support',
  independent: 'Demonstrated independently',
};
