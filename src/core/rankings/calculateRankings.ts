import { calculateStandings } from '../standings/calculateStandings';
import { GameWorld, Team } from '../world/worldTypes';

export interface RankingEntry {
  team: Team;
  rating: number;
}

export function calculateRankings(world: GameWorld): RankingEntry[] {
  const standings = calculateStandings(world.teams);

  return standings
    .map((entry) => {
      const team = world.teams.find((item) => item.id === entry.teamId)!;
      const powerRating =
        team.overallRating + entry.wins * 6 + Math.round(entry.pointDifferential / 10) + team.offenseRating * 0.08;

      return { team, rating: Math.round(powerRating) };
    })
    .sort((left, right) => right.rating - left.rating || right.team.wins - left.team.wins);
}
