import { create } from 'zustand';
import { advanceNFLToNextSeason, ensureNFLLayer, runNFLDraft, runNFLTrades } from '../../core/nfl/nflLayer';
import { NFLWorld } from '../../core/nfl/nflTypes';
import { advanceOffseason } from '../../core/offseason/advanceOffseason';
import { canAdvanceWorldYear, simulateUnifiedSeason, simulateUnifiedWeek } from '../../core/world/simulateUnifiedWorld';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';
import { GameWorld } from '../../core/world/worldTypes';
import { loadLatestWorld, saveWorld } from '../../storage/saveGame';

export type LeagueLevel = 'highSchool' | 'college' | 'nfl';

export type AppScreen =
  | 'dashboard'
  | 'roster'
  | 'teamProfile'
  | 'collegeTeamProfile'
  | 'nflTeamProfile'
  | 'playerProfile'
  | 'favorites'
  | 'prospects'
  | 'schedule'
  | 'rankings'
  | 'draft'
  | 'history';

export type TeamProfileTab = 'overview' | 'roster' | 'schedule' | 'history';
export type CollegeTeamProfileTab = 'overview' | 'roster' | 'schedule' | 'history';
export type NFLTeamProfileTab = 'overview' | 'roster' | 'schedule' | 'history' | 'trades';

const FAVORITES_STORAGE_KEY = 'fnd_favorite_player_ids';

function withNFL(world: GameWorld): GameWorld {
  return ensureNFLLayer(world);
}

function nflWorld(world: GameWorld | null): (GameWorld & NFLWorld) | null {
  return world ? (world as GameWorld & NFLWorld) : null;
}

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

export function resolveSelectedNFLTeamId(world: GameWorld | null, selectedNFLTeamId: string | null): string | null {
  const next = nflWorld(world);
  if (!next || !next.nflTeams || next.nflTeams.length === 0) return null;
  if (selectedNFLTeamId && next.nflTeams.some((team) => team.id === selectedNFLTeamId)) return selectedNFLTeamId;
  return next.nflTeams[0]?.id ?? null;
}

export function resolveSelectedPlayerId(world: GameWorld | null, selectedPlayerId: string | null): string | null {
  if (!world) return null;

  const next = nflWorld(world);
  const converted = (world.commitments ?? []).find((commitment) => commitment.playerId === selectedPlayerId && commitment.convertedToCollegePlayerId);
  if (converted?.convertedToCollegePlayerId) {
    const convertedCollegePlayerExists = (world.collegePlayers ?? []).some((player) => player.id === converted.convertedToCollegePlayerId);
    const convertedCollegeGraduateExists = (world.graduatedCollegePlayers ?? []).some((player) => player.id === converted.convertedToCollegePlayerId);

    if (convertedCollegePlayerExists || convertedCollegeGraduateExists) {
      return converted.convertedToCollegePlayerId;
    }
  }

  const allPlayers = [
    ...world.players,
    ...(world.graduatedPlayers ?? []),
    ...(world.collegePlayers ?? []),
    ...(world.graduatedCollegePlayers ?? []),
    ...(next?.nflPlayers ?? [])
  ];

  if (selectedPlayerId && allPlayers.some((player) => player.id === selectedPlayerId)) return selectedPlayerId;

  return allPlayers[0]?.id ?? null;
}

interface GameStore {
  world: GameWorld | null;
  activeLeague: LeagueLevel;
  favoritePlayerIds: string[];
  selectedTeamId: string | null;
  selectedCollegeTeamId: string | null;
  selectedNFLTeamId: string | null;
  selectedPlayerId: string | null;
  teamProfileTab: TeamProfileTab;
  collegeTeamProfileTab: CollegeTeamProfileTab;
  nflTeamProfileTab: NFLTeamProfileTab;
  screen: AppScreen;
  previousScreenBeforeTeamProfile: AppScreen | null;
  previousScreenBeforeCollegeTeamProfile: AppScreen | null;
  previousScreenBeforeNFLTeamProfile: AppScreen | null;
  previousScreenBeforePlayerProfile: AppScreen | null;
  error: string | null;
  setActiveLeague: (league: LeagueLevel) => void;
  setScreen: (screen: AppScreen) => void;
  selectTeam: (teamId: string) => void;
  selectCollegeTeam: (teamId: string) => void;
  selectNFLTeam: (teamId: string) => void;
  setTeamProfileTab: (tab: TeamProfileTab) => void;
  setCollegeTeamProfileTab: (tab: CollegeTeamProfileTab) => void;
  setNFLTeamProfileTab: (tab: NFLTeamProfileTab) => void;
  toggleFavoritePlayer: (playerId: string) => void;
  openTeamProfile: (teamId: string, tab?: TeamProfileTab, returnScreen?: AppScreen) => void;
  closeTeamProfile: () => void;
  openCollegeTeamProfile: (teamId: string, tab?: CollegeTeamProfileTab, returnScreen?: AppScreen) => void;
  closeCollegeTeamProfile: () => void;
  openNFLTeamProfile: (teamId: string, tab?: NFLTeamProfileTab, returnScreen?: AppScreen) => void;
  closeNFLTeamProfile: () => void;
  openPlayerProfile: (playerId: string, returnScreen?: AppScreen) => void;
  closePlayerProfile: () => void;
  newWorld: () => Promise<void>;
  continueWorld: () => Promise<void>;
  save: () => Promise<void>;
  simNextWeek: () => Promise<void>;
  simFullSeason: () => Promise<void>;
  advanceToNextSeason: () => Promise<void>;
  runDraft: () => Promise<void>;
  runTrades: () => Promise<void>;
}

