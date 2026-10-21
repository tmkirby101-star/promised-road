import { useEffect, useMemo, useRef, useState } from 'react';
import { BOOKS_DIV, divLabel, shuffle } from '../../content/arcadeBooks';
import { awardPoints, type GameResult } from '../../lib/arcadeStore';
import { useRoundClock } from './useRoundClock';
import { Hud, type OnFinish } from './kit';
import type { RoundLength } from './Trivia';

// A sorting challenge always mixes 2+ bins, so picking a scope never reveals the
// answer (the old "choose Law → every book is Law" bug).
interface SortChallenge {
  id: string;
  title: string;
  sub: string;
  bins: string[];
  items: { book: string; bin: string }[];
}

function fromDivs(idxs: number[], binOf: (divIdx: number) => string) {
  const a: { book: string; bin: string }[] = [];
  idxs.forEach((i) => BOOKS_DIV[i].books.forEach((b) => a.push({ book: b, bin: binOf(i) })));
  return a;
}

const testamentBin = (i: number) => (BOOKS_DIV[i].testament === 'Old' ? 'Old Testament' : 'New Testament');

export const SORT_CHALLENGES: SortChallenge[] = [
  {
    id: 'otnt', title: 'Old vs New', sub: 'Which testament?',
    bins: ['Old Testament', 'New Testament'],
    items: fromDivs(BOOKS_DIV.map((_, i) => i), testamentBin),
  },
  {
    id: 'law_hist', title: 'Law vs History', sub: 'Two Old Testament sections',
    bins: ['Law', 'History (OT)'],
    items: fromDivs([0, 1], (i) => divLabel(BOOKS_DIV[i])),
  },
  {
    id: 'prophets', title: 'Major vs Minor', sub: 'The two prophet sections',
    bins: ['Major Prophets', 'Minor Prophets'],
    items: fromDivs([3, 4], (i) => divLabel(BOOKS_DIV[i])),
  },
  {
    id: 'gospels_letters', title: 'Gospels vs Letters', sub: 'Three New Testament sections',
    bins: ['Gospels', 'Paul’s Letters', 'General Letters'],
    items: fromDivs([5, 7, 8], (i) => divLabel(BOOKS_DIV[i])),
  },
  {
    id: 'mixed', title: 'Mixed Divisions', sub: 'All ten divisions — the real test',
    bins: BOOKS_DIV.map(divLabel),
    items: fromDivs(BOOKS_DIV.map((_, i) => i), (i) => divLabel(BOOKS_DIV[i])),
  },
];

export const sortChallengeById = (id: string) => SORT_CHALLENGES.find((c) => c.id === id)!;

export interface SortConfig {
  challengeId: string;
  length: RoundLength;
  timed: boolean;
}

export default function BooksSort({
  explorerId: _explorerId,
  config,
  onFinish,
}: {
  explorerId: string;
  config: SortConfig;
  onFinish: OnFinish;
}) {
  const ch = sortChallengeById(config.challengeId);

  const items = useMemo(() => {
    const s = shuffle(ch.items);
    const n = config.length === 'quick' ? 6 : config.length === 'standard' ? 12 : s.length;
    return s.slice(0, Math.min(n, s.length));
  }, [ch, config.length]);

  const total = items.length;
  const [queue, setQueue] = useState(() => items.map((_, i) => i)); // indices into items
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [wrongHere, setWrongHere] = useState<Set<string>>(new Set());
  const [answered, setAnswered] = useState(false);
  const [fb, setFb] = useState<{ text: string; good: boolean } | null>(null);

  // Attempts persist per book across skips (skip never erases earlier mistakes).
  const attemptsRef = useRef<Record<number, number>>({});
  const cleanRef = useRef(true);
  const finishedRef = useRef(false);

  const elapsed = useRoundClock(config.timed && !answered && queue.length > 0);

  useEffect(() => {
    if (queue.length > 0 || finishedRef.current || total === 0) return;
    finishedRef.current = true;
    const result: GameResult = {
      game: 'sort',
      boardKey: `sort|${ch.id}|${config.length}|${config.timed ? 'timed' : 'untimed'}|v2`,
      label: `Sorting · ${ch.title} · ${total} books`,
      scopeTag: ch.id,
      timed: config.timed,
      elapsedSec: elapsed,
      score,
      total,
      firstTry,
      clean: cleanRef.current,
    };
    onFinish(result);
  }, [queue.length, total, ch, config.length, config.timed, elapsed, score, firstTry, onFinish]);

  // reset the per-book wrong highlights whenever the front of the queue changes
  const cur = queue[0];
  useEffect(() => {
    setWrongHere(new Set());
    setAnswered(false);
    setFb(null);
  }, [cur]);

  if (total === 0) return <div className="ac-empty">Nothing to sort here.</div>;
  if (queue.length === 0) return null;

  const item = items[cur];

  function pick(bin: string) {
    if (answered || wrongHere.has(bin)) return;
    attemptsRef.current[cur] = (attemptsRef.current[cur] || 0) + 1;
    const n = attemptsRef.current[cur];
    if (bin === item.bin) {
      const pts = awardPoints(n);
      setScore((s) => s + pts);
      if (n === 1) setFirstTry((f) => f + 1);
      setAnswered(true);
      setFb({ text: `✓ ${item.book} belongs to ${item.bin}. +${pts}`, good: true });

    } else {
      setWrongHere((prev) => new Set(prev).add(bin));
      cleanRef.current = false;
      setFb({ text: `${item.book} does not belong to ${bin}. Try another ${ch.id === 'otnt' ? 'testament' : 'division'}.`, good: false });
    }
  }

  function skip() {
    // move current to the back WITHOUT touching its attempt count
    setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]] : q));
  }

  return (
    <div className="ac-play">
      <Hud score={score} elapsed={elapsed} timed={config.timed} />
      <div className="ac-progress">{total - queue.length + 1} of {total}</div>
      <div className="ac-sort-prompt">Which {ch.id === 'otnt' ? 'testament' : 'division'} does this book belong to?</div>
      <div className="ac-bigbook">{item.book}</div>

      <div className={`ac-fb${fb ? (fb.good ? ' good' : ' bad') : ''}`}>
        {fb ? <div className="ac-fb-line">{fb.text}</div> : <div className="ac-fb-line hint">Pick a {ch.id === 'otnt' ? 'testament' : 'division'}.</div>}
      </div>

      <div className="ac-bins">
        {ch.bins.map((bin) => (
          <button
            key={bin}
            className={`ac-bin${answered && bin === item.bin ? ' correct' : ''}${wrongHere.has(bin) ? ' wrong' : ''}`}
            disabled={answered || wrongHere.has(bin)}
            onClick={() => pick(bin)}
          >
            {bin}
          </button>
        ))}
      </div>

      {answered && <button className="ac-next" onClick={() => setQueue((q) => q.slice(1))}>{queue.length === 1 ? 'Finish →' : 'Next →'}</button>}
      {queue.length > 1 && (
        <button className="ac-skip" disabled={answered} onClick={skip}>Skip ↷</button>
      )}
    </div>
  );
}
