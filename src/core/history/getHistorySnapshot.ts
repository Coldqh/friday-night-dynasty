import { GameWorld, TitleGameHistoryEntry } from '../world/worldTypes';
import { getLeagueHistorySnapshot } from './getLeagueHistorySnapshot';

export interface HistorySnapshot {
  champions: GameWorld['history']['champions'];
  titleGames: TitleGameHistoryEntry[];
  totalSeasonsCompleted: number;
  latestChampion: GameWorld['history']['champions'][number] | null;
  latestTitleGame: TitleGameHistoryEntry | null;
}

export function getHistorySnapshot(world: GameWorld): HistorySnapshot {
  const snapshot = getLeagueHistorySnapshot(world);

  return {
    champions: snapshot.champions,
    titleGames: snapshot.titleGames,
    totalSeasonsCompleted: snapshot.totalSeasonsCompleted,
    latestChampion: snapshot.latestChampion,
    latestTitleGame: snapshot.latestTitleGame
  };
}
