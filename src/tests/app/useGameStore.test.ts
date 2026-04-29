import { beforeEach, describe, expect, it } from 'vitest';
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
});
