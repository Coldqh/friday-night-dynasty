# Friday Night Dynasty — анализ проекта и roadmap

## 1. Суть проекта

Friday Night Dynasty должен стать не просто симулятором американского футбола, а живой футбольной экосистемой.

Главная идея:

```text
школы → колледжи → профи → тренеры → менеджеры → история мира
```

Игроки не должны исчезать после выпуска. Они должны жить дальше: переходить в колледж, попадать в драфт, играть в профи, ломаться, возвращаться, становиться тренерами, скаутами, менеджерами, легендами города или забытыми талантами.

Правильный фокус проекта:

```text
не матч ради матча,
а жизнь футбольного мира через судьбы людей
```

## 2. Что уже есть сейчас

Текущий проект — нормальный foundation под браузерную игру.

Уже есть:

- React + Vite + TypeScript web-приложение;
- Zustand store;
- локальное сохранение через Dexie / IndexedDB;
- генерация мира;
- города;
- школы;
- команды;
- тренеры;
- игроки;
- расписание;
- симуляция недель;
- регулярный сезон;
- плей-офф;
- чемпион;
- offseason rollover;
- выпуск senior-игроков;
- развитие младших игроков;
- генерация freshman-класса;
- новости;
- история;
- GitHub Pages workflow.

Архитектура выбрана правильно: игровая логика живёт в `src/core`, интерфейс — в `src/app`, сохранения — в `src/storage`.

Это важный плюс. Проект не выглядит как случайная куча React-компонентов. У него уже есть игровой слой.

## 3. Главный текущий минус

Сейчас мир живёт только на уровне школьной лиги.

Текущий цикл игрока:

```text
FR → SO → JR → SR → исчезает
```

Для полноценной экосистемы нужен другой цикл:

```text
school player
→ recruit
→ college player
→ draft prospect
→ pro player
→ veteran
→ retired person
→ coach / scout / GM / media figure
```

Пока нет общей сущности человека. `Player` и `Coach` существуют отдельно. Для живого мира лучше построить всё вокруг `Person`.

## 4. Ключевой архитектурный вывод

Следующий большой технический поворот:

```text
Player и Coach не должны быть финальными сущностями.
Они должны быть ролями человека.
```

Нужная модель:

```ts
Person {
  id
  firstName
  lastName
  birthYear
  hometownCityId
  personality
  ambition
  discipline
  reputation
  relationships
}
```

Дальше человек получает карьерные профили:

```ts
PlayerCareerProfile
CoachCareerProfile
ExecutiveCareerProfile
ScoutCareerProfile
```

Так один человек сможет быть:

```text
школьным QB → колледж-звездой → запасным в профи → тренером QB → offensive coordinator → head coach
```

Это сердце проекта.

## 5. Аналоги и рынок

### Football Coach: College Dynasty

Сильный ориентир по глубине college football management: рекрутинг, развитие игроков, история программ, тренерские навыки, настройки мира.

Что взять:

- рекрутинг;
- историю команд;
- развитие игроков;
- тренерский путь;
- ощущение долгой династии.

Где Friday Night Dynasty может быть сильнее:

- единый мир от школы до профи;
- люди продолжают жить после завершения игровой карьеры;
- выпускники возвращаются в систему тренерами, скаутами и менеджерами.

### Draft Day Sports: College Football

Сильный ориентир по карьере тренера, staff, coordinator path, playbooks, командной химии.

Что взять:

- карьерную лестницу тренера;
- staff system;
- игровую философию;
- развитие репутации.

Где можно отличаться:

- меньше сухого менеджмента;
- больше истории мира и биографий;
- больше связей между школами, городами, колледжами и профи.

### Front Office Football

Сильный ориентир по pro GM-слою: контракты, free agency, драфт, roster management, staff, salary cap.

Что взять:

- pro contracts;
- draft;
- free agency;
- roster building;
- staff hiring.

Где можно отличаться:

- FOF начинается на профи-уровне;
- Friday Night Dynasty может показывать весь путь игрока с 14–18 лет до пенсии и тренерской карьеры.

### Maximum Football

Близкий концепт по связке college + pro universe.

Что взять:

- общую вселенную;
- переход игроков из college в pro.

Где можно отличаться:

- не пытаться делать 3D-футбол;
- строить глубокую симуляцию мира, а не спортивный экшен.

## 6. Главная рыночная ниша проекта

Лучшая формула:

```text
Living football universe simulator
```

Не “еще один менеджер колледжа”.
Не “мини-Madden”.
Не “таблица с матчами”.

А мир, где:

- школьная звезда может стать легендой NFL;
- слабый игрок может стать великим тренером;
- тренерская ветка может жить десятилетиями;
- школы имеют культуру и историю;
- города помнят своих игроков;
- колледжи охотятся за талантами;
- профи-лига питается всей системой;
- пользователь может быть тренером, менеджером, игроком или наблюдателем.

## 7. Roadmap по версиям

### v0.2 — People & Profiles

Цель: превратить игроков в людей.

Сделать:

