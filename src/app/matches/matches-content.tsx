'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import { useLiveScore, useMatches } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { Innings, Match } from '@/types';
import { formatOvers } from '@/lib/utils';

type Tab = 'live' | 'pending' | 'completed';

function initials(name?: string) {
  return (name || 'T').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function hashColorClass(name?: string) {
  const colors = ['bg-[#1f6feb]', 'bg-[#238636]', 'bg-[#bb8009]', 'bg-[#8957e5]', 'bg-[#da3633]', 'bg-[#d4820a]'];
  const sum = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

function TeamMark({ name }: { name?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${hashColorClass(name)}`}>
        {initials(name)}
      </span>
      <span className="truncate text-[14px] font-bold text-[var(--text-primary)]">{name || 'Team'}</span>
    </div>
  );
}

function inningsForTeam(innings: Innings[] | undefined, teamId?: number) {
  return innings?.find(inn => inn.batting_team_id === teamId);
}

function scoreText(innings?: Innings) {
  if (!innings) return 'Yet to bat';
  return `${innings.total_runs}/${innings.total_wickets} (${formatOvers(innings.total_overs_bowled)} ov)`;
}

function MatchCard({ match }: { match: Match }) {
  const { data: liveData } = useLiveScore(match.share_token);
  const teamAInnings = inningsForTeam(liveData?.innings, match.team_a_id);
  const teamBInnings = inningsForTeam(liveData?.innings, match.team_b_id);
  const mainHref = match.status === 'completed'
    ? `/matches/${match.id}/summary`
    : match.status === 'live'
      ? `/matches/${match.id}/live`
      : `/matches/${match.id}/score`;
  const canScore = match.status !== 'completed';

  return (
    <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <Link href={mainHref} className="block">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-3">
          <TeamMark name={match.teamA?.name} />
          <span className="text-[11px] font-bold uppercase text-[var(--text-muted)]">vs</span>
          <div className="min-w-0 justify-self-end"><TeamMark name={match.teamB?.name} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <div className="text-[15px] font-bold text-[var(--text-primary)]">{scoreText(teamAInnings)}</div>
          <div className="text-right text-[15px] font-bold text-[var(--text-primary)]">{scoreText(teamBInnings)}</div>
        </div>
      </Link>
      <div className={`border-t px-3 py-2 text-[11px] font-bold uppercase ${
        match.status === 'live'
          ? 'border-[var(--green)] bg-[#0f2318] text-[var(--green-text)]'
          : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <span>{match.status === 'live' ? <><span className="live-dot mr-2 align-middle" />LIVE</> : match.status === 'completed' ? 'Completed' : `Upcoming · ${match.total_overs} ov`}</span>
          <span className="flex items-center gap-2">
            {match.status === 'live' && (
              <Link href={`/matches/${match.id}/live`} className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-[11px] text-[var(--blue-text)]">
                View
              </Link>
            )}
            {canScore && (
              <Link href={`/matches/${match.id}/score`} className="rounded border border-[var(--green)] bg-[var(--green)] px-2 py-1 text-[11px] text-white">
                Score
              </Link>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

export function MatchesContent() {
  const { data: matches, isLoading } = useMatches();
  const [tab, setTab] = useState<Tab>('live');

  if (isLoading) return <PageLoader label="Loading matches" />;

  const list = matches || [];
  const tabs: Array<{ key: Tab; label: string; items: Match[] }> = [
    { key: 'live', label: 'Live', items: list.filter((m: Match) => m.status === 'live') },
    { key: 'pending', label: 'Upcoming', items: list.filter((m: Match) => m.status === 'pending') },
    { key: 'completed', label: 'Completed', items: list.filter((m: Match) => m.status === 'completed') },
  ];
  const active = tabs.find(t => t.key === tab)!;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-20">
      <div className="page">
        <header className="mb-3 flex h-10 items-center justify-between">
          <h1 className="text-[20px] font-bold text-[var(--text-primary)]">Matches</h1>
          <button className="grid h-9 w-9 place-items-center rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
            <Filter size={16} />
          </button>
        </header>
        <div className="tabbar mb-3">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`tab-button ${tab === t.key ? 'tab-button-active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>
        {active.items.length ? (
          <div className="grid gap-2">
            {active.items.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        ) : (
          <div className="grid min-h-[320px] place-items-center text-center">
            <div>
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] text-[var(--text-muted)]">B</div>
              <p className="text-[14px] font-semibold text-[var(--text-secondary)]">No matches</p>
              <p className="mt-1 text-[12px] text-[var(--text-muted)]">Matches will appear here.</p>
            </div>
          </div>
        )}
      </div>
      <Link href="/matches/create" className="fixed bottom-5 right-5 grid h-[52px] w-[52px] place-items-center rounded-full bg-[var(--green)] text-white">
        <Plus size={24} />
      </Link>
    </div>
  );
}
