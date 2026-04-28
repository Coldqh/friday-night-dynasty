import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';
import { calculateRankings } from '../../core/rankings/calculateRankings';

export function RankingsScreen() {
  const world = useGameStore((state) => state.world)!;
  const rankings = calculateRankings(world);

  return (
    <Card title="State Rankings">
      <div className="table compact-table">
        <div className="table-head grid-rankings">
          <span>#</span><span>Команда</span><span>W-L</span><span>Power</span>
        </div>
        {rankings.map((entry, index) => (
          <div className="table-row grid-rankings" key={entry.team.id}>
            <span>{index + 1}</span>
            <span>{entry.team.name}</span>
            <span>{entry.team.wins}-{entry.team.losses}</span>
            <strong>{entry.rating}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}
