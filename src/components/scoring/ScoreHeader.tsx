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
  const wicketsLeft = match.players_per_side - 1 - currentInnings.total_wickets;

  return (
    <div className="card bg-gradient-to-br from-gray-900 to-gray-950 border-gray-700">
      {/* Batting team score */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-gray-500 text-xs font-display uppercase tracking-wider mb-1">
            {currentInnings.battingTeam?.name} — Innings {currentInnings.innings_number}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-display font-extrabold text-5xl text-white tabular-nums">
              {getScoreDisplay(currentInnings)}
            </span>
            <span className="text-gray-400 text-xl font-mono">
              ({formatOvers(currentInnings.total_overs_bowled)}/{match.total_overs})
            </span>
          </div>
        </div>
        {completedInnings && (
          <div className="text-right">
            <p className="text-xs text-gray-600 font-display uppercase tracking-wider mb-0.5">
              {completedInnings.battingTeam?.name}
            </p>
            <p className="font-display font-bold text-gray-300 text-lg">
              {getScoreDisplay(completedInnings)}
            </p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800">
        <div>
          <p className="text-xs text-gray-600 font-display uppercase tracking-wider">Run Rate</p>
          <p className="font-mono font-medium text-gray-200">
            {currentInnings.run_rate ? formatRate(currentInnings.run_rate) : '0.00'}
          </p>
        </div>
        {isSecondInnings && runsNeeded !== null && (
          <>
            <div>
              <p className="text-xs text-gray-600 font-display uppercase tracking-wider">Target</p>
              <p className="font-mono font-medium text-gray-200">{currentInnings.target}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-display uppercase tracking-wider">Need</p>
              <p className={`font-mono font-medium ${runsNeeded <= 0 ? 'text-pitch-400' : 'text-amber-400'}`}>
                {runsNeeded > 0 ? `${runsNeeded} off ${(match.total_overs * 6 - Math.floor(currentInnings.total_overs_bowled) * 6 - Math.round((currentInnings.total_overs_bowled % 1) * 10))} balls` : 'Won!'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-display uppercase tracking-wider">Req Rate</p>
              <p className="font-mono font-medium text-amber-300">
                {currentInnings.required_rate ? formatRate(currentInnings.required_rate) : '-'}
              </p>
            </div>
          </>
        )}
        <div>
          <p className="text-xs text-gray-600 font-display uppercase tracking-wider">Extras</p>
          <p className="font-mono font-medium text-gray-200">{currentInnings.extras}</p>
        </div>
      </div>
    </div>
  );
}
