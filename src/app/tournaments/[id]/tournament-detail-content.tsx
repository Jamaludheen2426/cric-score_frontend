'use client';

import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { PageLoader } from '@/components/PageLoader';
import { useGenerateFixtures, useTournament } from '@/lib/queries';
import { BattingCard, BowlingCard, Match, Team } from '@/types';

function matchHref(match: Match) {
  if (match.status === 'completed') return `/matches/${match.id}/summary`;
  if (match.status === 'live') return `/matches/${match.id}/live`;
  return `/matches/${match.id}/score`;
}

function oversToBalls(overs: number) {
  const full = Math.floor(Number(overs) || 0);
  const partial = Math.round(((Number(overs) || 0) - full) * 10);
  return full * 6 + partial;
}

function completedInnings(match: Match) {
  return [...(match.innings || [])].sort((a, b) => a.innings_number - b.innings_number);
}

function buildTable(teams: Team[], matches: Match[]) {
  const rows = new Map<number, any>();
  teams.forEach(team => rows.set(team.id, { team, p: 0, w: 0, l: 0, t: 0, pts: 0, rf: 0, bf: 0, ra: 0, ba: 0 }));

  matches.filter(match => match.status === 'completed').forEach(match => {
    const innings = completedInnings(match);
    if (innings.length < 2) return;
    const [first, second] = innings;
    const firstRow = rows.get(first.batting_team_id);
    const secondRow = rows.get(second.batting_team_id);
    if (!firstRow || !secondRow) return;

    firstRow.p += 1;
    secondRow.p += 1;
    firstRow.rf += first.total_runs;
    firstRow.bf += oversToBalls(first.total_overs_bowled);
    firstRow.ra += second.total_runs;
    firstRow.ba += oversToBalls(second.total_overs_bowled);
    secondRow.rf += second.total_runs;
    secondRow.bf += oversToBalls(second.total_overs_bowled);
    secondRow.ra += first.total_runs;
    secondRow.ba += oversToBalls(first.total_overs_bowled);

    if (first.total_runs > second.total_runs) {
      firstRow.w += 1; firstRow.pts += 2; secondRow.l += 1;
    } else if (second.total_runs > first.total_runs) {
      secondRow.w += 1; secondRow.pts += 2; firstRow.l += 1;
    } else {
      firstRow.t += 1; secondRow.t += 1; firstRow.pts += 1; secondRow.pts += 1;
    }
  });

  return Array.from(rows.values())
    .map(row => ({ ...row, nrr: row.bf && row.ba ? (row.rf / row.bf) * 6 - (row.ra / row.ba) * 6 : 0 }))
    .sort((a, b) => b.pts - a.pts || b.nrr - a.nrr || b.w - a.w);
}

function buildLeaders(matches: Match[]) {
  const batters = new Map<number, any>();
  const bowlers = new Map<number, any>();

  matches.forEach(match => completedInnings(match).forEach(innings => {
    (innings.battingCards || []).forEach((card: BattingCard) => {
      const row = batters.get(card.player_id) || { player: card.player, runs: 0, balls: 0, fours: 0, sixes: 0 };
      row.runs += card.runs;
      row.balls += card.balls;
      row.fours += card.fours;
      row.sixes += card.sixes;
      batters.set(card.player_id, row);
    });
    (innings.bowlingCards || []).forEach((card: BowlingCard) => {
      const row = bowlers.get(card.player_id) || { player: card.player, wickets: 0, runs: 0, balls: 0 };
      row.wickets += card.wickets;
      row.runs += card.runs;
      row.balls += card.legal_balls;
      bowlers.set(card.player_id, row);
    });
  }));

  const topBatters = Array.from(batters.values()).sort((a, b) => b.runs - a.runs || b.sixes - a.sixes).slice(0, 5);
  const topBowlers = Array.from(bowlers.values()).sort((a, b) => b.wickets - a.wickets || (a.runs / Math.max(1, a.balls)) - (b.runs / Math.max(1, b.balls))).slice(0, 5);
  const mvps = [
    ...topBatters.map(row => ({ name: row.player?.name, score: row.runs + row.sixes * 3 + row.fours * 2, detail: `${row.runs} runs` })),
    ...topBowlers.map(row => ({ name: row.player?.name, score: row.wickets * 25 + Math.max(0, 60 - row.runs), detail: `${row.wickets} wickets` })),
  ].sort((a, b) => b.score - a.score).slice(0, 5);

  return { topBatters, topBowlers, mvps };
}

