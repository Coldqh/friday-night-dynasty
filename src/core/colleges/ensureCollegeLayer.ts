import { generateCollegeLayer } from './generateColleges';
import { generateCollegeSchedule } from './collegeSchedule';
import { calculateCollegeStandings } from './collegeStandings';
import { rebalanceAllCollegeRosters, shouldRepairCollegeRoster } from './generateCollegePlayers';
import { updateCollegeTeamNeeds } from './collegeRosterPlan';
import { SeededRng } from '../random/rng';
import { GameWorld } from '../world/worldTypes';

function normalizeCollegeTeam<T extends NonNullable<GameWorld['collegeTeams']>[number]>(team: T, worldYear: number): T {
  return {
    ...team,
    rivalryIds: Array.isArray(team.rivalryIds) ? team.rivalryIds : [],
    pointsFor: team.pointsFor ?? 0,
    pointsAgainst: team.pointsAgainst ?? 0,
    history: Array.isArray(team.history) ? team.history.filter((entry) => entry.year <= worldYear) : []
  };
}

function ensureFallbackRivalries(teams: NonNullable<GameWorld['collegeTeams']>) {
  const next = teams.map((team) => normalizeCollegeTeam(team, 9999));
  const hasAny = next.some((team) => team.rivalryIds.length > 0);

  if (hasAny || next.length < 2) {
    return next;
  }

  for (let index = 0; index < next.length; index += 2) {
    const first = next[index];
    const second = next[index + 1] ?? next[0];

    if (!first || !second || first.id === second.id) continue;

    first.rivalryIds = [second.id];
    second.rivalryIds = [first.id];
  }

  return next;
}

function createFreshCollegeSeason(world: GameWorld, teams: NonNullable<GameWorld['collegeTeams']>, rng: SeededRng) {
  const resetTeams = teams.map((team) => ({
    ...team,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0
  }));

  return {
    year: world.season.year,
    currentWeek: 0,
    regularSeasonWeeks: world.collegeSeason?.regularSeasonWeeks ?? 7,
    schedule: generateCollegeSchedule({
      rng,
      teams: resetTeams,
      weeks: world.collegeSeason?.regularSeasonWeeks ?? 7
    }),
    completedGames: [],
    standings: calculateCollegeStandings(resetTeams, world.collegePlayers ?? []),
    championTeamId: null,
    championshipGameId: null,
    seasonLog: []
  };
}

export function ensureCollegeLayer(world: GameWorld): GameWorld {
  const hasColleges = Array.isArray(world.colleges) && world.colleges.length > 0;
  const hasCollegeTeams = Array.isArray(world.collegeTeams) && world.collegeTeams.length > 0;
  const rng = new SeededRng(world.seed + 64013 + world.season.year);
  const layer = hasColleges && hasCollegeTeams
    ? {
        colleges: world.colleges ?? [],
        collegeTeams: ensureFallbackRivalries((world.collegeTeams ?? []).map((team) => normalizeCollegeTeam(team, world.season.year)))
      }
    : generateCollegeLayer({
        stateId: world.state.id,
        cities: world.cities,
        rng
      });
  const originalCollegePlayers = Array.isArray(world.collegePlayers) ? world.collegePlayers : [];
  const mustRepairRosters =
    originalCollegePlayers.length === 0 ||
    layer.collegeTeams.some((team) => shouldRepairCollegeRoster(team, originalCollegePlayers));
  const collegePlayers = mustRepairRosters
    ? rebalanceAllCollegeRosters({
        rng,
        teams: layer.collegeTeams,
        cities: world.cities,
        players: originalCollegePlayers
      })
    : originalCollegePlayers;
  const seasonYearMismatch = world.collegeSeason?.year !== undefined && world.collegeSeason.year !== world.season.year;
  const baseCollegeTeams = seasonYearMismatch
    ? layer.collegeTeams.map((team) => ({
        ...team,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0
      }))
    : layer.collegeTeams;
  const collegeTeams = updateCollegeTeamNeeds(baseCollegeTeams, collegePlayers);
  const collegeSeason = !world.collegeSeason || seasonYearMismatch
    ? createFreshCollegeSeason(
        {
          ...world,
          collegePlayers
        },
        collegeTeams,
        rng
      )
    : {
        ...world.collegeSeason,
        year: world.season.year,
        standings: calculateCollegeStandings(collegeTeams, collegePlayers)
      };

  return {
    ...world,
    currentYear: world.season.year,
    colleges: layer.colleges,
    collegeTeams,
    collegePlayers,
    recruitingProfiles: Array.isArray(world.recruitingProfiles) ? world.recruitingProfiles : [],
    commitments: Array.isArray(world.commitments)
      ? world.commitments.map((commitment) => ({
          ...commitment,
          convertedToCollegePlayerId: commitment.convertedToCollegePlayerId ?? null
        }))
      : [],
    collegeSeason,
    history: {
      ...world.history,
      collegeChampions: Array.isArray(world.history.collegeChampions)
        ? world.history.collegeChampions.filter((entry) => entry.year <= world.season.year)
        : []
    }
  };
}
