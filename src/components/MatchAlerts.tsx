'use client';

import {
  Activity,
  CircleDot,
  Flame,
  Gauge,
  Medal,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  UserPlus,
  Zap,
} from 'lucide-react';
import { LiveScore, BallRecord } from '@/types';

interface Alert {
  key: string;
  tone: 'red' | 'green' | 'gold' | 'blue';
  title: string;
  detail: string;
  icon: typeof Flame;
}

interface BowlerBall extends BallRecord {
  bowlerId?: number;
}

interface Props {
  liveData: LiveScore;
  compact?: boolean;
}

export function MatchAlerts({ liveData, compact = false }: Props) {
  const alerts = buildAlerts(liveData);
  if (alerts.length === 0) return null;

  return (
    <section className={compact ? 'border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2' : 'card'}>
      {!compact && <p className="eyebrow mb-2">Match alerts</p>}
      <div className="flex flex-wrap gap-1.5">
        {alerts.map(alert => (
          <AlertTag key={alert.key} alert={alert} />
        ))}
      </div>
    </section>
  );
}

function buildAlerts(liveData: LiveScore): Alert[] {
  const current = liveData.innings.find(i => i.status === 'live');
  if (!current) return [];

  const alerts: Alert[] = [];
  const currentBowlerId = current.current_bowler_id;
  const latestBall = liveData.currentOverBalls.length > 0
    ? liveData.currentOverBalls[liveData.currentOverBalls.length - 1]
    : liveData.recentBalls[liveData.recentBalls.length - 1];

  const bowlerBalls: BowlerBall[] = [
    ...(liveData.previousOvers || []).flatMap(over =>
      over.balls.map(ball => ({ ...ball, bowlerId: over.bowler?.id }))
    ),
    ...liveData.currentOverBalls.map(ball => ({ ...ball, bowlerId: currentBowlerId })),
  ];

  const leader = liveLeader(liveData);
  const freeHitPending = Boolean(latestBall?.is_noball || (latestBall?.is_free_hit && (latestBall.is_wide || latestBall.is_noball)));
  if (freeHitPending) {
    alerts.push({
      key: 'free-hit',
      tone: 'gold',
      title: 'Free hit',
      detail: 'Next ball is protected',
      icon: Zap,
    });
  }

  if (leader) {
    alerts.push({
      key: 'live-leader',
      tone: 'gold',
      title: 'POTM leader',
      detail: leader,
      icon: Trophy,
    });
  }

  if (currentBowlerId) {
    const legalBowlerBalls = bowlerBalls
      .filter(ball => ball.bowlerId === currentBowlerId && !ball.is_wide && !ball.is_noball);
    const lastTwo = legalBowlerBalls.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every(ball => ball.is_wicket)) {
      alerts.push({
        key: 'hat-trick',
        tone: 'red',
        title: 'Hat-trick ball',
        detail: `${current.currentBowler?.name || 'Bowler'} has two in two`,
        icon: Flame,
      });
    }
  }

  if (currentBowlerId && current.currentBowler) {
    const currentBowlerCard = current.bowlingCards?.find(c => c.player_id === currentBowlerId);
    if ((currentBowlerCard?.wickets ?? 0) >= 5) {
      alerts.push({
        key: 'five-wicket-haul',
        tone: 'gold',
        title: '5-wicket haul',
        detail: current.currentBowler.name,
        icon: Trophy,
      });
    } else if (currentBowlerCard?.wickets === 4) {
      alerts.push({
        key: 'one-away-five',
        tone: 'blue',
        title: '1 to 5 wickets',
        detail: current.currentBowler.name,
        icon: Target,
      });
    } else if (currentBowlerCard?.wickets === 3) {
      alerts.push({
        key: 'three-wickets',
        tone: 'green',
        title: '3 wickets',
        detail: current.currentBowler.name,
        icon: Trophy,
      });
    }
  }

  if (liveData.currentOver && current.currentBowler) {
    const legalBalls = liveData.currentOver.legal_balls;
    const overRuns = liveData.currentOver.runs;
    const perOver = Number(liveData.match.balls_per_over || 6);
    if (legalBalls === perOver && overRuns === 0) {
      alerts.push({
        key: 'maiden-complete',
        tone: 'green',
        title: 'Maiden over',
        detail: `${current.currentBowler.name} gave nothing away`,
        icon: ShieldCheck,
      });
    } else if (legalBalls > 0 && legalBalls < perOver && overRuns === 0) {
      alerts.push({
        key: 'maiden-on',
        tone: 'blue',
        title: 'Maiden on',
        detail: `${perOver - legalBalls} ball${perOver - legalBalls === 1 ? '' : 's'} to finish it`,
        icon: ShieldCheck,
      });
    }

    if (overRuns >= 15) {
      alerts.push({
        key: 'expensive-over',
        tone: 'red',
        title: 'Expensive over',
        detail: `${overRuns} runs already`,
        icon: Gauge,
      });
    }
  }

  const inningsBalls = ballsFromOvers(liveData);
  const lastFive = lastFiveOverRate(liveData);
  if (lastFive) {
    alerts.push({
      key: 'last-five-rate',
      tone: lastFive.rate >= 10 ? 'red' : lastFive.rate >= 7 ? 'gold' : 'blue',
      title: 'Last 5 RR',
      detail: lastFive.rate.toFixed(2),
      icon: Activity,
    });
  }

  const projected = projectedScore(current.total_runs, inningsBalls, liveData.match.total_overs, Number(liveData.match.balls_per_over || 6));
  if (projected && current.innings_number === 1) {
    alerts.push({
      key: 'projected-score',
      tone: projected >= current.total_runs + 40 ? 'gold' : 'blue',
      title: 'Projected',
      detail: String(projected),
      icon: TrendingUp,
    });
  }

  if (currentBowlerId && current.currentBowler) {
    const currentBowlerCard = current.bowlingCards?.find(c => c.player_id === currentBowlerId);
    if ((currentBowlerCard?.legal_balls ?? 0) >= 18) {
      alerts.push({
        key: 'spell-warning',
        tone: 'blue',
        title: 'Spell watch',
        detail: `${current.currentBowler.name} ${Number(currentBowlerCard?.overs ?? 0).toFixed(1)} ov`,
        icon: Gauge,
      });
    }
  }

  const currentBatters = [current.batsman1, current.batsman2].filter(Boolean);
  for (const batter of currentBatters) {
    if (!batter) continue;
    const card = current.battingCards?.find(c => c.player_id === batter.id);
    if (!card || card.is_out) continue;

    const milestone = battingMilestone(card.runs);
    if (milestone) {
      alerts.push({
        key: `bat-${batter.id}-${milestone.target}`,
        tone: milestone.exact ? 'gold' : 'blue',
        title: milestone.exact ? `${milestone.target} up` : `${milestone.need} to ${milestone.target}`,
        detail: batter.name,
        icon: milestone.exact ? Medal : Target,
      });
    }

    if (card.balls === 0 && (card.batting_position > 2 || current.total_wickets > 0)) {
      alerts.push({
        key: `new-batter-${batter.id}`,
        tone: 'blue',
        title: 'New batter',
        detail: batter.name,
        icon: UserPlus,
      });
    }

    if (latestBall?.is_wicket && batter.id === current.on_strike_batsman_id && card.balls === 0) {
      alerts.push({
        key: `strike-after-wicket-${batter.id}`,
        tone: 'red',
        title: 'On strike',
        detail: 'New batter after wicket',
        icon: Flame,
      });
    }
  }

  const currentPartnership = current.partnerships?.find(p => !p.ended);
  if (currentPartnership) {
    const partnership = partnershipMilestone(currentPartnership.runs);
    if (partnership) {
      alerts.push({
        key: `partnership-${partnership.target}`,
        tone: partnership.exact ? 'gold' : 'blue',
        title: partnership.exact ? `Partnership ${partnership.target}` : `${partnership.need} to p'ship ${partnership.target}`,
        detail: `${currentPartnership.batsman1_name} / ${currentPartnership.batsman2_name}`,
        icon: partnership.exact ? Medal : Target,
      });
    }
  }

  if (current.innings_number === 2 && current.target != null) {
    const runsNeeded = current.runs_needed ?? Math.max(0, current.target - current.total_runs);
    const ballsLeft = current.balls_left ?? 0;
    if (runsNeeded > 0 && ballsLeft > 0) {
      if (ballsLeft <= 12 && runsNeeded <= ballsLeft) {
        alerts.push({
          key: 'equation-tight',
          tone: 'gold',
          title: 'Equation tight',
          detail: `${runsNeeded} from ${ballsLeft}`,
          icon: Target,
        });
      } else if (ballsLeft <= 12 && runsNeeded > ballsLeft) {
        alerts.push({
          key: 'need-boundary',
          tone: 'red',
          title: 'Need boundary',
          detail: `${runsNeeded} from ${ballsLeft}`,
          icon: Zap,
        });
      }

      if ((current.required_rate ?? 0) >= Math.max(9, (current.run_rate ?? 0) + 2)) {
        alerts.push({
          key: 'rrr-climbing',
          tone: 'red',
          title: 'RRR climbing',
          detail: `${Number(current.required_rate).toFixed(2)} needed`,
          icon: TrendingUp,
        });
      }

      const pressure = chasePressure(runsNeeded, ballsLeft, current.required_rate ?? 0);
      if (pressure) {
        alerts.push({
          key: 'chase-pressure',
          tone: pressure.tone,
          title: `${pressure.label} pressure`,
          detail: `${runsNeeded} from ${ballsLeft}`,
          icon: Gauge,
        });
      }
    }
  }

  const legalBalls = bowlerBalls.filter(ball => !ball.is_wide && !ball.is_noball);
  const lastThree = legalBalls.slice(-3);
  if (lastThree.length === 3 && lastThree.every(isDotBall)) {
    alerts.push({
      key: 'three-dots',
      tone: 'green',
      title: '3 dots',
      detail: 'Pressure building',
      icon: CircleDot,
    });
  }

  const lastTwoBoundaries = legalBalls.slice(-2);
  if (lastTwoBoundaries.length === 2 && lastTwoBoundaries.every(isBoundary)) {
    alerts.push({
      key: 'boundary-streak',
      tone: 'gold',
      title: 'Boundary streak',
      detail: 'Back-to-back hits',
      icon: Zap,
    });
  }

  return alerts.slice(0, 8);
}

