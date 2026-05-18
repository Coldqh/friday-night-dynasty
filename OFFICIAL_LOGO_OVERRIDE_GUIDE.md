# Official logo override guide

## What changed

The game now supports an override folder:

```text
public/logos/college-official
```

For every college team, the UI checks this folder first.

Example:

```text
public/logos/college-official/alabama.png
```

If that file exists, the game uses it.

If it does not exist, the game falls back to:

```text
public/logos/college/alabama.png
```

## Why the zip does not include official ESPN/trademark PNG files

Official ESPN/team/NCAA logo files are protected assets. The code now supports using them locally, but the zip only includes the loader and manifest.

## How to use your own local PNG files

1. Put PNG files into:

```text
public/logos/college-official
```

2. Use names from:

```text
public/logos/college-official/MANIFEST.txt
```

3. Run:

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
pnpm build
pnpm check:index
```

## Good examples

```text
alabama.png
ohio-state.png
michigan.png
texas.png
notre-dame.png
```
