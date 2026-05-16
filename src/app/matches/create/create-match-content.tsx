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

  if (isLoading) return <PageLoader label="Calling the dressing room" />;

  return (
    <div className="page-narrow">
      {/* Masthead */}
      <header className="mb-10 pb-6 border-b-2 border-ink">
        <Link href="/matches" className="overline hover:text-saffron-500 inline-block mb-3">
          ← back to fixtures
        </Link>
        <h1 className="font-display text-[clamp(44px,6.5vw,84px)] uppercase leading-[0.85] text-ink">
          Open a&nbsp;
          <span className="font-editorial italic font-normal text-ochre-500">new</span>&nbsp;card
        </h1>
      </header>

      <div className="space-y-px bg-canvas-ridge">
        {/* PART I — IDENTITY */}
        <section className="bg-canvas-raised p-7 reveal">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-[11px] text-saffron-500 uppercase tracking-widest">part i</span>
            <h2 className="font-display text-2xl uppercase text-ink">Fixture identity</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="label">Match title *</label>
              <input
                className="input"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Final — Season 2026"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-4">
              <div>
                <label className="label">Side A *</label>
                <select className="input" value={form.team_a_id} onChange={e => set('team_a_id', e.target.value)}>
                  <option value="">Select…</option>
                  {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="font-editorial italic text-ochre-500 text-2xl pb-3 text-center">vs</div>
              <div>
                <label className="label">Side B *</label>
                <select className="input" value={form.team_b_id} onChange={e => set('team_b_id', e.target.value)}>
                  <option value="">Select…</option>
                  {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* PART II — RULES */}
        <section className="bg-canvas-raised p-7 reveal reveal-d1">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-[11px] text-saffron-500 uppercase tracking-widest">part ii</span>
            <h2 className="font-display text-2xl uppercase text-ink">Conditions of play</h2>
          </div>

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
              <label className="label">Death overs from</label>
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

        {/* PART III — SCORER PIN */}
        <section className="bg-canvas-raised p-7 reveal reveal-d2">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-mono text-[11px] text-saffron-500 uppercase tracking-widest">part iii</span>
            <h2 className="font-display text-2xl uppercase text-ink">The scorer&apos;s key</h2>
          </div>
          <p className="text-ink-muted text-sm mb-5 font-editorial italic">
            Issued once. Guards every entry into the scoring desk.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                className="input-mono text-center text-4xl tracking-[0.6em] text-saffron-500 py-4"
                value={form.scorer_pin}
                onChange={e => set('scorer_pin', e.target.value)}
                maxLength={6}
              />
            </div>
            <button onClick={regeneratePin} className="btn-ghost" title="Reissue key">
              <RefreshCw size={16} /> Reissue
            </button>
            <button onClick={copyPin} className="btn-ghost" title="Copy to clipboard">
              {pinCopied ? <><Check size={16} className="text-saffron-500" /> Copied</> : <><Copy size={16} /> Copy</>}
            </button>
          </div>
        </section>
      </div>

      {/* SUBMIT */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t-2 border-ink">
        <Link href="/matches" className="btn-ghost">Cancel</Link>
        <button onClick={handleSubmit} disabled={createMatch.isPending} className="btn-primary btn-lg">
          {createMatch.isPending ? 'Filing…' : 'File this card →'}
        </button>
      </div>
    </div>
  );
}
