import { createCollegeSeason } from '../colleges/collegeSeason';
import { convertCommitmentsToCollegePlayers, developCollegePlayers } from '../colleges/collegePlayerLifecycle';
import { calculateCollegeStandings } from '../colleges/collegeStandings';
import { recordSeasonHistory } from '../history/recordSeasonHistory';
import { appendCareerEvent, createCareerEvent, createPeopleFromPlayers, normalizePlayerIdentity } from '../people/personUtils';
import { developPlayer } from '../players/developPlayer';
import { emptyStats } from '../players/generatePlayers';
import { generateFreshmanClass } from '../players/generateFreshmanClass';
import { makeId, SeededRng } from '../random/rng';
import { processRecruitingClass } from '../recruiting/processRecruitingClass';
import { generateSchedule } from '../schedule/generateSchedule';
import { calculateStandings } from '../standings/calculateStandings';
import { calculateTeamRatings } from '../teams/calculateTeamRatings';
import { GameWorld, Person, Player, Team, TeamHistoryEntry } from '../world/worldTypes';

const TARGET_ROSTER_SIZE = 40;
const MAX_ROSTER_SIZE = 45;
const MAX_RETURNING_PLAYERS = 44;
const MIN_FRESHMEN_TARGET = 3;

function cloneWorld(world: GameWorld): GameWorld {
  return structuredClone(world);
}

function clampRosterSize(players: Player[], target = TARGET_ROSTER_SIZE) {
  if (players.length <= target) {
    return players;
  }

  return [...players]
    .sort(
      (left, right) =>
        right.overall - left.overall ||
        right.potential - left.potential ||
        right.workEthic - left.workEthic
    )
    .slice(0, target);
}

function nextClassYear(current: Player['classYear']): Player['classYear'] {
  switch (current) {
    case 'FR':
      return 'SO';
    case 'SO':
      return 'JR';
    default:
      return 'SR';
  }
}

function buildTeamHistoryEntry(world: GameWorld, team: Team): TeamHistoryEntry {
  const playoffAppearance = world.season.playoffTeams.includes(team.id);
  const titleWon = team.id === world.season.championId;

  return {
    year: world.season.year,
    wins: team.wins,
    losses: team.losses,
    pointsFor: team.pointsFor,
    pointsAgainst: team.pointsAgainst,
    madePlayoffs: playoffAppearance,
    playoffAppearance,
    wonTitle: titleWon,
    titleWon,
    note: ''
  };
}

function ensureTeamHistoryRecorded(world: GameWorld) {
  world.teams = world.teams.map((team) => {
    const entry = buildTeamHistoryEntry(world, team);
    const existingIndex = team.history.findIndex((item) => item.year === world.season.year);

    if (existingIndex === -1) {
      return {
        ...team,
        history: [...team.history, entry]
      };
    }

    const history = [...team.history];
    history[existingIndex] = {
      ...entry,
      ...history[existingIndex],
      note: history[existingIndex].note ?? '',
      madePlayoffs: history[existingIndex].madePlayoffs ?? history[existingIndex].playoffAppearance ?? entry.madePlayoffs,
      playoffAppearance:
        history[existingIndex].playoffAppearance ?? history[existingIndex].madePlayoffs ?? entry.playoffAppearance,
      wonTitle: history[existingIndex].wonTitle ?? history[existingIndex].titleWon ?? entry.wonTitle,
      titleWon: history[existingIndex].titleWon ?? history[existingIndex].wonTitle ?? entry.titleWon
    };

    return {
      ...team,
      history
    };
  });
}

function resetTeamSeason(team: Team): Team {
  return {
    ...team,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0
  };
}

function buildGraduatedPlayer(player: Player): Player {
  return {
    ...player,
    careerStage: 'graduated',
    seasonStats: emptyStats()
  };
}

function graduatePeople({
  people,
  graduatingPlayers,
  year,
  rng
}: {
  people: Person[];
  graduatingPlayers: Player[];
  year: number;
  rng: SeededRng;
}): Person[] {
  const graduatingByPersonId = new Map(
    graduatingPlayers.map((player) => [player.personId ?? `person_${player.id}`, player])
  );

  return people.map((person) => {
    const graduatingPlayer = graduatingByPersonId.get(person.id);

    if (!graduatingPlayer) {
      return person;
    }

    const event = createCareerEvent({
      rng,
      year,
      week: 0,
      type: 'graduation',
      title: `${graduatingPlayer.firstName} ${graduatingPlayer.lastName}: выпуск`,
      body: '',
      teamId: graduatingPlayer.teamId,
      schoolId: graduatingPlayer.schoolId
    });

    return appendCareerEvent(
      {
        ...person,
        reputation: Math.max(
          person.reputation,
          Math.round((graduatingPlayer.overall + graduatingPlayer.potential + graduatingPlayer.ambition) / 3)
        ),
        roles: person.roles.map((role) =>
          role.entityId === graduatingPlayer.id && role.type === 'player'
            ? {
                ...role,
                type: 'graduate',
                endedYear: year
              }
            : role
        )
      },
      event
    );
  });
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
    rosterPlayerIds: playersByTeam.get(team.id) ?? []
  }));
}

