import { calculateProgramMomentum } from '../momentum/calculateProgramMomentum';
import { GameWorld, RankingSnapshotEntry } from '../world/worldTypes';
import { calculateRankings } from './calculateRankings';

export type PollMovement = 'up' | 'down' | 'same' | 'new';

export interface PollPressureEntry {
  teamId: string;
  teamName: string;
  currentRank: number;
  previousRank: number | null;
  movement: PollMovement;
  movementAmount: number;
  pressureLabel: string;
  reason: string;
  rating: number;
}

function getMovement(currentRank: number, previousRank: number | null): PollMovement {
  if (previousRank === null) {
    return 'new';
  }

  if (currentRank < previousRank) {
    return 'up';
  }

  if (currentRank > previousRank) {
    return 'down';
  }

  return 'same';
}

function getLateSeason(world: GameWorld) {
  return world.phase === 'playoffs' || world.season.currentWeek >= Math.max(0, world.season.regularSeasonWeeks - 3);
}

function buildPressureLabel(world: GameWorld, currentRank: number, movement: PollMovement, movementAmount: number, momentumScore: number, undefeated: boolean) {
  const lateSeason = getLateSeason(world);

  if (currentRank === 1 && undefeated) {
    return 'Holding No. 1';
  }

  if (undefeated) {
    return 'Unbeaten Pressure';
  }

  if (lateSeason && currentRank >= 4 && currentRank <= 6) {
    return 'Playoff Bubble';
  }

  if (lateSeason && currentRank > 6 && currentRank <= 8) {
    return 'Outside Looking In';
  }

  if (movement === 'down' && movementAmount >= 1) {
    return 'Sliding';
  }

  if (momentumScore <= -20) {
    return 'Must Respond';
  }

  if (movement === 'up' && movementAmount >= 1) {
    return 'Climbing';
  }

  return currentRank === 1 ? 'Holding No. 1' : 'Holding Position';
}

function buildReason(
  world: GameWorld,
  ranking: { teamId: string; currentRank: number; previousRank: number | null; movement: PollMovement; movementAmount: number },
  momentum: ReturnType<typeof calculateProgramMomentum>
) {
  const team = world.teams.find((entry) => entry.id === ranking.teamId);
  const undefeated = (team?.wins ?? 0) > 0 && (team?.losses ?? 0) === 0;

  if (ranking.currentRank === 1 && undefeated) {
    return `${team?.shortName ?? 'This program'} is carrying the No. 1 target every Friday night.`;
  }

  if (ranking.movement === 'up' && ranking.movementAmount > 0) {
    return `${team?.shortName ?? 'This program'} climbed ${ranking.movementAmount} spot${ranking.movementAmount === 1 ? '' : 's'} after a stronger week.`;
  }

  if (ranking.movement === 'down' && ranking.movementAmount > 0) {
    return `${team?.shortName ?? 'This program'} slipped ${ranking.movementAmount} spot${ranking.movementAmount === 1 ? '' : 's'} and needs a response.`;
  }

  if (undefeated) {
    return `${team?.shortName ?? 'This program'} is still unbeaten and every poll voter is watching.`;
  }

  if (getLateSeason(world) && ranking.currentRank >= 4 && ranking.currentRank <= 8) {
    return `${team?.shortName ?? 'This program'} is fighting to stay in the playoff conversation.`;
  }

  return momentum.reasons[0] ?? `${team?.shortName ?? 'This program'} is trying to hold its place in the pecking order.`;
}

export function formatPollMovement(entry: Pick<PollPressureEntry, 'movement' | 'movementAmount'>) {
  if (entry.movement === 'new') {
    return 'NEW';
  }

  if (entry.movement === 'same' || entry.movementAmount === 0) {
    return '—';
  }

  return `${entry.movement === 'up' ? '↑' : '↓'}${entry.movementAmount}`;
}

export function getPollPressure(world: GameWorld): PollPressureEntry[] {
  const currentRankings = calculateRankings(world);
  const previousRankings = new Map<string, RankingSnapshotEntry>(
    world.season.previousRankings.map((entry) => [entry.teamId, entry])
  );

  return currentRankings.map((entry) => {
    const team = entry.team;
    const previous = previousRankings.get(team.id) ?? null;
    const movement = getMovement(entry.rank, previous?.rank ?? null);
    const movementAmount = previous ? Math.abs(previous.rank - entry.rank) : 0;
    const momentum = calculateProgramMomentum(world, team.id);
    const undefeated = team.wins > 0 && team.losses === 0;
    const pressureLabel = buildPressureLabel(world, entry.rank, movement, movementAmount, momentum.score, undefeated);

    return {
      teamId: team.id,
      teamName: team.shortName,
      currentRank: entry.rank,
      previousRank: previous?.rank ?? null,
      movement,
      movementAmount,
      pressureLabel,
      reason: buildReason(
        world,
        {
          teamId: team.id,
          currentRank: entry.rank,
          previousRank: previous?.rank ?? null,
          movement,
          movementAmount
        },
        momentum
      ),
      rating: entry.rating
    };
  });
}
