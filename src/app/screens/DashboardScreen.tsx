import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PaginationControls, getPagedItems } from '../components/PaginationControls';
import { formatClassYear } from '../localization';
import { getCollegeStandings } from '../../core/colleges/getCollegeDisplayData';
import { ensureNFLLayer, getNFLStandings } from '../../core/nfl/nflLayer';
import { NFLWorld } from '../../core/nfl/nflTypes';
import { getSeasonAwardWatch } from '../../core/awards/getSeasonAwardWatch';
import { getRecentCommitments } from '../../core/recruiting/getRecruitingProfile';
import { getWeeklySlate } from '../../core/schedule/getWeeklySlate';
import { canAdvanceWorldYear } from '../../core/world/simulateUnifiedWorld';
import { useGameStore } from '../store/useGameStore';

const COMMITMENTS_PAGE_SIZE = 8;

export function getDashboardStatusPills(seasonStatus: string, teamCount: number) {
  return [seasonStatus, `${teamCount} команд`];
}

function getWorldWeekLabel(world: ReturnType<typeof useGameStore.getState>['world'], activeLeague: 'highSchool' | 'college' | 'nfl') {
  if (!world) return '—';

  if (activeLeague === 'nfl') {
    const nflWorld = ensureNFLLayer(world) as NFLWorld;
    return nflWorld.nflSeason?.championTeamId ? `${world.currentYear} / готово` : `${world.currentYear} / Н${(nflWorld.nflSeason?.currentWeek ?? 0) + 1}`;
  }

  if (activeLeague === 'college') {
    return world.collegeSeason?.championTeamId ? `${world.currentYear} / готово` : `${world.currentYear} / Н${(world.collegeSeason?.currentWeek ?? 0) + 1}`;
  }

  return world.phase === 'offseason' ? `${world.currentYear} / готово` : `${world.currentYear} / Н${world.season.currentWeek + 1}`;
}

export function DashboardScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const simNextWeek = useGameStore((state) => state.simNextWeek);
  const simFullSeason = useGameStore((state) => state.simFullSeason);
  const advanceToNextSeason = useGameStore((state) => state.advanceToNextSeason);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const runDraft = useGameStore((state) => state.runDraft);
  const runTrades = useGameStore((state) => state.runTrades);
  const [commitmentPage, setCommitmentPage] = useState(0);
  const slate = getWeeklySlate(world);
  const awards = getSeasonAwardWatch(world).slice(0, 4);
  const commitments = getRecentCommitments(world, 500);
  const { pageItems: commitmentItems, currentPage: currentCommitmentPage, totalPages: commitmentTotalPages } = getPagedItems(
    commitments,
    commitmentPage,
    COMMITMENTS_PAGE_SIZE
  );
  const latestChampion = world.history.champions[world.history.champions.length - 1] ?? null;
  const topStandings = world.season.standings.slice(0, 5);
  const collegeStandings = getCollegeStandings(world).slice(0, 5);
  const collegeChampion = world.collegeSeason?.championTeamId
    ? (world.collegeTeams ?? []).find((team) => team.id === world.collegeSeason?.championTeamId)
    : null;
  const nflWorld = ensureNFLLayer(world) as NFLWorld;
  const nflStandings = getNFLStandings(world).slice(0, 5);
  const nflChampion = nflWorld.nflSeason?.championTeamId
    ? (nflWorld.nflTeams ?? []).find((team) => team.id === nflWorld.nflSeason?.championTeamId)
    : null;
  const worldReadyForNextYear = canAdvanceWorldYear(world);

  const controlCard = (
    <Card title="Управление">
      <div className="control-week-label">{getWorldWeekLabel(world, activeLeague)}</div>
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
          {activeLeague === 'nfl' ? <Button variant="ghost" onClick={runTrades}>Трейды</Button> : null}
        </div>
      )}
    </Card>
  );

  if (activeLeague === 'nfl') {
    return (
      <div className="stack">
        {controlCard}

        <Card title="Super Bowl">
          {nflChampion ? <strong>{nflChampion.shortName}</strong> : <p className="muted">Нет.</p>}
        </Card>

        <Card title="NFL">
          <div className="stat-strip">
            <span>команд {(nflWorld.nflTeams ?? []).length}</span>
            <span>игроков {(nflWorld.nflPlayers ?? []).length}</span>
            <span>пиков {(nflWorld.nflDraftHistory ?? []).length}</span>
            <span>трейдов {(nflWorld.nflTrades ?? []).length}</span>
          </div>
          <div className="button-row">
            <Button variant="ghost" onClick={runDraft}>Провести драфт</Button>
          </div>
        </Card>

        <Card title="Топ таблицы">
          {nflStandings.length === 0 ? (
            <p className="muted">Нет данных.</p>
          ) : (
            <div className="list">
              {nflStandings.map((entry) => (
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

      <Card title={`Коммиты (${commitments.length})`}>
        {commitments.length === 0 ? (
          <p className="muted">Нет.</p>
        ) : (
          <>
            <div className="table compact-table">
              <div className="table-head grid-commitments">
                <span>год</span>
                <span>игрок</span>
                <span>поз</span>
                <span>школа</span>
                <span>колледж</span>
                <span>рейт</span>
              </div>
              {commitmentItems.map((commitment) => (
                <div className="table-row grid-commitments" key={commitment.id}>
                  <span>{commitment.year}</span>
                  <span>{commitment.playerName}</span>
                  <span>{commitment.position}</span>
                  <span>{commitment.fromTeamName}</span>
                  <span>{commitment.collegeName}</span>
                  <strong>{commitment.stars}★ / {commitment.prospectScore}</strong>
                </div>
              ))}
            </div>
            <PaginationControls page={currentCommitmentPage} totalPages={commitmentTotalPages} onPageChange={setCommitmentPage} />
          </>
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
