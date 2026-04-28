import { firstNames, lastNames } from '../content/names';
import { makeId, SeededRng } from '../random/rng';
import { Coach } from '../world/worldTypes';

export function generateCoach(rng: SeededRng): Coach {
  return {
    id: makeId('coach', rng),
    firstName: rng.pick(firstNames),
    lastName: rng.pick(lastNames),
    age: rng.int(31, 67),
    offense: rng.int(35, 90),
    defense: rng.int(35, 90),
    development: rng.int(35, 90),
    discipline: rng.int(35, 90),
    ambition: rng.int(25, 95),
    wins: 0,
    losses: 0
  };
}
