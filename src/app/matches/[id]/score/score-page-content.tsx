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

export function ScorePageContent({ matchId }: { matchId: number }) {
  const [token, setToken] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showEndInningsModal, setShowEndInningsModal] = useState(false);
  const [pendingBallRuns, setPendingBallRuns] = useState<number>(0);
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
  if (!match) return <div className="page text-ink-soft">Match not found.</div>;
  if (!token) return <PinGate matchId={matchId} onSuccess={(t) => setToken(t)} />;

  const currentInnings = liveData?.innings?.find(i => i.status === 'live');
  const currentOver = liveData?.currentOver;
  const isDeath = !!match.death_overs_from && (currentOver?.over_number || 0) >= match.death_overs_from;
  const isOverComplete = (currentOver?.legal_balls || 0) >= 6;
  const bowlingTeamPlayers = currentInnings
    ? (currentInnings.bowling_team_id === match.team_a_id ? match.teamA : match.teamB)?.players || []
    : [];
  const battingTeamPlayers = currentInnings
    ? (currentInnings.batting_team_id === match.team_a_id ? match.teamA : match.teamB)?.players || []
    : [];

  const handleBall = (data: any) => {
    if (data.is_wicket) {
      setPendingBallRuns(data.runs || 0);
      setShowWicketModal(true);
    } else {
      addBall.mutate(data, {
        onSuccess: () => {
          if ((currentOver?.legal_balls || 0) + 1 >= 6 && !data.is_wide && !data.is_noball) {
            setShowBowlerModal(true);
          }
        },
      });
    }
  };

  const handleWicketConfirm = (wicketData: any) => {
    setShowWicketModal(false);
    addBall.mutate({ ...wicketData, runs: pendingBallRuns }, {
      onSuccess: () => {
        if ((currentOver?.legal_balls || 0) + 1 >= 6) setShowBowlerModal(true);
      },
    });
  };

  return (
    <div className="page">
      {/* Match header */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-12 pb-8 border-b border-hairline">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <p className="eyebrow">Scoring desk</p>
            <span className="text-[12px] text-ink-mute font-mono">#{String(match.id).padStart(3, '0')}</span>
            {isDeath && currentInnings && <span className="badge-pending">Death overs</span>}
          </div>
          <h1 className="text-title mb-3">{match.title}</h1>
          <div className="flex items-baseline gap-2.5 text-[15px] text-ink-soft">
            <span className="text-ink">{match.teamA?.name}</span>
            <span className="text-ink-mute">vs</span>
            <span className="text-ink">{match.teamB?.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {match.status === 'pending' && (
            <button onClick={() => setShowStartModal(true)} className="btn-primary">Open play</button>
          )}
          {match.status === 'live' && currentInnings && (
            <button onClick={() => setShowEndInningsModal(true)} className="btn-secondary btn-sm">
              End innings
            </button>
          )}
          {match.share_token && (
            <Link href={`/matches/${match.id}/live`} target="_blank" className="btn-secondary btn-sm">
              Public ↗
            </Link>
          )}
        </div>
      </header>

      {/* PENDING */}
      {match.status === 'pending' && (
        <section className="card text-center py-20 rise">
          <p className="eyebrow mb-4">Awaiting toss</p>
          <h2 className="text-h2 mb-3">First ball not yet bowled.</h2>
          <p className="text-ink-soft mb-8 max-w-md mx-auto">
            Settle the toss and the openers — the scoring desk opens immediately after.
          </p>
          <button onClick={() => setShowStartModal(true)} className="btn-primary btn-lg">
            Open play →
          </button>
        </section>
      )}

      {/* LOADING */}
      {match.status === 'live' && (!liveData || ((liveData?.innings?.length ?? 0) === 0)) && (
        <PageLoader label="Tuning the signal" />
      )}

      {/* ACTIVE SCORING */}
      {(match.status === 'live' || liveData) && currentInnings && liveData && (
        <div className="space-y-6">
          <ScoreHeader liveData={liveData} match={match} />

          {currentOver && (
            <OverDisplay
              balls={liveData.currentOverBalls}
              overNumber={currentOver.over_number}
              legalBalls={currentOver.legal_balls}
              totalOvers={match.total_overs}
            />
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <BatsmenTable innings={currentInnings} />
            {currentInnings.currentBowler && currentOver && (
              <BowlerStats
                bowler={currentInnings.currentBowler}
                over={currentOver}
                bowlingCards={currentInnings.bowlingCards || []}
              />
            )}
          </div>

          {!isOverComplete ? (
            <div className="space-y-3">
              <BallInputPanel
                onBall={handleBall}
                disabled={addBall.isPending}
                isLoading={addBall.isPending}
              />
              {((currentOver?.legal_balls ?? 0) > 0 || (liveData?.currentOverBalls?.length ?? 0) > 0) && (
                <div className="flex justify-end">
                  <button
                    onClick={() => { if (confirm('Undo the last ball?')) undoBall.mutate(); }}
                    disabled={undoBall.isPending}
                    className="btn-ghost btn-sm text-wicket hover:text-wicket hover:bg-wicket-soft"
                  >
                    {undoBall.isPending ? 'Undoing…' : '← Undo last ball'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <section className="card-soft text-center py-12">
              <p className="eyebrow mb-3">Over complete</p>
              <h3 className="text-h2 mb-2">Change of bowler.</h3>
              <p className="text-ink-soft mb-6">Pick the next at the mark to keep play moving.</p>
              <button onClick={() => setShowBowlerModal(true)} className="btn-primary">
                Select bowler →
              </button>
            </section>
          )}

          <EndMatchControls
            matchStatus={match.status}
            onEndMatch={() => endMatch.mutate()}
            isLoading={endMatch.isPending}
          />
        </div>
      )}

      {/* INNINGS CLOSED */}
      {match.status === 'live' && liveData && !currentInnings &&
       (liveData?.innings?.length ?? 0) > 0 &&
       liveData?.innings?.[liveData.innings.length - 1]?.status === 'completed' && (
        <div className="space-y-6">
          <ScoreHeader liveData={liveData} match={match} />
          <section className="card text-center py-16">
            <p className="eyebrow mb-3">Innings closed</p>
            <h2 className="text-h2 mb-3">
              {(liveData?.innings?.length ?? 0) < 2 ? 'Time for the chase.' : 'Both teams have batted.'}
            </h2>
            <p className="text-ink-soft mb-8 max-w-md mx-auto">
              {(liveData?.innings?.length ?? 0) < 2
                ? 'Set up the openers for the second innings.'
                : 'Close the match to file the official scorecard.'}
            </p>
            {(liveData?.innings?.length ?? 0) < 2 ? (
              <button onClick={() => setShowEndInningsModal(true)} className="btn-primary btn-lg">
                Open 2nd innings →
              </button>
            ) : (
              <button onClick={() => endMatch.mutate()} disabled={endMatch.isPending} className="btn-primary btn-lg">
                {endMatch.isPending ? 'Filing…' : 'End match →'}
              </button>
            )}
          </section>
        </div>
      )}

      {/* COMPLETED */}
      {match.status === 'completed' && (
        <section className="card text-center py-16">
          <p className="eyebrow mb-3 text-pitch">Filed</p>
          <h2 className="text-h2 mb-3">Match closed.</h2>
          <p className="text-ink-soft mb-8">The card is in the archive.</p>
          <Link href={`/matches/${matchId}/summary`} className="btn-primary btn-lg">
            View scorecard →
          </Link>
        </section>
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
          fielders={bowlingTeamPlayers}
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
