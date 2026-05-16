'use client';

import { useState } from 'react';

interface Props {
  onBall: (data: any) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

type BallType = 'normal' | 'wide' | 'noball';

const RUN_BTNS: Array<{ runs: number; kind: 'dot' | 'run' | 'four' | 'six'; sub?: string }> = [
  { runs: 0, kind: 'dot',  sub: 'dot' },
  { runs: 1, kind: 'run' },
  { runs: 2, kind: 'run' },
  { runs: 3, kind: 'run' },
  { runs: 4, kind: 'four', sub: 'boundary' },
  { runs: 6, kind: 'six',  sub: 'maximum' },
];

export function BallInputPanel({ onBall, disabled, isLoading }: Props) {
  const [ballType, setBallType] = useState<BallType>('normal');

  const handleRun = (runs: number) => {
    onBall({
      runs,
      is_wide: ballType === 'wide',
      is_noball: ballType === 'noball',
    });
    setBallType('normal');
  };

  const handleWicket = () => {
    onBall({
      runs: 0,
      is_wide: false,
      is_noball: ballType === 'noball',
      is_wicket: true,
    });
    setBallType('normal');
  };

  const kindClass = (kind: string) => {
    switch (kind) {
      case 'dot':  return 'bg-surface border-hairline-strong text-ink-soft hover:border-ink hover:text-ink';
      case 'run':  return 'bg-surface border-hairline-strong text-ink hover:border-ink hover:bg-surface-soft';
      case 'four': return 'bg-pitch-soft border-pitch/30 text-pitch hover:border-pitch';
      case 'six':  return 'bg-accent border-accent text-white hover:bg-accent-strong';
      default:     return '';
    }
  };

  return (
    <section className={`card rise rise-d3 transition-opacity ${disabled ? 'opacity-60' : ''}`}>
      <header className="flex items-center justify-between mb-6">
        <h3 className="text-h3">Ball input</h3>
        {isLoading
          ? <span className="text-[12px] text-accent font-medium">Saving…</span>
          : <span className="eyebrow">scorer&apos;s desk</span>}
      </header>

      {/* Ball type segmented switch */}
      <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-surface-soft rounded-lg">
        {([
          { key: 'normal', label: 'Legal',   sub: 'counts' },
          { key: 'wide',   label: 'Wide',    sub: '+1 / +2 death' },
          { key: 'noball', label: 'No-ball', sub: '+1' },
        ] as const).map(opt => {
          const active = ballType === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setBallType(opt.key)}
              className={`px-4 py-2.5 rounded-md transition-all ${
                active
                  ? 'bg-surface text-ink shadow-soft'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <div className="font-medium text-[14px]">{opt.label}</div>
              <div className="text-[11px] text-ink-mute mt-0.5">{opt.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Run grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {RUN_BTNS.map(({ runs, kind, sub }) => (
          <button
            key={runs}
            onClick={() => handleRun(runs)}
            disabled={disabled}
            className={`relative h-20 sm:h-24 rounded-lg border font-semibold text-3xl transition-all active:translate-y-px disabled:opacity-40 ${kindClass(kind)}`}
          >
            <span>{ballType !== 'normal' ? (runs === 0 ? '0' : `+${runs}`) : runs}</span>
            {sub && (
              <span className={`absolute bottom-2 inset-x-0 text-[10px] uppercase tracking-eyebrow font-normal opacity-70 ${kind === 'six' ? 'text-white/80' : ''}`}>
                {sub}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Wicket */}
      <button
        onClick={handleWicket}
        disabled={disabled}
        className="mt-3 w-full h-14 sm:h-16 rounded-lg bg-surface border border-wicket text-wicket hover:bg-wicket hover:text-white transition-all font-medium text-[16px] tracking-wide active:translate-y-px disabled:opacity-40"
      >
        Wicket
      </button>

      <p className="mt-5 text-[12px] text-ink-mute text-center">
        Choose a delivery type, then tap the run.
      </p>
    </section>
  );
}
