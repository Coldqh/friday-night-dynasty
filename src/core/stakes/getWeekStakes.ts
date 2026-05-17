import { FullScheduleEntry, getFullSchedule } from '../schedule/getFullSchedule';
import { isRivalryGame } from '../rivalries/isRivalryGame';
import { GameWorld } from '../world/worldTypes';

export type WeekStakeLabel =
  | 'State Final'
  | 'Playoff Semifinal'
  | 'Rivalry Game'
  | 'Undefeated Watch'
  | 'Top-Four Showdown'
  | 'Playoff Race'
  | 'Late-season Must Win'
  | 'Evenly Matched Programs';

export interface WeekStakeGame extends FullScheduleEntry {
  isRivalry: boolean;
  stakes: WeekStakeLabel[];
  shortLabel: string | null;
  priorityScore: number;
}

export interface WeekStakes {
  currentWeek: number;
  gamesThisWeek: WeekStakeGame[];
  playoffRaceGames: WeekStakeGame[];
  mustWinGames: WeekStakeGame[];
  undefeatedWatchGames: WeekStakeGame[];
  rivalryGames: WeekStakeGame[];
  gameOfTheWeekStakes: WeekStakeLabel[];
  summary: string;
}

function determineStakeWeek(world: GameWorld, schedule: FullScheduleEntry[]) {
  if (schedule.length === 0) {
    return world.season.currentWeek;
  }

  if (world.phase === 'offseason') {
    return Math.max(...schedule.map((game) => game.week));
  }

  const currentWeekGames = schedule.filter((game) => game.week === world.season.currentWeek);
  if (currentWeekGames.length > 0) {
    return world.season.currentWeek;
  }

  if (world.phase === 'playoffs') {
    const playoffWeeks = schedule.filter((game) => game.stage !== 'regular').map((game) => game.week);
    if (playoffWeeks.length > 0) {
      return Math.max(...playoffWeeks);
    }
  }

  return Math.min(world.season.currentWeek, world.season.regularSeasonWeeks - 1);
}

function getProjectedStageLabel(stage: FullScheduleEntry['stage']) {
  return stage === 'final' ? 'State Final' : stage === 'semifinal' ? 'Semifinal' : 'Regular Season';
}

function createProjectedGame(
  world: GameWorld,
  {
    gameId,
    week,
    stage,
    awayTeamId,
    homeTeamId,
    summary
  }: {
    gameId: string;
    week: number;
    stage: FullScheduleEntry['stage'];
    awayTeamId: string;
    homeTeamId: string;
    summary: string;
  }
): FullScheduleEntry {
  const awayTeam = world.teams.find((team) => team.id === awayTeamId);
  const homeTeam = world.teams.find((team) => team.id === homeTeamId);

  return {
    gameId,
    week,
    stage,
    stageLabel: getProjectedStageLabel(stage),
    awayTeamId,
    awayTeamName: awayTeam?.shortName ?? 'Неизвестная команда',
    awayTeamContextLabel: awayTeam ? `${awayTeam.shortName} (${awayTeam.wins}-${awayTeam.losses}, общ ${awayTeam.overallRating})` : 'Неизвестная команда (0-0, общ --)',
    homeTeamId,
    homeTeamName: homeTeam?.shortName ?? 'Неизвестная команда',
    homeTeamContextLabel: homeTeam ? `${homeTeam.shortName} (${homeTeam.wins}-${homeTeam.losses}, общ ${homeTeam.overallRating})` : 'Неизвестная команда (0-0, общ --)',
    awayScore: null,
    homeScore: null,
    winnerId: null,
    winnerName: null,
    summary,
    score: '',
    status: 'Upcoming'
  };
}

function getProjectedPlayoffGames(world: GameWorld): FullScheduleEntry[] {
  if (world.phase !== 'playoffs') {
    return [];
  }

  const semifinalGames = world.season.playoffGames.filter((game) => game.stage === 'semifinal');
  const finalGame = world.season.playoffGames.find((game) => game.stage === 'final');

  if (semifinalGames.length === 0 && world.season.playoffTeams.length === 4) {
    return [
      createProjectedGame(world, {
        gameId: 'projected-semifinal-1',
        week: world.season.currentWeek,
        stage: 'semifinal',
        awayTeamId: world.season.playoffTeams[3],
        homeTeamId: world.season.playoffTeams[0],
        summary: 'Ожидаемый полуфинал Texoma.'
      }),
      createProjectedGame(world, {
        gameId: 'projected-semifinal-2',
        week: world.season.currentWeek,
        stage: 'semifinal',
        awayTeamId: world.season.playoffTeams[2],
        homeTeamId: world.season.playoffTeams[1],
        summary: 'Ожидаемый полуфинал Texoma.'
      })
    ];
  }

  if (!finalGame && semifinalGames.length === 2 && semifinalGames.every((game) => game.winnerId)) {
    return [
      createProjectedGame(world, {
        gameId: 'projected-state-final',
        week: world.season.currentWeek,
        stage: 'final',
        awayTeamId: semifinalGames[1].winnerId!,
        homeTeamId: semifinalGames[0].winnerId!,
        summary: 'Ожидаемый финал штата Texoma.'
      })
    ];
  }

  return [];
}

