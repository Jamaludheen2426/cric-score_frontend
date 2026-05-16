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

  const isSecond = currentInnings.innings_number === 2;
  const runsNeeded = currentInnings.target ? currentInnings.target - currentInnings.total_runs : null;
  const totalBalls = match.total_overs * 6;
  const ballsBowled =
    Math.floor(currentInnings.total_overs_bowled) * 6 +
    Math.round((currentInnings.total_overs_bowled % 1) * 10);
  const ballsLeft = totalBalls - ballsBowled;

  return (
    <section className="card rise">
      {/* Top meta */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="badge-live"><span className="live-dot" /> Live</span>
          <span className="text-[12px] text-ink-soft">
            Innings {currentInnings.innings_number} of 2
          </span>
        </div>
        {completedInnings && (
          <div className="text-right text-[13px]">
            <span className="eyebrow mr-2">{completedInnings.battingTeam?.name}</span>
            <span className="text-ink font-mono">{getScoreDisplay(completedInnings)}</span>
            <span className="text-ink-mute font-mono"> ({formatOvers(completedInnings.total_overs_bowled)})</span>
          </div>
        )}
      </div>

      {/* Hero score */}
      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end mb-8">
        <div>
          <p className="text-[14px] text-ink-soft mb-3">
            <span className="text-ink">{currentInnings.battingTeam?.name}</span>
            <span className="text-ink-mute"> · batting</span>
          </p>
          <div className="flex items-baseline gap-3">
            <span className="num-mega">{currentInnings.total_runs}</span>
            <span className="num-xl text-ink-soft">/{currentInnings.total_wickets}</span>
          </div>
          <p className="mt-3 font-mono text-[15px] text-ink-soft">
            <span className="text-ink">{formatOvers(currentInnings.total_overs_bowled)}</span>
            <span className="text-ink-mute"> / {match.total_overs} overs</span>
          </p>
        </div>

        {isSecond && runsNeeded !== null && (
          <div className="md:text-right md:border-l border-t md:border-t-0 border-hairline md:pl-8 pt-5 md:pt-0">
            <p className="eyebrow mb-2">{runsNeeded <= 0 ? 'Result' : 'To win'}</p>
            {runsNeeded <= 0 ? (
              <p className="num-xl text-pitch">Won</p>
            ) : (
              <>
                <p className="num-xl">{runsNeeded}</p>
                <p className="text-[13px] text-ink-soft mt-1">in {ballsLeft} balls</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-hairline">
        <Stat label="Run rate" value={currentInnings.run_rate != null ? formatRate(currentInnings.run_rate) : '0.00'} />
        {isSecond ? (
          <>
            <Stat label="Target"   value={String(currentInnings.target || '—')} />
            <Stat label="Req rate" value={currentInnings.required_rate != null && currentInnings.required_rate > 0
              ? formatRate(currentInnings.required_rate) : '—'} accent />
          </>
        ) : (
          <>
            <Stat label="Bowling"  value={(currentInnings.bowlingTeam?.name || '').slice(0, 14)} mono />
            <Stat label="Extras"   value={String(currentInnings.extras)} />
          </>
        )}
        <Stat label="Overs left" value={String(Math.max(0, match.total_overs - Math.floor(currentInnings.total_overs_bowled)))} />
      </div>
    </section>
  );
}

function Stat({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div className="px-1 py-5 border-r last:border-r-0 border-hairline first:pl-0 sm:pl-5">
      <p className="stat-label mb-2">{label}</p>
      <p className={`${mono ? 'font-mono text-[14px]' : 'stat-value'} ${accent ? 'text-accent' : ''}`}>
        {value}
      </p>
    </div>
  );
}
