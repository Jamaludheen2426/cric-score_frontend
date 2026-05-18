'use client';

import { LiveScore, Match } from '@/types';
import { formatOvers } from '@/lib/utils';

interface Props {
  liveData: LiveScore;
  match: Match;
}

export function ScoreHeader({ liveData, match }: Props) {
  const inn = liveData.innings.find(i => i.status === 'live');
  if (!inn) return null;
  const need = inn.runs_needed ?? (inn.target ? Math.max(0, inn.target - inn.total_runs) : null);
  const balls = inn.balls_left ?? null;

  return (
    <section className="sticky top-12 z-40 grid max-h-[72px] grid-cols-[1fr_auto] items-center border-b border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold uppercase text-[var(--text-secondary)]">{inn.battingTeam?.name || 'Batting'}</p>
        <div className="flex items-end gap-2">
          <span className="score-number">{inn.total_runs}/{inn.total_wickets}</span>
          <span className="score-over pb-1">({formatOvers(inn.total_overs_bowled)} ov)</span>
        </div>
      </div>
      {inn.innings_number === 2 && need != null && (
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase text-[var(--text-secondary)]">Need</p>
          <p className="text-[20px] font-bold text-[var(--orange-text)]">{need} off {balls ?? '-'}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">balls</p>
        </div>
      )}
    </section>
  );
}
