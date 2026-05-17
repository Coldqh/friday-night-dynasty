import { Card } from '../components/Card';
import { formatClassYear } from '../localization';
import { CollegePlayer, GameWorld, Player } from '../../core/world/worldTypes';
import { useGameStore } from '../store/useGameStore';

type FavoriteEntry =
  | { id: string; level: 'Школа'; player: Player; teamName: string }
  | { id: string; level: 'Выпускник'; player: Player; teamName: string }
  | { id: string; level: 'Колледж'; player: CollegePlayer; teamName: string };

function getFavoriteEntries(world: GameWorld, favoriteIds: string[]): FavoriteEntry[] {
  const entries: FavoriteEntry[] = [];

  favoriteIds.forEach((id) => {
    const schoolPlayer = world.players.find((player) => player.id === id);
    if (schoolPlayer) {
      entries.push({
        id,
        level: 'Школа',
        player: schoolPlayer,
        teamName: world.teams.find((team) => team.id === schoolPlayer.teamId)?.shortName ?? '—'
      });
      return;
    }

    const graduate = (world.graduatedPlayers ?? []).find((player) => player.id === id);
    if (graduate) {
      entries.push({
        id,
        level: 'Выпускник',
        player: graduate,
        teamName: world.teams.find((team) => team.id === graduate.teamId)?.shortName ?? '—'
      });
      return;
    }

    const collegePlayer = (world.collegePlayers ?? []).find((player) => player.id === id);
    if (collegePlayer) {
      entries.push({
        id,
        level: 'Колледж',
        player: collegePlayer,
        teamName: (world.collegeTeams ?? []).find((team) => team.id === collegePlayer.collegeTeamId)?.shortName ?? '—'
      });
    }
  });

  return entries;
}

function getName(player: Pick<Player, 'firstName' | 'lastName'> | Pick<CollegePlayer, 'firstName' | 'lastName'>) {
  return `${player.firstName} ${player.lastName}`;
}

export function FavoritesScreen() {
  const world = useGameStore((state) => state.world)!;
  const favoritePlayerIds = useGameStore((state) => state.favoritePlayerIds);
  const openPlayerProfile = useGameStore((state) => state.openPlayerProfile);
  const toggleFavoritePlayer = useGameStore((state) => state.toggleFavoritePlayer);
  const entries = getFavoriteEntries(world, favoritePlayerIds);

  return (
    <div className="stack">
      <Card title="Избранные">
        <div className="stat-strip">
          <span>игроков {entries.length}</span>
        </div>
      </Card>

      <Card title="Игроки">
        {entries.length === 0 ? (
          <p className="muted">Нет избранных игроков.</p>
        ) : (
          <div className="table compact-table">
            <div className="table-head grid-favorites">
              <span>игрок</span>
              <span>уровень</span>
              <span>команда</span>
              <span>поз</span>
              <span>класс</span>
              <span>общ</span>
              <span></span>
            </div>
            {entries.map((entry) => (
              <div className="table-row grid-favorites" key={entry.id}>
                <button className="table-row-button" onClick={() => openPlayerProfile(entry.id, 'favorites')}>
                  {getName(entry.player)}
                </button>
                <span>{entry.level}</span>
                <span>{entry.teamName}</span>
                <span>{entry.player.position}</span>
                <span>{formatClassYear(entry.player.classYear)}</span>
                <strong>{entry.player.overall}</strong>
                <button className="favorite-mini active" onClick={() => toggleFavoritePlayer(entry.id)}>
                  ★
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
