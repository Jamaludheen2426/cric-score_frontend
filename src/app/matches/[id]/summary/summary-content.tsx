'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '@/lib/api';
import { useMatch } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { LiveScoreCard } from '@/components/LiveScoreCard';

export function SummaryContent({ matchId }: { matchId: number }) {
  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const { data: liveData, isLoading: scoreLoading } = useQuery({
    queryKey: ['summary', match?.share_token],
    queryFn: () => matchesApi.liveScore(match!.share_token),
    enabled: !!match?.share_token,
  });

  if (matchLoading || scoreLoading) return <PageLoader label="Pulling the archived card" />;
  if (!match || !liveData) return <div className="page text-ink-soft">Scorecard not found.</div>;

  const inn1 = liveData.innings.find((i: any) => i.innings_number === 1);
  const inn2 = liveData.innings.find((i: any) => i.innings_number === 2);
  let resultText = '';
  let winner = '';
  if (inn1 && inn2) {
    const runs1 = inn1.total_runs;
    const runs2 = inn2.total_runs;
    const target = inn2.target || runs1 + 1;
    if (runs2 >= target) {
      const chaseTeam = inn2.batting_team_id === match.team_a_id ? match.teamA : match.teamB;
      const chaseRosterSize = chaseTeam?.players?.length || match.players_per_side;
      const effectiveBatters = Math.min(match.players_per_side, chaseRosterSize);
      const wicketsLeft = Math.max(0, effectiveBatters - 1 - inn2.total_wickets);
      winner = inn2.battingTeam?.name || '';
      resultText = `won by ${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}`;
    } else if (runs1 > runs2) {
      winner = inn1.battingTeam?.name || '';
      resultText = `won by ${runs1 - runs2} run${runs1 - runs2 === 1 ? '' : 's'}`;
    } else if (runs1 === runs2) {
      resultText = 'Match tied';
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)] px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <Link href="/matches" className="text-[13px] font-semibold text-[var(--blue-text)]">Matches</Link>
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Final Scorecard</p>
        </div>
        <h1 className="truncate text-[16px] font-bold text-[var(--text-primary)]">{match.title}</h1>
        {winner ? (
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">{winner}</span> {resultText}</p>
        ) : resultText ? (
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{resultText}</p>
        ) : null}
      </header>

      <LiveScoreCard liveData={liveData} match={match} />
    </div>
  );
}
