import { GameWorld } from '../world/worldTypes';
import { getTeamHistorySnapshot } from './getTeamHistorySnapshot';

export type ProgramTier =
  | 'Local Underdog'
  | 'Rising Program'
  | 'State Contender'
  | 'Friday Night Powerhouse';

export interface TeamIdentityProfile {
  teamId: string;
  programTier: ProgramTier;
  description: string;
}

function getProgramTier(prestige: number, overall: number): ProgramTier {
  const programScore = prestige * 0.5 + overall * 0.5;

  if (programScore >= 78) return 'Friday Night Powerhouse';
  if (programScore >= 68) return 'State Contender';
  if (programScore >= 56) return 'Rising Program';
  return 'Local Underdog';
}

function describeOffense(style: GameWorld['teams'][number]['offenseStyle']) {
  switch (style) {
    case 'passHeavy':
      return 'leans on its quarterback and perimeter playmakers';
    case 'runHeavy':
      return 'wants to grind games out on the ground';
    case 'spread':
      return 'stretches defenses with tempo and spacing';
    case 'powerRun':
      return 'prefers a physical, downhill rushing attack';
    default:
      return 'tries to stay balanced and take what the defense gives';
  }
}

function describeDefense(style: GameWorld['teams'][number]['defenseStyle']) {
  switch (style) {
    case 'blitzHeavy':
      return 'bringing pressure from every angle';
    case 'aggressive':
      return 'attacking downhill and forcing mistakes';
    case 'conservative':
      return 'keeping the game in front and limiting explosives';
    default:
      return 'staying disciplined and structurally sound';
  }
}

function describeProgramState(world: GameWorld, teamId: string) {
  const team = world.teams.find((entry) => entry.id === teamId);
  if (!team) return 'This program is still searching for its first clear identity.';

  const history = getTeamHistorySnapshot(world, teamId);
  const titles = history.titlesCount;
  const playoffTrips = history.playoffAppearancesCount;

  if (titles > 0) {
    return `The program already owns ${titles} state title${titles === 1 ? '' : 's'} and carries real championship expectations.`;
  }

  if (playoffTrips > 0) {
    return `The program has already broken into the playoff picture ${playoffTrips} time${playoffTrips === 1 ? '' : 's'} and is trying to turn that into hardware.`;
  }

  if (team.wins > team.losses && team.wins > 0) {
    return 'This season has momentum, and the locker room believes it can push into the state conversation.';
  }

  return 'This program is still writing its first chapter and trying to become a Friday night problem for the rest of the state.';
}

export function getTeamIdentityProfile(world: GameWorld, teamId: string): TeamIdentityProfile {
  const team = world.teams.find((entry) => entry.id === teamId);

  if (!team) {
    return {
      teamId,
      programTier: 'Local Underdog',
      description: 'This program is still searching for its first clear identity.'
    };
  }

  const programTier = getProgramTier(team.prestige, team.overallRating);
  const strengthClause =
    team.offenseRating >= team.defenseRating + 5
      ? 'Its edge comes from an offense that can carry the room.'
      : team.defenseRating >= team.offenseRating + 5
        ? 'Its backbone is a defense that can keep every game tight.'
        : 'Its roster is shaped more by balance than by one overwhelming phase.';

  return {
    teamId,
    programTier,
    description: `${team.shortName} ${describeOffense(team.offenseStyle)} while ${describeDefense(
      team.defenseStyle
    )}. ${strengthClause} ${describeProgramState(world, teamId)}`
  };
}
