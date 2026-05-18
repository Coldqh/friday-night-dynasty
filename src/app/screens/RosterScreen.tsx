import { useState } from 'react';
import { Button } from '../components/Button';
import { CollegeLogo } from '../components/CollegeLogo';
import { NFLLogo } from '../components/NFLLogo';
import { SchoolLogo } from '../components/SchoolLogo';
import { Card } from '../components/Card';
import { PaginationControls, getPagedItems } from '../components/PaginationControls';
import { getCollegeRosterStrength } from '../../core/colleges/collegeRatings';
import { ensureNFLLayer, getNFLTeamOverall } from '../../core/nfl/nflLayer';
import { NFLWorld } from '../../core/nfl/nflTypes';
import { useGameStore } from '../store/useGameStore';

const PAGE_SIZE = 24;

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const selectTeam = useGameStore((state) => state.selectTeam);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const selectCollegeTeam = useGameStore((state) => state.selectCollegeTeam);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);
  const selectNFLTeam = useGameStore((state) => state.selectNFLTeam);
  const openNFLTeamProfile = useGameStore((state) => state.openNFLTeamProfile);
  const [page, setPage] = useState(0);

  if (activeLeague === 'nfl') {
    const nflWorld = ensureNFLLayer(world) as typeof world & NFLWorld;
    const rows = [...(nflWorld.nflTeams ?? [])]
      .map((team) => ({
        ...team,
        rosterCount: (nflWorld.nflPlayers ?? []).filter((player) => player.teamId === team.id).length,
        overall: getNFLTeamOverall(nflWorld, team.id)
      }))
      .sort((left, right) => right.overall - left.overall || left.shortName.localeCompare(right.shortName));
    const { pageItems, currentPage, totalPages } = getPagedItems(rows, page, PAGE_SIZE);

    return (
      <Card title={`Команды (${rows.length})`}>
        <div className="thin-list">
          {pageItems.map((team) => (
            <div className="thin-team-row" key={team.id}>
              <button className="thin-team-main" onClick={() => selectNFLTeam(team.id)}>
                <NFLLogo logoAsset={team.logoAsset} name={team.shortName} className="team-logo list-big" placeholderClassName="team-logo-placeholder list-big" />
                <span className="thin-team-name">{team.shortName}</span>
                <span>{team.division}</span>
                <strong className="ovr-value">OVR {team.overall}</strong>
                <span>{team.wins}-{team.losses}</span>
                <span>игроков {team.rosterCount}</span>
              </button>

              <Button variant="ghost" onClick={() => openNFLTeamProfile(team.id, 'overview', 'roster')}>
                Профиль
              </Button>
            </div>
          ))}
        </div>

        <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    );
  }

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
          {pageItems.map((team) => (
            <div className="thin-team-row" key={team.id}>
              <button className="thin-team-main" onClick={() => selectCollegeTeam(team.id)}>
                <CollegeLogo logoAsset={team.logoAsset} name={team.shortName} className="team-logo list-big" placeholderClassName="team-logo-placeholder list-big" />
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
          ))}
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
              <SchoolLogo schoolName={team.schoolName} mascot={team.mascot} name={team.shortName} className="school-logo list" placeholderClassName="team-logo-placeholder list" />
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
