import { useEffect, useRef, useState } from 'react';

// The honest account status. Shown before any credential field, and again inside
// the preview, so no one types details into a form that doesn't work.
const STAGE_NOTE =
  'The look and the demo are live. Parent/family accounts and syncing across devices aren’t built yet — for now, the demo saves on this device and browser only.';

export default function EntryPanel({
  focusSignal,
  onGuest,
}: {
  focusSignal: number;
  onGuest: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [tab, setTab] = useState<'parent' | 'explorer'>('parent');
  const [parentMode, setParentMode] = useState<'signin' | 'setup'>('signin');
  const [message, setMessage] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const previewToggleRef = useRef<HTMLButtonElement>(null);

  // The masthead "Sign in" affordance points here; open the account preview and
  // focus its control rather than dropping the visitor into a dead form.
  useEffect(() => {
    if (focusSignal === 0) return;
    setShowPreview(true);
    previewToggleRef.current?.focus();
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
      <span className="kicker">START HERE · EARLY ACCESS</span>
      <h2>Jump in and look around.</h2>
      <p>The demo is open — no account, no sign-in needed.</p>

      <div className="guest-entry primary-cta">
        <button className="primary" type="button" onClick={onGuest}>
          Try the demo →
        </button>
        <p className="guest-note">
          Pick an explorer and start reading. Your progress saves on <strong>this device and browser only</strong> — family
          accounts and syncing across devices come later.
        </p>
      </div>

      <div className="accounts-preview">
        <p className="fine">Parent and family accounts aren’t available yet.</p>
        <button
          ref={previewToggleRef}
          type="button"
          className="preview-toggle"
          aria-expanded={showPreview}
          onClick={() => {
            setShowPreview((v) => !v);
            setMessage('');
          }}
        >
          {showPreview ? 'Hide the account preview' : 'Preview the account screens'}
        </button>

        {showPreview && (
          <div className="accounts-preview-body">
            <p className="preview-tag" role="note">Preview only — these screens don’t work yet.</p>

            <div className="tabs" role="tablist" aria-label="Account preview">
              <button role="tab" aria-selected={tab === 'parent'} onClick={() => { setTab('parent'); setMessage(''); }}>Parent</button>
              <button role="tab" aria-selected={tab === 'explorer'} onClick={() => { setTab('explorer'); setMessage(''); }}>Explorer</button>
            </div>

            {tab === 'parent' && parentMode === 'signin' && (
              <form onSubmit={notYet}>
                <label htmlFor="email">Parent email</label>
                <input id="email" type="email" autoComplete="email" placeholder="you@example.com" />
                <label htmlFor="password">Password</label>
                <input id="password" type="password" autoComplete="current-password" />
                <button className="primary" type="submit">Sign in</button>
                <button className="secondary" type="button" onClick={() => { setParentMode('setup'); setMessage(''); }}>
                  New here? Set up your family
                </button>
              </form>
            )}

            {tab === 'parent' && parentMode === 'setup' && (
              <form onSubmit={notYet}>
                <button className="back" type="button" onClick={() => { setParentMode('signin'); setMessage(''); }}>← Back to sign in</button>
                <label htmlFor="family">Family name</label>
                <input id="family" type="text" placeholder="The Kirby family" />
                <label htmlFor="setup-email">Parent email</label>
                <input id="setup-email" type="email" autoComplete="email" placeholder="you@example.com" />
                <label htmlFor="setup-password">Create a password</label>
                <input id="setup-password" type="password" autoComplete="new-password" />
                <button className="primary" type="submit">Create our family</button>
              </form>
            )}

            {tab === 'explorer' && (
              <p className="fine">Explorers will appear here once a parent has set up a family. For now, use <strong>Try the demo</strong> above.</p>
            )}

            {message && <div className="message" role="status">{message}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
