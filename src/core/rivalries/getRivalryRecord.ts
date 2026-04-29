import { GameWorld, MatchStage, RivalryGameResult, ScheduledGame } from '../world/worldTypes';
import { isRivalryGame } from './isRivalryGame';

const STAGE_ORDER: Record<MatchStage, number> = {
  regular: 0,
  semifinal: 1,
  final: 2
};

export interface RivalryRecord {
  teamId: string;
  rivalTeamId: string;
  gamesPlayed: number;
  teamWins: number;
  rivalWins: number;
  ties: number;
  lastGame?: {
    year: number;
    week?: number;
    stage?: MatchStage;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    winnerId: string | null;
    summary?: string;
  };
  currentStreak: {
    teamId: string;
    wins: number;
  } | null;
}

function isMatchingPair(
  entry: { homeTeamId: string; awayTeamId: string },
  teamId: string,
  rivalTeamId: string
) {
  return (
    (entry.homeTeamId === teamId && entry.awayTeamId === rivalTeamId) ||
    (entry.homeTeamId === rivalTeamId && entry.awayTeamId === teamId)
  );
}

function toCurrentSeasonRivalryResult(world: GameWorld, game: ScheduledGame): RivalryGameResult | null {
  if (game.homeScore === null || game.awayScore === null || !isRivalryGame(world, game)) {
    return null;
  }

  return {
    id: game.id,
    year: world.season.year,
    week: game.week,
    stage: game.stage,
    homeTeamId: game.homeTeamId,
    awayTeamId: game.awayTeamId,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    winnerId: game.winnerId,
    summary: game.summary
  };
}

function compareChronologically(left: RivalryGameResult, right: RivalryGameResult) {
  return (
    left.year - right.year ||
    left.week - right.week ||
    STAGE_ORDER[left.stage] - STAGE_ORDER[right.stage] ||
    left.id.localeCompare(right.id)
  );
}

function getRelevantResults(world: GameWorld, teamId: string, rivalTeamId: string) {
  const resultsMap = new Map<string, RivalryGameResult>();

  world.history.rivalryResults
    .filter((entry) => isMatchingPair(entry, teamId, rivalTeamId))
    .forEach((entry) => {
      resultsMap.set(entry.id, entry);
    });

  world.season.completedGames
    .map((game) => toCurrentSeasonRivalryResult(world, game))
    .filter((entry): entry is RivalryGameResult => entry !== null)
    .filter((entry) => isMatchingPair(entry, teamId, rivalTeamId))
    .forEach((entry) => {
      resultsMap.set(entry.id, entry);
    });

  return [...resultsMap.values()].sort(compareChronologically);
}

export function getRivalryRecord(world: GameWorld, teamId: string, rivalTeamId: string): RivalryRecord {
  const results = getRelevantResults(world, teamId, rivalTeamId);
  const teamWins = results.filter((entry) => entry.winnerId === teamId).length;
  const rivalWins = results.filter((entry) => entry.winnerId === rivalTeamId).length;
  const ties = results.filter(
    (entry) => entry.winnerId === null || entry.homeScore === entry.awayScore
  ).length;
  const lastGame = results.at(-1);
  let currentStreak: RivalryRecord['currentStreak'] = null;

  if (lastGame?.winnerId) {
    let wins = 0;

    for (let index = results.length - 1; index >= 0; index -= 1) {
      const result = results[index];

      if (!result || result.winnerId !== lastGame.winnerId) {
        break;
      }

      wins += 1;
    }

    currentStreak = {
      teamId: lastGame.winnerId,
      wins
    };
  }

  return {
    teamId,
    rivalTeamId,
    gamesPlayed: results.length,
    teamWins,
    rivalWins,
    ties,
    lastGame: lastGame
      ? {
          year: lastGame.year,
          week: lastGame.week,
          stage: lastGame.stage,
          homeTeamId: lastGame.homeTeamId,
          awayTeamId: lastGame.awayTeamId,
          homeScore: lastGame.homeScore,
          awayScore: lastGame.awayScore,
          winnerId: lastGame.winnerId,
          summary: lastGame.summary
        }
      : undefined,
    currentStreak
  };
}
