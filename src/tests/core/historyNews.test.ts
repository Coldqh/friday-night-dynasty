import { describe, expect, it } from 'vitest';
import { getLeagueHistorySnapshot } from '../../core/history/getLeagueHistorySnapshot';
import { generateWeeklyHeadlines } from '../../core/news/generateWeeklyHeadlines';
import { simulateSeason, simulateWeek } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';

describe('league history and state news', () => {
  it('league history helper returns state champions and finals without needing a selected team', () => {
    const world = createWorld({ seed: 1301 });
    const history = getLeagueHistorySnapshot(world);

    expect(history.totalSeasonsCompleted).toBe(0);
    expect(history.latestChampion).toBeNull();
    expect(history.latestTitleGame).toBeNull();
  });

  it('after simulateSeason, league history contains the champion and title game', () => {
    const world = simulateSeason(createWorld({ seed: 1302 }));
    const history = getLeagueHistorySnapshot(world);

    expect(history.totalSeasonsCompleted).toBe(1);
    expect(history.latestChampion).not.toBeNull();
    expect(history.latestTitleGame).not.toBeNull();
    expect(history.champions[0]?.championId).toBe(world.season.championId);
    expect(history.titleGames[0]?.championId).toBe(world.season.championId);
  });

  it('generateWeeklyHeadlines returns at least one headline when games exist', () => {
    const world = createWorld({ seed: 1303 });
    const headlines = generateWeeklyHeadlines(world);

    expect(headlines.length).toBeGreaterThan(0);
    expect(headlines[0]?.title.length).toBeGreaterThan(0);
    expect(headlines[0]?.body.length).toBeGreaterThan(0);
  });

  it('generateWeeklyHeadlines can produce recap-style news after simulateWeek', () => {
    const world = simulateWeek(createWorld({ seed: 1304 }));
    const headlines = generateWeeklyHeadlines(world);

    expect(headlines.some((headline) => ['recap', 'upset', 'blowout', 'general'].includes(headline.type))).toBe(true);
  });

  it('generateWeeklyHeadlines can produce a champion headline after simulateSeason', () => {
    const world = simulateSeason(createWorld({ seed: 1305 }));
    const headlines = generateWeeklyHeadlines(world);

    expect(headlines.some((headline) => headline.type === 'champion')).toBe(true);
  });
});
