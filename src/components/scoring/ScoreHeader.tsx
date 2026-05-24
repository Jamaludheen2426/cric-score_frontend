'use client';

import { LiveScore, Match } from '@/types';
import { formatOvers, formatRate, getScoreDisplay } from '@/lib/utils';

interface Props { liveData: LiveScore; match: Match; }

export function ScoreHeader({ liveData, match }: Props) {
  const current = liveData.innings.find(i => i.status === 'live');
  const done = liveData.innings.find(i => i.status === 'completed');
  if (!current) return null;

  const isChase = current.innings_number === 2;
  const target = current.target ?? null;
  const need = target != null ? target - current.total_runs : null;
  const totalBalls = match.total_overs * 6;
  const ballsBowled = Math.floor(Number(current.total_overs_bowled)) * 6
                    + Math.round((Number(current.total_overs_bowled) % 1) * 10);
  const ballsLeft = totalBalls - ballsBowled;

  return (
    <section className="sticky top-[84px] z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5">
      {/* Top row — current score + completed innings score */}
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
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              {done.battingTeam?.name}
            </p>
            <p className="text-[15px] font-bold tabular-nums text-[var(--text-secondary)]">
              {getScoreDisplay(done)}{' '}
              <span className="text-[12px] font-normal text-[var(--text-muted)]">
                ({formatOvers(done.total_overs_bowled)})
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Chase strip — innings 2 only. Four prominent tiles. */}
      {isChase && (
        <div className="mt-2 grid grid-cols-4 gap-1 border-t border-[var(--border-subtle)] pt-2">
          <ChaseTile label="Target"  value={target != null ? String(target) : '—'} />
          <ChaseTile
            label={need != null && need <= 0 ? 'Result' : 'Need'}
            value={need != null && need <= 0 ? 'Won' : (need != null ? String(need) : '—')}
            tone="red"
          />
          <ChaseTile label="Balls left" value={String(Math.max(0, ballsLeft))} />
          <ChaseTile
            label="RRR"
            value={
              current.required_rate != null && current.required_rate > 0 && (need ?? 0) > 0
                ? formatRate(current.required_rate)
                : '—'
            }
            tone="orange"
          />
        </div>
      )}

      {/* Bottom stat row — present on both innings */}
      <div className={`flex flex-wrap items-center gap-3 ${isChase ? 'mt-2 pt-2 border-t border-[var(--border-subtle)]' : 'mt-2 pt-2 border-t border-[var(--border-subtle)]'} text-[12px] tabular-nums text-[var(--text-secondary)]`}>
        <span>
          CRR{' '}
          <span className="font-bold text-[var(--text-primary)]">
            {current.run_rate != null ? formatRate(current.run_rate) : '–'}
          </span>
        </span>
        <span>·</span>
        <span>
          Extras{' '}
          <span className="font-bold text-[var(--text-primary)]">{current.extras}</span>
        </span>
        <span>·</span>
        <span>
          Wickets{' '}
          <span className="font-bold text-[var(--text-primary)]">{current.total_wickets}</span>
        </span>
      </div>
    </section>
  );
}

function ChaseTile({ label, value, tone }: { label: string; value: string; tone?: 'red' | 'orange' }) {
  const valueColor =
    tone === 'red'    ? 'text-[var(--red-text)]'    :
    tone === 'orange' ? 'text-[var(--orange-text)]' :
                        'text-[var(--text-primary)]';
  return (
    <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)] leading-tight">{label}</p>
      <p className={`mt-0.5 text-[17px] font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
    </div>
  );
}
