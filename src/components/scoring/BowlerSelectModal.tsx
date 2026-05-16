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
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-hairline rounded-2xl w-full max-w-md p-8 shadow-lift">
        <p className="eyebrow mb-3">Change of bowler</p>
        <h2 className="text-h2 mb-2">Next at the mark</h2>
        <p className="text-[14px] text-ink-soft mb-6">
          The over is complete. Pick the new bowler.
        </p>

        <div className="max-h-72 overflow-y-auto -mx-2 mb-6 border-y border-hairline">
          {players.map(p => {
            const isJustBowled = p.id === currentBowlerId;
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                disabled={isJustBowled}
                className={`w-full text-left px-4 py-3.5 transition-colors border-l-2 ${
                  isSelected ? 'bg-accent-soft border-l-accent text-ink'
                  : isJustBowled ? 'opacity-40 cursor-not-allowed border-l-transparent text-ink-soft'
                  : 'border-l-transparent text-ink hover:bg-surface-soft'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-[15px]">{p.name}</span>
                  {isJustBowled && <span className="text-[11px] text-ink-mute">just bowled</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected || isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Saving…' : 'Confirm →'}
          </button>
        </div>
      </div>
    </div>
  );
}
