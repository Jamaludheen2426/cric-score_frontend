'use client';

import Link from 'next/link';
import { useTeams, useDeleteTeam } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Team } from '@/types';
import { Users, Plus, Trash2, ChevronRight } from 'lucide-react';

export function TeamsContent() {
  const { data: teams, isLoading } = useTeams();
  const deleteTeam = useDeleteTeam();

  if (isLoading) return <PageLoader label="Loading teams..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Teams</h1>
          <p className="text-gray-500 text-sm mt-0.5">{teams?.length || 0} teams registered</p>
        </div>
        <Link href="/teams/create" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Team
        </Link>
      </div>

      {!teams?.length ? (
        <div className="card text-center py-16">
          <Users size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-display">No teams yet</p>
          <Link href="/teams/create" className="btn-primary mt-4 inline-flex">Create first team</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team: Team) => (
            <div key={team.id} className="card hover:border-gray-700 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pitch-600/20 border border-pitch-600/30 flex items-center justify-center">
                    <span className="text-lg">🏏</span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white">{team.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{team.players?.length || 0} players</p>
                  </div>
                </div>
                <button
                  onClick={() => confirm('Delete this team?') && deleteTeam.mutate(team.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-600/20 text-gray-600 hover:text-rose-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <Link
                href={`/teams/${team.id}`}
                className="mt-4 flex items-center justify-between text-sm text-gray-400 hover:text-pitch-400 transition-colors"
              >
                <span>Manage squad</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
