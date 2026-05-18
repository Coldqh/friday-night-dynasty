# Friday Night Dynasty v1.1.1 — Clean Dashboard + Real Conferences

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что исправлено

### 1. Скрыт блок состояния года

С главной убран блок с лишней информацией:

```text
уровень I
уровень II
предсезонье
16 команд
v1.0.5
Замок года
```

Осталась только рабочая карточка:

```text
Управление
```

С кнопками:

```text
Симулировать неделю
Симулировать год
Перейти к новому году
```

### 2. Вкладка Проспекты должна появиться

Дополнительно закреплён тест навигации. Если GitHub Actions падал из-за старой проверки вкладок, этот патч это закрывает.

### 3. Дерби уровня I распределены по неделям

Раньше все rivalry могли уходить в последнюю неделю.

Теперь rivalry-пары раскладываются по регулярному сезону.

### 4. Добавлены реальные конференции

Уровень II теперь использует реальные программы из:

```text
SEC
Big Ten
```

Всего:

```text
34 программы
```

### 5. Добавлены поля конференции и логотипа

В `College` и `CollegeTeam` добавлены:

```ts
conference?: string
division?: string
logoAsset?: string
```

### 6. Добавлены локальные PNG-бейджи

Файлы лежат тут:

```text
public/logos/college
```

Это не официальные trademark-логотипы, а локальные игровые бейджи. Модель уже готова к замене на официальные лицензированные ассеты.

### 7. Старые сохранения мигрируют на новый слой

Если в сохранении остались старые выдуманные колледжи, `normalizeWorldState` пересоберёт уровень II в новый формат:

```text
SEC + Big Ten
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
git commit -m "Clean dashboard and add real conference programs"
git push origin main
```
