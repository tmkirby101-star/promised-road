import { useEffect, useState } from 'react';
import { speak, stopSpeaking } from '../lib/speak';
import './book.css';
import { SPREADS, type Spread } from './creationSpreads';

/** Isolated seven-day storybook preview at #book. It never writes chapter evidence. */
const BOOKMARK_KEY = 'promised-road:creation-bookmark:v1';
function loadBookmark(): {face:number; bigText:boolean} {
  try {
    const data = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '{}');
    return {face: Number.isInteger(data.face) ? Math.max(0, Math.min(SPREADS.length * 2 - 1, data.face)) : 0, bigText: data.bigText === true};
  } catch { return {face:0, bigText:false}; }
}

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
  const [face, setFace] = useState(() => loadBookmark().face);
  const [closing, setClosing] = useState(false);
  const [bigText, setBigText] = useState(() => loadBookmark().bigText);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    try {localStorage.setItem(BOOKMARK_KEY, JSON.stringify({face, bigText}));} catch { /* reading works without storage */ }
  }, [face, bigText]);
  useEffect(() => {stopSpeaking(); return stopSpeaking;}, [face, phase]);

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
        <span className="bk-kick">Genesis · A World Made Good</span>
        <div className="bk-tools">
          <label className="bk-day-picker">Go to
            <select aria-label="Choose a creation day" value={spreadIndex} onChange={(e) => {setClosing(false); setPhase('book'); setFace(Number(e.target.value) * 2);}}>
              {SPREADS.map((s,i) => <option key={s.key} value={i}>{s.day}</option>)}
            </select>
          </label>
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
                <p className="invite">“God made a good world. Let’s remember four moments from the story.”</p>
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
            <p>You explored all seven days, from the first light to God’s finished work. Return to any page whenever you like.</p>
            <p className="bk-preview-note">Storybook preview · This does not award chapter completion or a Genesis stamp.</p>
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
        <h1 className="bk-story-title">{spread.title}</h1>
        {spread.narration.map((para, i) => (
          <p className="bk-narr" key={i}>{para}</p>
        ))}
        <button className="bk-readaloud" onClick={() => speak(spread.narration.join(' ') + ' From Scripture. ' + spread.scripture.text + (spread.secondScripture ? ' ' + spread.secondScripture.text : ''))}>
          🔊 Read this page to me
        </button>
        <div className="bk-scrip">
          <span className="sclab">From Scripture · WEB</span>
          <span className="q">“{spread.scripture.text}”</span>
          <span className="r">{spread.scripture.ref}</span>
          {spread.secondScripture && <><span className="q second">“{spread.secondScripture.text}”</span><span className="r">{spread.secondScripture.ref}</span></>}
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

// Four selected moments, not a seven-item memory gate. No evidence is awarded by this preview.
const MOMENTS = SPREADS.slice(0,4).map((s,i) => ({id:s.key, label:['Light','Sky','Land & plants','Sun, moon & stars'][i], img:s.img}));
const ORDER = MOMENTS.map(m => m.id);

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
      setMsg('Not quite. Think back to the story. Which of these moments came next?');
    }
  };

  return (
    <>
      <p className="bk-sub">These are four selected moments. Tap the pictures in the order they happened.</p>

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

      {msg && !done && <div role="status" className="bk-hintline">{msg}</div>}

      {/* Opening the reminder is answer support — in the real record this marks the
          sequencing as guided, not independent. */}
      {!done && !hint && (
        <button className="bk-hint" onClick={() => setHint(true)}>Ask Isaiah for help</button>
      )}
      {!done && hint && (
        <div className="bk-hintline">{['At the beginning it was dark. What came into the darkness?', 'After light, God made an open space above the waters.', 'Then dry land appeared and plants grew.', 'Next came the lights that mark days, seasons, and years.'][placed.length]}</div>
      )}

      {done && (
        <>
          <div className="bk-fb">Light, sky, land and plants, then the lights in the sky. You remembered their order!</div>
          <div className="bk-next"><button onClick={onDone}>Done →</button></div>
        </>
      )}
    </>
  );
}