const DEFAULT_SEED = 982451653;

export const useGameStore = create<GameStore>((set, get) => ({
  world: null,
  activeLeague: 'highSchool',
  favoritePlayerIds: loadFavoritePlayerIds(),
  selectedTeamId: null,
  selectedCollegeTeamId: null,
  selectedNFLTeamId: null,
  selectedPlayerId: null,
  teamProfileTab: 'overview',
  collegeTeamProfileTab: 'overview',
  nflTeamProfileTab: 'overview',
  screen: 'dashboard',
  previousScreenBeforeTeamProfile: null,
  previousScreenBeforeCollegeTeamProfile: null,
  previousScreenBeforeNFLTeamProfile: null,
  previousScreenBeforePlayerProfile: null,
  error: null,

  setActiveLeague: (activeLeague) =>
    set((state) => ({
      activeLeague,
      screen:
        activeLeague === 'college' && (state.screen === 'teamProfile' || state.screen === 'prospects' || state.screen === 'nflTeamProfile')
          ? 'roster'
          : activeLeague === 'highSchool' && (state.screen === 'collegeTeamProfile' || state.screen === 'nflTeamProfile' || state.screen === 'draft')
            ? 'roster'
            : activeLeague === 'nfl' && (state.screen === 'teamProfile' || state.screen === 'collegeTeamProfile' || state.screen === 'prospects')
              ? 'roster'
              : state.screen,
      selectedTeamId: activeLeague === 'highSchool' ? resolveSelectedTeamId(state.world, state.selectedTeamId) : state.selectedTeamId,
      selectedCollegeTeamId: activeLeague === 'college' ? resolveSelectedCollegeTeamId(state.world, state.selectedCollegeTeamId) : state.selectedCollegeTeamId,
      selectedNFLTeamId: activeLeague === 'nfl' ? resolveSelectedNFLTeamId(state.world, state.selectedNFLTeamId) : state.selectedNFLTeamId,
      previousScreenBeforeTeamProfile: activeLeague !== 'highSchool' ? null : state.previousScreenBeforeTeamProfile,
      previousScreenBeforeCollegeTeamProfile: activeLeague !== 'college' ? null : state.previousScreenBeforeCollegeTeamProfile,
      previousScreenBeforeNFLTeamProfile: activeLeague !== 'nfl' ? null : state.previousScreenBeforeNFLTeamProfile
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
        (screen === 'collegeTeamProfile' || screen === 'roster' || screen === 'schedule' || screen === 'history' || screen === 'draft')
          ? resolveSelectedCollegeTeamId(state.world, state.selectedCollegeTeamId)
          : state.selectedCollegeTeamId,
      selectedNFLTeamId:
        state.activeLeague === 'nfl' &&
        (screen === 'nflTeamProfile' || screen === 'roster' || screen === 'schedule' || screen === 'history' || screen === 'draft')
          ? resolveSelectedNFLTeamId(state.world, state.selectedNFLTeamId)
          : state.selectedNFLTeamId,
      selectedPlayerId: screen === 'playerProfile' ? resolveSelectedPlayerId(state.world, state.selectedPlayerId) : state.selectedPlayerId
    })),

  selectTeam: (teamId) => set((state) => ({ selectedTeamId: resolveSelectedTeamId(state.world, teamId) })),
  selectCollegeTeam: (teamId) => set((state) => ({ selectedCollegeTeamId: resolveSelectedCollegeTeamId(state.world, teamId) })),
  selectNFLTeam: (teamId) => set((state) => ({ selectedNFLTeamId: resolveSelectedNFLTeamId(state.world, teamId) })),

  setTeamProfileTab: (tab) => set({ teamProfileTab: tab }),
  setCollegeTeamProfileTab: (tab) => set({ collegeTeamProfileTab: tab }),
  setNFLTeamProfileTab: (tab) => set({ nflTeamProfileTab: tab }),

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

  openNFLTeamProfile: (teamId, tab = 'overview', returnScreen) =>
    set((state) => {
      const selectedNFLTeamId = resolveSelectedNFLTeamId(state.world, teamId);
      const previousScreen = returnScreen ?? (state.screen === 'nflTeamProfile' ? state.previousScreenBeforeNFLTeamProfile ?? 'roster' : state.screen);

      return {
        screen: 'nflTeamProfile',
        activeLeague: 'nfl',
        selectedNFLTeamId,
        nflTeamProfileTab: tab,
        previousScreenBeforeNFLTeamProfile: previousScreen,
        error: null
      };
    }),

  closeNFLTeamProfile: () =>
    set((state) => ({
      screen:
        state.previousScreenBeforeNFLTeamProfile && state.previousScreenBeforeNFLTeamProfile !== 'nflTeamProfile'
          ? state.previousScreenBeforeNFLTeamProfile
          : 'roster',
      previousScreenBeforeNFLTeamProfile: null,
      selectedNFLTeamId: resolveSelectedNFLTeamId(state.world, state.selectedNFLTeamId)
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
    const world = withNFL(normalizeWorldState(createWorld({ seed: DEFAULT_SEED })));

    set({
      world,
      activeLeague: 'highSchool',
      selectedTeamId: resolveSelectedTeamId(world, null),
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(world, null),
      selectedNFLTeamId: resolveSelectedNFLTeamId(world, null),
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      collegeTeamProfileTab: 'overview',
      nflTeamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforeCollegeTeamProfile: null,
      previousScreenBeforeNFLTeamProfile: null,
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

    const world = withNFL(normalizeWorldState(loaded));

    set({
      world,
      activeLeague: 'highSchool',
      selectedTeamId: resolveSelectedTeamId(world, null),
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(world, null),
      selectedNFLTeamId: resolveSelectedNFLTeamId(world, null),
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      collegeTeamProfileTab: 'overview',
      nflTeamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforeCollegeTeamProfile: null,
      previousScreenBeforeNFLTeamProfile: null,
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

    const updated = withNFL(normalizeWorldState(simulateUnifiedWeek(withNFL(normalizeWorldState(world)))));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(updated, state.selectedCollegeTeamId),
      selectedNFLTeamId: resolveSelectedNFLTeamId(updated, state.selectedNFLTeamId),
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
      error: null
    }));

    await saveWorld(updated);
  },

  simFullSeason: async () => {
    const world = get().world;
    if (!world) return;

    const updated = withNFL(normalizeWorldState(simulateUnifiedSeason(withNFL(normalizeWorldState(world)))));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(updated, state.selectedCollegeTeamId),
      selectedNFLTeamId: resolveSelectedNFLTeamId(updated, state.selectedNFLTeamId),
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
      error: null
    }));

    await saveWorld(updated);
  },

  advanceToNextSeason: async () => {
    const world = get().world;
    if (!world) return;

    if (!canAdvanceWorldYear(withNFL(world))) {
      set({ error: 'Сначала закончи школу, колледж и NFL сезон этого года.' });
      return;
    }

    const advanced = advanceOffseason(normalizeWorldState(withNFL(world)));
    const updated = withNFL(normalizeWorldState(advanceNFLToNextSeason(advanced)));

    set((state) => ({
      world: updated,
      selectedTeamId: resolveSelectedTeamId(updated, state.selectedTeamId),
      selectedCollegeTeamId: resolveSelectedCollegeTeamId(updated, state.selectedCollegeTeamId),
      selectedNFLTeamId: resolveSelectedNFLTeamId(updated, state.selectedNFLTeamId),
      selectedPlayerId: resolveSelectedPlayerId(updated, state.selectedPlayerId),
      error: null
    }));

    await saveWorld(updated);
  },

  runDraft: async () => {
    const world = get().world;
    if (!world) return;
    const updated = withNFL(normalizeWorldState(runNFLDraft(withNFL(world))));

    set((state) => ({
      world: updated,
      selectedNFLTeamId: resolveSelectedNFLTeamId(updated, state.selectedNFLTeamId),
      error: null
    }));

    await saveWorld(updated);
  },

  runTrades: async () => {
    const world = get().world;
    if (!world) return;
    const updated = withNFL(normalizeWorldState(runNFLTrades(withNFL(world))));

    set((state) => ({
      world: updated,
      selectedNFLTeamId: resolveSelectedNFLTeamId(updated, state.selectedNFLTeamId),
      error: null
    }));

    await saveWorld(updated);
  }
}));
