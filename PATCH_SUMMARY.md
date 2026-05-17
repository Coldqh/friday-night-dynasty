# Friday Night Dynasty — late-season headline test fix

## Problem

`pnpm test` failed in:

`src/tests/core/historyNews.test.ts`

The failing assertion expected the generated headlines for a late regular-season world to include at least one of:

- `playoffRace`
- `mustWin`
- `lateSeason`

The application still built correctly, and `check:index` passed.

## Cause

`generateWeeklyHeadlines` did generate the generic `lateSeason` headline, but it was pushed too late in the headline list. Because the function returns only `headlines.slice(0, 10)`, the late-season item could be pushed out of the returned list by recap/momentum/poll-pressure headlines.

## Fix

Moved the generic `lateSeason` headline block higher in `generateWeeklyHeadlines`, immediately after Game of the Week and before completed-game recap headlines.

## After applying

Run:

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
pnpm test
pnpm build
pnpm check:index
```
