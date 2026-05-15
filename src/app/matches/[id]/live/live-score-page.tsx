'use client';

import { useEffect, useState } from 'react';
import { useMatch } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { LiveScore } from '@/types';
import { LiveScoreCard } from '@/components/LiveScoreCard';
import { Radio, Share2 } from 'lucide-react';

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
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <PageLoader label="Loading live score..." />;
  if (!match) return <div className="text-gray-500">Match not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-pitch-500 animate-pulse' : 'bg-gray-600'}`} />
          <h1 className="font-display font-bold text-white">{match.title}</h1>
          {match.status === 'live' && <span className="badge-live"><Radio size={10} />LIVE</span>}
        </div>
        <button onClick={copyShareLink} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
          <Share2 size={12} />
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {!liveData && <PageLoader label="Connecting to live feed..." />}
      {liveData && <LiveScoreCard liveData={liveData} match={match} />}
    </div>
  );
}
