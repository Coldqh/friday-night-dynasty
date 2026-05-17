import { College, CollegeTeam, Player, RecruitingProfile } from '../world/worldTypes';

export function getPlayerName(player: Pick<Player, 'firstName' | 'lastName'>) {
  return `${player.firstName} ${player.lastName}`;
}

export function getProspectScore(player: Player) {
  return Math.round(
    player.overall * 0.42 +
      player.potential * 0.36 +
      player.ambition * 0.08 +
      player.workEthic * 0.08 +
      player.leadership * 0.06
  );
}

export function getStars(score: number) {
  if (score >= 86) return 5;
  if (score >= 78) return 4;
  if (score >= 70) return 3;
  if (score >= 60) return 2;
  return 1;
}

export function getRecruitingStatusLabel(status: RecruitingProfile['status']) {
  switch (status) {
    case 'committed':
      return 'коммит';
    case 'walkOn':
      return 'walk-on';
    case 'noOffer':
      return 'нет оффера';
    default:
      return 'без коммита';
  }
}

export function getCollegeTeamName(colleges: College[], collegeTeams: CollegeTeam[], collegeTeamId: string | null) {
  if (!collegeTeamId) {
    return '—';
  }

  const collegeTeam = collegeTeams.find((team) => team.id === collegeTeamId);
  const college = collegeTeam ? colleges.find((entry) => entry.id === collegeTeam.collegeId) : null;

  return college?.shortName ?? collegeTeam?.shortName ?? '—';
}
