import { Card } from '../components/Card';
import { getLeagueHistorySnapshot } from '../../core/history/getLeagueHistorySnapshot';
import { useGameStore } from '../store/useGameStore';

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;
  const history = getLeagueHistorySnapshot(world);

  return (
    <div className="stack">
      <Card title="League History">
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>Seasons completed {history.totalSeasonsCompleted}</span>
            <span>State finals {history.titleGames.length}</span>
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

      <Card title="State Finals">
        {history.titleGames.length === 0 ? (
          <p className="muted">State final results will land here once the first championship is played.</p>
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
                <p>Runner-up: {game.runnerUpName}</p>
                <p>
                  Final score: <strong>{game.finalScore}</strong>
                </p>
                <p>{game.summary}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {history.timeline.length > 0 && (
        <Card title="League Timeline">
          <div className="list">
            {history.timeline.map((entry) => (
              <div className="history-item" key={entry.id}>
                <div className="eyebrow">{entry.year}</div>
                <strong>{entry.title}</strong>
                <p>{entry.body}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
