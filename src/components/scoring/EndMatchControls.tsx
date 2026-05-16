'use client';

interface Props {
  matchStatus: string;
  onEndMatch: () => void;
  isLoading: boolean;
}

export function EndMatchControls({ matchStatus, onEndMatch, isLoading }: Props) {
  if (matchStatus !== 'live') return null;

  return (
    <section className="card-soft rise rise-d4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Wrap up</p>
          <p className="text-h3 mb-1">End the match.</p>
          <p className="text-[13px] text-ink-soft">Closes scoring and files the final scorecard.</p>
        </div>
        <button
          onClick={() => confirm('End the match and file the final scorecard?') && onEndMatch()}
          disabled={isLoading}
          className="btn-danger"
        >
          {isLoading ? 'Ending…' : 'End match'}
        </button>
      </div>
    </section>
  );
}
