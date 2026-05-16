'use client';

interface Props {
  matchStatus: string;
  onEndMatch: () => void;
  isLoading: boolean;
}

export function EndMatchControls({ matchStatus, onEndMatch, isLoading }: Props) {
  if (matchStatus !== 'live') return null;

  return (
    <section className="slab-accent muted">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="overline">desk closeout</div>
          <p className="font-display text-lg uppercase text-ink mt-1">Hand the match to the archive.</p>
          <p className="font-editorial italic text-ink-muted text-[12px]">Closes scoring and files the final card.</p>
        </div>
        <button
          onClick={() => confirm('Close the match and file the final scorecard?') && onEndMatch()}
          disabled={isLoading}
          className="btn-danger"
        >
          {isLoading ? 'Filing…' : 'End match'}
        </button>
      </div>
    </section>
  );
}
