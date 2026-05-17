import { cityNames, mascots } from '../../content/names';
import { generateCoach } from '../coaches/generateCoach';
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
  const teamsByCity = new Map<string, Team[]>();

  teams.forEach((team) => {
    const cityTeams = teamsByCity.get(team.cityId) ?? [];
    cityTeams.push(team);
    teamsByCity.set(team.cityId, cityTeams);
  });

  teams.forEach((team) => {
    team.rivalryIds = [];
  });

  teamsByCity.forEach((cityTeams) => {
    if (cityTeams.length < 2) {
      return;
    }

    const [first, second] = cityTeams;
    if (!first || !second) {
      return;
    }

    first.rivalryIds = [second.id];
    second.rivalryIds = [first.id];
  });
}

export function createWorld({ seed }: { seed: number }): GameWorld {
  const rng = new SeededRng(seed);
  const state = { id: 'state_texoma', name: 'Texoma' };

  const cities: City[] = cityNames.slice(0, 8).map((name) => ({
    id: makeId('city', rng),
    stateId: state.id,
    name,
    population: rng.int(6_000, 95_000),
    footballCulture: rng.int(45, 95)
  }));

  const offenseStyles: OffenseStyle[] = ['balanced', 'runHeavy', 'passHeavy', 'spread', 'powerRun'];
  const defenseStyles: DefenseStyle[] = ['balanced', 'aggressive', 'conservative', 'blitzHeavy'];
  const schools: School[] = [];
  const teams: Team[] = [];
  const coaches: Coach[] = [];
  const players: Player[] = [];

  cities.forEach((city, cityIndex) => {
    for (let slot = 0; slot < 2; slot += 1) {
      const mascot = mascots[(cityIndex * 2 + slot) % mascots.length];
      const school: School = {
        id: makeId('school', rng),
        cityId: city.id,
        name: `${city.name} ${slot === 0 ? 'High' : 'Central'}`,
        mascot,
        prestige: rng.int(32, 82),
        facilities: rng.int(25, 78)
      };
      const coach = generateCoach(rng);
      const team: Team = {
        id: makeId('team', rng),
        schoolId: school.id,
        cityId: city.id,
        coachId: coach.id,
        schoolName: school.name,
        cityName: city.name,
        mascot,
        prestige: school.prestige,
        name: `${school.name} ${mascot}`,
        shortName: `${city.name} ${mascot}`,
        offenseStyle: rng.pick(offenseStyles),
        defenseStyle: rng.pick(defenseStyles),
        morale: rng.int(45, 75),
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
    }
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
    team.shortName = `${city.name} ${school.mascot}`;
    team.offenseRating = ratings.offense;
    team.defenseRating = ratings.defense;
    team.overallRating = ratings.overall;
    team.roster = roster;
    team.playerIds = roster;
  });

  assignRivalries(teams);

  const people = createPeopleFromPlayers(players, 2026, rng);
  const schedule = generateSchedule({ rng, teams, weeks: 10 });
  const kickoffNews = {
    id: makeId('news', rng),
    year: 2026,
    week: 0,
    headline: 'Старт живого штата',
    body: 'Texoma начинает путь: 16 команд, 8 городов и первая гонка за титул штата.'
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
          headline: 'Сезон начинается',
          body: 'Каждый город Texoma начинает гонку за первый титул штата.',
          gameId: null
        }
      ]
    },
    news: [kickoffNews],
    history: {
      champions: [],
      titleGames: [],
      rivalryResults: []
    }
  };
}
