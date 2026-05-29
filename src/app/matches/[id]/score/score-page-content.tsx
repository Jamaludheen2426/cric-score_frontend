'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Flag, Monitor, Share2, SlidersHorizontal } from 'lucide-react';
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
import { PastBallEditModal } from '@/components/scoring/PastBallEditModal';
import { MatchAlerts } from '@/components/MatchAlerts';
import { BallRecord, LiveScore, Player } from '@/types';
import { ballsPerOver, getBallColor, getBallLabel, getMatchResult } from '@/lib/utils';

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

function LastBallReview({ ball, canUndo, onEdit, isLoading }: {
  ball?: BallRecord;
  canUndo: boolean;
  onEdit: () => void;
  isLoading: boolean;
}) {
  if (!ball) return null;
  return (
    <section className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2">
      <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-muted)]">Last ball</p>
      <span className={getBallColor(ball)}>{getBallLabel(ball)}</span>
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[var(--text-secondary)]">
        {ball.is_wicket ? `Wicket${ball.wicket_type ? ` - ${ball.wicket_type.replace(/_/g, ' ')}` : ''}` : `${ball.runs + ball.extras} run${ball.runs + ball.extras === 1 ? '' : 's'}`}
      </span>
      <button
        onClick={onEdit}
        disabled={!canUndo || isLoading}
        className="btn btn-secondary btn-sm shrink-0"
        title="Undo this ball, then enter the corrected ball"
      >
        {isLoading ? 'Undoing' : 'Edit last'}
      </button>
    </section>
  );
}

function ScorerWarnings({ liveData, isFreeHit, isOverComplete, isPosting }: {
  liveData: LiveScore;
  isFreeHit: boolean;
  isOverComplete: boolean;
  isPosting: boolean;
}) {
  const current = liveData.innings.find(i => i.status === 'live');
  const warnings: string[] = [];
  if (isPosting) warnings.push('Saving ball');
  if (isFreeHit) warnings.push('Free hit next');
  if (isOverComplete) warnings.push('Over complete - choose next bowler');
  if (current?.current_batsman1_id && current.current_batsman1_id === current.current_batsman2_id) warnings.push('Check batters');
  if (!current?.current_bowler_id) warnings.push('Select bowler');
  if (warnings.length === 0) return null;

  return (
    <section className="flex gap-1.5 overflow-x-auto border-b border-[var(--border-subtle)] bg-[#fff7ed] px-3 py-2">
      {warnings.map(warning => (
        <span key={warning} className="shrink-0 rounded border border-[var(--orange)] bg-white px-2 py-1 text-[11px] font-bold text-[var(--orange-text)]">
          {warning}
        </span>
      ))}
    </section>
  );
}

