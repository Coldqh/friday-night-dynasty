import { SeededRng } from '../random/rng';
import { Coach, GameKeyPlayer, Player, Position, ScheduledGame, Team } from '../world/worldTypes';

export interface PlayerGameUpdate {
  playerId: string;
  passingYards?: number;
  rushingYards?: number;
  receivingYards?: number;
  tackles?: number;
  sacks?: number;
  touchdowns?: number;
  interceptions?: number;
}

export interface SimulatedGame {
  game: ScheduledGame;
  playerUpdates: PlayerGameUpdate[];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toTouchdownScore(successes: number, attack: number, defense: number, rng: SeededRng) {
  let score = 0;
  for (let drive = 0; drive < successes; drive += 1) {
    const outcome = attack - defense + rng.int(-18, 22);
    if (outcome > 16) score += 7;
    else if (outcome > 4) score += 3;
  }
  return clamp(score, 0, 56);
}

function generateFootballScore({
  attack,
  defense,
  homeEdge,
  rng
}: {
  attack: number;
  defense: number;
  homeEdge: number;
  rng: SeededRng;
}) {
  const drives = clamp(Math.round(8 + (attack - defense) / 12 + rng.int(0, 3) + homeEdge), 6, 12);
  return toTouchdownScore(drives, attack + homeEdge * 4, defense, rng);
}

function topByPosition(roster: Player[], positions: Position[]) {
  return roster
    .filter((player) => positions.includes(player.position))
    .sort((left, right) => right.overall - left.overall)[0] ?? null;
}

function keyPlayer(player: Player | null, team: Team, statLine: string): GameKeyPlayer | null {
  if (!player) return null;
  return {
    playerId: player.id,
    teamId: team.id,
    name: `${player.firstName} ${player.lastName}`,
    position: player.position,
    statLine
  };
}

export function simulateGame({
  game,
  home,
  away,
  players,
  coaches,
  rng
}: {
  game: ScheduledGame;
  home: Team;
  away: Team;
  players: Player[];
  coaches: Coach[];
  rng: SeededRng;
}): SimulatedGame {
  const homeCoach = coaches.find((coach) => coach.id === home.coachId)!;
  const awayCoach = coaches.find((coach) => coach.id === away.coachId)!;
  const homeRoster = players.filter((player) => player.teamId === home.id);
  const awayRoster = players.filter((player) => player.teamId === away.id);

  const homeQb = topByPosition(homeRoster, ['QB']);
  const awayQb = topByPosition(awayRoster, ['QB']);
  const homeSkill = topByPosition(homeRoster, ['RB', 'WR', 'TE']);
  const awaySkill = topByPosition(awayRoster, ['RB', 'WR', 'TE']);
  const homeDefender = topByPosition(homeRoster, ['LB', 'DL', 'CB', 'S']);
  const awayDefender = topByPosition(awayRoster, ['LB', 'DL', 'CB', 'S']);

  let homeScore = generateFootballScore({
    attack: home.offenseRating + home.overallRating * 0.25 + homeCoach.offense * 0.18,
    defense: away.defenseRating + awayCoach.defense * 0.16,
    homeEdge: 1.1,
    rng
  });
  let awayScore = generateFootballScore({
    attack: away.offenseRating + away.overallRating * 0.25 + awayCoach.offense * 0.18,
    defense: home.defenseRating + homeCoach.defense * 0.16,
    homeEdge: -0.45,
    rng
  });

  if (homeScore === awayScore) {
    if (rng.chance(0.5)) homeScore += 3;
    else awayScore += 3;
  }

  const homePassYards = clamp(
    Math.round(125 + homeScore * 7 + (home.offenseRating - away.defenseRating) * 2 + rng.int(-35, 65)),
    85,
    390
  );
  const awayPassYards = clamp(
    Math.round(125 + awayScore * 7 + (away.offenseRating - home.defenseRating) * 2 + rng.int(-35, 65)),
    85,
    390
  );
  const homeSkillYards = clamp(Math.round(55 + homeScore * 5 + rng.int(-18, 70)), 25, 235);
  const awaySkillYards = clamp(Math.round(55 + awayScore * 5 + rng.int(-18, 70)), 25, 235);
  const homeDefTackles = clamp(Math.round(6 + awayScore / 3 + rng.int(0, 4)), 4, 14);
  const awayDefTackles = clamp(Math.round(6 + homeScore / 3 + rng.int(0, 4)), 4, 14);
  const homeDefSplash = rng.int(0, 2);
  const awayDefSplash = rng.int(0, 2);

  const playerUpdates: PlayerGameUpdate[] = [];

  if (homeQb) {
    playerUpdates.push({
      playerId: homeQb.id,
      passingYards: homePassYards,
      touchdowns: Math.max(1, Math.round(homeScore / 10))
    });
  }
  if (awayQb) {
    playerUpdates.push({
      playerId: awayQb.id,
      passingYards: awayPassYards,
      touchdowns: Math.max(1, Math.round(awayScore / 11))
    });
  }
  if (homeSkill) {
    playerUpdates.push({
      playerId: homeSkill.id,
      rushingYards: homeSkill.position === 'RB' ? homeSkillYards : Math.round(homeSkillYards * 0.35),
      receivingYards: homeSkill.position === 'RB' ? Math.round(homeSkillYards * 0.3) : homeSkillYards,
      touchdowns: homeScore >= 17 ? 1 : 0
    });
  }
  if (awaySkill) {
    playerUpdates.push({
      playerId: awaySkill.id,
      rushingYards: awaySkill.position === 'RB' ? awaySkillYards : Math.round(awaySkillYards * 0.35),
      receivingYards: awaySkill.position === 'RB' ? Math.round(awaySkillYards * 0.3) : awaySkillYards,
      touchdowns: awayScore >= 17 ? 1 : 0
    });
  }
  if (homeDefender) {
    playerUpdates.push({
      playerId: homeDefender.id,
      tackles: homeDefTackles,
      sacks: homeDefSplash,
      interceptions: rng.chance(0.2) ? 1 : 0
    });
  }
  if (awayDefender) {
    playerUpdates.push({
      playerId: awayDefender.id,
      tackles: awayDefTackles,
      sacks: awayDefSplash,
      interceptions: rng.chance(0.2) ? 1 : 0
    });
  }

  const homeWon = homeScore > awayScore;
  const winner = homeWon ? home : away;
  const loser = homeWon ? away : home;
  const winnerScore = homeWon ? homeScore : awayScore;
  const loserScore = homeWon ? awayScore : homeScore;
  const mvp = homeWon ? homeQb ?? homeSkill : awayQb ?? awaySkill;
  const mvpLine =
    mvp?.position === 'QB'
      ? `${homeWon ? homePassYards : awayPassYards} ярдов пасом`
      : `${homeWon ? homeSkillYards : awaySkillYards} ярдов суммарно`;
  const stageLabel =
    game.stage === 'final' ? 'финале штата' : game.stage === 'semifinal' ? 'полуфинале' : 'матче недели';

  const keyPlayers = [
    keyPlayer(homeQb, home, `${homePassYards} ярдов пасом`),
    keyPlayer(homeSkill, home, `${homeSkillYards} ярдов суммарно`),
    keyPlayer(awayQb, away, `${awayPassYards} ярдов пасом`),
    keyPlayer(awaySkill, away, `${awaySkillYards} ярдов суммарно`)
  ].filter((entry): entry is GameKeyPlayer => entry !== null);

  return {
    game: {
      ...game,
      homeScore,
      awayScore,
      winnerId: winner.id,
      loserId: loser.id,
      summary: `${winner.shortName} обыграла ${loser.shortName} ${winnerScore}-${loserScore} в ${stageLabel}. ${
        mvp ? `${mvp.firstName} ${mvp.lastName} стал главным игроком матча: ${mvpLine}.` : 'Победитель лучше провёл концовку.'
      }`,
      keyPlayers,
      mvpPlayerId: mvp?.id ?? null
    },
    playerUpdates
  };
}
