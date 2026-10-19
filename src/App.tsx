import { useState } from 'react';
import Masthead from './components/Masthead';
import SceneCarousel from './components/SceneCarousel';
import EntryPanel from './components/EntryPanel';
import BrandDialog, { type InfoKind } from './components/BrandDialog';

export default function App() {
  const [info, setInfo] = useState<InfoKind>(null);
  const [focusSignal, setFocusSignal] = useState(0);

  return (
    <>
      <Masthead
        onInfo={(k) => setInfo(k)}
        onSignIn={() => setFocusSignal((n) => n + 1)}
      />
      <main className="shell">
        <SceneCarousel />
        <section className="entry">
          <span className="preview-label">EARLY ACCESS BUILD</span>
          <EntryPanel focusSignal={focusSignal} />
          <div className="entry-footer">
            The Promised Road · A Bible adventure for growing minds.
          </div>
        </section>
      </main>
      <BrandDialog
        kind={info}
        onClose={() => setInfo(null)}
        onStart={() => {
          setInfo(null);
          setFocusSignal((n) => n + 1);
        }}
      />
    </>
  );
}
