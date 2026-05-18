import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatClassYear } from '../localization';
import { getCollegeStandings } from '../../core/colleges/getCollegeDisplayData';
import { getSeasonAwardWatch } from '../../core/awards/getSeasonAwardWatch';
import { getRecentCommitments } from '../../core/recruiting/getRecruitingProfile';
import { getWeeklySlate } from '../../core/schedule/getWeeklySlate';
import { canAdvanceWorldYear } from '../../core/world/simulateUnifiedWorld';
import { useGameStore } from '../store/useGameStore';

export function getDashboardStatusPills(seasonStatus: string, teamCount: number) {
  return [seasonStatus, `${teamCount} команд`];
}

export function DashboardScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const simNextWeek = useGameStore((state) => state.simNextWeek);
  const simFullSeason = useGameStore((state) => state.simFullSeason);
  const advanceToNextSeason = useGameStore((state) => state.advanceToNextSeason);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const slate = getWeeklySlate(world);
  const awards = getSeasonAwardWatch(world).slice(0, 4);
  const commitments = getRecentCommitments(world, 5);
  const latestChampion = world.history.champions[world.history.champions.length - 1] ?? null;
  const topStandings = world.season.standings.slice(0, 5);
  const collegeStandings = getCollegeStandings(world).slice(0, 5);
  const collegeChampion = world.collegeSeason?.championTeamId
    ? (world.collegeTeams ?? []).find((team) => team.id === world.collegeSeason?.championTeamId)
    : null;
  const worldReadyForNextYear = canAdvanceWorldYear(world);

  const controlCard = (
    <Card title="Управление">
      {worldReadyForNextYear ? (
        <div className="button-row">
          <Button onClick={advanceToNextSeason}>Перейти к новому году</Button>
        </div>
      ) : (
        <div className="button-row">
          <Button onClick={simNextWeek}>Симулировать неделю</Button>
          <Button variant="ghost" onClick={simFullSeason}>
            Симулировать год
          </Button>
        </div>
      )}
    </Card>
  );

  if (activeLeague === 'college') {
    return (
      <div className="stack">
        {controlCard}

        <Card title="Чемпион">
          {collegeChampion ? <strong>{collegeChampion.shortName}</strong> : <p className="muted">Нет.</p>}
        </Card>

        <Card title="Топ таблицы">
          {collegeStandings.length === 0 ? (
            <p className="muted">Нет данных.</p>
          ) : (
            <div className="list">
              {collegeStandings.map((entry) => (
                <div className="list-row" key={entry.teamId}>
                  <span>
                    #{entry.rank} {entry.teamName}
                  </span>
                  <strong>
                    {entry.wins}-{entry.losses} / {entry.pointDifferential}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="stack">
      {controlCard}

      <Card title="Награды">
        {awards.length === 0 ? (
          <p className="muted">Нет кандидатов.</p>
        ) : (
          <div className="list">
            {awards.map((award) => (
              <div className="list-row" key={`${award.type}-${award.playerId}`}>
                <div>
                  <strong>{award.title}</strong>
                  <p className="muted">
                    {award.playerName} / {award.position} / {formatClassYear(award.classYear)} / {award.teamName}
                  </p>
                  <p className="muted">оценка {award.score}</p>
                </div>
                <button className="filter-chip" onClick={() => openPlayerProfile(award.playerId, 'dashboard')}>
                  Профиль
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Коммиты">
        {commitments.length === 0 ? (
          <p className="muted">Нет.</p>
        ) : (
          <div className="list">
            {commitments.map((commitment) => (
              <div className="list-row" key={commitment.id}>
                <div>
                  <strong>{commitment.playerName}</strong>
                  <p className="muted">
                    {commitment.position} / {commitment.fromTeamName} / {commitment.collegeName}
                  </p>
                </div>
                <strong>{commitment.stars}★ / {commitment.prospectScore}</strong>
              </div>
            ))}
          </div>
        )}
      </Card>

      {world.phase === 'offseason' && latestChampion ? (
        <Card title="Чемпион">
          <div className="stack compact-stack">
            <strong>{latestChampion.championName}</strong>
            <div className="stat-strip">
              <span>год {latestChampion.year}</span>
              <span>финалист {latestChampion.runnerUpName}</span>
              <span>счёт {latestChampion.finalScore}</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Матч недели">
          {slate.gameOfTheWeek ? (
            <div className="stack compact-stack">
              <div className="eyebrow">неделя {slate.currentWeek + 1}</div>
              <strong>
                {slate.gameOfTheWeek.awayTeamName} @ {slate.gameOfTheWeek.homeTeamName}
              </strong>
              <div className="stat-strip">
                <span>{slate.gameOfTheWeek.status === 'Final' ? 'сыграно' : 'впереди'}</span>
                <span>{slate.gameOfTheWeek.score || 'счёта нет'}</span>
              </div>
            </div>
          ) : (
            <p className="muted">Матч не выбран.</p>
          )}
        </Card>
      )}

      <Card title="Топ таблицы">
        {topStandings.length === 0 ? (
          <p className="muted">Нет данных.</p>
        ) : (
          <div className="list">
            {topStandings.map((entry) => (
              <div className="list-row" key={entry.teamId}>
                <span>
                  #{entry.rank} {entry.teamName}
                </span>
                <strong>
                  {entry.wins}-{entry.losses} / {entry.pointDifferential}
                </strong>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
