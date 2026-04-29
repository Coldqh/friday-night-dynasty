import { getFullSchedule, FullScheduleEntry } from './getFullSchedule';
import { GameWorld } from '../world/worldTypes';

export interface WeeklySlateEntry extends FullScheduleEntry {
  reason: string;
}

export interface WeeklySlate {
  currentWeek: number;
  gamesThisWeek: WeeklySlateEntry[];
  gameOfTheWeek: WeeklySlateEntry | null;
  notableGames: WeeklySlateEntry[];
  completedThisWeek: WeeklySlateEntry[];
}

function determineSlateWeek(world: GameWorld, schedule: FullScheduleEntry[]) {
  if (schedule.length === 0) {
    return world.season.currentWeek;
  }

  if (world.phase === 'offseason') {
    return Math.max(...schedule.map((game) => game.week));
  }

  const currentWeekGames = schedule.filter((game) => game.week === world.season.currentWeek);
  if (currentWeekGames.length > 0) {
    return world.season.currentWeek;
  }

  if (world.phase === 'playoffs') {
    const playoffWeeks = schedule.filter((game) => game.stage !== 'regular').map((game) => game.week);
    if (playoffWeeks.length > 0) {
      return Math.max(...playoffWeeks);
    }
  }

  return Math.min(world.season.currentWeek, world.season.regularSeasonWeeks - 1);
}

function getProjectedStageLabel(stage: FullScheduleEntry['stage']) {
  return stage === 'final' ? 'State Final' : stage === 'semifinal' ? 'Semifinal' : 'Regular Season';
}

function createProjectedGame(
  world: GameWorld,
  {
    gameId,
    week,
    stage,
    awayTeamId,
    homeTeamId,
    summary
  }: {
    gameId: string;
    week: number;
    stage: FullScheduleEntry['stage'];
    awayTeamId: string;
    homeTeamId: string;
    summary: string;
  }
): FullScheduleEntry {
  const awayTeam = world.teams.find((team) => team.id === awayTeamId);
  const homeTeam = world.teams.find((team) => team.id === homeTeamId);

  return {
    gameId,
    week,
    stage,
    stageLabel: getProjectedStageLabel(stage),
    awayTeamId,
    awayTeamName: awayTeam?.shortName ?? 'Unknown Team',
    homeTeamId,
    homeTeamName: homeTeam?.shortName ?? 'Unknown Team',
    awayScore: null,
    homeScore: null,
    winnerId: null,
    winnerName: null,
    summary,
    score: 'Upcoming',
    status: 'Upcoming'
  };
}

function getProjectedPlayoffGames(world: GameWorld): FullScheduleEntry[] {
  if (world.phase !== 'playoffs') {
    return [];
  }

  const semifinalGames = world.season.playoffGames.filter((game) => game.stage === 'semifinal');
  const finalGame = world.season.playoffGames.find((game) => game.stage === 'final');

  if (semifinalGames.length === 0 && world.season.playoffTeams.length === 4) {
    return [
      createProjectedGame(world, {
        gameId: 'projected-semifinal-1',
        week: world.season.currentWeek,
        stage: 'semifinal',
        awayTeamId: world.season.playoffTeams[3],
        homeTeamId: world.season.playoffTeams[0],
        summary: 'Projected Texoma semifinal matchup.'
      }),
      createProjectedGame(world, {
        gameId: 'projected-semifinal-2',
        week: world.season.currentWeek,
        stage: 'semifinal',
        awayTeamId: world.season.playoffTeams[2],
        homeTeamId: world.season.playoffTeams[1],
        summary: 'Projected Texoma semifinal matchup.'
      })
    ];
  }

  if (!finalGame && semifinalGames.length === 2 && semifinalGames.every((game) => game.winnerId)) {
    return [
      createProjectedGame(world, {
        gameId: 'projected-state-final',
        week: world.season.currentWeek,
        stage: 'final',
        awayTeamId: semifinalGames[1].winnerId!,
        homeTeamId: semifinalGames[0].winnerId!,
        summary: 'Projected Texoma state final matchup.'
      })
    ];
  }

  return [];
}

