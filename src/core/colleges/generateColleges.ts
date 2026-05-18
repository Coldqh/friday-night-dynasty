import { SeededRng } from '../random/rng';
import { City, College, CollegeTeam, DefenseStyle, OffenseStyle, Position } from '../world/worldTypes';

type RealCollegeSeed = {
  id: string;
  name: string;
  shortName: string;
  conference: 'SEC' | 'Big Ten';
  division: 'SEC' | 'Big Ten';
  prestige: number;
  offenseStyle: OffenseStyle;
  defenseStyle: DefenseStyle;
  logoAsset: string;
};

const needsPool: Position[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'];

const realCollegeSeeds: RealCollegeSeed[] = [
  { id: 'alabama', name: 'University of Alabama', shortName: 'Alabama Crimson Tide', conference: 'SEC', division: 'SEC', prestige: 96, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/alabama.png' },
  { id: 'arkansas', name: 'University of Arkansas', shortName: 'Arkansas Razorbacks', conference: 'SEC', division: 'SEC', prestige: 78, offenseStyle: 'powerRun', defenseStyle: 'balanced', logoAsset: 'logos/college/arkansas.png' },
  { id: 'auburn', name: 'Auburn University', shortName: 'Auburn Tigers', conference: 'SEC', division: 'SEC', prestige: 84, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/auburn.png' },
  { id: 'florida', name: 'University of Florida', shortName: 'Florida Gators', conference: 'SEC', division: 'SEC', prestige: 85, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/florida.png' },
  { id: 'georgia', name: 'University of Georgia', shortName: 'Georgia Bulldogs', conference: 'SEC', division: 'SEC', prestige: 98, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/georgia.png' },
  { id: 'kentucky', name: 'University of Kentucky', shortName: 'Kentucky Wildcats', conference: 'SEC', division: 'SEC', prestige: 74, offenseStyle: 'powerRun', defenseStyle: 'balanced', logoAsset: 'logos/college/kentucky.png' },
  { id: 'lsu', name: 'Louisiana State University', shortName: 'LSU Tigers', conference: 'SEC', division: 'SEC', prestige: 91, offenseStyle: 'passHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/lsu.png' },
  { id: 'mississippi-state', name: 'Mississippi State University', shortName: 'Mississippi State Bulldogs', conference: 'SEC', division: 'SEC', prestige: 72, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/mississippi-state.png' },
  { id: 'missouri', name: 'University of Missouri', shortName: 'Missouri Tigers', conference: 'SEC', division: 'SEC', prestige: 80, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/missouri.png' },
  { id: 'oklahoma', name: 'University of Oklahoma', shortName: 'Oklahoma Sooners', conference: 'SEC', division: 'SEC', prestige: 90, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/oklahoma.png' },
  { id: 'ole-miss', name: 'University of Mississippi', shortName: 'Ole Miss Rebels', conference: 'SEC', division: 'SEC', prestige: 84, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/ole-miss.png' },
  { id: 'south-carolina', name: 'University of South Carolina', shortName: 'South Carolina Gamecocks', conference: 'SEC', division: 'SEC', prestige: 78, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/south-carolina.png' },
  { id: 'tennessee', name: 'University of Tennessee', shortName: 'Tennessee Volunteers', conference: 'SEC', division: 'SEC', prestige: 88, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/tennessee.png' },
  { id: 'texas', name: 'University of Texas at Austin', shortName: 'Texas Longhorns', conference: 'SEC', division: 'SEC', prestige: 95, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/texas.png' },
  { id: 'texas-am', name: 'Texas A&M University', shortName: 'Texas A&M Aggies', conference: 'SEC', division: 'SEC', prestige: 86, offenseStyle: 'powerRun', defenseStyle: 'aggressive', logoAsset: 'logos/college/texas-am.png' },
  { id: 'vanderbilt', name: 'Vanderbilt University', shortName: 'Vanderbilt Commodores', conference: 'SEC', division: 'SEC', prestige: 66, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/vanderbilt.png' },

  { id: 'illinois', name: 'University of Illinois', shortName: 'Illinois Fighting Illini', conference: 'Big Ten', division: 'Big Ten', prestige: 73, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/illinois.png' },
  { id: 'indiana', name: 'Indiana University', shortName: 'Indiana Hoosiers', conference: 'Big Ten', division: 'Big Ten', prestige: 79, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/indiana.png' },
  { id: 'iowa', name: 'University of Iowa', shortName: 'Iowa Hawkeyes', conference: 'Big Ten', division: 'Big Ten', prestige: 82, offenseStyle: 'powerRun', defenseStyle: 'conservative', logoAsset: 'logos/college/iowa.png' },
  { id: 'maryland', name: 'University of Maryland', shortName: 'Maryland Terrapins', conference: 'Big Ten', division: 'Big Ten', prestige: 72, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/maryland.png' },
  { id: 'michigan', name: 'University of Michigan', shortName: 'Michigan Wolverines', conference: 'Big Ten', division: 'Big Ten', prestige: 94, offenseStyle: 'powerRun', defenseStyle: 'aggressive', logoAsset: 'logos/college/michigan.png' },
  { id: 'michigan-state', name: 'Michigan State University', shortName: 'Michigan State Spartans', conference: 'Big Ten', division: 'Big Ten', prestige: 80, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/michigan-state.png' },
  { id: 'minnesota', name: 'University of Minnesota', shortName: 'Minnesota Golden Gophers', conference: 'Big Ten', division: 'Big Ten', prestige: 75, offenseStyle: 'powerRun', defenseStyle: 'balanced', logoAsset: 'logos/college/minnesota.png' },
  { id: 'nebraska', name: 'University of Nebraska', shortName: 'Nebraska Cornhuskers', conference: 'Big Ten', division: 'Big Ten', prestige: 83, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/nebraska.png' },
  { id: 'northwestern', name: 'Northwestern University', shortName: 'Northwestern Wildcats', conference: 'Big Ten', division: 'Big Ten', prestige: 68, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/northwestern.png' },
  { id: 'ohio-state', name: 'Ohio State University', shortName: 'Ohio State Buckeyes', conference: 'Big Ten', division: 'Big Ten', prestige: 98, offenseStyle: 'passHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/ohio-state.png' },
  { id: 'oregon', name: 'University of Oregon', shortName: 'Oregon Ducks', conference: 'Big Ten', division: 'Big Ten', prestige: 92, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/oregon.png' },
  { id: 'penn-state', name: 'Penn State University', shortName: 'Penn State Nittany Lions', conference: 'Big Ten', division: 'Big Ten', prestige: 90, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/penn-state.png' },
  { id: 'purdue', name: 'Purdue University', shortName: 'Purdue Boilermakers', conference: 'Big Ten', division: 'Big Ten', prestige: 70, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/purdue.png' },
  { id: 'rutgers', name: 'Rutgers University', shortName: 'Rutgers Scarlet Knights', conference: 'Big Ten', division: 'Big Ten', prestige: 66, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/rutgers.png' },
  { id: 'ucla', name: 'University of California, Los Angeles', shortName: 'UCLA Bruins', conference: 'Big Ten', division: 'Big Ten', prestige: 77, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/ucla.png' },
  { id: 'usc', name: 'University of Southern California', shortName: 'USC Trojans', conference: 'Big Ten', division: 'Big Ten', prestige: 91, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/usc.png' },
  { id: 'washington', name: 'University of Washington', shortName: 'Washington Huskies', conference: 'Big Ten', division: 'Big Ten', prestige: 86, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/washington.png' },
  { id: 'wisconsin', name: 'University of Wisconsin', shortName: 'Wisconsin Badgers', conference: 'Big Ten', division: 'Big Ten', prestige: 84, offenseStyle: 'powerRun', defenseStyle: 'conservative', logoAsset: 'logos/college/wisconsin.png' }
];

const rivalryPairs: Array<[string, string]> = [
  ['alabama', 'auburn'],
  ['ole-miss', 'mississippi-state'],
  ['texas', 'oklahoma'],
  ['florida', 'georgia'],
  ['texas', 'texas-am'],
  ['tennessee', 'alabama'],
  ['michigan', 'ohio-state'],
  ['usc', 'ucla'],
  ['oregon', 'washington'],
  ['iowa', 'nebraska'],
  ['minnesota', 'wisconsin'],
  ['indiana', 'purdue'],
  ['michigan', 'michigan-state'],
  ['illinois', 'northwestern']
];

function pickNeeds(rng: SeededRng) {
  return rng.shuffle(needsPool).slice(0, 3);
}

function stableId(prefix: string, seedId: string) {
  return `${prefix}_${seedId}`;
}

function assignCollegeRivalries(teams: CollegeTeam[]) {
  const next = teams.map((team) => ({ ...team, rivalryIds: [] as string[] }));
  const bySeedId = new Map(next.map((team) => [team.id.replace('college_team_', ''), team]));

  rivalryPairs.forEach(([leftId, rightId]) => {
    const left = bySeedId.get(leftId);
    const right = bySeedId.get(rightId);

    if (!left || !right) {
      return;
    }

    left.rivalryIds = [...new Set([...left.rivalryIds, right.id])];
    right.rivalryIds = [...new Set([...right.rivalryIds, left.id])];
  });

  return next;
}

export function generateCollegeLayer({
  stateId,
  cities,
  rng
}: {
  stateId: string;
  cities: City[];
  rng: SeededRng;
}): { colleges: College[]; collegeTeams: CollegeTeam[] } {
  const fallbackCity = cities[0];
  const colleges: College[] = [];
  const collegeTeams: CollegeTeam[] = [];

  realCollegeSeeds.forEach((seed, index) => {
    const city = cities[index % Math.max(1, cities.length)] ?? fallbackCity;

    if (!city) {
      return;
    }

    const collegeId = stableId('college', seed.id);
    const teamId = stableId('college_team', seed.id);

    const college: College = {
      id: collegeId,
      stateId,
      cityId: city.id,
      name: seed.name,
      shortName: seed.shortName,
      prestige: seed.prestige,
      facilities: Math.min(99, seed.prestige + rng.int(-8, 7)),
      academicRating: rng.int(55, 96),
      scholarshipBudget: Math.min(100, seed.prestige + rng.int(-3, 9)),
      conference: seed.conference,
      division: seed.division,
      logoAsset: seed.logoAsset
    };

    const team: CollegeTeam = {
      id: teamId,
      collegeId,
      cityId: city.id,
      name: `${seed.shortName} Football`,
      shortName: seed.shortName,
      prestige: seed.prestige,
      offenseStyle: seed.offenseStyle,
      defenseStyle: seed.defenseStyle,
      rosterPlayerIds: [],
      recruitingNeeds: pickNeeds(rng),
      rivalryIds: [],
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      history: [],
      conference: seed.conference,
      division: seed.division,
      logoAsset: seed.logoAsset
    };

    colleges.push(college);
    collegeTeams.push(team);
  });

  return { colleges, collegeTeams: assignCollegeRivalries(collegeTeams) };
}
