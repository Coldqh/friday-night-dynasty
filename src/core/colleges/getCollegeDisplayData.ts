import { GameWorld } from '../world/worldTypes';
import { calculateCollegeStandings } from './collegeStandings';
import { getCollegeRosterStrength } from './collegeRatings';

export interface CollegeScheduleEntry {
  gameId: string;
  week: number;
  stage: 'regular' | 'semifinal' | 'final';
  stageLabel: string;
  awayTeamId: string;
  awayTeamName: string;
  homeTeamId: string;
  homeTeamName: string;
  status: 'Upcoming' | 'Final';
  score: string;
  winnerName: string | null;
}

export interface CollegeStandingEntry {
  rank: number;
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  prestige: number;
  recruitingNeeds: string;
  rosterStrength: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
}

function getTeamName(world: GameWorld, teamId: string) {
  return (world.collegeTeams ?? []).find((team) => team.id === teamId)?.shortName ?? '—';
}

function toScore(homeScore: number | null, awayScore: number | null) {
  if (homeScore === null || awayScore === null) {
    return '';
  }

  return `${awayScore}-${homeScore}`;
}

function toScheduleEntry(world: GameWorld, game: NonNullable<GameWorld['collegeSeason']>['schedule'][number]['games'][number]): CollegeScheduleEntry {
  const winnerName = game.winnerId ? getTeamName(world, game.winnerId) : null;
  const stageLabel = game.stage === 'final' ? 'State Final' : game.stage === 'semifinal' ? 'Semifinal' : 'Regular Season';

  return {
    gameId: game.id,
    week: game.week,
    stage: game.stage,
    stageLabel,
    awayTeamId: game.awayTeamId,
    awayTeamName: getTeamName(world, game.awayTeamId),
    homeTeamId: game.homeTeamId,
    homeTeamName: getTeamName(world, game.homeTeamId),
    status: game.homeScore === null || game.awayScore === null ? 'Upcoming' : 'Final',
    score: toScore(game.homeScore, game.awayScore),
    winnerName
  };
}

export function getCollegeStandings(world: GameWorld): CollegeStandingEntry[] {
  const standings = world.collegeSeason?.standings?.length
    ? world.collegeSeason.standings
    : calculateCollegeStandings(world.collegeTeams ?? [], world.collegePlayers ?? []);

  return standings.map((standing) => {
    const team = (world.collegeTeams ?? []).find((entry) => entry.id === standing.teamId);

    return {
      rank: standing.rank,
      teamId: standing.teamId,
      teamName: standing.teamName,
      wins: standing.wins,
      losses: standing.losses,
      prestige: standing.prestige,
      recruitingNeeds: team?.recruitingNeeds.join(', ') ?? '',
      rosterStrength: standing.rosterStrength ?? (team ? getCollegeRosterStrength(team, world.collegePlayers ?? []) : 0),
      pointsFor: standing.pointsFor,
      pointsAgainst: standing.pointsAgainst,
      pointDifferential: standing.pointDifferential
    };
  });
}

export function getCollegeSchedule(world: GameWorld): CollegeScheduleEntry[] {
  const fromSchedule = (world.collegeSeason?.schedule ?? []).flatMap((week) => week.games.map((game) => toScheduleEntry(world, game)));
  const fromCompleted = (world.collegeSeason?.completedGames ?? []).map((game) => toScheduleEntry(world, game));
  const byId = new Map<string, CollegeScheduleEntry>();

  fromSchedule.forEach((game) => byId.set(game.gameId, game));
  fromCompleted.forEach((game) => byId.set(game.gameId, game));

  return [...byId.values()].sort((left, right) => left.week - right.week || left.awayTeamName.localeCompare(right.awayTeamName));
}

export function getCollegeUpcomingSchedule(world: GameWorld) {
  return getCollegeSchedule(world).filter((game) => game.status === 'Upcoming');
}

export function getCollegeCompletedSchedule(world: GameWorld) {
  return getCollegeSchedule(world).filter((game) => game.status === 'Final');
}
