import { CollegePlayer, CollegeTeam } from '../world/worldTypes';

export function getCollegeRosterStrength(team: CollegeTeam, players: CollegePlayer[]) {
  const roster = players.filter((player) => player.collegeTeamId === team.id);

  if (roster.length === 0) {
    return Math.round(team.prestige * 0.72);
  }

  const sorted = [...roster].sort((left, right) => right.overall - left.overall);
  const top = sorted.slice(0, 22);
  const average = top.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, top.length);

  return Math.round(average * 0.7 + team.prestige * 0.3);
}

export function getCollegeOffenseRating(team: CollegeTeam, players: CollegePlayer[]) {
  const roster = players.filter((player) => player.collegeTeamId === team.id);
  const offense = roster.filter((player) => ['QB', 'RB', 'WR', 'TE', 'OL', 'K'].includes(player.position));
  const average = offense.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, offense.length);

  return Math.round((average || team.prestige) * 0.72 + team.prestige * 0.28);
}

export function getCollegeDefenseRating(team: CollegeTeam, players: CollegePlayer[]) {
  const roster = players.filter((player) => player.collegeTeamId === team.id);
  const defense = roster.filter((player) => ['DL', 'LB', 'CB', 'S'].includes(player.position));
  const average = defense.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, defense.length);

  return Math.round((average || team.prestige) * 0.72 + team.prestige * 0.28);
}
