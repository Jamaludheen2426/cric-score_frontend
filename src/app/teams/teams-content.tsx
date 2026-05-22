'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useTeams, useDeleteTeam } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Team } from '@/types';

export function TeamsContent() {
  const { data: teams, isLoading } = useTeams();
  const deleteTeam = useDeleteTeam();

  if (isLoading) return <PageLoader label="Loading teams" />;

  return (
    <div className="page">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[16px] font-bold text-[var(--text-primary)]">Teams <span className="text-[var(--text-muted)]">· {teams?.length || 0}</span></h1>
        <Link href="/teams/create" className="btn btn-primary btn-sm">+ Team</Link>
      </div>

      {!teams?.length ? (
        <div className="card text-center">
          <p className="text-[14px] font-bold">No teams yet.</p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Register a side to assemble its roster.</p>
          <Link href="/teams/create" className="btn btn-primary mt-4 inline-flex">Register team</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-[var(--border-subtle)]">
          {teams.map((team: Team) => (
            <div key={team.id} className="flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 last:border-b-0 hover:bg-[var(--bg-elevated)]">
              <Link href={`/teams/${team.id}`} className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-[var(--text-primary)]">{team.name}</p>
                <p className="text-[12px] text-[var(--text-secondary)]">{team.players?.length || 0} players</p>
              </Link>
              <button
                onClick={() => confirm(`Delete ${team.name}?`) && deleteTeam.mutate(team.id)}
                className="grid h-8 w-8 place-items-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--red-text)]"
                aria-label="Delete team"
              >
                <Trash2 size={14} />
              </button>
              <Link href={`/teams/${team.id}`} className="text-[var(--text-muted)]">›</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
