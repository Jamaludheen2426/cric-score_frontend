'use client';

import { LiveScore, Match, BallRecord } from '@/types';
import { formatOvers, formatRate, getBallLabel, getBallColor, getScoreDisplay } from '@/lib/utils';

interface Props { liveData: LiveScore; match: Match; }

function Pellet({ ball }: { ball: BallRecord }) {
  return <span className={getBallColor(ball)} title={getBallLabel(ball)}>{getBallLabel(ball)}</span>;
}

export function LiveScoreCard({ liveData, match }: Props) {
  const current = liveData.innings.find(i => i.status === 'live');
  const completed = liveData.innings.filter(i => i.status === 'completed');

  return (
    <div className="space-y-3">
      {/* HERO score */}
      {current && (
        <section className="card">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--green-text)]">
                <span className="live-dot" /> {current.battingTeam?.name} · INN {current.innings_number}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="score-number">{current.total_runs}/{current.total_wickets}</span>
                <span className="score-over">({formatOvers(current.total_overs_bowled)}/{match.total_overs})</span>
              </div>
            </div>
            {completed[0] && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{completed[0].battingTeam?.name}</p>
                <p className="text-[15px] font-bold tabular-nums text-[var(--text-secondary)]">
                  {getScoreDisplay(completed[0])}
                  <span className="ml-1 text-[12px] font-normal text-[var(--text-muted)]">({formatOvers(completed[0].total_overs_bowled)})</span>
                </p>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-[var(--border-subtle)] pt-2 text-[12px] tabular-nums text-[var(--text-secondary)]">
            <span>CRR <strong className="text-[var(--text-primary)]">{current.run_rate != null ? formatRate(current.run_rate) : '–'}</strong></span>
            {current.innings_number === 2 && current.target && (
              <>
                <span>·</span>
                <span>Need <strong className="text-[var(--red-text)]">{Math.max(0, current.target - current.total_runs)}</strong></span>
                {current.required_rate != null && current.required_rate > 0 && (
                  <>
                    <span>·</span>
                    <span>RRR <strong className="text-[var(--orange-text)]">{formatRate(current.required_rate)}</strong></span>
                  </>
                )}
              </>
            )}
            <span className="ml-auto text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Extras {current.extras}</span>
          </div>
        </section>
      )}

      {/* Recent balls */}
      {liveData.recentBalls.length > 0 && (
        <section className="card">
          <p className="eyebrow mb-2">Recent</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {liveData.recentBalls.map((b, i) => <Pellet key={i} ball={b} />)}
          </div>
        </section>
      )}

      {/* Current over */}
      {liveData.currentOver && (
        <section className="card">
          <p className="eyebrow mb-2">
            Over {liveData.currentOver.over_number} · <span className="text-[var(--text-secondary)] normal-case tracking-normal font-normal">{liveData.currentOver.bowler?.name}</span>
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {liveData.currentOverBalls.length > 0
              ? liveData.currentOverBalls.map((b, i) => <Pellet key={i} ball={b} />)
              : <p className="text-[12px] text-[var(--text-muted)]">No balls yet this over.</p>}
          </div>
        </section>
      )}

      {/* Live innings: batting + bowling cards */}
      {current?.battingCards && <BattingTable innings={current} />}
      {current?.bowlingCards && <BowlingTable innings={current} />}

      {/* Archived innings — both batting AND bowling */}
      {completed.map(inn => (
        <div key={inn.id} className="space-y-3">
          <section className="card">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-bold text-[var(--text-primary)]">
                {inn.battingTeam?.name} <span className="text-[11px] font-normal uppercase tracking-wide text-[var(--text-muted)]">· archived</span>
              </p>
              <p className="text-[15px] font-bold tabular-nums">
                {getScoreDisplay(inn)} <span className="text-[12px] font-normal text-[var(--text-muted)]">({formatOvers(inn.total_overs_bowled)})</span>
              </p>
            </div>
          </section>
          <BattingTable innings={inn} />
          <BowlingTable innings={inn} />
        </div>
      ))}

      {match.status === 'completed' && (
        <section className="card text-center">
          <p className="eyebrow mb-1.5" style={{ color: 'var(--green-text)' }}>Filed</p>
          <p className="text-[15px] font-bold">Match closed.</p>
          <a href={`/matches/${match.id}/summary`} className="btn btn-primary mt-3 inline-flex">Full scorecard</a>
        </section>
      )}
    </div>
  );
}

