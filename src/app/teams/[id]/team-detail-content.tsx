'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Check, X as XIcon } from 'lucide-react';
import { useCreatePlayer, useDeletePlayer, useTeam, useUpdatePlayer } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Player } from '@/types';

const ROLES = [
  { value: 'batsman',     label: 'Batsman' },
  { value: 'bowler',      label: 'Bowler' },
  { value: 'allrounder',  label: 'All-rounder' },
  { value: 'wicketkeeper',label: 'Wicketkeeper' },
];
const ROLE_LABEL = Object.fromEntries(ROLES.map(r => [r.value, r.label]));

export function TeamDetailContent({ teamId }: { teamId: number }) {
  const { data: team, isLoading } = useTeam(teamId);
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();

  const [showAdd, setShowAdd]   = useState(false);
  const [newName, setNewName]   = useState('');
  const [newRole, setNewRole]   = useState('batsman');

  // Inline edit state — one row at a time
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName]   = useState('');
  const [editRole, setEditRole]   = useState('batsman');

  if (isLoading) return <PageLoader label="Loading team" />;
  if (!team) return <div className="page text-[var(--text-secondary)]">Team not found.</div>;

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditRole(p.role || 'batsman');
  };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return cancelEdit();
    await updatePlayer.mutateAsync({
      teamId,
      playerId: editingId,
      data: { name: editName.trim(), role: editRole },
    });
    setEditingId(null);
  };

  const addPlayer = async () => {
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
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
                autoFocus
              />
              <select
                className="rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)]"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <button onClick={addPlayer} disabled={createPlayer.isPending} className="btn btn-primary">
                Add
              </button>
            </div>
          </section>
        )}

        <section className="border-x border-[var(--border-subtle)]">
          {team.players?.length ? (
            team.players.map((player: Player, i: number) => {
              const isEditing = editingId === player.id;
              if (isEditing) {
                return (
                  <div key={player.id} className="grid grid-cols-[34px_1fr_170px_34px_34px] items-center gap-2 border-b border-[var(--border-subtle)] bg-[#fbfaf3] px-3 py-2.5">
                    <span className="text-center font-mono text-[12px] text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                    <input
                      className="rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-2 py-1.5 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)]"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      autoFocus
                    />
                    <select
                      className="rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-2 py-1.5 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)]"
                      value={editRole}
                      onChange={e => setEditRole(e.target.value)}
                    >
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button
                      onClick={saveEdit}
                      disabled={updatePlayer.isPending}
                      className="grid h-8 w-8 place-items-center rounded-md text-[var(--green-text)] hover:bg-[var(--bg-elevated)]"
                      aria-label="Save"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                      aria-label="Cancel"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                );
              }
              return (
                <div
                  key={player.id}
                  className="grid cursor-pointer grid-cols-[34px_1fr_auto_34px] items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 hover:bg-[var(--bg-elevated)]"
                  onClick={() => startEdit(player)}
                  title="Click to edit name or role"
                >
                  <span className="text-center font-mono text-[12px] text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 truncate text-[14px] font-semibold text-[var(--text-primary)]">{player.name}</span>
                  <span className="text-[12px] text-[var(--text-secondary)]">{ROLE_LABEL[player.role || 'batsman']}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deletePlayer.mutate({ teamId, playerId: player.id }); }}
                    className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--red-text)]"
                    aria-label="Delete player"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="py-12 text-center text-[13px] text-[var(--text-muted)]">No players on the roster yet.</p>
          )}
        </section>

        {team.players?.length ? (
          <p className="px-3 py-2 text-[11px] text-[var(--text-muted)]">Click a player to edit name or role.</p>
        ) : null}
      </main>
    </div>
  );
}
