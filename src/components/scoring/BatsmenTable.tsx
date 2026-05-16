'use client';

import { Innings } from '@/types';

interface Props {
  innings: Innings;
}

export function BatsmenTable({ innings }: Props) {
  const batsmen = [innings.batsman1, innings.batsman2].filter(Boolean);
  const cards = innings.battingCards || [];

  return (
    <section className="card rise rise-d2">
      <header className="flex items-center justify-between mb-5">
        <h3 className="text-h3">Batting</h3>
        <span className="eyebrow">at the crease</span>
      </header>

      <div className="grid grid-cols-[1fr_44px_44px_36px_36px_56px] gap-3 pb-3 mb-1 border-b border-hairline">
        <span className="eyebrow">Batsman</span>
        <span className="eyebrow text-right">R</span>
        <span className="eyebrow text-right">B</span>
        <span className="eyebrow text-right">4s</span>
        <span className="eyebrow text-right">6s</span>
        <span className="eyebrow text-right">SR</span>
      </div>

      {batsmen.map(b => {
        if (!b) return null;
        const card = cards.find(c => c.player_id === b.id);
        const isOnStrike = innings.on_strike_batsman_id === b.id;
        const sr = card && card.balls > 0 ? ((card.runs / card.balls) * 100).toFixed(1) : '—';

        return (
          <div
            key={b.id}
            className={`grid grid-cols-[1fr_44px_44px_36px_36px_56px] gap-3 items-baseline py-4 border-b border-hairline last:border-b-0 ${
              isOnStrike ? 'relative' : ''
            }`}
          >
            <div className="min-w-0 flex items-baseline gap-2">
              {isOnStrike && (
                <span className="text-accent text-[9px]" aria-label="on strike">●</span>
              )}
              <span className={`font-medium text-[15px] truncate ${isOnStrike ? 'text-ink' : 'text-ink-soft'}`}>
                {b.name}
              </span>
            </div>
            <span className="num-md text-right">{card?.runs ?? 0}</span>
            <span className="num-sm text-right">{card?.balls ?? 0}</span>
            <span className="num-sm text-right">{card?.fours ?? 0}</span>
            <span className="num-sm text-right">{card?.sixes ?? 0}</span>
            <span className="num-sm text-right">{sr}</span>
          </div>
        );
      })}
    </section>
  );
}
