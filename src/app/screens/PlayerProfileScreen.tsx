import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatCareerEventType, formatCareerStage, formatClassYear } from '../localization';
import { getSeasonAwardWatch } from '../../core/awards/getSeasonAwardWatch';
import { getPersonForPlayer } from '../../core/people/personUtils';
import { getCollegeTeamName, getRecruitingStatusLabel } from '../../core/recruiting/recruitingUtils';
import { getCommitmentForCollegePlayer, getRecruitingProfileForPlayer } from '../../core/recruiting/getRecruitingProfile';
import { CollegePlayer, GameWorld, Player } from '../../core/world/worldTypes';
import { useGameStore } from '../store/useGameStore';

type ProfileTarget =
  | { kind: 'school'; player: Player }
  | { kind: 'graduate'; player: Player }
  | { kind: 'college'; player: CollegePlayer };

function formatHeight(inches: number) {
  const cm = Math.round(inches * 2.54);
  return `${cm} см`;
}

function getFullName(player: Pick<Player, 'firstName' | 'lastName'> | Pick<CollegePlayer, 'firstName' | 'lastName'>) {
  return `${player.firstName} ${player.lastName}`;
}

function getCollegePlayerBySourcePlayerId(world: GameWorld, sourcePlayerId: string | null) {
  if (!sourcePlayerId) {
    return null;
  }

  const commitment = (world.commitments ?? []).find(
    (entry) => entry.playerId === sourcePlayerId && entry.convertedToCollegePlayerId
  );

  if (commitment?.convertedToCollegePlayerId) {
    return (world.collegePlayers ?? []).find((player) => player.id === commitment.convertedToCollegePlayerId) ?? null;
  }

  return (world.collegePlayers ?? []).find((player) => player.sourcePlayerId === sourcePlayerId) ?? null;
}

function getTarget(world: GameWorld | null, selectedPlayerId: string | null): ProfileTarget | null {
  if (!world) {
    return null;
  }

  const directCollege = (world.collegePlayers ?? []).find((entry) => entry.id === selectedPlayerId);
  if (directCollege) {
    return { kind: 'college', player: directCollege };
  }

  const convertedCollege = getCollegePlayerBySourcePlayerId(world, selectedPlayerId);
  if (convertedCollege) {
    return { kind: 'college', player: convertedCollege };
  }

  const school = world.players.find((entry) => entry.id === selectedPlayerId);
  if (school) {
    return { kind: 'school', player: school };
  }

  const graduate = (world.graduatedPlayers ?? []).find((entry) => entry.id === selectedPlayerId);
  if (graduate) {
    return { kind: 'graduate', player: graduate };
  }

  const fallbackSchool = world.players[0];
  if (fallbackSchool) {
    return { kind: 'school', player: fallbackSchool };
  }

  const fallbackCollege = (world.collegePlayers ?? [])[0];
  if (fallbackCollege) {
    return { kind: 'college', player: fallbackCollege };
  }

  return null;
}

