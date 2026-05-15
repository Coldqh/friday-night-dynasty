import { getWeekStakes } from '../stakes/getWeekStakes';
import { GameWorld, ScheduledGame } from '../world/worldTypes';
import { isRivalryGame } from '../rivalries/isRivalryGame';

export interface ProgramMomentum {
  teamId: string;
  score: number;
  label: string;
  trend: 'hot' | 'rising' | 'steady' | 'falling' | 'cold';
  reasons: string[];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getTeamGames(world: GameWorld, teamId: string) {
  return world.season.completedGames
    .filter((game) => game.homeTeamId === teamId || game.awayTeamId === teamId)
    .sort((left, right) => right.week - left.week);
}

function getWinLossStreak(world: GameWorld, teamId: string, games: ScheduledGame[]) {
  let streak = 0;

  for (const game of games) {
    if (!game.winnerId) {
      break;
    }

    if (game.winnerId === teamId) {
      if (streak < 0) {
        break;
      }

      streak += 1;
      continue;
    }

    if (streak > 0) {
      break;
    }

    streak -= 1;
  }

  return streak;
}

function isUpsetWin(world: GameWorld, teamId: string, game: ScheduledGame) {
  if (game.winnerId !== teamId) {
    return false;
  }

  const team = world.teams.find((entry) => entry.id === teamId);
  const opponentId = game.homeTeamId === teamId ? game.awayTeamId : game.homeTeamId;
  const opponent = world.teams.find((entry) => entry.id === opponentId);

  if (!team || !opponent) {
    return false;
  }

  return team.overallRating + 5 < opponent.overallRating || team.prestige + 8 < opponent.prestige;
}

function isBlowoutLoss(teamId: string, game: ScheduledGame) {
  if (game.homeScore === null || game.awayScore === null || game.winnerId === null || game.winnerId === teamId) {
    return false;
  }

  return Math.abs(game.homeScore - game.awayScore) >= 24;
}

function getLateSeasonPressure(world: GameWorld, teamId: string) {
  const weekStakes = getWeekStakes(world);

  return {
    mustWin: weekStakes.mustWinGames.some(
      (game) => game.homeTeamId === teamId || game.awayTeamId === teamId
    ),
    playoffRace: weekStakes.playoffRaceGames.some(
      (game) => game.homeTeamId === teamId || game.awayTeamId === teamId
    ),
    undefeatedWatch: weekStakes.undefeatedWatchGames.some(
      (game) => game.homeTeamId === teamId || game.awayTeamId === teamId
    )
  };
}

function getLabel(score: number, trend: ProgramMomentum['trend'], flags: { rivalryBoost: boolean; playoffPush: boolean }) {
  if (flags.rivalryBoost && score >= 25) {
    return 'Rivalry Boost';
  }

  if (flags.playoffPush && score >= 35) {
    return 'Playoff Push';
  }

  if (trend === 'hot') {
    return 'Red Hot';
  }

  if (trend === 'rising') {
    return 'Rising Fast';
  }

  if (trend === 'steady') {
    return 'Stable';
  }

  if (trend === 'falling') {
    return 'Under Pressure';
  }

  return score <= -60 ? 'In Free Fall' : 'Cold Program';
}

export function calculateProgramMomentum(world: GameWorld, teamId: string): ProgramMomentum {
  const team = world.teams.find((entry) => entry.id === teamId);

  if (!team) {
    return {
      teamId,
      score: 0,
      label: 'Stable',
      trend: 'steady',
      reasons: ['Program data is unavailable.']
    };
  }

  const standingsEntry = world.season.standings.find((entry) => entry.teamId === teamId);
  const recentGames = getTeamGames(world, teamId);
  const latestGame = recentGames[0];
  const streak = getWinLossStreak(world, teamId, recentGames);
  const pointDifferential = team.pointsFor - team.pointsAgainst;
  const gamesPlayed = team.wins + team.losses;
  const winRate = gamesPlayed > 0 ? team.wins / gamesPlayed : 0.5;
  const lateSeason = world.season.currentWeek >= Math.max(0, world.season.regularSeasonWeeks - 3);
  const pressure = getLateSeasonPressure(world, teamId);
  const reasons: string[] = [];
  let score = 0;
  let rivalryBoost = false;
  let playoffPush = false;

  if (streak > 0) {
    score += Math.min(32, streak * 11);
    reasons.push(`${streak}-game win streak`);
  } else if (streak < 0) {
    score -= Math.min(34, Math.abs(streak) * 12);
    reasons.push(`${Math.abs(streak)}-game losing streak`);
  }

  score += Math.round((winRate - 0.5) * 36);
  score += clamp(Math.round(pointDifferential / 4), -22, 22);

  if (latestGame && isRivalryGame(world, latestGame)) {
    if (latestGame.winnerId === teamId) {
      score += 12;
      rivalryBoost = true;
      reasons.push('Fresh off a rivalry win');
    } else if (latestGame.winnerId) {
      score -= 12;
      reasons.push('Rivalry loss still stings');
    }
  }

  const recentUpsetWin = recentGames.slice(0, 3).some((game) => isUpsetWin(world, teamId, game));
  if (recentUpsetWin) {
    score += 10;
    reasons.push('Upset win changed the conversation');
  }

  const recentBlowoutLoss = recentGames.slice(0, 3).some((game) => isBlowoutLoss(teamId, game));
  if (recentBlowoutLoss) {
    score -= 14;
    reasons.push('Blowout loss raised alarm bells');
  }

  if (team.losses === 0 && team.wins >= 2) {
    score += 14;
    reasons.push('Still unbeaten');
  }

  if (world.phase === 'playoffs' && world.season.playoffTeams.includes(teamId)) {
    score += 16;
    playoffPush = true;
    reasons.push('Still alive in the playoff chase');
  } else if (lateSeason && standingsEntry?.rank && standingsEntry.rank <= 4) {
    score += 10;
    playoffPush = true;
    reasons.push('Holding a playoff position');
  }

  if (pressure.playoffRace && lateSeason) {
    score += 6;
    reasons.push('Playoff race intensity is building');
  }

  if (pressure.mustWin) {
    score -= 8;
    reasons.push('Must-win pressure is building');
  }

  if (pressure.undefeatedWatch) {
    score += 5;
    reasons.push('The unbeaten spotlight keeps growing');
  }

  score = clamp(score, -100, 100);

  const trend: ProgramMomentum['trend'] =
    score >= 55 ? 'hot' : score >= 22 ? 'rising' : score <= -55 ? 'cold' : score <= -18 ? 'falling' : 'steady';

  return {
    teamId,
    score,
    label: getLabel(score, trend, { rivalryBoost, playoffPush }),
    trend,
    reasons: [...new Set(reasons)].slice(0, 4)
  };
}
