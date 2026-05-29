'use client';

import { useState } from 'react';
import { useVerifyPin } from '@/lib/queries';

export function PinGate({ matchId, onSuccess }: { matchId: number; onSuccess: (token: string) => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [canTakeOver, setCanTakeOver] = useState(false);
  const verifyPin = useVerifyPin();

  const submit = async (force = false) => {
    setError('');
    try {
      const data = await verifyPin.mutateAsync({ id: matchId, pin, force });
      onSuccess(data.token);
    } catch (e: any) {
      const message = e?.response?.data?.error || 'Wrong key. Try again.';
      setError(message);
      setCanTakeOver(message.toLowerCase().includes('already active'));
      if (!message.toLowerCase().includes('already active')) setPin('');
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-48px)] place-items-center bg-[var(--bg-app)] px-4">
      <div className="w-full max-w-[360px] rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
        <p className="eyebrow mb-3">Scoring Desk</p>
        <h1 className="text-[18px] font-bold text-[var(--text-primary)]">Enter scorer key</h1>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">The PIN issued when the match was created.</p>

        <input
          className="input-mono mt-4 h-12 text-center text-[24px] tracking-[0.4em] text-[var(--green-text)]"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="••••"
          autoFocus
        />

        {error && <p className="mt-2 text-[12px] text-[var(--red-text)]">{error}</p>}

        <button onClick={() => submit()} disabled={pin.length < 4 || verifyPin.isPending} className="btn btn-primary mt-4 h-11 w-full">
          {verifyPin.isPending ? 'Verifying' : 'Enter'}
        </button>
        {canTakeOver && (
          <button onClick={() => submit(true)} disabled={verifyPin.isPending} className="btn btn-secondary mt-2 h-10 w-full">
            Take over scorer
          </button>
        )}
        <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">Sessions stay open for 12 hours.</p>
      </div>
    </div>
  );
}
