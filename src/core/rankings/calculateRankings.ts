import { calculateStandings } from '../standings/calculateStandings';
import { GameWorld, RankingSnapshotEntry, Team } from '../world/worldTypes';

export interface RankingEntry {
  team: Team;
  rating: number;
  rank: number;
}

function getPowerRating(world: GameWorld, team: Team, pointDifferential: number) {
  const gamesPlayed = team.wins + team.losses;
  const winRate = gamesPlayed > 0 ? team.wins / gamesPlayed : 0.5;

  return Math.round(
    team.overallRating * 1.6 +
      team.offenseRating * 0.35 +
      team.defenseRating * 0.45 +
      team.prestige * 0.2 +
      team.wins * 8 +
      winRate * 20 +
      pointDifferential * 0.35
  );
}

export function calculateRankings(world: GameWorld): RankingEntry[] {
  const standings = calculateStandings(world.teams);
  const pointDifferentialByTeam = new Map(
    standings.map((entry) => [entry.teamId, entry.pointDifferential])
  );

  return [...world.teams]
    .map((team) => ({
      team,
      rating: getPowerRating(world, team, pointDifferentialByTeam.get(team.id) ?? 0)
    }))
    .sort(
      (left, right) =>
        right.rating - left.rating ||
        right.team.wins - left.team.wins ||
        (right.team.pointsFor - right.team.pointsAgainst) - (left.team.pointsFor - left.team.pointsAgainst) ||
        right.team.overallRating - left.team.overallRating
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
}

export function toRankingSnapshot(world: GameWorld): RankingSnapshotEntry[] {
  return calculateRankings(world).map((entry) => ({
    teamId: entry.team.id,
    rank: entry.rank,
    rating: entry.rating
  }));
}
