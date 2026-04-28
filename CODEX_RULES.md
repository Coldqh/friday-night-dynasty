# Friday Night Dynasty — Codex Rules

## Главный принцип

Симулятор мира должен жить отдельно от интерфейса.

- `src/core` — чистая игровая логика.
- `src/app` — React-интерфейс.
- `src/storage` — сохранения.
- `src/content` — игровые данные, имена, шаблоны, события.

React-компоненты не должны содержать правила симуляции матчей, сезонов, игроков или рекрутинга.

## Перед изменениями

Codex обязан:

1. Прочитать `README.md`.
2. Прочитать `ARCHITECTURE.md`.
3. Прочитать `CODEX_RULES.md`.
4. Понять текущую структуру.
5. Не переписывать проект целиком без явной команды.

## После изменений

Codex обязан вывести:

TASK RESULT

1. Summary
2. Changed files
3. Architecture notes
4. Tests
5. Problems
6. Next recommended task

## Обязательные проверки

После каждой задачи запустить:

```bash
pnpm test
pnpm build