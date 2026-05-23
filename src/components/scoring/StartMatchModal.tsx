'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Match, Player } from '@/types';

interface Props {
  match: Match;
  onConfirm: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

type Step = 'toss' | 'elect' | 'openers' | 'bowler';

export function StartMatchModal({ match, onConfirm, onClose, isLoading }: Props) {
  const [step, setStep] = useState<Step>('toss');
  const [tossWinner, setTossWinner] = useState('');
  const [tossFlipping, setTossFlipping] = useState(false);
  const [electedTo, setElectedTo] = useState<'bat' | 'bowl'>('bat');
  const [batsman1, setBatsman1] = useState('');
  const [batsman2, setBatsman2] = useState('');
  const [bowler, setBowler] = useState('');

  const battingTeamId =
    tossWinner
      ? (electedTo === 'bat'
          ? Number(tossWinner)
          : Number(tossWinner) === match.team_a_id ? match.team_b_id : match.team_a_id)
      : null;
  const bowlingTeamId = battingTeamId
    ? (battingTeamId === match.team_a_id ? match.team_b_id : match.team_a_id)
    : null;
  const battingTeam = battingTeamId === match.team_a_id ? match.teamA : battingTeamId === match.team_b_id ? match.teamB : null;
  const bowlingTeam = bowlingTeamId === match.team_a_id ? match.teamA : bowlingTeamId === match.team_b_id ? match.teamB : null;

  // Trigger the coin animation once when a team is picked, then advance.
  useEffect(() => {
    if (!tossWinner || step !== 'toss') return;
    setTossFlipping(true);
    const t = setTimeout(() => { setTossFlipping(false); setStep('elect'); }, 1500);
    return () => clearTimeout(t);
  }, [tossWinner, step]);

  const canSubmit = batsman1 && batsman2 && bowler && batsman1 !== batsman2;
  const submit = () => onConfirm({
    toss_winner_team_id: Number(tossWinner),
    elected_to: electedTo,
    opening_batsman1_id: Number(batsman1),
    opening_batsman2_id: Number(batsman2),
    opening_bowler_id:   Number(bowler),
  });

  // Reset deps when the user goes back a step
  const goBackTo = (s: Step) => {
    if (s === 'toss')    { setTossWinner(''); setElectedTo('bat'); setBatsman1(''); setBatsman2(''); setBowler(''); }
    if (s === 'elect')   { setBatsman1(''); setBatsman2(''); setBowler(''); }
    if (s === 'openers') { setBowler(''); }
    setStep(s);
  };

  const stepIndex = (['toss', 'elect', 'openers', 'bowler'] as Step[]).indexOf(step);
  const teamNameOf = (id: number) => (id === match.team_a_id ? match.teamA?.name : match.teamB?.name) || '';

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4">
      <div className="w-full max-w-[440px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-xl">
        {/* Header */}
        <header className="flex h-12 items-center justify-between border-b border-[var(--border)] px-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Open play</p>
            <h2 className="text-[14px] font-bold uppercase text-[var(--text-primary)]">Step {stepIndex + 1} of 4</h2>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"><X size={16} /></button>
        </header>

        {/* Progress rail */}
        <div className="flex gap-1 border-b border-[var(--border-subtle)] px-3 py-2">
          {(['toss', 'elect', 'openers', 'bowler'] as Step[]).map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${i <= stepIndex ? 'bg-[var(--green-bright)]' : 'bg-[var(--border)]'}`} />
          ))}
        </div>

        {/* STEP 1 — TOSS */}
        {step === 'toss' && (
          <div className="step-reveal p-4">
            <div className="mx-auto mb-4 flex h-28 items-center justify-center">
              <span className={`toss-coin ${tossFlipping ? 'flipping' : ''}`}>
                {tossFlipping ? '?' : tossWinner ? teamNameOf(Number(tossWinner)).slice(0, 1).toUpperCase() : '🪙'}
              </span>
            </div>
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
              {tossFlipping ? 'Flipping…' : 'Who won the toss?'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[match.teamA, match.teamB].map(t => t && (
                <button
                  key={t.id}
                  disabled={tossFlipping}
                  onClick={() => setTossWinner(String(t.id))}
                  className={`h-11 rounded-md border text-[13px] font-bold transition-colors ${
                    String(t.id) === tossWinner
                      ? 'border-[var(--green)] bg-[#edf7ee] text-[var(--green-text)]'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — ELECT */}
        {step === 'elect' && (
          <div className="step-reveal p-4">
            <div className="mb-3 rounded-md bg-[#edf7ee] px-3 py-2 text-[12px]">
              <span className="font-bold text-[var(--green-text)]">{teamNameOf(Number(tossWinner))}</span>
              <span className="text-[var(--text-secondary)]"> won the toss.</span>
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Elected to</p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {(['bat', 'bowl'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setElectedTo(v)}
                  className={`h-11 rounded-md border text-[13px] font-bold capitalize transition-colors ${
                    electedTo === v
                      ? 'border-[var(--green)] bg-[#edf7ee] text-[var(--green-text)]'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="mb-3 text-[12px] text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--text-primary)]">{battingTeam?.name}</span> bats first.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => goBackTo('toss')} className="btn btn-secondary">Back</button>
              <button onClick={() => setStep('openers')} className="btn btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* STEP 3 — OPENERS */}
        {step === 'openers' && battingTeam && (
          <div className="step-reveal p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
              Opening pair · {battingTeam.name}
            </p>
            <div className="grid gap-2">
              <select className="input" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                <option value="">Opening bat 1</option>
                {battingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                ))}
              </select>
              <select className="input" value={batsman2} onChange={e => setBatsman2(e.target.value)}>
                <option value="">Opening bat 2</option>
                {battingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => goBackTo('elect')} className="btn btn-secondary">Back</button>
              <button
                disabled={!batsman1 || !batsman2 || batsman1 === batsman2}
                onClick={() => setStep('bowler')}
                className="btn btn-primary"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — OPENING BOWLER */}
        {step === 'bowler' && bowlingTeam && (
          <div className="step-reveal p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
              Opening bowler · {bowlingTeam.name}
            </p>
            <select className="input mb-3" value={bowler} onChange={e => setBowler(e.target.value)}>
              <option value="">Select bowler</option>
              {bowlingTeam.players?.map((p: Player) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => goBackTo('openers')} className="btn btn-secondary">Back</button>
              <button onClick={submit} disabled={!canSubmit || isLoading} className="btn btn-primary">
                {isLoading ? 'Starting…' : 'Begin play'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
