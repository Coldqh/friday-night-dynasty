import { describe, expect, it } from 'vitest';
import { createWorld } from '../../core/world/createWorld';

function pairKey(firstTeamId: string, secondTeamId: string) {
  return [firstTeamId, secondTeamId].sort().join(':');
}

describe('rivalry week distribution', () => {
  it('spreads regular season rivalry games across multiple weeks', () => {
    const world = createWorld({ seed: 12101 });
    const rivalryKeys = new Set<string>();

    world.teams.forEach((team) => {
      team.rivalryIds.forEach((rivalId) => rivalryKeys.add(pairKey(team.id, rivalId)));
    });

    const rivalryWeeks = new Set<number>();

    world.season.schedule.forEach((week) => {
      week.games.forEach((game) => {
        if (rivalryKeys.has(pairKey(game.homeTeamId, game.awayTeamId))) {
          rivalryWeeks.add(week.week);
        }
      });
    });

    expect(rivalryWeeks.size).toBeGreaterThan(1);
  });
});
