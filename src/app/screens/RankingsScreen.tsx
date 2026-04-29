import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function RankingsScreen() {
  const world = useGameStore((state) => state.world)!;
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const standings = world.season.standings;

  return (
    <Card title="Standings">
      <p className="muted">Tap any team to open its program profile.</p>

      <div className="table compact-table">
        <div className="table-head grid-standings">
          <span>#</span>
          <span>Team</span>
          <span>W-L</span>
          <span>PF</span>
          <span>PA</span>
          <span>Diff</span>
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
