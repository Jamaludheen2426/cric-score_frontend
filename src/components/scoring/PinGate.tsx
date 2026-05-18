'use client';

import { useEffect, useRef, useState } from 'react';
import { useVerifyPin } from '@/lib/queries';

export function PinGate({ matchId, onSuccess }: { matchId: number; onSuccess: (token: string) => void }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const verifyPin = useVerifyPin();
  const pin = digits.join('');

  useEffect(() => {
    if (pin.length === 4 && !verifyPin.isPending) {
      verifyPin.mutate({ id: matchId, pin }, {
        onSuccess: data => onSuccess(data.token),
        onError: (e: any) => {
          setError(e?.response?.data?.error || 'Wrong PIN');
          setDigits(['', '', '', '']);
          refs.current[0]?.focus();
        },
      });
    }
  }, [pin]);

  return (
    <div className="grid min-h-[calc(100vh-48px)] place-items-center bg-[var(--bg-app)] px-4">
      <div className="w-full max-w-[320px] text-center">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[.05em] text-[var(--text-muted)]">Scorer access</p>
        <h1 className="mb-2 text-[18px] font-bold text-[var(--text-primary)]">Enter scorer PIN</h1>
        <p className="mb-4 text-[13px] text-[var(--text-secondary)]">Four digits from match setup.</p>
        <div className="grid grid-cols-4 gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el; }}
              className="h-14 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-center text-[24px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--green-bright)]"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(-1);
                setDigits(prev => prev.map((d, idx) => idx === i ? value : d));
                if (value) refs.current[i + 1]?.focus();
              }}
              autoFocus={i === 0}
            />
          ))}
        </div>
        {error && <p className="mt-3 text-[12px] font-semibold text-[var(--red-text)]">{error}</p>}
      </div>
    </div>
  );
}
