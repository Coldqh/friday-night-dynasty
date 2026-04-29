import { firstNames, lastNames, traits } from '../../content/names';
import { makeId, SeededRng } from '../random/rng';
import { emptyStats, ROSTER_PLAN } from './generatePlayers';
import { City, Player, Position, School, Team } from '../world/worldTypes';

const TARGET_ROSTER_SIZE = 40;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pickHeightRange(position: Position) {
  return {
    min: position === 'OL' || position === 'DL' ? 72 : 66,
    max: position === 'OL' ? 79 : 76
  };
}

function pickWeightRange(position: Position) {
  return {
    min: position === 'OL' || position === 'DL' ? 230 : 150,
    max: position === 'OL' ? 330 : 245
  };
}

function chooseNextPosition(currentRoster: Player[], freshmen: Player[], rng: SeededRng): Position {
  const combined = [...currentRoster, ...freshmen];
  const counts = new Map<Position, number>();

  combined.forEach((player) => {
    counts.set(player.position, (counts.get(player.position) ?? 0) + 1);
  });

  const deficits = ROSTER_PLAN.map(([position, target]) => ({
    position,
    deficit: target - (counts.get(position) ?? 0)
  })).sort((left, right) => right.deficit - left.deficit);

  if (deficits[0]?.deficit > 0) {
    const topDeficit = deficits[0].deficit;
    const candidates = deficits
      .filter((entry) => entry.deficit === topDeficit)
      .map((entry) => entry.position);

    return rng.pick(candidates);
  }

  return rng.pick(ROSTER_PLAN.map(([position]) => position));
}

export function generateFreshmanClass({
  rng,
  team,
  school,
  city,
  currentRoster,
  targetRosterSize = TARGET_ROSTER_SIZE
}: {
  rng: SeededRng;
  team: Team;
  school: School;
  city: City;
  currentRoster: Player[];
  targetRosterSize?: number;
}): Player[] {
  const freshmen: Player[] = [];
  const slotsToFill = Math.max(0, targetRosterSize - currentRoster.length);
  const programStrength = Math.round(
    team.prestige * 0.35 + school.facilities * 0.25 + city.footballCulture * 0.2 + team.overallRating * 0.2
  );

  while (freshmen.length < slotsToFill) {
    const position = chooseNextPosition(currentRoster, freshmen, rng);
    const heightRange = pickHeightRange(position);
    const weightRange = pickWeightRange(position);
    const surpriseProspect = team.prestige < 55 && rng.chance(0.16);
    const base = clamp(
      rng.int(33, 58) + Math.round((programStrength - 55) / 10) + (surpriseProspect ? rng.int(6, 14) : 0),
      35,
      84
    );
    const potential = clamp(
      base + rng.int(10, 24) + Math.round(school.facilities / 18) + (surpriseProspect ? rng.int(2, 6) : 0),
      base + 4,
      96
    );

    freshmen.push({
      id: makeId('player', rng),
      teamId: team.id,
      schoolId: school.id,
      cityId: city.id,
      firstName: rng.pick(firstNames),
      lastName: rng.pick(lastNames),
      age: rng.int(14, 15),
      classYear: 'FR',
      position,
      height: rng.int(heightRange.min, heightRange.max),
      weight: rng.int(weightRange.min, weightRange.max),
      overall: base,
      potential,
      workEthic: rng.int(25, 95),
      discipline: rng.int(25, 95),
      confidence: rng.int(25, 95),
      leadership: rng.int(20, 95),
      injuryRisk: rng.int(5, 60),
      ambition: rng.int(20, 98),
      traits: rng.shuffle(traits).slice(0, rng.int(1, 2)),
      seasonStats: emptyStats(),
      careerStats: emptyStats()
    });
  }

  return freshmen;
}
