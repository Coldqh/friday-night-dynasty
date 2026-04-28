import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const team = world.teams.find((item) => item.id === selectedTeamId) ?? world.teams[0];
  const players = world.players.filter((player) => player.teamId === team.id);

  return (
    <Card title={`${team.name} — ростер`}>
      <div className="table compact-table">
        <div className="table-head grid-roster">
          <span>Игрок</span><span>Pos</span><span>Класс</span><span>OVR</span>
        </div>
        {players.map((player) => (
          <div className="table-row grid-roster" key={player.id}>
            <span>{player.firstName} {player.lastName}</span>
            <span>{player.position}</span>
            <span>{player.classYear}</span>
            <strong>{player.overall}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}
