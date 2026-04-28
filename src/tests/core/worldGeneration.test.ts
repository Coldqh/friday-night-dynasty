import { describe, expect, it } from 'vitest';
import { createWorld } from '../../core/world/createWorld';

describe('world generation', () => {
  it('creates a living state foundation', () => {
    const world = createWorld({ seed: 123 });
    expect(world.cities).toHaveLength(8);
    expect(world.schools).toHaveLength(16);
    expect(world.teams).toHaveLength(16);
    expect(world.players).toHaveLength(640);
    expect(world.season.schedule).toHaveLength(10);
  });
});
