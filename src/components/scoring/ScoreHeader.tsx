'use client';

import { LiveScore, Match } from '@/types';
import { formatOvers, formatRate, getScoreDisplay } from '@/lib/utils';

interface Props { liveData: LiveScore; match: Match; }

export function ScoreHeader({ liveData, match }: Props) {
  const current = liveData.innings.find(i => i.status === 'live');
  const done = liveData.innings.find(i => i.status === 'completed');
  if (!current) return null;

  const isChase = current.innings_number === 2;
  const need = current.target ? current.target - current.total_runs : null;
  const totalBalls = match.total_overs * 6;
  const ballsBowled = Math.floor(Number(current.total_overs_bowled)) * 6 + Math.round((Number(current.total_overs_bowled) % 1) * 10);
  const ballsLeft = totalBalls - ballsBowled;

  return (
    <section className="sticky top-[84px] z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--green-text)]">
            <span className="live-dot" /> {current.battingTeam?.name} · INN {current.innings_number}
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="score-number">{current.total_runs}/{current.total_wickets}</span>
            <span className="score-over">({formatOvers(current.total_overs_bowled)}/{match.total_overs})</span>
          </div>
        </div>
        {done && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{done.battingTeam?.name}</p>
            <p className="text-[15px] font-bold tabular-nums text-[var(--text-secondary)]">
              {getScoreDisplay(done)} <span className="text-[12px] font-normal text-[var(--text-muted)]">({formatOvers(done.total_overs_bowled)})</span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-2 text-[12px] tabular-nums text-[var(--text-secondary)]">
        <span>CRR <span className="font-bold text-[var(--text-primary)]">{current.run_rate != null ? formatRate(current.run_rate) : '–'}</span></span>
        {isChase && (
          <>
            <span>·</span>
            <span>Need <span className="font-bold text-[var(--red-text)]">{need! > 0 ? need : 'Won'}</span>{need! > 0 && <span className="text-[var(--text-muted)]"> in {ballsLeft}b</span>}</span>
            {current.required_rate != null && current.required_rate > 0 && (
              <>
                <span>·</span>
                <span>RRR <span className="font-bold text-[var(--orange-text)]">{formatRate(current.required_rate)}</span></span>
              </>
            )}
          </>
        )}
        <span className="ml-auto text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Extras {current.extras}</span>
      </div>
    </section>
  );
}
