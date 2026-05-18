import { describe, expect, it } from 'vitest';

const removedDashboardLabels = [
  'Состояние года',
  'уровень I',
  'уровень II',
  'первый уровень:',
  'второй уровень:'
];

describe('dashboard labels', () => {
  it('keeps the removed state summary labels documented for the UI cleanup', () => {
    expect(removedDashboardLabels).toEqual([
      'Состояние года',
      'уровень I',
      'уровень II',
      'первый уровень:',
      'второй уровень:'
    ]);
  });
});
