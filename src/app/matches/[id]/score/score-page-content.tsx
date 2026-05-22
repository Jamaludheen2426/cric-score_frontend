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
import { LiveScore, Player } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface PendingBall { runs: number; is_wide?: boolean; is_noball?: boolean }

export function ScorePageContent({ matchId }: { matchId: number }) {
  const [token, setToken] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showEndInningsModal, setShowEndInningsModal] = useState(false);
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

  const { startMatch, addBall, endOver, endInnings, endMatch, undoBall } = useScoringActions(token || '', matchId);

  if (isLoading) return <PageLoader label="Loading match" />;
  if (!match) return <div className="page text-[var(--text-secondary)]">Match not found.</div>;
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

  const handleBall = (data: any) => {
    if (data.is_wicket) {
      setPendingBall({ runs: data.runs || 0, is_wide: data.is_wide, is_noball: data.is_noball });
      setShowWicketModal(true);
    } else {
      addBall.mutate(data, {
        onSuccess: (res: any) => {
          if (res?.allOut || res?.oversFinished || res?.targetReached) return;
          if ((currentOver?.legal_balls || 0) + 1 >= 6 && !data.is_wide && !data.is_noball) {
            setShowBowlerModal(true);
          }
        },
      });
    }
  };

  const handleWicketConfirm = (wicketData: any) => {
    setShowWicketModal(false);
    addBall.mutate({ ...wicketData, runs: pendingBall.runs, is_wide: pendingBall.is_wide, is_noball: pendingBall.is_noball }, {
      onSuccess: (res: any) => {
        if (res?.allOut || res?.oversFinished || res?.targetReached) return;
        if ((currentOver?.legal_balls || 0) + 1 >= 6 && !pendingBall.is_wide && !pendingBall.is_noball) {
          setShowBowlerModal(true);
        }
      },
    });
  };

  const hasBallsInOver = (currentOver?.legal_balls ?? 0) > 0 || (liveData?.currentOverBalls?.length ?? 0) > 0;

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
            <button onClick={() => setShowEndInningsModal(true)} className="btn btn-secondary btn-sm">End inn</button>
          )}
          {match.share_token && (
            <Link href={`/matches/${match.id}/live`} target="_blank" className="btn btn-secondary btn-sm">Public</Link>
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
          {currentOver && (
            <OverDisplay
              balls={liveData.currentOverBalls}
              overNumber={currentOver.over_number}
              legalBalls={currentOver.legal_balls}
              totalOvers={match.total_overs}
            />
          )}
          <BatsmenTable innings={currentInnings} />
          {currentInnings.currentBowler && currentOver && (
            <BowlerStats
              bowler={currentInnings.currentBowler}
              over={currentOver}
              bowlingCards={currentInnings.bowlingCards || []}
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
            <BallInputPanel
              onBall={handleBall}
              onUndo={() => { if (confirm('Undo the last ball?')) undoBall.mutate(); }}
              canUndo={hasBallsInOver}
              disabled={addBall.isPending}
              isLoading={addBall.isPending}
            />
          )}

          <EndMatchControls
            matchStatus={match.status}
            onEndMatch={() => endMatch.mutate()}
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
    </div>
  );
}
