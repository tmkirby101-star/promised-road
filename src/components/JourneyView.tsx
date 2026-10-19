import { useEffect, useRef, useState } from 'react';

const ROAD =
  'M150 312 C220 290 300 315 380 280 S510 290 610 234 S730 220 820 176';

const STOPS: { title: string; pos: [number, number] }[] = [
  { title: 'A World Made Good', pos: [15, 48] },
  { title: 'Entrusted with the Earth', pos: [38, 43] },
  { title: 'The Fracture', pos: [61, 36] },
  { title: 'A Promise in the Brokenness', pos: [82, 27] },
];

export default function JourneyView({ onLeave }: { onLeave: () => void }) {
  const [toast, setToast] = useState('');
  const timer = useRef<number | undefined>(undefined);

  const say = (msg: string) => {
    setToast(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 3200);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const soon = () => say('The first lesson opens in the next update.');

  return (
    <div className="app-journey">
      <header className="journey-bar">
        <img src="/assets/wordmark.webp" alt="The Promised Road" />
        <div className="bar-actions">
          <button type="button" className="ghost" onClick={() => say('Your Bible Passport arrives in a later update.')}>
            Bible Passport
          </button>
          <button type="button" onClick={onLeave}>
            Leave
          </button>
        </div>
      </header>

      <div className="journey-wrap">
        <div className="journey-view">
          <div className="journey-heading">
            <span className="kicker">GENESIS · AREA ONE</span>
            <h2>In the Beginning</h2>
            <p>A good world. A sacred calling. The beginning of the promised road.</p>
          </div>

          <div className="journey-scene">
            <img
              className="eden-image"
              src="/assets/scene-eden.webp"
              alt=""
              aria-hidden="true"
              decoding="async"
            />
            <div className="ambient-light" aria-hidden="true" />
            <svg
              className="journey-road"
              viewBox="0 0 1000 650"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={ROAD} fill="none" stroke="#16334c" opacity=".6" strokeWidth="10" />
              <path d={ROAD} fill="none" stroke="#eed08c" strokeWidth="3" strokeDasharray="8 6" />
            </svg>

            {STOPS.map((s, i) => (
              <button
                key={s.title}
                className={`lesson-stop ${i === 0 ? 'current' : 'future'}`}
                style={{ ['--x' as string]: `${s.pos[0]}%`, ['--y' as string]: `${s.pos[1]}%` }}
                aria-label={i === 0 ? `Begin ${s.title}` : `Planned lesson: ${s.title}`}
                onClick={soon}
              >
                <span className="stop-number">{i + 1}</span>
                <span className="stop-label">
                  {s.title}
                  {i > 0 && <small>Coming next</small>}
                </span>
              </button>
            ))}

            <article className="continue-panel">
              <span className="kicker">YOUR FIRST STEP</span>
              <h3>A World Made Good</h3>
              <span className="passage">GENESIS 1:1–2:3</span>
              <p>Before the brokenness, there was beauty. Discover what God says about His creation.</p>
              <button className="primary" onClick={soon}>
                Begin this lesson
              </button>
            </article>
          </div>
        </div>
      </div>

      {toast && (
        <div className="journey-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
