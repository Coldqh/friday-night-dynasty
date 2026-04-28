import { Card } from '../components/Card';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { useGameStore } from '../store/useGameStore';

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const setSelectedTeamId = useGameStore((state) => state.setSelectedTeamId);
  const team = world.teams.find((item) => item.id === selectedTeamId) ?? world.teams[0];
  const players = getTeamRoster(world, team.id).sort((left, right) => right.overall - left.overall);

  return (
    <div className="stack">
      <Card title="Команды штата">
        <div className="team-grid">
          {world.teams.map((entry) => (
            <button
              key={entry.id}
              className={entry.id === team.id ? 'team-chip active' : 'team-chip'}
              onClick={() => setSelectedTeamId(entry.id)}
            >
              <strong>{entry.shortName}</strong>
              <span>
                {entry.wins}-{entry.losses} · OVR {entry.overallRating}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card title={`${team.name} — roster`}>
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>{team.cityName}</span>
            <span>Prestige {team.prestige}</span>
            <span>OFF {team.offenseRating}</span>
            <span>DEF {team.defenseRating}</span>
            <span>OVR {team.overallRating}</span>
          </div>
          <div className="table compact-table">
            <div className="table-head grid-roster">
              <span>Игрок</span>
              <span>Pos</span>
              <span>Класс</span>
              <span>OVR</span>
              <span>POT</span>
            </div>
            {players.map((player) => (
              <div className="table-row grid-roster" key={player.id}>
                <span>
                  {player.firstName} {player.lastName}
                </span>
                <span>{player.position}</span>
                <span>{player.classYear}</span>
                <strong>{player.overall}</strong>
                <strong>{player.potential}</strong>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
