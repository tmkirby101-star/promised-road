import { useSyncExternalStore } from 'react';
import { getPlayback, subscribePlayback, toggleSpeaking } from '../lib/speak';

export default function ReadAloudButton({ text, label = 'Read this to me', className = 'bk-readaloud' }: {
  text: string; label?: string; className?: string;
}) {
  const playback = useSyncExternalStore(subscribePlayback, getPlayback);
  const status = playback.text === text ? playback.status : 'idle';
  const action = status === 'loading' ? 'Cancel loading' : status === 'playing' ? 'Pause reading'
    : status === 'paused' ? 'Resume reading' : label;
  return <button className={className} onClick={() => toggleSpeaking(text)}>{action}</button>;
}
