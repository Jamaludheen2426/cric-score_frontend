'use client';

import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorToast } from '@/components/ErrorToast';

let pushError: ((msg: string) => void) | null = null;

function extractMessage(err: unknown): string {
  const e = err as any;
  return e?.response?.data?.error || e?.message || 'Request failed.';
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
        queryCache: new QueryCache({
          onError: (err) => { pushError?.(extractMessage(err)); },
        }),
        mutationCache: new MutationCache({
          onError: (err) => { pushError?.(extractMessage(err)); },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorToast registerPush={(fn) => { pushError = fn; }} />
      {children}
    </QueryClientProvider>
  );
}
