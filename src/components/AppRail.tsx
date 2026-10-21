import { useState } from 'react';
import { explorerById } from '../content/explorers';
import { useStore } from '../lib/store';
import { stopSpeaking } from '../lib/speak';
import BrandMark from './BrandMark';

export type Destination = 'journey' | 'books' | 'arcade' | 'passport';
const destinations: { id: Destination; label: string; path: string }[] = [
  { id: 'journey', label: 'Journey', path: 'M5 20c0-8 14-8 14-16M5 20h.01M19 4h.01M3 4l4 2-4 2' },
  { id: 'books', label: 'Books', path: 'M12 5v15M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Z' },
  { id: 'arcade', label: 'Arcade', path: 'M7 8h10c3 0 5 11 2 12-2 1-4-3-5-3h-4c-1 0-3 4-5 3C2 19 4 8 7 8ZM8 10v5M5.5 12.5h5M16 11h.01M18 14h.01' },
  { id: 'passport', label: 'Passport', path: 'M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM4 17h15M11 6l1 2 2 .3-1.5 1.4.4 2L11 11l-1.9.7.4-2L8 8.3l2-.3Z' },
];
export default function AppRail({ explorerId, active, onNavigate, onSwitch, onParent }: {
  explorerId: string; active: Destination | null; onNavigate: (view: Destination) => void; onSwitch: () => void; onParent: () => void;
}) {
  const [open, setOpen] = useState(false);
  const explorer = explorerById(explorerId);
  const store = useStore();
  const access = store.getAccess(explorerId);
  return <>
    {open && <button className="rail-scrim" aria-label="Close explorer menu" onClick={() => setOpen(false)} />}
    <aside className="app-rail" aria-label="App navigation">
      <button className="rail-brand" aria-label="The Promised Road — Journey" onClick={() => { setOpen(false); onNavigate('journey'); }}><BrandMark tone="onDark" size={60} title="" /><span>THE PROMISED ROAD</span></button>
      <nav aria-label="Main navigation">{destinations.map((d) => <button key={d.id} aria-current={active === d.id ? 'page' : undefined} onClick={() => { setOpen(false); onNavigate(d.id); }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d.path} /></svg><span>{d.label}</span>
      </button>)}</nav>
      <button className="rail-profile" aria-expanded={open} aria-controls="explorer-menu" onClick={() => setOpen(!open)}><span className="rail-avatar" aria-hidden="true">{explorer?.name[0]}</span><span>{explorer?.name}<small>{explorer?.gradeLabel}</small></span></button>
      {open && <section id="explorer-menu" className="rail-menu" aria-label="Explorer settings">
        <h2>{explorer?.name}’s journey</h2>
        <button aria-pressed={access.narration} onClick={() => { store.setAccess(explorerId, { narration: !access.narration }); if (access.narration) stopSpeaking(); }}>Read aloud <span>{access.narration ? 'On' : 'Off'}</span></button>
        <button aria-pressed={access.largeText} onClick={() => store.setAccess(explorerId, { largeText: !access.largeText })}>Bigger text <span>{access.largeText ? 'On' : 'Off'}</span></button>
        <button onClick={() => { setOpen(false); onParent(); }}>For grown-ups</button>
        <button onClick={() => { setOpen(false); onSwitch(); }}>Choose explorer</button>
        <button onClick={() => setOpen(false)}>Close menu</button>
      </section>}
    </aside>
  </>;
}
