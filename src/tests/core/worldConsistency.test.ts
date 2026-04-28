import { describe, expect, it } from 'vitest';
import { getHistorySnapshot } from '../../core/history/getHistorySnapshot';
import { simulateSeason } from '../../core/season/simulateSeason';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { createWorld } from '../../core/world/createWorld';
import { validateWorldIntegrity } from '../../core/world/validateWorldIntegrity';

describe('world consistency', () => {
  it('creates valid team/player bindings', () => {
    const world = createWorld({ seed: 777 });
    const validation = validateWorldIntegrity(world);
    const rosterIds = world.teams.flatMap((team) => team.playerIds);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(new Set(rosterIds).size).toBe(rosterIds.length);

    world.teams.forEach((team) => {
      expect(team.playerIds.length).toBeGreaterThanOrEqual(35);
      expect(team.playerIds.length).toBeLessThanOrEqual(45);
    });

    world.players.forEach((player) => {
      expect(player.teamId).toBeTruthy();
    });
  });

  it('getTeamRoster returns only players assigned to that team', () => {
    const world = createWorld({ seed: 778 });
    const team = world.teams[0];
    const roster = getTeamRoster(world, team.id);

    expect(roster.length).toBe(team.playerIds.length);
    expect(roster.map((player) => player.id)).toEqual(team.playerIds);
    roster.forEach((player) => {
      expect(player.teamId).toBe(team.id);
    });
  });

  it('keeps season log separate from long-term history', () => {
    const world = createWorld({ seed: 779 });
    const simulated = simulateSeason(world);
    const baseline = getHistorySnapshot(simulated);
    const mutated = structuredClone(simulated);

    mutated.season.seasonLog.unshift({
      id: 'season-log-test',
      year: simulated.season.year,
      week: simulated.season.currentWeek,
      headline: 'Weekly note',
      body: 'This should not leak into world history.',
      gameId: null
    });

    expect(simulated.history.champions).toHaveLength(1);
    expect(simulated.history.titleGames).toHaveLength(1);
    expect(simulated.season.seasonLog.length).toBeGreaterThan(0);
    expect(getHistorySnapshot(mutated)).toEqual(baseline);
  });
});
