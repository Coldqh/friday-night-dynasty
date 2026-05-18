import { useState } from 'react';
import { Card } from '../components/Card';
import { PaginationControls, getPagedItems } from '../components/PaginationControls';
import { getLeagueHistorySnapshot } from '../../core/history/getLeagueHistorySnapshot';
import { getRecentCommitments } from '../../core/recruiting/getRecruitingProfile';
import { useGameStore } from '../store/useGameStore';

export const historySections = ['Чемпионы штата', 'Чемпионы программ', 'Коммиты'] as const;

const COMMITMENTS_PAGE_SIZE = 12;

export function HistoryScreen() {
  const world = useGameStore((state) => state.world)!;
  const history = getLeagueHistorySnapshot(world);
  const commitments = getRecentCommitments(world, 500);
  const collegeChampions = world.history.collegeChampions ?? [];
  const [commitmentPage, setCommitmentPage] = useState(0);
  const { pageItems, currentPage, totalPages } = getPagedItems(commitments, commitmentPage, COMMITMENTS_PAGE_SIZE);

  return (
    <div className="stack">
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

      <Card title={`Коммиты (${commitments.length})`}>
        {commitments.length === 0 ? (
          <p className="muted">Нет.</p>
        ) : (
          <>
            <div className="table compact-table">
              <div className="table-head grid-commitments">
                <span>год</span>
                <span>игрок</span>
                <span>поз</span>
                <span>школа</span>
                <span>колледж</span>
                <span>рейт</span>
              </div>
              {pageItems.map((commitment) => (
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
            <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setCommitmentPage} />
          </>
        )}
      </Card>
    </div>
  );
}
