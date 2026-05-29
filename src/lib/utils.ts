import { BallRecord } from '@/types';

export function formatOvers(oversFloat: number): string {
  const full = Math.floor(oversFloat);
  const balls = Math.round((oversFloat - full) * 10);
  return `${full}.${balls}`;
}

export function formatRate(rate: number): string {
  return rate.toFixed(2);
}

export function getBallLabel(ball: BallRecord): string {
  if (ball.is_wicket) return 'W';
  if (ball.is_wide) {
    const extraRuns = Math.max(0, ball.extras - 1);
    return `Wd${extraRuns > 0 ? `+${extraRuns}` : ''}`;
  }
  if (ball.is_noball) return `Nb${ball.runs > 0 ? `+${ball.runs}` : ''}`;
  if (ball.extra_type === 'bye') return `B${ball.extras > 0 ? ball.extras : ''}`;
  if (ball.extra_type === 'leg_bye') return `LB${ball.extras > 0 ? ball.extras : ''}`;
  return String(ball.runs);
}

export function getBallColor(ball: BallRecord): string {
  if (ball.is_wicket) return 'pellet pellet-wicket';
  if (ball.is_wide) return 'pellet pellet-wide';
  if (ball.is_noball) return 'pellet pellet-nb';
  if (ball.extra_type === 'bye' || ball.extra_type === 'leg_bye') return 'pellet pellet-bye';
  if (ball.runs === 6) return 'pellet pellet-six';
  if (ball.runs === 4) return 'pellet pellet-four';
  if (ball.runs === 0) return 'pellet pellet-dot';
  return 'pellet pellet-run';
}

export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function getScoreDisplay(innings: { total_runs: number; total_wickets: number }): string {
  return `${innings.total_runs}/${innings.total_wickets}`;
}

export function isDeathOvers(currentOver: number, deathFrom?: number): boolean {
  if (!deathFrom) return false;
  return currentOver >= deathFrom;
}

export function widePenaltyRuns(currentOver: number, wideRule: 'normal' | 'strict', deathFrom?: number): number {
  return wideRule === 'strict' || isDeathOvers(currentOver, deathFrom) ? 1 : 0;
}
