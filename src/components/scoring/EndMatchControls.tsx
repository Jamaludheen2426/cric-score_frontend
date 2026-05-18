'use client';

interface Props {
  matchStatus: string;
  onEndMatch: () => void;
  isLoading: boolean;
}

export function EndMatchControls({ matchStatus, onEndMatch, isLoading }: Props) {
  if (matchStatus !== 'live') return null;

  return (
    <section className="m-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Wrap Up</p>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">File the final scorecard.</p>
        </div>
        <button
          onClick={() => confirm('End the match and file the final scorecard?') && onEndMatch()}
          disabled={isLoading}
          className="btn btn-danger h-9 px-3"
        >
          {isLoading ? 'Ending' : 'End Match'}
        </button>
      </div>
    </section>
  );
}