function resetCollegeTeamsForNewSeason(world: GameWorld) {
  return refreshCollegeTeamRosters(world).map((team) => ({
    ...team,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0
  }));
}

export function advanceOffseason(input: GameWorld): GameWorld {
  const world = cloneWorld(input);

  if (world.phase !== 'offseason' || world.season.championId === null) {
    return world;
  }

  ensureTeamHistoryRecorded(world);
  world.history = recordSeasonHistory(world);

  const rng = new SeededRng(world.seed + (world.season.year + 1) * 9973);
  const graduatingPlayers = world.players
    .filter((player) => player.classYear === 'SR')
    .map((player) => buildGraduatedPlayer(normalizePlayerIdentity(player, 'graduated')));
  const developedPlayers = world.players
    .filter((player) => player.classYear !== 'SR')
    .map((player) => {
      const developed = developPlayer(normalizePlayerIdentity(player), rng);

      return {
        ...developed,
        age: developed.age + 1,
        classYear: nextClassYear(player.classYear),
        seasonStats: emptyStats(),
        careerStage: 'highSchool' as const
      };
    });
  let nextPeople: Person[] = graduatePeople({
    people: world.people ?? [],
    graduatingPlayers,
    year: world.season.year,
    rng
  });

  const recruitingResult = processRecruitingClass({
    world,
    graduatingPlayers,
    people: nextPeople,
    rng,
    year: world.season.year
  });

  nextPeople = recruitingResult.people;
  world.graduatedPlayers = [...(world.graduatedPlayers ?? []), ...recruitingResult.graduatedPlayers];
  world.recruitingProfiles = [
    ...(world.recruitingProfiles ?? []).filter((profile) => profile.year !== world.season.year),
    ...recruitingResult.profiles
  ];
  const combinedCommitments = [...(world.commitments ?? []), ...recruitingResult.commitments];
  const developedCollege = developCollegePlayers({
    players: world.collegePlayers ?? [],
    rng
  });
  world.collegePlayers = developedCollege.returningPlayers;
  const conversion = convertCommitmentsToCollegePlayers({
    world,
    commitments: combinedCommitments,
    graduatedPlayers: world.graduatedPlayers,
    people: nextPeople,
    rng,
    year: world.season.year + 1
  });

  world.collegePlayers = conversion.collegePlayers;
  world.commitments = conversion.commitments;
  nextPeople = conversion.people;
  world.collegeTeams = resetCollegeTeamsForNewSeason(world);
  world.collegeSeason = createCollegeSeason({
    world,
    rng,
    year: world.season.year + 1,
    regularSeasonWeeks: 7
  });

  const nextPlayers: Player[] = [];

  world.teams = world.teams.map((team) => {
    const school = world.schools.find((entry) => entry.id === team.schoolId)!;
    const city = world.cities.find((entry) => entry.id === team.cityId)!;
    const currentRoster = developedPlayers.filter((player) => player.teamId === team.id);
    const trimmedRoster = clampRosterSize(currentRoster, MAX_RETURNING_PLAYERS);
    const targetRosterSize = Math.min(MAX_ROSTER_SIZE, Math.max(TARGET_ROSTER_SIZE, trimmedRoster.length + MIN_FRESHMEN_TARGET));
    const freshmen = generateFreshmanClass({
      rng,
      team,
      school,
      city,
      currentRoster: trimmedRoster,
      targetRosterSize
    });
    const roster = [...trimmedRoster, ...freshmen];

    nextPeople.push(...createPeopleFromPlayers(freshmen, world.season.year + 1, rng));
    nextPlayers.push(...roster);

    return resetTeamSeason({
      ...team,
      playerIds: roster.map((player) => player.id),
      roster: roster.map((player) => player.id)
    });
  });

  world.players = nextPlayers;
  world.people = nextPeople;
  world.teams = world.teams.map((team) => {
    const coach = world.coaches.find((entry) => entry.id === team.coachId)!;
    const ratings = calculateTeamRatings(team, world.players, coach);

    return {
      ...team,
      offenseRating: ratings.offense,
      defenseRating: ratings.defense,
      overallRating: ratings.overall
    };
  });
  world.collegeSeason = world.collegeSeason
    ? {
        ...world.collegeSeason,
        standings: calculateCollegeStandings(world.collegeTeams ?? [], world.collegePlayers ?? [])
      }
    : world.collegeSeason;

  world.currentYear = world.season.year + 1;
  world.currentWeek = 0;
  world.phase = 'regular';
  world.season = {
    year: world.season.year + 1,
    currentWeek: 0,
    regularSeasonWeeks: world.season.regularSeasonWeeks,
    schedule: generateSchedule({ rng, teams: world.teams, weeks: world.season.regularSeasonWeeks }),
    completedGames: [],
    standings: calculateStandings(world.teams),
    previousRankings: [],
    playoffTeams: [],
    playoffGames: [],
    championId: null,
    championTeamId: null,
    seasonLog: []
  };
  world.news.unshift({
    id: makeId('news', rng),
    year: world.currentYear,
    week: 0,
    headline: 'Межсезонье',
    body: ''
  });

  return world;
}
