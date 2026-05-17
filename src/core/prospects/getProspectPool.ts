import { GameWorld, Position } from '../world/worldTypes';

export interface ProspectPoolEntry {
  playerId: string;
  personId: string | null;
  playerName: string;
  teamId: string;
  teamName: string;
  schoolName: string;
  hometownName: string;
  position: Position;
  overall: number;
  potential: number;
  ambition: number;
  workEthic: number;
  leadership: number;
  score: number;
  projection: string;
}

export function getProspectPool(world: GameWorld): ProspectPoolEntry[] {
  return [...(world.recruitingProfiles ?? [])]
    .map((profile) => {
      const player = (world.graduatedPlayers ?? []).find((entry) => entry.id === profile.playerId);
      const school = player ? world.schools.find((entry) => entry.id === player.schoolId) : null;
      const hometown = player ? world.cities.find((entry) => entry.id === (player.hometownCityId ?? player.cityId)) : null;

      return {
        playerId: profile.playerId,
        personId: profile.personId,
        playerName: profile.playerName,
        teamId: profile.fromTeamId,
        teamName: profile.fromTeamName,
        schoolName: school?.name ?? '—',
        hometownName: hometown?.name ?? '—',
        position: profile.position,
        overall: profile.overall,
        potential: profile.potential,
        ambition: player?.ambition ?? 0,
        workEthic: player?.workEthic ?? 0,
        leadership: player?.leadership ?? 0,
        score: profile.prospectScore,
        projection: `${profile.stars}★`
      };
    })
    .sort((left, right) => right.score - left.score);
}
