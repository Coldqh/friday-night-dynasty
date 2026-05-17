# Friday Night Dynasty v1.0.1 — PlayerProfile build fix

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Исправлено

`PlayerProfileScreen.tsx` был переписан так, чтобы TypeScript нормально разделял:

- `Player`
- `CollegePlayer`

Ошибка была из-за union-типа после строки:

```ts
const player = target.player;
```

Теперь ветка `college` обрабатывается отдельно, а школьник/выпускник отдельно.

## Проверка

```bash
pnpm build
pnpm test
pnpm check:index
```
