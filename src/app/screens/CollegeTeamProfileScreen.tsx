import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { CollegeLogo } from '../components/CollegeLogo';
import { Card } from '../components/Card';
import { PaginationControls, getPagedItems } from '../components/PaginationControls';
import { formatClassYear, formatDefenseStyle, formatOffenseStyle, formatStage } from '../localization';
import { getCollegeRosterStrength } from '../../core/colleges/collegeRatings';
import { getCollegeRivalryRecord } from '../../core/colleges/collegeRivalries';
import { getCollegeTeamSchedule } from '../../core/colleges/getCollegeDisplayData';
import { CollegePlayer } from '../../core/world/worldTypes';
import { CollegeTeamProfileTab, useGameStore } from '../store/useGameStore';
const profileTabs: Array<{ id: CollegeTeamProfileTab; label: string }> = [
  { id: 'overview', label: 'Обзор' },
  { id: 'roster', label: 'Состав' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'history', label: 'История' }
];

const ROSTER_PAGE_SIZE = 20;
type RosterSortKey = 'position' | 'classYear' | 'overall' | 'potential' | 'age';

function classRank(classYear: CollegePlayer['classYear']) {
  const ranks: Record<CollegePlayer['classYear'], number> = { SR: 4, JR: 3, SO: 2, FR: 1 };
  return ranks[classYear];
}

