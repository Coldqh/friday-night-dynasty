# NFL logo guide

## Generated fallback logos

This patch includes generated NFL fallback badges in:

```text
public/logos/nfl
```

## Local official overrides

Put local official PNG files into:

```text
public/logos/nfl-official
```

Use exact file names from:

```text
public/logos/nfl-official/MANIFEST.txt
```

The game checks this folder first.

If a file exists there, it is shown.
If not, the game falls back to `public/logos/nfl`.

## Installer helper

You can put downloaded PNG files into:

```text
logo-import/nfl
logo-import/college
logo-import/school
```

Then run:

```bash
cd "C:\FridayNightDynasty\friday_night_dynasty_v01"
node scripts/install-logo-overrides.mjs
```

It copies PNG files to the correct official override folders.

## NFL file names

```text
ari.png
atl.png
bal.png
buf.png
car.png
chi.png
cin.png
cle.png
dal.png
den.png
det.png
gb.png
hou.png
ind.png
jax.png
kc.png
lar.png
lac.png
lv.png
mia.png
min.png
ne.png
no.png
nyg.png
nyj.png
phi.png
pit.png
sea.png
sf.png
tb.png
ten.png
wsh.png
```
