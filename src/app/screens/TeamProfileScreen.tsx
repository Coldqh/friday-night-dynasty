import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatClassYear, formatDefenseStyle, formatOffenseStyle, formatStage } from '../localization';
import { getPlayerLifeSummary } from '../../core/people/personUtils';
import { getRivalryRecord } from '../../core/rivalries/getRivalryRecord';
import { getTeamHistorySnapshot } from '../../core/teams/getTeamHistorySnapshot';
import { getTeamIdentityProfile } from '../../core/teams/getTeamIdentityProfile';
import { getTeamLeaders } from '../../core/teams/getTeamLeaders';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { getTeamSchedule } from '../../core/teams/getTeamSchedule';
import { TeamProfileTab, useGameStore } from '../store/useGameStore';

const profileTabs: Array<{ id: TeamProfileTab; label: string }> = [
  { id: 'overview', label: 'Обзор' },
  { id: 'roster', label: 'Состав' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'history', label: 'История' }
];

function formatAllTimeRivalryRecord(teamName: string, rivalName: string, teamWins: number, rivalWins: number, ties: number) {
  return `Вся история: ${teamName} ${teamWins} — ${rivalName} ${rivalWins}${ties > 0 ? ` / ничьи ${ties}` : ''}`;
}

function formatLastGame(
  teamNames: { teamId: string; rivalId: string; teamName: string; rivalName: string },
  record: ReturnType<typeof getRivalryRecord>
) {
  if (!record.lastGame) {
    return 'истории личных встреч пока нет';
  }

  const winnerName =
    record.lastGame.winnerId === teamNames.teamId
      ? teamNames.teamName
      : record.lastGame.winnerId === teamNames.rivalId
        ? teamNames.rivalName
        : null;

  const score = `${record.lastGame.awayScore}-${record.lastGame.homeScore}`;
  const resultNote = winnerName ? `${winnerName} выиграла ${score}` : `счёт ${score}`;

  return `${record.lastGame.year} / ${resultNote}`;
}

function formatStreak(teamNames: { teamId: string; rivalId: string; teamName: string; rivalName: string }, record: ReturnType<typeof getRivalryRecord>) {
  if (!record.currentStreak) {
    return 'серии побед нет';
  }

  const streakOwner =
    record.currentStreak.teamId === teamNames.teamId ? teamNames.teamName : teamNames.rivalName;

  return `${streakOwner}: побед подряд ${record.currentStreak.wins}`;
}

