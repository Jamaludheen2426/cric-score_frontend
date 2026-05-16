export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="page flex flex-col items-center justify-center min-h-[50vh] gap-5">
      <div className="relative w-20 h-px overflow-hidden bg-hairline">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-ink animate-sweep" />
      </div>
      <p className="text-[13px] text-ink-mute">{label}</p>
    </div>
  );
}
