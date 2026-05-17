import { generateCollegeLayer } from './generateColleges';
import { SeededRng } from '../random/rng';
import { GameWorld } from '../world/worldTypes';

export function ensureCollegeLayer(world: GameWorld): GameWorld {
  const hasColleges = Array.isArray(world.colleges) && world.colleges.length > 0;
  const hasCollegeTeams = Array.isArray(world.collegeTeams) && world.collegeTeams.length > 0;

  if (hasColleges && hasCollegeTeams) {
    return {
      ...world,
      recruitingProfiles: Array.isArray(world.recruitingProfiles) ? world.recruitingProfiles : [],
      commitments: Array.isArray(world.commitments) ? world.commitments : []
    };
  }

  const rng = new SeededRng(world.seed + 64013);
  const { colleges, collegeTeams } = generateCollegeLayer({
    stateId: world.state.id,
    cities: world.cities,
    rng
  });

  return {
    ...world,
    colleges,
    collegeTeams,
    recruitingProfiles: Array.isArray(world.recruitingProfiles) ? world.recruitingProfiles : [],
    commitments: Array.isArray(world.commitments) ? world.commitments : []
  };
}
