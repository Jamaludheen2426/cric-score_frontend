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
  // Build the 6 legal slots from legal balls so far
  const legalBallsList = balls.filter(b => !b.is_wide && !b.is_noball);
  const slots = Array(6).fill(null).map((_, i) => legalBallsList[i] || null);
  const extraBalls = balls.filter(b => b.is_wide || b.is_noball);

  return (
    <section className="slab">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <span className="overline">this over</span>
          <span className="font-display text-xl uppercase text-ink">
            Over <span className="text-saffron-500">{overNumber}</span> <span className="text-ink-dim">of {totalOvers}</span>
          </span>
          {isDeath && (
            <span className="badge-pending">death overs</span>
          )}
        </div>
        <span className="font-mono text-[11px] text-ink-dim uppercase tracking-widest">{legalBalls}/6 balls</span>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {slots.map((ball, i) => ball ? (
          <span key={i} className={getBallColor(ball)} title={getBallLabel(ball)}>
            {getBallLabel(ball)}
          </span>
        ) : (
          <span key={i} className="pellet pellet-dot text-ink-dim">{i + 1}</span>
        ))}
        {extraBalls.length > 0 && (
          <>
            <span className="px-1 text-ink-dim font-mono text-[11px] uppercase tracking-widest">extras</span>
            {extraBalls.map((b, i) => (
              <span key={`x-${i}`} className={getBallColor(b)}>
                {getBallLabel(b)}
              </span>
            ))}
          </>
        )}
      </div>

      <footer className="mt-4 pt-3 border-t border-canvas-ridge flex items-baseline justify-between">
        <span className="font-mono text-[11px] text-ink-dim uppercase tracking-widest">
          this over: <span className="text-ink">{overRuns} runs</span>
        </span>
        <span className="font-mono text-[11px] text-ink-dim uppercase tracking-widest">
          balls bowled: <span className="text-ink">{balls.length}</span>
        </span>
      </footer>
    </section>
  );
}
