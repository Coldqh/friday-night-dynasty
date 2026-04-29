import { SeededRng } from '../random/rng';
import { Player } from '../world/worldTypes';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getClassGrowthBand(player: Player) {
  switch (player.classYear) {
    case 'FR':
      return { min: 2, max: 7 };
    case 'SO':
      return { min: 2, max: 6 };
    case 'JR':
      return { min: 1, max: 4 };
    default:
      return { min: 0, max: 2 };
  }
}

export function developPlayer(player: Player, rng: SeededRng): Player {
  const remainingPotential = Math.max(player.potential - player.overall, 0);
  const growthBand = getClassGrowthBand(player);
  const workEthicBonus = player.workEthic >= 85 ? 2 : player.workEthic >= 65 ? 1 : 0;
  const disciplineBonus = player.discipline >= 75 ? 1 : 0;
  const confidenceBonus = player.confidence >= 80 && rng.chance(0.35) ? 1 : 0;
  const naturalGrowth = rng.int(growthBand.min, growthBand.max);
  const ceilingAllowance =
    remainingPotential >= 18 ? 3 : remainingPotential >= 10 ? 2 : remainingPotential >= 4 ? 1 : 0;
  let growth = naturalGrowth + workEthicBonus + disciplineBonus + confidenceBonus;
  let potential = player.potential;

  if (
    remainingPotential <= 5 &&
    (player.classYear === 'FR' || player.classYear === 'SO') &&
    player.workEthic >= 82 &&
    rng.chance(0.12)
  ) {
    potential = clamp(player.potential + rng.int(1, 2), player.potential, 99);
  }

  const maxGrowth = Math.max(0, remainingPotential + ceilingAllowance);
  growth = Math.min(growth, maxGrowth);

  if (remainingPotential === 0 && growth > 0) {
    growth = rng.chance(0.08) ? 1 : 0;
  }

  return {
    ...player,
    overall: clamp(player.overall + growth, 35, Math.min(99, potential)),
    potential
  };
}
