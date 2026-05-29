'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Monitor, SlidersHorizontal } from 'lucide-react';
import { useMatch } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { LiveScoreCard } from '@/components/LiveScoreCard';
import { LiveScore } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function LiveModePage({ matchId, mode }: { matchId: number; mode: 'tv' | 'operator' }) {
  const { data: match, isLoading } = useMatch(matchId);
  const [liveData, setLiveData] = useState<LiveScore | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!match?.share_token) return;
    const url = `${API_URL.replace('/api', '')}/api/matches/events/${match.share_token}`;
    const es = new EventSource(url);
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => { try { setLiveData(JSON.parse(e.data)); } catch (_) {} };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [match?.share_token]);

  if (isLoading) return <PageLoader label="Loading" />;
  if (!match) return <div className="page text-[var(--text-secondary)]">Match not found.</div>;

  const Icon = mode === 'tv' ? Monitor : SlidersHorizontal;

  return (
    <div className={mode === 'tv' ? 'tv-shell' : 'app-shell'}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={18} className="text-[var(--green-text)]" />
          <div className="min-w-0">
            <h1 className="truncate text-[14px] font-bold uppercase">{match.title}</h1>
            <p className="text-[11px] text-[var(--text-secondary)]">
              <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${connected ? 'bg-[var(--green-bright)]' : 'bg-[var(--text-muted)]'}`} />
              {mode === 'tv' ? 'Large TV mode' : 'Scoreboard operator mode'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Link href={`/matches/${matchId}/live`} className="btn btn-secondary btn-sm">Live</Link>
          <Link href={`/matches/${matchId}/score`} className="btn btn-secondary btn-sm">Desk</Link>
        </div>
      </header>
      <main className={mode === 'tv' ? 'mx-auto max-w-[1280px] px-5 py-4 tv-score' : 'page'}>
        {!liveData && <PageLoader label="Connecting" />}
        {liveData && <LiveScoreCard liveData={liveData} match={match} />}
      </main>
    </div>
  );
}
