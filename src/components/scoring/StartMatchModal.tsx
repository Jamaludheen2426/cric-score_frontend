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
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-hairline rounded-2xl w-full max-w-xl my-8 p-8 shadow-lift">
        <p className="eyebrow mb-3">Open play</p>
        <h2 className="text-h2 mb-2">Toss &amp; opening players</h2>
        <p className="text-[14px] text-ink-soft mb-8">Set the toss and the openers — the desk opens on confirm.</p>

        <div className="space-y-6">
          {/* Toss */}
          <div>
            <label className="label">Toss won by</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-soft rounded-lg">
              {[match.teamA, match.teamB].map(t => {
                if (!t) return null;
                const active = String(t.id) === tossWinner;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTossWinner(String(t.id))}
                    className={`px-4 py-3 rounded-md transition-all text-[14px] font-medium ${
                      active ? 'bg-surface text-ink shadow-soft' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {tossWinner && (
            <div>
              <label className="label">Elected to</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-soft rounded-lg">
                {(['bat', 'bowl'] as const).map(opt => {
                  const active = electedTo === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setElectedTo(opt)}
                      className={`px-4 py-3 rounded-md transition-all text-[14px] font-medium capitalize ${
                        active ? 'bg-surface text-ink shadow-soft' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {battingTeam && (
                <p className="text-[13px] text-ink-soft mt-2">
                  <strong className="text-ink font-medium">{battingTeam.name}</strong> bats first.
                </p>
              )}
            </div>
          )}

          {battingTeam?.players && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Opening bat 1</label>
                <select className="input" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                  <option value="">Select…</option>
                  {battingTeam.players.map((p: Player) => (
                    <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Opening bat 2</label>
                <select className="input" value={batsman2} onChange={e => setBatsman2(e.target.value)}>
                  <option value="">Select…</option>
                  {battingTeam.players.map((p: Player) => (
                    <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {bowlingTeam?.players && (
            <div>
              <label className="label">Opening bowler</label>
              <select className="input" value={bowler} onChange={e => setBowler(e.target.value)}>
                <option value="">Select…</option>
                {bowlingTeam.players.map((p: Player) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-6 mt-8 border-t border-hairline">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleConfirm} disabled={!canSubmit || isLoading} className="btn-primary">
            {isLoading ? 'Opening…' : 'Begin play →'}
          </button>
        </div>
      </div>
    </div>
  );
}
