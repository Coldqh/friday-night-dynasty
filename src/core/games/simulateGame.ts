import { SeededRng } from '../random/rng';
import { calculateTeamRatings } from '../teams/calculateTeamRatings';
import { Coach, GameResult, Player, Team } from '../world/worldTypes';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function weightedPoints(power: number, opponentDefense: number, rng: SeededRng) {
  const base = 17 + (power - opponentDefense) * 0.22 + rng.int(-10, 14);
  return Math.round(clamp(base, 0, 56));
}

export function simulateGame({ home, away, players, coaches, rng }: { home: Team; away: Team; players: Player[]; coaches: Coach[]; rng: SeededRng }): GameResult {
  const homeCoach = coaches.find((coach) => coach.id === home.coachId)!;
  const awayCoach = coaches.find((coach) => coach.id === away.coachId)!;
  const homeRatings = calculateTeamRatings(home, players, homeCoach);
  const awayRatings = calculateTeamRatings(away, players, awayCoach);

  let homeScore = weightedPoints(homeRatings.offense + 3, awayRatings.defense, rng);
  let awayScore = weightedPoints(awayRatings.offense, homeRatings.defense + 1, rng);

  if (homeScore === awayScore) {
    if (rng.chance(0.5)) homeScore += 3;
    else awayScore += 3;
  }

  const homeYards = clamp(homeScore * rng.int(9, 17) + homeRatings.offense * 2, 120, 620);
  const awayYards = clamp(awayScore * rng.int(9, 17) + awayRatings.offense * 2, 120, 620);
  const turnoversHome = rng.int(0, homeRatings.qb > 70 ? 2 : 4);
  const turnoversAway = rng.int(0, awayRatings.qb > 70 ? 2 : 4);

  const winningTeam = homeScore > awayScore ? home : away;
  const winnerPlayers = players.filter((player) => player.teamId === winningTeam.id);
  const mvp = winnerPlayers.sort((a, b) => b.overall - a.overall)[0] ?? null;

  return {
    homeScore,
    awayScore,
    homeYards,
    awayYards,
    turnoversHome,
    turnoversAway,
    mvpPlayerId: mvp?.id ?? null,
    summary: `${away.shortName} ${awayScore} — ${home.shortName} ${homeScore}. ${winningTeam.shortName} controls the night under the lights.`
  };
}
