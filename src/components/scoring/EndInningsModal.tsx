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
    <div className="fixed inset-0 bg-canvas/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-canvas-raised w-full max-w-xl slab-accent gold my-8">
        <div className="overline mb-2">change of innings</div>
        <h2 className="font-display text-3xl uppercase text-ink leading-none mb-1">
          File the chase
        </h2>
        <p className="font-editorial italic text-ink-muted text-[13px] mb-5">
          <strong className="not-italic font-body text-ink">{newBattingTeam.name}</strong> have <strong className="not-italic font-body text-saffron-500">{target}</strong> to win.
        </p>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">opening bat · 1</label>
              <select className="input" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                <option value="">Select…</option>
                {newBattingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">opening bat · 2</label>
              <select className="input" value={batsman2} onChange={e => setBatsman2(e.target.value)}>
                <option value="">Select…</option>
                {newBattingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">opening bowler ({newBowlingTeam.name})</label>
            <select className="input" value={bowler} onChange={e => setBowler(e.target.value)}>
              <option value="">Select…</option>
              {newBowlingTeam.players?.map((p: Player) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-5 mt-5 border-t border-canvas-ridge">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button
            onClick={() => onConfirm({
              opening_batsman1_id: Number(batsman1),
              opening_batsman2_id: Number(batsman2),
              opening_bowler_id: Number(bowler),
            })}
            disabled={!canSubmit || isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Filing…' : 'Begin the chase →'}
          </button>
        </div>
      </div>
    </div>
  );
}
