import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function RankingsScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const selectTeam = useGameStore((state) => state.selectTeam);
  const setScreen = useGameStore((state) => state.setScreen);
  const setTeamProfileTab = useGameStore((state) => state.setTeamProfileTab);
  const standings = world.season.standings;

  return (
    <Card title="Standings">
      <p className="muted">Нажми на команду, чтобы открыть отдельный Team Profile.</p>
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
          <button
            className={
              entry.teamId === selectedTeamId
                ? 'table-row grid-standings table-row-button active'
                : 'table-row grid-standings table-row-button'
            }
            key={entry.teamId}
            onClick={() => {
              selectTeam(entry.teamId);
              setTeamProfileTab('overview');
              setScreen('teamProfile');
            }}
          >
            <span>{entry.rank}</span>
            <span>{entry.teamName}</span>
            <span>
              {entry.wins}-{entry.losses}
            </span>
            <span>{entry.pointsFor}</span>
            <span>{entry.pointsAgainst}</span>
            <strong>{entry.pointDifferential}</strong>
          </button>
        ))}
      </div>
    </Card>
  );
}
