import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import { UNDERSTANDINGS, understandingState, discoveries, STATE_LABEL } from '../../lib/record';

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

  return (
    <div className="card complete-card">
      <div className="complete-mark">📜✨</div>
      <h3 className="complete-title">Chapter complete!</h3>
      <p className="retelling" style={{ fontSize: 16 }}>
        You finished <strong>{CH.title}</strong> — the story, the memory verse, your writing, and
        caring for God's world.
      </p>

      <div className="discoveries">
        {UNDERSTANDINGS.map((u) => {
          const s = understandingState(rec, u.key);
          return (
            <div className="disc-row" key={u.key}>
              <span className={`disc-dot ${s}`} />
              <span>{u.child}</span>
              <span className="st">{STATE_LABEL[s]}</span>
            </div>
          );
        })}
      </div>

      <p className="chap-passage">
        {found} of 4 discoveries made · Chapter marker earned. The <strong>Genesis stamp</strong> comes
        after the whole book and its review.
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
