import { beforeEach, describe, expect, it } from 'vitest';
import { navigationTabs } from '../../app/components/Layout';
import { scheduleFilters } from '../../app/screens/ScheduleScreen';
import { useGameStore, resolveSelectedTeamId } from '../../app/store/useGameStore';
import { createWorld } from '../../core/world/createWorld';

describe('useGameStore team profile navigation', () => {
  beforeEach(() => {
    useGameStore.setState({
      world: null,
      selectedTeamId: null,
      teamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
      error: null
    });
  });

  it('openTeamProfile sets selectedTeamId and teamProfileTab', () => {
    const world = createWorld({ seed: 990 });
    const targetTeamId = world.teams[3].id;

    useGameStore.setState({
      world,
      selectedTeamId: null,
      teamProfileTab: 'overview',
      screen: 'rankings',
      previousScreenBeforeTeamProfile: null,
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
      teamProfileTab: 'overview',
      screen: 'teamProfile',
      previousScreenBeforeTeamProfile: 'schedule',
      error: null
    });

    useGameStore.getState().closeTeamProfile();
    expect(useGameStore.getState().screen).toBe('schedule');

    useGameStore.setState({
      world,
      selectedTeamId: world.teams[2].id,
      teamProfileTab: 'overview',
      screen: 'teamProfile',
      previousScreenBeforeTeamProfile: null,
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
      teamProfileTab: 'overview',
      screen: 'dashboard',
      previousScreenBeforeTeamProfile: null,
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

  it('teams screen can open the team profile', () => {
    const world = createWorld({ seed: 993 });
    const targetTeamId = world.teams[5].id;

    useGameStore.setState({
      world,
      selectedTeamId: world.teams[0].id,
      teamProfileTab: 'overview',
      screen: 'roster',
      previousScreenBeforeTeamProfile: null,
      error: null
    });

    useGameStore.getState().openTeamProfile(targetTeamId, 'overview');

    expect(useGameStore.getState().screen).toBe('teamProfile');
    expect(useGameStore.getState().selectedTeamId).toBe(targetTeamId);
    expect(useGameStore.getState().previousScreenBeforeTeamProfile).toBe('roster');
  });

  it('schedule can open team profile on the schedule tab and close back to schedule', () => {
    const world = createWorld({ seed: 994 });
    const targetTeamId = world.teams[4].id;

    useGameStore.setState({
      world,
      selectedTeamId: world.teams[0].id,
      teamProfileTab: 'overview',
      screen: 'schedule',
      previousScreenBeforeTeamProfile: null,
      error: null
    });

    useGameStore.getState().openTeamProfile(targetTeamId, 'schedule', 'schedule');

    expect(useGameStore.getState().screen).toBe('teamProfile');
    expect(useGameStore.getState().teamProfileTab).toBe('schedule');
    expect(useGameStore.getState().previousScreenBeforeTeamProfile).toBe('schedule');

    useGameStore.getState().closeTeamProfile();

    expect(useGameStore.getState().screen).toBe('schedule');
  });

  it('navigation labels expose News and History without any Game Log wording', () => {
    expect(navigationTabs.some((tab) => /game log/i.test(tab.label))).toBe(false);
    expect(navigationTabs.some((tab) => tab.label === 'News')).toBe(true);
    expect(navigationTabs.some((tab) => tab.label === 'History')).toBe(true);
  });

  it('schedule filters are reduced to All Games and Completed', () => {
    expect(scheduleFilters).toEqual([
      { id: 'all', label: 'All Games' },
      { id: 'completed', label: 'Completed' }
    ]);
  });
});
