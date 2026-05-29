'use client';

import { useState } from 'react';
import { Innings, Player, Team } from '@/types';

interface Props {
  teams: { teamA: Team; teamB: Team };
  currentInnings: Innings;
  onConfirm: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function EndInningsModal({ teams, currentInnings, onConfirm, onClose, isLoading }: Props) {
  const [batsman1, setBatsman1] = useState('');
  const [batsman2, setBatsman2] = useState('');
  const [bowler, setBowler] = useState('');

  const newBattingTeam = currentInnings.bowling_team_id === teams.teamA.id ? teams.teamA : teams.teamB;
  const newBowlingTeam = currentInnings.batting_team_id === teams.teamA.id ? teams.teamA : teams.teamB;
  const target = (currentInnings.total_runs || 0) + 1;
  const startsFirstSuperOver = currentInnings.innings_number >= 2 && currentInnings.innings_number % 2 === 0;
  const startsSuperChase = currentInnings.innings_number > 2 && currentInnings.innings_number % 2 === 1;
  const nextSuperOverNumber = startsFirstSuperOver
    ? currentInnings.innings_number / 2
    : startsSuperChase
      ? (currentInnings.innings_number - 1) / 2
      : null;
  const title = startsFirstSuperOver
    ? `${newBattingTeam.name} start SO ${nextSuperOverNumber}`
    : startsSuperChase
      ? `${newBattingTeam.name} chase ${target} in SO ${nextSuperOverNumber}`
      : `${newBattingTeam.name} chase ${target}`;
  const canSubmit = batsman1 && batsman2 && bowler && batsman1 !== batsman2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4">
      <div className="w-full max-w-[420px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Change Innings</p>
            <h2 className="text-[14px] font-bold uppercase text-[var(--text-primary)]">{title}</h2>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">X</button>
        </div>

        <div className="space-y-3 p-3">
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-secondary)]">Opening bat 1</span>
              <select className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)]" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                <option value="">Select</option>
                {newBattingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-secondary)]">Opening bat 2</span>
              <select className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)]" value={batsman2} onChange={e => setBatsman2(e.target.value)}>
                <option value="">Select</option>
                {newBattingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-secondary)]">Opening bowler</span>
            <select className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)]" value={bowler} onChange={e => setBowler(e.target.value)}>
              <option value="">Select</option>
              {newBowlingTeam.players?.map((p: Player) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-2 border-t border-[var(--border-subtle)] p-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => onConfirm({
              opening_batsman1_id: Number(batsman1),
              opening_batsman2_id: Number(batsman2),
              opening_bowler_id: Number(bowler),
            })}
            disabled={!canSubmit || isLoading}
            className="btn btn-primary flex-[1.5]"
          >
            {isLoading ? 'Starting' : startsFirstSuperOver ? 'Begin Super Over' : 'Begin Chase'}
          </button>
        </div>
      </div>
    </div>
  );
}
