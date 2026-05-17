import { developCollegePlayers } from './collegePlayerLifecycle';
import { createCollegeSeason } from './collegeSeason';
import { calculateCollegeStandings } from './collegeStandings';
import { SeededRng } from '../random/rng';
import { GameWorld } from '../world/worldTypes';

function cloneWorld(world: GameWorld): GameWorld {
  return structuredClone(world);
}

function refreshCollegeTeamRosters(world: GameWorld) {
  const playersByTeam = new Map<string, string[]>();

  (world.collegePlayers ?? []).forEach((player) => {
    const ids = playersByTeam.get(player.collegeTeamId) ?? [];
    ids.push(player.id);
    playersByTeam.set(player.collegeTeamId, ids);
  });

  return (world.collegeTeams ?? []).map((team) => ({
    ...team,
    rosterPlayerIds: playersByTeam.get(team.id) ?? [],
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0
  }));
}

export function advanceCollegeSeason(input: GameWorld): GameWorld {
  const world = cloneWorld(input);
  const season = world.collegeSeason;

  if (!season || !season.championTeamId) {
    return world;
  }

  const nextYear = season.year + 1;
  const rng = new SeededRng(world.seed + nextYear * 733 + (world.collegePlayers?.length ?? 0));
  const developed = developCollegePlayers({
    players: world.collegePlayers ?? [],
    rng
  });

  world.collegePlayers = developed.returningPlayers;
  world.collegeTeams = refreshCollegeTeamRosters(world);
  world.collegeSeason = createCollegeSeason({
    world,
    rng,
    year: nextYear,
    regularSeasonWeeks: season.regularSeasonWeeks
  });
  world.collegeSeason = {
    ...world.collegeSeason,
    standings: calculateCollegeStandings(world.collegeTeams ?? [], world.collegePlayers ?? [])
  };

  return world;
}
