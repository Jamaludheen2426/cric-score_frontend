'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Minus, Plus } from 'lucide-react';
import { useCreateMatch, useTeams } from '@/lib/queries';
import { generatePin } from '@/lib/utils';
import { PageLoader } from '@/components/PageLoader';

type Step = 1 | 2 | 3;

function initials(name?: string) {
  return (name || 'T').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 last:border-b-0">
      <span className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</span>
      <div className="min-w-[90px] text-right">{children}</div>
    </div>
  );
}

export function CreateMatchContent() {
  const router = useRouter();
  const { data: teams, isLoading } = useTeams();
  const createMatch = useCreateMatch();
  const [step, setStep] = useState<Step>(1);
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

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const teamA = teams?.find((t: any) => String(t.id) === form.team_a_id);
  const teamB = teams?.find((t: any) => String(t.id) === form.team_b_id);
  const canContinueTeams = form.team_a_id && form.team_b_id && form.team_a_id !== form.team_b_id;

  const submit = async () => {
    const match = await createMatch.mutateAsync({
      ...form,
      title: form.title || `${teamA?.name || 'Team A'} vs ${teamB?.name || 'Team B'}`,
      team_a_id: Number(form.team_a_id),
      team_b_id: Number(form.team_b_id),
      death_overs_from: form.death_overs_from ? Number(form.death_overs_from) : undefined,
    });
    router.push(`/matches/${match.id}/score`);
  };

  if (isLoading) return <PageLoader label="Loading teams" />;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-5">
      <div className="page">
        <div className="mb-3 text-[12px] font-semibold text-[var(--text-secondary)]">Step {step} of 3</div>

        {step === 1 && (
          <section>
            <p className="eyebrow mb-2">Select teams</p>
            <div className="grid gap-2">
              {(['team_a_id', 'team_b_id'] as const).map((key, idx) => {
                const selected = key === 'team_a_id' ? teamA : teamB;
                return (
                  <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
                    <label className="label">{idx === 0 ? 'Team A' : 'Team B'}</label>
                    <select className="input" value={form[key]} onChange={e => set(key, e.target.value)}>
                      <option value="">Tap to select team</option>
                      {teams?.map((t: any) => <option key={t.id} value={t.id}>{t.name} - {t.players?.length || 0} players</option>)}
                    </select>
                    {selected && (
                      <div className="mt-2 flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--bg-elevated)] text-[11px] font-bold">{initials(selected.name)}</span>
                        <span>{selected.name} - {selected.players?.length || 0} players</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button disabled={!canContinueTeams} onClick={() => setStep(2)} className="btn btn-primary mt-3 w-full">Next</button>
          </section>
        )}

        {step === 2 && (
          <section>
            <p className="eyebrow mb-2">Match settings</p>
            <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
              <SettingRow label="Match title"><input className="input h-9" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Qualifier 1" /></SettingRow>
              <SettingRow label="Overs"><input className="input h-9 w-16 text-right" type="number" min={1} max={50} value={form.total_overs} onChange={e => set('total_overs', Number(e.target.value))} /></SettingRow>
              <SettingRow label="Players per side">
                <div className="inline-flex items-center gap-2">
                  <button className="grid h-8 w-8 place-items-center rounded border border-[var(--border)]" onClick={() => set('players_per_side', Math.max(1, form.players_per_side - 1))}><Minus size={14} /></button>
                  <span className="w-6 text-center text-[13px] font-bold">{form.players_per_side}</span>
                  <button className="grid h-8 w-8 place-items-center rounded border border-[var(--border)]" onClick={() => set('players_per_side', Math.min(11, form.players_per_side + 1))}><Plus size={14} /></button>
                </div>
              </SettingRow>
              <SettingRow label="Strict wide rule"><button onClick={() => set('wide_rule', form.wide_rule === 'normal' ? 'strict' : 'normal')} className={`h-7 w-12 rounded-full border ${form.wide_rule === 'strict' ? 'border-[var(--green)] bg-[#0f2318]' : 'border-[var(--border)] bg-[var(--bg-input)]'}`}><span className={`block h-5 w-5 rounded-full bg-[var(--text-secondary)] transition-transform ${form.wide_rule === 'strict' ? 'translate-x-5 bg-[var(--green-text)]' : 'translate-x-1'}`} /></button></SettingRow>
              <SettingRow label="Death overs from"><input className="input h-9 w-16 text-right" type="number" min={1} value={form.death_overs_from} onChange={e => set('death_overs_from', e.target.value)} placeholder="-" /></SettingRow>
              <SettingRow label="Scorer PIN"><input className="input h-9 w-24 text-center text-[18px] font-bold tracking-[.25em]" maxLength={4} inputMode="numeric" value={form.scorer_pin} onChange={e => set('scorer_pin', e.target.value.replace(/\D/g, '').slice(0, 4))} /></SettingRow>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
              <button onClick={() => setStep(3)} className="btn btn-primary">Review</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <p className="eyebrow mb-2">Review</p>
            <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
              <SettingRow label="Teams"><span className="text-[13px] text-[var(--text-secondary)]">{teamA?.name} vs {teamB?.name}</span></SettingRow>
              <SettingRow label="Overs"><span className="text-[13px] font-bold">{form.total_overs}</span></SettingRow>
              <SettingRow label="Players"><span className="text-[13px] font-bold">{form.players_per_side}</span></SettingRow>
              <SettingRow label="Wide rule"><span className="text-[13px] font-bold capitalize">{form.wide_rule}</span></SettingRow>
              <SettingRow label="PIN"><span className="text-[13px] font-bold">{form.scorer_pin}</span></SettingRow>
            </div>
            <div className="mt-3 grid grid-cols-[90px_1fr] gap-2">
              <button onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
              <button onClick={submit} disabled={createMatch.isPending} className="btn btn-primary h-12">{createMatch.isPending ? 'Creating' : <><Check size={16} /> Create match</>}</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