function battingMilestone(runs: number): { target: 50 | 100; need: number; exact: boolean } | null {
  if (runs === 50) return { target: 50, need: 0, exact: true };
  if (runs === 100) return { target: 100, need: 0, exact: true };
  if (runs >= 40 && runs < 50) return { target: 50, need: 50 - runs, exact: false };
  if (runs >= 90 && runs < 100) return { target: 100, need: 100 - runs, exact: false };
  return null;
}

function partnershipMilestone(runs: number): { target: 50 | 100; need: number; exact: boolean } | null {
  if (runs === 50) return { target: 50, need: 0, exact: true };
  if (runs === 100) return { target: 100, need: 0, exact: true };
  if (runs >= 45 && runs < 50) return { target: 50, need: 50 - runs, exact: false };
  if (runs >= 90 && runs < 100) return { target: 100, need: 100 - runs, exact: false };
  return null;
}

function isDotBall(ball: BallRecord): boolean {
  return !ball.is_wicket && !ball.is_wide && !ball.is_noball && ball.runs === 0 && ball.extras === 0;
}

function isBoundary(ball: BallRecord): boolean {
  return !ball.is_wide && !ball.is_noball && (ball.runs === 4 || ball.runs === 6);
}

function ballsFromOvers(liveData: LiveScore): BallRecord[] {
  return [
    ...(liveData.previousOvers || []).flatMap(over => over.balls),
    ...liveData.currentOverBalls,
  ];
}

