import { describe, expect, it } from 'vitest';
import {
  COLLEGE_POSITION_MAXIMUMS,
  COLLEGE_POSITION_MINIMUMS,
  COLLEGE_POSITIONS,
  COLLEGE_ROSTER_TARGET,
  countCollegePositions
} from '../../core/colleges/collegeRosterPlan';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

describe('balanced college rosters', () => {
  it('creates every college with a full balanced football roster', () => {
    const world = createWorld({ seed: 9101 });

    expect(world.collegeTeams?.length).toBeGreaterThan(0);

    world.collegeTeams?.forEach((team) => {
      const roster = (world.collegePlayers ?? []).filter((player) => player.collegeTeamId === team.id);
      const counts = countCollegePositions(roster);

      expect(roster.length).toBe(COLLEGE_ROSTER_TARGET);

      COLLEGE_POSITIONS.forEach((position) => {
        expect(counts[position]).toBeGreaterThanOrEqual(COLLEGE_POSITION_MINIMUMS[position]);
        expect(counts[position]).toBeLessThanOrEqual(COLLEGE_POSITION_MAXIMUMS[position]);
      });
    });
  });

  it('repairs old broken college rosters with missing or overloaded positions', () => {
    const world = createWorld({ seed: 9102 });
    const broken = structuredClone(world);
    const firstTeamId = broken.collegeTeams![0].id;

    broken.collegePlayers = (broken.collegePlayers ?? [])
      .filter((player) => player.collegeTeamId !== firstTeamId)
      .concat(
        (broken.collegePlayers ?? [])
          .filter((player) => player.collegeTeamId === firstTeamId)
          .slice(0, 30)
          .map((player) => ({ ...player, position: 'WR' as const }))
      );

    const normalized = normalizeWorldState(broken);
    const repairedRoster = (normalized.collegePlayers ?? []).filter((player) => player.collegeTeamId === firstTeamId);
    const counts = countCollegePositions(repairedRoster);

    expect(repairedRoster.length).toBe(COLLEGE_ROSTER_TARGET);

    COLLEGE_POSITIONS.forEach((position) => {
      expect(counts[position]).toBeGreaterThanOrEqual(COLLEGE_POSITION_MINIMUMS[position]);
      expect(counts[position]).toBeLessThanOrEqual(COLLEGE_POSITION_MAXIMUMS[position]);
    });
  });
});
