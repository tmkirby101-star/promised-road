// The arcade's own persistence — completely separate from the learning record.
// Game skill, speed, and retries live HERE and never touch understanding/mastery.
// One localStorage key; per-explorer personal progress + a shared family board.

const KEY = 'promised-road:arcade:v1';

export type GameId = 'order' | 'sort' | 'trivia';

// Result handed up by a game when a round finishes.
export interface GameResult {
  runId?: string; // stable across React renders; one completed run is recorded once
  game: GameId;
  boardKey: string; // stable key for the family board + personal best (save == browse)
  label: string; // human label, e.g. "Gospels · Ordering"
  scopeTag: string; // coarse tag for achievements, e.g. 'all', 'gospels', 'hard'
  timed: boolean;
  elapsedSec: number;
  score: number;
  total: number; // questions / books / sorts attempted
  firstTry: number; // how many were right on the first try
  clean: boolean; // true only if NO wrong attempt happened all round
}

export interface PersonalBest {
  plays: number;
  bestScore: number;
  lastScore: number;
  bestFirstTryPct: number; // 0..100
  bestCleanTimeSec: number | null; // only set by first-try-perfect runs
}

export interface BoardEntry {
  name: string;
  val: number;
  rid?: string; // the run that produced it — lets a retry replace rather than duplicate
}
export interface Board {
  clean: BoardEntry[]; // first-try-perfect runs, ranked by time (asc)
  scores: BoardEntry[]; // high scores, ranked desc
}

export interface MissRecord {
  tier: string;
  q: string; // the question text uniquely identifies it in our bank
}

interface ArcadeShape {
  recorded: Record<string, RecordCore>;
  personal: Record<string, Record<string, PersonalBest>>; // explorerId -> boardKey -> PB
  achievements: Record<string, Record<string, number>>; // explorerId -> achId -> earnedAt
  misses: Record<string, MissRecord[]>; // explorerId -> missed trivia questions
  boards: Record<string, Board>; // boardKey -> family board (names are initials)
}

function empty(): ArcadeShape {
  return { recorded: {}, personal: {}, achievements: {}, misses: {}, boards: {} };
}

function load(): ArcadeShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...(JSON.parse(raw) as ArcadeShape) };
  } catch {
    /* blocked storage — ephemeral session */
  }
  return empty();
}

// In-memory mirror: the working copy of arcade state for this session. Reads and
// writes go through it, so a blocked/full localStorage still keeps results for the
// session (they just won't survive a reload) — and nothing silently reverts to a
// stale on-disk copy mid-session. save() writes through and reports whether the
// durable write actually succeeded.
let mem: ArcadeShape | null = null;
function state(): ArcadeShape {
  if (!mem) mem = load();
  return mem;
}

function save(s: ArcadeShape): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch {
    return false; // storage blocked/full — kept in memory, not durable
  }
}

const BOARD_MAX = 10;

// ── Achievements ───────────────────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  blurb: string;
}
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_clean', title: 'Clean Run', blurb: 'Finished a game with no mistakes.' },
  { id: 'beat_pb', title: 'New Personal Best', blurb: 'Beat your own high score.' },
  { id: 'order_all66', title: 'Ordered All 66', blurb: 'Put the whole Bible in order, Genesis to Revelation.' },
  { id: 'perfect_gospels', title: 'Perfect Gospels', blurb: 'A flawless round in the Gospels.' },
  { id: 'trivia_hard_clean', title: 'Trivia Master', blurb: 'A perfect round of Hard trivia.' },
  { id: 'sort_mixed_clean', title: 'Sharp Sorter', blurb: 'A flawless Mixed sorting round.' },
];
const ACH_BY_ID: Record<string, Achievement> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

function earnedList(s: ArcadeShape, explorerId: string, ids: string[]): Achievement[] {
  const owned = s.achievements[explorerId] || (s.achievements[explorerId] = {});
  const fresh: Achievement[] = [];
  for (const id of ids) {
    if (!owned[id]) {
      owned[id] = Date.now();
      if (ACH_BY_ID[id]) fresh.push(ACH_BY_ID[id]);
    }
  }
  return fresh;
}

// What a recorded result produced — surfaced to the finish screen.
export interface RecordOutcome {
  scoreImproved: boolean;
  cleanTimeImproved: boolean;
  qualifiesClean: boolean; // round was clean AND would make the clean (speed) board
  qualifiesScore: boolean; // score would make the high-score board
  firstTryPct: number;
  newAchievements: Achievement[];
  persisted: boolean; // false => kept in memory only; won't survive a reload
}
// The durable part of an outcome (everything except the per-call persistence flag).
type RecordCore = Omit<RecordOutcome, 'persisted'>;

