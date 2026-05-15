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
      return 'A state championship hangs on four quarters.';
    case 'Playoff Semifinal':
      return 'Win and the path to the title stays alive.';
    case 'Rivalry with Playoff Pressure':
      return 'Pride and playoff seeding are both on the line.';
    case 'Rivalry Game':
      return 'The biggest local bragging rights game of the week.';
    case 'Unbeaten Watch':
      return 'A perfect season is still standing at kickoff.';
    case 'Playoff Race':
      return 'One result could swing the final-four picture.';
    case 'Top-Four Showdown':
      return 'Two of the state heavyweights are colliding.';
    case 'Evenly Matched Programs':
      return 'These programs are separated by only a sliver.';
    default:
      break;
  }

  if (world.phase === 'playoffs') {
    return 'Every playoff snap is raising the stakes across the state.';
  }

  return 'Friday night spotlight is landing on this matchup.';
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
