import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getTeamHistorySnapshot } from '../../core/teams/getTeamHistorySnapshot';
import { getTeamIdentityProfile } from '../../core/teams/getTeamIdentityProfile';
import { getTeamLeaders } from '../../core/teams/getTeamLeaders';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { getTeamSchedule } from '../../core/teams/getTeamSchedule';
import { TeamProfileTab, useGameStore } from '../store/useGameStore';

const profileTabs: Array<{ id: TeamProfileTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'roster', label: 'Roster' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'history', label: 'History' }
];

export function TeamProfileScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const teamProfileTab = useGameStore((state) => state.teamProfileTab);
  const setTeamProfileTab = useGameStore((state) => state.setTeamProfileTab);
  const closeTeamProfile = useGameStore((state) => state.closeTeamProfile);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const team = world.teams.find((entry) => entry.id === selectedTeamId) ?? world.teams[0];
  const identity = getTeamIdentityProfile(world, team.id);
  const leaders = getTeamLeaders(world, team.id);
  const roster = getTeamRoster(world, team.id).sort((left, right) => right.overall - left.overall);
  const schedule = getTeamSchedule(world, team.id);
  const history = getTeamHistorySnapshot(world, team.id);
  const standing = world.season.standings.find((entry) => entry.teamId === team.id);
  const recentNotes = [...schedule].filter((game) => game.summary).slice(-4).reverse();
  const rivals = team.rivalryIds
    .map((rivalId) => {
      const rivalTeam = world.teams.find((entry) => entry.id === rivalId);
      const rivalStanding = world.season.standings.find((entry) => entry.teamId === rivalId);

      if (!rivalTeam) {
        return null;
      }

      return {
        team: rivalTeam,
        record: rivalStanding ? `${rivalStanding.wins}-${rivalStanding.losses}` : `${rivalTeam.wins}-${rivalTeam.losses}`
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .slice(0, 3);
  const leaderRows = [
    { label: 'Best QB', player: leaders.quarterback },
    { label: 'Best RB', player: leaders.runningBack },
    { label: 'Best WR', player: leaders.receiver },
    { label: 'Defensive star', player: leaders.defensiveStar },
    { label: 'Top player', player: leaders.topPlayer },
    { label: 'Young prospect', player: leaders.youngProspect }
  ];

  return (
    <div className="stack">
      <Card title="Team Profile">
        <div className="stack compact-stack">
          <div className="eyebrow">
            {team.schoolName} / {team.cityName} / {team.mascot}
          </div>
          <h3 className="profile-title">{team.name}</h3>
          <div className="stat-strip">
            <span>Record {team.wins}-{team.losses}</span>
            <span>Prestige {team.prestige}</span>
            <span>OVR {team.overallRating}</span>
            <span>OFF {team.offenseRating}</span>
            <span>DEF {team.defenseRating}</span>
            <span>{team.offenseStyle}</span>
            <span>{team.defenseStyle}</span>
            <span>{identity.programTier}</span>
          </div>
          <div className="button-row">
            <Button variant="ghost" onClick={closeTeamProfile}>
              Back
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Team Views">
        <div className="tab-row">
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              className={teamProfileTab === tab.id ? 'tab-chip active' : 'tab-chip'}
              onClick={() => setTeamProfileTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {teamProfileTab === 'overview' && (
        <>
          <Card title="Overview">
            <div className="stack compact-stack">
              <div className="identity-tier">{identity.programTier}</div>
              <p className="muted">{identity.description}</p>
              <p className="muted">
                {standing
                  ? `${team.shortName} is currently #${standing.rank} in the state at ${standing.wins}-${standing.losses}, with ${standing.pointsFor} points scored and ${standing.pointsAgainst} allowed.`
                  : `${team.shortName} is settling into a fresh season.`}
              </p>
            </div>
          </Card>

          <Card title="Team Leaders">
            <div className="list">
              {leaderRows.map(({ label, player }) => (
                <div className="list-row" key={label}>
                  <div>
                    <strong>{label}</strong>
                    <p className="muted">
                      {player
                        ? `${player.firstName} ${player.lastName} / ${player.position} / ${player.classYear}`
                        : 'No player available in this role yet.'}
                    </p>
                  </div>
                  <strong>{player ? `OVR ${player.overall} / POT ${player.potential}` : 'N/A'}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Rivals">
            {rivals.length === 0 ? (
              <p className="muted">No major rivalries yet.</p>
            ) : (
              <div className="list">
                {rivals.map((rival) => (
                  <div className="list-row" key={rival.team.id}>
                    <div>
                      <strong>{rival.team.shortName}</strong>
                      <p className="muted">{rival.record}</p>
                    </div>
                    <Button variant="ghost" onClick={() => openTeamProfile(rival.team.id, 'overview')}>
                      Open Rival
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Recent Team Notes">
            {recentNotes.length === 0 ? (
              <p className="muted">Recent team notes will appear once this program has played games with recorded summaries.</p>
            ) : (
              <div className="list">
                {recentNotes.map((game) => (
                  <div className="history-item" key={`${game.gameId}-note`}>
                    <div className="eyebrow">
                      Week {game.week + 1}
                      {game.stage !== 'regular' ? ` / ${game.stage}` : ''}
                    </div>
                    <strong>{game.isRivalry ? `${game.opponentName} / Rivalry` : game.opponentName}</strong>
                    <p>{game.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {teamProfileTab === 'roster' && (
        <Card title="Roster">
          <div className="table compact-table">
            <div className="table-head grid-profile-roster">
              <span>Name</span>
              <span>Pos</span>
              <span>Class</span>
              <span>OVR</span>
              <span>POT</span>
              <span>Traits</span>
            </div>
            {roster.map((player) => (
              <div className="table-row grid-profile-roster" key={player.id}>
                <span>
                  {player.firstName} {player.lastName}
                </span>
                <span>{player.position}</span>
                <span>{player.classYear}</span>
                <strong>{player.overall}</strong>
                <strong>{player.potential}</strong>
                <span>{player.traits.length > 0 ? player.traits.join(', ') : 'No traits'}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {teamProfileTab === 'schedule' && (
        <Card title="Schedule">
          <div className="table compact-table">
            <div className="table-head grid-team-schedule">
              <span>Week</span>
              <span>Opponent</span>
              <span>Home/Away</span>
              <span>Result</span>
              <span>Score</span>
            </div>
            {schedule.map((game) => (
              <div className="table-row grid-team-schedule" key={game.gameId}>
                <span>
                  W{game.week + 1}
                  {game.stage !== 'regular' ? ` / ${game.stage}` : ''}
                </span>
                <span>{game.isRivalry ? `${game.opponentName} / Rivalry` : game.opponentName}</span>
                <span>{game.homeAway}</span>
                <strong>{game.result ?? 'TBD'}</strong>
                <strong>{game.score}</strong>
              </div>
            ))}
          </div>
        </Card>
      )}

      {teamProfileTab === 'history' && (
        <Card title="Program History">
          <div className="stack compact-stack">
            <div className="stat-strip">
              <span>Current {history.currentSeasonRecord.label}</span>
              <span>
                All-time {history.totalHistoricalWins}-{history.totalHistoricalLosses}
              </span>
              <span>Titles {history.titlesCount}</span>
              <span>Playoffs {history.playoffAppearancesCount}</span>
            </div>
            {history.lastSeasonEntry ? (
              <div className="history-item">
                <div className="eyebrow">Last season</div>
                <strong>
                  {history.lastSeasonEntry.year}: {history.lastSeasonEntry.wins}-{history.lastSeasonEntry.losses}
                </strong>
                <p>{history.lastSeasonEntry.note}</p>
              </div>
            ) : (
              <p className="muted">This program is still writing its first chapter.</p>
            )}
            {history.history.length > 0 && (
              <div className="list">
                {history.history.map((season) => (
                  <div className="history-item" key={`${team.id}-${season.year}`}>
                    <div className="eyebrow">{season.year}</div>
                    <strong>
                      {season.wins}-{season.losses}
                    </strong>
                    <p>
                      PF {season.pointsFor} / PA {season.pointsAgainst}
                    </p>
                    <p>{season.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
