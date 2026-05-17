import { describe, expect, it } from 'vitest';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { canAdvanceWorldYear, simulateUnifiedSeason, simulateUnifiedWeek } from '../../core/world/simulateUnifiedWorld';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

describe('unified year lock', () => {
  it('does not add extra games after the world year is complete', () => {
    const world = createWorld({ seed: 10101 });
    const finished = simulateUnifiedSeason(world);
    const beforeSchoolGames = finished.season.completedGames.length + finished.season.playoffGames.length;
    const beforeCollegeGames = finished.collegeSeason?.completedGames.length ?? 0;

    expect(canAdvanceWorldYear(finished)).toBe(true);

    let repeated = finished;

    for (let index = 0; index < 20; index += 1) {
      repeated = simulateUnifiedWeek(repeated);
    }

    const afterSchoolGames = repeated.season.completedGames.length + repeated.season.playoffGames.length;
    const afterCollegeGames = repeated.collegeSeason?.completedGames.length ?? 0;

    expect(afterSchoolGames).toBe(beforeSchoolGames);
    expect(afterCollegeGames).toBe(beforeCollegeGames);
    expect(repeated.season.year).toBe(finished.season.year);
    expect(repeated.collegeSeason?.year).toBe(repeated.season.year);
  });

  it('advances to the next year once and starts both seasons in the same year', () => {
    const world = createWorld({ seed: 10102 });
    const finished = simulateUnifiedSeason(world);
    const next = advanceOffseason(finished);

    expect(next.season.year).toBe(finished.season.year + 1);
    expect(next.collegeSeason?.year).toBe(next.season.year);
    expect(next.phase).toBe('regular');
    expect(next.collegeSeason?.championTeamId).toBeNull();
  });

  it('repairs a mismatched old save without keeping future games', () => {
    const world = createWorld({ seed: 10103 });
    const broken = structuredClone(simulateUnifiedSeason(world));

    broken.season = {
      ...broken.season,
      year: 2027
    };
    broken.currentYear = 2027;
    broken.collegeSeason = {
      ...broken.collegeSeason!,
      year: 2031
    };

    const normalized = normalizeWorldState(broken);

    expect(normalized.currentYear).toBe(2027);
    expect(normalized.season.year).toBe(2027);
    expect(normalized.collegeSeason?.year).toBe(2027);
    expect(normalized.collegeSeason?.completedGames).toEqual([]);
    expect(normalized.collegeSeason?.championTeamId).toBeNull();
  });
});
