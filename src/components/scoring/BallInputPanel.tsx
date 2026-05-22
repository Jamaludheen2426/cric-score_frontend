'use client';

import { useState } from 'react';

interface Props {
  onBall: (data: any) => void;
  onUndo?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  canUndo?: boolean;
}

type Extra = 'normal' | 'wide' | 'noball';
const RUNS = [0, 1, 2, 3, 4, 6];

export function BallInputPanel({ onBall, onUndo, disabled, isLoading, canUndo }: Props) {
  const [runs, setRuns] = useState(0);
  const [extra, setExtra] = useState<Extra>('normal');

  const add = (isWicket = false) => {
    onBall({
      runs,
      is_wide: extra === 'wide',
      is_noball: extra === 'noball',
      is_wicket: isWicket,
    });
    setRuns(0);
    setExtra('normal');
  };

  return (
    <section className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)] px-3 pb-4 pt-2 shadow-[0_-4px_16px_rgba(23,33,27,0.08)]">
      <div className="mx-auto max-w-[960px]">
        {isLoading && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded border border-[var(--green)] bg-[#edf7ee] px-3 py-2 text-[11px] font-bold text-[var(--green-text)]">
            <span className="live-dot" /> Posting ball
          </div>
        )}
        <div className="mb-2 flex gap-1.5">
          {RUNS.map(r => (
            <button key={r} disabled={disabled} onClick={() => setRuns(r)} className={`h-11 flex-1 rounded border text-[16px] font-bold ${runs === r ? 'border-[var(--green)] bg-[#dff0e3] text-[var(--green-text)]' : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]'}`}>{r}</button>
          ))}
        </div>
        <div className="mb-2 flex gap-1.5">
          {[
            ['wide', 'Wide', 'border-[var(--blue)] bg-[#eef4ff] text-[var(--blue-text)]'],
            ['noball', 'No Ball', 'border-[var(--orange)] bg-[#fff7ed] text-[var(--orange-text)]'],
          ].map(([key, label, cls]) => (
            <button key={key} disabled={disabled} onClick={() => setExtra(extra === key ? 'normal' : key as Extra)} className={`h-9 flex-1 rounded border text-[12px] font-bold ${extra === key ? cls : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>{label}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button disabled={disabled} onClick={() => add(true)} className="h-11 flex-1 rounded border border-[var(--red)] bg-[#fff1f1] text-[13px] font-bold text-[var(--red-text)]">Wicket</button>
          <button disabled={!canUndo || disabled} onClick={onUndo} className="h-11 w-20 rounded border border-[var(--border)] bg-[var(--bg-card)] text-[13px] font-bold text-[var(--text-secondary)]">Undo</button>
          <button disabled={disabled} onClick={() => add(false)} className="h-11 flex-[1.5] rounded bg-[var(--green)] text-[13px] font-bold text-white">{isLoading ? 'Saving' : 'Add ball'}</button>
        </div>
      </div>
    </section>
  );
}
