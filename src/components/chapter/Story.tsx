import { useEffect, useState } from 'react';
import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import { speak } from '../../lib/speak';

const CH = GENESIS_01;

export default function Story({ explorerId, onNext }: { explorerId: string; onNext: () => void }) {
  const store = useStore();
  const [page, setPage] = useState(0);
  const narration = store.getAccess(explorerId).narration;
  const total = CH.story.length;
  const p = CH.story[page];
  const first = page === 0;
  const last = page === total - 1;

  const readable = `${p.retelling}${p.scripture ? ' ' + p.scripture.text : ''}`;

  useEffect(() => {
    if (narration) speak(readable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, narration]);

  const finish = () => {
    store.setParticipation(explorerId, CH.id, { storyExperienced: true });
    onNext();
  };

  return (
    <div className="card">
      {first && (
        <div className="guide-line">
          <div className="guide-badge">{CH.guide.name}</div>
          <div>
            <div className="guide-name">{CH.guide.name.toUpperCase()} · {CH.guide.role}</div>
            <div className="says">{CH.intro}</div>
          </div>
        </div>
      )}

      {p.day && <div className="story-day">{p.day}</div>}
      <h3 className="story-heading">{p.heading}</h3>
      <p className="retelling">{p.retelling}</p>

      {p.scripture && (
        <div className="scripture">
          <div className="scripture-tag">Scripture · {CH.passage.includes('WEB') ? '' : 'WEB'}</div>
          <span className="q">“{p.scripture.text}”</span>
          <span className="ref">{p.scripture.ref}</span>
        </div>
      )}

      <div className="step-actions">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="speak-btn" title="Read this aloud" onClick={() => speak(readable)}>
            🔊
          </button>
          {!first && (
            <button className="pr-secondary" onClick={() => setPage((n) => n - 1)}>
              Back
            </button>
          )}
          <span className="chap-passage">
            {page + 1} of {total}
          </span>
        </div>
        {last ? (
          <button className="pr-primary" onClick={finish}>
            I've read the story →
          </button>
        ) : (
          <button className="pr-primary" onClick={() => setPage((n) => n + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
