import { describe, expect, it } from 'vitest';
import { advanceCollegeSeason } from '../../core/colleges/advanceCollegeSeason';
import { getCollegeTeamSchedule } from '../../core/colleges/getCollegeDisplayData';
import { simulateCollegeSeason } from '../../core/colleges/collegeSeason';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { simulateSeason } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';

describe('real college layer', () => {
  it('college teams have rivalries and team schedules', () => {
    const world = createWorld({ seed: 8101 });
    const team = world.collegeTeams?.[0];

    expect(team).toBeTruthy();
    expect(world.collegeTeams?.some((entry) => entry.rivalryIds.length > 0)).toBe(true);
    expect(getCollegeTeamSchedule(world, team!.id).length).toBeGreaterThan(0);
  });

  it('converts committed high school graduates into current college players', () => {
    const finished = simulateSeason(createWorld({ seed: 8102 }));
    const next = advanceOffseason(finished);
    const converted = next.commitments?.find((entry) => entry.convertedToCollegePlayerId);

    expect(converted).toBeTruthy();
    expect(next.collegePlayers?.some((player) => player.id === converted?.convertedToCollegePlayerId)).toBe(true);
  });

  it('college season can advance independently after the college champion is crowned', () => {
    const finished = simulateSeason(createWorld({ seed: 8103 }));
    const next = advanceOffseason(finished);
    const collegeFinished = simulateCollegeSeason(next);
    const oldCollegeYear = collegeFinished.collegeSeason?.year;
    const newCollegeSeason = advanceCollegeSeason(collegeFinished);

    expect(collegeFinished.collegeSeason?.championTeamId).toBeTruthy();
    expect(newCollegeSeason.collegeSeason?.year).toBe((oldCollegeYear ?? 0) + 1);
    expect(newCollegeSeason.collegeSeason?.championTeamId).toBeNull();
    expect(newCollegeSeason.collegeSeason?.completedGames).toEqual([]);
  });
});
