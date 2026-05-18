export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center bg-[var(--bg-app)] px-4">
      <div className="text-center">
        <div className="mx-auto mb-3 h-1 w-24 overflow-hidden rounded-full bg-[var(--border-subtle)]">
          <div className="h-full w-1/2 animate-sweep bg-[var(--green)]" />
        </div>
        <p className="text-[13px] text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