function legalBallCount(balls: BallRecord[]): number {
  return balls.filter(ball => !ball.is_wide && !ball.is_noball).length;
}

function lastFiveOverRate(liveData: LiveScore): { rate: number } | null {
  const balls = ballsFromOvers(liveData);
  const legalBalls = balls.filter(ball => !ball.is_wide && !ball.is_noball);
  if (legalBalls.length < 12) return null;
  const perOver = Number(liveData.match.balls_per_over || 6);

  const lastLegal = legalBalls.slice(-(perOver * 5));
  let legalSeen = 0;
  let totalRuns = 0;
  for (let i = balls.length - 1; i >= 0 && legalSeen < lastLegal.length; i -= 1) {
    const ball = balls[i];
    totalRuns += ball.runs + ball.extras;
    if (!ball.is_wide && !ball.is_noball) legalSeen += 1;
  }
  return { rate: (totalRuns / legalSeen) * perOver };
}

function projectedScore(totalRuns: number, balls: BallRecord[], totalOvers: number, ballsPerOver: number): number | null {
  const legal = legalBallCount(balls);
  if (legal < ballsPerOver) return null;
  return Math.round((totalRuns / legal) * totalOvers * ballsPerOver);
}

function chasePressure(runsNeeded: number, ballsLeft: number, requiredRate: number): { label: string; tone: Alert['tone'] } | null {
  if (ballsLeft > 24 && requiredRate < 8) return null;
  if (requiredRate >= 12 || (ballsLeft <= 12 && runsNeeded > ballsLeft + 6)) return { label: 'High', tone: 'red' };
  if (requiredRate >= 9 || ballsLeft <= 12) return { label: 'Medium', tone: 'gold' };
  return { label: 'Low', tone: 'blue' };
}

function liveLeader(liveData: LiveScore): string | null {
  let bestName = '';
  let bestScore = 0;

  for (const innings of liveData.innings) {
    for (const card of innings.battingCards || []) {
      const score = card.runs + card.fours * 2 + card.sixes * 3;
      if (score > bestScore && card.player?.name) {
        bestScore = score;
        bestName = card.player.name;
      }
    }
    for (const card of innings.bowlingCards || []) {
      const score = card.wickets * 22 - Math.floor((card.runs || 0) / 8);
      if (score > bestScore && card.player?.name) {
        bestScore = score;
        bestName = card.player.name;
      }
    }
  }

  return bestScore >= 35 ? bestName : null;
}

function AlertTag({ alert }: { alert: Alert }) {
  const Icon = alert.icon;
  const styles = {
    red: 'border-[#e7b5b5] bg-[#fff1f1] text-[var(--red-text)]',
    green: 'border-[#b6d7bd] bg-[#edf7ee] text-[var(--green-text)]',
    gold: 'border-[#e4ca76] bg-[#fff7d6] text-[var(--gold-text)]',
    blue: 'border-[#b9c9f2] bg-[#eef4ff] text-[var(--blue-text)]',
  }[alert.tone];

  return (
    <div className={`inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2 py-1 ${styles}`}>
      <Icon size={14} strokeWidth={2.4} className="shrink-0" aria-hidden />
      <span className="text-[11px] font-bold uppercase tracking-[0.04em]">{alert.title}</span>
      <span className="max-w-[150px] truncate text-[11px] font-semibold normal-case tracking-normal opacity-80">
        {alert.detail}
      </span>
    </div>
  );
}
