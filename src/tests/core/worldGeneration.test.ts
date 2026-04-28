import { describe, expect, it } from 'vitest';
import { createWorld } from '../../core/world/createWorld';
import { validateWorldIntegrity } from '../../core/world/validateWorldIntegrity';

describe('world generation', () => {
  it('creates 16 teams for the living state', () => {
    const world = createWorld({ seed: 123 });

    expect(world.cities).toHaveLength(8);
    expect(world.schools).toHaveLength(16);
    expect(world.teams).toHaveLength(16);
    expect(world.season.schedule).toHaveLength(10);
  });

  it('gives every team a full roster and precomputed standings', () => {
    const world = createWorld({ seed: 456 });
    const validation = validateWorldIntegrity(world);

    world.teams.forEach((team) => {
      expect(team.playerIds.length).toBeGreaterThanOrEqual(35);
      expect(team.playerIds.length).toBeLessThanOrEqual(45);
      expect(world.players.some((player) => player.teamId === team.id)).toBe(true);
    });

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(world.season.standings.length).toBeGreaterThan(0);
  });
});
