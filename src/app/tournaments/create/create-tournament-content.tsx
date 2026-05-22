'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { PageLoader } from '@/components/PageLoader';
import { useCreateTournament, useGenerateFixtures, useTeams } from '@/lib/queries';
import { generatePin } from '@/lib/utils';
import { Team } from '@/types';

export function CreateTournamentContent() {
  const router = useRouter();
  const { data: teams, isLoading } = useTeams();
  const createTournament = useCreateTournament();
  const generateFixtures = useGenerateFixtures();
  const [form, setForm] = useState({
    name: '',
    total_overs: 8,
    players_per_side: 11,
    death_overs_from: '7',
    wide_rule: 'normal' as 'normal' | 'strict',
    scorer_pin: generatePin(),
    team_ids: [] as number[],
  });

  const toggleTeam = (teamId: number) => {
    setForm(prev => ({
      ...prev,
      team_ids: prev.team_ids.includes(teamId)
        ? prev.team_ids.filter(id => id !== teamId)
        : [...prev.team_ids, teamId],
    }));
  };

  const submit = async () => {
    const tournament = await createTournament.mutateAsync({
      ...form,
      format: 'league',
      death_overs_from: form.death_overs_from ? Number(form.death_overs_from) : undefined,
    });
    await generateFixtures.mutateAsync(tournament.id);
    router.push(`/tournaments/${tournament.id}`);
  };

  if (isLoading) return <PageLoader label="Loading teams" />;
  const canCreate = form.name.trim() && form.team_ids.length >= 2;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-8">
      <div className="page">
        <h1 className="mb-3 text-[20px] font-bold text-[var(--text-primary)]">Create tournament</h1>
        <section className="grid gap-3">
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
            <label className="label">Tournament name</label>
            <input className="input" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Sunday League" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
              <label className="label">Overs</label>
              <input className="input" type="number" min={1} max={50} value={form.total_overs} onChange={e => setForm(prev => ({ ...prev, total_overs: Number(e.target.value) }))} />
            </div>
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
              <label className="label">Wide runs from</label>
              <input className="input" type="number" min={1} max={form.total_overs} value={form.death_overs_from} onChange={e => setForm(prev => ({ ...prev, death_overs_from: e.target.value }))} />
            </div>
          </div>
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
            <p className="label">Teams</p>
            <div className="grid gap-2">
              {(teams || []).map((team: Team) => {
                const selected = form.team_ids.includes(team.id);
                return (
                  <button key={team.id} onClick={() => toggleTeam(team.id)} className={`flex h-11 items-center justify-between border px-3 text-left ${selected ? 'border-[var(--green)] bg-[#edf7ee]' : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'}`}>
                    <span className="font-semibold text-[var(--text-primary)]">{team.name}</span>
                    {selected && <Check size={16} className="text-[var(--green-text)]" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
            <p className="text-[13px] text-[var(--text-secondary)]">
              Fixtures are generated as upcoming matches. Scorers can start each match whenever they have the scorer PIN.
            </p>
          </div>
          <button disabled={!canCreate || createTournament.isPending || generateFixtures.isPending} onClick={submit} className="btn btn-primary h-11">
            {createTournament.isPending || generateFixtures.isPending ? 'Creating' : 'Create league fixtures'}
          </button>
        </section>
      </div>
    </div>
  );
}
