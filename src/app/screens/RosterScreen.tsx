import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const selectTeam = useGameStore((state) => state.selectTeam);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);

  return (
    <Card title="Teams">
      <p className="muted">
        Pick a program to make it active, then open the full team profile for roster, schedule and history.
      </p>

      <div className="team-grid">
        {world.teams.map((team) => (
          <div className={team.id === selectedTeamId ? 'team-chip active' : 'team-chip'} key={team.id}>
            <button className="team-chip-button" onClick={() => selectTeam(team.id)}>
              <strong>{team.shortName}</strong>
              <span>
                {team.schoolName} · {team.cityName}
              </span>
              <span>
                {team.wins}-{team.losses} · OVR {team.overallRating}
              </span>
            </button>

            <Button variant="ghost" onClick={() => openTeamProfile(team.id, 'overview', 'roster')}>
              Open Team Profile
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
