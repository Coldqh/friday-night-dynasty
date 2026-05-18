import { SeededRng } from '../random/rng';
import { City, College, CollegeTeam, DefenseStyle, OffenseStyle, Position } from '../world/worldTypes';

type RealCollegeSeed = {
  id: string;
  name: string;
  shortName: string;
  conference: string;
  division: string;
  prestige: number;
  offenseStyle: OffenseStyle;
  defenseStyle: DefenseStyle;
  logoAsset: string;
};

const needsPool: Position[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'];

const realCollegeSeeds: RealCollegeSeed[] = [
  { id: "boston-college", name: "Boston College", shortName: "Boston College Eagles", conference: "ACC", division: "ACC", prestige: 78, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/boston-college.png' },
  { id: "california", name: "University of California", shortName: "California Golden Bears", conference: "ACC", division: "ACC", prestige: 76, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/california.png' },
  { id: "clemson", name: "Clemson University", shortName: "Clemson Tigers", conference: "ACC", division: "ACC", prestige: 90, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/clemson.png' },
  { id: "duke", name: "Duke University", shortName: "Duke Blue Devils", conference: "ACC", division: "ACC", prestige: 78, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/duke.png' },
  { id: "florida-state", name: "Florida State University", shortName: "Florida State Seminoles", conference: "ACC", division: "ACC", prestige: 88, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/florida-state.png' },
  { id: "georgia-tech", name: "Georgia Institute of Technology", shortName: "Georgia Tech Yellow Jackets", conference: "ACC", division: "ACC", prestige: 80, offenseStyle: 'runHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/georgia-tech.png' },
  { id: "louisville", name: "University of Louisville", shortName: "Louisville Cardinals", conference: "ACC", division: "ACC", prestige: 82, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/louisville.png' },
  { id: "miami", name: "University of Miami", shortName: "Miami Hurricanes", conference: "ACC", division: "ACC", prestige: 88, offenseStyle: 'passHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/miami.png' },
  { id: "nc-state", name: "North Carolina State University", shortName: "NC State Wolfpack", conference: "ACC", division: "ACC", prestige: 80, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/nc-state.png' },
  { id: "north-carolina", name: "University of North Carolina", shortName: "North Carolina Tar Heels", conference: "ACC", division: "ACC", prestige: 81, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/north-carolina.png' },
  { id: "pittsburgh", name: "University of Pittsburgh", shortName: "Pittsburgh Panthers", conference: "ACC", division: "ACC", prestige: 79, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/pittsburgh.png' },
  { id: "smu", name: "Southern Methodist University", shortName: "SMU Mustangs", conference: "ACC", division: "ACC", prestige: 83, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/smu.png' },
  { id: "stanford", name: "Stanford University", shortName: "Stanford Cardinal", conference: "ACC", division: "ACC", prestige: 75, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/stanford.png' },
  { id: "syracuse", name: "Syracuse University", shortName: "Syracuse Orange", conference: "ACC", division: "ACC", prestige: 77, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/syracuse.png' },
  { id: "virginia", name: "University of Virginia", shortName: "Virginia Cavaliers", conference: "ACC", division: "ACC", prestige: 76, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/virginia.png' },
  { id: "virginia-tech", name: "Virginia Tech", shortName: "Virginia Tech Hokies", conference: "ACC", division: "ACC", prestige: 81, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/virginia-tech.png' },
  { id: "wake-forest", name: "Wake Forest University", shortName: "Wake Forest Demon Deacons", conference: "ACC", division: "ACC", prestige: 75, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/wake-forest.png' },
  { id: "illinois", name: "University of Illinois", shortName: "Illinois Fighting Illini", conference: "Big Ten", division: "Big Ten", prestige: 75, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/illinois.png' },
  { id: "indiana", name: "Indiana University", shortName: "Indiana Hoosiers", conference: "Big Ten", division: "Big Ten", prestige: 82, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/indiana.png' },
  { id: "iowa", name: "University of Iowa", shortName: "Iowa Hawkeyes", conference: "Big Ten", division: "Big Ten", prestige: 82, offenseStyle: 'powerRun', defenseStyle: 'conservative', logoAsset: 'logos/college/iowa.png' },
  { id: "maryland", name: "University of Maryland", shortName: "Maryland Terrapins", conference: "Big Ten", division: "Big Ten", prestige: 74, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/maryland.png' },
  { id: "michigan", name: "University of Michigan", shortName: "Michigan Wolverines", conference: "Big Ten", division: "Big Ten", prestige: 94, offenseStyle: 'powerRun', defenseStyle: 'aggressive', logoAsset: 'logos/college/michigan.png' },
  { id: "michigan-state", name: "Michigan State University", shortName: "Michigan State Spartans", conference: "Big Ten", division: "Big Ten", prestige: 80, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/michigan-state.png' },
  { id: "minnesota", name: "University of Minnesota", shortName: "Minnesota Golden Gophers", conference: "Big Ten", division: "Big Ten", prestige: 76, offenseStyle: 'powerRun', defenseStyle: 'balanced', logoAsset: 'logos/college/minnesota.png' },
  { id: "nebraska", name: "University of Nebraska", shortName: "Nebraska Cornhuskers", conference: "Big Ten", division: "Big Ten", prestige: 83, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/nebraska.png' },
  { id: "northwestern", name: "Northwestern University", shortName: "Northwestern Wildcats", conference: "Big Ten", division: "Big Ten", prestige: 68, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/northwestern.png' },
  { id: "ohio-state", name: "Ohio State University", shortName: "Ohio State Buckeyes", conference: "Big Ten", division: "Big Ten", prestige: 98, offenseStyle: 'passHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/ohio-state.png' },
  { id: "oregon", name: "University of Oregon", shortName: "Oregon Ducks", conference: "Big Ten", division: "Big Ten", prestige: 93, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/oregon.png' },
  { id: "penn-state", name: "Penn State University", shortName: "Penn State Nittany Lions", conference: "Big Ten", division: "Big Ten", prestige: 91, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/penn-state.png' },
  { id: "purdue", name: "Purdue University", shortName: "Purdue Boilermakers", conference: "Big Ten", division: "Big Ten", prestige: 71, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/purdue.png' },
  { id: "rutgers", name: "Rutgers University", shortName: "Rutgers Scarlet Knights", conference: "Big Ten", division: "Big Ten", prestige: 68, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/rutgers.png' },
  { id: "ucla", name: "University of California, Los Angeles", shortName: "UCLA Bruins", conference: "Big Ten", division: "Big Ten", prestige: 78, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/ucla.png' },
  { id: "usc", name: "University of Southern California", shortName: "USC Trojans", conference: "Big Ten", division: "Big Ten", prestige: 91, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/usc.png' },
  { id: "washington", name: "University of Washington", shortName: "Washington Huskies", conference: "Big Ten", division: "Big Ten", prestige: 87, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/washington.png' },
  { id: "wisconsin", name: "University of Wisconsin", shortName: "Wisconsin Badgers", conference: "Big Ten", division: "Big Ten", prestige: 84, offenseStyle: 'powerRun', defenseStyle: 'conservative', logoAsset: 'logos/college/wisconsin.png' },
  { id: "arizona", name: "University of Arizona", shortName: "Arizona Wildcats", conference: "Big 12", division: "Big 12", prestige: 78, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/arizona.png' },
  { id: "arizona-state", name: "Arizona State University", shortName: "Arizona State Sun Devils", conference: "Big 12", division: "Big 12", prestige: 80, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/arizona-state.png' },
  { id: "baylor", name: "Baylor University", shortName: "Baylor Bears", conference: "Big 12", division: "Big 12", prestige: 79, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/baylor.png' },
  { id: "byu", name: "Brigham Young University", shortName: "BYU Cougars", conference: "Big 12", division: "Big 12", prestige: 84, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/byu.png' },
  { id: "cincinnati", name: "University of Cincinnati", shortName: "Cincinnati Bearcats", conference: "Big 12", division: "Big 12", prestige: 77, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/cincinnati.png' },
  { id: "colorado", name: "University of Colorado", shortName: "Colorado Buffaloes", conference: "Big 12", division: "Big 12", prestige: 82, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/colorado.png' },
  { id: "houston", name: "University of Houston", shortName: "Houston Cougars", conference: "Big 12", division: "Big 12", prestige: 76, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/houston.png' },
  { id: "iowa-state", name: "Iowa State University", shortName: "Iowa State Cyclones", conference: "Big 12", division: "Big 12", prestige: 81, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/iowa-state.png' },
  { id: "kansas", name: "University of Kansas", shortName: "Kansas Jayhawks", conference: "Big 12", division: "Big 12", prestige: 79, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/kansas.png' },
  { id: "kansas-state", name: "Kansas State University", shortName: "Kansas State Wildcats", conference: "Big 12", division: "Big 12", prestige: 84, offenseStyle: 'powerRun', defenseStyle: 'aggressive', logoAsset: 'logos/college/kansas-state.png' },
  { id: "oklahoma-state", name: "Oklahoma State University", shortName: "Oklahoma State Cowboys", conference: "Big 12", division: "Big 12", prestige: 81, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/oklahoma-state.png' },
  { id: "tcu", name: "Texas Christian University", shortName: "TCU Horned Frogs", conference: "Big 12", division: "Big 12", prestige: 83, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/tcu.png' },
  { id: "texas-tech", name: "Texas Tech University", shortName: "Texas Tech Red Raiders", conference: "Big 12", division: "Big 12", prestige: 86, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/texas-tech.png' },
  { id: "ucf", name: "University of Central Florida", shortName: "UCF Knights", conference: "Big 12", division: "Big 12", prestige: 78, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/ucf.png' },
  { id: "utah", name: "University of Utah", shortName: "Utah Utes", conference: "Big 12", division: "Big 12", prestige: 88, offenseStyle: 'powerRun', defenseStyle: 'aggressive', logoAsset: 'logos/college/utah.png' },
  { id: "west-virginia", name: "West Virginia University", shortName: "West Virginia Mountaineers", conference: "Big 12", division: "Big 12", prestige: 77, offenseStyle: 'runHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/west-virginia.png' },
  { id: "alabama", name: "University of Alabama", shortName: "Alabama Crimson Tide", conference: "SEC", division: "SEC", prestige: 96, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/alabama.png' },
  { id: "arkansas", name: "University of Arkansas", shortName: "Arkansas Razorbacks", conference: "SEC", division: "SEC", prestige: 78, offenseStyle: 'powerRun', defenseStyle: 'balanced', logoAsset: 'logos/college/arkansas.png' },
  { id: "auburn", name: "Auburn University", shortName: "Auburn Tigers", conference: "SEC", division: "SEC", prestige: 84, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/auburn.png' },
  { id: "florida", name: "University of Florida", shortName: "Florida Gators", conference: "SEC", division: "SEC", prestige: 85, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/florida.png' },
  { id: "georgia", name: "University of Georgia", shortName: "Georgia Bulldogs", conference: "SEC", division: "SEC", prestige: 98, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/georgia.png' },
  { id: "kentucky", name: "University of Kentucky", shortName: "Kentucky Wildcats", conference: "SEC", division: "SEC", prestige: 74, offenseStyle: 'powerRun', defenseStyle: 'balanced', logoAsset: 'logos/college/kentucky.png' },
  { id: "lsu", name: "Louisiana State University", shortName: "LSU Tigers", conference: "SEC", division: "SEC", prestige: 91, offenseStyle: 'passHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/lsu.png' },
  { id: "mississippi-state", name: "Mississippi State University", shortName: "Mississippi State Bulldogs", conference: "SEC", division: "SEC", prestige: 72, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/mississippi-state.png' },
  { id: "missouri", name: "University of Missouri", shortName: "Missouri Tigers", conference: "SEC", division: "SEC", prestige: 82, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/missouri.png' },
  { id: "oklahoma", name: "University of Oklahoma", shortName: "Oklahoma Sooners", conference: "SEC", division: "SEC", prestige: 90, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/oklahoma.png' },
  { id: "ole-miss", name: "University of Mississippi", shortName: "Ole Miss Rebels", conference: "SEC", division: "SEC", prestige: 84, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/ole-miss.png' },
  { id: "south-carolina", name: "University of South Carolina", shortName: "South Carolina Gamecocks", conference: "SEC", division: "SEC", prestige: 78, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/south-carolina.png' },
  { id: "tennessee", name: "University of Tennessee", shortName: "Tennessee Volunteers", conference: "SEC", division: "SEC", prestige: 88, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/tennessee.png' },
  { id: "texas", name: "University of Texas at Austin", shortName: "Texas Longhorns", conference: "SEC", division: "SEC", prestige: 95, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/texas.png' },
  { id: "texas-am", name: "Texas A&M University", shortName: "Texas A&M Aggies", conference: "SEC", division: "SEC", prestige: 86, offenseStyle: 'powerRun', defenseStyle: 'aggressive', logoAsset: 'logos/college/texas-am.png' },
  { id: "vanderbilt", name: "Vanderbilt University", shortName: "Vanderbilt Commodores", conference: "SEC", division: "SEC", prestige: 66, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/vanderbilt.png' },
  { id: "army", name: "United States Military Academy", shortName: "Army Black Knights", conference: "American", division: "American", prestige: 77, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/army.png' },
  { id: "charlotte", name: "University of North Carolina at Charlotte", shortName: "Charlotte 49ers", conference: "American", division: "American", prestige: 62, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/charlotte.png' },
  { id: "east-carolina", name: "East Carolina University", shortName: "East Carolina Pirates", conference: "American", division: "American", prestige: 70, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/east-carolina.png' },
  { id: "florida-atlantic", name: "Florida Atlantic University", shortName: "Florida Atlantic Owls", conference: "American", division: "American", prestige: 65, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/florida-atlantic.png' },
  { id: "memphis", name: "University of Memphis", shortName: "Memphis Tigers", conference: "American", division: "American", prestige: 79, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/memphis.png' },
  { id: "navy", name: "United States Naval Academy", shortName: "Navy Midshipmen", conference: "American", division: "American", prestige: 74, offenseStyle: 'runHeavy', defenseStyle: 'conservative', logoAsset: 'logos/college/navy.png' },
  { id: "north-texas", name: "University of North Texas", shortName: "North Texas Mean Green", conference: "American", division: "American", prestige: 72, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/north-texas.png' },
  { id: "rice", name: "Rice University", shortName: "Rice Owls", conference: "American", division: "American", prestige: 62, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/rice.png' },
  { id: "south-florida", name: "University of South Florida", shortName: "South Florida Bulls", conference: "American", division: "American", prestige: 73, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/south-florida.png' },
  { id: "temple", name: "Temple University", shortName: "Temple Owls", conference: "American", division: "American", prestige: 64, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/temple.png' },
  { id: "tulane", name: "Tulane University", shortName: "Tulane Green Wave", conference: "American", division: "American", prestige: 82, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/tulane.png' },
  { id: "tulsa", name: "University of Tulsa", shortName: "Tulsa Golden Hurricane", conference: "American", division: "American", prestige: 65, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/tulsa.png' },
  { id: "uab", name: "University of Alabama at Birmingham", shortName: "UAB Blazers", conference: "American", division: "American", prestige: 68, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/uab.png' },
  { id: "utsa", name: "University of Texas at San Antonio", shortName: "UTSA Roadrunners", conference: "American", division: "American", prestige: 78, offenseStyle: 'spread', defenseStyle: 'aggressive', logoAsset: 'logos/college/utsa.png' },
  { id: "delaware", name: "University of Delaware", shortName: "Delaware Fightin' Blue Hens", conference: "CUSA", division: "CUSA", prestige: 60, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/delaware.png' },
  { id: "fiu", name: "Florida International University", shortName: "FIU Panthers", conference: "CUSA", division: "CUSA", prestige: 58, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/fiu.png' },
  { id: "jacksonville-state", name: "Jacksonville State University", shortName: "Jacksonville State Gamecocks", conference: "CUSA", division: "CUSA", prestige: 68, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/jacksonville-state.png' },
  { id: "kennesaw-state", name: "Kennesaw State University", shortName: "Kennesaw State Owls", conference: "CUSA", division: "CUSA", prestige: 58, offenseStyle: 'runHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/kennesaw-state.png' },
  { id: "liberty", name: "Liberty University", shortName: "Liberty Flames", conference: "CUSA", division: "CUSA", prestige: 78, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/liberty.png' },
  { id: "louisiana-tech", name: "Louisiana Tech University", shortName: "Louisiana Tech Bulldogs", conference: "CUSA", division: "CUSA", prestige: 67, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/louisiana-tech.png' },
  { id: "middle-tennessee", name: "Middle Tennessee State University", shortName: "Middle Tennessee Blue Raiders", conference: "CUSA", division: "CUSA", prestige: 63, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/middle-tennessee.png' },
  { id: "missouri-state", name: "Missouri State University", shortName: "Missouri State Bears", conference: "CUSA", division: "CUSA", prestige: 58, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/missouri-state.png' },
  { id: "new-mexico-state", name: "New Mexico State University", shortName: "New Mexico State Aggies", conference: "CUSA", division: "CUSA", prestige: 62, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/new-mexico-state.png' },
  { id: "sam-houston", name: "Sam Houston State University", shortName: "Sam Houston Bearkats", conference: "CUSA", division: "CUSA", prestige: 64, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/sam-houston.png' },
  { id: "utep", name: "University of Texas at El Paso", shortName: "UTEP Miners", conference: "CUSA", division: "CUSA", prestige: 61, offenseStyle: 'runHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/utep.png' },
  { id: "western-kentucky", name: "Western Kentucky University", shortName: "Western Kentucky Hilltoppers", conference: "CUSA", division: "CUSA", prestige: 71, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/western-kentucky.png' },
  { id: "akron", name: "University of Akron", shortName: "Akron Zips", conference: "MAC", division: "MAC", prestige: 58, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/akron.png' },
  { id: "ball-state", name: "Ball State University", shortName: "Ball State Cardinals", conference: "MAC", division: "MAC", prestige: 61, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/ball-state.png' },
  { id: "bowling-green", name: "Bowling Green State University", shortName: "Bowling Green Falcons", conference: "MAC", division: "MAC", prestige: 65, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/bowling-green.png' },
  { id: "buffalo", name: "University at Buffalo", shortName: "Buffalo Bulls", conference: "MAC", division: "MAC", prestige: 66, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/buffalo.png' },
  { id: "central-michigan", name: "Central Michigan University", shortName: "Central Michigan Chippewas", conference: "MAC", division: "MAC", prestige: 65, offenseStyle: 'runHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/central-michigan.png' },
  { id: "eastern-michigan", name: "Eastern Michigan University", shortName: "Eastern Michigan Eagles", conference: "MAC", division: "MAC", prestige: 64, offenseStyle: 'balanced', defenseStyle: 'conservative', logoAsset: 'logos/college/eastern-michigan.png' },
  { id: "kent-state", name: "Kent State University", shortName: "Kent State Golden Flashes", conference: "MAC", division: "MAC", prestige: 58, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/kent-state.png' },
  { id: "miami-oh", name: "Miami University", shortName: "Miami (OH) RedHawks", conference: "MAC", division: "MAC", prestige: 72, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/miami-oh.png' },
  { id: "northern-illinois", name: "Northern Illinois University", shortName: "Northern Illinois Huskies", conference: "MAC", division: "MAC", prestige: 67, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/northern-illinois.png' },
  { id: "ohio", name: "Ohio University", shortName: "Ohio Bobcats", conference: "MAC", division: "MAC", prestige: 70, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/ohio.png' },
  { id: "toledo", name: "University of Toledo", shortName: "Toledo Rockets", conference: "MAC", division: "MAC", prestige: 72, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/toledo.png' },
  { id: "umass", name: "University of Massachusetts", shortName: "UMass Minutemen", conference: "MAC", division: "MAC", prestige: 59, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/umass.png' },
  { id: "western-michigan", name: "Western Michigan University", shortName: "Western Michigan Broncos", conference: "MAC", division: "MAC", prestige: 68, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/western-michigan.png' },
  { id: "air-force", name: "United States Air Force Academy", shortName: "Air Force Falcons", conference: "Mountain West", division: "Mountain West", prestige: 72, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/air-force.png' },
  { id: "boise-state", name: "Boise State University", shortName: "Boise State Broncos", conference: "Mountain West", division: "Mountain West", prestige: 86, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/boise-state.png' },
  { id: "colorado-state", name: "Colorado State University", shortName: "Colorado State Rams", conference: "Mountain West", division: "Mountain West", prestige: 68, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/colorado-state.png' },
  { id: "fresno-state", name: "California State University, Fresno", shortName: "Fresno State Bulldogs", conference: "Mountain West", division: "Mountain West", prestige: 75, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/fresno-state.png' },
  { id: "hawaii", name: "University of Hawai'i", shortName: "Hawai'i Rainbow Warriors", conference: "Mountain West", division: "Mountain West", prestige: 66, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/hawaii.png' },
  { id: "nevada", name: "University of Nevada", shortName: "Nevada Wolf Pack", conference: "Mountain West", division: "Mountain West", prestige: 63, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/nevada.png' },
  { id: "new-mexico", name: "University of New Mexico", shortName: "New Mexico Lobos", conference: "Mountain West", division: "Mountain West", prestige: 64, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/new-mexico.png' },
  { id: "san-diego-state", name: "San Diego State University", shortName: "San Diego State Aztecs", conference: "Mountain West", division: "Mountain West", prestige: 73, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/san-diego-state.png' },
  { id: "san-jose-state", name: "San José State University", shortName: "San José State Spartans", conference: "Mountain West", division: "Mountain West", prestige: 67, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/san-jose-state.png' },
  { id: "unlv", name: "University of Nevada, Las Vegas", shortName: "UNLV Rebels", conference: "Mountain West", division: "Mountain West", prestige: 76, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/unlv.png' },
  { id: "utah-state", name: "Utah State University", shortName: "Utah State Aggies", conference: "Mountain West", division: "Mountain West", prestige: 66, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/utah-state.png' },
  { id: "wyoming", name: "University of Wyoming", shortName: "Wyoming Cowboys", conference: "Mountain West", division: "Mountain West", prestige: 67, offenseStyle: 'powerRun', defenseStyle: 'conservative', logoAsset: 'logos/college/wyoming.png' },
  { id: "oregon-state", name: "Oregon State University", shortName: "Oregon State Beavers", conference: "Pac-12", division: "Pac-12", prestige: 75, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/oregon-state.png' },
  { id: "washington-state", name: "Washington State University", shortName: "Washington State Cougars", conference: "Pac-12", division: "Pac-12", prestige: 74, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/washington-state.png' },
  { id: "appalachian-state", name: "Appalachian State University", shortName: "Appalachian State Mountaineers", conference: "Sun Belt", division: "Sun Belt", prestige: 77, offenseStyle: 'runHeavy', defenseStyle: 'aggressive', logoAsset: 'logos/college/appalachian-state.png' },
  { id: "arkansas-state", name: "Arkansas State University", shortName: "Arkansas State Red Wolves", conference: "Sun Belt", division: "Sun Belt", prestige: 65, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/arkansas-state.png' },
  { id: "coastal-carolina", name: "Coastal Carolina University", shortName: "Coastal Carolina Chanticleers", conference: "Sun Belt", division: "Sun Belt", prestige: 71, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/coastal-carolina.png' },
  { id: "georgia-southern", name: "Georgia Southern University", shortName: "Georgia Southern Eagles", conference: "Sun Belt", division: "Sun Belt", prestige: 69, offenseStyle: 'runHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/georgia-southern.png' },
  { id: "georgia-state", name: "Georgia State University", shortName: "Georgia State Panthers", conference: "Sun Belt", division: "Sun Belt", prestige: 64, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/georgia-state.png' },
  { id: "james-madison", name: "James Madison University", shortName: "James Madison Dukes", conference: "Sun Belt", division: "Sun Belt", prestige: 82, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/james-madison.png' },
  { id: "louisiana", name: "University of Louisiana", shortName: "Louisiana Ragin' Cajuns", conference: "Sun Belt", division: "Sun Belt", prestige: 73, offenseStyle: 'runHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/louisiana.png' },
  { id: "marshall", name: "Marshall University", shortName: "Marshall Thundering Herd", conference: "Sun Belt", division: "Sun Belt", prestige: 72, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/marshall.png' },
  { id: "old-dominion", name: "Old Dominion University", shortName: "Old Dominion Monarchs", conference: "Sun Belt", division: "Sun Belt", prestige: 64, offenseStyle: 'passHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/old-dominion.png' },
  { id: "south-alabama", name: "University of South Alabama", shortName: "South Alabama Jaguars", conference: "Sun Belt", division: "Sun Belt", prestige: 68, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/south-alabama.png' },
  { id: "southern-miss", name: "University of Southern Mississippi", shortName: "Southern Miss Golden Eagles", conference: "Sun Belt", division: "Sun Belt", prestige: 66, offenseStyle: 'runHeavy', defenseStyle: 'balanced', logoAsset: 'logos/college/southern-miss.png' },
  { id: "texas-state", name: "Texas State University", shortName: "Texas State Bobcats", conference: "Sun Belt", division: "Sun Belt", prestige: 70, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/texas-state.png' },
  { id: "troy", name: "Troy University", shortName: "Troy Trojans", conference: "Sun Belt", division: "Sun Belt", prestige: 72, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/troy.png' },
  { id: "ulm", name: "University of Louisiana Monroe", shortName: "ULM Warhawks", conference: "Sun Belt", division: "Sun Belt", prestige: 59, offenseStyle: 'spread', defenseStyle: 'balanced', logoAsset: 'logos/college/ulm.png' },
  { id: "notre-dame", name: "University of Notre Dame", shortName: "Notre Dame Fighting Irish", conference: "Independent", division: "Independent", prestige: 96, offenseStyle: 'balanced', defenseStyle: 'aggressive', logoAsset: 'logos/college/notre-dame.png' },
  { id: "uconn", name: "University of Connecticut", shortName: "UConn Huskies", conference: "Independent", division: "Independent", prestige: 63, offenseStyle: 'balanced', defenseStyle: 'balanced', logoAsset: 'logos/college/uconn.png' }
];

const rivalryPairs: Array<[string, string]> = [
  ["alabama", "auburn"],
  ["ole-miss", "mississippi-state"],
  ["texas", "oklahoma"],
  ["florida", "georgia"],
  ["texas", "texas-am"],
  ["tennessee", "alabama"],
  ["michigan", "ohio-state"],
  ["usc", "ucla"],
  ["oregon", "washington"],
  ["iowa", "nebraska"],
  ["minnesota", "wisconsin"],
  ["indiana", "purdue"],
  ["michigan", "michigan-state"],
  ["illinois", "northwestern"],
  ["arizona", "arizona-state"],
  ["utah", "byu"],
  ["kansas", "kansas-state"],
  ["oklahoma-state", "texas-tech"],
  ["army", "navy"],
  ["memphis", "tulane"],
  ["air-force", "boise-state"],
  ["oregon-state", "washington-state"],
  ["appalachian-state", "georgia-southern"],
  ["louisiana", "ulm"],
  ["troy", "south-alabama"],
  ["miami-oh", "ohio"],
  ["central-michigan", "western-michigan"],
  ["toledo", "bowling-green"],
  ["liberty", "western-kentucky"],
  ["new-mexico", "new-mexico-state"]
];

function stableId(prefix: string, seedId: string) {
  return `${prefix}_${seedId}`;
}

function pickNeeds(rng: SeededRng) {
  return rng.shuffle(needsPool).slice(0, 3);
}

function addCollegeRivalry(first: CollegeTeam, second: CollegeTeam) {
  if (first.id === second.id) {
    return;
  }

  if (first.rivalryIds.length < 3 && !first.rivalryIds.includes(second.id)) {
    first.rivalryIds.push(second.id);
  }

  if (second.rivalryIds.length < 3 && !second.rivalryIds.includes(first.id)) {
    second.rivalryIds.push(first.id);
  }
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

    addCollegeRivalry(left, right);
  });

  const byConference = new Map<string, CollegeTeam[]>();

  next.forEach((team) => {
    const teamsInConference = byConference.get(team.conference ?? 'Independent') ?? [];
    teamsInConference.push(team);
    byConference.set(team.conference ?? 'Independent', teamsInConference);
  });

  byConference.forEach((conferenceTeams) => {
    const ordered = [...conferenceTeams].sort((left, right) => right.prestige - left.prestige || left.shortName.localeCompare(right.shortName));

    ordered.forEach((team, index) => {
      let cursor = 1;

      while (team.rivalryIds.length < 2 && cursor < ordered.length) {
        const candidate = ordered[(index + cursor) % ordered.length];
        if (candidate) addCollegeRivalry(team, candidate);
        cursor += 1;
      }
    });
  });

  const globalOrdered = [...next].sort((left, right) => right.prestige - left.prestige || left.shortName.localeCompare(right.shortName));

  globalOrdered.forEach((team, index) => {
    let cursor = 1;

    while (team.rivalryIds.length < 1 && cursor < globalOrdered.length) {
      const candidate = globalOrdered[(index + cursor) % globalOrdered.length];
      if (candidate) addCollegeRivalry(team, candidate);
      cursor += 1;
    }

    team.rivalryIds = team.rivalryIds.slice(0, 3);
  });

  return next;
}

export function getRealCollegeSeeds() {
  return realCollegeSeeds;
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
