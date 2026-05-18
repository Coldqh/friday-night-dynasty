import { CollegePlayer, CollegeTeam } from '../world/worldTypes';

function clamp(value: number) {
  return Math.max(30, Math.min(70, Math.round(value)));
}

export function getCollegeRosterStrength(team: CollegeTeam, players: CollegePlayer[]) {
  const roster = players.filter((player) => player.collegeTeamId === team.id);

  if (roster.length === 0) {
    return clamp(30 + team.prestige * 0.35);
  }

  const sorted = [...roster].sort((left, right) => right.overall - left.overall);
  const top = sorted.slice(0, 22);
  const average = top.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, top.length);

  return clamp(average * 0.86 + (30 + team.prestige * 0.35) * 0.14);
}

export function getCollegeOffenseRating(team: CollegeTeam, players: CollegePlayer[]) {
  const roster = players.filter((player) => player.collegeTeamId === team.id);
  const offense = roster.filter((player) => ['QB', 'RB', 'WR', 'TE', 'OL', 'K'].includes(player.position));
  const average = offense.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, offense.length);

  return clamp((average || 30 + team.prestige * 0.35) * 0.88 + (30 + team.prestige * 0.35) * 0.12);
}

export function getCollegeDefenseRating(team: CollegeTeam, players: CollegePlayer[]) {
  const roster = players.filter((player) => player.collegeTeamId === team.id);
  const defense = roster.filter((player) => ['DL', 'LB', 'CB', 'S'].includes(player.position));
  const average = defense.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, defense.length);

  return clamp((average || 30 + team.prestige * 0.35) * 0.88 + (30 + team.prestige * 0.35) * 0.12);
}
