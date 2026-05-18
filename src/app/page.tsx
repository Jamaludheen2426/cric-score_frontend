import Link from 'next/link';
import { CalendarDays, Plus, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <header className="flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <div>
          <h1 className="text-[16px] font-bold text-[var(--text-primary)]">Cricket Scorer</h1>
          <p className="text-[11px] text-[var(--text-secondary)]">Ball-by-ball scoring desk</p>
        </div>
        <Link href="/matches/create" className="btn btn-primary h-8 px-3">
          <Plus size={14} /> Match
        </Link>
      </header>

      <main className="mx-auto max-w-3xl">
        <section className="border-b border-[var(--border-subtle)] px-3 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Open</p>
        </section>

        <div className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-card)]">
          <Link href="/matches" className="flex items-center gap-3 px-3 py-4 hover:bg-[var(--bg-elevated)]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0d1f3c] text-[var(--blue-text)]">
              <CalendarDays size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-[var(--text-primary)]">Matches</span>
              <span className="text-[12px] text-[var(--text-secondary)]">Live, upcoming, and completed cards</span>
            </span>
            <span className="text-[18px] text-[var(--text-muted)]">›</span>
          </Link>

          <Link href="/teams" className="flex items-center gap-3 px-3 py-4 hover:bg-[var(--bg-elevated)]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0f2318] text-[var(--green-text)]">
              <Users size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-[var(--text-primary)]">Teams</span>
              <span className="text-[12px] text-[var(--text-secondary)]">Manage squads and player roles</span>
            </span>
            <span className="text-[18px] text-[var(--text-muted)]">›</span>
          </Link>
        </div>

        <section className="mt-3 grid grid-cols-2 gap-2 px-3">
          <Link href="/matches/create" className="btn btn-primary h-11">Create Match</Link>
          <Link href="/teams/create" className="btn btn-secondary h-11">New Team</Link>
        </section>
      </main>
    </div>
  );
}
