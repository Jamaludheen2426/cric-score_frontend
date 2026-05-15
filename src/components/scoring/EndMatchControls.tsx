'use client';

interface Props {
  matchStatus: string;
  onEndMatch: () => void;
  isLoading: boolean;
}

export function EndMatchControls({ matchStatus, onEndMatch, isLoading }: Props) {
  if (matchStatus !== 'live') return null;

  return (
    <div className="card border-rose-900/30 bg-rose-950/10">
      <p className="text-gray-500 text-xs mb-3 font-display">Match Controls</p>
      <button
        onClick={() => confirm('End match and generate final scorecard?') && onEndMatch()}
        disabled={isLoading}
        className="btn-danger text-sm"
      >
        {isLoading ? 'Ending...' : 'End Match & Generate Scorecard'}
      </button>
    </div>
  );
}