- `Person` entity;
- связь `Player.personId`;
- hometown для каждого игрока;
- personality traits;
- player profile screen;
- career timeline;
- базовую историю игрока;
- сохранение выпускников в `graduatedPlayers`, а не полное удаление.

Главный результат:

```text
игрок после школы больше не исчезает из мира
```

### v0.3 — Awards, Records, Player History

Цель: дать миру память.

Сделать:

- State MVP;
- Offensive Player of the Year;
- Defensive Player of the Year;
- All-State Team;
- single-season records;
- career school records;
- team records;
- player awards на профиле;
- school history page.

Главный результат:

```text
появляется смысл следить за игроками и сезонами
```

### v0.4 — Graduating Seniors + Prospect Pool

Цель: подготовить мост школа → колледж.

Сделать:

- graduating class screen;
- prospect rating;
- star rating;
- state ranking;
- national ranking placeholder;
- college interest placeholder;
- `RecruitProfile`;
- `ProspectPool`.

Главный результат:

```text
выпускники становятся будущими рекрутами
```

### v0.5 — College Generation

Цель: добавить второй уровень мира.

Сделать:

- colleges;
- college teams;
- conferences;
- prestige;
- facilities;
- coach staff;
- scholarship capacity;
- recruiting needs;
- college roster.

Главный результат:

```text
у мира появляется уровень выше школы
```

### v0.6 — Recruiting

Цель: сделать первый настоящий жизненный переход.

Сделать:

- scholarship offers;
- recruit interest;
- commitment decision;
- signing day;
- scouting uncertainty;
- recruit preferences:
  - prestige;
  - distance from home;
  - playing time;
  - coach reputation;
  - scheme fit;
  - NIL/money placeholder;
  - academics;
  - ambition.

Главный результат:

```text
школьные игроки начинают выбирать колледжи
```

### v0.7 — College Season

Цель: колледжи должны играть свои сезоны.

Сделать:

- college schedule;
- conference standings;
- bowls/playoff;
- college player development;
- redshirt placeholder;
- transfer portal placeholder;
- college awards.

Главный результат:

```text
игроки получают вторую карьерную главу
```

### v0.8 — Draft Pool

Цель: подготовить мост колледж → профи.

Сделать:

- draft eligibility;
- draft projection;
- combine placeholder;
- scouting grades;
- team needs;
- draft board;
- mock draft.

Главный результат:

```text
лучшие колледж-игроки становятся pro prospects
```

### v0.9 — Pro League Foundation

Цель: добавить третий уровень мира.

Сделать:

- pro league;
- pro teams;
- pro roster;
- draft;
- contracts placeholder;
- free agency placeholder;
- retirements;
- pro stats;
- pro awards.

Главный результат:

```text
мир получает полную вертикаль школа → колледж → профи
```

### v1.0 — Full School → College → Pro Loop

Цель: первый законченный большой цикл.

Игрок должен пройти путь:

```text
freshman в школе
→ senior
→ recruit
→ college player
→ draft prospect
→ pro player
→ retired person
```

После этого проект становится полноценным фундаментом футбольной экосистемы.

## 8. Пользовательские роли

Не надо добавлять все роли сразу.

Правильный порядок:

1. Observer Mode — смотреть мир.
2. High School Coach — управлять школьной программой.
3. College Coach — рекрутинг и развитие программы.
4. Pro GM — драфт, контракты, состав.
5. Player Career — один человек от школы до конца карьеры.
6. Commissioner — редактировать структуру мира.

Сейчас лучше держать проект в режиме:

```text
Observer Mode + будущий High School Coach Mode
```

## 9. Техническая стратегия

Пока проект лучше держать frontend-only.

Причины:

- это личная игра;
- проще деплоить на GitHub Pages;
- Dexie хватает для локальных сохранений;
- меньше боли с сервером, базой, авторизацией и хостингом;
- можно быстро менять модель мира.

Backend стоит добавлять только позже, если появятся:

- облачные сохранения;
- аккаунты;
- шаринг миров;
- multiplayer/online league;
- большой редактор баз данных.

## 10. Правила разработки дальше

Главные правила:

1. Сначала симуляционная логика, потом красота интерфейса.
2. Каждая новая система должна оставлять след в истории мира.
3. Игроки не исчезают без записи в истории.
4. Любое поколение должно быть прослеживаемым.
5. Каждый сезон должен давать новые истории.
6. UI должен показывать не только цифры, но и судьбы людей.
7. Перед каждым пушем запускать:

```bash
pnpm test
pnpm build
pnpm check:index
```

## 11. Ближайший лучший патч

Следующий кодовый патч:

```text
v0.2 People & Profiles Foundation
```

Состав патча:

- добавить `Person`;
- добавить генерацию людей для игроков;
- добавить `personId` игрокам;
- добавить `hometownCityId`;
- добавить `graduatedPlayers` в мир;
- изменить offseason так, чтобы seniors сохранялись в истории;
- добавить player profile screen;
- добавить basic career timeline;
- добавить тест: игрок после выпуска остаётся в мире как graduated person.

Это самый правильный следующий удар.
