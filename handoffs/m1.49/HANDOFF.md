# M1.49 handoff

## What changed

- **Mourner's Veil** (`veil`): instant use-item. Blinds every mob within the current sight radius and line of sight for 5 s (`VEIL.time`). Blinded mobs get `blindT` and wander (they do not chase). The Warding Bell's `stunT` still freezes a mob if both are set (stun is checked first). A dark-veil mark and motes show on blinded mobs. Pickup text and the HUD tooltip use the name and "BLINDS EVERY MOB IN VIEW FOR 5 S". Q, gamepad Y and the ITEM button all use it. The Veil is in the normal use-item loot and shop pools (`puPool` / `randPU` / shop offers).
- **The Lichen Face** (`lichen`, map letter `f`): 3 base HP, speed 1.65, hops like a Springle. It spawns on the existing **Mossy Cellar** theme (floors 2-8 when that early theme is chosen), not on the tutorial Gatehouse and not on deep-theme floors. On death it leaves a spore patch (`SPORE`: radius 0.36, life 5 s) that slows the player and ground mobs. Flyers and mid-hop airborne mobs ignore it; Rubber Boots shrug it off, same as webs, frost and goo. The L3 kettle-swap rule never replaces a Lichen Face.
- Art: Veil icon pasted into `assets/items.png`; four hop/pop frames in `assets/mobs/lichen.png`; registered in `assets/atlas.json` and packed. The source banner now says world art is packed from PNG sheets, not generated in code.
- Docs: `CHANGELOG.md`, `docs/PLAN.md` (current release M1.49), `docs/CONTROLS_AND_FEATURES.md`, `docs/BALANCE.md`, `assets/README.md`, build READMEs.

## Tests

`node tools/release.mjs dev --test` and `cd tests && npm test`: **533/533 passed** (30 checks of pre-M1.23 items or pre-M1.31 layouts retired).

## Release

- Path: `builds/m1.49/index.html`
- Size: 1,059,513 bytes (1034.7 KB)
- sha256: `d7e6989b6b29c8b3b6b5059f42f0d0f0457a992b7c4ebe8cfbd469da1b52f7cf`
- QA: `builds/m1.49-qa/index.html` sha256 `4bb954c9d62b26cb8908d6f73603ace3bf92a46b489e6bf63cfdd3f18f3d8ab4`

Headless play screenshots (not in the repo): `/workspace/labyrinth-main/m149/lichen_face.png` and `/workspace/labyrinth-main/m149/mourners_veil.png`.

## Known issues

None found in the automated suite. Playtest is paused, so there is no in-person review yet.

## Notes for Playtest

- Look for a floor titled "MOSSY CELLAR" on floors 2-8.
- The Lichen Face is a pale mossy face on a spring-like body; it hops, and a green spore patch appears when it pops.
- Mourner's Veil is a damp lace veil in the use-item slot and in Old Murkle's shop.
