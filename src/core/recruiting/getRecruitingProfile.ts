import { GameWorld } from '../world/worldTypes';

export function getRecruitingProfileForPlayer(world: GameWorld, playerId: string) {
  return (world.recruitingProfiles ?? []).find((profile) => profile.playerId === playerId) ?? null;
}

export function getCommitmentForPlayer(world: GameWorld, playerId: string) {
  return (world.commitments ?? []).find((commitment) => commitment.playerId === playerId) ?? null;
}

export function getRecentCommitments(world: GameWorld, limit = 8) {
  return [...(world.commitments ?? [])]
    .sort((left, right) => right.year - left.year || right.prospectScore - left.prospectScore)
    .slice(0, limit);
}
