import { firstNames, lastNames } from '../../content/names';
import { emptyStats } from '../players/generatePlayers';
import { makeId, SeededRng } from '../random/rng';
import { CollegeGraduate, GameWorld, Position } from '../world/worldTypes';
import { nflTeamSeeds } from './nflData';
import { NFLDraftPick, NFLScheduledGame, NFLSeasonState, NFLStanding, NFLTeam, NFLTrade, NFLWorld, NFLPlayer } from './nflTypes';

type WorldWithNFL = GameWorld & NFLWorld;

const NFL_ROSTER_PLAN: Array<[Position, number]> = [
  ['QB', 3],
  ['RB', 4],
  ['WR', 7],
  ['TE', 3],
  ['OL', 9],
  ['DL', 8],
  ['LB', 6],
  ['CB', 6],
  ['S', 5],
  ['K', 2]
];

const NFL_REGULAR_SEASON_WEEKS = 17;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function fullName(player: Pick<NFLPlayer, 'firstName' | 'lastName'> | Pick<CollegeGraduate, 'firstName' | 'lastName'>) {
  return `${player.firstName} ${player.lastName}`;
}

function createNFLTeams(): NFLTeam[] {
  return nflTeamSeeds.map((seed) => ({
    ...seed,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    rosterPlayerIds: [],
    history: []
  }));
}

function generateNFLPlayersForTeam(team: NFLTeam, rng: SeededRng): NFLPlayer[] {
  const players: NFLPlayer[] = [];

  NFL_ROSTER_PLAN.forEach(([position, count]) => {
    for (let index = 0; index < count; index += 1) {
      const age = rng.int(22, 34);
      const agePenalty = age > 29 ? (age - 29) * 2 : 0;
      const base = clamp(60 + Math.round(team.prestige * 0.26) + rng.int(-7, 8) - agePenalty, 60, 100);
      const potential = clamp(base + rng.int(-3, 10) - Math.max(0, age - 27), 60, 100);

      players.push({
        id: makeId('nfl_player', rng),
        sourceCollegePlayerId: null,
        sourceCollegeTeamId: null,
        firstName: rng.pick(firstNames),
        lastName: rng.pick(lastNames),
        age,
        position,
        overall: base,
        potential,
        teamId: team.id,
        yearsPro: Math.max(0, age - 22 + rng.int(-1, 2)),
        contractYears: rng.int(1, 5),
        salary: clamp(base * rng.int(800_000, 1_700_000), 750_000, 55_000_000),
        seasonStats: emptyStats(),
        careerStats: emptyStats()
      });
    }
  });

  return players;
}

function calculateNFLTeamOverall(team: NFLTeam, players: NFLPlayer[]) {
  const roster = players.filter((player) => player.teamId === team.id);
  const sorted = [...roster].sort((left, right) => right.overall - left.overall);
  const top = sorted.slice(0, 22);
  const average = top.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, top.length);

  return clamp(average * 0.86 + team.prestige * 0.14, 60, 100);
}

function gameId(rng: SeededRng, prefix = 'nfl_game') {
  return makeId(prefix, rng);
}

