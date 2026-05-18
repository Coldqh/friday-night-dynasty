# Friday Night Dynasty v1.1.3 — Actions Workflow Fix

## Команда проекта

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
```

## Что реально было не так

Сайт обновлялся, но Actions падал, потому что workflow пытался деплоить через GitHub Pages Actions:

```yaml
actions/configure-pages
actions/upload-pages-artifact
actions/deploy-pages
```

При этом в репозитории уже есть `dist`, и сайт, судя по поведению, обновляется из ветки/папки, а не через `deploy-pages`.

Итог:

```text
сайт обновился
но deploy job упал
получился красный крест
```

## Что исправлено

### 1. Workflow больше не пытается деплоить Pages

`.github/workflows/deploy.yml` заменён на безопасный verify-workflow:

```text
Install dependencies
Build
Check built index
```

Он не вызывает:

```text
actions/configure-pages
actions/upload-pages-artifact
actions/deploy-pages
```

### 2. Build больше не компилирует тесты

`tsconfig.json` теперь исключает:

```text
src/tests
*.test.ts
*.test.tsx
```

Это правильно: production build не должен падать из-за тестовых файлов. Тесты всё равно можно запускать отдельно через:

```bash
pnpm test
```

## Проверка

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
pnpm build
pnpm check:index
```

Отдельно, если хочешь:

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
pnpm test
```

## Git

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
git status -sb
git add .
git commit -m "Fix GitHub Actions workflow for branch-based Pages deploy"
git push origin main
```
