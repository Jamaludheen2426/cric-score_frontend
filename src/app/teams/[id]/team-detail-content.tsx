'use client';

import { useState } from 'react';
import { useTeam, useCreatePlayer, useDeletePlayer } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Player } from '@/types';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ROLE_COLORS: Record<string, string> = {
  batsman: 'text-pitch-400 bg-pitch-600/10 border-pitch-600/20',
  bowler: 'text-purple-400 bg-purple-600/10 border-purple-600/20',
  allrounder: 'text-amber-400 bg-amber-600/10 border-amber-600/20',
  wicketkeeper: 'text-blue-400 bg-blue-600/10 border-blue-600/20',
};

export function TeamDetailContent({ teamId }: { teamId: number }) {
  const { data: team, isLoading } = useTeam(teamId);
  const createPlayer = useCreatePlayer();
  const deletePlayer = useDeletePlayer();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('batsman');

  if (isLoading) return <PageLoader label="Loading team..." />;
  if (!team) return <div className="text-gray-500">Team not found</div>;

  const handleAddPlayer = async () => {
    if (!newName.trim()) return;
    await createPlayer.mutateAsync({
      teamId,
      data: { name: newName, role: newRole, batting_order: (team.players?.length || 0) + 1 },
    });
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams" className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-gray-500 text-sm">{team.players?.length || 0} players in squad</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-gray-300 text-sm uppercase tracking-wider">Squad</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
            <Plus size={14} /> Add Player
          </button>
        </div>

        {showAdd && (
          <div className="flex gap-2 mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <input
              className="input flex-1"
              placeholder="Player name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
              autoFocus
            />
            <select className="input w-36 shrink-0" value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="allrounder">All-rounder</option>
              <option value="wicketkeeper">Wicketkeeper</option>
            </select>
            <button onClick={handleAddPlayer} disabled={createPlayer.isPending} className="btn-primary shrink-0">
              Add
            </button>
          </div>
        )}

        <div className="space-y-1">
          {team.players?.map((player: Player, i: number) => (
            <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 group transition-colors">
              <span className="font-mono text-xs text-gray-600 w-5 text-right">{i + 1}</span>
              <span className="flex-1 text-gray-200">{player.name}</span>
              <span className={`text-xs font-display px-2 py-0.5 rounded border capitalize ${ROLE_COLORS[player.role || 'batsman']}`}>
                {player.role || 'batsman'}
              </span>
              <button
                onClick={() => deletePlayer.mutate({ teamId, playerId: player.id })}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-rose-600/20 text-gray-600 hover:text-rose-400 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {!team.players?.length && (
            <p className="text-gray-600 text-sm text-center py-8">No players added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
