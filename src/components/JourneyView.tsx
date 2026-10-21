import InnerBar from './InnerBar';
import { GENESIS_01 } from '../content/genesis01';
import { explorerById } from '../content/explorers';
import { useStore } from '../lib/store';

const ROAD = 'M150 312 C220 290 300 315 380 280 S510 290 610 234 S730 220 820 176';

const STOPS: { title: string; pos: [number, number]; ready: boolean }[] = [
  { title: 'A World Made Good', pos: [15, 48], ready: true },
  { title: 'Entrusted with the Earth', pos: [38, 43], ready: false },
  { title: 'The Fracture', pos: [61, 36], ready: false },
  { title: 'A Promise in the Brokenness', pos: [82, 27], ready: false },
];

export default function JourneyView({
  explorerId,
  onBegin,
  onArcade,
  onLeave,
  onParent,
}: {
  explorerId: string;
  onBegin: () => void;
  onArcade: () => void;
  onLeave: () => void;
  onParent: () => void;
}) {
  const store = useStore();
  const explorer = explorerById(explorerId);
  const rec = store.getChapter(explorerId, GENESIS_01.id);
  const completed = rec.completedAt != null;
  const started =
    !completed &&
    (rec.participation.storyExperienced || rec.attempts.length > 0);

  const cta = completed ? 'Revisit this lesson' : started ? 'Continue where you left off' : 'Begin this lesson';
  const kicker = completed ? 'RETURN AND DISCOVER MORE' : started ? 'PICK UP YOUR JOURNEY' : 'YOUR FIRST STEP';

  return (
    <div className="app-journey">
      <InnerBar explorerId={explorerId} onLeave={onLeave} onParent={onParent} leaveLabel="Choose explorer" />
      <div className="journey-wrap">
        <div className="journey-view">
          <div className="journey-heading">
            <span className="kicker">GENESIS · AREA ONE · {explorer?.name?.toUpperCase()}</span>
            <h2>In the Beginning</h2>
            <p>A good world. A sacred calling. The beginning of the promised road.</p>
            <button className="arcade-link" onClick={onArcade}>🕹️ The Arcade — games &amp; Wall of Fame</button>
          </div>

          <div className="journey-scene">
            <img className="eden-image" src="/assets/scene-eden.webp" alt="" aria-hidden="true" decoding="async" />
            <div className="ambient-light" aria-hidden="true" />
            <svg className="journey-road" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">
              <path d={ROAD} fill="none" stroke="#16334c" opacity=".6" strokeWidth="10" />
              <path d={ROAD} fill="none" stroke="#eed08c" strokeWidth="3" strokeDasharray="8 6" />
            </svg>

            {STOPS.map((s, i) => (
              <button
                key={s.title}
                className={`lesson-stop ${i === 0 ? (completed ? 'complete' : 'current') : 'future'}`}
                style={{ ['--x' as string]: `${s.pos[0]}%`, ['--y' as string]: `${s.pos[1]}%` }}
                aria-label={s.ready ? `${cta}: ${s.title}` : `Coming soon: ${s.title}`}
                onClick={() => (s.ready ? onBegin() : undefined)}
                disabled={!s.ready}
              >
                <span className="stop-number">{i === 0 && completed ? '✓' : i + 1}</span>
                <span className="stop-label">
                  {s.title}
                  {i > 0 && <small>Coming soon</small>}
                </span>
              </button>
            ))}

            <article className="continue-panel">
              <span className="kicker">{kicker}</span>
              <h3>{GENESIS_01.title}</h3>
              <span className="passage">{GENESIS_01.passage}</span>
              <p>Before the brokenness, there was beauty. Discover what God says about His creation.</p>
              <button className="primary" onClick={onBegin}>
                {cta}
              </button>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
