'use client';

import { BowlingCard, CurrentOver, Player } from '@/types';

interface Props {
  bowler: Player;
  over: CurrentOver;
  bowlingCards: BowlingCard[];
}

export function BowlerStats({ bowler, over, bowlingCards }: Props) {
  const card = bowlingCards.find(c => c.player_id === bowler.id);
  const figures = `${card?.overs != null ? Number(card.overs).toFixed(1) : '0.0'}-${card?.runs ?? 0}-${card?.wickets ?? 0}`;

  return (
    <section className="flex min-h-10 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2">
      <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[var(--text-primary)]">{bowler.name}</span>
      <span className="text-[13px] text-[var(--text-secondary)]">{figures}</span>
      <span className="text-[12px] text-[var(--blue-text)]">Over {over.over_number}</span>
    </section>
  );
}
