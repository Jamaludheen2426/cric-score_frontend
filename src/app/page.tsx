import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      {/* HERO — restrained, centered-left, generous whitespace */}
      <section className="pt-12 pb-28 max-w-[920px] rise">
        <p className="eyebrow mb-6">a quiet scoring desk</p>

        <h1 className="text-hero mb-8">
          A calmer way to keep
          <br />
          <span className="serif-italic font-normal text-ink-soft">the scorebook.</span>
        </h1>

        <p className="text-lead text-ink-soft max-w-[640px] mb-10">
          Ball-by-ball cricket scoring with a public, real-time scorecard.
          Built for clarity — quick to enter, easier to follow.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/matches" className="btn-primary btn-lg">
            Go to matches
          </Link>
          <Link href="/matches/create" className="btn-secondary btn-lg">
            Start a new match
          </Link>
        </div>
      </section>

      <div className="hr" />

      {/* FEATURE GRID — generous, restrained, content-led */}
      <section className="py-24 grid md:grid-cols-3 gap-x-12 gap-y-16 rise rise-d1">
        {[
          {
            n: '01',
            t: 'Real-time, no polling',
            d: 'Server-Sent Events push every delivery the moment it’s entered. Viewers see the ball as it’s scored.',
          },
          {
            n: '02',
            t: 'PIN-gated scoring',
            d: 'A short key protects the scoring desk. Public viewers stay public — only the scorer touches the data.',
          },
          {
            n: '03',
            t: 'Cricket rules, encoded',
            d: 'Strike rotation, wide and no-ball handling, all-out detection, target chases — they’re part of the engine.',
          },
        ].map((f) => (
          <article key={f.n}>
            <div className="text-[12px] font-mono text-ink-mute mb-5">— {f.n}</div>
            <h3 className="text-h3 mb-3">{f.t}</h3>
            <p className="text-ink-soft text-[15px] leading-relaxed">{f.d}</p>
          </article>
        ))}
      </section>

      <div className="hr" />

      {/* QUIET PULL QUOTE */}
      <section className="py-28 max-w-[840px] rise rise-d2">
        <p className="eyebrow mb-6">design note</p>
        <p className="text-[clamp(22px,2.6vw,32px)] leading-[1.35] text-ink">
          The best scoring tools{' '}
          <span className="serif-italic text-ink-soft">get out of the way.</span>{' '}
          You enter a ball; everyone watching sees the result a moment later. That’s it. Everything else is restraint.
        </p>
      </section>
    </div>
  );
}
