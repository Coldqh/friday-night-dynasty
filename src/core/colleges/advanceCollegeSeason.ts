import { GameWorld } from '../world/worldTypes';

export function advanceCollegeSeason(input: GameWorld): GameWorld {
  return structuredClone(input);
}
