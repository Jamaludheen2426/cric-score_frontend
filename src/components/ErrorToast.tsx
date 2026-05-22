'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function ErrorToast({ registerPush }: { registerPush: (fn: (msg: string) => void) => void }) {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    registerPush((m: string) => {
      setMsg(m);
      const t = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(t);
    });
  }, [registerPush]);

  if (!msg) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex max-w-[380px] items-start gap-3 rounded border border-[var(--red)] bg-[var(--bg-card)] p-3 shadow-lg" role="alert">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--red)]" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-[var(--red-text)]">Request failed</p>
        <p className="mt-0.5 break-words text-[12px] text-[var(--text-secondary)]">{msg}</p>
      </div>
      <button onClick={() => setMsg(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
