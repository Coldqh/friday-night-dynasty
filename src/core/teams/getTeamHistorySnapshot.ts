import { GameWorld, TeamHistoryEntry } from '../world/worldTypes';

export interface TeamHistorySnapshot {
  teamId: string;
  currentSeasonRecord: {
    wins: number;
    losses: number;
    label: string;
  };
  history: TeamHistoryEntry[];
  totalHistoricalWins: number;
  totalHistoricalLosses: number;
  titlesCount: number;
  playoffAppearancesCount: number;
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
      history: [],
      totalHistoricalWins: 0,
      totalHistoricalLosses: 0,
      titlesCount: 0,
      playoffAppearancesCount: 0,
      lastSeasonEntry: null
    };
  }

  const history = [...team.history].sort((left, right) => right.year - left.year);
  const totalHistoricalWins = team.history.reduce((sum, season) => sum + season.wins, 0);
  const totalHistoricalLosses = team.history.reduce((sum, season) => sum + season.losses, 0);

  return {
    teamId: team.id,
    currentSeasonRecord: {
      wins: team.wins,
      losses: team.losses,
      label: `${team.wins}-${team.losses}`
    },
    history,
    totalHistoricalWins,
    totalHistoricalLosses,
    titlesCount: team.history.filter((season) => season.titleWon || season.wonTitle).length,
    playoffAppearancesCount: team.history.filter((season) => season.playoffAppearance || season.madePlayoffs).length,
    lastSeasonEntry: history[0] ?? null
  };
}
