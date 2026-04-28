import { GameWorld } from './worldTypes';

export interface WorldIntegrityResult {
  valid: boolean;
  errors: string[];
}

export function validateWorldIntegrity(world: GameWorld): WorldIntegrityResult {
  const errors: string[] = [];
  const playersById = new Map(world.players.map((player) => [player.id, player]));
  const teamsById = new Map(world.teams.map((team) => [team.id, team]));
  const ownershipCounts = new Map<string, number>();

  world.teams.forEach((team) => {
    if (!Array.isArray(team.playerIds)) {
      errors.push(`Team ${team.id} is missing playerIds.`);
      return;
    }

    if (team.playerIds.length < 35 || team.playerIds.length > 45) {
      errors.push(`Team ${team.id} has ${team.playerIds.length} players; expected 35-45.`);
    }

    const uniqueIds = new Set(team.playerIds);
    if (uniqueIds.size !== team.playerIds.length) {
      errors.push(`Team ${team.id} has duplicate player ids in its roster.`);
    }

    team.playerIds.forEach((playerId) => {
      const player = playersById.get(playerId);
      ownershipCounts.set(playerId, (ownershipCounts.get(playerId) ?? 0) + 1);

      if (!player) {
        errors.push(`Team ${team.id} references missing player ${playerId}.`);
        return;
      }

      if (player.teamId !== team.id) {
        errors.push(`Player ${player.id} is listed on team ${team.id} but belongs to ${player.teamId}.`);
      }
    });
  });

  world.players.forEach((player) => {
    if (!player.teamId) {
      errors.push(`Player ${player.id} does not have a teamId.`);
      return;
    }

    const team = teamsById.get(player.teamId);
    if (!team) {
      errors.push(`Player ${player.id} points to missing team ${player.teamId}.`);
      return;
    }

    if (!Array.isArray(team.playerIds)) {
      errors.push(`Team ${team.id} is missing playerIds.`);
      return;
    }

    const listedCount = ownershipCounts.get(player.id) ?? 0;
    if (listedCount === 0) {
      errors.push(`Player ${player.id} belongs to ${player.teamId} but is not listed in team.playerIds.`);
    } else if (listedCount > 1) {
      errors.push(`Player ${player.id} appears in ${listedCount} team rosters.`);
    }

    if (!team.playerIds.includes(player.id)) {
      errors.push(`Team ${team.id} is missing player ${player.id} in playerIds.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
