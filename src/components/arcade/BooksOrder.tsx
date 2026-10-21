import { useEffect, useMemo, useRef, useState } from 'react';
import { shuffle } from '../../content/arcadeBooks';
import { awardPoints, type GameResult } from '../../lib/arcadeStore';
import { Hud, type OnFinish } from './kit';

// A ready-made canonical sequence to place in order (Genesis→Revelation prefix,
// a testament, or a single division). The shell builds `seq`; this component just
// runs the ordering. "Perfect" is reserved for a run with zero wrong taps.
export interface OrderConfig {
  seq: string[];
  boardKey: string;
  label: string;
  scopeTag: string;
  timed: boolean;
}

export default function BooksOrder({
  explorerId: _explorerId,
  config,
  onFinish,
}: {
  explorerId: string;
  config: OrderConfig;
  onFinish: OnFinish;
}) {
  const seq = config.seq;
  const total = seq.length;
  const pool = useMemo(() => shuffle(seq), [seq]);

  const [placed, setPlaced] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [wrongBook, setWrongBook] = useState<string | null>(null);
  const [fb, setFb] = useState<{ text: string; good: boolean } | null>(null);

  const wrongThisSlot = useRef(0);
  const cleanRef = useRef(true);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!config.timed) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [config.timed]);

  useEffect(() => {
    if (placed < total || finishedRef.current) return;
    finishedRef.current = true;
    const result: GameResult = {
      game: 'order',
      boardKey: config.boardKey,
      label: config.label,
      scopeTag: config.scopeTag,
      timed: config.timed,
      elapsedSec: elapsed,
      score,
      total,
      firstTry,
      clean: cleanRef.current,
    };
    onFinish(result);
  }, [placed, total, config, elapsed, score, firstTry, onFinish]);

  const placedBooks = useMemo(() => new Set(seq.slice(0, placed)), [seq, placed]);

  if (total === 0) return <div className="ac-empty">Nothing to order.</div>;
  if (placed >= total) return null;

  function tap(book: string) {
    const expected = seq[placed];
    if (book === expected) {
      const pts = awardPoints(wrongThisSlot.current + 1);
      setScore((s) => s + pts);
      if (wrongThisSlot.current === 0) setFirstTry((f) => f + 1);
      wrongThisSlot.current = 0;
      const nowPlaced = placed + 1;
      setPlaced(nowPlaced);
      setFb(nowPlaced >= total ? { text: cleanRef.current ? '✓ Perfect!' : '✓ Complete!', good: true } : { text: '✓ Yes!', good: true });
    } else {
      wrongThisSlot.current += 1;
      cleanRef.current = false;
      const after = placed === 0 ? 'the start' : seq[placed - 1];
      setFb({ text: `Not next — try the book after ${after}.`, good: false });
      setWrongBook(book);
      setTimeout(() => setWrongBook(null), 320);
    }
  }

  return (
    <div className="ac-play">
      <Hud score={score} elapsed={elapsed} timed={config.timed} />
      <div className="ac-order-head">Put these in order: <b>{config.label}</b></div>

      <div className={`ac-fb${fb ? (fb.good ? ' good' : ' bad') : ''}`}>
        {fb ? <div className="ac-fb-line">{fb.text}</div> : <div className="ac-fb-line hint">Tap the first book.</div>}
      </div>

      <div className="ac-slots">
        {seq.map((_, i) => (
          <div className="ac-slot" key={i}>
            <span className="ac-slotnum">{i + 1}</span>
            {i < placed ? (
              <span className="ac-filled">{seq[i]}</span>
            ) : i === placed ? (
              <span className="ac-filled next">next …</span>
            ) : (
              <span className="ac-filled empty" />
            )}
          </div>
        ))}
      </div>

      <div className="ac-pool">
        {pool.map((b) => {
          const used = placedBooks.has(b);
          return (
            <button
              key={b}
              className={`ac-pick${used ? ' used' : ''}${wrongBook === b ? ' wrong' : ''}`}
              disabled={used}
              onClick={() => tap(b)}
            >
              {b}
            </button>
          );
        })}
      </div>
    </div>
  );
}
