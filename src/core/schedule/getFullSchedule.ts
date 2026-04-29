import { GameWorld, MatchStage, ScheduledGame, Team } from '../world/worldTypes';

export type FullScheduleStatus = 'Upcoming' | 'Final';

export interface FullScheduleEntry {
  gameId: string;
  week: number;
  stage: MatchStage;
  stageLabel: 'Regular Season' | 'Semifinal' | 'State Final';
  awayTeamId: string;
  awayTeamName: string;
  homeTeamId: string;
  homeTeamName: string;
  awayScore: number | null;
  homeScore: number | null;
  winnerId: string | null;
  winnerName: string | null;
  summary: string;
  score: string;
  status: FullScheduleStatus;
}

const STAGE_ORDER: Record<MatchStage, number> = {
  regular: 0,
  semifinal: 1,
  final: 2
};

function getStageLabel(stage: MatchStage): FullScheduleEntry['stageLabel'] {
  switch (stage) {
    case 'semifinal':
      return 'Semifinal';
    case 'final':
      return 'State Final';
    default:
      return 'Regular Season';
  }
}

function getTeamName(team: Team | undefined) {
  return team?.shortName ?? 'Unknown Team';
}

function createFullScheduleEntry(world: GameWorld, game: ScheduledGame): FullScheduleEntry {
  const homeTeam = world.teams.find((team) => team.id === game.homeTeamId);
  const awayTeam = world.teams.find((team) => team.id === game.awayTeamId);
  const winnerName = game.winnerId ? getTeamName(world.teams.find((team) => team.id === game.winnerId)) : null;
  const played = game.homeScore !== null && game.awayScore !== null;

  return {
    gameId: game.id,
    week: game.week,
    stage: game.stage,
    stageLabel: getStageLabel(game.stage),
    awayTeamId: game.awayTeamId,
    awayTeamName: getTeamName(awayTeam),
    homeTeamId: game.homeTeamId,
    homeTeamName: getTeamName(homeTeam),
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    winnerId: game.winnerId,
    winnerName,
    summary: game.summary,
    score: played ? `${game.awayScore}-${game.homeScore}` : 'Upcoming',
    status: played ? 'Final' : 'Upcoming'
  };
}

export function getFullSchedule(world: GameWorld): FullScheduleEntry[] {
  const regularSeasonGames = world.season.schedule.flatMap((week) => week.games.map((game) => createFullScheduleEntry(world, game)));
  const playoffGames = world.season.playoffGames.map((game) => createFullScheduleEntry(world, game));

  return [...regularSeasonGames, ...playoffGames].sort(
    (left, right) =>
      left.week - right.week ||
      STAGE_ORDER[left.stage] - STAGE_ORDER[right.stage] ||
      left.awayTeamName.localeCompare(right.awayTeamName) ||
      left.homeTeamName.localeCompare(right.homeTeamName)
  );
}
