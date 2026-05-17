import { GameWorld } from '../world/worldTypes';

export type ProgramTier =
  | 'местный андердог'
  | 'растущая программа'
  | 'претендент штата'
  | 'сила пятничных вечеров';

export interface TeamIdentityProfile {
  teamId: string;
  programTier: ProgramTier;
  description: string;
}

function getProgramTier(prestige: number, overall: number): ProgramTier {
  const programScore = prestige * 0.5 + overall * 0.5;

  if (programScore >= 78) return 'сила пятничных вечеров';
  if (programScore >= 68) return 'претендент штата';
  if (programScore >= 56) return 'растущая программа';
  return 'местный андердог';
}

export function getTeamIdentityProfile(world: GameWorld, teamId: string): TeamIdentityProfile {
  const team = world.teams.find((entry) => entry.id === teamId);

  if (!team) {
    return {
      teamId,
      programTier: 'местный андердог',
      description: ''
    };
  }

  return {
    teamId,
    programTier: getProgramTier(team.prestige, team.overallRating),
    description: ''
  };
}
