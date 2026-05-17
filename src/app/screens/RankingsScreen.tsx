import { Card } from '../components/Card';
import { getCollegeStandings } from '../../core/colleges/getCollegeDisplayData';
import { useGameStore } from '../store/useGameStore';

export function RankingsScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);

  if (activeLeague === 'college') {
    const standings = getCollegeStandings(world);

    return (
      <Card title="Таблица колледжей">
        <div className="table compact-table">
          <div className="table-head grid-college-standings">
            <span>#</span>
            <span>команда</span>
            <span>п-б</span>
            <span>сила</span>
            <span>позиции</span>
          </div>

          {standings.map((entry) => (
            <button
              className="table-row grid-college-standings table-row-button"
              key={entry.teamId}
              onClick={() => openCollegeTeamProfile(entry.teamId, 'overview', 'rankings')}
            >
              <span>{entry.rank}</span>
              <span>{entry.teamName}</span>
              <span>
                {entry.wins}-{entry.losses}
              </span>
              <strong>{entry.rosterStrength}</strong>
              <span>{entry.recruitingNeeds}</span>
            </button>
          ))}
        </div>
      </Card>
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
