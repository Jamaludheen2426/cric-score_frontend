import { BallRecord, Innings, Match } from '@/types';

export function formatOvers(oversFloat: number): string {
  const full = Math.floor(oversFloat);
  const balls = Math.round((oversFloat - full) * 10);
  return `${full}.${balls}`;
}

export function ballsPerOver(match?: { balls_per_over?: number | null }): number {
  const value = Number(match?.balls_per_over || 6);
  return Number.isFinite(value) && value > 0 ? value : 6;
}

export function formatRate(rate: number): string {
  return rate.toFixed(2);
}

export function getBallLabel(ball: BallRecord): string {
  const suffix = ball.is_free_hit ? '*' : '';
  if (ball.is_wicket) return `W${suffix}`;
  if (ball.is_wide) {
    const extraRuns = Math.max(0, ball.extras - 1);
    return `Wd${extraRuns > 0 ? `+${extraRuns}` : ''}${suffix}`;
  }
  if (ball.is_noball) return `Nb${ball.runs > 0 ? `+${ball.runs}` : ''}${suffix}`;
  if (ball.extra_type === 'bye') return `B${ball.extras > 0 ? ball.extras : ''}${suffix}`;
  if (ball.extra_type === 'leg_bye') return `LB${ball.extras > 0 ? ball.extras : ''}${suffix}`;
  return `${ball.runs}${suffix}`;
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

export function getMatchResult(innings: Innings[] = [], match?: Pick<Match, 'players_per_side' | 'status'>): string | null {
  const first = innings.find(i => i.innings_number === 1);
  const second = innings.find(i => i.innings_number === 2);
  if (!first || !second) return null;
  const firstName = first.battingTeam?.name || 'Team 1';
  const secondName = second.battingTeam?.name || 'Team 2';
  if (first.total_runs === second.total_runs) return 'Match tied';
  if (first.total_runs > second.total_runs) {
    return `${firstName} won by ${first.total_runs - second.total_runs} run${first.total_runs - second.total_runs === 1 ? '' : 's'}`;
  }
  const wicketsLeft = Math.max(0, Number(match?.players_per_side || 11) - second.total_wickets);
  return `${secondName} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}`;
}

export function isDeathOvers(currentOver: number, deathFrom?: number): boolean {
  if (!deathFrom) return false;
  return currentOver >= deathFrom;
}

export function widePenaltyRuns(currentOver: number, wideRule: 'normal' | 'strict', deathFrom?: number): number {
  return wideRule === 'strict' || isDeathOvers(currentOver, deathFrom) ? 1 : 0;
}
