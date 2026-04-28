import { makeId, SeededRng } from '../random/rng';
import { ScheduleWeek, Team } from '../world/worldTypes';

export function generateSchedule({
  rng,
  teams,
  weeks
}: {
  rng: SeededRng;
  teams: Team[];
  weeks: number;
}): ScheduleWeek[] {
  const ids = rng.shuffle(teams.map((team) => team.id));
  const fixed = ids[0];
  const rotating = ids.slice(1);
  const schedule: ScheduleWeek[] = [];

  for (let week = 0; week < weeks; week += 1) {
    const round = [fixed, ...rotating];
    const games = [];

    for (let index = 0; index < round.length / 2; index += 1) {
      const first = round[index];
      const second = round[round.length - 1 - index];
      const homeTeamId = week % 2 === 0 ? first : second;
      const awayTeamId = week % 2 === 0 ? second : first;

      games.push({
        id: makeId('game', rng),
        stage: 'regular' as const,
        week,
        homeTeamId,
        awayTeamId,
        homeScore: null,
        awayScore: null,
        winnerId: null,
        loserId: null,
        summary: '',
        keyPlayers: [],
        mvpPlayerId: null
      });
    }

    schedule.push({ week, games });
    rotating.unshift(rotating.pop()!);
  }

  return schedule;
}
