import { Card } from '../components/Card';
import { formatClassYear } from '../localization';
import { CollegeGraduate, CollegePlayer, GameWorld, Player } from '../../core/world/worldTypes';
import { useGameStore } from '../store/useGameStore';

type FavoriteEntry =
  | { id: string; openId: string; level: 'Школа'; player: Player; teamName: string }
  | { id: string; openId: string; level: 'Выпускник школы'; player: Player; teamName: string }
  | { id: string; openId: string; level: 'Колледж'; player: CollegePlayer; teamName: string }
  | { id: string; openId: string; level: 'Выпускник колледжа'; player: CollegeGraduate; teamName: string };

function getConvertedCollegeTarget(world: GameWorld, sourcePlayerId: string) {
  const commitment = (world.commitments ?? []).find((entry) => entry.playerId === sourcePlayerId && entry.convertedToCollegePlayerId);

  if (commitment?.convertedToCollegePlayerId) {
    const current = (world.collegePlayers ?? []).find((player) => player.id === commitment.convertedToCollegePlayerId);
    if (current) {
      return { kind: 'college' as const, player: current };
    }

    const graduate = (world.graduatedCollegePlayers ?? []).find((player) => player.id === commitment.convertedToCollegePlayerId);
    if (graduate) {
      return { kind: 'collegeGraduate' as const, player: graduate };
    }
  }

  const current = (world.collegePlayers ?? []).find((player) => player.sourcePlayerId === sourcePlayerId);
  if (current) {
    return { kind: 'college' as const, player: current };
  }

  const graduate = (world.graduatedCollegePlayers ?? []).find((player) => player.sourcePlayerId === sourcePlayerId);
  if (graduate) {
    return { kind: 'collegeGraduate' as const, player: graduate };
  }

  return null;
}

function getCollegeTeamName(world: GameWorld, teamId: string) {
  return (world.collegeTeams ?? []).find((team) => team.id === teamId)?.shortName ?? '—';
}

function getFavoriteEntries(world: GameWorld, favoriteIds: string[]): FavoriteEntry[] {
  const entries: FavoriteEntry[] = [];

  favoriteIds.forEach((id) => {
    const directCollege = (world.collegePlayers ?? []).find((player) => player.id === id);
    if (directCollege) {
      entries.push({
        id,
        openId: directCollege.id,
        level: 'Колледж',
        player: directCollege,
        teamName: getCollegeTeamName(world, directCollege.collegeTeamId)
      });
      return;
    }

    const directCollegeGraduate = (world.graduatedCollegePlayers ?? []).find((player) => player.id === id);
    if (directCollegeGraduate) {
      entries.push({
        id,
        openId: directCollegeGraduate.id,
        level: 'Выпускник колледжа',
        player: directCollegeGraduate,
        teamName: directCollegeGraduate.finalCollegeName || getCollegeTeamName(world, directCollegeGraduate.collegeTeamId)
      });
      return;
    }

    const converted = getConvertedCollegeTarget(world, id);
    if (converted?.kind === 'college') {
      entries.push({
        id,
        openId: converted.player.id,
        level: 'Колледж',
        player: converted.player,
        teamName: getCollegeTeamName(world, converted.player.collegeTeamId)
      });
      return;
    }

    if (converted?.kind === 'collegeGraduate') {
      entries.push({
        id,
        openId: converted.player.id,
        level: 'Выпускник колледжа',
        player: converted.player,
        teamName: converted.player.finalCollegeName || getCollegeTeamName(world, converted.player.collegeTeamId)
      });
      return;
    }

    const schoolPlayer = world.players.find((player) => player.id === id);
    if (schoolPlayer) {
      entries.push({
        id,
        openId: schoolPlayer.id,
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
        openId: graduate.id,
        level: 'Выпускник школы',
        player: graduate,
        teamName: world.teams.find((team) => team.id === graduate.teamId)?.shortName ?? '—'
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
              <span>роль</span>
              <span>команда</span>
              <span>поз</span>
              <span>курс</span>
              <span>общ</span>
              <span></span>
            </div>
            {entries.map((entry) => (
              <div className="table-row grid-favorites" key={entry.id}>
                <button className="table-row-button" onClick={() => openPlayerProfile(entry.openId, 'favorites')}>
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
