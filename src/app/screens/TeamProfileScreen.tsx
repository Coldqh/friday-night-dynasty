import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { SchoolLogo } from '../components/SchoolLogo';
import { Card } from '../components/Card';
import { PaginationControls, getPagedItems } from '../components/PaginationControls';
import { formatClassYear, formatDefenseStyle, formatOffenseStyle, formatStage } from '../localization';
import { getRivalryRecord } from '../../core/rivalries/getRivalryRecord';
import { getTeamHistorySnapshot } from '../../core/teams/getTeamHistorySnapshot';
import { getTeamIdentityProfile } from '../../core/teams/getTeamIdentityProfile';
import { getTeamLeaders } from '../../core/teams/getTeamLeaders';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { getTeamSchedule } from '../../core/teams/getTeamSchedule';
import { Player } from '../../core/world/worldTypes';
import { TeamProfileTab, useGameStore } from '../store/useGameStore';

const profileTabs: Array<{ id: TeamProfileTab; label: string }> = [
  { id: 'overview', label: 'Обзор' },
  { id: 'roster', label: 'Состав' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'history', label: 'История' }
];

const ROSTER_PAGE_SIZE = 20;

type RosterSortKey = 'position' | 'classYear' | 'overall' | 'potential' | 'age';

function formatAllTimeRivalryRecord(teamName: string, rivalName: string, teamWins: number, rivalWins: number, ties: number) {
  return `${teamName} ${teamWins} — ${rivalName} ${rivalWins}${ties > 0 ? ` / ничьи ${ties}` : ''}`;
}

function formatLastGame(
  teamNames: { teamId: string; rivalId: string; teamName: string; rivalName: string },
  record: ReturnType<typeof getRivalryRecord>
) {
  if (!record.lastGame) {
    return 'нет матчей';
  }

  const winnerName =
    record.lastGame.winnerId === teamNames.teamId
      ? teamNames.teamName
      : record.lastGame.winnerId === teamNames.rivalId
        ? teamNames.rivalName
        : null;

  const score = `${record.lastGame.awayScore}-${record.lastGame.homeScore}`;
  return winnerName ? `${record.lastGame.year} / ${winnerName} / ${score}` : `${record.lastGame.year} / ${score}`;
}

function classRank(classYear: Player['classYear']) {
  const ranks: Record<Player['classYear'], number> = { SR: 4, JR: 3, SO: 2, FR: 1 };
  return ranks[classYear];
}

function sortRoster(roster: Player[], sortKey: RosterSortKey, direction: 'asc' | 'desc') {
  const directionMod = direction === 'asc' ? 1 : -1;

  return [...roster].sort((left, right) => {
    let result = 0;

    if (sortKey === 'position') result = left.position.localeCompare(right.position);
    if (sortKey === 'classYear') result = classRank(left.classYear) - classRank(right.classYear);
    if (sortKey === 'overall') result = left.overall - right.overall;
    if (sortKey === 'potential') result = left.potential - right.potential;
    if (sortKey === 'age') result = left.age - right.age;

    return result * directionMod || right.overall - left.overall || left.lastName.localeCompare(right.lastName);
  });
}

function SortButton({
  label,
  sortKey,
  currentSortKey,
  direction,
  onSort
}: {
  label: string;
  sortKey: RosterSortKey;
  currentSortKey: RosterSortKey;
  direction: 'asc' | 'desc';
  onSort: (key: RosterSortKey) => void;
}) {
  const marker = currentSortKey === sortKey ? (direction === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <button className="sort-header" onClick={() => onSort(sortKey)}>
      {label}{marker}
    </button>
  );
}

