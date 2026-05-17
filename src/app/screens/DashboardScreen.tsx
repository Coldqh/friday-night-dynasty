import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { GAME_VERSION_LABEL } from '../version';
import { getSeasonAwardWatch } from '../../core/awards/getSeasonAwardWatch';
import { generateWeeklyHeadlines } from '../../core/news/generateWeeklyHeadlines';
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
    return 'Season Complete';
  }

  if (phase === 'playoffs') {
    return 'Playoffs';
  }

  if (currentWeek === 0 && completedGames === 0) {
    return 'Preseason';
  }

  return 'Regular Season';
}

export function getDashboardStatusPills(seasonStatus: string, teamCount: number) {
  return [seasonStatus, `${teamCount} Teams`];
}

export function DashboardScreen() {
  const world = useGameStore((state) => state.world)!;
  const simNextWeek = useGameStore((state) => state.simNextWeek);
  const simFullSeason = useGameStore((state) => state.simFullSeason);
  const advanceToNextSeason = useGameStore((state) => state.advanceToNextSeason);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const slate = getWeeklySlate(world);
  const headlines = generateWeeklyHeadlines(world).slice(0, 5);
  const awards = getSeasonAwardWatch(world).slice(0, 4);
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
      <Card title="Season State">
        <div className="dashboard-grid">
          <div>
            <div className="eyebrow">Year</div>
            <p className="big-number">{world.season.year}</p>
          </div>
          <div>
            <div className="eyebrow">Current Week</div>
            <p className="big-number">{world.phase === 'offseason' ? 'Done' : world.season.currentWeek + 1}</p>
          </div>
          <div>
            <div className="eyebrow">Regular Season</div>
            <p className="big-number">{world.season.regularSeasonWeeks}</p>
          </div>
        </div>

        <div className="stat-strip">
          {getDashboardStatusPills(seasonStatus, world.teams.length).map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span>{GAME_VERSION_LABEL}</span>
        </div>

        <div className="button-row">
          <Button disabled={world.phase === 'offseason'} onClick={simNextWeek}>
            Sim Week
          </Button>
          <Button disabled={world.phase === 'offseason'} variant="ghost" onClick={simFullSeason}>
            Sim Season
          </Button>
        </div>

        {world.phase === 'offseason' && world.season.championId && (
          <div className="button-row">
            <Button onClick={advanceToNextSeason}>Advance Offseason</Button>
          </div>
        )}
      </Card>

      <Card title="Living World Pulse">
        <div className="dashboard-grid">
          <div>
            <div className="eyebrow">Tracked People</div>
            <p className="big-number">{peopleCount}</p>
          </div>
          <div>
            <div className="eyebrow">Active Players</div>
            <p className="big-number">{activePlayerCount}</p>
          </div>
          <div>
            <div className="eyebrow">Graduates</div>
            <p className="big-number">{graduatedCount}</p>
          </div>
        </div>
        <p className="muted">
          {GAME_VERSION_LABEL}: player profiles, career timelines, award watch and stricter rivalry scheduling.
        </p>
      </Card>

      <Card title="Award Watch">
        {awards.length === 0 ? (
          <p className="muted">Award watch will appear once the state has active players.</p>
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
                  Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {world.phase === 'offseason' && latestChampion ? (
        <Card title="Champion">
          <div className="stack compact-stack">
            <strong>{latestChampion.championName}</strong>
            <p className="muted">
              {latestChampion.year}: {latestChampion.finalSummary}
            </p>
            <div className="stat-strip">
              <span>Runner-up {latestChampion.runnerUpName}</span>
              <span>Final {latestChampion.finalScore}</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Game of the Week">
          {slate.gameOfTheWeek ? (
            <div className="stack compact-stack">
              <div className="eyebrow">
                Week {slate.currentWeek + 1} / {slate.gameOfTheWeek.stageLabel}
              </div>
              <strong>
                {slate.gameOfTheWeek.awayTeamName} at {slate.gameOfTheWeek.homeTeamName}
              </strong>
              <div className="tag-row">
                {slate.gameOfTheWeek.shortLabel ? <span className="tag-chip">{slate.gameOfTheWeek.shortLabel}</span> : null}
                <span className="tag-chip subdued">{slate.gameOfTheWeek.reason}</span>
                <span className="tag-chip subdued">{slate.gameOfTheWeek.status}</span>
                <span className="tag-chip subdued">{slate.gameOfTheWeek.score}</span>
              </div>
              {slate.gameOfTheWeek.summary ? <p className="muted">{slate.gameOfTheWeek.summary}</p> : null}
            </div>
          ) : (
            <p className="muted">This week's headliner will appear once a slate is available.</p>
          )}
        </Card>
      )}

      <Card title="Latest Headlines">
        {headlines.length === 0 ? (
          <p className="muted">No major headlines yet. Sim a week to bring the state to life.</p>
        ) : (
          <div className="list">
            {headlines.map((headline) => (
              <div className="history-item" key={headline.id}>
                <div className="eyebrow">
                  {headline.type.toUpperCase()} / Week {headline.week + 1}
                </div>
                <strong>{headline.title}</strong>
                <p>{headline.body}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Standings Snapshot">
        {topStandings.length === 0 ? (
          <p className="muted">Standings will appear once the season starts moving.</p>
        ) : (
          <div className="list">
            {topStandings.map((entry) => (
              <div className="list-row" key={entry.teamId}>
                <span>
                  #{entry.rank} {entry.teamName}
                </span>
                <strong>
                  {entry.wins}-{entry.losses} / Diff {entry.pointDifferential}
                </strong>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Recent Events">
        {recentSeasonEntries.length === 0 ? (
          <p className="muted">Recent events will populate once games and story beats hit the calendar.</p>
        ) : (
          <div className="list">
            {recentSeasonEntries.map((entry) => (
              <div className="history-item" key={entry.id}>
                <div className="eyebrow">
                  {entry.year} / Week {entry.week + 1}
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
