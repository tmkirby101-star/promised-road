import { useState, type ReactNode } from 'react';
import InnerBar from '../InnerBar';
import StoryBook from './StoryBook';
import Explore from './Explore';
import Write from './Write';
import Complete from './Complete';
import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import type { ChapterRecord, EvidenceKey } from '../../lib/record';

type Step = 'story' | 'explore' | 'write' | 'complete';

const CH = GENESIS_01;

function hasCorrect(rec: ChapterRecord, key: EvidenceKey) {
  return rec.attempts.some((a) => a.understanding === key && a.correct);
}

function resumeStep(rec: ChapterRecord): Step {
  if (!rec.participation.storyExperienced) return 'story';
  const exploreDone =
    hasCorrect(rec, 'created') &&
    hasCorrect(rec, 'good') &&
    hasCorrect(rec, 'image') &&
    hasCorrect(rec, 'complete') &&
    hasCorrect(rec, 'sequence') &&
    rec.participation.memoryPracticed;
  if (!exploreDone) return 'explore';
  if (!(rec.participation.responseSaved && rec.participation.applicationDone)) return 'write';
  return 'complete';
}

const STEPS: Step[] = ['story', 'explore', 'write', 'complete'];

export default function ChapterFlow({
  explorerId,
  onLeave,
  onParent,
}: {
  explorerId: string;
  onLeave: () => void;
  onParent: () => void;
}) {
  const store = useStore();
  const rec0 = store.getChapter(explorerId, CH.id);
  // Start at the later of the saved cursor and what progress implies.
  const [step, setStep] = useState<Step>(() => {
    const byCursor = STEPS.indexOf(rec0.cursor.step);
    const byProgress = STEPS.indexOf(resumeStep(rec0));
    return STEPS[Math.max(byCursor, byProgress)];
  });

  // Replaying a single section from the completion screen: do it, then return to
  // the recap (not forward through the rest). Achievements are preserved because
  // completedAt is never cleared and understanding states are sticky-best.
  const [replaying, setReplaying] = useState(false);

  const go = (s: Step) => {
    store.setCursor(explorerId, CH.id, { step: s });
    setStep(s);
  };

  const afterSection = (normalNext: Step) => {
    if (replaying) {
      setReplaying(false);
      go('complete');
    } else {
      go(normalNext);
    }
  };

  const startReplay = (section: 'story' | 'explore' | 'write') => {
    if (section === 'story') store.setCursor(explorerId, CH.id, { storyPage: 0 });
    if (section === 'explore') store.setCursor(explorerId, CH.id, { exploreSub: 'q0' });
    if (section === 'write') store.setCursor(explorerId, CH.id, { writeSub: 'compose' });
    setReplaying(true);
    go(section);
  };

  const steps = STEPS;
  const stepIndex = steps.indexOf(step);

  let body: ReactNode = null;
  switch (step) {
    case 'story':
      body = <StoryBook explorerId={explorerId} replaying={replaying} onNext={() => afterSection('explore')} />;
      break;
    case 'explore':
      body = <Explore explorerId={explorerId} replaying={replaying} onNext={() => afterSection('write')} />;
      break;
    case 'write':
      body = <Write explorerId={explorerId} replaying={replaying} onNext={() => afterSection('complete')} />;
      break;
    case 'complete':
      body = (
        <Complete
          explorerId={explorerId}
          onLeave={onLeave}
          onParent={onParent}
          onReplay={startReplay}
        />
      );
      break;
  }

  return (
    <div className="app-journey chapter-bg">
      <InnerBar explorerId={explorerId} onLeave={onLeave} onParent={onParent} />
      <div className={`inner-wrap${step === 'story' ? ' story-wrap' : ''}`}>
        {step !== 'story' && (
          <div className="chap-head">
            <span className="chap-kicker">GENESIS · CHAPTER 1</span>
            <h2 className="chap-title">{CH.title}</h2>
            <span className="chap-passage">{CH.passage}</span>
          </div>
        )}
        <div className="progress-row" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s} className={i <= stepIndex ? 'on' : ''} />
          ))}
        </div>
        {body}
      </div>
    </div>
  );
}
