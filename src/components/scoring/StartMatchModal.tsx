'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Match, Player } from '@/types';

interface Props {
  match: Match;
  onConfirm: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function StartMatchModal({ match, onConfirm, onClose, isLoading }: Props) {
  const [tossWinner, setTossWinner] = useState('');
  const [electedTo, setElectedTo] = useState<'bat' | 'bowl'>('bat');
  const [batsman1, setBatsman1] = useState('');
  const [batsman2, setBatsman2] = useState('');
  const [bowler, setBowler] = useState('');
  const battingTeamId = tossWinner ? (electedTo === 'bat' ? Number(tossWinner) : Number(tossWinner) === match.team_a_id ? match.team_b_id : match.team_a_id) : null;
  const bowlingTeamId = battingTeamId ? (battingTeamId === match.team_a_id ? match.team_b_id : match.team_a_id) : null;
  const battingTeam = battingTeamId === match.team_a_id ? match.teamA : battingTeamId === match.team_b_id ? match.teamB : null;
  const bowlingTeam = bowlingTeamId === match.team_a_id ? match.teamA : bowlingTeamId === match.team_b_id ? match.teamB : null;
  const canSubmit = tossWinner && batsman1 && batsman2 && bowler && batsman1 !== batsman2;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4">
      <div className="w-full max-w-[420px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
        <header className="flex h-11 items-center justify-between border-b border-[var(--border)] px-3">
          <h2 className="text-[14px] font-bold uppercase">Open play</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)]"><X size={18} /></button>
        </header>
        <div className="p-3">
          <p className="eyebrow mb-2">Toss won by</p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {[match.teamA, match.teamB].map(t => t && (
              <button key={t.id} onClick={() => setTossWinner(String(t.id))} className={`h-10 rounded border text-[13px] font-semibold ${String(t.id) === tossWinner ? 'border-[var(--green)] bg-[#0f2318] text-[var(--green-text)]' : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'}`}>{t.name}</button>
            ))}
          </div>
          {tossWinner && (
            <>
              <p className="eyebrow mb-2">Elected to</p>
              <div className="mb-3 grid grid-cols-2 gap-2">
                {(['bat', 'bowl'] as const).map(v => <button key={v} onClick={() => setElectedTo(v)} className={`h-10 rounded border text-[13px] font-semibold uppercase ${electedTo === v ? 'border-[var(--green)] bg-[#0f2318] text-[var(--green-text)]' : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'}`}>{v}</button>)}
              </div>
              <div className="grid gap-2">
                <select className="input" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                  <option value="">Opening bat 1</option>
                  {battingTeam?.players?.map((p: Player) => <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>)}
                </select>
                <select className="input" value={batsman2} onChange={e => setBatsman2(e.target.value)}>
                  <option value="">Opening bat 2</option>
                  {battingTeam?.players?.map((p: Player) => <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>)}
                </select>
                <select className="input" value={bowler} onChange={e => setBowler(e.target.value)}>
                  <option value="">Opening bowler</option>
                  {bowlingTeam?.players?.map((p: Player) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        <footer className="grid grid-cols-2 gap-2 border-t border-[var(--border)] p-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button disabled={!canSubmit || isLoading} onClick={() => onConfirm({ toss_winner_team_id: Number(tossWinner), elected_to: electedTo, opening_batsman1_id: Number(batsman1), opening_batsman2_id: Number(batsman2), opening_bowler_id: Number(bowler) })} className="btn btn-primary">Begin play</button>
        </footer>
      </div>
    </div>
  );
}
