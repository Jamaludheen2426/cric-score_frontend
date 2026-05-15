'use client';

import { Innings } from '@/types';

interface Props {
  innings: Innings;
}

export function BatsmenTable({ innings }: Props) {
  const batsmen = [innings.batsman1, innings.batsman2].filter(Boolean);
  const cards = innings.battingCards || [];

  return (
    <div className="card">
      <h3 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">Batting</h3>
      <div className="space-y-1">
        {batsmen.map(b => {
          if (!b) return null;
          const card = cards.find(c => c.player_id === b.id);
          const isOnStrike = innings.on_strike_batsman_id === b.id;
          const sr = card && card.balls > 0 ? ((card.runs / card.balls) * 100).toFixed(0) : '-';

          return (
            <div key={b.id} className={`flex items-center gap-3 p-2 rounded-lg ${isOnStrike ? 'bg-pitch-600/10 border border-pitch-600/20' : 'bg-gray-800/40'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {isOnStrike && <span className="text-pitch-400 text-xs">*</span>}
                  <span className="font-display font-medium text-gray-200 truncate">{b.name}</span>
                </div>
              </div>
              <div className="flex gap-4 text-right shrink-0">
                <div>
                  <p className="font-mono font-bold text-white text-lg leading-none">{card?.runs ?? 0}</p>
                  <p className="text-xs text-gray-600 font-mono">{card?.balls ?? 0}b</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 font-mono">4s: {card?.fours ?? 0}</p>
                  <p className="text-xs text-gray-500 font-mono">6s: {card?.sixes ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-mono">SR</p>
                  <p className="text-xs text-gray-300 font-mono">{sr}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
