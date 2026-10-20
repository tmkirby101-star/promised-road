import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import { discoveries } from '../../lib/record';
import IsaiahGuide from './IsaiahGuide';

const CH = GENESIS_01;

export default function Complete({
  explorerId,
  onLeave,
  onParent,
  onReplay,
}: {
  explorerId: string;
  onLeave: () => void;
  onParent: () => void;
  onReplay: (section: 'story' | 'explore' | 'write') => void;
}) {
  const store = useStore();
  const rec = store.getChapter(explorerId, CH.id);
  const found = discoveries(rec);

  const recap = [
    { icon: '📖', text: 'You read the story of creation' },
    { icon: '✨', text: 'You practiced the memory verse' },
    { icon: '🔢', text: 'You put creation in order' },
    { icon: '✍️', text: 'You wrote about something God made' },
    { icon: '🪴', text: 'You discovered how to care for a plant' },
  ];

  return (
    <>
    <IsaiahGuide
      pose="encouraging"
      line="You have seen the good world God made, friend — and remembered how it all began. God made everything, and it was very good."
    />
    <div className="card complete-card" style={{ marginTop: 16 }}>
      <h3 className="complete-title">Well done!</h3>
      <p className="retelling" style={{ fontSize: 17 }}>
        You finished <strong>{CH.title}</strong>.
      </p>

      <div className="discoveries">
        {recap.map((r) => (
          <div className="disc-row" key={r.text}>
            <span style={{ fontSize: 22 }}>{r.icon}</span>
            <span>{r.text}</span>
            <span className="st" style={{ color: '#2f7d6b', fontWeight: 700 }}>
              ✓
            </span>
          </div>
        ))}
      </div>

      <p className="retelling" style={{ fontSize: 17 }}>
        You made <strong>{found}</strong> {found === 1 ? 'discovery' : 'discoveries'} about God and
        His good world. 🌿
      </p>
      <p className="marker-note">
        You earned your Chapter 1 marker. The <strong>Genesis stamp</strong> is waiting for you at the
        end of the whole book!
      </p>

      <div className="replay-box">
        <div className="replay-label">Want to go through it again?</div>
        <p className="replay-sub">Your discoveries and your marker are saved — practice as much as you like.</p>
        <div className="replay-actions">
          <button className="pr-secondary" onClick={() => onReplay('story')}>📖 Read the story again</button>
          <button className="pr-secondary" onClick={() => onReplay('explore')}>🔢 Practice again</button>
          <button className="pr-secondary" onClick={() => onReplay('write')}>✍️ Revisit my writing</button>
        </div>
      </div>

      <div className="step-actions" style={{ justifyContent: 'center', gap: 12 }}>
        <button className="pr-secondary" onClick={onParent}>
          For grown-ups
        </button>
        <button className="pr-primary" onClick={onLeave}>
          Back to the journey
        </button>
      </div>
    </div>
    </>
  );
}