function createNFLGame({ rng, week, homeTeamId, awayTeamId, stage = 'regular' }: {
  rng: SeededRng;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  stage?: NFLScheduledGame['stage'];
}): NFLScheduledGame {
  return {
    id: gameId(rng, stage === 'regular' ? 'nfl_game' : 'nfl_playoff'),
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

function generateNFLSchedule(teams: NFLTeam[], rng: SeededRng, weeks = NFL_REGULAR_SEASON_WEEKS) {
  const teamIds = teams.map((team) => team.id);
  const usedPairs = new Set<string>();
  const schedule = [];

  function pairKey(a: string, b: string) {
    return [a, b].sort().join(':');
  }

  for (let week = 0; week < weeks; week += 1) {
    const shuffled = rng.shuffle(teamIds);
    const games: NFLScheduledGame[] = [];

    for (let index = 0; index < shuffled.length; index += 2) {
      const first = shuffled[index];
      const second = shuffled[index + 1];

      if (!first || !second) continue;

      const key = pairKey(first, second);
      if (!usedPairs.has(key)) usedPairs.add(key);

      const homeTeamId = (week + index) % 2 === 0 ? first : second;
      const awayTeamId = homeTeamId === first ? second : first;
      games.push(createNFLGame({ rng, week, homeTeamId, awayTeamId }));
    }

    schedule.push({ week, games });
  }

  return schedule;
}

function calculateNFLStandings(teams: NFLTeam[], players: NFLPlayer[]): NFLStanding[] {
  return [...teams]
    .map((team) => ({
      rank: 0,
      teamId: team.id,
      teamName: team.shortName,
      conference: team.conference,
      division: team.division,
      wins: team.wins,
      losses: team.losses,
      pointsFor: team.pointsFor,
      pointsAgainst: team.pointsAgainst,
      pointDifferential: team.pointsFor - team.pointsAgainst,
      overall: calculateNFLTeamOverall(team, players)
    }))
    .sort(
      (left, right) =>
        right.wins - left.wins ||
        left.losses - right.losses ||
        right.pointDifferential - left.pointDifferential ||
        right.overall - left.overall ||
        left.teamName.localeCompare(right.teamName)
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
}

function createNFLSeason(world: WorldWithNFL, rng: SeededRng, year: number): NFLSeasonState {
  const teams = (world.nflTeams ?? []).map((team) => ({
    ...team,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0
  }));
  const players = (world.nflPlayers ?? []).map((player) => ({
    ...player,
    seasonStats: emptyStats()
  }));

  return {
    year,
    currentWeek: 0,
    regularSeasonWeeks: NFL_REGULAR_SEASON_WEEKS,
    schedule: generateNFLSchedule(teams, rng, NFL_REGULAR_SEASON_WEEKS),
    completedGames: [],
    standings: calculateNFLStandings(teams, players),
    playoffTeamIds: [],
    championTeamId: null,
    superBowlGameId: null,
    seasonLog: []
  };
}

export function ensureNFLLayer(world: GameWorld): WorldWithNFL {
  const current = world as WorldWithNFL;
  const hasTeams = Array.isArray(current.nflTeams) && current.nflTeams.length === 32;
  const hasPlayers = Array.isArray(current.nflPlayers) && current.nflPlayers.length > 0;
  const rng = new SeededRng(world.seed + 440_320 + world.currentYear);

  let nflTeams = hasTeams ? current.nflTeams! : createNFLTeams();
  let nflPlayers = hasPlayers ? current.nflPlayers! : nflTeams.flatMap((team) => generateNFLPlayersForTeam(team, rng));

  nflTeams = nflTeams.map((team) => ({
    ...team,
    rosterPlayerIds: nflPlayers.filter((player) => player.teamId === team.id).map((player) => player.id)
  }));

  const nextWorld: WorldWithNFL = {
    ...current,
    nflTeams,
    nflPlayers,
    nflDraftHistory: Array.isArray(current.nflDraftHistory) ? current.nflDraftHistory : [],
    nflTrades: Array.isArray(current.nflTrades) ? current.nflTrades : []
  };

  if (!nextWorld.nflSeason || nextWorld.nflSeason.year !== world.season.year) {
    nextWorld.nflSeason = createNFLSeason(nextWorld, rng, world.season.year);
  }

  return nextWorld;
}

function updateNFLPlayerStats(player: NFLPlayer, teamScore: number, allowedScore: number, rng: SeededRng): NFLPlayer {
  const touchdowns = ['QB', 'RB', 'WR', 'TE'].includes(player.position) ? clamp(teamScore / 16 + rng.int(0, 1), 0, 5) : 0;
  const passingYards = player.position === 'QB' ? clamp(135 + teamScore * 5 + rng.int(-30, 80), 70, 480) : 0;
  const rushingYards = player.position === 'RB' ? clamp(35 + teamScore * 2.5 + rng.int(-10, 60), 0, 220) : 0;
  const receivingYards = ['WR', 'TE'].includes(player.position) ? clamp(25 + teamScore * 2.7 + rng.int(-10, 70), 0, 230) : 0;
  const tackles = ['DL', 'LB', 'CB', 'S'].includes(player.position) ? clamp(3 + allowedScore / 7 + rng.int(0, 7), 0, 18) : 0;
  const sacks = ['DL', 'LB'].includes(player.position) ? rng.int(0, 2) : 0;
  const interceptions = ['CB', 'S', 'LB'].includes(player.position) && rng.chance(0.16) ? 1 : 0;

  return {
    ...player,
    seasonStats: {
      passingYards: player.seasonStats.passingYards + passingYards,
      rushingYards: player.seasonStats.rushingYards + rushingYards,
      receivingYards: player.seasonStats.receivingYards + receivingYards,
      tackles: player.seasonStats.tackles + tackles,
      sacks: player.seasonStats.sacks + sacks,
      touchdowns: player.seasonStats.touchdowns + touchdowns,
      interceptions: player.seasonStats.interceptions + interceptions
    },
    careerStats: {
      passingYards: player.careerStats.passingYards + passingYards,
      rushingYards: player.careerStats.rushingYards + rushingYards,
      receivingYards: player.careerStats.receivingYards + receivingYards,
      tackles: player.careerStats.tackles + tackles,
      sacks: player.careerStats.sacks + sacks,
      touchdowns: player.careerStats.touchdowns + touchdowns,
      interceptions: player.careerStats.interceptions + interceptions
    }
  };
}

function applyPlayerUpdates(players: NFLPlayer[], updates: NFLPlayer[]) {
  const byId = new Map(updates.map((player) => [player.id, player]));
  return players.map((player) => byId.get(player.id) ?? player);
}

function simulateNFLGame(world: WorldWithNFL, game: NFLScheduledGame, rng: SeededRng) {
  const home = world.nflTeams?.find((team) => team.id === game.homeTeamId);
  const away = world.nflTeams?.find((team) => team.id === game.awayTeamId);
  const players = world.nflPlayers ?? [];

  if (!home || !away) return { game, playerUpdates: [] as NFLPlayer[] };

  const homeOverall = calculateNFLTeamOverall(home, players);
  const awayOverall = calculateNFLTeamOverall(away, players);
  let homeScore = clamp(20 + (homeOverall - awayOverall) * 0.45 + rng.int(-8, 18), 3, 58);
  let awayScore = clamp(18 + (awayOverall - homeOverall) * 0.45 + rng.int(-10, 17), 0, 55);

  if (homeScore === awayScore) {
    if (rng.chance(0.54)) homeScore += 3;
    else awayScore += 3;
  }

  const homeWon = homeScore > awayScore;
  const winner = homeWon ? home : away;
  const loser = homeWon ? away : home;
  const winnerRoster = players.filter((player) => player.teamId === winner.id).sort((a, b) => b.overall - a.overall);
  const mvp = winnerRoster.slice(0, 8)[rng.int(0, Math.min(7, winnerRoster.length - 1))] ?? winnerRoster[0] ?? null;
  const playerUpdates = [
    ...players.filter((player) => player.teamId === home.id).slice(0, 13).map((player) => updateNFLPlayerStats(player, homeScore, awayScore, rng)),
    ...players.filter((player) => player.teamId === away.id).slice(0, 13).map((player) => updateNFLPlayerStats(player, awayScore, homeScore, rng))
  ];

  return {
    game: {
      ...game,
      homeScore,
      awayScore,
      winnerId: winner.id,
      loserId: loser.id,
      mvpPlayerId: mvp?.id ?? null
    },
    playerUpdates
  };
}

function applyNFLResult(teams: NFLTeam[], game: NFLScheduledGame) {
  return teams.map((team) => {
    if (team.id !== game.homeTeamId && team.id !== game.awayTeamId) return team;

    const isHome = team.id === game.homeTeamId;
    const scored = isHome ? game.homeScore ?? 0 : game.awayScore ?? 0;
    const allowed = isHome ? game.awayScore ?? 0 : game.homeScore ?? 0;
    const won = game.winnerId === team.id;

    return {
      ...team,
      wins: team.wins + (won ? 1 : 0),
      losses: team.losses + (won ? 0 : 1),
      pointsFor: team.pointsFor + scored,
      pointsAgainst: team.pointsAgainst + allowed
    };
  });
}

function getNFLPlayoffField(standings: NFLStanding[]) {
  const field: Array<{ seed: number; teamId: string; conference: string }> = [];

  ['AFC', 'NFC'].forEach((conference) => {
    const conferenceStandings = standings.filter((entry) => entry.conference === conference);
    const divisionWinners = ['East', 'North', 'South', 'West']
      .map((name) => conferenceStandings.find((entry) => entry.division === `${conference} ${name}`))
      .filter((entry): entry is NFLStanding => Boolean(entry))
      .sort((a, b) => a.rank - b.rank);
    const divisionWinnerIds = new Set(divisionWinners.map((entry) => entry.teamId));
    const wildCards = conferenceStandings.filter((entry) => !divisionWinnerIds.has(entry.teamId)).slice(0, 3);
    [...divisionWinners, ...wildCards].slice(0, 7).forEach((entry, index) => {
      field.push({ seed: index + 1, teamId: entry.teamId, conference });
    });
  });

  return field;
}

function playNFLRound(world: WorldWithNFL, games: NFLScheduledGame[], rng: SeededRng) {
  let teams = world.nflTeams ?? [];
  let players = world.nflPlayers ?? [];
  const completedGames: NFLScheduledGame[] = [];

  games.forEach((game) => {
    const simulated = simulateNFLGame({ ...world, nflTeams: teams, nflPlayers: players }, game, rng);
    completedGames.push(simulated.game);
    teams = applyNFLResult(teams, simulated.game);
    players = applyPlayerUpdates(players, simulated.playerUpdates);
  });

  return { teams, players, completedGames };
}

function finishNFLSeason(input: WorldWithNFL, rng: SeededRng): WorldWithNFL {
  const world = ensureNFLLayer(input);
  if (world.nflSeason?.championTeamId) return world;

  const standings = calculateNFLStandings(world.nflTeams ?? [], world.nflPlayers ?? []);
  const field = getNFLPlayoffField(standings);
  const byConference = new Map<string, Map<number, string>>();

  field.forEach((entry) => {
    const map = byConference.get(entry.conference) ?? new Map<number, string>();
    map.set(entry.seed, entry.teamId);
    byConference.set(entry.conference, map);
  });

  let nextWorld = world;
  const playoffGames: NFLScheduledGame[] = [];
  const weekBase = world.nflSeason?.regularSeasonWeeks ?? NFL_REGULAR_SEASON_WEEKS;
  const conferenceWinners: string[] = [];

  ['AFC', 'NFC'].forEach((conference) => {
    const seeds = byConference.get(conference);
    if (!seeds) return;

    const wildCard = [
      [2, 7],
      [3, 6],
      [4, 5]
    ]
      .filter(([home, away]) => seeds.has(home) && seeds.has(away))
      .map(([home, away]) => createNFLGame({ rng, week: weekBase, homeTeamId: seeds.get(home)!, awayTeamId: seeds.get(away)!, stage: 'wildCard' }));
    const wc = playNFLRound(nextWorld, wildCard, rng);
    nextWorld = { ...nextWorld, nflTeams: wc.teams, nflPlayers: wc.players };
    playoffGames.push(...wc.completedGames);

    const wcWinners = wc.completedGames.map((game) => game.winnerId!).filter(Boolean);
    const remaining = [seeds.get(1)!, ...wcWinners].filter(Boolean);
    const ordered = field.filter((entry) => entry.conference === conference && remaining.includes(entry.teamId)).sort((a, b) => a.seed - b.seed);
    const oneSeed = ordered[0]?.teamId;
    const lowest = ordered[ordered.length - 1]?.teamId;
    const middle = ordered.slice(1, -1).map((entry) => entry.teamId);

    const divisional: NFLScheduledGame[] = [];
    if (oneSeed && lowest && oneSeed !== lowest) {
      divisional.push(createNFLGame({ rng, week: weekBase + 1, homeTeamId: oneSeed, awayTeamId: lowest, stage: 'divisional' }));
    }
    if (middle[0] && middle[1]) {
      divisional.push(createNFLGame({ rng, week: weekBase + 1, homeTeamId: middle[0], awayTeamId: middle[1], stage: 'divisional' }));
    }

    const div = playNFLRound(nextWorld, divisional, rng);
    nextWorld = { ...nextWorld, nflTeams: div.teams, nflPlayers: div.players };
    playoffGames.push(...div.completedGames);

    const divWinners = div.completedGames.map((game) => game.winnerId!).filter(Boolean);
    if (divWinners[0] && divWinners[1]) {
      const conferenceGame = createNFLGame({ rng, week: weekBase + 2, homeTeamId: divWinners[0], awayTeamId: divWinners[1], stage: 'conference' });
      const conf = playNFLRound(nextWorld, [conferenceGame], rng);
      nextWorld = { ...nextWorld, nflTeams: conf.teams, nflPlayers: conf.players };
      playoffGames.push(...conf.completedGames);
      if (conf.completedGames[0]?.winnerId) conferenceWinners.push(conf.completedGames[0].winnerId!);
    }
  });

  const superBowl = conferenceWinners[0] && conferenceWinners[1]
    ? createNFLGame({ rng, week: weekBase + 3, homeTeamId: conferenceWinners[0], awayTeamId: conferenceWinners[1], stage: 'superBowl' })
    : null;
  const superResult = superBowl ? playNFLRound(nextWorld, [superBowl], rng) : null;

  if (superResult) {
    nextWorld = { ...nextWorld, nflTeams: superResult.teams, nflPlayers: superResult.players };
    playoffGames.push(...superResult.completedGames);
  }

  const superBowlGame = superResult?.completedGames[0] ?? playoffGames[playoffGames.length - 1] ?? null;
  const championId = superBowlGame?.winnerId ?? null;
  const seasonYear = world.nflSeason?.year ?? world.currentYear;

  return {
    ...nextWorld,
    nflTeams: (nextWorld.nflTeams ?? []).map((team) => ({
      ...team,
      history: [
        ...team.history.filter((entry) => entry.year !== seasonYear),
        {
          year: seasonYear,
          wins: team.wins,
          losses: team.losses,
          pointsFor: team.pointsFor,
          pointsAgainst: team.pointsAgainst,
          madePlayoffs: field.some((entry) => entry.teamId === team.id),
          wonSuperBowl: team.id === championId
        }
      ]
    })),
    nflSeason: world.nflSeason
      ? {
          ...world.nflSeason,
          currentWeek: world.nflSeason.regularSeasonWeeks + 4,
          completedGames: [...world.nflSeason.completedGames, ...playoffGames],
          standings: calculateNFLStandings(nextWorld.nflTeams ?? [], nextWorld.nflPlayers ?? []),
          playoffTeamIds: field.map((entry) => entry.teamId),
          championTeamId: championId,
          superBowlGameId: superBowlGame?.id ?? null,
          seasonLog: [
            ...world.nflSeason.seasonLog,
            {
              id: makeId('nfl_log', rng),
              year: seasonYear,
              week: weekBase,
              headline: 'NFL Playoff',
              body: `Команд в плей-офф: ${field.length}`,
              gameId: superBowlGame?.id ?? null
            }
          ]
        }
      : world.nflSeason
  };
}

export function simulateNFLWeek(input: GameWorld): GameWorld {
  let world = ensureNFLLayer(input);
  const season = world.nflSeason;

  if (!season || season.championTeamId) return world;

  const week = season.schedule.find((entry) => entry.week === season.currentWeek);

  if (!week) {
    return finishNFLSeason(world, new SeededRng(world.seed + season.year * 701 + season.currentWeek * 11));
  }

  const completedIds = new Set(season.completedGames.map((game) => game.id));
  const games = week.games.filter((game) => !completedIds.has(game.id));

  if (games.length === 0) {
    return {
      ...world,
      nflSeason: {
        ...season,
        currentWeek: season.currentWeek + 1,
        standings: calculateNFLStandings(world.nflTeams ?? [], world.nflPlayers ?? [])
      }
    };
  }

  const rng = new SeededRng(world.seed + season.year * 701 + season.currentWeek * 11 + season.completedGames.length);
  const result = playNFLRound(world, games, rng);
  const updated: WorldWithNFL = {
    ...world,
    nflTeams: result.teams,
    nflPlayers: result.players,
    nflSeason: {
      ...season,
      currentWeek: season.currentWeek + 1,
      completedGames: [...season.completedGames, ...result.completedGames],
      standings: calculateNFLStandings(result.teams, result.players)
    }
  };

  if (updated.nflSeason && updated.nflSeason.currentWeek >= updated.nflSeason.regularSeasonWeeks) {
    return finishNFLSeason(updated, rng);
  }

  return updated;
}

export function simulateNFLSeason(input: GameWorld): GameWorld {
  let world = ensureNFLLayer(input);
  let guard = 0;

  while (world.nflSeason && !world.nflSeason.championTeamId && guard < 30) {
    world = simulateNFLWeek(world) as WorldWithNFL;
    guard += 1;
  }

  return world;
}

function convertGraduateToNFLPlayer(player: CollegeGraduate, teamId: string, rng: SeededRng): NFLPlayer {
  const overall = clamp(60 + (player.overall - 30) * 0.72 + rng.int(-3, 6), 60, 100);
  const potential = clamp(Math.max(overall, 60 + (player.potential - 30) * 0.74 + rng.int(-4, 12)), overall, 100);

  return {
    id: makeId('nfl_rookie', rng),
    sourceCollegePlayerId: player.id,
    sourceCollegeTeamId: player.collegeTeamId,
    firstName: player.firstName,
    lastName: player.lastName,
    age: Math.max(21, player.age + 1),
    position: player.position,
    overall,
    potential,
    teamId,
    yearsPro: 0,
    contractYears: 4,
    salary: clamp(overall * rng.int(900_000, 1_800_000), 900_000, 45_000_000),
    seasonStats: emptyStats(),
    careerStats: player.careerStats
  };
}

function trimNFLRosters(players: NFLPlayer[]) {
  const byTeam = new Map<string, NFLPlayer[]>();

  players.forEach((player) => {
    byTeam.set(player.teamId, [...(byTeam.get(player.teamId) ?? []), player]);
  });

  const kept = new Set<string>();

  byTeam.forEach((roster) => {
    roster
      .sort((left, right) => right.overall - left.overall || right.potential - left.potential)
      .slice(0, 60)
      .forEach((player) => kept.add(player.id));
  });

  return players.filter((player) => kept.has(player.id));
}

export function runNFLDraft(input: GameWorld): GameWorld {
  const world = ensureNFLLayer(input);
  const rng = new SeededRng(world.seed + world.currentYear * 997);
  const alreadyDrafted = new Set((world.nflDraftHistory ?? []).map((pick) => pick.sourceCollegePlayerId));
  const prospects = [...(world.graduatedCollegePlayers ?? [])]
    .filter((player) => !alreadyDrafted.has(player.id))
    .sort((left, right) => right.overall - left.overall || right.potential - left.potential || right.leadership - left.leadership)
    .slice(0, 224);
  const order = [...(world.nflTeams ?? [])].sort(
    (left, right) =>
      left.wins - right.wins ||
      right.losses - left.losses ||
      (left.pointsFor - left.pointsAgainst) - (right.pointsFor - right.pointsAgainst) ||
      left.shortName.localeCompare(right.shortName)
  );
  const picks: NFLDraftPick[] = [];
  let players = world.nflPlayers ?? [];

  prospects.forEach((prospect, index) => {
    const team = order[index % Math.max(1, order.length)];
    if (!team) return;

    const nflPlayer = convertGraduateToNFLPlayer(prospect, team.id, rng);
    players.push(nflPlayer);
    picks.push({
      id: makeId('nfl_draft_pick', rng),
      year: world.currentYear,
      round: Math.floor(index / 32) + 1,
      pick: index + 1,
      nflTeamId: team.id,
      nflTeamName: team.shortName,
      sourceCollegePlayerId: prospect.id,
      nflPlayerId: nflPlayer.id,
      playerName: fullName(prospect),
      position: prospect.position,
      collegeTeamId: prospect.finalCollegeTeamId ?? prospect.collegeTeamId ?? null,
      collegeTeamName: prospect.finalCollegeName ?? null,
      overall: nflPlayer.overall,
      potential: nflPlayer.potential
    });
  });

  players = trimNFLRosters(players);

  return {
    ...world,
    nflPlayers: players,
    nflTeams: (world.nflTeams ?? []).map((team) => ({
      ...team,
      rosterPlayerIds: players.filter((player) => player.teamId === team.id).map((player) => player.id)
    })),
    nflDraftHistory: [...(world.nflDraftHistory ?? []), ...picks]
  };
}

export function runNFLTrades(input: GameWorld): GameWorld {
  const world = ensureNFLLayer(input);
  const rng = new SeededRng(world.seed + world.currentYear * 887 + (world.nflTrades?.length ?? 0));
  let players = [...(world.nflPlayers ?? [])];
  const teams = [...(world.nflTeams ?? [])].sort((left, right) => left.shortName.localeCompare(right.shortName));
  const trades: NFLTrade[] = [];

  for (let index = 0; index < 4; index += 1) {
    const from = rng.pick(teams);
    const to = rng.pick(teams.filter((team) => team.id !== from.id));

    if (!from || !to) continue;

    const candidates = players
      .filter((player) => player.teamId === from.id && player.yearsPro > 1)
      .sort((left, right) => right.overall - left.overall)
      .slice(8, 25);

    const player = candidates[rng.int(0, Math.max(0, candidates.length - 1))];
    if (!player) continue;

    players = players.map((entry) => entry.id === player.id ? { ...entry, teamId: to.id } : entry);
    trades.push({
      id: makeId('nfl_trade', rng),
      year: world.currentYear,
      week: world.nflSeason?.currentWeek ?? 0,
      fromTeamId: from.id,
      fromTeamName: from.shortName,
      toTeamId: to.id,
      toTeamName: to.shortName,
      playerId: player.id,
      playerName: fullName(player),
      position: player.position,
      overall: player.overall
    });
  }

  return {
    ...world,
    nflPlayers: players,
    nflTeams: teams.map((team) => ({
      ...team,
      rosterPlayerIds: players.filter((player) => player.teamId === team.id).map((player) => player.id)
    })),
    nflTrades: [...(world.nflTrades ?? []), ...trades]
  };
}

export function advanceNFLToNextSeason(input: GameWorld): GameWorld {
  let world = ensureNFLLayer(input);
  const year = world.season.year;
  const rng = new SeededRng(world.seed + year * 1_177);

  world = runNFLDraft(world) as WorldWithNFL;
  world = runNFLTrades(world) as WorldWithNFL;

  const teams = (world.nflTeams ?? []).map((team) => ({
    ...team,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0
  }));
  const players = (world.nflPlayers ?? []).map((player) => ({
    ...player,
    age: player.age + 1,
    yearsPro: player.yearsPro + 1,
    contractYears: Math.max(0, player.contractYears - 1),
    overall: clamp(player.overall + Math.min(3, Math.max(-3, Math.round((player.potential - player.overall) * 0.12) + rng.int(-1, 2))), 60, 100),
    seasonStats: emptyStats()
  }));

  const nextWorld = {
    ...world,
    nflTeams: teams,
    nflPlayers: players
  };

  return {
    ...nextWorld,
    nflSeason: createNFLSeason(nextWorld, rng, year)
  };
}

export function getNFLStandings(world: GameWorld) {
  const next = ensureNFLLayer(world);
  return next.nflSeason?.standings ?? calculateNFLStandings(next.nflTeams ?? [], next.nflPlayers ?? []);
}

export function getNFLTeamOverall(world: GameWorld, teamId: string) {
  const next = ensureNFLLayer(world);
  const team = next.nflTeams?.find((entry) => entry.id === teamId);
  if (!team) return 60;
  return calculateNFLTeamOverall(team, next.nflPlayers ?? []);
}

export function isNFLSeasonComplete(world: GameWorld) {
  return Boolean(ensureNFLLayer(world).nflSeason?.championTeamId);
}
