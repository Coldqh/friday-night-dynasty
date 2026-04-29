import { describe, expect, it } from 'vitest';
import { getHistorySnapshot } from '../../core/history/getHistorySnapshot';
import { simulateSeason } from '../../core/season/simulateSeason';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';
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

  it('normalizes legacy save data into the current world shape', () => {
    const world = createWorld({ seed: 780 });
    const legacy = structuredClone(world) as typeof world & {
      season: typeof world.season & { historyEntries?: typeof world.season.seasonLog };
      history: typeof world.history & {
        seasons?: Array<{
          year: number;
          championId: string;
          championTeamId: string;
          championName: string;
          runnerUpName: string;
          finalScore: string;
          finalSummary: string;
          note: string;
        }>;
      };
    };

    legacy.teams[0].playerIds = [];
    legacy.teams[0].roster = world.players.filter((player) => player.teamId === legacy.teams[0].id).map((player) => player.id);
    legacy.season.historyEntries = [...legacy.season.seasonLog];
    delete (legacy.season as { seasonLog?: typeof world.season.seasonLog }).seasonLog;
    legacy.history.seasons = [
      {
        year: 2025,
        championId: 'team_legacy',
        championTeamId: 'team_legacy',
        championName: 'Legacy High Tigers',
        runnerUpName: 'Legacy Central Wolves',
        finalScore: '28-21',
        finalSummary: 'Legacy High closed the game with a late touchdown.',
        note: 'Legacy High won the state title.'
      }
    ];
    delete (legacy.history as { champions?: typeof world.history.champions }).champions;
    delete (legacy.history as { titleGames?: typeof world.history.titleGames }).titleGames;

    const normalized = normalizeWorldState(legacy);

    expect(normalized.teams[0].playerIds).toEqual(legacy.teams[0].roster);
    expect(normalized.season.seasonLog.length).toBeGreaterThan(0);
    expect(normalized.history.champions).toHaveLength(1);
    expect(normalized.history.titleGames).toHaveLength(1);
    expect(normalized.history.rivalryResults).toEqual([]);
  });
});
