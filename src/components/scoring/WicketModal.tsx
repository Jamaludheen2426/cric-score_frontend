'use client';

import { useState } from 'react';
import { Player, WicketType } from '@/types';

const WICKET_TYPES: { value: WicketType; label: string; abbr: string }[] = [
  { value: 'bowled',            label: 'Bowled',            abbr: 'b' },
  { value: 'caught',            label: 'Caught',            abbr: 'c' },
  { value: 'lbw',               label: 'LBW',               abbr: 'lbw' },
  { value: 'run_out',           label: 'Run out',           abbr: 'r/o' },
  { value: 'stumped',           label: 'Stumped',           abbr: 'st' },
  { value: 'hit_wicket',        label: 'Hit wicket',        abbr: 'hw' },
  { value: 'obstructing_field', label: 'Obstructing field', abbr: 'obs' },
  { value: 'retired',           label: 'Retired',           abbr: 'ret' },
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
    <div className="fixed inset-0 bg-canvas/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-canvas-raised border w-full max-w-lg slab-accent" style={{ borderColor: 'rgba(204,75,75,0.35)' }}>
        <div className="overline" style={{ color: '#CC4B4B' }}>he&apos;s gone</div>
        <h2 className="font-display text-4xl uppercase text-ink leading-none mt-2">Wicket.</h2>
        <p className="font-editorial italic text-ink-muted text-[13px] mt-2 mb-5">
          File the mode of dismissal and the next man in.
        </p>

        {/* Dismissal type */}
        <div className="mb-5">
          <label className="label">mode of dismissal</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-canvas-ridge">
            {WICKET_TYPES.map(wt => {
              const active = wicketType === wt.value;
              return (
                <button
                  key={wt.value}
                  onClick={() => setWicketType(wt.value)}
                  className={`px-3 py-2.5 text-left transition-colors ${
                    active ? 'bg-wicket-500 text-ink' : 'bg-canvas-raised text-ink-muted hover:bg-canvas-ridge'
                  }`}
                >
                  <div className={`font-display text-[13px] uppercase tracking-wider ${active ? '' : 'text-ink'}`}>
                    {wt.label}
                  </div>
                  <div className={`font-mono text-[9px] uppercase tracking-widest ${active ? 'text-ink/70' : 'text-ink-dim'}`}>
                    {wt.abbr}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dismissed batsman */}
        <div className="mb-5">
          <label className="label">player dismissed</label>
          <div className="grid grid-cols-2 gap-px bg-canvas-ridge">
            {batsmen.filter(Boolean).map(b => {
              const active = dismissedId === b!.id;
              return (
                <button
                  key={b!.id}
                  onClick={() => setDismissedId(b!.id)}
                  className={`px-3 py-3 text-left transition-colors ${
                    active ? 'bg-wicket-500 text-ink' : 'bg-canvas-raised text-ink-muted hover:bg-canvas-ridge'
                  }`}
                >
                  <div className={`font-display text-[15px] uppercase tracking-tight ${active ? '' : 'text-ink'}`}>
                    {b!.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* New batsman */}
        {newBatsmenPool.length > 0 ? (
          <div className="mb-5">
            <label className="label">next man in</label>
            <select className="input" value={newBatsmanId} onChange={e => setNewBatsmanId(e.target.value)}>
              <option value="">Choose…</option>
              {newBatsmenPool.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-5 p-3 border-l-2 border-saffron-500 bg-canvas-deep">
            <p className="font-mono text-[10px] text-saffron-500 uppercase tracking-widest">no batsmen left</p>
            <p className="font-editorial italic text-ink-muted text-[13px] mt-1">All out — the innings closes on this delivery.</p>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2 border-t border-canvas-ridge">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={handleConfirm} className="btn-danger btn-sm">Confirm wicket →</button>
        </div>
      </div>
    </div>
  );
}
