'use client';

import { useState } from 'react';
import { Player, WicketType } from '@/types';

const WICKET_TYPES: { value: WicketType; label: string }[] = [
  { value: 'bowled', label: 'Bowled' },
  { value: 'caught', label: 'Caught' },
  { value: 'lbw', label: 'LBW' },
  { value: 'run_out', label: 'Run Out' },
  { value: 'stumped', label: 'Stumped' },
  { value: 'hit_wicket', label: 'Hit Wicket' },
  { value: 'obstructing_field', label: 'Obstructing Field' },
  { value: 'retired', label: 'Retired' },
];

interface Props {
  batsmen: (Player | undefined)[];
  fielders: Player[];
  newBatsmenPool: Player[];
  onConfirm: (data: any) => void;
  onClose: () => void;
}

export function WicketModal({ batsmen, fielders, newBatsmenPool, onConfirm, onClose }: Props) {
  const [wicketType, setWicketType] = useState<WicketType>('bowled');
  const [dismissedId, setDismissedId] = useState<number>(batsmen[0]?.id || 0);
  const [newBatsmanId, setNewBatsmanId] = useState('');

  const handleConfirm = () => {
    if (!newBatsmanId && newBatsmenPool.length > 0) return alert('Select new batsman');
    onConfirm({
      is_wicket: true,
      wicket_type: wicketType,
      dismissed_player_id: dismissedId,
      new_batsman_id: newBatsmanId ? Number(newBatsmanId) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏏</span>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Wicket!</h2>
              <p className="text-gray-500 text-sm">How was the batsman dismissed?</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Dismissal type */}
          <div>
            <label className="label">Dismissal Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {WICKET_TYPES.map(wt => (
                <button
                  key={wt.value}
                  onClick={() => setWicketType(wt.value)}
                  className={`py-1.5 px-2 rounded-lg text-sm font-display border transition-colors text-left ${
                    wicketType === wt.value
                      ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dismissed batsman */}
          <div>
            <label className="label">Dismissed Player</label>
            <div className="flex gap-2">
              {batsmen.filter(Boolean).map(b => (
                <button
                  key={b!.id}
                  onClick={() => setDismissedId(b!.id)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-display transition-colors ${
                    dismissedId === b!.id
                      ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {b!.name}
                </button>
              ))}
            </div>
          </div>

          {/* New batsman */}
          {newBatsmenPool.length > 0 && (
            <div>
              <label className="label">New Batsman</label>
              <select className="input" value={newBatsmanId} onChange={e => setNewBatsmanId(e.target.value)}>
                <option value="">Select next batsman...</option>
                {newBatsmenPool.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleConfirm} className="btn-danger text-sm">
            Confirm Wicket →
          </button>
        </div>
      </div>
    </div>
  );
}
