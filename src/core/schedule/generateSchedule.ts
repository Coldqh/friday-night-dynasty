import { makeId, SeededRng } from '../random/rng';
import { ScheduleWeek, Team } from '../world/worldTypes';

export function generateSchedule({ rng, teams, weeks }: { rng: SeededRng; teams: Team[]; weeks: number }): ScheduleWeek[] {
  const ids = rng.shuffle(teams.map((team) => team.id));
  const fixed = ids[0];
  const rotating = ids.slice(1);
  const schedule: ScheduleWeek[] = [];

  for (let week = 0; week < weeks; week += 1) {
    const round = [fixed, ...rotating];
    const games = [];
    for (let i = 0; i < round.length / 2; i += 1) {
      const a = round[i];
      const b = round[round.length - 1 - i];
      const homeTeamId = week % 2 === 0 ? a : b;
      const awayTeamId = week % 2 === 0 ? b : a;
      games.push({ id: makeId('game', rng), week, homeTeamId, awayTeamId, result: null });
    }
    schedule.push({ week, games });
    rotating.unshift(rotating.pop()!);
  }

  return schedule;
}
