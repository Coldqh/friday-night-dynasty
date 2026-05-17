export type Phase = 'regular' | 'playoffs' | 'offseason';
export type MatchStage = 'regular' | 'semifinal' | 'final';
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S' | 'K';
export type ClassYear = 'FR' | 'SO' | 'JR' | 'SR';
export type CollegeClassYear = 'FR' | 'SO' | 'JR' | 'SR';
export type OffenseStyle = 'balanced' | 'runHeavy' | 'passHeavy' | 'spread' | 'powerRun';
export type DefenseStyle = 'balanced' | 'aggressive' | 'conservative' | 'blitzHeavy';

export type CareerStage =
  | 'highSchool'
  | 'graduated'
  | 'collegeProspect'
  | 'college'
  | 'draftProspect'
  | 'pro'
  | 'retired';

export type PersonRoleType = 'player' | 'coach' | 'graduate' | 'collegePlayer' | 'scout' | 'gm' | 'retired';

export type CareerEventType =
  | 'created'
  | 'freshmanArrival'
  | 'development'
  | 'graduation'
  | 'recruiting'
  | 'commitment'
  | 'collegeArrival'
  | 'collegeSeason'
  | 'collegeGraduation'
  | 'draft'
  | 'proDebut'
  | 'retirement'
  | 'staffMove'
  | 'general';

export type RecruitingStatus = 'uncommitted' | 'committed' | 'walkOn' | 'noOffer';

export interface CareerEvent {
  id: string;
  year: number;
  week: number;
  type: CareerEventType;
  title: string;
  body: string;
  teamId: string | null;
  schoolId: string | null;
}

export interface PersonRole {
  type: PersonRoleType;
  entityId: string;
  teamId: string | null;
  schoolId: string | null;
  startedYear: number;
  endedYear: number | null;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  hometownCityId: string;
  personality: string;
  ambition: number;
  discipline: number;
  reputation: number;
  roles: PersonRole[];
  careerEvents: CareerEvent[];
}

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

export interface College {
  id: string;
  stateId: string;
  cityId: string;
  name: string;
  shortName: string;
  prestige: number;
  facilities: number;
  academicRating: number;
  scholarshipBudget: number;
}

export interface CollegeTeamHistoryEntry {
  year: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  wonTitle: boolean;
}

export interface CollegeTeam {
  id: string;
  collegeId: string;
  cityId: string;
  name: string;
  shortName: string;
  prestige: number;
  offenseStyle: OffenseStyle;
  defenseStyle: DefenseStyle;
  rosterPlayerIds: string[];
  recruitingNeeds: Position[];
  rivalryIds: string[];
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  history: CollegeTeamHistoryEntry[];
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
  personId?: string;
  teamId: string;
  schoolId: string;
  cityId: string;
  hometownCityId?: string;
  careerStage?: CareerStage;
  collegeId?: string | null;
  collegeTeamId?: string | null;
  recruitingProfileId?: string | null;
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

export interface CollegePlayer {
  id: string;
  sourcePlayerId: string;
  personId: string | null;
  collegeId: string;
  collegeTeamId: string;
  sourceHighSchoolTeamId: string;
  sourceSchoolId: string;
  hometownCityId: string;
  firstName: string;
  lastName: string;
  age: number;
  classYear: CollegeClassYear;
  eligibilityRemaining: number;
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
  stars: number;
  seasonStats: PlayerStats;
  careerStats: PlayerStats;
}

export interface RecruitingProfile {
  id: string;
  year: number;
  playerId: string;
  personId: string | null;
  playerName: string;
  fromTeamId: string;
  fromTeamName: string;
  position: Position;
  overall: number;
  potential: number;
  prospectScore: number;
  stars: number;
  stateRank: number;
  status: RecruitingStatus;
  offerCollegeIds: string[];
  committedCollegeId: string | null;
  committedCollegeTeamId: string | null;
}

export interface CollegeCommitment {
  id: string;
  year: number;
  playerId: string;
  personId: string | null;
  playerName: string;
  position: Position;
  fromTeamId: string;
  fromTeamName: string;
  collegeId: string;
  collegeTeamId: string;
  collegeName: string;
  stars: number;
  prospectScore: number;
  convertedToCollegePlayerId: string | null;
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

export interface CollegeScheduledGame {
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
  mvpPlayerId: string | null;
}

export interface ScheduleWeek {
  week: number;
  games: ScheduledGame[];
}

export interface CollegeScheduleWeek {
  week: number;
  games: CollegeScheduledGame[];
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

export interface CollegeStanding {
  rank: number;
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  prestige: number;
  rosterStrength: number;
}

export interface RankingSnapshotEntry {
  teamId: string;
  rank: number;
  rating: number;
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
  | 'momentum'
  | 'pollPressure'
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
  previousRankings: RankingSnapshotEntry[];
  playoffTeams: string[];
  playoffGames: ScheduledGame[];
  championId: string | null;
  championTeamId: string | null;
  seasonLog: SeasonLogEntry[];
}

export interface CollegeSeasonState {
  year: number;
  currentWeek: number;
  regularSeasonWeeks: number;
  schedule: CollegeScheduleWeek[];
  completedGames: CollegeScheduledGame[];
  standings: CollegeStanding[];
  championTeamId: string | null;
  championshipGameId: string | null;
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

export interface RivalryGameResult {
  id: string;
  year: number;
  week: number;
  stage: MatchStage;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  winnerId: string | null;
  summary: string;
}

export interface CollegeChampionHistoryEntry {
  year: number;
  championTeamId: string;
  championName: string;
  runnerUpTeamId: string | null;
  runnerUpName: string | null;
  finalScore: string;
}

export interface WorldHistory {
  champions: ChampionHistoryEntry[];
  titleGames: TitleGameHistoryEntry[];
  rivalryResults: RivalryGameResult[];
  collegeChampions?: CollegeChampionHistoryEntry[];
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
  people?: Person[];
  graduatedPlayers?: Player[];
  colleges?: College[];
  collegeTeams?: CollegeTeam[];
  collegePlayers?: CollegePlayer[];
  recruitingProfiles?: RecruitingProfile[];
  commitments?: CollegeCommitment[];
  collegeSeason?: CollegeSeasonState;
  season: SeasonState;
  news: NewsItem[];
  history: WorldHistory;
}
