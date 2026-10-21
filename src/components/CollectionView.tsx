import { GENESIS_01 } from '../content/genesis01';
import { explorerById } from '../content/explorers';
import { useStore } from '../lib/store';
import { arcade } from '../lib/arcadeStore';

export default function CollectionView({ explorerId, passport, onBegin }: { explorerId: string; passport: boolean; onBegin: () => void }) {
  const store = useStore();
  const rec = store.getChapter(explorerId, GENESIS_01.id);
  const explorer = explorerById(explorerId);
  const done = rec.completedAt != null;
  const badges = arcade.getAchievements(explorerId);
  return <main className="collection-view">
    <span className="collection-kicker">THE PROMISED ROAD · {explorer?.name.toUpperCase()}</span>
    <h1>{passport ? 'Your Passport' : 'The Books'}</h1>
    <p>{passport ? 'A little record of the road you’ve traveled.' : 'Every great journey begins with a story.'}</p>
    {passport ? <>
      <section className="passport-card"><div className={`passport-seal${done ? ' earned' : ''}`} aria-hidden="true">{done ? '✦' : 'PR'}</div><div><span className="collection-kicker">GENESIS · CHAPTER 1</span><h2>{GENESIS_01.title}</h2><p>{done ? `Chapter completed · ${new Date(rec.completedAt!).toLocaleDateString()}` : 'Your first chapter stamp is waiting. Complete A World Made Good to add it here.'}</p><button className="pr-primary" onClick={onBegin}>{done ? 'Revisit the chapter' : 'Continue your journey'}</button></div></section>
      <section className="passport-badges"><h2>Arcade achievements</h2><p>Game achievements celebrate practice and play.</p>{badges.length ? <div className="passport-badge-grid">{badges.map(({ ach }) => <article key={ach.id}><span aria-hidden="true">✦</span><h3>{ach.title}</h3><p>{ach.blurb}</p></article>)}</div> : <p>Play in the Arcade to start your collection.</p>}</section>
    </> : <section className="library-book"><div className="library-cover"><span>THE FIRST BOOK</span><h2>Genesis</h2><span>IN THE BEGINNING</span></div><div><span className="collection-kicker">AVAILABLE NOW · CHAPTER 1</span><h2>{GENESIS_01.title}</h2><p>A good world. A sacred calling. Discover the beginning of the promised road.</p><button className="pr-primary" onClick={onBegin}>{done ? 'Revisit the chapter' : 'Open the chapter'}</button><p className="collection-note">More chapters and books are on their way.</p></div></section>}
  </main>;
}
