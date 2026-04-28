import { GameWorld, WorldHistory } from '../world/worldTypes';

export function recordSeasonHistory(world: GameWorld): WorldHistory {
  const champion = world.teams.find((team) => team.id === world.season.championId);
  const finalGame = world.season.playoffGames.find((game) => game.stage === 'final');
  const runnerUp = finalGame?.loserId ? world.teams.find((team) => team.id === finalGame.loserId) : null;
  const mvp = finalGame?.mvpPlayerId
    ? world.players.find((player) => player.id === finalGame.mvpPlayerId)
    : null;

  return {
    seasons: [
      ...world.history.seasons,
      {
        year: world.season.year,
        championId: champion?.id ?? 'unknown',
        championTeamId: champion?.id ?? 'unknown',
        championName: champion?.shortName ?? 'Unknown Champion',
        runnerUpName: runnerUp?.shortName ?? 'Unknown Runner-Up',
        finalScore:
          finalGame && finalGame.homeScore !== null && finalGame.awayScore !== null
            ? `${finalGame.awayScore}-${finalGame.homeScore}`
            : 'No final score recorded',
        finalSummary: finalGame?.summary ?? 'No final summary recorded',
        mvpPlayerId: mvp?.id ?? null,
        mvpName: mvp ? `${mvp.firstName} ${mvp.lastName}` : 'No MVP recorded',
        note: `${champion?.shortName ?? 'A team'} claimed the Texoma state title.`
      }
    ]
  };
}
