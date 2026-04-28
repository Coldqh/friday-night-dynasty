import { GameWorld, WorldHistory } from '../world/worldTypes';

export function recordSeasonHistory(world: GameWorld): WorldHistory {
  const champion = world.teams.find((team) => team.id === world.season.championId);
  const finalGame = world.season.playoffGames.find((game) => game.stage === 'final');
  const runnerUp = finalGame?.loserId ? world.teams.find((team) => team.id === finalGame.loserId) : null;
  const winnerScore =
    finalGame && champion
      ? champion.id === finalGame.homeTeamId
        ? finalGame.homeScore
        : finalGame.awayScore
      : null;
  const runnerUpScore =
    finalGame && runnerUp
      ? runnerUp.id === finalGame.homeTeamId
        ? finalGame.homeScore
        : finalGame.awayScore
      : null;
  const champions = world.history.champions.filter((entry) => entry.year !== world.season.year);
  const titleGames = world.history.titleGames.filter((entry) => entry.year !== world.season.year);

  return {
    champions: [
      ...champions,
      {
        year: world.season.year,
        championId: champion?.id ?? 'unknown',
        championTeamId: champion?.id ?? 'unknown',
        championName: champion?.shortName ?? 'Unknown Champion',
        runnerUpId: runnerUp?.id ?? null,
        runnerUpName: runnerUp?.shortName ?? 'Unknown Runner-Up',
        finalGameId: finalGame?.id ?? null,
        finalScore: winnerScore !== null && runnerUpScore !== null ? `${winnerScore}-${runnerUpScore}` : 'No final score recorded',
        finalSummary: finalGame?.summary ?? 'No final summary recorded',
        note: `${champion?.shortName ?? 'A team'} claimed the Texoma state title.`
      }
    ],
    titleGames: finalGame
      ? [
          ...titleGames,
          {
            year: world.season.year,
            gameId: finalGame.id,
            championId: champion?.id ?? 'unknown',
            championName: champion?.shortName ?? 'Unknown Champion',
            runnerUpId: runnerUp?.id ?? null,
            runnerUpName: runnerUp?.shortName ?? 'Unknown Runner-Up',
            finalScore:
              winnerScore !== null && runnerUpScore !== null
                ? `${winnerScore}-${runnerUpScore}`
                : 'No final score recorded',
            summary: finalGame.summary || 'No final summary recorded'
          }
        ]
      : titleGames
  };
}
