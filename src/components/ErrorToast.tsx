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
    <div className="toast" role="alert">
      <div className="w-2 h-2 rounded-full bg-wicket mt-2 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-ink">Something went wrong</p>
        <p className="text-[13px] text-ink-soft mt-0.5 break-words">{msg}</p>
      </div>
      <button
        onClick={() => setMsg(null)}
        className="p-1 text-ink-mute hover:text-ink rounded transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
