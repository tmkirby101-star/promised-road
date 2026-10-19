import { useEffect, useState } from 'react';
import Masthead from './components/Masthead';
import SceneCarousel from './components/SceneCarousel';
import EntryPanel from './components/EntryPanel';
import ExplorerSelect from './components/ExplorerSelect';
import JourneyView from './components/JourneyView';
import ChapterFlow from './components/chapter/ChapterFlow';
import ParentView from './components/ParentView';
import BrandDialog, { type InfoKind } from './components/BrandDialog';
import { useStore } from './lib/store';

type View = 'landing' | 'explorers' | 'journey' | 'chapter' | 'parent';

export default function App() {
  const store = useStore();
  const [view, setView] = useState<View>('landing');
  const [explorerId, setExplorerId] = useState<string | null>(null);
  const [info, setInfo] = useState<InfoKind>(null);
  const [focusSignal, setFocusSignal] = useState(0);

  // Large-text access support toggles a body class.
  const largeText = explorerId ? store.getAccess(explorerId).largeText : false;
  useEffect(() => {
    document.body.classList.toggle('pr-large', largeText);
  }, [largeText]);

  if (view === 'explorers') {
    return (
      <ExplorerSelect
        onPick={(id) => {
          setExplorerId(id);
          setView('journey');
        }}
        onLeave={() => setView('landing')}
      />
    );
  }
  if (view === 'journey' && explorerId) {
    return (
      <JourneyView
        explorerId={explorerId}
        onBegin={() => setView('chapter')}
        onLeave={() => setView('explorers')}
        onParent={() => setView('parent')}
      />
    );
  }
  if (view === 'chapter' && explorerId) {
    return (
      <ChapterFlow
        explorerId={explorerId}
        onLeave={() => setView('journey')}
        onParent={() => setView('parent')}
      />
    );
  }
  if (view === 'parent' && explorerId) {
    return (
      <ParentView
        explorerId={explorerId}
        onLeave={() => setView('landing')}
        onBack={() => setView('journey')}
      />
    );
  }

  return (
    <>
      <Masthead onInfo={(k) => setInfo(k)} onSignIn={() => setFocusSignal((n) => n + 1)} />
      <main className="shell">
        <SceneCarousel />
        <section className="entry">
          <span className="preview-label">EARLY ACCESS BUILD</span>
          <EntryPanel focusSignal={focusSignal} onGuest={() => setView('explorers')} />
          <div className="entry-footer">The Promised Road · A Bible adventure for growing minds.</div>
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
