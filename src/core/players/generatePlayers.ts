import { firstNames, lastNames, traits } from '../../content/names';
import { makeId, SeededRng } from '../random/rng';
import { City, ClassYear, Player, PlayerStats, Position, School, Team } from '../world/worldTypes';

const rosterPlan: Array<[Position, number]> = [
  ['QB', 2],
  ['RB', 4],
  ['WR', 6],
  ['TE', 2],
  ['OL', 8],
  ['DL', 6],
  ['LB', 4],
  ['CB', 4],
  ['S', 3],
  ['K', 1]
];

const classYears: ClassYear[] = ['FR', 'SO', 'JR', 'SR'];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function emptyStats(): PlayerStats {
  return {
    passingYards: 0,
    rushingYards: 0,
    receivingYards: 0,
    tackles: 0,
    sacks: 0,
    touchdowns: 0,
    interceptions: 0
  };
}

export function generatePlayersForTeam({
  rng,
  team,
  school,
  city
}: {
  rng: SeededRng;
  team: Team;
  school: School;
  city: City;
}): Player[] {
  const players: Player[] = [];
  const programBoost = Math.round((school.prestige + city.footballCulture - 110) / 8);

  rosterPlan.forEach(([position, count]) => {
    for (let index = 0; index < count; index += 1) {
      const classYear = rng.pick(classYears);
      const base = clamp(rng.int(38, 76) + programBoost, 35, 88);
      const potential = clamp(base + rng.int(6, 24), base + 2, 99);
      const selectedTraits = rng.shuffle(traits).slice(0, rng.int(1, 2));

      players.push({
        id: makeId('player', rng),
        teamId: team.id,
        schoolId: school.id,
        cityId: city.id,
        firstName: rng.pick(firstNames),
        lastName: rng.pick(lastNames),
        age:
          classYear === 'FR'
            ? rng.int(14, 15)
            : classYear === 'SO'
              ? rng.int(15, 16)
              : classYear === 'JR'
                ? rng.int(16, 17)
                : rng.int(17, 18),
        classYear,
        position,
        height: rng.int(position === 'OL' || position === 'DL' ? 72 : 66, position === 'OL' ? 79 : 76),
        weight: rng.int(position === 'OL' || position === 'DL' ? 230 : 150, position === 'OL' ? 330 : 245),
        overall: base,
        potential,
        workEthic: rng.int(25, 95),
        discipline: rng.int(25, 95),
        confidence: rng.int(25, 95),
        leadership: rng.int(20, 95),
        injuryRisk: rng.int(5, 60),
        ambition: rng.int(20, 98),
        traits: selectedTraits,
        seasonStats: emptyStats(),
        careerStats: emptyStats()
      });
    }
  });

  return players;
}
