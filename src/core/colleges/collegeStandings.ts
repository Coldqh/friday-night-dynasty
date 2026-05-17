import { CollegeStanding, CollegeTeam, CollegePlayer } from '../world/worldTypes';
import { getCollegeRosterStrength } from './collegeRatings';

export function calculateCollegeStandings(teams: CollegeTeam[], players: CollegePlayer[] = []): CollegeStanding[] {
  return [...teams]
    .map((team) => ({
      teamId: team.id,
      teamName: team.shortName,
      wins: team.wins,
      losses: team.losses,
      pointsFor: team.pointsFor,
      pointsAgainst: team.pointsAgainst,
      pointDifferential: team.pointsFor - team.pointsAgainst,
      prestige: team.prestige,
      rosterStrength: getCollegeRosterStrength(team, players)
    }))
    .sort(
      (left, right) =>
        right.wins - left.wins ||
        left.losses - right.losses ||
        right.pointDifferential - left.pointDifferential ||
        right.rosterStrength - left.rosterStrength ||
        left.teamName.localeCompare(right.teamName)
    )
    .map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));
}
