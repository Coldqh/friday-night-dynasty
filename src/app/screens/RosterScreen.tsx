import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PaginationControls, getPagedItems } from '../components/PaginationControls';
import { getCollegeRosterStrength } from '../../core/colleges/collegeRatings';
import { useGameStore } from '../store/useGameStore';

const PAGE_SIZE = 24;

function getLogoSrc(path: string) {
  return path.startsWith('/') ? path.slice(1) : path;
}

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const selectTeam = useGameStore((state) => state.selectTeam);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const selectCollegeTeam = useGameStore((state) => state.selectCollegeTeam);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);
  const [page, setPage] = useState(0);

  if (activeLeague === 'college') {
    const rows = [...(world.collegeTeams ?? [])]
      .map((team) => ({
        ...team,
        rosterCount: (world.collegePlayers ?? []).filter((player) => player.collegeTeamId === team.id).length,
        overall: getCollegeRosterStrength(team, world.collegePlayers ?? [])
      }))
      .sort((left, right) => right.overall - left.overall || left.shortName.localeCompare(right.shortName));
    const { pageItems, currentPage, totalPages } = getPagedItems(rows, page, PAGE_SIZE);

    return (
      <Card title={`Команды (${rows.length})`}>
        <div className="thin-list">
          {pageItems.map((team) => {
            const logo = team.logoAsset ? getLogoSrc(team.logoAsset) : null;

            return (
              <div className="thin-team-row" key={team.id}>
                <button className="thin-team-main" onClick={() => selectCollegeTeam(team.id)}>
                  {logo ? <img className="team-logo tiny" src={logo} alt="" /> : <span className="team-logo-placeholder tiny">{team.shortName.slice(0, 2)}</span>}
                  <span className="thin-team-name">{team.shortName}</span>
                  <span>{team.conference ?? 'Independent'}</span>
                  <strong className="ovr-value">OVR {team.overall}</strong>
                  <span>{team.wins}-{team.losses}</span>
                  <span>игроков {team.rosterCount}</span>
                </button>

                <Button variant="ghost" onClick={() => openCollegeTeamProfile(team.id, 'overview', 'roster')}>
                  Профиль
                </Button>
              </div>
            );
          })}
        </div>

        <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    );
  }

  const rows = [...world.teams].sort((left, right) => right.overallRating - left.overallRating || left.shortName.localeCompare(right.shortName));
  const { pageItems, currentPage, totalPages } = getPagedItems(rows, page, PAGE_SIZE);

  return (
    <Card title={`Команды (${rows.length})`}>
      <div className="thin-list">
        {pageItems.map((team) => (
          <div className="thin-team-row" key={team.id}>
            <button className="thin-team-main" onClick={() => selectTeam(team.id)}>
              <span className="team-logo-placeholder tiny">{team.mascot.slice(0, 2)}</span>
              <span className="thin-team-name">{team.shortName}</span>
              <span>{team.cityName}</span>
              <strong className="ovr-value">OVR {team.overallRating}</strong>
              <span>{team.wins}-{team.losses}</span>
              <span>{team.offenseRating}/{team.defenseRating}</span>
            </button>

            <Button variant="ghost" onClick={() => openTeamProfile(team.id, 'overview', 'roster')}>
              Профиль
            </Button>
          </div>
        ))}
      </div>

      <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  );
}
