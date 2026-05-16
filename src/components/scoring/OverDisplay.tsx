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
  const overRuns = balls.reduce((sum, b) => sum + b.runs + b.extras, 0);
  const isDeath = totalOvers > 0 && overNumber > totalOvers - 4;
  const legalBallsList = balls.filter(b => !b.is_wide && !b.is_noball);
  const slots = Array(6).fill(null).map((_, i) => legalBallsList[i] || null);
  const extraBalls = balls.filter(b => b.is_wide || b.is_noball);

  return (
    <section className="card rise">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow mb-1.5">This over</p>
          <h3 className="text-h3">
            Over {overNumber} <span className="text-ink-mute font-normal">/ {totalOvers}</span>
            {isDeath && <span className="ml-3 badge-pending">Death overs</span>}
          </h3>
        </div>
        <span className="font-mono text-[13px] text-ink-soft">{legalBalls}/6 balls</span>
      </header>

      <div className="flex flex-wrap items-center gap-2.5">
        {slots.map((ball, i) => ball ? (
          <span key={i} className={getBallColor(ball)} title={getBallLabel(ball)}>
            {getBallLabel(ball)}
          </span>
        ) : (
          <span key={i} className="pellet pellet-dot">·</span>
        ))}
        {extraBalls.length > 0 && (
          <>
            <span className="px-1 text-[11px] text-ink-mute uppercase tracking-eyebrow">extras</span>
            {extraBalls.map((b, i) => (
              <span key={`x-${i}`} className={getBallColor(b)}>
                {getBallLabel(b)}
              </span>
            ))}
          </>
        )}
      </div>

      <footer className="mt-6 pt-5 border-t border-hairline flex items-baseline justify-between text-[13px] text-ink-soft">
        <span>This over: <span className="text-ink font-mono">{overRuns} runs</span></span>
        <span>Balls bowled: <span className="text-ink font-mono">{balls.length}</span></span>
      </footer>
    </section>
  );
}
