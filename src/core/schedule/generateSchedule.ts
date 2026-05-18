import { makeId, SeededRng } from '../random/rng';
import { ScheduleWeek, ScheduledGame, Team } from '../world/worldTypes';

function pairKey(firstTeamId: string, secondTeamId: string) {
  return [firstTeamId, secondTeamId].sort().join(':');
}

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
}): ScheduledGame {
  return {
    id: makeId('game', rng),
    stage: 'regular',
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
}

function getUniqueRivalryPairs(teams: Team[]) {
  const seen = new Set<string>();
  const pairs: Array<{ homeTeamId: string; awayTeamId: string; key: string }> = [];

  teams.forEach((team) => {
    team.rivalryIds.forEach((rivalId, rivalIndex) => {
      const rivalExists = teams.some((entry) => entry.id === rivalId);

      if (!rivalExists) {
        return;
      }

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
  blockedPairs,
  targetRivalryPair
}: {
  rng: SeededRng;
  teamIds: string[];
  usedRegularPairs: Set<string>;
  blockedPairs: Set<string>;
  targetRivalryPair?: { homeTeamId: string; awayTeamId: string; key: string };
}): Array<[string, string]> {
  const forcedPair: Array<[string, string]> = targetRivalryPair
    ? [[targetRivalryPair.homeTeamId, targetRivalryPair.awayTeamId]]
    : [];
  const blockedTeamIds = new Set(forcedPair.flat());
  const availableTeamIds = teamIds.filter((id) => !blockedTeamIds.has(id));
  const shuffled = rng.shuffle(availableTeamIds);

  function search(available: string[], pairs: Array<[string, string]>, allowUsedPairs: boolean): Array<[string, string]> | null {
    if (available.length === 0) {
      return pairs;
    }

    const first = available[0];
    const candidates = rng.shuffle(available.slice(1));

    for (const second of candidates) {
      const key = pairKey(first, second);

      if (blockedPairs.has(key)) {
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

  const generated = search(shuffled, [], false) ?? search(shuffled, [], true) ?? [];

  return [...forcedPair, ...generated];
}

function assignRivalryWeeks<T extends { key: string }>(rivalryPairs: T[], weeks: number) {
  if (weeks <= 0) {
    return new Map<number, T[]>();
  }

  const result = new Map<number, T[]>();
  const usableWeeks = Math.max(1, weeks);

  rivalryPairs.forEach((pair, index) => {
    const week = index % usableWeeks;
    const current = result.get(week) ?? [];

    current.push(pair);
    result.set(week, current);
  });

  return result;
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
  const rivalryPairs = rng.shuffle(getUniqueRivalryPairs(teams));
  const rivalryWeeks = assignRivalryWeeks(rivalryPairs, weeks);
  const rivalryPairKeys = new Set(rivalryPairs.map((pair) => pair.key));
  const usedRegularPairs = new Set<string>();

  for (let week = 0; week < weeks; week += 1) {
    const rivalryGamesThisWeek = rivalryWeeks.get(week) ?? [];
    const games: ScheduledGame[] = [];
    const usedTeamsThisWeek = new Set<string>();

    rivalryGamesThisWeek.forEach((rivalryPair, index) => {
      if (usedTeamsThisWeek.has(rivalryPair.homeTeamId) || usedTeamsThisWeek.has(rivalryPair.awayTeamId)) {
        return;
      }

      const homeTeamId = (week + index) % 2 === 0 ? rivalryPair.homeTeamId : rivalryPair.awayTeamId;
      const awayTeamId = homeTeamId === rivalryPair.homeTeamId ? rivalryPair.awayTeamId : rivalryPair.homeTeamId;

      games.push(createGame({ rng, week, homeTeamId, awayTeamId }));
      usedTeamsThisWeek.add(homeTeamId);
      usedTeamsThisWeek.add(awayTeamId);
      usedRegularPairs.add(rivalryPair.key);
    });

    const remainingTeamIds = teamIds.filter((teamId) => !usedTeamsThisWeek.has(teamId));
    const pairings = buildPairingForWeek({
      rng,
      teamIds: remainingTeamIds,
      usedRegularPairs,
      blockedPairs: rivalryPairKeys
    });

    pairings.forEach(([first, second], index) => {
      const homeTeamId = (week + index) % 2 === 0 ? first : second;
      const awayTeamId = homeTeamId === first ? second : first;

      usedRegularPairs.add(pairKey(first, second));
      games.push(createGame({ rng, week, homeTeamId, awayTeamId }));
    });

    schedule.push({ week, games });
  }

  return schedule;
}
