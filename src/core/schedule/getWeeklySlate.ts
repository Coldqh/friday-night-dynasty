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
  switch (game.shortLabel) {
    case 'State Final':
      return 'Четыре четверти решат судьбу титула.';
    case 'Playoff Semifinal':
      return 'Победитель останется в гонке за титул.';
    case 'Rivalry with Playoff Pressure':
      return 'На кону и гордость, и позиция в плей-офф.';
    case 'Rivalry Game':
      return 'Главный локальный матч недели.';
    case 'Unbeaten Watch':
      return 'Одна из команд всё ещё идёт без поражений.';
    case 'Playoff Race':
      return 'Один результат может сдвинуть всю борьбу за топ-4.';
    case 'Top-Four Showdown':
      return 'Две сильные команды штата встречаются напрямую.';
    case 'Evenly Matched Programs':
      return 'Команды очень близки по силе.';
    default:
      break;
  }

  if (world.phase === 'playoffs') {
    return 'Каждый розыгрыш в плей-офф меняет сезон.';
  }

  return 'Матч получает главный свет этой недели.';
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
