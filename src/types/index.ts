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
  tournament_id?: number;
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
  innings?: Innings[];
}

export interface Tournament {
  id: number;
  name: string;
  format: 'league' | 'knockout';
  total_overs: number;
  players_per_side: number;
  death_overs_from?: number;
  wide_rule: 'normal' | 'strict';
  scorer_pin: string;
  status: 'upcoming' | 'live' | 'completed';
  created_at?: string;
  teams?: Team[];
  matches?: Match[];
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
  partnerships?: Partnership[];
  fallOfWickets?: FallOfWicket[];
  run_rate?: number | null;
  required_rate?: number | null;
  runs_needed?: number | null;
  balls_left?: number | null;
}

export interface Partnership {
  wicket_number: number;     // 1 = opening (before 1st wicket)
  batsman1_id: number | null;
  batsman2_id: number | null;
  batsman1_name: string;
  batsman2_name: string;
  runs: number;
  balls: number;
  ended: boolean;            // false = still in progress / current pair
}

export interface FallOfWicket {
  wicket_number: number;
  score: number;             // team total when wicket fell
  overs: string;             // notation e.g. "4.3"
  dismissed_player_id: number;
  dismissed_player_name: string;
  wicket_type: string | null;
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
  /** Decorated by live.service from the ball log — count of wides this bowler conceded. */
  wides?: number;
  /** Decorated by live.service from the ball log — count of no-balls this bowler conceded. */
  noballs?: number;
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
  id?: number;
  runs: number;
  is_wide: boolean;
  is_noball: boolean;
  is_wicket: boolean;
  wicket_type?: string;
  extras: number;
  batsman?: string;
  extra_type?: 'bye' | 'leg_bye' | 'wide' | 'no_ball';
  next_striker_id?: number;
}

export interface OverSummary {
  id: number;
  over_number: number;
  bowler?: Player;
  runs: number;
  wickets: number;
  legal_balls: number;
  balls: BallRecord[];
}

export interface LiveScore {
  match: Match;
  innings: Innings[];
  currentOver: CurrentOver | null;
  currentOverBalls: BallRecord[];
  recentBalls: BallRecord[];
  previousOvers?: OverSummary[];
}

export type WicketType = 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket' | 'obstructing_field' | 'retired' | 'retired_hurt' | 'retired_out';
