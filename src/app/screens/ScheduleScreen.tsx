import { useState } from 'react';
import { Card } from '../components/Card';
import { getCompletedSchedule, getUpcomingSchedule } from '../../core/schedule/getFullSchedule';
import { useGameStore } from '../store/useGameStore';

type ScheduleFilter = 'all' | 'completed';

export const scheduleFilters: Array<{ id: ScheduleFilter; label: string }> = [
  { id: 'all', label: 'All Games' },
  { id: 'completed', label: 'Completed' }
];

export function ScheduleScreen() {
  const world = useGameStore((state) => state.world)!;
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const [filter, setFilter] = useState<ScheduleFilter>('all');
  const upcomingSchedule = getUpcomingSchedule(world);
  const completedSchedule = getCompletedSchedule(world);
  const filteredSchedule = filter === 'all' ? upcomingSchedule : completedSchedule;

  return (
    <div className="stack">
      <Card title="Texoma Schedule">
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>Year {world.season.year}</span>
            <span>Week {world.season.currentWeek + 1}</span>
            <span>{world.phase === 'regular' ? 'Regular Season' : world.phase === 'playoffs' ? 'Playoffs' : 'Season Complete'}</span>
          </div>

          <div className="filter-row">
            {scheduleFilters.map((option) => (
              <button
                key={option.id}
                className={filter === option.id ? 'filter-chip active' : 'filter-chip'}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Statewide Slate">
        {filteredSchedule.length === 0 ? (
          <p className="muted">
            {filter === 'all'
              ? world.phase === 'offseason'
                ? 'Season complete. The next live slate will appear after the offseason advance.'
                : 'No upcoming games are on the board right now.'
              : 'No completed games have been recorded yet.'}
          </p>
        ) : (
          <div className="stack compact-stack">
            <div className="table-head grid-full-schedule">
              <span>Week</span>
              <span>Stage</span>
              <span>Away</span>
              <span>Home</span>
              <span>Status</span>
              <span>Score</span>
              <span>Winner</span>
            </div>

            {filteredSchedule.map((game) => (
              <div className="schedule-card-row" key={game.gameId}>
                <div className="grid-full-schedule schedule-card-grid">
                  <span>W{game.week + 1}</span>
                  <span>{game.stageLabel}</span>
                  <button
                    className="schedule-team-button"
                    onClick={() => openTeamProfile(game.awayTeamId, 'schedule', 'schedule')}
                  >
                    {game.awayTeamName}
                  </button>
                  <button
                    className="schedule-team-button"
                    onClick={() => openTeamProfile(game.homeTeamId, 'schedule', 'schedule')}
                  >
                    {game.homeTeamName}
                  </button>
                  <span>{game.status}</span>
                  <strong>{game.score}</strong>
                  <strong>{game.winnerName ?? 'Upcoming'}</strong>
                </div>

                {game.summary ? <p className="schedule-summary">{game.summary}</p> : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
