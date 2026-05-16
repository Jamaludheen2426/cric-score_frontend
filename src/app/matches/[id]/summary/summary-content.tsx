'use client';

import { useMatch } from '@/lib/queries';
import { matchesApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { PageLoader } from '@/components/PageLoader';
import { LiveScoreCard } from '@/components/LiveScoreCard';
import Link from 'next/link';

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
    <div className="page">
      <header className="mb-14 pb-10 border-b border-hairline">
        <Link href="/matches" className="text-[13px] text-ink-mute hover:text-ink mb-6 inline-block">
          ← Back to matches
        </Link>
        <p className="eyebrow mb-4">Final scorecard</p>
        <div className="grid md:grid-cols-[1fr_auto] items-end gap-6">
          <div>
            <h1 className="text-title mb-4">{match.title}</h1>
            {winner ? (
              <p className="text-[18px]">
                <span className="text-ink font-medium">{winner}</span>
                <span className="serif-italic text-ink-soft ml-2">{resultText}</span>
              </p>
            ) : resultText && (
              <p className="text-[18px] serif-italic text-ink-soft">{resultText}</p>
            )}
          </div>
          <div className="text-right">
            <p className="stat-label">Ref</p>
            <p className="font-mono text-2xl text-ink mt-1">#{String(match.id).padStart(5, '0')}</p>
          </div>
        </div>
      </header>

      <LiveScoreCard liveData={liveData} match={match} />
    </div>
  );
}
