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
      error: null
    });
  });

  it('selectTeam updates selectedTeamId', () => {
    const world = createWorld({ seed: 990 });
    const targetTeamId = world.teams[3].id;

    useGameStore.setState({
      world,
      selectedTeamId: null,
      teamProfileTab: 'overview',
      screen: 'dashboard',
      error: null
    });

    useGameStore.getState().selectTeam(targetTeamId);

    expect(useGameStore.getState().selectedTeamId).toBe(targetTeamId);
  });

  it('selectedTeamId fallback chooses the first team', () => {
    const world = createWorld({ seed: 991 });

    useGameStore.setState({
      world,
      selectedTeamId: null,
      teamProfileTab: 'overview',
      screen: 'dashboard',
      error: null
    });

    useGameStore.getState().setScreen('teamProfile');

    expect(resolveSelectedTeamId(world, null)).toBe(world.teams[0].id);
    expect(useGameStore.getState().selectedTeamId).toBe(world.teams[0].id);
  });

  it('setTeamProfileTab changes the active team profile tab', () => {
    useGameStore.getState().setTeamProfileTab('history');

    expect(useGameStore.getState().teamProfileTab).toBe('history');
  });
});
