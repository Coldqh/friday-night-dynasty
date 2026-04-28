import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function DashboardScreen() {
  const world = useGameStore((state) => state.world)!;
  const simNextWeek = useGameStore((state) => state.simNextWeek);
  const simFullSeason = useGameStore((state) => state.simFullSeason);
  const leader = world.season.standings[0];
  const champion = world.teams.find((team) => team.id === world.season.championId);
  const playoffField = world.season.playoffTeams
    .map((teamId) => world.teams.find((team) => team.id === teamId))
    .filter((team): team is NonNullable<typeof team> => team !== undefined);

  return (
    <div className="stack">
      <Card title="Living State">
        <div className="dashboard-grid">
          <div>
            <div className="eyebrow">Year</div>
            <p className="big-number">{world.season.year}</p>
          </div>
          <div>
            <div className="eyebrow">Week</div>
            <p className="big-number">
              {world.phase === 'regular'
                ? `${world.season.currentWeek + 1}`
                : world.phase === 'playoffs'
                  ? 'Playoffs'
                  : 'Complete'}
            </p>
          </div>
          <div>
            <div className="eyebrow">Teams</div>
            <p className="big-number">{world.teams.length}</p>
          </div>
        </div>
        <p className="muted">Фаза сезона: {world.phase}</p>
        <div className="button-row">
          <Button onClick={simNextWeek}>Sim Week</Button>
          <Button variant="ghost" onClick={simFullSeason}>
            Sim Season
          </Button>
        </div>
      </Card>

      <Card title="Лидер штата">
        {leader ? (
          <div className="stack compact-stack">
            <div className="list-row">
              <span>{leader.teamName}</span>
              <strong>
                {leader.wins}-{leader.losses}
              </strong>
            </div>
            <div className="stat-strip">
              <span>PF {leader.pointsFor}</span>
              <span>PA {leader.pointsAgainst}</span>
              <span>Diff {leader.pointDifferential}</span>
              <span>OVR {leader.overallRating}</span>
            </div>
          </div>
        ) : (
          <p className="muted">Таблица появится после создания мира.</p>
        )}
      </Card>

      <Card title={champion ? 'Чемпион сезона' : 'Гонка за плей-офф'}>
        {champion ? (
          <div className="stack compact-stack">
            <strong>{champion.name}</strong>
            <p className="muted">
              {champion.shortName} завершил сезон титулом штата и уже записан в историю мира.
            </p>
          </div>
        ) : playoffField.length > 0 ? (
          <div className="list">
            {playoffField.map((team, index) => (
              <div className="list-row" key={team.id}>
                <span>
                  #{index + 1} {team.shortName}
                </span>
                <strong>
                  {team.wins}-{team.losses}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">После регулярки сюда попадут 4 лучшие команды штата.</p>
        )}
      </Card>

      <Card title="Последний сюжет">
        <div className="list">
          {world.news.slice(0, 3).map((item) => (
            <div className="news-item" key={item.id}>
              <strong>{item.headline}</strong>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
