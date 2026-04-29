import { describe, expect, it } from 'vitest';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { getRivalryGames } from '../../core/rivalries/getRivalryGames';
import { getRivalryRecord } from '../../core/rivalries/getRivalryRecord';
import { simulateSeason, simulateWeek } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

function simulateWeeks(seed: number, weeks: number) {
  let world = createWorld({ seed });

  for (let index = 0; index < weeks; index += 1) {
    world = simulateWeek(world);
  }

  return world;
}

describe('rivalry records', () => {
  it('getRivalryRecord returns zero games before a rivalry matchup is played', () => {
    const world = createWorld({ seed: 1501 });
    const rivalryGame = getRivalryGames(world)[0]!;
    const record = getRivalryRecord(world, rivalryGame.awayTeamId, rivalryGame.homeTeamId);

    expect(record.gamesPlayed).toBe(0);
    expect(record.teamWins).toBe(0);
    expect(record.rivalWins).toBe(0);
    expect(record.ties).toBe(0);
    expect(record.lastGame).toBeUndefined();
    expect(record.currentStreak).toBeNull();
  });

  it('completed rivalry games update games played, wins, last game, and streak', () => {
    const preseasonWorld = createWorld({ seed: 1502 });
    const rivalryGame = getRivalryGames(preseasonWorld)[0]!;
    const world = simulateWeeks(1502, 10);
    const completedGames = world.season.completedGames
      .filter(
        (game) =>
          (game.homeTeamId === rivalryGame.homeTeamId && game.awayTeamId === rivalryGame.awayTeamId) ||
          (game.homeTeamId === rivalryGame.awayTeamId && game.awayTeamId === rivalryGame.homeTeamId)
      )
      .sort((left, right) => left.week - right.week);
    const completedGame = completedGames[completedGames.length - 1];
    const record = getRivalryRecord(world, rivalryGame.awayTeamId, rivalryGame.homeTeamId);

    expect(completedGames.length).toBeGreaterThan(0);
    expect(record.gamesPlayed).toBe(completedGames.length);
    expect(record.teamWins + record.rivalWins + record.ties).toBe(record.gamesPlayed);
    expect(record.lastGame?.winnerId).toBe(completedGame?.winnerId ?? null);

    if (completedGame?.winnerId) {
      let streakWins = 0;

      for (let index = completedGames.length - 1; index >= 0; index -= 1) {
        if (completedGames[index]?.winnerId !== completedGame.winnerId) {
          break;
        }

        streakWins += 1;
      }

      expect(record.currentStreak).toEqual({
        teamId: completedGame.winnerId,
        wins: streakWins
      });
    } else {
      expect(record.currentStreak).toBeNull();
    }
  });

  it('rivalry results persist into long-term history without duplicates across offseason rollover', () => {
    const completedSeason = simulateSeason(createWorld({ seed: 1503 }));
    const persistedIds = new Set(completedSeason.history.rivalryResults.map((entry) => entry.id));
    const afterOffseason = advanceOffseason(completedSeason);
    const offseasonIds = new Set(afterOffseason.history.rivalryResults.map((entry) => entry.id));

    expect(completedSeason.history.rivalryResults.length).toBeGreaterThan(0);
    expect(persistedIds.size).toBe(completedSeason.history.rivalryResults.length);
    expect(afterOffseason.history.rivalryResults.length).toBe(completedSeason.history.rivalryResults.length);
    expect(offseasonIds.size).toBe(afterOffseason.history.rivalryResults.length);
  });

  it('normalizeWorldState adds an empty rivalry results array for legacy worlds', () => {
    const legacy = createWorld({ seed: 1504 }) as ReturnType<typeof createWorld> & {
      history: {
        champions: ReturnType<typeof createWorld>['history']['champions'];
        titleGames: ReturnType<typeof createWorld>['history']['titleGames'];
        rivalryResults?: ReturnType<typeof createWorld>['history']['rivalryResults'];
      };
    };

    delete (legacy.history as { rivalryResults?: typeof legacy.history.rivalryResults }).rivalryResults;

    const normalized = normalizeWorldState(legacy);

    expect(normalized.history.rivalryResults).toEqual([]);
  });

  it('rivalry record helper returns consistent data for every rival on a team', () => {
    const world = simulateSeason(createWorld({ seed: 1505 }));
    const team = world.teams.find((entry) => entry.rivalryIds.length > 0)!;

    team.rivalryIds.forEach((rivalId) => {
      const record = getRivalryRecord(world, team.id, rivalId);

      expect(record.teamId).toBe(team.id);
      expect(record.rivalTeamId).toBe(rivalId);
      expect(record.gamesPlayed).toBeGreaterThanOrEqual(0);
      expect(record.teamWins + record.rivalWins + record.ties).toBe(record.gamesPlayed);
    });
  });
});
