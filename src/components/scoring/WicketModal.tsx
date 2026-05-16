'use client';

import { useState } from 'react';
import { Player, WicketType } from '@/types';

const WICKET_TYPES: { value: WicketType; label: string }[] = [
  { value: 'bowled',            label: 'Bowled' },
  { value: 'caught',            label: 'Caught' },
  { value: 'lbw',               label: 'LBW' },
  { value: 'run_out',           label: 'Run out' },
  { value: 'stumped',           label: 'Stumped' },
  { value: 'hit_wicket',        label: 'Hit wicket' },
  { value: 'obstructing_field', label: 'Obstructing' },
  { value: 'retired',           label: 'Retired' },
];

interface Props {
  batsmen: (Player | undefined)[];
  fielders: Player[];
  newBatsmenPool: Player[];
  onConfirm: (data: any) => void;
  onClose: () => void;
}

export function WicketModal({ batsmen, newBatsmenPool, onConfirm, onClose }: Props) {
  const [wicketType, setWicketType] = useState<WicketType>('bowled');
  const [dismissedId, setDismissedId] = useState<number>(batsmen[0]?.id || 0);
  const [newBatsmanId, setNewBatsmanId] = useState('');

  const handleConfirm = () => {
    if (!newBatsmanId && newBatsmenPool.length > 0) return alert('Select the new batsman');
    onConfirm({
      is_wicket: true,
      wicket_type: wicketType,
      dismissed_player_id: dismissedId,
      new_batsman_id: newBatsmanId ? Number(newBatsmanId) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-hairline rounded-2xl w-full max-w-xl my-8 p-8 shadow-lift">
        <p className="eyebrow mb-3 text-wicket">Wicket</p>
        <h2 className="text-h2 mb-2">How was the batsman dismissed?</h2>
        <p className="text-[14px] text-ink-soft mb-6">File the mode and the next man in.</p>

        <div className="space-y-6">
          <div>
            <label className="label">Mode of dismissal</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WICKET_TYPES.map(wt => {
                const active = wicketType === wt.value;
                return (
                  <button
                    key={wt.value}
                    onClick={() => setWicketType(wt.value)}
                    className={`px-3 py-2.5 rounded-md text-[13px] font-medium transition-all border ${
                      active ? 'bg-wicket text-white border-wicket'
                            : 'bg-surface text-ink border-hairline-strong hover:border-ink'
                    }`}
                  >
                    {wt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Player dismissed</label>
            <div className="grid grid-cols-2 gap-2">
              {batsmen.filter(Boolean).map(b => {
                const active = dismissedId === b!.id;
                return (
                  <button
                    key={b!.id}
                    onClick={() => setDismissedId(b!.id)}
                    className={`px-4 py-3 rounded-md text-[14px] font-medium transition-all border ${
                      active ? 'bg-wicket text-white border-wicket'
                            : 'bg-surface text-ink border-hairline-strong hover:border-ink'
                    }`}
                  >
                    {b!.name}
                  </button>
                );
              })}
            </div>
          </div>

          {newBatsmenPool.length > 0 ? (
            <div>
              <label className="label">Next man in</label>
              <select className="input" value={newBatsmanId} onChange={e => setNewBatsmanId(e.target.value)}>
                <option value="">Choose…</option>
                {newBatsmenPool.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-4 rounded-md bg-accent-soft border border-accent/20">
              <p className="text-[13px] font-medium text-accent">No batsmen left</p>
              <p className="text-[13px] text-ink-soft mt-1">All out — the innings closes on this ball.</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-6 mt-8 border-t border-hairline">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleConfirm} className="btn-danger">Confirm wicket →</button>
        </div>
      </div>
    </div>
  );
}
