'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { useTeams, useCreateMatch } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { generatePin } from '@/lib/utils';

export function CreateMatchContent() {
  const router = useRouter();
  const { data: teams, isLoading } = useTeams();
  const createMatch = useCreateMatch();

  const [form, setForm] = useState({
    title: '',
    team_a_id: '',
    team_b_id: '',
    total_overs: 20,
    balls_per_over: 6,
    players_per_side: 11,
    death_overs_from: '',
    wide_rule: 'normal' as 'normal' | 'strict',
    scorer_pin: generatePin(),
  });
  const [pinCopied, setPinCopied] = useState(false);

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
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

  if (isLoading) return <PageLoader label="Loading teams" />;

  return (
    <div className="page">
      <div className="mb-3 flex items-center gap-2">
        <Link href="/matches" className="text-[13px] font-semibold text-[var(--blue-text)]">← Back</Link>
        <h1 className="ml-1 text-[16px] font-bold">New match</h1>
      </div>

      <section className="card mb-2.5">
        <p className="eyebrow mb-2">Match</p>
        <label className="label">Title</label>
        <input className="input mb-2" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Final — Season 2026" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Team A</label>
            <select className="input" value={form.team_a_id} onChange={e => set('team_a_id', e.target.value)}>
              <option value="">Select</option>
              {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Team B</label>
            <select className="input" value={form.team_b_id} onChange={e => set('team_b_id', e.target.value)}>
              <option value="">Select</option>
              {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="card mb-2.5">
        <p className="eyebrow mb-2">Rules</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Total overs</label>
            <input className="input-mono text-center" type="number" min={1} max={50}
              value={form.total_overs} onChange={e => set('total_overs', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Per side</label>
            <input className="input-mono text-center" type="number" min={1} max={11}
              value={form.players_per_side} onChange={e => set('players_per_side', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Balls / over</label>
            <input className="input-mono text-center" type="number" min={1} max={10}
              value={form.balls_per_over} onChange={e => set('balls_per_over', Number(e.target.value))} />
            <p className="mt-1 text-center text-[10px] font-semibold text-[var(--text-muted)]">Use 5 for Hundred-style sets.</p>
          </div>
          <div>
            <label className="label">Death from</label>
            <input className="input-mono text-center" type="number" min={1}
              value={form.death_overs_from} onChange={e => set('death_overs_from', e.target.value)} placeholder="—" />
            <p className="mt-1 text-center text-[10px] font-semibold text-[var(--text-muted)]">From this over, wide = +1 and re-ball.</p>
          </div>
          <div>
            <label className="label">Wide rule</label>
            <select className="input" value={form.wide_rule} onChange={e => set('wide_rule', e.target.value as any)}>
              <option value="normal">Normal</option>
              <option value="strict">Strict (T20)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="card mb-2.5">
        <p className="eyebrow mb-2">Scorer key</p>
        <p className="mb-2 text-[12px] text-[var(--text-secondary)]">Share this PIN with the scorer.</p>
        <div className="flex gap-2">
          <input
            className="input-mono flex-1 text-center text-[22px] tracking-[0.4em] text-[var(--green-text)]"
            value={form.scorer_pin}
            onChange={e => set('scorer_pin', e.target.value)}
            maxLength={6}
          />
          <button onClick={() => set('scorer_pin', generatePin())} className="btn btn-secondary" title="Regenerate">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => { navigator.clipboard.writeText(form.scorer_pin); setPinCopied(true); setTimeout(() => setPinCopied(false), 1500); }} className="btn btn-secondary" title="Copy">
            {pinCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </section>

      <div className="flex gap-2">
        <Link href="/matches" className="btn btn-secondary flex-1">Cancel</Link>
        <button onClick={submit} disabled={createMatch.isPending} className="btn btn-primary flex-[1.5]">
          {createMatch.isPending ? 'Creating' : 'Create match'}
        </button>
      </div>
    </div>
  );
}
