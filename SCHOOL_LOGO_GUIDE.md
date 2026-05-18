# School logo guide

## Generated fallback badges

The patch includes generated school badges in:

```text
public/logos/school
```

These are not official school logos.

## Local official overrides

To use official school logos locally, put PNG files into:

```text
public/logos/school-official
```

Use exact file names from:

```text
public/logos/school-official/MANIFEST.txt
```

The game checks this folder first.

If a file exists there, it is shown.
If not, the game falls back to the generated badge.

## Example

```text
public/logos/school-official/allen-high-school-eagles.png
public/logos/school-official/mater-dei-high-school-monarchs.png
public/logos/school-official/img-academy-ascenders.png
```
