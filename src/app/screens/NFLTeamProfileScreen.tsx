import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { NFLLogo } from '../components/NFLLogo';
import { PaginationControls, getPagedItems } from '../components/PaginationControls';
import { ensureNFLLayer, getNFLTeamOverall } from '../../core/nfl/nflLayer';
import { NFLPlayer, NFLTeam, NFLWorld } from '../../core/nfl/nflTypes';
import { GameWorld } from '../../core/world/worldTypes';
import { NFLTeamProfileTab, useGameStore } from '../store/useGameStore';

const tabs: Array<{ id: NFLTeamProfileTab; label: string }> = [
  { id: 'overview', label: 'Обзор' },
  { id: 'roster', label: 'Состав' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'history', label: 'История' },
  { id: 'trades', label: 'Трейды' }
];

const PAGE_SIZE = 22;
type SortKey = 'position' | 'overall' | 'potential' | 'age' | 'salary';

function sortPlayers(players: NFLPlayer[], key: SortKey, direction: 'asc' | 'desc') {
  const mod = direction === 'asc' ? 1 : -1;

  return [...players].sort((left, right) => {
    let result = 0;

    if (key === 'position') result = left.position.localeCompare(right.position);
    if (key === 'overall') result = left.overall - right.overall;
    if (key === 'potential') result = left.potential - right.potential;
    if (key === 'age') result = left.age - right.age;
    if (key === 'salary') result = left.salary - right.salary;

    return result * mod || right.overall - left.overall || left.lastName.localeCompare(right.lastName);
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
  sortKey: SortKey;
  currentSortKey: SortKey;
  direction: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
}) {
  const marker = currentSortKey === sortKey ? (direction === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <button className="sort-header" onClick={() => onSort(sortKey)}>
      {label}{marker}
    </button>
  );
}

function getTeamSchedule(world: NFLWorld, team: NFLTeam) {
  const games = world.nflSeason?.schedule.flatMap((week) => week.games) ?? [];
  const completed = world.nflSeason?.completedGames ?? [];
  const all = [...games, ...completed];
  const byId = new Map(all.map((game) => [game.id, game]));
  const teams = new Map((world.nflTeams ?? []).map((entry) => [entry.id, entry]));

  return [...byId.values()]
    .filter((game) => game.homeTeamId === team.id || game.awayTeamId === team.id)
    .sort((left, right) => left.week - right.week)
    .map((game) => {
      const isHome = game.homeTeamId === team.id;
      const opponent = teams.get(isHome ? game.awayTeamId : game.homeTeamId);
      const score = game.homeScore === null || game.awayScore === null ? '—' : `${game.awayScore}-${game.homeScore}`;
      const result = game.winnerId ? (game.winnerId === team.id ? 'W' : 'L') : 'впереди';

      return {
        ...game,
        opponentName: opponent?.shortName ?? '—',
        homeAway: isHome ? 'дома' : 'в гостях',
        score,
        result
      };
    });
}

export function NFLTeamProfileScreen() {
  const world = ensureNFLLayer(useGameStore((state) => state.world)!) as GameWorld & NFLWorld;
  const selectedNFLTeamId = useGameStore((state) => state.selectedNFLTeamId);
  const nflTeamProfileTab = useGameStore((state) => state.nflTeamProfileTab);
  const setNFLTeamProfileTab = useGameStore((state) => state.setNFLTeamProfileTab);
  const closeNFLTeamProfile = useGameStore((state) => state.closeNFLTeamProfile);
  const runTrades = useGameStore((state) => state.runTrades);
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('overall');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const team = (world.nflTeams ?? []).find((entry) => entry.id === selectedNFLTeamId) ?? (world.nflTeams ?? [])[0];

  if (!team) {
    return (
      <Card title="Профиль NFL команды">
        <p className="muted">Команда не найдена.</p>
        <Button variant="ghost" onClick={closeNFLTeamProfile}>Назад</Button>
      </Card>
    );
  }

  const roster = sortPlayers((world.nflPlayers ?? []).filter((player) => player.teamId === team.id), sortKey, direction);
  const { pageItems, currentPage, totalPages } = getPagedItems(roster, page, PAGE_SIZE);
  const schedule = getTeamSchedule(world, team);
  const teamTrades = (world.nflTrades ?? []).filter((trade) => trade.fromTeamId === team.id || trade.toTeamId === team.id).slice(-20).reverse();
  const standing = world.nflSeason?.standings.find((entry) => entry.teamId === team.id);

  function handleSort(key: SortKey) {
    setPage(0);
    if (sortKey === key) {
      setDirection((current) => current === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortKey(key);
    setDirection(key === 'position' ? 'asc' : 'desc');
  }

  return (
    <div className="stack">
      <Card title="Профиль NFL команды">
        <div className="profile-program-header">
          <NFLLogo logoAsset={team.logoAsset} name={team.shortName} className="profile-program-logo large" placeholderClassName="team-logo-placeholder large" />
          <div>
            <div className="eyebrow">{team.conference} / {team.division}</div>
            <h3 className="profile-title">{team.shortName}</h3>
          </div>
        </div>
        <div className="stat-strip">
          <span>{team.wins}-{team.losses}</span>
          <span>OVR {getNFLTeamOverall(world, team.id)}</span>
          <span>очки {team.pointsFor}-{team.pointsAgainst}</span>
          <span>игроков {roster.length}</span>
          <span>место #{standing?.rank ?? '—'}</span>
        </div>
        <div className="button-row">
          <Button variant="ghost" onClick={closeNFLTeamProfile}>Назад</Button>
        </div>
      </Card>

      <Card title="Разделы">
        <div className="tab-row">
          {tabs.map((tab) => (
            <button key={tab.id} className={nflTeamProfileTab === tab.id ? 'tab-chip active' : 'tab-chip'} onClick={() => setNFLTeamProfileTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {nflTeamProfileTab === 'overview' && (
        <Card title="Обзор">
          <div className="stat-strip">
            <span>конференция {team.conference}</span>
            <span>дивизион {team.division}</span>
            <span>престиж {team.prestige}</span>
            <span>плей-офф {team.history.filter((entry) => entry.madePlayoffs).length}</span>
            <span>Super Bowl {team.history.filter((entry) => entry.wonSuperBowl).length}</span>
          </div>
        </Card>
      )}

      {nflTeamProfileTab === 'roster' && (
        <Card title={`Состав (${roster.length})`}>
          <div className="table compact-table">
            <div className="table-head grid-nfl-roster">
              <span>игрок</span>
              <SortButton label="поз" sortKey="position" currentSortKey={sortKey} direction={direction} onSort={handleSort} />
              <SortButton label="OVR" sortKey="overall" currentSortKey={sortKey} direction={direction} onSort={handleSort} />
              <SortButton label="пот" sortKey="potential" currentSortKey={sortKey} direction={direction} onSort={handleSort} />
              <SortButton label="возраст" sortKey="age" currentSortKey={sortKey} direction={direction} onSort={handleSort} />
              <SortButton label="зарплата" sortKey="salary" currentSortKey={sortKey} direction={direction} onSort={handleSort} />
            </div>
            {pageItems.map((player) => (
              <div className="table-row grid-nfl-roster" key={player.id}>
                <span>{player.firstName} {player.lastName}</span>
                <span>{player.position}</span>
                <strong>{player.overall}</strong>
                <strong>{player.potential}</strong>
                <span>{player.age}</span>
                <span>${Math.round(player.salary / 1_000_000)}M</span>
              </div>
            ))}
          </div>
          <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </Card>
      )}

      {nflTeamProfileTab === 'schedule' && (
        <Card title="Календарь">
          <div className="table compact-table">
            <div className="table-head grid-team-schedule">
              <span>нед</span>
              <span>соперник</span>
              <span>дом/гости</span>
              <span>итог</span>
              <span>счёт</span>
            </div>
            {schedule.map((game) => (
              <div className="table-row grid-team-schedule" key={game.id}>
                <span>Н{game.week + 1}</span>
                <span>{game.opponentName}</span>
                <span>{game.homeAway}</span>
                <strong>{game.result}</strong>
                <strong>{game.score}</strong>
              </div>
            ))}
          </div>
        </Card>
      )}

      {nflTeamProfileTab === 'history' && (
        <Card title="История">
          {team.history.length === 0 ? (
            <p className="muted">Нет завершённых сезонов.</p>
          ) : (
            <div className="list">
              {team.history.map((season) => (
                <div className="history-item" key={`${team.id}-${season.year}`}>
                  <div className="eyebrow">{season.year}</div>
                  <strong>{season.wins}-{season.losses}</strong>
                  <p>очки {season.pointsFor}-{season.pointsAgainst}</p>
                  <p>{season.wonSuperBowl ? 'Super Bowl' : season.madePlayoffs ? 'плей-офф' : '—'}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {nflTeamProfileTab === 'trades' && (
        <Card title="Трейды">
          <div className="button-row">
            <Button variant="ghost" onClick={runTrades}>Сгенерировать трейды</Button>
          </div>
          {teamTrades.length === 0 ? (
            <p className="muted">Нет трейдов.</p>
          ) : (
            <div className="list">
              {teamTrades.map((trade) => (
                <div className="history-item" key={trade.id}>
                  <div className="eyebrow">{trade.year} / неделя {trade.week + 1}</div>
                  <strong>{trade.playerName} / {trade.position} / OVR {trade.overall}</strong>
                  <p>{trade.fromTeamName} → {trade.toTeamName}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