function sortRoster(roster: CollegePlayer[], sortKey: RosterSortKey, direction: 'asc' | 'desc') {
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

export function CollegeTeamProfileScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedCollegeTeamId = useGameStore((state) => state.selectedCollegeTeamId);
  const collegeTeamProfileTab = useGameStore((state) => state.collegeTeamProfileTab);
  const setCollegeTeamProfileTab = useGameStore((state) => state.setCollegeTeamProfileTab);
  const closeCollegeTeamProfile = useGameStore((state) => state.closeCollegeTeamProfile);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const [rosterPage, setRosterPage] = useState(0);
  const [sortKey, setSortKey] = useState<RosterSortKey>('overall');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const team = (world.collegeTeams ?? []).find((entry) => entry.id === selectedCollegeTeamId) ?? (world.collegeTeams ?? [])[0];
  const college = team ? (world.colleges ?? []).find((entry) => entry.id === team.collegeId) ?? null : null;

  if (!team) {
    return (
      <Card title="Профиль программы">
        <p className="muted">Колледж не найден.</p>
        <Button variant="ghost" onClick={closeCollegeTeamProfile}>Назад</Button>
      </Card>
    );
  }

  const rawRoster = (world.collegePlayers ?? []).filter((player) => player.collegeTeamId === team.id);
  const roster = useMemo(() => sortRoster(rawRoster, sortKey, sortDirection), [rawRoster, sortKey, sortDirection]);
  const { pageItems: rosterItems, currentPage: currentRosterPage, totalPages: rosterTotalPages } = getPagedItems(
    roster,
    rosterPage,
    ROSTER_PAGE_SIZE
  );
  const schedule = getCollegeTeamSchedule(world, team.id);
  const standings = world.collegeSeason?.standings ?? [];
  const standing = standings.find((entry) => entry.teamId === team.id);
  const rivals = team.rivalryIds
    .map((rivalId) => {
      const rivalTeam = (world.collegeTeams ?? []).find((entry) => entry.id === rivalId);
      if (!rivalTeam) return null;
      return {
        team: rivalTeam,
        record: getCollegeRivalryRecord(world, team.id, rivalTeam.id)
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

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
      <Card title="Профиль программы">
        <div className="stack compact-stack">
          <div className="profile-program-header">
            <CollegeLogo logoAsset={team.logoAsset} name={team.shortName} className="profile-program-logo" placeholderClassName="team-logo-placeholder" />
            <div>
              <div className="eyebrow">{team.conference ?? college?.conference ?? '—'}</div>
              <h3 className="profile-title">{team.shortName}</h3>
            </div>
          </div>
          <div className="stat-strip">
            <span>сезон {team.wins}-{team.losses}</span>
            <span>{team.conference ?? college?.conference ?? '—'}</span>
            <span>престиж {team.prestige}</span>
            <span>сила {getCollegeRosterStrength(team, world.collegePlayers ?? [])}</span>
            <span>игроков {roster.length}</span>
            <span>{formatOffenseStyle(team.offenseStyle)}</span>
            <span>{formatDefenseStyle(team.defenseStyle)}</span>
          </div>
          <div className="button-row">
            <Button variant="ghost" onClick={closeCollegeTeamProfile}>
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
              className={collegeTeamProfileTab === tab.id ? 'tab-chip active' : 'tab-chip'}
              onClick={() => setCollegeTeamProfileTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {collegeTeamProfileTab === 'overview' && (
        <>
          <Card title="Обзор">
            <div className="stat-strip">
              <span>место #{standing?.rank ?? '—'}</span>
              <span>баланс {standing ? `${standing.wins}-${standing.losses}` : `${team.wins}-${team.losses}`}</span>
              <span>очки {standing ? `${standing.pointsFor}-${standing.pointsAgainst}` : `${team.pointsFor}-${team.pointsAgainst}`}</span>
              <span>разница {standing?.pointDifferential ?? team.pointsFor - team.pointsAgainst}</span>
            </div>
          </Card>

          <Card title="Соперники">
            {rivals.length === 0 ? (
              <p className="muted">Нет.</p>
            ) : (
              <div className="list">
                {rivals.map((rival) => (
                  <div className="history-item" key={rival.team.id}>
                    <div className="eyebrow">дерби</div>
                    <strong>{rival.team.shortName}</strong>
                    <p>
                      {team.shortName} {rival.record.teamWins} — {rival.team.shortName} {rival.record.rivalWins}
                    </p>
                    <p className="muted">матчей {rival.record.gamesPlayed}</p>
                    <Button variant="ghost" onClick={() => openCollegeTeamProfile(rival.team.id, 'overview', 'collegeTeamProfile')}>
                      Открыть соперника
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {collegeTeamProfileTab === 'roster' && (
        <Card title={`Состав (${roster.length})`}>
          {roster.length === 0 ? (
            <p className="muted">Нет игроков.</p>
          ) : (
            <>
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
                    <button className="table-row-button" onClick={() => openPlayerProfile(player.id, 'collegeTeamProfile')}>
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
            </>
          )}
        </Card>
      )}

      {collegeTeamProfileTab === 'schedule' && (
        <Card title="Календарь">
          <div className="table compact-table">
            <div className="table-head grid-team-schedule">
              <span>неделя</span>
              <span>соперник</span>
              <span>дом/гости</span>
              <span>итог</span>
              <span>счёт</span>
            </div>
            {schedule.map((game) => {
              const isHome = game.homeTeamId === team.id;
              const opponentName = isHome ? game.awayTeamName : game.homeTeamName;
              const result =
                game.status === 'Final'
                  ? game.winnerName === team.shortName
                    ? 'W'
                    : 'L'
                  : 'впереди';

              return (
                <div className="table-row grid-team-schedule" key={game.gameId}>
                  <span>
                    Н{game.week + 1}
                    {game.stage !== 'regular' ? ` / ${formatStage(game.stage)}` : ''}
                  </span>
                  <span>{game.isRivalry ? `${opponentName} / дерби` : opponentName}</span>
                  <span>{isHome ? 'дома' : 'в гостях'}</span>
                  <strong>{result}</strong>
                  <strong>{game.score || '—'}</strong>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {collegeTeamProfileTab === 'history' && (
        <Card title="История">
          <div className="stack compact-stack">
            <div className="stat-strip">
              <span>титулы {team.history.filter((entry) => entry.wonTitle).length}</span>
              <span>сезонов {team.history.length}</span>
            </div>
            {team.history.length > 0 ? (
              <div className="list">
                {team.history.map((season) => (
                  <div className="history-item" key={`${team.id}-${season.year}`}>
                    <div className="eyebrow">{season.year}</div>
                    <strong>{season.wins}-{season.losses}</strong>
                    <p>очки {season.pointsFor}-{season.pointsAgainst}</p>
                    <p>{season.wonTitle ? 'чемпион' : '—'}</p>
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
