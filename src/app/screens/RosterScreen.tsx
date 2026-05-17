import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectTeam = useGameStore((state) => state.selectTeam);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);

  return (
    <Card title="Команды">
      <div className="team-grid">
        {world.teams.map((team) => (
          <div className="team-chip" key={team.id}>
            <button className="team-chip-button" onClick={() => selectTeam(team.id)}>
              <strong>{team.shortName}</strong>
              <span>
                {team.schoolName} / {team.cityName}
              </span>
              <span>
                {team.wins}-{team.losses} / рейтинг {team.overallRating}
              </span>
            </button>

            <Button variant="ghost" onClick={() => openTeamProfile(team.id, 'overview', 'roster')}>
              Профиль команды
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
