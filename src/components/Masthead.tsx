import type { InfoKind } from './BrandDialog';

export default function Masthead({
  onInfo,
  onSignIn,
}: {
  onInfo: (k: Exclude<InfoKind, null>) => void;
  onSignIn: () => void;
}) {
  return (
    <header className="entrance-masthead">
      <div className="brand-lockup">
        <img
          className="brand-wordmark"
          src="/assets/brand/lockup.svg"
          alt="The Promised Road — A Bible Adventure"
          width={330}
          height={110}
        />
      </div>
      <nav className="home-nav" aria-label="Main navigation">
        <button className="nav-about" onClick={() => onInfo('about')}>
          About
        </button>
        <button onClick={() => onInfo('parents')}>For Parents</button>
        <button className="nav-entry" onClick={onSignIn}>
          Sign In
        </button>
      </nav>
    </header>
  );
}
