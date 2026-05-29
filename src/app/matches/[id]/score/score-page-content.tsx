'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMatch, useScoringActions, useLiveScore } from '@/lib/queries';
import { PageLoader } from '@/components/PageLoader';
import { PinGate } from '@/components/scoring/PinGate';
import { StartMatchModal } from '@/components/scoring/StartMatchModal';
import { BallInputPanel } from '@/components/scoring/BallInputPanel';
import { ScoreHeader } from '@/components/scoring/ScoreHeader';
import { OverDisplay } from '@/components/scoring/OverDisplay';
import { BatsmenTable } from '@/components/scoring/BatsmenTable';
import { BowlerStats } from '@/components/scoring/BowlerStats';
import { BowlerSelectModal } from '@/components/scoring/BowlerSelectModal';
import { WicketModal } from '@/components/scoring/WicketModal';
import { EndMatchControls } from '@/components/scoring/EndMatchControls';
import { EndInningsModal } from '@/components/scoring/EndInningsModal';
import { CorrectionModal } from '@/components/scoring/CorrectionModal';
import { DangerConfirmModal } from '@/components/scoring/DangerConfirmModal';
import { MatchAlerts } from '@/components/MatchAlerts';
import { LiveScore, Player } from '@/types';
import { ballsPerOver } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface PendingBall { runs: number; is_wide?: boolean; is_noball?: boolean; extra_type?: 'bye' | 'leg_bye' | 'wide' | 'no_ball' }

