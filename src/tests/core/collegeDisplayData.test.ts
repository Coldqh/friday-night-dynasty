import { describe, expect, it } from 'vitest';
import { getCollegeSchedule, getCollegeStandings } from '../../core/colleges/getCollegeDisplayData';
import { createWorld } from '../../core/world/createWorld';

describe('college display data', () => {
  it('creates college standings from college teams', () => {
    const world = createWorld({ seed: 6110 });
    const standings = getCollegeStandings(world);

    expect(standings.length).toBe(world.collegeTeams?.length);
    expect(standings[0]?.rank).toBe(1);
    expect(standings.every((entry) => entry.teamName.length > 0)).toBe(true);
  });

  it('creates a college schedule for the college mode', () => {
    const world = createWorld({ seed: 6111 });
    const schedule = getCollegeSchedule(world);

    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule.every((game) => game.status === 'Upcoming')).toBe(true);
    expect(schedule.every((game) => game.awayTeamName.length > 0 && game.homeTeamName.length > 0)).toBe(true);
  });
});
