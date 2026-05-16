'use client';

import { LiveScore, Match, BallRecord } from '@/types';
import { formatOvers, formatRate, getBallLabel, getBallColor, getScoreDisplay } from '@/lib/utils';

interface Props {
  liveData: LiveScore;
  match: Match;
}

function Pellet({ ball }: { ball: BallRecord }) {
  return <span className={getBallColor(ball)} title={getBallLabel(ball)}>{getBallLabel(ball)}</span>;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-1 py-5 border-r last:border-r-0 border-hairline first:pl-0 sm:pl-5">
      <p className="stat-label mb-2">{label}</p>
      <p className={`stat-value ${accent ? 'text-accent' : ''}`}>{value}</p>
    </div>
  );
}

export function LiveScoreCard({ liveData, match }: Props) {
  const currentInnings = liveData.innings.find(i => i.status === 'live');
  const completedInnings = liveData.innings.filter(i => i.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Hero score */}
      {currentInnings && (
        <section className="card rise">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="badge-live"><span className="live-dot" /> Live</span>
              <span className="text-[12px] text-ink-soft">Ball-by-ball</span>
            </div>
            {completedInnings[0] && (
              <div className="text-right text-[13px]">
                <span className="eyebrow mr-2">{completedInnings[0].battingTeam?.name}</span>
                <span className="text-ink font-mono">{getScoreDisplay(completedInnings[0])}</span>
                <span className="text-ink-mute font-mono"> ({formatOvers(completedInnings[0].total_overs_bowled)})</span>
              </div>
            )}
          </div>

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

            {currentInnings.innings_number === 2 && currentInnings.target && (
              <div className="md:text-right md:border-l border-t md:border-t-0 border-hairline md:pl-8 pt-5 md:pt-0">
                <p className="eyebrow mb-2">Chasing</p>
                <p className="num-xl text-accent">{currentInnings.target}</p>
                <p className="text-[13px] text-ink-soft mt-1">
                  {Math.max(0, currentInnings.target - currentInnings.total_runs)} runs to go
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-hairline">
            <Stat label="Run rate" value={currentInnings.run_rate != null ? formatRate(currentInnings.run_rate) : '—'} />
            {currentInnings.required_rate != null && currentInnings.required_rate > 0
              ? <Stat label="Req rate" value={formatRate(currentInnings.required_rate)} accent />
              : <Stat label="Extras" value={String(currentInnings.extras)} />}
            <Stat label="Wickets" value={String(currentInnings.total_wickets)} />
            <Stat label="Overs left" value={String(Math.max(0, match.total_overs - Math.floor(currentInnings.total_overs_bowled)))} />
          </div>
        </section>
      )}

      {/* Recent balls */}
      {liveData.recentBalls.length > 0 && (
        <section className="card rise rise-d1">
          <header className="flex items-center justify-between mb-5">
            <h3 className="text-h3">Recent deliveries</h3>
            <span className="text-[12px] text-ink-mute">last {liveData.recentBalls.length}</span>
          </header>
          <div className="flex flex-wrap items-center gap-2.5">
            {liveData.recentBalls.map((ball, i) => <Pellet key={i} ball={ball} />)}
          </div>
        </section>
      )}

      {/* Current over */}
      {liveData.currentOver && (
        <section className="card rise rise-d2">
          <header className="flex items-center justify-between mb-5">
            <div>
              <p className="eyebrow mb-1.5">At the mark</p>
              <h3 className="text-h3">
                Over {liveData.currentOver.over_number}
                <span className="text-ink-soft font-normal text-[15px] ml-2">
                  · {liveData.currentOver.bowler?.name}
                </span>
              </h3>
            </div>
            <span className="text-[12px] font-mono text-ink-soft">
              {liveData.currentOver.legal_balls}/6 balls
            </span>
          </header>
          <div className="flex flex-wrap items-center gap-2.5">
            {liveData.currentOverBalls.length > 0
              ? liveData.currentOverBalls.map((ball, i) => <Pellet key={i} ball={ball} />)
              : <p className="text-[13px] text-ink-mute">No balls yet this over.</p>}
          </div>
        </section>
      )}

      {/* Batting card */}
      {currentInnings?.battingCards && (
        <section className="card rise rise-d3">
          <header className="flex items-baseline justify-between mb-5">
            <h3 className="text-h3">
              Batting <span className="text-ink-soft font-normal text-[15px] ml-1">· {currentInnings.battingTeam?.name}</span>
            </h3>
          </header>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[14px] min-w-[560px]">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left py-2.5 px-2 eyebrow">Batsman</th>
                  <th className="text-right py-2.5 px-2 eyebrow">R</th>
                  <th className="text-right py-2.5 px-2 eyebrow">B</th>
                  <th className="text-right py-2.5 px-2 eyebrow">4s</th>
                  <th className="text-right py-2.5 px-2 eyebrow">6s</th>
                  <th className="text-right py-2.5 px-2 eyebrow">SR</th>
                </tr>
              </thead>
              <tbody>
                {currentInnings.battingCards
                  .sort((a, b) => a.batting_position - b.batting_position)
                  .map(card => {
                    const onStrike = card.player_id === currentInnings.on_strike_batsman_id;
                    const isPlaying = card.player_id === currentInnings.current_batsman1_id || card.player_id === currentInnings.current_batsman2_id;
                    const sr = card.balls > 0 ? ((card.runs / card.balls) * 100).toFixed(1) : '—';
                    return (
                      <tr key={card.id} className="border-b border-hairline last:border-b-0">
                        <td className="py-3.5 px-2">
                          <div className="flex items-baseline gap-2">
                            {onStrike && <span className="text-accent text-[9px]">●</span>}
                            <span className={`font-medium ${isPlaying ? 'text-ink' : 'text-ink-soft'}`}>
                              {card.player?.name}
                            </span>
                          </div>
                          {card.is_out && (
                            <span className="block text-[12px] text-ink-mute mt-0.5">
                              {card.dismissal_type?.replace(/_/g, ' ')}
                              {card.bowler && ` · b. ${card.bowler.name}`}
                            </span>
                          )}
                        </td>
                        <td className="text-right py-3.5 px-2 num-md">{card.runs}</td>
                        <td className="text-right py-3.5 px-2 num-sm">{card.balls}</td>
                        <td className="text-right py-3.5 px-2 num-sm">{card.fours}</td>
                        <td className="text-right py-3.5 px-2 num-sm">{card.sixes}</td>
                        <td className="text-right py-3.5 px-2 num-sm">{sr}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bowling card */}
      {currentInnings?.bowlingCards && (
        <section className="card rise rise-d4">
          <header className="flex items-baseline justify-between mb-5">
            <h3 className="text-h3">
              Bowling <span className="text-ink-soft font-normal text-[15px] ml-1">· {currentInnings.bowlingTeam?.name}</span>
            </h3>
          </header>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[14px] min-w-[480px]">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left py-2.5 px-2 eyebrow">Bowler</th>
                  <th className="text-right py-2.5 px-2 eyebrow">O</th>
                  <th className="text-right py-2.5 px-2 eyebrow">R</th>
                  <th className="text-right py-2.5 px-2 eyebrow">W</th>
                  <th className="text-right py-2.5 px-2 eyebrow">Econ</th>
                </tr>
              </thead>
              <tbody>
                {currentInnings.bowlingCards.map(card => {
                  const isBowling = card.player_id === currentInnings.current_bowler_id;
                  const economy = card.legal_balls > 0 ? ((card.runs / card.legal_balls) * 6).toFixed(2) : '—';
                  return (
                    <tr key={card.id} className="border-b border-hairline last:border-b-0">
                      <td className="py-3.5 px-2">
                        <div className="flex items-baseline gap-2">
                          {isBowling && <span className="text-accent text-[9px]">●</span>}
                          <span className={`font-medium ${isBowling ? 'text-ink' : 'text-ink-soft'}`}>
                            {card.player?.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3.5 px-2 num-sm">{card.overs != null ? Number(card.overs).toFixed(1) : '0.0'}</td>
                      <td className="text-right py-3.5 px-2 num-sm">{card.runs}</td>
                      <td className="text-right py-3.5 px-2 num-md text-accent">{card.wickets}</td>
                      <td className="text-right py-3.5 px-2 num-sm">{economy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Archived innings */}
      {completedInnings.map((inn, idx) => (
        <section key={inn.id} className="card rise" style={{ animationDelay: `${500 + idx * 100}ms` }}>
          <header className="flex items-baseline justify-between mb-5">
            <h3 className="text-h3">
              {inn.battingTeam?.name}
              <span className="text-ink-soft font-normal text-[14px] ml-2">· archived</span>
            </h3>
            <span className="font-mono text-[15px] text-ink">
              {getScoreDisplay(inn)} <span className="text-ink-mute">({formatOvers(inn.total_overs_bowled)})</span>
            </span>
          </header>
          {inn.battingCards && (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-[13px] min-w-[420px]">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left py-2 px-2 eyebrow">Batsman</th>
                    <th className="text-right py-2 px-2 eyebrow">R</th>
                    <th className="text-right py-2 px-2 eyebrow">B</th>
                    <th className="text-right py-2 px-2 eyebrow">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.battingCards.sort((a, b) => a.batting_position - b.batting_position).map(card => (
                    <tr key={card.id} className="border-b border-hairline last:border-b-0">
                      <td className="py-2.5 px-2 text-ink-soft">{card.player?.name}</td>
                      <td className="text-right py-2.5 px-2 num-sm">{card.runs}</td>
                      <td className="text-right py-2.5 px-2 num-sm">{card.balls}</td>
                      <td className="text-right py-2.5 px-2 num-sm">
                        {card.balls > 0 ? ((card.runs / card.balls) * 100).toFixed(1) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      {match.status === 'completed' && (
        <section className="card text-center py-12">
          <p className="eyebrow mb-3 text-pitch">Filed</p>
          <h3 className="text-h2 mb-4">Match closed.</h3>
          <a href={`/matches/${match.id}/summary`} className="btn-primary">Read the full card →</a>
        </section>
      )}
    </div>
  );
}
