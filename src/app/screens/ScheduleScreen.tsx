import { Card } from '../components/Card';
import { getTeamSchedule } from '../../core/teams/getTeamSchedule';
import { useGameStore } from '../store/useGameStore';

export function ScheduleScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const team = world.teams.find((entry) => entry.id === selectedTeamId) ?? world.teams[0];
  const schedule = getTeamSchedule(world, team.id);
  const notes = schedule.filter((game) => game.summary);

  return (
    <div className="stack">
      <Card title={`${team.shortName} Schedule`}>
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>Record {team.wins}-{team.losses}</span>
            <span>OFF {team.offenseRating}</span>
            <span>DEF {team.defenseRating}</span>
            <span>OVR {team.overallRating}</span>
          </div>
          <div className="table compact-table">
            <div className="table-head grid-team-schedule">
              <span>Week</span>
              <span>Opponent</span>
              <span>Home/Away</span>
              <span>Result</span>
              <span>Score</span>
            </div>
            {schedule.map((game) => (
              <div className="table-row grid-team-schedule" key={game.gameId}>
                <span>
                  W{game.week + 1}
                  {game.stage !== 'regular' ? ` · ${game.stage}` : ''}
                </span>
                <span>{game.opponentName}</span>
                <span>{game.homeAway}</span>
                <strong>{game.result ?? 'TBD'}</strong>
                <strong>{game.score}</strong>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Game Notes">
        {schedule.length === 0 ? (
          <p className="muted">This program does not have any scheduled games yet.</p>
        ) : notes.length === 0 ? (
          <p className="muted">Game notes will appear here once this team starts playing its schedule.</p>
        ) : (
          <div className="list">
            {notes.map((game) => (
              <div className="schedule-row" key={`${game.gameId}-summary`}>
                <div>
                  <div className="eyebrow">
                    Week {game.week + 1}
                    {game.stage !== 'regular' ? ` · ${game.stage}` : ''}
                  </div>
                  <strong>{game.opponentName}</strong>
                  <p className="muted">{game.summary}</p>
                </div>
                <strong>{game.score}</strong>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
