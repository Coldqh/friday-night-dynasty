# Friday Night Dynasty v1.2.3 — Official Logo Override Support

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что добавлено

### 1. Поддержка локальных official overrides

Добавлена папка:

```text
public/logos/college-official
```

Игра теперь сначала ищет логотип там.

Если файла нет — берёт текущий игровой бейдж из:

```text
public/logos/college
```

### 2. Новый компонент логотипа

Добавлен:

```text
src/app/components/CollegeLogo.tsx
```

Он сам выбирает:

```text
official override → fallback badge → initials placeholder
```

### 3. Подключено в UI

Обновлены:

```text
src/app/screens/RosterScreen.tsx
src/app/screens/CollegeTeamProfileScreen.tsx
```

### 4. Манифест имён файлов

Добавлен список ожидаемых PNG:

```text
public/logos/college-official/MANIFEST.txt
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
git commit -m "Add official college logo override support"
git push origin main
```
