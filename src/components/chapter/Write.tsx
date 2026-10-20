import { useState } from 'react';
import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import { speak } from '../../lib/speak';
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
  // Resume exactly: no picture → pick; both self-checks already answered → check;
  // otherwise land back on write so an unfinished sentence is right there to continue.
  const [micro, setMicro] = useState<'pick' | 'write' | 'check'>(() =>
    !d0.subjectId ? 'pick' : d0.named && d0.noticed ? 'check' : 'write',
  );

  const save = () => {
    if (!subject) return;
    store.saveWriting(explorerId, CH.id, {
      subject: subject.label,
      subjectImage: subject.img,
      text: text.trim(),
      selfChecks: { named, noticed },
      gratitude: gratitude.trim() || undefined,
      at: Date.now(),
    });
    onDone();
  };

  const Pinned = () =>
    subject ? (
      <div className="pinned" style={{ marginBottom: 16 }}>
        <img src={subject.img} alt={subject.label} />
        <div className="pin-body">
          <div className="lab">{subject.label}</div>
          <button
            className="pr-secondary"
            style={{ padding: '4px 12px', fontSize: 12, marginTop: 4 }}
            onClick={() => { setSubjectId(null); setMicro('pick'); }}
          >
            Change picture
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="card">
      <div className="wstep">
        <span className={micro === 'pick' ? 'on' : ''}>1 · Pick</span>
        <span className={micro === 'write' ? 'on' : ''}>2 · Write</span>
        <span className={micro === 'check' ? 'on' : ''}>3 · Check</span>
      </div>

      {micro === 'pick' && (
        <>
          <p className="q-prompt">{w.prompt}</p>
          <p className="starter">Pick a picture of something God made:</p>
          <div className="subject-grid">
            {w.subjects.map((s) => (
              <button
                key={s.id}
                aria-pressed={subjectId === s.id}
                onClick={() => {
                  setSubjectId(s.id);
                  setMicro('write');
                }}
              >
                <img src={s.img} alt={s.label} />
                <span className="lab">{s.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {micro === 'write' && subject && (
        <>
          <Pinned />
          <p className="q-prompt" style={{ fontSize: 20 }}>Tell one thing you notice about {subject.label}.</p>
          <div className="feedback" style={{ background: '#f3efe2', color: '#6a5a38', marginTop: 0 }}>
            For example: “{w.example}”
          </div>
          <textarea
            className="write-ta"
            style={{ marginTop: 12 }}
            placeholder="Write your sentence here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="starter">You can start with: “{w.starter}”</p>
          {text.trim().length > 0 && <div className="connect-back">{w.connectBack(subject.label)}</div>}
          <div className="step-actions">
            <button className="pr-secondary" onClick={() => setMicro('pick')}>← Back</button>
            <button className="pr-primary" disabled={text.trim().length === 0} onClick={() => setMicro('check')}>
              Next →
            </button>
          </div>
        </>
      )}

      {micro === 'check' && subject && (
        <>
          <div className="pinned my-writing" style={{ marginBottom: 16 }}>
            <img src={subject.img} alt={subject.label} />
            <div className="pin-body">
              <div className="mw-label">What I wrote about {subject.label}</div>
              <p className="mw-text">“{text}”</p>
              <div className="mw-actions">
                <button className="pr-secondary" onClick={() => speak(text)}>🔊 Read my writing</button>
                <button className="pr-secondary" onClick={() => setMicro('write')}>✏️ Edit</button>
              </div>
            </div>
          </div>
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
            <button className="pr-secondary" onClick={() => setMicro('write')}>← Back</button>
            <button className="pr-primary" onClick={save}>Save my writing →</button>
          </div>
        </>
      )}
    </div>
  );
}

// Consistent original line icons for the three care choices — no external art.
function CareIcon({ id }: { id: string }) {
  if (id === 'water')
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <g stroke="#173755" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <circle cx="16" cy="15" r="6" fill="#f3c969" />
          <line x1="16" y1="4" x2="16" y2="6.5" />
          <line x1="16" y1="23.5" x2="16" y2="26" />
          <line x1="5" y1="15" x2="7.5" y2="15" />
          <line x1="24.5" y1="15" x2="27" y2="15" />
          <line x1="8" y1="7" x2="9.8" y2="8.8" />
          <line x1="24" y1="7" x2="22.2" y2="8.8" />
        </g>
        <path d="M34 23 c-5 6 -7 9 -7 12 a7 7 0 0 0 14 0 c0 -3 -2 -6 -7 -12 z" fill="#8fc4f0" stroke="#173755" strokeWidth="2.2" />
      </svg>
    );
  if (id === 'dark')
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M31 7 a17 17 0 1 0 11 31 A13.5 13.5 0 0 1 31 7 z" fill="#2d4a6b" stroke="#173755" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="15" cy="13" r="1.7" fill="#b5893f" />
        <circle cx="11" cy="22" r="1.2" fill="#b5893f" />
      </svg>
    );
  // leaves — a leaf being pulled away from the stem
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M22 42 V22" stroke="#5a7d4a" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M22 28 c-9 -1 -13 -7 -12 -14 c8 -1 13 5 12 14 z" fill="#8fbf6a" stroke="#173755" strokeWidth="2" strokeLinejoin="round" />
      <path d="M31 9 c7 -2 12 0 13 4 c-5 4 -11 3 -13 -4 z" fill="#c7b36a" stroke="#173755" strokeWidth="2" strokeLinejoin="round" />
      <path d="M27 17 l6 -5" stroke="#b5893f" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 4" />
    </svg>
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
      {ap.image && <img className="scene-banner" src={ap.image} alt="A young plant growing in the soil" />}
      <p className="q-prompt">{ap.prompt}</p>
      <div className="choice-grid">
        {ap.choices.map((c) => (
          <button
            key={c.id}
            className={`choice care-choice ${resolved && c.correct ? 'correct' : picked === c.id && !c.correct ? 'wrong' : ''}`}
            disabled={resolved}
            onClick={() => choose(c)}
          >
            <span className="care-ic"><CareIcon id={c.id} /></span>
            <span>{c.text}</span>
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
