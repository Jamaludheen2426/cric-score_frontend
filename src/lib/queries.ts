import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi, playersApi, matchesApi, scoringApi } from './api';

// ── Teams ──────────────────────────────────────────────────────
export function useTeams() {
  return useQuery({ queryKey: ['teams'], queryFn: teamsApi.list });
}

export function useTeam(id: number) {
  return useQuery({ queryKey: ['teams', id], queryFn: () => teamsApi.get(id), enabled: !!id });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => teamsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: any }) => playersApi.create(teamId, data),
    onSuccess: (_, { teamId }) => qc.invalidateQueries({ queryKey: ['teams', teamId] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: number; playerId: number }) =>
      playersApi.delete(teamId, playerId),
    onSuccess: (_, { teamId }) => qc.invalidateQueries({ queryKey: ['teams', teamId] }),
  });
}

// ── Matches ────────────────────────────────────────────────────
export function useMatches() {
  return useQuery({ queryKey: ['matches'], queryFn: matchesApi.list });
}

export function useMatch(id: number) {
  return useQuery({ queryKey: ['matches', id], queryFn: () => matchesApi.get(id), enabled: !!id });
}

export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: matchesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  });
}

export function useVerifyPin() {
  return useMutation({
    mutationFn: ({ id, pin }: { id: number; pin: string }) => matchesApi.verifyPin(id, pin),
  });
}

export function useLiveScore(shareToken: string) {
  return useQuery({
    queryKey: ['live', shareToken],
    queryFn: () => matchesApi.liveScore(shareToken),
    enabled: !!shareToken,
    refetchInterval: false, // SSE handles updates
  });
}

// ── Scoring ────────────────────────────────────────────────────
export function useScoringActions(token: string, matchId: number) {
  const qc = useQueryClient();
  const api = scoringApi(token);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['matches', matchId] });
    qc.invalidateQueries({ queryKey: ['live'] });
  };

  const startMatch = useMutation({ mutationFn: (data: any) => api.start(matchId, data), onSuccess: invalidate });
  const addBall = useMutation({ mutationFn: (data: any) => api.addBall(matchId, data), onSuccess: invalidate });
  const endOver = useMutation({ mutationFn: (nextBowlerId: number) => api.endOver(matchId, nextBowlerId), onSuccess: invalidate });
  const endInnings = useMutation({ mutationFn: (data: any) => api.endInnings(matchId, data), onSuccess: invalidate });
  const endMatch = useMutation({ mutationFn: () => api.endMatch(matchId), onSuccess: invalidate });
  const undoBall = useMutation({ mutationFn: () => api.undoBall(matchId), onSuccess: invalidate });

  return { startMatch, addBall, endOver, endInnings, endMatch, undoBall };
}