function getImportanceReason(world: GameWorld, game: FullScheduleEntry) {
  const awayTeam = world.teams.find((team) => team.id === game.awayTeamId);
  const homeTeam = world.teams.find((team) => team.id === game.homeTeamId);
  const awayStanding = world.season.standings.find((entry) => entry.teamId === game.awayTeamId);
  const homeStanding = world.season.standings.find((entry) => entry.teamId === game.homeTeamId);

  if (game.stage === 'final') {
    return 'State Final';
  }

  if (game.stage === 'semifinal') {
    return 'Playoff semifinal';
  }

  if (awayTeam && homeTeam && awayTeam.losses === 0 && homeTeam.losses === 0 && (awayTeam.wins > 0 || homeTeam.wins > 0)) {
    return 'Battle of unbeaten teams';
  }

  if (awayStanding && homeStanding && awayStanding.rank <= 5 && homeStanding.rank <= 5) {
    return 'Top-ranked matchup';
  }

  if (awayTeam && homeTeam && Math.abs(awayTeam.overallRating - homeTeam.overallRating) <= 4) {
    return 'Evenly matched programs';
  }

  return 'Friday night spotlight';
}

function getImportanceScore(world: GameWorld, game: FullScheduleEntry) {
  const awayTeam = world.teams.find((team) => team.id === game.awayTeamId);
  const homeTeam = world.teams.find((team) => team.id === game.homeTeamId);
  const awayStanding = world.season.standings.find((entry) => entry.teamId === game.awayTeamId);
  const homeStanding = world.season.standings.find((entry) => entry.teamId === game.homeTeamId);
  const stageScore = game.stage === 'final' ? 1000 : game.stage === 'semifinal' ? 600 : 0;
  const ratingsScore = (awayTeam?.overallRating ?? 0) * 2 + (homeTeam?.overallRating ?? 0) * 2;
  const prestigeScore = (awayTeam?.prestige ?? 0) + (homeTeam?.prestige ?? 0);
  const recordScore = ((awayTeam?.wins ?? 0) + (homeTeam?.wins ?? 0)) * 10;
  const closenessScore = Math.max(0, 80 - Math.abs((awayTeam?.overallRating ?? 0) - (homeTeam?.overallRating ?? 0)) * 10);
  const rankingScore =
    awayStanding && homeStanding
      ? Math.max(0, 40 - (awayStanding.rank - 1) * 4) + Math.max(0, 40 - (homeStanding.rank - 1) * 4)
      : 0;
  const unbeatenBonus =
    awayTeam && homeTeam && awayTeam.losses === 0 && homeTeam.losses === 0 && (awayTeam.wins > 0 || homeTeam.wins > 0)
      ? 80
      : 0;

  return stageScore + ratingsScore + prestigeScore + recordScore + closenessScore + rankingScore + unbeatenBonus;
}

function buildSlateEntry(world: GameWorld, game: FullScheduleEntry): WeeklySlateEntry {
  return {
    ...game,
    reason: getImportanceReason(world, game)
  };
}

export function getWeeklySlate(world: GameWorld): WeeklySlate {
  const fullSchedule = getFullSchedule(world);
  let currentWeek = determineSlateWeek(world, fullSchedule);
  let rawGamesThisWeek = fullSchedule.filter((game) => game.week === currentWeek);

  if (rawGamesThisWeek.length === 0) {
    const projectedPlayoffGames = getProjectedPlayoffGames(world);

    if (projectedPlayoffGames.length > 0) {
      currentWeek = world.season.currentWeek;
      rawGamesThisWeek = projectedPlayoffGames;
    }
  }

  const gamesThisWeek = rawGamesThisWeek
    .map((game) => buildSlateEntry(world, game))
    .sort(
      (left, right) =>
        getImportanceScore(world, right) - getImportanceScore(world, left) ||
        left.awayTeamName.localeCompare(right.awayTeamName)
    );
  const gameOfTheWeek = gamesThisWeek[0] ?? null;
  const notableGames = gamesThisWeek.slice(1, 5);
  const completedThisWeek = gamesThisWeek.filter((game) => game.status === 'Final');

  return {
    currentWeek,
    gamesThisWeek,
    gameOfTheWeek,
    notableGames,
    completedThisWeek
  };
}
