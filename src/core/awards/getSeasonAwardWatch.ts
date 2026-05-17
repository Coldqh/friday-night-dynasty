import { GameWorld, Player, Position } from '../world/worldTypes';

export type AwardWatchType =
  | 'stateMvp'
  | 'offensivePlayer'
  | 'defensivePlayer'
  | 'freshmanBreakout'
  | 'futureStar'
  | 'championshipMvp';

export interface AwardWatchEntry {
  type: AwardWatchType;
  title: string;
  playerId: string;
  personId: string | null;
  teamId: string;
  playerName: string;
  teamName: string;
  position: Position;
  classYear: Player['classYear'];
  score: number;
  reason: string;
}

function getPlayerName(player: Player) {
  return `${player.firstName} ${player.lastName}`;
}

function getTeamName(world: GameWorld, teamId: string) {
  return world.teams.find((team) => team.id === teamId)?.shortName ?? 'Unknown Team';
}

function getStatTotal(player: Player) {
  return (
    player.careerStats.passingYards +
    player.careerStats.rushingYards +
    player.careerStats.receivingYards +
    player.careerStats.tackles * 8 +
    player.careerStats.sacks * 35 +
    player.careerStats.touchdowns * 55 +
    player.careerStats.interceptions * 45
  );
}

function getOffensiveScore(player: Player) {
  return (
    player.seasonStats.passingYards * 0.03 +
    player.seasonStats.rushingYards * 0.05 +
    player.seasonStats.receivingYards * 0.05 +
    player.seasonStats.touchdowns * 9 +
    player.overall * 1.4 +
    player.potential * 0.4 +
    player.leadership * 0.25
  );
}

function getDefensiveScore(player: Player) {
  return (
    player.seasonStats.tackles * 2.6 +
    player.seasonStats.sacks * 14 +
    player.seasonStats.interceptions * 16 +
    player.overall * 1.5 +
    player.potential * 0.35 +
    player.leadership * 0.25
  );
}

function getMvpScore(player: Player) {
  return Math.max(getOffensiveScore(player), getDefensiveScore(player)) + getStatTotal(player) * 0.01;
}

function toEntry(world: GameWorld, type: AwardWatchType, title: string, player: Player, score: number, reason: string): AwardWatchEntry {
  return {
    type,
    title,
    playerId: player.id,
    personId: player.personId ?? null,
    teamId: player.teamId,
    playerName: getPlayerName(player),
    teamName: getTeamName(world, player.teamId),
    position: player.position,
    classYear: player.classYear,
    score: Math.round(score),
    reason
  };
}

function topPlayer(players: Player[], scoreFn: (player: Player) => number): { player: Player; score: number } | null {
  const sorted = [...players]
    .map((player) => ({ player, score: scoreFn(player) }))
    .sort((left, right) => right.score - left.score || right.player.overall - left.player.overall || right.player.potential - left.player.potential);

  return sorted[0] ?? null;
}

export function getSeasonAwardWatch(world: GameWorld): AwardWatchEntry[] {
  const entries: AwardWatchEntry[] = [];
  const activePlayers = world.players;
  const offensivePositions: Position[] = ['QB', 'RB', 'WR', 'TE'];
  const defensivePositions: Position[] = ['DL', 'LB', 'CB', 'S'];
  const championshipMvpId = world.season.playoffGames.find((game) => game.stage === 'final')?.mvpPlayerId ?? null;

  const mvp = topPlayer(activePlayers, getMvpScore);
  if (mvp) {
    entries.push(
      toEntry(
        world,
        'stateMvp',
        'State MVP Watch',
        mvp.player,
        mvp.score,
        `Best all-around resume: OVR ${mvp.player.overall}, POT ${mvp.player.potential}, ${mvp.player.seasonStats.touchdowns} TD.`
      )
    );
  }

  const offensive = topPlayer(
    activePlayers.filter((player) => offensivePositions.includes(player.position)),
    getOffensiveScore
  );
  if (offensive) {
    entries.push(
      toEntry(
        world,
        'offensivePlayer',
        'Offensive Player Watch',
        offensive.player,
        offensive.score,
        `${offensive.player.seasonStats.passingYards} pass yds, ${offensive.player.seasonStats.rushingYards} rush yds, ${offensive.player.seasonStats.receivingYards} rec yds.`
      )
    );
  }

  const defensive = topPlayer(
    activePlayers.filter((player) => defensivePositions.includes(player.position)),
    getDefensiveScore
  );
  if (defensive) {
    entries.push(
      toEntry(
        world,
        'defensivePlayer',
        'Defensive Player Watch',
        defensive.player,
        defensive.score,
        `${defensive.player.seasonStats.tackles} tackles, ${defensive.player.seasonStats.sacks} sacks, ${defensive.player.seasonStats.interceptions} INT.`
      )
    );
  }

  const freshman = topPlayer(
    activePlayers.filter((player) => player.classYear === 'FR'),
    (player) => player.overall * 1.5 + player.potential * 1.2 + player.workEthic * 0.25
  );
  if (freshman) {
    entries.push(
      toEntry(
        world,
        'freshmanBreakout',
        'Freshman Breakout Watch',
        freshman.player,
        freshman.score,
        `Young impact profile: OVR ${freshman.player.overall}, POT ${freshman.player.potential}, work ethic ${freshman.player.workEthic}.`
      )
    );
  }

  const futureStar = topPlayer(activePlayers, (player) => player.potential * 1.8 + player.overall * 0.7 + player.ambition * 0.35);
  if (futureStar) {
    entries.push(
      toEntry(
        world,
        'futureStar',
        'Future Star Watch',
        futureStar.player,
        futureStar.score,
        `Highest long-term ceiling in the state: POT ${futureStar.player.potential}, ambition ${futureStar.player.ambition}.`
      )
    );
  }

  if (championshipMvpId) {
    const championshipMvp = activePlayers.find((player) => player.id === championshipMvpId) ?? null;
    if (championshipMvp) {
      entries.unshift(
        toEntry(
          world,
          'championshipMvp',
          'Championship MVP',
          championshipMvp,
          getMvpScore(championshipMvp),
          'Named the key man of the state final.'
        )
      );
    }
  }

  return entries.slice(0, 6);
}
