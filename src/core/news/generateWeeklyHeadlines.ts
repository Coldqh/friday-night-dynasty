import { getWeeklySlate } from '../schedule/getWeeklySlate';
import { getWeekStakes } from '../stakes/getWeekStakes';
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
      title: `${winner.shortName} captures the state title`,
      body: `${winner.shortName} beat ${loser.shortName} ${game.homeTeamId === winner.id ? game.homeScore : game.awayScore}-${game.homeTeamId === loser.id ? game.homeScore : game.awayScore}. ${game.summary}`,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isUpset(world, game)) {
    return createHeadline(world, rng, {
      type: 'upset',
      title: `Upset alert: ${winner.shortName} shocks ${loser.shortName}`,
      body: game.summary,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isBlowout(game)) {
    return createHeadline(world, rng, {
      type: 'blowout',
      title: `${winner.shortName} runs away with Friday night`,
      body: game.summary,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isCloseFinish(game)) {
    return createHeadline(world, rng, {
      type: 'recap',
      title: `${winner.shortName} survives a one-score finish`,
      body: game.summary,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isHighScoring(game)) {
    return createHeadline(world, rng, {
      type: 'recap',
      title: `${homeTeam.shortName} and ${awayTeam.shortName} light up the scoreboard`,
      body: game.summary,
      teamIds: [homeTeam.id, awayTeam.id],
      gameId: game.id,
      week: game.week
    });
  }

  if (isStrongDefense(game)) {
    return createHeadline(world, rng, {
      type: 'general',
      title: `${winner.shortName} puts on a defensive clinic`,
      body: game.summary,
      teamIds: [winner.id, loser.id],
      gameId: game.id,
      week: game.week
    });
  }

  return createHeadline(world, rng, {
    type: 'recap',
    title: `${winner.shortName} takes another step forward`,
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
          ? `${gameOfTheWeek.awayTeamName} at ${gameOfTheWeek.homeTeamName} lived up to the spotlight`
          : gameOfTheWeek.isRivalry
            ? `Rivalry week tension builds as ${gameOfTheWeek.awayTeamName} meets ${gameOfTheWeek.homeTeamName}`
            : `Game of the Week: ${gameOfTheWeek.awayTeamName} at ${gameOfTheWeek.homeTeamName}`,
        body: isFinal
          ? gameOfTheWeek.summary || `${gameOfTheWeek.winnerName ?? 'The winner'} closed the headline matchup ${gameOfTheWeek.score}.`
          : `${gameOfTheWeek.reason}. Records: ${getTeamRecord(awayStanding)} vs ${getTeamRecord(homeStanding)}.${gameOfTheWeek.shortLabel ? ` ${gameOfTheWeek.shortLabel}.` : ''}`,
        teamIds: [gameOfTheWeek.awayTeamId, gameOfTheWeek.homeTeamId],
        gameId: gameOfTheWeek.gameId,
        week: gameOfTheWeek.week
      })
    );
  }

  getCompletedGamesForHeadlines(world)
    .map((game) => buildGameStoryHeadline(world, rng, game))
    .forEach((headline) => pushHeadline(headline));

  const undefeatedTeams = standings.filter((entry) => entry.wins > 0 && entry.losses === 0).slice(0, 2);
  if (world.phase === 'regular' && undefeatedTeams.length > 0) {
    const names = undefeatedTeams.map((entry) => entry.teamName).join(' and ');
    pushHeadline(
      createHeadline(world, rng, {
        type: 'undefeatedWatch',
        title: 'Undefeated watch is on',
        body: `${names} still carry perfect records into the next Friday night slate.`,
        teamIds: undefeatedTeams.map((entry) => entry.teamId)
      })
    );
  }

  if (weekStakes.playoffRaceGames.length > 0) {
    const bubbleTeams = standings.slice(2, 6);
    pushHeadline(
      createHeadline(world, rng, {
        type: 'playoffRace',
        title: 'The playoff race is tightening',
        body: `${bubbleTeams.map((entry) => `${entry.teamName} (${entry.wins}-${entry.losses})`).join(', ')} are all fighting for the final four.`,
        teamIds: bubbleTeams.map((entry) => entry.teamId)
      })
    );
  }

  if (weekStakes.mustWinGames.length > 0) {
    const mustWinGame = weekStakes.mustWinGames[0];
    pushHeadline(
      createHeadline(world, rng, {
        type: 'mustWin',
        title: `${mustWinGame.awayTeamName} and ${mustWinGame.homeTeamName} face a must-win spotlight`,
        body: `${mustWinGame.shortLabel ?? 'Late-season Must Win'} pressure is hanging over this clash in Week ${mustWinGame.week + 1}.`,
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
        type: rivalryGame.status === 'Final' ? 'rivalry' : 'rivalry',
        title:
          rivalryGame.status === 'Final'
            ? `${rivalryGame.winnerName ?? rivalryGame.homeTeamName} survives rivalry heat`
            : `Rivalry heat is rising between ${rivalryGame.awayTeamName} and ${rivalryGame.homeTeamName}`,
        body:
          rivalryGame.status === 'Final'
            ? rivalryGame.summary || `${rivalryGame.winnerName ?? 'A program'} won a rivalry battle ${rivalryGame.score}.`
            : `${rivalryGame.shortLabel ?? 'Rivalry Game'} takes center stage in Week ${rivalryGame.week + 1}.`,
        teamIds: [rivalryGame.awayTeamId, rivalryGame.homeTeamId],
        gameId: rivalryGame.gameId,
        week: rivalryGame.week
      })
    );
  }

  if (world.phase === 'regular' && world.season.currentWeek >= Math.max(0, world.season.regularSeasonWeeks - 3)) {
    pushHeadline(
      createHeadline(world, rng, {
        type: 'lateSeason',
        title: `Late-season pressure is building across ${world.state.name}`,
        body: weekStakes.summary,
        teamIds: []
      })
    );
  }

  if (world.phase === 'playoffs') {
    const contenders = standings.slice(0, 4);
    pushHeadline(
      createHeadline(world, rng, {
        type: 'playoff',
        title: 'The state title race is down to the heavyweights',
        body: `${contenders.map((entry) => entry.teamName).join(', ')} are the programs still chasing the crown.`,
        teamIds: contenders.map((entry) => entry.teamId)
      })
    );
  }

  if (world.phase === 'offseason' && world.history.champions.length > 0) {
    const latestChampion = world.history.champions[world.history.champions.length - 1];
    pushHeadline(
      createHeadline(world, rng, {
        type: 'champion',
        title: `${latestChampion.championName} stands on top of the state`,
        body: `${latestChampion.championName} beat ${latestChampion.runnerUpName} ${latestChampion.finalScore}. ${latestChampion.finalSummary}`,
        teamIds: [latestChampion.championId, latestChampion.runnerUpId].filter((entry): entry is string => Boolean(entry)),
        gameId: latestChampion.finalGameId,
        week: world.season.currentWeek
      })
    );
    pushHeadline(
      createHeadline(world, rng, {
        type: 'offseason',
        title: `A new offseason begins in ${world.state.name}`,
        body: `The ${world.season.year} title chase is in the books, and every program now turns toward next year's roster reset.`,
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