function getActiveWeekGames(world: GameWorld) {
  const fullSchedule = getFullSchedule(world);
  let currentWeek = determineStakeWeek(world, fullSchedule);
  let gamesThisWeek = fullSchedule.filter((game) => game.week === currentWeek);

  if (gamesThisWeek.length === 0) {
    const projectedPlayoffGames = getProjectedPlayoffGames(world);

    if (projectedPlayoffGames.length > 0) {
      currentWeek = world.season.currentWeek;
      gamesThisWeek = projectedPlayoffGames;
    }
  }

  return { currentWeek, gamesThisWeek };
}

function buildStakeLabels(world: GameWorld, game: FullScheduleEntry): WeekStakeLabel[] {
  const awayTeam = world.teams.find((team) => team.id === game.awayTeamId);
  const homeTeam = world.teams.find((team) => team.id === game.homeTeamId);
  const awayStanding = world.season.standings.find((entry) => entry.teamId === game.awayTeamId);
  const homeStanding = world.season.standings.find((entry) => entry.teamId === game.homeTeamId);
  const lateSeasonRegular =
    world.phase === 'regular' && world.season.currentWeek >= Math.max(0, world.season.regularSeasonWeeks - 3);
  const labels = new Set<WeekStakeLabel>();
  const bestRank = Math.min(awayStanding?.rank ?? 99, homeStanding?.rank ?? 99);
  const worstRank = Math.max(awayStanding?.rank ?? 99, homeStanding?.rank ?? 99);
  const overallGap = Math.abs((awayTeam?.overallRating ?? 0) - (homeTeam?.overallRating ?? 0));
  const unbeatenGame =
    ((awayTeam?.wins ?? 0) >= 2 || (homeTeam?.wins ?? 0) >= 2) &&
    ((awayTeam?.losses ?? 1) === 0 || (homeTeam?.losses ?? 1) === 0);

  if (game.stage === 'final') {
    labels.add('State Final');
  } else if (game.stage === 'semifinal') {
    labels.add('Playoff Semifinal');
  }

  if (isRivalryGame(world, game)) {
    labels.add('Rivalry Game');
  }

  if (unbeatenGame) {
    labels.add('Undefeated Watch');
  }

  if (bestRank <= 4 && worstRank <= 4) {
    labels.add('Top-Four Showdown');
  }

  if (lateSeasonRegular && bestRank <= 6 && worstRank <= 10) {
    labels.add('Playoff Race');
  }

  if (lateSeasonRegular && ([4, 5, 6, 7, 8].includes(awayStanding?.rank ?? -1) || [4, 5, 6, 7, 8].includes(homeStanding?.rank ?? -1))) {
    labels.add('Late-season Must Win');
  }

  if (overallGap <= 3) {
    labels.add('Evenly Matched Programs');
  }

  return [...labels];
}

function getPrimaryStakeLabel(stakes: WeekStakeLabel[]) {
  if (stakes.includes('State Final')) return 'State Final';
  if (stakes.includes('Playoff Semifinal')) return 'Playoff Semifinal';

  if (
    stakes.includes('Rivalry Game') &&
    (stakes.includes('Playoff Race') || stakes.includes('Late-season Must Win') || stakes.includes('Top-Four Showdown'))
  ) {
    return 'Rivalry with Playoff Pressure';
  }

  if (stakes.includes('Rivalry Game')) return 'Rivalry Game';
  if (stakes.includes('Undefeated Watch')) return 'Unbeaten Watch';
  if (stakes.includes('Playoff Race')) return 'Playoff Race';
  if (stakes.includes('Top-Four Showdown')) return 'Top-Four Showdown';
  if (stakes.includes('Evenly Matched Programs')) return 'Evenly Matched Programs';

  return stakes[0] ?? null;
}

