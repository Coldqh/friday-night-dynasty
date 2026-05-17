import { useState } from 'react';
import { Card } from '../components/Card';
import { formatScheduleStatus, formatStage } from '../localization';
import { getCollegeCompletedSchedule, getCollegeUpcomingSchedule } from '../../core/colleges/getCollegeDisplayData';
import { getCompletedSchedule, getUpcomingSchedule } from '../../core/schedule/getFullSchedule';
import { getRivalryGames } from '../../core/rivalries/getRivalryGames';
import { useGameStore } from '../store/useGameStore';

type ScheduleFilter = 'all' | 'completed';

export const scheduleFilters: Array<{ id: ScheduleFilter; label: string }> = [
  { id: 'all', label: 'Ближайшие' },
  { id: 'completed', label: 'Сыгранные' }
];

export function ScheduleScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const [filter, setFilter] = useState<ScheduleFilter>('all');
  const rivalryGameIds = new Set(getRivalryGames(world).map((game) => game.gameId));

  const filteredSchedule =
    activeLeague === 'college'
      ? filter === 'all'
        ? getCollegeUpcomingSchedule(world)
        : getCollegeCompletedSchedule(world)
      : filter === 'all'
        ? getUpcomingSchedule(world)
        : getCompletedSchedule(world);

  return (
    <div className="stack">
      <Card title={activeLeague === 'college' ? 'Календарь колледжей' : 'Календарь'}>
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>год {world.season.year}</span>
            {activeLeague === 'highSchool' ? (
              <>
                <span>неделя {world.season.currentWeek + 1}</span>
                <span>{world.phase === 'regular' ? 'регулярный сезон' : world.phase === 'playoffs' ? 'плей-офф' : 'сезон завершён'}</span>
              </>
            ) : (
              <span>колледжи</span>
            )}
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

      <Card title={filter === 'all' ? 'Ближайшие матчи' : 'Сыгранные матчи'}>
        {filteredSchedule.length === 0 ? (
          <p className="muted">Нет матчей.</p>
        ) : (
          <div className="stack compact-stack">
            {filter === 'all' ? (
              <div className="table-head grid-schedule-upcoming">
                <span>нед</span>
                <span>стадия</span>
                <span>гости</span>
                <span>дома</span>
                <span>метки</span>
              </div>
            ) : (
              <div className="table-head grid-full-schedule">
                <span>нед</span>
                <span>стадия</span>
                <span>гости</span>
                <span>дома</span>
                <span>статус</span>
                <span>счёт</span>
                <span>победитель</span>
              </div>
            )}

            {filteredSchedule.map((game) => {
              const isHighSchoolGame = activeLeague === 'highSchool';
              const isRivalry = isHighSchoolGame && rivalryGameIds.has(game.gameId);

              return (
                <div className="schedule-card-row" key={game.gameId}>
                  {filter === 'all' ? (
                    <div className="grid-schedule-upcoming schedule-card-grid">
                      <span>Н{game.week + 1}</span>
                      <span>{formatStage(game.stageLabel)}</span>
                      {isHighSchoolGame ? (
                        <button
                          className="schedule-team-button"
                          onClick={() => openTeamProfile(game.awayTeamId, 'schedule', 'schedule')}
                        >
                          {game.awayTeamName}
                        </button>
                      ) : (
                        <span>{game.awayTeamName}</span>
                      )}
                      {isHighSchoolGame ? (
                        <button
                          className="schedule-team-button"
                          onClick={() => openTeamProfile(game.homeTeamId, 'schedule', 'schedule')}
                        >
                          {game.homeTeamName}
                        </button>
                      ) : (
                        <span>{game.homeTeamName}</span>
                      )}
                      <span>{isRivalry ? 'дерби' : '—'}</span>
                    </div>
                  ) : (
                    <div className="grid-full-schedule schedule-card-grid">
                      <span>Н{game.week + 1}</span>
                      <span>{formatStage(game.stageLabel)}</span>
                      {isHighSchoolGame ? (
                        <button
                          className="schedule-team-button"
                          onClick={() => openTeamProfile(game.awayTeamId, 'schedule', 'schedule')}
                        >
                          {game.awayTeamName}
                        </button>
                      ) : (
                        <span>{game.awayTeamName}</span>
                      )}
                      {isHighSchoolGame ? (
                        <button
                          className="schedule-team-button"
                          onClick={() => openTeamProfile(game.homeTeamId, 'schedule', 'schedule')}
                        >
                          {game.homeTeamName}
                        </button>
                      ) : (
                        <span>{game.homeTeamName}</span>
                      )}
                      <span>{formatScheduleStatus(game.status)}</span>
                      <strong>{game.score || '—'}</strong>
                      <strong>{game.winnerName ?? '—'}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
