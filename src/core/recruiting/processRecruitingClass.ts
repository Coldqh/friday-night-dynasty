import { appendCareerEvent, createCareerEvent } from '../people/personUtils';
import { makeId, SeededRng } from '../random/rng';
import {
  College,
  CollegeCommitment,
  CollegeTeam,
  GameWorld,
  Person,
  Player,
  RecruitingProfile
} from '../world/worldTypes';
import { getPlayerName, getProspectScore, getStars } from './recruitingUtils';

function getTeamName(world: GameWorld, teamId: string) {
  return world.teams.find((team) => team.id === teamId)?.shortName ?? '—';
}

function getCollegeFit({
  college,
  collegeTeam,
  player,
  score,
  rng
}: {
  college: College;
  collegeTeam: CollegeTeam;
  player: Player;
  score: number;
  rng: SeededRng;
}) {
  const needBonus = collegeTeam.recruitingNeeds.includes(player.position) ? 16 : 0;
  const prestigeFit = Math.max(0, 30 - Math.abs(college.prestige - score));
  const programScore = college.prestige * 0.38 + college.facilities * 0.28 + college.scholarshipBudget * 0.2 + college.academicRating * 0.08;

  return programScore + prestigeFit + needBonus + rng.int(0, 12);
}

function pickOffers({
  colleges,
  collegeTeams,
  player,
  score,
  stars,
  rng
}: {
  colleges: College[];
  collegeTeams: CollegeTeam[];
  player: Player;
  score: number;
  stars: number;
  rng: SeededRng;
}) {
  const offerCount = Math.min(colleges.length, Math.max(0, stars - 1));

  if (offerCount === 0) {
    return [];
  }

  return [...collegeTeams]
    .map((collegeTeam) => {
      const college = colleges.find((entry) => entry.id === collegeTeam.collegeId)!;

      return {
        collegeTeam,
        college,
        fit: getCollegeFit({ college, collegeTeam, player, score, rng })
      };
    })
    .sort((left, right) => right.fit - left.fit || right.college.prestige - left.college.prestige)
    .slice(0, offerCount)
    .map((entry) => entry.college.id);
}

export function processRecruitingClass({
  world,
  graduatingPlayers,
  people,
  rng,
  year
}: {
  world: GameWorld;
  graduatingPlayers: Player[];
  people: Person[];
  rng: SeededRng;
  year: number;
}): {
  profiles: RecruitingProfile[];
  commitments: CollegeCommitment[];
  graduatedPlayers: Player[];
  people: Person[];
} {
  const colleges = world.colleges ?? [];
  const collegeTeams = world.collegeTeams ?? [];

  if (colleges.length === 0 || collegeTeams.length === 0 || graduatingPlayers.length === 0) {
    return {
      profiles: [],
      commitments: [],
      graduatedPlayers: graduatingPlayers.map((player) => ({ ...player, careerStage: 'graduated' })),
      people
    };
  }

  const rankedPlayers = [...graduatingPlayers]
    .map((player) => ({ player, score: getProspectScore(player) }))
    .sort((left, right) => right.score - left.score || right.player.potential - left.player.potential || right.player.overall - left.player.overall);

  const profiles: RecruitingProfile[] = [];
  const commitments: CollegeCommitment[] = [];
  const updatedPlayersById = new Map<string, Player>();
  const commitmentsByPersonId = new Map<string, CollegeCommitment>();

  rankedPlayers.forEach(({ player, score }, index) => {
    const stars = getStars(score);
    const offerCollegeIds = pickOffers({ colleges, collegeTeams, player, score, stars, rng });
    const committedCollegeId = offerCollegeIds[0] ?? null;
    const committedCollegeTeam = committedCollegeId
      ? collegeTeams.find((team) => team.collegeId === committedCollegeId) ?? null
      : null;
    const committedCollege = committedCollegeId
      ? colleges.find((college) => college.id === committedCollegeId) ?? null
      : null;
    const status: RecruitingProfile['status'] = committedCollege && committedCollegeTeam ? 'committed' : stars >= 2 ? 'uncommitted' : 'noOffer';
    const profileId = makeId('recruiting_profile', rng);
    const playerName = getPlayerName(player);
    const profile: RecruitingProfile = {
      id: profileId,
      year,
      playerId: player.id,
      personId: player.personId ?? null,
      playerName,
      fromTeamId: player.teamId,
      fromTeamName: getTeamName(world, player.teamId),
      position: player.position,
      overall: player.overall,
      potential: player.potential,
      prospectScore: score,
      stars,
      stateRank: index + 1,
      status,
      offerCollegeIds,
      committedCollegeId: committedCollege?.id ?? null,
      committedCollegeTeamId: committedCollegeTeam?.id ?? null
    };

    profiles.push(profile);

    const updatedPlayer: Player = {
      ...player,
      recruitingProfileId: profileId,
      careerStage: 'graduated',
      collegeId: committedCollege?.id ?? null,
      collegeTeamId: committedCollegeTeam?.id ?? null
    };

    updatedPlayersById.set(player.id, updatedPlayer);

    if (committedCollege && committedCollegeTeam) {
      const commitment: CollegeCommitment = {
        id: makeId('commitment', rng),
        year,
        playerId: player.id,
        personId: player.personId ?? null,
        playerName,
        position: player.position,
        fromTeamId: player.teamId,
        fromTeamName: getTeamName(world, player.teamId),
        collegeId: committedCollege.id,
        collegeTeamId: committedCollegeTeam.id,
        collegeName: committedCollege.shortName,
        stars,
        prospectScore: score,
        convertedToCollegePlayerId: null
      };

      commitments.push(commitment);

      if (player.personId) {
        commitmentsByPersonId.set(player.personId, commitment);
      }
    }
  });

  const nextPeople = people.map((person) => {
    const commitment = commitmentsByPersonId.get(person.id);

    if (!commitment) {
      return person;
    }

    return appendCareerEvent(
      person,
      createCareerEvent({
        rng,
        year,
        week: 0,
        type: 'commitment',
        title: `${commitment.playerName}: ${commitment.collegeName}`,
        body: '',
        teamId: commitment.fromTeamId,
        schoolId: null
      })
    );
  });

  return {
    profiles,
    commitments,
    graduatedPlayers: graduatingPlayers.map((player) => updatedPlayersById.get(player.id) ?? { ...player, careerStage: 'graduated' }),
    people: nextPeople
  };
}
