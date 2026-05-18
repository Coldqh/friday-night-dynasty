import { beforeEach, describe, expect, it } from 'vitest';
import { navigationTabs } from '../../app/components/Layout';
import { getDashboardStatusPills } from '../../app/screens/DashboardScreen';
import { historySections } from '../../app/screens/HistoryScreen';
import { scheduleFilters } from '../../app/screens/ScheduleScreen';
import { useGameStore, resolveSelectedTeamId } from '../../app/store/useGameStore';
import { createWorld } from '../../core/world/createWorld';

describe('useGameStore team profile navigation', () => {
  beforeEach(() => {
    useGameStore.setState({
      world: null,
      activeLeague: 'highSchool',
      favoritePlayerIds: [],
      selectedTeamId: null,
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforePlayerProfile: null,
      error: null
    });
  });

  it('openTeamProfile sets selectedTeamId and teamProfileTab', () => {
    const world = createWorld({ seed: 990 });
    const targetTeamId = world.teams[3].id;

    useGameStore.setState({
      world,
      selectedTeamId: null,
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      screen: 'rankings',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforePlayerProfile: null,
      error: null
    });

    useGameStore.getState().openTeamProfile(targetTeamId, 'history');

    expect(useGameStore.getState().screen).toBe('teamProfile');
    expect(useGameStore.getState().selectedTeamId).toBe(targetTeamId);
    expect(useGameStore.getState().teamProfileTab).toBe('history');
    expect(useGameStore.getState().previousScreenBeforeTeamProfile).toBe('rankings');
  });

  it('closeTeamProfile returns to the previous screen or teams screen', () => {
    const world = createWorld({ seed: 991 });

    useGameStore.setState({
      world,
      selectedTeamId: world.teams[1].id,
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      screen: 'teamProfile',
      previousScreenBeforeTeamProfile: 'schedule',
      previousScreenBeforePlayerProfile: null,
      error: null
    });

    useGameStore.getState().closeTeamProfile();
    expect(useGameStore.getState().screen).toBe('schedule');

    useGameStore.setState({
      world,
      selectedTeamId: world.teams[2].id,
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      screen: 'teamProfile',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforePlayerProfile: null,
      error: null
    });

    useGameStore.getState().closeTeamProfile();
    expect(useGameStore.getState().screen).toBe('roster');
  });

  it('selectedTeamId fallback chooses the first team', () => {
    const world = createWorld({ seed: 992 });

    useGameStore.setState({
      world,
      selectedTeamId: null,
      selectedPlayerId: null,
      teamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      previousScreenBeforePlayerProfile: null,
      error: null
    });

    useGameStore.getState().setScreen('roster');

    expect(resolveSelectedTeamId(world, null)).toBe(world.teams[0].id);
    expect(useGameStore.getState().selectedTeamId).toBe(world.teams[0].id);
  });

  it('teamProfileTab supports overview, roster, schedule and history', () => {
    const tabs = ['overview', 'roster', 'schedule', 'history'] as const;

    tabs.forEach((tab) => {
      useGameStore.getState().setTeamProfileTab(tab);
      expect(useGameStore.getState().teamProfileTab).toBe(tab);
    });
  });

  it('league toggle switches active league', () => {
    useGameStore.getState().setActiveLeague('college');
    expect(useGameStore.getState().activeLeague).toBe('college');

    useGameStore.getState().setActiveLeague('highSchool');
    expect(useGameStore.getState().activeLeague).toBe('highSchool');
  });

  it('favorites toggle adds and removes players', () => {
    useGameStore.getState().toggleFavoritePlayer('player-1');
    expect(useGameStore.getState().favoritePlayerIds).toEqual(['player-1']);

    useGameStore.getState().toggleFavoritePlayer('player-1');
    expect(useGameStore.getState().favoritePlayerIds).toEqual([]);
  });

  it('navigation labels expose only functional sections plus favorites', () => {
    expect(navigationTabs.map((tab) => tab.label)).toEqual(['Главная', 'Команды', 'Проспекты', 'Календарь', 'Таблица', 'Избранные', 'История']);
    expect(navigationTabs.some((tab) => /game log/i.test(tab.label))).toBe(false);
    expect(navigationTabs.some((tab) => tab.label === 'Новости')).toBe(false);
    expect(navigationTabs.some((tab) => tab.label === 'Выпускники')).toBe(false);
  });

  it('schedule filters are localized and keep only upcoming and completed scopes', () => {
    expect(scheduleFilters).toEqual([
      { id: 'all', label: 'Ближайшие' },
      { id: 'completed', label: 'Сыгранные' }
    ]);
  });

  it('dashboard status pills no longer expose Completed Games', () => {
    const pills = getDashboardStatusPills('регулярный сезон', 16);

    expect(pills).toEqual(['регулярный сезон', '16 команд']);
    expect(pills.some((pill) => /completed games/i.test(pill))).toBe(false);
    expect(pills.some((pill) => /сыгранных игр/i.test(pill))).toBe(false);
  });

  it('history sections stay clean and functional', () => {
    expect(historySections).toEqual(['История лиги', 'Чемпионы штата']);
    expect(historySections).not.toContain('State Finals');
    expect(historySections).not.toContain('League Timeline');
  });
});
