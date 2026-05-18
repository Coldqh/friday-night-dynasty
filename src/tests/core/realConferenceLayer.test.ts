import { describe, expect, it } from 'vitest';
import { createWorld } from '../../core/world/createWorld';
import { normalizeWorldState } from '../../core/world/normalizeWorldState';

describe('real conference layer', () => {
  it('creates SEC and Big Ten programs with generated logo assets', () => {
    const world = createWorld({ seed: 12102 });
    const conferences = new Set((world.collegeTeams ?? []).map((team) => team.conference));

    expect(world.collegeTeams?.length).toBe(34);
    expect(conferences.has('SEC')).toBe(true);
    expect(conferences.has('Big Ten')).toBe(true);
    expect(world.collegeTeams?.every((team) => team.logoAsset?.startsWith('logos/college/'))).toBe(true);
  });

  it('migrates old fictional college layers to the real conference layer', () => {
    const world = createWorld({ seed: 12103 });
    const broken = structuredClone(world);

    broken.collegeTeams = broken.collegeTeams?.slice(0, 8).map((team) => ({
      ...team,
      conference: undefined,
      logoAsset: undefined
    }));
    broken.colleges = broken.colleges?.slice(0, 8).map((college) => ({
      ...college,
      conference: undefined,
      logoAsset: undefined
    }));

    const normalized = normalizeWorldState(broken);

    expect(normalized.collegeTeams?.length).toBe(34);
    expect(normalized.collegeTeams?.every((team) => team.conference && team.logoAsset)).toBe(true);
  });
});
