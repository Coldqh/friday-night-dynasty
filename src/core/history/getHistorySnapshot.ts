import { GameWorld, TitleGameHistoryEntry } from '../world/worldTypes';

function sortByYearDescending<T extends { year: number }>(entries: T[]): T[] {
  return [...entries].sort((left, right) => right.year - left.year);
}

export interface HistorySnapshot {
  champions: GameWorld['history']['champions'];
  titleGames: TitleGameHistoryEntry[];
}

export function getHistorySnapshot(world: GameWorld): HistorySnapshot {
  return {
    champions: sortByYearDescending(world.history.champions),
    titleGames: sortByYearDescending(world.history.titleGames)
  };
}
