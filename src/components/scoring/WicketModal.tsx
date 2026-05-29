'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Player, WicketType } from '@/types';

const WICKET_TYPES: { value: WicketType; label: string }[] = [
  { value: 'bowled', label: 'Bowled' },
  { value: 'caught', label: 'Caught' },
  { value: 'lbw', label: 'LBW' },
  { value: 'run_out', label: 'Run Out' },
  { value: 'stumped', label: 'Stumped' },
  { value: 'hit_wicket', label: 'Hit Wicket' },
  { value: 'retired_hurt', label: 'Retired Hurt' },
  { value: 'retired_out', label: 'Retired Out' },
];

interface Props {
  batsmen: (Player | undefined)[];
  newBatsmenPool: Player[];
  onStrikeId?: number;
  isNoBall?: boolean;
  onConfirm: (data: any) => void;
  onClose: () => void;
}

const NO_BALL_WICKET_TYPES: WicketType[] = ['run_out', 'obstructing_field', 'retired_hurt', 'retired_out'];

export function WicketModal({ batsmen, newBatsmenPool, onStrikeId, isNoBall, onConfirm, onClose }: Props) {
  const activeBatsmen = useMemo(() => batsmen.filter(Boolean) as Player[], [batsmen]);
  const striker = activeBatsmen.find(b => b.id === onStrikeId) || activeBatsmen[0];
  const [wicketType, setWicketType] = useState<WicketType>('bowled');
  const [dismissedId, setDismissedId] = useState<number>(striker?.id || 0);
  const [newBatsmanId, setNewBatsmanId] = useState('');
  const [nextStrikerId, setNextStrikerId] = useState('');
  const allowsNonStrikerDismissal = wicketType === 'run_out' || wicketType === 'retired_hurt' || wicketType === 'retired_out';
  const dismissedOptions = useMemo(
    () => allowsNonStrikerDismissal ? activeBatsmen : activeBatsmen.filter(b => b.id === striker?.id),
    [activeBatsmen, allowsNonStrikerDismissal, striker?.id]
  );
  const selectedNewBatsman = newBatsmenPool.find(p => String(p.id) === newBatsmanId);
  const nextStrikerOptions = useMemo(
    () => [
      ...activeBatsmen.filter(b => b.id !== dismissedId),
      selectedNewBatsman,
    ].filter(Boolean) as Player[],
    [activeBatsmen, dismissedId, selectedNewBatsman]
  );

  useEffect(() => {
    if (isNoBall && !NO_BALL_WICKET_TYPES.includes(wicketType)) setWicketType('run_out');
  }, [isNoBall, wicketType]);

  useEffect(() => {
    if (!dismissedOptions.some(b => b.id === dismissedId)) {
      setDismissedId(dismissedOptions[0]?.id || 0);
    }
    setNextStrikerId('');
  }, [dismissedOptions, dismissedId]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4">
      <div className="w-full max-w-[420px] rounded border border-[var(--border)] bg-[var(--bg-card)]">
        <header className="flex h-11 items-center justify-between border-b border-[var(--border)] px-3">
          <h2 className="text-[14px] font-bold">Wicket</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)]"><X size={18} /></button>
        </header>
        <div className="grid gap-3 p-3">
          <p className="eyebrow">Dismissal type</p>
          <div className="grid grid-cols-3 gap-2">
            {WICKET_TYPES.map(wt => {
              const disabled = !!isNoBall && !NO_BALL_WICKET_TYPES.includes(wt.value);
              const active = wicketType === wt.value;
              return <button key={wt.value} disabled={disabled} onClick={() => setWicketType(wt.value)} className={`h-10 rounded border text-[13px] font-semibold ${active ? 'border-[var(--red)] bg-[#fff1f1] text-[var(--red-text)]' : disabled ? 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)]' : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]'}`}>{wt.label}</button>;
            })}
          </div>
          <select className="input" value={dismissedId} onChange={e => setDismissedId(Number(e.target.value))}>
            {dismissedOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {newBatsmenPool.length > 0 && (
            <select className="input" value={newBatsmanId} onChange={e => setNewBatsmanId(e.target.value)}>
              <option value="">Next batsman</option>
              {newBatsmenPool.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {(wicketType === 'run_out' || wicketType === 'retired_hurt') && newBatsmanId && (
            <select className="input" value={nextStrikerId} onChange={e => setNextStrikerId(e.target.value)}>
              <option value="">Who faces next ball?</option>
              {nextStrikerOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button onClick={() => {
            if (newBatsmenPool.length > 0 && !newBatsmanId) return alert('Select next batsman');
            if ((wicketType === 'run_out' || wicketType === 'retired_hurt') && newBatsmanId && !nextStrikerId) return alert('Select who faces next ball');
            onConfirm({
              is_wicket: true,
              wicket_type: wicketType,
              dismissed_player_id: dismissedId,
              new_batsman_id: newBatsmanId ? Number(newBatsmanId) : undefined,
              next_striker_id: nextStrikerId ? Number(nextStrikerId) : undefined,
            });
          }} className="btn btn-danger h-11 w-full">Wicket confirmed</button>
        </div>
      </div>
    </div>
  );
}
