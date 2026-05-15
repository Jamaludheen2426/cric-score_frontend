'use client';

import Link from 'next/link';
import { useMatches } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Match } from '@/types';
import { Plus, Radio, Clock, CheckCircle, ChevronRight } from 'lucide-react';

function MatchCard({ match }: { match: Match }) {
  const statusConfig = {
    live: { badge: 'badge-live', icon: <Radio size={10} />, label: 'LIVE' },
    pending: { badge: 'badge-pending', icon: <Clock size={10} />, label: 'UPCOMING' },
    completed: { badge: 'badge-completed', icon: <CheckCircle size={10} />, label: 'COMPLETED' },
  }[match.status];

  return (
    <div className="card hover:border-gray-700 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className={statusConfig.badge}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
        <span className="text-xs text-gray-600">{match.total_overs} overs</span>
      </div>
      <h3 className="font-display font-semibold text-white text-lg mb-1">{match.title}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>{match.teamA?.name}</span>
        <span className="text-gray-600">vs</span>
        <span>{match.teamB?.name}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
        {match.status === 'live' && (
          <Link href={`/matches/${match.id}/live`} className="flex-1 text-center text-sm py-1.5 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 border border-rose-600/20 transition-colors font-display">
            Live Score
          </Link>
        )}
        {match.status !== 'completed' && (
          <Link href={`/matches/${match.id}/score`} className="flex-1 text-center text-sm py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-colors font-display">
            Score
          </Link>
        )}
        {match.status === 'completed' && (
          <Link href={`/matches/${match.id}/summary`} className="flex-1 text-center text-sm py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-colors font-display">
            Scorecard
          </Link>
        )}
      </div>
    </div>
  );
}

export function MatchesContent() {
  const { data: matches, isLoading } = useMatches();

  if (isLoading) return <PageLoader label="Loading matches..." />;

  const live = matches?.filter((m: Match) => m.status === 'live') || [];
  const pending = matches?.filter((m: Match) => m.status === 'pending') || [];
  const completed = matches?.filter((m: Match) => m.status === 'completed') || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Matches</h1>
          <p className="text-gray-500 text-sm mt-0.5">{matches?.length || 0} total</p>
        </div>
        <Link href="/matches/create" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Match
        </Link>
      </div>

      {!matches?.length && (
        <div className="card text-center py-16">
          <p className="text-gray-500 font-display">No matches yet</p>
          <Link href="/matches/create" className="btn-primary mt-4 inline-flex">Create first match</Link>
        </div>
      )}

      {live.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">🔴 Live Now</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map((m: Match) => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">⏳ Upcoming</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map((m: Match) => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">✅ Completed</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((m: Match) => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
