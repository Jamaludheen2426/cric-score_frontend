'use client';

import { useState, type ReactNode } from 'react';
import { Share2 } from 'lucide-react';
import { LiveScore, Match, BallRecord, Innings } from '@/types';
import { ballsPerOver, formatOvers, formatRate, getBallLabel, getBallColor, getScoreDisplay } from '@/lib/utils';
import { Narratives } from './Narratives';
import { MatchAlerts } from './MatchAlerts';
import { CricketBatIcon } from './icons/CricketBatIcon';

interface Props { liveData: LiveScore; match: Match; }

function Pellet({ ball }: { ball: BallRecord }) {
  return <span className={getBallColor(ball)} title={getBallLabel(ball)}>{getBallLabel(ball)}</span>;
}

/** Plain-English one-liner describing the state of the match. */
function statusSentence(current: Innings | undefined, match: Match, completed: Innings[], perOver: number): string {
  if (match.status === 'completed') return 'Match closed';
  if (!current) return 'Match not started';
  if (current.innings_number === 2 && current.target != null) {
    const need = current.target - current.total_runs;
    const totalBalls = match.total_overs * perOver;
    const ballsBowled = Math.floor(Number(current.total_overs_bowled)) * perOver
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
  const [scoreTab, setScoreTab] = useState<'batting' | 'bowling' | 'notes'>('batting');
  const current = liveData.innings.find(i => i.status === 'live');
  const completed = liveData.innings.filter(i => i.status === 'completed');
  const perOver = ballsPerOver(liveData.match || match);

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
            {statusSentence(current, match, completed, perOver)}
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

      {current && <TeamComparison current={current} completed={completed[0]} />}
      {current?.innings_number === 2 && <ChaseBlocks current={current} match={match} ballsPerOver={perOver} />}

      {current && <MatchAlerts liveData={liveData} />}
      {current && <SharePoster liveData={liveData} current={current} match={match} />}

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
                icon={<CricketBatIcon size={16} strokeWidth={1.9} />}
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

      {/* Previous overs */}
      {(liveData.previousOvers?.length ?? 0) > 0 && (
        <section className="card">
          <p className="eyebrow mb-2">Previous overs</p>
          <div className="grid gap-2">
            {liveData.previousOvers!.map(over => (
              <div key={over.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-2">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
                    Over {over.over_number}
                    {over.bowler?.name && <span className="normal-case tracking-normal font-normal text-[var(--text-secondary)]"> · {over.bowler.name}</span>}
                  </p>
                  <p className="text-[12px] font-bold tabular-nums text-[var(--text-primary)]">
                    {over.runs}/{over.wickets}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {over.balls.map((b, i) => <Pellet key={i} ball={b} />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {current && <CommentaryFeed liveData={liveData} />}
      {current && <InsightPanels liveData={liveData} current={current} completed={completed[0]} match={match} ballsPerOver={perOver} />}

      {/* Live innings: batting + bowling cards + narratives */}
      {current && (
        <section className="card">
          <div className="mb-2 grid grid-cols-3 border-b border-[var(--border-subtle)]">
            {(['batting', 'bowling', 'notes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setScoreTab(tab)}
                className={`h-9 border-b-2 text-[11px] font-bold uppercase tracking-[0.05em] ${
                  scoreTab === tab
                    ? 'border-[var(--green)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-muted)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {scoreTab === 'batting' && <BattingTable innings={current} framed={false} />}
          {scoreTab === 'bowling' && <BowlingTable innings={current} framed={false} ballsPerOver={perOver} />}
          {scoreTab === 'notes' && <ScoreNotes innings={current} />}
        </section>
      )}

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
          <BowlingTable innings={inn} ballsPerOver={perOver} />
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

function CreaseTile({ role, name, line, accent, icon }: { role: string; name: string; line: string; accent?: boolean; icon?: ReactNode }) {
  return (
    <div className={`rounded border p-2.5 ${accent ? 'border-[var(--green)] border-l-[3px] bg-[#edf7ee]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'}`}>
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
        {icon && <span className="text-[var(--green-text)]">{icon}</span>}
        {role}
      </p>
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

function TeamComparison({ current, completed }: { current: Innings; completed?: Innings }) {
  if (!completed) return null;
  const currentRuns = current.total_runs;
  const completedRuns = completed.total_runs;
  const max = Math.max(currentRuns, completedRuns, 1);
  return (
    <section className="card">
      <p className="eyebrow mb-2">Team comparison</p>
      {[
        { name: completed.battingTeam?.name || 'Innings 1', runs: completedRuns },
        { name: current.battingTeam?.name || 'Current', runs: currentRuns },
      ].map(row => (
        <div key={row.name} className="mb-2 last:mb-0">
          <div className="mb-1 flex justify-between text-[12px] font-semibold">
            <span className="truncate text-[var(--text-secondary)]">{row.name}</span>
            <span className="tabular-nums text-[var(--text-primary)]">{row.runs}</span>
          </div>
          <div className="h-2 rounded bg-[var(--bg-elevated)]">
            <div className="h-2 rounded bg-[var(--green)]" style={{ width: `${Math.max(4, (row.runs / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </section>
  );
}

function ChaseBlocks({ current, match, ballsPerOver }: { current: Innings; match: Match; ballsPerOver: number }) {
  if (current.target == null || current.runs_needed == null || current.balls_left == null) return null;
  const ballsPerBlock = ballsPerOver;
  const blocks = Math.min(4, Math.ceil(current.balls_left / ballsPerBlock));
  const perOver = current.balls_left > 0 ? current.runs_needed / (current.balls_left / ballsPerOver) : 0;

  return (
    <section className="card">
      <p className="eyebrow mb-2">Required blocks</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: blocks }).map((_, i) => {
          const balls = Math.min(6, current.balls_left! - i * 6);
          const runs = Math.ceil(perOver * (balls / ballsPerOver));
          return (
            <div key={i} className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
                Next {balls}b
              </p>
              <p className="mt-1 text-[18px] font-bold tabular-nums text-[var(--text-primary)]">{runs}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-muted)]">Target {current.target} in {match.total_overs} overs.</p>
    </section>
  );
}

function CommentaryFeed({ liveData }: { liveData: LiveScore }) {
  const rows = [
    ...(liveData.previousOvers || []).flatMap(over =>
      over.balls.map((ball, i) => ({ ball, label: `${over.over_number}.${i + 1}` }))
    ),
    ...liveData.currentOverBalls.map((ball, i) => ({ ball, label: `${liveData.currentOver?.over_number || ''}.${i + 1}` })),
  ].slice(-8).reverse();

  if (rows.length === 0) return null;

  return (
    <section className="card">
      <p className="eyebrow mb-2">Commentary</p>
      <div className="grid gap-1.5">
        {rows.map((row, i) => (
          <div key={`${row.label}-${i}`} className="flex items-center gap-2 text-[12px]">
            <span className="w-8 shrink-0 font-mono tabular-nums text-[var(--text-muted)]">{row.label}</span>
            <span className={getBallColor(row.ball)}>{getBallLabel(row.ball)}</span>
            <span className="min-w-0 truncate text-[var(--text-secondary)]">{commentaryText(row.ball)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function commentaryText(ball: BallRecord) {
  if (ball.is_wicket) return `Wicket${ball.wicket_type ? `, ${ball.wicket_type.replace(/_/g, ' ')}` : ''}`;
  if (ball.extra_type === 'bye') return `${ball.extras} bye${ball.extras === 1 ? '' : 's'}`;
  if (ball.extra_type === 'leg_bye') return `${ball.extras} leg bye${ball.extras === 1 ? '' : 's'}`;
  if (ball.is_wide) return `Wide${ball.extras ? `, ${ball.extras} run${ball.extras === 1 ? '' : 's'}` : ''}`;
  if (ball.is_noball) return `No ball${ball.runs ? `, ${ball.runs} off bat` : ''}`;
  if (ball.runs === 0) return 'Dot ball';
  if (ball.runs === 4) return 'FOUR';
  if (ball.runs === 6) return 'SIX';
  return `${ball.runs} run${ball.runs === 1 ? '' : 's'}`;
}

function SharePoster({ liveData, current, match }: { liveData: LiveScore; current: Innings; match: Match }) {
  const [copied, setCopied] = useState(false);
  const posterText = `${match.title}\n${current.battingTeam?.name}: ${current.total_runs}/${current.total_wickets} (${formatOvers(current.total_overs_bowled)}/${match.total_overs})\nCRR ${current.run_rate != null ? formatRate(current.run_rate) : '-'}${current.target ? `\nTarget ${current.target} | Need ${current.runs_needed} from ${current.balls_left}` : ''}`;

  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow mb-1">Share card</p>
          <p className="truncate text-[13px] font-bold text-[var(--text-primary)]">{current.battingTeam?.name} {current.total_runs}/{current.total_wickets}</p>
          <p className="text-[11px] text-[var(--text-muted)]">{liveData.match.teamA?.name || match.teamA?.name} v {liveData.match.teamB?.name || match.teamB?.name}</p>
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(posterText);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="btn btn-secondary btn-sm"
          title="Copy shareable score text"
        >
          <Share2 size={14} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </section>
  );
}

function InsightPanels({ liveData, current, completed, match, ballsPerOver }: {
  liveData: LiveScore;
  current: Innings;
  completed?: Innings;
  match: Match;
  ballsPerOver: number;
}) {
  const overs = current.overSummaries || [];
  if (overs.length === 0 && liveData.currentOverBalls.length === 0) return null;
  const currentOver = liveData.currentOver && liveData.currentOverBalls.length > 0
    ? [{
        id: liveData.currentOver.id,
        over_number: liveData.currentOver.over_number,
        runs: liveData.currentOver.runs,
        wickets: liveData.currentOver.wickets,
        legal_balls: liveData.currentOver.legal_balls,
        balls: liveData.currentOverBalls,
      }]
    : [];
  const allOvers = overs.length > 0 ? overs : [...(liveData.previousOvers || []), ...currentOver];
  const highlights = allOvers.flatMap(over => over.balls.map((ball, i) => ({ ball, over: `${over.over_number}.${i + 1}` })))
    .filter(item => item.ball.is_wicket || item.ball.runs === 4 || item.ball.runs === 6 || item.ball.is_free_hit)
    .slice(-6)
    .reverse();
  const maxOverRuns = Math.max(1, ...allOvers.map(o => o.runs));
  const totalBalls = match.total_overs * ballsPerOver;
  const pressure = current.target && current.runs_needed != null && current.balls_left != null
    ? Math.max(0, Math.min(100, 100 - (current.runs_needed / Math.max(1, current.target)) * 100 + (current.balls_left / Math.max(1, totalBalls)) * 20))
    : null;

  let running = 0;
  const worm = allOvers.map(over => {
    running += over.runs;
    return { label: over.over_number, runs: running };
  });
  const maxWorm = Math.max(1, ...worm.map(w => w.runs), completed?.total_runs || 0);

  return (
    <section className="card">
      <p className="eyebrow mb-2">Live charts</p>
      {pressure != null && (
        <div className="mb-3 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-2">
          <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
            <span>Win pressure</span>
            <span>{Math.round(pressure)}%</span>
          </div>
          <div className="h-2 rounded bg-[var(--bg-card)]">
            <div className="h-2 rounded bg-[var(--green)]" style={{ width: `${pressure}%` }} />
          </div>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Run-rate graph</p>
          <div className="flex h-24 items-end gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2">
            {allOvers.slice(-12).map(over => (
              <div key={over.id} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-[var(--green)]" style={{ height: `${Math.max(6, (over.runs / maxOverRuns) * 72)}px` }} />
                <span className="text-[9px] tabular-nums text-[var(--text-muted)]">{over.over_number}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Worm chart</p>
          <div className="flex h-24 items-end gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2">
            {worm.slice(-12).map(point => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="h-2 w-full rounded bg-[var(--blue)]" style={{ marginBottom: `${Math.max(0, (point.runs / maxWorm) * 64)}px` }} />
                <span className="text-[9px] tabular-nums text-[var(--text-muted)]">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <OverComparison current={current} completed={completed} />
      {highlights.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Auto highlights</p>
          <div className="grid gap-1.5">
            {highlights.map((item, i) => (
              <div key={`${item.over}-${i}`} className="flex items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[12px]">
                <span className="w-8 font-mono tabular-nums text-[var(--text-muted)]">{item.over}</span>
                <span className={getBallColor(item.ball)}>{getBallLabel(item.ball)}</span>
                <span className="truncate text-[var(--text-secondary)]">{commentaryText(item.ball)}{item.ball.is_free_hit ? ' on free hit' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function OverComparison({ current, completed }: { current: Innings; completed?: Innings }) {
  if (!completed?.overSummaries?.length || !current.overSummaries?.length) return null;
  const rows = current.overSummaries.slice(-6);
  return (
    <div className="mt-3">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Over-by-over comparison</p>
      <div className="grid gap-1.5">
        {rows.map(over => {
          const first = completed.overSummaries?.find(o => o.over_number === over.over_number);
          return (
            <div key={over.id} className="grid grid-cols-[42px_1fr_1fr] items-center gap-2 text-[11px]">
              <span className="font-mono tabular-nums text-[var(--text-muted)]">O{over.over_number}</span>
              <span className="rounded bg-[#edf7ee] px-2 py-1 font-bold text-[var(--green-text)]">{current.battingTeam?.name}: {over.runs}</span>
              <span className="rounded bg-[#eef4ff] px-2 py-1 font-bold text-[var(--blue-text)]">{completed.battingTeam?.name}: {first?.runs ?? '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreNotes({ innings }: { innings: Innings }) {
  return (
    <div className="grid gap-3">
      <div>
        <p className="eyebrow mb-2">Partnerships</p>
        <div className="grid gap-1.5">
          {(innings.partnerships || []).slice(-4).map(p => (
            <div key={p.wicket_number} className="flex justify-between gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[12px]">
              <span className="min-w-0 truncate text-[var(--text-secondary)]">{p.batsman1_name} / {p.batsman2_name}</span>
              <span className="font-bold tabular-nums text-[var(--text-primary)]">{p.runs} ({p.balls}b)</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-2">Fall of wickets</p>
        <div className="grid gap-1.5">
          {(innings.fallOfWickets || []).length > 0 ? innings.fallOfWickets!.map(fow => (
            <div key={fow.wicket_number} className="flex justify-between gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[12px]">
              <span className="min-w-0 truncate text-[var(--text-secondary)]">{fow.dismissed_player_name}</span>
              <span className="font-bold tabular-nums text-[var(--text-primary)]">{fow.score} · {fow.overs}</span>
            </div>
          )) : <p className="text-[12px] text-[var(--text-muted)]">No wickets yet.</p>}
        </div>
      </div>
    </div>
  );
}

function BattingTable({ innings, framed = true }: { innings: LiveScore['innings'][number]; framed?: boolean }) {
  if (!innings.battingCards?.length) return null;
  return (
    <section className={framed ? 'card' : ''}>
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
              <tr key={card.id} className={`border-b border-[var(--border-subtle)] last:border-b-0 ${onStrike ? 'bg-[#f6fbf1]' : ''}`}>
                <td className={`table-cell px-1.5 ${onStrike ? 'border-l-[3px] border-l-[var(--green)]' : ''}`}>
                  <div className="flex items-baseline gap-1">
                    {onStrike && <CricketBatIcon size={15} strokeWidth={1.9} className="shrink-0 text-[var(--green-text)]" aria-label="On strike" />}
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

function BowlingTable({ innings, framed = true, ballsPerOver = 6 }: { innings: LiveScore['innings'][number]; framed?: boolean; ballsPerOver?: number }) {
  if (!innings.bowlingCards?.length) return null;
  return (
    <section className={framed ? 'card' : ''}>
      <p className="eyebrow mb-2">Bowling · {innings.bowlingTeam?.name}</p>
      <table className="w-full table-fixed text-[13px]">
        <colgroup>
          <col />
          <col className="w-[40px]" />
          <col className="w-[40px]" />
          <col className="w-[32px]" />
          <col className="w-[32px]" />
          <col className="w-[32px]" />
          <col className="w-[48px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="table-head px-1.5 py-1.5 text-left">Bowler</th>
            <th className="table-head px-1 py-1.5 text-right">O</th>
            <th className="table-head px-1 py-1.5 text-right">R</th>
            <th className="table-head px-1 py-1.5 text-right">W</th>
            <th className="table-head px-1 py-1.5 text-right">Wd</th>
            <th className="table-head px-1 py-1.5 text-right">Nb</th>
            <th className="table-head px-1 py-1.5 text-right">Econ</th>
          </tr>
        </thead>
        <tbody>
          {innings.bowlingCards!.map(card => {
            const econ = card.legal_balls > 0 ? ((card.runs / card.legal_balls) * ballsPerOver).toFixed(2) : '—';
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
                <td className="table-cell px-1 text-right text-[var(--blue-text)]">{card.wides ?? 0}</td>
                <td className="table-cell px-1 text-right text-[var(--orange-text)]">{card.noballs ?? 0}</td>
                <td className="table-cell px-1 text-right text-[var(--text-secondary)]">{econ}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
