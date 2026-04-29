import { describe, expect, it } from 'vitest';
import { getFullSchedule } from '../../core/schedule/getFullSchedule';
import { getWeeklySlate } from '../../core/schedule/getWeeklySlate';
import { simulateSeason, simulateWeek } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';

describe('state schedule helpers', () => {
  it('getFullSchedule returns statewide regular season games and is not team-filtered', () => {
    const world = createWorld({ seed: 1201 });
    const fullSchedule = getFullSchedule(world);
    const expectedRegularGames = world.season.schedule.reduce((sum, week) => sum + week.games.length, 0);
    const uniqueTeams = new Set(fullSchedule.flatMap((game) => [game.awayTeamId, game.homeTeamId]));

    expect(fullSchedule).toHaveLength(expectedRegularGames);
    expect(fullSchedule.every((game) => game.stage === 'regular')).toBe(true);
    expect(uniqueTeams.size).toBe(world.teams.length);
  });

  it('getFullSchedule includes playoff games after simulateSeason', () => {
    const world = simulateSeason(createWorld({ seed: 1202 }));
    const fullSchedule = getFullSchedule(world);
    const regularGames = world.season.schedule.reduce((sum, week) => sum + week.games.length, 0);

    expect(fullSchedule.length).toBe(regularGames + world.season.playoffGames.length);
    expect(fullSchedule.some((game) => game.stage === 'semifinal')).toBe(true);
    expect(fullSchedule.some((game) => game.stage === 'final')).toBe(true);
  });

  it('getWeeklySlate returns current week games and a game of the week when games exist', () => {
    const world = createWorld({ seed: 1203 });
    const slate = getWeeklySlate(world);

    expect(slate.gamesThisWeek.length).toBeGreaterThan(0);
    expect(slate.gameOfTheWeek).not.toBeNull();
    expect(slate.gameOfTheWeek?.reason.length).toBeGreaterThan(0);
    expect(slate.gamesThisWeek.every((game) => game.week === slate.currentWeek)).toBe(true);
  });

  it('getWeeklySlate prefers playoff and state final contexts over regular-season games', () => {
    const world = simulateSeason(createWorld({ seed: 1204 }));
    const slate = getWeeklySlate(world);

    expect(slate.gameOfTheWeek).not.toBeNull();
    expect(slate.gameOfTheWeek?.stage).toBe('final');
    expect(slate.gameOfTheWeek?.reason).toBe('State Final');
  });

  it('getWeeklySlate reports completed games once a week has been simulated', () => {
    const world = simulateWeek(createWorld({ seed: 1205 }));
    const slate = getWeeklySlate(world);

    expect(slate.completedThisWeek.every((game) => game.status === 'Final')).toBe(true);
  });
});
