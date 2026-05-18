import { Coach, Player, Team } from '../world/worldTypes';

function avg(values: number[]): number {
  if (values.length === 0) return 15;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function top(players: Player[], count: number): Player[] {
  return [...players].sort((a, b) => b.overall - a.overall).slice(0, count);
}

export function calculateTeamRatings(team: Team, players: Player[], coach: Coach) {
  const roster = players.filter((player) => player.teamId === team.id);
  const qb = top(roster.filter((player) => player.position === 'QB'), 1)[0]?.overall ?? 15;
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
  const kicker = top(roster.filter((player) => player.position === 'K'), 1)[0]?.overall ?? 15;
  const coachBoost = (coach.offense + coach.defense + coach.development) / 300;
  const programBoost = (team.prestige + team.morale) / 200;

  const offense = Math.round(qb * 0.3 + skill * 0.3 + line * 0.24 + coach.offense * 0.025 + programBoost * 2);
  const defense = Math.round(front * 0.42 + secondary * 0.36 + coach.defense * 0.035 + programBoost * 2);
  const overall = Math.round(
    offense * 0.46 +
      defense * 0.46 +
      kicker * 0.04 +
      coachBoost * 2 +
      programBoost * 1
  );

  return {
    offense: Math.max(0, Math.min(40, offense)),
    defense: Math.max(0, Math.min(40, defense)),
    qb,
    line,
    skill,
    front,
    secondary,
    kicker,
    overall: Math.max(0, Math.min(40, overall))
  };
}
