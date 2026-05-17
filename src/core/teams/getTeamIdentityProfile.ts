import { GameWorld } from '../world/worldTypes';
import { getTeamHistorySnapshot } from './getTeamHistorySnapshot';

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

function describeOffense(style: GameWorld['teams'][number]['offenseStyle']) {
  switch (style) {
    case 'passHeavy':
      return 'строит нападение вокруг квотербека и принимающих';
    case 'runHeavy':
      return 'любит давить соперника выносом';
    case 'spread':
      return 'растягивает защиту темпом и шириной поля';
    case 'powerRun':
      return 'играет через силовой вынос';
    default:
      return 'держит баланс между пасом и выносом';
  }
}

function describeDefense(style: GameWorld['teams'][number]['defenseStyle']) {
  switch (style) {
    case 'blitzHeavy':
      return 'часто отправляет блицы';
    case 'aggressive':
      return 'играет агрессивно и ищет ошибки';
    case 'conservative':
      return 'сдерживает большие розыгрыши';
    default:
      return 'держит дисциплину и структуру';
  }
}

function describeProgramState(world: GameWorld, teamId: string) {
  const team = world.teams.find((entry) => entry.id === teamId);
  if (!team) return 'Программа ещё ищет свою идентичность.';

  const history = getTeamHistorySnapshot(world, teamId);
  const titles = history.titlesCount;
  const playoffTrips = history.playoffAppearancesCount;

  if (titles > 0) {
    return `У программы уже есть титулы штата: ${titles}. Ожидания вокруг команды стали выше.`;
  }

  if (playoffTrips > 0) {
    return `Команда уже выходила в плей-офф: ${playoffTrips}. Теперь ей нужен следующий шаг.`;
  }

  if (team.wins > team.losses && team.wins > 0) {
    return 'Текущий сезон даёт импульс, и команда начинает верить в серьёзный рывок.';
  }

  return 'Программа только пишет первую главу и пытается стать проблемой для остального штата.';
}

export function getTeamIdentityProfile(world: GameWorld, teamId: string): TeamIdentityProfile {
  const team = world.teams.find((entry) => entry.id === teamId);

  if (!team) {
    return {
      teamId,
      programTier: 'местный андердог',
      description: 'Программа ещё ищет свою идентичность.'
    };
  }

  const programTier = getProgramTier(team.prestige, team.overallRating);
  const strengthClause =
    team.offenseRating >= team.defenseRating + 5
      ? 'Главное оружие команды — нападение.'
      : team.defenseRating >= team.offenseRating + 5
        ? 'Основа команды — защита.'
        : 'Команда держится на балансе состава.';

  return {
    teamId,
    programTier,
    description: `${team.shortName} ${describeOffense(team.offenseStyle)}, а в защите ${describeDefense(
      team.defenseStyle
    )}. ${strengthClause} ${describeProgramState(world, teamId)}`
  };
}
