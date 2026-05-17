# Friday Night Dynasty v0.2 — People & Profiles Foundation

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что добавлено

- слой `Person`;
- карьерные события `CareerEvent`;
- роли человека `PersonRole`;
- `personId`, `careerStage`, `hometownCityId` у игроков;
- `people` и `graduatedPlayers` в `GameWorld`;
- выпускники сохраняются после offseason rollover;
- dashboard показывает Living World Pulse;
- roster показывает краткую жизненную строку игрока;
- тесты на people foundation.

## Проверка

```bash
pnpm install
pnpm verify:local
```

Если нужно проверить отдельно:

```bash
pnpm test
pnpm build
pnpm check:index
```

## Git

```bash
git status -sb
git add .
git commit -m "Add people and career foundation"
git push origin main
```

## Следующий шаг

v0.3 — отдельный профиль игрока, timeline, awards, records.
