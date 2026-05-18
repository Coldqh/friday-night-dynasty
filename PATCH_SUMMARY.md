# Friday Night Dynasty v1.1.2 — GitHub Actions Build Fix

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что сломало Actions

GitHub Actions запускает:

```bash
pnpm build
```

А `pnpm build` запускает:

```bash
tsc -b && vite build
```

В прошлом патче был добавлен тест:

```text
src/tests/app/dashboardLabels.test.ts
```

В нём были импорты:

```ts
node:fs
node:path
```

Проект не имеет `@types/node`, а `tsconfig.json` включает весь `src`, поэтому `tsc` мог падать на build.

## Что исправлено

### 1. Убраны node:* импорты из dashboardLabels.test.ts

Файл теперь не использует:

```ts
node:fs
node:path
```

### 2. Убрана зависимость от import.meta.env в логотипах

В компонентах логотипов теперь используется простой относительный путь:

```ts
logos/college/...
```

### 3. Добавлен vite-env.d.ts

Добавлен файл:

```text
src/vite-env.d.ts
```

Чтобы будущие обращения к `import.meta.env` не ломали TypeScript.

## Проверка

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
pnpm build
pnpm test
pnpm check:index
```

## Git

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
git status -sb
git add .
git commit -m "Fix GitHub Actions build after conference patch"
git push origin main
```
