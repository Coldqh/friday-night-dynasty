import { Card } from '../components/Card';
import { getLeagueHistorySnapshot } from '../../core/history/getLeagueHistorySnapshot';
import { useGameStore } from '../store/useGameStore';

export const historySections = ['League History', 'State Champions'] as const;

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;
  const history = getLeagueHistorySnapshot(world);

  return (
    <div className="stack">
      <Card title="League History">
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>Seasons completed {history.totalSeasonsCompleted}</span>
            <span>Latest champion {history.latestChampion?.championName ?? 'TBD'}</span>
          </div>

          {history.latestChampion ? (
            <div className="history-item">
              <div className="eyebrow">Latest title run</div>
              <h3>{history.latestChampion.championName}</h3>
              <p>
                {history.latestChampion.year} / {history.latestChampion.runnerUpName} / {history.latestChampion.finalScore}
              </p>
              <p>{history.latestChampion.finalSummary}</p>
            </div>
          ) : (
            <p className="muted">Texoma is still waiting on its first completed championship season.</p>
          )}
        </div>
      </Card>

      <Card title="State Champions">
        {history.champions.length === 0 ? (
          <p className="muted">No champions have been crowned yet.</p>
        ) : (
          <div className="list">
            {history.champions.map((entry) => (
              <div className="history-item" key={`champion-${entry.year}`}>
                <div className="eyebrow">{entry.year}</div>
                <h3>{entry.championName}</h3>
                <p>
                  Champion: <strong>{entry.championName}</strong>
                </p>
                <p>Runner-up: {entry.runnerUpName}</p>
                <p>
                  Final score: <strong>{entry.finalScore}</strong>
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
