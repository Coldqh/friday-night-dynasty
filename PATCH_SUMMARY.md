
# Friday Night Dynasty v1.2.1 — College Names Apostrophe Fix

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что исправлено

TypeScript падал в:

```text
src/core/colleges/generateColleges.ts
```

Причина: названия с апострофом были внутри одинарных строк:

```ts
'Delaware Fightin' Blue Hens'
'University of Hawai'i'
'Hawai'i Rainbow Warriors'
'Louisiana Ragin' Cajuns'
```

## Исправлено на экранированные строки

```ts
'Delaware Fightin\' Blue Hens'
'University of Hawai\'i'
'Hawai\'i Rainbow Warriors'
'Louisiana Ragin\' Cajuns'
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
git commit -m "Fix apostrophes in college program names"
git push origin main
```
