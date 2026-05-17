import { Card } from '../components/Card';
import { getLeagueHistorySnapshot } from '../../core/history/getLeagueHistorySnapshot';
import { getRecentCommitments } from '../../core/recruiting/getRecruitingProfile';
import { useGameStore } from '../store/useGameStore';

export const historySections = ['История лиги', 'Чемпионы штата'] as const;

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;
  const history = getLeagueHistorySnapshot(world);
  const commitments = getRecentCommitments(world, 12);
  const collegeChampions = world.history.collegeChampions ?? [];

  return (
    <div className="stack">
      <Card title="История лиги">
        <div className="stat-strip">
          <span>сезонов уровня I {history.totalSeasonsCompleted}</span>
          <span>последний чемпион {history.latestChampion?.championName ?? 'нет'}</span>
          <span>программ {world.colleges?.length ?? 0}</span>
          <span>сезонов программ {collegeChampions.length}</span>
          <span>коммитов {world.commitments?.length ?? 0}</span>
        </div>
      </Card>

      <Card title="Чемпионы штата">
        {history.champions.length === 0 ? (
          <p className="muted">Нет чемпионов.</p>
        ) : (
          <div className="list">
            {history.champions.map((entry) => (
              <div className="history-item" key={`champion-${entry.year}`}>
                <div className="eyebrow">{entry.year}</div>
                <h3>{entry.championName}</h3>
                <p>финалист: {entry.runnerUpName}</p>
                <p>счёт: {entry.finalScore}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Чемпионы программ">
        {collegeChampions.length === 0 ? (
          <p className="muted">Нет чемпионов.</p>
        ) : (
          <div className="list">
            {collegeChampions.map((entry) => (
              <div className="history-item" key={`college-champion-${entry.year}`}>
                <div className="eyebrow">{entry.year}</div>
                <h3>{entry.championName}</h3>
                <p>финалист: {entry.runnerUpName ?? '—'}</p>
                <p>счёт: {entry.finalScore}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Коммиты">
        {commitments.length === 0 ? (
          <p className="muted">Нет.</p>
        ) : (
          <div className="table compact-table">
            <div className="table-head grid-commitments">
              <span>год</span>
              <span>игрок</span>
              <span>поз</span>
              <span>уровень I</span>
              <span>уровень II</span>
              <span>рейт</span>
            </div>
            {commitments.map((commitment) => (
              <div className="table-row grid-commitments" key={commitment.id}>
                <span>{commitment.year}</span>
                <span>{commitment.playerName}</span>
                <span>{commitment.position}</span>
                <span>{commitment.fromTeamName}</span>
                <span>{commitment.collegeName}</span>
                <strong>{commitment.stars}★ / {commitment.prospectScore}</strong>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
