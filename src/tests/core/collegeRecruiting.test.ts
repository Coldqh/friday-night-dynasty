import { describe, expect, it } from 'vitest';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { simulateSeason } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

describe('college and recruiting foundation', () => {
  it('generates a college layer with college teams', () => {
    const world = createWorld({ seed: 6010 });

    expect(world.colleges?.length).toBeGreaterThan(0);
    expect(world.collegeTeams?.length).toBe(world.colleges?.length);
    expect(world.collegeTeams?.every((team) => team.recruitingNeeds.length > 0)).toBe(true);
  });

  it('normalizes older worlds with a college layer', () => {
    const world = createWorld({ seed: 6011 });
    const legacyWorld = {
      ...world,
      colleges: undefined,
      collegeTeams: undefined,
      recruitingProfiles: undefined,
      commitments: undefined
    };

    const normalized = normalizeWorldState(legacyWorld);

    expect(normalized.colleges?.length).toBeGreaterThan(0);
    expect(normalized.collegeTeams?.length).toBe(normalized.colleges?.length);
    expect(normalized.recruitingProfiles).toEqual([]);
    expect(normalized.commitments).toEqual([]);
  });

  it('creates recruiting profiles and commitments during offseason rollover', () => {
    const finishedWorld = simulateSeason(createWorld({ seed: 6012 }));
    const nextWorld = advanceOffseason(finishedWorld);

    expect(nextWorld.graduatedPlayers?.length).toBeGreaterThan(0);
    expect(nextWorld.recruitingProfiles?.length).toBeGreaterThan(0);
    expect(nextWorld.recruitingProfiles?.every((profile) => profile.playerId && profile.prospectScore > 0)).toBe(true);
    expect(nextWorld.commitments?.length).toBeGreaterThan(0);
    expect(nextWorld.commitments?.every((commitment) => commitment.collegeId && commitment.collegeTeamId)).toBe(true);
  });
});
