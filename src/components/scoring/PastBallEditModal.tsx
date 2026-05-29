'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { BallRecord, OverSummary } from '@/types';
import { getBallColor, getBallLabel } from '@/lib/utils';

interface Row {
  label: string;
  ball: BallRecord;
}

export function PastBallEditModal({
  overs,
  currentOver,
  onConfirm,
  onClose,
  isLoading,
}: {
  overs: OverSummary[];
  currentOver?: OverSummary | null;
  onConfirm: (ballId: number, data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const rows = useMemo<Row[]>(() => {
    const all = [...overs, ...(currentOver ? [currentOver] : [])];
    return all.flatMap(over => over.balls.map((ball, index) => ({ label: `${over.over_number}.${index + 1}`, ball }))).filter(row => row.ball.id);
  }, [overs, currentOver]);
  const [selectedId, setSelectedId] = useState<number | undefined>(rows[rows.length - 1]?.ball.id);
  const selected = rows.find(row => row.ball.id === selectedId)?.ball;
  const [runs, setRuns] = useState(String(selected?.runs ?? 0));
  const [extras, setExtras] = useState(String(selected?.extras ?? 0));
  const [mode, setMode] = useState<'normal' | 'wide' | 'noball' | 'bye' | 'leg_bye'>(selected?.is_wide ? 'wide' : selected?.is_noball ? 'noball' : selected?.extra_type === 'bye' ? 'bye' : selected?.extra_type === 'leg_bye' ? 'leg_bye' : 'normal');
  const [isWicket, setIsWicket] = useState(Boolean(selected?.is_wicket));

  const choose = (row: Row) => {
    setSelectedId(row.ball.id);
    setRuns(String(row.ball.runs));
    setExtras(String(row.ball.extras));
    setMode(row.ball.is_wide ? 'wide' : row.ball.is_noball ? 'noball' : row.ball.extra_type === 'bye' ? 'bye' : row.ball.extra_type === 'leg_bye' ? 'leg_bye' : 'normal');
    setIsWicket(Boolean(row.ball.is_wicket));
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4">
      <div className="w-full max-w-[520px] rounded border border-[var(--border)] bg-[var(--bg-card)]">
        <header className="flex h-11 items-center justify-between border-b border-[var(--border)] px-3">
          <h2 className="text-[14px] font-bold">Edit past ball</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)]"><X size={18} /></button>
        </header>
        <div className="grid gap-3 p-3">
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
            {rows.map(row => (
              <button
                key={`${row.label}-${row.ball.id}`}
                onClick={() => choose(row)}
                className={`rounded border px-2 py-1 text-[11px] font-bold ${row.ball.id === selectedId ? 'border-[var(--green)] bg-[#edf7ee]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'}`}
              >
                {row.label} <span className={getBallColor(row.ball)}>{getBallLabel(row.ball)}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="label">Bat runs</span>
              <input className="input" type="number" min={0} value={runs} onChange={e => setRuns(e.target.value)} />
            </label>
            <label>
              <span className="label">Extras</span>
              <input className="input" type="number" min={0} value={extras} onChange={e => setExtras(e.target.value)} />
            </label>
          </div>
          <select className="input" value={mode} onChange={e => setMode(e.target.value as any)}>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
            <option value="noball">No ball</option>
            <option value="bye">Bye</option>
            <option value="leg_bye">Leg bye</option>
          </select>
          <label className="flex items-center gap-2 text-[13px] font-semibold">
            <input type="checkbox" checked={isWicket} onChange={e => setIsWicket(e.target.checked)} />
            Wicket on this ball
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button
              disabled={!selectedId || isLoading}
              onClick={() => selectedId && onConfirm(selectedId, {
                runs: Number(runs) || 0,
                extras: Number(extras) || 0,
                is_wide: mode === 'wide',
                is_noball: mode === 'noball',
                extra_type: mode === 'bye' || mode === 'leg_bye' ? mode : undefined,
                is_wicket: isWicket,
                wicket_type: isWicket ? (selected?.wicket_type || 'run_out') : undefined,
              })}
              className="btn btn-primary"
            >
              {isLoading ? 'Saving' : 'Apply edit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
