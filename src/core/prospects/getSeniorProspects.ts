import { getCommitmentForPlayer, getRecruitingProfileForPlayer } from '../recruiting/getRecruitingProfile';
import { getProspectScore, getStars } from '../recruiting/recruitingUtils';
import { GameWorld, Player, Position } from '../world/worldTypes';

export interface SeniorProspectEntry {
  playerId: string;
  personId: string | null;
  playerName: string;
  teamId: string;
  teamName: string;
  schoolName: string;
  hometownName: string;
  position: Position;
  classYear: Player['classYear'];
  overall: number;
  potential: number;
  ambition: number;
  workEthic: number;
  leadership: number;
  score: number;
  stars: number;
  status: string;
  commitmentName: string;
}

function getPlayerName(player: Pick<Player, 'firstName' | 'lastName'>) {
  return `${player.firstName} ${player.lastName}`;
}

export function getSeniorProspects(world: GameWorld): SeniorProspectEntry[] {
  return world.players
    .filter((player) => player.classYear === 'SR')
    .map((player) => {
      const profile = getRecruitingProfileForPlayer(world, player.id);
      const commitment = getCommitmentForPlayer(world, player.id);
      const team = world.teams.find((entry) => entry.id === player.teamId);
      const school = world.schools.find((entry) => entry.id === player.schoolId);
      const hometown = world.cities.find((entry) => entry.id === (player.hometownCityId ?? player.cityId));
      const score = profile?.prospectScore ?? getProspectScore(player);
      const stars = profile?.stars ?? getStars(score);

      return {
        playerId: player.id,
        personId: player.personId ?? null,
        playerName: getPlayerName(player),
        teamId: player.teamId,
        teamName: team?.shortName ?? '—',
        schoolName: school?.name ?? '—',
        hometownName: hometown?.name ?? '—',
        position: player.position,
        classYear: player.classYear,
        overall: player.overall,
        potential: player.potential,
        ambition: player.ambition,
        workEthic: player.workEthic,
        leadership: player.leadership,
        score,
        stars,
        status: commitment ? 'коммит' : profile ? profile.status === 'committed' ? 'коммит' : 'без коммита' : 'наблюдение',
        commitmentName: commitment?.collegeName ?? '—'
      };
    })
    .sort(
      (left, right) =>
        right.stars - left.stars ||
        right.score - left.score ||
        right.potential - left.potential ||
        right.overall - left.overall ||
        left.playerName.localeCompare(right.playerName)
    );
}
