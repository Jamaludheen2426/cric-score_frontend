'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/matches', label: 'Matches', code: '01' },
  { href: '/teams',   label: 'Teams',   code: '02' },
];

export function Nav() {
  const pathname = usePathname();
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase();

  return (
    <header className="relative z-50">
      {/* Top meta strip — like a magazine masthead */}
      <div className="border-b border-canvas-ridge bg-canvas">
        <div className="max-w-[1320px] mx-auto px-6 h-7 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-4 text-ink-dim font-mono uppercase tracking-widest">
            <span>vol. i — iss. 04</span>
            <span className="hidden sm:inline">{today}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-dim font-mono uppercase tracking-widest">
            <span className="live-dot" />
            <span>signal live</span>
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <nav className="border-b border-canvas-ridge bg-canvas/95 backdrop-blur-sm sticky top-0">
        <div className="max-w-[1320px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="font-display font-black text-2xl uppercase tracking-tight text-ink leading-none">
              The&nbsp;<span className="text-saffron-500">Press</span>&nbsp;Box
            </span>
            <span className="hidden md:inline overline">a cricket scoring journal</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(l => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative px-4 py-2 font-display uppercase tracking-widest2 text-[12px] transition-colors ${
                    active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <span className="font-mono text-ink-dim text-[10px] mr-2 align-baseline">{l.code}</span>
                  {l.label}
                  {active && (
                    <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-saffron-500 animate-sweep" />
                  )}
                </Link>
              );
            })}
            <Link href="/matches/create" className="btn-primary btn-sm ml-2">
              + Open Match
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
