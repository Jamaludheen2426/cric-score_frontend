export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="page flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="relative w-24">
        <div className="h-px w-full bg-canvas-ridge" />
        <div className="absolute top-0 left-0 h-px bg-saffron-500 animate-sweep w-full" />
      </div>
      <p className="eyebrow">{label}</p>
    </div>
  );
}
