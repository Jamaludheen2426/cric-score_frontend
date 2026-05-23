'use client';

import { useEffect, useState } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

/**
 * Full-page ball-spinner overlay.
 *
 * Triggers on:
 *  1. Any in-flight mutation (create match, score a ball, end innings, …).
 *     Covered by TanStack Query's useIsMutating() — every useMutation in the
 *     app contributes here automatically, so we don't have to thread booleans.
 *  2. Route transitions. Shown briefly between client-side navigations so the
 *     user gets immediate feedback when they tap a Link, not after the new
 *     page boots up.
 *
 * Stays mounted in Providers and is invisible when idle.
 */
export function GlobalLoader() {
  // ANY in-flight mutation shows the overlay. The user wants visible
  // feedback for every action, including per-ball scoring. The overlay
  // disappears as soon as the request resolves so it doesn't block taps.
  const mutating = useIsMutating();

  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(true);
    const t = setTimeout(() => setNavigating(false), 450);
    return () => clearTimeout(t);
  }, [pathname]);

  const visible = mutating > 0 || navigating;
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(15,18,15,0.35)] backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-7 py-6 shadow-xl">
        <span className="ball-spinner" aria-hidden="true" />
        <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
          {mutating > 0 ? 'Working' : 'Loading'}
        </p>
      </div>
    </div>
  );
}
