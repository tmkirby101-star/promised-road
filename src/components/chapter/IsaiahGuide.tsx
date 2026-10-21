import type { ReactNode } from 'react';

// Isaiah appears only at meaningful transitions — beside his words, not over the
// story. He reads and points to Scripture; he is never an eyewitness to Creation.
import { ISAIAH_ART as POSES, useArtwork } from '../../lib/artwork';

export default function IsaiahGuide({
  pose,
  line,
  children,
}: {
  pose: keyof typeof POSES;
  line: string;
  children?: ReactNode;
}) {
  const art = useArtwork([POSES[pose]]);
  if (!art.ready) return <div className="guide-panel artwork-loading" role="status">
    <p>{art.failed ? 'Isaiah’s portrait could not load.' : 'Getting your guide ready…'}</p>
    {art.failed && <button className="pr-secondary" onClick={art.retry}>Try again</button>}
  </div>;
  return (
    <div className="guide-panel bk-reveal">
      <img className="guide-portrait" src={POSES[pose]} width="1122" height="1402" alt="Isaiah" />
      <div className="guide-body">
        <div className="guide-who">ISAIAH</div>
        <p className="guide-say">{line}</p>
        {children}
      </div>
    </div>
  );
}
