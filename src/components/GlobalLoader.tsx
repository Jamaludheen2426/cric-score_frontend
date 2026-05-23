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
  // Blocking overlay: any in-flight mutation EXCEPT ones tagged 'quiet'.
  const blocking = useIsMutating({
    predicate: (m) => {
      const key = (m.options.mutationKey ?? []) as unknown[];
      return !key.includes('quiet');
    },
  });

  // Non-blocking top progress bar: 'quiet' mutations (ball post, undo, etc.).
  // Scorer still sees activity without losing tap-rhythm.
  const quietMutating = useIsMutating({
    predicate: (m) => {
      const key = (m.options.mutationKey ?? []) as unknown[];
      return key.includes('quiet');
    },
  });

  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(true);
    const t = setTimeout(() => setNavigating(false), 450);
    return () => clearTimeout(t);
  }, [pathname]);

  const overlay = blocking > 0 || navigating;
  const bar = quietMutating > 0;

  return (
    <>
      {/* Top progress bar — non-blocking, used for ball posts */}
      {bar && (
        <div className="fixed left-0 right-0 top-0 z-[110] h-[3px] overflow-hidden bg-[var(--border-subtle)]">
          <div className="h-full w-1/3 animate-sweep bg-[var(--green-bright)]" />
        </div>
      )}

      {/* Centered overlay — blocking, used for create/start/end actions */}
      {overlay && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(15,18,15,0.35)] backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-7 py-6 shadow-xl">
            <span className="ball-spinner" aria-hidden="true" />
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">
              {blocking > 0 ? 'Working' : 'Loading'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
