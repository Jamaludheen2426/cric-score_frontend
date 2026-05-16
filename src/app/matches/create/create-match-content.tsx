'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeams, useCreateMatch } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { generatePin } from '@/lib/utils';
import { RefreshCw, Copy, Check } from 'lucide-react';
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
    setTimeout(() => setPinCopied(false), 1800);
  };

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

  if (isLoading) return <PageLoader label="Loading teams" />;

  return (
    <div className="form-page">
      <div className="form-grid">
        <aside className="form-aside">
          <Link href="/matches" className="text-[13px] text-ink-mute hover:text-ink mb-8 inline-block">
            ← Back to matches
          </Link>
          <p className="eyebrow mb-4">New match</p>
          <h1 className="text-title mb-5">
            Set up your <span className="font-normal text-ink-soft">fixture.</span>
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed">
            Name the match, pick the sides, set the conditions of play.
            A scorer key is generated for the desk.
          </p>
        </aside>

        <div className="space-y-12">
          <section>
            <header className="mb-6">
              <h2 className="text-h3 mb-1">Match details</h2>
              <p className="text-[14px] text-ink-soft">Title and the two sides.</p>
            </header>
            <div className="space-y-5">
              <div>
                <label className="label">Match title</label>
                <input className="input" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Final — Season 2026" />
              </div>
              <div className="grid sm:grid-cols-[1fr_auto_1fr] items-end gap-4">
                <div>
                  <label className="label">Team A</label>
                  <select className="input" value={form.team_a_id} onChange={e => set('team_a_id', e.target.value)}>
                    <option value="">Select…</option>
                    {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="text-ink-mute text-xl pb-3 text-center hidden sm:block">vs</div>
                <div>
                  <label className="label">Team B</label>
                  <select className="input" value={form.team_b_id} onChange={e => set('team_b_id', e.target.value)}>
                    <option value="">Select…</option>
                    {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <div className="hr" />

          <section>
            <header className="mb-6">
              <h2 className="text-h3 mb-1">Conditions of play</h2>
              <p className="text-[14px] text-ink-soft">Overs, squad size, the death rule.</p>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Total overs</label>
                <input className="input-mono text-center text-xl" type="number" min={1} max={50}
                  value={form.total_overs} onChange={e => set('total_overs', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Per side</label>
                <input className="input-mono text-center text-xl" type="number" min={1} max={11}
                  value={form.players_per_side} onChange={e => set('players_per_side', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Death from</label>
                <input className="input-mono text-center text-xl" type="number" min={1}
                  value={form.death_overs_from} onChange={e => set('death_overs_from', e.target.value)} placeholder="—" />
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

          <div className="hr" />

          <section>
            <header className="mb-6">
              <h2 className="text-h3 mb-1">Scorer key</h2>
              <p className="text-[14px] text-ink-soft">Share with the scorer. The desk asks for this on entry.</p>
            </header>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  className="input-mono text-center text-3xl tracking-[0.55em] py-5 text-accent"
                  value={form.scorer_pin}
                  onChange={e => set('scorer_pin', e.target.value)}
                  maxLength={6}
                />
              </div>
              <button onClick={() => set('scorer_pin', generatePin())} className="btn-secondary">
                <RefreshCw size={15} /> Regenerate
              </button>
              <button onClick={copyPin} className="btn-secondary">
                {pinCopied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
              </button>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-8 border-t border-hairline">
            <Link href="/matches" className="btn-ghost">Cancel</Link>
            <button onClick={handleSubmit} disabled={createMatch.isPending} className="btn-primary btn-lg">
              {createMatch.isPending ? 'Creating…' : 'Create match →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
