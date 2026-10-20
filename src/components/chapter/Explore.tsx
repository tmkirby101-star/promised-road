import { useEffect, useMemo, useState } from 'react';
import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import { speak } from '../../lib/speak';
import type { Choice } from '../../content/genesis01';
import type { ExploreSub } from '../../lib/record';

const CH = GENESIS_01;

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function Explore({ explorerId, onNext }: { explorerId: string; onNext: () => void }) {
  const store = useStore();
  const narration = store.getAccess(explorerId).narration;
  const [sub, setSubState] = useState<ExploreSub>(() => store.getChapter(explorerId, CH.id).cursor.exploreSub);

  const go = (s: ExploreSub) => {
    store.setCursor(explorerId, CH.id, { exploreSub: s });
    setSubState(s);
  };

  const promptText = useMemo(() => {
    if (sub === 'q0') return CH.questions[0].prompt;
    if (sub === 'q1') return CH.questions[1].prompt;
    if (sub === 'memory') return 'Let us practice our memory verse. ' + CH.memory.full;
    return CH.activity.instruction;
  }, [sub]);

  useEffect(() => {
    if (narration) speak(promptText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub, narration]);

  // Distinct keys so each question mounts with fresh state (no carryover).
  if (sub === 'q0')
    return <QuestionCard key="q0" q={CH.questions[0]} explorerId={explorerId} onDone={() => go('q1')} />;
  if (sub === 'q1')
    return <QuestionCard key="q1" q={CH.questions[1]} explorerId={explorerId} onDone={() => go('memory')} />;
  if (sub === 'memory')
    return <MemoryCard key="memory" explorerId={explorerId} onDone={() => go('order')} />;
  return <OrderCard key="order" explorerId={explorerId} onDone={onNext} />;
}

function QuestionCard({
  q,
  explorerId,
  onDone,
}: {
  q: { key: 'creator' | 'good' | 'order' | 'application'; prompt: string; choices: Choice[] };
  explorerId: string;
  onDone: () => void;
}) {
  const store = useStore();
  const [attempts, setAttempts] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(null);

  const choose = (c: Choice) => {
    if (resolved) return;
    setPicked(c.id);
    if (c.correct) {
      store.addAttempt(explorerId, CH.id, {
        understanding: q.key,
        source: `q.${q.key}`,
        correct: true,
        usedAnswerHint: attempts > 0,
      });
      setResolved(true);
      setFeedback({ good: true, text: c.feedback });
    } else {
      store.addAttempt(explorerId, CH.id, {
        understanding: q.key,
        source: `q.${q.key}`,
        correct: false,
        usedAnswerHint: false,
      });
      setAttempts((n) => n + 1);
      setFeedback({ good: false, text: c.feedback });
    }
  };

  return (
    <div className="card">
      <p className="q-prompt">{q.prompt}</p>
      <div className="choice-grid">
        {q.choices.map((c) => (
          <button
            key={c.id}
            className={`choice ${resolved && c.correct ? 'correct' : picked === c.id && !c.correct ? 'wrong' : ''}`}
            disabled={resolved}
            onClick={() => choose(c)}
          >
            {c.text}
          </button>
        ))}
      </div>
      {feedback && <div className={`feedback ${feedback.good ? 'good' : 'try'}`}>{feedback.text}</div>}
      {resolved && (
        <div className="step-actions">
          <span />
          <button className="pr-primary" onClick={onDone}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function MemoryCard({ explorerId, onDone }: { explorerId: string; onDone: () => void }) {
  const store = useStore();
  const m = CH.memory;
  const [opts] = useState(() => shuffle(m.options));
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const pick = (word: string) => {
    if (done) return;
    if (word === m.answer) {
      store.setParticipation(explorerId, CH.id, { memoryPracticed: true });
      setDone(true);
      setMsg(`“${m.full}”`);
    } else {
      setMsg('Not quite — which word means God made it?');
    }
  };

  return (
    <div className="card">
      <div className="guide-name">MEMORY VERSE · {m.ref}</div>
      <p className="memory-verse">
        {m.before} <span className="memory-blank">{done ? m.answer : '______'}</span> {m.after}
      </p>
      {!done ? (
        <>
          <div className="memory-opts">
            {opts.map((w) => (
              <button key={w} onClick={() => pick(w)}>
                {w}
              </button>
            ))}
          </div>
          {msg && <div className="feedback try" style={{ marginTop: 16 }}>{msg}</div>}
        </>
      ) : (
        <>
          <div className="feedback good">You practiced the verse. Well done!</div>
          <div className="step-actions">
            <span />
            <button className="pr-primary" onClick={onDone}>
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({ explorerId, onDone }: { explorerId: string; onDone: () => void }) {
  const store = useStore();
  const a = CH.activity;
  const [pool] = useState(() => shuffle(a.cards));
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropReady, setDropReady] = useState(false);
  const complete = placed.length === a.correctOrder.length;
  const nextIndex = placed.length;

  const place = (id: string) => {
    if (complete || placed.includes(id)) return;
    const expected = a.correctOrder[placed.length];
    if (id === expected) {
      const next = [...placed, id];
      setPlaced(next);
      setMsg(null);
      if (next.length === a.correctOrder.length) {
        // Help is opt-in; opening it (or any wrong try) counts as answer support.
        store.addAttempt(explorerId, CH.id, {
          understanding: 'order',
          source: 'activity.order',
          correct: true,
          usedAnswerHint: wrongCount > 0 || hintUsed,
        });
      }
    } else {
      store.addAttempt(explorerId, CH.id, {
        understanding: 'order',
        source: 'activity.order',
        correct: false,
        usedAnswerHint: false,
      });
      setWrongCount((n) => n + 1);
      setShakeId(id);
      setTimeout(() => setShakeId(null), 320);
      setMsg(id === 'lights' && expected === 'light' ? a.feedback.lightsEarly : a.feedback.generic);
    }
  };

  return (
    <div className="card">
      <p className="q-prompt">{a.title}</p>
      <p className="retelling" style={{ fontSize: 16, marginBottom: 16 }}>Tap a picture — or drag it — into each spot, in the order God made them.</p>

      <div className="order-slots">
        {a.correctOrder.map((_, i) => {
          const id = placed[i];
          const card = id ? a.cards.find((c) => c.id === id)! : null;
          const isNext = !card && i === nextIndex;
          return (
            <div
              key={i}
              className={`order-slot ${card ? 'filled' : ''} ${isNext && dropReady ? 'drop-ready' : ''}`}
              onDragOver={isNext ? (e) => { e.preventDefault(); setDropReady(true); } : undefined}
              onDragLeave={isNext ? () => setDropReady(false) : undefined}
              onDrop={isNext ? () => { setDropReady(false); if (dragId) place(dragId); } : undefined}
            >
              <span className="slot-num">{i + 1}</span>
              {card ? (
                <>
                  <img src={card.img} alt={card.label} />
                  <span className="slot-lab">{card.label} · {card.hint}</span>
                </>
              ) : (
                <span className="slot-empty">{isNext ? '↓' : '·'}</span>
              )}
            </div>
          );
        })}
      </div>

      {!complete && (
        <div className="order-pool">
          {pool.map((c) => {
            const used = placed.includes(c.id);
            return (
              <button
                key={c.id}
                className={`order-card ${shakeId === c.id ? 'shake' : ''}`}
                disabled={used}
                draggable={!used}
                onDragStart={() => setDragId(c.id)}
                onDragEnd={() => { setDragId(null); setDropReady(false); }}
                onClick={() => place(c.id)}
              >
                <img src={c.img} alt={c.label} />
                <span className="lab">{c.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {msg && !complete && <div className="feedback try" style={{ marginTop: 16 }}>{msg}</div>}

      {/* Help is optional and recorded, so it never masquerades as independent success. */}
      {!complete && !showHint && (
        <div className="step-actions">
          <span />
          <button
            className="pr-secondary"
            onClick={() => {
              setShowHint(true);
              setHintUsed(true);
            }}
          >
            Need a hint?
          </button>
        </div>
      )}
      {!complete && showHint && (
        <div className="feedback" style={{ marginTop: 14, background: '#f3efe2', color: '#6a5a38' }}>
          💡 {a.help}
        </div>
      )}

      {complete && (
        <>
          <div className="feedback good">That's the order God made them — light first of all!</div>
          <div className="step-actions">
            <span />
            <button className="pr-primary" onClick={onDone}>
              On to writing →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
