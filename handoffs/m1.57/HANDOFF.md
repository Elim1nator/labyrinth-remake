# M1.57 handoff

## Branch and number
- Branch: `Grok-Code-5` from current `main` (M1.56, no Mounted riders).
- Release: **M1.57** (do not overwrite `builds/m1.56/`).
- Main had already used M1.56, so the unreleased Baths work from Grok-Code-4 is ported here together with the statue art and the Slick Man.

## What shipped
- **The Bather:** `assets/mobs/bather.png` is now a 4-frame marble statue walk loop (height 120, same as the old sheet), sliced on the real gutters of `bather_statue_jacob.png`, centred and scaled together, fringe cleaned, corners alpha 0. Puddles are pool-water blue (`#3FC8E6` plus a paler highlight, slight transparency). Still 4 HP, slick + damage unchanged. Spawns only on Tiled Baths (`/Baths/i` / `TILED BATHS`).
- **The Slick Man:** new mob, map letter `d`, voice `slickman`, speed 0.8, **10 base HP** (2.5× a typical 4-HP regular; above Clunkbot's 8; scales `10+(L-1)`). Art is the previous 5-frame `bather.png`, copied to `assets/mobs/slickman.png`. Spawns only on **Slate Halls** (`/Slate/i`). 30% chance to reflect a player projectile back at the player (spark + `slickDeflect` cue; the bounce can hurt you). While a living Slick Man is **within 10 cells**, `viewDist()` is clamped to 5, overriding glasses and flares; `VIEW.cur` lerps (`fogLerp` 3.2) so the fog thickens and lifts smoothly when it dies or you leave range. The 10-cell radius is used instead of a whole-floor lock so "dies or is out of range" both work, and so the clamp is felt as the figure approaches (the fog itself is only 5).
- **Plunger:** Baths-only loot, uncommon, at most one per floor; held use still works anywhere; one-floor drop with chaining and pit-land guards.

## Tests
`m157Tests` (V157). Main's rider tests stay as `m156Tests` / V156.

## Art for Mr Lead
Binaries are not pushed via the text connector. PNG paths and git blob SHAs go in the review / agent report (`bather.png` changed, `slickman.png` new; `items.png` already has the Plunger from the port).

## Freeze
- Tests: **562/562** passed (30 retired pre-M1.23/M1.31 checks).
- Release `builds/m1.57/index.html` 1571.6 KB (1609314 bytes), sha256 `d3108559cbe2e7145960b0a8c4b002bafed4c154bc762929737ffe825ccefd43`.
- QA `builds/m1.57-qa/index.html` sha256 `685917d1917c62b9d4ec3bcf516923040e22494dac47e52d5b5a64630c7cccb8`.
- Main's frozen `builds/m1.56/` (no Mounted riders) is unchanged.

## PNG git blobs for Mr Lead (do not push these via the text connector)
- `assets/mobs/bather.png` (changed / new on this branch): 4-frame statue sheet, 340×120, 49062 bytes, blob `45668cd7aea3a871c2dce910841f316f85a67834`.
- `assets/mobs/slickman.png` (new): previous 5-frame hunched Bather sheet, 430×120, 69277 bytes, blob `4bd78fb051a6e97f8f5c4d64343ed10ffc6c412a`.
- `assets/items.png` (changed vs main; same as Grok-Code-4, plunger at tile 36): 35112 bytes, blob `2a7914f6873518730f6d30851c6f29cc62060319`.

