import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function ScheduleScreen() {
  const world = useGameStore((state) => state.world)!;

  return (
    <div className="stack">
      {world.season.schedule.map((week) => (
        <Card key={week.week} title={`Week ${week.week + 1}`}>
          <div className="list">
            {week.games.map((game) => {
              const home = world.teams.find((team) => team.id === game.homeTeamId)!;
              const away = world.teams.find((team) => team.id === game.awayTeamId)!;
              return (
                <div className="list-row" key={game.id}>
                  <span>{away.name} @ {home.name}</span>
                  <strong>{game.result ? `${game.result.awayScore}-${game.result.homeScore}` : 'TBD'}</strong>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
