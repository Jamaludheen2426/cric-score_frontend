'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/matches', label: 'Matches' },
  { href: '/teams',   label: 'Teams' },
];

export function Nav() {
  const pathname = usePathname();
  // Hide the bottom tab bar inside the scoring desk so it doesn't fight the fixed input panel.
  const hideTabs = /\/matches\/\d+\/score/.test(pathname);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <Link href="/" className="flex items-baseline gap-1.5 text-[14px] font-bold uppercase tracking-wide text-[var(--text-primary)]">
          <span className="text-[var(--green-text)]">CRIC</span>
          <span className="text-[var(--text-secondary)]">SCORER</span>
        </Link>
        <Link href="/matches/create" className="btn btn-primary h-8 px-3 text-[12px]">+ New</Link>
      </header>

      {!hideTabs && (
        <nav className="tabbar sticky top-12 z-30">
          {TABS.map(t => {
            const active = pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className={`tab-button ${active ? 'tab-button-active' : ''}`}>
                {t.label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
