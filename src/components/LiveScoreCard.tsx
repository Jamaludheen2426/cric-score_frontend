'use client';

import { LiveScore, Match, BallRecord } from '@/types';
import { formatOvers, formatRate, getBallLabel, getBallColor, getScoreDisplay } from '@/lib/utils';

interface Props {
  liveData: LiveScore;
  match: Match;
}

function BallPellet({ ball }: { ball: BallRecord }) {
  return <span className={getBallColor(ball)} title={getBallLabel(ball)}>{getBallLabel(ball)}</span>;
}

export function LiveScoreCard({ liveData, match }: Props) {
  const currentInnings = liveData.innings.find(i => i.status === 'live');
  const completedInnings = liveData.innings.filter(i => i.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Hero score */}
      {currentInnings && (
        <section className="slab-accent reveal">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="badge-live"><span className="live-dot" /> live</span>
              <span className="font-mono text-[10px] text-ink-dim uppercase tracking-widest">
                innings {currentInnings.innings_number} · ball-by-ball
              </span>
            </div>
            {completedInnings[0] && (
              <div className="font-mono text-[12px] text-ink-muted text-right">
                <span className="eyebrow mr-2">{completedInnings[0].battingTeam?.name}</span>
                <span className="text-ink">{getScoreDisplay(completedInnings[0])}</span>
                <span className="text-ink-dim"> ({formatOvers(completedInnings[0].total_overs_bowled)})</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-6">
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-editorial italic text-[14px] text-ochre-500">
                  {currentInnings.battingTeam?.name} — at the wicket
                </span>
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

            {currentInnings.innings_number === 2 && currentInnings.target && (
              <div className="md:text-right border-l-2 md:border-l border-canvas-ridge md:pl-6">
                <div className="eyebrow mb-1">chasing</div>
                <div className="num-lg text-saffron-500">{currentInnings.target}</div>
                <div className="font-mono text-[12px] text-ink-muted mt-1">
                  {Math.max(0, currentInnings.target - currentInnings.total_runs)} runs to go
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-canvas-ridge border-t border-canvas-ridge">
            <Stat label="crr" value={currentInnings.run_rate != null ? formatRate(currentInnings.run_rate) : '—'} />
            {currentInnings.required_rate != null && currentInnings.required_rate > 0
              ? <Stat label="rrr" value={formatRate(currentInnings.required_rate)} accent="saffron" />
              : <Stat label="extras" value={String(currentInnings.extras)} />}
            <Stat label="wickets" value={String(currentInnings.total_wickets)} />
            <Stat label="overs left" value={String(match.total_overs - Math.floor(currentInnings.total_overs_bowled))} />
          </div>
        </section>
      )}

      {/* Recent balls */}
      {liveData.recentBalls.length > 0 && (
        <section className="slab reveal reveal-d1">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <span className="overline">on the wire</span>
              <span className="font-display text-xl uppercase text-ink">Recent deliveries</span>
            </div>
            <span className="font-mono text-[11px] text-ink-dim uppercase tracking-widest">
              last {liveData.recentBalls.length}
            </span>
          </header>
          <div className="flex flex-wrap items-center gap-2">
            {liveData.recentBalls.map((ball, i) => <BallPellet key={i} ball={ball} />)}
          </div>
        </section>
      )}

      {/* Current over */}
      {liveData.currentOver && (
        <section className="slab reveal reveal-d2">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <span className="overline">at the mark</span>
              <span className="font-display text-xl uppercase text-ink">
                Over <span className="text-saffron-500">{liveData.currentOver.over_number}</span>
              </span>
              <span className="font-body text-[13px] text-ink-muted">
                — {liveData.currentOver.bowler?.name}
              </span>
            </div>
            <span className="font-mono text-[11px] text-ink-dim uppercase tracking-widest">
              {liveData.currentOver.legal_balls}/6 balls
            </span>
          </header>
          <div className="flex flex-wrap items-center gap-2">
            {liveData.currentOverBalls.length > 0
              ? liveData.currentOverBalls.map((ball, i) => <BallPellet key={i} ball={ball} />)
              : <p className="font-editorial italic text-ink-dim">No balls yet this over.</p>}
          </div>
        </section>
      )}

      {/* Batting card */}
      {currentInnings?.battingCards && (
        <section className="slab reveal reveal-d3">
          <header className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <span className="overline">batsmen</span>
              <span className="font-display text-xl uppercase text-ink">
                {currentInnings.battingTeam?.name} batting
              </span>
            </div>
          </header>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[14px] min-w-[560px]">
              <thead>
                <tr className="border-b border-canvas-ridge">
                  <th className="text-left py-2 px-2 eyebrow">batsman</th>
                  <th className="text-right py-2 px-2 eyebrow">R</th>
                  <th className="text-right py-2 px-2 eyebrow">B</th>
                  <th className="text-right py-2 px-2 eyebrow">4s</th>
                  <th className="text-right py-2 px-2 eyebrow">6s</th>
                  <th className="text-right py-2 px-2 eyebrow">SR</th>
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
                      <tr key={card.id} className={`border-b border-canvas-ridge last:border-b-0 ${onStrike ? 'bg-saffron-500/[0.07] border-l-2 border-l-saffron-500' : ''}`}>
                        <td className="py-3 px-2">
                          <div className="flex items-baseline gap-2">
                            {onStrike && <span className="text-saffron-500 font-mono text-[10px]" aria-label="on strike">●</span>}
                            <span className={`font-display uppercase tracking-tight ${isPlaying ? 'text-ink' : 'text-ink-dim'}`}>
                              {card.player?.name}
                            </span>
                          </div>
                          {card.is_out && (
                            <span className="block font-editorial italic text-[11px] text-ink-dim mt-0.5">
                              {card.dismissal_type?.replace(/_/g, ' ')}
                              {card.bowler && ` · b. ${card.bowler.name}`}
                            </span>
                          )}
                        </td>
                        <td className="text-right py-3 px-2 num-md text-ink">{card.runs}</td>
                        <td className="text-right py-3 px-2 num-sm text-ink-muted">{card.balls}</td>
                        <td className="text-right py-3 px-2 num-sm text-ink-muted">{card.fours}</td>
                        <td className="text-right py-3 px-2 num-sm text-ink-muted">{card.sixes}</td>
                        <td className="text-right py-3 px-2 num-sm text-ink-muted">{sr}</td>
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
        <section className="slab reveal reveal-d4">
          <header className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <span className="overline">attack</span>
              <span className="font-display text-xl uppercase text-ink">
                {currentInnings.bowlingTeam?.name} bowling
              </span>
            </div>
          </header>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[14px] min-w-[480px]">
              <thead>
                <tr className="border-b border-canvas-ridge">
                  <th className="text-left py-2 px-2 eyebrow">bowler</th>
                  <th className="text-right py-2 px-2 eyebrow">O</th>
                  <th className="text-right py-2 px-2 eyebrow">R</th>
                  <th className="text-right py-2 px-2 eyebrow">W</th>
                  <th className="text-right py-2 px-2 eyebrow">Econ</th>
                </tr>
              </thead>
              <tbody>
                {currentInnings.bowlingCards.map(card => {
                  const isBowling = card.player_id === currentInnings.current_bowler_id;
                  const economy = card.legal_balls > 0 ? ((card.runs / card.legal_balls) * 6).toFixed(2) : '—';
                  return (
                    <tr key={card.id} className={`border-b border-canvas-ridge last:border-b-0 ${isBowling ? 'bg-saffron-500/[0.07] border-l-2 border-l-saffron-500' : ''}`}>
                      <td className="py-3 px-2">
                        <span className={`font-display uppercase tracking-tight ${isBowling ? 'text-ink' : 'text-ink-muted'}`}>
                          {card.player?.name}
                        </span>
                        {isBowling && (
                          <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-saffron-500">at the mark</span>
                        )}
                      </td>
                      <td className="text-right py-3 px-2 num-sm text-ink">{card.overs?.toFixed(1) ?? '0.0'}</td>
                      <td className="text-right py-3 px-2 num-sm text-ink">{card.runs}</td>
                      <td className="text-right py-3 px-2 num-md text-saffron-500">{card.wickets}</td>
                      <td className="text-right py-3 px-2 num-sm text-ink-muted">{economy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Completed innings (compact) */}
      {completedInnings.map((inn, idx) => (
        <section key={inn.id} className="slab opacity-90 reveal" style={{ animationDelay: `${500 + idx * 100}ms` }}>
          <header className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <span className="overline">archived innings</span>
              <span className="font-display text-xl uppercase text-ink">{inn.battingTeam?.name}</span>
            </div>
            <span className="font-mono text-[15px] text-ink">
              {getScoreDisplay(inn)} <span className="text-ink-dim">({formatOvers(inn.total_overs_bowled)})</span>
            </span>
          </header>
          {inn.battingCards && (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-[13px] min-w-[420px]">
                <thead>
                  <tr className="border-b border-canvas-ridge">
                    <th className="text-left py-1.5 px-2 eyebrow">batsman</th>
                    <th className="text-right py-1.5 px-2 eyebrow">R</th>
                    <th className="text-right py-1.5 px-2 eyebrow">B</th>
                    <th className="text-right py-1.5 px-2 eyebrow">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.battingCards.sort((a, b) => a.batting_position - b.batting_position).map(card => (
                    <tr key={card.id} className="border-b border-canvas-ridge last:border-b-0">
                      <td className="py-2 px-2 font-display uppercase text-ink-muted tracking-tight">
                        {card.player?.name}
                      </td>
                      <td className="text-right py-2 px-2 num-sm text-ink">{card.runs}</td>
                      <td className="text-right py-2 px-2 num-sm text-ink-muted">{card.balls}</td>
                      <td className="text-right py-2 px-2 num-sm text-ink-muted">
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
        <section className="slab-accent pitch text-center py-10">
          <div className="overline mb-2">filed</div>
          <p className="font-display text-3xl uppercase text-pitch-400 mb-3">Match closed.</p>
          <a href={`/matches/${match.id}/summary`} className="btn-primary">Read the full card →</a>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'saffron' }) {
  return (
    <div className="bg-canvas-raised px-4 py-3">
      <div className="eyebrow mb-1">{label}</div>
      <div className={`font-display text-2xl leading-none ${accent === 'saffron' ? 'text-saffron-500' : 'text-ink'}`}>
        {value}
      </div>
    </div>
  );
}
