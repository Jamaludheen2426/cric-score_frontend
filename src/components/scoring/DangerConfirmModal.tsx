'use client';

import { AlertTriangle } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DangerConfirmModal({ title, message, confirmLabel, isLoading, onConfirm, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-4">
      <div className="w-full max-w-[380px] rounded-lg border border-[var(--red)] bg-[var(--bg-card)] shadow-xl">
        <div className="flex gap-3 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#fff1f1] text-[var(--red-text)]">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">{title}</h2>
            <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{message}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] p-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="btn btn-danger">
            {isLoading ? 'Working' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
