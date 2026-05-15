'use client';

import { useState } from 'react';
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

  const battingTeamId = tossWinner
    ? (electedTo === 'bat' ? Number(tossWinner) : (Number(tossWinner) === match.team_a_id ? match.team_b_id : match.team_a_id))
    : null;

  const bowlingTeamId = battingTeamId
    ? (battingTeamId === match.team_a_id ? match.team_b_id : match.team_a_id)
    : null;

  const battingTeam = battingTeamId === match.team_a_id ? match.teamA : match.teamB;
  const bowlingTeam = bowlingTeamId === match.team_a_id ? match.teamA : match.teamB;

  const canSubmit = tossWinner && batsman1 && batsman2 && bowler && batsman1 !== batsman2;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({
      toss_winner_team_id: Number(tossWinner),
      elected_to: electedTo,
      opening_batsman1_id: Number(batsman1),
      opening_batsman2_id: Number(batsman2),
      opening_bowler_id: Number(bowler),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-display text-lg font-bold text-white">Start Match</h2>
          <p className="text-gray-500 text-sm mt-0.5">Set toss result and opening players</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Toss */}
          <div>
            <label className="label">Toss Won By</label>
            <select className="input" value={tossWinner} onChange={e => setTossWinner(e.target.value)}>
              <option value="">Select team...</option>
              <option value={match.team_a_id}>{match.teamA?.name}</option>
              <option value={match.team_b_id}>{match.teamB?.name}</option>
            </select>
          </div>

          {tossWinner && (
            <div>
              <label className="label">Elected To</label>
              <div className="flex gap-2">
                {(['bat', 'bowl'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setElectedTo(opt)}
                    className={`flex-1 py-2 rounded-lg border font-display text-sm capitalize transition-colors ${
                      electedTo === opt
                        ? 'bg-pitch-600/20 border-pitch-500 text-pitch-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {battingTeam && (
                <p className="text-xs text-gray-500 mt-1.5">
                  🏏 <strong className="text-gray-300">{battingTeam.name}</strong> will bat first
                </p>
              )}
            </div>
          )}

          {/* Opening batsmen */}
          {battingTeam?.players && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Opening Bat 1 *</label>
                  <select className="input" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                    <option value="">Select...</option>
                    {battingTeam.players.map((p: Player) => (
                      <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Opening Bat 2 *</label>
                  <select className="input" value={batsman2} onChange={e => setBatsman2(e.target.value)}>
                    <option value="">Select...</option>
                    {battingTeam.players.map((p: Player) => (
                      <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Opening bowler */}
          {bowlingTeam?.players && (
            <div>
              <label className="label">Opening Bowler *</label>
              <select className="input" value={bowler} onChange={e => setBowler(e.target.value)}>
                <option value="">Select...</option>
                {bowlingTeam.players.map((p: Player) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleConfirm} disabled={!canSubmit || isLoading} className="btn-primary disabled:opacity-40">
            {isLoading ? 'Starting...' : 'Start Match →'}
          </button>
        </div>
      </div>
    </div>
  );
}
