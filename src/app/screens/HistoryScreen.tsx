import { Card } from '../components/Card';
import { getLeagueHistorySnapshot } from '../../core/history/getLeagueHistorySnapshot';
import { useGameStore } from '../store/useGameStore';

export const historySections = ['История лиги', 'Чемпионы штата'] as const;

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;
  const history = getLeagueHistorySnapshot(world);

  return (
    <div className="stack">
      <Card title="История лиги">
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>завершённых сезонов {history.totalSeasonsCompleted}</span>
            <span>последний чемпион {history.latestChampion?.championName ?? 'ещё нет'}</span>
          </div>

          {history.latestChampion ? (
            <div className="history-item">
              <div className="eyebrow">последний титул</div>
              <h3>{history.latestChampion.championName}</h3>
              <p>
                {history.latestChampion.year} / {history.latestChampion.runnerUpName} / {history.latestChampion.finalScore}
              </p>
              <p>{history.latestChampion.finalSummary}</p>
            </div>
          ) : (
            <p className="muted">Texoma ещё ждёт первый завершённый чемпионский сезон.</p>
          )}
        </div>
      </Card>

      <Card title="Чемпионы штата">
        {history.champions.length === 0 ? (
          <p className="muted">Чемпионов пока нет.</p>
        ) : (
          <div className="list">
            {history.champions.map((entry) => (
              <div className="history-item" key={`champion-${entry.year}`}>
                <div className="eyebrow">{entry.year}</div>
                <h3>{entry.championName}</h3>
                <p>
                  чемпион: <strong>{entry.championName}</strong>
                </p>
                <p>финалист: {entry.runnerUpName}</p>
                <p>
                  счёт финала: <strong>{entry.finalScore}</strong>
                </p>
                <p>{entry.finalSummary}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
