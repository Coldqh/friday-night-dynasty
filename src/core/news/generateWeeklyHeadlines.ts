import { calculateProgramMomentum } from '../momentum/calculateProgramMomentum';
import { getWeeklySlate } from '../schedule/getWeeklySlate';
import { getWeekStakes } from '../stakes/getWeekStakes';
import { getPollPressure } from '../rankings/getPollPressure';
import { makeId, SeededRng } from '../random/rng';
import { GameWorld, ScheduledGame, StateHeadline, StateHeadlineType, TeamStanding } from '../world/worldTypes';

function createHeadline(
  world: GameWorld,
  rng: SeededRng,
  {
    type,
    title,
    body,
    teamIds = [],
    gameId = null,
    week = world.phase === 'offseason' ? Math.max(world.season.currentWeek - 1, 0) : world.season.currentWeek
  }: {
    type: StateHeadlineType;
    title: string;
    body: string;
    teamIds?: string[];
    gameId?: string | null;
    week?: number;
  }
): StateHeadline {
  return {
    id: makeId('headline', rng),
    year: world.season.year,
    week,
    type,
    title,
    body,
    teamIds,
    gameId
  };
}

function getTeamRecord(standing: TeamStanding | undefined) {
  return standing ? `${standing.wins}-${standing.losses}` : '0-0';
}

function getCompletedGamesForHeadlines(world: GameWorld): ScheduledGame[] {
  if (world.season.completedGames.length === 0) {
    return [];
  }

  const targetWeek = Math.max(0, world.phase === 'offseason' ? world.season.currentWeek - 1 : world.season.currentWeek - 1);
  const thisWeekGames = world.season.completedGames.filter((game) => game.week === targetWeek);

  if (thisWeekGames.length > 0) {
    return [...thisWeekGames].reverse();
  }

  return [...world.season.completedGames]
    .sort((left, right) => right.week - left.week)
    .slice(0, 4);
}

function isUpset(world: GameWorld, game: ScheduledGame) {
  const winner = world.teams.find((team) => team.id === game.winnerId);
  const loser = world.teams.find((team) => team.id === game.loserId);

  if (!winner || !loser) {
    return false;
  }

  return winner.overallRating + 5 < loser.overallRating || winner.prestige + 8 < loser.prestige;
}

function isBlowout(game: ScheduledGame) {
  if (game.homeScore === null || game.awayScore === null) {
    return false;
  }

  return Math.abs(game.homeScore - game.awayScore) >= 24;
}

function isCloseFinish(game: ScheduledGame) {
  if (game.homeScore === null || game.awayScore === null) {
    return false;
  }

  return Math.abs(game.homeScore - game.awayScore) <= 3;
}

function isHighScoring(game: ScheduledGame) {
  if (game.homeScore === null || game.awayScore === null) {
    return false;
  }

  return game.homeScore + game.awayScore >= 70;
}

function isStrongDefense(game: ScheduledGame) {
  if (game.homeScore === null || game.awayScore === null) {
    return false;
  }

  return game.homeScore <= 10 || game.awayScore <= 10;
}

