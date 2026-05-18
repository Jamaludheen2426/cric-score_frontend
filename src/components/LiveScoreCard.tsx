'use client';

import { useState } from 'react';
import { BallRecord, LiveScore, Match } from '@/types';
import { formatOvers, formatRate, getBallColor, getBallLabel } from '@/lib/utils';

interface Props {
  liveData: LiveScore;
  match: Match;
}

type Tab = 'scorecard' | 'overs' | 'info';

function scoreText(inn: LiveScore['innings'][number]) {
  return `${inn.total_runs}/${inn.total_wickets}`;
}

function ScoreStrip({ liveData }: { liveData: LiveScore }) {
  const inn = liveData.innings.find(i => i.status === 'live') || liveData.innings[liveData.innings.length - 1];
  if (!inn) return null;
  const need = inn.runs_needed ?? (inn.target ? Math.max(0, inn.target - inn.total_runs) : null);
  const innings = [...liveData.innings].sort((a, b) => a.innings_number - b.innings_number);
  return (
    <section className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
      <div className="grid gap-1.5">
        {innings.map(summary => (
          <div key={summary.id} className={`grid grid-cols-[minmax(72px,1fr)_auto_auto] items-baseline gap-2 ${summary.id === inn.id ? '' : 'opacity-70'}`}>
            <p className="truncate text-[13px] font-bold uppercase text-[var(--text-secondary)]">{summary.battingTeam?.name}</p>
            <span className={`${summary.id === inn.id ? 'text-[28px]' : 'text-[18px]'} font-bold leading-none text-[var(--text-primary)]`}>{scoreText(summary)}</span>
            <span className="score-over">({formatOvers(summary.total_overs_bowled)} ov)</span>
          </div>
        ))}
        {innings.length === 1 && (
          <div className="grid grid-cols-[minmax(72px,1fr)_auto] items-baseline gap-2 opacity-40">
            <p className="truncate text-[13px] font-bold uppercase text-[var(--text-secondary)]">{inn.bowlingTeam?.name}</p>
            <span className="text-[13px] font-semibold text-[var(--text-secondary)]">Yet to bat</span>
          </div>
        )}
      </div>
      {inn.innings_number === 2 && need != null && (
        <div className="text-right">
          <p className="text-[11px] text-[var(--text-secondary)]">Need</p>
          <p className="text-[20px] font-bold text-[var(--orange-text)]">{need} off {inn.balls_left ?? '-'}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">balls</p>
        </div>
      )}
    </section>
  );
}

function PelletRow({ balls }: { balls: BallRecord[] }) {
  return <div className="flex flex-wrap gap-1.5">{balls.map((b, i) => <span key={i} className={getBallColor(b)}>{getBallLabel(b)}</span>)}</div>;
}

export function LiveScoreCard({ liveData, match }: Props) {
  const [tab, setTab] = useState<Tab>('scorecard');
  const inn = liveData.innings.find(i => i.status === 'live') || liveData.innings[liveData.innings.length - 1];

  return (
    <div className="bg-[var(--bg-app)]">
      <ScoreStrip liveData={liveData} />
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2">
        <p className="truncate text-[13px] font-bold text-[var(--text-primary)]">{match.title}</p>
        {match.status === 'live' && <span className="badge-live"><span className="live-dot" />Live</span>}
      </div>
      <div className="tabbar">
        {(['scorecard', 'overs', 'info'] as Tab[]).map(t => <button key={t} onClick={() => setTab(t)} className={`tab-button ${tab === t ? 'tab-button-active' : ''}`}>{t}</button>)}
      </div>

      {tab === 'scorecard' && inn && (
        <div>
          <p className="eyebrow px-3 py-2">Batting</p>
          <div className="border-y border-[var(--border-subtle)]">
            <div className="grid grid-cols-[1fr_58px_46px_64px] gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
              <span className="table-head text-left">Batter</span>
              <span className="table-head text-right">R</span>
              <span className="table-head text-right">B</span>
              <span className="table-head text-right">SR</span>
            </div>
            {inn.battingCards?.sort((a, b) => a.batting_position - b.batting_position).map(card => {
              const striker = card.player_id === inn.on_strike_batsman_id;
              const strikeRate = card.balls ? formatRate((card.runs / card.balls) * 100) : '-';
              return (
                <div
                  key={card.id}
                  className={`grid min-h-10 grid-cols-[1fr_58px_46px_64px] items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-2 last:border-b-0 ${
                    striker ? 'border-l-2 border-l-[var(--green-bright)] bg-[#0f2318]' : ''
                  } ${card.is_out ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {striker && <span className="text-[10px] font-bold text-[var(--green-text)]">*</span>}
                      <span className="truncate text-[14px] font-semibold">{card.player?.name}</span>
                    </div>
                    <span className="block text-[11px] text-[var(--text-muted)]">{card.is_out ? card.dismissal_type?.replace(/_/g, ' ') : 'not out'}</span>
                  </div>
                  <span className="text-right text-[13px] font-semibold tabular-nums">{card.runs}{striker ? '*' : ''}</span>
                  <span className="text-right text-[13px] text-[var(--text-secondary)] tabular-nums">{card.balls}</span>
                  <span className="text-right text-[12px] text-[var(--text-secondary)] tabular-nums">{strikeRate}</span>
                </div>
              );
            })}
          </div>
          <p className="eyebrow px-3 py-2">Bowling</p>
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border-subtle)]"><th className="table-head px-3 py-2 text-left">Bowler</th><th className="table-head px-2 text-right">O</th><th className="table-head px-2 text-right">R</th><th className="table-head px-2 text-right">W</th><th className="table-head px-3 text-right">Econ</th></tr></thead>
            <tbody>{inn.bowlingCards?.map(card => <tr key={card.id} className={`border-b border-[var(--border-subtle)] ${card.player_id === inn.current_bowler_id ? 'border-l-2 border-l-[var(--blue)] bg-[#0d1f2e]' : ''}`}><td className="table-cell font-semibold">{card.player?.name}</td><td className="table-cell text-right">{Number(card.overs).toFixed(1)}</td><td className="table-cell text-right">{card.runs}</td><td className="table-cell text-right">{card.wickets}</td><td className="table-cell text-right">{card.legal_balls ? formatRate((card.runs / card.legal_balls) * 6) : '-'}</td></tr>)}</tbody>
          </table>
          <p className="eyebrow px-3 py-2">Fall of wickets</p>
          <div className="border-y border-[var(--border-subtle)] px-3 py-2 text-[12px] text-[var(--text-muted)]">
            Fall data is not available from the live feed yet.
          </div>
        </div>
      )}
      {tab === 'overs' && <div className="p-3"><p className="eyebrow mb-2">Current over</p><PelletRow balls={liveData.currentOverBalls} /></div>}
      {tab === 'info' && <div className="divide-y divide-[var(--border-subtle)]">{[['Format', `${match.total_overs} overs`], ['Players', `${match.players_per_side} per side`], ['Wide rule', match.wide_rule], ['Death overs', match.death_overs_from || '-']].map(([l, v]) => <div key={l} className="flex justify-between px-3 py-2 text-[13px]"><span className="text-[var(--text-secondary)]">{l}</span><span className="font-semibold text-[var(--text-primary)]">{v}</span></div>)}</div>}
    </div>
  );
}
