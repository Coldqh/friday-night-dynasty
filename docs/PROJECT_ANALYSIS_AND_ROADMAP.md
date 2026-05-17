# Friday Night Dynasty — Project Analysis & Roadmap

## Главная идея

Friday Night Dynasty должен развиваться не в сторону обычного табличного симулятора, а в сторону живой футбольной экосистемы:

```text
школа → колледж → профи → тренеры / скауты / менеджеры / легенды мира
```

Главный принцип: игрок не исчезает после выпуска. Он остаётся человеком мира, получает карьерную историю и может вернуться в футбол уже в другой роли.

## Текущий roadmap

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

## v0.2 — People & Profiles Foundation

Цель патча: заложить слой людей под текущих игроков.

### Добавлено

- `Person` — отдельная сущность человека мира.
- `CareerEvent` — события карьеры.
- `PersonRole` — роль человека: игрок, выпускник, тренер, скаут, GM.
- `careerStage` у игрока.
- `personId` у игрока.
- `hometownCityId` у игрока.
- `people` в `GameWorld`.
- `graduatedPlayers` в `GameWorld`.
- выпускники больше не теряются полностью после школы.
- dashboard показывает количество людей, активных игроков и выпускников.
- team profile показывает краткую жизненную строку игрока: personality, reputation, hometown.
- тесты на создание людей и выпуск senior-игроков.

## Что это даёт

Раньше модель была такой:

```text
FR → SO → JR → SR → исчез
```

Теперь модель становится такой:

```text
FR → SO → JR → SR → graduatedPlayers → будущий prospect / coach / scout / GM
```

Это первый кирпич будущей экосистемы.

## Следующий патч

v0.3 должен сделать историю игроков видимой и ценной:

- отдельный Player Profile screen;
- career timeline;
- статистика по сезонам;
- awards;
- school records;
- state records;
- Hall of Fame foundation.
