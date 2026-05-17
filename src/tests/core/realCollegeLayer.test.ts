import { describe, expect, it } from 'vitest';
import { getCollegeTeamSchedule } from '../../core/colleges/getCollegeDisplayData';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { canAdvanceWorldYear, simulateUnifiedSeason, simulateUnifiedWeek } from '../../core/world/simulateUnifiedWorld';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

describe('unified school and college ecosystem', () => {
  it('college teams have rivalries and team schedules', () => {
    const world = createWorld({ seed: 8101 });
    const team = world.collegeTeams?.[0];

    expect(team).toBeTruthy();
    expect(world.collegeTeams?.some((entry) => entry.rivalryIds.length > 0)).toBe(true);
    expect(getCollegeTeamSchedule(world, team!.id).length).toBeGreaterThan(0);
    expect(world.collegeSeason?.year).toBe(world.season.year);
  });

  it('unified week advances both layers inside the same world year', () => {
    const world = createWorld({ seed: 8102 });
    const next = simulateUnifiedWeek(world);

    expect(next.season.year).toBe(world.season.year);
    expect(next.collegeSeason?.year).toBe(next.season.year);
    expect(next.season.completedGames.length).toBeGreaterThan(0);
    expect(next.collegeSeason?.completedGames.length).toBeGreaterThan(0);
  });

  it('unified full season finishes school and college in the same year', () => {
    const world = createWorld({ seed: 8103 });
    const finished = simulateUnifiedSeason(world);

    expect(finished.season.year).toBe(world.season.year);
    expect(finished.collegeSeason?.year).toBe(finished.season.year);
    expect(finished.phase).toBe('offseason');
    expect(finished.season.championId).toBeTruthy();
    expect(finished.collegeSeason?.championTeamId).toBeTruthy();
    expect(canAdvanceWorldYear(finished)).toBe(true);
  });

  it('offseason advances the entire world by exactly one year', () => {
    const world = createWorld({ seed: 8104 });
    const finished = simulateUnifiedSeason(world);
    const nextYear = advanceOffseason(finished);

    expect(nextYear.season.year).toBe(finished.season.year + 1);
    expect(nextYear.collegeSeason?.year).toBe(nextYear.season.year);
    expect(nextYear.currentYear).toBe(nextYear.season.year);
    expect(nextYear.phase).toBe('regular');
    expect(nextYear.collegeSeason?.championTeamId).toBeNull();
  });

  it('normalizes mismatched old saves back to one world year', () => {
    const world = createWorld({ seed: 8105 });
    const broken = structuredClone(world);
    broken.collegeSeason = {
      ...broken.collegeSeason!,
      year: broken.season.year + 4
    };

    const normalized = normalizeWorldState(broken);

    expect(normalized.collegeSeason?.year).toBe(normalized.season.year);
    expect(normalized.currentYear).toBe(normalized.season.year);
    expect(normalized.collegeSeason?.completedGames).toEqual([]);
    expect(normalized.collegeSeason?.championTeamId).toBeNull();
  });
});
