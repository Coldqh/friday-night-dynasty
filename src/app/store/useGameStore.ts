import { create } from 'zustand';
import { simulateSeason, simulateWeek } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';
import { GameWorld } from '../../core/world/worldTypes';
import { loadLatestWorld, saveWorld } from '../../storage/saveGame';

export type AppScreen = 'dashboard' | 'roster' | 'schedule' | 'rankings' | 'news' | 'history';

interface GameStore {
  world: GameWorld | null;
  selectedTeamId: string | null;
  screen: AppScreen;
  error: string | null;
  setScreen: (screen: AppScreen) => void;
  setSelectedTeamId: (teamId: string) => void;
  newWorld: () => Promise<void>;
  continueWorld: () => Promise<void>;
  save: () => Promise<void>;
  simNextWeek: () => Promise<void>;
  simFullSeason: () => Promise<void>;
}

const DEFAULT_SEED = 982451653;

export const useGameStore = create<GameStore>((set, get) => ({
  world: null,
  selectedTeamId: null,
  screen: 'dashboard',
  error: null,

  setScreen: (screen) => set({ screen }),
  setSelectedTeamId: (teamId) => set({ selectedTeamId: teamId }),

  newWorld: async () => {
    const world = createWorld({ seed: DEFAULT_SEED });
    set({
      world,
      selectedTeamId: world.teams[0]?.id ?? null,
      screen: 'dashboard',
      error: null
    });
    await saveWorld(world);
  },

  continueWorld: async () => {
    const loaded = await loadLatestWorld();

    if (!loaded) {
      set({ error: 'Сохранение не найдено. Создай новый мир.' });
      return;
    }

    set({
      world: loaded,
      selectedTeamId: loaded.teams[0]?.id ?? null,
      screen: 'dashboard',
      error: null
    });
  },

  save: async () => {
    const world = get().world;
    if (world) await saveWorld(world);
  },

  simNextWeek: async () => {
    const world = get().world;
    if (!world) return;

    const updated = simulateWeek(world);
    set({ world: updated });
    await saveWorld(updated);
  },

  simFullSeason: async () => {
    const world = get().world;
    if (!world) return;

    const updated = simulateSeason(world);
    set({ world: updated });
    await saveWorld(updated);
  }
}));
