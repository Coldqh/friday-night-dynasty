import { simulateCollegeSeason, simulateCollegeWeek } from '../colleges/collegeSeason';
import { isNFLSeasonComplete, simulateNFLSeason, simulateNFLWeek } from '../nfl/nflLayer';
import { simulateSeason, simulateWeek } from '../season/simulateSeason';
import { GameWorld } from './worldTypes';

function cloneWorld(world: GameWorld): GameWorld {
  return structuredClone(world);
}

export function isSchoolSeasonComplete(world: GameWorld) {
  return world.phase === 'offseason' && Boolean(world.season.championId);
}

export function isCollegeSeasonComplete(world: GameWorld) {
  return Boolean(world.collegeSeason?.championTeamId);
}

export function canAdvanceWorldYear(world: GameWorld) {
  return isSchoolSeasonComplete(world) && isCollegeSeasonComplete(world) && isNFLSeasonComplete(world);
}

function syncWorldYear(world: GameWorld): GameWorld {
  const withAny = world as GameWorld & { nflSeason?: { year: number } };

  return {
    ...world,
    currentYear: world.season.year,
    collegeSeason: world.collegeSeason
      ? {
          ...world.collegeSeason,
          year: world.season.year
        }
      : world.collegeSeason,
    nflSeason: withAny.nflSeason
      ? {
          ...withAny.nflSeason,
          year: world.season.year
        }
      : withAny.nflSeason
  } as GameWorld;
}

function dedupeScheduledGames<T extends { id: string }>(games: T[]) {
  const byId = new Map<string, T>();

  games.forEach((game) => {
    byId.set(game.id, game);
  });

  return [...byId.values()];
}

function dedupeSchoolProgress(world: GameWorld): GameWorld {
  const completedGames = dedupeScheduledGames(world.season.completedGames);
  const playoffGames = dedupeScheduledGames(world.season.playoffGames);
  const schedule = world.season.schedule.map((week) => ({
    ...week,
    games: dedupeScheduledGames(week.games)
  }));

  return {
    ...world,
    season: {
      ...world.season,
      schedule,
      completedGames,
      playoffGames
    }
  };
}

function dedupeCollegeProgress(world: GameWorld): GameWorld {
  if (!world.collegeSeason) {
    return world;
  }

  const completedGames = dedupeScheduledGames(world.collegeSeason.completedGames);
  const schedule = world.collegeSeason.schedule.map((week) => ({
    ...week,
    games: dedupeScheduledGames(week.games)
  }));

  return {
    ...world,
    collegeSeason: {
      ...world.collegeSeason,
      schedule,
      completedGames
    }
  };
}

function dedupeNFLProgress(world: GameWorld): GameWorld {
  const withAny = world as GameWorld & {
    nflSeason?: {
      completedGames: Array<{ id: string }>;
      schedule: Array<{ week: number; games: Array<{ id: string }> }>;
    };
  };

  if (!withAny.nflSeason) {
    return world;
  }

  return {
    ...withAny,
    nflSeason: {
      ...withAny.nflSeason,
      completedGames: dedupeScheduledGames(withAny.nflSeason.completedGames),
      schedule: withAny.nflSeason.schedule.map((week) => ({
        ...week,
        games: dedupeScheduledGames(week.games)
      }))
    }
  } as GameWorld;
}

export function cleanWorldProgress(world: GameWorld): GameWorld {
  return syncWorldYear(dedupeNFLProgress(dedupeCollegeProgress(dedupeSchoolProgress(world))));
}

function hasSchoolRegularGameThisWeek(world: GameWorld) {
  if (world.phase !== 'regular') {
    return true;
  }

  const week = world.season.schedule.find((entry) => entry.week === world.season.currentWeek);

  if (!week) {
    return true;
  }

  const completedIds = new Set(world.season.completedGames.map((game) => game.id));

  return week.games.some((game) => !completedIds.has(game.id));
}

function hasCollegeGameThisWeek(world: GameWorld) {
  const season = world.collegeSeason;

  if (!season || season.championTeamId) {
    return false;
  }

  const week = season.schedule.find((entry) => entry.week === season.currentWeek);

  if (!week) {
    return true;
  }

  const completedIds = new Set(season.completedGames.map((game) => game.id));

  return week.games.some((game) => !completedIds.has(game.id));
}

export function simulateUnifiedWeek(input: GameWorld): GameWorld {
  let world = cleanWorldProgress(cloneWorld(input));

  if (canAdvanceWorldYear(world)) {
    return world;
  }

  if (!isSchoolSeasonComplete(world) && hasSchoolRegularGameThisWeek(world)) {
    world = simulateWeek(world);
  } else if (!isSchoolSeasonComplete(world)) {
    world = {
      ...world,
      season: {
        ...world.season,
        currentWeek: world.season.currentWeek + 1
      }
    };
  }

  world = cleanWorldProgress(world);

  if (!isCollegeSeasonComplete(world) && hasCollegeGameThisWeek(world)) {
    world = simulateCollegeWeek(world);
  } else if (!isCollegeSeasonComplete(world) && world.collegeSeason) {
    world = {
      ...world,
      collegeSeason: {
        ...world.collegeSeason,
        currentWeek: world.collegeSeason.currentWeek + 1
      }
    };
  }

  world = cleanWorldProgress(world);

  if (!isNFLSeasonComplete(world)) {
    world = simulateNFLWeek(world);
  }

  return cleanWorldProgress(world);
}

export function simulateUnifiedSeason(input: GameWorld): GameWorld {
  let world = cleanWorldProgress(cloneWorld(input));

  if (canAdvanceWorldYear(world)) {
    return world;
  }

  if (!isSchoolSeasonComplete(world)) {
    world = simulateSeason(world);
  }

  world = cleanWorldProgress(world);

  if (!isCollegeSeasonComplete(world)) {
    world = simulateCollegeSeason(world);
  }

  world = cleanWorldProgress(world);

  if (!isNFLSeasonComplete(world)) {
    world = simulateNFLSeason(world);
  }

  return cleanWorldProgress(world);
}
