'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTeam, useCreatePlayer } from '@/lib/queries';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';

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

  const addPlayer = () => {
    setPlayers(prev => [...prev, { name: '', role: 'batsman', batting_order: prev.length + 1 }]);
  };
  const removePlayer = (i: number) => {
    setPlayers(prev => prev.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, batting_order: idx + 1 })));
  };
  const updatePlayer = (i: number, field: keyof PlayerInput, value: string | number) => {
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

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
    <div className="page-narrow">
      <header className="mb-10 pb-6 border-b-2 border-ink">
        <Link href="/teams" className="overline hover:text-saffron-500 inline-block mb-3">
          ← back to dressing room
        </Link>
        <h1 className="font-display text-[clamp(44px,6.5vw,84px)] uppercase leading-[0.85] text-ink">
          Register a&nbsp;
          <span className="font-editorial italic font-normal text-ochre-500">side</span>
        </h1>
      </header>

      <div className="space-y-px bg-canvas-ridge">
        <section className="bg-canvas-raised p-7 reveal">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-[11px] text-saffron-500 uppercase tracking-widest">part i</span>
            <h2 className="font-display text-2xl uppercase text-ink">Side identity</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="label">Team name *</label>
              <input className="input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Chennai Super Kings" />
            </div>
            <div>
              <label className="label">Crest URL (optional)</label>
              <input className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://…" />
            </div>
          </div>
        </section>

        <section className="bg-canvas-raised p-7 reveal reveal-d1">
          <div className="flex items-baseline justify-between mb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] text-saffron-500 uppercase tracking-widest">part ii</span>
              <h2 className="font-display text-2xl uppercase text-ink">Roster</h2>
              <span className="font-mono text-[11px] text-ink-dim ml-2">{players.length} added</span>
            </div>
            <button onClick={addPlayer} className="btn-ghost btn-sm">
              <Plus size={14} /> Add player
            </button>
          </div>

          <div className="space-y-2">
            {players.map((player, i) => (
              <div key={i} className="flex gap-2 items-center bg-canvas-deep border border-canvas-ridge p-1.5">
                <span className="font-mono text-[11px] text-ink-dim w-7 text-center shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <input
                  className="input border-0 bg-transparent flex-1 py-2"
                  value={player.name}
                  onChange={e => updatePlayer(i, 'name', e.target.value)}
                  placeholder={`Player ${i + 1}`}
                />
                <select
                  className="input border-0 bg-transparent w-40 shrink-0 py-2"
                  value={player.role}
                  onChange={e => updatePlayer(i, 'role', e.target.value)}
                >
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="allrounder">All-rounder</option>
                  <option value="wicketkeeper">Wicketkeeper</option>
                </select>
                <button onClick={() => removePlayer(i)} className="p-2 text-ink-dim hover:text-wicket-500 shrink-0 transition-colors" title="Remove">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t-2 border-ink">
        <Link href="/teams" className="btn-ghost">Cancel</Link>
        <button onClick={handleSubmit} disabled={isLoading} className="btn-primary btn-lg">
          {isLoading ? 'Registering…' : 'Register side →'}
        </button>
      </div>
    </div>
  );
}
