# Friday Night Dynasty v0.3.0 — Player Profiles, Award Watch and Rivalry Rules

## Команда проекта

```bash
cd "C:\\FridayNightDynasty\\friday_night_dynasty_v01"
```

## Что добавлено

### 1. Видимая версия игры

- Добавлен `src/app/version.ts`.
- Версия отображается на Home screen, в верхней панели и на Dashboard.
- Текущая версия патча: `v0.3.0`.

### 2. Player Profile

- Добавлен экран `PlayerProfileScreen`.
- Из Team Profile теперь можно открыть профиль игрока.
- Профиль показывает:
  - статус карьеры;
  - школу/команду/родной город;
  - рост/вес/позицию/класс;
  - OVR/POT;
  - person record;
  - season/career stats;
  - career timeline;
  - award watch.

### 3. Award Watch

- Добавлен helper `getSeasonAwardWatch`.
- Dashboard показывает первых кандидатов:
  - State MVP Watch;
  - Offensive Player Watch;
  - Defensive Player Watch;
  - Freshman Breakout Watch;
  - Future Star Watch.

### 4. Rivalry UI правки

- Убрана строка `Current record 0-0` из блока Rivals.
- Убрана строка вида `Lakeview Tigers leads 1-0`.
- Теперь показывается историческая строка:

```text
All-time rivalry: Team A 2 — Team B 1
```

### 5. Rivalry schedule rule

- Rivalry-пара теперь не встречается в обычном регулярном расписании случайно.
- Каждая rivalry-пара получает один rivalry game за регулярный сезон.
- Повторная встреча может появиться только в playoff.

## Проверка

```bash
cd "C:\\FridayNightDynasty\\friday_night_dynasty_v01"
pnpm test
pnpm build
pnpm check:index
```

Или:

```bash
pnpm verify:local
```