function PartnershipAndFow({ innings }: { innings: LiveScore['innings'][number] }) {
  const currentPartnership = innings.partnerships?.find(p => !p.ended);
  const lastFow = innings.fallOfWickets?.slice(-3).reverse() || [];
  if (!currentPartnership && lastFow.length === 0) return null;
  const partnershipRate = currentPartnership && currentPartnership.balls > 0
    ? ((currentPartnership.runs / currentPartnership.balls) * 6).toFixed(2)
    : '-';
  return (
    <section className="grid gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 sm:grid-cols-2">
      {currentPartnership && (
        <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-2">
          <p className="eyebrow mb-1">Partnership</p>
          <p className="text-[13px] font-bold text-[var(--text-primary)]">
            {currentPartnership.runs} <span className="font-normal text-[var(--text-secondary)]">({currentPartnership.balls}b)</span>
          </p>
          <p className="truncate text-[11px] text-[var(--text-muted)]">
            {currentPartnership.batsman1_name} / {currentPartnership.batsman2_name} · RR {partnershipRate}
          </p>
        </div>
      )}
      {lastFow.length > 0 && (
        <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-2">
          <p className="eyebrow mb-1">Fall of wickets</p>
          <div className="flex flex-wrap gap-1">
            {lastFow.map(fow => (
              <span key={fow.wicket_number} className="rounded bg-white px-1.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                {fow.score}/{fow.wicket_number} {fow.dismissed_player_name} {fow.overs}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
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
  const [showBallEdit, setShowBallEdit] = useState(false);
  const [pendingBall, setPendingBall] = useState<PendingBall>({ runs: 0 });
  const [liveData, setLiveData] = useState<LiveScore | null>(null);
  const [autoBowlerPromptOverId, setAutoBowlerPromptOverId] = useState<number | null>(null);

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

  const { startMatch, addBall, editBall, endOver, correctPlayers, reviseTarget, addPenalty, unlockMatch, auditLogs, endInnings, endMatch, undoBall, exportCsvUrl, exportPdfUrl } = useScoringActions(token || '', matchId);

  useEffect(() => {
    if (!token || !match || match.status !== 'live') return;
    const activeInnings = liveData?.innings?.find(i => i.status === 'live');
    const over = liveData?.currentOver;
    if (!activeInnings || !over) return;

    const requiredBalls = ballsPerOver(liveData?.match || match);
    if (over.legal_balls < requiredBalls) {
      if (autoBowlerPromptOverId === over.id) setAutoBowlerPromptOverId(null);
      return;
    }
    if (autoBowlerPromptOverId === over.id) return;

    setAutoBowlerPromptOverId(over.id);
    setShowBowlerModal(true);
  }, [
    token,
    match,
    match?.status,
    liveData,
    autoBowlerPromptOverId,
  ]);

  if (isLoading) return <PageLoader label="Loading match" />;
  if (!match) return <div className="page text-[var(--text-secondary)]">Match not found.</div>;
  if (!token) return <PinGate matchId={matchId} onSuccess={(t) => setToken(t)} />;

  const currentInnings = liveData?.innings?.find(i => i.status === 'live');
  const currentOver = liveData?.currentOver;
  const perOver = ballsPerOver(liveData?.match || match);
  const isOverComplete = (currentOver?.legal_balls || 0) >= perOver;
  const lastCurrentBall = liveData?.currentOverBalls?.[liveData.currentOverBalls.length - 1];
  const lastBall = lastCurrentBall || liveData?.recentBalls?.[liveData.recentBalls.length - 1];
  const isFreeHit = Boolean(lastCurrentBall?.is_noball || (lastCurrentBall?.is_free_hit && (lastCurrentBall.is_wide || lastCurrentBall.is_noball)));
  const bowlingTeamPlayers = currentInnings
    ? (currentInnings.bowling_team_id === match.team_a_id ? match.teamA : match.teamB)?.players || []
    : [];
  const battingTeamPlayers = currentInnings
    ? (currentInnings.batting_team_id === match.team_a_id ? match.teamA : match.teamB)?.players || []
    : [];

  const handleBall = (data: any) => {
    const afterBall = (res: any) => {
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
  const downloadPdf = async () => {
    const res = await fetch(exportPdfUrl, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${matchId}-scorecard.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const firstDone = liveData?.innings?.find(i => i.innings_number === 1);
  const secondDone = liveData?.innings?.find(i => i.innings_number === 2);
  const tiedAfterSecond = Boolean(firstDone && secondDone && firstDone.total_runs === secondDone.total_runs);
  const needsNextInnings = (liveData?.innings?.length ?? 0) < 2 || (tiedAfterSecond && (liveData?.innings?.length ?? 0) < 4);

  return (
    <div className="app-shell pb-[360px] sm:pb-[300px]">
      {/* Match header */}
      <header className="sticky top-12 z-30 flex h-12 items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-card)] px-2 sm:px-3">
        <Link href="/matches" className="btn btn-secondary btn-sm h-8 w-8 shrink-0 px-0 sm:w-auto sm:px-3" aria-label="Back to matches">
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[14px] font-bold uppercase text-[var(--text-primary)]">{match.title}</h1>
          <p className="text-[11px] text-[var(--text-secondary)]">{match.teamA?.name} <span className="text-[var(--text-muted)]">v</span> {match.teamB?.name}</p>
        </div>
        <div className="flex max-w-[58vw] shrink-0 justify-end gap-1 overflow-x-auto sm:max-w-none">
          {match.status === 'live' && currentInnings && (
            <button
              onClick={() => {
                setDangerAction('endInnings');
              }}
              className="btn btn-secondary btn-sm h-8 w-8 shrink-0 px-0 sm:w-auto sm:px-3"
              aria-label="End innings"
              title="End innings"
            >
              <Flag size={14} />
              <span className="hidden sm:inline">End inn</span>
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
                className="btn btn-secondary btn-sm h-8 w-8 shrink-0 px-0 sm:w-auto sm:px-3"
                aria-label="Copy public scorecard link"
                title="Copy public scorecard link"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <Link href={`/matches/${match.id}/live`} target="_blank" className="btn btn-secondary btn-sm h-8 w-8 shrink-0 px-0 sm:w-auto sm:px-3" aria-label="Open public scorecard" title="Public scorecard">
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Public</span>
              </Link>
              <Link href={`/matches/${match.id}/tv`} target="_blank" className="btn btn-secondary btn-sm h-8 w-8 shrink-0 px-0 sm:w-auto sm:px-3" aria-label="Open TV mode" title="TV mode">
                <Monitor size={14} />
                <span className="hidden sm:inline">TV</span>
              </Link>
              <Link href={`/matches/${match.id}/operator`} target="_blank" className="btn btn-secondary btn-sm h-8 w-8 shrink-0 px-0 sm:w-auto sm:px-3" aria-label="Open operator mode" title="Operator mode">
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Ops</span>
              </Link>
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
          <ScorerWarnings
            liveData={liveData}
            isFreeHit={isFreeHit}
            isOverComplete={isOverComplete}
            isPosting={addBall.isPending || endOver.isPending}
          />
          <LastBallReview
            ball={lastBall}
            canUndo={hasBallsInOver}
            onEdit={() => undoBall.mutate()}
            isLoading={undoBall.isPending}
          />
          <section className="flex gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2">
            <button onClick={() => setCorrectionMode('batter')} className="btn btn-secondary btn-sm flex-1">Correct batsmen</button>
            <button onClick={() => setCorrectionMode('bowler')} className="btn btn-secondary btn-sm flex-1">Change bowler</button>
          </section>
          <section className="grid grid-cols-3 gap-1 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 sm:grid-cols-6">
            <button onClick={() => {
              const runs = Number(prompt('Penalty runs?') || '0');
              if (runs > 0) addPenalty.mutate({ runs, reason: 'manual' });
            }} className="btn btn-secondary btn-sm">Penalty</button>
            <button onClick={() => {
              const target = Number(prompt('Revised target?') || '0');
              if (target > 0) reviseTarget.mutate(target);
            }} className="btn btn-secondary btn-sm">Target</button>
            <button onClick={() => setShowAudit(v => !v)} className="btn btn-secondary btn-sm">History</button>
            <button onClick={() => setShowBallEdit(true)} className="btn btn-secondary btn-sm">Edit ball</button>
            <button onClick={downloadCsv} className="btn btn-secondary btn-sm">CSV</button>
            <button onClick={downloadPdf} className="btn btn-secondary btn-sm">PDF</button>
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
          <PartnershipAndFow innings={currentInnings} />
          {currentInnings.currentBowler && currentOver && (
            <BowlerStats
              bowler={currentInnings.currentBowler}
              over={currentOver}
              bowlingCards={currentInnings.bowlingCards || []}
              ballsPerOver={perOver}
            />
          )}

          {isOverComplete && currentOver ? (
            <div className="page">
              <section className="card text-center">
                <p className="eyebrow mb-2">Over Complete</p>
                <p className="text-[14px] font-bold">Change of bowler.</p>
                <p className="mt-1 text-[12px] font-semibold tabular-nums text-[var(--text-secondary)]">
                  Over {currentOver.over_number}: {currentOver.runs} run{currentOver.runs === 1 ? '' : 's'}, {currentOver.wickets} wicket{currentOver.wickets === 1 ? '' : 's'}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {liveData.currentOverBalls.map((ball, i) => (
                    <span key={i} className={getBallColor(ball)}>{getBallLabel(ball)}</span>
                  ))}
                </div>
                <button onClick={() => setShowBowlerModal(true)} className="btn btn-primary mt-4">Select bowler</button>
              </section>
            </div>
          ) : (
            <>
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
                {(liveData?.innings?.length ?? 0) < 2 ? 'Time for the chase.' : tiedAfterSecond && (liveData?.innings?.length ?? 0) < 4 ? 'Scores level. Super over needed.' : 'Both teams have batted.'}
              </p>
              <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                {(liveData?.innings?.length ?? 0) < 2
                  ? 'Set up the openers for the second innings.'
                  : tiedAfterSecond && (liveData?.innings?.length ?? 0) < 4
                    ? ((liveData?.innings?.length ?? 0) === 2 ? 'Set up the first super-over batting side.' : 'Set up the chase for the super over.')
                  : 'Close the match to file the final scorecard.'}
              </p>
              {needsNextInnings ? (
                <button onClick={() => setShowEndInningsModal(true)} className="btn btn-primary mt-4">
                  {(liveData?.innings?.length ?? 0) < 2 ? 'Open 2nd innings' : 'Open super over'}
                </button>
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
            {liveData && <p className="mt-2 text-[13px] font-bold text-[var(--green-text)]">{getMatchResult(liveData.innings, match)}</p>}
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
          onStrikeId={currentInnings?.on_strike_batsman_id}
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
      {showBallEdit && liveData && currentOver && (
        <PastBallEditModal
          overs={liveData.previousOvers || []}
          currentOver={{
            id: currentOver.id,
            over_number: currentOver.over_number,
            bowler: currentOver.bowler,
            runs: currentOver.runs,
            wickets: currentOver.wickets,
            legal_balls: currentOver.legal_balls,
            balls: liveData.currentOverBalls,
          }}
          onConfirm={(ballId, data) => editBall.mutate({ ballId, data }, { onSuccess: () => setShowBallEdit(false) })}
          onClose={() => setShowBallEdit(false)}
          isLoading={editBall.isPending}
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
