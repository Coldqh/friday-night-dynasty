# Real data notes for v1.2.0

## College teams

The patch adds 136 FBS-style ESPN-visible programs across:

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

## Rosters

The game now creates full balanced rosters for every real program.

These are not claimed to be exact current ESPN roster records. Exact current rosters need a maintained importer because rosters change constantly and are too large to safely hard-code by hand.

## Logos

Official trademarked team logos are not bundled.

The patch includes local generated PNG badges for every team in:

```text
public/logos/college
```

The data model uses `logoAsset`, so replacing the generated badges with licensed official files later only requires swapping PNG files with the same names.

## Playoff

College postseason now uses a 12-team playoff model:

- five highest-ranked conference champions are guaranteed access;
- next seven teams are at-large;
- seeds 1-4 receive byes;
- first round, quarterfinals, semifinals, final.
