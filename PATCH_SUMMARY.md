# Friday Night Dynasty v1.1.0 — Prospects + College Graduate Roles

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что добавлено

### 1. Вкладка Проспекты

В режиме уровня I добавлена вкладка:

```text
Проспекты
```

Там показываются все текущие игроки `SR`:

- имя;
- команда;
- позиция;
- курс;
- звёздность;
- overall;
- potential;
- prospect score.

Звёздность считается прямо во время сезона, не только после межсезонья.

### 2. Отдельные роли выпускников

Теперь разделены роли:

```text
выпускник школы
выпускник колледжа
```

Если игрок:

```text
играл в школе
→ ушёл в колледж
→ выпустился из колледжа
```

то при открытии старой карточки школьного выпускника игра перекидывает на его актуальную запись:

```text
выпускник колледжа
```

### 3. Новый пул graduatedCollegePlayers

Добавлен отдельный пул:

```text
graduatedCollegePlayers
```

Он хранит игроков, которые закончили колледж:

- graduationYear;
- finalCollegeTeamId;
- finalCollegeName;
- карьерную статистику;
- связь с исходным школьным игроком через sourcePlayerId.

### 4. Избранное понимает выпускников колледжа

Если игрок был добавлен в избранное в школе или в колледже, после выпуска из колледжа вкладка `Избранные` показывает его как:

```text
Выпускник колледжа
```

### 5. Карьерные события

При выпуске из колледжа игрок получает событие:

```text
collegeGraduation
```

У человека закрывается роль `collegePlayer` и добавляется роль:

```text
collegeGraduate
```

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
git commit -m "Add senior prospects and college graduate roles"
git push origin main
```
