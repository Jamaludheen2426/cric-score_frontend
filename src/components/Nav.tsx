'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/matches', label: 'Matches' },
  { href: '/teams',   label: 'Teams' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md border-b border-hairline">
      <div className="page-wide flex items-center justify-between h-16">
        <Link href="/" className="font-medium text-[16px] tracking-tight">
          Cricket <span className="serif-italic text-ink-soft">Scorer</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(l => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-3 py-2 text-[14px] font-medium transition-colors ${
                  active ? 'text-ink' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-ink animate-sweep" />
                )}
              </Link>
            );
          })}
          <Link href="/matches/create" className="btn-primary ml-3 btn-sm">
            New match
          </Link>
        </nav>
      </div>
    </header>
  );
}
