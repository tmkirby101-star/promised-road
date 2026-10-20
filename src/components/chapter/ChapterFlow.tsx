import { useMemo, useState } from 'react';
import InnerBar from '../InnerBar';
import Story from './Story';
import Explore from './Explore';
import Write from './Write';
import Complete from './Complete';
import { GENESIS_01 } from '../../content/genesis01';
import { useStore } from '../../lib/store';
import type { ChapterRecord, UnderstandingKey } from '../../lib/record';

type Step = 'story' | 'explore' | 'write' | 'complete';

const CH = GENESIS_01;

function hasCorrect(rec: ChapterRecord, key: UnderstandingKey) {
  return rec.attempts.some((a) => a.understanding === key && a.correct);
}

function resumeStep(rec: ChapterRecord): Step {
  if (!rec.participation.storyExperienced) return 'story';
  const exploreDone =
    hasCorrect(rec, 'creator') && hasCorrect(rec, 'good') && hasCorrect(rec, 'order') && rec.participation.memoryPracticed;
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

  const go = (s: Step) => {
    store.setCursor(explorerId, CH.id, { step: s });
    setStep(s);
  };

  const steps = STEPS;
  const stepIndex = steps.indexOf(step);

  const body = useMemo(() => {
    switch (step) {
      case 'story':
        return <Story explorerId={explorerId} onNext={() => go('explore')} />;
      case 'explore':
        return <Explore explorerId={explorerId} onNext={() => go('write')} />;
      case 'write':
        return <Write explorerId={explorerId} onNext={() => go('complete')} />;
      case 'complete':
        return <Complete explorerId={explorerId} onLeave={onLeave} onParent={onParent} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, explorerId, onLeave, onParent]);

  return (
    <div className="app-journey chapter-bg">
      <InnerBar explorerId={explorerId} onLeave={onLeave} onParent={onParent} />
      <div className="inner-wrap">
        <div className="chap-head">
          <span className="chap-kicker">GENESIS · CHAPTER 1</span>
          <h2 className="chap-title">{CH.title}</h2>
          <span className="chap-passage">{CH.passage}</span>
        </div>
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
