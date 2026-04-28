import { describe, expect, it } from 'vitest';
import { createWorld } from '../../core/world/createWorld';
import { simSeason, simWeek } from '../../core/season/simulateSeason';

describe('season simulation', () => {
  it('simulates one regular week', () => {
    const world = createWorld({ seed: 321 });
    const updated = simWeek(world);
    expect(updated.currentWeek).toBe(1);
    expect(updated.teams.some((team) => team.wins > 0)).toBe(true);
  });

  it('crowns a champion after a season', () => {
    const world = createWorld({ seed: 321 });
    const updated = simSeason(world);
    expect(updated.phase).toBe('offseason');
    expect(updated.season.championTeamId).not.toBeNull();
    expect(updated.history.seasons).toHaveLength(1);
  });
});
