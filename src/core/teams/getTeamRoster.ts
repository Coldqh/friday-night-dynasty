import { GameWorld, Player } from '../world/worldTypes';

export function getTeamRoster(world: GameWorld, teamId: string): Player[] {
  const team = world.teams.find((entry) => entry.id === teamId);

  if (!team) {
    return [];
  }

  const playersById = new Map(world.players.map((player) => [player.id, player]));

  return team.playerIds
    .map((playerId) => playersById.get(playerId))
    .filter((player): player is Player => player !== undefined && player.teamId === team.id);
}
