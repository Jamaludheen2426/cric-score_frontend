'use client';

import { LiveScore, Match, BallRecord, Innings } from '@/types';
import { formatOvers, formatRate, getBallLabel, getBallColor, getScoreDisplay } from '@/lib/utils';
import { Narratives } from './Narratives';

interface Props { liveData: LiveScore; match: Match; }

function Pellet({ ball }: { ball: BallRecord }) {
  return <span className={getBallColor(ball)} title={getBallLabel(ball)}>{getBallLabel(ball)}</span>;
}

/** Plain-English one-liner describing the state of the match. */
function statusSentence(current: Innings | undefined, match: Match, completed: Innings[]): string {
  if (match.status === 'completed') return 'Match closed';
  if (!current) return 'Match not started';
  if (current.innings_number === 2 && current.target != null) {
    const need = current.target - current.total_runs;
    const totalBalls = match.total_overs * 6;
    const ballsBowled = Math.floor(Number(current.total_overs_bowled)) * 6
                      + Math.round((Number(current.total_overs_bowled) % 1) * 10);
    const left = totalBalls - ballsBowled;
    if (need <= 0) return `${current.battingTeam?.name} won the match`;
    return `${current.battingTeam?.name} need ${need} from ${left} ball${left === 1 ? '' : 's'} to win`;
  }
  // Innings 1 sentence
  return `${current.battingTeam?.name} batting · over ${Math.floor(Number(current.total_overs_bowled)) + 1} of ${match.total_overs}`;
}

/** Headline label for the latest delivery. "WICKET!" / "FOUR" / "SIX" / "2 runs" / "dot ball" / "Wide" / "No ball". */
function lastBallHeadline(b: BallRecord): { title: string; tone: 'wicket' | 'six' | 'four' | 'wide' | 'nb' | 'dot' | 'run' } {
  if (b.is_wicket) return { title: 'WICKET!', tone: 'wicket' };
  if (b.runs === 6) return { title: 'SIX!',     tone: 'six' };
  if (b.runs === 4) return { title: 'FOUR',     tone: 'four' };
  if (b.is_wide)   return { title: 'Wide',     tone: 'wide' };
  if (b.is_noball) return { title: 'No ball',  tone: 'nb' };
  if (b.runs === 0) return { title: 'Dot ball', tone: 'dot' };
  return { title: `${b.runs} run${b.runs === 1 ? '' : 's'}`, tone: 'run' };
}

