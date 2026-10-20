import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import { discoveries } from '../../lib/record';

const CH = GENESIS_01;

export default function Complete({
  explorerId,
  onLeave,
  onParent,
}: {
  explorerId: string;
  onLeave: () => void;
  onParent: () => void;
}) {
  const store = useStore();
  const rec = store.getChapter(explorerId, CH.id);
  const found = discoveries(rec);

  const recap = [
    { icon: '📖', text: 'You read the story of creation' },
    { icon: '✨', text: 'You practiced the memory verse' },
    { icon: '🔢', text: 'You put creation in order' },
    { icon: '✍️', text: 'You wrote about something God made' },
    { icon: '🪴', text: 'You cared for part of God’s world' },
  ];

  return (
    <div className="card complete-card">
      <div className="complete-mark">📜✨</div>
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
      <p className="chap-passage">
        You earned your Chapter 1 marker. The <strong>Genesis stamp</strong> is waiting for you at the
        end of the whole book!
      </p>

      <div className="step-actions" style={{ justifyContent: 'center', gap: 12 }}>
        <button className="pr-secondary" onClick={onParent}>
          For grown-ups
        </button>
        <button className="pr-primary" onClick={onLeave}>
          Back to the journey
        </button>
      </div>
    </div>
  );
}
