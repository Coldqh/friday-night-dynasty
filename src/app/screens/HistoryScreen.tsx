import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getHistorySnapshot } from '../../core/history/getHistorySnapshot';
import { getTeamHistorySnapshot } from '../../core/teams/getTeamHistorySnapshot';
import { useGameStore } from '../store/useGameStore';

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const setScreen = useGameStore((state) => state.setScreen);
  const setTeamProfileTab = useGameStore((state) => state.setTeamProfileTab);
  const team = world.teams.find((entry) => entry.id === selectedTeamId) ?? world.teams[0];
  const history = getTeamHistorySnapshot(world, team.id);
  const stateHistory = getHistorySnapshot(world);
  const titleAppearances = stateHistory.titleGames.filter(
    (game) => game.championId === team.id || game.runnerUpId === team.id
  );

  return (
    <div className="stack">
      <Card title={`${team.shortName} Program History`}>
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>Current {history.currentSeasonRecord.label}</span>
            <span>
              All-time {history.totalHistoricalWins}-{history.totalHistoricalLosses}
            </span>
            <span>Titles {history.titlesCount}</span>
            <span>Playoffs {history.playoffAppearancesCount}</span>
          </div>
          <div className="button-row">
            <Button
              variant="ghost"
              onClick={() => {
                setTeamProfileTab('history');
                setScreen('teamProfile');
              }}
            >
              Open Team Profile
            </Button>
          </div>
          {history.history.length === 0 ? (
            <p className="muted">This program is still writing its first chapter.</p>
          ) : (
            <div className="list">
              {history.history.map((season) => (
                <div className="history-item" key={`${team.id}-${season.year}`}>
                  <div className="eyebrow">{season.year}</div>
                  <h3>
                    {season.wins}-{season.losses}
                  </h3>
                  <p>
                    PF {season.pointsFor} · PA {season.pointsAgainst}
                  </p>
                  <p>{season.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card title="State Final Appearances">
        {titleAppearances.length === 0 ? (
          <p className="muted">This program is still waiting for its first state final appearance.</p>
        ) : (
          <div className="list">
            {titleAppearances.map((game) => (
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
    </div>
  );
}
