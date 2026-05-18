import { useState } from 'react';
import { Card } from '../components/Card';
import { formatScheduleStatus, formatStage } from '../localization';
import { getCollegeCompletedSchedule, getCollegeUpcomingSchedule } from '../../core/colleges/getCollegeDisplayData';
import { ensureNFLLayer } from '../../core/nfl/nflLayer';
import { NFLWorld, NFLScheduledGame } from '../../core/nfl/nflTypes';
import { getCompletedSchedule, getUpcomingSchedule } from '../../core/schedule/getFullSchedule';
import { getRivalryGames } from '../../core/rivalries/getRivalryGames';
import { useGameStore } from '../store/useGameStore';

type ScheduleFilter = 'all' | 'completed';

export const scheduleFilters: Array<{ id: ScheduleFilter; label: string }> = [
  { id: 'all', label: 'Ближайшие' },
  { id: 'completed', label: 'Сыгранные' }
];

function formatNFLStage(stage: NFLScheduledGame['stage']) {
  switch (stage) {
    case 'wildCard':
      return 'Wild Card';
    case 'divisional':
      return 'Divisional';
    case 'conference':
      return 'Conference';
    case 'superBowl':
      return 'Super Bowl';
    default:
      return 'регулярный сезон';
  }
}

function getNFLSchedule(world: NFLWorld, filter: ScheduleFilter) {
  const teams = new Map((world.nflTeams ?? []).map((team) => [team.id, team]));
  const season = world.nflSeason;
  const games =
    filter === 'all'
      ? (season?.schedule ?? [])
          .filter((week) => week.week >= (season?.currentWeek ?? 0))
          .flatMap((week) => week.games)
          .filter((game) => game.winnerId === null)
          .slice(0, 80)
      : [...(season?.completedGames ?? [])].reverse().slice(0, 120);

  return games.map((game) => {
    const away = teams.get(game.awayTeamId);
    const home = teams.get(game.homeTeamId);
    const winner = game.winnerId ? teams.get(game.winnerId) : null;
    const score = game.homeScore === null || game.awayScore === null ? '' : `${game.awayScore}-${game.homeScore}`;

    return {
      ...game,
      awayTeamName: away?.shortName ?? '—',
      homeTeamName: home?.shortName ?? '—',
      winnerName: winner?.shortName ?? null,
      status: game.winnerId ? 'Final' : 'Scheduled',
      score
    };
  });
}

