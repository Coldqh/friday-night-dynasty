import { useState } from 'react';
import { Card } from '../components/Card';
import { formatScheduleStatus, formatStage, formatStakeLabel } from '../localization';
import { getCompletedSchedule, getUpcomingSchedule } from '../../core/schedule/getFullSchedule';
import { getWeeklySlate } from '../../core/schedule/getWeeklySlate';
import { getWeekStakes } from '../../core/stakes/getWeekStakes';
import { getRivalryGames } from '../../core/rivalries/getRivalryGames';
import { useGameStore } from '../store/useGameStore';

type ScheduleFilter = 'all' | 'completed';

export const scheduleFilters: Array<{ id: ScheduleFilter; label: string }> = [
  { id: 'all', label: 'Ближайшие' },
  { id: 'completed', label: 'Сыгранные' }
];

export function ScheduleScreen() {
  const world = useGameStore((state) => state.world)!;
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const [filter, setFilter] = useState<ScheduleFilter>('all');
  const upcomingSchedule = getUpcomingSchedule(world);
  const completedSchedule = getCompletedSchedule(world);
  const filteredSchedule = filter === 'all' ? upcomingSchedule : completedSchedule;
  const slate = getWeeklySlate(world);
  const weekStakes = getWeekStakes(world);
  const rivalryGameIds = new Set(getRivalryGames(world).map((game) => game.gameId));
  const gameOfTheWeekId = slate.gameOfTheWeek?.gameId ?? null;

  function getScheduleLabels(gameId: string) {
    const labels: string[] = [];

    if (gameId === gameOfTheWeekId) {
      labels.push('матч недели');
    }

    if (weekStakes.playoffRaceGames.some((game) => game.gameId === gameId)) {
      labels.push('гонка за плей-офф');
    }

    if (weekStakes.undefeatedWatchGames.some((game) => game.gameId === gameId)) {
      labels.push('серия без поражений');
    }

    if (rivalryGameIds.has(gameId)) {
      labels.push('дерби');
    }

    return labels;
  }

  return (
    <div className="stack">
      <Card title="Календарь Texoma">
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>год {world.season.year}</span>
            <span>неделя {world.season.currentWeek + 1}</span>
            <span>{world.phase === 'regular' ? 'регулярный сезон' : world.phase === 'playoffs' ? 'плей-офф' : 'сезон завершён'}</span>
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

      <Card title="Матчи штата">
        {filteredSchedule.length === 0 ? (
          <p className="muted">
            {filter === 'all'
              ? world.phase === 'offseason'
                ? 'Сезон завершён. Новый календарь появится после перехода через межсезонье.'
                : 'Ближайших матчей сейчас нет.'
              : 'Сыгранных матчей пока нет.'}
          </p>
        ) : (
          <div className="stack compact-stack">
            <p className="muted">{weekStakes.summary}</p>

            <div className="table-head grid-full-schedule">
              <span>нед</span>
              <span>стадия</span>
              <span>гости</span>
              <span>дома</span>
              <span>статус</span>
              <span>счёт</span>
              <span>победитель</span>
            </div>

            {filteredSchedule.map((game) => {
              const labels = getScheduleLabels(game.gameId);

              return (
                <div className="schedule-card-row" key={game.gameId}>
                  <div className="grid-full-schedule schedule-card-grid">
                    <span>Н{game.week + 1}</span>
                    <span>{formatStage(game.stageLabel)}</span>
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
                    <span>{formatScheduleStatus(game.status)}</span>
                    <strong>{game.score || '—'}</strong>
                    <strong>{game.winnerName ?? 'впереди'}</strong>
                  </div>

                  {labels.length > 0 ? (
                    <div className="tag-row">
                      {labels.map((label) => (
                        <span className="tag-chip" key={`${game.gameId}-${label}`}>
                          {formatStakeLabel(label)}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {game.summary ? <p className="schedule-summary">{game.summary}</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
