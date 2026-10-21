import { useCallback, useEffect, useRef, useState } from 'react';
import { BIBLE_SCENES } from '../data/scenes';

const INTERVAL = 7000;

export default function SceneCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const [ready, setReady] = useState<number[]>([]);
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (ready.includes(index)) setDisplayed(index);
  }, [index, ready]);
  const scene = BIBLE_SCENES[displayed];

  const schedule = useCallback(() => {
    window.clearInterval(timer.current);
    if (!paused) {
      timer.current = window.setInterval(
        () => setIndex((i) => (i + 1) % BIBLE_SCENES.length),
        INTERVAL,
      );
    }
  }, [paused]);

  useEffect(() => {
    schedule();
    return () => window.clearInterval(timer.current);
  }, [schedule]);

  const go = (i: number) => {
    setIndex((i + BIBLE_SCENES.length) % BIBLE_SCENES.length);
    schedule();
  };

  return (
    <section
      className="world bible-carousel"
      aria-roledescription="carousel"
      aria-label="Epic moments from the Bible"
    >
      <div id="sceneSlides" className="scene-slides">
        {BIBLE_SCENES.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt={i === displayed ? s.alt : ''}
            aria-hidden={i !== displayed}
            loading="eager"
            onLoad={(event) => {
              const image = event.currentTarget;
              void image.decode().then(() => {
                setReady((previous) => previous.includes(i) ? previous : [...previous, i]);
              }).catch(() => { /* Keep the current scene if this image cannot decode. */ });
            }}
            style={{
              position: 'absolute', inset: 0,
              objectPosition: s.position ?? 'center',
              visibility: i === displayed && ready.includes(i) ? 'visible' : 'hidden',
            }}
          />
        ))}
      </div>
      <div className="scene-shade" />
      <div className="scene-caption" aria-live="off">
        <span id="scenePassage">{scene.passage}</span>
        <h1 id="sceneTitle">{scene.title}</h1>
        <p id="sceneTheme">{scene.theme}</p>
      </div>
      <div className="carousel-controls">
        <div className="scene-dots" role="group" aria-label="Choose a Bible scene">
          {BIBLE_SCENES.map((s, i) => (
            <button
              key={s.image}
              data-scene={i}
              aria-label={`Scene ${i + 1}: ${s.title}`}
              aria-current={i === index}
              className={i === index ? 'active' : ''}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button
          id="pauseScenes"
          aria-label={paused ? 'Play image rotation' : 'Pause image rotation'}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Play' : 'Pause'}
        </button>
        <button id="previousScene" aria-label="Previous Bible scene" onClick={() => go(index - 1)}>
          ‹
        </button>
        <button id="nextScene" aria-label="Next Bible scene" onClick={() => go(index + 1)}>
          ›
        </button>
      </div>
    </section>
  );
}
