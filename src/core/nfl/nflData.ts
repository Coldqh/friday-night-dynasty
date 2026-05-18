import { NFLTeam } from './nflTypes';

export const nflTeamSeeds = [
  { id: 'nfl_buf', city: 'Buffalo', name: 'Bills', shortName: 'Buffalo Bills', abbreviation: 'BUF', conference: 'AFC', division: 'AFC East', prestige: 88, logoAsset: 'logos/nfl/buf.png' },
  { id: 'nfl_mia', city: 'Miami', name: 'Dolphins', shortName: 'Miami Dolphins', abbreviation: 'MIA', conference: 'AFC', division: 'AFC East', prestige: 84, logoAsset: 'logos/nfl/mia.png' },
  { id: 'nfl_ne', city: 'New England', name: 'Patriots', shortName: 'New England Patriots', abbreviation: 'NE', conference: 'AFC', division: 'AFC East', prestige: 78, logoAsset: 'logos/nfl/ne.png' },
  { id: 'nfl_nyj', city: 'New York', name: 'Jets', shortName: 'New York Jets', abbreviation: 'NYJ', conference: 'AFC', division: 'AFC East', prestige: 76, logoAsset: 'logos/nfl/nyj.png' },
  { id: 'nfl_bal', city: 'Baltimore', name: 'Ravens', shortName: 'Baltimore Ravens', abbreviation: 'BAL', conference: 'AFC', division: 'AFC North', prestige: 91, logoAsset: 'logos/nfl/bal.png' },
  { id: 'nfl_cin', city: 'Cincinnati', name: 'Bengals', shortName: 'Cincinnati Bengals', abbreviation: 'CIN', conference: 'AFC', division: 'AFC North', prestige: 86, logoAsset: 'logos/nfl/cin.png' },
  { id: 'nfl_cle', city: 'Cleveland', name: 'Browns', shortName: 'Cleveland Browns', abbreviation: 'CLE', conference: 'AFC', division: 'AFC North', prestige: 80, logoAsset: 'logos/nfl/cle.png' },
  { id: 'nfl_pit', city: 'Pittsburgh', name: 'Steelers', shortName: 'Pittsburgh Steelers', abbreviation: 'PIT', conference: 'AFC', division: 'AFC North', prestige: 84, logoAsset: 'logos/nfl/pit.png' },
  { id: 'nfl_hou', city: 'Houston', name: 'Texans', shortName: 'Houston Texans', abbreviation: 'HOU', conference: 'AFC', division: 'AFC South', prestige: 85, logoAsset: 'logos/nfl/hou.png' },
  { id: 'nfl_ind', city: 'Indianapolis', name: 'Colts', shortName: 'Indianapolis Colts', abbreviation: 'IND', conference: 'AFC', division: 'AFC South', prestige: 79, logoAsset: 'logos/nfl/ind.png' },
  { id: 'nfl_jax', city: 'Jacksonville', name: 'Jaguars', shortName: 'Jacksonville Jaguars', abbreviation: 'JAX', conference: 'AFC', division: 'AFC South', prestige: 77, logoAsset: 'logos/nfl/jax.png' },
  { id: 'nfl_ten', city: 'Tennessee', name: 'Titans', shortName: 'Tennessee Titans', abbreviation: 'TEN', conference: 'AFC', division: 'AFC South', prestige: 74, logoAsset: 'logos/nfl/ten.png' },
  { id: 'nfl_den', city: 'Denver', name: 'Broncos', shortName: 'Denver Broncos', abbreviation: 'DEN', conference: 'AFC', division: 'AFC West', prestige: 82, logoAsset: 'logos/nfl/den.png' },
  { id: 'nfl_kc', city: 'Kansas City', name: 'Chiefs', shortName: 'Kansas City Chiefs', abbreviation: 'KC', conference: 'AFC', division: 'AFC West', prestige: 96, logoAsset: 'logos/nfl/kc.png' },
  { id: 'nfl_lv', city: 'Las Vegas', name: 'Raiders', shortName: 'Las Vegas Raiders', abbreviation: 'LV', conference: 'AFC', division: 'AFC West', prestige: 76, logoAsset: 'logos/nfl/lv.png' },
  { id: 'nfl_lac', city: 'Los Angeles', name: 'Chargers', shortName: 'Los Angeles Chargers', abbreviation: 'LAC', conference: 'AFC', division: 'AFC West', prestige: 83, logoAsset: 'logos/nfl/lac.png' },
  { id: 'nfl_dal', city: 'Dallas', name: 'Cowboys', shortName: 'Dallas Cowboys', abbreviation: 'DAL', conference: 'NFC', division: 'NFC East', prestige: 88, logoAsset: 'logos/nfl/dal.png' },
  { id: 'nfl_nyg', city: 'New York', name: 'Giants', shortName: 'New York Giants', abbreviation: 'NYG', conference: 'NFC', division: 'NFC East', prestige: 73, logoAsset: 'logos/nfl/nyg.png' },
  { id: 'nfl_phi', city: 'Philadelphia', name: 'Eagles', shortName: 'Philadelphia Eagles', abbreviation: 'PHI', conference: 'NFC', division: 'NFC East', prestige: 91, logoAsset: 'logos/nfl/phi.png' },
  { id: 'nfl_wsh', city: 'Washington', name: 'Commanders', shortName: 'Washington Commanders', abbreviation: 'WSH', conference: 'NFC', division: 'NFC East', prestige: 82, logoAsset: 'logos/nfl/wsh.png' },
  { id: 'nfl_chi', city: 'Chicago', name: 'Bears', shortName: 'Chicago Bears', abbreviation: 'CHI', conference: 'NFC', division: 'NFC North', prestige: 80, logoAsset: 'logos/nfl/chi.png' },
  { id: 'nfl_det', city: 'Detroit', name: 'Lions', shortName: 'Detroit Lions', abbreviation: 'DET', conference: 'NFC', division: 'NFC North', prestige: 91, logoAsset: 'logos/nfl/det.png' },
  { id: 'nfl_gb', city: 'Green Bay', name: 'Packers', shortName: 'Green Bay Packers', abbreviation: 'GB', conference: 'NFC', division: 'NFC North', prestige: 87, logoAsset: 'logos/nfl/gb.png' },
  { id: 'nfl_min', city: 'Minnesota', name: 'Vikings', shortName: 'Minnesota Vikings', abbreviation: 'MIN', conference: 'NFC', division: 'NFC North', prestige: 83, logoAsset: 'logos/nfl/min.png' },
  { id: 'nfl_atl', city: 'Atlanta', name: 'Falcons', shortName: 'Atlanta Falcons', abbreviation: 'ATL', conference: 'NFC', division: 'NFC South', prestige: 78, logoAsset: 'logos/nfl/atl.png' },
  { id: 'nfl_car', city: 'Carolina', name: 'Panthers', shortName: 'Carolina Panthers', abbreviation: 'CAR', conference: 'NFC', division: 'NFC South', prestige: 70, logoAsset: 'logos/nfl/car.png' },
  { id: 'nfl_no', city: 'New Orleans', name: 'Saints', shortName: 'New Orleans Saints', abbreviation: 'NO', conference: 'NFC', division: 'NFC South', prestige: 76, logoAsset: 'logos/nfl/no.png' },
  { id: 'nfl_tb', city: 'Tampa Bay', name: 'Buccaneers', shortName: 'Tampa Bay Buccaneers', abbreviation: 'TB', conference: 'NFC', division: 'NFC South', prestige: 82, logoAsset: 'logos/nfl/tb.png' },
  { id: 'nfl_ari', city: 'Arizona', name: 'Cardinals', shortName: 'Arizona Cardinals', abbreviation: 'ARI', conference: 'NFC', division: 'NFC West', prestige: 75, logoAsset: 'logos/nfl/ari.png' },
  { id: 'nfl_lar', city: 'Los Angeles', name: 'Rams', shortName: 'Los Angeles Rams', abbreviation: 'LAR', conference: 'NFC', division: 'NFC West', prestige: 85, logoAsset: 'logos/nfl/lar.png' },
  { id: 'nfl_sf', city: 'San Francisco', name: '49ers', shortName: 'San Francisco 49ers', abbreviation: 'SF', conference: 'NFC', division: 'NFC West', prestige: 92, logoAsset: 'logos/nfl/sf.png' },
  { id: 'nfl_sea', city: 'Seattle', name: 'Seahawks', shortName: 'Seattle Seahawks', abbreviation: 'SEA', conference: 'NFC', division: 'NFC West', prestige: 81, logoAsset: 'logos/nfl/sea.png' }
] satisfies Array<Omit<NFLTeam, 'wins' | 'losses' | 'pointsFor' | 'pointsAgainst' | 'rosterPlayerIds' | 'history'>>;

export const nflDivisions = [
  'AFC East',
  'AFC North',
  'AFC South',
  'AFC West',
  'NFC East',
  'NFC North',
  'NFC South',
  'NFC West'
] as const;
