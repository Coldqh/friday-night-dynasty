import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;

  return (
    <div className="stack">
      <Card title="История сезона">
        {world.season.historyEntries.length === 0 ? (
          <p className="muted">История сезона появится после первых симулированных недель.</p>
        ) : (
          <div className="list">
            {world.season.historyEntries.map((entry) => (
              <div className="history-item" key={entry.id}>
                <div className="eyebrow">
                  {entry.year} / Week {entry.week + 1}
                </div>
                <h3>{entry.headline}</h3>
                <p>{entry.body}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Чемпионы штата">
        {world.history.seasons.length === 0 ? (
          <p className="muted">Пока нет завершённых сезонов. Просимулируй сезон до чемпиона.</p>
        ) : (
          <div className="list">
            {world.history.seasons.map((season) => (
              <div className="history-item" key={season.year}>
                <h3>
                  {season.year}: {season.championName}
                </h3>
                <p>
                  Финал: <strong>{season.finalScore}</strong>
                </p>
                <p>Runner-up: {season.runnerUpName}</p>
                <p>MVP: {season.mvpName}</p>
                <p>{season.finalSummary}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
