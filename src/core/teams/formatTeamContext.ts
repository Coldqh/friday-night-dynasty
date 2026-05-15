import { GameWorld } from '../world/worldTypes';

export interface TeamContextLabel {
  teamId: string;
  name: string;
  displayName: string;
  recordLabel: string;
  overallLabel: string;
  fullContextLabel: string;
}

export function formatTeamContext(world: GameWorld, teamId: string): TeamContextLabel {
  const team = world.teams.find((entry) => entry.id === teamId);

  if (!team) {
    return {
      teamId,
      name: 'Unknown Team',
      displayName: 'Unknown Team',
      recordLabel: '0-0',
      overallLabel: 'OVR --',
      fullContextLabel: 'Unknown Team (0-0, OVR --)'
    };
  }

  const recordLabel = `${team.wins}-${team.losses}`;
  const overallLabel = `OVR ${team.overallRating}`;

  return {
    teamId: team.id,
    name: team.shortName,
    displayName: team.shortName,
    recordLabel,
    overallLabel,
    fullContextLabel: `${team.shortName} (${recordLabel}, ${overallLabel})`
  };
}
