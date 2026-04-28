import { Coach, Player, Team } from '../world/worldTypes';

function avg(values: number[]): number {
  if (values.length === 0) return 45;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function top(players: Player[], count: number): Player[] {
  return [...players].sort((a, b) => b.overall - a.overall).slice(0, count);
}

export function calculateTeamRatings(team: Team, players: Player[], coach: Coach) {
  const roster = players.filter((player) => player.teamId === team.id);
  const qb = top(roster.filter((p) => p.position === 'QB'), 1)[0]?.overall ?? 45;
  const skill = avg(top(roster.filter((p) => ['RB', 'WR', 'TE'].includes(p.position)), 8).map((p) => p.overall));
  const line = avg(top(roster.filter((p) => p.position === 'OL'), 5).map((p) => p.overall));
  const front = avg(top(roster.filter((p) => ['DL', 'LB'].includes(p.position)), 7).map((p) => p.overall));
  const secondary = avg(top(roster.filter((p) => ['CB', 'S'].includes(p.position)), 5).map((p) => p.overall));
  const kicker = top(roster.filter((p) => p.position === 'K'), 1)[0]?.overall ?? 40;

  const offense = Math.round(qb * 0.3 + skill * 0.3 + line * 0.25 + coach.offense * 0.15);
  const defense = Math.round(front * 0.4 + secondary * 0.35 + coach.defense * 0.25);
  const overall = Math.round(offense * 0.45 + defense * 0.45 + kicker * 0.05 + team.morale * 0.05);

  return { offense, defense, qb, line, skill, front, secondary, kicker, overall };
}
