import { describe, expect, it } from 'vitest';
import { simulateCollegeSeason } from '../../core/colleges/collegeSeason';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { simulateSeason } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

describe('full school to college loop', () => {
  it('creates college teams and a college season at world creation', () => {
    const world = createWorld({ seed: 7101 });

    expect(world.colleges?.length).toBeGreaterThan(0);
    expect(world.collegeTeams?.length).toBe(world.colleges?.length);
    expect(world.collegeSeason?.schedule.length).toBeGreaterThan(0);
  });

  it('moves committed graduates into college rosters on offseason rollover', () => {
    const finishedWorld = simulateSeason(createWorld({ seed: 7102 }));
    const nextWorld = advanceOffseason(finishedWorld);

    expect(nextWorld.commitments?.length).toBeGreaterThan(0);
    expect(nextWorld.collegePlayers?.length).toBeGreaterThan(0);
    expect(nextWorld.commitments?.some((commitment) => commitment.convertedToCollegePlayerId)).toBe(true);
    expect(nextWorld.collegeTeams?.some((team) => team.rosterPlayerIds.length > 0)).toBe(true);
  });

  it('simulates a college season and records a college champion', () => {
    const finishedWorld = simulateSeason(createWorld({ seed: 7103 }));
    const nextWorld = advanceOffseason(finishedWorld);
    const collegeFinishedWorld = simulateCollegeSeason(nextWorld);

    expect(collegeFinishedWorld.collegeSeason?.championTeamId).toBeTruthy();
    expect(collegeFinishedWorld.history.collegeChampions?.length).toBeGreaterThan(0);
    expect(collegeFinishedWorld.collegeSeason?.completedGames.length).toBeGreaterThan(0);
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
    expect(normalized.collegePlayers).toEqual([]);
    expect(normalized.collegeSeason?.schedule.length).toBeGreaterThan(0);
  });
});
