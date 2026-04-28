import { Card } from '../components/Card';
import { useGameStore } from '../store/useGameStore';

export function NewsScreen() {
  const world = useGameStore((state) => state.world)!;

  return (
    <Card title="Новости мира">
      <div className="list">
        {world.news.map((item) => (
          <article className="news-item" key={item.id}>
            <div className="eyebrow">{item.year} / Week {item.week + 1}</div>
            <h3>{item.headline}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </Card>
  );
}
