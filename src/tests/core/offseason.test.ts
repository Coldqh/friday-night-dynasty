import { describe, expect, it } from 'vitest';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { simulateSeason } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';
import { validateWorldIntegrity } from '../../core/world/validateWorldIntegrity';
import { ClassYear } from '../../core/world/worldTypes';

function nextClassYear(classYear: ClassYear) {
  switch (classYear) {
    case 'FR':
      return 'SO';
    case 'SO':
      return 'JR';
    case 'JR':
      return 'SR';
    default:
      return 'SR';
  }
}

describe('offseason foundation', () => {
  it('advanceOffseason requires a completed season', () => {
    const world = createWorld({ seed: 1001 });
    const updated = advanceOffseason(world);

    expect(updated.currentYear).toBe(world.currentYear);
    expect(updated.season.year).toBe(world.season.year);
    expect(updated.phase).toBe(world.phase);
    expect(updated.season.currentWeek).toBe(world.season.currentWeek);
    expect(updated.season.championId).toBeNull();
    expect(validateWorldIntegrity(updated).valid).toBe(true);
  });

  it('advanceOffseason advances the year and resets the season state', () => {
    const completedSeason = simulateSeason(createWorld({ seed: 1002 }));
    const updated = advanceOffseason(completedSeason);

    expect(updated.currentYear).toBe(completedSeason.currentYear + 1);
    expect(updated.season.year).toBe(completedSeason.season.year + 1);
    expect(updated.phase).toBe('regular');
    expect(updated.season.currentWeek).toBe(0);
    expect(updated.season.completedGames).toHaveLength(0);
    expect(updated.season.playoffTeams).toHaveLength(0);
    expect(updated.season.playoffGames).toHaveLength(0);
    expect(updated.season.championId).toBeNull();
    expect(updated.season.seasonLog).toHaveLength(0);
  });

  it('graduates seniors and progresses every returning player class', () => {
    const completedSeason = simulateSeason(createWorld({ seed: 1003 }));
    const returningPlayers = completedSeason.players.filter((player) => player.classYear !== 'SR');
    const seniorIds = new Set(completedSeason.players.filter((player) => player.classYear === 'SR').map((player) => player.id));
    const updated = advanceOffseason(completedSeason);
    const updatedPlayersById = new Map(updated.players.map((player) => [player.id, player]));

    seniorIds.forEach((playerId) => {
      expect(updatedPlayersById.has(playerId)).toBe(false);
    });

    returningPlayers.forEach((player) => {
      const updatedPlayer = updatedPlayersById.get(player.id);

      expect(updatedPlayer).toBeDefined();
      expect(updatedPlayer?.classYear).toBe(nextClassYear(player.classYear));
    });
  });

  it('adds a new freshman class to every team and keeps rosters valid', () => {
    const completedSeason = simulateSeason(createWorld({ seed: 1004 }));
    const previousPlayerIds = new Set(completedSeason.players.map((player) => player.id));
    const updated = advanceOffseason(completedSeason);
    const validation = validateWorldIntegrity(updated);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);

    updated.teams.forEach((team) => {
      const roster = updated.players.filter((player) => player.teamId === team.id);
      const newFreshmen = roster.filter((player) => player.classYear === 'FR' && !previousPlayerIds.has(player.id));

      expect(roster.length).toBeGreaterThanOrEqual(35);
      expect(roster.length).toBeLessThanOrEqual(45);
      expect(newFreshmen.length).toBeGreaterThan(0);
    });
  });

  it('records team history once and preserves the champion title entry', () => {
    const completedSeason = simulateSeason(createWorld({ seed: 1005 }));
    const championshipYear = completedSeason.season.year;
    const championId = completedSeason.season.championId!;
    const updated = advanceOffseason(completedSeason);
    const champion = updated.teams.find((team) => team.id === championId)!;
    const championEntries = champion.history.filter((entry) => entry.year === championshipYear);
    const secondAdvance = advanceOffseason(updated);
    const championAfterSecondAdvance = secondAdvance.teams.find((team) => team.id === championId)!;

    updated.teams.forEach((team) => {
      expect(team.history.some((entry) => entry.year === championshipYear)).toBe(true);
    });

    expect(championEntries).toHaveLength(1);
    expect(championEntries[0].titleWon || championEntries[0].wonTitle).toBe(true);
    expect(updated.history.champions.some((entry) => entry.year === championshipYear)).toBe(true);
    expect(championAfterSecondAdvance.history.filter((entry) => entry.year === championshipYear)).toHaveLength(1);
  });
});
