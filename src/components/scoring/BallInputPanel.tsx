'use client';

import { useState } from 'react';

interface Props {
  onBall: (data: any) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

type BallType = 'normal' | 'wide' | 'noball';

const RUN_BTNS = [0, 1, 2, 3, 4, 6];

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

  const btnBase = 'h-16 rounded-xl font-display font-bold text-lg transition-all active:scale-95 disabled:opacity-30 select-none';

  return (
    <div className={`card transition-opacity ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xs uppercase tracking-widest text-gray-500">Ball Input</h3>
        {isLoading && (
          <span className="text-xs text-pitch-400 font-display animate-pulse">Saving...</span>
        )}
      </div>

      {/* Ball type toggle */}
      <div className="flex gap-2 mb-4">
        {([
          { key: 'normal', label: 'Normal' },
          { key: 'wide', label: 'Wide' },
          { key: 'noball', label: 'No-ball' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setBallType(key)}
            className={`flex-1 py-1.5 rounded-lg border text-sm font-display transition-colors ${
              ballType === key
                ? key === 'wide' || key === 'noball'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-pitch-600/20 border-pitch-500 text-pitch-400'
                : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Run buttons */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {RUN_BTNS.map(runs => (
          <button
            key={runs}
            onClick={() => handleRun(runs)}
            disabled={disabled}
            className={`${btnBase} ${
              runs === 6
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30'
                : runs === 4
                ? 'bg-pitch-700 hover:bg-pitch-600 text-white shadow-lg shadow-pitch-900/30'
                : runs === 0
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {ballType === 'wide' || ballType === 'noball'
              ? runs === 0
                ? `${ballType === 'wide' ? 'Wd' : 'Nb'}+0`
                : `+${runs}`
              : runs}
          </button>
        ))}
      </div>

      {/* Wicket button */}
      <button
        onClick={handleWicket}
        disabled={disabled}
        className={`${btnBase} w-full bg-rose-700 hover:bg-rose-600 text-white shadow-lg shadow-rose-900/30 mt-1`}
      >
        🏏 WICKET
      </button>
    </div>
  );
}
