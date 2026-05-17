import { Card } from '../components/Card';
import { formatClassYear } from '../localization';
import { getProspectPool } from '../../core/prospects/getProspectPool';
import { useGameStore } from '../store/useGameStore';

export function ProspectPoolScreen() {
  const world = useGameStore((state) => state.world)!;
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const prospects = getProspectPool(world);

  return (
    <div className="stack">
      <Card title="Пул выпускников">
        <div className="stat-strip">
          <span>выпускников {prospects.length}</span>
          <span>активных игроков {world.players.length}</span>
          <span>людей в базе {world.people?.length ?? 0}</span>
        </div>
        <p className="muted">
          Здесь собираются школьные выпускники. Следующий крупный шаг после этого экрана — рекрутинг и переход лучших игроков в колледжи.
        </p>
      </Card>

      <Card title="Рейтинг выпускников">
        {prospects.length === 0 ? (
          <p className="muted">
            Список пуст. Заверши сезон, нажми переход через межсезонье, и senior-игроки попадут сюда.
          </p>
        ) : (
          <div className="table compact-table">
            <div className="table-head grid-prospects">
              <span>игрок</span>
              <span>поз</span>
              <span>общ</span>
              <span>пот</span>
              <span>рейт</span>
              <span>прогноз</span>
            </div>
            {prospects.map((prospect) => {
              const player = world.graduatedPlayers?.find((entry) => entry.id === prospect.playerId);

              return (
                <div className="table-row grid-prospects" key={prospect.playerId}>
                  <button className="table-row-button" onClick={() => openPlayerProfile(prospect.playerId, 'prospects')}>
                    {prospect.playerName}
                    <span className="muted">
                      {' '}
                      / {prospect.teamName} / {player ? formatClassYear(player.classYear) : 'выпускник'}
                    </span>
                  </button>
                  <span>{prospect.position}</span>
                  <strong>{prospect.overall}</strong>
                  <strong>{prospect.potential}</strong>
                  <strong>{prospect.score}</strong>
                  <span>{prospect.projection}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {prospects.length > 0 ? (
        <Card title="Команды выпускников">
          <div className="list">
            {prospects.slice(0, 6).map((prospect) => (
              <div className="list-row" key={`${prospect.playerId}-team`}>
                <div>
                  <strong>{prospect.teamName}</strong>
                  <p className="muted">
                    {prospect.playerName} / {prospect.schoolName} / {prospect.hometownName}
                  </p>
                </div>
                <button className="filter-chip" onClick={() => openTeamProfile(prospect.teamId, 'history', 'prospects')}>
                  Команда
                </button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
