import { appendCareerEvent, createCareerEvent } from '../people/personUtils';
import { emptyStats } from '../players/generatePlayers';
import { makeId, SeededRng } from '../random/rng';
import { CollegeCommitment, CollegePlayer, GameWorld, Person, Player } from '../world/worldTypes';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function nextCollegeClass(current: CollegePlayer['classYear']): CollegePlayer['classYear'] {
  switch (current) {
    case 'FR':
      return 'SO';
    case 'SO':
      return 'JR';
    case 'JR':
      return 'SR';
    default:
      return 'SR';
  }
}

export function createCollegePlayerFromCommitment({
  player,
  commitment,
  rng,
  year
}: {
  player: Player;
  commitment: CollegeCommitment;
  rng: SeededRng;
  year: number;
}): CollegePlayer {
  return {
    id: makeId('college_player', rng),
    sourcePlayerId: player.id,
    personId: player.personId ?? null,
    collegeId: commitment.collegeId,
    collegeTeamId: commitment.collegeTeamId,
    sourceHighSchoolTeamId: player.teamId,
    sourceSchoolId: player.schoolId,
    hometownCityId: player.hometownCityId ?? player.cityId,
    firstName: player.firstName,
    lastName: player.lastName,
    age: Math.max(player.age + 1, year - (year - player.age)),
    classYear: 'FR',
    eligibilityRemaining: 4,
    position: player.position,
    height: player.height,
    weight: player.weight,
    overall: clamp(30 + Math.round(player.overall * 0.75) + rng.int(1, 6), 30, 70),
    potential: clamp(35 + Math.round(player.potential * 0.8) + rng.int(-2, 10), 35, 85),
    workEthic: player.workEthic,
    discipline: player.discipline,
    confidence: player.confidence,
    leadership: player.leadership,
    injuryRisk: player.injuryRisk,
    ambition: player.ambition,
    stars: commitment.stars,
    seasonStats: emptyStats(),
    careerStats: emptyStats()
  };
}

export function convertCommitmentsToCollegePlayers({
  world,
  commitments,
  graduatedPlayers,
  people,
  rng,
  year
}: {
  world: GameWorld;
  commitments: CollegeCommitment[];
  graduatedPlayers: Player[];
  people: Person[];
  rng: SeededRng;
  year: number;
}): {
  collegePlayers: CollegePlayer[];
  commitments: CollegeCommitment[];
  people: Person[];
} {
  const existingCollegePlayers = world.collegePlayers ?? [];
  const existingSourceIds = new Set(existingCollegePlayers.map((player) => player.sourcePlayerId));
  const playersById = new Map(graduatedPlayers.map((player) => [player.id, player]));
  const convertedPlayers: CollegePlayer[] = [];
  const convertedByCommitmentId = new Map<string, CollegePlayer>();

  commitments.forEach((commitment) => {
    if (commitment.convertedToCollegePlayerId || existingSourceIds.has(commitment.playerId)) {
      return;
    }

    const player = playersById.get(commitment.playerId);
    if (!player) {
      return;
    }

    const collegePlayer = createCollegePlayerFromCommitment({ player, commitment, rng, year });
    convertedPlayers.push(collegePlayer);
    convertedByCommitmentId.set(commitment.id, collegePlayer);
  });

  const nextCommitments = commitments.map((commitment) => {
    const collegePlayer = convertedByCommitmentId.get(commitment.id);

    if (!collegePlayer) {
      return commitment;
    }

    return {
      ...commitment,
      convertedToCollegePlayerId: collegePlayer.id
    };
  });

  const nextPeople = people.map((person) => {
    const collegePlayer = convertedPlayers.find((player) => player.personId === person.id);

    if (!collegePlayer) {
      return person;
    }

    const collegeTeam = (world.collegeTeams ?? []).find((team) => team.id === collegePlayer.collegeTeamId);
    const event = createCareerEvent({
      rng,
      year,
      week: 0,
      type: 'collegeArrival',
      title: `${collegePlayer.firstName} ${collegePlayer.lastName}: ${collegeTeam?.shortName ?? 'college'}`,
      body: '',
      teamId: null,
      schoolId: null
    });

    return appendCareerEvent(
      {
        ...person,
        roles: [
          ...person.roles,
          {
            type: 'collegePlayer',
            entityId: collegePlayer.id,
            teamId: collegePlayer.collegeTeamId,
            schoolId: null,
            startedYear: year,
            endedYear: null
          }
        ]
      },
      event
    );
  });

  return {
    collegePlayers: [...existingCollegePlayers, ...convertedPlayers],
    commitments: nextCommitments,
    people: nextPeople
  };
}

export function developCollegePlayers({
  players,
  rng
}: {
  players: CollegePlayer[];
  rng: SeededRng;
}): { returningPlayers: CollegePlayer[]; graduatedCollegePlayers: CollegePlayer[] } {
  const returningPlayers: CollegePlayer[] = [];
  const graduatedCollegePlayers: CollegePlayer[] = [];

  players.forEach((player) => {
    const isGraduating = player.eligibilityRemaining <= 1 || player.classYear === 'SR';

    if (isGraduating) {
      graduatedCollegePlayers.push({
        ...player,
        eligibilityRemaining: 0,
        seasonStats: emptyStats()
      });
      return;
    }

    const development = Math.max(0, Math.round((player.potential - player.overall) * 0.07 + player.workEthic * 0.018 + rng.int(-1, 2)));

    returningPlayers.push({
      ...player,
      age: player.age + 1,
      classYear: nextCollegeClass(player.classYear),
      eligibilityRemaining: Math.max(0, player.eligibilityRemaining - 1),
      overall: clamp(player.overall + development, 30, Math.min(70, Math.max(player.overall, player.potential))),
      confidence: clamp(player.confidence + rng.int(-2, 3), 1, 99),
      seasonStats: emptyStats()
    });
  });

  return { returningPlayers, graduatedCollegePlayers };
}
