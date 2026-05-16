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
    es.onmessage = (e) => {
      try { setLiveData(JSON.parse(e.data)); } catch (_) {}
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [match?.share_token]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (isLoading) return <PageLoader label="Tuning the broadcast" />;
  if (!match) return <div className="page text-ink-muted">No match on file.</div>;

  return (
    <div className="page max-w-[1280px]">
      {/* Masthead */}
      <header className="grid lg:grid-cols-[1fr_auto] gap-4 items-end mb-8 pb-6 border-b-2 border-ink">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`live-dot ${connected ? '' : 'opacity-30'}`} />
            <span className="overline">{connected ? 'on air' : 'reconnecting…'}</span>
            <Link href="/matches" className="font-mono text-[10px] text-ink-dim uppercase tracking-widest hover:text-saffron-500">
              ← all fixtures
            </Link>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,72px)] uppercase leading-[0.9] text-ink">
            {match.title}
          </h1>
          <div className="mt-2 flex items-baseline gap-3 text-ink-muted">
            <span className="text-ink font-body">{match.teamA?.name}</span>
            <span className="font-editorial italic text-ochre-500">vs</span>
            <span className="text-ink font-body">{match.teamB?.name}</span>
          </div>
        </div>
        <button onClick={copyShareLink} className="btn-ghost btn-sm">
          {copied ? '✓ Copied' : 'Share this ticker'}
        </button>
      </header>

      {!liveData && <PageLoader label="Connecting to the wire" />}
      {liveData && <LiveScoreCard liveData={liveData} match={match} />}
    </div>
  );
}
