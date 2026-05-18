
# Friday Night Dynasty v1.1.7 — Logo Path TypeScript Fix

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Исправлено

TypeScript падал в двух файлах:

```text
src/app/screens/CollegeTeamProfileScreen.tsx
src/app/screens/RosterScreen.tsx
```

Причина:

```ts
path.replace(/^\\//, '')
```

Внутри шаблонной строки это ломало парсер TypeScript.

## Новая безопасная версия

Теперь без regex:

```ts
function getLogoSrc(path: string) {
  return path.startsWith('/') ? path.slice(1) : path;
}
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
git commit -m "Fix logo path TypeScript parsing"
git push origin main
```
