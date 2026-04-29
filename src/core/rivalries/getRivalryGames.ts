import { getFullSchedule } from '../schedule/getFullSchedule';
import { GameWorld } from '../world/worldTypes';
import { isRivalryGame } from './isRivalryGame';

export interface RivalryGameEntry {
  gameId: string;
  week: number;
  stage: 'regular' | 'semifinal' | 'final';
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  isPlayed: boolean;
  score: string;
  status: 'Upcoming' | 'Final';
  winnerId: string | null;
  rivalryName: string;
  stakes: string;
}

function buildRivalryName(world: GameWorld, homeTeamId: string, awayTeamId: string) {
  const homeTeam = world.teams.find((team) => team.id === homeTeamId);
  const awayTeam = world.teams.find((team) => team.id === awayTeamId);

  if (homeTeam?.cityId && homeTeam.cityId === awayTeam?.cityId) {
    return `${homeTeam.cityName} City Rivalry`;
  }

  return `${awayTeam?.shortName ?? 'Unknown Team'} vs ${homeTeam?.shortName ?? 'Unknown Team'}`;
}

export function getRivalryGames(world: GameWorld): RivalryGameEntry[] {
  return getFullSchedule(world)
    .filter((game) => isRivalryGame(world, game))
    .map((game) => ({
      gameId: game.gameId,
      week: game.week,
      stage: game.stage,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeTeamName: game.homeTeamName,
      awayTeamName: game.awayTeamName,
      isPlayed: game.status === 'Final',
      score: game.score,
      status: game.status,
      winnerId: game.winnerId,
      rivalryName: buildRivalryName(world, game.homeTeamId, game.awayTeamId),
      stakes: game.status === 'Final' ? 'Rivalry result is in' : 'Rivalry Game'
    }));
}
