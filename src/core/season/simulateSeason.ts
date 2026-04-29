import { recordSeasonHistory } from '../history/recordSeasonHistory';
import { makeId, SeededRng } from '../random/rng';
import { calculateStandings } from '../standings/calculateStandings';
import { simulateGame, PlayerGameUpdate } from '../games/simulateGame';
import { GameWorld, ScheduledGame } from '../world/worldTypes';

function cloneWorld(world: GameWorld): GameWorld {
  return structuredClone(world);
}

function syncSeasonPointers(world: GameWorld) {
  world.currentYear = world.season.year;
  world.currentWeek = world.season.currentWeek;
}

function addNews(world: GameWorld, rng: SeededRng, headline: string, body: string, week = world.season.currentWeek) {
  world.news.unshift({
    id: makeId('news', rng),
    year: world.season.year,
    week,
    headline,
    body
  });
}

function addSeasonLogEntry(
  world: GameWorld,
  rng: SeededRng,
  headline: string,
  body: string,
  gameId: string | null = null,
  week = world.season.currentWeek
) {
  world.season.seasonLog.unshift({
    id: makeId('history', rng),
    year: world.season.year,
    week,
    headline,
    body,
    gameId
  });
}

function updateStandings(world: GameWorld) {
  world.season.standings = calculateStandings(world.teams);
}

function applyPlayerUpdates(world: GameWorld, updates: PlayerGameUpdate[]) {
  updates.forEach((update) => {
    const player = world.players.find((item) => item.id === update.playerId);
    if (!player) return;

    const fields: Array<keyof typeof player.seasonStats> = [
      'passingYards',
      'rushingYards',
      'receivingYards',
      'tackles',
      'sacks',
      'touchdowns',
      'interceptions'
    ];

    fields.forEach((field) => {
      const value = update[field];
      if (!value) return;
      player.seasonStats[field] += value;
      player.careerStats[field] += value;
    });
  });
}

function applyRegularSeasonResult(world: GameWorld, game: ScheduledGame) {
  if (game.homeScore === null || game.awayScore === null) return;

  const home = world.teams.find((team) => team.id === game.homeTeamId)!;
  const away = world.teams.find((team) => team.id === game.awayTeamId)!;

  home.pointsFor += game.homeScore;
  home.pointsAgainst += game.awayScore;
  away.pointsFor += game.awayScore;
  away.pointsAgainst += game.homeScore;

  if (game.winnerId === home.id) {
    home.wins += 1;
    away.losses += 1;
  } else {
    away.wins += 1;
    home.losses += 1;
  }
}

function ensurePlayoffField(world: GameWorld) {
  if (world.season.playoffTeams.length > 0) return;
  updateStandings(world);
  world.season.playoffTeams = world.season.standings.slice(0, 4).map((entry) => entry.teamId);
}

function archiveTeamSeasons(world: GameWorld) {
  world.teams.forEach((team) => {
    const madePlayoffs = world.season.playoffTeams.includes(team.id);
    const wonTitle = team.id === world.season.championId;
    team.history.push({
      year: world.season.year,
      wins: team.wins,
      losses: team.losses,
      pointsFor: team.pointsFor,
      pointsAgainst: team.pointsAgainst,
      madePlayoffs,
      playoffAppearance: madePlayoffs,
      wonTitle,
      titleWon: wonTitle,
      note: wonTitle
        ? `${team.shortName} won the Texoma title.`
        : madePlayoffs
          ? `${team.shortName} reached the final four.`
          : `${team.shortName} finished ${team.wins}-${team.losses}.`
    });
  });
}

function simulatePlayoffRound(world: GameWorld, rng: SeededRng, games: ScheduledGame[], headline: string, historyHeadline: string) {
  games.forEach((game) => {
    const home = world.teams.find((team) => team.id === game.homeTeamId)!;
    const away = world.teams.find((team) => team.id === game.awayTeamId)!;
    const result = simulateGame({ game, home, away, players: world.players, coaches: world.coaches, rng });
    game.homeScore = result.game.homeScore;
    game.awayScore = result.game.awayScore;
    game.winnerId = result.game.winnerId;
    game.loserId = result.game.loserId;
    game.summary = result.game.summary;
    game.keyPlayers = result.game.keyPlayers;
    game.mvpPlayerId = result.game.mvpPlayerId;

    applyPlayerUpdates(world, result.playerUpdates);
    world.season.completedGames.push(game);
    world.season.playoffGames.push(game);
    addSeasonLogEntry(world, rng, historyHeadline, game.summary, game.id, game.week);
  });

  addNews(world, rng, headline, games[games.length - 1]?.summary ?? headline, games[0]?.week ?? world.season.currentWeek);
}

