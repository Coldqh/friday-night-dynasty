import { makeId, SeededRng } from '../random/rng';
import { CareerEvent, GameWorld, Person, Player } from '../world/worldTypes';

const personalities = [
  'Quiet worker',
  'Natural leader',
  'Film room addict',
  'Small-town star',
  'Late bloomer',
  'Locker-room spark',
  'Pressure chaser',
  'Discipline project',
  'Coach on the field',
  'Raw athlete'
];

function stablePersonId(player: Pick<Player, 'id' | 'personId'>): string {
  return player.personId ?? `person_${player.id}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function createCareerEvent({
  rng,
  year,
  week,
  type,
  title,
  body,
  teamId,
  schoolId
}: {
  rng: SeededRng;
  year: number;
  week: number;
  type: CareerEvent['type'];
  title: string;
  body: string;
  teamId: string | null;
  schoolId: string | null;
}): CareerEvent {
  return {
    id: makeId('career_event', rng),
    year,
    week,
    type,
    title,
    body,
    teamId,
    schoolId
  };
}

export function normalizePlayerIdentity(player: Player, careerStage: Player['careerStage'] = 'highSchool'): Player {
  const personId = stablePersonId(player);

  return {
    ...player,
    personId,
    hometownCityId: player.hometownCityId ?? player.cityId,
    careerStage: player.careerStage ?? careerStage
  };
}

export function createPersonFromPlayer(player: Player, year: number, rng: SeededRng): Person {
  const normalized = normalizePlayerIdentity(player);
  const reputation = clamp(
    Math.round(normalized.overall * 0.45 + normalized.potential * 0.25 + normalized.leadership * 0.15 + normalized.ambition * 0.15),
    1,
    99
  );

  return {
    id: stablePersonId(normalized),
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    birthYear: year - normalized.age,
    hometownCityId: normalized.hometownCityId ?? normalized.cityId,
    personality: rng.pick(personalities),
    ambition: normalized.ambition,
    discipline: normalized.discipline,
    reputation,
    roles: [
      {
        type: normalized.careerStage === 'graduated' ? 'graduate' : 'player',
        entityId: normalized.id,
        teamId: normalized.teamId,
        schoolId: normalized.schoolId,
        startedYear: year,
        endedYear: normalized.careerStage === 'graduated' ? year : null
      }
    ],
    careerEvents: [
      createCareerEvent({
        rng,
        year,
        week: 0,
        type: normalized.careerStage === 'graduated' ? 'graduation' : 'created',
        title:
          normalized.careerStage === 'graduated'
            ? `${normalized.firstName} ${normalized.lastName} entered the alumni pool`
            : `${normalized.firstName} ${normalized.lastName} entered the high school scene`,
        body:
          normalized.careerStage === 'graduated'
            ? `${normalized.position} ${normalized.firstName} ${normalized.lastName} is now tracked as a graduate for the wider football ecosystem.`
            : `${normalized.position} ${normalized.firstName} ${normalized.lastName} began his tracked career as a ${normalized.classYear}.`,
        teamId: normalized.teamId,
        schoolId: normalized.schoolId
      })
    ]
  };
}

export function createPeopleFromPlayers(players: Player[], year: number, rng: SeededRng): Person[] {
  return players.map((player) => createPersonFromPlayer(player, year, rng));
}

export function ensurePeopleForPlayers({
  players,
  graduatedPlayers,
  people,
  year,
  rng
}: {
  players: Player[];
  graduatedPlayers: Player[];
  people: Person[];
  year: number;
  rng: SeededRng;
}): Person[] {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const allPlayers = [...players, ...graduatedPlayers];

  allPlayers.forEach((player) => {
    const normalized = normalizePlayerIdentity(player, player.careerStage ?? 'highSchool');
    const personId = stablePersonId(normalized);

    if (!peopleById.has(personId)) {
      peopleById.set(personId, createPersonFromPlayer(normalized, year, rng));
    }
  });

  return [...peopleById.values()];
}

export function appendCareerEvent(person: Person, event: CareerEvent, maxEvents = 14): Person {
  return {
    ...person,
    careerEvents: [event, ...person.careerEvents].slice(0, maxEvents)
  };
}

export function getPersonForPlayer(world: GameWorld, playerId: string): Person | null {
  const player =
    world.players.find((entry) => entry.id === playerId) ??
    (world.graduatedPlayers ?? []).find((entry) => entry.id === playerId) ??
    null;

  if (!player) {
    return null;
  }

  return (world.people ?? []).find((person) => person.id === stablePersonId(player)) ?? null;
}

export function getPlayerLifeSummary(world: GameWorld, playerId: string): string {
  const player =
    world.players.find((entry) => entry.id === playerId) ??
    (world.graduatedPlayers ?? []).find((entry) => entry.id === playerId) ??
    null;

  if (!player) {
    return 'No player record';
  }

  const person = getPersonForPlayer(world, playerId);
  const hometown = world.cities.find((city) => city.id === (player.hometownCityId ?? player.cityId));
  const stage = player.careerStage ?? 'highSchool';

  if (!person) {
    return `${stage} / ${hometown?.name ?? 'Unknown hometown'}`;
  }

  return `${person.personality} / REP ${person.reputation} / ${hometown?.name ?? 'Unknown hometown'}`;
}
