import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      {/* ── HERO — asymmetric editorial split ──────────────────────────── */}
      <section className="relative grid lg:grid-cols-12 gap-10 lg:gap-6 pt-6 pb-20 border-b border-canvas-ridge">
        {/* LEFT — masthead typography */}
        <div className="lg:col-span-8 reveal">
          <div className="overline mb-4">issue no. iv — the live edition</div>

          <h1 className="font-display font-black uppercase leading-[0.82] tracking-tighter">
            <span className="block text-[clamp(60px,11vw,168px)] text-ink">A scorebook</span>
            <span className="block text-[clamp(60px,11vw,168px)]">
              <span className="font-editorial italic font-normal text-ochre-500">for the</span>{' '}
              <span className="text-saffron-500">modern</span>
            </span>
            <span className="block text-[clamp(60px,11vw,168px)] text-ink">press box.</span>
          </h1>

          <div className="mt-10 max-w-xl flex items-start gap-4">
            <span className="mt-2 inline-block w-10 h-px bg-saffron-500 shrink-0" />
            <p className="font-body text-[17px] leading-relaxed text-ink-muted">
              Ball-by-ball cricket scoring with broadcast-grade live cards.
              Run the desk, share a public ticker, file your scorecard before the bails settle.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 reveal reveal-d2">
            <Link href="/matches" className="btn-primary btn-lg">
              Today&apos;s fixtures →
            </Link>
            <Link href="/matches/create" className="btn-ghost btn-lg">
              Open a new card
            </Link>
            <span className="font-mono text-[11px] text-ink-dim uppercase tracking-widest pl-3 border-l border-canvas-ridge ml-2">
              press <span className="text-ink">⌘</span> to begin
            </span>
          </div>
        </div>

        {/* RIGHT — vertical chyron */}
        <aside className="lg:col-span-4 reveal reveal-d3">
          <div className="slab-accent space-y-6">
            <div className="overline">currently on the wire</div>
            <ul className="space-y-5 font-body">
              {[
                { time: '14:02', who: 'Scoring desk',  what: 'Live SSE — zero polling, near-zero lag.' },
                { time: '14:04', who: 'Scorer access', what: 'PIN-gated, single-tap delivery entry.' },
                { time: '14:09', who: 'Public ticker', what: 'Share a link, anyone can watch the chase.' },
              ].map((row, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="font-mono text-[11px] text-ochre-500 mt-1 w-12 shrink-0">{row.time}</span>
                  <div>
                    <div className="eyebrow mb-1">{row.who}</div>
                    <div className="text-ink text-[14px] leading-snug">{row.what}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-canvas-ridge flex items-center justify-between">
              <span className="overline">latest tag</span>
              <span className="badge-live"><span className="live-dot" /> tea-time</span>
            </div>
          </div>
        </aside>
      </section>

      {/* ── FEATURE STRIP — broadcast lower-thirds row ───────────────── */}
      <section className="grid md:grid-cols-3 gap-px bg-canvas-ridge mt-px reveal reveal-d4">
        {[
          {
            n: '01', t: 'Wire-speed',
            d: 'Server-Sent Events stream every legal delivery, wide, no-ball and wicket the instant the scorer taps.',
            tag: 'transport',
          },
          {
            n: '02', t: 'Press-room safe',
            d: 'A four-digit PIN locks the scoring desk. Sessions expire in twelve hours. Public viewers stay public.',
            tag: 'access',
          },
          {
            n: '03', t: 'Match-day discipline',
            d: 'Strike rotation, death-over wides, all-out auto-close, target chase end. The rules of the game, encoded.',
            tag: 'rules',
          },
        ].map((f) => (
          <article key={f.n} className="bg-canvas-raised p-8 min-h-[200px] flex flex-col justify-between group relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <span className="font-mono text-[11px] text-saffron-500 uppercase tracking-widest">— {f.tag}</span>
              <span className="font-display text-3xl text-ink-dim group-hover:text-saffron-500 transition-colors">{f.n}</span>
            </div>
            <div>
              <h3 className="font-display text-3xl text-ink mb-2 uppercase leading-tight">{f.t}</h3>
              <p className="text-ink-muted text-[14px] leading-relaxed">{f.d}</p>
            </div>
            <div className="absolute left-0 bottom-0 h-[2px] w-0 bg-saffron-500 group-hover:w-full transition-all duration-500" />
          </article>
        ))}
      </section>

      {/* ── EDITORIAL PULL ────────────────────────────────────────────── */}
      <section className="mt-24 grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3">
          <div className="overline mb-3">from the editor</div>
          <div className="eyebrow text-ink-muted">on craft &amp; coverage</div>
        </div>
        <blockquote className="lg:col-span-9 font-editorial italic text-[clamp(24px,3.4vw,42px)] leading-[1.18] text-ink">
          &ldquo;A good scorecard reads like a poem nobody had the chance to write twice.
          We just gave it&nbsp;<span className="chyron-bar text-saffron-500 not-italic font-display uppercase">a fresh ribbon</span>.&rdquo;
        </blockquote>
      </section>
    </div>
  );
}
