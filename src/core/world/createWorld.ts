import { realHighSchoolSeeds } from '../../content/realHighSchoolSeeds';
import { generateCoach } from '../coaches/generateCoach';
import { generateCollegeLayer } from '../colleges/generateColleges';
import { generateInitialCollegeRoster } from '../colleges/generateCollegePlayers';
import { updateCollegeTeamNeeds } from '../colleges/collegeRosterPlan';
import { createCollegeSeason } from '../colleges/collegeSeason';
import { createPeopleFromPlayers } from '../people/personUtils';
import { generatePlayersForTeam } from '../players/generatePlayers';
import { makeId, SeededRng } from '../random/rng';
import { generateSchedule } from '../schedule/generateSchedule';
import { calculateStandings } from '../standings/calculateStandings';
import { calculateTeamRatings } from '../teams/calculateTeamRatings';
import {
  City,
  Coach,
  DefenseStyle,
  GameWorld,
  OffenseStyle,
  Player,
  School,
  Team
} from './worldTypes';

function assignRivalries(teams: Team[]) {
  const teamsByState = new Map<string, Team[]>();

  teams.forEach((team) => {
    const stateCode = team.cityName.split(',').pop()?.trim() ?? team.cityName;
    const stateTeams = teamsByState.get(stateCode) ?? [];
    stateTeams.push(team);
    teamsByState.set(stateCode, stateTeams);
  });

  teams.forEach((team) => {
    team.rivalryIds = [];
  });

  teamsByState.forEach((stateTeams) => {
    for (let index = 0; index < stateTeams.length - 1; index += 2) {
      const first = stateTeams[index];
      const second = stateTeams[index + 1];

      if (!first || !second) {
        continue;
      }

      first.rivalryIds = [...new Set([...first.rivalryIds, second.id])];
      second.rivalryIds = [...new Set([...second.rivalryIds, first.id])];
    }
  });
}

function makeCityKey(city: string, state: string) {
  return `${city}, ${state}`;
}

