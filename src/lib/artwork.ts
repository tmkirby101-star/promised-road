import { useEffect, useState } from 'react';

const decoded = new Set<string>();
const pending = new Map<string, Promise<void>>();
export function prepareArtwork(src: string): Promise<void> {
  if (decoded.has(src)) return Promise.resolve();
  const existing = pending.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => { img.decode().then(() => { decoded.add(src); resolve(); }, reject); };
    img.onerror = () => reject(new Error('Artwork could not load'));
    img.src = src;
  }).catch((error) => { pending.delete(src); throw error; });
  pending.set(src, promise);
  return promise;
}
export function useArtwork(sources: string[]) {
  const key = sources.join('|');
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ key: '', ready: false, failed: false });
  useEffect(() => {
    let active = true;
    Promise.all(key.split('|').filter(Boolean).map(prepareArtwork)).then(
      () => { if (active) setState({ key, ready: true, failed: false }); },
      () => { if (active) setState({ key, ready: false, failed: true }); },
    );
    return () => { active = false; };
  }, [key, attempt]);
  return { ready: sources.every((src) => decoded.has(src)) || (state.key === key && state.ready), failed: state.key === key && state.failed,
    retry: () => { setState({ key, ready: false, failed: false }); setAttempt((n) => n + 1); } };
}
export const ISAIAH_ART = {
  welcoming: '/assets/guides/isaiah/isaiah-welcoming.webp',
  reading: '/assets/guides/isaiah/isaiah-reading.webp',
  encouraging: '/assets/guides/isaiah/isaiah-encouraging.webp',
} as const;
