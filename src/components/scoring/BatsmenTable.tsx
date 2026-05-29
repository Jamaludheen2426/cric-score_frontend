'use client';

import { Club as BatIcon } from 'lucide-react';
import { Innings } from '@/types';

interface Props {
  innings: Innings;
}

export function BatsmenTable({ innings }: Props) {
  const batsmen = [innings.batsman1, innings.batsman2].filter(Boolean);
  const cards = innings.battingCards || [];

  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1">
      {batsmen.map((b) => {
        if (!b) return null;
        const card = cards.find(c => c.player_id === b.id);
        const onStrike = innings.on_strike_batsman_id === b.id;
        const runs = card?.runs ?? 0;
        const balls = card?.balls ?? 0;
        const strikeRate = balls ? ((runs / balls) * 100).toFixed(2) : '-';
        return (
          <div
            key={b.id}
            className={`flex h-11 items-center gap-2 border-b border-[var(--border-subtle)] last:border-b-0 ${
              onStrike ? 'border-l-[3px] border-l-[var(--green)] bg-[#f6fbf1] pl-2' : 'pl-[11px]'
            }`}
          >
            <span className="grid w-4 place-items-center text-[var(--green-text)]">
              {onStrike ? <BatIcon size={14} strokeWidth={2.4} aria-label="On strike" /> : null}
            </span>
            <span className={`min-w-0 flex-1 truncate text-[14px] ${onStrike ? 'font-bold text-[var(--text-primary)]' : 'font-semibold text-[var(--text-secondary)]'}`}>{b.name}</span>
            <span className="w-12 text-right text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{runs}{onStrike ? '*' : ''}</span>
            <span className="w-10 text-right text-[12px] tabular-nums text-[var(--text-secondary)]">{balls}b</span>
            <span className="w-14 text-right text-[12px] tabular-nums text-[var(--text-muted)]">{strikeRate}</span>
          </div>
        );
      })}
    </section>
  );
}