export function TournamentDetailContent({ tournamentId }: { tournamentId: number }) {
  const { data: tournament, isLoading } = useTournament(tournamentId);
  const generateFixtures = useGenerateFixtures();

  if (isLoading) return <PageLoader label="Loading tournament" />;
  if (!tournament) return <div className="page text-ink-soft">Tournament not found.</div>;

  const matches = [...(tournament.matches || [])].sort((a: Match, b: Match) => a.id - b.id);
  const table = buildTable(tournament.teams || [], matches);
  const leaders = buildLeaders(matches);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-20">
      <div className="page">
        <header className="mb-3 border-b border-[var(--border)] pb-3">
          <Link href="/tournaments" className="text-[13px] font-semibold text-[var(--blue-text)]">Tournaments</Link>
          <h1 className="mt-2 text-[20px] font-bold text-[var(--text-primary)]">{tournament.name}</h1>
          <p className="text-[13px] text-[var(--text-secondary)]">{tournament.teams?.length || 0} teams · {tournament.total_overs} overs · PIN {tournament.scorer_pin}</p>
        </header>

        <section className="mb-3 grid grid-cols-3 gap-2">
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3"><p className="eyebrow mb-1">Upcoming</p><p className="text-[20px] font-bold">{matches.filter((m: Match) => m.status === 'pending').length}</p></div>
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3"><p className="eyebrow mb-1">Live</p><p className="text-[20px] font-bold">{matches.filter((m: Match) => m.status === 'live').length}</p></div>
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3"><p className="eyebrow mb-1">Done</p><p className="text-[20px] font-bold">{matches.filter((m: Match) => m.status === 'completed').length}</p></div>
        </section>

        <section className="mb-3 border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <h2 className="border-b border-[var(--border-subtle)] px-3 py-2 text-[16px] font-bold text-[var(--text-primary)]">Points table</h2>
          <div className="grid grid-cols-[34px_1fr_34px_34px_34px_52px_58px] gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
            {['#', 'Team', 'P', 'W', 'L', 'Pts', 'NRR'].map(label => <span key={label} className="table-head text-right first:text-left">{label}</span>)}
          </div>
          {table.map((row, index) => (
            <div key={row.team.id} className="grid grid-cols-[34px_1fr_34px_34px_34px_52px_58px] gap-2 border-b border-[var(--border-subtle)] px-3 py-2 last:border-b-0">
              <span className="text-[13px] font-bold text-[var(--text-secondary)]">{index + 1}</span>
              <span className="truncate text-[13px] font-bold text-[var(--text-primary)]">{row.team.name}</span>
              <span className="text-right text-[13px]">{row.p}</span>
              <span className="text-right text-[13px]">{row.w}</span>
              <span className="text-right text-[13px]">{row.l}</span>
              <span className="text-right text-[13px] font-bold">{row.pts}</span>
              <span className="text-right text-[13px]">{row.nrr.toFixed(2)}</span>
            </div>
          ))}
        </section>

        <section className="mb-3 grid gap-2 md:grid-cols-3">
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
            <h2 className="mb-2 text-[15px] font-bold">Most runs</h2>
            {leaders.topBatters.map((row, index) => (
              <div key={`${row.player?.id}-${index}`} className="flex justify-between border-b border-[var(--border-subtle)] py-1.5 text-[13px] last:border-b-0">
                <span className="truncate font-semibold">{row.player?.name}</span>
                <span className="tabular-nums">{row.runs}</span>
              </div>
            ))}
          </div>
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
            <h2 className="mb-2 text-[15px] font-bold">Most wickets</h2>
            {leaders.topBowlers.map((row, index) => (
              <div key={`${row.player?.id}-${index}`} className="flex justify-between border-b border-[var(--border-subtle)] py-1.5 text-[13px] last:border-b-0">
                <span className="truncate font-semibold">{row.player?.name}</span>
                <span className="tabular-nums">{row.wickets}</span>
              </div>
            ))}
          </div>
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
            <h2 className="mb-2 text-[15px] font-bold">MVP list</h2>
            {leaders.mvps.map((row, index) => (
              <div key={`${row.name}-${index}`} className="flex justify-between gap-2 border-b border-[var(--border-subtle)] py-1.5 text-[13px] last:border-b-0">
                <span className="truncate font-semibold">{row.name}</span>
                <span className="shrink-0 text-[var(--text-secondary)]">{row.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[var(--text-primary)]">Fixtures</h2>
            {matches.length === 0 && (
              <button onClick={() => generateFixtures.mutate(tournament.id)} disabled={generateFixtures.isPending} className="btn btn-primary btn-sm">
                Generate
              </button>
            )}
          </div>
          {matches.length ? matches.map((match: Match) => (
            <Link key={match.id} href={matchHref(match)} className="block border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
              <div className="flex items-center gap-3">
                <CalendarDays size={17} className="text-[var(--text-secondary)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-[var(--text-primary)]">{match.teamA?.name} vs {match.teamB?.name}</p>
                  <p className="text-[12px] capitalize text-[var(--text-secondary)]">{match.status} · {match.total_overs} overs</p>
                </div>
                {match.status !== 'completed' && <span className="btn btn-secondary btn-sm">Score</span>}
              </div>
            </Link>
          )) : (
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 text-center text-[13px] text-[var(--text-secondary)]">
              No fixtures yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
