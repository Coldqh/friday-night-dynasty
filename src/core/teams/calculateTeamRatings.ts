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
  const qb = top(roster.filter((player) => player.position === 'QB'), 1)[0]?.overall ?? 45;
  const skill = avg(
    top(
      roster.filter((player) => ['RB', 'WR', 'TE'].includes(player.position)),
      8
    ).map((player) => player.overall)
  );
  const line = avg(
    top(
      roster.filter((player) => player.position === 'OL'),
      5
    ).map((player) => player.overall)
  );
  const front = avg(
    top(
      roster.filter((player) => ['DL', 'LB'].includes(player.position)),
      7
    ).map((player) => player.overall)
  );
  const secondary = avg(
    top(
      roster.filter((player) => ['CB', 'S'].includes(player.position)),
      5
    ).map((player) => player.overall)
  );
  const kicker = top(roster.filter((player) => player.position === 'K'), 1)[0]?.overall ?? 40;
  const programBoost = team.prestige * 0.12 + team.morale * 0.08;

  const offense = Math.round(qb * 0.3 + skill * 0.28 + line * 0.22 + coach.offense * 0.14 + programBoost * 0.06);
  const defense = Math.round(front * 0.37 + secondary * 0.3 + coach.defense * 0.22 + team.prestige * 0.11);
  const overall = Math.round(
    offense * 0.44 +
      defense * 0.44 +
      kicker * 0.04 +
      coach.development * 0.04 +
      team.morale * 0.04
  );

  return { offense, defense, qb, line, skill, front, secondary, kicker, overall };
}
