import BrandMark from '../BrandMark';
import { useState, type ReactNode } from 'react';

// Isaiah appears only at meaningful transitions — beside his words, not over the
// story. He reads and points to Scripture; he is never an eyewitness to Creation.
import { ISAIAH_ART as POSES, useArtwork } from '../../lib/artwork';

export default function IsaiahGuide({
  pose,
  line,
  title,
  children,
}: {
  pose: keyof typeof POSES;
  line: string;
  title?: string;
  children?: ReactNode;
}) {
  const art = useArtwork([POSES[pose]]);
  const [portraitReady, setPortraitReady] = useState('');
  const [failed, setFailed] = useState(false);
  const ready = art.ready && portraitReady === POSES[pose];
  return (
    <div className={`guide-panel${title ? ' guide-welcome' : ''}${ready ? '' : ' preparing'}`} aria-busy={!ready}>
      {!ready && <div className="guide-loading-message" role="status"><BrandMark tone="onLight" size={64} title="" /><p>{art.failed || failed ? 'Isaiah’s portrait could not load.' : 'Getting your guide ready…'}</p>{(art.failed || failed) && <button className="pr-secondary" onClick={() => window.location.reload()}>Try again</button>}</div>}
      <img className="guide-portrait" src={POSES[pose]} width="1122" height="1402" alt="Isaiah" onError={() => setFailed(true)} onLoad={(event) => { const img = event.currentTarget; void img.decode().then(() => setPortraitReady(POSES[pose])).catch(() => setFailed(true)); }} />
      <div className="guide-body">
        <div className="guide-who">ISAIAH</div>
        {title && <h2 className="welcome-title">{title}</h2>}
        <p className="guide-say">{line}</p>
        {children}
      </div>
    </div>
  );
}
