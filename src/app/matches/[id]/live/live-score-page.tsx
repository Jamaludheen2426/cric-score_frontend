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
    <div className="min-h-screen bg-[var(--bg-app)]">
      <header className="flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`live-dot ${connected ? '' : 'opacity-30'}`} />
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--green-text)]">{connected ? 'Live' : 'Reconnecting'}</p>
          </div>
          <p className="truncate text-[13px] font-semibold text-[var(--text-secondary)]">{match.teamA?.name} vs {match.teamB?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/matches" className="btn btn-secondary h-8 px-3">Matches</Link>
          {match.status !== 'completed' && (
            <Link href={`/matches/${match.id}/score`} className="btn btn-primary h-8 px-3">Scorer</Link>
          )}
          <button onClick={copyShareLink} className="btn btn-secondary h-8 px-3">
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
      </header>

      {!liveData && <PageLoader label="Connecting" />}
      {liveData && <LiveScoreCard liveData={liveData} match={match} />}
    </div>
  );
}
