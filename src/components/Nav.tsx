'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Plus, Trophy, Users } from 'lucide-react';

const links = [
  { href: '/matches', label: 'Matches', icon: CalendarDays },
  { href: '/teams', label: 'Teams', icon: Users },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-card)]">
      <div className="page-wide flex h-12 items-center justify-between gap-3">
        <Link href="/matches" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--green)] text-white">
            <Trophy size={16} />
          </span>
          <span className="text-[15px] font-bold text-[var(--text-primary)]">Cricket Scorer</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex h-9 items-center gap-2 px-3 text-[13px] font-semibold ${
                  active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <Link href="/matches/create" className="btn btn-primary btn-sm">
          <Plus size={14} /> Match
        </Link>
      </div>
    </header>
  );
}
