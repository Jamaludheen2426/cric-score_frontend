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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (isLoading) return <PageLoader label="Loading" />;
  if (!match) return <div className="page text-[var(--text-secondary)]">Match not found.</div>;

  return (
    <div className="app-shell">
      <header className="sticky top-12 z-30 flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <Link href="/matches" className="text-[13px] font-semibold text-[var(--blue-text)]">Back</Link>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[14px] font-bold uppercase">{match.title}</h1>
          <p className="text-[11px] text-[var(--text-secondary)]">
            <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${connected ? 'bg-[var(--green-bright)]' : 'bg-[var(--text-muted)]'}`} />
            {connected ? 'Live' : 'Connecting'}
          </p>
        </div>
        <button onClick={copyLink} className="btn btn-secondary btn-sm">{copied ? 'Copied' : 'Share'}</button>
      </header>

      <div className="page">
        {!liveData && <PageLoader label="Connecting" />}
        {liveData && <LiveScoreCard liveData={liveData} match={match} />}
      </div>
    </div>
  );
}
