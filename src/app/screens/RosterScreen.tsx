import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getTeamIdentityProfile } from '../../core/teams/getTeamIdentityProfile';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { useGameStore } from '../store/useGameStore';

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const selectTeam = useGameStore((state) => state.selectTeam);
  const setScreen = useGameStore((state) => state.setScreen);
  const setTeamProfileTab = useGameStore((state) => state.setTeamProfileTab);
  const team = world.teams.find((item) => item.id === selectedTeamId) ?? world.teams[0];
  const players = getTeamRoster(world, team.id)
    .sort((left, right) => right.overall - left.overall)
    .slice(0, 8);
  const identity = getTeamIdentityProfile(world, team.id);

  return (
    <div className="stack">
      <Card title="Команды штата">
        <div className="team-grid">
          {world.teams.map((entry) => (
            <button
              key={entry.id}
              className={entry.id === team.id ? 'team-chip active' : 'team-chip'}
              onClick={() => selectTeam(entry.id)}
            >
              <strong>{entry.shortName}</strong>
              <span>
                {entry.wins}-{entry.losses} · OVR {entry.overallRating}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Selected Program">
        <div className="stack compact-stack">
          <div className="eyebrow">
            {team.schoolName} · {team.cityName} · {team.mascot}
          </div>
          <h3 className="profile-title">{team.name}</h3>
          <p className="muted">
            {team.schoolName} represents {team.cityName} as a {team.offenseStyle} offense and {team.defenseStyle} defense.
          </p>
          <div className="stat-strip">
            <span>Prestige {team.prestige}</span>
            <span>Record {team.wins}-{team.losses}</span>
            <span>OFF {team.offenseRating}</span>
            <span>DEF {team.defenseRating}</span>
            <span>OVR {team.overallRating}</span>
            <span>{identity.programTier}</span>
          </div>
          <p className="muted">{identity.description}</p>
          <div className="button-row">
            <Button
              onClick={() => {
                setTeamProfileTab('overview');
                setScreen('teamProfile');
              }}
            >
              Open Team Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setTeamProfileTab('roster');
                setScreen('teamProfile');
              }}
            >
              Jump to Roster
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Roster Preview">
        <div className="stack compact-stack">
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
