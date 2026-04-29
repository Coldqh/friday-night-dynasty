import { ChampionHistoryEntry, GameWorld, TitleGameHistoryEntry } from '../world/worldTypes';

export interface LeagueTimelineEntry {
  id: string;
  year: number;
  title: string;
  body: string;
  championId: string | null;
  runnerUpId: string | null;
  gameId: string | null;
}

export interface LeagueHistorySnapshot {
  champions: ChampionHistoryEntry[];
  titleGames: TitleGameHistoryEntry[];
  totalSeasonsCompleted: number;
  latestChampion: ChampionHistoryEntry | null;
  latestTitleGame: TitleGameHistoryEntry | null;
  timeline: LeagueTimelineEntry[];
}

function sortByYearDescending<T extends { year: number }>(entries: T[]): T[] {
  return [...entries].sort((left, right) => right.year - left.year);
}

export function getLeagueHistorySnapshot(world: GameWorld): LeagueHistorySnapshot {
  const champions = sortByYearDescending(world.history.champions);
  const titleGames = sortByYearDescending(world.history.titleGames);

  return {
    champions,
    titleGames,
    totalSeasonsCompleted: champions.length,
    latestChampion: champions[0] ?? null,
    latestTitleGame: titleGames[0] ?? null,
    timeline: champions.map((entry) => ({
      id: `league-history-${entry.year}`,
      year: entry.year,
      title: `${entry.championName} won the ${entry.year} state title`,
      body: `${entry.championName} beat ${entry.runnerUpName} ${entry.finalScore}. ${entry.finalSummary}`,
      championId: entry.championId,
      runnerUpId: entry.runnerUpId,
      gameId: entry.finalGameId
    }))
  };
}
