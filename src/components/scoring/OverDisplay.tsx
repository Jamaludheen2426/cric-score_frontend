'use client';

import { BallRecord } from '@/types';
import { getBallColor, getBallLabel } from '@/lib/utils';

interface Props {
  balls: BallRecord[];
  overNumber: number;
  legalBalls: number;
  totalOvers: number;
  deathOversFrom?: number;
}

export function OverDisplay({ balls, legalBalls }: Props) {
  const legalBallsList = balls.filter(b => !b.is_wide && !b.is_noball);
  const slots = Array(6).fill(null).map((_, i) => legalBallsList[i] || null);
  const extras = balls.filter(b => b.is_wide || b.is_noball);

  return (
    <section className="sticky top-[120px] z-30 flex h-11 items-center gap-2 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--bg-app)] px-3">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[.05em] text-[var(--text-muted)]">This over</span>
      {slots.map((ball, i) => ball ? (
        <span key={i} className={getBallColor(ball)}>{getBallLabel(ball)}</span>
      ) : (
        <span key={i} className="pellet pellet-empty" />
      ))}
      {extras.map((ball, i) => <span key={`x-${i}`} className={getBallColor(ball)}>{getBallLabel(ball)}</span>)}
      <span className="ml-auto shrink-0 text-[12px] text-[var(--text-secondary)]">{legalBalls}/6</span>
    </section>
  );
}