function BattingTable({ innings }: { innings: LiveScore['innings'][number] }) {
  if (!innings.battingCards?.length) return null;
  return (
    <section className="card">
      <p className="eyebrow mb-2">Batting · {innings.battingTeam?.name}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="table-head px-2 py-1.5 text-left">Batsman</th>
              <th className="table-head px-2 py-1.5 text-left">Dismissal</th>
              <th className="table-head px-2 py-1.5 text-right">R</th>
              <th className="table-head px-2 py-1.5 text-right">B</th>
              <th className="table-head px-2 py-1.5 text-right">4s</th>
              <th className="table-head px-2 py-1.5 text-right">6s</th>
              <th className="table-head px-2 py-1.5 text-right">SR</th>
            </tr>
          </thead>
          <tbody>
            {innings.battingCards!.sort((a, b) => a.batting_position - b.batting_position).map(card => {
              const onStrike = card.player_id === innings.on_strike_batsman_id;
              const sr = card.balls > 0 ? ((card.runs / card.balls) * 100).toFixed(1) : '—';
              return (
                <tr key={card.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
                  <td className="table-cell">
                    {onStrike && <span className="mr-1 text-[var(--green-text)]">*</span>}
                    <span className="font-semibold">{card.player?.name}</span>
                  </td>
                  <td className="table-cell text-[11px] text-[var(--text-muted)]">
                    {card.is_out
                      ? <>{card.dismissal_type?.replace(/_/g, ' ')}{card.bowler && ` · b. ${card.bowler.name}`}</>
                      : <span className="text-[var(--text-secondary)]">not out</span>}
                  </td>
                  <td className="table-cell text-right font-bold">{card.runs}</td>
                  <td className="table-cell text-right text-[var(--text-secondary)]">{card.balls}</td>
                  <td className="table-cell text-right text-[var(--text-secondary)]">{card.fours}</td>
                  <td className="table-cell text-right text-[var(--text-secondary)]">{card.sixes}</td>
                  <td className="table-cell text-right text-[var(--text-secondary)]">{sr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BowlingTable({ innings }: { innings: LiveScore['innings'][number] }) {
  if (!innings.bowlingCards?.length) return null;
  return (
    <section className="card">
      <p className="eyebrow mb-2">Bowling · {innings.bowlingTeam?.name}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="table-head px-2 py-1.5 text-left">Bowler</th>
              <th className="table-head px-2 py-1.5 text-right">O</th>
              <th className="table-head px-2 py-1.5 text-right">R</th>
              <th className="table-head px-2 py-1.5 text-right">W</th>
              <th className="table-head px-2 py-1.5 text-right">Econ</th>
            </tr>
          </thead>
          <tbody>
            {innings.bowlingCards!.map(card => {
              const econ = card.legal_balls > 0 ? ((card.runs / card.legal_balls) * 6).toFixed(2) : '—';
              const overs = card.overs != null ? Number(card.overs).toFixed(1) : '0.0';
              const isCurrent = card.player_id === innings.current_bowler_id;
              return (
                <tr key={card.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
                  <td className="table-cell">
                    {isCurrent && <span className="mr-1 text-[var(--green-text)]">●</span>}
                    <span className="font-semibold">{card.player?.name}</span>
                  </td>
                  <td className="table-cell text-right">{overs}</td>
                  <td className="table-cell text-right">{card.runs}</td>
                  <td className="table-cell text-right font-bold" style={{ color: 'var(--green-text)' }}>{card.wickets}</td>
                  <td className="table-cell text-right text-[var(--text-secondary)]">{econ}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
