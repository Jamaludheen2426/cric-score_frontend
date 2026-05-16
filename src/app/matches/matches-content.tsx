'use client';

import Link from 'next/link';
import { useMatches } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Match } from '@/types';

function MatchRow({ match, idx }: { match: Match; idx: number }) {
  const isLive = match.status === 'live';
  const isPending = match.status === 'pending';

  const accent = isLive ? '' : isPending ? 'gold' : 'muted';
  const targetHref =
    match.status === 'live'      ? `/matches/${match.id}/live` :
    match.status === 'completed' ? `/matches/${match.id}/summary` :
                                   `/matches/${match.id}/score`;

  return (
    <article
      className={`slab-accent ${accent} group hover:translate-x-1 transition-transform duration-200 reveal`}
      style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* LEFT — fixture identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] text-ink-dim uppercase tracking-widest">
              file {String(match.id).padStart(3, '0')}
            </span>
            <span className={isLive ? 'badge-live' : isPending ? 'badge-pending' : 'badge-completed'}>
              {isLive && <span className="live-dot mr-1" />}
              {match.status}
            </span>
          </div>

          <h3 className="font-display text-3xl md:text-4xl uppercase text-ink leading-none mb-2">
            {match.title}
          </h3>

          <div className="flex items-baseline gap-3 font-body text-ink-muted text-[15px]">
            <span className="text-ink">{match.teamA?.name || 'Team A'}</span>
            <span className="font-editorial italic text-ochre-500 text-[13px]">vs</span>
            <span className="text-ink">{match.teamB?.name || 'Team B'}</span>
          </div>
        </div>

        {/* MIDDLE — stat strip */}
        <div className="flex gap-8 md:border-l md:border-canvas-ridge md:pl-8">
          <div className="stat">
            <span className="stat-label">Overs</span>
            <span className="stat-value">{match.total_overs}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Squad</span>
            <span className="stat-value">{match.players_per_side}</span>
          </div>
        </div>

        {/* RIGHT — action */}
        <div className="flex items-center gap-2 md:border-l md:border-canvas-ridge md:pl-8">
          <Link href={targetHref} className="btn-ghost btn-sm group-hover:border-saffron-500 group-hover:text-saffron-500">
            {isLive ? 'Watch live' : isPending ? 'Open desk' : 'View card'} →
          </Link>
          {!isPending && match.status !== 'completed' && (
            <Link href={`/matches/${match.id}/score`} className="btn-primary btn-sm">
              Score
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-canvas-ridge">
        <h2 className="chyron font-display text-xl uppercase tracking-widest2 text-ink">
          {title}
        </h2>
        <span className="font-mono text-[11px] text-ink-dim uppercase tracking-widest">{count} on file</span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function MatchesContent() {
  const { data: matches, isLoading } = useMatches();

  if (isLoading) return <PageLoader label="Pulling the fixtures" />;

  const live = (matches || []).filter((m: Match) => m.status === 'live');
  const pending = (matches || []).filter((m: Match) => m.status === 'pending');
  const completed = (matches || []).filter((m: Match) => m.status === 'completed');

  return (
    <div className="page">
      {/* Masthead */}
      <header className="grid lg:grid-cols-12 items-end gap-6 mb-12 pb-8 border-b-2 border-ink">
        <div className="lg:col-span-8">
          <div className="overline mb-3">section ii — the fixtures desk</div>
          <h1 className="font-display text-[clamp(54px,8vw,108px)] uppercase leading-[0.85] text-ink">
            Match&nbsp;
            <span className="font-editorial italic font-normal text-ochre-500">card</span>
          </h1>
        </div>
        <div className="lg:col-span-4 flex items-end justify-between lg:justify-end gap-6">
          <div className="stat text-right">
            <span className="stat-label">on file</span>
            <span className="stat-value">{matches?.length || 0}</span>
          </div>
          <Link href="/matches/create" className="btn-primary">+ Open match</Link>
        </div>
      </header>

      {!matches?.length && (
        <div className="slab text-center py-20">
          <div className="overline mb-4">empty press box</div>
          <p className="font-display text-3xl uppercase text-ink mb-2">No matches on the wire.</p>
          <p className="text-ink-muted mb-8">Start a fresh fixture and the scoring desk goes live.</p>
          <Link href="/matches/create" className="btn-primary btn-lg">Open the first card →</Link>
        </div>
      )}

      <Section title="Now on the field" count={live.length}>
        {live.map((m: Match, i: number) => <MatchRow key={m.id} match={m} idx={i} />)}
      </Section>

      <Section title="In the diary" count={pending.length}>
        {pending.map((m: Match, i: number) => <MatchRow key={m.id} match={m} idx={i} />)}
      </Section>

      <Section title="Filed &amp; archived" count={completed.length}>
        {completed.map((m: Match, i: number) => <MatchRow key={m.id} match={m} idx={i} />)}
      </Section>
    </div>
  );
}
