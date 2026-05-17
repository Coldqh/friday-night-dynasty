import { generateCollegeLayer } from './generateColleges';
import { generateCollegeSchedule } from './collegeSchedule';
import { calculateCollegeStandings } from './collegeStandings';
import { SeededRng } from '../random/rng';
import { GameWorld } from '../world/worldTypes';

export function ensureCollegeLayer(world: GameWorld): GameWorld {
  const hasColleges = Array.isArray(world.colleges) && world.colleges.length > 0;
  const hasCollegeTeams = Array.isArray(world.collegeTeams) && world.collegeTeams.length > 0;
  const rng = new SeededRng(world.seed + 64013);
  const layer = hasColleges && hasCollegeTeams
    ? {
        colleges: world.colleges ?? [],
        collegeTeams: (world.collegeTeams ?? []).map((team) => ({
          ...team,
          pointsFor: team.pointsFor ?? 0,
          pointsAgainst: team.pointsAgainst ?? 0,
          history: Array.isArray(team.history) ? team.history : []
        }))
      }
    : generateCollegeLayer({
        stateId: world.state.id,
        cities: world.cities,
        rng
      });
  const collegePlayers = Array.isArray(world.collegePlayers) ? world.collegePlayers : [];
  const collegeSeason = world.collegeSeason ?? {
    year: world.season.year,
    currentWeek: 0,
    regularSeasonWeeks: 7,
    schedule: generateCollegeSchedule({ rng, teams: layer.collegeTeams, weeks: 7 }),
    completedGames: [],
    standings: calculateCollegeStandings(layer.collegeTeams, collegePlayers),
    championTeamId: null,
    championshipGameId: null,
    seasonLog: []
  };

  return {
    ...world,
    colleges: layer.colleges,
    collegeTeams: layer.collegeTeams,
    collegePlayers,
    recruitingProfiles: Array.isArray(world.recruitingProfiles) ? world.recruitingProfiles : [],
    commitments: Array.isArray(world.commitments)
      ? world.commitments.map((commitment) => ({
          ...commitment,
          convertedToCollegePlayerId: commitment.convertedToCollegePlayerId ?? null
        }))
      : [],
    collegeSeason: {
      ...collegeSeason,
      standings: collegeSeason.standings?.length
        ? collegeSeason.standings
        : calculateCollegeStandings(layer.collegeTeams, collegePlayers)
    },
    history: {
      ...world.history,
      collegeChampions: Array.isArray(world.history.collegeChampions) ? world.history.collegeChampions : []
    }
  };
}
