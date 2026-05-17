import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getCollegeStandings } from '../../core/colleges/getCollegeDisplayData';
import { useGameStore } from '../store/useGameStore';

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const selectTeam = useGameStore((state) => state.selectTeam);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const selectCollegeTeam = useGameStore((state) => state.selectCollegeTeam);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);

  if (activeLeague === 'college') {
    const collegeTeams = getCollegeStandings(world);

    return (
      <Card title="Программы">
        {collegeTeams.length === 0 ? (
          <p className="muted">Нет программ.</p>
        ) : (
          <div className="team-grid">
            {collegeTeams.map((team) => (
              <div className="team-chip" key={team.teamId}>
                <button className="team-chip-button" onClick={() => selectCollegeTeam(team.teamId)}>
                  <strong>{team.teamName}</strong>
                  <span>
                    {team.wins}-{team.losses} / очки {team.pointsFor}-{team.pointsAgainst} / разн {team.pointDifferential}
                  </span>
                  <span>игроков: {(world.collegePlayers ?? []).filter((player) => player.collegeTeamId === team.teamId).length}</span>
                </button>

                <Button variant="ghost" onClick={() => openCollegeTeamProfile(team.teamId, 'overview', 'roster')}>
                  Профиль программы
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

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