export function createWorld({ seed }: { seed: number }): GameWorld {
  const rng = new SeededRng(seed);
  const state = { id: 'state_usa', name: 'United States' };
  const offenseStyles: OffenseStyle[] = ['balanced', 'runHeavy', 'passHeavy', 'spread', 'powerRun'];
  const defenseStyles: DefenseStyle[] = ['balanced', 'aggressive', 'conservative', 'blitzHeavy'];
  const cityByKey = new Map<string, City>();

  realHighSchoolSeeds.forEach((schoolSeed) => {
    const key = makeCityKey(schoolSeed.city, schoolSeed.state);

    if (cityByKey.has(key)) {
      return;
    }

    cityByKey.set(key, {
      id: makeId('city', rng),
      stateId: state.id,
      name: key,
      population: rng.int(8_000, 950_000),
      footballCulture: rng.int(55, 99)
    });
  });

  const cities = [...cityByKey.values()];
  const schools: School[] = [];
  const teams: Team[] = [];
  const coaches: Coach[] = [];
  const players: Player[] = [];

  realHighSchoolSeeds.forEach((schoolSeed) => {
    const city = cityByKey.get(makeCityKey(schoolSeed.city, schoolSeed.state));

    if (!city) {
      return;
    }

    const school: School = {
      id: makeId('school', rng),
      cityId: city.id,
      name: schoolSeed.schoolName,
      mascot: schoolSeed.mascot,
      prestige: rng.int(42, 92),
      facilities: rng.int(36, 90)
    };
    const coach = generateCoach(rng);
    const team: Team = {
      id: makeId('team', rng),
      schoolId: school.id,
      cityId: city.id,
      coachId: coach.id,
      schoolName: school.name,
      cityName: city.name,
      mascot: school.mascot,
      prestige: school.prestige,
      name: `${school.name} ${school.mascot}`,
      shortName: `${school.name.replace(/ High School| Senior High School| College Preparatory| Preparatory School| School/g, '')} ${school.mascot}`,
      offenseStyle: rng.pick(offenseStyles),
      defenseStyle: rng.pick(defenseStyles),
      morale: rng.int(45, 82),
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      offenseRating: 0,
      defenseRating: 0,
      overallRating: 0,
      roster: [],
      playerIds: [],
      history: [],
      rivalryIds: []
    };

    schools.push(school);
    coaches.push(coach);
    teams.push(team);
    players.push(...generatePlayersForTeam({ rng, team, school, city }));
  });

  teams.forEach((team) => {
    const school = schools.find((item) => item.id === team.schoolId)!;
    const city = cities.find((item) => item.id === team.cityId)!;
    const roster = players.filter((player) => player.teamId === team.id).map((player) => player.id);
    const ratings = calculateTeamRatings(team, players, coaches.find((item) => item.id === team.coachId)!);

    team.schoolName = school.name;
    team.cityName = city.name;
    team.mascot = school.mascot;
    team.prestige = school.prestige;
    team.name = `${school.name} ${school.mascot}`;
    team.shortName = `${school.name.replace(/ High School| Senior High School| College Preparatory| Preparatory School| School/g, '')} ${school.mascot}`;
    team.offenseRating = ratings.offense;
    team.defenseRating = ratings.defense;
    team.overallRating = ratings.overall;
    team.roster = roster;
    team.playerIds = roster;
  });

  assignRivalries(teams);

  const people = createPeopleFromPlayers(players, 2026, rng);
  const { colleges, collegeTeams: rawCollegeTeams } = generateCollegeLayer({
    stateId: state.id,
    cities,
    rng
  });
  const collegePlayers = rawCollegeTeams.flatMap((team) => {
    const city = cities.find((entry) => entry.id === team.cityId) ?? cities[0];

    return city ? generateInitialCollegeRoster({ rng, team, city }) : [];
  });
  const collegeTeams = updateCollegeTeamNeeds(rawCollegeTeams, collegePlayers);
  const baseWorldForCollegeSeason: GameWorld = {
    id: 'temp',
    seed,
    currentYear: 2026,
    currentWeek: 0,
    phase: 'regular' as const,
    state,
    cities,
    schools,
    teams,
    coaches,
    players,
    people,
    graduatedPlayers: [],
    colleges,
    collegeTeams,
    collegePlayers,
    graduatedCollegePlayers: [],
    recruitingProfiles: [],
    commitments: [],
    season: {
      year: 2026,
      currentWeek: 0,
      regularSeasonWeeks: 10,
      schedule: [],
      completedGames: [],
      standings: [],
      previousRankings: [],
      playoffTeams: [],
      playoffGames: [],
      championId: null,
      championTeamId: null,
      seasonLog: []
    },
    news: [],
    history: {
      champions: [],
      titleGames: [],
      rivalryResults: [],
      collegeChampions: []
    }
  };
  const schedule = generateSchedule({ rng, teams, weeks: 10 });
  const collegeSeason = createCollegeSeason({
    world: baseWorldForCollegeSeason,
    rng,
    year: 2026,
    regularSeasonWeeks: 12
  });
  const kickoffNews = {
    id: makeId('news', rng),
    year: 2026,
    week: 0,
    headline: 'Старт',
    body: ''
  };

  return {
    id: makeId('world', rng),
    seed,
    currentYear: 2026,
    currentWeek: 0,
    phase: 'regular',
    state,
    cities,
    schools,
    teams,
    coaches,
    players,
    people,
    graduatedPlayers: [],
    colleges,
    collegeTeams,
    collegePlayers,
    graduatedCollegePlayers: [],
    recruitingProfiles: [],
    commitments: [],
    collegeSeason,
    season: {
      year: 2026,
      currentWeek: 0,
      regularSeasonWeeks: 10,
      schedule,
      completedGames: [],
      standings: calculateStandings(teams),
      previousRankings: [],
      playoffTeams: [],
      playoffGames: [],
      championId: null,
      championTeamId: null,
      seasonLog: [
        {
          id: makeId('history', rng),
          year: 2026,
          week: 0,
          headline: 'Старт сезона',
          body: '',
          gameId: null
        }
      ]
    },
    news: [kickoffNews],
    history: {
      champions: [],
      titleGames: [],
      rivalryResults: [],
      collegeChampions: []
    }
  };
}