export function ScheduleScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);
  const openNFLTeamProfile = useGameStore((state) => state.openNFLTeamProfile);
  const [filter, setFilter] = useState<ScheduleFilter>('all');
  const rivalryGameIds = new Set(getRivalryGames(world).map((game) => game.gameId));

  if (activeLeague === 'nfl') {
    const nflWorld = ensureNFLLayer(world) as NFLWorld;
    const schedule = getNFLSchedule(nflWorld, filter);

    return (
      <div className="stack">
        <Card title="Календарь NFL">
          <div className="stack compact-stack">
            <div className="stat-strip">
              <span>год {nflWorld.nflSeason?.year ?? world.currentYear}</span>
              <span>неделя {(nflWorld.nflSeason?.currentWeek ?? 0) + 1}</span>
              <span>{nflWorld.nflSeason?.championTeamId ? 'сезон завершён' : 'сезон идёт'}</span>
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
          {schedule.length === 0 ? (
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

              {schedule.map((game) => (
                <div className="schedule-card-row" key={game.id}>
                  {filter === 'all' ? (
                    <div className="grid-schedule-upcoming schedule-card-grid">
                      <span>Н{game.week + 1}</span>
                      <span>{formatNFLStage(game.stage)}</span>
                      <button className="schedule-team-button" onClick={() => openNFLTeamProfile(game.awayTeamId, 'schedule', 'schedule')}>
                        {game.awayTeamName}
                      </button>
                      <button className="schedule-team-button" onClick={() => openNFLTeamProfile(game.homeTeamId, 'schedule', 'schedule')}>
                        {game.homeTeamName}
                      </button>
                      <span>{game.stage === 'regular' ? '—' : 'плей-офф'}</span>
                    </div>
                  ) : (
                    <div className="grid-full-schedule schedule-card-grid">
                      <span>Н{game.week + 1}</span>
                      <span>{formatNFLStage(game.stage)}</span>
                      <button className="schedule-team-button" onClick={() => openNFLTeamProfile(game.awayTeamId, 'schedule', 'schedule')}>
                        {game.awayTeamName}
                      </button>
                      <button className="schedule-team-button" onClick={() => openNFLTeamProfile(game.homeTeamId, 'schedule', 'schedule')}>
                        {game.homeTeamName}
                      </button>
                      <span>{formatScheduleStatus(game.status)}</span>
                      <strong>{game.score || '—'}</strong>
                      <strong>{game.winnerName ?? '—'}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

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
      <Card title="Календарь">
        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>год {activeLeague === 'college' ? world.collegeSeason?.year ?? world.season.year : world.season.year}</span>
            {activeLeague === 'highSchool' ? (
              <>
                <span>неделя {world.season.currentWeek + 1}</span>
                <span>{world.phase === 'regular' ? 'регулярный сезон' : world.phase === 'playoffs' ? 'плей-офф' : 'сезон завершён'}</span>
              </>
            ) : (
              <>
                <span>неделя {(world.collegeSeason?.currentWeek ?? 0) + 1}</span>
                <span>{world.collegeSeason?.championTeamId ? 'сезон завершён' : 'регулярный сезон'}</span>
              </>
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
              const isRivalry = isHighSchoolGame ? rivalryGameIds.has(game.gameId) : Boolean('isRivalry' in game && game.isRivalry);

              return (
                <div className="schedule-card-row" key={game.gameId}>
                  {filter === 'all' ? (
                    <div className="grid-schedule-upcoming schedule-card-grid">
                      <span>Н{game.week + 1}</span>
                      <span>{formatStage(game.stageLabel)}</span>
                      {isHighSchoolGame ? (
                        <button className="schedule-team-button" onClick={() => openTeamProfile(game.awayTeamId, 'schedule', 'schedule')}>
                          {game.awayTeamName}
                        </button>
                      ) : (
                        <button className="schedule-team-button" onClick={() => openCollegeTeamProfile(game.awayTeamId, 'schedule', 'schedule')}>
                          {game.awayTeamName}
                        </button>
                      )}
                      {isHighSchoolGame ? (
                        <button className="schedule-team-button" onClick={() => openTeamProfile(game.homeTeamId, 'schedule', 'schedule')}>
                          {game.homeTeamName}
                        </button>
                      ) : (
                        <button className="schedule-team-button" onClick={() => openCollegeTeamProfile(game.homeTeamId, 'schedule', 'schedule')}>
                          {game.homeTeamName}
                        </button>
                      )}
                      <span>{isRivalry ? 'дерби' : '—'}</span>
                    </div>
                  ) : (
                    <div className="grid-full-schedule schedule-card-grid">
                      <span>Н{game.week + 1}</span>
                      <span>{formatStage(game.stageLabel)}</span>
                      {isHighSchoolGame ? (
                        <button className="schedule-team-button" onClick={() => openTeamProfile(game.awayTeamId, 'schedule', 'schedule')}>
                          {game.awayTeamName}
                        </button>
                      ) : (
                        <button className="schedule-team-button" onClick={() => openCollegeTeamProfile(game.awayTeamId, 'schedule', 'schedule')}>
                          {game.awayTeamName}
                        </button>
                      )}
                      {isHighSchoolGame ? (
                        <button className="schedule-team-button" onClick={() => openTeamProfile(game.homeTeamId, 'schedule', 'schedule')}>
                          {game.homeTeamName}
                        </button>
                      ) : (
                        <button className="schedule-team-button" onClick={() => openCollegeTeamProfile(game.homeTeamId, 'schedule', 'schedule')}>
                          {game.homeTeamName}
                        </button>
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
