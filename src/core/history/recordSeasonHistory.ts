import { isRivalryGame } from '../rivalries/isRivalryGame';
import { GameWorld, RivalryGameResult, ScheduledGame, WorldHistory } from '../world/worldTypes';

const STAGE_ORDER = {
  regular: 0,
  semifinal: 1,
  final: 2
} as const;

function toRivalryGameResult(world: GameWorld, game: ScheduledGame): RivalryGameResult | null {
  if (game.homeScore === null || game.awayScore === null || !isRivalryGame(world, game)) {
    return null;
  }

  return {
    id: game.id,
    year: world.season.year,
    week: game.week,
    stage: game.stage,
    homeTeamId: game.homeTeamId,
    awayTeamId: game.awayTeamId,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    winnerId: game.winnerId,
    summary: game.summary
  };
}

function compareRivalryResults(left: RivalryGameResult, right: RivalryGameResult) {
  return (
    left.year - right.year ||
    left.week - right.week ||
    STAGE_ORDER[left.stage] - STAGE_ORDER[right.stage] ||
    left.id.localeCompare(right.id)
  );
}

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
  const rivalryResultsMap = new Map<string, RivalryGameResult>();

  world.history.rivalryResults.forEach((entry) => {
    rivalryResultsMap.set(entry.id, entry);
  });

  world.season.completedGames
    .map((game) => toRivalryGameResult(world, game))
    .forEach((entry) => {
      if (entry) {
        rivalryResultsMap.set(entry.id, entry);
      }
    });

  const rivalryResults = [...rivalryResultsMap.values()].sort(compareRivalryResults);

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
      : titleGames,
    rivalryResults
  };
}
