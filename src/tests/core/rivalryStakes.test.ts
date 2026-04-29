import { describe, expect, it } from 'vitest';
import { generateWeeklyHeadlines } from '../../core/news/generateWeeklyHeadlines';
import { getRivalryGames } from '../../core/rivalries/getRivalryGames';
import { isRivalryGame } from '../../core/rivalries/isRivalryGame';
import { getWeeklySlate } from '../../core/schedule/getWeeklySlate';
import { simulateWeek } from '../../core/season/simulateSeason';
import { getWeekStakes } from '../../core/stakes/getWeekStakes';
import { createWorld } from '../../core/world/createWorld';

function simulateWeeks(seed: number, weeks: number) {
  let world = createWorld({ seed });

  for (let index = 0; index < weeks; index += 1) {
    world = simulateWeek(world);
  }

  return world;
}

describe('rivalries and late-season stakes', () => {
  it('createWorld creates bidirectional rivalries and every rival exists', () => {
    const world = createWorld({ seed: 1401 });

    world.teams.forEach((team) => {
      team.rivalryIds.forEach((rivalId) => {
        const rival = world.teams.find((entry) => entry.id === rivalId);

        expect(rival).toBeTruthy();
        expect(rival?.rivalryIds.includes(team.id)).toBe(true);
      });
    });
  });

  it('isRivalryGame returns true for a scheduled rivalry matchup', () => {
    const world = createWorld({ seed: 1402 });
    const rivalryGames = getRivalryGames(world);

    expect(rivalryGames.length).toBeGreaterThan(0);
    expect(isRivalryGame(world, rivalryGames[0]!)).toBe(true);
  });

  it('getRivalryGames returns rivalry matchups from the season schedule', () => {
    const world = createWorld({ seed: 1403 });
    const rivalryGames = getRivalryGames(world);

    expect(rivalryGames.length).toBeGreaterThan(0);
    expect(rivalryGames.every((game) => game.rivalryName.length > 0)).toBe(true);
  });

  it('getWeekStakes returns structure with rivalry, playoff race, must-win, and undefeated candidates', () => {
    const world = simulateWeeks(1404, 7);
    const weekStakes = getWeekStakes(world);

    expect(Array.isArray(weekStakes.gamesThisWeek)).toBe(true);
    expect(Array.isArray(weekStakes.rivalryGames)).toBe(true);
    expect(Array.isArray(weekStakes.playoffRaceGames)).toBe(true);
    expect(Array.isArray(weekStakes.undefeatedWatchGames)).toBe(true);
    expect(weekStakes.summary.length).toBeGreaterThan(0);
  });

  it('late season produces playoff race or must-win candidates when standings are established', () => {
    const world = simulateWeeks(1405, 7);
    const weekStakes = getWeekStakes(world);

    expect(weekStakes.playoffRaceGames.length + weekStakes.mustWinGames.length).toBeGreaterThan(0);
  });

  it('getWeeklySlate marks rivalry games and exposes stakes labels', () => {
    const world = simulateWeeks(1406, 9);
    const slate = getWeeklySlate(world);

    expect(slate.gamesThisWeek.some((game) => game.isRivalry)).toBe(true);
    expect(slate.gameOfTheWeek?.stakes.length).toBeGreaterThan(0);
    expect(slate.gameOfTheWeek?.shortLabel).toBeTruthy();
  });

  it('generateWeeklyHeadlines can emit rivalry or late-season stakes headlines', () => {
    const world = simulateWeeks(1407, 9);
    const headlines = generateWeeklyHeadlines(world);

    expect(headlines.some((headline) => ['rivalry', 'playoffRace', 'mustWin', 'lateSeason'].includes(headline.type))).toBe(true);
  });
});
