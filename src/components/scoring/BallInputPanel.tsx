'use client';

import { useEffect, useState } from 'react';
import { widePenaltyRuns } from '@/lib/utils';

interface Props {
  onBall: (data: any) => void;
  onUndo?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  canUndo?: boolean;
  currentOverNumber?: number;
  deathOversFrom?: number;
  wideRule?: 'normal' | 'strict';
}

type Extra = 'normal' | 'wide' | 'noball' | 'bye' | 'leg_bye';
const RUNS = [0, 1, 2, 3, 4, 6];

export function BallInputPanel({ onBall, onUndo, disabled, isLoading, canUndo, currentOverNumber = 1, deathOversFrom, wideRule = 'normal' }: Props) {
  const [runs, setRuns] = useState(0);
  const [extra, setExtra] = useState<Extra>('normal');
  const widePenalty = widePenaltyRuns(currentOverNumber, wideRule, deathOversFrom);
  const extraLabel = extra === 'wide' ? `Wide ${widePenalty ? '+1' : '0'}` : extra === 'noball' ? 'No ball' : extra === 'bye' ? 'Bye' : extra === 'leg_bye' ? 'Leg bye' : 'Legal';

  const add = (isWicket = false) => {
    navigator.vibrate?.(20);
    onBall({
      runs,
      is_wide: extra === 'wide',
      is_noball: extra === 'noball',
      extra_type: extra === 'bye' || extra === 'leg_bye' ? extra : undefined,
      is_wicket: isWicket,
    });
    setRuns(0);
    setExtra('normal');
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (disabled) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'SELECT' || target?.tagName === 'TEXTAREA') return;
      if (/^[0-6]$/.test(event.key)) {
        const next = Number(event.key);
        if (RUNS.includes(next)) setRuns(next);
      }
      if (event.key.toLowerCase() === 'w') setExtra(prev => prev === 'wide' ? 'normal' : 'wide');
      if (event.key.toLowerCase() === 'n') setExtra(prev => prev === 'noball' ? 'normal' : 'noball');
      if (event.key.toLowerCase() === 'b') setExtra(prev => prev === 'bye' ? 'normal' : 'bye');
      if (event.key.toLowerCase() === 'l') setExtra(prev => prev === 'leg_bye' ? 'normal' : 'leg_bye');
      if (event.key === 'Enter') add(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, extra, runs]);

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
            ['wide', `Wide ${widePenalty ? '+1' : '0'}`, 'border-[var(--blue)] bg-[#eef4ff] text-[var(--blue-text)]'],
            ['noball', 'No Ball', 'border-[var(--orange)] bg-[#fff7ed] text-[var(--orange-text)]'],
            ['bye', 'Bye', 'border-[#7c3aed] bg-[#f3e8ff] text-[var(--purple-text)]'],
            ['leg_bye', 'Leg Bye', 'border-[#7c3aed] bg-[#f3e8ff] text-[var(--purple-text)]'],
          ].map(([key, label, cls]) => (
            <button key={key} disabled={disabled} onClick={() => setExtra(extra === key ? 'normal' : key as Extra)} className={`h-9 flex-1 rounded border text-[12px] font-bold ${extra === key ? cls : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>{label}</button>
          ))}
        </div>
        <div className="mb-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-center text-[11px] font-semibold text-[var(--text-secondary)]">
          Wide rule: {widePenalty ? 'wide adds 1 run and is re-bowled' : 'wide is re-bowled without penalty run'}
        </div>
        <div className="mb-2 flex items-center justify-between rounded border border-[var(--green)] bg-[#edf7ee] px-3 py-2 text-[12px]">
          <span className="font-bold text-[var(--green-text)]">Review</span>
          <span className="font-semibold text-[var(--text-primary)]">{extraLabel} · {runs} run{runs === 1 ? '' : 's'}</span>
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
