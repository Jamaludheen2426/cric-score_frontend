'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Innings, Player } from '@/types';

interface Props {
  mode: 'batter' | 'bowler';
  innings: Innings;
  battingPlayers: Player[];
  bowlingPlayers: Player[];
  onConfirm: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function CorrectionModal({ mode, innings, battingPlayers, bowlingPlayers, onConfirm, onClose, isLoading }: Props) {
  const [batsman1, setBatsman1] = useState(String(innings.current_batsman1_id || ''));
  const [batsman2, setBatsman2] = useState(String(innings.current_batsman2_id || ''));
  const [striker, setStriker] = useState(String(innings.on_strike_batsman_id || ''));
  const [bowler, setBowler] = useState(String(innings.current_bowler_id || ''));

  const canSubmitBatter = batsman1 && batsman2 && batsman1 !== batsman2 && [batsman1, batsman2].includes(striker);
  const canSubmitBowler = bowler && Number(bowler) !== innings.current_bowler_id;

  const title = mode === 'batter' ? 'Correct batsmen' : 'Change bowler';

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4">
      <div className="w-full max-w-[440px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-xl">
        <header className="flex h-12 items-center justify-between border-b border-[var(--border)] px-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Scorer correction</p>
            <h2 className="text-[14px] font-bold uppercase text-[var(--text-primary)]">{title}</h2>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">
            <X size={16} />
          </button>
        </header>

        {mode === 'batter' ? (
          <div className="space-y-3 p-3">
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="label">Batter 1</span>
                <select className="input" value={batsman1} onChange={e => {
                  setBatsman1(e.target.value);
                  if (striker && striker !== e.target.value && striker !== batsman2) setStriker(e.target.value);
                }}>
                  <option value="">Select</option>
                  {battingPlayers.map(p => (
                    <option key={p.id} value={p.id} disabled={String(p.id) === batsman2}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Batter 2</span>
                <select className="input" value={batsman2} onChange={e => {
                  setBatsman2(e.target.value);
                  if (striker && striker !== batsman1 && striker !== e.target.value) setStriker(e.target.value);
                }}>
                  <option value="">Select</option>
                  {battingPlayers.map(p => (
                    <option key={p.id} value={p.id} disabled={String(p.id) === batsman1}>{p.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="label">On strike</span>
              <select className="input" value={striker} onChange={e => setStriker(e.target.value)}>
                <option value="">Select striker</option>
                {battingPlayers
                  .filter(p => [batsman1, batsman2].includes(String(p.id)))
                  .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <p className="text-[11px] text-[var(--text-muted)]">
              Use this for a wrong selected batter, retired hurt, substitute, or manual strike correction.
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-3">
            <label>
              <span className="label">Current bowler</span>
              <select className="input" value={bowler} onChange={e => setBowler(e.target.value)}>
                <option value="">Select bowler</option>
                {bowlingPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <p className="text-[11px] text-[var(--text-muted)]">
              If the bowler is changed mid-over, future balls use the new bowler.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] p-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            disabled={isLoading || (mode === 'batter' ? !canSubmitBatter : !canSubmitBowler)}
            onClick={() => {
              if (mode === 'batter') {
                onConfirm({
                  current_batsman1_id: Number(batsman1),
                  current_batsman2_id: Number(batsman2),
                  on_strike_batsman_id: Number(striker),
                });
              } else {
                onConfirm({ current_bowler_id: Number(bowler) });
              }
            }}
            className="btn btn-primary"
          >
            {isLoading ? 'Saving' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
