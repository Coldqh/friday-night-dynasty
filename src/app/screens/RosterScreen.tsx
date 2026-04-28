import { Card } from '../components/Card';
import { getTeamHistorySnapshot } from '../../core/teams/getTeamHistorySnapshot';
import { getTeamIdentityProfile } from '../../core/teams/getTeamIdentityProfile';
import { getTeamLeaders } from '../../core/teams/getTeamLeaders';
import { getTeamRoster } from '../../core/teams/getTeamRoster';
import { getTeamSchedule } from '../../core/teams/getTeamSchedule';
import { useGameStore } from '../store/useGameStore';

export function RosterScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedTeamId = useGameStore((state) => state.selectedTeamId);
  const setSelectedTeamId = useGameStore((state) => state.setSelectedTeamId);
  const team = world.teams.find((item) => item.id === selectedTeamId) ?? world.teams[0];
  const players = getTeamRoster(world, team.id).sort((left, right) => right.overall - left.overall);
  const identity = getTeamIdentityProfile(world, team.id);
  const leaders = getTeamLeaders(world, team.id);
  const schedule = getTeamSchedule(world, team.id);
  const history = getTeamHistorySnapshot(world, team.id);
  const leaderRows = [
    { label: 'Best QB', player: leaders.quarterback },
    { label: 'Best RB', player: leaders.runningBack },
    { label: 'Best WR', player: leaders.receiver },
    { label: 'Defensive anchor', player: leaders.defensiveStar },
    { label: 'Top player', player: leaders.topPlayer },
    { label: 'Young prospect', player: leaders.youngProspect }
  ];

  return (
    <div className="stack">
      <Card title="Команды штата">
        <div className="team-grid">
          {world.teams.map((entry) => (
            <button
              key={entry.id}
              className={entry.id === team.id ? 'team-chip active' : 'team-chip'}
              onClick={() => setSelectedTeamId(entry.id)}
            >
              <strong>{entry.shortName}</strong>
              <span>
                {entry.wins}-{entry.losses} · OVR {entry.overallRating}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Team Profile">
        <div className="stack compact-stack">
          <div className="eyebrow">
            {team.schoolName} · {team.cityName} · {team.mascot}
          </div>
          <h3 className="profile-title">{team.name}</h3>
          <p className="muted">
            {team.schoolName} represents {team.cityName} as a {team.offenseStyle} offense and {team.defenseStyle} defense.
          </p>
          <div className="stat-strip">
            <span>Prestige {team.prestige}</span>
            <span>Record {team.wins}-{team.losses}</span>
            <span>OFF {team.offenseRating}</span>
            <span>DEF {team.defenseRating}</span>
            <span>OVR {team.overallRating}</span>
            <span>Offense {team.offenseStyle}</span>
            <span>Defense {team.defenseStyle}</span>
          </div>
        </div>
      </Card>

      <Card title="Team Identity">
        <div className="stack compact-stack">
          <div className="identity-tier">{identity.programTier}</div>
          <p className="muted">{identity.description}</p>
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
                    ? `${player.firstName} ${player.lastName} · ${player.position} · ${player.classYear}`
                    : 'No player available in this role yet.'}
                </p>
              </div>
              <strong>{player ? `OVR ${player.overall} / POT ${player.potential}` : 'N/A'}</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Roster">
        <div className="stack compact-stack">
          <div className="table compact-table">
            <div className="table-head grid-roster">
              <span>Игрок</span>
              <span>Pos</span>
              <span>Класс</span>
              <span>OVR</span>
              <span>POT</span>
            </div>
            {players.map((player) => (
              <div className="table-row grid-roster" key={player.id}>
                <span>
                  {player.firstName} {player.lastName}
                </span>
                <span>{player.position}</span>
                <span>{player.classYear}</span>
                <strong>{player.overall}</strong>
                <strong>{player.potential}</strong>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Team Schedule">
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
                {game.stage !== 'regular' ? ` · ${game.stage}` : ''}
              </span>
              <span>{game.opponentName}</span>
              <span>{game.homeAway}</span>
              <strong>{game.result ?? 'TBD'}</strong>
              <strong>{game.score}</strong>
            </div>
          ))}
        </div>
      </Card>

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
        </div>
      </Card>
    </div>
  );
}
