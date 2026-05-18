# Friday Night Dynasty v1.3.0 — NFL Layer, Draft and Trades

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что добавлено

### 1. NFL как третий уровень

Добавлен переключатель:

```text
Школа / Колледж / NFL
```

NFL получает отдельные вкладки:

```text
Главная
Команды
Драфт
Календарь
Таблица
История
```

### 2. 32 NFL команды

Добавлены все 32 команды с конференциями и дивизионами:

```text
AFC East / North / South / West
NFC East / North / South / West
```

Файлы:

```text
src/core/nfl/nflData.ts
src/core/nfl/nflTypes.ts
src/core/nfl/nflLayer.ts
```

### 3. NFL сезон

Добавлено:

```text
регулярный сезон
таблица
симуляция недели
симуляция сезона
14-командный плей-офф
Super Bowl
```

Формат playoff:

```text
7 команд AFC
7 команд NFC
победители дивизионов
wild card
1 seed получает bye
Wild Card
Divisional
Conference Championship
Super Bowl
```

### 4. NFL ростеры

У каждой NFL команды генерируется состав:

```text
QB/RB/WR/TE/OL/DL/LB/CB/S/K
OVR 60-100
контракты
зарплаты
возраст
стаж
статистика
```

### 5. Draft из колледжа

Добавлена вкладка:

```text
Драфт
```

В колледже она показывает draft board из выпускников колледжа.

В NFL она показывает историю пиков и кнопку:

```text
Провести драфт
```

### 6. Переход колледж → NFL

При драфте выпускник колледжа становится NFL игроком:

```text
college OVR 30-70 → NFL OVR 60-100
potential пересчитывается
создаётся NFL player
пишется pick history
```

### 7. Трейды

Добавлена система трейдов:

```text
runNFLTrades
история трейдов
вкладка trades в профиле NFL команды
```

### 8. Логотипы NFL

Добавлены generated fallback PNG:

```text
public/logos/nfl
```

Добавлена папка для official override PNG:

```text
public/logos/nfl-official
```

И манифест:

```text
public/logos/nfl-official/MANIFEST.txt
```

### 9. Installer helper для логотипов

Добавлен скрипт:

```text
scripts/install-logo-overrides.mjs
```

Он копирует PNG из:

```text
logo-import/nfl
logo-import/college
logo-import/school
```

в:

```text
public/logos/nfl-official
public/logos/college-official
public/logos/school-official
```

## Важно про official logos

В zip не вложены официальные NFL/ESPN/team trademark PNG.

Причина: это защищённые ассеты. Патч вместо этого даёт официальный override-механизм и установщик для твоих локальных файлов.

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
git commit -m "Add NFL layer draft trades and playoffs"
git push origin main
```
