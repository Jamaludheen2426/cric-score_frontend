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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-display text-lg font-bold text-white">Select Next Bowler</h2>
          <p className="text-gray-500 text-sm mt-0.5">Over complete — who bowls next?</p>
        </div>
        <div className="p-3 max-h-72 overflow-y-auto">
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              disabled={p.id === currentBowlerId}
              className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-all font-display ${
                selected === p.id
                  ? 'bg-pitch-600/20 border border-pitch-500 text-pitch-300'
                  : p.id === currentBowlerId
                  ? 'opacity-30 cursor-not-allowed text-gray-600 bg-gray-800/30'
                  : 'hover:bg-gray-800 text-gray-300 border border-transparent'
              }`}
            >
              <span>{p.name}</span>
              {p.id === currentBowlerId && (
                <span className="ml-2 text-xs text-gray-600">(just bowled)</span>
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected || isLoading}
            className="btn-primary text-sm disabled:opacity-40"
          >
            {isLoading ? 'Saving...' : 'Confirm →'}
          </button>
        </div>
      </div>
    </div>
  );
}
