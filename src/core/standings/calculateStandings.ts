import { Team, TeamStanding } from '../world/worldTypes';

export function calculateStandings(teams: Team[]): TeamStanding[] {
  return [...teams]
    .sort((a, b) => {
      const winDiff = b.wins - a.wins;
      if (winDiff !== 0) return winDiff;

      const pointDiff = b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst);
      if (pointDiff !== 0) return pointDiff;

      const pointsForDiff = b.pointsFor - a.pointsFor;
      if (pointsForDiff !== 0) return pointsForDiff;

      return b.overallRating - a.overallRating;
    })
    .map((team, index) => ({
      rank: index + 1,
      teamId: team.id,
      teamName: team.shortName,
      wins: team.wins,
      losses: team.losses,
      pointsFor: team.pointsFor,
      pointsAgainst: team.pointsAgainst,
      pointDifferential: team.pointsFor - team.pointsAgainst,
      overallRating: team.overallRating
    }));
}
