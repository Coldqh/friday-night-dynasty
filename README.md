# Friday Night Dynasty v0.1

Браузерная основа для симулятора живого мира американского футбола: маленькие города, школы, игроки, тренеры, сезоны, рекорды, выпускники и будущая экосистема школа → колледж → профи.

## Текущий стек

- React 19
- Vite 8
- TypeScript 6
- Zustand
- Dexie / IndexedDB
- Zod
- Vitest
- GitHub Pages

Проект использует `pnpm@11.1.2` через поле `packageManager` в `package.json`.

## Локальный запуск

```bash
pnpm install
pnpm dev
```

После запуска Vite откроет приложение локально. Обычно адрес такой:

```text
http://localhost:5173/friday-night-dynasty/
```

## Проверка перед пушем

```bash
pnpm test
pnpm build
pnpm check:index
```

Или одной командой:

```bash
pnpm verify:local
```

`check:index` проверяет собранный `dist/index.html`: наличие root-элемента, подключение JS/CSS ассетов и правильный GitHub Pages base path `/friday-night-dynasty/`.

## Запуск через GitHub Pages

Проект уже подготовлен под GitHub Pages:

- `vite.config.ts` использует `base: '/friday-night-dynasty/'`;
- `.github/workflows/deploy.yml` собирает `dist` и публикует приложение через GitHub Pages;
- деплой запускается после push в `main` или вручную через `workflow_dispatch`.

Ожидаемый адрес после успешного деплоя:

```text
https://coldqh.github.io/friday-night-dynasty/
```

## Структура

- `src/core` — чистая игровая логика без React
- `src/app` — React-интерфейс и Zustand store
- `src/storage` — локальные сохранения
- `src/content` — игровые данные и текстовые наборы
- `src/tests` — тесты базовой симуляции
- `docs` — анализ проекта, roadmap и правила развития
- `scripts` — локальные проверки проекта

## Текущее состояние

В текущей версии уже есть базовая генерация мира, недельная/сезонная симуляция, простой UI, локальные сохранения и GitHub Pages workflow.

Сейчас ядро проекта — школьная лига штата Texoma: города, школы, команды, тренеры, игроки, расписание, регулярный сезон, плей-офф, чемпион, новости и история.

## Главный вектор развития

Следующий крупный шаг — превратить игроков из временных школьных сущностей в настоящих людей мира:

```text
Person → PlayerCareer → Graduation → CollegeRecruit → CollegePlayer → DraftProspect → ProPlayer → RetiredPerson → Coach / Scout / GM
```

Без этого проект останется школьным симулятором. С этим он станет живой футбольной экосистемой.

## Ближайший roadmap

```text
v0.2 — People & Profiles
v0.3 — Awards, Records, Player History
v0.4 — Graduating Seniors + Prospect Pool
v0.5 — College Generation
v0.6 — Recruiting
v0.7 — College Season
v0.8 — Draft Pool
v0.9 — Pro League Foundation
v1.0 — Full School → College → Pro Loop
```

Подробный разбор лежит в `docs/PROJECT_ANALYSIS_AND_ROADMAP.md`.
