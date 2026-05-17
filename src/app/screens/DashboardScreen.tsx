import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatHeadlineType, formatPhase, formatStakeLabel } from '../localization';
import { GAME_VERSION_LABEL, GAME_VERSION_NAME } from '../version';
import { getSeasonAwardWatch } from '../../core/awards/getSeasonAwardWatch';
import { generateWeeklyHeadlines } from '../../core/news/generateWeeklyHeadlines';
import { getProspectPool } from '../../core/prospects/getProspectPool';
import { getWeeklySlate } from '../../core/schedule/getWeeklySlate';
import { useGameStore } from '../store/useGameStore';

function getSeasonStatusLabel({
  phase,
  currentWeek,
  completedGames
}: {
  phase: 'regular' | 'playoffs' | 'offseason';
  currentWeek: number;
  completedGames: number;
}) {
  if (phase === 'offseason') {
    return 'сезон завершён';
  }

  if (phase === 'playoffs') {
    return 'плей-офф';
  }

  if (currentWeek === 0 && completedGames === 0) {
    return 'предсезонье';
  }

  return 'регулярный сезон';
}

export function getDashboardStatusPills(seasonStatus: string, teamCount: number) {
  return [seasonStatus, `${teamCount} команд`];
}

export function DashboardScreen() {
  const world = useGameStore((state) => state.world)!;
  const simNextWeek = useGameStore((state) => state.simNextWeek);
  const simFullSeason = useGameStore((state) => state.simFullSeason);
  const advanceToNextSeason = useGameStore((state) => state.advanceToNextSeason);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const setScreen = useGameStore((state) => state.setScreen);
  const slate = getWeeklySlate(world);
  const headlines = generateWeeklyHeadlines(world).slice(0, 5);
  const awards = getSeasonAwardWatch(world).slice(0, 4);
  const prospects = getProspectPool(world).slice(0, 4);
  const latestChampion = world.history.champions[world.history.champions.length - 1] ?? null;
  const topStandings = world.season.standings.slice(0, 5);
  const recentSeasonEntries = world.season.seasonLog.slice(0, 5);
  const seasonStatus = getSeasonStatusLabel({
    phase: world.phase,
    currentWeek: world.season.currentWeek,
    completedGames: world.season.completedGames.length
  });
  const peopleCount = world.people?.length ?? 0;
  const graduatedCount = world.graduatedPlayers?.length ?? 0;
  const activePlayerCount = world.players.length;

  return (
    <div className="stack">
      <Card title="Состояние сезона">
        <div className="dashboard-grid">
          <div>
            <div className="eyebrow">год</div>
            <p className="big-number">{world.season.year}</p>
          </div>
          <div>
            <div className="eyebrow">неделя</div>
            <p className="big-number">{world.phase === 'offseason' ? 'готово' : world.season.currentWeek + 1}</p>
          </div>
          <div>
            <div className="eyebrow">регулярка</div>
            <p className="big-number">{world.season.regularSeasonWeeks}</p>
          </div>
        </div>

        <div className="stat-strip">
          {getDashboardStatusPills(seasonStatus, world.teams.length).map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span>{GAME_VERSION_LABEL}</span>
          <span>{GAME_VERSION_NAME}</span>
        </div>

        <div className="button-row">
          <Button disabled={world.phase === 'offseason'} onClick={simNextWeek}>
            Симулировать неделю
          </Button>
          <Button disabled={world.phase === 'offseason'} variant="ghost" onClick={simFullSeason}>
            Симулировать сезон
          </Button>
        </div>

        {world.phase === 'offseason' && world.season.championId && (
          <div className="button-row">
            <Button onClick={advanceToNextSeason}>Перейти к новому сезону</Button>
          </div>
        )}
      </Card>

      <Card title="Пульс мира">
        <div className="dashboard-grid">
          <div>
            <div className="eyebrow">людей в базе</div>
            <p className="big-number">{peopleCount}</p>
          </div>
          <div>
            <div className="eyebrow">активных игроков</div>
            <p className="big-number">{activePlayerCount}</p>
          </div>
          <div>
            <div className="eyebrow">выпускников</div>
            <p className="big-number">{graduatedCount}</p>
          </div>
        </div>
        <p className="muted">Мир уже хранит игроков как людей: школа, выпуск, будущий рекрутинг, колледж и дальнейшая карьера.</p>
      </Card>

      <Card title="Пул выпускников">
        {prospects.length === 0 ? (
          <p className="muted">Выпускники появятся после первого завершённого сезона и перехода через межсезонье.</p>
        ) : (
          <div className="list">
            {prospects.map((prospect) => (
              <div className="list-row" key={prospect.playerId}>
                <div>
                  <strong>{prospect.playerName}</strong>
                  <p className="muted">
                    {prospect.position} / {prospect.teamName} / рейтинг {prospect.score}
                  </p>
                  <p className="muted">{prospect.projection}</p>
                </div>
                <button className="filter-chip" onClick={() => openPlayerProfile(prospect.playerId, 'dashboard')}>
                  Профиль
                </button>
              </div>
            ))}
            <button className="filter-chip" onClick={() => setScreen('prospects')}>Открыть всех выпускников</button>
          </div>
        )}
      </Card>

      <Card title="Претенденты на награды">
        {awards.length === 0 ? (
          <p className="muted">Список появится, когда в мире будут активные игроки.</p>
        ) : (
          <div className="list">
            {awards.map((award) => (
              <div className="list-row" key={`${award.type}-${award.playerId}`}>
                <div>
                  <strong>{award.title}</strong>
                  <p className="muted">
                    {award.playerName} / {award.position} / {award.classYear} / {award.teamName}
                  </p>
                  <p className="muted">{award.reason}</p>
                </div>
                <button className="filter-chip" onClick={() => openPlayerProfile(award.playerId, 'dashboard')}>
                  Профиль
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {world.phase === 'offseason' && latestChampion ? (
        <Card title="Чемпион">
          <div className="stack compact-stack">
            <strong>{latestChampion.championName}</strong>
            <p className="muted">
              {latestChampion.year}: {latestChampion.finalSummary}
            </p>
            <div className="stat-strip">
              <span>финалист {latestChampion.runnerUpName}</span>
              <span>финал {latestChampion.finalScore}</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Матч недели">
          {slate.gameOfTheWeek ? (
            <div className="stack compact-stack">
              <div className="eyebrow">
                неделя {slate.currentWeek + 1} / {formatStakeLabel(slate.gameOfTheWeek.stageLabel)}
              </div>
              <strong>
                {slate.gameOfTheWeek.awayTeamName} в гостях у {slate.gameOfTheWeek.homeTeamName}
              </strong>
              <div className="tag-row">
                {slate.gameOfTheWeek.shortLabel ? <span className="tag-chip">{formatStakeLabel(slate.gameOfTheWeek.shortLabel)}</span> : null}
                <span className="tag-chip subdued">{slate.gameOfTheWeek.reason}</span>
                <span className="tag-chip subdued">{slate.gameOfTheWeek.status === 'Final' ? 'сыграно' : 'впереди'}</span>
                <span className="tag-chip subdued">{slate.gameOfTheWeek.score || 'счёта нет'}</span>
              </div>
              {slate.gameOfTheWeek.summary ? <p className="muted">{slate.gameOfTheWeek.summary}</p> : null}
            </div>
          ) : (
            <p className="muted">Матч недели появится, когда будет доступна игровая неделя.</p>
          )}
        </Card>
      )}

      <Card title="Главные новости">
        {headlines.length === 0 ? (
          <p className="muted">Пока нет крупных новостей.</p>
        ) : (
          <div className="list">
            {headlines.map((headline) => (
              <div className="history-item" key={headline.id}>
                <div className="eyebrow">
                  {formatHeadlineType(headline.type)} / неделя {headline.week + 1}
                </div>
                <strong>{headline.title}</strong>
                <p>{headline.body}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Верх таблицы">
        {topStandings.length === 0 ? (
          <p className="muted">Таблица появится после старта сезона.</p>
        ) : (
          <div className="list">
            {topStandings.map((entry) => (
              <div className="list-row" key={entry.teamId}>
                <span>
                  #{entry.rank} {entry.teamName}
                </span>
                <strong>
                  {entry.wins}-{entry.losses} / разница {entry.pointDifferential}
                </strong>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Последние события">
        {recentSeasonEntries.length === 0 ? (
          <p className="muted">События появятся после сыгранных матчей.</p>
        ) : (
          <div className="list">
            {recentSeasonEntries.map((entry) => (
              <div className="history-item" key={entry.id}>
                <div className="eyebrow">
                  {entry.year} / неделя {entry.week + 1}
                </div>
                <strong>{entry.headline}</strong>
                <p>{entry.body}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
