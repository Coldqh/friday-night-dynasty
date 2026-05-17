import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatClassYear } from '../localization';
import { GAME_VERSION_LABEL, GAME_VERSION_NAME } from '../version';
import { getCollegeStandings } from '../../core/colleges/getCollegeDisplayData';
import { getSeasonAwardWatch } from '../../core/awards/getSeasonAwardWatch';
import { getRecentCommitments } from '../../core/recruiting/getRecruitingProfile';
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
  if (phase === 'offseason') return 'сезон завершён';
  if (phase === 'playoffs') return 'плей-офф';
  if (currentWeek === 0 && completedGames === 0) return 'предсезонье';
  return 'регулярный сезон';
}

export function getDashboardStatusPills(seasonStatus: string, teamCount: number) {
  return [seasonStatus, `${teamCount} команд`];
}

export function DashboardScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const simNextWeek = useGameStore((state) => state.simNextWeek);
  const simFullSeason = useGameStore((state) => state.simFullSeason);
  const advanceToNextSeason = useGameStore((state) => state.advanceToNextSeason);
  const advanceCollegeToNextSeason = useGameStore((state) => state.advanceCollegeToNextSeason);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const slate = getWeeklySlate(world);
  const awards = getSeasonAwardWatch(world).slice(0, 4);
  const commitments = getRecentCommitments(world, 5);
  const latestChampion = world.history.champions[world.history.champions.length - 1] ?? null;
  const topStandings = world.season.standings.slice(0, 5);
  const collegeStandings = getCollegeStandings(world).slice(0, 5);
  const seasonStatus = getSeasonStatusLabel({
    phase: world.phase,
    currentWeek: world.season.currentWeek,
    completedGames: world.season.completedGames.length
  });
  const peopleCount = world.people?.length ?? 0;
  const graduatedCount = world.graduatedPlayers?.length ?? 0;
  const activePlayerCount = world.players.length;
  const collegeCount = world.colleges?.length ?? 0;
  const collegePlayerCount = world.collegePlayers?.length ?? 0;
  const recruitingProfileCount = world.recruitingProfiles?.length ?? 0;
  const commitmentCount = world.commitments?.length ?? 0;
  const collegeSeason = world.collegeSeason;
  const collegeChampion = collegeSeason?.championTeamId
    ? (world.collegeTeams ?? []).find((team) => team.id === collegeSeason.championTeamId)
    : null;

  if (activeLeague === 'college') {
    return (
      <div className="stack">
        <Card title="Состояние колледжей">
          <div className="dashboard-grid">
            <div>
              <div className="eyebrow">год</div>
              <p className="big-number">{collegeSeason?.year ?? world.season.year}</p>
            </div>
            <div>
              <div className="eyebrow">неделя</div>
              <p className="big-number">{collegeSeason?.championTeamId ? 'готово' : (collegeSeason?.currentWeek ?? 0) + 1}</p>
            </div>
            <div>
              <div className="eyebrow">регулярка</div>
              <p className="big-number">{collegeSeason?.regularSeasonWeeks ?? 0}</p>
            </div>
          </div>
          <div className="stat-strip">
            <span>{GAME_VERSION_LABEL}</span>
            <span>{GAME_VERSION_NAME}</span>
            <span>колледжей {collegeCount}</span>
            <span>игроков колледжа {collegePlayerCount}</span>
          </div>
          {collegeSeason?.championTeamId ? (
            <div className="button-row">
              <Button onClick={advanceCollegeToNextSeason}>Новый сезон колледжей</Button>
            </div>
          ) : (
            <div className="button-row">
              <Button onClick={simNextWeek}>Симулировать неделю</Button>
              <Button variant="ghost" onClick={simFullSeason}>
                Симулировать сезон
              </Button>
            </div>
          )}
        </Card>

        <Card title="База колледжей">
          <div className="dashboard-grid">
            <div>
              <div className="eyebrow">колледжей</div>
              <p className="big-number">{collegeCount}</p>
            </div>
            <div>
              <div className="eyebrow">игроков</div>
              <p className="big-number">{collegePlayerCount}</p>
            </div>
            <div>
              <div className="eyebrow">коммитов</div>
              <p className="big-number">{commitmentCount}</p>
            </div>
          </div>
        </Card>

        <Card title="Чемпион колледжей">
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
                    {entry.wins}-{entry.losses} / сила {entry.rosterStrength}
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

      <Card title="База мира">
        <div className="dashboard-grid">
          <div>
            <div className="eyebrow">людей</div>
            <p className="big-number">{peopleCount}</p>
          </div>
          <div>
            <div className="eyebrow">игроков школы</div>
            <p className="big-number">{activePlayerCount}</p>
          </div>
          <div>
            <div className="eyebrow">выпускников</div>
            <p className="big-number">{graduatedCount}</p>
          </div>
          <div>
            <div className="eyebrow">колледжей</div>
            <p className="big-number">{collegeCount}</p>
          </div>
          <div>
            <div className="eyebrow">профилей</div>
            <p className="big-number">{recruitingProfileCount}</p>
          </div>
          <div>
            <div className="eyebrow">коммитов</div>
            <p className="big-number">{commitmentCount}</p>
          </div>
        </div>
      </Card>

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
