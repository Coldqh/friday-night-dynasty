import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatClassYear, formatDefenseStyle, formatOffenseStyle, formatStage } from '../localization';
import { getCollegeRosterStrength } from '../../core/colleges/collegeRatings';
import { getCollegeRivalryRecord } from '../../core/colleges/collegeRivalries';
import { getCollegeTeamSchedule } from '../../core/colleges/getCollegeDisplayData';
import { CollegeTeamProfileTab, useGameStore } from '../store/useGameStore';

const profileTabs: Array<{ id: CollegeTeamProfileTab; label: string }> = [
  { id: 'overview', label: 'Обзор' },
  { id: 'roster', label: 'Состав' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'history', label: 'История' }
];

export function CollegeTeamProfileScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedCollegeTeamId = useGameStore((state) => state.selectedCollegeTeamId);
  const collegeTeamProfileTab = useGameStore((state) => state.collegeTeamProfileTab);
  const setCollegeTeamProfileTab = useGameStore((state) => state.setCollegeTeamProfileTab);
  const closeCollegeTeamProfile = useGameStore((state) => state.closeCollegeTeamProfile);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const team = (world.collegeTeams ?? []).find((entry) => entry.id === selectedCollegeTeamId) ?? (world.collegeTeams ?? [])[0];
  const college = team ? (world.colleges ?? []).find((entry) => entry.id === team.collegeId) ?? null : null;

  if (!team) {
    return (
      <Card title="Профиль колледжа">
        <p className="muted">Колледж не найден.</p>
        <Button variant="ghost" onClick={closeCollegeTeamProfile}>Назад</Button>
      </Card>
    );
  }

  const roster = (world.collegePlayers ?? [])
    .filter((player) => player.collegeTeamId === team.id)
    .sort((left, right) => right.overall - left.overall || right.potential - left.potential);
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

  return (
    <div className="stack">
      <Card title="Профиль колледжа">
        <div className="stack compact-stack">
          <div className="eyebrow">{college?.name ?? team.name}</div>
          <h3 className="profile-title">{team.shortName}</h3>
          <div className="stat-strip">
            <span>сезон {team.wins}-{team.losses}</span>
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
        <Card title="Состав">
          {roster.length === 0 ? (
            <p className="muted">Нет игроков.</p>
          ) : (
            <div className="table compact-table">
              <div className="table-head grid-profile-roster">
                <span>имя</span>
                <span>поз</span>
                <span>курс</span>
                <span>общ</span>
                <span>пот</span>
                <span>допуск</span>
              </div>
              {roster.map((player) => (
                <div className="table-row grid-profile-roster" key={player.id}>
                  <button className="table-row-button" onClick={() => openPlayerProfile(player.id, 'collegeTeamProfile')}>
                    {player.firstName} {player.lastName}
                  </button>
                  <span>{player.position}</span>
                  <span>{formatClassYear(player.classYear)}</span>
                  <strong>{player.overall}</strong>
                  <strong>{player.potential}</strong>
                  <span>{player.eligibilityRemaining}</span>
                </div>
              ))}
            </div>
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
