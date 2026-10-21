import { useEffect, useMemo, useState } from 'react';
import InnerBar from '../InnerBar';
import { BOOKS_DIV, divLabel, orderableDivs, allBooksFlat } from '../../content/arcadeBooks';
import { TRIVIA, type TriviaTier } from '../../content/arcadeTrivia';
import { explorerById } from '../../content/explorers';
import { arcade, fmtTime, ACHIEVEMENTS, type GameResult } from '../../lib/arcadeStore';
import Trivia, { type TriviaConfig, type RoundLength } from './Trivia';
import BooksOrder, { type OrderConfig } from './BooksOrder';
import BooksSort, { SORT_CHALLENGES, type SortConfig } from './BooksSort';
import { type FinishDetail, type ReviewItem } from './kit';
import '../../styles/arcade.css';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const LENGTHS: { id: RoundLength; label: string }[] = [
  { id: 'quick', label: 'Quick' },
  { id: 'standard', label: 'Standard' },
  { id: 'full', label: 'Full' },
];

// ---- Ordering scopes (canonical Genesis→Revelation sequences) ----
const seqAll = allBooksFlat().map((x) => x.book);
const seqOT = allBooksFlat().filter((x) => BOOKS_DIV[x.divIndex].testament === 'Old').map((x) => x.book);
const seqNT = allBooksFlat().filter((x) => BOOKS_DIV[x.divIndex].testament === 'New').map((x) => x.book);
const ORDER_SCOPES: { id: string; label: string; seq: string[] }[] = [
  { id: 'all', label: 'Whole Bible', seq: seqAll },
  { id: 'ot', label: 'Old Testament', seq: seqOT },
  { id: 'nt', label: 'New Testament', seq: seqNT },
  ...orderableDivs().map((i) => ({ id: slug(divLabel(BOOKS_DIV[i])), label: divLabel(BOOKS_DIV[i]), seq: BOOKS_DIV[i].books.slice() })),
];
const orderScopeById = (id: string) => ORDER_SCOPES.find((s) => s.id === id)!;

export function buildOrderConfig(scopeId: string, timed: boolean): OrderConfig {
  const scope = orderScopeById(scopeId);
  return { seq: scope.seq, boardKey: `order|${scope.id}|full|${timed ? 'timed' : 'untimed'}|v2`,
    label: `${scope.label} · all ${scope.seq.length} books`, scopeTag: scope.id, timed };
}

const TIERS: TriviaTier[] = ['easy', 'medium', 'hard'];

type Play =
  | { kind: 'trivia'; cfg: TriviaConfig }
  | { kind: 'order'; cfg: OrderConfig }
  | { kind: 'sort'; cfg: SortConfig };

type View =
  | { s: 'menu' }
  | { s: 'setup'; game: 'trivia' | 'order' | 'sort' }
  | { s: 'play'; play: Play; nonce: number }
  | { s: 'finish'; result: GameResult; detail?: FinishDetail; replay: Play }
  | { s: 'wallPick' }
  | { s: 'wallGame'; game: 'trivia' | 'order' | 'sort' }
  | { s: 'wallBoard'; boardKey: string; label: string; backGame: 'trivia' | 'order' | 'sort' };

