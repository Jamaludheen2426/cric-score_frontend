'use client';

import { Innings } from '@/types';

interface Props {
  innings: Innings;
}

export function BatsmenTable({ innings }: Props) {
  const batsmen = [innings.batsman1, innings.batsman2].filter(Boolean);
  const cards = innings.battingCards || [];

  return (
    <section className="slab">
      <header className="flex items-center justify-between mb-4">
        <span className="overline">at the crease</span>
        <span className="eyebrow">batting</span>
      </header>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_44px_44px_36px_36px_56px] gap-2 pb-2 mb-1 border-b border-canvas-ridge">
        <span className="eyebrow">batsman</span>
        <span className="eyebrow text-right">R</span>
        <span className="eyebrow text-right">B</span>
        <span className="eyebrow text-right">4s</span>
        <span className="eyebrow text-right">6s</span>
        <span className="eyebrow text-right">SR</span>
      </div>

      <div>
        {batsmen.map(b => {
          if (!b) return null;
          const card = cards.find(c => c.player_id === b.id);
          const isOnStrike = innings.on_strike_batsman_id === b.id;
          const sr = card && card.balls > 0 ? ((card.runs / card.balls) * 100).toFixed(1) : '—';

          return (
            <div
              key={b.id}
              className={`grid grid-cols-[1fr_44px_44px_36px_36px_56px] gap-2 items-baseline py-3 border-b border-canvas-ridge last:border-b-0 ${
                isOnStrike ? 'bg-saffron-500/[0.06] -mx-2 px-2 border-l-2 border-l-saffron-500' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  {isOnStrike && (
                    <span className="text-saffron-500 font-mono text-[10px] -ml-3" aria-label="on strike">●</span>
                  )}
                  <span className="font-display text-[18px] uppercase tracking-tight text-ink truncate">
                    {b.name}
                  </span>
                </div>
              </div>
              <span className="num-md text-ink text-right">{card?.runs ?? 0}</span>
              <span className="num-sm text-ink-muted text-right">{card?.balls ?? 0}</span>
              <span className="num-sm text-ink-muted text-right">{card?.fours ?? 0}</span>
              <span className="num-sm text-ink-muted text-right">{card?.sixes ?? 0}</span>
              <span className="num-sm text-ink-muted text-right">{sr}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
