# Friday Night Dynasty v1.3.1 — NFL TypeScript Fix

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что исправлено

`pnpm build` падал в:

```text
src/core/nfl/nflLayer.ts
```

Причина: функции были объявлены с возвратом `GameWorld`, но возвращали объект с NFL-полями:

```ts
nflSeason
nflPlayers
nflTeams
nflDraftHistory
nflTrades
```

TypeScript не разрешал extra properties у object literal.

## Исправление

Возврат NFL-функций заменён с:

```ts
GameWorld
```

на:

```ts
WorldWithNFL
```

Функции:

```ts
simulateNFLWeek
simulateNFLSeason
runNFLDraft
runNFLTrades
advanceNFLToNextSeason
```

## Проверка

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
pnpm build
pnpm check:index
```

## Git

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
git status -sb
git add .
git commit -m "Fix NFL layer TypeScript return types"
git push origin main
```
