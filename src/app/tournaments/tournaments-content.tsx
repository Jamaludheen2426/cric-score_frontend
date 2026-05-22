'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trophy } from 'lucide-react';
import { PageLoader } from '@/components/PageLoader';
import { useCreateDemoTournament, useTournaments } from '@/lib/queries';
import { Tournament } from '@/types';

export function TournamentsContent() {
  const router = useRouter();
  const { data, isLoading } = useTournaments();
  const createDemo = useCreateDemoTournament();
  if (isLoading) return <PageLoader label="Loading tournaments" />;
  const tournaments = data || [];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-20">
      <div className="page">
        <header className="mb-3 flex min-h-10 items-center justify-between gap-2">
          <h1 className="text-[20px] font-bold text-[var(--text-primary)]">Tournaments</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const tournament = await createDemo.mutateAsync();
                router.push(`/tournaments/${tournament.id}`);
              }}
              disabled={createDemo.isPending}
              className="btn btn-secondary btn-sm"
            >
              Demo
            </button>
            <Link href="/tournaments/create" className="btn btn-primary btn-sm"><Plus size={14} /> Tournament</Link>
          </div>
        </header>
        {tournaments.length ? (
          <div className="grid gap-2">
            {tournaments.map((t: Tournament) => (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="block border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded bg-[#edf7ee] text-[var(--green-text)]"><Trophy size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-[12px] text-[var(--text-secondary)]">{t.teams?.length || 0} teams · {t.matches?.length || 0} fixtures · {t.total_overs} overs</p>
                  </div>
                  <span className="text-[12px] font-semibold capitalize text-[var(--text-secondary)]">{t.status}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid min-h-[320px] place-items-center text-center">
            <div>
              <Trophy size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-[14px] font-semibold text-[var(--text-secondary)]">No tournaments yet</p>
              <Link href="/tournaments/create" className="btn btn-primary mt-3">Create tournament</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
