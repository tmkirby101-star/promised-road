import InnerBar from './InnerBar';
import { GENESIS_01 } from '../content/genesis01';
import { explorerById } from '../content/explorers';
import { useStore } from '../lib/store';
import {
  UNDERSTANDINGS,
  understandingState,
  laterDifficulty,
  discoveries,
  isComplete,
  STATE_LABEL,
} from '../lib/record';

const CH = GENESIS_01;

export default function ParentView({
  explorerId,
  onLeave,
  onBack,
}: {
  explorerId: string;
  onLeave: () => void;
  onBack: () => void;
}) {
  const store = useStore();
  const rec = store.getChapter(explorerId, CH.id);
  const access = store.getAccess(explorerId);
  const explorer = explorerById(explorerId);
  const usedAnswerHint = rec.attempts.some((a) => a.usedAnswerHint);
  const p = rec.participation;

  return (
    <div className="app-journey">
      <InnerBar explorerId={null} onLeave={onLeave} showParent={false} leaveLabel="Leave" />
      <div className="inner-wrap">
        <button className="pr-secondary" style={{ marginBottom: 14 }} onClick={onBack}>
          ← Back to {explorer?.name ?? 'the journey'}
        </button>

        <h2 className="parent-h">
          {explorer?.name} · {explorer?.gradeLabel}
        </h2>
        <p className="parent-sub">
          {CH.bookTitle} · Chapter 1: {CH.title} —{' '}
          {isComplete(rec) ? 'complete' : 'in progress'} · {discoveries(rec)} of 4 discoveries
        </p>

        {/* Understandings */}
        <div className="parent-sec">
          <h4>Discoveries (understanding)</h4>
          {UNDERSTANDINGS.map((u) => {
            const s = understandingState(rec, u.key);
            return (
              <div className="evi-row" key={u.key}>
                <span className="k">
                  {u.child}
                  {laterDifficulty(rec, u.key) && (
                    <span className="evi-note">· later needed help</span>
                  )}
                </span>
                <span className={`s ${s}`}>{STATE_LABEL[s]}</span>
              </div>
            );
          })}
        </div>

        {/* Participation */}
        <div className="parent-sec">
          <h4>Participation (what was done)</h4>
          <span className={`pill ${p.storyExperienced ? 'on' : ''}`}>
            {p.storyExperienced ? '✓' : '○'} Story experienced
          </span>
          <span className={`pill ${p.memoryPracticed ? 'on' : ''}`}>
            {p.memoryPracticed ? '✓' : '○'} Scripture practice
          </span>
          <span className={`pill ${p.responseSaved ? 'on' : ''}`}>
            {p.responseSaved ? '✓' : '○'} Response saved
          </span>
          <span className={`pill ${p.applicationDone ? 'on' : ''}`}>
            {p.applicationDone ? '✓' : '○'} Application
          </span>
          <p className="parent-sub" style={{ marginTop: 10, marginBottom: 0 }}>
            Participation means the child did this part — not a measure of comprehension.
          </p>
        </div>

        {/* Writing */}
        <div className="parent-sec">
          <h4>Writing</h4>
          {rec.writing ? (
            <>
              <div className="writing-sample">
                “{rec.writing.text}”
                {rec.writing.gratitude && <div style={{ marginTop: 8 }}>— {rec.writing.gratitude}</div>}
              </div>
              <p className="parent-sub" style={{ marginTop: 10, marginBottom: 0 }}>
                About: {rec.writing.subject} · saved {new Date(rec.writing.at).toLocaleDateString()}.
                Ungraded in this build; a grade-level writing assessment with AI feedback and revision
                is planned — never shown to the child as a grade.
              </p>
            </>
          ) : (
            <p className="parent-sub" style={{ margin: 0 }}>No response yet.</p>
          )}
        </div>

        {/* Supports */}
        <div className="parent-sec">
          <h4>Supports used</h4>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Access supports</strong>{' '}
            <span className="parent-sub">(never affect independence)</span>
            <div style={{ marginTop: 6 }}>
              <span className={`pill ${access.narration ? 'on' : ''}`}>
                {access.narration ? '✓' : '○'} Read aloud
              </span>
              <span className={`pill ${access.largeText ? 'on' : ''}`}>
                {access.largeText ? '✓' : '○'} Bigger text
              </span>
            </div>
          </div>
          <div>
            <strong style={{ fontSize: 13 }}>Answer support</strong>
            <div style={{ marginTop: 6 }}>
              <span className={`pill ${usedAnswerHint ? 'on' : ''}`}>
                {usedAnswerHint ? 'Used a hint on one or more answers' : 'No answer hints used'}
              </span>
            </div>
          </div>
        </div>

        {/* Rank */}
        <div className="parent-sec">
          <h4>Rank</h4>
          <p className="parent-sub" style={{ margin: 0 }}>
            Performance-based rank is a separate, curriculum-wide system with retakes to improve. It
            is not the same as this chapter's discoveries, and isn't computed in this prototype yet.
          </p>
        </div>
      </div>
    </div>
  );
}
