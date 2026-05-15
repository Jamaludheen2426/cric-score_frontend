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

  // Second innings batting team = current bowling team
  const newBattingTeam = currentInnings.bowling_team_id === teams.teamA.id ? teams.teamA : teams.teamB;
  const newBowlingTeam = currentInnings.batting_team_id === teams.teamA.id ? teams.teamA : teams.teamB;

  const canSubmit = batsman1 && batsman2 && bowler && batsman1 !== batsman2;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-display text-lg font-bold text-white">End Innings</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Set opening players for 2nd innings — <strong className="text-gray-300">{newBattingTeam.name}</strong> batting
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Opening Bat 1 *</label>
              <select className="input" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                <option value="">Select...</option>
                {newBattingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Opening Bat 2 *</label>
              <select className="input" value={batsman2} onChange={e => setBatsman2(e.target.value)}>
                <option value="">Select...</option>
                {newBattingTeam.players?.map((p: Player) => (
                  <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Opening Bowler *</label>
            <select className="input" value={bowler} onChange={e => setBowler(e.target.value)}>
              <option value="">Select...</option>
              {newBowlingTeam.players?.map((p: Player) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button
            onClick={() => onConfirm({
              opening_batsman1_id: Number(batsman1),
              opening_batsman2_id: Number(batsman2),
              opening_bowler_id: Number(bowler),
            })}
            disabled={!canSubmit || isLoading}
            className="btn-primary text-sm disabled:opacity-40"
          >
            {isLoading ? 'Starting 2nd innings...' : 'Start 2nd Innings →'}
          </button>
        </div>
      </div>
    </div>
  );
}