export function simulateWeek(input: GameWorld): GameWorld {
  const world = cloneWorld(input);
  const rng = new SeededRng(world.seed + world.season.year * 100 + world.season.currentWeek * 17);

  if (world.phase === 'offseason') {
    return world;
  }

  if (world.phase === 'regular') {
    const week = world.season.schedule[world.season.currentWeek];

    if (!week) {
      ensurePlayoffField(world);
      world.phase = 'playoffs';
      addNews(world, rng, 'Playoff field is set', 'The top four teams in Texoma are heading to the state semifinals.');
      addSeasonLogEntry(world, rng, 'Final four locked', 'The regular season is complete and the playoff field is set.');
      syncSeasonPointers(world);
      return world;
    }

    week.games.forEach((game, index) => {
      if (game.winnerId) return;

      const home = world.teams.find((team) => team.id === game.homeTeamId)!;
      const away = world.teams.find((team) => team.id === game.awayTeamId)!;
      const result = simulateGame({ game, home, away, players: world.players, coaches: world.coaches, rng });

      week.games[index] = result.game;
      applyRegularSeasonResult(world, result.game);
      applyPlayerUpdates(world, result.playerUpdates);
      world.season.completedGames.push(result.game);
    });

    world.season.currentWeek += 1;
    updateStandings(world);
    syncSeasonPointers(world);

    const leader = world.teams.find((team) => team.id === world.season.standings[0]?.teamId);
    const topGame =
      [...week.games]
        .filter((game) => game.homeScore !== null && game.awayScore !== null)
        .sort(
          (left, right) =>
            (right.homeScore ?? 0) +
            (right.awayScore ?? 0) -
            ((left.homeScore ?? 0) + (left.awayScore ?? 0))
        )[0] ?? week.games[0];

    addNews(
      world,
      rng,
      `Week ${week.week + 1} complete`,
      topGame.summary || `${leader?.shortName ?? 'Texoma'} moved through another Friday night slate.`
    );
    addSeasonLogEntry(
      world,
      rng,
      `Week ${week.week + 1} complete`,
      leader
        ? `${leader.shortName} leads the state at ${leader.wins}-${leader.losses}.`
        : 'The state race tightened after another full week.'
    );

    if (world.season.currentWeek >= world.season.regularSeasonWeeks) {
      ensurePlayoffField(world);
      world.phase = 'playoffs';
      addNews(world, rng, 'Playoff field is set', 'The regular season closed and the top four teams punched their playoff ticket.');
      addSeasonLogEntry(world, rng, 'Playoff field is set', 'Texoma now turns to semifinal football.');
    }

    return world;
  }

  ensurePlayoffField(world);
  const playoffTeams = world.season.playoffTeams.map((teamId) => world.teams.find((team) => team.id === teamId)!);
  const semifinalGames = world.season.playoffGames.filter((game) => game.stage === 'semifinal');
  const finalGame = world.season.playoffGames.find((game) => game.stage === 'final');

  if (semifinalGames.length === 0 && playoffTeams.length === 4) {
    const games: ScheduledGame[] = [
      {
        id: makeId('game', rng),
        stage: 'semifinal',
        week: world.season.currentWeek,
        homeTeamId: playoffTeams[0].id,
        awayTeamId: playoffTeams[3].id,
        homeScore: null,
        awayScore: null,
        winnerId: null,
        loserId: null,
        summary: '',
        keyPlayers: [],
        mvpPlayerId: null
      },
      {
        id: makeId('game', rng),
        stage: 'semifinal',
        week: world.season.currentWeek,
        homeTeamId: playoffTeams[1].id,
        awayTeamId: playoffTeams[2].id,
        homeScore: null,
        awayScore: null,
        winnerId: null,
        loserId: null,
        summary: '',
        keyPlayers: [],
        mvpPlayerId: null
      }
    ];

    simulatePlayoffRound(world, rng, games, 'Semifinals complete', 'Semifinal showdown');
    world.season.currentWeek += 1;
    syncSeasonPointers(world);
    return world;
  }

  if (!finalGame && semifinalGames.length === 2) {
    const finalRound: ScheduledGame[] = [
      {
        id: makeId('game', rng),
        stage: 'final',
        week: world.season.currentWeek,
        homeTeamId: semifinalGames[0].winnerId!,
        awayTeamId: semifinalGames[1].winnerId!,
        homeScore: null,
        awayScore: null,
        winnerId: null,
        loserId: null,
        summary: '',
        keyPlayers: [],
        mvpPlayerId: null
      }
    ];

    simulatePlayoffRound(world, rng, finalRound, 'State champion crowned', 'State final');
    const championship = finalRound[0];
    world.season.championId = championship.winnerId;
    world.season.championTeamId = championship.winnerId;
    world.phase = 'offseason';
    world.season.currentWeek += 1;
    syncSeasonPointers(world);
    archiveTeamSeasons(world);
    world.history = recordSeasonHistory(world);

    const champion = world.teams.find((team) => team.id === championship.winnerId);
    addNews(
      world,
      rng,
      'Living State champion crowned',
      `${champion?.shortName ?? 'A school'} finished the run with a win in the Texoma state final.`,
      championship.week
    );
    addSeasonLogEntry(world, rng, 'Champion crowned', championship.summary, championship.id, championship.week);
  }

  return world;
}

export function simulateSeason(input: GameWorld): GameWorld {
  let world = cloneWorld(input);
  let guard = 0;

  while (world.phase !== 'offseason' && guard < world.season.regularSeasonWeeks + 4) {
    world = simulateWeek(world);
    guard += 1;
  }

  return world;
}

export const simWeek = simulateWeek;
export const simSeason = simulateSeason;
