'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTeam, useCreatePlayer } from '@/lib/queries';
import { Plus, X, ArrowLeft } from 'lucide-react';
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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams" className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Create Team</h1>
          <p className="text-gray-500 text-sm">Add team details and players</p>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="font-display font-semibold text-white mb-4">Team Details</h2>
        <div className="space-y-3">
          <div>
            <label className="label">Team Name *</label>
            <input className="input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Chennai Super Kings" />
          </div>
          <div>
            <label className="label">Logo URL (optional)</label>
            <input className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white">Squad ({players.length})</h2>
          <button onClick={addPlayer} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3">
            <Plus size={14} /> Add Player
          </button>
        </div>
        <div className="space-y-2">
          {players.map((player, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="font-mono text-xs text-gray-600 w-5 text-right shrink-0">{i + 1}</span>
              <input
                className="input flex-1"
                value={player.name}
                onChange={e => updatePlayer(i, 'name', e.target.value)}
                placeholder={`Player ${i + 1} name`}
              />
              <select
                className="input w-36 shrink-0"
                value={player.role}
                onChange={e => updatePlayer(i, 'role', e.target.value)}
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All-rounder</option>
                <option value="wicketkeeper">Wicketkeeper</option>
              </select>
              <button onClick={() => removePlayer(i)} className="p-2 rounded-lg hover:bg-rose-600/20 text-gray-600 hover:text-rose-400 transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Link href="/teams" className="btn-secondary">Cancel</Link>
        <button onClick={handleSubmit} disabled={isLoading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Creating...' : 'Create Team'}
        </button>
      </div>
    </div>
  );
}
