import { getWeekStakes, WeekStakeGame } from '../stakes/getWeekStakes';
import { GameWorld } from '../world/worldTypes';

export interface WeeklySlateEntry extends WeekStakeGame {
  reason: string;
}

export interface WeeklySlate {
  currentWeek: number;
  gamesThisWeek: WeeklySlateEntry[];
  gameOfTheWeek: WeeklySlateEntry | null;
  notableGames: WeeklySlateEntry[];
  completedThisWeek: WeeklySlateEntry[];
}

function getImportanceReason(world: GameWorld, game: WeekStakeGame) {
  if (game.stage === 'final') {
    return 'финал штата';
  }

  if (game.stage === 'semifinal') {
    return 'полуфинал';
  }

  if (game.isRivalry) {
    return 'дерби';
  }

  if (game.stakes.includes('Playoff Race')) {
    return 'гонка за плей-офф';
  }

  if (game.stakes.includes('Undefeated Watch')) {
    return 'команда без поражений';
  }

  if (world.phase === 'playoffs') {
    return 'плей-офф';
  }

  return `приоритет ${Math.round(game.priorityScore)}`;
}

function buildSlateEntry(world: GameWorld, game: WeekStakeGame): WeeklySlateEntry {
  return {
    ...game,
    reason: getImportanceReason(world, game)
  };
}

export function getWeeklySlate(world: GameWorld): WeeklySlate {
  const stakes = getWeekStakes(world);
  const gamesThisWeek = stakes.gamesThisWeek
    .map((game) => buildSlateEntry(world, game))
    .sort(
      (left, right) =>
        right.priorityScore - left.priorityScore ||
        left.awayTeamName.localeCompare(right.awayTeamName)
    );
  const gameOfTheWeek = gamesThisWeek[0] ?? null;
  const notableGames = gamesThisWeek.slice(1, 5);
  const completedThisWeek = gamesThisWeek.filter((game) => game.status === 'Final');

  return {
    currentWeek: stakes.currentWeek,
    gamesThisWeek,
    gameOfTheWeek,
    notableGames,
    completedThisWeek
  };
}
