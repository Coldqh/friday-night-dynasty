import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PaginationControls, getPagedItems } from '../components/PaginationControls';
import { ensureNFLLayer } from '../../core/nfl/nflLayer';
import { NFLWorld } from '../../core/nfl/nflTypes';
import { useGameStore } from '../store/useGameStore';

const PAGE_SIZE = 20;

export function DraftScreen() {
  const world = ensureNFLLayer(useGameStore((state) => state.world)!) as NFLWorld;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const runDraft = useGameStore((state) => state.runDraft);
  const [page, setPage] = useState(0);
  const draftHistory = [...(world.nflDraftHistory ?? [])].sort((left, right) => right.year - left.year || left.pick - right.pick);
  const draftClass = [...(world.graduatedCollegePlayers ?? [])]
    .filter((player) => !(world.nflDraftHistory ?? []).some((pick) => pick.sourceCollegePlayerId === player.id))
    .sort((left, right) => right.overall - left.overall || right.potential - left.potential || right.leadership - left.leadership)
    .slice(0, 224);

  if (activeLeague === 'nfl') {
    const { pageItems, currentPage, totalPages } = getPagedItems(draftHistory, page, PAGE_SIZE);

    return (
      <div className="stack">
        <Card title={`NFL Draft (${draftHistory.length})`}>
          <div className="button-row">
            <Button onClick={runDraft}>Провести драфт</Button>
          </div>
          <div className="stat-strip">
            <span>класс доступен {draftClass.length}</span>
            <span>пиков в истории {draftHistory.length}</span>
          </div>
        </Card>

        <Card title="Пики">
          {draftHistory.length === 0 ? (
            <p className="muted">Драфт ещё не проводился.</p>
          ) : (
            <>
              <div className="table compact-table">
                <div className="table-head grid-draft">
                  <span>год</span>
                  <span>пик</span>
                  <span>команда</span>
                  <span>игрок</span>
                  <span>поз</span>
                  <span>колледж</span>
                  <span>OVR</span>
                </div>
                {pageItems.map((pick) => (
                  <div className="table-row grid-draft" key={pick.id}>
                    <span>{pick.year}</span>
                    <span>R{pick.round} / #{pick.pick}</span>
                    <span>{pick.nflTeamName}</span>
                    <strong>{pick.playerName}</strong>
                    <span>{pick.position}</span>
                    <span>{pick.collegeTeamName ?? '—'}</span>
                    <strong>{pick.overall}</strong>
                  </div>
                ))}
              </div>
              <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </Card>
      </div>
    );
  }

  const { pageItems, currentPage, totalPages } = getPagedItems(draftClass, page, PAGE_SIZE);

  return (
    <div className="stack">
      <Card title={`Драфт-класс (${draftClass.length})`}>
        <div className="stat-strip">
          <span>лучшие выпускники колледжа</span>
          <span>ожидаемых пиков {Math.min(224, draftClass.length)}</span>
        </div>
      </Card>

      <Card title="Борд">
        {draftClass.length === 0 ? (
          <p className="muted">Нет доступных выпускников колледжа.</p>
        ) : (
          <>
            <div className="table compact-table">
              <div className="table-head grid-draft-board">
                <span>#</span>
                <span>игрок</span>
                <span>поз</span>
                <span>колледж</span>
                <span>OVR</span>
                <span>пот</span>
              </div>
              {pageItems.map((player, index) => (
                <div className="table-row grid-draft-board" key={player.id}>
                  <span>{currentPage * PAGE_SIZE + index + 1}</span>
                  <strong>{player.firstName} {player.lastName}</strong>
                  <span>{player.position}</span>
                  <span>{player.finalCollegeName ?? '—'}</span>
                  <strong>{player.overall}</strong>
                  <strong>{player.potential}</strong>
                </div>
              ))}
            </div>
            <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
