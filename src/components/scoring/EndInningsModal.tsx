'use client';

import { useState } from 'react';
import { Innings, Team, Player } from '@/types';

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
  const canSubmit = batsman1 && batsman2 && bowler && batsman1 !== batsman2;

  return (
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-hairline rounded-2xl w-full max-w-xl my-8 p-8 shadow-lift">
        <p className="eyebrow mb-3">Change of innings</p>
        <h2 className="text-h2 mb-2">Set up the chase</h2>
        <p className="text-[14px] text-ink-soft mb-6">
          <strong className="text-ink font-medium">{newBattingTeam.name}</strong> need{' '}
          <strong className="text-accent font-medium">{target}</strong> to win.
        </p>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Opening bat 1</label>
              <select className="input" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                <option value="">Select…</option>
                {newBattingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Opening bat 2</label>
              <select className="input" value={batsman2} onChange={e => setBatsman2(e.target.value)}>
                <option value="">Select…</option>
                {newBattingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Opening bowler ({newBowlingTeam.name})</label>
            <select className="input" value={bowler} onChange={e => setBowler(e.target.value)}>
              <option value="">Select…</option>
              {newBowlingTeam.players?.map((p: Player) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-6 mt-8 border-t border-hairline">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={() => onConfirm({
              opening_batsman1_id: Number(batsman1),
              opening_batsman2_id: Number(batsman2),
              opening_bowler_id: Number(bowler),
            })}
            disabled={!canSubmit || isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Filing…' : 'Begin chase →'}
          </button>
        </div>
      </div>
    </div>
  );
}
