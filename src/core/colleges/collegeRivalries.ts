import { GameWorld } from '../world/worldTypes';

export function isCollegeRivalryGame(world: GameWorld, awayTeamId: string, homeTeamId: string) {
  const away = (world.collegeTeams ?? []).find((team) => team.id === awayTeamId);
  const home = (world.collegeTeams ?? []).find((team) => team.id === homeTeamId);

  if (!away || !home) {
    return false;
  }

  return away.rivalryIds.includes(home.id) || home.rivalryIds.includes(away.id);
}

export function getCollegeRivalryRecord(world: GameWorld, teamId: string, rivalId: string) {
  const games = (world.collegeSeason?.completedGames ?? []).filter(
    (game) =>
      (game.homeTeamId === teamId && game.awayTeamId === rivalId) ||
      (game.homeTeamId === rivalId && game.awayTeamId === teamId)
  );

  let teamWins = 0;
  let rivalWins = 0;

  games.forEach((game) => {
    if (game.winnerId === teamId) teamWins += 1;
    if (game.winnerId === rivalId) rivalWins += 1;
  });

  return {
    gamesPlayed: games.length,
    teamWins,
    rivalWins,
    lastGame: games[games.length - 1] ?? null
  };
}
