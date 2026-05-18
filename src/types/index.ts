export interface Team {
  id: number;
  name: string;
  logo_url?: string;
  created_at?: string;
  players?: Player[];
}

export interface Player {
  id: number;
  team_id: number;
  name: string;
  batting_order?: number;
  role?: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
}

export interface Match {
  id: number;
  title: string;
  team_a_id: number;
  team_b_id: number;
  total_overs: number;
  players_per_side: number;
  death_overs_from?: number;
  wide_rule: 'normal' | 'strict';
  status: 'pending' | 'live' | 'completed';
  toss_winner_team_id?: number;
  elected_to?: 'bat' | 'bowl';
  scorer_pin?: string;
  share_token: string;
  created_at?: string;
  teamA?: Team;
  teamB?: Team;
}

export interface Innings {
  id: number;
  innings_number: number;
  status: 'live' | 'completed';
  batting_team_id: number;
  bowling_team_id: number;
  battingTeam?: Team;
  bowlingTeam?: Team;
  total_runs: number;
  total_wickets: number;
  total_overs_bowled: number;
  extras: number;
  target?: number;
  current_batsman1_id?: number;
  current_batsman2_id?: number;
  current_bowler_id?: number;
  on_strike_batsman_id?: number;
  batsman1?: Player;
  batsman2?: Player;
  currentBowler?: Player;
  onStrike?: Player;
  battingCards?: BattingCard[];
  bowlingCards?: BowlingCard[];
  run_rate?: number | null;
  required_rate?: number | null;
  runs_needed?: number | null;
  balls_left?: number | null;
}

export interface BattingCard {
  id: number;
  innings_id: number;
  player_id: number;
  player?: Player;
  bowler?: Player;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  is_out: boolean;
  dismissal_type?: string;
  bowler_id?: number;
  batting_position: number;
}

export interface BowlingCard {
  id: number;
  innings_id: number;
  player_id: number;
  player?: Player;
  overs: number;
  runs: number;
  wickets: number;
  extras: number;
  legal_balls: number;
}

export interface CurrentOver {
  id: number;
  over_number: number;
  bowler?: Player;
  runs: number;
  wickets: number;
  legal_balls: number;
}

export interface BallRecord {
  runs: number;
  is_wide: boolean;
  is_noball: boolean;
  is_wicket: boolean;
  wicket_type?: string;
  extras: number;
  batsman?: string;
}

export interface LiveScore {
  match: Match;
  innings: Innings[];
  currentOver: CurrentOver | null;
  currentOverBalls: BallRecord[];
  recentBalls: BallRecord[];
}

export type WicketType = 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket' | 'obstructing_field' | 'retired';
