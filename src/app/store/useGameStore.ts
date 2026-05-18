import { create } from 'zustand';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { canAdvanceWorldYear, simulateUnifiedSeason, simulateUnifiedWeek } from '../../core/world/simulateUnifiedWorld';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';
import { GameWorld } from '../../core/world/worldTypes';
import { loadLatestWorld, saveWorld } from '../../storage/saveGame';

export type LeagueLevel = 'highSchool' | 'college';

export type AppScreen =
  | 'dashboard'
  | 'roster'
  | 'teamProfile'
  | 'collegeTeamProfile'
  | 'playerProfile'
  | 'favorites'
  | 'prospects'
  | 'schedule'
  | 'rankings'
  | 'history';

export type TeamProfileTab = 'overview' | 'roster' | 'schedule' | 'history';
export type CollegeTeamProfileTab = 'overview' | 'roster' | 'schedule' | 'history';

const FAVORITES_STORAGE_KEY = 'fnd_favorite_player_ids';

function loadFavoritePlayerIds() {
  if (typeof localStorage === 'undefined') return [];

  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function saveFavoritePlayerIds(ids: string[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

export function resolveSelectedTeamId(world: GameWorld | null, selectedTeamId: string | null): string | null {
  if (!world || world.teams.length === 0) return null;
  if (selectedTeamId && world.teams.some((team) => team.id === selectedTeamId)) return selectedTeamId;
  return world.teams[0]?.id ?? null;
}

export function resolveSelectedCollegeTeamId(world: GameWorld | null, selectedCollegeTeamId: string | null): string | null {
  if (!world || !world.collegeTeams || world.collegeTeams.length === 0) return null;
  if (selectedCollegeTeamId && world.collegeTeams.some((team) => team.id === selectedCollegeTeamId)) return selectedCollegeTeamId;
  return world.collegeTeams[0]?.id ?? null;
}

export function resolveSelectedPlayerId(world: GameWorld | null, selectedPlayerId: string | null): string | null {
  if (!world) return null;

  const converted = (world.commitments ?? []).find((commitment) => commitment.playerId === selectedPlayerId && commitment.convertedToCollegePlayerId);
  if (converted?.convertedToCollegePlayerId) {
    const convertedCollegePlayerExists = (world.collegePlayers ?? []).some((player) => player.id === converted.convertedToCollegePlayerId);
    const convertedCollegeGraduateExists = (world.graduatedCollegePlayers ?? []).some((player) => player.id === converted.convertedToCollegePlayerId);

    if (convertedCollegePlayerExists || convertedCollegeGraduateExists) {
      return converted.convertedToCollegePlayerId;
    }
  }

  const allPlayers = [...world.players, ...(world.graduatedPlayers ?? []), ...(world.collegePlayers ?? []), ...(world.graduatedCollegePlayers ?? [])];

  if (selectedPlayerId && allPlayers.some((player) => player.id === selectedPlayerId)) return selectedPlayerId;

  return allPlayers[0]?.id ?? null;
}

interface GameStore {
  world: GameWorld | null;
  activeLeague: LeagueLevel;
  favoritePlayerIds: string[];
  selectedTeamId: string | null;
  selectedCollegeTeamId: string | null;
  selectedPlayerId: string | null;
  teamProfileTab: TeamProfileTab;
  collegeTeamProfileTab: CollegeTeamProfileTab;
  screen: AppScreen;
  previousScreenBeforeTeamProfile: AppScreen | null;
  previousScreenBeforeCollegeTeamProfile: AppScreen | null;
  previousScreenBeforePlayerProfile: AppScreen | null;
  error: string | null;
  setActiveLeague: (league: LeagueLevel) => void;
  setScreen: (screen: AppScreen) => void;
  selectTeam: (teamId: string) => void;
  selectCollegeTeam: (teamId: string) => void;
  setTeamProfileTab: (tab: TeamProfileTab) => void;
  setCollegeTeamProfileTab: (tab: CollegeTeamProfileTab) => void;
  toggleFavoritePlayer: (playerId: string) => void;
  openTeamProfile: (teamId: string, tab?: TeamProfileTab, returnScreen?: AppScreen) => void;
  closeTeamProfile: () => void;
  openCollegeTeamProfile: (teamId: string, tab?: CollegeTeamProfileTab, returnScreen?: AppScreen) => void;
  closeCollegeTeamProfile: () => void;
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
  favoritePlayerIds: loadFavoritePlayerIds(),
  selectedTeamId: null,
  selectedCollegeTeamId: null,
  selectedPlayerId: null,
  teamProfileTab: 'overview',
  collegeTeamProfileTab: 'overview',
  screen: 'dashboard',
  previousScreenBeforeTeamProfile: null,
  previousScreenBeforeCollegeTeamProfile: null,
  previousScreenBeforePlayerProfile: null,
  error: null,

  setActiveLeague: (activeLeague) =>
    set((state) => ({
      activeLeague,
      screen:
        activeLeague === 'college' && (state.screen === 'teamProfile' || state.screen === 'prospects')
          ? 'roster'
          : activeLeague === 'highSchool' && state.screen === 'collegeTeamProfile'
            ? 'roster'
            : state.screen,
      selectedTeamId: activeLeague === 'highSchool' ? resolveSelectedTeamId(state.world, state.selectedTeamId) : state.selectedTeamId,
      selectedCollegeTeamId: activeLeague === 'college' ? resolveSelectedCollegeTeamId(state.world, state.selectedCollegeTeamId) : state.selectedCollegeTeamId,
      previousScreenBeforeTeamProfile: activeLeague === 'college' ? null : state.previousScreenBeforeTeamProfile,
      previousScreenBeforeCollegeTeamProfile: activeLeague === 'highSchool' ? null : state.previousScreenBeforeCollegeTeamProfile
    })),

  setScreen: (screen) =>
    set((state) => ({
      screen,
      selectedTeamId:
        state.activeLeague === 'highSchool' &&
        (screen === 'teamProfile' || screen === 'roster' || screen === 'schedule' || screen === 'history')
          ? resolveSelectedTeamId(state.world, state.selectedTeamId)
          : state.selectedTeamId,
      selectedCollegeTeamId:
        state.activeLeague === 'college' &&
        (screen === 'collegeTeamProfile' || screen === 'roster' || screen === 'schedule' || screen === 'history')
          ? resolveSelectedCollegeTeamId(state.world, state.selectedCollegeTeamId)
          : state.selectedCollegeTeamId,
      selectedPlayerId: screen === 'playerProfile' ? resolveSelectedPlayerId(state.world, state.selectedPlayerId) : state.selectedPlayerId
    })),

  selectTeam: (teamId) =>
    set((state) => ({
      selectedTeamId: resolveSelectedTeamId(state.world, teamId)
    })),

  selectCollegeTeam: (teamId) =>
    set((state) => ({
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(state.world, teamId)
    })),

  setTeamProfileTab: (tab) => set({ teamProfileTab: tab }),
  setCollegeTeamProfileTab: (tab) => set({ collegeTeamProfileTab: tab }),

  toggleFavoritePlayer: (playerId) =>
    set((state) => {
      const exists = state.favoritePlayerIds.includes(playerId);
      const favoritePlayerIds = exists
        ? state.favoritePlayerIds.filter((id) => id !== playerId)
        : [...state.favoritePlayerIds, playerId];

      saveFavoritePlayerIds(favoritePlayerIds);
      return { favoritePlayerIds };
    }),

  openTeamProfile: (teamId, tab = 'overview', returnScreen) =>
    set((state) => {
      const selectedTeamId = resolveSelectedTeamId(state.world, teamId);
      const previousScreen = returnScreen ?? (state.screen === 'teamProfile' ? state.previousScreenBeforeTeamProfile ?? 'roster' : state.screen);

      return {
        screen: 'teamProfile',
        activeLeague: 'highSchool',
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

  openCollegeTeamProfile: (teamId, tab = 'overview', returnScreen) =>
    set((state) => {
      const selectedCollegeTeamId = resolveSelectedCollegeTeamId(state.world, teamId);
      const previousScreen =
        returnScreen ?? (state.screen === 'collegeTeamProfile' ? state.previousScreenBeforeCollegeTeamProfile ?? 'roster' : state.screen);

      return {
        screen: 'collegeTeamProfile',
        activeLeague: 'college',
        selectedCollegeTeamId,
        collegeTeamProfileTab: tab,
        previousScreenBeforeCollegeTeamProfile: previousScreen,
        error: null
      };
    }),

  closeCollegeTeamProfile: () =>
    set((state) => ({
      screen:
        state.previousScreenBeforeCollegeTeamProfile && state.previousScreenBeforeCollegeTeamProfile !== 'collegeTeamProfile'
          ? state.previousScreenBeforeCollegeTeamProfile
          : 'roster',
      previousScreenBeforeCollegeTeamProfile: null,
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(state.world, state.selectedCollegeTeamId)
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
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(world, null),
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      collegeTeamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforeCollegeTeamProfile: null,
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
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(world, null),
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      collegeTeamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforeCollegeTeamProfile: null,
      previousScreenBeforePlayerProfile: null,
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

    const updated = normalizeWorldState(simulateUnifiedWeek(normalizeWorldState(world)));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(updated, state.selectedCollegeTeamId),
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
      error: null
    }));

    await saveWorld(updated);
  },

  simFullSeason: async () => {
    const world = get().world;
    if (!world) return;

    const updated = normalizeWorldState(simulateUnifiedSeason(normalizeWorldState(world)));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(updated, state.selectedCollegeTeamId),
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
      error: null
    }));

    await saveWorld(updated);
  },

  advanceToNextSeason: async () => {
    const world = get().world;
    if (!world) return;

    if (!canAdvanceWorldYear(world)) {
      set({ error: 'Сначала закончи оба сезона этого года.' });
      return;
    }

    const updated = normalizeWorldState(advanceOffseason(normalizeWorldState(world)));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(updated, state.selectedCollegeTeamId),
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
      error: null
    }));

    await saveWorld(updated);
  }
}));
