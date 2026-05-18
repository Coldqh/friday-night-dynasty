import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getCollegeStandings } from '../../core/colleges/getCollegeDisplayData';
import { ensureNFLLayer, getNFLStandings } from '../../core/nfl/nflLayer';
import { useGameStore } from '../store/useGameStore';

function groupByDivision<T extends { division: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    groups[item.division] = [...(groups[item.division] ?? []), item];
    return groups;
  }, {});
}

function groupByConference<T extends { conference: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    groups[item.conference] = [...(groups[item.conference] ?? []), item];
    return groups;
  }, {});
}

export function RankingsScreen() {
  const world = useGameStore((state) => state.world)!;
  const activeLeague = useGameStore((state) => state.activeLeague);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const openCollegeTeamProfile = useGameStore((state) => state.openCollegeTeamProfile);
  const openNFLTeamProfile = useGameStore((state) => state.openNFLTeamProfile);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (activeLeague === 'nfl') {
    const nflWorld = ensureNFLLayer(world);
    const standings = getNFLStandings(nflWorld);
    const grouped = groupByDivision(standings);

    return (
      <div className="stack">
        {Object.entries(grouped).map(([division, entries]) => {
          const isOpen = expanded[division] ?? false;

          return (
            <Card title={`${division} (${entries.length})`} key={division}>
              <div className="button-row">
                <Button variant="ghost" onClick={() => setExpanded((state) => ({ ...state, [division]: !isOpen }))}>
                  {isOpen ? 'Свернуть' : 'Развернуть'}
                </Button>
              </div>

              {isOpen ? (
                <div className="table compact-table">
                  <div className="table-head grid-standings">
                    <span>#</span>
                    <span>команда</span>
                    <span>п-б</span>
                    <span>очк+</span>
                    <span>очк-</span>
                    <span>разн</span>
                  </div>

                  {entries.map((entry) => (
                    <button
                      className="table-row grid-standings table-row-button"
                      key={entry.teamId}
                      onClick={() => openNFLTeamProfile(entry.teamId, 'overview', 'rankings')}
                    >
                      <span>{entry.rank}</span>
                      <span>{entry.teamName}</span>
                      <span>
                        {entry.wins}-{entry.losses}
                      </span>
                      <span>{entry.pointsFor}</span>
                      <span>{entry.pointsAgainst}</span>
                      <strong>{entry.pointDifferential}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted">Дивизион свёрнут.</p>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  if (activeLeague === 'college') {
    const collegeTeamLookup = new Map((world.collegeTeams ?? []).map((team) => [team.id, team]));
    const standings = getCollegeStandings(world).map((entry) => ({
      ...entry,
      conference: collegeTeamLookup.get(entry.teamId)?.conference ?? 'Independent'
    }));
    const grouped = groupByConference(standings);
    return (
      <div className="stack">
        {Object.entries(grouped).map(([conference, entries]) => {
          const isOpen = expanded[conference] ?? false;

          return (
            <Card title={`${conference} (${entries.length})`} key={conference}>
              <div className="button-row">
                <Button variant="ghost" onClick={() => setExpanded((state) => ({ ...state, [conference]: !isOpen }))}>
                  {isOpen ? 'Свернуть' : 'Развернуть'}
                </Button>
              </div>

              {isOpen ? (
                <div className="table compact-table">
                  <div className="table-head grid-standings">
                    <span>#</span>
                    <span>команда</span>
                    <span>п-б</span>
                    <span>очк+</span>
                    <span>очк-</span>
                    <span>разн</span>
                  </div>

                  {entries.map((entry) => (
                    <button
                      className="table-row grid-standings table-row-button"
                      key={entry.teamId}
                      onClick={() => openCollegeTeamProfile(entry.teamId, 'overview', 'rankings')}
                    >
                      <span>{entry.rank}</span>
                      <span>{entry.teamName}</span>
                      <span>
                        {entry.wins}-{entry.losses}
                      </span>
                      <span>{entry.pointsFor}</span>
                      <span>{entry.pointsAgainst}</span>
                      <strong>{entry.pointDifferential}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted">Дивизион свёрнут.</p>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  const standings = world.season.standings;

  return (
    <Card title="Турнирная таблица">
      <div className="table compact-table">
        <div className="table-head grid-standings">
          <span>#</span>
          <span>команда</span>
          <span>п-б</span>
          <span>очк+</span>
          <span>очк-</span>
          <span>разн</span>
        </div>

        {standings.map((entry) => (
          <button
            className="table-row grid-standings table-row-button"
            key={entry.teamId}
            onClick={() => openTeamProfile(entry.teamId, 'overview', 'rankings')}
          >
            <span>{entry.rank}</span>
            <span>{entry.teamName}</span>
            <span>
              {entry.wins}-{entry.losses}
            </span>
            <span>{entry.pointsFor}</span>
            <span>{entry.pointsAgainst}</span>
            <strong>{entry.pointDifferential}</strong>
          </button>
        ))}
      </div>
    </Card>
  );
}
