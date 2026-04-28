import { SeededRng, makeId } from '../random/rng';
import { simulateGame } from '../games/simulateGame';
import { calculateRankings } from '../rankings/calculateRankings';
import { recordSeasonHistory } from '../history/recordSeasonHistory';
import { GameResult, GameWorld, ScheduledGame } from '../world/worldTypes';
import { generateSchedule } from '../schedule/generateSchedule';

function cloneWorld(world: GameWorld): GameWorld {
  return structuredClone(world);
}

function resetTeamSeason(world: GameWorld) {
  world.teams.forEach((team) => {
    team.wins = 0;
    team.losses = 0;
    team.pointsFor = 0;
    team.pointsAgainst = 0;
  });
}

function applyResult(world: GameWorld, game: ScheduledGame) {
  if (!game.result) return;
  const home = world.teams.find((team) => team.id === game.homeTeamId)!;
  const away = world.teams.find((team) => team.id === game.awayTeamId)!;
  home.pointsFor += game.result.homeScore;
  home.pointsAgainst += game.result.awayScore;
  away.pointsFor += game.result.awayScore;
  away.pointsAgainst += game.result.homeScore;
  if (game.result.homeScore > game.result.awayScore) {
    home.wins += 1;
    away.losses += 1;
  } else {
    away.wins += 1;
    home.losses += 1;
  }
}

function winnerIdForGame(game: ScheduledGame & { result: GameResult }) {
  return game.result.homeScore > game.result.awayScore ? game.homeTeamId : game.awayTeamId;
}

export function simWeek(input: GameWorld): GameWorld {
  const world = cloneWorld(input);
  const rng = new SeededRng(world.seed + world.currentYear * 100 + world.currentWeek);

  if (world.phase === 'regular') {
    const week = world.season.schedule[world.currentWeek];
    if (!week) {
      world.phase = 'playoffs';
      world.news.unshift({ id: makeId('news', rng), year: world.currentYear, week: world.currentWeek, headline: 'Playoff field is set', body: 'Лучшие четыре команды штата выходят в плей-офф.' });
      return world;
    }

    week.games.forEach((game) => {
      if (game.result) return;
      const home = world.teams.find((team) => team.id === game.homeTeamId)!;
      const away = world.teams.find((team) => team.id === game.awayTeamId)!;
      game.result = simulateGame({ home, away, players: world.players, coaches: world.coaches, rng });
      applyResult(world, game);
    });

    world.news.unshift({ id: makeId('news', rng), year: world.currentYear, week: world.currentWeek, headline: `Week ${world.currentWeek + 1} is complete`, body: week.games[0]?.result?.summary ?? 'Неделя завершена.' });
    world.currentWeek += 1;
    return world;
  }

  if (world.phase === 'playoffs') {
    const topFour = calculateRankings(world).slice(0, 4).map((entry) => entry.team);
    const semi1: ScheduledGame = { id: makeId('game', rng), week: world.currentWeek, homeTeamId: topFour[0].id, awayTeamId: topFour[3].id, result: null };
    const semi2: ScheduledGame = { id: makeId('game', rng), week: world.currentWeek, homeTeamId: topFour[1].id, awayTeamId: topFour[2].id, result: null };
    [semi1, semi2].forEach((game) => {
      const home = world.teams.find((team) => team.id === game.homeTeamId)!;
      const away = world.teams.find((team) => team.id === game.awayTeamId)!;
      game.result = simulateGame({ home, away, players: world.players, coaches: world.coaches, rng });
    });
    const completedSemis = [semi1, semi2] as Array<ScheduledGame & { result: GameResult }>;
    const winners = completedSemis.map(winnerIdForGame);
    const finalGame: ScheduledGame = { id: makeId('game', rng), week: world.currentWeek + 1, homeTeamId: winners[0], awayTeamId: winners[1], result: null };
    finalGame.result = simulateGame({
      home: world.teams.find((team) => team.id === finalGame.homeTeamId)!,
      away: world.teams.find((team) => team.id === finalGame.awayTeamId)!,
      players: world.players,
      coaches: world.coaches,
      rng
    });
    const championId = winnerIdForGame(finalGame as ScheduledGame & { result: GameResult });
    world.season.playoffGames = [semi1, semi2, finalGame];
    world.season.championTeamId = championId;
    world.phase = 'offseason';
    world.history = recordSeasonHistory(world);
    world.news.unshift({ id: makeId('news', rng), year: world.currentYear, week: world.currentWeek, headline: 'State champion crowned', body: `${world.teams.find((team) => team.id === championId)!.shortName} wins the state title.` });
    return world;
  }

  return advanceOffseason(world);
}

function advanceOffseason(world: GameWorld): GameWorld {
  const rng = new SeededRng(world.seed + world.currentYear * 999);
  resetTeamSeason(world);
  world.currentYear += 1;
  world.currentWeek = 0;
  world.phase = 'regular';
  world.season = { schedule: generateSchedule({ rng, teams: world.teams, weeks: 10 }), playoffGames: [], championTeamId: null };
  world.news.unshift({ id: makeId('news', rng), year: world.currentYear, week: 0, headline: 'New season begins', body: 'Команды возвращаются на поле. Новая осень, новые надежды.' });
  return world;
}

export function simSeason(input: GameWorld): GameWorld {
  let world = cloneWorld(input);
  let guard = 0;
  while (world.phase !== 'offseason' && guard < 20) {
    world = simWeek(world);
    guard += 1;
  }
  return world;
}
