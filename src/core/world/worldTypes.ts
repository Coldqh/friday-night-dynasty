export type Phase = 'regular' | 'playoffs' | 'offseason';
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S' | 'K';
export type ClassYear = 'FR' | 'SO' | 'JR' | 'SR';
export type OffenseStyle = 'balanced' | 'runHeavy' | 'passHeavy' | 'spread' | 'powerRun';
export type DefenseStyle = 'balanced' | 'aggressive' | 'conservative' | 'blitzHeavy';

export interface StateRegion { id: string; name: string; }
export interface City { id: string; stateId: string; name: string; population: number; footballCulture: number; }
export interface School { id: string; cityId: string; name: string; mascot: string; prestige: number; facilities: number; }

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  offense: number;
  defense: number;
  development: number;
  discipline: number;
  ambition: number;
  wins: number;
  losses: number;
}

export interface PlayerStats {
  passingYards: number;
  rushingYards: number;
  receivingYards: number;
  tackles: number;
  sacks: number;
  touchdowns: number;
  interceptions: number;
}

export interface Player {
  id: string;
  teamId: string;
  schoolId: string;
  cityId: string;
  firstName: string;
  lastName: string;
  age: number;
  classYear: ClassYear;
  position: Position;
  heightInches: number;
  weightLbs: number;
  overall: number;
  potential: number;
  workEthic: number;
  discipline: number;
  confidence: number;
  leadership: number;
  injuryRisk: number;
  ambition: number;
  traits: string[];
  seasonStats: PlayerStats;
  careerStats: PlayerStats;
}

export interface Team {
  id: string;
  schoolId: string;
  cityId: string;
  coachId: string;
  name: string;
  shortName: string;
  offenseStyle: OffenseStyle;
  defenseStyle: DefenseStyle;
  morale: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  rivalryIds: string[];
}

export interface GameResult {
  homeScore: number;
  awayScore: number;
  homeYards: number;
  awayYards: number;
  turnoversHome: number;
  turnoversAway: number;
  mvpPlayerId: string | null;
  summary: string;
}

export interface ScheduledGame {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  result: GameResult | null;
}

export interface ScheduleWeek { week: number; games: ScheduledGame[]; }
export interface SeasonState { schedule: ScheduleWeek[]; playoffGames: ScheduledGame[]; championTeamId: string | null; }

export interface NewsItem { id: string; year: number; week: number; headline: string; body: string; }
export interface SeasonHistory { year: number; championTeamId: string; championName: string; mvpPlayerId: string | null; mvpName: string; note: string; }
export interface WorldHistory { seasons: SeasonHistory[]; }

export interface GameWorld {
  id: string;
  seed: number;
  currentYear: number;
  currentWeek: number;
  phase: Phase;
  state: StateRegion;
  cities: City[];
  schools: School[];
  teams: Team[];
  coaches: Coach[];
  players: Player[];
  season: SeasonState;
  news: NewsItem[];
  history: WorldHistory;
}
