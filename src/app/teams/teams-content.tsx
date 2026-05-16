'use client';

import Link from 'next/link';
import { useTeams, useDeleteTeam } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Team } from '@/types';
import { Trash2 } from 'lucide-react';

export function TeamsContent() {
  const { data: teams, isLoading } = useTeams();
  const deleteTeam = useDeleteTeam();

  if (isLoading) return <PageLoader label="Calling the rosters" />;

  return (
    <div className="page">
      {/* Masthead */}
      <header className="grid lg:grid-cols-12 items-end gap-6 mb-12 pb-8 border-b-2 border-ink">
        <div className="lg:col-span-8">
          <div className="overline mb-3">section iii — the dressing room</div>
          <h1 className="font-display text-[clamp(54px,8vw,108px)] uppercase leading-[0.85] text-ink">
            Team&nbsp;
            <span className="font-editorial italic font-normal text-ochre-500">sheet</span>
          </h1>
        </div>
        <div className="lg:col-span-4 flex items-end justify-between lg:justify-end gap-6">
          <div className="stat text-right">
            <span className="stat-label">registered</span>
            <span className="stat-value">{teams?.length || 0}</span>
          </div>
          <Link href="/teams/create" className="btn-primary">+ New side</Link>
        </div>
      </header>

      {!teams?.length ? (
        <div className="slab text-center py-20">
          <div className="overline mb-4">no rosters on file</div>
          <p className="font-display text-3xl uppercase text-ink mb-2">The dressing room is empty.</p>
          <p className="text-ink-muted mb-8">Register the first side to assemble a squad.</p>
          <Link href="/teams/create" className="btn-primary btn-lg">Register a team →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-canvas-ridge">
          {teams.map((team: Team, i: number) => (
            <article
              key={team.id}
              className="bg-canvas-raised p-7 flex flex-col justify-between group relative overflow-hidden hover:bg-canvas-ridge/30 transition-colors reveal"
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
            >
              <button
                onClick={() => confirm('Strike this side from the register?') && deleteTeam.mutate(team.id)}
                className="absolute top-4 right-4 p-2 text-ink-dim hover:text-wicket-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete team"
              >
                <Trash2 size={14} />
              </button>

              <div>
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-mono text-[10px] text-ink-dim uppercase tracking-widest">
                    side·{String(team.id).padStart(2, '0')}
                  </span>
                  <span className="overline">registered</span>
                </div>

                <h3 className="font-display text-4xl uppercase text-ink mb-4 leading-none break-words">
                  {team.name}
                </h3>

                <div className="flex items-baseline gap-3">
                  <span className="num-lg text-saffron-500">{team.players?.length || 0}</span>
                  <span className="eyebrow">player{(team.players?.length || 0) === 1 ? '' : 's'}</span>
                </div>
              </div>

              <Link
                href={`/teams/${team.id}`}
                className="mt-8 inline-flex items-center gap-2 text-ink hover:text-saffron-500 font-display uppercase tracking-widest2 text-[12px] border-t border-canvas-ridge pt-4 transition-colors"
              >
                <span>Manage squad</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
