import { GameWorld, Player, Position } from '../world/worldTypes';

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

function getPlayerName(player: Player) {
  return `${player.firstName} ${player.lastName}`;
}

function getProspectScore(player: Player) {
  return Math.round(
    player.overall * 0.42 +
      player.potential * 0.34 +
      player.ambition * 0.12 +
      player.workEthic * 0.08 +
      player.leadership * 0.04
  );
}

function getProjection(score: number, player: Player) {
  if (score >= 86) {
    return 'элитный кандидат для сильной программы';
  }

  if (score >= 78) {
    return 'сильный кандидат уровня штата';
  }

  if (score >= 70) {
    return 'перспективный игрок с шансом на рост';
  }

  if (player.potential >= 82 || player.workEthic >= 85) {
    return 'сырой талант с хорошим потолком';
  }

  return 'локальный выпускник, которому нужен правильный шанс';
}

export function getProspectPool(world: GameWorld): ProspectPoolEntry[] {
  return [...(world.graduatedPlayers ?? [])]
    .map((player) => {
      const team = world.teams.find((entry) => entry.id === player.teamId);
      const school = world.schools.find((entry) => entry.id === player.schoolId);
      const hometown = world.cities.find((entry) => entry.id === (player.hometownCityId ?? player.cityId));
      const score = getProspectScore(player);

      return {
        playerId: player.id,
        personId: player.personId ?? null,
        playerName: getPlayerName(player),
        teamId: player.teamId,
        teamName: team?.shortName ?? 'Неизвестная команда',
        schoolName: school?.name ?? 'Неизвестная школа',
        hometownName: hometown?.name ?? 'неизвестный город',
        position: player.position,
        overall: player.overall,
        potential: player.potential,
        ambition: player.ambition,
        workEthic: player.workEthic,
        leadership: player.leadership,
        score,
        projection: getProjection(score, player)
      };
    })
    .sort((left, right) => right.score - left.score || right.potential - left.potential || right.overall - left.overall);
}
