# Real data notes for v1.2.2

## Names

The patch expands the name pool to:

- 1500 first names
- 1500 last names

The pool mixes common US names, African-American style variants, and Mexican/Latino names and surnames.

## Logos

Official ESPN/trademark PNG logos are not bundled.

The game still supports `logoAsset`, and the generated PNG badges are stored in:

```text
public/logos/college
```

You can replace any generated badge with an official licensed PNG later using the same file name.

## Ratings

Rating scale is now staged:

- school players: 0-40 OVR
- college players: 30-70 OVR
- future NFL layer target: 60-100 OVR

NFL is intentionally not added in this patch.
