import { useState } from 'react';
import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import type { Choice } from '../../content/genesis01';

const CH = GENESIS_01;

export default function Write({ explorerId, onNext }: { explorerId: string; onNext: () => void }) {
  const store = useStore();
  const [sub, setSubState] = useState<'compose' | 'apply'>(
    () => store.getChapter(explorerId, CH.id).cursor.writeSub,
  );
  const go = (s: 'compose' | 'apply') => {
    store.setCursor(explorerId, CH.id, { writeSub: s });
    setSubState(s);
  };
  if (sub === 'compose') return <Compose explorerId={explorerId} onDone={() => go('apply')} />;
  return <Apply explorerId={explorerId} onDone={onNext} />;
}

function Compose({ explorerId, onDone }: { explorerId: string; onDone: () => void }) {
  const store = useStore();
  const w = CH.writing;
  const d0 = store.getChapter(explorerId, CH.id).draft;
  const [subjectId, setSubjectIdState] = useState<string | null>(d0.subjectId);
  const [text, setTextState] = useState(d0.text);
  const [named, setNamedState] = useState<'yes' | 'help' | null>(d0.named);
  const [noticed, setNoticedState] = useState<'yes' | 'help' | null>(d0.noticed);
  const [gratitude, setGratitudeState] = useState(d0.gratitude);

  // Mirror every edit into the saved draft so leaving never loses it.
  const setSubjectId = (v: string | null) => { setSubjectIdState(v); store.setDraft(explorerId, CH.id, { subjectId: v }); };
  const setText = (v: string) => { setTextState(v); store.setDraft(explorerId, CH.id, { text: v }); };
  const setNamed = (v: 'yes' | 'help') => { setNamedState(v); store.setDraft(explorerId, CH.id, { named: v }); };
  const setNoticed = (v: 'yes' | 'help') => { setNoticedState(v); store.setDraft(explorerId, CH.id, { noticed: v }); };
  const setGratitude = (v: string) => { setGratitudeState(v); store.setDraft(explorerId, CH.id, { gratitude: v }); };

  const subject = w.subjects.find((s) => s.id === subjectId) ?? null;
  const canSave = !!subject && text.trim().length > 0;

  const save = () => {
    if (!subject) return;
    store.saveWriting(explorerId, CH.id, {
      subject: subject.label,
      subjectImage: subject.icon,
      text: text.trim(),
      selfChecks: { named, noticed },
      gratitude: gratitude.trim() || undefined,
      at: Date.now(),
    });
    onDone();
  };

  return (
    <div className="card">
      <p className="q-prompt">{w.prompt}</p>
      <div className="feedback" style={{ background: '#f3efe2', color: '#6a5a38', marginTop: 0 }}>
        For example: “{w.example}”
      </div>

      {!subject ? (
        <>
          <p className="starter" style={{ marginTop: 16 }}>Pick a picture to write about:</p>
          <div className="subject-grid">
            {w.subjects.map((s) => (
              <button key={s.id} aria-pressed={false} onClick={() => setSubjectId(s.id)}>
                <span className="ic">{s.icon}</span>
                <span className="lab">{s.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="pinned" style={{ marginTop: 16 }}>
            <span className="ic">{subject.icon}</span>
            <div>
              <div className="lab">{subject.label}</div>
              <button
                className="pr-secondary"
                style={{ padding: '4px 12px', fontSize: 12, marginTop: 4 }}
                onClick={() => setSubjectId(null)}
              >
                Change
              </button>
            </div>
          </div>

          <textarea
            className="write-ta"
            placeholder="Write your sentence here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="starter">You can start with: “{w.starter}”</p>

          {text.trim().length > 0 && <div className="connect-back">{w.connectBack(subject.label)}</div>}

          <div className="selfcheck">
            <div className="q">Did you name something God made?</div>
            <div className="opts">
              <button aria-pressed={named === 'yes'} onClick={() => setNamed('yes')}>Yes</button>
              <button aria-pressed={named === 'help'} onClick={() => setNamed('help')}>Help me check</button>
            </div>
            {named === 'help' && (
              <div className="feedback try" style={{ marginTop: 10 }}>
                Look at your picture — did you write its name in your sentence?
              </div>
            )}

            <div className="q">Did you tell something you notice about it?</div>
            <div className="opts">
              <button aria-pressed={noticed === 'yes'} onClick={() => setNoticed('yes')}>Yes</button>
              <button aria-pressed={noticed === 'help'} onClick={() => setNoticed('help')}>Help me check</button>
            </div>
            {noticed === 'help' && (
              <div className="feedback try" style={{ marginTop: 10 }}>
                Did you tell one thing about it — what it looks like, or what it does?
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="starter" htmlFor="grat">If you like, add why you're thankful for it (not required):</label>
            <input
              id="grat"
              className="write-ta"
              style={{ minHeight: 0, marginTop: 6 }}
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Optional…"
            />
          </div>

          <div className="step-actions">
            <span />
            <button className="pr-primary" disabled={!canSave} onClick={save}>
              Save my writing →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Apply({ explorerId, onDone }: { explorerId: string; onDone: () => void }) {
  const store = useStore();
  const ap = CH.application;
  const [attempts, setAttempts] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [fb, setFb] = useState<{ good: boolean; text: string } | null>(null);

  const choose = (c: Choice) => {
    if (resolved) return;
    setPicked(c.id);
    if (c.correct) {
      store.addAttempt(explorerId, CH.id, {
        understanding: 'application',
        source: 'application',
        correct: true,
        usedAnswerHint: attempts > 0,
      });
      store.setParticipation(explorerId, CH.id, { applicationDone: true });
      setResolved(true);
      setFb({ good: true, text: c.feedback });
    } else {
      store.addAttempt(explorerId, CH.id, {
        understanding: 'application',
        source: 'application',
        correct: false,
        usedAnswerHint: false,
      });
      setAttempts((n) => n + 1);
      setFb({ good: false, text: c.feedback });
    }
  };

  return (
    <div className="card">
      <div className="guide-name">CARING FOR GOD'S WORLD</div>
      <p className="q-prompt">
        <span style={{ fontSize: 40, marginRight: 10 }}>{ap.icon}</span>
        {ap.prompt}
      </p>
      <div className="choice-grid">
        {ap.choices.map((c) => (
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
      {fb && <div className={`feedback ${fb.good ? 'good' : 'try'}`}>{fb.text}</div>}
      {resolved && (
        <div className="step-actions">
          <span />
          <button className="pr-primary" onClick={onDone}>
            Finish the chapter →
          </button>
        </div>
      )}
    </div>
  );
}
