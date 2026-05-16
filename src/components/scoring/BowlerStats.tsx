'use client';

import { Player, CurrentOver, BowlingCard } from '@/types';

interface Props {
  bowler: Player;
  over: CurrentOver;
  bowlingCards: BowlingCard[];
}

export function BowlerStats({ bowler, over, bowlingCards }: Props) {
  const card = bowlingCards.find(c => c.player_id === bowler.id);
  const economy = card && card.legal_balls > 0
    ? ((card.runs / card.legal_balls) * 6).toFixed(2)
    : '—';

  return (
    <section className="slab">
      <header className="flex items-center justify-between mb-4">
        <span className="overline">on the mark</span>
        <span className="eyebrow">bowling</span>
      </header>

      <div className="grid grid-cols-[1fr_44px_44px_44px_56px] gap-2 pb-2 mb-1 border-b border-canvas-ridge">
        <span className="eyebrow">bowler</span>
        <span className="eyebrow text-right">O</span>
        <span className="eyebrow text-right">R</span>
        <span className="eyebrow text-right">W</span>
        <span className="eyebrow text-right">Econ</span>
      </div>

      <div className="grid grid-cols-[1fr_44px_44px_44px_56px] gap-2 items-baseline py-3 -mx-2 px-2 border-l-2 border-saffron-500 bg-saffron-500/[0.06]">
        <div className="min-w-0">
          <div className="font-display text-[18px] uppercase tracking-tight text-ink truncate">
            {bowler.name}
          </div>
          <div className="font-mono text-[10px] text-ink-dim uppercase tracking-widest mt-1">
            ball {over.legal_balls}/6 · over {over.over_number}
          </div>
        </div>
        <span className="num-md text-ink text-right">{card?.overs?.toFixed(1) ?? '0.0'}</span>
        <span className="num-md text-ink text-right">{card?.runs ?? 0}</span>
        <span className="num-md text-saffron-500 text-right">{card?.wickets ?? 0}</span>
        <span className="num-sm text-ink-muted text-right">{economy}</span>
      </div>
    </section>
  );
}
