'use client';

import { Player, CurrentOver, BowlingCard } from '@/types';

interface Props {
  bowler: Player;
  over: CurrentOver;
  bowlingCards: BowlingCard[];
}

export function BowlerStats({ bowler, over, bowlingCards }: Props) {
  const card = bowlingCards.find(c => c.player_id === bowler.id);
  const economy = card && card.legal_balls > 0 ? ((card.runs / card.legal_balls) * 6).toFixed(2) : '—';
  const overs = card?.overs != null ? Number(card.overs).toFixed(1) : '0.0';

  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Bowler</p>
      <div className="flex items-center gap-2">
        <span className="text-[var(--green-text)]">●</span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[var(--text-primary)]">{bowler.name}</span>
        <span className="text-[12px] tabular-nums text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">{card?.wickets ?? 0}/{card?.runs ?? 0}</strong>
          <span className="ml-2 text-[var(--text-muted)]">{overs} ov</span>
          <span className="ml-2 text-[var(--text-muted)]">Econ {economy}</span>
        </span>
      </div>
      <p className="mt-1 text-[11px] text-[var(--text-muted)]">Over {over.over_number} · ball {over.legal_balls}/6</p>
    </section>
  );
}
