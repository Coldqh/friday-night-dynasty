export type Phase = 'regular' | 'playoffs' | 'offseason';
export type MatchStage = 'regular' | 'semifinal' | 'final';
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S' | 'K';
export type ClassYear = 'FR' | 'SO' | 'JR' | 'SR';
export type OffenseStyle = 'balanced' | 'runHeavy' | 'passHeavy' | 'spread' | 'powerRun';
export type DefenseStyle = 'balanced' | 'aggressive' | 'conservative' | 'blitzHeavy';

export interface StateRegion {
  id: string;
  name: string;
}

export interface City {
  id: string;
  stateId: string;
  name: string;
  population: number;
  footballCulture: number;
}

export interface School {
  id: string;
  cityId: string;
  name: string;
  mascot: string;
  prestige: number;
  facilities: number;
}

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
  height: number;
  weight: number;
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

export interface TeamHistoryEntry {
  year: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  madePlayoffs: boolean;
  playoffAppearance: boolean;
  wonTitle: boolean;
  titleWon: boolean;
  note: string;
}

export interface Team {
  id: string;
  schoolId: string;
  cityId: string;
  coachId: string;
  schoolName: string;
  cityName: string;
  mascot: string;
  prestige: number;
  name: string;
  shortName: string;
  offenseStyle: OffenseStyle;
  defenseStyle: DefenseStyle;
  morale: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  offenseRating: number;
  defenseRating: number;
  overallRating: number;
  roster: string[];
  playerIds: string[];
  history: TeamHistoryEntry[];
  rivalryIds: string[];
}

export interface GameKeyPlayer {
  playerId: string;
  teamId: string;
  name: string;
  position: Position;
  statLine: string;
}

export interface ScheduledGame {
  id: string;
  stage: MatchStage;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: string | null;
  loserId: string | null;
  summary: string;
  keyPlayers: GameKeyPlayer[];
  mvpPlayerId: string | null;
}

export interface ScheduleWeek {
  week: number;
  games: ScheduledGame[];
}

export interface TeamStanding {
  rank: number;
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  overallRating: number;
}

export interface SeasonLogEntry {
  id: string;
  year: number;
  week: number;
  headline: string;
  body: string;
  gameId: string | null;
}

export type StateHeadlineType =
  | 'preview'
  | 'recap'
  | 'upset'
  | 'blowout'
  | 'playoff'
  | 'playoffRace'
  | 'undefeatedWatch'
  | 'mustWin'
  | 'lateSeason'
  | 'rivalry'
  | 'champion'
  | 'offseason'
  | 'general';

export interface StateHeadline {
  id: string;
  year: number;
  week: number;
  type: StateHeadlineType;
  title: string;
  body: string;
  teamIds: string[];
  gameId: string | null;
}

export interface SeasonState {
  year: number;
  currentWeek: number;
  regularSeasonWeeks: number;
  schedule: ScheduleWeek[];
  completedGames: ScheduledGame[];
  standings: TeamStanding[];
  playoffTeams: string[];
  playoffGames: ScheduledGame[];
  championId: string | null;
  championTeamId: string | null;
  seasonLog: SeasonLogEntry[];
}

export interface NewsItem {
  id: string;
  year: number;
  week: number;
  headline: string;
  body: string;
}

export interface ChampionHistoryEntry {
  year: number;
  championId: string;
  championTeamId: string;
  championName: string;
  runnerUpId: string | null;
  runnerUpName: string;
  finalGameId: string | null;
  finalScore: string;
  finalSummary: string;
  note: string;
}

export interface TitleGameHistoryEntry {
  year: number;
  gameId: string;
  championId: string;
  championName: string;
  runnerUpId: string | null;
  runnerUpName: string;
  finalScore: string;
  summary: string;
}

export interface WorldHistory {
  champions: ChampionHistoryEntry[];
  titleGames: TitleGameHistoryEntry[];
}

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
