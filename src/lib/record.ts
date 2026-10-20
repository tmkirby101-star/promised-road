// The single authoritative learning record — pure types and derivations.
// Everything (activities, writing, parent view) reads and writes through this.

// The four comprehension truths the chapter checks — the "discoveries".
export type UnderstandingKey = 'created' | 'good' | 'image' | 'complete';
// All recorded evidence keys: the four understandings plus the two other activity
// purposes (sequence, apply), tracked with the same logic but shown apart.
export type EvidenceKey = UnderstandingKey | 'sequence' | 'apply';

export const UNDERSTANDINGS: { key: UnderstandingKey; child: string }[] = [
  { key: 'created', child: 'God made everything.' },
  { key: 'good', child: 'God called His creation very good.' },
  { key: 'image', child: 'God made people in His own image.' },
  { key: 'complete', child: 'God finished all His good work.' },
];

// Other activity purposes — not comprehension "discoveries", shown separately.
export const SKILLS: { key: 'sequence' | 'apply'; child: string }[] = [
  { key: 'sequence', child: 'Put the days of creation in order.' },
  { key: 'apply', child: 'Chose a good way to care for creation.' },
];

// One attempt at demonstrating an understanding. `usedAnswerHint` records answer
// support on THIS attempt only — it never downgrades an earlier independent success.
// Access supports (narration, large text) are NOT recorded here; they never affect
// independence.
export interface Attempt {
  understanding: EvidenceKey;
  source: string; // e.g. 'q.created', 'activity.sequence'
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
  // "Ever used this chapter" — stays true even after a support is switched off, so
  // the parent view reflects what actually helped, not just the current toggle.
  everNarration: boolean;
  everLargeText: boolean;
}

// Exact position in the flow, saved so a child resumes where they left off.
export type FlowStep = 'story' | 'explore' | 'write' | 'complete';
export type ExploreSub = 'q0' | 'q1' | 'q2' | 'q3' | 'memory' | 'order';
export type WriteSub = 'compose' | 'apply';

export interface Cursor {
  step: FlowStep;
  storyPage: number;
  exploreSub: ExploreSub;
  writeSub: WriteSub;
}

// Unfinished writing, autosaved so a draft is never lost on leave.
export interface Draft {
  subjectId: string | null;
  text: string;
  named: 'yes' | 'help' | null;
  noticed: 'yes' | 'help' | null;
  gratitude: string;
}

export const defaultCursor: Cursor = { step: 'story', storyPage: 0, exploreSub: 'order', writeSub: 'compose' };
export const defaultDraft: Draft = { subjectId: null, text: '', named: null, noticed: null, gratitude: '' };

export interface ChapterRecord {
  explorerId: string;
  chapterId: string;
  attempts: Attempt[];
  participation: Participation;
  writing: Writing | null;
  completedAt: number | null;
  cursor: Cursor;
  draft: Draft;
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
    cursor: { ...defaultCursor },
    draft: { ...defaultDraft },
  };
}

export const defaultAccess: AccessSupports = { narration: false, largeText: false, everNarration: false, everLargeText: false };

// --- Derivations -----------------------------------------------------------

// State is the BEST across attempts and is sticky: a later hinted/wrong attempt
// never downgrades an earlier independent success.
export function understandingState(
  rec: ChapterRecord,
  key: EvidenceKey,
): UnderstandingState {
  const a = rec.attempts.filter((x) => x.understanding === key);
  if (a.length === 0) return 'not_checked';
  if (a.some((x) => x.correct && !x.usedAnswerHint)) return 'independent';
  if (a.some((x) => x.correct)) return 'with_support';
  return 'practice_needed';
}

// A wobble AFTER an earlier independent success — the only case where "later" is
// accurate. Support needed from the first attempt is part of reaching the answer,
// not a regression, and is already captured by the "with support" state.
export function laterDifficulty(rec: ChapterRecord, key: EvidenceKey): boolean {
  const a = rec.attempts.filter((x) => x.understanding === key);
  if (a.length < 2) return false;
  const firstIndependent = a.findIndex((x) => x.correct && !x.usedAnswerHint);
  if (firstIndependent === -1) return false; // never independent → nothing to lose "later"
  return a.slice(firstIndependent + 1).some((x) => !x.correct || x.usedAnswerHint);
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
