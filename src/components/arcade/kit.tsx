import type { GameResult, MissRecord } from '../../lib/arcadeStore';
import { fmtTime } from '../../lib/arcadeStore';

// A missed trivia question, kept for the end-of-round review + "practice my misses".
export interface ReviewItem {
  tier: string;
  q: string;
  answer: string;
  ref: string;
}

export interface FinishDetail {
  missed?: ReviewItem[];
  corrected?: MissRecord[];
  practiceItems?: ReviewItem[]; // for "practice my misses" relaunch
}

export type OnFinish = (result: GameResult, detail?: FinishDetail) => void;

export function Hud({ score, elapsed, timed }: { score: number; elapsed: number; timed: boolean }) {
  return (
    <div className="ac-hud">
      <span className="ac-score">Score <b>{score}</b></span>
      {timed && <span className="ac-timer">⏱ <b>{fmtTime(elapsed)}</b></span>}
    </div>
  );
}
