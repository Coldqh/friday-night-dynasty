# Friday Night Dynasty v1.2.4 — Bigger Logos + School Logo Support

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что изменено

### 1. Колледжские логотипы стали крупнее

Во вкладке `Команды` логотипы увеличены примерно в 2 раза.

В профиле колледжской команды логотип тоже увеличен примерно в 2 раза.

### 2. Убраны рамки у логотипов

Для крупных логотипов убраны:

```text
border
background
box-shadow
```

### 3. Добавлена поддержка школьных логотипов

Добавлен компонент:

```text
src/app/components/SchoolLogo.tsx
```

Логика:

```text
public/logos/school-official → public/logos/school → initials placeholder
```

### 4. Добавлены сгенерированные школьные бейджи

Фоллбек-логотипы лежат тут:

```text
public/logos/school
```

### 5. Добавлена папка для официальных школьных PNG

```text
public/logos/school-official
```

И манифест имён:

```text
public/logos/school-official/MANIFEST.txt
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
git commit -m "Increase logo size and add school logo support"
git push origin main
```
