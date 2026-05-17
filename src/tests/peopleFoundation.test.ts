import { describe, expect, it } from 'vitest';
import { advanceOffseason } from '../core/offseason/advanceOffseason';
import { createWorld } from '../core/world/createWorld';
import { normalizeWorldState } from '../core/world/normalizeWorldState';
import { simulateSeason } from '../core/season/simulateSeason';

describe('people foundation', () => {
  it('creates person records for generated high school players', () => {
    const world = normalizeWorldState(createWorld({ seed: 982451653 }));

    expect(world.players.length).toBeGreaterThan(0);
    expect(world.people?.length).toBeGreaterThanOrEqual(world.players.length);
    expect(world.players.every((player) => Boolean(player.personId))).toBe(true);
    expect(world.players.every((player) => player.careerStage === 'highSchool')).toBe(true);
  });

  it('moves graduating seniors into the alumni pool during offseason rollover', () => {
    const world = normalizeWorldState(createWorld({ seed: 982451653 }));
    const seniorCount = world.players.filter((player) => player.classYear === 'SR').length;
    const completedSeason = normalizeWorldState(simulateSeason(world));
    const nextYear = normalizeWorldState(advanceOffseason(completedSeason));

    expect(completedSeason.phase).toBe('offseason');
    expect(seniorCount).toBeGreaterThan(0);
    expect(nextYear.graduatedPlayers?.length).toBeGreaterThanOrEqual(seniorCount);
    expect(nextYear.graduatedPlayers?.every((player) => player.careerStage === 'graduated')).toBe(true);
    expect(nextYear.people?.some((person) => person.careerEvents.some((event) => event.type === 'graduation'))).toBe(true);
  });
});
