# Friday Night Dynasty v0.6.2 — test fix

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Исправлено

- Выпускники после межсезонья снова остаются `careerStage: 'graduated'`.
- Коммит в колледж теперь хранится через `recruitingProfile`, `commitment`, `collegeId`, `collegeTeamId`, но не ломает alumni pool.
- `getWeekStakes().summary` больше не пустой.
- `getWeeklySlate().gameOfTheWeek.reason` больше не пустой.
- Тексты оставлены функциональными:
  - `неделя X / матчей Y / дерби Z...`
  - `приоритет N`
  - `дерби`
  - `финал штата`

## Проверка

```bash
pnpm test
pnpm build
pnpm check:index
```
