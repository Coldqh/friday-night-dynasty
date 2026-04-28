import { GameWorld, WorldHistory } from '../world/worldTypes';

export function recordSeasonHistory(world: GameWorld): WorldHistory {
  const champion = world.teams.find((team) => team.id === world.season.championTeamId);
  const finalGame = world.season.playoffGames[world.season.playoffGames.length - 1];
  const mvp = finalGame?.result?.mvpPlayerId
    ? world.players.find((player) => player.id === finalGame.result!.mvpPlayerId)
    : null;

  return {
    seasons: [
      ...world.history.seasons,
      {
        year: world.currentYear,
        championTeamId: champion?.id ?? 'unknown',
        championName: champion?.shortName ?? 'Unknown Champion',
        mvpPlayerId: mvp?.id ?? null,
        mvpName: mvp ? `${mvp.firstName} ${mvp.lastName}` : 'No MVP recorded',
        note: `${champion?.shortName ?? 'A team'} survived the playoff and became a state legend.`
      }
    ]
  };
}
