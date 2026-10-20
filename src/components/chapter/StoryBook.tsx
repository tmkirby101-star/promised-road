import { useEffect, useState } from 'react';
import { SPREADS, type Spread } from '../../prototype/creationSpreads';
import { useStore } from '../../lib/store';
import { speak, stopSpeaking } from '../../lib/speak';
import '../../prototype/book.css';

/**
 * The seven-day Creation storybook as the chapter's story section (replaces the
 * old card pages). Integrated with the shared record: resumes from cursor.storyPage,
 * reads aloud via the access support, and marks storyExperienced on finish. The
 * narrator tells the story inside the book; the guide (Isaiah) speaks only in the
 * hand-off out to the activities — never as an eyewitness to Creation.
 */

const CHID = 'genesis-01';
const GUIDE = 'Isaiah';
const TOTAL_FACES = SPREADS.length * 2; // [img0, text0, …]

export default function StoryBook({ explorerId, onNext }: { explorerId: string; onNext: () => void }) {
  const store = useStore();
  const access = store.getAccess(explorerId);
  const narration = access.narration;

  const [face, setFaceState] = useState(() => {
    const sp = store.getChapter(explorerId, CHID).cursor.storyPage || 0;
    return Math.min(Math.max(0, sp), TOTAL_FACES - 1);
  });
  const setFace = (n: number) => {
    setFaceState(n);
    store.setCursor(explorerId, CHID, { storyPage: n });
  };
  const [narrow, setNarrow] = useState(false);
  const [phase, setPhase] = useState<'reading' | 'bridge'>('reading');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const single = access.largeText || narrow;
  const spreadIndex = Math.floor(face / 2);
  const sp = SPREADS[spreadIndex];
  const atLast = single ? face + 1 >= TOTAL_FACES : spreadIndex + 1 >= SPREADS.length;

  const readable =
    sp.narration.join(' ') + ' From Scripture. ' + sp.scripture.text + (sp.secondScripture ? ' ' + sp.secondScripture.text : '');

  useEffect(() => {
    stopSpeaking();
    if (phase === 'reading' && narration) speak(readable);
    return stopSpeaking;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [face, phase, narration]);

  const finishReading = () => {
    store.setParticipation(explorerId, CHID, { storyExperienced: true });
    setPhase('bridge');
  };
  const next = () => {
    if (atLast) finishReading();
    else setFace(single ? face + 1 : (spreadIndex + 1) * 2);
  };
  const prev = () => setFace(single ? Math.max(0, face - 1) : Math.max(0, (spreadIndex - 1) * 2));

  if (phase === 'bridge') {
    return (
      <div className="bk-root bk-embed">
        <div className="bk-stage">
          <div className="bk-act bk-reveal">
            <div className="bk-guide-row">
              <div className="seal">📜</div>
              <div>
                <div className="who">{GUIDE}</div>
                <p className="invite">“You have read how God made the world. Now let us remember it together.”</p>
              </div>
            </div>
            <div className="bk-next">
              <button onClick={onNext}>Let’s explore →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rootClass = `bk-root bk-embed${single ? ' single' : ''}${access.largeText ? ' bigtext' : ''}`;

  return (
    <div className={rootClass}>
      <div className="bk-stage">
        <div className="bk-book">
          <span className="bk-ribbon" title={`Day ${spreadIndex + 1}`} />
          {single ? (
            face % 2 === 0 ? (
              <div className="bk-page left">
                <div className="bk-face" key={`i${face}`}>
                  <div className="bk-illus"><img src={sp.img} alt={sp.alt} /></div>
                </div>
              </div>
            ) : (
              <div className="bk-page right"><TextFace sp={sp} k={`t${face}`} /></div>
            )
          ) : (
            <>
              <div className="bk-page left">
                <div className="bk-face" key={`l${spreadIndex}`}>
                  <div className="bk-illus"><img src={sp.img} alt={sp.alt} /></div>
                </div>
              </div>
              <span className="bk-crease" />
              <div className="bk-page right"><TextFace sp={sp} k={`r${spreadIndex}`} /></div>
            </>
          )}
        </div>
      </div>
      <div className="bk-nav">
        <button onClick={prev} disabled={face === 0}>‹ Back</button>
        <span className="bk-page-count">
          {single ? `Page ${face + 1} of ${TOTAL_FACES}` : `Day ${spreadIndex + 1} of ${SPREADS.length}`}
        </span>
        <button onClick={next}>{atLast ? 'Finish the story ›' : 'Turn the page ›'}</button>
      </div>
    </div>
  );
}

function TextFace({ sp, k }: { sp: Spread; k: string }) {
  return (
    <div className="bk-face" key={k}>
      <div className="bk-col">
        <div className="bk-daytag">{sp.day}</div>
        <h1 className="bk-story-title">{sp.title}</h1>
        {sp.narration.map((para, i) => (
          <p className="bk-narr" key={i}>{para}</p>
        ))}
        <button
          className="bk-readaloud"
          onClick={() => speak(sp.narration.join(' ') + ' From Scripture. ' + sp.scripture.text + (sp.secondScripture ? ' ' + sp.secondScripture.text : ''))}
        >
          🔊 Read this page to me
        </button>
        <div className="bk-scrip">
          <span className="sclab">From Scripture · WEB</span>
          <span className="q">“{sp.scripture.text}”</span>
          <span className="r">{sp.scripture.ref}</span>
          {sp.secondScripture && (
            <>
              <span className="q second">“{sp.secondScripture.text}”</span>
              <span className="r">{sp.secondScripture.ref}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
