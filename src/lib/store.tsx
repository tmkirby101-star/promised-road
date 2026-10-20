import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  type AccessSupports,
  type Attempt,
  type ChapterRecord,
  type Cursor,
  type Draft,
  type Participation,
  type Writing,
  defaultAccess,
  defaultCursor,
  defaultDraft,
  emptyChapter,
  isComplete,
} from './record';

const STORAGE_KEY = 'promised-road:v1';

interface StoreShape {
  chapters: Record<string, ChapterRecord>;
  access: Record<string, AccessSupports>;
}

const key = (explorerId: string, chapterId: string) => `${explorerId}:${chapterId}`;

function load(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoreShape;
  } catch {
    /* private mode / blocked storage — fall through to empty */
  }
  return { chapters: {}, access: {} };
}

function persist(s: StoreShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore; in-memory still works for this session */
  }
}

interface StoreApi {
  getChapter: (explorerId: string, chapterId: string) => ChapterRecord;
  getAccess: (explorerId: string) => AccessSupports;
  addAttempt: (explorerId: string, chapterId: string, attempt: Omit<Attempt, 'at'>) => void;
  setParticipation: (explorerId: string, chapterId: string, patch: Partial<Participation>) => void;
  saveWriting: (explorerId: string, chapterId: string, writing: Writing) => void;
  setAccess: (explorerId: string, patch: Partial<AccessSupports>) => void;
  setCursor: (explorerId: string, chapterId: string, patch: Partial<Cursor>) => void;
  setDraft: (explorerId: string, chapterId: string, patch: Partial<Draft>) => void;
  resetChapter: (explorerId: string, chapterId: string) => void;
  version: number; // bumps on every change so consumers re-render
}

// Older persisted records may predate cursor/draft — fill them in.
function normalize(rec: ChapterRecord): ChapterRecord {
  return {
    ...rec,
    cursor: rec.cursor ?? { ...defaultCursor },
    draft: rec.draft ?? { ...defaultDraft },
  };
}

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const ref = useRef<StoreShape>(load());
  const [version, setVersion] = useState(0);

  const commit = useCallback((mutate: (s: StoreShape) => void) => {
    const next: StoreShape = {
      chapters: { ...ref.current.chapters },
      access: { ...ref.current.access },
    };
    mutate(next);
    ref.current = next;
    persist(next);
    setVersion((v) => v + 1);
  }, []);

  const getChapter = useCallback((explorerId: string, chapterId: string): ChapterRecord => {
    const r = ref.current.chapters[key(explorerId, chapterId)];
    return r ? normalize(r) : emptyChapter(explorerId, chapterId);
  }, []);

  const getAccess = useCallback((explorerId: string): AccessSupports => {
    return ref.current.access[explorerId] ?? defaultAccess;
  }, []);

  const ensure = (s: StoreShape, explorerId: string, chapterId: string): ChapterRecord => {
    const k = key(explorerId, chapterId);
    if (!s.chapters[k]) s.chapters[k] = emptyChapter(explorerId, chapterId);
    else s.chapters[k] = normalize({ ...s.chapters[k], attempts: [...s.chapters[k].attempts] });
    return s.chapters[k];
  };

  const maybeComplete = (rec: ChapterRecord) => {
    if (rec.completedAt == null && isComplete(rec)) rec.completedAt = Date.now();
  };

  const addAttempt: StoreApi['addAttempt'] = useCallback(
    (explorerId, chapterId, attempt) =>
      commit((s) => {
        const rec = ensure(s, explorerId, chapterId);
        rec.attempts.push({ ...attempt, at: Date.now() });
        maybeComplete(rec);
      }),
    [commit],
  );

  const setParticipation: StoreApi['setParticipation'] = useCallback(
    (explorerId, chapterId, patch) =>
      commit((s) => {
        const rec = ensure(s, explorerId, chapterId);
        rec.participation = { ...rec.participation, ...patch };
        maybeComplete(rec);
      }),
    [commit],
  );

  const saveWriting: StoreApi['saveWriting'] = useCallback(
    (explorerId, chapterId, writing) =>
      commit((s) => {
        const rec = ensure(s, explorerId, chapterId);
        rec.writing = writing;
        rec.participation = { ...rec.participation, responseSaved: writing.text.trim().length > 0 };
        maybeComplete(rec);
      }),
    [commit],
  );

  const setAccess: StoreApi['setAccess'] = useCallback(
    (explorerId, patch) =>
      commit((s) => {
        s.access[explorerId] = { ...(s.access[explorerId] ?? defaultAccess), ...patch };
      }),
    [commit],
  );

  const setCursor: StoreApi['setCursor'] = useCallback(
    (explorerId, chapterId, patch) =>
      commit((s) => {
        const rec = ensure(s, explorerId, chapterId);
        rec.cursor = { ...rec.cursor, ...patch };
      }),
    [commit],
  );

  const setDraft: StoreApi['setDraft'] = useCallback(
    (explorerId, chapterId, patch) =>
      commit((s) => {
        const rec = ensure(s, explorerId, chapterId);
        rec.draft = { ...rec.draft, ...patch };
      }),
    [commit],
  );

  const resetChapter: StoreApi['resetChapter'] = useCallback(
    (explorerId, chapterId) =>
      commit((s) => {
        s.chapters[key(explorerId, chapterId)] = emptyChapter(explorerId, chapterId);
      }),
    [commit],
  );

  const api = useMemo<StoreApi>(
    () => ({
      getChapter,
      getAccess,
      addAttempt,
      setParticipation,
      saveWriting,
      setAccess,
      setCursor,
      setDraft,
      resetChapter,
      version,
    }),
    [getChapter, getAccess, addAttempt, setParticipation, saveWriting, setAccess, setCursor, setDraft, resetChapter, version],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
