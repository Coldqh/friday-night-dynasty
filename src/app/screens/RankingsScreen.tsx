import { Card } from '../components/Card';
import { getCollegeStandings } from '../../core/colleges/getCollegeDisplayData';
import { useGameStore } from '../store/useGameStore';

function groupByConference<T extends { conference: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    groups[item.conference] = [...(groups[item.conference] ?? []), item];
    return groups;
  }, {});
}

export function RankingsScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);

  if (activeLeague === 'college') {
    const collegeTeamLookup = new Map((world.collegeTeams ?? []).map((team) => [team.id, team]));
    const standings = getCollegeStandings(world).map((entry) => ({
      ...entry,
      conference: collegeTeamLookup.get(entry.teamId)?.conference ?? 'Independent'
    }));
    const grouped = groupByConference(standings);

    return (
      <div className="stack">
        {Object.entries(grouped).map(([conference, entries]) => (
          <Card title={conference} key={conference}>
            <div className="table compact-table">
              <div className="table-head grid-standings">
                <span>#</span>
                <span>команда</span>
                <span>п-б</span>
                <span>очк+</span>
                <span>очк-</span>
                <span>разн</span>
              </div>

              {entries.map((entry) => (
                <button
                  className="table-row grid-standings table-row-button"
                  key={entry.teamId}
                  onClick={() => openCollegeTeamProfile(entry.teamId, 'overview', 'rankings')}
                >
                  <span>{entry.rank}</span>
                  <span>{entry.teamName}</span>
                  <span>
                    {entry.wins}-{entry.losses}
                  </span>
                  <span>{entry.pointsFor}</span>
                  <span>{entry.pointsAgainst}</span>
                  <strong>{entry.pointDifferential}</strong>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const standings = world.season.standings;

  return (
    <Card title="Турнирная таблица">
      <div className="table compact-table">
        <div className="table-head grid-standings">
          <span>#</span>
          <span>команда</span>
          <span>п-б</span>
          <span>очк+</span>
          <span>очк-</span>
          <span>разн</span>
        </div>

        {standings.map((entry) => (
          <button
            className="table-row grid-standings table-row-button"
            key={entry.teamId}
            onClick={() => openTeamProfile(entry.teamId, 'overview', 'rankings')}
          >
            <span>{entry.rank}</span>
            <span>{entry.teamName}</span>
            <span>
              {entry.wins}-{entry.losses}
            </span>
            <span>{entry.pointsFor}</span>
            <span>{entry.pointsAgainst}</span>
            <strong>{entry.pointDifferential}</strong>
          </button>
        ))}
      </div>
    </Card>
  );
}
