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
      setError(e?.response?.data?.error || 'Wrong key. Try again.');
      setPin('');
    }
  };

  return (
    <div className="page-narrow flex items-center justify-center min-h-[70vh]">
      <div className="w-full">
        <p className="eyebrow mb-4 text-center">Restricted</p>
        <h2 className="text-title text-center mb-3">
          The <span className="font-normal text-ink-soft">scorer&apos;s</span> desk.
        </h2>
        <p className="text-[15px] text-ink-soft text-center mb-10 max-w-[400px] mx-auto">
          Enter the key issued when the match was created.
        </p>

        <div className="card max-w-[420px] mx-auto">
          <label className="label">Scorer key</label>
          <input
            className="input-mono text-center text-3xl tracking-[0.55em] py-5 text-accent"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••"
            autoFocus
          />

          {error && <p className="mt-3 text-[13px] text-wicket text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={pin.length < 4 || verifyPin.isPending}
            className="btn-primary btn-lg w-full mt-6"
          >
            {verifyPin.isPending ? 'Verifying…' : 'Enter →'}
          </button>

          <p className="mt-6 pt-5 border-t border-hairline text-[12px] text-ink-mute text-center">
            Sessions stay open for twelve hours.
          </p>
        </div>
      </div>
    </div>
  );
}
