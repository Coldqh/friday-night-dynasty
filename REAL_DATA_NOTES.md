# Real data notes

## Conferences

The layer now uses real SEC and Big Ten program names.

Implemented:

- 16 SEC programs
- 18 Big Ten programs
- conference/division field on each program
- generated prestige baseline
- generated full balanced roster for each program
- generated local PNG badge for each program

## Rosters

Current full real rosters are not embedded.

Reason:

- current player rosters change constantly;
- reliable full roster ingestion needs a proper data source;
- this patch keeps the sim stable by generating balanced rosters for every real program.

The code is now ready for a future importer that can replace generated rosters with real roster CSV/JSON.

## Logos

Official trademarked logos are not bundled.

Instead, this patch includes generated local PNG badges in:

```text
public/logos/college
```

The data model already has `logoAsset`, so official licensed assets can be swapped later by replacing the files.
