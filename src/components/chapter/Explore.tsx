import { useEffect, useMemo, useState } from 'react';
import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import { speak } from '../../lib/speak';
import type { Choice } from '../../content/genesis01';

const CH = GENESIS_01;

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

type Sub = 'q0' | 'q1' | 'memory' | 'order';

export default function Explore({ explorerId, onNext }: { explorerId: string; onNext: () => void }) {
  const store = useStore();
  const narration = store.getAccess(explorerId).narration;
  const [sub, setSub] = useState<Sub>('q0');

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

  if (sub === 'q0')
    return <QuestionCard q={CH.questions[0]} explorerId={explorerId} onDone={() => setSub('q1')} />;
  if (sub === 'q1')
    return <QuestionCard q={CH.questions[1]} explorerId={explorerId} onDone={() => setSub('memory')} />;
  if (sub === 'memory')
    return <MemoryCard explorerId={explorerId} onDone={() => setSub('order')} />;
  return <OrderCard explorerId={explorerId} onDone={onNext} />;
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
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const complete = placed.length === a.correctOrder.length;

  const tap = (id: string) => {
    if (complete || placed.includes(id)) return;
    const expected = a.correctOrder[placed.length];
    if (id === expected) {
      const next = [...placed, id];
      setPlaced(next);
      setMsg(null);
      if (next.length === a.correctOrder.length) {
        store.addAttempt(explorerId, CH.id, {
          understanding: 'order',
          source: 'activity.order',
          correct: true,
          usedAnswerHint: wrongCount > 0,
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
      // specific feedback: trying the sun/moon/stars before light
      setMsg(id === 'lights' && expected === 'light' ? a.feedback.lightsEarly : a.feedback.generic);
    }
  };

  return (
    <div className="card">
      <p className="q-prompt">{a.title}</p>
      <p className="retelling" style={{ fontSize: 16, marginBottom: 16 }}>{a.instruction}</p>

      <div className="order-slots">
        {a.correctOrder.map((_, i) => {
          const id = placed[i];
          const card = id ? a.cards.find((c) => c.id === id)! : null;
          return (
            <div key={i} className={`order-slot ${card ? 'filled' : ''}`}>
              <span className="num">{i + 1}</span>
              {card ? (
                <>
                  <span className="lab">{card.label}</span>
                  <span className="day">{card.hint}</span>
                </>
              ) : (
                <span className="lab" style={{ color: '#b9bcae' }}>?</span>
              )}
            </div>
          );
        })}
      </div>

      {!complete && (
        <div className="order-pool">
          {pool.map((c) => (
            <button
              key={c.id}
              className={shakeId === c.id ? 'shake' : ''}
              disabled={placed.includes(c.id)}
              onClick={() => tap(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {msg && !complete && <div className="feedback try" style={{ marginTop: 16 }}>{msg}</div>}
      {!complete && (
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
