# M1.56 handoff

## What changed

- **Plunger** (`plunger`): instant use-item. Opens a black hole at your feet and drops you to the next floor (`G.mode='fall'` then `trapLand`, same run-state carry as the exit). Then it is used up. Blocked (not consumed) when `G.L.sealed` (boss arena) or `levelIdx >= MAX_FLOOR-1`. In the normal use-item loot and shop pools. Pickup text and the HUD tooltip use the name and "DROP TO THE NEXT FLOOR THROUGH A BLACK HOLE". Q, gamepad Y and the ITEM button all use it.
- **The Bather** (`bather`, map letter `a`): 4 base HP, speed 1.0, a slow hunched ground mob. It spawns on the existing **Tiled Baths** theme (floors 2-8 when that early theme is chosen), not on the tutorial Gatehouse and not on deep-theme floors. While it walks it leaves slick puddles (`BATHER`: radius 0.34, life 4.5 s, gap 0.55). They deal 1 heart (goo cooldown) and apply a short ice-like slide (`slickT` 1.4 s). Flyers are not affected; Rubber Boots shrug both off, same as other goo. A quiet wet voice plays when it spots you (`voice()` cooldown), plus dripping footsteps while it walks. The L3 kettle-swap rule never replaces a Bather.
- Art: five-frame walk loop in `assets/mobs/bather.png` (Jacob's walk sheet; white background removed with an edge-connected flood fill plus fringe cleanup, not a global key, so the glowing eyes stay); Plunger icon in `assets/items.png`. The black hole is a swirling floor decal drawn in code.

## Tests

`node tools/release.mjs dev --test` and `cd tests && npm test`: **554/554 passed** (30 checks of pre-M1.23 items or pre-M1.31 layouts retired).

## Release

- Path: `builds/m1.56/index.html`
- Size: 1513.0 KB (1549320 bytes)
- sha256: `1011f1bd5e23e1916a86caad427e730db433a8879605f5d1a0e97a4c378873cd`
- QA: `builds/m1.56-qa/index.html` sha256 `2c06f1985db6659c97c8a97cb457c361b55972de8c46d9da82454f977262dcc0`
- Blob SHA (src and release HTML): `654f518184a60c2873b3d0489eccdcf7d5a47895`
- QA blob SHA: `d3ffe6eded2ddd60061e00fca5081931a40d2c1f`

Headless play screenshots (not in the repo): `/workspace/labyrinth-main/m150/bather.png` (the Bather and its puddles) and `/workspace/labyrinth-main/m150/plunger_hole.png` (the black hole). Preview of the walk sheet: `/workspace/labyrinth-main/m150/bather_preview.png`. PNGs for upload (Mr Lead): `assets/mobs/bather.png` (69277 bytes, git blob `4bd78fb051a6e97f8f5c4d64343ed10ffc6c412a`) and `assets/items.png` (35112 bytes, plunger at tile 36, git blob `2a7914f6873518730f6d30851c6f29cc62060319`).

## Known issues

None found in the automated suite. Playtest is paused, so there is no in-person review yet.

## Notes for Playtest

- Look for a floor titled "TILED BATHS" on floors 2-8.
- The Bather is a hunched dark-blue dripping figure with glowing eyes; it walks slowly and leaves dark slick puddles. Stepping in one should sting and make you slide a little, unless you have Rubber Boots.
- The Plunger is in the use-item slot and in Old Murkle's shop. Using it should open a dark hole and drop you a floor. On a boss floor before the boss is down, it should refuse and stay in the slot.
