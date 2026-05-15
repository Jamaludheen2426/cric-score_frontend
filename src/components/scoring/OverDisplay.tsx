'use client';

import { BallRecord } from '@/types';
import { getBallLabel, getBallColor } from '@/lib/utils';

interface Props {
  balls: BallRecord[];
  overNumber: number;
  legalBalls: number;
  totalOvers: number;
}

export function OverDisplay({ balls, overNumber, legalBalls, totalOvers }: Props) {
  const slots = Array(6).fill(null);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xs uppercase tracking-widest text-gray-500">
          Over {overNumber} of {totalOvers}
        </h3>
        <span className="text-xs text-gray-600 font-mono">{legalBalls}/6 balls</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {slots.map((_, i) => {
          const legalBallsSoFar = balls.filter(b => !b.is_wide && !b.is_noball);
          const ball = legalBallsSoFar[i];
          return (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all ${
                ball
                  ? `${getBallColor(ball)} animate-ball-in`
                  : i < legalBalls
                  ? 'bg-pitch-600/20 border border-pitch-500/40'
                  : 'bg-gray-800 border border-gray-700 text-gray-700'
              }`}
            >
              {ball ? getBallLabel(ball) : i + 1}
            </div>
          );
        })}
        {/* Show extra balls (wides/noballs) */}
        {balls.filter(b => b.is_wide || b.is_noball).map((ball, i) => (
          <div
            key={`extra-${i}`}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-display font-bold animate-ball-in ${getBallColor(ball)}`}
          >
            {getBallLabel(ball)}
          </div>
        ))}
      </div>
      {/* Over runs summary */}
      {balls.length > 0 && (
        <div className="mt-2 text-xs text-gray-600 font-mono">
          {balls.reduce((sum, b) => sum + b.runs + b.extras, 0)} runs this over
        </div>
      )}
    </div>
  );
}
