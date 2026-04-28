import { GameWorld, MatchStage, ScheduledGame } from '../world/worldTypes';

export interface TeamScheduleEntry {
  gameId: string;
  week: number;
  stage: MatchStage;
  opponentTeamId: string;
  opponentName: string;
  homeAway: 'Home' | 'Away';
  result: 'W' | 'L' | null;
  teamScore: number | null;
  opponentScore: number | null;
  score: string;
  summary: string;
}

function createScheduleEntry(world: GameWorld, teamId: string, game: ScheduledGame): TeamScheduleEntry | null {
  const isHome = game.homeTeamId === teamId;
  const isAway = game.awayTeamId === teamId;

  if (!isHome && !isAway) {
    return null;
  }

  const opponentTeamId = isHome ? game.awayTeamId : game.homeTeamId;
  const opponent = world.teams.find((team) => team.id === opponentTeamId);
  const teamScore = isHome ? game.homeScore : game.awayScore;
  const opponentScore = isHome ? game.awayScore : game.homeScore;
  const played = teamScore !== null && opponentScore !== null;

  return {
    gameId: game.id,
    week: game.week,
    stage: game.stage,
    opponentTeamId,
    opponentName: opponent?.shortName ?? 'Unknown Opponent',
    homeAway: isHome ? 'Home' : 'Away',
    result: game.winnerId ? (game.winnerId === teamId ? 'W' : 'L') : null,
    teamScore,
    opponentScore,
    score: played ? `${teamScore}-${opponentScore}` : 'TBD',
    summary: game.summary
  };
}

const STAGE_ORDER: Record<MatchStage, number> = {
  regular: 0,
  semifinal: 1,
  final: 2
};

export function getTeamSchedule(world: GameWorld, teamId: string): TeamScheduleEntry[] {
  const regularGames = world.season.schedule.flatMap((week) =>
    week.games
      .map((game) => createScheduleEntry(world, teamId, game))
      .filter((entry): entry is TeamScheduleEntry => entry !== null)
  );
  const playoffGames = world.season.playoffGames
    .map((game) => createScheduleEntry(world, teamId, game))
    .filter((entry): entry is TeamScheduleEntry => entry !== null);

  return [...regularGames, ...playoffGames].sort(
    (left, right) =>
      left.week - right.week ||
      STAGE_ORDER[left.stage] - STAGE_ORDER[right.stage] ||
      left.opponentName.localeCompare(right.opponentName)
  );
}
