import { Card } from '../components/Card';
import { generateWeeklyHeadlines } from '../../core/news/generateWeeklyHeadlines';
import { getWeeklySlate } from '../../core/schedule/getWeeklySlate';
import { getWeekStakes } from '../../core/stakes/getWeekStakes';
import { useGameStore } from '../store/useGameStore';

export function NewsScreen() {
  const world = useGameStore((state) => state.world)!;
  const headlines = generateWeeklyHeadlines(world);
  const slate = getWeeklySlate(world);
  const weekStakes = getWeekStakes(world);
  const recentLogEntries = world.season.seasonLog.slice(0, 8);

  return (
    <div className="stack">
      <Card title="State News">
        <div className="stat-strip">
          <span>Year {world.season.year}</span>
          <span>Week {world.phase === 'offseason' ? 'Season Complete' : world.season.currentWeek + 1}</span>
          <span>{world.phase === 'regular' ? 'Friday Night Slate' : world.phase === 'playoffs' ? 'Playoff Push' : 'Offseason Reset'}</span>
        </div>
        <p className="muted">{weekStakes.summary}</p>
      </Card>

      <Card title="Game of the Week">
        {slate.gameOfTheWeek ? (
          <article className="news-item">
            <div className="eyebrow">
              Week {slate.gameOfTheWeek.week + 1} / {slate.gameOfTheWeek.stageLabel}
            </div>
            <h3>
              {slate.gameOfTheWeek.awayTeamName} at {slate.gameOfTheWeek.homeTeamName}
            </h3>
            <div className="tag-row">
              {slate.gameOfTheWeek.shortLabel ? <span className="tag-chip">{slate.gameOfTheWeek.shortLabel}</span> : null}
              <span className="tag-chip subdued">{slate.gameOfTheWeek.reason}</span>
            </div>
            <p>
              {slate.gameOfTheWeek.status} / {slate.gameOfTheWeek.score}
            </p>
            {slate.gameOfTheWeek.summary ? <p>{slate.gameOfTheWeek.summary}</p> : null}
          </article>
        ) : (
          <p className="muted">No spotlight matchup is locked in yet.</p>
        )}
      </Card>

      <Card title="Latest Headlines">
        {headlines.length === 0 ? (
          <p className="muted">No major headlines yet. Sim a week to generate state news.</p>
        ) : (
          <div className="list">
            {headlines.map((headline) => (
              <article className="news-item" key={headline.id}>
                <div className="eyebrow">
                  {headline.type.toUpperCase()} / {headline.year} / Week {headline.week + 1}
                </div>
                <h3>{headline.title}</h3>
                <p>{headline.body}</p>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Card title="Season Journal">
        {recentLogEntries.length === 0 ? (
          <p className="muted">No season events have been recorded yet.</p>
        ) : (
          <div className="list">
            {recentLogEntries.map((item) => (
              <article className="news-item" key={item.id}>
                <div className="eyebrow">
                  {item.year} / Week {item.week + 1}
                </div>
                <h3>{item.headline}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
