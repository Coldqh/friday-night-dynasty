import { Player } from '../world/worldTypes';
import { GameWorld } from '../world/worldTypes';
import { getTeamRoster } from './getTeamRoster';

export interface TeamLeadersSnapshot {
  quarterback: Player | null;
  runningBack: Player | null;
  receiver: Player | null;
  defensiveStar: Player | null;
  topPlayer: Player | null;
  youngProspect: Player | null;
}

function pickTopPlayer(players: Player[]): Player | null {
  return (
    [...players].sort(
      (left, right) =>
        right.overall - left.overall ||
        right.potential - left.potential ||
        right.leadership - left.leadership
    )[0] ?? null
  );
}

function pickBestProspect(players: Player[]): Player | null {
  return (
    [...players].sort(
      (left, right) =>
        right.potential - left.potential ||
        right.overall - left.overall ||
        left.age - right.age
    )[0] ?? null
  );
}

export function getTeamLeaders(world: GameWorld, teamId: string): TeamLeadersSnapshot {
  const roster = getTeamRoster(world, teamId);

  return {
    quarterback: pickTopPlayer(roster.filter((player) => player.position === 'QB')),
    runningBack: pickTopPlayer(roster.filter((player) => player.position === 'RB')),
    receiver: pickTopPlayer(roster.filter((player) => player.position === 'WR')),
    defensiveStar: pickTopPlayer(
      roster.filter((player) => ['DL', 'LB', 'CB', 'S'].includes(player.position))
    ),
    topPlayer: pickTopPlayer(roster),
    youngProspect: pickBestProspect(
      roster.filter((player) => player.classYear === 'FR' || player.classYear === 'SO')
    )
  };
}
