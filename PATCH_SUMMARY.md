# Friday Night Dynasty v1.2.0 — FBS Expansion + College Playoff

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что добавлено

### 1. Все основные FBS/ESPN-программы

Добавлено 136 программ уровня II:

- ACC
- Big Ten
- Big 12
- SEC
- American
- CUSA
- MAC
- Mountain West
- Pac-12
- Sun Belt
- Independent

Файл:

```text
src/core/colleges/generateColleges.ts
```

### 2. Конференции в списках и таблицах

В командах и таблице уровень II теперь группируется по конференциям.

Файлы:

```text
src/app/screens/RosterScreen.tsx
src/app/screens/RankingsScreen.tsx
```

### 3. Логотипы

Добавлены локальные PNG-бейджи для каждой программы:

```text
public/logos/college
```

Это игровые бейджи, не официальные trademark-логотипы.

### 4. Полный playoff уровня II

Добавлен 12-командный playoff:

- 5 лучших чемпионов конференций;
- 7 at-large;
- seeds 1-4 получают bye;
- first round;
- quarterfinals;
- semifinals;
- final.

Файл:

```text
src/core/colleges/collegeSeason.ts
```

### 5. Неделя в меню

В верхнем меню теперь отображается:

```text
год / текущая неделя
```

Файл:

```text
src/app/components/Layout.tsx
```

### 6. Реальные школьные программы

Добавлено 204 реально существующие школьные программы уровня I.

Это ровно 1.5x от 136 колледжских программ.

Файлы:

```text
src/content/realHighSchoolSeeds.ts
src/core/world/createWorld.ts
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
git commit -m "Expand FBS programs and add college playoff"
git push origin main
```
