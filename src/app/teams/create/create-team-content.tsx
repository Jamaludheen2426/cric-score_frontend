'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { useCreateTeam, useCreatePlayer } from '@/lib/queries';

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
  const [players, setPlayers] = useState<PlayerInput[]>([{ name: '', role: 'batsman', batting_order: 1 }]);

  const addPlayer = () => setPlayers(p => [...p, { name: '', role: 'batsman', batting_order: p.length + 1 }]);
  const removePlayer = (i: number) => setPlayers(p => p.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, batting_order: idx + 1 })));
  const updatePlayer = (i: number, field: keyof PlayerInput, value: string | number) =>
    setPlayers(p => p.map((x, idx) => idx === i ? { ...x, [field]: value } : x));

  const submit = async () => {
    if (!teamName.trim()) return alert('Team name required');
    const team = await createTeam.mutateAsync({ name: teamName, logo_url: logoUrl || undefined });
    for (const p of players.filter(p => p.name.trim())) {
      await createPlayer.mutateAsync({ teamId: team.id, data: p });
    }
    router.push(`/teams/${team.id}`);
  };

  const isLoading = createTeam.isPending || createPlayer.isPending;

  return (
    <div className="page">
      <div className="mb-3 flex items-center gap-2">
        <Link href="/teams" className="text-[13px] font-semibold text-[var(--blue-text)]">← Back</Link>
        <h1 className="ml-1 text-[16px] font-bold">New team</h1>
      </div>

      <section className="card mb-2.5">
        <p className="eyebrow mb-2">Team</p>
        <label className="label">Team name</label>
        <input className="input mb-2" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Chennai Super Kings" />
        <label className="label">Crest URL (optional)</label>
        <input className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://…" />
      </section>

      <section className="card mb-2.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="eyebrow">Roster <span className="ml-1 text-[var(--text-secondary)]">{players.length}</span></p>
          <button onClick={addPlayer} className="btn btn-secondary btn-sm"><Plus size={12} /> Add</button>
        </div>
        <div className="space-y-2">
          {players.map((player, i) => (
            <div key={i} className="grid grid-cols-[28px_1fr_140px_32px] items-center gap-1.5">
              <span className="text-center font-mono text-[12px] text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>
              <input
                className="input"
                value={player.name}
                onChange={e => updatePlayer(i, 'name', e.target.value)}
                placeholder={`Player ${i + 1}`}
              />
              <select
                className="input"
                value={player.role}
                onChange={e => updatePlayer(i, 'role', e.target.value)}
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All-rounder</option>
                <option value="wicketkeeper">Wicketkeeper</option>
              </select>
              <button onClick={() => removePlayer(i)} className="grid h-8 w-8 place-items-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--red-text)]" title="Remove">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-2">
        <Link href="/teams" className="btn btn-secondary flex-1">Cancel</Link>
        <button onClick={submit} disabled={isLoading} className="btn btn-primary flex-[1.5]">
          {isLoading ? 'Creating' : 'Create team'}
        </button>
      </div>
    </div>
  );
}