function buildGameStoryHeadline(world: GameWorld, rng: SeededRng, game: ScheduledGame): StateHeadline | null {
  const homeTeam = world.teams.find((team) => team.id === game.homeTeamId);
  const awayTeam = world.teams.find((team) => team.id === game.awayTeamId);
  const winner = world.teams.find((team) => team.id === game.winnerId);
  const loser = world.teams.find((team) => team.id === game.loserId);

  if (!homeTeam || !awayTeam || !winner || !loser || game.homeScore === null || game.awayScore === null) {
    return null;
  }

  if (game.stage === 'final') {
    return createHeadline(world, rng, {
      type: 'champion',
      title: `${winner.shortName} берёт титул штата`,
      body: `${winner.shortName} обыграла ${loser.shortName} ${game.homeTeamId === winner.id ? game.homeScore : game.awayScore}-${game.homeTeamId === loser.id ? game.homeScore : game.awayScore}. ${game.summary}`,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isUpset(world, game)) {
    return createHeadline(world, rng, {
      type: 'upset',
      title: `Апсет: ${winner.shortName} удивляет матчем против ${loser.shortName}`,
      body: game.summary,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isBlowout(game)) {
    return createHeadline(world, rng, {
      type: 'blowout',
      title: `${winner.shortName} устраивает разгром`,
      body: game.summary,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isCloseFinish(game)) {
    return createHeadline(world, rng, {
      type: 'recap',
      title: `${winner.shortName} выдерживает концовку`,
      body: game.summary,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isHighScoring(game)) {
    return createHeadline(world, rng, {
      type: 'recap',
      title: `${homeTeam.shortName} и ${awayTeam.shortName} выдают результативный матч`,
      body: game.summary,
      teamIds: [homeTeam.id, awayTeam.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isStrongDefense(game)) {
    return createHeadline(world, rng, {
      type: 'general',
      title: `${winner.shortName} выигрывает через защиту`,
      body: game.summary,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  return createHeadline(world, rng, {
    type: 'recap',
    title: `${winner.shortName} делает шаг вперёд`,
    body: game.summary,
    teamIds: [winner.id, loser.id],
    gameId: game.id,
    week: game.week
  });
}

export function generateWeeklyHeadlines(world: GameWorld): StateHeadline[] {
  const rng = new SeededRng(world.seed + world.season.year * 37 + world.season.currentWeek * 19 + world.season.completedGames.length);
  const slate = getWeeklySlate(world);
  const weekStakes = getWeekStakes(world);
  const standings = world.season.standings;
  const pollPressure = getPollPressure(world);
  const momentumByTeam = world.teams.map((team) => ({
    team,
    momentum: calculateProgramMomentum(world, team.id)
  }));
  const headlines: StateHeadline[] = [];
  const seenKeys = new Set<string>();

  const pushHeadline = (headline: StateHeadline | null) => {
    if (!headline) {
      return;
    }

    const key = `${headline.type}:${headline.title}:${headline.gameId ?? 'none'}`;
    if (seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    headlines.push(headline);
  };

  if (slate.gameOfTheWeek) {
    const gameOfTheWeek = slate.gameOfTheWeek;
    const awayStanding = standings.find((entry) => entry.teamId === gameOfTheWeek.awayTeamId);
    const homeStanding = standings.find((entry) => entry.teamId === gameOfTheWeek.homeTeamId);
    const isFinal = gameOfTheWeek.status === 'Final';
    const headlineType: StateHeadlineType = isFinal
      ? gameOfTheWeek.isRivalry
        ? 'rivalry'
        : 'recap'
      : gameOfTheWeek.isRivalry
        ? 'rivalry'
        : gameOfTheWeek.stakes.includes('Undefeated Watch')
          ? 'undefeatedWatch'
          : gameOfTheWeek.stakes.includes('Playoff Race')
            ? 'playoffRace'
            : gameOfTheWeek.stakes.includes('Late-season Must Win')
              ? 'mustWin'
              : gameOfTheWeek.stakes.length > 0
                ? 'lateSeason'
                : 'preview';

    pushHeadline(
      createHeadline(world, rng, {
        type: headlineType,
        title: isFinal
          ? `${gameOfTheWeek.awayTeamName} и ${gameOfTheWeek.homeTeamName} сыграли матч недели`
          : gameOfTheWeek.isRivalry
            ? `Дерби недели: ${gameOfTheWeek.awayTeamName} против ${gameOfTheWeek.homeTeamName}`
            : `Матч недели: ${gameOfTheWeek.awayTeamName} против ${gameOfTheWeek.homeTeamName}`,
        body: isFinal
          ? gameOfTheWeek.summary || `${gameOfTheWeek.winnerName ?? 'Победитель'} закрыл матч со счётом ${gameOfTheWeek.score}.`
          : `${gameOfTheWeek.reason}. Баланс: ${getTeamRecord(awayStanding)} против ${getTeamRecord(homeStanding)}.${gameOfTheWeek.shortLabel ? ` ${gameOfTheWeek.shortLabel}.` : ''}`,
        teamIds: [gameOfTheWeek.awayTeamId, gameOfTheWeek.homeTeamId],
        gameId: gameOfTheWeek.gameId,
        week: gameOfTheWeek.week
      })
    );
  }

  if (world.phase === 'regular' && world.season.currentWeek >= Math.max(0, world.season.regularSeasonWeeks - 3)) {
    pushHeadline(
      createHeadline(world, rng, {
        type: 'lateSeason',
        title: `Давление концовки сезона растёт в ${world.state.name}`,
        body: weekStakes.summary,
        teamIds: []
      })
    );
  }

  getCompletedGamesForHeadlines(world)
    .map((game) => buildGameStoryHeadline(world, rng, game))
    .forEach((headline) => pushHeadline(headline));

  const undefeatedTeams = standings.filter((entry) => entry.wins > 0 && entry.losses === 0).slice(0, 2);
  if (world.phase === 'regular' && undefeatedTeams.length > 0) {
    const names = undefeatedTeams.map((entry) => entry.teamName).join(' и ');
    pushHeadline(
      createHeadline(world, rng, {
        type: 'undefeatedWatch',
        title: 'Погоня за идеальным сезоном',
        body: `${names} всё ещё идут без поражений.`,
        teamIds: undefeatedTeams.map((entry) => entry.teamId)
      })
    );
  }

  if (weekStakes.playoffRaceGames.length > 0) {
    const bubbleTeams = standings.slice(2, 6);
    pushHeadline(
      createHeadline(world, rng, {
        type: 'playoffRace',
        title: 'Гонка за плей-офф сжимается',
        body: `${bubbleTeams.map((entry) => `${entry.teamName} (${entry.wins}-${entry.losses})`).join(', ')} борются за место в четвёрке.`,
        teamIds: bubbleTeams.map((entry) => entry.teamId)
      })
    );
  }

  if (weekStakes.mustWinGames.length > 0) {
    const mustWinGame = weekStakes.mustWinGames[0];
    pushHeadline(
      createHeadline(world, rng, {
        type: 'mustWin',
        title: `${mustWinGame.awayTeamName} и ${mustWinGame.homeTeamName} играют матч с давлением`,
        body: `В неделе ${mustWinGame.week + 1} этот матч может изменить борьбу за плей-офф.`,
        teamIds: [mustWinGame.awayTeamId, mustWinGame.homeTeamId],
        gameId: mustWinGame.gameId,
        week: mustWinGame.week
      })
    );
  }

  if (weekStakes.rivalryGames.length > 0) {
    const rivalryGame = weekStakes.rivalryGames[0];
    pushHeadline(
      createHeadline(world, rng, {
        type: 'rivalry',
        title:
          rivalryGame.status === 'Final'
            ? `${rivalryGame.winnerName ?? rivalryGame.homeTeamName} выдерживает дерби`
            : `Дерби: ${rivalryGame.awayTeamName} против ${rivalryGame.homeTeamName}`,
        body:
          rivalryGame.status === 'Final'
            ? rivalryGame.summary || `${rivalryGame.winnerName ?? 'Команда'} выиграла дерби ${rivalryGame.score}.`
            : `Матч недели ${rivalryGame.week + 1} получает дополнительный вес из-за соперничества.`,
        teamIds: [rivalryGame.awayTeamId, rivalryGame.homeTeamId],
        gameId: rivalryGame.gameId,
        week: rivalryGame.week
      })
    );
  }

  if (world.phase === 'playoffs') {
    const contenders = standings.slice(0, 4);
    pushHeadline(
      createHeadline(world, rng, {
        type: 'playoff',
        title: 'Гонка за титул вышла на решающую стадию',
        body: `${contenders.map((entry) => entry.teamName).join(', ')} продолжают борьбу за корону штата.`,
        teamIds: contenders.map((entry) => entry.teamId)
      })
    );
  }

  const hottestProgram = [...momentumByTeam].sort((left, right) => right.momentum.score - left.momentum.score)[0];
  if (hottestProgram && hottestProgram.momentum.score >= 25) {
    pushHeadline(
      createHeadline(world, rng, {
        type: 'momentum',
        title: `${hottestProgram.team.shortName} набирает ход`,
        body: `${hottestProgram.team.shortName} усиливает позиции по ходу сезона.`,
        teamIds: [hottestProgram.team.id]
      })
    );
  }

  const coldProgram = [...momentumByTeam].sort((left, right) => left.momentum.score - right.momentum.score)[0];
  if (coldProgram && coldProgram.momentum.score <= -20) {
    pushHeadline(
      createHeadline(world, rng, {
        type: 'momentum',
        title: `${coldProgram.team.shortName} под давлением`,
        body: `${coldProgram.team.shortName} нужно быстро вернуть устойчивость.`,
        teamIds: [coldProgram.team.id]
      })
    );
  }

  const topMover = pollPressure.find((entry) => entry.movement === 'up' && entry.movementAmount >= 2);
  if (topMover) {
    pushHeadline(
      createHeadline(world, rng, {
        type: 'pollPressure',
        title: `${topMover.teamName} поднимается в рейтинге`,
        body: topMover.reason,
        teamIds: [topMover.teamId]
      })
    );
  }

  const pressureProgram = pollPressure.find(
    (entry) => entry.pressureLabel === 'Must Respond' || entry.pressureLabel === 'Playoff Bubble' || entry.pressureLabel === 'Outside Looking In'
  );
  if (pressureProgram) {
    pushHeadline(
      createHeadline(world, rng, {
        type: 'pollPressure',
        title: `${pressureProgram.teamName} нужно отвечать`,
        body: pressureProgram.reason,
        teamIds: [pressureProgram.teamId]
      })
    );
  }

  if (world.phase === 'offseason' && world.history.champions.length > 0) {
    const latestChampion = world.history.champions[world.history.champions.length - 1];
    pushHeadline(
      createHeadline(world, rng, {
        type: 'champion',
        title: `${latestChampion.championName} на вершине штата`,
        body: `${latestChampion.championName} обыграла ${latestChampion.runnerUpName} ${latestChampion.finalScore}. ${latestChampion.finalSummary}`,
        teamIds: [latestChampion.championId, latestChampion.runnerUpId].filter((entry): entry is string => Boolean(entry)),
        gameId: latestChampion.finalGameId,
        week: world.season.currentWeek
      })
    );
    pushHeadline(
      createHeadline(world, rng, {
        type: 'offseason',
        title: `Новое межсезонье в ${world.state.name}`,
        body: `Сезон ${world.season.year} завершён, программы готовят новые составы.`,
        teamIds: [],
        week: world.season.currentWeek
      })
    );
  }

  if (headlines.length === 0 && world.news.length > 0) {
    const latestNews = world.news[0];
    pushHeadline(
      createHeadline(world, rng, {
        type: 'general',
        title: latestNews.headline,
        body: latestNews.body,
        week: latestNews.week
      })
    );
  }

  return headlines.slice(0, 10);
}
