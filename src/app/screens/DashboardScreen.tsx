import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useGameStore } from '../store/useGameStore';
import { calculateRankings } from '../../core/rankings/calculateRankings';

export function DashboardScreen() {
  const world = useGameStore((state) => state.world)!;
  const simNextWeek = useGameStore((state) => state.simNextWeek);
  const simFullSeason = useGameStore((state) => state.simFullSeason);
  const rankings = calculateRankings(world).slice(0, 5);

  return (
    <div className="stack">
      <Card title="Неделя">
        <p className="big-number">Week {world.currentWeek + 1}</p>
        <p className="muted">Фаза: {world.phase}</p>
        <div className="button-row">
          <Button onClick={simNextWeek}>Sim Week</Button>
          <Button variant="ghost" onClick={simFullSeason}>Sim Season</Button>
        </div>
      </Card>

      <Card title="Топ школ">
        <div className="list">
          {rankings.map((entry, index) => (
            <div className="list-row" key={entry.team.id}>
              <span>#{index + 1} {entry.team.name}</span>
              <strong>{entry.rating}</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Свежие новости">
        <div className="list">
          {world.news.slice(0, 5).map((item) => (
            <div className="news-item" key={item.id}>
              <strong>{item.headline}</strong>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
