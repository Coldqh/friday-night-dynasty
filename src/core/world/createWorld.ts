import { SeededRng, makeId } from '../random/rng';
import { cityNames, mascots } from '../content/names';
import { generateCoach } from '../coaches/generateCoach';
import { generatePlayersForTeam } from '../players/generatePlayers';
import { generateSchedule } from '../schedule/generateSchedule';
import { City, Coach, DefenseStyle, GameWorld, OffenseStyle, Player, School, Team } from './worldTypes';

export function createWorld({ seed }: { seed: number }): GameWorld {
  const rng = new SeededRng(seed);
  const state = { id: 'state_texoma', name: 'Texoma' };

  const cities: City[] = cityNames.map((name) => ({
    id: makeId('city', rng),
    stateId: state.id,
    name,
    population: rng.int(6_000, 95_000),
    footballCulture: rng.int(45, 95)
  }));

  const schools: School[] = [];
  const teams: Team[] = [];
  const offenseStyles: OffenseStyle[] = ['balanced', 'runHeavy', 'passHeavy', 'spread', 'powerRun'];
  const defenseStyles: DefenseStyle[] = ['balanced', 'aggressive', 'conservative', 'blitzHeavy'];
  const coaches: Coach[] = [];
  const players: Player[] = [];

  cities.forEach((city, cityIndex) => {
    for (let i = 0; i < 2; i += 1) {
      const mascot = mascots[(cityIndex * 2 + i) % mascots.length];
      const school: School = {
        id: makeId('school', rng),
        cityId: city.id,
        name: `${city.name} ${i === 0 ? 'High' : 'Central'}`,
        mascot,
        prestige: rng.int(30, 80),
        facilities: rng.int(25, 75)
      };
      const coach = generateCoach(rng);
      const team: Team = {
        id: makeId('team', rng),
        schoolId: school.id,
        cityId: city.id,
        coachId: coach.id,
        name: `${school.name} ${mascot}`,
        shortName: `${city.name} ${mascot}`,
        offenseStyle: rng.pick(offenseStyles),
        defenseStyle: rng.pick(defenseStyles),
        morale: rng.int(45, 75),
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        rivalryIds: []
      };
      schools.push(school);
      coaches.push(coach);
      teams.push(team);
      players.push(...generatePlayersForTeam({ rng, team, school, city }));
    }
  });

  const schedule = generateSchedule({ rng, teams, weeks: 10 });

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
    season: { schedule, playoffGames: [], championTeamId: null },
    news: [{ id: makeId('news', rng), year: 2026, week: 0, headline: 'Kickoff is coming', body: 'Новый школьный сезон в штате Texoma готов начаться.' }],
    history: { seasons: [] }
  };
}
