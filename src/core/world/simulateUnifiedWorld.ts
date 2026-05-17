import { simulateCollegeSeason, simulateCollegeWeek } from '../colleges/collegeSeason';
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
  return isSchoolSeasonComplete(world) && isCollegeSeasonComplete(world);
}

export function simulateUnifiedWeek(input: GameWorld): GameWorld {
  let world = cloneWorld(input);

  if (!isSchoolSeasonComplete(world)) {
    world = simulateWeek(world);
  }

  if (!isCollegeSeasonComplete(world)) {
    world = simulateCollegeWeek(world);
  }

  if (world.collegeSeason && world.collegeSeason.year !== world.season.year) {
    world.collegeSeason = {
      ...world.collegeSeason,
      year: world.season.year
    };
  }

  world.currentYear = world.season.year;

  return world;
}

export function simulateUnifiedSeason(input: GameWorld): GameWorld {
  let world = cloneWorld(input);

  if (!isSchoolSeasonComplete(world)) {
    world = simulateSeason(world);
  }

  if (!isCollegeSeasonComplete(world)) {
    world = simulateCollegeSeason(world);
  }

  if (world.collegeSeason && world.collegeSeason.year !== world.season.year) {
    world.collegeSeason = {
      ...world.collegeSeason,
      year: world.season.year
    };
  }

  world.currentYear = world.season.year;

  return world;
}
