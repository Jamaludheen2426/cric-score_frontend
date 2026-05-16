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
    <section className="card rise rise-d2">
      <header className="flex items-center justify-between mb-5">
        <h3 className="text-h3">Bowling</h3>
        <span className="eyebrow">at the mark</span>
      </header>

      <div className="grid grid-cols-[1fr_44px_44px_44px_56px] gap-3 pb-3 mb-1 border-b border-hairline">
        <span className="eyebrow">Bowler</span>
        <span className="eyebrow text-right">O</span>
        <span className="eyebrow text-right">R</span>
        <span className="eyebrow text-right">W</span>
        <span className="eyebrow text-right">Econ</span>
      </div>

      <div className="grid grid-cols-[1fr_44px_44px_44px_56px] gap-3 items-baseline py-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-accent text-[9px]">●</span>
            <span className="font-medium text-[15px] text-ink truncate">{bowler.name}</span>
          </div>
          <div className="text-[12px] text-ink-mute mt-1">
            Ball {over.legal_balls}/6 · Over {over.over_number}
          </div>
        </div>
        <span className="num-md text-right">{card?.overs?.toFixed(1) ?? '0.0'}</span>
        <span className="num-md text-right">{card?.runs ?? 0}</span>
        <span className="num-md text-accent text-right">{card?.wickets ?? 0}</span>
        <span className="num-sm text-right">{economy}</span>
      </div>
    </section>
  );
}
