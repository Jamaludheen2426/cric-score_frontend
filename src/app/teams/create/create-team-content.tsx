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
    <div className="form-page">
      <div className="form-grid">
        {/* LEFT — masthead */}
        <aside className="form-aside">
          <Link href="/teams" className="text-[13px] text-ink-mute hover:text-ink mb-8 inline-block">
            ← Back to teams
          </Link>
          <p className="eyebrow mb-4">New team</p>
          <h1 className="text-title mb-5">
            Register a <span className="font-normal text-ink-soft">side.</span>
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed">
            Add the team name and the players. You can use this side in any match.
          </p>
        </aside>

        {/* RIGHT — form */}
        <div className="space-y-12">
          <section>
            <header className="mb-6">
              <h2 className="text-h3 mb-1">Team details</h2>
              <p className="text-[14px] text-ink-soft">A name and an optional crest.</p>
            </header>
            <div className="space-y-5">
              <div>
                <label className="label">Team name</label>
                <input className="input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Chennai Super Kings" />
              </div>
              <div>
                <label className="label">Crest URL (optional)</label>
                <input className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://…" />
              </div>
            </div>
          </section>

          <div className="hr" />

          <section>
            <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-h3 mb-1">Roster</h2>
                <p className="text-[14px] text-ink-soft">{players.length} player{players.length === 1 ? '' : 's'} added.</p>
              </div>
              <button onClick={addPlayer} className="btn-secondary btn-sm">
                <Plus size={14} /> Add player
              </button>
            </header>

            <div className="space-y-2">
              {players.map((player, i) => (
                <div key={i} className="flex gap-2 items-center bg-surface border border-hairline rounded-md p-2">
                  <span className="font-mono text-[12px] text-ink-mute w-7 text-center shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <input
                    className="input border-0 bg-transparent flex-1 py-2 px-2 focus:shadow-none"
                    value={player.name}
                    onChange={e => updatePlayer(i, 'name', e.target.value)}
                    placeholder={`Player ${i + 1}`}
                  />
                  <select
                    className="input border-0 bg-transparent w-40 shrink-0 py-2 px-2 focus:shadow-none"
                    value={player.role}
                    onChange={e => updatePlayer(i, 'role', e.target.value)}
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="allrounder">All-rounder</option>
                    <option value="wicketkeeper">Wicketkeeper</option>
                  </select>
                  <button onClick={() => removePlayer(i)} className="p-2 text-ink-mute hover:text-wicket shrink-0 transition-colors" title="Remove">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-8 border-t border-hairline">
            <Link href="/teams" className="btn-ghost">Cancel</Link>
            <button onClick={handleSubmit} disabled={isLoading} className="btn-primary btn-lg">
              {isLoading ? 'Creating…' : 'Create team →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
