'use client';

import { BallRecord } from '@/types';
import { getBallColor, getBallLabel, widePenaltyRuns } from '@/lib/utils';

interface Props {
  balls: BallRecord[];
  overNumber: number;
  legalBalls: number;
  totalOvers: number;
  deathOversFrom?: number;
  wideRule?: 'normal' | 'strict';
}

export function OverDisplay({ balls, overNumber, legalBalls, deathOversFrom, wideRule = 'normal' }: Props) {
  const legalBallsList = balls.filter(b => !b.is_wide && !b.is_noball);
  const slots = Array(6).fill(null).map((_, i) => legalBallsList[i] || null);
  const extras = balls.filter(b => b.is_wide || b.is_noball);
  const overRuns = balls.reduce((sum, b) => sum + b.runs + b.extras, 0);
  const widePenalty = widePenaltyRuns(overNumber, wideRule, deathOversFrom);

  return (
    <section className="sticky top-[132px] z-30 flex h-12 items-center gap-2 overflow-x-auto border-b border-[var(--border-subtle)] bg-[#f8f9f5] px-3">
      <span className="shrink-0 text-[11px] font-semibold text-[var(--text-secondary)]">
        This over <span className="text-[var(--text-primary)] font-bold ml-1 tabular-nums">{overRuns}r</span>
      </span>
      <span className={`shrink-0 rounded border px-2 py-1 text-[10px] font-bold uppercase ${
        widePenalty ? 'border-[var(--blue)] bg-[#eef4ff] text-[var(--blue-text)]' : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)]'
      }`}>
        Wd {widePenalty ? '+1' : '0'}
      </span>
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
