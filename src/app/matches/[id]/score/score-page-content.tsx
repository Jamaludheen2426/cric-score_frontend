'use client';

import { useEffect, useState } from 'react';
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
import { EndInningsModal } from '@/components/scoring/EndInningsModal';
import { LiveScore, Player } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function ScorePageContent({ matchId }: { matchId: number }) {
  const [token, setToken] = useState<string | null>(null);
  const [streamConnected, setStreamConnected] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showEndInningsModal, setShowEndInningsModal] = useState(false);
  const [pendingBall, setPendingBall] = useState<any | null>(null);
  const [liveData, setLiveData] = useState<LiveScore | null>(null);

  const { data: match, isLoading } = useMatch(matchId);
  const { data: initialLiveScore, refetch: refetchLiveScore, isFetching: isLiveFetching } = useLiveScore(match?.share_token || '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.sessionStorage.getItem(`scorer-token:${matchId}`);
    if (saved) setToken(saved);
  }, [matchId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `scorer-token:${matchId}`;
    if (token) {
      window.sessionStorage.setItem(key, token);
    } else {
      window.sessionStorage.removeItem(key);
    }
  }, [matchId, token]);

  useEffect(() => {
    if (initialLiveScore) setLiveData(initialLiveScore);
  }, [initialLiveScore]);

  useEffect(() => {
    if (!match?.share_token) return;
    const url = `${API_URL.replace('/api', '')}/api/matches/events/${match.share_token}`;
    const es = new EventSource(url);
    es.onopen = () => setStreamConnected(true);
    es.onmessage = (e) => { try { setLiveData(JSON.parse(e.data)); } catch (_) {} };
    es.onerror = () => setStreamConnected(false);
    return () => es.close();
  }, [match?.share_token]);

  const { startMatch, addBall, endOver, endInnings, endMatch, undoBall } = useScoringActions(token || '', matchId);

  if (isLoading) return <PageLoader label="Loading match" />;
  if (!match) return <div className="page text-ink-soft">Match not found.</div>;
  if (!token) return <PinGate matchId={matchId} onSuccess={(t) => setToken(t)} />;

  const currentInnings = liveData?.innings?.find(i => i.status === 'live');
  const currentOver = liveData?.currentOver;
  const isOverComplete = (currentOver?.legal_balls || 0) >= 6;
  const bowlingTeamPlayers = currentInnings
    ? (currentInnings.bowling_team_id === match.team_a_id ? match.teamA : match.teamB)?.players || []
    : [];
  const battingTeamPlayers = currentInnings
    ? (currentInnings.batting_team_id === match.team_a_id ? match.teamA : match.teamB)?.players || []
    : [];
  const effectiveBatters = currentInnings
    ? Math.max(1, Math.min(match.players_per_side, battingTeamPlayers.length || match.players_per_side))
    : match.players_per_side;
  const inningsHasNoPair = !!currentInnings && currentInnings.total_wickets >= effectiveBatters - 1;

  const willCompleteOver = (ball: any) =>
    (currentOver?.legal_balls || 0) + (!ball.is_wide && !ball.is_noball ? 1 : 0) >= 6;

  const refreshLiveScore = async () => {
    const fresh = await refetchLiveScore();
    if (fresh.data) setLiveData(fresh.data);
  };

  const handleBall = (data: any) => {
    if (data.is_wicket) {
      setPendingBall(data);
      setShowWicketModal(true);
      return;
    }

    addBall.mutate(data, {
      onSuccess: async (res: any) => {
        await refreshLiveScore();
        if (res?.allOut || res?.oversFinished || res?.targetReached) return;
        if (willCompleteOver(data)) setShowBowlerModal(true);
      },
    });
  };

  const handleWicketConfirm = (wicketData: any) => {
    setShowWicketModal(false);
    const ball = { ...(pendingBall || { runs: 0 }), ...wicketData };
    addBall.mutate(ball, {
      onSuccess: async (res: any) => {
        await refreshLiveScore();
        if (res?.allOut || res?.oversFinished || res?.targetReached) return;
        if (willCompleteOver(ball)) setShowBowlerModal(true);
      },
      onSettled: () => setPendingBall(null),
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-40">
      <header className="flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-3">
        <div>
          <p className="truncate text-[14px] font-bold text-[var(--text-primary)]">{match.title}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">{match.teamA?.name} vs {match.teamB?.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {match.status === 'pending' && (
            <button onClick={() => setShowStartModal(true)} className="btn btn-primary btn-sm">Open play</button>
          )}
          {match.status === 'live' && currentInnings && (
            <button onClick={() => setShowEndInningsModal(true)} className="btn btn-secondary btn-sm">
              End innings
            </button>
          )}
          {match.share_token && (
            <Link href={`/matches/${match.id}/live`} target="_blank" className="btn btn-secondary btn-sm">
              Public
            </Link>
          )}
        </div>
      </header>

      {match.status === 'pending' && (
        <section className="m-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
          <p className="eyebrow mb-2">Awaiting toss</p>
          <h2 className="text-[16px] font-bold">First ball not yet bowled</h2>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Set the toss, openers, and opening bowler.</p>
          <button onClick={() => setShowStartModal(true)} className="btn btn-primary mt-3 w-full">
            Open play
          </button>
        </section>
      )}

      {match.status === 'live' && (!liveData || ((liveData?.innings?.length ?? 0) === 0)) && (
        <PageLoader label="Tuning the signal" />
      )}

      {(match.status === 'live' || liveData) && currentInnings && liveData && (
        <div>
          {!streamConnected && (
            <div className="sticky top-0 z-40 border-b border-[var(--orange)] bg-[#2a1a00] px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--orange-text)]">
              Live stream reconnecting
            </div>
          )}
          {(addBall.isPending || undoBall.isPending || isLiveFetching) && (
            <div className="sticky top-0 z-40 border-b border-[var(--green)] bg-[#0f2318] px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--green-text)]">
              Updating score
            </div>
          )}

          <ScoreHeader liveData={liveData} match={match} />

          {currentOver && (
            <OverDisplay
              balls={liveData.currentOverBalls}
              overNumber={currentOver.over_number}
              legalBalls={currentOver.legal_balls}
              totalOvers={match.total_overs}
              deathOversFrom={match.death_overs_from}
            />
          )}

          <div className="overflow-y-auto">
            <BatsmenTable innings={currentInnings} />
            {currentInnings.currentBowler && currentOver && (
              <BowlerStats
                bowler={currentInnings.currentBowler}
                over={currentOver}
                bowlingCards={currentInnings.bowlingCards || []}
              />
            )}
          </div>

          {inningsHasNoPair ? (
            <section className="m-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
              <p className="eyebrow mb-2 text-[var(--red-text)]">All out</p>
              <h3 className="text-[16px] font-bold">Innings should close now</h3>
              <p className="mb-3 mt-1 text-[13px] text-[var(--text-secondary)]">There are not enough not-out batters left to continue scoring.</p>
              {liveData.innings.length < 2 ? (
                <button onClick={() => setShowEndInningsModal(true)} className="btn btn-primary w-full">Open next innings</button>
              ) : (
                <button onClick={() => endMatch.mutate()} disabled={endMatch.isPending} className="btn btn-primary w-full">End match</button>
              )}
            </section>
          ) : !isOverComplete ? (
            <BallInputPanel
              onBall={handleBall}
              onUndo={() => {
                if (confirm('Undo the last ball?')) {
                  undoBall.mutate(undefined, { onSuccess: refreshLiveScore });
                }
              }}
              disabled={addBall.isPending || undoBall.isPending || isLiveFetching}
              isLoading={addBall.isPending || undoBall.isPending || isLiveFetching}
              canUndo={(currentOver?.legal_balls ?? 0) > 0 || (liveData?.currentOverBalls?.length ?? 0) > 0}
            />
          ) : (
            <section className="m-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
              <p className="eyebrow mb-2">Over complete</p>
              <h3 className="text-[16px] font-bold">Change of bowler</h3>
              <button onClick={() => setShowBowlerModal(true)} className="btn btn-primary mt-3 w-full">
                Select bowler
              </button>
            </section>
          )}
        </div>
      )}

      {match.status === 'live' && liveData && !currentInnings &&
       (liveData?.innings?.length ?? 0) > 0 &&
       liveData?.innings?.[liveData.innings.length - 1]?.status === 'completed' && (
        <div className="space-y-6">
          <ScoreHeader liveData={liveData} match={match} />
          <section className="m-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
            <p className="eyebrow mb-3">Innings closed</p>
            <h2 className="mb-3 text-[16px] font-bold text-[var(--text-primary)]">
              {(liveData?.innings?.length ?? 0) < 2 ? 'Time for the chase.' : 'Both teams have batted.'}
            </h2>
            <p className="mb-3 mt-1 max-w-md text-[13px] text-[var(--text-secondary)]">
              {(liveData?.innings?.length ?? 0) < 2
                ? 'Set up the openers for the second innings.'
                : 'Close the match to file the official scorecard.'}
            </p>
            {(liveData?.innings?.length ?? 0) < 2 ? (
              <button onClick={() => setShowEndInningsModal(true)} className="btn btn-primary w-full">
                Open 2nd innings
              </button>
            ) : (
              <button onClick={() => endMatch.mutate()} disabled={endMatch.isPending} className="btn btn-primary w-full">
                {endMatch.isPending ? 'Filing' : 'End match'}
              </button>
            )}
          </section>
        </div>
      )}

      {match.status === 'completed' && (
        <section className="m-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
          <p className="eyebrow mb-2 text-[var(--green-text)]">Filed</p>
          <h2 className="text-[16px] font-bold">Match closed</h2>
          <p className="mb-3 mt-1 text-[13px] text-[var(--text-secondary)]">The card is in the archive.</p>
          <Link href={`/matches/${matchId}/summary`} className="btn btn-primary w-full">
            View scorecard
          </Link>
        </section>
      )}

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
          isNoBall={!!pendingBall?.is_noball}
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
    </div>
  );
}
