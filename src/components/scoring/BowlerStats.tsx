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
    : '-';

  return (
    <div className="card">
      <h3 className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">Bowling</h3>
      <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/40 border border-gray-700">
        <div className="flex-1">
          <p className="font-display font-medium text-gray-200">{bowler.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">Over {over.over_number} — {over.legal_balls}/6 balls</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="font-mono font-bold text-white text-lg leading-none">{card?.wickets ?? 0}/{card?.runs ?? 0}</p>
            <p className="text-xs text-gray-600 font-mono">{card?.overs ?? 0} ov</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-mono">Econ</p>
            <p className="text-xs text-gray-300 font-mono">{economy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
