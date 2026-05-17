# Friday Night Dynasty v1.0.5 — Year Lock + Clean Labels

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Главная правка

Исправлен баг, где после 2026 года 2027 мог застревать, а повторное нажатие симуляции добавляло командам десятки и сотни матчей в один год.

Теперь завершённый год закрывается жёстким замком:

```text
оба сезона завершены
= симуляция недели/года больше ничего не добавляет
= доступен только переход к новому году
```

## Что исправлено

### 1. Year lock

`simulateUnifiedWeek` и `simulateUnifiedSeason` теперь сначала проверяют:

```text
можно ли уже переходить к новому году
```

Если да — они ничего не симулируют повторно.

### 2. Защита от повторных матчей

Добавлена дедупликация:

- completedGames;
- playoffGames;
- schedule games;
- college completedGames;
- college schedule games.

Если неделя уже была сыграна, она не добавляется второй раз.

### 3. Ремонт ростеров больше не сбрасывает сезон

В v1.0.4 авто-ремонт кривых ростеров мог сбрасывать текущий сезон уровня II при нормализации.

Теперь ремонт ростера не перезапускает текущий сезон. Сезон сбрасывается только если:

```text
нет season state
или год уровня II не совпадает с годом мира
```

### 4. Чистка явных подписей

С главной убраны прямые подписи формата:

```text
школа
колледжи
```

Теперь используются:

```text
уровень I
уровень II
```

Кнопки:

```text
Симулировать неделю
Симулировать год
Перейти к новому году
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
git commit -m "Lock completed world years and clean season labels"
git push origin main
```
