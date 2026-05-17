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
  regularSeasonWeeks = 7
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

function finishCollegeSeason(world: GameWorld, rng: SeededRng): GameWorld {
  const standings = calculateCollegeStandings(world.collegeTeams ?? [], world.collegePlayers ?? []);
  const first = standings[0];
  const second = standings[1];

  if (!first || !second || world.collegeSeason?.championTeamId) {
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

  const finalGame: CollegeScheduledGame = {
    id: makeId('college_final', rng),
    stage: 'final',
    week: world.collegeSeason?.regularSeasonWeeks ?? 7,
    homeTeamId: first.teamId,
    awayTeamId: second.teamId,
    homeScore: null,
    awayScore: null,
    winnerId: null,
    loserId: null,
    summary: '',
    mvpPlayerId: null
  };
  const simulated = simulateCollegeGame({ world, game: finalGame, rng });
  const nextTeams = applyCollegeResult(world.collegeTeams ?? [], simulated.game);
  const nextCollegePlayers = applyCollegePlayerUpdates(world.collegePlayers ?? [], simulated.playerUpdates);
  const champion = nextTeams.find((team) => team.id === simulated.game.winnerId) ?? null;
  const runnerUp = nextTeams.find((team) => team.id === simulated.game.loserId) ?? null;
  const homeScore = simulated.game.homeScore ?? 0;
  const awayScore = simulated.game.awayScore ?? 0;
  const finalScore =
    champion?.id === simulated.game.homeTeamId
      ? `${homeScore}-${awayScore}`
      : `${awayScore}-${homeScore}`;

  return {
    ...world,
    collegeTeams: nextTeams.map((team) => ({
      ...team,
      history: [
        ...team.history.filter((entry) => entry.year !== (world.collegeSeason?.year ?? world.currentYear)),
        {
          year: world.collegeSeason?.year ?? world.currentYear,
          wins: team.wins,
          losses: team.losses,
          pointsFor: team.pointsFor,
          pointsAgainst: team.pointsAgainst,
          wonTitle: team.id === champion?.id
        }
      ]
    })),
    collegePlayers: nextCollegePlayers,
    collegeSeason: world.collegeSeason
      ? {
          ...world.collegeSeason,
          currentWeek: world.collegeSeason.regularSeasonWeeks + 1,
          completedGames: [...world.collegeSeason.completedGames, simulated.game],
          standings: calculateCollegeStandings(nextTeams, nextCollegePlayers),
          championTeamId: champion?.id ?? null,
          championshipGameId: simulated.game.id
        }
      : world.collegeSeason,
    history: {
      ...world.history,
      collegeChampions: [
        ...(world.history.collegeChampions ?? []).filter((entry) => entry.year !== (world.collegeSeason?.year ?? world.currentYear)),
        {
          year: world.collegeSeason?.year ?? world.currentYear,
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

  const rng = new SeededRng(world.seed + collegeSeason.year * 91 + collegeSeason.currentWeek * 17 + collegeSeason.completedGames.length);
  let nextTeams = world.collegeTeams ?? [];
  let nextCollegePlayers = world.collegePlayers ?? [];
  const completedGames: CollegeScheduledGame[] = [];

  week.games.forEach((game) => {
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

  while (world.collegeSeason && !world.collegeSeason.championTeamId && guard < 30) {
    world = simulateCollegeWeek(world);
    guard += 1;
  }

  return world;
}
