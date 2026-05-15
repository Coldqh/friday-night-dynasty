import { describe, expect, it } from 'vitest';
import { getCompletedSchedule, getFullSchedule, getUpcomingSchedule } from '../../core/schedule/getFullSchedule';
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

  it('getUpcomingSchedule powers the All Games view without filtering to a selected team', () => {
    const world = simulateWeek(createWorld({ seed: 1206 }));
    const upcomingSchedule = getUpcomingSchedule(world);
    const uniqueTeams = new Set(upcomingSchedule.flatMap((game) => [game.awayTeamId, game.homeTeamId]));

    expect(upcomingSchedule.length).toBeGreaterThan(0);
    expect(upcomingSchedule.every((game) => game.status === 'Upcoming')).toBe(true);
    expect(upcomingSchedule[0]?.week).toBe(world.season.currentWeek);
    expect(uniqueTeams.size).toBeGreaterThan(2);
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
    expect(slate.gameOfTheWeek?.reason).toMatch(/state championship|State Final/i);
  });

  it('getWeeklySlate reports completed games once a week has been simulated', () => {
    const world = simulateWeek(createWorld({ seed: 1205 }));
    const slate = getWeeklySlate(world);

    expect(slate.completedThisWeek.every((game) => game.status === 'Final')).toBe(true);
  });

  it('getCompletedSchedule returns played games from regular season and playoffs', () => {
    const singleWeekWorld = simulateWeek(createWorld({ seed: 1207 }));
    const seasonWorld = simulateSeason(createWorld({ seed: 1208 }));

    expect(getCompletedSchedule(singleWeekWorld).length).toBeGreaterThan(0);
    expect(getCompletedSchedule(singleWeekWorld).every((game) => game.status === 'Final')).toBe(true);
    expect(getCompletedSchedule(seasonWorld).some((game) => game.stage === 'final')).toBe(true);
  });
});
