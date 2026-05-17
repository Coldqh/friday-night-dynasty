import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getSeasonAwardWatch } from '../../core/awards/getSeasonAwardWatch';
import { getPersonForPlayer } from '../../core/people/personUtils';
import { Player } from '../../core/world/worldTypes';
import { useGameStore } from '../store/useGameStore';

function formatHeight(inches: number) {
  const feet = Math.floor(inches / 12);
  const rest = inches % 12;
  return `${feet}'${rest}"`;
}

function getPlayerStageLabel(player: Player) {
  switch (player.careerStage) {
    case 'graduated':
      return 'Graduate / alumni pool';
    case 'collegeProspect':
      return 'College prospect';
    case 'college':
      return 'College player';
    case 'draftProspect':
      return 'Draft prospect';
    case 'pro':
      return 'Pro player';
    case 'retired':
      return 'Retired';
    default:
      return 'High school player';
  }
}

export function PlayerProfileScreen() {
  const world = useGameStore((state) => state.world)!;
  const selectedPlayerId = useGameStore((state) => state.selectedPlayerId);
  const closePlayerProfile = useGameStore((state) => state.closePlayerProfile);
  const openTeamProfile = useGameStore((state) => state.openTeamProfile);
  const allPlayers = [...world.players, ...(world.graduatedPlayers ?? [])];
  const player = allPlayers.find((entry) => entry.id === selectedPlayerId) ?? allPlayers[0] ?? null;

  if (!player) {
    return (
      <Card title="Player Profile">
        <p className="muted">No player record found.</p>
        <Button variant="ghost" onClick={closePlayerProfile}>Back</Button>
      </Card>
    );
  }

  const person = getPersonForPlayer(world, player.id);
  const team = world.teams.find((entry) => entry.id === player.teamId) ?? null;
  const school = world.schools.find((entry) => entry.id === player.schoolId) ?? null;
  const hometown = world.cities.find((entry) => entry.id === (player.hometownCityId ?? player.cityId)) ?? null;
  const awards = getSeasonAwardWatch(world).filter((entry) => entry.playerId === player.id);
  const careerEvents = person?.careerEvents ?? [];

  return (
    <div className="stack">
      <Card title="Player Profile">
        <div className="stack compact-stack">
          <div className="eyebrow">{getPlayerStageLabel(player)}</div>
          <h3 className="profile-title">{player.firstName} {player.lastName}</h3>
          <div className="stat-strip">
            <span>{player.position}</span>
            <span>{player.classYear}</span>
            <span>OVR {player.overall}</span>
            <span>POT {player.potential}</span>
            <span>{formatHeight(player.height)}</span>
            <span>{player.weight} lbs</span>
          </div>
          <p className="muted">
            {school?.name ?? 'Unknown school'} / {team?.shortName ?? 'Unknown team'} / hometown {hometown?.name ?? 'Unknown'}
          </p>
          <div className="button-row">
            <Button variant="ghost" onClick={closePlayerProfile}>Back</Button>
            {team ? <Button variant="ghost" onClick={() => openTeamProfile(team.id, 'roster', 'playerProfile')}>Open Team</Button> : null}
          </div>
        </div>
      </Card>

      <Card title="Person Record">
        {person ? (
          <div className="stack compact-stack">
            <div className="stat-strip">
              <span>{person.personality}</span>
              <span>REP {person.reputation}</span>
              <span>Ambition {person.ambition}</span>
              <span>Discipline {person.discipline}</span>
              <span>Born {person.birthYear}</span>
            </div>
            <p className="muted">
              This is the tracked person layer: the same human can later become a college player, pro player, coach, scout or GM.
            </p>
          </div>
        ) : (
          <p className="muted">No person record exists yet. Normalization will rebuild it from the player record.</p>
        )}
      </Card>

      <Card title="Season / Career Stats">
        <div className="table compact-table">
          <div className="table-head" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
            <span>Scope</span>
            <span>Pass</span>
            <span>Rush</span>
            <span>Rec</span>
            <span>TD</span>
            <span>Tkl</span>
            <span>Sack</span>
            <span>INT</span>
          </div>
          <div className="table-row" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
            <strong>Season</strong>
            <span>{player.seasonStats.passingYards}</span>
            <span>{player.seasonStats.rushingYards}</span>
            <span>{player.seasonStats.receivingYards}</span>
            <span>{player.seasonStats.touchdowns}</span>
            <span>{player.seasonStats.tackles}</span>
            <span>{player.seasonStats.sacks}</span>
            <span>{player.seasonStats.interceptions}</span>
          </div>
          <div className="table-row" style={{ gridTemplateColumns: '0.95fr repeat(7, 0.55fr)' }}>
            <strong>Career</strong>
            <span>{player.careerStats.passingYards}</span>
            <span>{player.careerStats.rushingYards}</span>
            <span>{player.careerStats.receivingYards}</span>
            <span>{player.careerStats.touchdowns}</span>
            <span>{player.careerStats.tackles}</span>
            <span>{player.careerStats.sacks}</span>
            <span>{player.careerStats.interceptions}</span>
          </div>
        </div>
      </Card>

      <Card title="Award Watch">
        {awards.length === 0 ? (
          <p className="muted">No active award watch spot yet.</p>
        ) : (
          <div className="list">
            {awards.map((award) => (
              <div className="history-item" key={`${award.type}-${award.playerId}`}>
                <div className="eyebrow">Score {award.score}</div>
                <strong>{award.title}</strong>
                <p>{award.reason}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Career Timeline">
        {careerEvents.length === 0 ? (
          <p className="muted">Career events will appear as this player moves through the ecosystem.</p>
        ) : (
          <div className="list">
            {careerEvents.map((event) => (
              <div className="history-item" key={event.id}>
                <div className="eyebrow">{event.year} / Week {event.week + 1} / {event.type}</div>
                <strong>{event.title}</strong>
                <p>{event.body}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
