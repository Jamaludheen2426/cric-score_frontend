'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useMatch } from '@/lib/queries';
import { matchesApi } from '@/lib/api';
import { PageLoader } from '@/components/PageLoader';
import { LiveScoreCard } from '@/components/LiveScoreCard';
import { MatchAwards } from '@/components/MatchAwards';

export function SummaryContent({ matchId }: { matchId: number }) {
  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const { data: liveData, isLoading: scoreLoading } = useQuery({
    queryKey: ['summary', match?.share_token],
    queryFn: () => matchesApi.liveScore(match!.share_token),
    enabled: !!match?.share_token,
  });

  if (matchLoading || scoreLoading) return <PageLoader label="Loading scorecard" />;
  if (!match || !liveData) return <div className="page text-[var(--text-secondary)]">Scorecard not found.</div>;

  const inn1 = liveData.innings.find((i: any) => i.innings_number === 1);
  const inn2 = liveData.innings.find((i: any) => i.innings_number === 2);
  let winner = '';
  let resultText = '';
  if (inn1 && inn2) {
    const runs1 = inn1.total_runs;
    const runs2 = inn2.total_runs;
    const target = inn2.target || runs1 + 1;
    if (runs2 >= target) {
      const wicketsLeft = match.players_per_side - 1 - inn2.total_wickets;
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
    <div className="app-shell">
      <header className="sticky top-12 z-30 flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <Link href="/matches" className="text-[13px] font-semibold text-[var(--blue-text)]">Back</Link>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[14px] font-bold uppercase">{match.title}</h1>
          <p className="text-[11px] text-[var(--text-secondary)]">Match #{String(match.id).padStart(3, '0')}</p>
        </div>
        <span className="w-12" />
      </header>

      <div className="page">
        {resultText && (
          <section className="card mb-3 text-center">
            <p className="eyebrow mb-1.5" style={{ color: 'var(--green-text)' }}>Result</p>
            {winner ? (
              <p className="text-[16px] font-bold">
                {winner} <span className="text-[var(--text-secondary)] font-normal">{resultText}</span>
              </p>
            ) : (
              <p className="text-[16px] font-bold">{resultText}</p>
            )}
          </section>
        )}
        <MatchAwards liveData={liveData} />
        <LiveScoreCard liveData={liveData} match={match} />
      </div>
    </div>
  );
}
