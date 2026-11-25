# M1.52 handoff

## What changed

- **Mourner's Veil** (`veil`): instant use-item. Blinds every mob within the current sight radius and line of sight for 5 s (`VEIL.time`). Blinded mobs get `blindT` and wander (they do not chase). The Warding Bell's `stunT` still freezes a mob if both are set (stun is checked first). A small dark-veil mark and tiny grey-green motes show on blinded mobs. Pickup text and the HUD tooltip use the name and "BLINDS EVERY MOB IN VIEW FOR 5 S". Q, gamepad Y and the ITEM button all use it. The Veil is in the normal use-item loot and shop pools (`puPool` / `randPU` / shop offers).
- Using the Veil plays a short (~0.85 s) translucent grey-green damp mist around the edges of the 3D view (`VEIL.mist`). It fades out, never fully hides the scene, and is not drawn over the HUD, minimap, message band or touch buttons. It is a screen-space vignette, not the old puff-cloud burst.
- **The Lichen Face** (`lichen`, map letter `f`): 3 base HP, speed 1.65, a flying mob. It hovers at flyer height with a slow bob and drifts toward the player; pits, puddles and spores do not affect it (same look-up / flyer rules as the other flyers). It spawns on the existing **Mossy Cellar** theme (floors 2-8 when that early theme is chosen), not on the tutorial Gatehouse and not on deep-theme floors. On death it leaves a spore patch (`SPORE`: radius 0.36, life 5 s) on the floor below where it died, that slows the player and ground mobs. Flyers and mid-hop airborne mobs ignore it; Rubber Boots shrug it off, same as webs, frost and goo. The L3 kettle-swap rule never replaces a Lichen Face. A quiet, warbling procedural moan plays when it spots you (existing `voice()` cooldown so it is not spammy), plus a distinct `lichenPop` on death.
- Art: Veil icon pasted into `assets/items.png`; five-frame tendril-wave loop in `assets/mobs/lichen.png` (the supplied source art, checkerboard background keyed out to transparency); registered in `assets/atlas.json` and packed. The source banner now says world art is packed from PNG sheets, not generated in code.
- Docs: `CHANGELOG.md`, `docs/PLAN.md` (current release M1.52), `docs/CONTROLS_AND_FEATURES.md`, `docs/BALANCE.md`, `assets/README.md`, build READMEs.

## Tests

`node tools/release.mjs dev --test` and `cd tests && npm test`: **535/535 passed** (30 checks of pre-M1.23 items or pre-M1.31 layouts retired).

## Release

- Path: `builds/m1.52/index.html`
- Size: 1,103,420 bytes (1077.6 KB)
- sha256: `89f2954bbbf03776cefbc083d38e9d1a2b4f9641be305e57ec00f38a6ffbf9b4`
- QA: `builds/m1.52-qa/index.html` sha256 `a313977d66280a298e70dd0fc00daad3edc92d3f0c19ab890ec87d6cef0f00c4`
- Blob SHA (src and release HTML): `0a6f2311795d4369fe5ccc5e95e26573a5b9e68d`
- QA blob SHA: `fed89fb8874a230ae00419586b1472b2abefaff9`

Headless play screenshots (not in the repo): `/workspace/labyrinth-main/m149/lichen_face.png` (and `lichen_face_flying.png`) of the Face hovering in play, `/workspace/labyrinth-main/m149/lichen_new_preview.png` (five-frame sheet on a dark background), `/workspace/labyrinth-main/m149/mourners_veil.png` (mid-mist) and `/workspace/labyrinth-main/m149/mourners_veil_after.png` (~1 s later, mist gone). The new `assets/mobs/lichen.png` is a binary; git blob SHA `2e1eac68929543da2f0330a486a06cd9b9e63bc3` (Mr Lead uploads PNGs).

## Known issues

None found in the automated suite. Playtest is paused, so there is no in-person review yet.

## Notes for Playtest

- Look for a floor titled "MOSSY CELLAR" on floors 2-8.
- The Lichen Face is a pale cracked stone face ringed with dark tendrils; it hovers and drifts toward you, and a green spore patch appears on the floor when it pops. It makes a quiet, eerie moan when it spots you.
- Mourner's Veil is a damp lace veil in the use-item slot and in Old Murkle's shop. The haze should be a brief edge mist, not large white clouds.
