'use client';

import { useState } from 'react';
import { Player } from '@/types';

interface Props {
  players: Player[];
  currentBowlerId?: number;
  onSelect: (bowlerId: number) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function BowlerSelectModal({ players, currentBowlerId, onSelect, onClose, isLoading }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 bg-canvas/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-canvas-raised border border-saffron-500/40 w-full max-w-md slab-accent">
        <div className="overline mb-2">change of bowler</div>
        <h2 className="font-display text-3xl uppercase text-ink leading-none">Next at the mark</h2>
        <p className="font-editorial italic text-ink-muted text-[13px] mt-2 mb-5">
          The over is complete. Pick the new bowler to keep play moving.
        </p>

        <div className="max-h-72 overflow-y-auto -mx-2 mb-4">
          {players.map(p => {
            const isJustBowled = p.id === currentBowlerId;
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                disabled={isJustBowled}
                className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${
                  isSelected ? 'bg-saffron-500/15 border-l-saffron-500 text-ink'
                  : isJustBowled ? 'opacity-30 cursor-not-allowed border-l-transparent text-ink-dim'
                  : 'border-l-transparent text-ink-muted hover:bg-canvas-ridge hover:text-ink'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg uppercase tracking-tight">{p.name}</span>
                  {isJustBowled && (
                    <span className="font-mono text-[9px] text-ink-dim uppercase tracking-widest">just bowled</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected || isLoading}
            className="btn-primary btn-sm"
          >
            {isLoading ? 'Filing…' : 'Send him in →'}
          </button>
        </div>
      </div>
    </div>
  );
}
