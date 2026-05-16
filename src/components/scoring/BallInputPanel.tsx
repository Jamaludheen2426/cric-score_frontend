'use client';

import { useState } from 'react';

interface Props {
  onBall: (data: any) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

type BallType = 'normal' | 'wide' | 'noball';

const RUN_BTNS: Array<{ runs: number; kind: 'dot' | 'run' | 'four' | 'six' }> = [
  { runs: 0, kind: 'dot' },
  { runs: 1, kind: 'run' },
  { runs: 2, kind: 'run' },
  { runs: 3, kind: 'run' },
  { runs: 4, kind: 'four' },
  { runs: 6, kind: 'six' },
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
      case 'dot':  return 'border-canvas-ridge bg-canvas-raised text-ink-muted hover:border-ink-muted';
      case 'run':  return 'border-canvas-ridge bg-canvas-raised text-ink hover:border-ink hover:bg-canvas-ridge';
      case 'four': return 'border-pitch-500 bg-pitch-500/15 text-pitch-400 hover:bg-pitch-500/25';
      case 'six':  return 'border-saffron-500 bg-saffron-500 text-canvas hover:bg-saffron-400';
      default:     return '';
    }
  };

  return (
    <section className={`slab transition-opacity ${disabled ? 'opacity-60' : ''}`}>
      <header className="flex items-center justify-between mb-5">
        <span className="overline">scorer&apos;s desk</span>
        <div className="flex items-center gap-3">
          {isLoading && <span className="font-mono text-[10px] text-saffron-500 uppercase tracking-widest animate-flicker">filing…</span>}
          <span className="eyebrow">ball input</span>
        </div>
      </header>

      {/* Ball type segmented switch */}
      <div className="grid grid-cols-3 gap-px bg-canvas-ridge mb-5">
        {([
          { key: 'normal', label: 'Legal',   sub: '6 ball' },
          { key: 'wide',   label: 'Wide',    sub: '+1 / +2 death' },
          { key: 'noball', label: 'No-ball', sub: '+1' },
        ] as const).map(opt => {
          const active = ballType === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setBallType(opt.key)}
              className={`px-4 py-3 text-left transition-colors ${
                active
                  ? opt.key === 'normal'
                    ? 'bg-saffron-500 text-canvas'
                    : 'bg-ochre-500 text-canvas'
                  : 'bg-canvas-raised text-ink-muted hover:bg-canvas-ridge'
              }`}
            >
              <div className={`font-display text-[16px] uppercase tracking-widest2 ${active ? '' : 'text-ink'}`}>
                {opt.label}
              </div>
              <div className={`font-mono text-[10px] uppercase tracking-widest ${active ? 'text-canvas/70' : 'text-ink-dim'}`}>
                {opt.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Run grid */}
      <div className="grid grid-cols-6 gap-2">
        {RUN_BTNS.map(({ runs, kind }) => (
          <button
            key={runs}
            onClick={() => handleRun(runs)}
            disabled={disabled}
            className={`relative h-20 border-2 font-display text-3xl font-black transition-all active:translate-y-[1px] disabled:opacity-40 ${kindClass(kind)}`}
          >
            <span>{ballType !== 'normal' ? (runs === 0 ? '0' : `+${runs}`) : runs}</span>
            {kind === 'four' && <span className="absolute top-1.5 right-2 font-mono text-[9px] uppercase tracking-widest opacity-70">boundary</span>}
            {kind === 'six' && <span className="absolute top-1.5 right-2 font-mono text-[9px] uppercase tracking-widest text-canvas/70">maximum</span>}
            {kind === 'dot' && <span className="absolute top-1.5 right-2 font-mono text-[9px] uppercase tracking-widest opacity-50">dot</span>}
          </button>
        ))}
      </div>

      {/* Wicket */}
      <button
        onClick={handleWicket}
        disabled={disabled}
        className="mt-3 w-full h-16 bg-wicket-500 hover:bg-wicket-600 text-ink font-display text-2xl uppercase tracking-widest2 transition-colors active:translate-y-[1px] disabled:opacity-40"
      >
        Wicket
      </button>

      <p className="mt-4 font-mono text-[10px] text-ink-dim uppercase tracking-widest text-center">
        select a delivery type, then tap the run — wicket clears modifiers.
      </p>
    </section>
  );
}
