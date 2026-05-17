# Friday Night Dynasty — локальная проверка и запуск через GitHub

## 1. Установка

```bash
pnpm install
```

## 2. Локальный запуск разработки

```bash
pnpm dev
```

Открыть:

```text
http://localhost:5173/friday-night-dynasty/
```

## 3. Локальная проверка перед пушем

```bash
pnpm test
pnpm build
pnpm check:index
```

Полная проверка одной командой:

```bash
pnpm verify:local
```

## 4. Что проверяет `check:index`

Скрипт проверяет файл:

```text
dist/index.html
```

Проверки:

- файл существует;
- есть `<div id="root"></div>`;
- подключен JS entry;
- подключен CSS bundle;
- ассеты идут через `/friday-night-dynasty/assets/`;
- в index нет случайной ссылки `/assets/`, которая ломает GitHub Pages project-site.

## 5. Пуш в GitHub

```bash
git status -sb
git add .
git commit -m "Add project roadmap and local build verification"
git push origin main
```

## 6. GitHub Pages

После push в `main` запускается workflow:

```text
.github/workflows/deploy.yml
```

Он делает:

```text
checkout → setup pnpm → setup Node → pnpm install → pnpm build → upload dist → deploy pages
```

Ожидаемый адрес:

```text
https://coldqh.github.io/friday-night-dynasty/
```

## 7. Если GitHub Pages не открылся

Проверить:

1. GitHub → repository → Actions → Deploy to GitHub Pages.
2. Последний workflow должен быть зелёным.
3. GitHub → repository → Settings → Pages.
4. Source должен быть GitHub Actions.
5. Открывать именно `/friday-night-dynasty/`, а не корень `coldqh.github.io`.
