import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi, playersApi, matchesApi, scoringApi, tournamentsApi } from './api';

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

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, playerId, data }: { teamId: number; playerId: number; data: any }) =>
      playersApi.update(teamId, playerId, data),
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
    refetchInterval: false,
    staleTime: 0,
  });
}

// ── Scoring ────────────────────────────────────────────────────
export function useTournaments() {
  return useQuery({ queryKey: ['tournaments'], queryFn: tournamentsApi.list });
}

export function useTournament(id: number) {
  return useQuery({ queryKey: ['tournaments', id], queryFn: () => tournamentsApi.get(id), enabled: !!id });
}

export function useCreateTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tournamentsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments'] }),
  });
}

export function useCreateDemoTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tournamentsApi.createDemo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments'] });
      qc.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useGenerateFixtures() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tournamentsApi.generateFixtures(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['tournaments'] });
      qc.invalidateQueries({ queryKey: ['tournaments', id] });
      qc.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useScoringActions(token: string, matchId: number) {
  const qc = useQueryClient();
  const api = scoringApi(token);

  // Lightweight invalidate: only the match metadata. Don't refetch the
  // live score after every ball — SSE already pushes the next snapshot
  // a moment later. Refetching live here would force a second heavy
  // round-trip on top of the mutation and freeze the UI for seconds.
  const invalidateMatch = () => qc.invalidateQueries({ queryKey: ['matches', matchId] });

  // Full invalidate (live + summary too) for status-changing actions
  // where the user expects an immediate refresh even if SSE is slow.
  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['matches', matchId] }),
      qc.invalidateQueries({ queryKey: ['live'] }),
      qc.invalidateQueries({ queryKey: ['summary'] }),
    ]);
  };

  // Per-ball mutations are tagged 'quiet' so the global loader overlay
  // doesn't flash on every tap. They still show inline button feedback
  // via mutation.isPending.
  const startMatch  = useMutation({ mutationFn: (data: any)            => api.start(matchId, data),           onSuccess: invalidateAll  });
  const addBall     = useMutation({ mutationKey: ['quiet','ball'],     mutationFn: (data: any) => api.addBall(matchId, data),                onSuccess: invalidateMatch });
  const endOver     = useMutation({ mutationKey: ['quiet','end-over'], mutationFn: (nextBowlerId: number) => api.endOver(matchId, nextBowlerId), onSuccess: invalidateMatch });
  const endInnings  = useMutation({ mutationFn: (data: any)            => api.endInnings(matchId, data),      onSuccess: invalidateAll  });
  const endMatch    = useMutation({ mutationFn: ()                      => api.endMatch(matchId),             onSuccess: invalidateAll  });
  const undoBall    = useMutation({ mutationKey: ['quiet','undo'],     mutationFn: () => api.undoBall(matchId),                              onSuccess: invalidateMatch });

  return { startMatch, addBall, endOver, endInnings, endMatch, undoBall };
}
