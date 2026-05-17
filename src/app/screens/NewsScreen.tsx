import { Card } from '../components/Card';
import { formatHeadlineType } from '../localization';
import { generateWeeklyHeadlines } from '../../core/news/generateWeeklyHeadlines';
import { getWeekStakes } from '../../core/stakes/getWeekStakes';
import { useGameStore } from '../store/useGameStore';

export const newsSections = ['Новости штата', 'Главные заголовки'] as const;

export function NewsScreen() {
  const world = useGameStore((state) => state.world)!;
  const headlines = generateWeeklyHeadlines(world);
  const weekStakes = getWeekStakes(world);

  return (
    <div className="stack">
      <Card title="Новости штата">
        <div className="stat-strip">
          <span>год {world.season.year}</span>
          <span>неделя {world.phase === 'offseason' ? 'сезон завершён' : world.season.currentWeek + 1}</span>
          <span>{world.phase === 'regular' ? 'пятничный тур' : world.phase === 'playoffs' ? 'плей-офф' : 'межсезонье'}</span>
        </div>
        <p className="muted">{weekStakes.summary}</p>
      </Card>

      <Card title="Главные заголовки">
        {headlines.length === 0 ? (
          <p className="muted">Крупных новостей пока нет.</p>
        ) : (
          <div className="list">
            {headlines.map((headline) => (
              <article className="news-item" key={headline.id}>
                <div className="eyebrow">
                  {formatHeadlineType(headline.type)} / {headline.year} / неделя {headline.week + 1}
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
