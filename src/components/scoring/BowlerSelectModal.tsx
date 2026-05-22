'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4">
      <div className="w-full max-w-[420px] rounded border border-[var(--border)] bg-[var(--bg-card)]">
        <header className="flex h-11 items-center justify-between border-b border-[var(--border)] px-3">
          <h2 className="text-[14px] font-bold">Select bowler</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)]"><X size={18} /></button>
        </header>
        <div className="max-h-[320px] overflow-y-auto">
          {players.map(p => {
            const disabled = p.id === currentBowlerId;
            const active = selected === p.id;
            return (
              <button key={p.id} disabled={disabled} onClick={() => setSelected(p.id)} className={`flex h-11 w-full items-center justify-between border-b border-[var(--border-subtle)] px-3 text-left ${active ? 'border-l-2 border-l-[var(--green-bright)] bg-[#edf7ee]' : 'bg-[var(--bg-card)]'} ${disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                <span className="text-[14px] font-semibold">{p.name}</span>
                {disabled && <span className="text-[11px] text-[var(--text-muted)]">just bowled</span>}
              </button>
            );
          })}
        </div>
        <div className="p-3">
          <button disabled={!selected || isLoading} onClick={() => selected && onSelect(selected)} className="btn btn-primary w-full">Start over</button>
        </div>
      </div>
    </div>
  );
}
