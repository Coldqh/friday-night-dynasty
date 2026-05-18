import { firstNames, lastNames } from '../../content/names';
import { emptyStats } from '../players/generatePlayers';
import { makeId, SeededRng } from '../random/rng';
import { City, CollegePlayer, CollegeTeam, Position } from '../world/worldTypes';
import {
  COLLEGE_POSITION_MAXIMUMS,
  COLLEGE_POSITION_MINIMUMS,
  COLLEGE_POSITION_TARGETS,
  COLLEGE_POSITIONS,
  COLLEGE_ROSTER_TARGET,
  countCollegePositions,
  getCollegeRosterForTeam
} from './collegeRosterPlan';

const classYears: CollegePlayer['classYear'][] = [
  'FR', 'FR', 'FR', 'FR',
  'SO', 'SO', 'SO', 'SO',
  'JR', 'JR', 'JR',
  'SR', 'SR'
];

const repairClassYears: CollegePlayer['classYear'][] = ['FR', 'FR', 'SO'];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function classToEligibility(classYear: CollegePlayer['classYear']) {
  switch (classYear) {
    case 'FR':
      return 4;
    case 'SO':
      return 3;
    case 'JR':
      return 2;
    case 'SR':
      return 1;
    default:
      return 4;
  }
}

function classToAge(classYear: CollegePlayer['classYear'], rng: SeededRng) {
  switch (classYear) {
    case 'FR':
      return rng.int(18, 19);
    case 'SO':
      return rng.int(19, 20);
    case 'JR':
      return rng.int(20, 21);
    case 'SR':
      return rng.int(21, 22);
    default:
      return 19;
  }
}

function getHeight(position: Position, rng: SeededRng) {
  switch (position) {
    case 'QB':
      return rng.int(73, 77);
    case 'RB':
      return rng.int(68, 73);
    case 'WR':
      return rng.int(70, 76);
    case 'TE':
      return rng.int(75, 79);
    case 'OL':
      return rng.int(75, 80);
    case 'DL':
      return rng.int(74, 79);
    case 'LB':
      return rng.int(72, 76);
    case 'CB':
      return rng.int(69, 74);
    case 'S':
      return rng.int(70, 75);
    case 'K':
      return rng.int(69, 75);
    default:
      return rng.int(70, 77);
  }
}

function getWeight(position: Position, rng: SeededRng) {
  switch (position) {
    case 'QB':
      return rng.int(205, 235);
    case 'RB':
      return rng.int(195, 225);
    case 'WR':
      return rng.int(180, 215);
    case 'TE':
      return rng.int(235, 260);
    case 'OL':
      return rng.int(285, 335);
    case 'DL':
      return rng.int(260, 315);
    case 'LB':
      return rng.int(225, 255);
    case 'CB':
      return rng.int(175, 205);
    case 'S':
      return rng.int(190, 220);
    case 'K':
      return rng.int(170, 205);
    default:
      return rng.int(190, 250);
  }
}

function getBaseOverall(team: CollegeTeam, classYear: CollegePlayer['classYear'], rng: SeededRng) {
  const classBonus =
    classYear === 'SR' ? rng.int(7, 12) :
    classYear === 'JR' ? rng.int(4, 9) :
    classYear === 'SO' ? rng.int(2, 6) :
    rng.int(-1, 3);
  const prestigeBase = 30 + Math.round(team.prestige * 0.24);

  return clamp(prestigeBase + rng.int(-5, 7) + classBonus, 30, 70);
}

export function generateCollegePlayer({
  rng,
  team,
  city,
  position,
  classYear,
  index
}: {
  rng: SeededRng;
  team: CollegeTeam;
  city: City;
  position: Position;
  classYear: CollegePlayer['classYear'];
  index: number;
}): CollegePlayer {
  const overall = getBaseOverall(team, classYear, rng);
  const potential = clamp(overall + rng.int(4, 18), overall, 85);
  const firstName = rng.pick(firstNames);
  const lastName = rng.pick(lastNames);

  return {
    id: makeId('college_player', rng),
    sourcePlayerId: `initial_${team.id}_${position}_${index}_${makeId('src', rng)}`,
    personId: null,
    collegeId: team.collegeId,
    collegeTeamId: team.id,
    sourceHighSchoolTeamId: '',
    sourceSchoolId: '',
    hometownCityId: city.id,
    firstName,
    lastName,
    age: classToAge(classYear, rng),
    classYear,
    eligibilityRemaining: classToEligibility(classYear),
    position,
    height: getHeight(position, rng),
    weight: getWeight(position, rng),
    overall,
    potential,
    workEthic: rng.int(45, 95),
    discipline: rng.int(40, 92),
    confidence: rng.int(45, 90),
    leadership: rng.int(30, 92),
    injuryRisk: rng.int(8, 48),
    ambition: rng.int(35, 95),
    stars: clamp(Math.round((overall + potential) / 34), 1, 5),
    seasonStats: emptyStats(),
    careerStats: emptyStats()
  };
}

