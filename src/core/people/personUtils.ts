import { makeId, SeededRng } from '../random/rng';
import { CareerEvent, GameWorld, Person, Player } from '../world/worldTypes';

const personalities = [
  'трудолюбие',
  'лидерство',
  'дисциплина',
  'развитие',
  'стабильность',
  'атлетизм',
  'потенциал',
  'опыт',
  'характер',
  'скорость'
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
            ? `${normalized.firstName} ${normalized.lastName}: выпуск`
            : `${normalized.firstName} ${normalized.lastName}: старт карьеры`,
        body: '',
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
    return 'нет записи';
  }

  const person = getPersonForPlayer(world, playerId);
  const hometown = world.cities.find((city) => city.id === (player.hometownCityId ?? player.cityId));

  if (!person) {
    return hometown?.name ?? 'неизвестный город';
  }

  return `репутация ${person.reputation} / ${hometown?.name ?? 'неизвестный город'}`;
}
