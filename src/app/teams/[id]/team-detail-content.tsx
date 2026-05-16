'use client';

import { useState } from 'react';
import { useTeam, useCreatePlayer, useDeletePlayer } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Player } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const ROLE_META: Record<string, { tag: string; color: string }> = {
  batsman:      { tag: 'bat',  color: 'text-pitch-400 border-pitch-500/40' },
  bowler:       { tag: 'bowl', color: 'text-saffron-500 border-saffron-500/40' },
  allrounder:   { tag: 'all',  color: 'text-ochre-500 border-ochre-500/40' },
  wicketkeeper: { tag: 'wk',   color: 'text-ink border-ink-muted/50' },
};

export function TeamDetailContent({ teamId }: { teamId: number }) {
  const { data: team, isLoading } = useTeam(teamId);
  const createPlayer = useCreatePlayer();
  const deletePlayer = useDeletePlayer();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('batsman');

  if (isLoading) return <PageLoader label="Calling the squad" />;
  if (!team) return <div className="page text-ink-muted">Team not found.</div>;

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
      <header className="mb-10 pb-6 border-b-2 border-ink">
        <Link href="/teams" className="overline hover:text-saffron-500 inline-block mb-3">
          ← back to dressing room
        </Link>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-2">team sheet · side·{String(team.id).padStart(2, '0')}</div>
            <h1 className="font-display text-[clamp(44px,6.5vw,84px)] uppercase leading-[0.85] text-ink">
              {team.name}
            </h1>
          </div>
          <div className="stat text-right shrink-0">
            <span className="stat-label">squad</span>
            <span className="stat-value">{team.players?.length || 0}</span>
          </div>
        </div>
      </header>

      <section className="slab">
        <div className="flex items-center justify-between mb-6">
          <h2 className="chyron font-display text-xl uppercase tracking-widest2 text-ink">
            Roster
          </h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost btn-sm">
            <Plus size={14} /> {showAdd ? 'Cancel' : 'Add player'}
          </button>
        </div>

        {showAdd && (
          <div className="flex flex-col sm:flex-row gap-2 mb-5 p-3 bg-canvas-deep border border-saffron-500/40">
            <input
              className="input flex-1"
              placeholder="Player name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
              autoFocus
            />
            <select className="input w-full sm:w-44 shrink-0" value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="allrounder">All-rounder</option>
              <option value="wicketkeeper">Wicketkeeper</option>
            </select>
            <button onClick={handleAddPlayer} disabled={createPlayer.isPending} className="btn-primary">
              File
            </button>
          </div>
        )}

        <div>
          {team.players?.length ? team.players.map((player: Player, i: number) => {
            const meta = ROLE_META[player.role || 'batsman'];
            return (
              <div key={player.id} className="row grid-cols-[40px_1fr_auto_36px] gap-4 group hover:bg-canvas-ridge/40 px-2 -mx-2 transition-colors">
                <span className="font-mono text-[11px] text-ink-dim text-center">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-lg uppercase text-ink tracking-tight">{player.name}</span>
                <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 ${meta.color}`}>
                  {meta.tag}
                </span>
                <button
                  onClick={() => deletePlayer.mutate({ teamId, playerId: player.id })}
                  className="p-1.5 text-ink-dim hover:text-wicket-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          }) : (
            <div className="text-center py-12 overline">no players on the sheet</div>
          )}
        </div>
      </section>
    </div>
  );
}
