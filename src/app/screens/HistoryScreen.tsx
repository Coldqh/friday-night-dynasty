import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;

  return (
    <Card title="История штата">
      {world.history.seasons.length === 0 ? (
        <p className="muted">Пока нет завершённых сезонов. Просимулируй сезон.</p>
      ) : (
        <div className="list">
          {world.history.seasons.map((season) => (
            <div className="history-item" key={season.year}>
              <h3>{season.year}</h3>
              <p>Champion: <strong>{season.championName}</strong></p>
              <p>MVP: {season.mvpName}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
