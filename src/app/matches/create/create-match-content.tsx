'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeams, useCreateMatch } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { generatePin } from '@/lib/utils';
import { ArrowLeft, RefreshCw, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export function CreateMatchContent() {
  const router = useRouter();
  const { data: teams, isLoading } = useTeams();
  const createMatch = useCreateMatch();

  const [form, setForm] = useState({
    title: '',
    team_a_id: '',
    team_b_id: '',
    total_overs: 20,
    players_per_side: 11,
    death_overs_from: '',
    wide_rule: 'normal' as 'normal' | 'strict',
    scorer_pin: generatePin(),
  });
  const [pinCopied, setPinCopied] = useState(false);

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const copyPin = () => {
    navigator.clipboard.writeText(form.scorer_pin);
    setPinCopied(true);
    setTimeout(() => setPinCopied(false), 2000);
  };

  const regeneratePin = () => set('scorer_pin', generatePin());

  const handleSubmit = async () => {
    if (!form.title || !form.team_a_id || !form.team_b_id) return alert('Please fill all required fields');
    if (form.team_a_id === form.team_b_id) return alert('Teams must be different');

    const match = await createMatch.mutateAsync({
      ...form,
      team_a_id: Number(form.team_a_id),
      team_b_id: Number(form.team_b_id),
      death_overs_from: form.death_overs_from ? Number(form.death_overs_from) : undefined,
    });

    router.push(`/matches/${match.id}/score`);
  };

  if (isLoading) return <PageLoader label="Loading teams..." />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/matches" className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Create Match</h1>
          <p className="text-gray-500 text-sm">Set up a new cricket match</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4">Match Details</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Match Title *</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Final - Season 2025" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Team A *</label>
                <select className="input" value={form.team_a_id} onChange={e => set('team_a_id', e.target.value)}>
                  <option value="">Select team...</option>
                  {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Team B *</label>
                <select className="input" value={form.team_b_id} onChange={e => set('team_b_id', e.target.value)}>
                  <option value="">Select team...</option>
                  {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4">Match Config</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Total Overs</label>
              <input className="input" type="number" min={1} max={50} value={form.total_overs} onChange={e => set('total_overs', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Players Per Side</label>
              <input className="input" type="number" min={1} max={11} value={form.players_per_side} onChange={e => set('players_per_side', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Death Overs From</label>
              <input className="input" type="number" min={1} value={form.death_overs_from} onChange={e => set('death_overs_from', e.target.value)} placeholder="e.g. 16" />
            </div>
            <div>
              <label className="label">Wide Rule</label>
              <select className="input" value={form.wide_rule} onChange={e => set('wide_rule', e.target.value as any)}>
                <option value="normal">Normal</option>
                <option value="strict">Strict (T20)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display font-semibold text-white mb-1">Scorer PIN</h2>
          <p className="text-gray-500 text-xs mb-4">Share this PIN with the scorer. Keep it safe — it controls all scoring access.</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                className="input font-mono text-2xl tracking-[0.5em] text-center text-pitch-400"
                value={form.scorer_pin}
                onChange={e => set('scorer_pin', e.target.value)}
                maxLength={6}
              />
            </div>
            <button onClick={regeneratePin} className="btn-secondary px-3" title="Generate new PIN">
              <RefreshCw size={16} />
            </button>
            <button onClick={copyPin} className="btn-secondary px-3" title="Copy PIN">
              {pinCopied ? <Check size={16} className="text-pitch-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/matches" className="btn-secondary">Cancel</Link>
          <button onClick={handleSubmit} disabled={createMatch.isPending} className="btn-primary disabled:opacity-50">
            {createMatch.isPending ? 'Creating...' : 'Create Match'}
          </button>
        </div>
      </div>
    </div>
  );
}
