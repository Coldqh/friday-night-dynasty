import { makeId, SeededRng } from '../random/rng';
import { CollegeScheduleWeek, CollegeScheduledGame, CollegeTeam } from '../world/worldTypes';

function createGame({
  rng,
  week,
  homeTeamId,
  awayTeamId
}: {
  rng: SeededRng;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
}): CollegeScheduledGame {
  return {
    id: makeId('college_game', rng),
    stage: 'regular',
    week,
    homeTeamId,
    awayTeamId,
    homeScore: null,
    awayScore: null,
    winnerId: null,
    loserId: null,
    summary: '',
    mvpPlayerId: null
  };
}

export function generateCollegeSchedule({
  rng,
  teams,
  weeks = 7
}: {
  rng: SeededRng;
  teams: CollegeTeam[];
  weeks?: number;
}): CollegeScheduleWeek[] {
  const activeTeams = [...teams].sort((left, right) => left.shortName.localeCompare(right.shortName));

  if (activeTeams.length < 2) {
    return [];
  }

  const rotation = [...activeTeams];
  const maxWeeks = Math.min(weeks, activeTeams.length - 1);
  const schedule: CollegeScheduleWeek[] = [];

  for (let week = 0; week < maxWeeks; week += 1) {
    const games: CollegeScheduledGame[] = [];

    for (let index = 0; index < rotation.length / 2; index += 1) {
      const left = rotation[index];
      const right = rotation[rotation.length - 1 - index];

      if (!left || !right) {
        continue;
      }

      const home = (week + index) % 2 === 0 ? left : right;
      const away = home.id === left.id ? right : left;

      games.push(createGame({ rng, week, homeTeamId: home.id, awayTeamId: away.id }));
    }

    schedule.push({ week, games });

    const fixed = rotation[0];
    const rest = rotation.slice(1);
    const moved = rest.pop();

    if (fixed && moved) {
      rotation.splice(0, rotation.length, fixed, moved, ...rest);
    }
  }

  return schedule;
}
