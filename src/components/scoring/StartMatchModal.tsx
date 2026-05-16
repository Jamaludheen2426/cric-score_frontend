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
    <div className="fixed inset-0 bg-canvas/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-canvas-raised w-full max-w-xl slab-accent my-8">
        <div className="overline mb-2">first ball of the day</div>
        <h2 className="font-display text-3xl uppercase text-ink leading-none mb-1">
          Toss &amp; teamsheets
        </h2>
        <p className="font-editorial italic text-ink-muted text-[13px] mb-6">
          Set the toss outcome and the openers. The desk opens on confirm.
        </p>

        <div className="space-y-5">
          {/* Toss */}
          <div>
            <label className="label">toss won by</label>
            <div className="grid grid-cols-2 gap-px bg-canvas-ridge">
              {[match.teamA, match.teamB].map(t => {
                if (!t) return null;
                const active = String(t.id) === tossWinner;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTossWinner(String(t.id))}
                    className={`px-4 py-3 text-left transition-colors ${
                      active ? 'bg-saffron-500 text-canvas' : 'bg-canvas-raised text-ink-muted hover:bg-canvas-ridge'
                    }`}
                  >
                    <div className={`font-display text-lg uppercase tracking-tight ${active ? '' : 'text-ink'}`}>
                      {t.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {tossWinner && (
            <div>
              <label className="label">elected to</label>
              <div className="grid grid-cols-2 gap-px bg-canvas-ridge">
                {(['bat', 'bowl'] as const).map(opt => {
                  const active = electedTo === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setElectedTo(opt)}
                      className={`px-4 py-3 transition-colors ${
                        active ? 'bg-ochre-500 text-canvas' : 'bg-canvas-raised text-ink-muted hover:bg-canvas-ridge'
                      }`}
                    >
                      <div className={`font-display text-lg uppercase tracking-widest2 ${active ? '' : 'text-ink'}`}>
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
              {battingTeam && (
                <p className="font-editorial italic text-ink-muted text-[13px] mt-2">
                  <span className="text-saffron-500 not-italic font-display uppercase tracking-widest2 text-[11px]">batting:</span>{' '}
                  <strong className="text-ink not-italic font-body">{battingTeam.name}</strong>
                </p>
              )}
            </div>
          )}

          {/* Openers */}
          {battingTeam?.players && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">opening bat · 1</label>
                <select className="input" value={batsman1} onChange={e => setBatsman1(e.target.value)}>
                  <option value="">Select…</option>
                  {battingTeam.players.map((p: Player) => (
                    <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">opening bat · 2</label>
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
              <label className="label">opening bowler</label>
              <select className="input" value={bowler} onChange={e => setBowler(e.target.value)}>
                <option value="">Select…</option>
                {bowlingTeam.players.map((p: Player) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-5 mt-5 border-t border-canvas-ridge">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={handleConfirm} disabled={!canSubmit || isLoading} className="btn-primary">
            {isLoading ? 'Opening desk…' : 'Begin play →'}
          </button>
        </div>
      </div>
    </div>
  );
}
