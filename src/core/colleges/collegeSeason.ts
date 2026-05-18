import { makeId, SeededRng } from '../random/rng';
import { CollegePlayer, CollegeScheduledGame, CollegeSeasonState, CollegeTeam, GameWorld } from '../world/worldTypes';
import { calculateCollegeStandings } from './collegeStandings';
import { generateCollegeSchedule } from './collegeSchedule';
import { getCollegeDefenseRating, getCollegeOffenseRating, getCollegeRosterStrength } from './collegeRatings';

function cloneWorld(world: GameWorld): GameWorld {
  return structuredClone(world);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getTeam(world: GameWorld, teamId: string) {
  return (world.collegeTeams ?? []).find((team) => team.id === teamId) ?? null;
}

function getRoster(world: GameWorld, teamId: string) {
  return (world.collegePlayers ?? []).filter((player) => player.collegeTeamId === teamId);
}

function pickMvp(roster: CollegePlayer[], rng: SeededRng) {
  if (roster.length === 0) {
    return null;
  }

  const sorted = [...roster].sort((left, right) => right.overall - left.overall || right.leadership - left.leadership);
  return sorted[rng.int(0, Math.min(4, sorted.length - 1))] ?? sorted[0] ?? null;
}

function updatePlayerStats(player: CollegePlayer, teamScore: number, allowedScore: number, rng: SeededRng): CollegePlayer {
  const isOffense = ['QB', 'RB', 'WR', 'TE'].includes(player.position);
  const isDefense = ['DL', 'LB', 'CB', 'S'].includes(player.position);
  const touchdowns = isOffense ? clamp(Math.round(teamScore / 17 + rng.int(0, 1)), 0, 5) : 0;
  const passingYards = player.position === 'QB' ? clamp(120 + teamScore * 5 + rng.int(-25, 60), 60, 420) : 0;
  const rushingYards = player.position === 'RB' ? clamp(40 + teamScore * 3 + rng.int(-10, 55), 5, 220) : 0;
  const receivingYards = ['WR', 'TE'].includes(player.position) ? clamp(30 + teamScore * 3 + rng.int(-10, 65), 5, 240) : 0;
  const tackles = isDefense ? clamp(4 + Math.round(allowedScore / 6) + rng.int(0, 6), 1, 18) : 0;
  const sacks = ['DL', 'LB'].includes(player.position) ? rng.int(0, 2) : 0;
  const interceptions = ['CB', 'S', 'LB'].includes(player.position) && rng.chance(0.18) ? 1 : 0;
  const add = {
    passingYards,
    rushingYards,
    receivingYards,
    tackles,
    sacks,
    touchdowns,
    interceptions
  };

  return {
    ...player,
    seasonStats: {
      passingYards: player.seasonStats.passingYards + add.passingYards,
      rushingYards: player.seasonStats.rushingYards + add.rushingYards,
      receivingYards: player.seasonStats.receivingYards + add.receivingYards,
      tackles: player.seasonStats.tackles + add.tackles,
      sacks: player.seasonStats.sacks + add.sacks,
      touchdowns: player.seasonStats.touchdowns + add.touchdowns,
      interceptions: player.seasonStats.interceptions + add.interceptions
    },
    careerStats: {
      passingYards: player.careerStats.passingYards + add.passingYards,
      rushingYards: player.careerStats.rushingYards + add.rushingYards,
      receivingYards: player.careerStats.receivingYards + add.receivingYards,
      tackles: player.careerStats.tackles + add.tackles,
      sacks: player.careerStats.sacks + add.sacks,
      touchdowns: player.careerStats.touchdowns + add.touchdowns,
      interceptions: player.careerStats.interceptions + add.interceptions
    }
  };
}

function simulateCollegeGame({
  world,
  game,
  rng
}: {
  world: GameWorld;
  game: CollegeScheduledGame;
  rng: SeededRng;
}): { game: CollegeScheduledGame; playerUpdates: CollegePlayer[] } {
  const home = getTeam(world, game.homeTeamId);
  const away = getTeam(world, game.awayTeamId);

  if (!home || !away) {
    return { game, playerUpdates: [] };
  }

  const homeRoster = getRoster(world, home.id);
  const awayRoster = getRoster(world, away.id);
  const homeOffense = getCollegeOffenseRating(home, world.collegePlayers ?? []);
  const awayOffense = getCollegeOffenseRating(away, world.collegePlayers ?? []);
  const homeDefense = getCollegeDefenseRating(home, world.collegePlayers ?? []);
  const awayDefense = getCollegeDefenseRating(away, world.collegePlayers ?? []);
  let homeScore = clamp(Math.round(17 + (homeOffense - awayDefense) * 0.35 + getCollegeRosterStrength(home, homeRoster) * 0.08 + rng.int(-7, 17)), 3, 63);
  let awayScore = clamp(Math.round(15 + (awayOffense - homeDefense) * 0.35 + getCollegeRosterStrength(away, awayRoster) * 0.08 + rng.int(-9, 16)), 0, 60);

  if (homeScore === awayScore) {
    if (rng.chance(0.55)) {
      homeScore += 3;
    } else {
      awayScore += 3;
    }
  }

  const homeWon = homeScore > awayScore;
  const winner = homeWon ? home : away;
  const loser = homeWon ? away : home;
  const winnerRoster = homeWon ? homeRoster : awayRoster;
  const mvp = pickMvp(winnerRoster, rng);
  const playerUpdates = [
    ...homeRoster.slice(0, 11).map((player) => updatePlayerStats(player, homeScore, awayScore, rng)),
    ...awayRoster.slice(0, 11).map((player) => updatePlayerStats(player, awayScore, homeScore, rng))
  ];

  return {
    game: {
      ...game,
      homeScore,
      awayScore,
      winnerId: winner.id,
      loserId: loser.id,
      summary: '',
      mvpPlayerId: mvp?.id ?? null
    },
    playerUpdates
  };
}

function applyCollegeResult(teams: CollegeTeam[], game: CollegeScheduledGame) {
  return teams.map((team) => {
    if (team.id !== game.homeTeamId && team.id !== game.awayTeamId) {
      return team;
    }

    const isHome = team.id === game.homeTeamId;
    const teamScore = isHome ? game.homeScore ?? 0 : game.awayScore ?? 0;
    const opponentScore = isHome ? game.awayScore ?? 0 : game.homeScore ?? 0;
    const won = game.winnerId === team.id;

    return {
      ...team,
      wins: team.wins + (won ? 1 : 0),
      losses: team.losses + (won ? 0 : 1),
      pointsFor: team.pointsFor + teamScore,
      pointsAgainst: team.pointsAgainst + opponentScore
    };
  });
}

function applyCollegePlayerUpdates(allPlayers: CollegePlayer[], updates: CollegePlayer[]) {
  const updateMap = new Map(updates.map((player) => [player.id, player]));

  return allPlayers.map((player) => updateMap.get(player.id) ?? player);
}

export function createCollegeSeason({
  world,
  rng,
  year,
  regularSeasonWeeks = 12
}: {
  world: GameWorld;
  rng: SeededRng;
  year: number;
  regularSeasonWeeks?: number;
}): CollegeSeasonState {
  const teams = (world.collegeTeams ?? []).map((team) => ({
    ...team,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0
  }));

  return {
    year,
    currentWeek: 0,
    regularSeasonWeeks,
    schedule: generateCollegeSchedule({ rng, teams, weeks: regularSeasonWeeks }),
    completedGames: [],
    standings: calculateCollegeStandings(teams, world.collegePlayers ?? []),
    championTeamId: null,
    championshipGameId: null,
    seasonLog: []
  };
}

function createPlayoffGame({
  rng,
  week,
  homeTeamId,
  awayTeamId,
  stage
}: {
  rng: SeededRng;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  stage: 'semifinal' | 'final';
}): CollegeScheduledGame {
  return {
    id: makeId(stage === 'final' ? 'college_title' : 'college_playoff', rng),
    stage,
    week,
    homeTeamId,
    awayTeamId,
    homeScore: null,
    awayScore: null,
    winnerId: null,
    loserId: null,
    summary: '',
    mvpPlayerId: null
  };
}

function getConferenceChampions(world: GameWorld, standings: ReturnType<typeof calculateCollegeStandings>) {
  const byConference = new Map<string, typeof standings[number]>();

  standings.forEach((standing) => {
    const team = (world.collegeTeams ?? []).find((entry) => entry.id === standing.teamId);
    const conference = team?.conference ?? 'Independent';
    const current = byConference.get(conference);

    if (!current || standing.rank < current.rank) {
      byConference.set(conference, standing);
    }
  });

  return [...byConference.values()].sort((left, right) => left.rank - right.rank);
}

function selectCollegePlayoffField(world: GameWorld, standings: ReturnType<typeof calculateCollegeStandings>) {
  const conferenceChampions = getConferenceChampions(world, standings).slice(0, 5);
  const championIds = new Set(conferenceChampions.map((entry) => entry.teamId));
  const atLarge = standings.filter((entry) => !championIds.has(entry.teamId)).slice(0, 7);
  const field = [...conferenceChampions, ...atLarge]
    .sort((left, right) => left.rank - right.rank)
    .slice(0, 12);

  return field.map((entry, index) => ({
    seed: index + 1,
    teamId: entry.teamId
  }));
}

function playCollegePlayoffRound({
  world,
  rng,
  games
}: {
  world: GameWorld;
  rng: SeededRng;
  games: CollegeScheduledGame[];
}) {
  let nextTeams = world.collegeTeams ?? [];
  let nextPlayers = world.collegePlayers ?? [];
  const completedGames: CollegeScheduledGame[] = [];

  games.forEach((game) => {
    const simulated = simulateCollegeGame({
      world: {
        ...world,
        collegeTeams: nextTeams,
        collegePlayers: nextPlayers
      },
      game,
      rng
    });

    completedGames.push(simulated.game);
    nextTeams = applyCollegeResult(nextTeams, simulated.game);
    nextPlayers = applyCollegePlayerUpdates(nextPlayers, simulated.playerUpdates);
  });

  return {
    teams: nextTeams,
    players: nextPlayers,
    completedGames
  };
}

function finishCollegeSeason(world: GameWorld, rng: SeededRng): GameWorld {
  const standings = calculateCollegeStandings(world.collegeTeams ?? [], world.collegePlayers ?? []);

  if (world.collegeSeason?.championTeamId) {
    return {
      ...world,
      collegeSeason: world.collegeSeason
        ? {
            ...world.collegeSeason,
            standings
          }
        : world.collegeSeason
    };
  }

  const field = selectCollegePlayoffField(world, standings);

  if (field.length < 2) {
    return world;
  }

  const teamBySeed = new Map(field.map((entry) => [entry.seed, entry.teamId]));
  let playoffWorld = world;
  const completedPlayoffGames: CollegeScheduledGame[] = [];

  const firstRound = [
    [5, 12],
    [6, 11],
    [7, 10],
    [8, 9]
  ]
    .filter(([homeSeed, awaySeed]) => teamBySeed.has(homeSeed) && teamBySeed.has(awaySeed))
    .map(([homeSeed, awaySeed]) =>
      createPlayoffGame({
        rng,
        week: (world.collegeSeason?.regularSeasonWeeks ?? 12),
        homeTeamId: teamBySeed.get(homeSeed)!,
        awayTeamId: teamBySeed.get(awaySeed)!,
        stage: 'semifinal'
      })
    );
  const firstRoundResult = playCollegePlayoffRound({ world: playoffWorld, rng, games: firstRound });
  completedPlayoffGames.push(...firstRoundResult.completedGames);
  playoffWorld = {
    ...playoffWorld,
    collegeTeams: firstRoundResult.teams,
    collegePlayers: firstRoundResult.players
  };

  const winnerOf = (game: CollegeScheduledGame) => game.winnerId ?? game.homeTeamId;
  const firstRoundWinners = firstRoundResult.completedGames.map(winnerOf);
  const quarterfinalMatches: Array<[number, string]> = [];

  [
    [1, firstRoundWinners[3]],
    [4, firstRoundWinners[0]],
    [2, firstRoundWinners[2]],
    [3, firstRoundWinners[1]]
  ].forEach(([seed, opponentTeamId]) => {
    if (typeof seed === 'number' && typeof opponentTeamId === 'string' && teamBySeed.has(seed)) {
      quarterfinalMatches.push([seed, opponentTeamId]);
    }
  });

  const quarterfinals = quarterfinalMatches.map(([seed, opponentTeamId]) =>
    createPlayoffGame({
      rng,
      week: (world.collegeSeason?.regularSeasonWeeks ?? 12) + 1,
      homeTeamId: teamBySeed.get(seed)!,
      awayTeamId: opponentTeamId,
      stage: 'semifinal'
    })
  );
  const quarterfinalResult = playCollegePlayoffRound({ world: playoffWorld, rng, games: quarterfinals });
  completedPlayoffGames.push(...quarterfinalResult.completedGames);
  playoffWorld = {
    ...playoffWorld,
    collegeTeams: quarterfinalResult.teams,
    collegePlayers: quarterfinalResult.players
  };

  const quarterfinalWinners = quarterfinalResult.completedGames.map(winnerOf);
  const semifinals = [
    [quarterfinalWinners[0], quarterfinalWinners[1]],
    [quarterfinalWinners[2], quarterfinalWinners[3]]
  ]
    .filter(([homeTeamId, awayTeamId]) => homeTeamId && awayTeamId)
    .map(([homeTeamId, awayTeamId]) =>
      createPlayoffGame({
        rng,
        week: (world.collegeSeason?.regularSeasonWeeks ?? 12) + 2,
        homeTeamId: homeTeamId!,
        awayTeamId: awayTeamId!,
        stage: 'semifinal'
      })
    );
  const semifinalResult = playCollegePlayoffRound({ world: playoffWorld, rng, games: semifinals });
  completedPlayoffGames.push(...semifinalResult.completedGames);
  playoffWorld = {
    ...playoffWorld,
    collegeTeams: semifinalResult.teams,
    collegePlayers: semifinalResult.players
  };

  const semifinalWinners = semifinalResult.completedGames.map(winnerOf);
  const finalGame = semifinalWinners[0] && semifinalWinners[1]
    ? createPlayoffGame({
        rng,
        week: (world.collegeSeason?.regularSeasonWeeks ?? 12) + 3,
        homeTeamId: semifinalWinners[0],
        awayTeamId: semifinalWinners[1],
        stage: 'final'
      })
    : null;

  const finalResult = finalGame ? playCollegePlayoffRound({ world: playoffWorld, rng, games: [finalGame] }) : null;

  if (finalResult) {
    completedPlayoffGames.push(...finalResult.completedGames);
    playoffWorld = {
      ...playoffWorld,
      collegeTeams: finalResult.teams,
      collegePlayers: finalResult.players
    };
  }

  const championshipGame = finalResult?.completedGames[0] ?? completedPlayoffGames[completedPlayoffGames.length - 1];
  const champion = (playoffWorld.collegeTeams ?? []).find((team) => team.id === championshipGame?.winnerId) ?? null;
  const runnerUp = (playoffWorld.collegeTeams ?? []).find((team) => team.id === championshipGame?.loserId) ?? null;
  const homeScore = championshipGame?.homeScore ?? 0;
  const awayScore = championshipGame?.awayScore ?? 0;
  const finalScore =
    champion?.id === championshipGame?.homeTeamId
      ? `${homeScore}-${awayScore}`
      : `${awayScore}-${homeScore}`;
  const seasonYear = world.collegeSeason?.year ?? world.currentYear;

  return {
    ...playoffWorld,
    collegeTeams: (playoffWorld.collegeTeams ?? []).map((team) => ({
      ...team,
      history: [
        ...team.history.filter((entry) => entry.year !== seasonYear),
        {
          year: seasonYear,
          wins: team.wins,
          losses: team.losses,
          pointsFor: team.pointsFor,
          pointsAgainst: team.pointsAgainst,
          wonTitle: team.id === champion?.id
        }
      ]
    })),
    collegeSeason: world.collegeSeason
      ? {
          ...world.collegeSeason,
          currentWeek: world.collegeSeason.regularSeasonWeeks + 4,
          completedGames: [
            ...world.collegeSeason.completedGames,
            ...completedPlayoffGames
          ],
          standings: calculateCollegeStandings(playoffWorld.collegeTeams ?? [], playoffWorld.collegePlayers ?? []),
          championTeamId: champion?.id ?? null,
          championshipGameId: championshipGame?.id ?? null,
          seasonLog: [
            ...world.collegeSeason.seasonLog,
            {
              id: makeId('college_playoff_log', rng),
              year: seasonYear,
              week: world.collegeSeason.regularSeasonWeeks,
              headline: 'Плей-офф',
              body: `Участников: ${field.length}`,
              gameId: null
            }
          ]
        }
      : world.collegeSeason,
    history: {
      ...world.history,
      collegeChampions: [
        ...(world.history.collegeChampions ?? []).filter((entry) => entry.year !== seasonYear),
        {
          year: seasonYear,
          championTeamId: champion?.id ?? 'unknown',
          championName: champion?.shortName ?? '—',
          runnerUpTeamId: runnerUp?.id ?? null,
          runnerUpName: runnerUp?.shortName ?? null,
          finalScore
        }
      ]
    }
  };
}

export function simulateCollegeWeek(input: GameWorld): GameWorld {
  const world = cloneWorld(input);
  const collegeSeason = world.collegeSeason;

  if (!collegeSeason || collegeSeason.championTeamId) {
    return world;
  }

  const week = collegeSeason.schedule.find((entry) => entry.week === collegeSeason.currentWeek);

  if (!week) {
    return finishCollegeSeason(world, new SeededRng(world.seed + collegeSeason.year * 91 + collegeSeason.currentWeek * 17));
  }

  const completedGameIds = new Set(collegeSeason.completedGames.map((game) => game.id));
  const unsimulatedGames = week.games.filter((game) => !completedGameIds.has(game.id));

  if (unsimulatedGames.length === 0) {
    const skippedWeekWorld: GameWorld = {
      ...world,
      collegeSeason: {
        ...collegeSeason,
        currentWeek: collegeSeason.currentWeek + 1,
        standings: calculateCollegeStandings(world.collegeTeams ?? [], world.collegePlayers ?? [])
      }
    };

    if (skippedWeekWorld.collegeSeason && skippedWeekWorld.collegeSeason.currentWeek >= skippedWeekWorld.collegeSeason.regularSeasonWeeks) {
      return finishCollegeSeason(skippedWeekWorld, new SeededRng(world.seed + collegeSeason.year * 91 + collegeSeason.currentWeek * 17));
    }

    return skippedWeekWorld;
  }

  const rng = new SeededRng(world.seed + collegeSeason.year * 91 + collegeSeason.currentWeek * 17 + collegeSeason.completedGames.length);
  let nextTeams = world.collegeTeams ?? [];
  let nextCollegePlayers = world.collegePlayers ?? [];
  const completedGames: CollegeScheduledGame[] = [];

  unsimulatedGames.forEach((game) => {
    const simulated = simulateCollegeGame({
      world: {
        ...world,
        collegeTeams: nextTeams,
        collegePlayers: nextCollegePlayers
      },
      game,
      rng
    });

    completedGames.push(simulated.game);
    nextTeams = applyCollegeResult(nextTeams, simulated.game);
    nextCollegePlayers = applyCollegePlayerUpdates(nextCollegePlayers, simulated.playerUpdates);
  });

  const updated: GameWorld = {
    ...world,
    collegeTeams: nextTeams,
    collegePlayers: nextCollegePlayers,
    collegeSeason: {
      ...collegeSeason,
      currentWeek: collegeSeason.currentWeek + 1,
      completedGames: [...collegeSeason.completedGames, ...completedGames],
      standings: calculateCollegeStandings(nextTeams, nextCollegePlayers)
    }
  };

  if (updated.collegeSeason && updated.collegeSeason.currentWeek >= updated.collegeSeason.regularSeasonWeeks) {
    return finishCollegeSeason(updated, rng);
  }

  return updated;
}

export function simulateCollegeSeason(input: GameWorld): GameWorld {
  let world = cloneWorld(input);
  let guard = 0;

  while (world.collegeSeason && !world.collegeSeason.championTeamId && guard < 40) {
    world = simulateCollegeWeek(world);
    guard += 1;
  }

  return world;
}
