import { GameWorld } from '../world/worldTypes';

export function isRivalryGame(
  world: GameWorld,
  game: {
    homeTeamId: string;
    awayTeamId: string;
  }
) {
  const homeTeam = world.teams.find((team) => team.id === game.homeTeamId);
  const awayTeam = world.teams.find((team) => team.id === game.awayTeamId);

  if (!homeTeam || !awayTeam) {
    return false;
  }

  return homeTeam.rivalryIds.includes(awayTeam.id) && awayTeam.rivalryIds.includes(homeTeam.id);
}
