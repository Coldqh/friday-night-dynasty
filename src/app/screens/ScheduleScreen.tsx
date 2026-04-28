import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function ScheduleScreen() {
  const world = useGameStore((state) => state.world)!;

  return (
    <div className="stack">
      <Card title="Регулярный сезон">
        <div className="stack compact-stack">
          {world.season.schedule.map((week) => (
            <div className="schedule-week" key={week.week}>
              <div className="eyebrow">Week {week.week + 1}</div>
              <div className="list">
                {week.games.map((game) => {
                  const home = world.teams.find((team) => team.id === game.homeTeamId)!;
                  const away = world.teams.find((team) => team.id === game.awayTeamId)!;

                  return (
                    <div className="schedule-row" key={game.id}>
                      <div>
                        <strong>
                          {away.shortName} @ {home.shortName}
                        </strong>
                        <p className="muted">
                          {game.summary || 'Матч ещё не сыгран.'}
                        </p>
                      </div>
                      <strong>
                        {game.homeScore !== null && game.awayScore !== null
                          ? `${game.awayScore}-${game.homeScore}`
                          : 'TBD'}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Плей-офф штата">
        {world.season.playoffGames.length === 0 ? (
          <p className="muted">После 10-й недели здесь появятся полуфиналы и финал штата.</p>
        ) : (
          <div className="list">
            {world.season.playoffGames.map((game) => {
              const home = world.teams.find((team) => team.id === game.homeTeamId)!;
              const away = world.teams.find((team) => team.id === game.awayTeamId)!;

              return (
                <div className="schedule-row" key={game.id}>
                  <div>
                    <div className="eyebrow">
                      {game.stage === 'final' ? 'State Final' : 'State Semifinal'}
                    </div>
                    <strong>
                      {away.shortName} @ {home.shortName}
                    </strong>
                    <p className="muted">{game.summary}</p>
                  </div>
                  <strong>
                    {game.awayScore}-{game.homeScore}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
