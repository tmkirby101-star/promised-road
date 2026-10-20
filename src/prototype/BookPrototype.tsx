import { useEffect, useState } from 'react';
import { speak } from '../lib/speak';
import './book.css';

/**
 * Isolated storybook prototype. Reachable at #book; does not touch the working
 * chapter. Day One uses purpose-made portrait artwork; Day Two retains the
 * existing creation card while the illustration direction is reviewed.
 *
 * The left page is PORTRAIT: artwork must be composed for that upright space,
 * not a landscape scene.
 */

interface Spread {
  key: string;
  day: string;
  img: string;
  alt: string;
  narration: string[]; // two short paragraphs, broken at a story beat
  scripture: { text: string; ref: string };
}

const SPREADS: Spread[] = [
  {
    key: 'day1',
    day: 'Day One',
    img: '/assets/scene-day1-light-v1.webp',
    alt: 'Light breaking over the dark waters',
    narration: [
      'The earth lay dark and empty, and the deep waters were still. Then God spoke into the darkness: “Let there be light!” — and there was light.',
      'God saw that the light was good, and he set the light apart from the darkness. He called the light Day, and the darkness he called Night.',
    ],
    scripture: { text: 'God said, “Let there be light,” and there was light.', ref: 'Genesis 1:3' },
  },
  {
    key: 'day2',
    day: 'Day Two',
    img: '/assets/card-sky.webp',
    alt: 'The open sky stretched high above the waters',
    narration: [
      'God made a wide, open space and stretched it out over the waters, setting the waters below apart from the waters above.',
      'God called that great open space Sky. It arched high over everything, and there was evening and morning — a second day.',
    ],
    scripture: { text: 'God called the expanse “sky”.', ref: 'Genesis 1:8' },
  },
];

const TOTAL_FACES = SPREADS.length * 2; // [img0, text0, img1, text1]

