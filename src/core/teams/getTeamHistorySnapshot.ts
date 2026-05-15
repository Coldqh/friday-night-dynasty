import { GameWorld, TeamHistoryEntry } from '../world/worldTypes';

export interface TeamHistorySnapshot {
  teamId: string;
  currentSeasonRecord: {
    wins: number;
    losses: number;
    label: string;
  };
  historicalRecord: {
    wins: number;
    losses: number;
    label: string;
  };
  history: TeamHistoryEntry[];
  totalHistoricalWins: number;
  totalHistoricalLosses: number;
  titlesCount: number;
  stateChampionships: number;
  playoffAppearancesCount: number;
  playoffAppearances: number;
  lastSeasonEntry: TeamHistoryEntry | null;
}

export function getTeamHistorySnapshot(world: GameWorld, teamId: string): TeamHistorySnapshot {
  const team = world.teams.find((entry) => entry.id === teamId);

  if (!team) {
    return {
      teamId,
      currentSeasonRecord: {
        wins: 0,
        losses: 0,
        label: '0-0'
      },
      historicalRecord: {
        wins: 0,
        losses: 0,
        label: '0-0'
      },
      history: [],
      totalHistoricalWins: 0,
      totalHistoricalLosses: 0,
      titlesCount: 0,
      stateChampionships: 0,
      playoffAppearancesCount: 0,
      playoffAppearances: 0,
      lastSeasonEntry: null
    };
  }

  const history = [...team.history].sort((left, right) => right.year - left.year);
  const totalHistoricalWins = team.history.reduce((sum, season) => sum + season.wins, 0);
  const totalHistoricalLosses = team.history.reduce((sum, season) => sum + season.losses, 0);
  const hasCurrentSeasonHistory = team.history.some((season) => season.year === world.season.year);
  const historicalWins = totalHistoricalWins + (hasCurrentSeasonHistory ? 0 : team.wins);
  const historicalLosses = totalHistoricalLosses + (hasCurrentSeasonHistory ? 0 : team.losses);
  const playoffAppearances =
    team.history.filter((season) => season.playoffAppearance || season.madePlayoffs).length +
    (!hasCurrentSeasonHistory && world.season.playoffTeams.includes(team.id) ? 1 : 0);
  const stateChampionships = world.history.champions.filter(
    (entry) => entry.championId === team.id || entry.championTeamId === team.id
  ).length;

  return {
    teamId: team.id,
    currentSeasonRecord: {
      wins: team.wins,
      losses: team.losses,
      label: `${team.wins}-${team.losses}`
    },
    historicalRecord: {
      wins: historicalWins,
      losses: historicalLosses,
      label: `${historicalWins}-${historicalLosses}`
    },
    history,
    totalHistoricalWins,
    totalHistoricalLosses,
    titlesCount: stateChampionships,
    stateChampionships,
    playoffAppearancesCount: playoffAppearances,
    playoffAppearances,
    lastSeasonEntry: history[0] ?? null
  };
}
