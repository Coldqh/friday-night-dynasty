# Friday Night Dynasty v0.1

Стартовая основа для браузерного симулятора живого мира школьного футбола.

## Стек

- React 19
- Vite 8
- TypeScript 6
- Zustand
- Dexie
- Vitest

## Запуск

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

Проект использует `pnpm@10.33.2` через поле `packageManager` в `package.json`.

## Структура

- `src/core` — чистая игровая логика без React
- `src/app` — React-интерфейс и Zustand store
- `src/storage` — работа с сохранениями
- `src/content` — игровые данные и текстовые наборы
- `src/tests` — тесты базовой симуляции

## Текущее состояние

Ветка `feature/fnd-core-foundation` содержит базовую генерацию мира, недельную/сезонную симуляцию, простой UI и локальные сохранения.
