import { describe, expect, it } from 'vitest';
import { simulateSeason, simulateWeek } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';

describe('season simulation', () => {
  it('simulateWeek advances currentWeek and records games', () => {
    const world = createWorld({ seed: 321 });
    const updated = simulateWeek(world);

    expect(updated.currentWeek).toBe(1);
    expect(updated.season.completedGames.length).toBeGreaterThan(0);
  });

  it('simulateSeason produces a champion', () => {
    const world = createWorld({ seed: 321 });
    const updated = simulateSeason(world);

    expect(updated.phase).toBe('offseason');
    expect(updated.season.championId).not.toBeNull();
    expect(updated.history.seasons).toHaveLength(1);
  });

  it('standings remain populated through the season', () => {
    const world = createWorld({ seed: 321 });
    const updated = simulateSeason(world);

    expect(updated.season.standings.length).toBeGreaterThan(0);
    expect(updated.season.playoffGames).toHaveLength(3);
  });
});