export function generateInitialCollegeRoster({
  rng,
  team,
  city
}: {
  rng: SeededRng;
  team: CollegeTeam;
  city: City;
}): CollegePlayer[] {
  const players: CollegePlayer[] = [];
  let index = 0;

  COLLEGE_POSITIONS.forEach((position) => {
    const target = COLLEGE_POSITION_TARGETS[position];

    for (let count = 0; count < target; count += 1) {
      players.push(
        generateCollegePlayer({
          rng,
          team,
          city,
          position,
          classYear: rng.pick(classYears),
          index
        })
      );
      index += 1;
    }
  });

  return players;
}

function trimExcessPositions(roster: CollegePlayer[]) {
  const byPosition = new Map<Position, CollegePlayer[]>();

  COLLEGE_POSITIONS.forEach((position) => byPosition.set(position, []));

  roster.forEach((player) => {
    byPosition.get(player.position)?.push(player);
  });

  const kept: CollegePlayer[] = [];

  COLLEGE_POSITIONS.forEach((position) => {
    const sorted = [...(byPosition.get(position) ?? [])].sort(
      (left, right) =>
        right.overall - left.overall ||
        right.potential - left.potential ||
        right.workEthic - left.workEthic
    );

    kept.push(...sorted.slice(0, COLLEGE_POSITION_MAXIMUMS[position]));
  });

  return kept;
}

export function rebalanceCollegeRoster({
  rng,
  team,
  city,
  roster
}: {
  rng: SeededRng;
  team: CollegeTeam;
  city: City;
  roster: CollegePlayer[];
}) {
  const kept = trimExcessPositions(roster);
  const counts = countCollegePositions(kept);
  const next = [...kept];
  let index = next.length;

  COLLEGE_POSITIONS.forEach((position) => {
    const minimum = COLLEGE_POSITION_MINIMUMS[position];

    while (counts[position] < minimum) {
      next.push(
        generateCollegePlayer({
          rng,
          team,
          city,
          position,
          classYear: rng.pick(repairClassYears),
          index
        })
      );
      counts[position] += 1;
      index += 1;
    }
  });

  while (next.length < COLLEGE_ROSTER_TARGET) {
    const position =
      COLLEGE_POSITIONS.find((candidate) => countCollegePositions(next)[candidate] < COLLEGE_POSITION_TARGETS[candidate]) ??
      rng.pick(COLLEGE_POSITIONS);

    next.push(
      generateCollegePlayer({
        rng,
        team,
        city,
        position,
        classYear: rng.pick(classYears),
        index
      })
    );
    index += 1;
  }

  return next
    .sort((left, right) => {
      const positionDiff = COLLEGE_POSITIONS.indexOf(left.position) - COLLEGE_POSITIONS.indexOf(right.position);
      return positionDiff || right.overall - left.overall;
    })
    .slice(0, COLLEGE_ROSTER_TARGET);
}

export function rebalanceAllCollegeRosters({
  rng,
  teams,
  cities,
  players
}: {
  rng: SeededRng;
  teams: CollegeTeam[];
  cities: City[];
  players: CollegePlayer[];
}) {
  const nextPlayers: CollegePlayer[] = [];

  teams.forEach((team) => {
    const city = cities.find((entry) => entry.id === team.cityId) ?? cities[0];
    const roster = getCollegeRosterForTeam(players, team.id);

    if (!city) {
      return;
    }

    nextPlayers.push(...rebalanceCollegeRoster({ rng, team, city, roster }));
  });

  return nextPlayers;
}

export function shouldRepairCollegeRoster(team: CollegeTeam, players: CollegePlayer[]) {
  const roster = getCollegeRosterForTeam(players, team.id);
  const counts = countCollegePositions(roster);

  if (roster.length < 50 || roster.length > 64) {
    return true;
  }

  return COLLEGE_POSITIONS.some(
    (position) =>
      counts[position] < COLLEGE_POSITION_MINIMUMS[position] ||
      counts[position] > COLLEGE_POSITION_MAXIMUMS[position]
  );
}
