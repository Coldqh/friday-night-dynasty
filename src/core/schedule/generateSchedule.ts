import { makeId, SeededRng } from '../random/rng';
import { ScheduleWeek, Team } from '../world/worldTypes';

function getUniqueRivalryPairs(teams: Team[]) {
  const seen = new Set<string>();
  const pairs: Array<{ homeTeamId: string; awayTeamId: string }> = [];

  teams.forEach((team) => {
    team.rivalryIds.forEach((rivalId, rivalIndex) => {
      const key = [team.id, rivalId].sort().join(':');

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      pairs.push(
        rivalIndex % 2 === 0
          ? { homeTeamId: team.id, awayTeamId: rivalId }
          : { homeTeamId: rivalId, awayTeamId: team.id }
      );
    });
  });

  return pairs;
}

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
  const rivalryPairs = getUniqueRivalryPairs(teams);
  const rotationWeeks = rivalryPairs.length > 0 && weeks > 1 ? weeks - 1 : weeks;

  for (let week = 0; week < rotationWeeks; week += 1) {
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

  if (rivalryPairs.length > 0 && weeks > 1) {
    schedule.push({
      week: weeks - 1,
      games: rivalryPairs.map((pair, index) => ({
        id: makeId('game', rng),
        stage: 'regular' as const,
        week: weeks - 1,
        homeTeamId: index % 2 === 0 ? pair.homeTeamId : pair.awayTeamId,
        awayTeamId: index % 2 === 0 ? pair.awayTeamId : pair.homeTeamId,
        homeScore: null,
        awayScore: null,
        winnerId: null,
        loserId: null,
        summary: '',
        keyPlayers: [],
        mvpPlayerId: null
      }))
    });
  }

  return schedule;
}
