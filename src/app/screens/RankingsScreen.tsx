import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function RankingsScreen() {
  const world = useGameStore((state) => state.world)!;
  const standings = world.season.standings;

  return (
    <Card title="Standings">
      <div className="table compact-table">
        <div className="table-head grid-standings">
          <span>#</span>
          <span>Команда</span>
          <span>W-L</span>
          <span>PF</span>
          <span>PA</span>
          <span>Diff</span>
        </div>
        {standings.map((entry) => (
          <div className="table-row grid-standings" key={entry.teamId}>
            <span>{entry.rank}</span>
            <span>{entry.teamName}</span>
            <span>
              {entry.wins}-{entry.losses}
            </span>
            <span>{entry.pointsFor}</span>
            <span>{entry.pointsAgainst}</span>
            <strong>{entry.pointDifferential}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}
