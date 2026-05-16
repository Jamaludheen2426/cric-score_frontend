'use client';

import Link from 'next/link';
import { useTeams, useDeleteTeam } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Team } from '@/types';
import { Trash2 } from 'lucide-react';

export function TeamsContent() {
  const { data: teams, isLoading } = useTeams();
  const deleteTeam = useDeleteTeam();

  if (isLoading) return <PageLoader label="Loading teams" />;

  return (
    <div className="page">
      <header className="flex flex-wrap items-end justify-between gap-6 mb-16">
        <div>
          <p className="eyebrow mb-4">Teams</p>
          <h1 className="text-title">
            Your <span className="serif-italic font-normal text-ink-soft">squads.</span>
          </h1>
        </div>
        <Link href="/teams/create" className="btn-primary">
          New team
        </Link>
      </header>

      {!teams?.length ? (
        <div className="card text-center py-20">
          <p className="text-h3 mb-3">No teams yet.</p>
          <p className="text-ink-soft mb-8 max-w-md mx-auto">
            Register a side and add the players. Teams can be used in any match.
          </p>
          <Link href="/teams/create" className="btn-primary btn-lg">
            Register a team
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team: Team, i: number) => (
            <article
              key={team.id}
              className="card group relative overflow-hidden hover:shadow-lift hover:border-hairline-strong transition-all rise"
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
            >
              <button
                onClick={() => confirm('Delete this team?') && deleteTeam.mutate(team.id)}
                className="absolute top-5 right-5 p-2 rounded-md text-ink-mute hover:text-wicket hover:bg-wicket-soft opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Delete team"
              >
                <Trash2 size={14} />
              </button>

              <p className="eyebrow mb-4">Squad · {String(team.id).padStart(2, '0')}</p>

              <Link href={`/teams/${team.id}`} className="block">
                <h3 className="text-h2 mb-6 group-hover:text-accent transition-colors break-words">
                  {team.name}
                </h3>
              </Link>

              <div className="flex items-baseline gap-3 pb-6 border-b border-hairline">
                <span className="num-xl text-ink">{team.players?.length || 0}</span>
                <span className="text-[14px] text-ink-soft">
                  {(team.players?.length || 0) === 1 ? 'player' : 'players'}
                </span>
              </div>

              <Link
                href={`/teams/${team.id}`}
                className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-ink-soft hover:text-accent transition-colors"
              >
                Manage roster
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
