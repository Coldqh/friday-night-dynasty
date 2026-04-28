import { Card } from '../components/Card';
import { getHistorySnapshot } from '../../core/history/getHistorySnapshot';
import { useGameStore } from '../store/useGameStore';

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;
  const history = getHistorySnapshot(world);

  return (
    <div className="stack">
      <Card title="Чемпионы штата">
        {history.champions.length === 0 ? (
          <p className="muted">Пока нет завершённых сезонов. Просимулируй сезон до чемпиона.</p>
        ) : (
          <div className="list">
            {history.champions.map((season) => (
              <div className="history-item" key={`${season.year}-${season.championId}`}>
                <div className="eyebrow">{season.year}</div>
                <h3>{season.championName}</h3>
                <p>
                  Финал штата: <strong>{season.finalScore}</strong>
                </p>
                <p>Runner-up: {season.runnerUpName}</p>
                <p>{season.finalSummary}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Финалы штата">
        {history.titleGames.length === 0 ? (
          <p className="muted">Финал штата появится здесь после завершения сезона.</p>
        ) : (
          <div className="list">
            {history.titleGames.map((game) => (
              <div className="history-item" key={game.gameId}>
                <div className="eyebrow">{game.year}</div>
                <h3>
                  {game.championName} vs {game.runnerUpName}
                </h3>
                <p>
                  Champion: <strong>{game.championName}</strong>
                </p>
                <p>
                  Финальный счёт: <strong>{game.finalScore}</strong>
                </p>
                <p>{game.summary}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
