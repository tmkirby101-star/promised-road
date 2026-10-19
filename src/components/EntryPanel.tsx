import { useEffect, useRef, useState } from 'react';

const STAGE_NOTE =
  'This is the Stage 0 build — the look is live, real accounts and saving arrive in the next update.';

export default function EntryPanel({
  focusSignal,
  onGuest,
}: {
  focusSignal: number;
  onGuest: () => void;
}) {
  const [tab, setTab] = useState<'parent' | 'explorer'>('parent');
  const [parentMode, setParentMode] = useState<'signin' | 'setup'>('signin');
  const [message, setMessage] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const parentTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focusSignal === 0) return;
    setTab('parent');
    parentTabRef.current?.focus();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panelRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }, [focusSignal]);

  const notYet = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(STAGE_NOTE);
  };

  return (
    <div className="panel" id="panel" ref={panelRef}>
      <svg className="smallmark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20c4-2 12-2 16 0M6 4c3 1.5 9 1.5 12 0v13c-3 1.5-9 1.5-12 0z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <span className="kicker">A WHOLE STORY AWAITS</span>
      <h2>Continue your journey.</h2>
      <p>Pick up where you left off, or set up your family to begin.</p>

      <div className="tabs" role="tablist" aria-label="Sign in as">
        <button
          id="parentTab"
          ref={parentTabRef}
          role="tab"
          aria-selected={tab === 'parent'}
          onClick={() => {
            setTab('parent');
            setMessage('');
          }}
        >
          Parent
        </button>
        <button
          role="tab"
          aria-selected={tab === 'explorer'}
          onClick={() => {
            setTab('explorer');
            setMessage('');
          }}
        >
          Explorer
        </button>
      </div>

      {tab === 'parent' && parentMode === 'signin' && (
        <form onSubmit={notYet}>
          <label htmlFor="email">Parent email</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" />
          <button className="primary" type="submit">
            Sign in
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setParentMode('setup');
              setMessage('');
            }}
          >
            New here? Set up your family
          </button>
        </form>
      )}

      {tab === 'parent' && parentMode === 'setup' && (
        <form onSubmit={notYet}>
          <button
            className="back"
            type="button"
            onClick={() => {
              setParentMode('signin');
              setMessage('');
            }}
          >
            ← Back to sign in
          </button>
          <label htmlFor="family">Family name</label>
          <input id="family" type="text" placeholder="The Kirby family" />
          <label htmlFor="setup-email">Parent email</label>
          <input id="setup-email" type="email" autoComplete="email" placeholder="you@example.com" />
          <label htmlFor="setup-password">Create a password</label>
          <input id="setup-password" type="password" autoComplete="new-password" />
          <button className="primary" type="submit">
            Create our family
          </button>
        </form>
      )}

      {tab === 'explorer' && (
        <div>
          <p className="fine">
            Explorers appear here once a parent has set up your family. Ask a grown-up to get
            started.
          </p>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setTab('parent');
              setParentMode('setup');
            }}
          >
            Set up a family
          </button>
        </div>
      )}

      {message && (
        <div className="message" role="status">
          {message}
        </div>
      )}

      <div className="guest-entry">
        <button className="primary" type="button" onClick={onGuest}>
          Explore without signing in →
        </button>
        <p className="guest-note">No account needed — jump in and look around.</p>
      </div>
    </div>
  );
}
