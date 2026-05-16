'use client';

import Link from 'next/link';
import { useMatches } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Match } from '@/types';

function MatchRow({ match, idx }: { match: Match; idx: number }) {
  const isLive      = match.status === 'live';
  const isPending   = match.status === 'pending';
  const isCompleted = match.status === 'completed';

  const targetHref =
    isLive      ? `/matches/${match.id}/live` :
    isCompleted ? `/matches/${match.id}/summary` :
                  `/matches/${match.id}/score`;

  return (
    <article
      className="group rise"
      style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
    >
      <Link
        href={targetHref}
        className="block py-7 border-t border-hairline last:border-b hover:bg-surface-soft/40 transition-colors -mx-4 px-4 rounded-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-mono text-ink-mute">#{String(match.id).padStart(3, '0')}</span>
              {isLive      && <span className="badge-live"><span className="live-dot" /> Live</span>}
              {isPending   && <span className="badge-pending">Upcoming</span>}
              {isCompleted && <span className="badge-completed">Completed</span>}
            </div>

            <h3 className="text-h2 mb-2 group-hover:text-accent transition-colors">
              {match.title}
            </h3>

            <div className="flex items-baseline gap-2.5 text-[15px] text-ink-soft">
              <span className="text-ink">{match.teamA?.name || 'Team A'}</span>
              <span className="serif-italic text-ink-mute">vs</span>
              <span className="text-ink">{match.teamB?.name || 'Team B'}</span>
            </div>
          </div>

          <div className="flex gap-10 md:gap-12">
            <div className="stat">
              <span className="stat-label">Overs</span>
              <span className="stat-value">{match.total_overs}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Per side</span>
              <span className="stat-value">{match.players_per_side}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[14px] font-medium text-ink-soft group-hover:text-accent transition-colors">
              {isLive ? 'Watch live' : isPending ? 'Open desk' : 'View card'}
            </span>
            <span className="text-ink-mute group-hover:text-accent group-hover:translate-x-0.5 transition-all">→</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section className="mb-16 last:mb-0">
      <header className="flex items-baseline justify-between mb-2">
        <h2 className="text-h3">{title}</h2>
        <span className="text-[13px] text-ink-mute">{count}</span>
      </header>
      <div>{children}</div>
    </section>
  );
}

export function MatchesContent() {
  const { data: matches, isLoading } = useMatches();

  if (isLoading) return <PageLoader label="Loading matches" />;

  const live      = (matches || []).filter((m: Match) => m.status === 'live');
  const pending   = (matches || []).filter((m: Match) => m.status === 'pending');
  const completed = (matches || []).filter((m: Match) => m.status === 'completed');

  return (
    <div className="page">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-16">
        <div>
          <p className="eyebrow mb-4">Matches</p>
          <h1 className="text-title">
            All your <span className="serif-italic font-normal text-ink-soft">fixtures.</span>
          </h1>
        </div>
        <Link href="/matches/create" className="btn-primary">
          New match
        </Link>
      </header>

      {!matches?.length && (
        <div className="card text-center py-20">
          <p className="text-h3 mb-3">No matches yet.</p>
          <p className="text-ink-soft mb-8 max-w-md mx-auto">
            Set up your first fixture in a minute — pick the teams, set the overs, share the public link.
          </p>
          <Link href="/matches/create" className="btn-primary btn-lg">
            Start your first match
          </Link>
        </div>
      )}

      <Section title="Live now"    count={live.length}>     {live.map((m: Match, i: number) => <MatchRow key={m.id} match={m} idx={i} />)}</Section>
      <Section title="Upcoming"    count={pending.length}>  {pending.map((m: Match, i: number) => <MatchRow key={m.id} match={m} idx={i} />)}</Section>
      <Section title="Completed"   count={completed.length}>{completed.map((m: Match, i: number) => <MatchRow key={m.id} match={m} idx={i} />)}</Section>
    </div>
  );
}
