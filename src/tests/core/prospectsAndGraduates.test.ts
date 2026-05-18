import { describe, expect, it } from 'vitest';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { getSeniorProspects } from '../../core/prospects/getSeniorProspects';
import { simulateUnifiedSeason } from '../../core/world/simulateUnifiedWorld';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

describe('prospects and college graduates', () => {
  it('lists all current SR players as senior prospects with stars', () => {
    const world = createWorld({ seed: 11201 });
    const srCount = world.players.filter((player) => player.classYear === 'SR').length;
    const prospects = getSeniorProspects(world);

    expect(prospects.length).toBe(srCount);
    expect(prospects.length).toBeGreaterThan(0);
    expect(prospects.every((entry) => entry.stars >= 1 && entry.stars <= 5)).toBe(true);
    expect(prospects.every((entry) => entry.score > 0)).toBe(true);
  });

  it('stores college graduates separately after college eligibility ends', () => {
    let world = createWorld({ seed: 11202 });

    for (let year = 0; year < 5; year += 1) {
      world = advanceOffseason(simulateUnifiedSeason(world));
    }

    expect(world.graduatedCollegePlayers?.length).toBeGreaterThan(0);
    expect(world.graduatedCollegePlayers?.every((player) => player.graduationYear > 0)).toBe(true);
    expect(world.graduatedCollegePlayers?.every((player) => player.finalCollegeName.length > 0)).toBe(true);
  });

  it('normalizes saves with college graduates', () => {
    let world = createWorld({ seed: 11203 });

    for (let year = 0; year < 5; year += 1) {
      world = advanceOffseason(simulateUnifiedSeason(world));
    }

    const normalized = normalizeWorldState(world);

    expect(normalized.graduatedCollegePlayers?.length).toBe(world.graduatedCollegePlayers?.length);
    expect(normalized.graduatedCollegePlayers?.every((player) => player.eligibilityRemaining === 0)).toBe(true);
  });
});
