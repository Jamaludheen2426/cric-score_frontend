'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { useCreatePlayer, useDeletePlayer, useTeam } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Player } from '@/types';

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
    <div className="min-h-screen bg-[var(--bg-app)]">
      <header className="flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <Link href="/teams" className="text-[13px] font-semibold text-[var(--blue-text)]">Back</Link>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[15px] font-bold text-[var(--text-primary)]">{team.name}</h1>
          <p className="text-[11px] text-[var(--text-secondary)]">{team.players?.length || 0} players</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-secondary h-8 px-3">
          <Plus size={14} /> Player
        </button>
      </header>

      <main className="mx-auto max-w-3xl">
        {showAdd && (
          <section className="border-b border-[var(--border)] bg-[var(--bg-card)] p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Add Player</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_180px_92px]">
              <input
                className="rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)]"
                placeholder="Player name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                autoFocus
              />
              <select
                className="rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)]"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All-rounder</option>
                <option value="wicketkeeper">Wicketkeeper</option>
              </select>
              <button onClick={handleAddPlayer} disabled={createPlayer.isPending} className="btn btn-primary">
                Add
              </button>
            </div>
          </section>
        )}

        <section className="border-x border-[var(--border-subtle)]">
          {team.players?.length ? (
            team.players.map((player: Player, i: number) => (
              <div key={player.id} className="grid grid-cols-[34px_1fr_auto_34px] items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5">
                <span className="text-center font-mono text-[12px] text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 truncate text-[14px] font-semibold text-[var(--text-primary)]">{player.name}</span>
                <span className="text-[12px] text-[var(--text-secondary)]">{ROLE_LABELS[player.role || 'batsman']}</span>
                <button
                  onClick={() => deletePlayer.mutate({ teamId, playerId: player.id })}
                  className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--red-text)]"
                  aria-label="Delete player"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="py-12 text-center text-[13px] text-[var(--text-muted)]">No players on the roster yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