export default function Arcade({ explorerId, onExit, onActiveChange }: { explorerId: string; onExit: () => void; onActiveChange?: (active: boolean) => void }) {
  const explorer = explorerById(explorerId);
  const defaultInitials = (explorer?.name ?? 'YOU').toUpperCase().slice(0, 3);

  const [view, setView] = useState<View>({ s: 'menu' });
  const [length, setLength] = useState<RoundLength>('standard');
  const [timed, setTimed] = useState(false);
  const [tier, setTier] = useState<TriviaTier>('easy');
  const [scopeId, setScopeId] = useState('all');
  const [challengeId, setChallengeId] = useState('otnt');
  const [nonce, setNonce] = useState(1);

  const misses = arcade.getMisses(explorerId);

  // R3: a round is "live" only while actually playing. Report it up so the app can
  // guard navigation away, and warn before a reload/tab-close drops the round.
  const inRound = view.s === 'play';
  useEffect(() => {
    onActiveChange?.(inRound);
    if (!inRound) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [inRound, onActiveChange]);
  useEffect(() => () => { onActiveChange?.(false); }, [onActiveChange]);

  const startPlay = (play: Play) => {
    setNonce((n) => n + 1);
    setView({ s: 'play', play, nonce: nonce + 1 });
  };

  // resolve the explorer's stored misses into playable review items
  const practiceItems = (): ReviewItem[] => {
    const out: ReviewItem[] = [];
    for (const m of misses) {
      const bank = TRIVIA[m.tier as TriviaTier] || [];
      const q = bank.find((x) => x.q === m.q);
      if (q) out.push({ tier: m.tier, q: q.q, answer: q.opts[q.a], ref: q.ref });
    }
    return out;
  };

  const handleFinish = (result: GameResult, detail?: FinishDetail) => {
    // progress is recorded by the Finish screen (which needs the outcome); here we
    // only update the misses list and route to the finish screen.
    if (result.game === 'trivia') {
      arcade.updateMisses(explorerId, detail?.missed ?? [], detail?.corrected ?? []);
    }
    const replay = view.s === 'play' ? view.play : { kind: 'trivia', cfg: { tier: 'easy', length, timed } } as Play;
    setView({ s: 'finish', result: { ...result, runId: crypto.randomUUID() }, detail, replay });
  };

  // ---------- MENU ----------
  if (view.s === 'menu') {
    const achv = arcade.getAchievements(explorerId);
    return (
      <Shell onExit={onExit} explorerId={explorerId}>
        <h1 className="ac-title">The Arcade</h1>
        <p className="ac-sub">Practice what you’re learning — a little friendly competition.</p>
        <div className="ac-menu">
          <GameCard emoji="🔢" title="Books in Order" desc="Place the books of the Bible in order." onClick={() => setView({ s: 'setup', game: 'order' })} />
          <GameCard emoji="🗂️" title="Sort the Books" desc="Which division does each book belong to?" onClick={() => setView({ s: 'setup', game: 'sort' })} />
          <GameCard emoji="❓" title="Bible Trivia" desc="Questions from Genesis to Revelation." onClick={() => setView({ s: 'setup', game: 'trivia' })} />
          <GameCard emoji="🏆" title="Wall of Fame" desc="Best times, high scores, and badges." onClick={() => setView({ s: 'wallPick' })} />
        </div>
        {achv.length > 0 && (
          <div className="ac-badge-row">
            {achv.map(({ ach }) => <span key={ach.id} className="ac-badge" title={ach.blurb}>🏅 {ach.title}</span>)}
          </div>
        )}
      </Shell>
    );
  }

  // ---------- SETUP ----------
  if (view.s === 'setup') {
    const g = view.game;
    const sortScope = SORT_CHALLENGES.find((c) => c.id === challengeId)!;
    const available = g === 'trivia' ? TRIVIA[tier].length : sortScope.items.length;
    const count = g === 'order' ? orderScopeById(scopeId).seq.length :
      Math.min(available, length === 'quick' ? (g === 'trivia' ? 5 : 6) : length === 'standard' ? (g === 'trivia' ? 10 : 12) : (g === 'trivia' ? 40 : available));
    const launch = () => {
      if (g === 'trivia') startPlay({ kind: g, cfg: { tier, length, timed } });
      else if (g === 'order') startPlay({ kind: g, cfg: buildOrderConfig(scopeId, timed) });
      else startPlay({ kind: g, cfg: { challengeId, length, timed } });
    };
    return (
      <Shell onExit={onExit} explorerId={explorerId} onBack={() => setView({ s: 'menu' })}>
        <h2 className="ac-h2">{g === 'trivia' ? 'Bible Trivia' : g === 'order' ? 'Books in Order' : 'Sort the Books'}</h2>
        <div className="ac-setup-panel">
          {g === 'trivia' && <label className="ac-field">Difficulty
            <select value={tier} onChange={(e) => setTier(e.target.value as TriviaTier)}>
              {TIERS.map((t) => <option key={t} value={t}>{cap(t)} · {TRIVIA[t].length} questions in the bank</option>)}
            </select>
          </label>}
          {g === 'order' && <label className="ac-field">What do you want to order?
            <select value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
              {ORDER_SCOPES.map((v) => <option key={v.id} value={v.id}>{v.label} · all {v.seq.length} books</option>)}
            </select>
          </label>}
          {g === 'sort' && <label className="ac-field">Choose a challenge
            <select value={challengeId} onChange={(e) => setChallengeId(e.target.value)}>
              {SORT_CHALLENGES.map((v) => <option key={v.id} value={v.id}>{v.title} — {v.sub}</option>)}
            </select>
          </label>}
          {g !== 'order' && <fieldset className="ac-choice-field"><legend>How long?</legend><div className="ac-chips">
            {LENGTHS.map((l) => {
              const n = Math.min(available, l.id === 'quick' ? (g === 'trivia' ? 5 : 6) : l.id === 'standard' ? (g === 'trivia' ? 10 : 12) : (g === 'trivia' ? 40 : available));
              return <button key={l.id} aria-pressed={length === l.id} className={`ac-chip${length === l.id ? ' on' : ''}`} onClick={() => setLength(l.id)}>{g === 'trivia' && l.id === 'full' ? 'Long' : l.label} · {n} {g === 'trivia' ? 'questions' : 'books'}</button>;
            })}
          </div></fieldset>}
          <fieldset className="ac-choice-field"><legend>Play your way</legend><div className="ac-chips">
            <button aria-pressed={!timed} className={`ac-chip${!timed ? ' on' : ''}`} onClick={() => setTimed(false)}>Untimed</button>
            <button aria-pressed={timed} className={`ac-chip${timed ? ' on' : ''}`} onClick={() => setTimed(true)}>Timed</button>
          </div></fieldset>
          <p className="ac-round-summary">{count} {g === 'trivia' ? 'questions' : 'books'} · {timed ? 'Timed challenge' : 'At your own pace'}{g === 'order' ? ' · The entire selected section' : ''}</p>
          {timed && <p className="ac-clock-note">The clock counts thinking and choosing. It pauses for feedback and while this tab is hidden.</p>}
          <button className="ac-next" onClick={launch}>Play →</button>
        </div>
        {g === 'trivia' && misses.length > 0 && <button className="ac-practice" onClick={() => startPlay({ kind: 'trivia', cfg: { tier: 'easy', length: 'full', timed: false, practice: practiceItems() } })}>Practice my misses · {misses.length} to review</button>}
      </Shell>
    );
  }

  // ---------- PLAY ----------
  if (view.s === 'play') {
    const p = view.play;
    return (
      <Shell onExit={onExit} explorerId={explorerId} onBack={() => setView({ s: 'menu' })} backLabel="Quit game">
        <div key={view.nonce}>
          {p.kind === 'trivia' && <Trivia explorerId={explorerId} config={p.cfg} onFinish={handleFinish} />}
          {p.kind === 'order' && <BooksOrder explorerId={explorerId} config={p.cfg} onFinish={handleFinish} />}
          {p.kind === 'sort' && <BooksSort explorerId={explorerId} config={p.cfg} onFinish={handleFinish} />}
        </div>
      </Shell>
    );
  }

  // ---------- FINISH ----------
  if (view.s === 'finish') {
    return (
      <Shell onExit={onExit} explorerId={explorerId} onBack={() => setView({ s: 'menu' })}>
        <Finish
          explorerId={explorerId}
          defaultInitials={defaultInitials}
          result={view.result}
          detail={view.detail}
          onPlayAgain={() => startPlay(view.replay)}
          onMenu={() => setView({ s: 'menu' })}
          onPracticeMisses={() => {
            const items = practiceItems();
            if (items.length) startPlay({ kind: 'trivia', cfg: { tier: 'easy', length: 'full', timed: false, practice: items } });
          }}
          hasMisses={misses.length > 0}
          onViewBoard={() => setView({ s: 'wallBoard', boardKey: view.result.boardKey, label: `${view.result.label} · ${view.result.timed ? 'Timed' : 'Untimed'}`, backGame: view.result.game })}
        />
      </Shell>
    );
  }

  // ---------- WALL OF FAME ----------
  if (view.s === 'wallPick') {
    return (
      <Shell onExit={onExit} explorerId={explorerId} onBack={() => setView({ s: 'menu' })}>
        <h2 className="ac-h2">🏆 Wall of Fame</h2>
        <Badges explorerId={explorerId} />
        <div className="ac-setup-label">Which leaderboard?</div>
        <div className="ac-chips">
          <button className="ac-scope" onClick={() => setView({ s: 'wallGame', game: 'order' })}>🔢 Ordering</button>
          <button className="ac-scope" onClick={() => setView({ s: 'wallGame', game: 'sort' })}>🗂️ Sorting</button>
          <button className="ac-scope" onClick={() => setView({ s: 'wallGame', game: 'trivia' })}>❓ Trivia</button>
        </div>
      </Shell>
    );
  }

  if (view.s === 'wallGame') {
    const boards = boardList(view.game);
    const nonEmpty = boards.filter((b) => {
      const brd = arcade.getBoard(b.boardKey);
      return brd.scores.length > 0 || brd.clean.length > 0;
    });
    return (
      <Shell onExit={onExit} explorerId={explorerId} onBack={() => setView({ s: 'wallPick' })}>
        <h2 className="ac-h2">🏆 {view.game === 'order' ? 'Ordering' : view.game === 'sort' ? 'Sorting' : 'Trivia'}</h2>
        {nonEmpty.length === 0 ? (
          <p className="ac-sub">No scores here yet — be the first!</p>
        ) : (
          <div className="ac-chips">
            {nonEmpty.map((b) => (
              <button key={b.boardKey} className="ac-scope" onClick={() => setView({ s: 'wallBoard', boardKey: b.boardKey, label: b.label, backGame: view.game })}>{b.label}</button>
            ))}
          </div>
        )}
      </Shell>
    );
  }

  if (view.s === 'wallBoard') {
    return (
      <Shell onExit={onExit} explorerId={explorerId} onBack={() => setView({ s: 'wallGame', game: view.backGame })}>
        <BoardView explorerId={explorerId} boardKey={view.boardKey} label={view.label} />
      </Shell>
    );
  }

  return null;
}

// ============ small pieces ============

function Shell({ children, onExit, explorerId, onBack, backLabel = '← Back' }: { children: React.ReactNode; onExit: () => void; explorerId: string; onBack?: () => void; backLabel?: string }) {
  return (
    <div className="app-journey ac-bg">
      <InnerBar explorerId={explorerId} onLeave={onExit} leaveLabel="Leave arcade" showParent={false} showAccess={false} />
      <div className="ac-wrap">
        {onBack && <button className="ac-backbtn" onClick={onBack}>{backLabel}</button>}
        {children}
      </div>
    </div>
  );
}

function GameCard({ emoji, title, desc, onClick }: { emoji: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button className="ac-gamecard" onClick={onClick}>
      <span aria-hidden="true" className="ac-game-art" style={{ backgroundPosition: `${['🔢', '🗂️', '❓', '🏆'].indexOf(emoji) * 100 / 3}% center` }} />
      <span className="ac-gt">{title}</span>
      <span className="ac-gd">{desc}</span>
    </button>
  );
}

function Badges({ explorerId }: { explorerId: string }) {
  const owned = new Set(arcade.getAchievements(explorerId).map((a) => a.ach.id));
  return (
    <div className="ac-ach-grid">
      {ACHIEVEMENTS.map((a) => (
        <div key={a.id} className={`ac-ach${owned.has(a.id) ? ' got' : ''}`}>
          <span className="ac-ach-ic">{owned.has(a.id) ? '🏅' : '🔒'}</span>
          <span className="ac-ach-t">{a.title}</span>
          <span className="ac-ach-b">{a.blurb}</span>
        </div>
      ))}
    </div>
  );
}

function boardList(game: 'trivia' | 'order' | 'sort'): { boardKey: string; label: string }[] {
  const base: { boardKey: string; label: string }[] = [];
  for (const l of LENGTHS) {
    if (game === 'trivia') TIERS.forEach((t) => base.push({ boardKey: `trivia|${t}|${l.id}`, label: `${cap(t)} · ${l.id === 'full' ? 'Long' : l.label}` }));
    if (game === 'order') ORDER_SCOPES.forEach((v) => base.push({ boardKey: `order|${v.id}|${l.id}`, label: `${v.label} · ${l.label}` }));
    if (game === 'sort') SORT_CHALLENGES.forEach((c) => base.push({ boardKey: `sort|${c.id}|${l.id}`, label: `${c.title} · ${l.label}` }));
  }
  return base.flatMap((b) => [
    ...(['timed', 'untimed'] as const).map((mode) => ({ boardKey: `${b.boardKey}|${mode}|v2`, label: `${b.label} · ${cap(mode)}` })),
    { ...b, label: `${b.label} · Previous rules` },
  ]);
}

function BoardView({ explorerId, boardKey, label }: { explorerId: string; boardKey: string; label: string }) {
  const board = useMemo(() => arcade.getBoard(boardKey), [boardKey]);
  const pb = arcade.getPersonal(explorerId, boardKey);
  return (
    <>
      <h2 className="ac-h2">🏆 {label}</h2>
      {pb && (
        <div className="ac-pb">
          <span>Your best</span>
          <b>{pb.bestScore} pts</b>
          {pb.bestCleanTimeSec != null && <b>clean {fmtTime(pb.bestCleanTimeSec)}</b>}
          <b>{pb.bestFirstTryPct}% first try</b>
        </div>
      )}
      <div className="ac-wall-cols">
        {!boardKey.includes('|untimed|') && <div className="ac-wall-col">
          <div className="ac-wall-h">Clean Runs (fastest)</div>
          {board.clean.length === 0 ? <div className="ac-wall-empty">— none yet —</div> :
            board.clean.map((r, i) => <div className="ac-wall-row" key={i}><span>{i + 1}</span><span>{r.name}</span><span>{fmtTime(r.val)}</span></div>)}
        </div>}
        <div className="ac-wall-col">
          <div className="ac-wall-h">High Scores</div>
          {board.scores.length === 0 ? <div className="ac-wall-empty">— none yet —</div> :
            board.scores.map((r, i) => <div className="ac-wall-row" key={i}><span>{i + 1}</span><span>{r.name}</span><span>{r.val}</span></div>)}
        </div>
      </div>
    </>
  );
}

function Finish({ explorerId, defaultInitials, result, detail, onPlayAgain, onMenu, onPracticeMisses, hasMisses, onViewBoard }: {
  explorerId: string; defaultInitials: string; result: GameResult; detail?: FinishDetail;
  onPlayAgain: () => void; onMenu: () => void; onPracticeMisses: () => void; hasMisses: boolean; onViewBoard: () => void;
}) {
  const isPractice = result.scopeTag === 'practice';
  const outcome = useMemo(() => arcade.recordPersonal(explorerId, result, !isPractice), [explorerId, result, isPractice]);
  const [initials, setInitials] = useState(defaultInitials);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'failed'>('idle');
  const [showReview, setShowReview] = useState(false);
  const firstTryPct = result.total > 0 ? Math.round((result.firstTry / result.total) * 100) : 0;
  const canSave = !isPractice && (outcome.qualifiesScore || outcome.qualifiesClean);

  // Only announce success once the durable write actually succeeded; a retry is
  // idempotent (same run replaces its board entry, never duplicates).
  const save = () => {
    const { persisted } = arcade.addToBoard(result.boardKey, initials, result);
    setSaveState(persisted ? 'saved' : 'failed');
  };

  return (
    <div className="ac-finish">
      <div className="ac-finish-title" role="status">{result.clean ? '🎉 Perfect round!' : '✓ Finished!'}</div>
      <div className="ac-finish-label">{result.label} · {result.timed ? 'Timed' : 'Untimed'}</div>
      <div className="ac-finish-stats">
        <div><span>Score</span><b>{result.score}</b></div>
        {result.timed && <div><span>Time</span><b>{fmtTime(result.elapsedSec)}</b></div>}
        <div><span>First try</span><b>{firstTryPct}%</b></div>
      </div>

      {!isPractice && !outcome.persisted && (
        <div className="ac-flag warn">This device isn’t saving right now (storage may be full or blocked), so your result is kept just for this visit.</div>
      )}

      {outcome.scoreImproved && <div className="ac-flag">⬆ New personal best score!</div>}
      {outcome.cleanTimeImproved && <div className="ac-flag">⚡ Fastest clean run yet!</div>}
      {outcome.newAchievements.length > 0 && <div className="ac-earned" role="status"><span className="ac-earned-seal" aria-hidden="true">✦</span><p>A new chapter in your record</p>{outcome.newAchievements.map((a) => <div className="ac-flag badge" key={a.id}><strong>{a.title}</strong><br />{a.blurb}</div>)}</div>}

      {isPractice && (
        <div className="ac-flag">{(detail?.corrected?.length ?? 0)} corrected · {arcade.getMisses(explorerId).length} still to review</div>
      )}

      {canSave && saveState !== 'saved' && (
        <div className="ac-namebox">
          <div>You made the Wall of Fame! Your initials:</div>
          <input className="ac-initials" maxLength={3} value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} />
          <button className="ac-save" onClick={save}>{saveState === 'failed' ? 'Try again' : 'Save'}</button>
          {saveState === 'failed' && (
            <div className="ac-flag warn">Not saved on this device — storage may be full or blocked. Your result is still here for now.</div>
          )}
        </div>
      )}
      {saveState === 'saved' && <div className="ac-flag">Saved to the Wall of Fame as {initials.toUpperCase()}.</div>}

      {detail?.missed && detail.missed.length > 0 && (
        <div className="ac-review-wrap">
          <button className="ac-reveal-btn" onClick={() => setShowReview((v) => !v)}>
            {showReview ? 'Hide' : 'Review'} missed ({detail.missed.length})
          </button>
          {showReview && (
            <div className="ac-review">
              {detail.missed.map((m, i) => (
                <div className="ac-review-item" key={i}>
                  <div className="ac-review-q">{m.q}</div>
                  <div className="ac-review-a">Answer: <b>{m.answer}</b>{m.ref ? ` · 📖 ${m.ref}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="ac-finish-btns">
        <button className="ac-save" onClick={onPlayAgain}>Play again</button>
        {hasMisses && result.game === 'trivia' && !isPractice && <button className="ac-secondary" onClick={onPracticeMisses}>🎯 Practice my misses</button>}
        <button className="ac-secondary" onClick={onViewBoard}>View Wall of Fame</button>
        <button className="ac-secondary" onClick={onMenu}>Back to games</button>
      </div>
    </div>
  );
}
