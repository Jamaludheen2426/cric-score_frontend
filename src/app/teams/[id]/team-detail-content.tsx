'use client';

import { useState } from 'react';
import { useTeam, useCreatePlayer, useDeletePlayer } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Player } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const ROLE_LABELS: Record<string, string> = {
  batsman: 'Batsman',
  bowler: 'Bowler',
  allrounder: 'All-rounder',
  wicketkeeper: 'Wicketkeeper',
};

export function TeamDetailContent({ teamId }: { teamId: number }) {
  const { data: team, isLoading } = useTeam(teamId);
  const createPlayer = useCreatePlayer();
  const deletePlayer = useDeletePlayer();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('batsman');

  if (isLoading) return <PageLoader label="Loading team" />;
  if (!team) return <div className="page text-ink-soft">Team not found.</div>;

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
    <div className="page-narrow">
      <header className="mb-14">
        <Link href="/teams" className="text-[13px] text-ink-mute hover:text-ink mb-6 inline-block">
          ← Back to teams
        </Link>
        <p className="eyebrow mb-4">Team · {String(team.id).padStart(2, '0')}</p>
        <div className="flex items-end justify-between gap-6">
          <h1 className="text-title">{team.name}</h1>
          <div className="stat text-right shrink-0">
            <span className="stat-label">Squad</span>
            <span className="stat-value">{team.players?.length || 0}</span>
          </div>
        </div>
      </header>

      <section>
        <header className="flex items-end justify-between mb-6">
          <h2 className="text-h3">Roster</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary btn-sm">
            <Plus size={14} /> {showAdd ? 'Cancel' : 'Add player'}
          </button>
        </header>

        {showAdd && (
          <div className="flex flex-col sm:flex-row gap-2 mb-6 p-2 bg-surface border border-accent/40 rounded-md">
            <input
              className="input border-0 bg-transparent flex-1 focus:shadow-none"
              placeholder="Player name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
              autoFocus
            />
            <select className="input border-0 bg-transparent w-full sm:w-44 shrink-0 focus:shadow-none" value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="allrounder">All-rounder</option>
              <option value="wicketkeeper">Wicketkeeper</option>
            </select>
            <button onClick={handleAddPlayer} disabled={createPlayer.isPending} className="btn-accent btn-sm">
              Add
            </button>
          </div>
        )}

        {team.players?.length ? (
          <div className="border border-hairline rounded-xl bg-surface overflow-hidden">
            {team.players.map((player: Player, i: number) => (
              <div
                key={player.id}
                className={`grid grid-cols-[40px_1fr_auto_auto] items-center gap-4 px-5 py-4 group hover:bg-surface-soft transition-colors ${
                  i < team.players!.length - 1 ? 'border-b border-hairline' : ''
                }`}
              >
                <span className="font-mono text-[12px] text-ink-mute text-center">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-medium text-[15px] text-ink">{player.name}</span>
                <span className="text-[12px] text-ink-soft">{ROLE_LABELS[player.role || 'batsman']}</span>
                <button
                  onClick={() => deletePlayer.mutate({ teamId, playerId: player.id })}
                  className="p-1.5 text-ink-mute hover:text-wicket opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-ink-mute">No players on the roster yet.</p>
        )}
      </section>
    </div>
  );
}