export function TeamProfileScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const teamProfileTab = useGameStore((state) => state.teamProfileTab);
  const setTeamProfileTab = useGameStore((state) => state.setTeamProfileTab);
  const closeTeamProfile = useGameStore((state) => state.closeTeamProfile);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const [rosterPage, setRosterPage] = useState(0);
  const [sortKey, setSortKey] = useState<RosterSortKey>('overall');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const team = world.teams.find((entry) => entry.id === selectedTeamId) ?? world.teams[0];
  const identity = getTeamIdentityProfile(world, team.id);
  const leaders = getTeamLeaders(world, team.id);
  const roster = useMemo(() => sortRoster(getTeamRoster(world, team.id), sortKey, sortDirection), [world, team.id, sortKey, sortDirection]);
  const { pageItems: rosterItems, currentPage: currentRosterPage, totalPages: rosterTotalPages } = getPagedItems(
    roster,
    rosterPage,
    ROSTER_PAGE_SIZE
  );
  const schedule = getTeamSchedule(world, team.id);
  const history = getTeamHistorySnapshot(world, team.id);
  const standing = world.season.standings.find((entry) => entry.teamId === team.id);
  const rivals = team.rivalryIds
    .map((rivalId) => {
      const rivalTeam = world.teams.find((entry) => entry.id === rivalId);
      if (!rivalTeam) {
        return null;
      }

      return {
        team: rivalTeam,
        rivalryRecord: getRivalryRecord(world, team.id, rivalTeam.id)
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .slice(0, 3);
  const leaderRows = [
    { label: 'лучший QB', player: leaders.quarterback },
    { label: 'лучший RB', player: leaders.runningBack },
    { label: 'лучший WR', player: leaders.receiver },
    { label: 'лидер защиты', player: leaders.defensiveStar },
    { label: 'главная звезда', player: leaders.topPlayer },
    { label: 'молодой талант', player: leaders.youngProspect }
  ];

  function handleSort(key: RosterSortKey) {
    setRosterPage(0);

    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection(key === 'position' || key === 'classYear' ? 'asc' : 'desc');
  }

  return (
    <div className="stack">
      <Card title="Профиль команды">
        <div className="stack compact-stack">
          <div className="profile-program-header">
            <SchoolLogo
              schoolName={team.schoolName}
              mascot={team.mascot}
              name={team.shortName}
              className="profile-school-logo large"
              placeholderClassName="team-logo-placeholder large"
            />
            <div>
              <div className="eyebrow">
                {team.schoolName} / {team.cityName} / {team.mascot}
              </div>
              <h3 className="profile-title">{team.name}</h3>
            </div>
          </div>
          <div className="stat-strip">
            <span>сезон {team.wins}-{team.losses}</span>
            <span>престиж {team.prestige}</span>
            <span>общ {team.overallRating}</span>
            <span>нап {team.offenseRating}</span>
            <span>защ {team.defenseRating}</span>
            <span>{formatOffenseStyle(team.offenseStyle)}</span>
            <span>{formatDefenseStyle(team.defenseStyle)}</span>
            <span>{identity.programTier}</span>
          </div>
          <div className="button-row">
            <Button variant="ghost" onClick={closeTeamProfile}>
              Назад
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Разделы">
        <div className="tab-row">
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              className={teamProfileTab === tab.id ? 'tab-chip active' : 'tab-chip'}
              onClick={() => setTeamProfileTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {teamProfileTab === 'overview' && (
        <>
          <Card title="Обзор">
            <div className="stat-strip">
              <span>место #{standing?.rank ?? '—'}</span>
              <span>баланс {standing ? `${standing.wins}-${standing.losses}` : `${team.wins}-${team.losses}`}</span>
              <span>очки {standing ? `${standing.pointsFor}-${standing.pointsAgainst}` : `${team.pointsFor}-${team.pointsAgainst}`}</span>
              <span>разница {standing?.pointDifferential ?? team.pointsFor - team.pointsAgainst}</span>
            </div>
          </Card>

          <Card title="Лидеры">
            <div className="list">
              {leaderRows.map(({ label, player }) => (
                <div className="list-row" key={label}>
                  <div>
                    <strong>{label}</strong>
                    <p className="muted">
                      {player
                        ? `${player.firstName} ${player.lastName} / ${player.position} / ${formatClassYear(player.classYear)}`
                        : 'нет'}
                    </p>
                    {player ? (
                      <button className="filter-chip" onClick={() => openPlayerProfile(player.id, 'teamProfile')}>
                        Профиль
                      </button>
                    ) : null}
                  </div>
                  <strong>{player ? `общ ${player.overall} / пот ${player.potential}` : '—'}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Соперники">
            {rivals.length === 0 ? (
              <p className="muted">Нет.</p>
            ) : (
              <div className="list">
                {rivals.map((rival) => (
                  <div className="history-item" key={rival.team.id}>
                    <div className="eyebrow">личные встречи</div>
                    <strong>{rival.team.shortName}</strong>
                    <p>
                      {formatAllTimeRivalryRecord(
                        team.shortName,
                        rival.team.shortName,
                        rival.rivalryRecord.teamWins,
                        rival.rivalryRecord.rivalWins,
                        rival.rivalryRecord.ties
                      )}
                    </p>
                    <p className="muted">матчей {rival.rivalryRecord.gamesPlayed}</p>
                    <p className="muted">
                      последний матч: {formatLastGame(
                        {
                          teamId: team.id,
                          rivalId: rival.team.id,
                          teamName: team.shortName,
                          rivalName: rival.team.shortName
                        },
                        rival.rivalryRecord
                      )}
                    </p>
                    <Button variant="ghost" onClick={() => openTeamProfile(rival.team.id, 'overview')}>
                      Открыть соперника
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {teamProfileTab === 'roster' && (
        <Card title={`Состав (${roster.length})`}>
          <div className="table compact-table">
            <div className="table-head grid-profile-roster">
              <span>имя</span>
              <SortButton label="поз" sortKey="position" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortButton label="класс" sortKey="classYear" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortButton label="общ" sortKey="overall" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortButton label="пот" sortKey="potential" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortButton label="возраст" sortKey="age" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
            </div>
            {rosterItems.map((player) => (
              <div className="table-row grid-profile-roster" key={player.id}>
                <button className="table-row-button" onClick={() => openPlayerProfile(player.id, 'teamProfile')}>
                  {player.firstName} {player.lastName}
                </button>
                <span>{player.position}</span>
                <span>{formatClassYear(player.classYear)}</span>
                <strong>{player.overall}</strong>
                <strong>{player.potential}</strong>
                <span>{player.age}</span>
              </div>
            ))}
          </div>
          <PaginationControls page={currentRosterPage} totalPages={rosterTotalPages} onPageChange={setRosterPage} />
        </Card>
      )}

      {teamProfileTab === 'schedule' && (
        <Card title="Календарь">
          <div className="table compact-table">
            <div className="table-head grid-team-schedule">
              <span>неделя</span>
              <span>соперник</span>
              <span>дом/гости</span>
              <span>итог</span>
              <span>счёт</span>
            </div>
            {schedule.map((game) => (
              <div className="table-row grid-team-schedule" key={game.gameId}>
                <span>
                  Н{game.week + 1}
                  {game.stage !== 'regular' ? ` / ${formatStage(game.stage)}` : ''}
                </span>
                <span>{game.isRivalry ? `${game.opponentName} / дерби` : game.opponentName}</span>
                <span>{game.homeAway === 'Home' ? 'дома' : game.homeAway === 'Away' ? 'в гостях' : game.homeAway}</span>
                <strong>{game.result ?? 'впереди'}</strong>
                <strong>{game.score}</strong>
              </div>
            ))}
          </div>
        </Card>
      )}

      {teamProfileTab === 'history' && (
        <Card title="История">
          <div className="stack compact-stack">
            <div className="stat-strip">
              <span>текущий сезон {history.currentSeasonRecord.label}</span>
              <span>вся история {history.totalHistoricalWins}-{history.totalHistoricalLosses}</span>
              <span>титулы {history.titlesCount}</span>
              <span>плей-офф {history.playoffAppearancesCount}</span>
            </div>
            {history.history.length > 0 ? (
              <div className="list">
                {history.history.map((season) => (
                  <div className="history-item" key={`${team.id}-${season.year}`}>
                    <div className="eyebrow">{season.year}</div>
                    <strong>{season.wins}-{season.losses}</strong>
                    <p>очки {season.pointsFor}-{season.pointsAgainst}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Нет завершённых сезонов.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
