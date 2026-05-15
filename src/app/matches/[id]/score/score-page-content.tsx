'use client';

import { useState, useEffect } from 'react';
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
import { isDeathOvers } from '@/lib/utils';
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

  // Seed liveData from HTTP fetch until SSE delivers an update
  useEffect(() => {
    if (initialLiveScore && !liveData) {
      setLiveData(initialLiveScore);
    }
  }, [initialLiveScore]);

  // Subscribe to SSE for real-time updates
  useEffect(() => {
    if (!match?.share_token) return;
    const url = `${API_URL.replace('/api', '')}/api/matches/events/${match.share_token}`;
    const es = new EventSource(url);
    es.onmessage = (e) => {
      try { setLiveData(JSON.parse(e.data)); } catch (_) {}
    };
    return () => es.close();
  }, [match?.share_token]);

  const { startMatch, addBall, endOver, endInnings, endMatch, undoBall } = useScoringActions(token || '', matchId);

  const handlePinVerified = (t: string) => setToken(t);

  if (isLoading) return <PageLoader label="Loading match..." />;
  if (!match) return <div className="page-container text-gray-500">Match not found</div>;
  if (!token) return <PinGate matchId={matchId} onSuccess={handlePinVerified} />;

  const currentInnings = liveData?.innings?.find(i => i.status === 'live');
  const currentOver = liveData?.currentOver;
  const isDeath = isDeathOvers(currentOver?.over_number || 0, match.death_overs_from);
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
        onSuccess: (res) => {
          const updatedInnings = res?.innings;
          if (updatedInnings && (currentOver?.legal_balls || 0) + 1 >= 6 && !data.is_wide && !data.is_noball) {
            setShowBowlerModal(true);
          }
        }
      });
    }
  };

  const handleWicketConfirm = (wicketData: any) => {
    setShowWicketModal(false);
    addBall.mutate({ ...wicketData, runs: pendingBallRuns }, {
      onSuccess: () => {
        if ((currentOver?.legal_balls || 0) + 1 >= 6) {
          setShowBowlerModal(true);
        }
      }
    });
  };

  return (
    <div className="page-container max-w-4xl">
      {/* Match title + status bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display font-bold text-white text-lg">{match.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">{match.teamA?.name} vs {match.teamB?.name}</span>
            {isDeath && currentInnings && (
              <span className="text-xs font-display font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                💀 Death Overs
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {match.status === 'live' && currentInnings && (
            <button
              onClick={() => setShowEndInningsModal(true)}
              className="text-xs btn-secondary py-1.5 px-3"
            >
              End Innings
            </button>
          )}
          {match.status === 'pending' && (
            <button onClick={() => setShowStartModal(true)} className="btn-primary">
              Start Match
            </button>
          )}
        </div>
      </div>

      {match.status === 'pending' && !liveData && (
        <div className="card text-center py-16">
          <p className="text-gray-400 font-display text-lg mb-2">Match not started yet</p>
          <p className="text-gray-600 text-sm mb-6">Set toss result and opening players to begin scoring</p>
          <button onClick={() => setShowStartModal(true)} className="btn-primary px-8 py-3 text-base">
            Start Match →
          </button>
        </div>
      )}

      {(match.status === 'live' || liveData) && currentInnings && (
        <div className="space-y-4">
          {/* Score header */}
          {liveData && <ScoreHeader liveData={liveData} match={match} />}

          {/* Current over */}
          {currentOver && liveData && (
            <OverDisplay
              balls={liveData.currentOverBalls}
              overNumber={currentOver.over_number}
              legalBalls={currentOver.legal_balls}
              totalOvers={match.total_overs}
            />
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Batsmen */}
            {currentInnings && <BatsmenTable innings={currentInnings} />}
            {/* Bowler */}
            {currentInnings?.currentBowler && currentOver && (
              <BowlerStats
                bowler={currentInnings.currentBowler}
                over={currentOver}
                bowlingCards={currentInnings.bowlingCards || []}
              />
            )}
          </div>

          {/* Ball input */}
          {!isOverComplete ? (
            <div className="space-y-2">
              <BallInputPanel
                onBall={handleBall}
                disabled={addBall.isPending}
                isLoading={addBall.isPending}
              />
              {(currentOver?.legal_balls ?? 0) > 0 || (liveData?.currentOverBalls?.length ?? 0) > 0 ? (
                <div className="flex justify-end">
                  <button
                    onClick={() => { if (confirm('Undo last ball?')) undoBall.mutate(); }}
                    disabled={undoBall.isPending}
                    className="text-xs btn-secondary py-1.5 px-3 text-rose-400 border-rose-400/30 hover:border-rose-400/60 disabled:opacity-40"
                  >
                    {undoBall.isPending ? 'Undoing...' : '↩ Undo Last Ball'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-400 font-display mb-3">Over complete — select next bowler</p>
              <button onClick={() => setShowBowlerModal(true)} className="btn-primary px-6">
                Select Bowler →
              </button>
            </div>
          )}

          {/* End match controls */}
          <EndMatchControls
            matchStatus={match.status}
            onEndMatch={() => endMatch.mutate()}
            isLoading={endMatch.isPending}
          />
        </div>
      )}

      {/* All-out: live match, innings ended, no active innings */}
      {match.status === 'live' && liveData && !currentInnings && (
        <div className="card text-center py-12 space-y-4">
          {liveData && <ScoreHeader liveData={liveData} match={match} />}
          <p className="text-amber-400 font-display text-lg mt-4">All out!</p>
          {(liveData?.innings?.length ?? 0) < 2 ? (
            <>
              <p className="text-gray-500 text-sm">Set up the second innings to continue.</p>
              <button onClick={() => setShowEndInningsModal(true)} className="btn-primary px-8">
                Setup 2nd Innings →
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm">Both innings complete. End the match to see the final scorecard.</p>
              <button onClick={() => endMatch.mutate()} disabled={endMatch.isPending} className="btn-primary px-8">
                {endMatch.isPending ? 'Ending...' : 'End Match →'}
              </button>
            </>
          )}
        </div>
      )}

      {match.status === 'completed' && (
        <div className="card text-center py-12">
          <p className="text-pitch-400 font-display text-xl mb-2">✅ Match Completed</p>
          <a href={`/matches/${matchId}/summary`} className="btn-primary mt-4 inline-block">View Scorecard</a>
        </div>
      )}

      {/* Modals */}
      {showStartModal && (
        <StartMatchModal
          match={match}
          onConfirm={(data) => {
            startMatch.mutate(data, { onSuccess: () => setShowStartModal(false) });
          }}
          onClose={() => setShowStartModal(false)}
          isLoading={startMatch.isPending}
        />
      )}

      {showBowlerModal && (
        <BowlerSelectModal
          players={bowlingTeamPlayers}
          currentBowlerId={currentInnings?.current_bowler_id}
          onSelect={(bowlerId) => {
            endOver.mutate(bowlerId, { onSuccess: () => setShowBowlerModal(false) });
          }}
          onClose={() => setShowBowlerModal(false)}
          isLoading={endOver.isPending}
        />
      )}

      {showWicketModal && (
        <WicketModal
          batsmen={[
            currentInnings?.batsman1,
            currentInnings?.batsman2,
          ].filter(Boolean)}
          fielders={bowlingTeamPlayers}
          newBatsmenPool={battingTeamPlayers.filter(
            (p: Player) => p.id !== currentInnings?.current_batsman1_id &&
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
          currentInnings={(currentInnings || liveData?.innings?.[liveData.innings.length - 1])!}
          onConfirm={(data) => {
            endInnings.mutate(data, { onSuccess: () => setShowEndInningsModal(false) });
          }}
          onClose={() => setShowEndInningsModal(false)}
          isLoading={endInnings.isPending}
        />
      )}
    </div>
  );
}
