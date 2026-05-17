import { makeId, SeededRng } from '../random/rng';
import { City, College, CollegeTeam, DefenseStyle, OffenseStyle, Position } from '../world/worldTypes';

const suffixes = ['State', 'Tech', 'A&M', 'Central', 'Western', 'Southern', 'Northern', 'Valley'];
const offenseStyles: OffenseStyle[] = ['balanced', 'runHeavy', 'passHeavy', 'spread', 'powerRun'];
const defenseStyles: DefenseStyle[] = ['balanced', 'aggressive', 'conservative', 'blitzHeavy'];
const needsPool: Position[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'];

function getCollegeName(cityName: string, index: number) {
  const suffix = suffixes[index % suffixes.length];

  if (suffix === 'A&M') return `${cityName} A&M`;
  if (suffix === 'State') return `${cityName} State`;

  return `${cityName} ${suffix}`;
}

function shuffleWithRng<T>(items: T[], rng: SeededRng) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = rng.int(0, index);
    const current = result[index];
    result[index] = result[swapIndex];
    result[swapIndex] = current;
  }

  return result;
}

function pickNeeds(rng: SeededRng) {
  return shuffleWithRng(needsPool, rng).slice(0, 3);
}

function assignCollegeRivalries(teams: CollegeTeam[]) {
  if (teams.length < 2) {
    return teams;
  }

  const next = teams.map((team) => ({ ...team, rivalryIds: [] as string[] }));

  for (let index = 0; index < next.length; index += 2) {
    const first = next[index];
    const second = next[index + 1] ?? next[0];

    if (!first || !second || first.id === second.id) {
      continue;
    }

    first.rivalryIds = [...new Set([...first.rivalryIds, second.id])];
    second.rivalryIds = [...new Set([...second.rivalryIds, first.id])];
  }

  if (next.length >= 4) {
    for (let index = 0; index < next.length; index += 1) {
      const team = next[index];
      const cross = next[(index + 3) % next.length];

      if (!team || !cross || team.id === cross.id) {
        continue;
      }

      team.rivalryIds = [...new Set([...team.rivalryIds, cross.id])].slice(0, 2);
      cross.rivalryIds = [...new Set([...cross.rivalryIds, team.id])].slice(0, 2);
    }
  }

  return next;
}

export function generateCollegeLayer({
  stateId,
  cities,
  rng
}: {
  stateId: string;
  cities: City[];
  rng: SeededRng;
}): { colleges: College[]; collegeTeams: CollegeTeam[] } {
  const collegeCities = cities.slice(0, Math.min(8, cities.length));
  const colleges: College[] = [];
  const collegeTeams: CollegeTeam[] = [];

  collegeCities.forEach((city, index) => {
    const name = getCollegeName(city.name, index);
    const prestige = rng.int(42, 88);
    const college: College = {
      id: makeId('college', rng),
      stateId,
      cityId: city.id,
      name,
      shortName: name,
      prestige,
      facilities: rng.int(38, 90),
      academicRating: rng.int(35, 88),
      scholarshipBudget: rng.int(55, 100)
    };

    const team: CollegeTeam = {
      id: makeId('college_team', rng),
      collegeId: college.id,
      cityId: city.id,
      name: `${name} Football`,
      shortName: name,
      prestige,
      offenseStyle: rng.pick(offenseStyles),
      defenseStyle: rng.pick(defenseStyles),
      rosterPlayerIds: [],
      recruitingNeeds: pickNeeds(rng),
      rivalryIds: [],
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      history: []
    };

    colleges.push(college);
    collegeTeams.push(team);
  });

  return { colleges, collegeTeams: assignCollegeRivalries(collegeTeams) };
}
