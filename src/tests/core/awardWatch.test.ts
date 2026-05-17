import { describe, expect, it } from 'vitest';
import { getSeasonAwardWatch } from '../../core/awards/getSeasonAwardWatch';
import { simulateWeek } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';

describe('season award watch', () => {
  it('returns localized award candidates with player and team context', () => {
    const world = simulateWeek(createWorld({ seed: 4501 }));
    const awards = getSeasonAwardWatch(world);

    expect(awards.length).toBeGreaterThan(0);
    expect(awards[0]?.playerId).toBeTruthy();
    expect(awards[0]?.teamId).toBeTruthy();
    expect(awards[0]?.title.length).toBeGreaterThan(0);
    expect(awards[0]?.title).not.toContain('Watch');
  });
});
