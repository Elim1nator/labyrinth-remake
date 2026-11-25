# M1.49 handoff

## What changed

- **Mourner's Veil** (`veil`): instant use-item. Blinds every mob within the current sight radius and line of sight for 5 s (`VEIL.time`). Blinded mobs get `blindT` and wander (they do not chase). The Warding Bell's `stunT` still freezes a mob if both are set (stun is checked first). A small dark-veil mark and tiny grey-green motes show on blinded mobs. Pickup text and the HUD tooltip use the name and "BLINDS EVERY MOB IN VIEW FOR 5 S". Q, gamepad Y and the ITEM button all use it. The Veil is in the normal use-item loot and shop pools (`puPool` / `randPU` / shop offers).
- Using the Veil plays a short (~0.85 s) translucent grey-green damp mist around the edges of the 3D view (`VEIL.mist`). It fades out, never fully hides the scene, and is not drawn over the HUD, minimap, message band or touch buttons. It is a screen-space vignette, not the old puff-cloud burst.
- **The Lichen Face** (`lichen`, map letter `f`): 3 base HP, speed 1.65, hops like a Springle. It spawns on the existing **Mossy Cellar** theme (floors 2-8 when that early theme is chosen), not on the tutorial Gatehouse and not on deep-theme floors. On death it leaves a spore patch (`SPORE`: radius 0.36, life 5 s) that slows the player and ground mobs. Flyers and mid-hop airborne mobs ignore it; Rubber Boots shrug it off, same as webs, frost and goo. The L3 kettle-swap rule never replaces a Lichen Face. The idle/rest frame was rebuilt from the hop-start art so all four frames share the same face, moss and body.
- Art: Veil icon pasted into `assets/items.png`; four hop/pop frames in `assets/mobs/lichen.png`; registered in `assets/atlas.json` and packed. The source banner now says world art is packed from PNG sheets, not generated in code.
- Docs: `CHANGELOG.md`, `docs/PLAN.md` (current release M1.49), `docs/CONTROLS_AND_FEATURES.md`, `docs/BALANCE.md`, `assets/README.md`, build READMEs.

## Tests

`node tools/release.mjs dev --test` and `cd tests && npm test`: **533/533 passed** (30 checks of pre-M1.23 items or pre-M1.31 layouts retired).

## Release

- Path: `builds/m1.49/index.html`
- Size: 1,056,220 bytes (1031.5 KB)
- sha256: `c2d3a3adca6716fa88a5073b9bae5e06582f18cc7465b4b761b279a711ec3695`
- QA: `builds/m1.49-qa/index.html` sha256 `63eff4eb7a131a05aef65a050fcd8cf328107edfe9504516bd728c98df9d3360`
- Blob SHA (src and release HTML): `46f35cc3e818ee707c124262b71f77f81d9c93af`
- QA blob SHA: `ce9d0643461375ed54543b5408a9391e76fac9d4`

Headless play screenshots (not in the repo): `/workspace/labyrinth-main/m149/lichen_face.png`, `/workspace/labyrinth-main/m149/mourners_veil.png` (mid-mist) and `/workspace/labyrinth-main/m149/mourners_veil_after.png` (~1 s later, mist gone).

## Known issues

None found in the automated suite. Playtest is paused, so there is no in-person review yet.

## Notes for Playtest

- Look for a floor titled "MOSSY CELLAR" on floors 2-8.
- The Lichen Face is a pale mossy face on a spring-like body; it hops, and a green spore patch appears when it pops.
- Mourner's Veil is a damp lace veil in the use-item slot and in Old Murkle's shop. The haze should be a brief edge mist, not large white clouds.