export function PlayerProfileScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedPlayerId = useGameStore((state) => state.selectedPlayerId);
  const favoritePlayerIds = useGameStore((state) => state.favoritePlayerIds);
  const toggleFavoritePlayer = useGameStore((state) => state.toggleFavoritePlayer);
  const closePlayerProfile = useGameStore((state) => state.closePlayerProfile);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const target = getTarget(world, selectedPlayerId);

  if (!target) {
    return (
      <Card title="Профиль игрока">
        <p className="muted">Запись игрока не найдена.</p>
        <Button variant="ghost" onClick={closePlayerProfile}>Назад</Button>
      </Card>
    );
  }

  if (target.kind === 'college') {
    const player = target.player;
    const favoriteKey = favoritePlayerIds.includes(player.sourcePlayerId) ? player.sourcePlayerId : player.id;
    const isFavorite = favoritePlayerIds.includes(favoriteKey);
    const person = (world.people ?? []).find((entry) => entry.id === player.personId) ?? null;
    const school = world.schools.find((entry) => entry.id === player.sourceSchoolId) ?? null;
    const collegeTeam = (world.collegeTeams ?? []).find((entry) => entry.id === player.collegeTeamId) ?? null;
    const hometown = world.cities.find((entry) => entry.id === player.hometownCityId) ?? null;
    const careerEvents = person?.careerEvents ?? [];
    const collegeCommitment = getCommitmentForCollegePlayer(world, player.id);
    const collegeName = collegeCommitment?.collegeName ?? collegeTeam?.shortName ?? '—';

    return (
      <div className="stack">
        <Card title="Профиль игрока">
          <div className="profile-header-row">
            <div>
              <div className="eyebrow">игрок уровня II</div>
              <h3 className="profile-title">{getFullName(player)}</h3>
            </div>
            <button
              className={isFavorite ? 'favorite-star active' : 'favorite-star'}
              onClick={() => toggleFavoritePlayer(favoriteKey)}
              title={isFavorite ? 'Убрать из избранных' : 'Добавить в избранные'}
            >
              ★
            </button>
          </div>

          <div className="stack compact-stack">
            <div className="stat-strip">
              <span>{player.position}</span>
              <span>{formatClassYear(player.classYear)}</span>
              <span>лет допуска {player.eligibilityRemaining}</span>
              <span>общ {player.overall}</span>
              <span>пот {player.potential}</span>
              <span>{formatHeight(player.height)}</span>
              <span>{Math.round(player.weight * 0.453592)} кг</span>
            </div>
            <p className="muted">
              {collegeTeam?.shortName ?? '—'} / {school?.name ?? '—'} / {hometown?.name ?? '—'}
            </p>
            <div className="button-row">
              <Button variant="ghost" onClick={closePlayerProfile}>Назад</Button>
            </div>
          </div>
        </Card>

        <Card title="Данные">
          {person ? (
            <div className="stat-strip">
              <span>репутация {person.reputation}</span>
              <span>амбиции {person.ambition}</span>
              <span>дисциплина {person.discipline}</span>
              <span>год рождения {person.birthYear}</span>
            </div>
          ) : (
            <p className="muted">Нет записи.</p>
          )}
        </Card>

        <Card title="Рекрутинг">
          {collegeCommitment ? (
            <div className="stat-strip">
              <span>{collegeCommitment.stars}★</span>
              <span>рейтинг {collegeCommitment.prospectScore}</span>
              <span>{collegeName}</span>
            </div>
          ) : (
            <p className="muted">Нет профиля.</p>
          )}
        </Card>

        <Card title="Статистика">
          <div className="table compact-table">
            <div className="table-head" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
              <span>период</span>
              <span>пас</span>
              <span>вынос</span>
              <span>приём</span>
              <span>тач</span>
              <span>захв</span>
              <span>сэк</span>
              <span>int</span>
            </div>
            <div className="table-row" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
              <strong>сезон</strong>
              <span>{player.seasonStats.passingYards}</span>
              <span>{player.seasonStats.rushingYards}</span>
              <span>{player.seasonStats.receivingYards}</span>
              <span>{player.seasonStats.touchdowns}</span>
              <span>{player.seasonStats.tackles}</span>
              <span>{player.seasonStats.sacks}</span>
              <span>{player.seasonStats.interceptions}</span>
            </div>
            <div className="table-row" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
              <strong>карьера</strong>
              <span>{player.careerStats.passingYards}</span>
              <span>{player.careerStats.rushingYards}</span>
              <span>{player.careerStats.receivingYards}</span>
              <span>{player.careerStats.touchdowns}</span>
              <span>{player.careerStats.tackles}</span>
              <span>{player.careerStats.sacks}</span>
              <span>{player.careerStats.interceptions}</span>
            </div>
          </div>
        </Card>

        <Card title="Карьера">
          {careerEvents.length === 0 ? (
            <p className="muted">Нет событий.</p>
          ) : (
            <div className="list">
              {careerEvents.map((event) => (
                <div className="history-item" key={event.id}>
                  <div className="eyebrow">{event.year} / неделя {event.week + 1} / {formatCareerEventType(event.type)}</div>
                  <strong>{event.title}</strong>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  const player = target.player;
  const isFavorite = favoritePlayerIds.includes(player.id);
  const person = getPersonForPlayer(world, player.id);
  const team = world.teams.find((entry) => entry.id === player.teamId) ?? null;
  const school = world.schools.find((entry) => entry.id === player.schoolId) ?? null;
  const hometown = world.cities.find((entry) => entry.id === (player.hometownCityId ?? player.cityId)) ?? null;
  const awards = getSeasonAwardWatch(world).filter((entry) => entry.playerId === player.id);
  const careerEvents = person?.careerEvents ?? [];
  const recruitingProfile = getRecruitingProfileForPlayer(world, player.id);
  const collegeName = recruitingProfile
    ? getCollegeTeamName(world.colleges ?? [], world.collegeTeams ?? [], recruitingProfile.committedCollegeTeamId)
    : '—';
  const stageLabel = target.kind === 'graduate' ? 'выпускник' : formatCareerStage(player.careerStage);

  return (
    <div className="stack">
      <Card title="Профиль игрока">
        <div className="profile-header-row">
          <div>
            <div className="eyebrow">{stageLabel}</div>
            <h3 className="profile-title">{getFullName(player)}</h3>
          </div>
          <button
            className={isFavorite ? 'favorite-star active' : 'favorite-star'}
            onClick={() => toggleFavoritePlayer(player.id)}
            title={isFavorite ? 'Убрать из избранных' : 'Добавить в избранные'}
          >
            ★
          </button>
        </div>

        <div className="stack compact-stack">
          <div className="stat-strip">
            <span>{player.position}</span>
            <span>{formatClassYear(player.classYear)}</span>
            <span>общ {player.overall}</span>
            <span>пот {player.potential}</span>
            <span>{formatHeight(player.height)}</span>
            <span>{Math.round(player.weight * 0.453592)} кг</span>
          </div>
          <p className="muted">
            {school?.name ?? 'неизвестная программа'} / {team?.shortName ?? 'неизвестная команда'} / {hometown?.name ?? 'неизвестный город'}
          </p>
          <div className="button-row">
            <Button variant="ghost" onClick={closePlayerProfile}>Назад</Button>
            {team ? <Button variant="ghost" onClick={() => openTeamProfile(team.id, 'roster', 'playerProfile')}>Команда</Button> : null}
          </div>
        </div>
      </Card>

      <Card title="Данные">
        {person ? (
          <div className="stat-strip">
            <span>репутация {person.reputation}</span>
            <span>амбиции {person.ambition}</span>
            <span>дисциплина {person.discipline}</span>
            <span>год рождения {person.birthYear}</span>
          </div>
        ) : (
          <p className="muted">Нет записи.</p>
        )}
      </Card>

      <Card title="Рекрутинг">
        {recruitingProfile ? (
          <div className="stat-strip">
            <span>{recruitingProfile.stars}★</span>
            <span>рейтинг {recruitingProfile.prospectScore}</span>
            <span>место #{recruitingProfile.stateRank}</span>
            <span>{getRecruitingStatusLabel(recruitingProfile.status)}</span>
            <span>{collegeName}</span>
          </div>
        ) : (
          <p className="muted">Нет профиля.</p>
        )}
      </Card>

      <Card title="Статистика">
        <div className="table compact-table">
          <div className="table-head" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
            <span>период</span>
            <span>пас</span>
            <span>вынос</span>
            <span>приём</span>
            <span>тач</span>
            <span>захв</span>
            <span>сэк</span>
            <span>int</span>
          </div>
          <div className="table-row" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
            <strong>сезон</strong>
            <span>{player.seasonStats.passingYards}</span>
            <span>{player.seasonStats.rushingYards}</span>
            <span>{player.seasonStats.receivingYards}</span>
            <span>{player.seasonStats.touchdowns}</span>
            <span>{player.seasonStats.tackles}</span>
            <span>{player.seasonStats.sacks}</span>
            <span>{player.seasonStats.interceptions}</span>
          </div>
          <div className="table-row" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
            <strong>карьера</strong>
            <span>{player.careerStats.passingYards}</span>
            <span>{player.careerStats.rushingYards}</span>
            <span>{player.careerStats.receivingYards}</span>
            <span>{player.careerStats.touchdowns}</span>
            <span>{player.careerStats.tackles}</span>
            <span>{player.careerStats.sacks}</span>
            <span>{player.careerStats.interceptions}</span>
          </div>
        </div>
      </Card>

      <Card title="Награды">
        {awards.length === 0 ? (
          <p className="muted">Нет.</p>
        ) : (
          <div className="list">
            {awards.map((award) => (
              <div className="history-item" key={`${award.type}-${award.playerId}`}>
                <div className="eyebrow">оценка {award.score}</div>
                <strong>{award.title}</strong>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Карьера">
        {careerEvents.length === 0 ? (
          <p className="muted">Нет событий.</p>
        ) : (
          <div className="list">
            {careerEvents.map((event) => (
              <div className="history-item" key={event.id}>
                <div className="eyebrow">{event.year} / неделя {event.week + 1} / {formatCareerEventType(event.type)}</div>
                <strong>{event.title}</strong>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
