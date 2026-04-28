import { calculateTeamRatings } from '../teams/calculateTeamRatings';
import { GameWorld, Team } from '../world/worldTypes';

export interface RankingEntry { team: Team; rating: number; }

export function calculateRankings(world: GameWorld): RankingEntry[] {
  return [...world.teams]
    .map((team) => {
      const coach = world.coaches.find((item) => item.id === team.coachId)!;
      const ratings = calculateTeamRatings(team, world.players, coach);
      const recordBoost = team.wins * 5 - team.losses * 4;
      const pointDiffBoost = Math.round((team.pointsFor - team.pointsAgainst) / 18);
      return { team, rating: Math.max(1, ratings.overall + recordBoost + pointDiffBoost) };
    })
    .sort((a, b) => b.rating - a.rating || b.team.wins - a.team.wins);
}
