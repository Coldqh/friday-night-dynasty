import { CollegeGraduate, PlayerStats, Position } from '../world/worldTypes';

export type NFLConference = 'AFC' | 'NFC';
export type NFLDivision = 'AFC East' | 'AFC North' | 'AFC South' | 'AFC West' | 'NFC East' | 'NFC North' | 'NFC South' | 'NFC West';
export type NFLGameStage = 'regular' | 'wildCard' | 'divisional' | 'conference' | 'superBowl';

export interface NFLTeam {
  id: string;
  city: string;
  name: string;
  shortName: string;
  abbreviation: string;
  conference: NFLConference;
  division: NFLDivision;
  logoAsset: string;
  prestige: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  rosterPlayerIds: string[];
  history: Array<{
    year: number;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    madePlayoffs: boolean;
    wonSuperBowl: boolean;
  }>;
}

export interface NFLPlayer {
  id: string;
  sourceCollegePlayerId: string | null;
  sourceCollegeTeamId: string | null;
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
  overall: number;
  potential: number;
  teamId: string;
  yearsPro: number;
  contractYears: number;
  salary: number;
  seasonStats: PlayerStats;
  careerStats: PlayerStats;
}

export interface NFLScheduledGame {
  id: string;
  stage: NFLGameStage;
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

export interface NFLScheduleWeek {
  week: number;
  games: NFLScheduledGame[];
}

export interface NFLStanding {
  rank: number;
  teamId: string;
  teamName: string;
  conference: NFLConference;
  division: NFLDivision;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
}

export interface NFLSeasonState {
  year: number;
  currentWeek: number;
  regularSeasonWeeks: number;
  schedule: NFLScheduleWeek[];
  completedGames: NFLScheduledGame[];
  standings: NFLStanding[];
  playoffTeamIds: string[];
  championTeamId: string | null;
  superBowlGameId: string | null;
  seasonLog: Array<{
    id: string;
    year: number;
    week: number;
    headline: string;
    body: string;
    gameId: string | null;
  }>;
}

export interface NFLDraftPick {
  id: string;
  year: number;
  round: number;
  pick: number;
  nflTeamId: string;
  nflTeamName: string;
  sourceCollegePlayerId: string;
  nflPlayerId: string;
  playerName: string;
  position: Position;
  collegeTeamId: string | null;
  collegeTeamName: string | null;
  overall: number;
  potential: number;
}

export interface NFLTrade {
  id: string;
  year: number;
  week: number;
  fromTeamId: string;
  fromTeamName: string;
  toTeamId: string;
  toTeamName: string;
  playerId: string;
  playerName: string;
  position: Position;
  overall: number;
}

export type NFLWorld = {
  nflTeams?: NFLTeam[];
  nflPlayers?: NFLPlayer[];
  nflSeason?: NFLSeasonState;
  nflDraftHistory?: NFLDraftPick[];
  nflTrades?: NFLTrade[];
  graduatedCollegePlayers?: CollegeGraduate[];
};
