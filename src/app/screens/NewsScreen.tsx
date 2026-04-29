import { Card } from '../components/Card';
import { generateWeeklyHeadlines } from '../../core/news/generateWeeklyHeadlines';
import { getWeekStakes } from '../../core/stakes/getWeekStakes';
import { useGameStore } from '../store/useGameStore';

export const newsSections = ['State News', 'Latest Headlines'] as const;

export function NewsScreen() {
  const world = useGameStore((state) => state.world)!;
  const headlines = generateWeeklyHeadlines(world);
  const weekStakes = getWeekStakes(world);

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
    </div>
  );
}
