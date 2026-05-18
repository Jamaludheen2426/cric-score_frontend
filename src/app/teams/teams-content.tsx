'use client';

import Link from 'next/link';
import { ChevronRight, Plus, Trash2, Users } from 'lucide-react';
import { useDeleteTeam, useTeams } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Team } from '@/types';

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'T';
}

function teamColorClass(name: string) {
  const palette = ['bg-[#1f6feb]', 'bg-[#238636]', 'bg-[#bb8009]', 'bg-[#8957e5]', 'bg-[#d4820a]', 'bg-[#da3633]'];
  const seed = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[seed % palette.length];
}

export function TeamsContent() {
  const { data: teams, isLoading } = useTeams();
  const deleteTeam = useDeleteTeam();

  if (isLoading) return <PageLoader label="Loading teams" />;

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <header className="flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <h1 className="text-[16px] font-bold text-[var(--text-primary)]">Teams</h1>
        <Link href="/teams/create" className="btn btn-secondary h-8 px-3">
          <Plus size={14} /> New Team
        </Link>
      </header>

      {!teams?.length ? (
        <div className="grid min-h-[calc(100vh-96px)] place-items-center px-4 text-center">
          <div>
            <Users size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-[14px] font-semibold text-[var(--text-secondary)]">No teams</p>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">Create squads before starting a match.</p>
          </div>
        </div>
      ) : (
        <section className="mx-auto max-w-3xl border-x border-[var(--border-subtle)]">
          {teams.map((team: Team) => (
            <div key={team.id} className="group flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
              <Link href={`/teams/${team.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white ${teamColorClass(team.name)}`}>
                  {initials(team.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-bold text-[var(--text-primary)]">{team.name}</span>
                  <span className="text-[12px] text-[var(--text-secondary)]">{team.players?.length || 0} players</span>
                </span>
              </Link>
              <button
                onClick={() => confirm('Delete this team?') && deleteTeam.mutate(team.id)}
                className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--red-text)]"
                aria-label="Delete team"
              >
                <Trash2 size={14} />
              </button>
              <ChevronRight size={16} className="text-[var(--text-muted)]" />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
