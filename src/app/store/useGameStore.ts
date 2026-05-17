import { create } from 'zustand';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { simulateSeason, simulateWeek } from '../../core/season/simulateSeason';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';
import { GameWorld } from '../../core/world/worldTypes';
import { loadLatestWorld, saveWorld } from '../../storage/saveGame';

export type LeagueLevel = 'highSchool' | 'college';

export type AppScreen =
  | 'dashboard'
  | 'roster'
  | 'teamProfile'
  | 'playerProfile'
  | 'schedule'
  | 'rankings'
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

export function resolveSelectedPlayerId(world: GameWorld | null, selectedPlayerId: string | null): string | null {
  if (!world) {
    return null;
  }

  const allPlayers = [...world.players, ...(world.graduatedPlayers ?? [])];

  if (selectedPlayerId && allPlayers.some((player) => player.id === selectedPlayerId)) {
    return selectedPlayerId;
  }

  return allPlayers[0]?.id ?? null;
}

interface GameStore {
  world: GameWorld | null;
  activeLeague: LeagueLevel;
  selectedTeamId: string | null;
  selectedPlayerId: string | null;
  teamProfileTab: TeamProfileTab;
  screen: AppScreen;
  previousScreenBeforeTeamProfile: AppScreen | null;
  previousScreenBeforePlayerProfile: AppScreen | null;
  error: string | null;
  setActiveLeague: (league: LeagueLevel) => void;
  setScreen: (screen: AppScreen) => void;
  selectTeam: (teamId: string) => void;
  setTeamProfileTab: (tab: TeamProfileTab) => void;
  openTeamProfile: (teamId: string, tab?: TeamProfileTab, returnScreen?: AppScreen) => void;
  closeTeamProfile: () => void;
  openPlayerProfile: (playerId: string, returnScreen?: AppScreen) => void;
  closePlayerProfile: () => void;
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
  activeLeague: 'highSchool',
  selectedTeamId: null,
  selectedPlayerId: null,
  teamProfileTab: 'overview',
  screen: 'dashboard',
  previousScreenBeforeTeamProfile: null,
  previousScreenBeforePlayerProfile: null,
  error: null,

  setActiveLeague: (activeLeague) =>
    set((state) => ({
      activeLeague,
      screen: state.screen === 'teamProfile' && activeLeague === 'college' ? 'roster' : state.screen,
      selectedTeamId: activeLeague === 'highSchool' ? resolveSelectedTeamId(state.world, state.selectedTeamId) : state.selectedTeamId,
      previousScreenBeforeTeamProfile: activeLeague === 'college' ? null : state.previousScreenBeforeTeamProfile
    })),

  setScreen: (screen) =>
    set((state) => ({
      screen,
      selectedTeamId:
        state.activeLeague === 'highSchool' &&
        (screen === 'teamProfile' || screen === 'roster' || screen === 'schedule' || screen === 'history')
          ? resolveSelectedTeamId(state.world, state.selectedTeamId)
          : state.selectedTeamId,
      selectedPlayerId: screen === 'playerProfile' ? resolveSelectedPlayerId(state.world, state.selectedPlayerId) : state.selectedPlayerId
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

  openPlayerProfile: (playerId, returnScreen) =>
    set((state) => ({
      screen: 'playerProfile',
      selectedPlayerId: resolveSelectedPlayerId(state.world, playerId),
      previousScreenBeforePlayerProfile:
        returnScreen ?? (state.screen === 'playerProfile' ? state.previousScreenBeforePlayerProfile ?? 'roster' : state.screen),
      error: null
    })),

  closePlayerProfile: () =>
    set((state) => ({
      screen:
        state.previousScreenBeforePlayerProfile && state.previousScreenBeforePlayerProfile !== 'playerProfile'
          ? state.previousScreenBeforePlayerProfile
          : 'roster',
      previousScreenBeforePlayerProfile: null,
      selectedPlayerId: resolveSelectedPlayerId(state.world, state.selectedPlayerId)
    })),

  newWorld: async () => {
    const world = normalizeWorldState(createWorld({ seed: DEFAULT_SEED }));

    set({
      world,
      activeLeague: 'highSchool',
      selectedTeamId: resolveSelectedTeamId(world, null),
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforePlayerProfile: null,
      error: null
    });

    await saveWorld(world);
  },

  continueWorld: async () => {
    const loaded = await loadLatestWorld();

    if (!loaded) {
      set({ error: 'Сохранение не найдено. Сначала создай новый мир.' });
      return;
    }

    const world = normalizeWorldState(loaded);

    set({
      world,
      activeLeague: 'highSchool',
      selectedTeamId: resolveSelectedTeamId(world, null),
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforePlayerProfile: null,
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
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
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
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
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
      set({ error: 'Сначала закончи текущий сезон.' });
      return;
    }

    const updated = normalizeWorldState(advanceOffseason(normalizeWorldState(world)));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
      error: null
    }));

    await saveWorld(updated);
  }
}));
