'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMatch } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { LiveScore } from '@/types';
import { LiveScoreCard } from '@/components/LiveScoreCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function LiveScorePage({ matchId }: { matchId: number }) {
  const { data: match, isLoading } = useMatch(matchId);
  const [liveData, setLiveData] = useState<LiveScore | null>(null);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!match?.share_token) return;
    const url = `${API_URL.replace('/api', '')}/api/matches/events/${match.share_token}`;
    const es = new EventSource(url);
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => { try { setLiveData(JSON.parse(e.data)); } catch (_) {} };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [match?.share_token]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (isLoading) return <PageLoader label="Tuning the broadcast" />;
  if (!match) return <div className="page text-ink-soft">Match not found.</div>;

  return (
    <div className="page">
      <header className="flex flex-wrap items-end justify-between gap-6 mb-12 pb-8 border-b border-hairline">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className={`live-dot ${connected ? '' : 'opacity-30'}`} />
            <p className="eyebrow">{connected ? 'On air' : 'Reconnecting…'}</p>
            <Link href="/matches" className="text-[12px] text-ink-mute hover:text-ink">
              ← All fixtures
            </Link>
          </div>
          <h1 className="text-title mb-3">{match.title}</h1>
          <div className="flex items-baseline gap-2.5 text-[15px] text-ink-soft">
            <span className="text-ink">{match.teamA?.name}</span>
            <span className="text-ink-mute">vs</span>
            <span className="text-ink">{match.teamB?.name}</span>
          </div>
        </div>
        <button onClick={copyShareLink} className="btn-secondary btn-sm">
          {copied ? 'Copied' : 'Share this ticker'}
        </button>
      </header>

      {!liveData && <PageLoader label="Connecting" />}
      {liveData && <LiveScoreCard liveData={liveData} match={match} />}
    </div>
  );
}
