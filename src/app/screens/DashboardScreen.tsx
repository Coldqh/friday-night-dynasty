import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function DashboardScreen() {
  const world = useGameStore((state) => state.world)!;
  const simNextWeek = useGameStore((state) => state.simNextWeek);
  const simFullSeason = useGameStore((state) => state.simFullSeason);
  const advanceToNextSeason = useGameStore((state) => state.advanceToNextSeason);
  const leader = world.season.standings[0];
  const champion = world.teams.find((team) => team.id === world.season.championId);
  const latestChampion = world.history.champions[world.history.champions.length - 1] ?? null;
  const playoffField = world.season.playoffTeams
    .map((teamId) => world.teams.find((team) => team.id === teamId))
    .filter((team): team is NonNullable<typeof team> => team !== undefined);

  return (
    <div className="stack">
      <Card title="Living State">
        <div className="dashboard-grid">
          <div>
            <div className="eyebrow">Year</div>
            <p className="big-number">{world.season.year}</p>
          </div>
          <div>
            <div className="eyebrow">Week</div>
            <p className="big-number">
              {world.phase === 'regular'
                ? `${world.season.currentWeek + 1}`
                : world.phase === 'playoffs'
                  ? 'Playoffs'
                  : 'Complete'}
            </p>
          </div>
          <div>
            <div className="eyebrow">Teams</div>
            <p className="big-number">{world.teams.length}</p>
          </div>
        </div>

        <p className="muted">Season phase: {world.phase}</p>

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

      <Card title="State Leader">
        {leader ? (
          <div className="stack compact-stack">
            <div className="list-row">
              <span>{leader.teamName}</span>
              <strong>
                {leader.wins}-{leader.losses}
              </strong>
            </div>
            <div className="stat-strip">
              <span>PF {leader.pointsFor}</span>
              <span>PA {leader.pointsAgainst}</span>
              <span>Diff {leader.pointDifferential}</span>
              <span>OVR {leader.overallRating}</span>
            </div>
          </div>
        ) : (
          <p className="muted">Standings will appear after the world is created.</p>
        )}
      </Card>

      <Card title={champion ? 'Season Champion' : latestChampion ? 'Latest Champion' : 'Playoff Race'}>
        {champion ? (
          <div className="stack compact-stack">
            <strong>{champion.name}</strong>
            <p className="muted">
              {champion.shortName} finished the season on top and is now recorded in world history.
            </p>
          </div>
        ) : latestChampion ? (
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
        ) : playoffField.length > 0 ? (
          <div className="list">
            {playoffField.map((team, index) => (
              <div className="list-row" key={team.id}>
                <span>
                  #{index + 1} {team.shortName}
                </span>
                <strong>
                  {team.wins}-{team.losses}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">The top four teams will appear here once the regular season is complete.</p>
        )}
      </Card>

      <Card title="Recent season events">
        {world.season.seasonLog.length === 0 ? (
          <p className="muted">The season log will refill once the new season begins.</p>
        ) : (
          <div className="list">
            {world.season.seasonLog.slice(0, 5).map((entry) => (
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

      <Card title="Latest Headlines">
        <div className="list">
          {world.news.slice(0, 3).map((item) => (
            <div className="news-item" key={item.id}>
              <strong>{item.headline}</strong>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
