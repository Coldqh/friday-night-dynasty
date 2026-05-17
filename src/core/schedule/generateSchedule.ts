import { makeId, SeededRng } from '../random/rng';
import { ScheduleWeek, Team } from '../world/worldTypes';

function pairKey(firstTeamId: string, secondTeamId: string) {
  return [firstTeamId, secondTeamId].sort().join(':');
}

function getUniqueRivalryPairs(teams: Team[]) {
  const seen = new Set<string>();
  const pairs: Array<{ homeTeamId: string; awayTeamId: string; key: string }> = [];

  teams.forEach((team) => {
    team.rivalryIds.forEach((rivalId, rivalIndex) => {
      const key = pairKey(team.id, rivalId);

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      pairs.push(
        rivalIndex % 2 === 0
          ? { homeTeamId: team.id, awayTeamId: rivalId, key }
          : { homeTeamId: rivalId, awayTeamId: team.id, key }
      );
    });
  });

  return pairs;
}

function buildPairingForWeek({
  rng,
  teamIds,
  usedRegularPairs,
  rivalryPairKeys
}: {
  rng: SeededRng;
  teamIds: string[];
  usedRegularPairs: Set<string>;
  rivalryPairKeys: Set<string>;
}): Array<[string, string]> {
  const shuffled = rng.shuffle(teamIds);

  function search(available: string[], pairs: Array<[string, string]>, allowUsedPairs: boolean): Array<[string, string]> | null {
    if (available.length === 0) {
      return pairs;
    }

    const first = available[0];
    const candidates = rng.shuffle(available.slice(1));

    for (const second of candidates) {
      const key = pairKey(first, second);

      if (rivalryPairKeys.has(key)) {
        continue;
      }

      if (!allowUsedPairs && usedRegularPairs.has(key)) {
        continue;
      }

      const nextAvailable = available.filter((id) => id !== first && id !== second);
      const result = search(nextAvailable, [...pairs, [first, second]], allowUsedPairs);

      if (result) {
        return result;
      }
    }

    return null;
  }

  return search(shuffled, [], false) ?? search(shuffled, [], true) ?? [];
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
  const teamIds = teams.map((team) => team.id);
  const schedule: ScheduleWeek[] = [];
  const rivalryPairs = getUniqueRivalryPairs(teams);
  const rivalryPairKeys = new Set(rivalryPairs.map((pair) => pair.key));
  const usedRegularPairs = new Set<string>();
  const regularWeeks = rivalryPairs.length > 0 && weeks > 1 ? weeks - 1 : weeks;

  for (let week = 0; week < regularWeeks; week += 1) {
    const pairings = buildPairingForWeek({ rng, teamIds, usedRegularPairs, rivalryPairKeys });
    const games = pairings.map(([first, second], index) => {
      const homeTeamId = (week + index) % 2 === 0 ? first : second;
      const awayTeamId = (week + index) % 2 === 0 ? second : first;
      usedRegularPairs.add(pairKey(first, second));

      return {
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
      };
    });

    schedule.push({ week, games });
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
