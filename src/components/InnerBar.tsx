import { useStore } from '../lib/store';
import { stopSpeaking } from '../lib/speak';

export default function InnerBar({
  explorerId,
  onLeave,
  onParent,
  showParent = true,
  leaveLabel = 'Leave',
}: {
  explorerId: string | null;
  onLeave: () => void;
  onParent?: () => void;
  showParent?: boolean;
  leaveLabel?: string;
}) {
  const store = useStore();
  const access = explorerId ? store.getAccess(explorerId) : { narration: false, largeText: false };

  return (
    <header className="inner-bar">
      <img src="/assets/wordmark.webp" alt="The Promised Road" />
      <div className="bar-actions">
        {explorerId && (
          <>
            <button
              aria-pressed={access.narration}
              title="Read aloud"
              onClick={() => {
                const on = !access.narration;
                store.setAccess(explorerId, { narration: on });
                if (!on) stopSpeaking();
              }}
            >
              🔊 Read aloud
            </button>
            <button
              aria-pressed={access.largeText}
              title="Bigger text"
              onClick={() => store.setAccess(explorerId, { largeText: !access.largeText })}
            >
              A+ Bigger text
            </button>
          </>
        )}
        {showParent && onParent && (
          <button className="ghost" onClick={onParent}>
            For grown-ups
          </button>
        )}
        <button onClick={onLeave}>{leaveLabel}</button>
      </div>
    </header>
  );
}
