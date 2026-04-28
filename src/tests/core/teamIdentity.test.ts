import { describe, expect, it } from 'vitest';
import { simulateSeason } from '../../core/season/simulateSeason';
import { getTeamHistorySnapshot } from '../../core/teams/getTeamHistorySnapshot';
import { getTeamLeaders } from '../../core/teams/getTeamLeaders';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { getTeamSchedule } from '../../core/teams/getTeamSchedule';
import { createWorld } from '../../core/world/createWorld';

describe('team identity helpers', () => {
  it('getTeamLeaders returns top player and young prospect from the selected team', () => {
    const world = createWorld({ seed: 880 });
    const team = world.teams[0];
    const roster = getTeamRoster(world, team.id);
    const leaders = getTeamLeaders(world, team.id);
    const leaderPlayers = Object.values(leaders).filter(
      (player): player is NonNullable<(typeof leaders)[keyof typeof leaders]> => player !== null
    );
    const topOverall = Math.max(...roster.map((player) => player.overall));
    const bestProspect = Math.max(
      ...roster
        .filter((player) => player.classYear === 'FR' || player.classYear === 'SO')
        .map((player) => player.potential)
    );

    expect(leaders.topPlayer).not.toBeNull();
    expect(leaders.youngProspect).not.toBeNull();
    expect(leaders.topPlayer?.overall).toBe(topOverall);
    expect(leaders.youngProspect?.potential).toBe(bestProspect);

    leaderPlayers.forEach((player) => {
      expect(player.teamId).toBe(team.id);
    });
  });

  it('getTeamSchedule returns only games involving the selected team and includes opponent info', () => {
    const world = createWorld({ seed: 881 });
    const team = world.teams[0];
    const schedule = getTeamSchedule(world, team.id);

    expect(schedule.length).toBeGreaterThan(0);
    schedule.forEach((game) => {
      expect(game.opponentTeamId).not.toBe(team.id);
      expect(game.opponentName.length).toBeGreaterThan(0);
      expect(['Home', 'Away']).toContain(game.homeAway);
    });
  });

  it('getTeamHistorySnapshot returns an empty history state before a completed season', () => {
    const world = createWorld({ seed: 882 });
    const team = world.teams[0];
    const history = getTeamHistorySnapshot(world, team.id);

    expect(history.history).toHaveLength(0);
    expect(history.totalHistoricalWins).toBe(0);
    expect(history.totalHistoricalLosses).toBe(0);
    expect(history.titlesCount).toBe(0);
    expect(history.playoffAppearancesCount).toBe(0);
    expect(history.lastSeasonEntry).toBeNull();
  });

  it('getTeamHistorySnapshot returns title and playoff info after a completed season', () => {
    const world = simulateSeason(createWorld({ seed: 883 }));
    const champion = world.teams.find((team) => team.id === world.season.championId)!;
    const championHistory = getTeamHistorySnapshot(world, champion.id);
    const playoffTeam = world.teams.find((team) => team.history[0]?.madePlayoffs)!;
    const playoffHistory = getTeamHistorySnapshot(world, playoffTeam.id);
    const championSchedule = getTeamSchedule(world, champion.id);

    expect(championHistory.titlesCount).toBeGreaterThan(0);
    expect(championHistory.playoffAppearancesCount).toBeGreaterThan(0);
    expect(championHistory.lastSeasonEntry?.wonTitle).toBe(true);
    expect(playoffHistory.playoffAppearancesCount).toBeGreaterThan(0);
    expect(championSchedule.some((game) => game.stage === 'final')).toBe(true);
  });
});
