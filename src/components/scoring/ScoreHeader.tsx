'use client';

import { LiveScore, Match } from '@/types';
import { formatOvers, formatRate, getScoreDisplay } from '@/lib/utils';

interface Props {
  liveData: LiveScore;
  match: Match;
}

export function ScoreHeader({ liveData, match }: Props) {
  const currentInnings = liveData.innings.find(i => i.status === 'live');
  const completedInnings = liveData.innings.find(i => i.status === 'completed');
  if (!currentInnings) return null;

  const isSecondInnings = currentInnings.innings_number === 2;
  const runsNeeded = currentInnings.target ? currentInnings.target - currentInnings.total_runs : null;
  const totalBalls = match.total_overs * 6;
  const ballsBowled = Math.floor(currentInnings.total_overs_bowled) * 6 + Math.round((currentInnings.total_overs_bowled % 1) * 10);
  const ballsLeft = totalBalls - ballsBowled;
  const battingShort = (currentInnings.battingTeam?.name || '?').trim().slice(0, 3).toUpperCase();

  return (
    <section className="slab-accent reveal">
      {/* Top meta row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="badge-live"><span className="live-dot" /> live</span>
          <span className="font-mono text-[10px] text-ink-dim uppercase tracking-widest">
            innings {currentInnings.innings_number} of 2
          </span>
        </div>
        {completedInnings && (
          <div className="text-right font-mono text-[12px] text-ink-muted">
            <span className="eyebrow mr-2">{completedInnings.battingTeam?.name}</span>
            <span className="text-ink">{getScoreDisplay(completedInnings)}</span>
            <span className="text-ink-dim"> ({formatOvers(completedInnings.total_overs_bowled)})</span>
          </div>
        )}
      </div>

      {/* HERO score block */}
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-6">
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-display font-black text-2xl text-saffron-500 uppercase tracking-tight">
              {battingShort}
            </span>
            <span className="font-editorial italic text-[13px] text-ochre-500">batting · {currentInnings.battingTeam?.name}</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="num-mega">{currentInnings.total_runs}</span>
            <span className="num-lg text-ink-muted">/{currentInnings.total_wickets}</span>
          </div>
          <div className="mt-2 font-mono text-[15px] text-ink-muted">
            <span className="text-ink">{formatOvers(currentInnings.total_overs_bowled)}</span>
            <span className="text-ink-dim"> / {match.total_overs} ov</span>
          </div>
        </div>

        {isSecondInnings && runsNeeded !== null && (
          <div className="md:text-right border-l-2 md:border-l border-canvas-ridge md:pl-6 pl-0 pt-3 md:pt-0 md:border-t-0 border-t">
            <div className="eyebrow mb-1.5">{runsNeeded <= 0 ? 'Result' : 'To win'}</div>
            {runsNeeded <= 0 ? (
              <div className="font-display text-3xl uppercase text-pitch-400">Chased</div>
            ) : (
              <>
                <div className="num-lg text-ink">{runsNeeded}</div>
                <div className="font-mono text-[12px] text-ink-muted">
                  in {ballsLeft} balls
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-canvas-ridge border-t border-canvas-ridge">
        <Stat label="run rate"  value={currentInnings.run_rate != null ? formatRate(currentInnings.run_rate) : '0.00'} />
        {isSecondInnings ? (
          <>
            <Stat label="target"   value={String(currentInnings.target || '—')} />
            <Stat label="req rate" value={currentInnings.required_rate != null && currentInnings.required_rate > 0 ? formatRate(currentInnings.required_rate) : '—'} accent="saffron" />
          </>
        ) : (
          <>
            <Stat label="batting"  value={`vs ${(currentInnings.bowlingTeam?.name || '').slice(0,8)}`} mono />
            <Stat label="extras"   value={String(currentInnings.extras)} />
          </>
        )}
        <Stat label="overs left" value={String(match.total_overs - Math.floor(currentInnings.total_overs_bowled))} />
      </div>
    </section>
  );
}

function Stat({ label, value, accent, mono }: { label: string; value: string; accent?: 'saffron'; mono?: boolean }) {
  return (
    <div className="bg-canvas-raised px-4 py-3">
      <div className="eyebrow mb-1">{label}</div>
      <div className={`${mono ? 'font-mono text-[15px]' : 'font-display text-2xl'} leading-none ${accent === 'saffron' ? 'text-saffron-500' : 'text-ink'}`}>
        {value}
      </div>
    </div>
  );
}
