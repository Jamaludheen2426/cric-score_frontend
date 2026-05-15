'use client';

import { useState } from 'react';
import { useVerifyPin } from '@/lib/queries';
import { Lock } from 'lucide-react';

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
      setError(e?.response?.data?.error || 'Invalid PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="card text-center">
          <div className="w-14 h-14 rounded-2xl bg-pitch-600/20 border border-pitch-600/30 flex items-center justify-center mx-auto mb-5">
            <Lock size={24} className="text-pitch-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-1">Scorer Access</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your 4-digit scorer PIN to begin scoring</p>

          <input
            className="input text-center font-mono text-3xl tracking-[0.5em] mb-3"
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
            <p className="text-rose-400 text-sm mb-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={pin.length < 4 || verifyPin.isPending}
            className="btn-primary w-full py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {verifyPin.isPending ? 'Verifying...' : 'Enter →'}
          </button>
        </div>
      </div>
    </div>
  );
}
