import recordings from '../content/narration.json';

// Static, text-matched recordings; changed or dynamic text uses browser speech.
const recordingsByText = new Map(recordings.map((clip) => [clip.text, clip.src]));
const cache = new Map<string, HTMLAudioElement>();
type Playback = { text: string; status: 'idle' | 'loading' | 'playing' | 'paused' };
let playback: Playback = { text: '', status: 'idle' };
let active: HTMLAudioElement | undefined;
let serial = 0;
const listeners = new Set<() => void>();
function update(text: string, status: Playback['status']) {
  playback = { text, status };
  listeners.forEach((listener) => listener());
}
export const getPlayback = () => playback;
export function subscribePlayback(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function prepareNarration(text: string) {
  const src = recordingsByText.get(text);
  if (!src || cache.has(src)) return;
  const audio = new Audio(src);
  audio.preload = 'auto';
  cache.set(src, audio);
  audio.load();
}
function browserSpeak(text: string, token: number) {
  if (token !== serial) return;
  try {
    const s = window.speechSynthesis;
    if (!s) { update('', 'idle'); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.05;
    u.onstart = () => { if (token === serial) update(text, 'playing'); };
    u.onend = u.onerror = () => { if (token === serial) update('', 'idle'); };
    update(text, 'playing');
    s.speak(u);
  } catch { update('', 'idle'); }
}
export function speak(text: string) {
  stopSpeaking();
  const token = serial;
  const src = recordingsByText.get(text);
  if (!src) { browserSpeak(text, token); return; }
  prepareNarration(text);
  const audio = cache.get(src)!;
  active = audio;
  audio.currentTime = 0;
  update(text, 'loading');
  audio.onended = () => { if (token === serial) update('', 'idle'); };
  let didFail = false;
  const failed = () => {
    if (token !== serial || didFail) return;
    didFail = true;
    audio.pause();
    active = undefined;
    cache.delete(src);
    browserSpeak(text, token);
  };
  audio.onerror = failed;
  void audio.play().then(() => {
    if (token === serial) update(text, 'playing');
  }).catch((error: unknown) => {
    if (token !== serial) return;
    // Autoplay restrictions need a fresh user tap; they are not missing audio.
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      update('', 'idle');
    } else { failed(); }
  });
}
export function toggleSpeaking(text: string) {
  if (playback.text !== text || playback.status === 'idle') { speak(text); return; }
  if (playback.status === 'paused') {
    if (active) {
      const token = serial;
      void active.play().then(() => {
        if (token === serial) update(text, 'playing');
      }).catch(() => { if (token === serial) update('', 'idle'); });
    } else { window.speechSynthesis?.resume(); update(text, 'playing'); }
  } else if (playback.status === 'loading') { stopSpeaking(); }
  else {
    if (active) active.pause();
    else window.speechSynthesis?.pause();
    update(text, 'paused');
  }
}
export function stopSpeaking() {
  serial++;
  if (active) {
    active.onended = active.onerror = null;
    active.pause();
    active = undefined;
  }
  try { window.speechSynthesis?.cancel(); } catch { /* unsupported */ }
  update('', 'idle');
}
