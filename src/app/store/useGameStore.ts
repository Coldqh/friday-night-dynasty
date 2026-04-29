import { create } from 'zustand';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { simulateSeason, simulateWeek } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';
import { GameWorld } from '../../core/world/worldTypes';
import { loadLatestWorld, saveWorld } from '../../storage/saveGame';

export type AppScreen =
  | 'dashboard'
  | 'roster'
  | 'teamProfile'
  | 'schedule'
  | 'rankings'
  | 'news'
  | 'history';

export type TeamProfileTab = 'overview' | 'roster' | 'schedule' | 'history';

export function resolveSelectedTeamId(world: GameWorld | null, selectedTeamId: string | null): string | null {
  if (!world || world.teams.length === 0) {
    return null;
  }

  if (selectedTeamId && world.teams.some((team) => team.id === selectedTeamId)) {
    return selectedTeamId;
  }

  return world.teams[0]?.id ?? null;
}

interface GameStore {
  world: GameWorld | null;
  selectedTeamId: string | null;
  teamProfileTab: TeamProfileTab;
  screen: AppScreen;
  previousScreenBeforeTeamProfile: AppScreen | null;
  error: string | null;
  setScreen: (screen: AppScreen) => void;
  selectTeam: (teamId: string) => void;
  setTeamProfileTab: (tab: TeamProfileTab) => void;
  openTeamProfile: (teamId: string, tab?: TeamProfileTab, returnScreen?: AppScreen) => void;
  closeTeamProfile: () => void;
  newWorld: () => Promise<void>;
  continueWorld: () => Promise<void>;
  save: () => Promise<void>;
  simNextWeek: () => Promise<void>;
  simFullSeason: () => Promise<void>;
  advanceToNextSeason: () => Promise<void>;
}

const DEFAULT_SEED = 982451653;

export const useGameStore = create<GameStore>((set, get) => ({
  world: null,
  selectedTeamId: null,
  teamProfileTab: 'overview',
  screen: 'dashboard',
  previousScreenBeforeTeamProfile: null,
  error: null,

  setScreen: (screen) =>
    set((state) => ({
      screen,
      selectedTeamId:
        screen === 'teamProfile' || screen === 'roster' || screen === 'schedule' || screen === 'history'
          ? resolveSelectedTeamId(state.world, state.selectedTeamId)
          : state.selectedTeamId
    })),

  selectTeam: (teamId) =>
    set((state) => ({
      selectedTeamId: resolveSelectedTeamId(state.world, teamId)
    })),

  setTeamProfileTab: (tab) => set({ teamProfileTab: tab }),

  openTeamProfile: (teamId, tab = 'overview', returnScreen) =>
    set((state) => {
      const selectedTeamId = resolveSelectedTeamId(state.world, teamId);
      const previousScreen =
        returnScreen ??
        (state.screen === 'teamProfile' ? state.previousScreenBeforeTeamProfile ?? 'roster' : state.screen);

      return {
        screen: 'teamProfile',
        selectedTeamId,
        teamProfileTab: tab,
        previousScreenBeforeTeamProfile: previousScreen,
        error: null
      };
    }),

  closeTeamProfile: () =>
    set((state) => ({
      screen:
        state.previousScreenBeforeTeamProfile && state.previousScreenBeforeTeamProfile !== 'teamProfile'
          ? state.previousScreenBeforeTeamProfile
          : 'roster',
      previousScreenBeforeTeamProfile: null,
      selectedTeamId: resolveSelectedTeamId(state.world, state.selectedTeamId)
    })),

  newWorld: async () => {
    const world = normalizeWorldState(createWorld({ seed: DEFAULT_SEED }));

    set({
      world,
      selectedTeamId: resolveSelectedTeamId(world, null),
      teamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      error: null
    });

    await saveWorld(world);
  },

  continueWorld: async () => {
    const loaded = await loadLatestWorld();

    if (!loaded) {
      set({ error: 'No saved world found. Create a new one first.' });
      return;
    }

    const world = normalizeWorldState(loaded);

    set({
      world,
      selectedTeamId: resolveSelectedTeamId(world, null),
      teamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      error: null
    });
  },

  save: async () => {
    const world = get().world;
    if (world) {
      await saveWorld(world);
    }
  },

  simNextWeek: async () => {
    const world = get().world;
    if (!world) {
      return;
    }

    const updated = normalizeWorldState(simulateWeek(normalizeWorldState(world)));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      error: null
    }));

    await saveWorld(updated);
  },

  simFullSeason: async () => {
    const world = get().world;
    if (!world) {
      return;
    }

    const updated = normalizeWorldState(simulateSeason(normalizeWorldState(world)));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      error: null
    }));

    await saveWorld(updated);
  },

  advanceToNextSeason: async () => {
    const world = get().world;
    if (!world) {
      return;
    }

    if (world.phase !== 'offseason' || world.season.championId === null) {
      set({ error: 'Finish the current season before advancing to the next year.' });
      return;
    }

    const updated = normalizeWorldState(advanceOffseason(normalizeWorldState(world)));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      error: null
    }));

    await saveWorld(updated);
  }
}));
