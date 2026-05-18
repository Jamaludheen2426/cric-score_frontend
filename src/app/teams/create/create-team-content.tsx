'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { useCreatePlayer, useCreateTeam } from '@/lib/queries';

interface PlayerInput {
  name: string;
  role: string;
  batting_order: number;
}

export function CreateTeamContent() {
  const router = useRouter();
  const createTeam = useCreateTeam();
  const createPlayer = useCreatePlayer();

  const [teamName, setTeamName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [players, setPlayers] = useState<PlayerInput[]>([
    { name: '', role: 'batsman', batting_order: 1 },
  ]);

  const addPlayer = () => setPlayers(prev => [...prev, { name: '', role: 'batsman', batting_order: prev.length + 1 }]);
  const removePlayer = (i: number) =>
    setPlayers(prev => prev.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, batting_order: idx + 1 })));
  const updatePlayer = (i: number, field: keyof PlayerInput, value: string | number) =>
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  const handleSubmit = async () => {
    if (!teamName.trim()) return alert('Team name required');
    const team = await createTeam.mutateAsync({ name: teamName, logo_url: logoUrl || undefined });
    for (const p of players.filter(p => p.name.trim())) {
      await createPlayer.mutateAsync({ teamId: team.id, data: p });
    }
    router.push(`/teams/${team.id}`);
  };

  const isLoading = createTeam.isPending || createPlayer.isPending;

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <header className="flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <Link href="/teams" className="text-[13px] font-semibold text-[var(--blue-text)]">Back</Link>
        <h1 className="text-[15px] font-bold text-[var(--text-primary)]">New Team</h1>
        <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary h-8 px-3">
          {isLoading ? 'Saving' : 'Save'}
        </button>
      </header>

      <main className="mx-auto max-w-3xl">
        <section className="border-b border-[var(--border-subtle)] px-3 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Team Details</p>
        </section>
        <div className="bg-[var(--bg-card)]">
          <label className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-3 py-3">
            <span className="text-[13px] text-[var(--text-primary)]">Team name</span>
            <input
              className="w-52 max-w-[58vw] rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-right text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)]"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Team name"
            />
          </label>
          <label className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-3 py-3">
            <span className="text-[13px] text-[var(--text-primary)]">Logo URL</span>
            <input
              className="w-52 max-w-[58vw] rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-right text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)]"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>

        <section className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Players</p>
            <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">{players.length} listed</p>
          </div>
          <button onClick={addPlayer} className="text-[13px] font-semibold text-[var(--blue-text)]">
            <Plus size={14} className="mr-1 inline" /> Add Player
          </button>
        </section>

        <div className="bg-[var(--bg-card)]">
          {players.map((player, i) => (
            <div key={i} className="grid grid-cols-[28px_1fr] gap-2 border-b border-[var(--border-subtle)] p-3 sm:grid-cols-[32px_1fr_180px_36px] sm:items-center">
              <span className="pt-2 text-center font-mono text-[12px] text-[var(--text-muted)] sm:pt-0">{String(i + 1).padStart(2, '0')}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)]"
                value={player.name}
                onChange={e => updatePlayer(i, 'name', e.target.value)}
                placeholder={`Player ${i + 1}`}
              />
              <select
                className="col-start-2 rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--green)] sm:col-start-auto"
                value={player.role}
                onChange={e => updatePlayer(i, 'role', e.target.value)}
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All-rounder</option>
                <option value="wicketkeeper">Wicketkeeper</option>
              </select>
              <button onClick={() => removePlayer(i)} className="col-start-2 grid h-9 w-9 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--red-text)] sm:col-start-auto" title="Remove">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
