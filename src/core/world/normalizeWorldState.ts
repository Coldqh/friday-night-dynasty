import { ensureCollegeLayer } from '../colleges/ensureCollegeLayer';
import { ensurePeopleForPlayers, normalizePlayerIdentity } from '../people/personUtils';
import { SeededRng } from '../random/rng';
import {
  GameWorld,
  Person,
  Player,
  RecruitingProfile,
  CollegeCommitment,
  RivalryGameResult,
  SeasonLogEntry,
  TeamHistoryEntry,
  WorldHistory
} from './worldTypes';

type LegacySeasonHistory = {
  year: number;
  championId?: string;
  championTeamId?: string;
  championName?: string;
  runnerUpId?: string | null;
  runnerUpName?: string;
  finalGameId?: string | null;
  finalScore?: string;
  finalSummary?: string;
  note?: string;
};

type LegacyWorld = GameWorld & {
  people?: Person[];
  graduatedPlayers?: Player[];
  recruitingProfiles?: RecruitingProfile[];
  commitments?: CollegeCommitment[];
  season: GameWorld['season'] & {
    historyEntries?: SeasonLogEntry[];
  };
  history: Partial<WorldHistory> & {
    seasons?: LegacySeasonHistory[];
  };
};

type LegacyTeamHistoryEntry = Partial<TeamHistoryEntry> & Pick<TeamHistoryEntry, 'year' | 'wins' | 'losses' | 'pointsFor' | 'pointsAgainst' | 'note'>;
type LegacyRivalryGameResult = Partial<RivalryGameResult> &
  Pick<RivalryGameResult, 'id' | 'year' | 'homeTeamId' | 'awayTeamId' | 'homeScore' | 'awayScore'>;

function normalizeTeamHistoryEntry(entry: LegacyTeamHistoryEntry): TeamHistoryEntry {
  const playoffAppearance = entry.playoffAppearance ?? entry.madePlayoffs ?? false;
  const titleWon = entry.titleWon ?? entry.wonTitle ?? false;

  return {
    year: entry.year,
    wins: entry.wins,
    losses: entry.losses,
    pointsFor: entry.pointsFor,
    pointsAgainst: entry.pointsAgainst,
    madePlayoffs: playoffAppearance,
    playoffAppearance,
    wonTitle: titleWon,
    titleWon,
    note: entry.note ?? ''
  };
}

function normalizeRivalryGameResult(entry: LegacyRivalryGameResult): RivalryGameResult {
  return {
    id: entry.id,
    year: entry.year,
    week: entry.week ?? 0,
    stage: entry.stage ?? 'regular',
    homeTeamId: entry.homeTeamId,
    awayTeamId: entry.awayTeamId,
    homeScore: entry.homeScore,
    awayScore: entry.awayScore,
    winnerId: entry.winnerId ?? null,
    summary: entry.summary ?? ''
  };
}

function toChampionHistory(season: LegacySeasonHistory) {
  return {
    year: season.year,
    championId: season.championId ?? season.championTeamId ?? 'unknown',
    championTeamId: season.championTeamId ?? season.championId ?? 'unknown',
    championName: season.championName ?? 'Неизвестный чемпион',
    runnerUpId: season.runnerUpId ?? null,
    runnerUpName: season.runnerUpName ?? 'Неизвестный финалист',
    finalGameId: season.finalGameId ?? null,
    finalScore: season.finalScore ?? 'счёт не записан',
    finalSummary: season.finalSummary ?? '',
    note: season.note ?? ''
  };
}

function toTitleGameHistory(season: LegacySeasonHistory) {
  return {
    year: season.year,
    gameId: season.finalGameId ?? `title-game-${season.year}`,
    championId: season.championId ?? season.championTeamId ?? 'unknown',
    championName: season.championName ?? 'Неизвестный чемпион',
    runnerUpId: season.runnerUpId ?? null,
    runnerUpName: season.runnerUpName ?? 'Неизвестный финалист',
    finalScore: season.finalScore ?? 'счёт не записан',
    summary: season.finalSummary ?? ''
  };
}

export function normalizeWorldState(input: GameWorld): GameWorld {
  const world = structuredClone(input) as LegacyWorld;
  const rng = new SeededRng(world.seed + (world.currentYear ?? world.season.year) * 31);
  const playersByTeam = new Map<string, string[]>();

  world.players = world.players.map((player) => normalizePlayerIdentity(player, 'highSchool'));
  world.graduatedPlayers = Array.isArray(world.graduatedPlayers)
    ? world.graduatedPlayers.map((player) => normalizePlayerIdentity(player, player.careerStage ?? 'graduated'))
    : [];

  world.players.forEach((player) => {
    if (!playersByTeam.has(player.teamId)) {
      playersByTeam.set(player.teamId, []);
    }

    playersByTeam.get(player.teamId)!.push(player.id);
  });

  world.teams = world.teams.map((team) => {
    const playerIds =
      Array.isArray(team.playerIds) && team.playerIds.length > 0
        ? [...team.playerIds]
        : Array.isArray(team.roster) && team.roster.length > 0
          ? [...team.roster]
          : [...(playersByTeam.get(team.id) ?? [])];

    return {
      ...team,
      playerIds,
      roster: [...playerIds],
      history: Array.isArray(team.history)
        ? team.history.map((entry) => normalizeTeamHistoryEntry(entry as LegacyTeamHistoryEntry))
        : []
    };
  });

  const people = ensurePeopleForPlayers({
    players: world.players,
    graduatedPlayers: world.graduatedPlayers,
    people: Array.isArray(world.people) ? world.people : [],
    year: world.currentYear ?? world.season.year,
    rng
  });

  const legacySeasons = Array.isArray(world.history?.seasons) ? world.history.seasons : [];
  const champions =
    Array.isArray(world.history?.champions) && world.history.champions.length > 0
      ? world.history.champions
      : legacySeasons.map(toChampionHistory);
  const titleGames =
    Array.isArray(world.history?.titleGames) && world.history.titleGames.length > 0
      ? world.history.titleGames
      : legacySeasons.map(toTitleGameHistory);
  const rivalryResults = Array.isArray(world.history?.rivalryResults)
    ? world.history.rivalryResults.map((entry) => normalizeRivalryGameResult(entry as LegacyRivalryGameResult))
    : [];
  const seasonLog =
    Array.isArray(world.season.seasonLog) && world.season.seasonLog.length > 0
      ? world.season.seasonLog
      : Array.isArray(world.season.historyEntries)
        ? world.season.historyEntries
        : [];

  const normalized: GameWorld = {
    ...world,
    players: world.players,
    people,
    graduatedPlayers: world.graduatedPlayers,
    recruitingProfiles: Array.isArray(world.recruitingProfiles) ? world.recruitingProfiles : [],
    commitments: Array.isArray(world.commitments) ? world.commitments : [],
    teams: world.teams,
    season: {
      ...world.season,
      seasonLog,
      previousRankings: Array.isArray(world.season.previousRankings) ? world.season.previousRankings : []
    },
    history: {
      champions,
      titleGames,
      rivalryResults
    }
  };

  return ensureCollegeLayer(normalized);
}