export const arcade = {
  getPersonal(explorerId: string, boardKey: string): PersonalBest | null {
    const s = state();
    return s.personal[explorerId]?.[boardKey] ?? null;
  },

  getBoard(boardKey: string): Board {
    const s = state();
    return s.boards[boardKey] ?? { clean: [], scores: [] };
  },

  getAchievements(explorerId: string): { ach: Achievement; at: number }[] {
    const s = state();
    const owned = s.achievements[explorerId] || {};
    return ACHIEVEMENTS.filter((a) => owned[a.id]).map((a) => ({ ach: a, at: owned[a.id] }));
  },

  getMisses(explorerId: string): MissRecord[] {
    return state().misses[explorerId] ?? [];
  },

  // Merge this round's missed questions, and drop any the child has since gotten right.
  updateMisses(explorerId: string, missedThisRound: MissRecord[], correctedThisRound: MissRecord[]): boolean {
    const s = state();
    const cur = s.misses[explorerId] ?? [];
    const keyOf = (m: MissRecord) => m.tier + '::' + m.q;
    const corrected = new Set(correctedThisRound.map(keyOf));
    const map = new Map<string, MissRecord>();
    for (const m of cur) if (!corrected.has(keyOf(m))) map.set(keyOf(m), m);
    for (const m of missedThisRound) map.set(keyOf(m), m);
    s.misses[explorerId] = [...map.values()];
    return save(s);
  },

  // Record personal progress + achievements for a finished round. Does NOT write
  // the shared family board (that needs the player's initials — see addToBoard).
  // Practice rounds pass record:false so they don't inflate personal bests.
  recordPersonal(explorerId: string, r: GameResult, keepBest = true): RecordOutcome {
    const s = state();
    // Already recorded (re-render, StrictMode double-invoke, or a retry): don't
    // double-count plays or re-award. Re-attempt the durable write and report it.
    if (r.runId && s.recorded[r.runId]) return { ...s.recorded[r.runId], persisted: save(s) };
    const firstTryPct = r.total > 0 ? Math.round((r.firstTry / r.total) * 100) : 0;

    const byExp = s.personal[explorerId] || (s.personal[explorerId] = {});
    const prev = byExp[r.boardKey];
    const scoreImproved = keepBest && !!prev && r.score > prev.bestScore;
    const cleanTimeImproved =
      keepBest && r.clean && r.timed &&
      (!prev || prev.bestCleanTimeSec == null || r.elapsedSec < prev.bestCleanTimeSec);

    if (keepBest) {
      byExp[r.boardKey] = {
        plays: (prev?.plays ?? 0) + 1,
        bestScore: Math.max(prev?.bestScore ?? 0, r.score),
        lastScore: r.score,
        bestFirstTryPct: Math.max(prev?.bestFirstTryPct ?? 0, firstTryPct),
        bestCleanTimeSec:
          r.clean && r.timed
            ? Math.min(prev?.bestCleanTimeSec ?? Number.POSITIVE_INFINITY, r.elapsedSec)
            : prev?.bestCleanTimeSec ?? null,
      };
    }

    // qualification is a peek against the current board (before any add)
    const board = s.boards[r.boardKey] ?? { clean: [], scores: [] };
    const qualifiesScore =
      keepBest && (board.scores.length < BOARD_MAX || r.score > (board.scores[board.scores.length - 1]?.val ?? -1));
    const qualifiesClean =
      keepBest && r.clean && r.timed &&
      (board.clean.length < BOARD_MAX || r.elapsedSec < (board.clean[board.clean.length - 1]?.val ?? Infinity));

    // achievements
    const ids: string[] = [];
    if (keepBest) {
      if (r.clean) ids.push('first_clean');
      if (scoreImproved) ids.push('beat_pb');
      if (r.game === 'order' && r.scopeTag === 'all') ids.push('order_all66');
      if (r.clean && r.scopeTag === 'gospels') ids.push('perfect_gospels');
      if (r.clean && r.game === 'trivia' && r.scopeTag === 'hard') ids.push('trivia_hard_clean');
      if (r.clean && r.game === 'sort' && r.scopeTag === 'mixed') ids.push('sort_mixed_clean');
    }
    const newAchievements = earnedList(s, explorerId, ids);

    const core: RecordCore = { scoreImproved, cleanTimeImproved, qualifiesClean, qualifiesScore, firstTryPct, newAchievements };
    if (r.runId) {
      s.recorded[r.runId] = core;
      const keys = Object.keys(s.recorded);
      if (keys.length > 200) delete s.recorded[keys[0]];
    }
    return { ...core, persisted: save(s) };
  },

  // Add a result to the shared family board under the given initials. Idempotent
  // per run: a retry replaces that run's entry instead of duplicating it. Returns
  // whether the write was durable.
  addToBoard(boardKey: string, name: string, r: GameResult): { persisted: boolean } {
    const s = state();
    const board = s.boards[boardKey] || (s.boards[boardKey] = { clean: [], scores: [] });
    const nm = (name || '???').toUpperCase().slice(0, 3);
    const rid = r.runId;
    if (rid) {
      board.scores = board.scores.filter((e) => e.rid !== rid);
      board.clean = board.clean.filter((e) => e.rid !== rid);
    }
    board.scores.push({ name: nm, val: r.score, rid });
    board.scores.sort((a, b) => b.val - a.val);
    board.scores = board.scores.slice(0, BOARD_MAX);
    if (r.clean && r.timed) {
      board.clean.push({ name: nm, val: r.elapsedSec, rid });
      board.clean.sort((a, b) => a.val - b.val);
      board.clean = board.clean.slice(0, BOARD_MAX);
    }
    return { persisted: save(s) };
  },
};

export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// Attempt-based points: 1st try 10, 2nd 6, 3rd 3, 4th+ 1.
export function awardPoints(attempts: number): number {
  return attempts <= 1 ? 10 : attempts === 2 ? 6 : attempts === 3 ? 3 : 1;
}
