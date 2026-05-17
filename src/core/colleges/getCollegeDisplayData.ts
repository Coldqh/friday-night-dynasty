import { GameWorld } from '../world/worldTypes';

export interface CollegeScheduleEntry {
  gameId: string;
  week: number;
  stage: 'regular';
  stageLabel: 'Regular Season';
  awayTeamId: string;
  awayTeamName: string;
  homeTeamId: string;
  homeTeamName: string;
  status: 'Upcoming' | 'Final';
  score: string;
  winnerName: string | null;
}

export interface CollegeStandingEntry {
  rank: number;
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  prestige: number;
  recruitingNeeds: string;
}

function getCollegeTeams(world: GameWorld) {
  return [...(world.collegeTeams ?? [])].sort((left, right) => right.prestige - left.prestige || left.shortName.localeCompare(right.shortName));
}

export function getCollegeStandings(world: GameWorld): CollegeStandingEntry[] {
  return getCollegeTeams(world)
    .map((team) => ({
      teamId: team.id,
      teamName: team.shortName,
      wins: team.wins,
      losses: team.losses,
      prestige: team.prestige,
      recruitingNeeds: team.recruitingNeeds.join(', ')
    }))
    .sort((left, right) => right.wins - left.wins || left.losses - right.losses || right.prestige - left.prestige)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));
}

export function getCollegeSchedule(world: GameWorld): CollegeScheduleEntry[] {
  const teams = getCollegeTeams(world);

  if (teams.length < 2) {
    return [];
  }

  const rotation = [...teams];
  const weeks = Math.min(7, teams.length - 1);
  const games: CollegeScheduleEntry[] = [];

  for (let week = 0; week < weeks; week += 1) {
    for (let index = 0; index < rotation.length / 2; index += 1) {
      const left = rotation[index];
      const right = rotation[rotation.length - 1 - index];

      if (!left || !right) {
        continue;
      }

      const home = (week + index) % 2 === 0 ? left : right;
      const away = home.id === left.id ? right : left;

      games.push({
        gameId: `college-${week}-${away.id}-${home.id}`,
        week,
        stage: 'regular',
        stageLabel: 'Regular Season',
        awayTeamId: away.id,
        awayTeamName: away.shortName,
        homeTeamId: home.id,
        homeTeamName: home.shortName,
        status: 'Upcoming',
        score: '',
        winnerName: null
      });
    }

    const fixed = rotation[0];
    const rest = rotation.slice(1);
    const moved = rest.pop();

    if (fixed && moved) {
      rotation.splice(0, rotation.length, fixed, moved, ...rest);
    }
  }

  return games;
}

export function getCollegeUpcomingSchedule(world: GameWorld) {
  return getCollegeSchedule(world).filter((game) => game.status === 'Upcoming');
}

export function getCollegeCompletedSchedule(world: GameWorld) {
  return getCollegeSchedule(world).filter((game) => game.status === 'Final');
}
