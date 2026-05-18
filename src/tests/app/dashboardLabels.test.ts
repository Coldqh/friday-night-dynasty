import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('dashboard labels', () => {
  it('does not expose the old state summary block labels', () => {
    const source = readFileSync(join(process.cwd(), 'src/app/screens/DashboardScreen.tsx'), 'utf-8');

    expect(source).not.toContain('Состояние года');
    expect(source).not.toContain('уровень I');
    expect(source).not.toContain('уровень II');
    expect(source).not.toContain('первый уровень:');
    expect(source).not.toContain('второй уровень:');
    expect(source).not.toContain('GAME_VERSION_LABEL');
  });
});
