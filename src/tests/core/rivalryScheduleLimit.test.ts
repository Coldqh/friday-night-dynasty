import { describe, expect, it } from 'vitest';
import { createWorld } from '../../core/world/createWorld';

function pairKey(firstTeamId: string, secondTeamId: string) {
  return [firstTeamId, secondTeamId].sort().join(':');
}

describe('rivalry scheduling limits', () => {
  it('schedules each rivalry pair only once during the regular season', () => {
    const world = createWorld({ seed: 4401 });
    const rivalryKeys = new Set<string>();
    const rivalryCounts = new Map<string, number>();

    world.teams.forEach((team) => {
      team.rivalryIds.forEach((rivalId) => rivalryKeys.add(pairKey(team.id, rivalId)));
    });

    world.season.schedule.forEach((week) => {
      week.games.forEach((game) => {
        const key = pairKey(game.homeTeamId, game.awayTeamId);

        if (rivalryKeys.has(key)) {
          rivalryCounts.set(key, (rivalryCounts.get(key) ?? 0) + 1);
        }
      });
    });

    expect(rivalryCounts.size).toBe(rivalryKeys.size);
    rivalryCounts.forEach((count) => expect(count).toBe(1));
  });
});
