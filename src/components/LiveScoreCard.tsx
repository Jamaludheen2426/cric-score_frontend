'use client';

import { LiveScore, Match, BallRecord } from '@/types';
import { formatOvers, formatRate, getBallLabel, getBallColor, getScoreDisplay } from '@/lib/utils';

interface Props {
  liveData: LiveScore;
  match: Match;
}

function BallDot({ ball }: { ball: BallRecord }) {
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-display font-bold ${getBallColor(ball)}`}>
      {getBallLabel(ball)}
    </span>
  );
}

export function LiveScoreCard({ liveData, match }: Props) {
  const currentInnings = liveData.innings.find(i => i.status === 'live');
  const completedInnings = liveData.innings.filter(i => i.status === 'completed');

  return (
    <div className="space-y-4">
      {/* Score summary */}
      {currentInnings && (
        <div className="card bg-gradient-to-br from-gray-900 to-gray-950 border-gray-700">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 font-display uppercase tracking-wider mb-1">
                {currentInnings.battingTeam?.name}
                {currentInnings.innings_number === 2 && currentInnings.target && (
                  <span className="ml-2 text-amber-400">chasing {currentInnings.target}</span>
                )}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="font-display font-extrabold text-5xl text-white tabular-nums">
                  {getScoreDisplay(currentInnings)}
                </span>
                <span className="text-gray-400 text-lg font-mono">
                  ({formatOvers(currentInnings.total_overs_bowled)}/{match.total_overs})
                </span>
              </div>
            </div>
            {completedInnings[0] && (
              <div className="text-right">
                <p className="text-xs text-gray-600 font-display">{completedInnings[0].battingTeam?.name}</p>
                <p className="font-display font-bold text-gray-300 text-xl">{getScoreDisplay(completedInnings[0])}</p>
              </div>
            )}
          </div>

          {/* Run rates */}
          <div className="flex gap-6 pt-3 border-t border-gray-800 flex-wrap">
            <div>
              <p className="text-xs text-gray-600 font-display uppercase tracking-wider">CRR</p>
              <p className="font-mono text-gray-200">{currentInnings.run_rate ? formatRate(currentInnings.run_rate) : '0.00'}</p>
            </div>
            {currentInnings.required_rate && (
              <div>
                <p className="text-xs text-gray-600 font-display uppercase tracking-wider">RRR</p>
                <p className="font-mono text-amber-300">{formatRate(currentInnings.required_rate)}</p>
              </div>
            )}
            {currentInnings.target && currentInnings.innings_number === 2 && (
              <div>
                <p className="text-xs text-gray-600 font-display uppercase tracking-wider">Need</p>
                <p className="font-mono text-amber-300">
                  {Math.max(0, currentInnings.target - currentInnings.total_runs)} runs
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600 font-display uppercase tracking-wider">Extras</p>
              <p className="font-mono text-gray-400">{currentInnings.extras}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent balls */}
      {liveData.recentBalls.length > 0 && (
        <div className="card">
          <h3 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">Recent Balls</h3>
          <div className="flex gap-2 flex-wrap">
            {liveData.recentBalls.map((ball, i) => (
              <BallDot key={i} ball={ball} />
            ))}
          </div>
        </div>
      )}

      {/* Current over */}
      {liveData.currentOver && (
        <div className="card">
          <h3 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-2">
            Over {liveData.currentOver.over_number} — {liveData.currentOver.bowler?.name}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {liveData.currentOverBalls.map((ball, i) => (
              <BallDot key={i} ball={ball} />
            ))}
            {liveData.currentOverBalls.length === 0 && (
              <p className="text-gray-600 text-sm">No balls yet</p>
            )}
          </div>
        </div>
      )}

      {/* Batting card */}
      {currentInnings?.battingCards && (
        <div className="card">
          <h3 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">Batting — {currentInnings.battingTeam?.name}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-600 font-display uppercase tracking-wider border-b border-gray-800">
                <th className="text-left pb-2 font-normal">Batsman</th>
                <th className="text-right pb-2 font-normal">R</th>
                <th className="text-right pb-2 font-normal">B</th>
                <th className="text-right pb-2 font-normal">4s</th>
                <th className="text-right pb-2 font-normal">6s</th>
                <th className="text-right pb-2 font-normal">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {currentInnings.battingCards
                .sort((a, b) => a.batting_position - b.batting_position)
                .map(card => {
                  const isPlaying = card.player_id === currentInnings.current_batsman1_id || card.player_id === currentInnings.current_batsman2_id;
                  const onStrike = card.player_id === currentInnings.on_strike_batsman_id;
                  const sr = card.balls > 0 ? ((card.runs / card.balls) * 100).toFixed(0) : '-';
                  return (
                    <tr key={card.id} className={isPlaying ? 'text-white' : 'text-gray-500'}>
                      <td className="py-2 font-display">
                        {onStrike && <span className="text-pitch-400 mr-1">*</span>}
                        {card.player?.name}
                        {card.is_out && (
                          <span className="text-xs text-gray-600 ml-2 hidden sm:inline">
                            {card.dismissal_type?.replace(/_/g, ' ')} {card.bowler ? `b. ${card.bowler.name}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="text-right font-mono font-bold">{card.runs}</td>
                      <td className="text-right font-mono text-gray-400">{card.balls}</td>
                      <td className="text-right font-mono text-gray-400">{card.fours}</td>
                      <td className="text-right font-mono text-gray-400">{card.sixes}</td>
                      <td className="text-right font-mono text-gray-400">{sr}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bowling card */}
      {currentInnings?.bowlingCards && (
        <div className="card">
          <h3 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">Bowling — {currentInnings.bowlingTeam?.name}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-600 font-display uppercase tracking-wider border-b border-gray-800">
                <th className="text-left pb-2 font-normal">Bowler</th>
                <th className="text-right pb-2 font-normal">O</th>
                <th className="text-right pb-2 font-normal">R</th>
                <th className="text-right pb-2 font-normal">W</th>
                <th className="text-right pb-2 font-normal">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {currentInnings.bowlingCards.map(card => {
                const isBowling = card.player_id === currentInnings.current_bowler_id;
                const economy = card.legal_balls > 0 ? ((card.runs / card.legal_balls) * 6).toFixed(2) : '-';
                return (
                  <tr key={card.id} className={isBowling ? 'text-white' : 'text-gray-400'}>
                    <td className="py-2 font-display">
                      {isBowling && <span className="text-purple-400 mr-1">▶</span>}
                      {card.player?.name}
                    </td>
                    <td className="text-right font-mono">{card.overs}</td>
                    <td className="text-right font-mono">{card.runs}</td>
                    <td className="text-right font-mono font-bold">{card.wickets}</td>
                    <td className="text-right font-mono">{economy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Completed innings scorecard */}
      {completedInnings.map(inn => (
        <div key={inn.id} className="card border-gray-800/50 opacity-80">
          <h3 className="font-display text-xs uppercase tracking-widest text-gray-600 mb-3">
            {inn.battingTeam?.name} — 1st Innings: {getScoreDisplay(inn)}
          </h3>
          {inn.battingCards && (
            <table className="w-full text-sm mb-2">
              <thead>
                <tr className="text-xs text-gray-700 font-display uppercase tracking-wider border-b border-gray-800">
                  <th className="text-left pb-1 font-normal">Batsman</th>
                  <th className="text-right pb-1 font-normal">R</th>
                  <th className="text-right pb-1 font-normal">B</th>
                  <th className="text-right pb-1 font-normal">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {inn.battingCards.sort((a, b) => a.batting_position - b.batting_position).map(card => (
                  <tr key={card.id} className="text-gray-500">
                    <td className="py-1.5 font-display">{card.player?.name}</td>
                    <td className="text-right font-mono">{card.runs}</td>
                    <td className="text-right font-mono">{card.balls}</td>
                    <td className="text-right font-mono">{card.balls > 0 ? ((card.runs / card.balls) * 100).toFixed(0) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {match.status === 'completed' && (
        <div className="card text-center border-pitch-600/30 bg-pitch-600/5">
          <p className="text-pitch-400 font-display font-semibold">✅ Match Completed</p>
          <a href={`/matches/${match.id}/summary`} className="text-sm text-gray-400 hover:text-gray-200 mt-1 inline-block">View full scorecard →</a>
        </div>
      )}
    </div>
  );
}