function auditTitle(action: string) {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function auditSummary(details: any) {
  const payload = typeof details === 'string' ? safeJson(details) : details;
  if (!payload) return 'Restore point saved';
  if (payload.ball_id) return `Ball #${payload.ball_id}`;
  if (payload.next_bowler_id) return `Next bowler #${payload.next_bowler_id}`;
  if (payload.target) return `Target ${payload.target}`;
  if (payload.runs) return `${payload.runs} penalty run${payload.runs === 1 ? '' : 's'}`;
  if (payload.input) {
    const ball = payload.input;
    const parts = [
      ball.is_wide ? 'wide' : ball.is_noball ? 'no ball' : `${ball.runs ?? 0} run${ball.runs === 1 ? '' : 's'}`,
      ball.is_wicket ? 'wicket' : '',
      ball.wicket_type ? String(ball.wicket_type).replace(/_/g, ' ') : '',
    ].filter(Boolean);
    return parts.join(' | ');
  }
  return 'Restore point saved';
}

function safeJson(value: string) {
  try { return JSON.parse(value); } catch { return null; }
}

export function ScorePageContent({ matchId }: { matchId: number }) {
  const [token, setToken] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showEndInningsModal, setShowEndInningsModal] = useState(false);
  const [correctionMode, setCorrectionMode] = useState<'batter' | 'bowler' | null>(null);
  const [dangerAction, setDangerAction] = useState<'endInnings' | 'endMatch' | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [quickUndo, setQuickUndo] = useState(false);
  const [pendingBall, setPendingBall] = useState<PendingBall>({ runs: 0 });
  const [liveData, setLiveData] = useState<LiveScore | null>(null);

  const { data: match, isLoading } = useMatch(matchId);
  const { data: initialLiveScore } = useLiveScore(match?.share_token || '');

  useEffect(() => { if (initialLiveScore) setLiveData(initialLiveScore); }, [initialLiveScore]);

  useEffect(() => {
    if (!match?.share_token) return;
    const url = `${API_URL.replace('/api', '')}/api/matches/events/${match.share_token}`;
    const es = new EventSource(url);
    es.onmessage = (e) => { try { setLiveData(JSON.parse(e.data)); } catch (_) {} };
    return () => es.close();
  }, [match?.share_token]);

  const { startMatch, addBall, endOver, correctPlayers, reviseTarget, addPenalty, unlockMatch, auditLogs, endInnings, endMatch, undoBall, exportCsvUrl } = useScoringActions(token || '', matchId);

  if (isLoading) return <PageLoader label="Loading match" />;
  if (!match) return <div className="page text-[var(--text-secondary)]">Match not found.</div>;
  if (!token) return <PinGate matchId={matchId} onSuccess={(t) => setToken(t)} />;

  const currentInnings = liveData?.innings?.find(i => i.status === 'live');
  const currentOver = liveData?.currentOver;
  const perOver = ballsPerOver(liveData?.match || match);
  const isOverComplete = (currentOver?.legal_balls || 0) >= perOver;
  const lastCurrentBall = liveData?.currentOverBalls?.[liveData.currentOverBalls.length - 1];
  const isFreeHit = Boolean(lastCurrentBall?.is_noball || (lastCurrentBall?.is_free_hit && (lastCurrentBall.is_wide || lastCurrentBall.is_noball)));
  const bowlingTeamPlayers = currentInnings
    ? (currentInnings.bowling_team_id === match.team_a_id ? match.teamA : match.teamB)?.players || []
    : [];
  const battingTeamPlayers = currentInnings
    ? (currentInnings.batting_team_id === match.team_a_id ? match.teamA : match.teamB)?.players || []
    : [];

  const handleBall = (data: any) => {
    const afterBall = (res: any) => {
      setQuickUndo(true);
      window.setTimeout(() => setQuickUndo(false), 5000);
      if (res?.allOut || res?.oversFinished || res?.targetReached) return;
      if ((currentOver?.legal_balls || 0) + 1 >= perOver && !data.is_wide && !data.is_noball) {
        setShowBowlerModal(true);
      }
    };
    if (data.is_wicket) {
      setPendingBall({ runs: data.runs || 0, is_wide: data.is_wide, is_noball: data.is_noball, extra_type: data.extra_type });
      setShowWicketModal(true);
    } else {
      addBall.mutate(data, { onSuccess: afterBall });
    }
  };

  const handleWicketConfirm = (wicketData: any) => {
    setShowWicketModal(false);
    addBall.mutate({ ...wicketData, runs: pendingBall.runs, is_wide: pendingBall.is_wide, is_noball: pendingBall.is_noball, extra_type: pendingBall.extra_type }, {
      onSuccess: (res: any) => {
        setQuickUndo(true);
        window.setTimeout(() => setQuickUndo(false), 5000);
        if (res?.allOut || res?.oversFinished || res?.targetReached) return;
        if ((currentOver?.legal_balls || 0) + 1 >= perOver && !pendingBall.is_wide && !pendingBall.is_noball) {
          setShowBowlerModal(true);
        }
      },
    });
  };

  const hasBallsInOver = (currentOver?.legal_balls ?? 0) > 0 || (liveData?.currentOverBalls?.length ?? 0) > 0;
  const downloadCsv = async () => {
    const res = await fetch(exportCsvUrl, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${matchId}-score.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell pb-[200px]">
      {/* Match header */}
      <header className="sticky top-12 z-30 flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <Link href="/matches" className="text-[13px] font-semibold text-[var(--blue-text)]">Back</Link>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[14px] font-bold uppercase text-[var(--text-primary)]">{match.title}</h1>
          <p className="text-[11px] text-[var(--text-secondary)]">{match.teamA?.name} <span className="text-[var(--text-muted)]">v</span> {match.teamB?.name}</p>
        </div>
        <div className="flex gap-1">
          {match.status === 'live' && currentInnings && (
            <button
              onClick={() => {
                setDangerAction('endInnings');
              }}
              className="btn btn-secondary btn-sm"
            >
              End inn
            </button>
          )}
          {match.share_token && (
            <>
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/matches/${match.id}/live`;
                  try {
                    await navigator.clipboard.writeText(url);
                    alert('Public link copied to clipboard');
                  } catch {
                    window.open(url, '_blank');
                  }
                }}
                className="btn btn-secondary btn-sm"
                title="Copy public scorecard link"
              >
                Share
              </button>
              <Link href={`/matches/${match.id}/live`} target="_blank" className="btn btn-secondary btn-sm">Public</Link>
              <Link href={`/matches/${match.id}/tv`} target="_blank" className="btn btn-secondary btn-sm">TV</Link>
              <Link href={`/matches/${match.id}/operator`} target="_blank" className="btn btn-secondary btn-sm">Ops</Link>
            </>
          )}
        </div>
      </header>

      {/* PENDING */}
      {match.status === 'pending' && (
        <div className="page">
          <section className="card text-center">
            <p className="eyebrow mb-2">Awaiting Toss</p>
            <p className="text-[14px] font-bold">First ball not yet bowled.</p>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Settle the toss and the openers to open the desk.</p>
            <button onClick={() => setShowStartModal(true)} className="btn btn-primary mt-4">Open play</button>
          </section>
        </div>
      )}

      {/* LIVE LOADING */}
      {match.status === 'live' && (!liveData || ((liveData?.innings?.length ?? 0) === 0)) && (
        <PageLoader label="Tuning the signal" />
      )}

      {/* ACTIVE SCORING */}
      {(match.status === 'live' || liveData) && currentInnings && liveData && (
        <>
          <ScoreHeader liveData={liveData} match={match} />
          <MatchAlerts liveData={liveData} compact />
          <section className="flex gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2">
            <button onClick={() => setCorrectionMode('batter')} className="btn btn-secondary btn-sm flex-1">Correct batsmen</button>
            <button onClick={() => setCorrectionMode('bowler')} className="btn btn-secondary btn-sm flex-1">Change bowler</button>
          </section>
          <section className="grid grid-cols-4 gap-1 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2">
            <button onClick={() => {
              const runs = Number(prompt('Penalty runs?') || '0');
              if (runs > 0) addPenalty.mutate({ runs, reason: 'manual' });
            }} className="btn btn-secondary btn-sm">Penalty</button>
            <button onClick={() => {
              const target = Number(prompt('Revised target?') || '0');
              if (target > 0) reviseTarget.mutate(target);
            }} className="btn btn-secondary btn-sm">Target</button>
            <button onClick={() => setShowAudit(v => !v)} className="btn btn-secondary btn-sm">History</button>
            <button onClick={downloadCsv} className="btn btn-secondary btn-sm">CSV</button>
          </section>
          {showAudit && (
            <section className="max-h-40 overflow-y-auto border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="eyebrow">Audit timeline</p>
                <button onClick={() => auditLogs.refetch()} className="btn btn-secondary btn-sm">Refresh</button>
              </div>
              {(auditLogs.data || []).length ? (auditLogs.data || []).map((log: any) => (
                <div key={log.id} className="mb-1.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[11px]">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-[var(--text-primary)]">{auditTitle(log.action)}</span>
                    <span className="shrink-0 text-[var(--text-muted)]">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-0.5 text-[var(--text-secondary)]">Restore point #{log.id} - {auditSummary(log.details)}</p>
                </div>
              )) : <p className="text-[12px] text-[var(--text-muted)]">No corrections yet.</p>}
            </section>
          )}
          {currentOver && (
            <OverDisplay
              balls={liveData.currentOverBalls}
              overNumber={currentOver.over_number}
              legalBalls={currentOver.legal_balls}
              totalOvers={match.total_overs}
              deathOversFrom={match.death_overs_from}
              wideRule={match.wide_rule}
              ballsPerOver={perOver}
            />
          )}
          <BatsmenTable innings={currentInnings} />
          {currentInnings.currentBowler && currentOver && (
            <BowlerStats
              bowler={currentInnings.currentBowler}
              over={currentOver}
              bowlingCards={currentInnings.bowlingCards || []}
              ballsPerOver={perOver}
            />
          )}

          {isOverComplete ? (
            <div className="page">
              <section className="card text-center">
                <p className="eyebrow mb-2">Over Complete</p>
                <p className="text-[14px] font-bold">Change of bowler.</p>
                <button onClick={() => setShowBowlerModal(true)} className="btn btn-primary mt-4">Select bowler</button>
              </section>
            </div>
          ) : (
            <>
            {quickUndo && (
              <div className="fixed bottom-[202px] left-3 right-3 z-[55] mx-auto flex max-w-[420px] items-center justify-between rounded-md border border-[var(--green)] bg-[#edf7ee] px-3 py-2 text-[12px] shadow-lg">
                <span className="font-bold text-[var(--green-text)]">Ball saved</span>
                <button onClick={() => { setQuickUndo(false); undoBall.mutate(); }} className="btn btn-secondary btn-sm">Undo now</button>
              </div>
            )}
            <BallInputPanel
              onBall={handleBall}
              onUndo={() => undoBall.mutate()}
              canUndo={hasBallsInOver}
              disabled={addBall.isPending}
              isLoading={addBall.isPending}
              currentOverNumber={currentOver?.over_number}
              deathOversFrom={match.death_overs_from}
              wideRule={match.wide_rule}
              isFreeHit={isFreeHit}
            />
            </>
          )}

          <EndMatchControls
            matchStatus={match.status}
            onEndMatch={() => endMatch.mutate()}
            onRequestEndMatch={() => setDangerAction('endMatch')}
            isLoading={endMatch.isPending}
          />
        </>
      )}

      {/* INNINGS CLOSED — set up chase or end match */}
      {match.status === 'live' && liveData && !currentInnings &&
       (liveData?.innings?.length ?? 0) > 0 &&
       liveData?.innings?.[liveData.innings.length - 1]?.status === 'completed' && (
        <>
          <ScoreHeader liveData={liveData} match={match} />
          <div className="page">
            <section className="card text-center">
              <p className="eyebrow mb-2">Innings Closed</p>
              <p className="text-[14px] font-bold">
                {(liveData?.innings?.length ?? 0) < 2 ? 'Time for the chase.' : 'Both teams have batted.'}
              </p>
              <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                {(liveData?.innings?.length ?? 0) < 2
                  ? 'Set up the openers for the second innings.'
                  : 'Close the match to file the final scorecard.'}
              </p>
              {(liveData?.innings?.length ?? 0) < 2 ? (
                <button onClick={() => setShowEndInningsModal(true)} className="btn btn-primary mt-4">Open 2nd innings</button>
              ) : (
                <button onClick={() => endMatch.mutate()} disabled={endMatch.isPending} className="btn btn-primary mt-4">
                  {endMatch.isPending ? 'Filing' : 'End match'}
                </button>
              )}
            </section>
          </div>
        </>
      )}

      {/* COMPLETED */}
      {match.status === 'completed' && (
        <div className="page">
          <section className="card text-center">
            <p className="eyebrow mb-2" style={{ color: 'var(--green-text)' }}>Filed</p>
            <p className="text-[16px] font-bold">Match closed.</p>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">The full scorecard is in the archive.</p>
            <Link href={`/matches/${matchId}/summary`} className="btn btn-primary mt-4 inline-flex">View scorecard</Link>
            <button onClick={() => unlockMatch.mutate()} disabled={unlockMatch.isPending} className="btn btn-secondary mt-2 inline-flex">
              {unlockMatch.isPending ? 'Unlocking' : 'Admin unlock'}
            </button>
          </section>
        </div>
      )}

      {/* Modals */}
      {showStartModal && (
        <StartMatchModal
          match={match}
          onConfirm={(data) => startMatch.mutate(data, { onSuccess: () => setShowStartModal(false) })}
          onClose={() => setShowStartModal(false)}
          isLoading={startMatch.isPending}
        />
      )}
      {showBowlerModal && (
        <BowlerSelectModal
          players={bowlingTeamPlayers}
          currentBowlerId={currentInnings?.current_bowler_id}
          onSelect={(bowlerId) => endOver.mutate(bowlerId, { onSuccess: () => setShowBowlerModal(false) })}
          onClose={() => setShowBowlerModal(false)}
          isLoading={endOver.isPending}
        />
      )}
      {showWicketModal && (
        <WicketModal
          batsmen={[currentInnings?.batsman1, currentInnings?.batsman2].filter(Boolean)}
          isNoBall={pendingBall.is_noball}
          newBatsmenPool={battingTeamPlayers.filter(
            (p: Player) =>
              p.id !== currentInnings?.current_batsman1_id &&
              p.id !== currentInnings?.current_batsman2_id &&
              !liveData?.innings
                ?.find(i => i.id === currentInnings?.id)
                ?.battingCards?.some((bc: any) => bc.player_id === p.id && bc.is_out)
          )}
          onConfirm={handleWicketConfirm}
          onClose={() => setShowWicketModal(false)}
        />
      )}
      {showEndInningsModal && (currentInnings || liveData?.innings?.length) && (
        <EndInningsModal
          teams={{ teamA: match.teamA!, teamB: match.teamB! }}
          currentInnings={(currentInnings || liveData?.innings?.[liveData!.innings.length - 1])!}
          onConfirm={(data) => endInnings.mutate(data, { onSuccess: () => setShowEndInningsModal(false) })}
          onClose={() => setShowEndInningsModal(false)}
          isLoading={endInnings.isPending}
        />
      )}
      {correctionMode && currentInnings && (
        <CorrectionModal
          mode={correctionMode}
          innings={currentInnings}
          battingPlayers={battingTeamPlayers}
          bowlingPlayers={bowlingTeamPlayers}
          onConfirm={(data) => correctPlayers.mutate(data, { onSuccess: () => setCorrectionMode(null) })}
          onClose={() => setCorrectionMode(null)}
          isLoading={correctPlayers.isPending}
        />
      )}
      {dangerAction === 'endInnings' && (
        <DangerConfirmModal
          title="End current innings?"
          message="This closes the batting innings and opens the setup for the next innings. Use this only when the innings is genuinely finished."
          confirmLabel="End innings"
          onClose={() => setDangerAction(null)}
          onConfirm={() => {
            setDangerAction(null);
            setShowEndInningsModal(true);
          }}
        />
      )}
      {dangerAction === 'endMatch' && (
        <DangerConfirmModal
          title="End match?"
          message="This files the final scorecard and stops live scoring for this match."
          confirmLabel="End match"
          isLoading={endMatch.isPending}
          onClose={() => setDangerAction(null)}
          onConfirm={() => endMatch.mutate(undefined, { onSuccess: () => setDangerAction(null) })}
        />
      )}
    </div>
  );
}
