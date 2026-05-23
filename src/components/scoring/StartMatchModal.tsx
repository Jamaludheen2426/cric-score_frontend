'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Match, Player } from '@/types';
import { TossCoin } from '@/components/TossCoin';

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
  const [tossSide, setTossSide] = useState<'heads' | 'tails' | null>(null);
  const [tossFlipping, setTossFlipping] = useState(false);
  const [coinTrigger, setCoinTrigger] = useState(0);
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

  // New flow: tap a team to call heads/tails, the coin flips, the landed
  // side decides the toss winner — only then do we advance to the elect step.
  const callToss = (teamId: number, side: 'heads' | 'tails') => {
    if (tossFlipping) return;
    setTossFlipping(true);
    // Remember which team called what so we can decide who won when the coin lands
    setPendingCall({ teamId, side });
    setCoinTrigger(c => c + 1);
  };

  const [pendingCall, setPendingCall] = useState<{ teamId: number; side: 'heads' | 'tails' } | null>(null);

  const onCoinLanded = (landed: 'heads' | 'tails') => {
    setTossSide(landed);
    setTossFlipping(false);
    if (!pendingCall) return;
    // If the caller's side matches the result, they win. Otherwise the OTHER team wins.
    const winnerId = pendingCall.side === landed
      ? pendingCall.teamId
      : (pendingCall.teamId === match.team_a_id ? match.team_b_id : match.team_a_id);
    setTossWinner(String(winnerId));
    setTimeout(() => setStep('elect'), 750);
  };

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
            <div className="mb-4 flex justify-center">
              <TossCoin trigger={coinTrigger} onLanded={onCoinLanded} />
            </div>

            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
              {tossFlipping
                ? 'Flipping…'
                : tossWinner
                  ? `${teamNameOf(Number(tossWinner))} wins the toss (${tossSide})`
                  : 'Tap a team and call heads or tails'}
            </p>

            {!tossWinner && !tossFlipping && (
              <div className="space-y-3">
                {[match.teamA, match.teamB].map(t => t && (
                  <div key={t.id} className="rounded-md border border-[var(--border)] p-2.5">
                    <p className="mb-2 text-center text-[13px] font-bold text-[var(--text-primary)]">{t.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => callToss(t.id, 'heads')}
                        className="h-10 rounded border border-[var(--border)] bg-[var(--bg-card)] text-[12px] font-bold uppercase tracking-wide text-[var(--text-secondary)] hover:border-[var(--green)] hover:bg-[#edf7ee] hover:text-[var(--green-text)]"
                      >
                        Call Heads
                      </button>
                      <button
                        onClick={() => callToss(t.id, 'tails')}
                        className="h-10 rounded border border-[var(--border)] bg-[var(--bg-card)] text-[12px] font-bold uppercase tracking-wide text-[var(--text-secondary)] hover:border-[var(--green)] hover:bg-[#edf7ee] hover:text-[var(--green-text)]"
                      >
                        Call Tails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
