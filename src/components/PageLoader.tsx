export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center bg-[var(--bg-app)] px-4">
      <div className="text-center">
        <span className="ball-spinner" aria-hidden="true" />
        <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
