'use client';

import { LiveScore } from '@/types';
import { Trophy, Bat, BowlIcon } from './AwardIcons';

interface Props {
  liveData: LiveScore;
}

interface BatRow {
  playerId: number;
  name:     string;
  team:     string;
  runs:     number;
  balls:    number;
  fours:    number;
  sixes:    number;
  isOut:    boolean;
}
interface BowlRow {
  playerId: number;
  name:     string;
  team:     string;
  wickets:  number;
  runs:     number;
  balls:    number;       // legal balls
  overs:    number;       // decimal e.g. 3.4
}

function gatherBatting(liveData: LiveScore): BatRow[] {
  const rows: BatRow[] = [];
  for (const inn of liveData.innings) {
    const team = inn.battingTeam?.name || '';
    for (const c of inn.battingCards || []) {
      if (!c.player) continue;
      rows.push({
        playerId: c.player_id,
        name:     c.player.name,
        team,
        runs:     c.runs,
        balls:    c.balls,
        fours:    c.fours,
        sixes:    c.sixes,
        isOut:    c.is_out,
      });
    }
  }
  return rows;
}

function gatherBowling(liveData: LiveScore): BowlRow[] {
  const rows: BowlRow[] = [];
  for (const inn of liveData.innings) {
    const team = inn.bowlingTeam?.name || '';
    for (const c of inn.bowlingCards || []) {
      if (!c.player) continue;
      const oversNum = Number(c.overs) || 0;
      rows.push({
        playerId: c.player_id,
        name:     c.player.name,
        team,
        wickets:  c.wickets,
        runs:     c.runs,
        balls:    c.legal_balls,
        overs:    oversNum,
      });
    }
  }
  return rows;
}

/** Best batter = highest runs; tiebreak by higher strike-rate. */
function bestBatter(rows: BatRow[]): BatRow | null {
  if (!rows.length) return null;
  return [...rows].sort((a, b) => {
    if (b.runs !== a.runs) return b.runs - a.runs;
    const srA = a.balls > 0 ? a.runs / a.balls : 0;
    const srB = b.balls > 0 ? b.runs / b.balls : 0;
    return srB - srA;
  })[0];
}

/** Best bowler = most wickets; tiebreak by fewer runs, then more overs (longer spell). */
function bestBowler(rows: BowlRow[]): BowlRow | null {
  const withWickets = rows.filter(r => r.balls > 0);
  if (!withWickets.length) return null;
  return [...withWickets].sort((a, b) => {
    if (b.wickets !== a.wickets) return b.wickets - a.wickets;
    if (a.runs    !== b.runs)    return a.runs    - b.runs;
    return b.balls - a.balls;
  })[0];
}

/**
 * Player of the Match — composite score:
 *   runs scored
 * + each wicket worth 20 runs (the usual cricket-stats heuristic)
 * + sixes count 4 each, fours 1 each (small flair bonus)
 * Players who batted AND bowled get their two scores added together.
 */
function playerOfTheMatch(bats: BatRow[], bowls: BowlRow[]): { playerId: number; name: string; team: string; reason: string } | null {
  const byPlayer = new Map<number, { name: string; team: string; score: number; bat?: BatRow; bowl?: BowlRow }>();
  for (const b of bats) {
    const cur = byPlayer.get(b.playerId) || { name: b.name, team: b.team, score: 0 };
    cur.bat = b;
    cur.score += b.runs + b.fours + b.sixes * 4;
    byPlayer.set(b.playerId, cur);
  }
  for (const b of bowls) {
    const cur = byPlayer.get(b.playerId) || { name: b.name, team: b.team, score: 0 };
    cur.bowl = b;
    cur.score += b.wickets * 20;
    byPlayer.set(b.playerId, cur);
  }
  let best: { playerId: number; name: string; team: string; score: number; bat?: BatRow; bowl?: BowlRow } | null = null;
  for (const [id, v] of byPlayer.entries()) {
    if (!best || v.score > best.score) best = { playerId: id, ...v };
  }
  if (!best || best.score === 0) return null;

  // Build a short reason line so the user understands the call.
  const parts: string[] = [];
  if (best.bat && best.bat.runs > 0) {
    parts.push(`${best.bat.runs}${best.bat.isOut ? '' : '*'}(${best.bat.balls})`);
  }
  if (best.bowl && best.bowl.wickets > 0) {
    parts.push(`${best.bowl.wickets}/${best.bowl.runs}`);
  }
  return { playerId: best.playerId, name: best.name, team: best.team, reason: parts.join(' · ') };
}

function fmtBat(r: BatRow): string {
  const mark = r.isOut ? '' : '*';
  return `${r.runs}${mark} (${r.balls})`;
}
function fmtBowl(r: BowlRow): string {
  const ovs = Math.floor(r.overs) + '.' + Math.round((r.overs % 1) * 10);
  return `${r.wickets}/${r.runs} (${ovs} ov)`;
}

export function MatchAwards({ liveData }: Props) {
  const bats  = gatherBatting(liveData);
  const bowls = gatherBowling(liveData);
  const pom   = playerOfTheMatch(bats, bowls);
  const bat   = bestBatter(bats);
  const bowl  = bestBowler(bowls);

  // No real data to celebrate yet — render nothing.
  if (!pom && !bat && !bowl) return null;

  return (
    <section className="card mb-3">
      <p className="eyebrow mb-3" style={{ color: 'var(--green-text)' }}>Match Awards</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {pom && (
          <AwardCard
            icon={<Trophy />}
            label="Player of the match"
            primary={pom.name}
            secondary={`${pom.team}${pom.reason ? ' · ' + pom.reason : ''}`}
            accent
          />
        )}
        {bat && (
          <AwardCard
            icon={<Bat />}
            label="Best batting"
            primary={bat.name}
            secondary={`${bat.team} · ${fmtBat(bat)}${bat.fours || bat.sixes ? ` · ${bat.fours}×4 ${bat.sixes}×6` : ''}`}
          />
        )}
        {bowl && (
          <AwardCard
            icon={<BowlIcon />}
            label="Best bowling"
            primary={bowl.name}
            secondary={`${bowl.team} · ${fmtBowl(bowl)}`}
          />
        )}
      </div>
    </section>
  );
}

function AwardCard({ icon, label, primary, secondary, accent }: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-md border p-3 ${accent ? 'border-[var(--green)] bg-[#edf7ee]' : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className={accent ? 'text-[var(--green-text)]' : 'text-[var(--text-muted)]'}>{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">{label}</p>
      </div>
      <p className="text-[15px] font-bold leading-tight text-[var(--text-primary)]">{primary}</p>
      <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">{secondary}</p>
    </div>
  );
}
