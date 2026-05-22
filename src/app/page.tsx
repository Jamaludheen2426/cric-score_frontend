import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      <section className="card text-center">
        <p className="eyebrow mb-3">Cricket Scoring Desk</p>
        <h1 className="mb-2 text-[22px] font-bold leading-tight text-[var(--text-primary)]">
          Score a match. Share a live card.
        </h1>
        <p className="mx-auto mb-5 max-w-md text-[13px] text-[var(--text-secondary)]">
          Ball-by-ball input, instant live updates, full scorecard.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/matches" className="btn btn-primary">Open matches</Link>
          <Link href="/matches/create" className="btn btn-secondary">New match</Link>
        </div>
      </section>

      <section className="mt-3 grid gap-2 sm:grid-cols-3">
        {[
          { t: 'Real-time', d: 'SSE pushes every delivery instantly.' },
          { t: 'PIN-gated', d: 'Only the scorer can edit. Public viewers stay public.' },
          { t: 'Rules baked in', d: 'Strike rotation, wides, no-balls, all-out, target chase.' },
        ].map(f => (
          <div key={f.t} className="card">
            <p className="eyebrow mb-1.5">{f.t}</p>
            <p className="text-[13px] text-[var(--text-secondary)]">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
