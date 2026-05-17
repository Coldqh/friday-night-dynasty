# Friday Night Dynasty v0.4.0 — test localization fix

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что исправлено

Патч обновляет тесты под русскую локализацию v0.4.0.

Игра уже собиралась, но тесты ожидали старые английские строки:

- `Watch`
- `State Final`
- `Dashboard`
- `All Games`
- `Completed`
- `League History`
- `State Champions`

Теперь тесты проверяют русские значения и отсутствие старых debug-панелей.

## Проверка

```bash
pnpm test
pnpm build
pnpm check:index
```
