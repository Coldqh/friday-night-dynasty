import { Card } from '../components/Card';
import { formatClassYear } from '../localization';
import { getSeniorProspects } from '../../core/prospects/getSeniorProspects';
import { useGameStore } from '../store/useGameStore';

function renderStars(stars: number) {
  return '★'.repeat(stars);
}

export function ProspectsScreen() {
  const world = useGameStore((state) => state.world)!;
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const prospects = getSeniorProspects(world);
  const fiveStars = prospects.filter((entry) => entry.stars >= 5).length;
  const fourStars = prospects.filter((entry) => entry.stars === 4).length;
  const committed = prospects.filter((entry) => entry.status === 'коммит').length;

  return (
    <div className="stack">
      <Card title="Проспекты">
        <div className="stat-strip">
          <span>SR {prospects.length}</span>
          <span>5★ {fiveStars}</span>
          <span>4★ {fourStars}</span>
          <span>коммитов {committed}</span>
        </div>
      </Card>

      <Card title="Список">
        {prospects.length === 0 ? (
          <p className="muted">Нет игроков SR.</p>
        ) : (
          <div className="table compact-table">
            <div className="table-head grid-prospects">
              <span>игрок</span>
              <span>команда</span>
              <span>поз</span>
              <span>курс</span>
              <span>звёзды</span>
              <span>общ</span>
              <span>пот</span>
              <span>рейт</span>
            </div>

            {prospects.map((entry) => (
              <button
                className="table-row grid-prospects table-row-button"
                key={entry.playerId}
                onClick={() => openPlayerProfile(entry.playerId, 'prospects')}
              >
                <span>{entry.playerName}</span>
                <span>{entry.teamName}</span>
                <span>{entry.position}</span>
                <span>{formatClassYear(entry.classYear)}</span>
                <strong>{renderStars(entry.stars)}</strong>
                <span>{entry.overall}</span>
                <span>{entry.potential}</span>
                <strong>{entry.score}</strong>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
