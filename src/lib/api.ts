import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// ── Teams ──────────────────────────────────────────────────────
export const teamsApi = {
  list: () => api.get('/teams').then(r => r.data.data),
  get: (id: number) => api.get(`/teams/${id}`).then(r => r.data.data),
  create: (data: { name: string; logo_url?: string }) =>
    api.post('/teams', data).then(r => r.data.data),
  update: (id: number, data: { name?: string; logo_url?: string }) =>
    api.put(`/teams/${id}`, data).then(r => r.data.data),
  delete: (id: number) => api.delete(`/teams/${id}`).then(r => r.data.data),
};

export const playersApi = {
  list: (teamId: number) => api.get(`/teams/${teamId}/players`).then(r => r.data.data),
  create: (teamId: number, data: { name: string; batting_order?: number; role?: string }) =>
    api.post(`/teams/${teamId}/players`, data).then(r => r.data.data),
  update: (teamId: number, playerId: number, data: any) =>
    api.put(`/teams/${teamId}/players/${playerId}`, data).then(r => r.data.data),
  delete: (teamId: number, playerId: number) =>
    api.delete(`/teams/${teamId}/players/${playerId}`).then(r => r.data.data),
};

// ── Matches ────────────────────────────────────────────────────
export const matchesApi = {
  list: () => api.get('/matches').then(r => r.data.data),
  get: (id: number) => api.get(`/matches/${id}`).then(r => r.data.data),
  create: (data: any) => api.post('/matches', data).then(r => r.data.data),
  verifyPin: (id: number, pin: string) =>
    api.post(`/matches/${id}/verify-pin`, { pin }).then(r => r.data.data),
  liveScore: (shareToken: string) =>
    api.get(`/matches/live/${shareToken}`).then(r => r.data.data),
};

export const tournamentsApi = {
  list: () => api.get('/tournaments').then(r => r.data.data),
  get: (id: number) => api.get(`/tournaments/${id}`).then(r => r.data.data),
  create: (data: any) => api.post('/tournaments', data).then(r => r.data.data),
  createDemo: () => api.post('/tournaments/demo').then(r => r.data.data),
  generateFixtures: (id: number) => api.post(`/tournaments/${id}/fixtures`).then(r => r.data.data),
};

// ── Scoring (requires auth token) ─────────────────────────────
export function scoringApi(token: string) {
  const headers = { Authorization: `Bearer ${token}` };

  return {
    start: (matchId: number, data: any) =>
      api.post(`/matches/${matchId}/start`, data, { headers }).then(r => r.data.data),

    addBall: (matchId: number, data: {
      runs: number;
      is_wide?: boolean;
      is_noball?: boolean;
      is_wicket?: boolean;
      wicket_type?: string;
      dismissed_player_id?: number;
      new_batsman_id?: number;
      extras?: number;
      extra_type?: 'bye' | 'leg_bye' | 'wide' | 'no_ball';
      next_striker_id?: number;
    }) => api.post(`/matches/${matchId}/ball`, data, { headers }).then(r => r.data.data),

    endOver: (matchId: number, next_bowler_id: number) =>
      api.post(`/matches/${matchId}/over/end`, { next_bowler_id }, { headers }).then(r => r.data.data),

    correctPlayers: (matchId: number, data: {
      current_batsman1_id?: number;
      current_batsman2_id?: number;
      on_strike_batsman_id?: number;
      current_bowler_id?: number;
    }) => api.post(`/matches/${matchId}/corrections/players`, data, { headers }).then(r => r.data.data),

    reviseTarget: (matchId: number, target: number) =>
      api.post(`/matches/${matchId}/corrections/target`, { target }, { headers }).then(r => r.data.data),

    addPenalty: (matchId: number, data: { runs: number; reason?: string }) =>
      api.post(`/matches/${matchId}/penalty`, data, { headers }).then(r => r.data.data),

    auditLogs: (matchId: number) =>
      api.get(`/matches/${matchId}/audit`, { headers }).then(r => r.data.data),

    exportCsvUrl: (matchId: number) =>
      `${api.defaults.baseURL}/matches/${matchId}/export.csv`,

    unlockMatch: (matchId: number) =>
      api.post(`/matches/${matchId}/unlock`, {}, { headers }).then(r => r.data.data),

    endInnings: (matchId: number, data: {
      opening_batsman1_id: number;
      opening_batsman2_id: number;
      opening_bowler_id: number;
    }) => api.post(`/matches/${matchId}/innings/end`, data, { headers }).then(r => r.data.data),

    endMatch: (matchId: number) =>
      api.post(`/matches/${matchId}/end`, {}, { headers }).then(r => r.data.data),

    undoBall: (matchId: number) =>
      api.delete(`/matches/${matchId}/ball/last`, { headers }).then(r => r.data.data),
  };
}
