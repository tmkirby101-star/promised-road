import { useEffect, useState } from 'react';
import { SPREADS, type Spread } from '../../prototype/creationSpreads';
import { useStore } from '../../lib/store';
import { speak, stopSpeaking } from '../../lib/speak';
import IsaiahGuide from './IsaiahGuide';
import '../../prototype/book.css';

/**
 * The seven-day Creation storybook as the chapter's story section (replaces the
 * old card pages). Integrated with the shared record: resumes from cursor.storyPage,
 * reads aloud via the access support, and marks storyExperienced on finish. The
 * narrator tells the story inside the book; the guide (Isaiah) speaks only in the
 * hand-off out to the activities — never as an eyewitness to Creation.
 */

const CHID = 'genesis-01';
const TOTAL_FACES = SPREADS.length * 2; // [img0, text0, …]

export default function StoryBook({ explorerId, onNext, replaying }: { explorerId: string; onNext: () => void; replaying?: boolean }) {
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
  // Isaiah welcomes the child on first entry; a resume or a replay goes straight to reading.
  const [phase, setPhase] = useState<'welcome' | 'reading' | 'bridge'>(() => {
    const rec = store.getChapter(explorerId, CHID);
    const startFace = Math.min(Math.max(0, rec.cursor.storyPage || 0), TOTAL_FACES - 1);
    return !replaying && startFace === 0 && !rec.participation.storyExperienced ? 'welcome' : 'reading';
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Keep the two-page spread wherever it fits — the book IS the open page. Bigger
  // text enlarges within the spread (the text page scrolls if needed); only a
  // genuinely narrow viewport collapses to one face at a time.
  const single = narrow;
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

  if (phase === 'welcome') {
    return (
      <div className="bk-root bk-embed">
        <div className="bk-stage">
          <IsaiahGuide
            pose="welcoming"
            line="Welcome, friend. I am Isaiah, and I keep the sacred scrolls. Together let us read how God made the world — a good world, made with great care."
          >
            <div className="bk-next">
              <button onClick={() => setPhase('reading')}>Open the book →</button>
            </div>
          </IsaiahGuide>
        </div>
      </div>
    );
  }

  if (phase === 'bridge') {
    return (
      <div className="bk-root bk-embed">
        <div className="bk-stage">
          <IsaiahGuide pose="reading" line="You have read how God made the world. Now let us remember it together.">
            <div className="bk-next">
              <button onClick={onNext}>{replaying ? 'Back to the recap →' : 'Let’s explore →'}</button>
            </div>
          </IsaiahGuide>
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
