import { describe, expect, it } from 'vitest';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { canAdvanceWorldYear, simulateUnifiedSeason } from '../../core/world/simulateUnifiedWorld';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

describe('full school to college loop', () => {
  it('creates college teams and a college season at world creation', () => {
    const world = createWorld({ seed: 7101 });

    expect(world.colleges?.length).toBeGreaterThan(0);
    expect(world.collegeTeams?.length).toBe(world.colleges?.length);
    expect(world.collegeSeason?.schedule.length).toBeGreaterThan(0);
    expect(world.collegeSeason?.year).toBe(world.season.year);
  });

  it('moves committed graduates into college rosters on unified offseason rollover', () => {
    const finishedWorld = simulateUnifiedSeason(createWorld({ seed: 7102 }));

    expect(canAdvanceWorldYear(finishedWorld)).toBe(true);

    const nextWorld = advanceOffseason(finishedWorld);

    expect(nextWorld.season.year).toBe(finishedWorld.season.year + 1);
    expect(nextWorld.collegeSeason?.year).toBe(nextWorld.season.year);
    expect(nextWorld.commitments?.length).toBeGreaterThan(0);
    expect(nextWorld.collegePlayers?.length).toBeGreaterThan(0);
    expect(nextWorld.commitments?.some((commitment) => commitment.convertedToCollegePlayerId)).toBe(true);
    expect(nextWorld.collegeTeams?.some((team) => team.rosterPlayerIds.length > 0)).toBe(true);
  });

  it('unified season records a school champion and college champion in the same year', () => {
    const world = createWorld({ seed: 7103 });
    const finishedWorld = simulateUnifiedSeason(world);

    expect(finishedWorld.season.year).toBe(world.season.year);
    expect(finishedWorld.collegeSeason?.year).toBe(finishedWorld.season.year);
    expect(finishedWorld.season.championId).toBeTruthy();
    expect(finishedWorld.collegeSeason?.championTeamId).toBeTruthy();
    expect(finishedWorld.history.collegeChampions?.length).toBeGreaterThan(0);
    expect(finishedWorld.collegeSeason?.completedGames.length).toBeGreaterThan(0);
  });

  it('normalizes older worlds with college structures', () => {
    const world = createWorld({ seed: 7104 });
    const legacyWorld = {
      ...world,
      colleges: undefined,
      collegeTeams: undefined,
      collegePlayers: undefined,
      collegeSeason: undefined,
      commitments: undefined,
      recruitingProfiles: undefined
    };

    const normalized = normalizeWorldState(legacyWorld);

    expect(normalized.colleges?.length).toBeGreaterThan(0);
    expect(normalized.collegeTeams?.length).toBeGreaterThan(0);
    expect(normalized.collegePlayers?.length).toBeGreaterThan(0);
    expect(normalized.collegeSeason?.schedule.length).toBeGreaterThan(0);
    expect(normalized.collegeSeason?.year).toBe(normalized.season.year);
  });
});