function getPriorityScore(world: GameWorld, game: FullScheduleEntry, stakes: WeekStakeLabel[]) {
  const awayTeam = world.teams.find((team) => team.id === game.awayTeamId);
  const homeTeam = world.teams.find((team) => team.id === game.homeTeamId);
  const awayStanding = world.season.standings.find((entry) => entry.teamId === game.awayTeamId);
  const homeStanding = world.season.standings.find((entry) => entry.teamId === game.homeTeamId);
  const stakeBonus = stakes.reduce((sum, stake) => {
    switch (stake) {
      case 'State Final':
        return sum + 1000;
      case 'Playoff Semifinal':
        return sum + 700;
      case 'Rivalry Game':
        return sum + 240;
      case 'Undefeated Watch':
        return sum + 190;
      case 'Top-Four Showdown':
        return sum + 170;
      case 'Playoff Race':
        return sum + 150;
      case 'Late-season Must Win':
        return sum + 120;
      case 'Evenly Matched Programs':
        return sum + 70;
      default:
        return sum;
    }
  }, 0);
  const ratingsScore = (awayTeam?.overallRating ?? 0) * 2 + (homeTeam?.overallRating ?? 0) * 2;
  const prestigeScore = (awayTeam?.prestige ?? 0) + (homeTeam?.prestige ?? 0);
  const recordScore = ((awayTeam?.wins ?? 0) + (homeTeam?.wins ?? 0)) * 10;
  const closenessScore = Math.max(0, 80 - Math.abs((awayTeam?.overallRating ?? 0) - (homeTeam?.overallRating ?? 0)) * 10);
  const rankingScore =
    awayStanding && homeStanding
      ? Math.max(0, 42 - (awayStanding.rank - 1) * 4) + Math.max(0, 42 - (homeStanding.rank - 1) * 4)
      : 0;

  return stakeBonus + ratingsScore + prestigeScore + recordScore + closenessScore + rankingScore;
}

function buildStakeGame(world: GameWorld, game: FullScheduleEntry): WeekStakeGame {
  const stakes = buildStakeLabels(world, game);

  return {
    ...game,
    isRivalry: stakes.includes('Rivalry Game'),
    stakes,
    shortLabel: getPrimaryStakeLabel(stakes),
    priorityScore: getPriorityScore(world, game, stakes)
  };
}

function getSummary(world: GameWorld, gamesThisWeek: WeekStakeGame[]) {
  if (world.phase === 'offseason') {
    return 'Титульная гонка завершена. Команды уже смотрят в сторону нового цикла.';
  }

  if (gamesThisWeek.some((game) => game.stakes.includes('State Final'))) {
    return 'На кону титул штата.';
  }

  if (gamesThisWeek.some((game) => game.stakes.includes('Playoff Semifinal'))) {
    return 'Четыре лучшие команды борются за выход в финал штата.';
  }

  if (gamesThisWeek.some((game) => game.shortLabel === 'Rivalry with Playoff Pressure')) {
    return 'Дерби и давление плей-офф сошлись в одной неделе.';
  }

  if (gamesThisWeek.some((game) => game.stakes.includes('Rivalry Game'))) {
    return 'Неделю задают принципиальные матчи.';
  }

  if (gamesThisWeek.some((game) => game.stakes.includes('Playoff Race'))) {
    return 'Гонка за плей-офф становится плотнее.';
  }

  if (gamesThisWeek.some((game) => game.stakes.includes('Undefeated Watch'))) {
    return 'Несколько команд всё ещё держат сезон без поражений.';
  }

  return 'В штате собирается очередная футбольная пятница.';
}

export function getWeekStakes(world: GameWorld): WeekStakes {
  const { currentWeek, gamesThisWeek } = getActiveWeekGames(world);
  const annotatedGames = gamesThisWeek
    .map((game) => buildStakeGame(world, game))
    .sort(
      (left, right) =>
        right.priorityScore - left.priorityScore || left.awayTeamName.localeCompare(right.awayTeamName)
    );
  const topStakeGame = annotatedGames[0] ?? null;

  return {
    currentWeek,
    gamesThisWeek: annotatedGames,
    playoffRaceGames: annotatedGames.filter((game) => game.stakes.includes('Playoff Race')),
    mustWinGames: annotatedGames.filter((game) => game.stakes.includes('Late-season Must Win')),
    undefeatedWatchGames: annotatedGames.filter((game) => game.stakes.includes('Undefeated Watch')),
    rivalryGames: annotatedGames.filter((game) => game.stakes.includes('Rivalry Game')),
    gameOfTheWeekStakes: topStakeGame?.stakes ?? [],
    summary: getSummary(world, annotatedGames)
  };
}
