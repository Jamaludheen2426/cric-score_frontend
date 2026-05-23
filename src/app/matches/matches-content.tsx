'use client';

import Link from 'next/link';
import { useMatches } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Match } from '@/types';

function MatchRow({ match }: { match: Match }) {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  // Primary destination: the scoring desk for live & pending (PIN-gated for
  // anyone who isn't the scorer), or the archived scorecard for completed.
  const primaryHref = isCompleted ? `/matches/${match.id}/summary` : `/matches/${match.id}/score`;

  return (
    <div className="relative flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 last:border-b-0 hover:bg-[var(--bg-elevated)]">
      <Link href={primaryHref} className="absolute inset-0" aria-label={`Open ${match.title}`} />
      <div className="relative z-[1] min-w-0 flex-1 pointer-events-none">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] text-[var(--text-muted)]">#{String(match.id).padStart(3, '0')}</span>
          {isLive                       && <span className="badge-live"><span className="live-dot" /> Live</span>}
          {match.status === 'pending'   && <span className="badge-pending">Upcoming</span>}
          {isCompleted                  && <span className="badge-completed">Completed</span>}
        </div>
        <p className="truncate text-[14px] font-bold text-[var(--text-primary)]">{match.title}</p>
        <p className="truncate text-[12px] text-[var(--text-secondary)]">
          {match.teamA?.name || 'Team A'} <span className="text-[var(--text-muted)]">vs</span> {match.teamB?.name || 'Team B'}
        </p>
      </div>
      <div className="relative z-[1] shrink-0 text-right pointer-events-none">
        <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Overs</p>
        <p className="text-[16px] font-bold tabular-nums text-[var(--text-primary)]">{match.total_overs}</p>
      </div>
      {isLive && (
        <Link
          href={`/matches/${match.id}/live`}
          onClick={e => e.stopPropagation()}
          className="relative z-[2] inline-flex h-7 items-center gap-1 rounded border border-[var(--border)] bg-[var(--bg-card)] px-2 text-[11px] font-bold uppercase tracking-wide text-[var(--green-text)] hover:bg-[var(--bg-elevated)]"
          aria-label="Open public live scorecard"
        >
          Watch
        </Link>
      )}
      <span className="relative z-[1] text-[var(--text-muted)] pointer-events-none">›</span>
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: Match[] }) {
  if (!rows.length) return null;
  return (
    <section className="mb-3">
      <h2 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
        {title} <span className="text-[var(--text-secondary)]">· {rows.length}</span>
      </h2>
      <div className="overflow-hidden rounded border border-[var(--border-subtle)]">
        {rows.map(m => <MatchRow key={m.id} match={m} />)}
      </div>
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
      {!matches?.length && (
        <div className="card text-center">
          <p className="text-[14px] font-bold text-[var(--text-primary)]">No matches yet.</p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Start your first fixture to open the scoring desk.</p>
          <Link href="/matches/create" className="btn btn-primary mt-4 inline-flex">Create match</Link>
        </div>
      )}

      <Section title="Live now" rows={live} />
      <Section title="Upcoming" rows={pending} />
      <Section title="Completed" rows={completed} />
    </div>
  );
}
