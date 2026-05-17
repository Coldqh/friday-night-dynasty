import { CollegePlayer, CollegeTeam, Position } from '../world/worldTypes';

export const COLLEGE_ROSTER_TARGET = 58;

export const COLLEGE_POSITION_TARGETS: Record<Position, number> = {
  QB: 4,
  RB: 5,
  WR: 8,
  TE: 4,
  OL: 10,
  DL: 8,
  LB: 7,
  CB: 6,
  S: 4,
  K: 2
};

export const COLLEGE_POSITION_MINIMUMS: Record<Position, number> = {
  QB: 3,
  RB: 4,
  WR: 6,
  TE: 3,
  OL: 8,
  DL: 6,
  LB: 5,
  CB: 5,
  S: 3,
  K: 1
};

export const COLLEGE_POSITION_MAXIMUMS: Record<Position, number> = {
  QB: 5,
  RB: 7,
  WR: 10,
  TE: 5,
  OL: 12,
  DL: 10,
  LB: 9,
  CB: 8,
  S: 6,
  K: 3
};

export const COLLEGE_POSITIONS = Object.keys(COLLEGE_POSITION_TARGETS) as Position[];

export function getCollegeRosterForTeam(players: CollegePlayer[], teamId: string) {
  return players.filter((player) => player.collegeTeamId === teamId);
}

export function countCollegePositions(players: CollegePlayer[]) {
  const counts = Object.fromEntries(COLLEGE_POSITIONS.map((position) => [position, 0])) as Record<Position, number>;

  players.forEach((player) => {
    counts[player.position] += 1;
  });

  return counts;
}

export function getCollegePositionNeedsForRoster(players: CollegePlayer[]) {
  const counts = countCollegePositions(players);

  return COLLEGE_POSITIONS.filter((position) => counts[position] < COLLEGE_POSITION_MINIMUMS[position]);
}

export function getCollegePositionNeedsByTeam(teams: CollegeTeam[], players: CollegePlayer[]) {
  const needs = new Map<string, Position[]>();

  teams.forEach((team) => {
    needs.set(team.id, getCollegePositionNeedsForRoster(getCollegeRosterForTeam(players, team.id)));
  });

  return needs;
}

export function applyCollegeRosterIds(teams: CollegeTeam[], players: CollegePlayer[]) {
  return teams.map((team) => ({
    ...team,
    rosterPlayerIds: getCollegeRosterForTeam(players, team.id).map((player) => player.id)
  }));
}

export function updateCollegeTeamNeeds(teams: CollegeTeam[], players: CollegePlayer[]) {
  const needsByTeam = getCollegePositionNeedsByTeam(teams, players);

  return teams.map((team) => ({
    ...team,
    recruitingNeeds: needsByTeam.get(team.id) ?? [],
    rosterPlayerIds: getCollegeRosterForTeam(players, team.id).map((player) => player.id)
  }));
}
