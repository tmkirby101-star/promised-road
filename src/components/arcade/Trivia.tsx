import { triviaFeedback } from '../../content/arcadeFeedback';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TRIVIA, type TriviaTier, type TriviaQ } from '../../content/arcadeTrivia';
import { shuffle } from '../../content/arcadeBooks';
import { awardPoints, type GameResult, type MissRecord } from '../../lib/arcadeStore';
import { useRoundClock } from './useRoundClock';
import { Hud, type OnFinish, type ReviewItem } from './kit';

export type RoundLength = 'quick' | 'standard' | 'full';

export interface TriviaConfig {
  tier: TriviaTier;
  length: RoundLength;
  timed: boolean;
  practice?: ReviewItem[]; // present => a "practice my misses" round
}

interface Round {
  q: TriviaQ;
  tier: string;
}

const CAP_FULL = 40;

function buildRounds(cfg: TriviaConfig): Round[] {
  if (cfg.practice && cfg.practice.length) {
    const rounds: Round[] = [];
    for (const item of cfg.practice) {
      const bank = TRIVIA[item.tier as TriviaTier] || [];
      const q = bank.find((x) => x.q === item.q);
      if (q) rounds.push({ q, tier: item.tier });
    }
    return shuffle(rounds);
  }
  const pool = shuffle(TRIVIA[cfg.tier]).map((q) => ({ q, tier: cfg.tier }));
  const n = cfg.length === 'quick' ? 5 : cfg.length === 'standard' ? 10 : Math.min(pool.length, CAP_FULL);
  return pool.slice(0, n);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Trivia({
  explorerId: _explorerId,
  config,
  onFinish,
}: {
  explorerId: string;
  config: TriviaConfig;
  onFinish: OnFinish;
}) {
  const rounds = useMemo(() => buildRounds(config), [config]);

  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [cleanRound, setCleanRound] = useState(true);

  // per-question interactive state
  const [attempts, setAttempts] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [reveal, setReveal] = useState(false);

  // round tallies
  const missedRef = useRef<ReviewItem[]>([]);
  const correctedRef = useRef<MissRecord[]>([]);
  const missedThisQ = useRef(false);
  const finishedRef = useRef(false);

  const optOrder = useMemo(
    () => (rounds[qi] ? shuffle(rounds[qi].q.opts.map((_, i) => i)) : []),
    [qi, rounds],
  );

  // timer
  const elapsed = useRoundClock(config.timed && !answered && !reveal && qi < rounds.length);

  // finish once we run past the last question
  useEffect(() => {
    if (qi < rounds.length || finishedRef.current) return;
    finishedRef.current = true;
    const total = rounds.length;
    const result: GameResult = {
      game: 'trivia',
      boardKey: config.practice ? 'trivia|practice' : `trivia|${config.tier}|${config.length}|${config.timed ? 'timed' : 'untimed'}|v2`,
      label: config.practice
        ? 'Practice · My Misses'
        : `Trivia · ${cap(config.tier)} · ${cap(config.length)}`,
      scopeTag: config.practice ? 'practice' : config.tier,
      timed: config.timed,
      elapsedSec: elapsed,
      score,
      total,
      firstTry,
      clean: cleanRound,
    };
    onFinish(result, {
      missed: missedRef.current,
      corrected: correctedRef.current,
      practiceItems: missedRef.current,
    });
  }, [qi, rounds.length, config, elapsed, score, firstTry, cleanRound, onFinish]);

  if (rounds.length === 0) {
    return <div className="ac-empty">No questions to practice — nicely done!</div>;
  }
  if (qi >= rounds.length) return null;

  const round = rounds[qi];
  const q = round.q;
  const evidence = triviaFeedback(q);

  function choose(origIdx: number) {
    if (answered || wrong.has(origIdx)) return;
    const n = attempts + 1;
    setAttempts(n);
    if (origIdx === q.a) {
      setScore((s) => s + awardPoints(n));
      setAnswered(true);
      if (n === 1) {
        setFirstTry((f) => f + 1);
        if (config.practice) correctedRef.current.push({ tier: round.tier, q: q.q });
      }
    } else {
      setWrong((prev) => new Set(prev).add(origIdx));
      setCleanRound(false);
      if (!missedThisQ.current) {
        missedThisQ.current = true;
        missedRef.current.push({ tier: round.tier, q: q.q, answer: q.opts[q.a], ref: q.ref });
      }
    }
  }

  function next() {
    setQi((i) => i + 1);
    setAttempts(0);
    setAnswered(false);
    setWrong(new Set());
    setReveal(false);
    missedThisQ.current = false;
  }

  return (
    <div className="ac-play">
      <Hud score={score} elapsed={elapsed} timed={config.timed} />
      {config.timed && (answered || reveal) && <p className="ac-clock-note" role="status">Clock paused · take your time reading.</p>}
      <div className="ac-progress">Question {qi + 1} of {rounds.length}</div>
      <div className="ac-question">{q.q}</div>

      <div className="ac-opts">
        {optOrder.map((origIdx) => {
          const isCorrect = answered && origIdx === q.a;
          const isWrong = wrong.has(origIdx);
          return (
            <button
              key={origIdx}
              className={`ac-opt${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`}
              disabled={answered || isWrong || reveal}
              onClick={() => choose(origIdx)}
            >
              {q.opts[origIdx]}
            </button>
          );
        })}
      </div>

      <div className={`ac-fb${answered ? ' good' : wrong.size ? ' bad' : ''}`}>
        {answered ? (
          <>
            <div className="ac-fb-line">
              ✓ {attempts === 1 ? 'Correct!' : 'Got it.'} The answer is <b>{q.opts[q.a]}</b>.
            </div>
            {(
              reveal ? (
                <div className="ac-explanation"><p>{evidence.note}</p>{evidence.passage && <blockquote>{evidence.passage}</blockquote>}{q.ref && <a href={evidence.url} target="_blank" rel="noopener noreferrer">{q.ref} · Read passage (WEB)</a>}</div>
              ) : (
                <button className="ac-reveal-btn" onClick={() => setReveal(true)}>{q.ref ? 'Why this answer? Read Scripture' : 'Why this answer?'}</button>
              )
            )}
          </>
        ) : wrong.size ? (
          <><div className="ac-fb-line">That choice does not fit this question. Try again, or read a Scripture hint.</div>
            <button className="ac-reveal-btn" onClick={() => setReveal((v) => !v)}>{reveal ? 'Back to answering' : 'Read a Scripture hint'}</button>
            {reveal && <div className="ac-explanation">{evidence.passage ? <blockquote>{evidence.passage}</blockquote> : <p>{evidence.note}</p>}{q.ref && <a href={evidence.url} target="_blank" rel="noopener noreferrer">{q.ref} · WEB</a>}<p>The clock is paused while you read.</p></div>}
          </>
        ) : (
          <div className="ac-fb-line hint">Pick the best answer.</div>
        )}
      </div>

      <button className="ac-next" disabled={!answered} onClick={next}>
        {qi + 1 >= rounds.length ? 'Finish →' : 'Next →'}
      </button>
    </div>
  );
}
