import { useEffect, useState } from 'react';
import { SPREADS, type Spread } from '../../prototype/creationSpreads';
import { useStore } from '../../lib/store';
import { speak, stopSpeaking } from '../../lib/speak';
import { useArtwork } from '../../lib/artwork';
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

const WELCOME = [
  { title: 'Hi! I’m Isaiah.', line: 'Come explore the Bible with me! We will learn about God and His Son, Jesus.' },
  { title: 'Let’s start at the beginning.', line: 'Genesis tells us how God made the world. This is where the story that leads to Jesus begins!' },
  { title: 'Ready to explore?', line: 'We’ll read, play, remember Bible verses, and write. Tap “Open the book” to begin!' },
];

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
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 820px)').matches);
  const art = useArtwork(SPREADS.map((spread) => spread.img));
  const [welcomePage, setWelcomePage] = useState(0);
  const [artworkFailed, setArtworkFailed] = useState(false);
  const [mountedArtwork, setMountedArtwork] = useState<string[]>([]);
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
    if (phase === 'reading' && art.ready && narration) speak(readable);
    return stopSpeaking;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [face, phase, narration, art.ready]);

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
            title={WELCOME[welcomePage].title}
            line={WELCOME[welcomePage].line}
          >
            <p className="welcome-count">Welcome · {welcomePage + 1} of {WELCOME.length}</p>
            <button className="bk-readaloud" onClick={() => speak(WELCOME[welcomePage].line)}>Read this to me</button>
            <div className="welcome-actions">
              {welcomePage > 0 && <button className="pr-secondary" onClick={() => { stopSpeaking(); setWelcomePage((n) => n - 1); }}>Back</button>}
              <button className="pr-primary" onClick={() => { stopSpeaking(); if (welcomePage < WELCOME.length - 1) setWelcomePage((n) => n + 1); else setPhase('reading'); }}>{welcomePage < WELCOME.length - 1 ? 'Next →' : 'Open the book →'}</button>
              <button className="welcome-skip" onClick={() => { stopSpeaking(); setPhase('reading'); }}>Skip welcome</button>
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
        <div className={`bk-book${mountedArtwork.length < SPREADS.length ? ' preparing' : ''}`} aria-busy={mountedArtwork.length < SPREADS.length}>
          {mountedArtwork.length < SPREADS.length && <div className="book-loading-message" role="status"><p>{art.failed || artworkFailed ? 'The illustrations could not load.' : 'Preparing your illustrated book…'}</p>{(art.failed || artworkFailed) && <button className="pr-secondary" onClick={() => window.location.reload()}>Try again</button>}</div>}
          <span className="bk-ribbon" title={`Day ${spreadIndex + 1}`} />
          <div className="bk-page left" hidden={single && face % 2 === 1}>
            <div className="bk-face">
              <div className="bk-illus">{SPREADS.map((spread, index) => <img key={spread.key} src={spread.img} width="1600" height="1200"
                alt={index === spreadIndex ? spread.alt : ''} aria-hidden={index !== spreadIndex}
                style={{ visibility: index === spreadIndex ? 'visible' : 'hidden' }}
                onLoad={(event) => { const img = event.currentTarget; void img.decode().then(() => setMountedArtwork((ready) => ready.includes(spread.key) ? ready : [...ready, spread.key])).catch(() => setArtworkFailed(true)); }}
                onError={() => setArtworkFailed(true)}
              />)}</div>
            </div>
          </div>
          {!single && <span className="bk-crease" />}
          <div className="bk-page right" hidden={single && face % 2 === 0}><TextFace sp={sp} k={`r${spreadIndex}`} /></div>
        </div>
      </div>
      <div className="bk-nav">
        <button onClick={prev} disabled={face === 0 || mountedArtwork.length < SPREADS.length}>‹ Back</button>
        <span className="bk-page-count">
          {single ? `Page ${face + 1} of ${TOTAL_FACES}` : `Day ${spreadIndex + 1} of ${SPREADS.length}`}
        </span>
        <button onClick={next} disabled={mountedArtwork.length < SPREADS.length}>{atLast ? 'Finish the story ›' : 'Turn the page ›'}</button>
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
