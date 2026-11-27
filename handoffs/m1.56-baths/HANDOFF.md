# M1.56 handoff

## What changed

- **Plunger** (`plunger`): instant use-item. Opens a black hole at your feet and drops you exactly one floor (`G.mode='fall'` then `trapLand`, same run-state carry as the exit). It is consumed immediately; re-use is blocked while you are already falling and for a short lock after you land, so a held key or button cannot chain drops. The hole is cleared on landing, and if the next floor's start would be a pit or an open trapdoor you are moved to a safe cell. Blocked (not consumed) when `G.L.sealed` (boss arena) or `levelIdx >= MAX_FLOOR-1`. It only appears on floors whose theme label says Baths (Tiled Baths, `THEMES[2]`). `puPool()` omits it on any other theme, so normal loot, elite drops, coin doors, secret rooms, shrines, the slot machine, boss loot, the mystery box and Old Murkle's shop all reroll it to another use-item. A Plunger you already hold still works on any floor (still blocked on a sealed boss floor or the last floor). On Baths floors it is uncommon (`PU_WEIGHT.plunger=1` vs `PU_WEIGHT_DEF=3`) and `randPU` will not place a second Plunger if one is already on the floor or in hand. Pickup text and the HUD tooltip use the name and "DROP TO THE NEXT FLOOR THROUGH A BLACK HOLE". Q, gamepad Y and the ITEM button all use it.
- **The Bather** (`bather`, map letter `a`): 4 base HP, speed 1.0, a slow hunched ground mob. It spawns on the existing **Tiled Baths** theme (floors 2-8 when that early theme is chosen), not on the tutorial Gatehouse and not on deep-theme floors. While it walks it leaves slick puddles (`BATHER`: radius 0.34, life 4.5 s, gap 0.55). They deal 1 heart (goo cooldown) and apply a short ice-like slide (`slickT` 1.4 s). Flyers are not affected; Rubber Boots shrug both off, same as other goo. A quiet wet voice plays when it spots you (`voice()` cooldown), plus dripping footsteps while it walks. The L3 kettle-swap rule never replaces a Bather.
- Art: five-frame walk loop in `assets/mobs/bather.png` (Jacob's walk sheet; white background removed with an edge-connected flood fill plus fringe cleanup, not a global key, so the glowing eyes stay); Plunger icon in `assets/items.png`. The black hole is a swirling floor decal drawn in code.

## Tests

`node tools/release.mjs dev --test`: **557/557 passed** (30 checks of pre-M1.23 items or pre-M1.31 layouts retired).

## Release

- Path: `builds/m1.56/index.html`
- Size: 1514.1 KB (1550410 bytes)
- sha256: `86f397ed4810a3d1081510be323c7e9a7cddc416757be2220ff943f20dec676c`
- QA: `builds/m1.56-qa/index.html` sha256 `16596d4bdfe6d23e9813c00bb53f9ad00a178ac5b68764b26b6efc74751760ff`
- Blob SHA (src and release HTML): `e185a0824ba827616b50182b08d0643ec37a646d`
- QA blob SHA: `6e6b9bb305b1eea60c956763113148572ff65f61`

Headless play screenshots (not in the repo): `/workspace/labyrinth-main/m150/bather.png` (the Bather and its puddles) and `/workspace/labyrinth-main/m150/plunger_hole.png` (the black hole). Preview of the walk sheet: `/workspace/labyrinth-main/m150/bather_preview.png`. PNGs for upload (Mr Lead): `assets/mobs/bather.png` (69277 bytes, git blob `4bd78fb051a6e97f8f5c4d64343ed10ffc6c412a`) and `assets/items.png` (35112 bytes, plunger at tile 36, git blob `2a7914f6873518730f6d30851c6f29cc62060319`).

## Known issues

Jacob's playtest (t48u): "The plunger dropped 3 times for me when I tested on bassalt depths." One Plunger use does not fall multiple floors. Loot was too common, and it could appear off Tiled Baths. It is now Baths-only (every drop source rerolls it elsewhere), uncommon, and capped at one per floor on Baths. Fall re-entry is also guarded. (t49u: only drop on floors labeled Baths.)

## Notes for Playtest

- Look for a floor titled "TILED BATHS" on floors 2-8.
- The Bather is a hunched dark-blue dripping figure with glowing eyes; it walks slowly and leaves dark slick puddles. Stepping in one should sting and make you slide a little, unless you have Rubber Boots.
- The Plunger should only show up as loot or in Old Murkle's shop on floors labeled Baths (Tiled Baths), never on Basalt Depths, the Mossy Cellar, or other themes. On Baths floors it should be uncommon (never two sitting on the same floor). A Plunger you already hold should still work on any floor: open a dark hole and drop you exactly one floor, even if you hold the button, including on Basalt Depths. On a boss floor before the boss is down, it should refuse and stay in the slot.