export function TeamProfileScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const teamProfileTab = useGameStore((state) => state.teamProfileTab);
  const setTeamProfileTab = useGameStore((state) => state.setTeamProfileTab);
  const closeTeamProfile = useGameStore((state) => state.closeTeamProfile);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const team = world.teams.find((entry) => entry.id === selectedTeamId) ?? world.teams[0];
  const identity = getTeamIdentityProfile(world, team.id);
  const leaders = getTeamLeaders(world, team.id);
  const roster = getTeamRoster(world, team.id).sort((left, right) => right.overall - left.overall);
  const schedule = getTeamSchedule(world, team.id);
  const history = getTeamHistorySnapshot(world, team.id);
  const standing = world.season.standings.find((entry) => entry.teamId === team.id);
  const recentNotes = [...schedule].filter((game) => game.summary).slice(-4).reverse();
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

  return (
    <div className="stack">
      <Card title="Профиль команды">
        <div className="stack compact-stack">
          <div className="eyebrow">
            {team.schoolName} / {team.cityName} / {team.mascot}
          </div>
          <h3 className="profile-title">{team.name}</h3>
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

      <Card title="Разделы команды">
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
            <div className="stack compact-stack">
              <div className="identity-tier">{identity.programTier}</div>
              <p className="muted">{identity.description}</p>
              <p className="muted">
                {standing
                  ? `${team.shortName}: место #${standing.rank}, баланс ${standing.wins}-${standing.losses}, очки ${standing.pointsFor}-${standing.pointsAgainst}.`
                  : `${team.shortName}: сезон только начинается.`}
              </p>
            </div>
          </Card>

          <Card title="Лидеры команды">
            <div className="list">
              {leaderRows.map(({ label, player }) => (
                <div className="list-row" key={label}>
                  <div>
                    <strong>{label}</strong>
                    <p className="muted">
                      {player
                        ? `${player.firstName} ${player.lastName} / ${player.position} / ${formatClassYear(player.classYear)}`
                        : 'игрок для этой роли пока не найден'}
                    </p>
                    {player ? <p className="muted">{getPlayerLifeSummary(world, player.id)}</p> : null}
                    {player ? (
                      <button className="filter-chip" onClick={() => openPlayerProfile(player.id, 'teamProfile')}>
                        Профиль игрока
                      </button>
                    ) : null}
                  </div>
                  <strong>{player ? `общ ${player.overall} / пот ${player.potential}` : 'нет'}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Принципиальные соперники">
            {rivals.length === 0 ? (
              <p className="muted">У команды пока нет принципиального соперника.</p>
            ) : (
              <div className="list">
                {rivals.map((rival) => (
                  <div className="history-item" key={rival.team.id}>
                    <div className="eyebrow">история соперничества</div>
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
                    <p className="muted">
                      матчей {rival.rivalryRecord.gamesPlayed}
                      {rival.rivalryRecord.gamesPlayed > 0 ? ` / последний матч ${formatLastGame(
                        {
                          teamId: team.id,
                          rivalId: rival.team.id,
                          teamName: team.shortName,
                          rivalName: rival.team.shortName
                        },
                        rival.rivalryRecord
                      )}` : ' / матчей ещё не было'}
                    </p>
                    <p className="muted">
                      {formatStreak(
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

          <Card title="Последние заметки команды">
            {recentNotes.length === 0 ? (
              <p className="muted">Заметки появятся после сыгранных матчей.</p>
            ) : (
              <div className="list">
                {recentNotes.map((game) => (
                  <div className="history-item" key={`${game.gameId}-note`}>
                    <div className="eyebrow">
                      неделя {game.week + 1}
                      {game.stage !== 'regular' ? ` / ${formatStage(game.stage)}` : ''}
                    </div>
                    <strong>{game.isRivalry ? `${game.opponentName} / дерби` : game.opponentName}</strong>
                    <p>{game.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {teamProfileTab === 'roster' && (
        <Card title="Состав">
          <div className="table compact-table">
            <div className="table-head grid-profile-roster">
              <span>имя</span>
              <span>поз</span>
              <span>класс</span>
              <span>общ</span>
              <span>пот</span>
              <span>личность</span>
            </div>
            {roster.map((player) => (
              <div className="table-row grid-profile-roster" key={player.id}>
                <button className="table-row-button" onClick={() => openPlayerProfile(player.id, 'teamProfile')}>
                  {player.firstName} {player.lastName}
                </button>
                <span>{player.position}</span>
                <span>{formatClassYear(player.classYear)}</span>
                <strong>{player.overall}</strong>
                <strong>{player.potential}</strong>
                <span>
                  {getPlayerLifeSummary(world, player.id)}
                  {player.traits.length > 0 ? ` / ${player.traits.join(', ')}` : ''}
                </span>
              </div>
            ))}
          </div>
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
        <Card title="История программы">
          <div className="stack compact-stack">
            <div className="stat-strip">
              <span>текущий сезон {history.currentSeasonRecord.label}</span>
              <span>
                вся история {history.totalHistoricalWins}-{history.totalHistoricalLosses}
              </span>
              <span>титулы {history.titlesCount}</span>
              <span>плей-офф {history.playoffAppearancesCount}</span>
            </div>
            {history.lastSeasonEntry ? (
              <div className="history-item">
                <div className="eyebrow">прошлый сезон</div>
                <strong>
                  {history.lastSeasonEntry.year}: {history.lastSeasonEntry.wins}-{history.lastSeasonEntry.losses}
                </strong>
                <p>{history.lastSeasonEntry.note}</p>
              </div>
            ) : (
              <p className="muted">Команда ещё пишет первую главу своей истории.</p>
            )}
            {history.history.length > 0 && (
              <div className="list">
                {history.history.map((season) => (
                  <div className="history-item" key={`${team.id}-${season.year}`}>
                    <div className="eyebrow">{season.year}</div>
                    <strong>
                      {season.wins}-{season.losses}
                    </strong>
                    <p>
                      очки {season.pointsFor}-{season.pointsAgainst}
                    </p>
                    <p>{season.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
