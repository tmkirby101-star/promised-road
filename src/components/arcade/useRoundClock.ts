import { useEffect, useRef, useState } from 'react';

/** Count only active play, preserving fractions across feedback pauses. */
export function useRoundClock(active: boolean) {
  const accumulated = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active) return;
    let started: number | null = document.hidden ? null : performance.now();
    const flush = () => {
      if (started !== null) accumulated.current += performance.now() - started;
      started = null;
      setElapsed(Math.floor(accumulated.current / 1000));
    };
    const visibility = () => {
      if (document.hidden) flush();
      else started = performance.now();
    };
    const id = window.setInterval(() => {
      setElapsed(Math.floor((accumulated.current + (started === null ? 0 : performance.now() - started)) / 1000));
    }, 100);
    document.addEventListener('visibilitychange', visibility);
    return () => { flush(); clearInterval(id); document.removeEventListener('visibilitychange', visibility); };
  }, [active]);
  return elapsed;
}