type Phase = 'book' | 'activity' | 'done';

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function BookPrototype() {
  const [phase, setPhase] = useState<Phase>('book');
  const [face, setFace] = useState(0);
  const [closing, setClosing] = useState(false);
  const [bigText, setBigText] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const single = bigText || narrow;
  const spreadIndex = Math.floor(face / 2);
  const bookmark = spreadIndex + 1;
  const atLastReading = single ? face + 1 >= TOTAL_FACES : spreadIndex + 1 >= SPREADS.length;

  // Finish reading: let the book recede, then reveal the discovery space.
  const finishReading = () => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      setPhase('activity');
    }, 480);
  };

  const nextReading = () => {
    if (atLastReading) { finishReading(); return; }
    setFace(single ? face + 1 : (spreadIndex + 1) * 2);
  };
  const prevReading = () => setFace(single ? Math.max(0, face - 1) : Math.max(0, (spreadIndex - 1) * 2));

  const rootClass = `bk-root${single ? ' single' : ''}${bigText ? ' bigtext' : ''}`;

  return (
    <div className={rootClass}>
      <div className="bk-bar">
        <span className="bk-kick">Prototype · Genesis · The Story</span>
        <div className="bk-tools">
          <button aria-pressed={bigText} onClick={() => setBigText((v) => !v)}>A+ Bigger text</button>
          <button onClick={() => { setPhase('book'); setFace(0); }}>↺ Restart</button>
        </div>
      </div>

      {phase === 'book' && (
        <>
          <div className="bk-stage">
            <div className={`bk-book${closing ? ' closing' : ''}`}>
              <span className="bk-ribbon" title={`Bookmark · Day ${bookmark}`} />
              {single ? (
                <SingleFace spread={SPREADS[spreadIndex]} isText={face % 2 === 1} faceKey={face} />
              ) : (
                <>
                  <div className="bk-page left">
                    <div className="bk-face" key={`l${spreadIndex}`}>
                      <div className="bk-illus"><img src={SPREADS[spreadIndex].img} alt={SPREADS[spreadIndex].alt} /></div>
                    </div>
                  </div>
                  <span className="bk-crease" />
                  <div className="bk-page right">
                    <TextFace spread={SPREADS[spreadIndex]} faceKey={`r${spreadIndex}`} />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="bk-nav">
            <button onClick={prevReading} disabled={face === 0 || closing}>‹ Back</button>
            <span className="bk-page-count">
              {single ? `Page ${face + 1} of ${TOTAL_FACES}` : `Day ${bookmark} of ${SPREADS.length}`}
            </span>
            <button onClick={nextReading} disabled={closing}>
              {atLastReading ? 'Finish reading ›' : 'Turn the page ›'}
            </button>
          </div>
        </>
      )}

      {phase === 'activity' && (
        <div className="bk-stage">
          <div className="bk-act bk-reveal">
            <div className="bk-guide-row">
              <div className="seal">📜</div>
              <div>
                <div className="who">Isaiah</div>
                <p className="invite">“You’ve seen the first two days. Which came first?”</p>
              </div>
            </div>
            <Discovery onDone={() => setPhase('done')} />
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="bk-stage">
          <div className="bk-done bk-reveal">
            <div className="big">🌿</div>
            <h3>Well remembered!</h3>
            <p>Your bookmark is saved at Day {SPREADS.length}. You can read on, or come back any time.</p>
            <div className="row">
              <button className="ghost" onClick={() => { setPhase('book'); setFace((SPREADS.length - 1) * 2); }}>
                ← Back to the book
              </button>
              <button onClick={() => { setPhase('book'); setFace(0); }}>Read it again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TextFace({ spread, faceKey }: { spread: Spread; faceKey: string }) {
  return (
    <div className="bk-face" key={faceKey}>
      <div className="bk-col">
        <div className="bk-daytag">{spread.day}</div>
        {spread.narration.map((para, i) => (
          <p className="bk-narr" key={i}>{para}</p>
        ))}
        <button className="bk-readaloud" onClick={() => speak(spread.narration.join(' ') + ' ' + spread.scripture.text)}>
          🔊 Read this page to me
        </button>
        <div className="bk-scrip">
          <span className="sclab">From Scripture · WEB</span>
          <span className="q">“{spread.scripture.text}”</span>
          <span className="r">{spread.scripture.ref}</span>
        </div>
      </div>
    </div>
  );
}

// Single-page mode: one face at a time (illustration, then its words).
function SingleFace({ spread, isText, faceKey }: { spread: Spread; isText: boolean; faceKey: number }) {
  if (!isText)
    return (
      <div className="bk-page left">
        <div className="bk-face" key={`si${faceKey}`}>
          <div className="bk-illus"><img src={spread.img} alt={spread.alt} /></div>
        </div>
      </div>
    );
  return (
    <div className="bk-page right">
      <TextFace spread={spread} faceKey={`st${faceKey}`} />
    </div>
  );
}

// Discovery: sequence the two moments just read. Demonstrates the 'order'
// understanding (what the child actually shows), per the evidence rule.
const MOMENTS = [
  { id: 'light', label: 'Light', img: '/assets/card-light.webp' },
  { id: 'sky', label: 'Sky', img: '/assets/card-sky.webp' },
];
const ORDER = ['light', 'sky'];

function Discovery({ onDone }: { onDone: () => void }) {
  const [pool] = useState(() => shuffle(MOMENTS));
  const [placed, setPlaced] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const done = placed.length === ORDER.length;

  const place = (id: string) => {
    if (done || placed.includes(id)) return;
    if (id === ORDER[placed.length]) {
      setPlaced([...placed, id]);
      setMsg(null);
    } else {
      setMsg('Think back — which did God make first, the light or the sky?');
    }
  };

  return (
    <>
      <p className="bk-sub">Tap each picture into a spot, in the order God made them.</p>

      <div className="bk-slots">
        {ORDER.map((_, i) => {
          const id = placed[i];
          const m = id ? MOMENTS.find((x) => x.id === id)! : null;
          return (
            <div className={`bk-slot ${m ? 'filled' : ''}`} key={i}>
              <span className="sn">{i + 1}</span>
              {m ? <img src={m.img} alt={m.label} /> : <span className="empty">{i === placed.length ? '↓' : '·'}</span>}
            </div>
          );
        })}
      </div>

      {!done && (
        <div className="bk-pool">
          {pool.map((m) => (
            <button key={m.id} className="bk-card" disabled={placed.includes(m.id)} onClick={() => place(m.id)}>
              <img src={m.img} alt={m.label} />
              <span className="cl">{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {msg && !done && <div className="bk-hintline">{msg}</div>}

      {/* Opening the reminder is answer support — in the real record this marks the
          sequencing as guided, not independent. */}
      {!done && !hint && (
        <button className="bk-hint" onClick={() => setHint(true)}>Ask Isaiah for help</button>
      )}
      {!done && hint && (
        <div className="bk-hintline">Remember the very beginning, when it was all dark. What did God make first of all?</div>
      )}

      {done && (
        <>
          <div className="bk-fb">Light first, then the sky — just the way God made them.</div>
          <div className="bk-next"><button onClick={onDone}>Done →</button></div>
        </>
      )}
    </>
  );
}