export function LiveScoreCard({ liveData, match }: Props) {
  const current = liveData.innings.find(i => i.status === 'live');
  const completed = liveData.innings.filter(i => i.status === 'completed');

  // Who's actually at the crease right now
  const striker     = current?.batsman1 && current.on_strike_batsman_id === current.batsman1.id ? current.batsman1
                    : current?.batsman2 && current.on_strike_batsman_id === current.batsman2.id ? current.batsman2
                    : current?.onStrike;
  const nonStriker  = current && current.batsman1 && current.batsman2
                       ? (striker?.id === current.batsman1.id ? current.batsman2 : current.batsman1)
                       : undefined;
  const strikerCard    = current?.battingCards?.find(c => c.player_id === striker?.id);
  const nonStrikerCard = current?.battingCards?.find(c => c.player_id === nonStriker?.id);
  const bowlerCard     = current?.bowlingCards?.find(c => c.player_id === current?.current_bowler_id);

  // Most recent delivery (for the headline / last-ball callout)
  const latestBall = liveData.recentBalls.length > 0
    ? liveData.recentBalls[liveData.recentBalls.length - 1]
    : (liveData.currentOverBalls.length > 0 ? liveData.currentOverBalls[liveData.currentOverBalls.length - 1] : null);

  const thisOverRuns = liveData.currentOverBalls.reduce((acc, b) => acc + b.runs + b.extras, 0);

  return (
    <div className="space-y-3">
      {/* PLAIN-ENGLISH STATUS — first thing a viewer reads */}
      {current && (
        <section className="rounded-md border border-[var(--green)] bg-[#edf7ee] px-3 py-2">
          <p className="text-[13px] font-bold text-[var(--green-text)]">
            <span className="live-dot mr-1.5" />
            {statusSentence(current, match, completed)}
          </p>
        </section>
      )}

      {/* HERO score */}
      {current && (
        <section className="card">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                {current.battingTeam?.name} · INN {current.innings_number}
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
            {current.innings_number === 2 && current.target != null && (
              <>
                <span>·</span>
                <span>Target <strong className="text-[var(--text-primary)]">{current.target}</strong></span>
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

      {/* AT THE CRESE — striker + non-striker + bowler */}
      {current && (striker || nonStriker || current.currentBowler) && (
        <section className="card">
          <p className="eyebrow mb-2">At the crease</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {striker && (
              <CreaseTile
                role="Striker"
                name={striker.name}
                line={strikerCard ? `${strikerCard.runs}${strikerCard.is_out ? '' : '*'} (${strikerCard.balls}b)` : '0* (0b)'}
                accent
              />
            )}
            {nonStriker && (
              <CreaseTile
                role="Non-striker"
                name={nonStriker.name}
                line={nonStrikerCard ? `${nonStrikerCard.runs} (${nonStrikerCard.balls}b)` : '0 (0b)'}
              />
            )}
            {current.currentBowler && (
              <CreaseTile
                role="Bowler"
                name={current.currentBowler.name}
                line={bowlerCard
                  ? `${bowlerCard.wickets}/${bowlerCard.runs} (${Number(bowlerCard.overs).toFixed(1)} ov)`
                  : '0/0 (0.0 ov)'}
              />
            )}
          </div>
        </section>
      )}

      {/* LAST BALL CALLOUT — what just happened */}
      {latestBall && current && (
        <LastBallHeadline ball={latestBall} bowlerName={current.currentBowler?.name} />
      )}

      {/* CURRENT OVER pellets + running total */}
      {liveData.currentOver && (
        <section className="card">
          <div className="mb-2 flex items-center justify-between">
            <p className="eyebrow">
              Over {liveData.currentOver.over_number} · <span className="normal-case tracking-normal font-normal text-[var(--text-secondary)]">{liveData.currentOver.bowler?.name}</span>
            </p>
            <p className="text-[12px] font-bold tabular-nums text-[var(--text-primary)]">
              {thisOverRuns} run{thisOverRuns === 1 ? '' : 's'} this over
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {liveData.currentOverBalls.length > 0
              ? liveData.currentOverBalls.map((b, i) => <Pellet key={i} ball={b} />)
              : <p className="text-[12px] text-[var(--text-muted)]">No balls yet this over.</p>}
          </div>
        </section>
      )}

      {/* Recent balls (across overs) */}
      {liveData.recentBalls.length > 0 && (
        <section className="card">
          <p className="eyebrow mb-2">Recent balls (last {liveData.recentBalls.length})</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {liveData.recentBalls.map((b, i) => <Pellet key={i} ball={b} />)}
          </div>
        </section>
      )}

      {/* Live innings: batting + bowling cards + narratives */}
      {current?.battingCards && <BattingTable innings={current} />}
      {current?.bowlingCards && <BowlingTable innings={current} />}
      {current && <Narratives innings={current} />}

      {/* Archived innings — both batting AND bowling AND narratives */}
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
          <Narratives innings={inn} />
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

function CreaseTile({ role, name, line, accent }: { role: string; name: string; line: string; accent?: boolean }) {
  return (
    <div className={`rounded border p-2.5 ${accent ? 'border-[var(--green)] bg-[#edf7ee]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">{role}</p>
      <p className="mt-0.5 truncate text-[14px] font-bold text-[var(--text-primary)]">{name}</p>
      <p className="text-[12px] font-mono tabular-nums text-[var(--text-secondary)]">{line}</p>
    </div>
  );
}

function LastBallHeadline({ ball, bowlerName }: { ball: BallRecord; bowlerName?: string }) {
  const palette: Record<string, { bg: string; border: string; text: string }> = {
    wicket: { bg: '#fff1f1', border: 'var(--red)',          text: 'var(--red-text)' },
    six:    { bg: '#fff7d6', border: '#e4ca76',             text: 'var(--gold-text)' },
    four:   { bg: '#fff7d6', border: '#e4ca76',             text: 'var(--gold-text)' },
    wide:   { bg: '#eef4ff', border: 'var(--blue)',         text: 'var(--blue-text)' },
    nb:     { bg: '#fff7ed', border: 'var(--orange)',       text: 'var(--orange-text)' },
    dot:    { bg: 'var(--bg-card)', border: 'var(--border)', text: 'var(--text-secondary)' },
    run:    { bg: '#edf7ee', border: 'var(--green)',        text: 'var(--green-text)' },
  };
  const { title, tone } = (function () {
    if (ball.is_wicket) return { title: 'WICKET!', tone: 'wicket' as const };
    if (ball.runs === 6) return { title: 'SIX!',     tone: 'six' as const };
    if (ball.runs === 4) return { title: 'FOUR',     tone: 'four' as const };
    if (ball.is_wide)    return { title: 'Wide',     tone: 'wide' as const };
    if (ball.is_noball)  return { title: 'No ball',  tone: 'nb' as const };
    if (ball.runs === 0) return { title: 'Dot ball', tone: 'dot' as const };
    return { title: `${ball.runs} run${ball.runs === 1 ? '' : 's'}`, tone: 'run' as const };
  })();
  const c = palette[tone];
  return (
    <section className="rounded-md border px-3 py-2.5" style={{ backgroundColor: c.bg, borderColor: c.border }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.05em]" style={{ color: c.text }}>
        Last ball
      </p>
      <p className="mt-0.5 text-[18px] font-bold leading-tight" style={{ color: c.text }}>
        {title}
        {ball.runs > 0 && ball.runs !== 4 && ball.runs !== 6 && !ball.is_wide && !ball.is_noball ? '' : ''}
      </p>
      {bowlerName && (
        <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">bowled by {bowlerName}</p>
      )}
    </section>
  );
}

function BattingTable({ innings }: { innings: LiveScore['innings'][number] }) {
  if (!innings.battingCards?.length) return null;
  return (
    <section className="card">
      <p className="eyebrow mb-2">Batting · {innings.battingTeam?.name}</p>
      <table className="w-full table-fixed text-[13px]">
        <colgroup>
          <col />
          <col className="w-[44px]" />
          <col className="w-[36px]" />
          <col className="hidden w-[38px] sm:table-column" />
          <col className="hidden w-[38px] sm:table-column" />
          <col className="w-[52px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="table-head px-1.5 py-1.5 text-left">Batsman</th>
            <th className="table-head px-1 py-1.5 text-right">R</th>
            <th className="table-head px-1 py-1.5 text-right">B</th>
            <th className="table-head hidden px-1 py-1.5 text-right sm:table-cell">4s</th>
            <th className="table-head hidden px-1 py-1.5 text-right sm:table-cell">6s</th>
            <th className="table-head px-1 py-1.5 text-right">SR</th>
          </tr>
        </thead>
        <tbody>
          {innings.battingCards!.sort((a, b) => a.batting_position - b.batting_position).map(card => {
            const onStrike = card.player_id === innings.on_strike_batsman_id;
            const sr = card.balls > 0 ? Math.round((card.runs / card.balls) * 100).toString() : '—';
            return (
              <tr key={card.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
                <td className="table-cell px-1.5">
                  <div className="flex items-baseline gap-1">
                    {onStrike && <span className="text-[var(--green-text)]">*</span>}
                    <span className="truncate font-semibold">{card.player?.name}</span>
                  </div>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    {card.is_out
                      ? <>{card.dismissal_type?.replace(/_/g, ' ')}{card.bowler && ` · b. ${card.bowler.name}`}</>
                      : <span className="text-[var(--text-secondary)]">not out</span>}
                  </p>
                </td>
                <td className="table-cell px-1 text-right font-bold">{card.runs}</td>
                <td className="table-cell px-1 text-right text-[var(--text-secondary)]">{card.balls}</td>
                <td className="table-cell hidden px-1 text-right text-[var(--text-secondary)] sm:table-cell">{card.fours}</td>
                <td className="table-cell hidden px-1 text-right text-[var(--text-secondary)] sm:table-cell">{card.sixes}</td>
                <td className="table-cell px-1 text-right text-[var(--text-secondary)]">{sr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function BowlingTable({ innings }: { innings: LiveScore['innings'][number] }) {
  if (!innings.bowlingCards?.length) return null;
  return (
    <section className="card">
      <p className="eyebrow mb-2">Bowling · {innings.bowlingTeam?.name}</p>
      <table className="w-full table-fixed text-[13px]">
        <colgroup>
          <col />
          <col className="w-[44px]" />
          <col className="w-[44px]" />
          <col className="w-[36px]" />
          <col className="w-[54px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="table-head px-1.5 py-1.5 text-left">Bowler</th>
            <th className="table-head px-1 py-1.5 text-right">O</th>
            <th className="table-head px-1 py-1.5 text-right">R</th>
            <th className="table-head px-1 py-1.5 text-right">W</th>
            <th className="table-head px-1 py-1.5 text-right">Econ</th>
          </tr>
        </thead>
        <tbody>
          {innings.bowlingCards!.map(card => {
            const econ = card.legal_balls > 0 ? ((card.runs / card.legal_balls) * 6).toFixed(2) : '—';
            const overs = card.overs != null ? Number(card.overs).toFixed(1) : '0.0';
            const isCurrent = card.player_id === innings.current_bowler_id;
            return (
              <tr key={card.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
                <td className="table-cell px-1.5">
                  <div className="flex items-baseline gap-1">
                    {isCurrent && <span className="text-[var(--green-text)]">●</span>}
                    <span className="truncate font-semibold">{card.player?.name}</span>
                  </div>
                </td>
                <td className="table-cell px-1 text-right">{overs}</td>
                <td className="table-cell px-1 text-right">{card.runs}</td>
                <td className="table-cell px-1 text-right font-bold" style={{ color: 'var(--green-text)' }}>{card.wickets}</td>
                <td className="table-cell px-1 text-right text-[var(--text-secondary)]">{econ}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
