'use client';

import { useMatch } from '@/lib/queries';
import { matchesApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { PageLoader } from '@/components/PageLoader';
import { LiveScoreCard } from '@/components/LiveScoreCard';
import { getScoreDisplay } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function SummaryContent({ matchId }: { matchId: number }) {
  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const { data: liveData, isLoading: scoreLoading } = useQuery({
    queryKey: ['summary', match?.share_token],
    queryFn: () => matchesApi.liveScore(match!.share_token),
    enabled: !!match?.share_token,
  });

  if (matchLoading || scoreLoading) return <PageLoader label="Loading scorecard..." />;
  if (!match || !liveData) return <div className="text-gray-500">Scorecard not found</div>;

  // Determine result
  const inn1 = liveData.innings.find((i: any) => i.innings_number === 1);
  const inn2 = liveData.innings.find((i: any) => i.innings_number === 2);
  let resultText = '';
  if (inn1 && inn2) {
    const runs1 = inn1.total_runs;
    const runs2 = inn2.total_runs;
    const target = inn2.target || runs1 + 1;
    if (runs2 >= target) {
      const wicketsLeft = match.players_per_side - 1 - inn2.total_wickets;
      resultText = `${inn2.battingTeam?.name} won by ${wicketsLeft} wickets`;
    } else if (runs1 > runs2) {
      resultText = `${inn1.battingTeam?.name} won by ${runs1 - runs2} runs`;
    } else if (runs1 === runs2) {
      resultText = 'Match tied';
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Link href="/matches" className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-white">{match.title}</h1>
          {resultText && (
            <p className="text-pitch-400 font-display text-sm mt-0.5">{resultText}</p>
          )}
        </div>
      </div>
      <LiveScoreCard liveData={liveData} match={match} />
    </div>
  );
}
