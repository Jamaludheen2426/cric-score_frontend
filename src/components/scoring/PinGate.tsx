'use client';

import { useState } from 'react';
import { useVerifyPin } from '@/lib/queries';

export function PinGate({ matchId, onSuccess }: { matchId: number; onSuccess: (token: string) => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const verifyPin = useVerifyPin();

  const handleSubmit = async () => {
    setError('');
    try {
      const data = await verifyPin.mutateAsync({ id: matchId, pin });
      onSuccess(data.token);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Key rejected — try again.');
      setPin('');
    }
  };

  return (
    <div className="page flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md slab-accent">
        <div className="overline mb-3">restricted access</div>
        <h2 className="font-display text-4xl uppercase text-ink leading-none mb-1">
          The scorer&apos;s
        </h2>
        <h2 className="font-display text-4xl uppercase text-saffron-500 leading-none mb-4">
          press box.
        </h2>
        <p className="font-editorial italic text-ink-muted text-[14px] leading-relaxed mb-7">
          Issued at fixture-open. The four digits prove you&apos;re behind the line.
        </p>

        <label className="label">scorer key</label>
        <input
          className="input-mono text-center text-3xl tracking-[0.45em] py-4 text-saffron-500"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="••••"
          autoFocus
        />

        {error && (
          <p className="mt-3 font-mono text-[11px] text-wicket-500 uppercase tracking-widest">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={pin.length < 4 || verifyPin.isPending}
          className="btn-primary btn-lg w-full mt-5"
        >
          {verifyPin.isPending ? 'Verifying…' : 'Enter the desk →'}
        </button>

        <div className="mt-6 pt-5 border-t border-canvas-ridge flex items-center justify-between">
          <span className="overline">session lasts</span>
          <span className="font-mono text-[11px] text-ink uppercase tracking-widest">twelve hours</span>
        </div>
      </div>
    </div>
  );
}
