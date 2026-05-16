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
  if (!match || !liveData) return <div className="page text-ink-muted">Scorecard not in the file.</div>;

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
      winner = '';
      resultText = 'match tied';
    }
  }

  return (
    <div className="page max-w-[1280px]">
      <header className="mb-10 pb-8 border-b-2 border-ink">
        <Link href="/matches" className="overline hover:text-saffron-500 inline-block mb-3">
          ← back to fixtures
        </Link>
        <div className="grid md:grid-cols-[1fr_auto] items-end gap-6">
          <div>
            <div className="eyebrow mb-2">filed scorecard · the morning paper</div>
            <h1 className="font-display text-[clamp(44px,6vw,96px)] uppercase leading-[0.85] text-ink">
              {match.title}
            </h1>
            {winner ? (
              <div className="mt-4 chyron flex items-baseline gap-2">
                <span className="font-display text-2xl uppercase text-saffron-500">{winner}</span>
                <span className="font-editorial italic text-[14px] text-ink-muted">{resultText}</span>
              </div>
            ) : resultText && (
              <div className="mt-4 chyron">
                <span className="font-display text-2xl uppercase text-ochre-500">{resultText}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="eyebrow">archive ref</div>
            <div className="font-mono text-2xl text-ink mt-1">#{String(match.id).padStart(5, '0')}</div>
          </div>
        </div>
      </header>

      <LiveScoreCard liveData={liveData} match={match} />
    </div>
  );
}
