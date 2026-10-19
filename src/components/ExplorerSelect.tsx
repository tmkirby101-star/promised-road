import InnerBar from './InnerBar';
import { EXPLORERS } from '../content/explorers';

export default function ExplorerSelect({
  onPick,
  onLeave,
}: {
  onPick: (explorerId: string) => void;
  onLeave: () => void;
}) {
  return (
    <div className="app-journey">
      <InnerBar explorerId={null} onLeave={onLeave} leaveLabel="← Back to start" showParent={false} />
      <div className="inner-wrap">
        <div className="chap-head">
          <span className="chap-kicker">WHO'S READING TODAY?</span>
          <h2 className="chap-title">Choose your explorer</h2>
          <p className="chap-passage">Pick who's learning — no sign-in needed.</p>
        </div>
        <div className="explorer-grid">
          {EXPLORERS.map((e) => {
            const ready = e.chapterId != null;
            return (
              <button
                key={e.id}
                className="explorer-card"
                disabled={!ready}
                onClick={() => ready && onPick(e.id)}
              >
                <div className="avatar" style={{ background: e.tint }}>
                  {e.name.charAt(0)}
                </div>
                <h3>{e.name}</h3>
                <div className="grade">{e.gradeLabel}</div>
                {!ready && <div className="soon">Chapter coming soon</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
