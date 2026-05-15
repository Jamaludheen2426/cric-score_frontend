'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/matches', label: 'Matches' },
  { href: '/teams', label: 'Teams' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-white flex items-center gap-2">
          <span>🏏</span> Cricket Scorer
        </Link>
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-display font-medium transition-colors ${
                pathname.startsWith(l.href)
                  ? 'bg-pitch-600/20 text-pitch-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/matches/create"
            className="ml-3 btn-primary text-sm py-1.5 px-3"
          >
            + New Match
          </Link>
        </div>
      </div>
    </nav>
  );
}
