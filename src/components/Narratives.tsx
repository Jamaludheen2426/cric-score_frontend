'use client';

import { Innings } from '@/types';

/**
 * Partnerships + Fall of Wickets for one innings.
 *
 * Both come pre-computed from the live score endpoint (live.service.ts
 * walks the ball log once and emits both arrays per innings), so this
 * component is purely presentation.
 */
export function Narratives({ innings }: { innings: Innings }) {
  const partnerships = innings.partnerships || [];
  const fow = innings.fallOfWickets || [];

  // Don't render anything if both are empty (innings hasn't started)
  if (partnerships.length === 0 && fow.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Partnerships */}
      {partnerships.length > 0 && (
        <section className="card">
          <p className="eyebrow mb-2">Partnerships · {innings.battingTeam?.name}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="table-head px-2 py-1.5 text-left">For</th>
                  <th className="table-head px-2 py-1.5 text-left">Pair</th>
                  <th className="table-head px-2 py-1.5 text-right">R</th>
                  <th className="table-head px-2 py-1.5 text-right">B</th>
                </tr>
              </thead>
              <tbody>
                {partnerships.map((p, i) => {
                  const pairText = [p.batsman1_name, p.batsman2_name]
                    .filter(Boolean)
                    .join(' & ') || '—';
                  return (
                    <tr key={i} className="border-b border-[var(--border-subtle)] last:border-b-0">
                      <td className="table-cell px-2 text-[var(--text-secondary)]">
                        {p.wicket_number === 1 ? 'Opening' : `${ordinal(p.wicket_number)} wkt`}
                        {!p.ended && <span className="ml-1 text-[10px] font-bold text-[var(--green-text)]">·LIVE</span>}
                      </td>
                      <td className="table-cell px-2">
                        <span className="font-semibold text-[var(--text-primary)]">{pairText}</span>
                      </td>
                      <td className="table-cell px-2 text-right font-bold">{p.runs}</td>
                      <td className="table-cell px-2 text-right text-[var(--text-secondary)]">{p.balls}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Fall of Wickets */}
      {fow.length > 0 && (
        <section className="card">
          <p className="eyebrow mb-2">Fall of Wickets</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="table-head px-2 py-1.5 text-left">#</th>
                  <th className="table-head px-2 py-1.5 text-left">Score</th>
                  <th className="table-head px-2 py-1.5 text-left">Batsman</th>
                </tr>
              </thead>
              <tbody>
                {fow.map(w => (
                  <tr key={w.wicket_number} className="border-b border-[var(--border-subtle)] last:border-b-0">
                    <td className="table-cell px-2 text-[var(--text-muted)]">{w.wicket_number}</td>
                    <td className="table-cell px-2">
                      <span className="font-bold tabular-nums">{w.score}-{w.wicket_number}</span>
                      <span className="ml-1 text-[11px] text-[var(--text-muted)]">({w.overs} ov)</span>
                    </td>
                    <td className="table-cell px-2 text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">{w.dismissed_player_name}</span>
                      {w.wicket_type && (
                        <span className="ml-1 text-[11px] text-[var(--text-muted)]">
                          {w.wicket_type.replace(/_/g, ' ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
